const express = require('express');
const router = express.Router();

const {getCrowdData, addCrowdData, predictCrowd} = require('../controllers/crowd.controller');

router.get("/crowd-data", getCrowdData);
router.post("/add-crowd", addCrowdData);
router.post('/predict', predictCrowd);


module.exports = router;