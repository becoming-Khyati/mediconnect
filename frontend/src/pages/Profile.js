import React from "react";
import DoctorProfile from "./DoctorProfile";
import PatientProfile from "./PatientProfile";

function Profile() {

    const role = localStorage.getItem("role");

    return role === "doctor"
        ? <DoctorProfile />
        : <PatientProfile />;
}

export default Profile;