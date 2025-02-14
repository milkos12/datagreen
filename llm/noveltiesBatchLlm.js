const { openai } = require('../services/setupOpenIa');
const { MessagePersistence, User, Classification, Measure, Novelty, Batch, ContentActivity } = require('../models');
const { noveltiesBatch, noveltiesBatchStructureSMS } = require('./toolsChatGPT/noveltiesBatctTools');
const { determinateAmoutStemsBatch } = require('./availableBatch');

const batch = require('../models/batch');

function convertirAListaTexto(detialBatch) {
  try {
    return detialBatch.map(item => `- 🌿 ${item.clasification}: ${item.amout_stems} (${item.measure})`).join('\n');
  } catch (error) {
    throw new Error('Error al convertir el batch a texto: ' + error.message);
  }
}

function convertirAListaTextoSummary(detialBatch, amoutStemsLote, stemsFinsh, exit) {
  try {
    let textFeedbackAmoutStems = '';
    let amoutStems = 0;

    detialBatch.forEach(item => amoutStems += item.amout_stems || 0);

    if ((amoutStemsLote - amoutStems) > 0) {
      textFeedbackAmoutStems = `*Faltan ${amoutStemsLote - amoutStems} tallos* por registrar ⚠️🌱\nPor favor completa 👇🍃\n`;
    } else if ((amoutStemsLote - amoutStems) < 0) {
      textFeedbackAmoutStems = `Se han registrado *${amoutStems - amoutStemsLote} tallos de más ❌ Por favor corrige 👇⚠️⛔🍃🌱*\n`;
    } else {
      textFeedbackAmoutStems = `Se ha registrado la cantidad *correcta de ${amoutStems} tallos ✅🌱*\n`;
      stemsFinsh = true;
    }
    
    let text = detialBatch.map(item => `- 🌱 ${item.clasification || '(FALTA CLASIFICACIÓN)'} (${item.measure || '(FALTA MEDIDA)'}): \`\`\`${item.amout_stems || '(NO PUSISTE TALLOS)'}\`\`\``).join('\n');
    
    if(exit && stemsFinsh) {
      text = `${textFeedbackAmoutStems}`;
    } else {
      text = `${textFeedbackAmoutStems}\n${text}`;
    }
    
    return [text, stemsFinsh];
  } catch (error) {

    return ['', stemsFinsh];
    //throw new Error('Error al convertir el batch a texto: ' + error.message);
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

async function desactivateActivity(user, batch_id) {
  try {

    const activitiesUser = await ContentActivity.findOne({
      where: {
        user_encharge_id: user.user_id,
        is_active: true,
        batch_id
      }
    });

    if (activitiesUser) {
      activitiesUser.set('is_active', false);
      await activitiesUser.save();
    }
  } catch (error) {
    throw new Error('Error al desactivar la actividad: ' + error.message);
  }
  
}

async function getCompletion(messages, functions = [], model = "gpt-4o-2024-11-20", temperature = 0.3, max_tokens = 300) {

  try {
    const response = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens,
      tools: functions
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
  console.log(message,"-------- ",user)
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

async function addNewMessage(role, message, user, content) {
  try {
    const messageContent = message || "Valor predeterminado";
    let newMessage = [{ role, content: messageContent }];
    const threadMessages = await MessagePersistence.findOne({ where: { user_id: user.user_id } });

    if (!threadMessages) {
      await createNewTreadMessages(user, newMessage);
      return;
    }

    if (user === 'assistant') {
      newMessage = [{ role, content: `${content}` || messageContent }];

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

async function saveNovelty(novelties, user, stemsBatch) {
  
  let amoutStems = 0;

  novelties.forEach(item => amoutStems += item.amout_stems || 0);

  if ((stemsBatch - amoutStems) != 0) {
    return false;
  }

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
  return true;
}

async function getChatResponse(user, message) {
  let stemsFinsh = false;
  let amountStems = 0;
  let batchInfo = {};
  endSaveBatch = 'No';
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
      batchInfo = await Batch.findOne({ where: { name: messages.whatsapp_id}});
      amountStems = await determinateAmoutStemsBatch(batchInfo.batch_id);
      const finalResponse = await getCompletion(messages.messages, noveltiesBatch(amountStems));
      const processedResponse = processOpenAIResponse(finalResponse);

      feedbackFromOpenAi = processedResponse.feedbackFromOpenAi;

      exit = processedResponse.exit;
      content = processedResponse.content;

      count++;
      console.log("0000000000000000000------------->>", content);

      if (content) break;
      if (feedbackFromOpenAi) break;
      if (exit) break;
    }

    await addNewMessage('assistant', feedbackFromOpenAi, user, content);

    if (exit) {
      let valid = false;
      try {
        valid = await saveNovelty(content, user, amountStems);
      } catch (e) {

      }
      if (valid) {
        feedbackFromOpenAi = `*Detalles de la novedad:*\n
${convertirAListaTexto(content)}\n\n
✅¡Registro exitoso!✅ \n\n
*🛑⚠️ Ya no podrás modificarlo.* 
Si cometiste algún error, por favor, avísale a la persona encargada`;
        await deleteThread(user);
        await desactivateActivity(user, batchInfo.batch_id);
        endSaveBatch = 'Si';
      } else {
        feedbackFromOpenAi = `*Por favor corrige 👆⚠️⛔🍃*\n`
      }

    }

    let text = '';
    [text, stemsFinsh ] = convertirAListaTextoSummary(content, amountStems, stemsFinsh, exit)
    feedbackFromOpenAi = `${text} \n\n ${feedbackFromOpenAi}`;

    if(exit) {
      stemsFinsh = false;
    }
    return [feedbackFromOpenAi, stemsFinsh, endSaveBatch];
  } catch (error) {
    console.error('Error al obtener la respuesta de ChatGPT:', error.message);
    return ['⚠️ Lo siento, nuestro sistema está teniendo inconvenientes. Por favor, inténtalo más tarde. ⏳ Si el problema persiste, comunícate con el encargado.', stemsFinsh ];
  }
}

module.exports = {
  getChatResponse,
};
