const express = require('express');
const router = express.Router();
const { FlowHistoryData, User, FlowHistory, Step } = require('../models');
const { body, param } = require('express-validator');
const asyncHandler = require('../middlewares/asyncHandler');
const validate = require('../middlewares/validate');

// GET /flowHistoryData - Retrieve all flow history data entries
router.get('/', asyncHandler(async (req, res) => {
    const allFlowHistoryData = await FlowHistoryData.findAll({
        include: [
            {
                model: User,
                as: 'createdBy',
                attributes: ['user_id', 'name', 'phone_number']
            },
            {
                model: FlowHistory,
                as: 'flowHistory',
                attributes: ['flowHistory_id', 'flowId']
            },
            {
                model: Step,
                as: 'step',
                attributes: ['step_id', 'message', 'order']
            }
        ]
    });
    res.json(allFlowHistoryData);
}));

// GET /flowHistoryData/:id - Retrieve a flow history data entry by ID
router.get('/:id',
    validate([
        param('id').isUUID().withMessage('FlowHistoryData ID is invalid')
    ]),
    asyncHandler(async (req, res) => {
        const { id } = req.params;
        const flowHistoryData = await FlowHistoryData.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'createdBy',
                    attributes: ['user_id', 'name', 'phone_number']
                },
                {
                    model: FlowHistory,
                    as: 'flowHistory',
                    attributes: ['flowHistory_id', 'flowId']
                },
                {
                    model: Step,
                    as: 'step',
                    attributes: ['step_id', 'message', 'order']
                }
            ]
        });

        if (!flowHistoryData) {
            return res.status(404).json({ message: 'FlowHistoryData not found' });
        }

        res.json(flowHistoryData);
    })
);

// POST /flowHistoryData/create - Create a new flow history data entry
router.post('/create',
    validate([
        body('flowHistoryId').isUUID().withMessage('Valid FlowHistory ID is required'),
        body('stepId').isUUID().withMessage('Valid Step ID is required'),
        body('data').optional().isObject().withMessage('Data must be a valid JSON object'),
        body('createdById').isUUID().withMessage('Valid User ID is required')
    ]),
    asyncHandler(async (req, res) => {
        const { flowHistoryId, stepId, data, createdById } = req.body;

        // Check if the flow history exists
        const flowHistory = await FlowHistory.findByPk(flowHistoryId);
        if (!flowHistory) {
            return res.status(400).json({ message: 'FlowHistory not found' });
        }

        // Check if the step exists
        const step = await Step.findByPk(stepId);
        if (!step) {
            return res.status(400).json({ message: 'Step not found' });
        }

        // Check if the user exists
        const user = await User.findByPk(createdById);
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Optionally, ensure that the step belongs to the flow history's flow
        if (step.flowId !== flowHistory.flowId) {
            return res.status(400).json({ message: 'Step does not belong to the Flow associated with this FlowHistory' });
        }

        // Create the flow history data
        const newFlowHistoryData = await FlowHistoryData.create({
            flowHistoryId,
            stepId,
            data,
            createdById
        });

        res.status(201).json(newFlowHistoryData);
    })
);

// PUT /flowHistoryData/:id - Update an existing flow history data entry
router.put('/:id',
    validate([
        param('id').isUUID().withMessage('FlowHistoryData ID is invalid'),
        body('flowHistoryId').optional().isUUID().withMessage('Valid FlowHistory ID is required'),
        body('stepId').optional().isUUID().withMessage('Valid Step ID is required'),
        body('data').optional().isObject().withMessage('Data must be a valid JSON object'),
        body('createdById').optional().isUUID().withMessage('Valid User ID is required')
    ]),
    asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { flowHistoryId, stepId, data, createdById } = req.body;

        const flowHistoryData = await FlowHistoryData.findByPk(id);
        if (!flowHistoryData) {
            return res.status(404).json({ message: 'FlowHistoryData not found' });
        }

        // If updating the flow history, verify it exists
        if (flowHistoryId) {
            const flowHistory = await FlowHistory.findByPk(flowHistoryId);
            if (!flowHistory) {
                return res.status(400).json({ message: 'FlowHistory not found' });
            }
            flowHistoryData.flowHistoryId = flowHistoryId;
        }

        // If updating the step, verify it exists
        if (stepId) {
            const step = await Step.findByPk(stepId);
            if (!step) {
                return res.status(400).json({ message: 'Step not found' });
            }

            // Optionally, ensure that the step belongs to the flow history's flow
            const currentFlowHistory = await FlowHistory.findByPk(flowHistoryData.flowHistoryId);
            if (step.flowId !== currentFlowHistory.flowId) {
                return res.status(400).json({ message: 'Step does not belong to the Flow associated with this FlowHistory' });
            }

            flowHistoryData.stepId = stepId;
        }

        // If updating the creator, verify the user exists
        if (createdById) {
            const user = await User.findByPk(createdById);
            if (!user) {
                return res.status(400).json({ message: 'User not found' });
            }
            flowHistoryData.createdById = createdById;
        }

        // Update other fields
        flowHistoryData.data = data !== undefined ? data : flowHistoryData.data;

        await flowHistoryData.save();

        res.json(flowHistoryData);
    })
);

// DELETE /flowHistoryData/:id - Delete a flow history data entry
router.delete('/:id',
    validate([
        param('id').isUUID().withMessage('FlowHistoryData ID is invalid')
    ]),
    asyncHandler(async (req, res) => {
        const { id } = req.params;
        const flowHistoryData = await FlowHistoryData.findByPk(id);

        if (!flowHistoryData) {
            return res.status(404).json({ message: 'FlowHistoryData not found' });
        }

        await flowHistoryData.destroy();
        res.json({ message: 'FlowHistoryData successfully deleted' });
    })
);

module.exports = router;
