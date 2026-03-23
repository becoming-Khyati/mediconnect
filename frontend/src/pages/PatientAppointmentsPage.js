import React from "react";
import MainLayout from "../layout/MainLayout";
import MyAppointments from "../components/MyAppointments";

function PatientAppointmentsPage() {
    return (
        <MainLayout>
            <MyAppointments />
        </MainLayout>
    );
}

export default PatientAppointmentsPage;