# WattWise — Smart Electricity Consumption & Carbon Footprint Management System

[![Firebase](https://img.shields.io/badge/Backend-Firebase-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![React](https://img.shields.io/badge/Frontend-React_18_%2B_Vite-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Design-Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-Vitest_Passing-16845B?logo=vitest&logoColor=white)](https://vitest.dev/)

**WattWise** is a software-based household energy management SaaS platform that enables households to track electricity consumption, predict monthly power bills via progressive slab tariffs, identify energy-draining appliances, monitor electricity-related carbon emissions (kg CO₂e), and receive actionable energy-saving recommendations with an interactive savings simulator.

---

## 🌟 Key Modules & Features

1. **Authentication (Google Firebase Auth)**:
   - Email/password user registration, login, logout, and password recovery.
   - Authentication session persistence.
   - Automatic user profile document creation in Cloud Firestore.
   - Route protection for all analytical pages.

2. **Main Dashboard**:
   - 4 live summary cards: Monthly Electricity Consumption (kWh), Estimated Bill (₹), Carbon Footprint (kg CO₂e), and Budget Utilization (%).
   - Comparison deltas against previous saved months (percentage and absolute differences).
   - Recharts visual data visualizations: Monthly Consumption Trend (Line Chart), Appliance Share (Donut Chart), and Monthly Cost vs Budget (Bar Chart).
   - Real-time Highest Energy Consumer spotlight and data-driven insight.
   - Empty state guidance with an "Add Your First Appliance" prompt.

3. **Appliance Management**:
   - Add, edit, delete, search, and category-filter household electrical loads.
   - Calibrated presets (Ceiling Fan 75W, LED Bulb 9W, Refrigerator 200W, Inverter AC 1500W, TV 100W, Laptop 65W, Washing Machine 500W, Electric Iron 1000W, Water Pump 750W, Geyser 2000W, etc.).
   - Average power adjustments / duty cycle slider (e.g. 60% cyclic compressor load for refrigerators or 80% inverter modulation).
   - Input validation using Zod and React Hook Form.

4. **Electricity Bill Predictor**:
   - Mathematical formula: `(Rated Power (W) × Quantity × Daily Hours × Usage Days / 1000) × Duty Cycle`.
   - Progressive slab tariff engine with customizable tiers (e.g. 0-100 units @ ₹2.50, 101-200 @ ₹4.00, 201-400 @ ₹5.50, >400 @ ₹7.00).
   - Itemized bill breakdown (Energy charges, fixed demand charge, statutory taxes/surcharges, and government credits/subsidies).
   - "Save Monthly Record" action that commits calculations and appliance snapshots to Firestore.
   - Prominent estimation disclaimer banner.

5. **Appliance-wise Consumption Analysis**:
   - Contribution donut chart and horizontal consumption bar charts.
   - Functional category distribution chart (Cooling, Lighting, Kitchen, Entertainment, Washing & Cleaning, Heating, Other).
   - Complete ranking table with sorting (kWh, share %, cost, carbon) and inspection modal.

6. **Carbon Footprint Tracker**:
   - Formula: `Monthly Consumption (kWh) × Grid Emissions Factor (kg CO₂e/kWh)`.
   - Built-in documented grid emission factors (e.g. Central Electricity Authority of India CEA Baseline Database v19 @ 0.716 kg CO₂e/kWh, US EPA eGRID, UK DESNZ/DEFRA, EU EEA, and Global IEA).
   - Historical emissions trend line chart and per-appliance carbon bar chart.
   - Real-world environmental equivalencies (mature trees needed annually to sequester emissions, passenger vehicle distance equivalent in km).
   - Educational guide explaining grid thermal generation and scope boundaries.

7. **Monthly History & Period Comparisons**:
   - View, search, sort, and delete saved calculation snapshots with confirmation.
   - Side-by-side comparison between any two saved months showing exact unit, cost, and emissions differences with percentage badges.
   - Detailed inspection modal displaying historical appliance snapshots and tariff assumptions at time of saving.

8. **Energy Saving Recommendations & Interactive Simulator**:
   - Rule-based analysis flagging high AC hours, inefficient lighting (>20W bulbs), long-running ceiling fans, geyser standby losses, and vampire standby loads.
   - Potential monthly monetary, kWh, and carbon savings computed per tip.
   - Interactive Savings Simulator: temporarily slide daily operating hours to model immediate savings without altering the underlying profile until confirmed.

9. **Electricity Budget Tracker**:
   - Set monthly spending ceilings in ₹.
   - Configurable warning thresholds: Normal (<70%), Approaching (70–90%), Near Limit (90–100%), and Exceeded (>100%).
   - Visual progress bar and historical spending vs budget reference chart.

10. **Profile & Settings**:
    - Household demographics (type, occupants, location, provider, category, cycle).
    - Tariff structure configuration modal.
    - Session management and account deletion with confirmation.

---

## 🎨 Design System & Theme

- **Visual Theme**: Professional, clean SaaS white-and-green aesthetic.
- **Main Background**: `#F7FAF7`
- **Card Background**: `#FFFFFF`
- **Primary Green**: `#16845B`
- **Dark Green**: `#105B40`
- **Secondary Green**: `#38A169`
- **Light Green**: `#E8F5EC`
- **Pale Green**: `#F0F8F2`
- **Primary Text**: `#172B22`
- **Secondary Text**: `#64746B`
- **Borders**: `#E1EAE3`
- **Warning**: `#E8A23A` | **Error**: `#DC5555`
- **Typography**: Plus Jakarta Sans & Inter font families.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, React Router DOM, Lucide React, Recharts.
- **Form & Validation**: React Hook Form, Zod.
- **Notifications**: Sonner.
- **Backend & Database**: Google Firebase JavaScript SDK v11 (Authentication + Cloud Firestore + Security Rules).
- **Unit Testing**: Vitest (all 10 automated test cases passing).

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js v18+ (tested on Node v20/v26)
- npm v9+

### 1. Clone the repository and install dependencies
```bash
git clone https://github.com/your-username/WattWise.git
cd WattWise
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your Firebase project credentials (see Firebase Setup below):
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```
*(Note: If you run WattWise without credentials in `.env`, the application automatically activates a zero-crash Local Preview Mode populated with realistic initial household data, enabling complete local testing out of the box).*

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Run the Automated Test Suite
```bash
npm test
```
Runs 10 Vitest calculation tests verifying:
- Test 1: 1 appliance, 100 W, 5 hours/day, 30 days = **15 kWh**
- Test 2: 2 appliances, 100 W each, 5 hours/day, 30 days = **30 kWh**
- Test 3: Three 75 W fans, 10 hours/day, 30 days = **67.5 kWh**
- Test 4: 150 kWh × 0.5 kg CO₂e/kWh = **75 kg CO₂e**
- Progressive multi-tier slab tariff calculations (Tier 1, Tier 2, Tier 3, Unbounded Tier 4)
- Surcharge percentages & government credits
- Duty-cycle power adjustments for refrigerators and inverter appliances.

---

## ☁️ Google Firebase Setup Guide

### 1. Create a Firebase Project
1. Visit the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project**, name it `wattwise`, and complete project creation.
3. In the Project Overview, click the **Web icon** (`</>`) to register a Web App.
4. Copy the generated `firebaseConfig` keys into your `.env` file.

### 2. Enable Firebase Authentication
1. In the Firebase console sidebar, navigate to **Build > Authentication**.
2. Click **Get Started**.
3. Under the **Sign-in method** tab, click **Email/Password**.
4. Enable **Email/Password** and click **Save**.

### 3. Create Cloud Firestore Database
1. In the Firebase console sidebar, navigate to **Build > Firestore Database**.
2. Click **Create database**.
3. Choose your database location (e.g. `asia-south1` for India or `us-central1`).
4. Select **Start in production mode** (or test mode for immediate testing).

### 4. Deploy Firestore Security Rules
Install the Firebase CLI if you haven't already:
```bash
npm install -g firebase-tools
firebase login
firebase use your-project-id
```
Deploy the security rules from `firestore.rules`:
```bash
firebase deploy --only firestore:rules
```
The included `firestore.rules` enforces:
- `request.auth != null`
- Document ownership check (`request.auth.uid == userId`) across profile, appliances, tariffSettings, monthlyRecords, and budgetSettings.
- Read-only access to official grid emission factors (`/emissionsFactors`) for authenticated users, with write privileges restricted to administrative claims.

### 5. Deploy Firestore Indexes
Deploy composite indexes from `firestore.indexes.json`:
```bash
firebase deploy --only firestore:indexes
```

---

## 📦 Production Build & Vercel Deployment

### Build the Production Bundle
```bash
npm run build
```
This produces an optimized production bundle in the `dist/` folder with vendor chunk splitting (`vendor-react`, `vendor-firebase`, `vendor-charts`, `vendor-ui`).

### Deploy to Vercel
1. Push your repository to GitHub.
2. Sign in to [Vercel](https://vercel.com/) and click **Add New > Project**.
3. Import your WattWise GitHub repository.
4. Framework Preset: **Vite**.
5. Under **Environment Variables**, add the six `VITE_FIREBASE_*` variables from your `.env` file.
6. Click **Deploy**.

Single Page Application (SPA) rewrites for React Router are pre-configured in `firebase.json` and supported out of the box on Vercel.

---

## 📄 License
This project is open-source under the MIT License.
