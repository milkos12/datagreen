// routes/contentActivityRoutes.js

const express = require('express');
const router = express.Router();
const { ContentActivity, User, ContentBatch, Activity } = require('../models');
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

// GET all ContentActivities
router.get('/', asyncHandler(async (req, res) => {
    const contentActivities = await ContentActivity.findAll({
        include: [
            {
                model: User,
                as: 'userCreated',
                attributes: ['user_id', 'name']
            },
            {
                model: User,
                as: 'userEncharge',
                attributes: ['user_id', 'name']
            },
            {
                model: ContentBatch,
                as: 'contentBatch',
                attributes: ['content_batch_id', 'quantity_of_stems']
            },
            {
                model: Activity,
                as: 'activity',
                attributes: ['activity_id', 'name']
            }
        ]
    });
    res.json(contentActivities);
}));

// GET a specific ContentActivity by ID
router.get('/:id',
    validate([
        param('id').isUUID().withMessage('ContentActivity ID is invalid')
    ]),
    asyncHandler(async (req, res) => {
        const { id } = req.params;
        const contentActivity = await ContentActivity.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'userCreated',
                    attributes: ['user_id', 'name']
                },
                {
                    model: User,
                    as: 'userEncharge',
                    attributes: ['user_id', 'name']
                },
                {
                    model: ContentBatch,
                    as: 'contentBatch',
                    attributes: ['content_batch_id', 'batch_name']
                },
                {
                    model: Activity,
                    as: 'activity',
                    attributes: ['activity_id', 'activity_name']
                }
            ]
        });

        if (!contentActivity) {
            return res.status(404).json({ message: 'ContentActivity not found' });
        }

        res.json(contentActivity);
    })
);

// CREATE a new ContentActivity
router.post('/create',
    validate([
        body('user_created_id').isUUID().withMessage('Valid user_created_id is required'),
        body('user_encharge_id').isUUID().withMessage('Valid user_encharge_id is required'),
        body('content_batch_id').isUUID().withMessage('Valid content_batch_id is required'),
        body('activity_id').isUUID().withMessage('Valid activity_id is required'),
        body('quantity_of_stems').isInt({ min: 0 }).withMessage('Quantity of stems must be a non-negative integer'),
        body('is_active').optional().isBoolean().withMessage('is_active must be a boolean')
    ]),
    asyncHandler(async (req, res) => {
        const { user_created_id, user_encharge_id, content_batch_id, activity_id, quantity_of_stems, is_active } = req.body;

        // Verify that the users exist
        const userCreated = await User.findByPk(user_created_id);
        if (!userCreated) {
            return res.status(400).json({ message: 'User (Created) not found' });
        }

        const userEncharge = await User.findByPk(user_encharge_id);
        if (!userEncharge) {
            return res.status(400).json({ message: 'User (Encharge) not found' });
        }

        // Verify that the contentBatch exists
        const contentBatch = await ContentBatch.findByPk(content_batch_id);
        if (!contentBatch) {
            return res.status(400).json({ message: 'ContentBatch not found' });
        }

        // Verify that the activity exists
        const activity = await Activity.findByPk(activity_id);
        if (!activity) {
            return res.status(400).json({ message: 'Activity not found' });
        }

        // Create the ContentActivity
        const newContentActivity = await ContentActivity.create({
            user_created_id,
            user_encharge_id,
            content_batch_id,
            activity_id,
            quantity_of_stems,
            is_active: is_active !== undefined ? is_active : true // Default to true if not provided
        });

        res.status(201).json(newContentActivity);
    })
);

// UPDATE an existing ContentActivity
router.put('/:id',
    validate([
        param('id').isUUID().withMessage('ContentActivity ID is invalid'),
        body('user_created_id').optional().isUUID().withMessage('Valid user_created_id is required'),
        body('user_encharge_id').optional().isUUID().withMessage('Valid user_encharge_id is required'),
        body('content_batch_id').optional().isUUID().withMessage('Valid content_batch_id is required'),
        body('activity_id').optional().isUUID().withMessage('Valid activity_id is required'),
        body('quantity_of_stems').optional().isInt({ min: 0 }).withMessage('Quantity of stems must be a non-negative integer'),
        body('is_active').optional().isBoolean().withMessage('is_active must be a boolean')
    ]),
    asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { user_created_id, user_encharge_id, content_batch_id, activity_id, quantity_of_stems, is_active } = req.body;

        const contentActivity = await ContentActivity.findByPk(id);
        if (!contentActivity) {
            return res.status(404).json({ message: 'ContentActivity not found' });
        }

        // Update related fields if provided
        if (user_created_id) {
            const userCreated = await User.findByPk(user_created_id);
            if (!userCreated) {
                return res.status(400).json({ message: 'User (Created) not found' });
            }
            contentActivity.user_created_id = user_created_id;
        }

        if (user_encharge_id) {
            const userEncharge = await User.findByPk(user_encharge_id);
            if (!userEncharge) {
                return res.status(400).json({ message: 'User (Encharge) not found' });
            }
            contentActivity.user_encharge_id = user_encharge_id;
        }

        if (content_batch_id) {
            const contentBatch = await ContentBatch.findByPk(content_batch_id);
            if (!contentBatch) {
                return res.status(400).json({ message: 'ContentBatch not found' });
            }
            contentActivity.content_batch_id = content_batch_id;
        }

        if (activity_id) {
            const activity = await Activity.findByPk(activity_id);
            if (!activity) {
                return res.status(400).json({ message: 'Activity not found' });
            }
            contentActivity.activity_id = activity_id;
        }

        if (quantity_of_stems !== undefined) {
            contentActivity.quantity_of_stems = quantity_of_stems;
        }

        if (is_active !== undefined) {
            contentActivity.is_active = is_active;
        }

        await contentActivity.save();
        res.json(contentActivity);
    })
);

// DELETE a ContentActivity by ID
router.delete('/:id',
    validate([
        param('id').isUUID().withMessage('ContentActivity ID is invalid')
    ]),
    asyncHandler(async (req, res) => {
        const { id } = req.params;
        const contentActivity = await ContentActivity.findByPk(id);

        if (!contentActivity) {
            return res.status(404).json({ message: 'ContentActivity not found' });
        }

        await contentActivity.destroy();
        res.json({ message: 'ContentActivity successfully deleted' });
    })
);

module.exports = router;
