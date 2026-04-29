const express = require('express');
const router = express.Router();

const {getCrowdData, addCrowdData, predictCrowd, getPredictions} = require('../controllers/crowd.controller');

router.get("/crowd-data", getCrowdData);
router.post("/add-crowd", addCrowdData);
router.post('/predict', predictCrowd);
router.get('/predictions', getPredictions);
router.post("/admin-login", (req, res) => {
    const { username, password, pin } = req.body;
  
    const ADMIN = {
      username: "Yash",
      password: "XYZ",
      pin: "1234"
    };
  
    if (
      username?.trim() === ADMIN.username &&
      password?.trim() === ADMIN.password &&
      pin?.trim() === ADMIN.pin
    ) {
      return res.json({ success: true });
    }
  
    return res.status(401).json({
      success: false,
      message: "Invalid credentials"
    });
  });

module.exports = router;