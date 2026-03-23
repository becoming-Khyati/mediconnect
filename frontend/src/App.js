import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import PatientDetails from "./pages/PatientDetails";
import PatientLogin from "./pages/PatientLogin";
import PatientDashboard from "./pages/PatientDashboard";
import PatientRegister from "./pages/PatientRegister";
import DoctorRegister from "./pages/DoctorRegister";
import RoleSelect from "./pages/RoleSelect";
import ProtectedRoute from "./components/ProtectedRoute";
import DoctorAppointmentsPage from "./pages/DoctorAppointments";
import PatientAppointmentsPage from "./pages/PatientAppointmentsPage";
import Profile from "./pages/Profile";
import Notifications from "./components/Notifications";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


function App() {

  <ToastContainer position="top-right" autoClose={3000} />

  return (
    <Router>
      <Routes>
        <Route path="/" element={<RoleSelect />} />
        <Route path="/doctor-login" element={<Login />}/>
        <Route path="/dashboard" element={<ProtectedRoute roleRequired="doctor"> <Dashboard /> </ProtectedRoute>}/>
        <Route path="/patients" element={<Patients />}/>
        <Route path="/patients/:id" element={<PatientDetails />}/>
        <Route path="/patient-login" element={<PatientLogin />}/>
        <Route path="/patient-dashboard" element={<ProtectedRoute roleRequired="patient"><PatientDashboard /> </ProtectedRoute>}/>
        <Route path="/doctor-register" element={<DoctorRegister />}/>
        <Route path="/patient-register" element={<PatientRegister />}/>
        <Route path="/doctor-appointments" element={<DoctorAppointmentsPage />}/>
        <Route path="/patient-appointments" element={<PatientAppointmentsPage />}/>
        <Route path="/profile" element={<Profile />}/>
        <Route path="/notifications" element={<Notifications />}/>

      </Routes>
    </Router>
  );
}

export default App;