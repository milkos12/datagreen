const { openai } = require('../services/setupOpenIa');
const { MessagePersistence, User, Classification, Measure, Novelty, Batch } = require('../models');
const { noveltiesBatch, noveltiesBatchStructureSMS } = require('./toolsChatGPT/noveltiesBatctTools');

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

async function getCompletion(messages, functions = [], model = "gpt-4o-2024-11-20", temperature = 0.7, max_tokens = 300) {

  try {
    const response = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens,
      tools: functions,
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
  console.log('´´´´´´´´´´´´´´´´´´´´-------<-<-<--<--> ', novelties);
  novelties.forEach(async (item) => {
    const clasification = await Classification.findOne({
      where: {
        //company_id: user.company_id,
        name: item.clasification,
      },  
    });

    const measure = await Measure.findOne({
      where: {
        //company_id: user.company_id,
        name: item.measure,
      },  
    });

      await Novelty.create({
        comment: item.comments,
        quantity_of_stems: item.amout_stems,
        batch_id: 'e249589b-3e92-4f6c-8a49-a1b7c0db5b5e', // Default value
        classification_id: clasification.classification_id,
        measure_id: measure.measure_id,
        created_by: user.user_id,
      });
    
  });
}

async function getChatResponse(user, message) {
  try {
    message = `las novedades para el lote son: ${message}`;
    await addNewMessage('user', message, user);

    let count = 0;
    const limitCount = 5;
    let feedbackFromOpenAi = '';
    let exit = false;
    let content = {};

    while (count < limitCount) {
      const messages = await MessagePersistence.findOne({ where: { user_id: user.user_id } });
      const finalResponse = await getCompletion(messages.messages, noveltiesBatch());
      console.log("0000000000000000000------------->>", finalResponse);
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
      try{
      await saveNovelty(content, user);
      } catch (e) {

      }
      feedbackFromOpenAi = `*Detalles de la novedad:*\n
${convertirAListaTexto(content)}\n\n
✅¡Registro exitoso!✅ \n\n
*🛑⚠️ Ya no podrás modificarlo.* 
Si cometiste algún error, por favor avísale a tu compañero de trabajo encargado. 👩‍💼👨‍💼`;
      await deleteThread(user);
    }

    let smsStructure = await getCompletion([{role: 'user', content: `${content}`}], noveltiesBatchStructureSMS());

    if (smsStructure.arguments) {
      objectFromOpenAi = JSON.parse(smsStructure.arguments);
      
      feedbackFromOpenAi = objectFromOpenAi.sms || feedbackFromOpenAi;
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
