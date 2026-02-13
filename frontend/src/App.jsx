import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
// Import pages (placeholders for now)
import Employees from './pages/Employees';
import Vehicles from './pages/Vehicles';
import Companies from './pages/Companies';
import Operations from './pages/Operations';

const ProtectedRoute = () => {
  const token = localStorage.getItem('token');
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/operations" element={<Operations />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/companies" element={<Companies />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
