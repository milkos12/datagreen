const express = require('express');
const router = express.Router();
const { FlowHistory, User, Flow, FlowHistoryData, Step } = require('../models');
const { body, param } = require('express-validator');
const asyncHandler = require('../middlewares/asyncHandler');
const validate = require('../middlewares/validate');

// GET /flowHistories - Retrieve all flow histories
router.get('/', asyncHandler(async (req, res) => {
    const allFlowHistories = await FlowHistory.findAll({
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
                model: FlowHistoryData,
                as: 'flowHistoryData',
                attributes: ['flowHistoryData_id', 'stepId', 'data'],
                include: [
                    {
                        model: User,
                        as: 'createdBy',
                        attributes: ['user_id', 'name', 'phone_number']
                    },
                    {
                        model: Step,
                        as: 'step',
                        attributes: ['step_id', 'message', 'order']
                    }
                ]
            }
        ]
    });
    res.json(allFlowHistories);
}));

// GET /flowHistories/:id - Retrieve a flow history by ID relatedModelObjectId
router.get('/:id',
    validate([
        param('id').isUUID().withMessage('FlowHistory ID is invalid')
    ]),
    asyncHandler(async (req, res) => {
        const { id } = req.params;
        const flowHistory = await FlowHistory.findByPk(id, {
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
                    model: FlowHistoryData,
                    as: 'flowHistoryData',
                    attributes: ['flowHistoryData_id', 'stepId', 'data'],
                    include: [
                        {
                            model: User,
                            as: 'createdBy',
                            attributes: ['user_id', 'name', 'phone_number']
                        },
                        {
                            model: Step,
                            as: 'step',
                            attributes: ['step_id', 'message', 'order']
                        }
                    ]
                }
            ]
        });

        if (!flowHistory) {
            return res.status(404).json({ message: 'FlowHistory not found' });
        }

        res.json(flowHistory);
    })
);

// POST /flowHistories/create - Create a new flow history
router.post('/create',
    validate([
        body('flowId').isUUID().withMessage('Valid Flow ID is required'),
        body('createdById').isUUID().withMessage('Valid User ID is required'),
        body('currentStep').isDecimal().withMessage('Valid Step is required'),
        body('isCompleted').isBoolean().withMessage('Valid isCompleted is required'),
        param('relatedModelObjectId').isUUID().withMessage('relatedModelObjectId ID is invalid')
    ]),
    asyncHandler(async (req, res) => {
        const { flowId, createdById, currentStep, isCompleted, relatedModelObjectId } = req.body;

        // Check if the flow exists
        const flow = await Flow.findByPk(flowId);
        if (!flow) {
            return res.status(400).json({ message: 'Flow not found' });
        }

        // Check if the user exists
        const user = await User.findByPk(createdById);
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Create the flow history
        const newFlowHistory = await FlowHistory.create({
            flowId,
            createdById,
            currentStep,
            isCompleted,
            relatedModelObjectId
        });

        res.status(201).json(newFlowHistory);
    })
);

// PUT /flowHistories/:id - Update an existing flow history
router.put('/:id',
    validate([
        param('id').isUUID().withMessage('FlowHistory ID is invalid'),
        body('flowId').optional().isUUID().withMessage('Valid Flow ID is required'),
        body('createdById').optional().isUUID().withMessage('Valid User ID is required'),
        body('currentStep').isDecimal().withMessage('Valid Step is required'),
        body('isCompleted').isBoolean().withMessage('Valid isCompleted is required'),
        param('relatedModelObjectId').isUUID().withMessage('relatedModelObjectId ID is invalid')
    ]),
    asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { flowId, createdById, currentStep, isCompleted } = req.body;

        const flowHistory = await FlowHistory.findByPk(id);
        if (!flowHistory) {
            return res.status(404).json({ message: 'FlowHistory not found' });
        }

        // If updating the flow, verify it exists
        if (flowId) {
            const flow = await Flow.findByPk(flowId);
            if (!flow) {
                return res.status(400).json({ message: 'Flow not found' });
            }
            flowHistory.flowId = flowId;
        }

        // If updating the creator, verify the user exists
        if (createdById) {
            const user = await User.findByPk(createdById);
            if (!user) {
                return res.status(400).json({ message: 'User not found' });
            }
            flowHistory.createdById = createdById;
        }

        // Update other fields relatedModelObjectId
        flowHistory.currentStep = currentStep !== undefined ? currentStep : flowHistory.currentStep;
        flowHistory.isCompleted = isCompleted !== undefined ? isCompleted : flowHistory.isCompleted;
        flowHistory.relatedModelObjectId = relatedModelObjectId !== undefined ? relatedModelObjectId : flowHistory.relatedModelObjectId;

        await flowHistory.save();

        res.json(flowHistory);
    })
);

// DELETE /flowHistories/:id - Delete a flow history
router.delete('/:id',
    validate([
        param('id').isUUID().withMessage('FlowHistory ID is invalid')
    ]),
    asyncHandler(async (req, res) => {
        const { id } = req.params;
        const flowHistory = await FlowHistory.findByPk(id);

        if (!flowHistory) {
            return res.status(404).json({ message: 'FlowHistory not found' });
        }

        await flowHistory.destroy();
        res.json({ message: 'FlowHistory successfully deleted' });
    })
);

// GET /flowHistories/flow/:flowId - Retrieve flow histories by Flow ID
router.get('/flow/:flowId',
    validate([
        param('flowId').isUUID().withMessage('Flow ID is invalid')
    ]),
    asyncHandler(async (req, res) => {
        const { flowId } = req.params;

        // Check if the flow exists
        const flow = await Flow.findByPk(flowId);
        if (!flow) {
            return res.status(404).json({ message: 'Flow not found' });
        }

        const flowHistories = await FlowHistory.findAll({
            where: { flowId },
            include: [
                {
                    model: User,
                    as: 'createdBy',
                    attributes: ['user_id', 'name', 'phone_number']
                },
                {
                    model: FlowHistoryData,
                    as: 'flowHistoryData',
                    attributes: ['flowHistoryData_id', 'stepId', 'data'],
                    include: [
                        {
                            model: User,
                            as: 'createdBy',
                            attributes: ['user_id', 'name', 'phone_number']
                        },
                        {
                            model: Step,
                            as: 'step',
                            attributes: ['step_id', 'message', 'order']
                        }
                    ]
                }
            ]
        });

        res.json(flowHistories);
    })
);

module.exports = router;
