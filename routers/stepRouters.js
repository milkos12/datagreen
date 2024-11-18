const express = require('express');
const router = express.Router();
const { Step, User, Flow, ModelItem } = require('../models');
const { body, param } = require('express-validator');
const asyncHandler = require('../middlewares/asyncHandler');
const validate = require('../middlewares/validate');

// GET /steps - Retrieve all steps
router.get('/', asyncHandler(async (req, res) => {
    const allSteps = await Step.findAll({
        include: [
            {
                model: User,
                as: 'createdBy',
                attributes: ['user_id', 'name', 'phone_number']
            },
            {
                model: Flow,
                as: 'flow',
                attributes: ['flow_id', 'name']
            },
            {
                model: ModelItem,
                as: 'model',
                attributes: ['model_id', 'name']
            }
        ]
    });
    res.json(allSteps);
}));

// GET /steps/:id - Retrieve a step by ID
router.get('/:id',
    validate([
        param('id').isUUID().withMessage('Step ID is invalid')
    ]),
    asyncHandler(async (req, res) => {
        const { id } = req.params;
        const step = await Step.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'createdBy',
                    attributes: ['user_id', 'name', 'phone_number']
                },
                {
                    model: Flow,
                    as: 'flow',
                    attributes: ['flow_id', 'name']
                },
                {
                    model: ModelItem,
                    as: 'model',
                    attributes: ['model_id', 'name']
                }
            ]
        });

        if (!step) {
            return res.status(404).json({ message: 'Step not found' });
        }

        res.json(step);
    })
);

// POST /steps/create - Create a new step
router.post('/create',
    validate([
        body('message').notEmpty().withMessage('Message is required'),
        body('order').isInt({ min: 1 }).withMessage('Order must be a positive integer'),
        body('flowId').isUUID().withMessage('Valid Flow ID is required'),
        body('modelId').isUUID().withMessage('Valid Model ID is required'),
        body('createdById').isUUID().withMessage('Valid User ID is required')
    ]),
    asyncHandler(async (req, res) => {
        const { message, order, flowId, modelId, createdById } = req.body;

        // Check if the flow exists
        const flow = await Flow.findByPk(flowId);
        if (!flow) {
            return res.status(400).json({ message: 'Flow not found' });
        }

        // Check if the model exists
        const model = await ModelItem.findByPk(modelId);
        if (!model) {
            return res.status(400).json({ message: 'Model not found' });
        }

        // Check if the user exists
        const user = await User.findByPk(createdById);
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Optionally, check if the order number is unique within the flow
        const existingStep = await Step.findOne({ where: { flowId, order } });
        if (existingStep) {
            return res.status(400).json({ message: 'Step order must be unique within the flow' });
        }

        // Create the step
        const newStep = await Step.create({
            message,
            order,
            flowId,
            modelId,
            createdById
        });

        res.status(201).json(newStep);
    })
);

// PUT /steps/:id - Update an existing step
router.put('/:id',
    validate([
        param('id').isUUID().withMessage('Step ID is invalid'),
        body('message').optional().notEmpty().withMessage('Message cannot be empty'),
        body('order').optional().isInt({ min: 1 }).withMessage('Order must be a positive integer'),
        body('flowId').optional().isUUID().withMessage('Valid Flow ID is required'),
        body('modelId').optional().isUUID().withMessage('Valid Model ID is required'),
        body('createdById').optional().isUUID().withMessage('Valid User ID is required')
    ]),
    asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { message, order, flowId, modelId, createdById } = req.body;

        const step = await Step.findByPk(id);
        if (!step) {
            return res.status(404).json({ message: 'Step not found' });
        }

        // If updating the flow, verify it exists
        if (flowId) {
            const flow = await Flow.findByPk(flowId);
            if (!flow) {
                return res.status(400).json({ message: 'Flow not found' });
            }
            step.flowId = flowId;
        }

        // If updating the model, verify it exists
        if (modelId) {
            const model = await ModelItem.findByPk(modelId);
            if (!model) {
                return res.status(400).json({ message: 'Model not found' });
            }
            step.modelId = modelId;
        }

        // If updating the creator, verify the user exists
        if (createdById) {
            const user = await User.findByPk(createdById);
            if (!user) {
                return res.status(400).json({ message: 'User not found' });
            }
            step.createdById = createdById;
        }

        // If updating the order, ensure it's unique within the flow
        if (order !== undefined) {
            const existingStep = await Step.findOne({ where: { flowId: step.flowId, order, step_id: { [Op.ne]: id } } });
            if (existingStep) {
                return res.status(400).json({ message: 'Step order must be unique within the flow' });
            }
            step.order = order;
        }

        // Update other fields
        step.message = message !== undefined ? message : step.message;

        await step.save();

        res.json(step);
    })
);

// DELETE /steps/:id - Delete a step
router.delete('/:id',
    validate([
        param('id').isUUID().withMessage('Step ID is invalid')
    ]),
    asyncHandler(async (req, res) => {
        const { id } = req.params;
        const step = await Step.findByPk(id);

        if (!step) {
            return res.status(404).json({ message: 'Step not found' });
        }

        await step.destroy();
        res.json({ message: 'Step successfully deleted' });
    })
);

module.exports = router;
