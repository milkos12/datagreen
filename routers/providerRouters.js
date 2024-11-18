const express = require('express');
const router = express.Router();
const { Provider, Company, User } = require('../models');
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

router.get('/', asyncHandler(async (req, res) => {
    const allProviders = await Provider.findAll({
        include: [
            {
                model: Company,
                as: 'company',
                attributes: ['company_id', 'name', 'phone_number_owner']
            },
            {
                model: User,
                as: 'creator',
                attributes: ['user_id', 'name', 'phone_number'] // Adjust fields based on User model
            }
        ]
    });
    res.json(allProviders);
}));

router.get('/:id',
    validate([
        param('id').isUUID().withMessage('Provider ID is invalid')
    ]),
    asyncHandler(async (req, res) => {
        const { id } = req.params;
        const provider = await Provider.findByPk(id, {
            include: [
                {
                    model: Company,
                    as: 'company',
                    attributes: ['company_id', 'name', 'phone_number_owner']
                },
                {
                    model: User,
                    as: 'creator',
                    attributes: ['user_id', 'name', 'phone_number']
                }
            ]
        });

        if (!provider) {
            return res.status(404).json({ message: 'Provider not found' });
        }

        res.json(provider);
    })
);

router.post('/create',
    validate([
        body('name').notEmpty().withMessage('Name is required'),
        body('phone_number').notEmpty().withMessage('Phone number is required'),
        body('document_number').notEmpty().withMessage('Documnet number is required'),
        body('company_id').isUUID().withMessage('Valid Company ID is required'),
        body('created_by').isUUID().withMessage('Valid User ID is required')
    ]),
    asyncHandler(async (req, res) => {
        const { name, company_id, created_by, phone_number, document_number } = req.body;

        // Check if the company exists
        const company = await Company.findByPk(company_id);
        if (!company) {
            return res.status(400).json({ message: 'Company not found' });
        }

        // Check if the user exists
        const user = await User.findByPk(created_by);
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Create the provider
        const newProvider = await Provider.create({
            name,
            company_id,
            created_by, 
            phone_number,
            document_number
        });

        res.status(201).json(newProvider);
    })
);

router.put('/:id',
    validate([
        param('id').isUUID().withMessage('Provider ID is invalid'),
        body('name').optional().notEmpty().withMessage('Name cannot be empty'),
        body('phone_number').notEmpty().withMessage('Phone number is required'),
        body('document_number').notEmpty().withMessage('Documnet number is required'),
        body('company_id').optional().isUUID().withMessage('Valid Company ID is required'),
        body('created_by').optional().isUUID().withMessage('Valid User ID is required')
    ]),
    asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { name, company_id, created_by, phone_number, document_number } = req.body;

        const provider = await Provider.findByPk(id);
        if (!provider) {
            return res.status(404).json({ message: 'Provider not found' });
        }

        // If updating the company, verify it exists
        if (company_id) {
            const company = await Company.findByPk(company_id);
            if (!company) {
                return res.status(400).json({ message: 'Company not found' });
            }
            provider.company_id = company_id;
        }

        // If updating the creator, verify the user exists
        if (created_by) {
            const user = await User.findByPk(created_by);
            if (!user) {
                return res.status(400).json({ message: 'User not found' });
            }
            provider.created_by = created_by;
        }

        // Update other fields
        provider.name = name !== undefined ? name : provider.name;
        provider.phone_number = phone_number !== undefined ? phone_number : provider.phone_number;
        provider.document_number = document_number !== undefined ? document_number : provider.document_number;

        await provider.save();

        res.json(provider);
    })
);

router.delete('/:id',
    validate([
        param('id').isUUID().withMessage('Provider ID is invalid')
    ]),
    asyncHandler(async (req, res) => {
        const { id } = req.params;
        const provider = await Provider.findByPk(id);

        if (!provider) {
            return res.status(404).json({ message: 'Provider not found' });
        }

        await provider.destroy();
        res.json({ message: 'Provider successfully deleted' });
    })
);

router.get('/company/:companyId',
    validate([
        param('companyId').isUUID().withMessage('Company ID is invalid')
    ]),
    asyncHandler(async (req, res) => {
        const { companyId } = req.params;

        // Check if the company exists
        const company = await Company.findByPk(companyId);
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        const providers = await Provider.findAll({
            where: { company_id: companyId },
            include: [
                {
                    model: Company,
                    as: 'company',
                    attributes: ['company_id', 'name', 'phone_number_owner']
                },
                {
                    model: User,
                    as: 'creator',
                    attributes: ['user_id', 'name', 'phone_number']
                }
            ]
        });

        res.json(providers);
    })
);

module.exports = router;
