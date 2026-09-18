import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import RiskMap from './pages/RiskMap';
import About from './pages/About';
import Stations from './pages/Stations';
import Alerts from './pages/Alerts';
import Reports from './pages/Reports';
import Uploads from './pages/Uploads';
import { AlertProvider } from './context/AlertContext';
import { LanguageProvider } from './context/LanguageContext';

export default function App() {
  return (
    <div style={{ fontFamily: '"Dosis", sans-serif' }}>
      <LanguageProvider>
        <AlertProvider>
          <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/app" element={<DashboardLayout />}>
              <Route path="risk-map" element={<RiskMap />} />
              <Route path="about" element={<About />} />
              <Route path="stations" element={<Stations />} />
              <Route path="alerts" element={<Alerts />} />
              <Route path="reports" element={<Reports />} />
              <Route path="uploads" element={<Uploads />} />
              <Route index element={<Navigate to="risk-map" replace />} />
            </Route>
          </Routes>
        </Router>
      </AlertProvider>
    </LanguageProvider>
  </div>
  );
}