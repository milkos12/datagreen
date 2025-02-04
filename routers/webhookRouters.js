// routes/whatsappRouter.js
require('dotenv').config();
const express = require('express');
const router = express.Router();
const axios = require('axios');
const MessageService = require('../services/MessageService');
const UserService = require('../services/UsersService');
const { BatchService, BatchOperations, ChatService } = require('../services/BatchService');

// Helpers
const asyncHandler = fn => (req, res, next) => 
  Promise.resolve(fn(req, res, next)).catch(next);

const formatPhoneNumber = (phone) => {
  let formatted = phone.replace('@s.whatsapp.net', '');
  formatted = formatted.startsWith('57') ? formatted.slice(2) : formatted;
  return formatted.replace(/\D/g, '');
};

const getMessageContent = (message) => {
  if (message.text?.body) return message.text.body;
  if (message.reply?.buttons_reply?.title) return message.reply.buttons_reply.title;
  return '';
};

// WhatsApp Client
const WhatsAppClient = {
  send: async (url, payload) => {
    try {
      const response = await axios.post(url, payload, {
        headers: {
          Authorization: process.env.WHATSAPP_API_TOKEN,
          'Content-Type': 'application/json'
        }
      });
      console.log(`Mensaje enviado a ${payload.to}:`, response.data);
    } catch (error) {
      console.error(`Error enviando mensaje:`, error.response?.data || error.message);
    }
  }
};

// Payload Builders
const PayloadBuilder = {
  interactiveResponse: (toNumber, text, buttons) => ({
    to: `57${toNumber}@s.whatsapp.net`,
    type: 'button',
    view_once: true,
    header: { text: text.header },
    body: { text: text.body },
    action: { buttons }
  }),

  textResponse: (toNumber, body) => ({
    to: `57${toNumber}@s.whatsapp.net`,
    body: body.replace(/\*\*/g, '*')
  }),

  batchSelection: async (user, batches) => {
    const buttons = batches.map(batch => ({
      type: "quick_reply",
      title: batch.nameLote,
      id: batch.idLote
    }));

    return PayloadBuilder.interactiveResponse(
      user.phone_number,
      {
        header: batches.length 
          ? "¡Hola! 🌟 Lotes disponibles para clasificar 🌿📦" 
          : "¡Wow, parece que terminaste! 💪🌿",
        body: batches.length 
          ? "Selecciona un lote para comenzar:" 
          : "No tienes lotes disponibles 🤗"
      },
      buttons.length ? buttons : [{ type: "quick_reply", title: "Sin lotes", id: "0" }]
    );
  }
};

// Core Logic
const processMessageFlow = async (message) => {
  // bot messages don't need to be processed
  if (message.from_me) return;
  
  const fromNumber = formatPhoneNumber(message.chat_id);
  if (!fromNumber) return;

  const user = await UserService.findUser(fromNumber);
  if (!user) return;

  const messageContent = getMessageContent(message);
  const isBatchSelection = message.reply?.buttons_reply?.id?.includes('-LOTES-CLASIFICACION');
  console.log(isBatchSelection," ################## ", message)
  // Handle batch selection
  if (isBatchSelection) {
    await MessageService.createPersistance(user.user_id, messageContent);
    return handleBatchSelection(user, messageContent);
  }

  // Determine response type
  const showMenu = await MessageService.shouldShowMenu(user.user_id);
  console.log("}}}}}}}}}}}}}}}}}}}}}  ", showMenu)
  return showMenu 
    ? handleMenuDisplay(user) 
    : handleChatResponse(user, messageContent);
};

const handleBatchSelection = async (user, batchName) => {
  const batch = await BatchService.getBatchDetails(batchName);
  const stems = await BatchOperations.calculateTotalStems(batch.batch_id);
  
  const payload = PayloadBuilder.textResponse(
    user.phone_number,
    `✅ Lote seleccionado: *${batchName}*\nContenido: ${stems} 🌿 tallos de ${batch.product.name}`
  );

  await WhatsAppClient.send(process.env.WHATSAPP_API_URL, payload);
};

const handleMenuDisplay = async (user) => {
  const batches = await BatchService.getAvailableBatches(user);
  const payload = await PayloadBuilder.batchSelection(user, batches);
  await WhatsAppClient.send('https://gate.whapi.cloud/messages/interactive', payload);
};

const handleChatResponse = async (user, message) => {
    console.log("++++++++++++++++++++++++++++++++ ", user, message)
  const [response, stemsFinished] = await ChatService.getChatResponse(user, message);

  const payload = stemsFinished
    ? PayloadBuilder.interactiveResponse(
        user.phone_number,
        { header: response, body: "Guardar Novedades:" },
        [{ type: "quick_reply", title: "Guardar", id: "23" }]
      )
    : PayloadBuilder.textResponse(user.phone_number, response);

  await WhatsAppClient.send(
    stemsFinished 
      ? 'https://gate.whapi.cloud/messages/interactive' 
      : process.env.WHATSAPP_API_URL,
    payload
  );
};

// Middlewares
const verifyApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  apiKey === process.env.WHATSAPP_API_KEY 
    ? next() 
    : res.status(401).json({ message: 'Unauthorized' });
};

router.use(verifyApiKey);

// Routes
router.post('/', asyncHandler(async (req, res) => {
  if (!req.body?.messages) return res.status(400).send('Payload inválido');
  
  await Promise.all(
    req.body.messages.map(msg => processMessageFlow(msg))
  );

  res.status(200).send('Procesamiento completado');
}));

module.exports = router;