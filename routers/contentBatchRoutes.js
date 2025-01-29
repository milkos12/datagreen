// routes/contentBatchRoutes.js

const express = require('express');
const router = express.Router();
const { ContentBatch, Classification, Measure, Batch } = require('../models');
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

// GET all ContentBatches
router.get('/', asyncHandler(async (req, res) => {
    const contentBatches = await ContentBatch.findAll({
        include: [
            {
                model: Classification,
                as: 'classification',
                attributes: ['classification_id', 'name']
            },
            {
                model: Measure,
                as: 'measure',
                attributes: ['measure_id', 'name']
            },
            {
                model: Batch,
                as: 'batch'
            }
        ]
    });
    res.json(contentBatches);
}));

// GET a specific ContentBatch by ID
router.get('/:id',
    validate([
        param('id').isUUID().withMessage('ContentBatch ID is invalid')
    ]),
    asyncHandler(async (req, res) => {
        const { id } = req.params;
        const contentBatch = await ContentBatch.findByPk(id, {
            include: [
                {
                    model: Classification,
                    as: 'classification',
                    attributes: ['classification_id', 'name']
                },
                {
                    model: Measure,
                    as: 'measure',
                    attributes: ['measure_id', 'name']
                }
            ]
        });

        if (!contentBatch) {
            return res.status(404).json({ message: 'ContentBatch not found' });
        }

        res.json(contentBatch);
    })
);

// CREATE a new ContentBatch
router.post('/create',
    validate([
        body('classification_id').isUUID().withMessage('Valid Classification ID is required'),
        body('measure_id').isUUID().withMessage('Valid Measure ID is required'),
        body('quantity_of_stems').isInt({ min: 0 }).withMessage('Quantity of stems must be a non-negative integer')
    ]),
    asyncHandler(async (req, res) => {
        const { classification_id, measure_id, quantity_of_stems } = req.body;

        // Verify that the classification exists
        const classification = await Classification.findByPk(classification_id);
        if (!classification) {
            return res.status(400).json({ message: 'Classification not found' });
        }

        // Verify that the measure exists
        const measure = await Measure.findByPk(measure_id);
        if (!measure) {
            return res.status(400).json({ message: 'Measure not found' });
        }

        // Create the ContentBatch
        const newContentBatch = await ContentBatch.create({
            classification_id,
            measure_id,
            quantity_of_stems
        });

        res.status(201).json(newContentBatch);
    })
);

// UPDATE an existing ContentBatch
router.put('/:id',
    validate([
        param('id').isUUID().withMessage('ContentBatch ID is invalid'),
        body('classification_id').optional().isUUID().withMessage('Valid Classification ID is required'),
        body('measure_id').optional().isUUID().withMessage('Valid Measure ID is required'),
        body('batch_id').optional().isUUID().withMessage('Valid Batch ID is required'),
        body('quantity_of_stems').optional().isInt({ min: 0 }).withMessage('Quantity of stems must be a non-negative integer')
    ]),
    asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { classification_id, measure_id, quantity_of_stems, batch_id } = req.body;

        const contentBatch = await ContentBatch.findByPk(id);
        if (!contentBatch) {
            return res.status(404).json({ message: 'ContentBatch not found' });
        }

        // Update related fields if provided
        if (classification_id) {
            const classification = await Classification.findByPk(classification_id);
            if (!classification) {
                return res.status(400).json({ message: 'Classification not found' });
            }
            contentBatch.classification_id = classification_id;
        }

        if (measure_id) {
            const measure = await Measure.findByPk(measure_id);
            if (!measure) {
                return res.status(400).json({ message: 'Measure not found' });
            }
            contentBatch.measure_id = measure_id;
        }

        if (batch_id) {
            const batch = await Batch.findByPk(batch_id);
            if (!batch) {
                return res.status(400).json({ message: 'Measure not found' });
            }
            contentBatch.batch_id = batch_id;
        }

        if (quantity_of_stems !== undefined) {
            contentBatch.quantity_of_stems = quantity_of_stems;
        }

        await contentBatch.save();
        res.json(contentBatch);
    })
);

// DELETE a ContentBatch by ID
router.delete('/:id',
    validate([
        param('id').isUUID().withMessage('ContentBatch ID is invalid')
    ]),
    asyncHandler(async (req, res) => {
        const { id } = req.params;
        const contentBatch = await ContentBatch.findByPk(id);

        if (!contentBatch) {
            return res.status(404).json({ message: 'ContentBatch not found' });
        }

        await contentBatch.destroy();
        res.json({ message: 'ContentBatch successfully deleted' });
    })
);

module.exports = router;
