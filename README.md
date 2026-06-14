# 🏠 NestFinder

> **Map-Based Room Finder with AI-Powered Recommendation System**  
> Smart Room Finding for Students and Tenants in Nepal

---

## 📌 Overview

NestFinder is a full-stack web application that helps tenants — especially students — find rooms and flats quickly using an interactive map interface and an AI-powered recommendation engine. Landlords can post listings, and tenants can search, filter, and receive personalized room suggestions based on their preferences.

---

## ✨ Features

### ⭐ Highlight Features
| Feature | Description |
|---|---|
| 🗺️ Map-Based Room Finding | Browse available rooms directly on an interactive map with nearby POIs |
| 🤖 AI Recommendation System | Get personalized room suggestions based on budget, location, and facilities |

### ✅ Core Features

- **User Authentication** — Separate signup/login for Tenants and Landlords with profile management
- **Room Listing System** — Landlords can post listings with images, price, location, and facility details
- **Smart Search & Filtering** — Filter rooms by budget, location, WiFi, parking, furnishing, and more
- **Nearby Services** — View nearby colleges, hospitals, bus stops, and markets for each listing
- **Admin Dashboard** — Manage users, moderate listings, and remove fake or spam posts

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, Leaflet.js, OpenStreetMap |
| Backend | Node.js, Express.js |
| Database | PostgreSQL (Supabase), PostGIS |
| AI Service | Python, Flask, Sentence Transformers (`all-MiniLM-L6-v2`) |
| Auth | JWT |
| Maps | Leaflet.js + OpenStreetMap (no billing required) |


---

<!-- ## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- Python 3.9+
- PostgreSQL (or Supabase account)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/nestfinder.git
cd nestfinder
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env   # Fill in DB credentials and JWT secret
npm run dev
```

### 3. AI Service Setup

```bash
cd ai-service
pip install -r requirements.txt
python app.py
```

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
``` -->

---

## 🗂️ Project Structure

```
nestfinder/
├── frontend/          # React app with Leaflet map
├── backend/           # Express REST API
│   ├── routes/
│   ├── controllers/
│   └── models/
├── ai-service/        # Flask AI microservice
│   └── app.py
└── README.md
```

---

## 📊 Development Phases

| Phase | Focus | Status |
|---|---|---|
| 1 | Core System — Auth, Listings, Profiles | ⚒️ |
| 2 | Search & Map — Filters, Leaflet, PostGIS |  |
| 3 | Intelligence Layer — AI Recommendations |  |
| 4 | Administration — Dashboard, Moderation |  |

---

## 👥 Team

The project is developed by
1. Arpan Adhikari
2. Purnima Bhattrai

---

## 📄 License

This project is for academic purposes.