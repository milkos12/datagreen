const express = require('express');
const router = express.Router();
const { Measure, Company, User } = require('../models');
const { body, param, validationResult } = require('express-validator');

// Middleware para manejar errores asíncronos
const asyncHandler = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Middleware para manejar validaciones
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
    const allMeasures = await Measure.findAll({
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
    res.json(allMeasures);
}));

router.get('/:id',
    validate([
        param('id').isUUID().withMessage('Measure ID is invalid')
    ]),
    asyncHandler(async (req, res) => {
        const { id } = req.params;
        const measure = await Measure.findByPk(id, {
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

        if (!measure) {
            return res.status(404).json({ message: 'Measure not found' });
        }

        res.json(measure);
    })
);

router.post('/create',
    validate([
        body('name').notEmpty().withMessage('Name is required'),
        body('company_id').isUUID().withMessage('Valid Company ID is required'),
        body('created_by').isUUID().withMessage('Valid User ID is required')
    ]),
    asyncHandler(async (req, res) => {
        const { name, company_id, created_by } = req.body;

        // Verificar que la compañía existe
        const company = await Company.findByPk(company_id);
        if (!company) {
            return res.status(400).json({ message: 'Company not found' });
        }

        // Verificar que el usuario existe
        const user = await User.findByPk(created_by);
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Crear la medida
        const newMeasure = await Measure.create({
            name,
            company_id,
            created_by
        });

        res.status(201).json(newMeasure);
    })
);

router.put('/:id',
    validate([
        param('id').isUUID().withMessage('Measure ID is invalid'),
        body('name').optional().notEmpty().withMessage('Name cannot be empty'),
        body('company_id').optional().isUUID().withMessage('Valid Company ID is required'),
        body('created_by').optional().isUUID().withMessage('Valid User ID is required')
    ]),
    asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { name, company_id, created_by } = req.body;

        const measure = await Measure.findByPk(id);
        if (!measure) {
            return res.status(404).json({ message: 'Measure not found' });
        }

        // Si se está actualizando la compañía, verificar que exista
        if (company_id) {
            const company = await Company.findByPk(company_id);
            if (!company) {
                return res.status(400).json({ message: 'Company not found' });
            }
            measure.company_id = company_id;
        }

        // Si se está actualizando el creador, verificar que exista
        if (created_by) {
            const user = await User.findByPk(created_by);
            if (!user) {
                return res.status(400).json({ message: 'User not found' });
            }
            measure.created_by = created_by;
        }

        // Actualizar otros campos
        measure.name = name !== undefined ? name : measure.name;

        await measure.save();

        res.json(measure);
    })
);

router.delete('/:id',
    validate([
        param('id').isUUID().withMessage('Measure ID is invalid')
    ]),
    asyncHandler(async (req, res) => {
        const { id } = req.params;
        const measure = await Measure.findByPk(id);

        if (!measure) {
            return res.status(404).json({ message: 'Measure not found' });
        }

        await measure.destroy();
        res.json({ message: 'Measure successfully deleted' });
    })
);

router.get('/company/:companyId',
    validate([
        param('companyId').isUUID().withMessage('Company ID is invalid')
    ]),
    asyncHandler(async (req, res) => {
        const { companyId } = req.params;

        // Verificar que la compañía existe
        const company = await Company.findByPk(companyId);
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        const measures = await Measure.findAll({
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

        res.json(measures);
    })
);

module.exports = router;
