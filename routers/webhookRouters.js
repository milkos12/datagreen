// routes/whatsappRouter.js

const express = require('express');
const router = express.Router();
const axios = require('axios');
const { messageFlowsMenu, processUserResponse, getSelectionMainMenu } = require('./handlersFlows/menuMainHandler');
const { getAvailableBatch } = require('../llm/availableBatch');
const { User, FlowHistory, Step, Flow, MessagePersistence } = require('../models');
const { getChatResponse } = require('../llm/noveltiesBatchLlm');
require('dotenv').config(); // Cargar variables de entorno

// Middleware para manejar errores asíncronos
const asyncHandler = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Middleware para verificar la API key (opcional pero recomendado)
const verifyApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    const validApiKey = process.env.WHATSAPP_API_KEY;

    if (apiKey === validApiKey) {
        next();
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
};

// Aplicar el middleware de verificación de API key
router.use(verifyApiKey);

// Veficar si el si el usuario tiene flujo activo 
const getActivesFlowToUser = async (user) => {
    // Verificar si el usuario tiene un flujo activo
    const activeFlow = await FlowHistory.findOne({
        where: {
            createdById: user.user_id,
            isCompleted: false
        },
        include: [{
            model: Flow,
            as: 'flow'
        }]
    });

    return activeFlow;
}

// POST Route para manejar mensajes entrantes
router.post('/', asyncHandler(async (req, res) => {
    const payload = req.body;
    let feedback = '';

    // Validar la estructura del payload
    if (!payload || !Array.isArray(payload.messages)) {
        console.error('Estructura de payload inválida:', payload);
        return res.status(400).send('Estructura de payload inválida');
    }

    // Iterar a través de cada mensaje
    for (const message of payload.messages) {
        try {
            // **Nueva Verificación: Ignorar mensajes enviados por el bot**
            if (message.from_me) {
                console.log('Mensaje enviado por el bot, ignorando.');
                continue; // Saltar al siguiente mensaje
            }

            // Extraer el número 'from'
            let fromNumber = message.chat_id;

            if (!fromNumber) {
                console.warn('Mensaje sin el campo "from":', message);
                continue; // Saltar este mensaje
            }

            fromNumber = fromNumber.replace('@s.whatsapp.net', '');

            // Eliminar el prefijo '57' si está presente
            if (fromNumber.startsWith('57')) {
                fromNumber = fromNumber.slice(2);
            }

            // Eliminar cualquier carácter no numérico
            fromNumber = fromNumber.replace(/\D/g, '');

            // Obtener el usuario y verificar si está en un flujo activo
            const user = await User.findOne({ where: { phone_number: fromNumber } });
            let showMenuBatchs = false;
            if (!user) {
                console.log(`No se encontró un usuario con el número de teléfono: ${fromNumber}`);
                continue;
            }


            const haveMessages = await MessagePersistence.findOne({ where: { user_id: user.user_id } });
            
            if (haveMessages === null) {
                console.log('YA TERMINOOOO........................................................................');
                showMenuBatchs = true;
               
            }
            let sms = '';
            let stemsFinsh = false;

            let msmsFormUser = '';
            try {
                msmsFormUser = message.text.body;
            } catch (error) {
                msmsFormUser = message.reply.buttons_reply.title
            }

            if (!showMenuBatchs) {
                [sms, stemsFinsh] = await getChatResponse(user, msmsFormUser);
                feedback = sms;
                feedback = feedback.replaceAll('**', '*');
            }
            

            if (user) {
                let URL = process.env.WHATSAPP_API_URL;
                console.log(`Usuario encontrado: ${user.name} (Teléfono: ${user.phone_number})`);

                // Preparar el 'to' con el prefijo '57'
                const toNumber = `57${user.phone_number}@s.whatsapp.net`;

                // Preparar el payload para la API de WhatsApp
                let whatsappPayload = {
                    to: toNumber,
                    body: 'Dgreen Systems',
                };
                console.log('-----------oooooooo-------------->>>>> ', stemsFinsh, ' ....... ', feedback);
                if (stemsFinsh && !showMenuBatchs) {
                    URL = 'https://gate.whapi.cloud/messages/interactive';
                    whatsappPayload = {
                        header: {
                            text: feedback || 'Error en el servicio Dgreen Systems.',
                        },
                        body: {
                            text: "Guardar Novedades:",
                        },
                        action: {
                            buttons: [
                                {
                                    type: "quick_reply",
                                    title: "Guardar",
                                    id: "23"
                                }
                            ]
                        },
                        type: "button",
                        to: toNumber,
                        view_once: true
                    };
                } else if (showMenuBatchs) {
                    URL = 'https://gate.whapi.cloud/messages/interactive';
                    const loteList = await getAvailableBatch(user);
                    let listLotes = '';
                    let buttonList = [];
                    if(loteList) {
                        loteList.forEach((lote) => {
                            listLotes += lote.leable;
                            buttonList.push({
                                    type: "quick_reply",
                                    title: lote.nameLote,
                                    id: lote.idLote
                            })
                        });
                    }
                    
                    whatsappPayload = {
                        header: {
                            text: `¡Hola! 🌟 Aquí están los lotes disponibles para clasificar 🌿📦.\n Por favor, selecciona uno y ¡empecemos!\n\n🔍 Lotes:\n\n ${listLotes}`,
                        },
                        body: {
                            text: 'Lotes disponibles:',
                        },
                        action: {
                            buttons: buttonList && buttonList.length > 0 
                            ? [...buttonList] 
                            : [
                                {
                                  type: "quick_reply",
                                  title: "No tienes lotes disponibles 🤗",
                                  id: "0"
                                }
                              ]
                        },
                        type: "button",
                        to: toNumber,
                        view_once: true
                    };
                }else {
                    whatsappPayload = {
                        to: toNumber,
                        body: feedback || `*⚠️ Error en el servicio de IA - Dgreen Systems.*
    Intenta de nuevo en unos minutos. Si el error persiste, comunícate con el encargado.`,
                        // Otros campos según tu necesidad
                    };
                }
                // Enviar el mensaje a WhatsApp
                try {
                    const response = await axios.post(URL, whatsappPayload, {
                        headers: {
                            'Authorization': process.env.WHATSAPP_API_TOKEN,
                            'Content-Type': 'application/json'
                        }
                    });

                    console.log(`Mensaje de WhatsApp enviado a ${toNumber}:`, response.data);
                } catch (apiError) {
                    console.error(`Error al enviar el mensaje de WhatsApp a ${toNumber}:`, apiError.response ? apiError.response.data : apiError.message);
                }
            }

        } catch (err) {
            console.error('Error al procesar el mensaje:', message, err);
        }
    }

    res.status(200).send(`${feedback}`);
}));

module.exports = router;
