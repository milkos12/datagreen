// routes/batchRoutes.js

const express = require('express');
const router = express.Router();
const { Batch, Company, User, Provider, Classification, Product, Measure } = require('../models');
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
    const allBatches = await Batch.findAll({
        include: [
            {
                model: Provider,
                as: 'provider',
                attributes: ['provider_id', 'name']
            },
            {
                model: Classification,
                as: 'classification',
                attributes: ['classification_id', 'name']
            },
            {
                model: Product,
                as: 'product',
                attributes: ['product_id', 'name']
            },
            {
                model: Measure,
                as: 'measure',
                attributes: ['measure_id', 'name']
            },
            {
                model: User,
                as: 'creator',
                attributes: ['user_id', 'name', 'phone_number']
            },
            {
                model: Company,
                as: 'company',
                attributes: ['company_id', 'name', 'phone_number_owner']
            }
        ]
    });
    res.json(allBatches);
}));

router.get('/:id',
    validate([
        param('id').isUUID().withMessage('Batch ID is invalid')
    ]),
    asyncHandler(async (req, res) => {
        const { id } = req.params;
        const batch = await Batch.findByPk(id, {
            include: [
                {
                    model: Provider,
                    as: 'provider',
                    attributes: ['provider_id', 'name']
                },
                {
                    model: Classification,
                    as: 'classification',
                    attributes: ['classification_id', 'name']
                },
                {
                    model: Product,
                    as: 'product',
                    attributes: ['product_id', 'name']
                },
                {
                    model: Measure,
                    as: 'measure',
                    attributes: ['measure_id', 'name']
                },
                {
                    model: User,
                    as: 'creator',
                    attributes: ['user_id', 'name', 'phone_number']
                },
                {
                    model: Company,
                    as: 'company',
                    attributes: ['company_id', 'name', 'phone_number_owner']
                }
            ]
        });

        if (!batch) {
            return res.status(404).json({ message: 'Batch not found' });
        }

        res.json(batch);
    })
);

router.post('/create',
    validate([
        body('name').notEmpty().withMessage('Name is required'),
        body('quantity_of_stems').isDecimal({ min: 0 }).withMessage('Quantity of stems must be a positive number'),
        body('provider_id').isUUID().withMessage('Valid Provider ID is required'),
        body('classification_id').isUUID().withMessage('Valid Classification ID is required'),
        body('product_id').isUUID().withMessage('Valid Product ID is required'),
        body('measure_id').isUUID().withMessage('Valid Measure ID is required'),
        body('created_by').isUUID().withMessage('Valid User ID is required'),
        body('company_id').isUUID().withMessage('Valid Company ID is required')
    ]),
    asyncHandler(async (req, res) => {
        const { name, quantity_of_stems, provider_id, classification_id, product_id, measure_id, created_by, company_id } = req.body;

        // Verify that the company exists
        const company = await Company.findByPk(company_id);
        if (!company) {
            return res.status(400).json({ message: 'Company not found' });
        }

        // Verify that the user exists
        const user = await User.findByPk(created_by);
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Verify that the provider exists
        const provider = await Provider.findByPk(provider_id);
        if (!provider) {
            return res.status(400).json({ message: 'Provider not found' });
        }

        // Verify that the classification exists
        const classification = await Classification.findByPk(classification_id);
        if (!classification) {
            return res.status(400).json({ message: 'Classification not found' });
        }

        // Verify that the product exists
        const product = await Product.findByPk(product_id);
        if (!product) {
            return res.status(400).json({ message: 'Product not found' });
        }

        // Verify that the measure exists
        const measure = await Measure.findByPk(measure_id);
        if (!measure) {
            return res.status(400).json({ message: 'Measure not found' });
        }

        // Create the batch
        const newBatch = await Batch.create({
            name,
            quantity_of_stems,
            provider_id,
            classification_id,
            product_id,
            measure_id,
            created_by,
            company_id
        });

        res.status(201).json(newBatch);
    })
);

router.put('/:id',
    validate([
        param('id').isUUID().withMessage('Batch ID is invalid'),
        body('name').optional().notEmpty().withMessage('Name cannot be empty'),
        body('quantity_of_stems').optional().isDecimal({ min: 0 }).withMessage('Quantity of stems must be a positive number'),
        body('provider_id').optional().isUUID().withMessage('Valid Provider ID is required'),
        body('classification_id').optional().isUUID().withMessage('Valid Classification ID is required'),
        body('product_id').optional().isUUID().withMessage('Valid Product ID is required'),
        body('measure_id').optional().isUUID().withMessage('Valid Measure ID is required'),
        body('created_by').optional().isUUID().withMessage('Valid User ID is required'),
        body('company_id').optional().isUUID().withMessage('Valid Company ID is required')
    ]),
    asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { name, quantity_of_stems, provider_id, classification_id, product_id, measure_id, created_by, company_id } = req.body;

        const batch = await Batch.findByPk(id);
        if (!batch) {
            return res.status(404).json({ message: 'Batch not found' });
        }

        // If updating the company, verify it exists
        if (company_id) {
            const company = await Company.findByPk(company_id);
            if (!company) {
                return res.status(400).json({ message: 'Company not found' });
            }
            batch.company_id = company_id;
        }

        // If updating the creator, verify the user exists
        if (created_by) {
            const user = await User.findByPk(created_by);
            if (!user) {
                return res.status(400).json({ message: 'User not found' });
            }
            batch.created_by = created_by;
        }

        // If updating the provider, verify it exists
        if (provider_id) {
            const provider = await Provider.findByPk(provider_id);
            if (!provider) {
                return res.status(400).json({ message: 'Provider not found' });
            }
            batch.provider_id = provider_id;
        }

        // If updating the classification, verify it exists
        if (classification_id) {
            const classification = await Classification.findByPk(classification_id);
            if (!classification) {
                return res.status(400).json({ message: 'Classification not found' });
            }
            batch.classification_id = classification_id;
        }

        // If updating the product, verify it exists
        if (product_id) {
            const product = await Product.findByPk(product_id);
            if (!product) {
                return res.status(400).json({ message: 'Product not found' });
            }
            batch.product_id = product_id;
        }

        // If updating the measure, verify it exists
        if (measure_id) {
            const measure = await Measure.findByPk(measure_id);
            if (!measure) {
                return res.status(400).json({ message: 'Measure not found' });
            }
            batch.measure_id = measure_id;
        }

        // Update other fields
        if (name !== undefined) batch.name = name;
        if (quantity_of_stems !== undefined) batch.quantity_of_stems = quantity_of_stems;

        await batch.save();

        res.json(batch);
    })
);

router.delete('/:id',
    validate([
        param('id').isUUID().withMessage('Batch ID is invalid')
    ]),
    asyncHandler(async (req, res) => {
        const { id } = req.params;
        const batch = await Batch.findByPk(id);

        if (!batch) {
            return res.status(404).json({ message: 'Batch not found' });
        }

        await batch.destroy();
        res.json({ message: 'Batch successfully deleted' });
    })
);

router.get('/company/:companyId',
    validate([
        param('companyId').isUUID().withMessage('Company ID is invalid')
    ]),
    asyncHandler(async (req, res) => {
        const { companyId } = req.params;

        // Verify that the company exists
        const company = await Company.findByPk(companyId);
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        const batches = await Batch.findAll({
            where: { company_id: companyId },
            include: [
                {
                    model: Provider,
                    as: 'provider',
                    attributes: ['provider_id', 'name']
                },
                {
                    model: Classification,
                    as: 'classification',
                    attributes: ['classification_id', 'name']
                },
                {
                    model: Product,
                    as: 'product',
                    attributes: ['product_id', 'name']
                },
                {
                    model: Measure,
                    as: 'measure',
                    attributes: ['measure_id', 'name']
                },
                {
                    model: User,
                    as: 'creator',
                    attributes: ['user_id', 'name', 'phone_number']
                },
                {
                    model: Company,
                    as: 'company',
                    attributes: ['company_id', 'name', 'phone_number_owner']
                }
            ]
        });

        res.json(batches);
    })
);

module.exports = router;
