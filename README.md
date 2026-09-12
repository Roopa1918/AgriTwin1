# AgriTwin — Digital Twin for Smart Agriculture 🌾🌱

> **“Simple Farming Decisions from Smart Field Data”**

AgriTwin is a modern, farmer-friendly agricultural Digital Twin platform designed to empower farmers and agronomists with real-time field intelligence, 3D interactive field twins, environmental simulations, water budget calculators, and AI-driven predictive insights.

---

## 🌟 Key Features

1. **Interactive Field Selection & Boundary Drawing**
   - Interactive Leaflet map with satellite and street layers.
   - Dynamic boundary polygon drawing or single-click field placement.
   - Multi-field switcher with instant status previews.

2. **3D Interactive Digital Twin**
   - Built with **Three.js** canvas rendering.
   - Procedural crop growth visualization (Healthy Green, Water Stressed, Dry).
   - Dynamic 4-zone status breakdown (Zone A–D) with live moisture and health indices.
   - Real-time animated sprinkler irrigation particle systems.

3. **Live Weather & Environmental Telemetry**
   - Live meteorological data via Open-Meteo API (ambient temperature, humidity, wind, rainfall, UV index).
   - Dynamic day/night and overcast lighting simulation.

4. **Soil & Irrigation Advisory (Water Need Page)**
   - Daily water budget calculation (Crop Evapotranspiration $ET_c$ & soil moisture balance).
   - Concrete irrigation schedules: Liters required, recommended run-time, and optimal watering hours.
   - One-click Sprinkler Irrigation test trigger.

5. **"What If?" & "What May Happen?" Predictive Simulations**
   - **What If? Scenario Playground**: Simulate heatwaves, severe droughts, heavy rainfall, or skipped irrigations with immediate visual twin feedback.
   - **What May Happen? (7-Day Forecast Twin)**: Day-by-day forecasted soil moisture, stress risk levels, and automated preventative recommendations.

6. **Farmer-Friendly UI & Exportable Field Reports**
   - Plain language recommendations: *"Moisture is low. Turn on Zone B sprinklers for 25 minutes."*
   - Exportable summary reports for agronomists and cooperative managers.
   - Raw sensor telemetry stream table with CSV export.
   - Presentation / Demo control panel with simulated sensor spikes and irrigation overrides.

7. **Cloud Persistence with Firebase**
   - Integrated with Firebase Firestore & Authentication for multi-field persistence and real-time syncing.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, Tailwind-compatible modern CSS design system
- **3D Graphics**: Three.js
- **GIS / Mapping**: Leaflet, React-Leaflet
- **Icons**: Lucide React
- **Live APIs**: Open-Meteo Weather API
- **Backend & Cloud**: Firebase (Firestore, Auth, Analytics)

---

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/Roopa1918/AgriTwin.git
cd AgriTwin
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run development server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 4. Build for Production
```bash
npm run build
```

---

## 👥 Authors & Academic Context

Developed for academic demonstration and next-generation smart farming innovation.
Repository: [https://github.com/Roopa1918/AgriTwin](https://github.com/Roopa1918/AgriTwin)
