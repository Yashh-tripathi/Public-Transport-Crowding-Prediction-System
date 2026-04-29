Readme · MD
Copy

# CrowdSense — Transit Intelligence Platform
 
> ML-powered crowd forecasting for public transport routes. Log real observations, predict passenger load, and visualize crowd hotspots across your transit network.
 
[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.x-38BDF8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=flat-square&logo=express)](https://expressjs.com)
[![Flask](https://img.shields.io/badge/Flask-ML%20Service-000000?style=flat-square&logo=flask)](https://flask.palletsprojects.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=flat-square&logo=postgresql)](https://postgresql.org)
[![License](https://img.shields.io/badge/License-ISC-green?style=flat-square)](LICENSE)
 
---
 
## Table of Contents
 
- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Database Setup](#database-setup)
  - [ML Service Setup](#ml-service-setup)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Seed Data](#seed-data)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [ML Model](#ml-model)
- [Frontend Architecture](#frontend-architecture)
- [Component Reference](#component-reference)
- [Scripts](#scripts)
- [Contributing](#contributing)
- [License](#license)
---
 
## Overview
 
CrowdSense is a three-tier full-stack application that combines a Node.js/Express REST backend, a Python/Flask ML microservice, and a React frontend. Operations teams and commuters can log observed passenger counts, get instant ML-powered crowd forecasts, and explore interactive heatmaps and analytics dashboards — all in one unified interface.
 
---
 
## Architecture
 
```
┌─────────────────────────────────────────────────────────┐
│                   transport-frontend                     │
│              React 19 + Vite 8 + Tailwind 4             │
│   CrowdForm │ CrowdTable │ PredictHistory │ Analysis     │
└──────────────────────┬──────────────────────────────────┘
                       │  HTTP (Axios)
                       ▼
┌─────────────────────────────────────────────────────────┐
│                  transport-backend                       │
│               Express 5 + Node.js                       │
│        crowd.routes.js → crowd.controller.js            │
│                   PostgreSQL (pg)                        │
└──────────┬──────────────────────────┬───────────────────┘
           │  Reads / Writes          │  HTTP (Axios)
           ▼                          ▼
    ┌─────────────┐          ┌─────────────────────┐
    │  PostgreSQL │          │    ml-services       │
    │  Database   │          │  Flask + scikit-learn│
    └─────────────┘          │  pandas + numpy      │
                             └─────────────────────┘
```
 
**Prediction request flow:**
1. User submits route + time + day + weather in `CrowdForm`
2. Frontend POSTs to Express `/predict`
3. Express forwards payload to the Flask ML service
4. Flask runs the trained model, returns `predicted_passengers`
5. Express saves the result to PostgreSQL, responds to frontend
6. Frontend renders crowd level, progress bar, and suggestion card
---
 
## Features
 
| Feature | Description |
|---|---|
| **Crowd Logging** | Record route, time slot, day, weather, and passenger count |
| **ML Prediction** | Instant crowd forecast via Flask microservice + scikit-learn |
| **Data Table** | Sortable, searchable crowd data log with crowd-level badges |
| **Prediction History** | Full prediction log with Low / Medium / High filter pills |
| **Analysis Dashboard** | Bar, Line, and Doughnut charts across routes and weekdays |
| **Interactive Heatmap** | Leaflet.js heatmap with per-route intensity and popup markers |
| **Crowd Classification** | Automatic Low / Medium / High labeling (thresholds: 80, 120) |
| **Seed Script** | `scripts/seed_data.py` to populate the DB for development |
 
---
 
## Tech Stack
 
### Frontend — `transport-frontend`
 
| Package | Version | Purpose |
|---|---|---|
| react | ^19.2.5 | UI framework |
| react-dom | ^19.2.5 | DOM renderer |
| vite | ^8.0.10 | Build tool & dev server |
| @vitejs/plugin-react | ^6.0.1 | React plugin for Vite |
| tailwindcss | ^4.2.4 | Utility-first CSS framework |
| @tailwindcss/vite | ^4.2.4 | Tailwind Vite integration |
| axios | ^1.15.2 | HTTP client |
| chart.js | ^4.5.1 | Chart rendering engine |
| react-chartjs-2 | ^5.3.1 | React wrapper for Chart.js |
| leaflet | ^1.9.4 | Interactive map |
| leaflet.heat | ^0.2.0 | Heatmap overlay for Leaflet |
 
### Backend — `transport-backend`
 
| Package | Version | Purpose |
|---|---|---|
| express | ^5.2.1 | REST API framework |
| pg | ^8.20.0 | PostgreSQL client (node-postgres) |
| axios | ^1.15.2 | Proxy HTTP calls to ML service |
| cors | ^2.8.6 | Cross-origin request handling |
| dotenv | ^17.4.2 | Environment variable loading |
 
### ML Service — `ml-services`
 
| Package | Purpose |
|---|---|
| flask | Lightweight HTTP microservice |
| scikit-learn | ML model — RandomForestRegressor |
| pandas | Feature engineering & data wrangling |
| numpy | Numerical operations |
| psycopg2-binary | PostgreSQL driver for fetching training data |
 
---
 
## Project Structure
 
```
crowdsense/                            # Monorepo root
│
├── .venv/                             # Python virtual environment (git-ignored)
│
├── ml-services/                       # Python Flask ML microservice
│   ├── app.py                         # Flask app — trains model on startup,
│   │                                  # exposes POST /predict
│   └── requirements.txt               # Python dependencies
│
├── scripts/
│   └── seed_data.py                   # Seeds PostgreSQL with sample crowd data
│
├── transport-backend/                 # Node.js / Express REST API
│   ├── src/
│   │   ├── config/                    # Environment validation, DB config
│   │   ├── controllers/
│   │   │   └── crowd.controller.js    # Business logic — CRUD + ML proxy
│   │   ├── db/
│   │   │   └── db.js                  # pg Pool instance & connection setup
│   │   ├── routes/
│   │   │   └── crowd.routes.js        # Route definitions → controller bindings
│   │   └── index.js                   # Express app entry point, middleware
│   ├── .env                           # Backend secrets (git-ignored)
│   ├── .gitignore
│   ├── package.json
│   └── package-lock.json
│
├── transport-frontend/                # React + Vite SPA
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── baseApi.js             # Axios instance — reads VITE_API_BASE_URL
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── AnalysisPage.jsx       # Charts dashboard + Leaflet heatmap
│   │   │   ├── CrowdForm.jsx          # Log data form + crowd predictor
│   │   │   ├── CrowdTable.jsx         # Sortable, searchable data log
│   │   │   └── PredictHistory.jsx     # Prediction history with level filters
│   │   ├── App.jsx                    # Root layout, sticky nav, tab state
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── README.md
│   └── vite.config.js
│
└── README.md                          # ← You are here
```
 
---
 
## Getting Started
 
### Prerequisites
 
| Tool | Version | Install |
|---|---|---|
| Node.js | >= 18.x | [nodejs.org](https://nodejs.org) |
| Python | >= 3.10 | [python.org](https://python.org) |
| PostgreSQL | >= 14.x | [postgresql.org](https://postgresql.org) |
| pip | >= 23.x | bundled with Python |
| Git | any | [git-scm.com](https://git-scm.com) |
 
```bash
# Clone the repository
git clone https://github.com/your-username/crowdsense.git
cd crowdsense
```
 
---
 
### Database Setup
 
```bash
# Open psql and create the database
psql -U postgres
 
CREATE DATABASE crowdsense;
\q
```
 
Create the required tables:
 
```sql
CREATE TABLE crowd_data (
  id               SERIAL PRIMARY KEY,
  route_name       VARCHAR(100) NOT NULL,
  time_slot        VARCHAR(20)  NOT NULL,
  day              VARCHAR(20)  NOT NULL,
  weather          VARCHAR(20)  NOT NULL,
  passenger_count  INTEGER      NOT NULL
);
 
CREATE TABLE predictions (
  id                    SERIAL PRIMARY KEY,
  route_name            VARCHAR(100) NOT NULL,
  time_slot             VARCHAR(20)  NOT NULL,
  day                   VARCHAR(20)  NOT NULL,
  weather               VARCHAR(20)  NOT NULL,
  predicted_passengers  INTEGER      NOT NULL,
  created_at            TIMESTAMP DEFAULT NOW()
);
```
 
---
 
### ML Service Setup
 
```bash
# From the monorepo root
python -m venv .venv
source .venv/bin/activate        # macOS / Linux
.venv\Scripts\activate           # Windows
 
# Install dependencies
pip install -r ml-services/requirements.txt
 
# Start the Flask ML service
python ml-services/app.py
# → http://localhost:5001
```
 
> The ML service **must be running** before the Express backend can serve predictions. On startup it connects to PostgreSQL, fetches all `crowd_data` rows, and trains the model in memory.
 
---
 
### Backend Setup
 
```bash
cd transport-backend
 
npm install
 
# Add your environment variables (see section below)
cp .env.example .env
 
npm start
# → http://localhost:3000
```
 
---
 
### Frontend Setup
 
```bash
cd transport-frontend
 
npm install
 
# Create env file
echo "VITE_API_BASE_URL=http://localhost:3000" > .env.local
 
npm run dev
# → http://localhost:5173
```
 
---
 
### Seed Data
 
If your `crowd_data` table is empty the ML model has nothing to train on. Run the seed script first:
 
```bash
# From the monorepo root, with .venv activated
python scripts/seed_data.py
```
 
Then restart the Flask service so it retrains on the seeded rows.
 
---
 
## Environment Variables
 
### `transport-backend/.env`
 
```env
# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=crowdsense
DB_USER=postgres
DB_PASSWORD=your_password
 
# ML microservice
ML_SERVICE_URL=http://localhost:5001
 
# Express server
PORT=3000
```
 
### `transport-frontend/.env.local`
 
```env
VITE_API_BASE_URL=http://localhost:3000
```
 
### `src/api/baseApi.js`
 
```js
import axios from "axios"
 
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})
 
export default API
```
 
---
 
## API Reference
 
All endpoints are served by **Express** at `http://localhost:3000`.
 
---
 
### `GET /crowd-data`
 
Returns all logged crowd observations ordered by id descending.
 
**Response `200`**
```json
[
  {
    "id": 1,
    "route_name": "101",
    "time_slot": "6PM",
    "day": "Monday",
    "weather": "clear",
    "passenger_count": 95
  }
]
```
 
---
 
### `POST /add-crowd`
 
Log a new crowd observation.
 
**Request Body**
```json
{
  "route_name": "101",
  "time_slot": "6PM",
  "day": "Monday",
  "weather": "clear",
  "passenger_count": 95
}
```
 
**Response `201`**
```json
{ "message": "Data added successfully", "id": 42 }
```
 
---
 
### `POST /predict`
 
Run an ML prediction. Express proxies to Flask, saves the result, and returns it.
 
**Request Body**
```json
{
  "route_name": "101",
  "time_slot": "6PM",
  "day": "Monday",
  "weather": "clear"
}
```
 
**Response `200`**
```json
{ "predicted_passengers": 112 }
```
 
---
 
### `GET /predictions`
 
Returns all saved prediction records.
 
**Response `200`**
```json
[
  {
    "id": 1,
    "route_name": "101",
    "time_slot": "6PM",
    "day": "Monday",
    "weather": "clear",
    "predicted_passengers": 112
  }
]
```
 
---
 
## ML Model
 
The ML microservice lives entirely in `ml-services/app.py`.
 
### Lifecycle
 
```
Flask starts
    └── psycopg2 connects to PostgreSQL
            └── SELECT * FROM crowd_data
                    └── pandas encodes features
                            └── RandomForestRegressor.fit(X, y)
                                    └── model held in memory
                                            └── POST /predict → model.predict()
```
 
### Feature Encoding
 
| Feature | Encoding |
|---|---|
| `route_name` | `LabelEncoder` |
| `time_slot` | `LabelEncoder` |
| `day` | Ordinal — Mon=0, Tue=1 … Sun=6 |
| `weather` | Binary — clear=0, rain=1 |
 
### Crowd Level Thresholds (applied on the frontend)
 
| Level | Passenger Count | UI Color |
|---|---|---|
| 🟢 Low | < 80 | Emerald |
| 🟡 Medium | 80 – 119 | Amber |
| 🔴 High | ≥ 120 | Rose |
 
---
 
## Frontend Architecture
 
### Component Tree
 
```
App.jsx  (sticky nav + tab state + refresh counter)
├── CrowdForm.jsx        tab: "log"       Form to log data or get predictions
├── CrowdTable.jsx       tab: "data"      Sortable / searchable crowd data log
├── PredictHistory.jsx   tab: "history"   Prediction log with crowd-level filters
└── AnalysisPage.jsx     tab: "analysis"  Charts + Leaflet heatmap (4 sub-tabs)
```
 
### Refresh Pattern
 
```
CrowdForm
  └── POST /add-crowd succeeds
        └── calls refresh() prop
              └── App.jsx increments refresh counter (number)
                    └── CrowdTable receives new refresh prop value
                          └── useEffect([refresh]) fires → re-fetches /crowd-data
```
 
### Tab Navigation
 
No React Router — `App.jsx` holds a single `active` string and conditionally renders the matching component. The sticky navbar highlights the active tab. A hero banner shows only on the `"log"` tab; all other tabs show a breadcrumb back arrow.
 
### Heatmap Initialization
 
```
tab switches to "heatmap" && data.length > 0
    └── useEffect fires
          └── setTimeout(100ms)  ← ensures <div> is mounted before Leaflet measures it
                └── L.map(mapRef.current)
                      └── L.tileLayer (OpenStreetMap)
                            └── L.heatLayer(points, gradient)
                                  └── L.circleMarker per unique route
```
 
On cleanup (tab switch / unmount) the map instance is destroyed to prevent the _"Map container is already initialized"_ error.
 
---
 
## Component Reference
 
### `CrowdForm`
 
| Prop | Type | Description |
|---|---|---|
| `refresh` | `() => void` | Called after successful `/add-crowd` to trigger table re-fetch |
 
### `CrowdTable`
 
| Prop | Type | Description |
|---|---|---|
| `refresh` | `number` | Incrementing counter — any change triggers `useEffect` re-fetch |
 
### `PredictHistory`
 
No props. Self-contained. Fetches `/predictions` on mount.
 
### `AnalysisPage`
 
No props. Fetches `/crowd-data` on mount. Leaflet map initializes lazily on Heatmap sub-tab activation.
 
---
 
## Scripts
 
### Frontend
 
```bash
npm run dev        # Vite dev server  →  http://localhost:5173
npm run build      # Production build →  dist/
npm run preview    # Serve dist/ locally
npm run lint       # ESLint
```
 
### Backend
 
```bash
npm start          # node src/index.js  →  http://localhost:3000
```
 
### ML Service
 
```bash
# From monorepo root with .venv activated
python ml-services/app.py    # Flask dev server  →  http://localhost:5001
```
 
### Utilities
 
```bash
# From monorepo root with .venv activated
python scripts/seed_data.py  # Seed PostgreSQL with sample crowd observations
```
 
---
 
## Contributing
 
Contributions are welcome. Please follow these steps:
 
```bash
# 1. Fork the repository and clone your fork
git clone https://github.com/your-username/crowdsense.git
 
# 2. Create a feature branch
git checkout -b feat/your-feature-name
 
# 3. Commit using Conventional Commits
git commit -m "feat: describe your change"
 
# 4. Push to your fork
git push origin feat/your-feature-name
 
# 5. Open a Pull Request against main
```
 
### Commit Convention
 
| Prefix | When to use |
|---|---|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation only |
| `style:` | Formatting, no logic change |
| `refactor:` | Restructure without behaviour change |
| `chore:` | Build config, dependencies, tooling |
 
---
 
## License
 
This project is licensed under the [ISC License](LICENSE).
 
---
 
<div align="center">
  <sub>By Yash Tripathi</sub>
</div>