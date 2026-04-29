import React, { useEffect, useState } from 'react'
import API from '../api/baseApi';

function PredictHistory() {
    const [data, setData] = useState([]);

    useEffect(() => {
        API.get('/predictions')
        .then(res => setData(res.data))
        .catch(err => console.error(err.message))
    }, []);

  return (
    <div>
        <h2>Predict History</h2>
        <table>
            <thead>
                <tr>
                    <th>Route</th>
                    <th>Time</th>
                    <th>Day</th>
                    <th>Weather</th>
                    <th>Predicted</th>
                </tr>
            </thead>
            <tbody>
                {data.map(item => (
                    <tr key={item.id}>
                        <td>{item.route_name}</td>
                        <td>{item.time_slot}</td>
                        <td>{item.day}</td>
                        <td>{item.weather}</td>
                        <td>{item.predicted_passengers}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
  )
}

export default PredictHistory