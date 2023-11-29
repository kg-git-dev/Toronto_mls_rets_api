const express = require('express');

const router = express.Router();

const propertiesController = require('../Controllers/ResidentialControllers/Properties')

const propertiesMiddleware = require('../Middleware/PropertiesMiddleware');

//routing property to respective controller
router.get('/Properties/', propertiesMiddleware.handleOptionalParameters, propertiesController.handlePropertyRoute);

module.exports = router;