const { MessagePersistence } = require('../models');

const MessageService = {
  shouldShowMenu: async (userId) => !(await MessagePersistence.findOne({ where: { user_id: userId } })),
  createPersistance: async (userId, batchName) => MessagePersistence.create({
    user_id: userId,
    messages: [{ role: 'user', content: 'Inicio del chat' }],
    activity_id: 'd683fe0a-9c6b-4cbe-b131-f647c53fc215',
    whatsapp_id: batchName
  }),
};

module.exports = MessageService;