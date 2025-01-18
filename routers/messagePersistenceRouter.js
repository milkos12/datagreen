const express = require('express');
const router = express.Router();
const { MessagePersistence, User } = require('../models');
const { body, param, validationResult } = require('express-validator');

// Middleware para manejar errores asíncronos
const asyncHandler = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Middleware para manejar validaciones
const validate = validations => {
    return async (req, res, next) => {
        await Promise.all(validations.map(validation => validation.run(req)));

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        res.status(400).json({ errors: errors.array() });
    };
};

// Obtener todos los registros
router.get('/', asyncHandler(async (req, res) => {
    const messages = await MessagePersistence.findAll({
        include: {
            model: User,
            as: 'createdById',
            attributes: ['user_id', 'name']
        }
    });
    res.json(messages);
}));

// Obtener un registro por ID
router.get('/:id',
    validate([
        param('id').isUUID().withMessage('MessagePersistence ID is invalid')
    ]),
    asyncHandler(async (req, res) => {
        const { id } = req.params;
        const message = await MessagePersistence.findByPk(id, {
            include: {
                model: User,
                as: 'createdById',
                attributes: ['user_id', 'name', 'email']
            }
        });

        if (!message) {
            return res.status(404).json({ message: 'MessagePersistence not found' });
        }

        res.json(message);
    })
);

// Crear un nuevo registro
router.post('/create',
    validate([
        body('messages').notEmpty().withMessage('Messages is required'),
        body('created_by').isUUID().withMessage('Valid User ID is required')
    ]),
    asyncHandler(async (req, res) => {
        const { messages, created_by } = req.body;

        // Verificar que el usuario existe
        const user = await User.findByPk(created_by);
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const newMessage = await MessagePersistence.create({ messages, user_id: created_by });
        res.status(201).json(newMessage);
    })
);

// Actualizar un registro por ID
router.put('/:id',
    validate([
        param('id').isUUID().withMessage('MessagePersistence ID is invalid'),
        body('messages').optional().notEmpty().withMessage('Messages cannot be empty'),
        body('created_by').optional().isUUID().withMessage('Valid User ID is required')
    ]),
    asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { messages, created_by } = req.body;

        const message = await MessagePersistence.findByPk(id);
        if (!message) {
            return res.status(404).json({ message: 'MessagePersistence not found' });
        }



        if (messages) {
            console.log("************************* ", message.messages)
            const updatedMessages = Array.isArray(message.messages)
                ? [...message.messages, messages]
                : [messages];
            message.set('messages', updatedMessages);
            console.log("*******************ññññññ****** ", message.messages)
        }

        await message.save();
        res.json(message);
    })
);

// Eliminar un registro por ID
router.delete('/:id',
    validate([
        param('id').isUUID().withMessage('MessagePersistence ID is invalid')
    ]),
    asyncHandler(async (req, res) => {
        const { id } = req.params;
        const message = await MessagePersistence.findByPk(id);

        if (!message) {
            return res.status(404).json({ message: 'MessagePersistence not found' });
        }

        await message.destroy();
        res.json({ message: 'MessagePersistence successfully deleted' });
    })
);

module.exports = router;
