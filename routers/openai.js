const { openai } = require('../services/setupOpenIa');
const { MessagePersistence, User } = require('../models');
const { messageFlowsMenu } = require('./handlersFlows/menuMainHandler');
const { noveltiesBatch } = require('./toolsChatGPT/noveltiesBatch');

function convertirAListaTexto(detialBatch) {
  try {
    return detialBatch.map(item => `- 🌿 ${item.clasification}: ${item.amout_stems}`).join('\n');
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

async function getCompletion(messages, model = "gpt-4o", temperature = 0, max_tokens = 80, tools = null) {
  try {
    const response = await openai.chat.completions.create({
      model: model,
      messages: messages,
      temperature: 0.5,
      max_tokens: max_tokens,
      tools: noveltiesBatch(),
    });
    return response.choices[0].message;
  } catch (error) {
    throw new Error('Error al obtener la respuesta de ChatGPT: ' + error.message);
  }
}

async function createNewTreadMessages(user, message) {
  try {
    user = await User.findByPk(user.user_id);
    if (!user) {
      throw new Error('User not found');
    }

    await MessagePersistence.create({ messages: message, user_id: user.user_id });
  } catch (error) {
    throw new Error('Error al crear un nuevo mensaje: ' + error.message);
  }
}

async function addNewMessage(role, message, user) {
  try {
    if (message === null) {
      message = 'No se ha recibido mensaje';
    }
    let messageContent = message || "Valor predeterminado"; 
    message = [{ role, content: messageContent }];
    const threadMessages = await MessagePersistence.findOne({ where: { user_id: user.user_id } });

    if (threadMessages === null) {
      await createNewTreadMessages(user, message);
      return;
    }

    const updatedMessages = Array.isArray(message, threadMessages)
      ? [...threadMessages.messages, message[0]]
      : [threadMessages];
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
    objectFromOpenAi = JSON.parse(response.arguments);
    feedbackFromOpenAi = objectFromOpenAi.feedback;
    exit = objectFromOpenAi.exit;
    content = objectFromOpenAi.conten;
  } catch (e) {
    console.error('Error al procesar la respuesta de OpenAI (primer intento):', e.message);
  }

  try {
    objectFromOpenAi = JSON.parse(response.tool_calls[0].function.arguments);
    feedbackFromOpenAi = objectFromOpenAi.feedback;
    exit = objectFromOpenAi.exit;
    content = objectFromOpenAi.conten;
  } catch (e) {
    console.error('Error al procesar la respuesta de OpenAI (segundo intento):', e.message);
  }

  try {
    if (response.content === null) {
      throw new Error('arguments es null');
    }
    feedbackFromOpenAi = response.content;
  } catch (e) {
    console.error('Error al procesar el contenido de la respuesta de OpenAI:', e.message);
  }

  return { feedbackFromOpenAi, exit, content };
}

async function getChatResponse(user, message) {
  try {
    await addNewMessage('user', message, user);
    const messages = await MessagePersistence.findOne({ where: { user_id: user.user_id } });
    const finalResponse = await getCompletion(messages.messages, "gpt-4o", 0, 300);
    let { feedbackFromOpenAi, exit, content } = processOpenAIResponse(finalResponse);
    
    await addNewMessage('assistant', feedbackFromOpenAi, user);

    if (exit) {
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
}