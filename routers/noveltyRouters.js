const express = require('express');
const router = express.Router();
const { Novelty, Batch, User, Measure, Classification } = require('../models');
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
    const novelties = await Novelty.findAll({
        include: [
            { model: Batch, as: 'batch', attributes: ['batch_id', 'name'] },
            { model: Classification, as: 'classification', attributes: ['classification_id', 'name'] },
            { model: Measure, as: 'measure', attributes: ['measure_id', 'name'] },
            { model: User, as: 'creator', attributes: ['user_id', 'name', 'phone_number'] }
        ]
    });
    res.json(novelties);
}));

router.post('/create',
    validate([
        body('comment').optional().isString(),
        body('quantity_of_stems').isDecimal({ min: 0 }).withMessage('Quantity of stems must be a positive number'),
        body('batch_id').isUUID().withMessage('Valid Batch ID is required'),
        body('classification_id').optional().isUUID().withMessage('Valid Classification ID is required'),
        body('measure_id').optional().isUUID().withMessage('Valid Measure ID is required'),
        body('created_by').isUUID().withMessage('Valid User ID is required')
    ]),
    asyncHandler(async (req, res) => {
        const { comment, quantity_of_stems, batch_id, classification_id, measure_id, created_by } = req.body;

        const batch = await Batch.findByPk(batch_id);
        if (!batch) {
            return res.status(400).json({ message: 'Batch not found' });
        }

        const user = await User.findByPk(created_by);
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const novelty = await Novelty.create({
            comment,
            quantity_of_stems,
            batch_id,
            classification_id,
            measure_id,
            created_by
        });

        res.status(201).json(novelty);
    })
);

router.get('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;

    const novelty = await Novelty.findByPk(id, {
        include: [
            { model: Batch, as: 'batch', attributes: ['batch_id', 'name'] },
            { model: Classification, as: 'classification', attributes: ['classification_id', 'name'] },
            { model: Measure, as: 'measure', attributes: ['measure_id', 'name'] },
            { model: User, as: 'creator', attributes: ['user_id', 'name', 'phone_number'] }
        ]
    });

    if (!novelty) {
        return res.status(404).json({ message: 'Novelty not found' });
    }

    res.json(novelty);
}));

module.exports = router;
