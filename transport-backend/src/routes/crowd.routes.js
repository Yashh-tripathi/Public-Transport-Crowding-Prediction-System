const express = require('express');
const router = express.Router();

const {getCrowdData, addCrowdData} = require('../controllers/crowd.controller');

router.get("/crowd-data", getCrowdData);
router.post("/add-crowd", addCrowdData);



module.exports = router;