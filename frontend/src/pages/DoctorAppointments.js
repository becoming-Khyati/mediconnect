import React from "react";
import MainLayout from "../layout/MainLayout";
import DoctorAppointments from "../components/DoctorAppointments";

function DoctorAppointmentsPage() {
    return (
        <MainLayout>
            <DoctorAppointments />
        </MainLayout>
    );
}

export default DoctorAppointmentsPage;