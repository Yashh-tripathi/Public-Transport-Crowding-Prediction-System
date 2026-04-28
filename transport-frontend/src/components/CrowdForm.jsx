import React, { useState } from 'react'
import API from '../api/baseApi';

function CrowdForm({refresh}) {
    const [form, setForm] = useState({
        route_name:"",
        time_slot:"",
        day:"",
        weather:'',
        passenger:''
    });

    const handleChange = (e) => {
        setForm({...form, [e.target.name]: e.target.value});
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        await API.post('/add-crowd', form);
        refresh();
        setForm({
            route_name: "",
            time_slot: "",
            day: "",
            weather: "",
            passenger_count: ""
        });
    }

  return (
    <form onSubmit={handleSubmit}>
    <input name="route_name" placeholder="Route" value={form.route_name} onChange={handleChange} />
    <input name="time_slot" placeholder="Time" value={form.time_slot} onChange={handleChange} />
    <input name="day" placeholder="Day" value={form.day} onChange={handleChange} />
    <input name="weather" placeholder="Weather" value={form.weather} onChange={handleChange} />
    <input name="passenger_count" placeholder="Passengers" value={form.passenger_count} onChange={handleChange} />

    <button type="submit">Add Data</button>
  </form>
  )
}

export default CrowdForm;