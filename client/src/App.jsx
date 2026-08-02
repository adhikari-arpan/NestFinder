import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppContextProvider } from "./Context/AppContext";
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AllRooms } from './Pages/AllRooms';

// Pages
import { Home } from './Pages/Home';
import { RoomDetails } from './Pages/RoomDetails';
import { AIRecommend } from './Pages/AIRecommend';
import { Auth } from './Pages/Auth';
import { NotFound } from './Pages/NotFound';
import { KycVerification } from './Pages/KycVerification';
import { PaymentPage } from './payment/PaymentPage';


// Dashboards
import { LandlordDashboard } from './Pages/Dashboard/LandlordDashboard';
import { TenantDashboard } from './Pages/Dashboard/TenantDashboard';
import { AdminDashboard } from './Pages/Dashboard/AdminDashboard';

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
            <Route path="/auth" element={<Auth />} />
            <Route path="/room/:id" element={<RoomDetails />} />
            <Route path="/ai-recommend" element={<AIRecommend />} />
            <Route path="/rooms" element={<AllRooms />} />
            <Route path="/kyc" element={<KycVerification />} />
            <Route path="/payment" element={<PaymentPage />} />


            {/* Role Dashboards */}
            <Route path="/dashboard/landlord" element={<LandlordDashboard />} />
            <Route path="/dashboard/tenant" element={<TenantDashboard />} />
            <Route path="/dashboard/admin" element={<AdminDashboard />} />

            {/* Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        {/* Global Footer */}
        <Footer />
      </Router>
    </AppContextProvider>
  );
}

export default App;
