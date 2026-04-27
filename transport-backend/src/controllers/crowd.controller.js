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


const addCrowdData = async (req,res) => {
    try {
        const {
            route_name,
            time_slot,
            day,
            weather,
            passenger_count
        } = req.body;

        if(!route_name || !time_slot || !day || !weather || !passenger_count){
            return res.status(400).json({ message: 'All feilds are required' });
        }

        const result = await pool.query(
            `INSERT INTO crowd_data (route_name, day, weather, passenger_count, time_slot) VALUES ($1,$3,$4,$5,$2) RETURNING *`,
            [route_name, time_slot, day, weather, passenger_count]
        )

        res.status(201).json({
            message: "Data inserted successfully ✅",
            data: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error inserting data");
    }
}

module.exports = {
    getCrowdData,
    addCrowdData
}