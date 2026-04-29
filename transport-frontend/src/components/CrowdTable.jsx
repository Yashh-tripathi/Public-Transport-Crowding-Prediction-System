import { useEffect, useState } from "react"
import API from "../api/baseApi"

const WEATHER_ICON = { clear: "☀", rain: "🌧", cloudy: "☁", default: "◎" }
const DAY_SHORT = { Monday:"Mon", Tuesday:"Tue", Wednesday:"Wed", Thursday:"Thu", Friday:"Fri", Saturday:"Sat", Sunday:"Sun" }

const passengerConfig = (count) => {
  if (count < 80)  return { label: "Low",    bar: "bg-emerald-400", text: "text-emerald-700", bg: "bg-emerald-50",  pct: Math.round((count/80)*40) }
  if (count < 120) return { label: "Medium", bar: "bg-amber-400",   text: "text-amber-700",   bg: "bg-amber-50",   pct: Math.round(40+((count-80)/40)*30) }
  return                   { label: "High",   bar: "bg-rose-400",    text: "text-rose-700",    bg: "bg-rose-50",    pct: Math.min(100, Math.round(70+((count-120)/60)*30)) }
}

function CrowdTable({ refresh }) {
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort]       = useState({ key: "id", dir: "desc" })
  const [search, setSearch]   = useState("")

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await API.get("/crowd-data")
      setData(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [refresh])

  const toggleSort = (key) =>
    setSort((s) => ({ key, dir: s.key === key && s.dir === "asc" ? "desc" : "asc" }))

  const sorted = [...data]
    .filter((r) =>
      !search ||
      r.route_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.day?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const av = a[sort.key], bv = b[sort.key]
      if (av == null) return 1
      if (bv == null) return -1
      return sort.dir === "asc"
        ? typeof av === "number" ? av - bv : String(av).localeCompare(String(bv))
        : typeof bv === "number" ? bv - av : String(bv).localeCompare(String(av))
    })

  const SortIcon = ({ k }) => (
    <span className="ml-1 text-[10px] opacity-40">
      {sort.key === k ? (sort.dir === "asc" ? "▲" : "▼") : "⇅"}
    </span>
  )

  const cols = [
    { key: "route_name",      label: "Route" },
    { key: "time_slot",       label: "Time" },
    { key: "day",             label: "Day" },
    { key: "weather",         label: "Weather" },
    { key: "passenger_count", label: "Passengers" },
  ]

  const avgPax = data.length
    ? Math.round(data.reduce((s, r) => s + (r.passenger_count || 0), 0) / data.length)
    : 0

  const highCount = data.filter((r) => r.passenger_count >= 120).length

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex items-center justify-center w-7 h-7 rounded-md bg-indigo-600 text-white text-xs">⬡</span>
              <span className="text-[11px] font-semibold tracking-widest text-indigo-600 uppercase">CrowdSense</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Crowd Data Log</h1>
            <p className="text-sm text-slate-400 mt-0.5">{data.length} records collected</p>
          </div>
          <button
            onClick={fetchData}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50 transition active:scale-95"
          >
            ↻ Refresh
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Records",    value: data.length,   sub: "entries logged" },
            { label: "Avg Passengers",   value: avgPax,        sub: "per trip" },
            { label: "High Crowd Trips", value: highCount,     sub: "≥ 120 passengers" },
          ].map(({ label, value, sub }) => (
            <div key={label} className="bg-white rounded-xl border border-slate-200 px-4 py-3.5 shadow-sm">
              <p className="text-[11px] font-semibold tracking-widest text-slate-400 uppercase">{label}</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        {/* Table card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

          {/* Toolbar */}
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">⌕</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search route or day…"
                className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition"
              />
            </div>
            <span className="ml-auto text-xs text-slate-400">{sorted.length} results</span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {cols.map(({ key, label }) => (
                    <th
                      key={key}
                      onClick={() => toggleSort(key)}
                      className="px-5 py-3 text-left text-[11px] font-semibold tracking-widest text-slate-400 uppercase cursor-pointer select-none hover:text-slate-600 transition whitespace-nowrap"
                    >
                      {label}<SortIcon k={key} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <span className="inline-block w-5 h-5 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
                        <span className="text-xs">Loading data…</span>
                      </div>
                    </td>
                  </tr>
                ) : sorted.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-slate-400 text-sm">
                      No records found
                    </td>
                  </tr>
                ) : (
                  sorted.map((item) => {
                    const cfg = passengerConfig(item.passenger_count || 0)
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors group">

                        {/* Route */}
                        <td className="px-5 py-3.5">
                          <span className="font-semibold text-slate-800">{item.route_name}</span>
                        </td>

                        {/* Time */}
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-semibold tracking-wide">
                            ◷ {item.time_slot?.toUpperCase()}
                          </span>
                        </td>

                        {/* Day */}
                        <td className="px-5 py-3.5">
                          <span className="text-slate-600 font-medium">
                            {DAY_SHORT[item.day] ?? item.day}
                          </span>
                        </td>

                        {/* Weather */}
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-1.5 text-slate-600 text-xs font-medium">
                            <span>{WEATHER_ICON[item.weather?.toLowerCase()] ?? WEATHER_ICON.default}</span>
                            <span className="capitalize">{item.weather}</span>
                          </span>
                        </td>

                        {/* Passengers */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-20 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${cfg.bar}`}
                                style={{ width: `${cfg.pct}%` }}
                              />
                            </div>
                            <span className="font-semibold text-slate-800 tabular-nums w-8">{item.passenger_count}</span>
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${cfg.bg} ${cfg.text}`}>
                              {cfg.label}
                            </span>
                          </div>
                        </td>

                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {!loading && sorted.length > 0 && (
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-400">
              <span>Showing {sorted.length} of {data.length} records</span>
              <span>Sorted by <strong className="text-slate-600">{cols.find(c => c.key === sort.key)?.label}</strong> · {sort.dir === "asc" ? "A → Z" : "Z → A"}</span>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default CrowdTable