import React, { useState } from 'react';
import API from '../api/baseApi';

function CrowdForm({ refresh }) {

  const [form, setForm] = useState({
    route_name: "",
    time_slot: "",
    day: "",
    weather: "",
    passenger_count: ""   // ✅ fixed
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // 🔥 Predict Crowd
  const handlePredict = async () => {
    try {
      const cleanData = {
        route_name: form.route_name,
        time_slot: form.time_slot.toUpperCase(), // ✅ normalize
        day: form.day,
        weather: form.weather
      };

      console.log("SENDING TO BACKEND:", cleanData);

      const res = await API.post("/predict", cleanData);

      alert(`Predicted Crowd: ${res.data.predicted_passengers}`);

    } catch (error) {
      console.error("Prediction Error:", error.response?.data || error.message);
      alert("Prediction failed ❌");
    }
  };

  // 🔥 Add Data
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post('/add-crowd', form);

      refresh();

      setForm({
        route_name: "",
        time_slot: "",
        day: "",
        weather: "",
        passenger_count: ""
      });

    } catch (error) {
      console.error("Insert Error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>

      <input
        name="route_name"
        placeholder="Route"
        value={form.route_name}
        onChange={handleChange}
      />

      <input
        name="time_slot"
        placeholder="Time (e.g. 6PM)"
        value={form.time_slot}
        onChange={handleChange}
      />

      <input
        name="day"
        placeholder="Day"
        value={form.day}
        onChange={handleChange}
      />

      <input
        name="weather"
        placeholder="Weather (clear/rain)"
        value={form.weather}
        onChange={handleChange}
      />

      <input
        name="passenger_count"
        placeholder="Passengers"
        value={form.passenger_count}
        onChange={handleChange}
      />

      <button type="submit">Add Data</button>

      <button type="button" onClick={handlePredict}>
        Predict Crowd
      </button>

    </form>
  );
}

export default CrowdForm;