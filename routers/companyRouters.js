const express = require('express');
const router = express.Router();
const { Company, User, Flow } = require('../models');

// Middleware para manejar errores asíncronos
const asyncHandler = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
router.get('/', asyncHandler(async (req, res) => {
    const allCompanies = await Company.findAll({
        include: [{
            model: User,
            as: 'users',
            attributes: ['user_id', 'name', 'phone_number'] // Selecciona los campos que deseas incluir
        },
        {
            model: Flow,
            as: 'flows',
            attributes: ['flow_id', 'name'] // Selecciona los campos que deseas incluir
        }]
    });
    res.json(allCompanies);
}));

router.get('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const company = await Company.findByPk(id, {
        include: [{
            model: User,
            as: 'users',
            attributes: ['user_id', 'name', 'phone_number']
        },
        {
            model: Flow,
            as: 'flows',
            attributes: ['flow_id', 'name'] // Selecciona los campos que deseas incluir
        }]
    });

    if (!company) {
        return res.status(404).json({ message: 'Compañía no encontrada' });
    }

    res.json(company);
}));

router.post('/create', asyncHandler(async (req, res) => {
    const { name, phone_number_owner } = req.body;

    // Validar los campos necesarios
    if (!name || !phone_number_owner) {
        return res.status(400).json({ message: 'Nombre y número de teléfono del propietario son obligatorios' });
    }

    // Crear la compañía
    const newCompany = await Company.create({
        name,
        phone_number_owner
    });

    res.status(201).json(newCompany);
}));

router.put('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, phone_number_owner } = req.body;

    const company = await Company.findByPk(id);
    if (!company) {
        return res.status(404).json({ message: 'Compañía no encontrada' });
    }

    // Actualizar los campos si se proporcionan
    company.name = name !== undefined ? name : company.name;
    company.phone_number_owner = phone_number_owner !== undefined ? phone_number_owner : company.phone_number_owner;

    await company.save();

    res.json(company);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const company = await Company.findByPk(id);

    if (!company) {
        return res.status(404).json({ message: 'Compañía no encontrada' });
    }

    await company.destroy();
    res.json({ message: 'Compañía eliminada exitosamente' });
}));

router.get('/:companyId/users', asyncHandler(async (req, res) => {
    const { companyId } = req.params;

    // Verificar que la compañía existe
    const company = await Company.findByPk(companyId);
    if (!company) {
        return res.status(404).json({ message: 'Compañía no encontrada' });
    }

    const users = await User.findAll({
        where: { company_id: companyId },
        include: [{
            model: Company,
            as: 'company',
            attributes: ['company_id', 'name', 'phone_number_owner']
        }]
    });

    res.json(users);
}));

module.exports = router;
