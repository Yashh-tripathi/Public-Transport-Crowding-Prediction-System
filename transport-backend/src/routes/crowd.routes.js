const express = require('express');
const router = express.Router();

const {getCrowdData} = require('../controllers/crowd.controller');

router.get("/crowd-data", getCrowdData);


module.exports = router;