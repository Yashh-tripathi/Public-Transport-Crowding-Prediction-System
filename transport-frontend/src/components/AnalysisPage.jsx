import { useEffect, useRef, useState } from "react"
import { Bar, Line, Doughnut } from "react-chartjs-2"
// import L from "leaflet"
// import "leaflet/dist/leaflet.css"
// import "leaflet.heat"
import API from "../api/baseApi"
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler
} from "chart.js"

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler
)

const crowdCfg = (v) => {
  if (v < 80)  return { label: "Low",    bar: "#10b981", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", hex: "#10b981" }
  if (v < 120) return { label: "Medium", bar: "#f59e0b", bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   hex: "#f59e0b" }
  return              { label: "High",   bar: "#f43f5e", bg: "bg-rose-50",    text: "text-rose-700",    border: "border-rose-200",    hex: "#f43f5e" }
}

const CHART_OPTS = (yLabel = "Passengers") => ({
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: {
    backgroundColor: "#1e293b", titleColor: "#94a3b8",
    bodyColor: "#f1f5f9", padding: 10, cornerRadius: 8,
    callbacks: { label: ctx => ` ${ctx.parsed.y} pax` }
  }},
  scales: {
    x: { grid: { display: false }, ticks: { color: "#94a3b8", font: { size: 11 } },
      border: { display: false } },
    y: { grid: { color: "#f1f5f9" }, ticks: { color: "#94a3b8", font: { size: 11 } },
      border: { display: false }, title: { display: true, text: yLabel, color: "#94a3b8", font: { size: 11 } } }
  }
})

export default function AnalysisPage() {
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab]         = useState("overview")

  useEffect(() => {
    API.get("/crowd-data")
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const total   = data.length
  const avgPax  = total ? Math.round(data.reduce((s, r) => s + (r.passenger_count || 0), 0) / total) : 0
  const maxPax  = total ? Math.max(...data.map(d => d.passenger_count || 0)) : 0
  const highPct = total ? Math.round((data.filter(d => d.passenger_count >= 120).length / total) * 100) : 0


 
  /* ── route aggregation ── */
  const routeMap = {}
  data.forEach(d => {
    if (!routeMap[d.route_name]) routeMap[d.route_name] = []
    routeMap[d.route_name].push(d.passenger_count || 0)
  })
  const routeLabels = Object.keys(routeMap)
  const routeAvgs   = routeLabels.map(r => Math.round(routeMap[r].reduce((a,b)=>a+b,0)/routeMap[r].length))



  /* ── day aggregation ── */
  const DAY_ORDER = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]
  const dayMap = {}
  data.forEach(d => { if (!dayMap[d.day]) dayMap[d.day] = []; dayMap[d.day].push(d.passenger_count||0) })
  const dayLabels = DAY_ORDER.filter(d => dayMap[d])
  const dayAvgs   = dayLabels.map(d => Math.round(dayMap[d].reduce((a,b)=>a+b,0)/dayMap[d].length))

  const peakRoute = routeLabels[
    routeAvgs.indexOf(Math.max(...routeAvgs))
  ];
  
  const peakDay = dayLabels[
    dayAvgs.indexOf(Math.max(...dayAvgs))
  ];

  const timeMap = {};
data.forEach(d => {
  if (!timeMap[d.time_slot]) timeMap[d.time_slot] = [];
  timeMap[d.time_slot].push(d.passenger_count || 0);
});

const timeLabels = Object.keys(timeMap);

const timeAvg = timeLabels.map(t =>
  Math.round(timeMap[t].reduce((a,b)=>a+b,0)/timeMap[t].length)
);

const peakTime = timeLabels[
  timeAvg.indexOf(Math.max(...timeAvg))
];

const getGlobalSuggestion = () => {
    if (avgPax > 120) return "⚠ System experiencing heavy load";
    if (avgPax > 80) return "⚡ Moderate congestion across routes";
    return "✅ Smooth transport conditions";
  };

  /* ── doughnut crowd distribution ── */
  const low = data.filter(d => d.passenger_count < 80).length
  const med = data.filter(d => d.passenger_count >= 80 && d.passenger_count < 120).length
  const hi  = data.filter(d => d.passenger_count >= 120).length

  const doughnutData = {
    labels: ["Low", "Medium", "High"],
    datasets: [{ data: [low, med, hi],
      backgroundColor: ["#10b981","#f59e0b","#f43f5e"],
      borderWidth: 0, hoverOffset: 6 }]
  }

  const barData = {
    labels: routeLabels,
    datasets: [{
      label: "Avg Passengers",
      data: routeAvgs,
      backgroundColor: routeAvgs.map(v => crowdCfg(v).bar),
      borderRadius: 6, borderSkipped: false,
    }]
  }

  const lineData = {
    labels: dayLabels,
    datasets: [{
      label: "Avg Passengers",
      data: dayAvgs,
      borderColor: "#6366f1",
      backgroundColor: "rgba(99,102,241,0.08)",
      tension: 0.4, fill: true,
      pointBackgroundColor: "#6366f1",
      pointRadius: 5, pointHoverRadius: 7,
    }]
  }

  const TABS = [
    { id: "overview", label: "Overview",  icon: "⊞" },
    { id: "routes",   label: "By Route",  icon: "◎" },
    { id: "trends",   label: "Trends",    icon: "∿" },
    { id: "heatmap",  label: "Heatmap",   icon: "⬡" },
  ]

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-slate-400">
        <span className="w-7 h-7 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin inline-block" />
        <span className="text-sm">Loading analysis…</span>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex items-center justify-center w-7 h-7 rounded-md bg-indigo-600 text-white text-xs">⬡</span>
            <span className="text-[11px] font-semibold tracking-widest text-indigo-600 uppercase">CrowdSense</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Analysis Dashboard</h1>
          <p className="text-sm text-slate-400 mt-0.5">Crowd intelligence across all routes and time slots</p>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Records",   value: total,        sub: "logged entries" },
            { label: "Avg Passengers",  value: avgPax,       sub: "per trip" },
            { label: "Peak Load",       value: maxPax,       sub: "highest recorded" },
            { label: "High Crowd",      value: `${highPct}%`,sub: "of all trips" },
          ].map(({ label, value, sub }) => (
            <div key={label} className="bg-white rounded-xl border border-slate-200 px-4 py-3.5 shadow-sm">
              <p className="text-[11px] font-semibold tracking-widest text-slate-400 uppercase">{label}</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
            </div>
          ))}
        <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-4 rounded-xl border">
                <p className="text-xs text-gray-400">Peak Route</p>
                <h2 className="text-xl font-bold">{peakRoute}</h2>
            </div>

            <div className="bg-white p-4 rounded-xl border">
                <p className="text-xs text-gray-400">Peak Day</p>
                <h2 className="text-xl font-bold">{peakDay}</h2>
            </div>
            <div className="bg-white p-4 rounded-xl border">
                <p className="text-xs text-gray-400">Peak Time</p>
                <h2 className="text-xl font-bold">{peakTime}</h2>
            </div>
        </div>
        </div>
        <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-xl">
  <p className="text-sm font-medium text-indigo-700">
    {getGlobalSuggestion()}
  </p>
</div>

        {/* Tab bar */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm w-fit">
          {TABS.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition
                ${tab === id ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}
            >
              <span className="text-base leading-none">{icon}</span>
              {label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

              {/* Bar chart */}
              <div className="sm:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <p className="text-[11px] font-semibold tracking-widest text-slate-400 uppercase mb-4">Passengers by Route</p>
                <div className="h-56">
                  <Bar data={barData} options={CHART_OPTS()} />
                </div>
              </div>

              {/* Doughnut */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col">
                <p className="text-[11px] font-semibold tracking-widest text-slate-400 uppercase mb-4">Crowd Distribution</p>
                <div className="flex-1 flex items-center justify-center">
                  <div className="h-44 w-44">
                    <Doughnut data={doughnutData} options={{
                      responsive: true, maintainAspectRatio: false, cutout: "72%",
                      plugins: { legend: { position: "bottom", labels: { color: "#94a3b8", font: { size: 11 }, boxWidth: 10, padding: 12 }},
                        tooltip: { backgroundColor: "#1e293b", bodyColor: "#f1f5f9", padding: 8, cornerRadius: 8 }}
                    }} />
                  </div>
                </div>
                <div className="mt-3 space-y-1.5">
                  {[["Low", low, "bg-emerald-400"],["Medium", med, "bg-amber-400"],["High", hi, "bg-rose-400"]].map(([l,v,c]) => (
                    <div key={l} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${c}`} />
                        <span className="text-slate-500">{l}</span>
                      </div>
                      <span className="font-semibold text-slate-700">{total ? Math.round(v/total*100) : 0}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Line chart */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <p className="text-[11px] font-semibold tracking-widest text-slate-400 uppercase mb-4">Weekly Trend · Avg Passengers</p>
              <div className="h-52">
                <Line data={lineData} options={CHART_OPTS()} />
              </div>
            </div>
          </div>
        )}

        {/* ── BY ROUTE ── */}
        {tab === "routes" && (
          <div className="space-y-3">
            {routeLabels.map((route, i) => {
              const avg = routeAvgs[i]
              const cfg = crowdCfg(avg)
              const pct = Math.min(100, Math.round((avg / 150) * 100))
              return (
                <div key={route} className="bg-white rounded-2xl border border-slate-200 shadow-sm px-5 py-4 flex items-center gap-5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-slate-800 truncate">{route}</p>
                      <span className={`ml-3 shrink-0 inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: cfg.bar }} />
                    </div>
                    <div className="flex justify-between mt-1.5 text-xs text-slate-400">
                      <span>{routeMap[route].length} trips recorded</span>
                      <span className="font-medium text-slate-600">{avg} avg pax</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── TRENDS ── */}
        {tab === "trends" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <p className="text-[11px] font-semibold tracking-widest text-slate-400 uppercase mb-4">Day-wise Average Load</p>
              <div className="h-64">
                <Bar data={{
                  labels: dayLabels,
                  datasets: [{
                    data: dayAvgs,
                    backgroundColor: dayAvgs.map(v => crowdCfg(v).bar + "cc"),
                    borderRadius: 6, borderSkipped: false,
                  }]
                }} options={CHART_OPTS()} />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <p className="text-[11px] font-semibold tracking-widest text-slate-400 uppercase mb-4">Passenger Count · All Records</p>
              <div className="h-52">
                <Line data={{
                  labels: data.map((_, i) => `#${i + 1}`),
                  datasets: [{
                    data: data.map(d => d.passenger_count || 0),
                    borderColor: "#6366f1", backgroundColor: "rgba(99,102,241,0.06)",
                    tension: 0.3, fill: true, pointRadius: 2, pointHoverRadius: 5,
                    pointBackgroundColor: "#6366f1",
                  }]
                }} options={CHART_OPTS()} />
              </div>
            </div>
          </div>
        )}

        {/* ── HEATMAP ── */}
        {tab === "heatmap" && (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">

    <p className="text-[11px] font-semibold tracking-widest text-slate-400 uppercase mb-4">
      Crowd Heatmap · Route vs Time
    </p>

    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="text-left text-slate-500">
            <th className="p-2">Route</th>
            {["8AM","9AM","6PM","7PM"].map(time => (
              <th key={time} className="p-2">{time}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {routeLabels.map(route => (
            <tr key={route}>
              <td className="p-2 font-semibold text-slate-700">{route}</td>

              {["8AM","9AM","6PM","7PM"].map(time => {
                const record = data.find(
                  d => d.route_name === route && d.time_slot === time
                )

                const value = record?.passenger_count || 0
                const cfg = crowdCfg(value)

                return (
                    <td key={time} className="p-2">
                    <div
                      className="w-full h-8 rounded-md flex items-center justify-center text-xs font-semibold"
                      style={{
                        backgroundColor: `${cfg.hex}22`,
                        border: `1px solid ${cfg.hex}55`
                      }}
                    >
                      {value || "-"}
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Legend */}
    <div className="flex gap-4 mt-4 text-xs text-slate-500">
      <span className="flex items-center gap-1">
        <span className="w-3 h-3 bg-emerald-400 rounded-full"></span> Low
      </span>
      <span className="flex items-center gap-1">
        <span className="w-3 h-3 bg-amber-400 rounded-full"></span> Medium
      </span>
      <span className="flex items-center gap-1">
        <span className="w-3 h-3 bg-rose-400 rounded-full"></span> High
      </span>
    </div>

  </div>
)}
      </div>
    </div>
  )
}