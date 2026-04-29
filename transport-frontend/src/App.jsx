import { useState } from "react"
import CrowdForm from "./components/CrowdForm"
import CrowdTable from "./components/CrowdTable"
import PredictHistory from "./components/PredictHistory"

const NAV = [
  { id: "log",     label: "Log Data",    icon: "⊕", desc: "Record crowd observations" },
  { id: "data",    label: "Crowd Data",  icon: "⊞", desc: "Browse logged entries" },
  { id: "history", label: "Predictions", icon: "◈", desc: "View prediction history" },
]

export default function App() {
  const [active, setActive]   = useState("log")
  const [refresh, setRefresh] = useState(0)

  const triggerRefresh = () => setRefresh(r => r + 1)

  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* ── Top navbar ── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">

          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 text-white text-base select-none">⬡</span>
            <div className="leading-tight">
              <p className="text-sm font-bold text-slate-900 tracking-tight">CrowdSense</p>
              <p className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">Transit Intelligence</p>
            </div>
          </div>

          {/* Nav tabs */}
          <nav className="flex items-center gap-1">
            {NAV.map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => setActive(id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition
                  ${active === id
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"}`}
              >
                <span className="text-base leading-none">{icon}</span>
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* ── Hero banner (only on log tab) ── */}
      {active === "log" && (
        <div className="bg-white border-b border-slate-100">
          <div className="max-w-5xl mx-auto px-4 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[11px] font-semibold tracking-widest uppercase mb-3">
                ◎ Live System
              </span>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight leading-snug">
                Predict transit crowd<br />before you board.
              </h2>
              <p className="text-slate-400 text-sm mt-2 max-w-sm">
                Log real observations or get an instant ML-powered crowd forecast for any route, time, and weather condition.
              </p>
            </div>

            {/* Quick-jump cards */}
            <div className="flex gap-3">
              {[
                { id: "data",    icon: "⊞", label: "Crowd Data",  color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
                { id: "history", icon: "◈", label: "Predictions", color: "text-violet-600  bg-violet-50  border-violet-200"  },
              ].map(({ id, icon, label, color }) => (
                <button
                  key={id}
                  onClick={() => setActive(id)}
                  className={`flex flex-col items-center justify-center gap-1.5 w-24 h-20 rounded-xl border text-xs font-semibold transition hover:scale-105 active:scale-95 ${color}`}
                >
                  <span className="text-xl leading-none">{icon}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Page title bar for non-log tabs ── */}
      {active !== "log" && (
        <div className="bg-white border-b border-slate-100">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
            <button
              onClick={() => setActive("log")}
              className="text-slate-400 hover:text-slate-600 transition text-sm"
            >
              ← Back
            </button>
            <span className="text-slate-300">|</span>
            <p className="text-sm font-semibold text-slate-700">
              {NAV.find(n => n.id === active)?.label}
            </p>
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <main className="max-w-5xl mx-auto">
        {active === "log"     && <CrowdForm refresh={triggerRefresh} />}
        {active === "data"    && <CrowdTable refresh={refresh} />}
        {active === "history" && <PredictHistory />}
      </main>

      {/* ── Footer ── */}
      <footer className="mt-16 border-t border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-5 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-5 h-5 rounded bg-indigo-600 text-white text-[10px]">⬡</span>
            <span className="font-medium text-slate-500">CrowdSense</span>
            <span>· Transit Intelligence Platform</span>
          </div>
          <span>ML-powered crowd forecasting</span>
        </div>
      </footer>

    </div>
  )
}