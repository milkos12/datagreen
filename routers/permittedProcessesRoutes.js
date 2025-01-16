// routes/permittedProcessesRoutes.js

const express = require('express');
const router = express.Router();
const { PermittedProcesses, Company } = require('../models');
const { body, param, validationResult } = require('express-validator');

// Middleware to handle asynchronous errors
const asyncHandler = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Middleware to handle validations
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

// Get all permitted processes
router.get('/', asyncHandler(async (req, res) => {
    const processes = await PermittedProcesses.findAll({
        include: [
            {
                model: Company,
                as: 'company',
                attributes: ['company_id', 'name']
            }
        ]
    });
    res.json(processes);
}));

// Get a permitted process by ID
router.get('/:id',
    validate([
        param('id').isUUID().withMessage('Process ID is invalid')
    ]),
    asyncHandler(async (req, res) => {
        const { id } = req.params;
        const process = await PermittedProcesses.findByPk(id, {
            include: [
                {
                    model: Company,
                    as: 'company',
                    attributes: ['company_id', 'name']
                }
            ]
        });

        if (!process) {
            return res.status(404).json({ message: 'Process not found' });
        }

        res.json(process);
    })
);

// Create a new permitted process
router.post('/create',
    validate([
        body('name').notEmpty().withMessage('Name is required'),
        body('company_id').isUUID().withMessage('Valid Company ID is required')
    ]),
    asyncHandler(async (req, res) => {
        const { name, company_id } = req.body;

        // Verify that the company exists
        const company = await Company.findByPk(company_id);
        if (!company) {
            return res.status(400).json({ message: 'Company not found' });
        }

        const newProcess = await PermittedProcesses.create({
            name,
            company_id
        });

        res.status(201).json(newProcess);
    })
);

// Update a permitted process
router.put('/:id',
    validate([
        param('id').isUUID().withMessage('Process ID is invalid'),
        body('name').optional().notEmpty().withMessage('Name cannot be empty'),
        body('company_id').optional().isUUID().withMessage('Valid Company ID is required')
    ]),
    asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { name, company_id } = req.body;

        const process = await PermittedProcesses.findByPk(id);
        if (!process) {
            return res.status(404).json({ message: 'Process not found' });
        }

        // If updating the company, verify it exists
        if (company_id) {
            const company = await Company.findByPk(company_id);
            if (!company) {
                return res.status(400).json({ message: 'Company not found' });
            }
            process.company_id = company_id;
        }

        if (name !== undefined) process.name = name;

        await process.save();

        res.json(process);
    })
);

// Delete a permitted process
router.delete('/:id',
    validate([
        param('id').isUUID().withMessage('Process ID is invalid')
    ]),
    asyncHandler(async (req, res) => {
        const { id } = req.params;
        const process = await PermittedProcesses.findByPk(id);

        if (!process) {
            return res.status(404).json({ message: 'Process not found' });
        }

        await process.destroy();
        res.json({ message: 'Process successfully deleted' });
    })
);

module.exports = router;
