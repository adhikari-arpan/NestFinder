import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AppContextProvider } from "./Context/AppContext";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { RequireAuth } from "./components/RequireAuth";
import { ScrollToTop } from "./components/ScrollToTop";
import { AllRooms } from "./Pages/AllRooms";

// Deployment Analytics
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";

// Pages
import { Home } from "./Pages/Home";
import { RoomDetails } from "./Pages/RoomDetails";
import { AIRecommend } from "./Pages/AIRecommend";
import { Auth } from "./Pages/Auth";
import { NotFound } from "./Pages/NotFound";
import { KycVerification } from "./Pages/KycVerification";
import { PaymentPage } from "./Pages/PaymentPage";
import { About } from "./Pages/About/About";
import { AboutPayment } from "./Pages/About/AboutPayment";

// Dashboards
import { LandlordDashboard } from "./Pages/Dashboard/LandlordDashboard";
import { TenantDashboard } from "./Pages/Dashboard/TenantDashboard";
import { AdminDashboard } from "./Pages/Dashboard/AdminDashboard";

function App() {
  return (
    <AppContextProvider>
      <Router>
        <ScrollToTop />

        {/* Sticky Header */}
        <Navbar />

        {/* Dynamic Page Views */}
        <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/room/:id" element={<RoomDetails />} />
            <Route
              path="/ai-recommend"
              element={
                <RequireAuth>
                  <AIRecommend />
                </RequireAuth>
              }
            />
            <Route
              path="/rooms"
              element={
                <RequireAuth>
                  <AllRooms />
                </RequireAuth>
              }
            />
            <Route path="/kyc" element={<KycVerification />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/about/payment" element={<AboutPayment />} />

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

        <SpeedInsights />
        <Analytics />
      </Router>
    </AppContextProvider>
  );
}

export default App;
