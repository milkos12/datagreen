// routes/whatsappRouter.js

const express = require('express');
const router = express.Router();
const axios = require('axios');
const { messageFlowsMenu } = require('./handlersFlows/menuMainHandler'); 
const { User } = require('../models'); // Adjust the path based on your project structure
require('dotenv').config(); // Load environment variables

// Middleware to handle asynchronous errors
const asyncHandler = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Middleware to verify API key (Optional but recommended)
const verifyApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    const validApiKey = process.env.WHATSAPP_API_KEY; // Store securely in .env

    if (apiKey === validApiKey) {
        next();
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
};

// Apply the API key verification middleware
router.use(verifyApiKey);

// POST Route to Handle Incoming Messages
router.post('/', asyncHandler(async (req, res) => {
    const payload = req.body;

    // Validate payload structure
    if (!payload || !Array.isArray(payload.messages)) {
        console.error('Invalid payload structure:', payload);
        return res.status(400).send('Invalid payload structure');
    }

    // Iterate through each message
    for (const message of payload.messages) {
        try {
            // Extract the 'from' number
            let fromNumber = message.from;

            if (!fromNumber) {
                console.warn('Message missing "from" field:', message);
                continue; // Skip this message
            }

            // Remove the initial '57' if present
            if (fromNumber.startsWith('57')) {
                fromNumber = fromNumber.slice(2);
            }

            // Remove any non-digit characters (e.g., '+' or '-')
            fromNumber = fromNumber.replace(/\D/g, '');

            const { user, endList} = await messageFlowsMenu(fromNumber);

            if (user) {
                console.log(`User found: ${user.name} (Phone: ${user.phone_number})`);

                // Prepare the 'to' field with '57' prefix
                const toNumber = `57${user.phone_number}@s.whatsapp.net`;

                // Prepare the message body, customize as needed
                const messageBody = `Hello ${user.name}, this is a friendly message from our system!`;

                // Prepare the payload for WhatsApp API
                const whatsappPayload = {
                    to: toNumber,
                    // quoted and edit fields should reference existing messages; handle accordingly
                    // For demonstration, we'll omit them or set to null if not applicable
                    quoted: "SsYyW0zf7HCT0mpPCE-KcuK1epZaZaKh-ubbe3C",
                    ephemeral: 604800,
                    edit: "bL_y-DqNa2IvEdQ",
                    body: endList,
                    typing_time: 0,
                    no_link_preview: true,
                    mentions: [
                        `9995671366632@s.whatsapp.net`
                    ],
                    view_once: true
                };

                // Make the POST request to WhatsApp API
                try {
                    const response = await axios.post(process.env.WHATSAPP_API_URL, whatsappPayload, {
                        headers: {
                            'Authorization': process.env.WHATSAPP_API_TOKEN,
                            'Content-Type': 'application/json'
                        }
                    });

                    console.log(`WhatsApp message sent to ${toNumber}:`, response.data);
                } catch (apiError) {
                    console.error(`Error sending WhatsApp message to ${toNumber}:`, apiError.response ? apiError.response.data : apiError.message);
                }
            } else {
                console.log(`No user found with phone number: ${fromNumber}`);
            }

        } catch (err) {
            console.error('Error processing message:', message, err);
        }
    }

    res.status(200).send('Evento recibido');
}));

module.exports = router;
