const pool = require('../db/db');

const getCrowdData  = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM crowd_data');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching the data');
    }
}

module.exports = {
    getCrowdData
}