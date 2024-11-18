const express = require('express');
const router = express.Router();
const { Flow, User, Step, Company } = require('../models');
const { body, param } = require('express-validator');
const asyncHandler = require('../middlewares/asyncHandler');
const validate = require('../middlewares/validate');

// GET /flows - Retrieve all flows
router.get('/', asyncHandler(async (req, res) => {
    const allFlows = await Flow.findAll({
        include: [
            {
                model: User,
                as: 'createdBy',
                attributes: ['user_id', 'name', 'phone_number']
            },
            {
                model: Company,
                as: 'ownerCompany',
                attributes: ['company_id', 'name', 'phone_number_owner']
            },
            {
                model: Step,
                as: 'steps',
                attributes: ['step_id', 'message', 'order']
            }
        ]
    });
    res.json(allFlows);
}));

// GET /flows/:id - Retrieve a flow by ID
router.get('/:id',
    validate([
        param('id').isUUID().withMessage('Flow ID is invalid')
    ]),
    asyncHandler(async (req, res) => {
        const { id } = req.params;
        const flow = await Flow.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'createdBy',
                    attributes: ['user_id', 'name', 'phone_number']
                },
                {
                    model: Company,
                    as: 'ownerCompany',
                    attributes: ['company_id', 'name', 'phone_number_owner']
                },
                {
                    model: Step,
                    as: 'steps',
                    attributes: ['step_id', 'message', 'order']
                }
            ]
        });

        if (!flow) {
            return res.status(404).json({ message: 'Flow not found' });
        }

        res.json(flow);
    })
);

// POST /flows/create - Create a new flow
router.post('/create',
    validate([
        body('name').notEmpty().withMessage('Name is required'),
        body('createdById').isUUID().withMessage('Valid User ID is required'),
        body('ownerCompanyId').isUUID().withMessage('Valid Company ID is required')
    ]),
    asyncHandler(async (req, res) => {
        const { name, createdById, ownerCompanyId } = req.body;

        // Check if the user exists
        const user = await User.findByPk(createdById);
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Check if the company exists
        const comapny = await Company.findByPk(ownerCompanyId);
        if (!comapny) {
            return res.status(400).json({ message: 'Company not found' });
        }

        // Create the flow
        const newFlow = await Flow.create({
            name,
            createdById,
            ownerCompanyId
        });

        res.status(201).json(newFlow);
    })
);

// PUT /flows/:id - Update an existing flow
router.put('/:id',
    validate([
        param('id').isUUID().withMessage('Flow ID is invalid'),
        body('name').optional().notEmpty().withMessage('Name cannot be empty'),
        body('createdById').optional().isUUID().withMessage('Valid User ID is required')
    ]),
    asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { name, createdById, ownerCompanyId } = req.body;

        const flow = await Flow.findByPk(id);
        if (!flow) {
            return res.status(404).json({ message: 'Flow not found' });
        }

        // If updating the creator, verify the user exists
        if (createdById) {
            const user = await User.findByPk(createdById);
            if (!user) {
                return res.status(400).json({ message: 'User not found' });
            }
            flow.createdById = createdById;
        }

        // If updating the company, verify the company exists
        if (ownerCompanyId) {
            const company = await Company.findByPk(ownerCompanyId);
            if (!company) {
                return res.status(400).json({ message: 'Company not found' });
            }
            flow.ownerCompanyId = ownerCompanyId;
        }

        // Update other fields
        flow.name = name !== undefined ? name : flow.name;

        await flow.save();

        res.json(flow);
    })
);

// DELETE /flows/:id - Delete a flow
router.delete('/:id',
    validate([
        param('id').isUUID().withMessage('Flow ID is invalid')
    ]),
    asyncHandler(async (req, res) => {
        const { id } = req.params;
        const flow = await Flow.findByPk(id);

        if (!flow) {
            return res.status(404).json({ message: 'Flow not found' });
        }

        await flow.destroy();
        res.json({ message: 'Flow successfully deleted' });
    })
);

module.exports = router;
