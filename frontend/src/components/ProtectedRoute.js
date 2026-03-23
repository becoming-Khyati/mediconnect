import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, roleRequired }) {

    const doctorToken = localStorage.getItem("doctorToken");
    const patientToken = localStorage.getItem("patientToken");
    const role = localStorage.getItem("role");

    const token = doctorToken || patientToken;

    // ❌ Not logged in
    if (!token) {
        return <Navigate to="/" />;
    }

    // ❌ Wrong role trying to access
    if (roleRequired && role !== roleRequired) {
        return <Navigate to="/" />;
    }

    // ✅ Allowed
    return children;
}

export default ProtectedRoute;