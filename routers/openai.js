const { openai } = require('../services/setupOpenIa');
const { MessagePersistence, User } = require('../models');
const { messageFlowsMenu } = require('./handlersFlows/menuMainHandler');
const { noveltiesBatch } = require('./toolsChatGPT/noveltiesBatch');

function convertirAListaTexto(detialBatch) {
  console.log('🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉', detialBatch)
  return detialBatch.map(item => `🔹 ${item.clasification}: ${item.amout_stems}`).join('\n\n');
}

async function deleteThread(user) {
  const threadMessages = await MessagePersistence.findOne({ where: { user_id: user.user_id } });
  if (threadMessages) {
    await threadMessages.destroy();
  }
  
}

async function getCompletion(messages, model = "gpt-4o", temperature = 0, max_tokens = 100, tools = null) {
  const response = await openai.chat.completions.create({
    model: model,
    messages: messages,
    temperature: 0.5,
    max_tokens: max_tokens,
    tools: noveltiesBatch()
  });

  return response.choices[0].message;
}

async function createNewTreadMessages(user, message) {
  // Verificar que el usuario existe
  user = await User.findByPk(user.user_id);
  if (!user) {
    return res.status(400).json({ message: 'User not found' });
  }

  await MessagePersistence.create({ messages: message, user_id: user.user_id });
}

async function addNewMessage(role, message, user) {
  try {
    if (message === null) {
      message = 'No se ha recibido mensaje';
    }
    message = [{ role, content: message }];
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
    console.error('Error al guardar el mensaje en la base de datos:', error.message);
  }

}

function processOpenAIResponse(response, user) {
  let feedbackFromOpenAi = 'No se optuvo respuesta';
  let objectFromOpenAi = {};
  let exit = false;
  let content = {};



  try {
    console.log('---------------ñasdf-', JSON.parse(response.arguments));
      objectFromOpenAi = JSON.parse(response.arguments);
      feedbackFromOpenAi = objectFromOpenAi.feedback;
      exit = objectFromOpenAi.exit;
      content = objectFromOpenAi.conten;
    
  } catch (e) {

  }

  try {
    console.log("}}}}}}}}}}}}oooo}}}}}}}}}}} ----", JSON.parse(response.tool_calls[0].function.arguments))
    objectFromOpenAi = JSON.parse(response.tool_calls[0].function.arguments);
    feedbackFromOpenAi = objectFromOpenAi.feedback;
    exit = objectFromOpenAi.exit;
    content = objectFromOpenAi.conten;
  } catch (e) {

  }

  try {
    if (response.content === null ) {
      throw new Error('arguments es null');
    }
    feedbackFromOpenAi = response.content;
  } catch (e) {

  }
  
  return { feedbackFromOpenAi, exit, content };

}

async function getChatResponse(user, message) {

  try {
    await addNewMessage('user', message, user);
    const messages = await MessagePersistence.findOne({ where: { user_id: user.user_id } });
    console.log('+++++++++++++++++++++++++++++++++++++++++++++----++++ ', messages.messages);
    const finalResponse = await getCompletion(messages.messages, "gpt-4o", 0, 300);
    console.log('************************', finalResponse)
    let { feedbackFromOpenAi, exit, content } = processOpenAIResponse(finalResponse, user);
    console.log(exit,'#############',content,'################# ', feedbackFromOpenAi)
    
    await addNewMessage('assistant', feedbackFromOpenAi, user);

    if (exit) {

      feedbackFromOpenAi = `*Detalles de la novedad:*\n\n
${convertirAListaTexto(content)}\n\n
      🎉 ¡Registro exitoso! 🎉
🚨 *Ya no podrás modificarlo.* 
Si cometiste algún error, por favor avísale a tu compañero de trabajo encargado. 👩‍💼👨‍💼`;
      await deleteThread(user);

    }
    return feedbackFromOpenAi;
  } catch (error) {
    console.error('Error al obtener la respuesta de ChatGPT:', error.message);

  }
}

module.exports = {
  getChatResponse,
}