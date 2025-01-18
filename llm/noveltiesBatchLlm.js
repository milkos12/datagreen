const { openai } = require('../services/setupOpenIa');
const { MessagePersistence, User, Classification, Measure, Novelty, Batch } = require('../models');
const { noveltiesBatch } = require('./toolsChatGPT/noveltiesBatctTools');

function convertirAListaTexto(detialBatch) {
  try {
    return detialBatch.map(item => `- 🌿 ${item.clasification}: ${item.amout_stems} (${item.measure})`).join('\n');
  } catch (error) {
    throw new Error('Error al convertir el batch a texto: ' + error.message);
  }
}

async function deleteThread(user) {
  try {
    const threadMessages = await MessagePersistence.findOne({ where: { user_id: user.user_id } });
    if (threadMessages) {
      await threadMessages.destroy();
    }
  } catch (error) {
    throw new Error('Error al eliminar el hilo de mensajes: ' + error.message);
  }
}

async function getCompletion(messages, model = "o1", temperature = 0.5, max_tokens = 300) {
  try {
    const tools = noveltiesBatch() || [];
    const response = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens,
      tools,
    });

    if (!response || !response.choices || !response.choices[0] || !response.choices[0].message) {
      throw new Error('Respuesta inválida o incompleta de OpenAI');
    }

    return response.choices[0].message;
  } catch (error) {
    throw new Error('Error al obtener la respuesta de ChatGPT: ' + error.message);
  }
}

async function createNewTreadMessages(user, message) {
  try {
    const existingUser = await User.findByPk(user.user_id);
    if (!existingUser) {
      throw new Error('User not found');
    }

    await MessagePersistence.create({ messages: message, user_id: user.user_id });
  } catch (error) {
    throw new Error('Error al crear un nuevo mensaje: ' + error.message);
  }
}

async function addNewMessage(role, message, user) {
  try {
    const messageContent = message || "Valor predeterminado";
    const newMessage = [{ role, content: messageContent }];
    const threadMessages = await MessagePersistence.findOne({ where: { user_id: user.user_id } });

    if (!threadMessages) {
      await createNewTreadMessages(user, newMessage);
      return;
    }

    const updatedMessages = Array.isArray(threadMessages.messages)
      ? [...threadMessages.messages, ...newMessage]
      : newMessage;

    threadMessages.set('messages', updatedMessages);
    await threadMessages.save();
  } catch (error) {
    throw new Error('Error al agregar un nuevo mensaje: ' + error.message);
  }
}

function processOpenAIResponse(response) {
  let feedbackFromOpenAi = 'No se obtuvo respuesta';
  let objectFromOpenAi = {};
  let exit = false;
  let content = {};

  try {
    if (response.arguments) {
      objectFromOpenAi = JSON.parse(response.arguments);
      feedbackFromOpenAi = objectFromOpenAi.feedback || feedbackFromOpenAi;
      exit = objectFromOpenAi.exit || exit;
      content = objectFromOpenAi.conten || content;
    }
  } catch (e) {
    console.error('Error al procesar response.arguments:', e.message);
  }

  try {
    if (response.tool_calls && response.tool_calls[0] && response.tool_calls[0].function && response.tool_calls[0].function.arguments) {
      objectFromOpenAi = JSON.parse(response.tool_calls[0].function.arguments);
      feedbackFromOpenAi = objectFromOpenAi.feedback || feedbackFromOpenAi;
      exit = objectFromOpenAi.exit || exit;
      content = objectFromOpenAi.conten || content;
    }
  } catch (e) {
    console.error('Error al procesar response.tool_calls[0].function.arguments:', e.message);
  }

  try {
    if (response.content) {
      feedbackFromOpenAi = response.content;
    }
  } catch (e) {
    console.error('Error al procesar response.content:', e.message);
  }

  return { feedbackFromOpenAi, exit, content };
}

async function saveNovelty(novelties, user) {
  novelties.forEach(async (item) => {
    const clasification = await Classification.findOne({
      where: {
        company_id: user.company_id,
        name: item.clasification,
      },  
    });
    console.log(clasification, `------------------------{
        company_id: ${user.company_id},
        name: ${item.clasification},
      }`);
    const measure = await Measure.findOne({
      where: {
        company_id: user.company_id,
        name: item.measure,
      },  
    });
    console.log(measure ,`******************{
        company_id: ${user.company_id},
        name: ${item.measure},
      }`)

    
      console.log('-------------------------------MILLER ASNDRES---->');
      await Novelty.create({
        comment: item.comments,
        quantity_of_stems: item.amout_stems,
        batch_id: 'aa0856e0-1482-449f-ba59-6a88e58a4e82', // Default value
        classification_id: clasification.classification_id,
        measure_id: measure.measure_id,
        created_by: user.user_id,
      });
    
  });
}

async function getChatResponse(user, message) {
  try {
    await addNewMessage('user', message, user);

    let count = 0;
    const limitCount = 5;
    let feedbackFromOpenAi = '';
    let exit = false;
    let content = {};

    while (count < limitCount) {
      const messages = await MessagePersistence.findOne({ where: { user_id: user.user_id } });
      const finalResponse = await getCompletion(messages.messages, "gpt-4o", 0.8, 300);
      const processedResponse = processOpenAIResponse(finalResponse);

      feedbackFromOpenAi = processedResponse.feedbackFromOpenAi;
      exit = processedResponse.exit;
      content = processedResponse.content;
      
      count++;

      if (feedbackFromOpenAi) break;
      if (content) break;
      if (exit) break;
    }

    await addNewMessage('assistant', feedbackFromOpenAi, user);

    if (exit) {
      await saveNovelty(content, user);
      feedbackFromOpenAi = `*Detalles de la novedad:*\n
${convertirAListaTexto(content)}\n\n
✅¡Registro exitoso!✅ \n\n
*🛑⚠️ Ya no podrás modificarlo.* 
Si cometiste algún error, por favor avísale a tu compañero de trabajo encargado. 👩‍💼👨‍💼`;
      await deleteThread(user);
    }

    return feedbackFromOpenAi;
  } catch (error) {
    console.error('Error al obtener la respuesta de ChatGPT:', error.message);
    return '⚠️ Lo siento, nuestro sistema está teniendo inconvenientes. Por favor, inténtalo más tarde. ⏳ Si el problema persiste, comunícate con el encargado.';
  }
}

module.exports = {
  getChatResponse,
};