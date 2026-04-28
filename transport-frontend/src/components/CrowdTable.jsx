import { useEffect, useState } from "react"
import API from "../api/baseApi"

function CrowdTable() {
    const [data, setData] = useState([]);
    const fetchData = async () => {
        const res = await API.get('/crowd-data');
        console.log("DATA:", res.data); 
        setData(res.data);
    }
    useEffect(() => {
      fetchData()
    }, [])
    
  return (
    <div>
        <h2>Crowd Data:</h2>
        <table border='2' className="flex flex-col  items-center w-200  justify-between">
            <thead>
                <tr>
                    <th>Route</th>
                    <th>Time</th>
                    <th>Day</th>
                    <th>Weather</th>
                    <th>Passengers</th>
                </tr>
            </thead>
            <tbody className="space-x-10 flex flex-col justify-between items-center ">
                {
                    data.map((item) => (
                        <tr key={item.id} className="p-2 flex space-x-4">
                            <td>{item.route_name}</td>
                            <td>{item.time_slot}</td>
                            <td>{item.day}</td>
                            <td>{item.weather}</td>
                            <td>{item.passenger}</td>
                        </tr>
                    ))
                }
            </tbody>
        </table>
    </div>
  )
}

export default CrowdTable