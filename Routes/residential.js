const express = require('express');

const router = express.Router();

//importing residential controllers
const residentialControllers = require('../Controllers/ResidentialControllers/residentialControllers')

//routing property to respective controller
router.get('/Property/', residentialControllers.controllers.Property);

module.exports = router;