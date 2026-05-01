import React, { useState } from 'react';
import API from '../api/baseApi';

const CROWD_CONFIG = {
  low:    { label: 'Low',    threshold: 80,  bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', bar: 'bg-emerald-500', icon: '✦' },
  medium: { label: 'Medium', threshold: 120, bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   bar: 'bg-amber-500',   icon: '◈' },
  high:   { label: 'High',   bg: 'bg-rose-50',   text: 'text-rose-700',   border: 'border-rose-200',   bar: 'bg-rose-500',   icon: '▲' },
};

const getCrowdConfig = (value) => {
  if (value < 80)  return { ...CROWD_CONFIG.low,    pct: Math.round((value / 80) * 40) };
  if (value < 120) return { ...CROWD_CONFIG.medium, pct: Math.round(40 + ((value - 80) / 40) * 30) };
  return             { ...CROWD_CONFIG.high,         pct: Math.min(100, Math.round(70 + ((value - 120) / 60) * 30)) };
};

const getSuggestion = (value) => {
  if (value > 120) return { msg: 'High congestion expected. Consider rescheduling or an alternate route.', icon: '⚠' };
  if (value > 80)  return { msg: 'Moderate crowd anticipated. Allow extra boarding time.', icon: '◎' };
  return                  { msg: 'Comfortable travel conditions. Great time to board.', icon: '✓' };
};

const inputClass =
  'w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 hover:border-slate-300';

export default function CrowdForm({ refresh }) {
  const [mode, setMode] = useState("predict");
  const [showLogin, setShowLogin] = useState(false);
  const [adminAuth, setAdminAuth] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading]       = useState({ predict: false, submit: false });
  const [submitted, setSubmitted]   = useState(false);
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
    pin: ""
  });
  
  const [loginError, setLoginError] = useState("");

  const [form, setForm] = useState({
    route_name: '', time_slot: '', day: '', weather: '', passenger_count: '',
  });

  const handleLogMode = () => {
    setShowLogin(true);
  };
  const handleLogin = async () => {
    try {
      const res = await API.post("/admin-login", loginData);
  
      if (res.data.success) {
        setAdminAuth(true);
        setMode("log");
        setShowLogin(false);
        setLoginError("");
      }
    } catch (err) {
      setLoginError("Invalid credentials ❌");
    }
  };
  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handlePredict = async () => {
    setLoading((l) => ({ ...l, predict: true }));
    try {
      const res = await API.post('/predict', {
        route_name: form.route_name,
        time_slot:  form.time_slot.toUpperCase(),
        day:        form.day,
        weather:    form.weather,
      });
      setPrediction(res.data.predicted_passengers);
    } catch (err) {
      console.error('Prediction Error:', err.response?.data || err.message);
    } finally {
      setLoading((l) => ({ ...l, predict: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading((l) => ({ ...l, submit: true }));
    try {
      await API.post('/add-crowd', form, {
        headers: {
            Authorization: "admin"
          }
      });
      refresh();
      setForm({ route_name: '', time_slot: '', day: '', weather: '', passenger_count: '' });
      setPrediction(null);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      console.error('Insert Error:', err);
    } finally {
      setLoading((l) => ({ ...l, submit: false }));
    }
  };

  const crowd      = prediction !== null ? getCrowdConfig(prediction) : null;
  const suggestion = prediction !== null ? getSuggestion(prediction) : null;
  const isReady    = form.route_name && form.time_slot && form.day && form.weather;

  return (
    <div className="min-h-screen bg-slate-50 flex items-start justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-5">

        {/* ── Header ── */}
        <div className="mb-2">
          <div className="flex items-center gap-2.5 mb-1">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 text-white text-base">⬡</span>
            <span className="text-xs font-semibold tracking-widest text-indigo-600 uppercase">CrowdSense</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Crowd Predictor</h1>
          <p className="text-sm text-slate-500 mt-0.5">Forecast passenger load for any route & time slot</p>
        </div>

        <div className="flex gap-2 mb-4">
            <button
                onClick={() => setMode("predict")}
                className={mode === "predict" ? "bg-indigo-600 text-white px-3 py-1 rounded" : "px-3 py-1"}
            >
                Predict
            </button>

            <button
                onClick={handleLogMode}
                className={mode === "log" ? "bg-indigo-600 text-white px-3 py-1 rounded" : "px-3 py-1"}
            >
                Log Data
            </button>
        </div>

        {/* ── Form card ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

          {/* Section: Route details */}
          <div className="px-6 pt-6 pb-5 border-b border-slate-100">
            <p className="text-[11px] font-semibold tracking-widest text-slate-400 uppercase mb-4">Route Details</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Route name</label>
                <input
                  name="route_name"
                  placeholder="e.g. Downtown Express"
                  value={form.route_name}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Time slot</label>
                <input
                  name="time_slot"
                  placeholder="e.g. 6PM"
                  value={form.time_slot}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Day</label>
                <select name="day" value={form.day} onChange={handleChange} className={inputClass}>
                  <option value="">Select day</option>
                  {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Weather condition</label>
                <div className="grid grid-cols-2 gap-2">
                  {['clear','rain'].map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, weather: w }))}
                      className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg border text-sm font-medium transition
                        ${form.weather === w
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}
                    >
                      <span className="text-base">{w === 'clear' ? '☀' : '🌧'}</span>
                      {w.charAt(0).toUpperCase() + w.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section: Passenger count */}
          {mode === 'log' && (
            <div className="px-6 py-5 border-b border-slate-100">
            <p className="text-[11px] font-semibold tracking-widest text-slate-400 uppercase mb-4">Observed Data (optional)</p>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Passenger count</label>
              <input
                name="passenger_count"
                type="number"
                placeholder="Actual observed count"
                value={form.passenger_count}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            
          </div>)}

          {/* Actions */}
          <div className="px-6 py-4 bg-slate-50 flex items-center gap-3">
            {mode === 'predict' && (<button
              type="button"
              onClick={handlePredict}
              disabled={!isReady || loading.predict}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading.predict
                ? <><span className="inline-block w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Analyzing…</>
                : '⬡ Predict Crowd'}
            </button>)}
            {mode === 'log' && (<button
              onClick={handleSubmit}
              disabled={!isReady || loading.submit}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading.submit
                ? <><span className="inline-block w-3.5 h-3.5 border-2 border-slate-400/40 border-t-slate-600 rounded-full animate-spin" /> Saving…</>
                : submitted ? '✓ Saved' : '+ Log Data'}
            </button>)}
          </div>
        </div>

        {/* ── Prediction result card ── */}
        {crowd && (
          <div className={`rounded-2xl border ${crowd.border} ${crowd.bg} overflow-hidden`}>
            <div className="px-6 pt-5 pb-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[11px] font-semibold tracking-widest text-slate-400 uppercase mb-1">Predicted Load</p>
                  <p className="text-4xl font-bold text-slate-900 tracking-tight">
                    {prediction}
                    <span className="text-base font-medium text-slate-400 ml-1">pax</span>
                  </p>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${crowd.bg} ${crowd.text} border ${crowd.border}`}>
                  {crowd.icon} {crowd.label} Crowd
                </span>
              </div>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex justify-between text-[11px] text-slate-400 mb-1.5">
                  <span>0</span><span>Capacity index</span><span>150+</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-700 ${crowd.bar}`}
                    style={{ width: `${crowd.pct}%` }}
                  />
                </div>
              </div>

              {/* Suggestion */}
              <div className={`flex items-start gap-3 rounded-xl border ${crowd.border} bg-white/60 px-4 py-3`}>
                <span className={`text-lg leading-none mt-0.5 ${crowd.text}`}>{suggestion.icon}</span>
                <p className={`text-sm font-medium ${crowd.text}`}>{suggestion.msg}</p>
              </div>
            </div>

            {/* Meta row */}
            <div className="px-6 py-3 border-t border-current/10 bg-black/2 flex gap-4 text-xs text-slate-500">
              <span>Route: <strong className="text-slate-700">{form.route_name}</strong></span>
              <span>·</span>
              <span>{form.day} · {form.time_slot.toUpperCase()}</span>
              <span>·</span>
              <span>{form.weather}</span>
            </div>
          </div>
        )}
      </div>
      {showLogin && (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">

    <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">

      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-600 text-white">⬡</span>
          <span className="text-xs font-semibold tracking-widest text-indigo-600 uppercase">
            CrowdSense
          </span>
        </div>
        <h2 className="text-xl font-bold text-slate-900">Admin Access</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Enter credentials to log crowd data
        </p>
      </div>

      {/* Form */}
      <div className="px-6 py-5 space-y-4">

        {/* Username */}
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">
            Username
          </label>
          <input
            type="text"
            placeholder="Enter username"
            onChange={(e) =>
              setLoginData({ ...loginData, username: e.target.value })
            }
            className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none"
          />
        </div>

        {/* Password */}
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">
            Password
          </label>
          <input
            type="password"
            placeholder="Enter password"
            onChange={(e) =>
              setLoginData({ ...loginData, password: e.target.value })
            }
            className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none"
          />
        </div>

        {/* PIN */}
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">
            Security PIN
          </label>
          <input
            type="password"
            placeholder="4-digit PIN"
            onChange={(e) =>
              setLoginData({ ...loginData, pin: e.target.value })
            }
            className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none"
          />
        </div>

        {/* Error */}
        {loginError && (
          <p className="text-sm text-red-500 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
            {loginError}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="px-6 py-4 bg-slate-50 flex gap-3">

        <button
          onClick={handleLogin}
          className="flex-1 rounded-lg bg-indigo-600 text-white text-sm font-semibold py-2.5 hover:bg-indigo-700 transition active:scale-[0.98]"
        >
          🔐 Login
        </button>

        <button
          onClick={() => {
            setShowLogin(false);
            setMode("predict");
          }}
          className="flex-1 rounded-lg border border-slate-300 text-slate-700 text-sm font-semibold py-2.5 hover:bg-slate-100 transition active:scale-[0.98]"
        >
          Back
        </button>

      </div>
    </div>
  </div>
)}
    </div>
  );
}