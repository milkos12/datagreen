const express = require('express');
const router = express.Router();
const { Activity, Company } = require('../models');
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

// GET all activities
router.get('/', asyncHandler(async (req, res) => {
    const allActivities = await Activity.findAll({
        include: [{
            model: Company,
            as: 'company',
            attributes: ['company_id', 'name', 'phone_number_owner']
        }]
    });
    res.json(allActivities);
}));

// GET activity by ID
router.get('/:id',
    validate([
        param('id').isUUID().withMessage('Activity ID is invalid')
    ]),
    asyncHandler(async (req, res) => {
        const { id } = req.params;
        const activity = await Activity.findByPk(id, {
            include: [{
                model: Company,
                as: 'company',
                attributes: ['company_id', 'name', 'phone_number_owner']
            }]
        });

        if (!activity) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        res.json(activity);
    })
);

// POST create new activity
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

        // Create the activity
        const newActivity = await Activity.create({
            name,
            company_id
        });

        res.status(201).json(newActivity);
    })
);

// PUT update activity by ID
router.put('/:id',
    validate([
        param('id').isUUID().withMessage('Activity ID is invalid'),
        body('name').optional().notEmpty().withMessage('Name cannot be empty'),
        body('company_id').optional().isUUID().withMessage('Valid Company ID is required')
    ]),
    asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { name, company_id } = req.body;

        const activity = await Activity.findByPk(id);
        if (!activity) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        // If updating the company, verify it exists
        if (company_id) {
            const company = await Company.findByPk(company_id);
            if (!company) {
                return res.status(400).json({ message: 'Company not found' });
            }
            activity.company_id = company_id;
        }

        // Update other fields
        if (name !== undefined) activity.name = name;

        await activity.save();

        res.json(activity);
    })
);

// DELETE activity by ID
router.delete('/:id',
    validate([
        param('id').isUUID().withMessage('Activity ID is invalid')
    ]),
    asyncHandler(async (req, res) => {
        const { id } = req.params;
        const activity = await Activity.findByPk(id);

        if (!activity) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        await activity.destroy();
        res.json({ message: 'Activity successfully deleted' });
    })
);

module.exports = router;
