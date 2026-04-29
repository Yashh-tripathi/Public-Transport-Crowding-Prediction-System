const express = require('express');
const router = express.Router();

const {getCrowdData, addCrowdData, predictCrowd, getPredictions} = require('../controllers/crowd.controller');

router.get("/crowd-data", getCrowdData);
router.post("/add-crowd", addCrowdData);
router.post('/predict', predictCrowd);
router.get('/predictions', getPredictions);


module.exports = router;