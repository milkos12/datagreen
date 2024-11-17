const express = require('express');
const router = express.Router();

// Middleware to handle asynchronous errors
const asyncHandler = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

router.post('/', asyncHandler(async (req, res) => {
    const message = req.body;
    console.log('Mensaje recibido:', message);

    res.status(200).send('Evento recibido');
})
);


module.exports = router;
