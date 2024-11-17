const express = require('express');
const router = express.Router();
const { User, Company } = require('../models');

// Middleware para manejar errores asíncronos
const asyncHandler = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

router.get('/', asyncHandler(async (req, res) => {
    const allUser = await User.findAll({
        include: [{
            model: Company,
            as: 'company',
            attributes: ['company_id', 'name', 'phone_number_owner'] // Selecciona los campos que deseas incluir
        }]
    });
    res.json(allUser);
}));

router.get('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = await User.findByPk(id, {
        include: [{
            model: Company,
            as: 'company',
            attributes: ['company_id', 'name', 'phone_number_owner']
        }]
    });

    if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(user);
}));

router.post('/create', asyncHandler(async (req, res) => {
    const { name, phone_number, company_id } = req.body;

    // Verificar que la compañía existe
    const company = await Company.findByPk(company_id);
    if (!company) {
        return res.status(400).json({ message: 'Compañía no encontrada' });
    }

    const newUser = await User.create({
        name,
        phone_number,
        company_id
    });

    res.status(201).json(newUser);
}));

router.put('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, phone_number, company_id } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Si se está actualizando el company_id, verificar que la nueva compañía exista
    if (company_id) {
        const company = await Company.findByPk(company_id);
        if (!company) {
            return res.status(400).json({ message: 'Compañía no encontrada' });
        }
    }

    await user.update({
        name: name !== undefined ? name : user.name,
        phone_number: phone_number !== undefined ? phone_number : user.phone_number,
        company_id: company_id !== undefined ? company_id : user.company_id
    });

    res.json(user);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    await user.destroy();
    res.json({ message: 'Usuario eliminado exitosamente' });
}));

router.get('/company/:companyId', asyncHandler(async (req, res) => {
    const { companyId } = req.params;

    // Verificar que la compañía existe
    const company = await Company.findByPk(companyId);
    if (!company) {
        return res.status(404).json({ message: 'Compañía no encontrada' });
    }

    const User = await User.findAll({
        where: { company_id: companyId },
        include: [{
            model: Company,
            as: 'company',
            attributes: ['company_id', 'name', 'phone_number']
        }]
    });

    res.json(User);
}));

module.exports = router;
