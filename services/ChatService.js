const { noveltiesBatch } = require('../llm/toolsChatGPT/noveltiesBatctTools');
const { BatchService, BatchOperations } = require('./batchService');
const UserService = require('./userService');

// Repositorios
const messageRepository = {
  findMessagesByUserId: async (userId) => {
    return MessagePersistence.findOne({ where: { user_id: userId } });
  },

  createMessageThread: async (userId, messages) => {
    return MessagePersistence.create({ user_id: userId, messages });
  },

  addMessageToThread: async (userId, message) => {
    const thread = await MessagePersistence.findOne({ where: { user_id: userId } });
    if (!thread) return messageRepository.createMessageThread(userId, [message]);
    
    thread.messages = [...thread.messages, message];
    return thread.save();
  },

  deleteMessageThread: async (userId) => {
    return MessagePersistence.destroy({ where: { user_id: userId } });
  }
};

const noveltyRepository = {
  saveNovelty: async (noveltyData) => {
    return Novelty.create(noveltyData);
  },

  findClassificationsAndMeasures: async (clasification, measure) => {
    return Promise.all([
      Classification.findOne({ where: { name: clasification } }),
      Measure.findOne({ where: { name: measure } })
    ]);
  }
};

// Servicio OpenAI
const openAIService = {
  getCompletion: async (messages, tools) => {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-2024-11-20",
        messages,
        tools,
        temperature: 0.3,
        max_tokens: 300
      });
      
      return response.choices[0].message;
    } catch (error) {
      throw new Error(`OpenAI API Error: ${error.message}`);
    }
  }
};

// Helpers
const responseParser = (response) => {
  const parseStrategies = [
    () => response.tool_calls?.[0]?.function?.arguments,
    () => response.arguments,
    () => ({ content: response.content })
  ];

  for (const strategy of parseStrategies) {
    try {
      return JSON.parse(strategy()) || {};
    } catch (_) {
      continue;
    }
  }
  return { feedback: 'Invalid response format' };
};

const validationHelpers = {
  validateStemCount: (novelties, totalStems) => {
    const sum = novelties.reduce((acc, { amout_stems = 0 }) => acc + amout_stems, 0);
    return sum === totalStems;
  }
};

// Servicio principal
const ChatService = {
  processUserMessage: async (user, message) => {
    const currentBatch = await BatchService.getBatchDetails(
      (await messageRepository.findMessagesByUserId(user.user_id)).whatsapp_id
    );
    
    const amountStems = await BatchOperations.calculateTotalStems(currentBatch.batch_id);
    await messageRepository.addMessageToThread(user.user_id, {
      role: 'user',
      content: `las novedades para el lote son: ${message}`
    });

    return { currentBatch, amountStems };
  },

  handleAIResponse: async (user, amountStems) => {
    let response;
    for (let attempt = 0; attempt < 5; attempt++) {
      const messages = await messageRepository.findMessagesByUserId(user.user_id);
      response = await openAIService.getCompletion(messages.messages, noveltiesBatch(amountStems));
      if (response) break;
    }

    const parsed = responseParser(response);
    await messageRepository.addMessageToThread(user.user_id, {
      role: 'assistant',
      content: parsed.feedback || parsed.content
    });

    return parsed;
  },

  validateAndSaveNovelties: async (content, user, totalStems) => {
    if (!validationHelpers.validateStemCount(content, totalStems)) return false;

    await Promise.all(content.map(async (item) => {
      const [classification, measure] = await noveltyRepository.findClassificationsAndMeasures(
        item.clasification,
        item.measure
      );

      return noveltyRepository.saveNovelty({
        comment: item.comments,
        quantity_of_stems: item.amout_stems,
        batch_id: 'e249589b-3e92-4f6c-8a49-a1b7c0db5b5e',
        classification_id: classification.classification_id,
        measure_id: measure.measure_id,
        created_by: user.user_id
      });
    }));

    return true;
  },

  formatExitResponse: (content) => ({
    message: `✅ Registro exitoso!\n${content.map(i => `- 🌿 ${i.clasification}: ${i.amout_stems} (${i.measure})`).join('\n')}\n\n🛑⚠️ Ya no podrás modificarlo`,
    completed: true
  }),

  getChatResponse: async (user, message) => {
    console.log(message,"**********", user)
    try {
      const { currentBatch, amountStems } = await ChatService.processUserMessage(user, message);
      const aiResponse = await ChatService.handleAIResponse(user, amountStems);

      if (aiResponse.exit) {
        const isValid = await ChatService.validateAndSaveNovelties(
          aiResponse.content, 
          user, 
          amountStems
        );

        if (isValid) {
          await Promise.all([
            messageRepository.deleteMessageThread(user.user_id),
            ContentActivity.update(
              { is_active: false },
              { where: { user_encharge_id: user.user_id, batch_id: currentBatch.batch_id } }
            )
          ]);
          
          return ChatService.formatExitResponse(aiResponse.content);
        }
        
        return { message: '*Por favor corrige 👆⚠️⛔🍃*\n', completed: false };
      }

      return { 
        message: aiResponse.feedback || aiResponse.content, 
        metadata: { stemsCount: amountStems } 
      };
    } catch (error) {
      console.error('ChatService Error:', error);
      return { message: '⚠️ Error temporal, por favor intenta más tarde', error: true };
    }
  }
};

module.exports = ChatService;