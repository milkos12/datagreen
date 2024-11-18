const errorHandler = (err, req, res, next) => {
    res.status(500).json({
        message: 'Error in the server',
        error: err.message
    });
};

module.exports = errorHandler;