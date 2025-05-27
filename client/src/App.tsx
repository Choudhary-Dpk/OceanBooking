import React from 'react';
// import 'antd/dist/antd.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import DashboardPage from './components/DashboardPage';
import Step1PersonalInfo from './components/Step1PersonalInfo';
import Step2ReviewPayment from './components/Step2ReviewPayment';
import ProtectedRoute from './components/ProtectedRoute';
import { ConfigProvider } from 'antd';

const App: React.FC = () => {
  return (
    <ConfigProvider>
      <Router>
        <Routes>
          {/* Public route */}
          <Route path="/" element={<HomePage />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking"
            element={
              <ProtectedRoute>
                <Step1PersonalInfo />
              </ProtectedRoute>
            }
          />
          <Route
            path="/review"
            element={
              <ProtectedRoute>
                <Step2ReviewPayment />
              </ProtectedRoute>
            }
          />

          {/* Redirect any unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
};

export default App;
