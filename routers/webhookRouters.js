// routes/whatsappRouter.js

const express = require('express');
const router = express.Router();
const axios = require('axios');
const { messageFlowsMenu, processUserResponse, getSelectionMainMenu } = require('./handlersFlows/menuMainHandler'); 
const { User, FlowHistory, Step, Flow } = require('../models'); // Asegúrate de ajustar las rutas según tu estructura
require('dotenv').config(); // Cargar variables de entorno

// Middleware para manejar errores asíncronos
const asyncHandler = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Middleware para verificar la API key (opcional pero recomendado)
const verifyApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    const validApiKey = process.env.WHATSAPP_API_KEY; // Almacenar de forma segura en .env

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

            fromNumber = fromNumber.replace('@s.whatsapp.net','');

            // Eliminar el prefijo '57' si está presente
            if (fromNumber.startsWith('57')) {
                fromNumber = fromNumber.slice(2);
            }

            // Eliminar cualquier carácter no numérico
            fromNumber = fromNumber.replace(/\D/g, '');

            // Obtener el usuario y verificar si está en un flujo activo
            const user = await User.findOne({ where: { phone_number: fromNumber } });

            if (!user) {
                console.log(`No se encontró un usuario con el número de teléfono: ${fromNumber}`);
                continue;
            }

            // Verificar si el usuario tiene un flujo activo
            const activeFlow = await getActivesFlowToUser(user);
            
            console.log(user,"--------------------------------------------", activeFlow);


            //await processUserResponse(user, activeFlow, message);
            if (activeFlow) {
                // El usuario está respondiendo a un flujo activo
                console.log("¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¡¡¡");
                await processUserResponse(user, activeFlow, message);
            } else {
                let messageEnd = '';
                // Validar si el usario esta seleccionando una opcion del menú principal
                let { messageIsSelection }  = await getSelectionMainMenu(message, user);

                if(!messageIsSelection) {
                    // El usuario está iniciando un nuevo flujo
                    console.log("entro al menu%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%");
                    messageEnd = await messageFlowsMenu(fromNumber);
                } else {
                    return;
                }

                if (user) {
                    console.log(`Usuario encontrado: ${user.name} (Teléfono: ${user.phone_number})`);

                    // Preparar el 'to' con el prefijo '57'
                    const toNumber = `57${user.phone_number}@s.whatsapp.net`;

                    // Preparar el payload para la API de WhatsApp
                    const whatsappPayload = {
                        to: toNumber,
                        body: messageEnd,
                        // Otros campos según tu necesidad
                    };

                    // Enviar el mensaje a WhatsApp
                    try {
                        const response = await axios.post(process.env.WHATSAPP_API_URL, whatsappPayload, {
                            headers: {
                                'Authorization': process.env.WHATSAPP_API_TOKEN,
                                'Content-Type': 'application/json'
                            }
                        });

                        console.log(`Mensaje de WhatsApp enviado a ${toNumber}:`, response.data);
                    } catch (apiError) {
                        console.error(`Error al enviar el mensaje de WhatsApp a ${toNumber}:`, apiError.response ? apiError.response.data : apiError.message);
                    }
                } else {
                    console.log(`No se encontró un usuario con el número de teléfono: ${fromNumber}`);
                }
            }

        } catch (err) {
            console.error('Error al procesar el mensaje:', message, err);
        }
    }

    res.status(200).send('Evento recibido');
}));

module.exports = router;
