import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppContextProvider } from "./Context/AppContext";
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { Home } from './pages/Home';
import { SearchMap } from './pages/SearchMap';
import { RoomDetails } from './pages/RoomDetails';
import { AIRecommend } from './pages/AIRecommend';
import { Auth } from './pages/Auth';

// Dashboards
// import { LandlordDashboard } from './pages/Dashboard/LandlordDashboard';
// import { TenantDashboard } from './pages/Dashboard/TenantDashboard';
// import { AdminDashboard } from './pages/Dashboard/AdminDashboard';

import './App.css';

function App() {
  return (
    <AppContextProvider>
      <Router>
        {/* Sticky Header */}
        <Navbar />

        {/* Dynamic Page Views */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<SearchMap />} />
            <Route path="/room/:id" element={<RoomDetails />} />
            <Route path="/ai-recommend" element={<AIRecommend />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Role Dashboards */}
            <Route path="/dashboard/landlord" element={<LandlordDashboard />} />
            <Route path="/dashboard/tenant" element={<TenantDashboard />} />
            <Route path="/dashboard/admin" element={<AdminDashboard />} />
          </Routes>
        </main>

        {/* Global Footer */}
        <Footer />
      </Router>
    </AppContextProvider>
  );
}

export default App;
