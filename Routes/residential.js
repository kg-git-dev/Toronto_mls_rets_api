const express = require('express');

const router = express.Router();

const propertiesController = require('../Controllers/Residential')

const propertiesMiddleware = require('../Middleware/Residential');

//routing property to respective controller
router.get('/Properties/', propertiesMiddleware.handleOptionalParameters, propertiesController.controllers.Properties);

module.exports = router;