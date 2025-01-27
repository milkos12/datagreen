const express = require('express');
const router = express.Router();
const { ModelItem, User, Step } = require('../models');
const { body, param } = require('express-validator');
const asyncHandler = require('../middlewares/asyncHandler');
const validate = require('../middlewares/validate');

// GET /models - Retrieve all models
router.get('/', asyncHandler(async (req, res) => {
    const allModels = await ModelItem.findAll({
        include: [
            {
                model: User,
                as: 'createdBy',
                attributes: ['user_id', 'name', 'phone_number']
            },
            {
                model: Step,
                as: 'steps',
                attributes: ['step_id', 'message', 'order']
            }
        ]
    });
    res.json(allModels);
}));

// GET /models/:id - Retrieve a model by ID
router.get('/:id',
    validate([
        param('id').isUUID().withMessage('Model ID is invalid')
    ]),
    asyncHandler(async (req, res) => {
        const { id } = req.params;
        const model = await ModelItem.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'createdBy',
                    attributes: ['user_id', 'name', 'phone_number']
                },
                {
                    model: Step,
                    as: 'steps',
                    attributes: ['step_id', 'message', 'order']
                }
            ]
        });

        if (!model) {
            return res.status(404).json({ message: 'Model not found' });
        }

        res.json(model);
    })
);

// POST /models/create - Create a new model idNameModel
router.post('/create',
    validate([
        body('name').notEmpty().withMessage('Name is required'),
        body('createdById').isUUID().withMessage('Valid User ID is required'),
        body('requiredFields').notEmpty().withMessage('requiredFields is required'),
        body('idName').notEmpty().withMessage('idName is required'),
        body('idNameModel').notEmpty().withMessage('idNameModel is required')
    ]),
    asyncHandler(async (req, res) => {
        const { name, createdById, requiredFields, idName, idNameModel } = req.body;

        // Check if the user exists
        const user = await User.findByPk(createdById);
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Create the model
        const newModel = await ModelItem.create({
            name,
            createdById,
            requiredFields,
            idName,
            idNameModel
        });

        res.status(201).json(newModel);
    })
);

// PUT /models/:id - Update an existing model  idNameModel
router.put('/:id',
    validate([
        param('id').isUUID().withMessage('Model ID is invalid'),
        body('name').optional().notEmpty().withMessage('Name cannot be empty'),
        body('createdById').optional().isUUID().withMessage('Valid User ID is required'),
        body('requiredFields').optional().isArray().withMessage('Valid requiredFields is required'),
        body('idName').optional().isString().withMessage('Valid idName is format'),
        body('idNameModel').optional().isString().withMessage('Valid idName is format')
    ]),
    asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { name, createdById, requiredFields, idName, idNameModel } = req.body;

        const model = await ModelItem.findByPk(id);
        if (!model) {
            return res.status(404).json({ message: 'Model not found' });
        }

        // If updating the creator, verify the user exists
        if (createdById) {
            const user = await User.findByPk(createdById);
            if (!user) {
                return res.status(400).json({ message: 'User not found' });
            }
            model.createdById = createdById;
        }

        // Update other fields idName 
        model.name = name !== undefined ? name : model.name;
        model.requiredFields = requiredFields !== undefined ? requiredFields : model.requiredFields;
        model.idName = idName !== undefined ? idName : model.idName;
        model.idNameModel = idNameModel !== undefined ? idNameModel : model.idNameModel;

        await model.save();

        res.json(model);
    })
);

// DELETE /models/:id - Delete a model
router.delete('/:id',
    validate([
        param('id').isUUID().withMessage('Model ID is invalid')
    ]),
    asyncHandler(async (req, res) => {
        const { id } = req.params;
        const model = await ModelItem.findByPk(id);

        if (!model) {
            return res.status(404).json({ message: 'Model not found' });
        }

        await model.destroy();
        res.json({ message: 'Model successfully deleted' });
    })
);

module.exports = router;
