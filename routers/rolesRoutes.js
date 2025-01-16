const express = require('express');
const router = express.Router();
const { Roles, Company, PermittedProcesses } = require('../models');
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
    const allRoles = await Roles.findAll({
        include: [
            {
                model: Company,
                as: 'company',
                attributes: ['company_id', 'name']
            },
            {
                model: PermittedProcesses,
                as: 'permittedProcesses',
                attributes: ['process_id', 'name']
            }
        ]
    });
    res.json(allRoles);
}));

router.get('/:id',
    validate([
        param('id').isUUID().withMessage('Role ID is invalid')
    ]),
    asyncHandler(async (req, res) => {
        const { id } = req.params;
        const role = await Roles.findByPk(id, {
            include: [
                {
                    model: Company,
                    as: 'company',
                    attributes: ['company_id', 'name']
                },
                {
                    model: PermittedProcesses,
                    as: 'permittedProcesses',
                    attributes: ['process_id', 'name']
                }
            ]
        });

        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }

        res.json(role);
    })
);

router.post('/create',
    validate([
        body('name').notEmpty().withMessage('Role name is required'),
        body('company_id').isUUID().withMessage('Valid Company ID is required'),
        body('permitted_processes').optional().isArray().withMessage('Permitted processes should be an array of UUIDs')
    ]),
    asyncHandler(async (req, res) => {
        const { name, company_id, permitted_processes } = req.body;

        // Verificar que la compañía existe
        const company = await Company.findByPk(company_id);
        if (!company) {
            return res.status(400).json({ message: 'Company not found' });
        }

        // Crear el rol
        const newRole = await Roles.create({
            name,
            company_id,
            permitted_processes
        });

        if (permitted_processes && permitted_processes.length > 0) {
            await newRole.setPermittedProcesses(permitted_processes);
        }

        res.status(201).json(newRole);
    })
);

router.put('/:id',
    validate([
        param('id').isUUID().withMessage('Role ID is invalid'),
        body('name').optional().notEmpty().withMessage('Role name cannot be empty'),
        body('company_id').optional().isUUID().withMessage('Valid Company ID is required'),
        body('permitted_processes').optional().isArray().withMessage('Permitted processes should be an array of UUIDs')
    ]),
    asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { name, company_id, permitted_processes } = req.body;

        const role = await Roles.findByPk(id);
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }

        // Si se está actualizando la compañía, verificar que exista
        if (company_id) {
            const company = await Company.findByPk(company_id);
            if (!company) {
                return res.status(400).json({ message: 'Company not found' });
            }
            role.company_id = company_id;
        }

        role.name = name !== undefined ? name : role.name;

        if (permitted_processes) {
            await role.setPermittedProcesses(permitted_processes);
        }

        await role.save();

        res.json(role);
    })
);

router.delete('/:id',
    validate([
        param('id').isUUID().withMessage('Role ID is invalid')
    ]),
    asyncHandler(async (req, res) => {
        const { id } = req.params;
        const role = await Roles.findByPk(id);

        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }

        await role.destroy();
        res.json({ message: 'Role successfully deleted' });
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

        const roles = await Roles.findAll({
            where: { company_id: companyId },
            include: [
                {
                    model: Company,
                    as: 'company',
                    attributes: ['company_id', 'name']
                },
                {
                    model: PermittedProcesses,
                    as: 'permittedProcesses',
                    attributes: ['process_id', 'name']
                }
            ]
        });

        res.json(roles);
    })
);

module.exports = router;
