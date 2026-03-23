import React, { useEffect, useState } from "react";
import {
    Grid,
    Paper,
    Typography,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    CircularProgress
} from "@mui/material";
import MainLayout from "../layout/MainLayout";
import api from "../api/axios";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom";
import DoctorAppointments from "../components/DoctorAppointments";

function Dashboard() {

    const navigate = useNavigate();

    const [patients, setPatients] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    const today = new Date().toISOString().split("T")[0];

    const patientsToday = patients.filter(
        (p) => p.created_at?.split("T")[0] === today
    ).length;

    const diseaseCount = {};
    patients.forEach((p) => {
        const disease = p.disease || "Unknown";
        diseaseCount[disease] = (diseaseCount[disease] || 0) + 1;
    });

    const diseaseData = Object.keys(diseaseCount).map((disease) => ({
        name: disease,
        value: diseaseCount[disease]
    }));

    const getColor = (index, total) => {
        const hue = (index * 360) / total;
        const saturation = 70;
        const lightness = 50 + (index % 2) * 10;
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    };

    const fetchDashboardData = async () => {
        try {
            const patientsRes = await api.get("patients/");
            setPatients(patientsRes.data);

            try {
                const prescriptionsRes = await api.get("prescriptions/");
                setPrescriptions(prescriptionsRes.data);
            } catch {
                setPrescriptions([]);
            }

            try {
                const doctorsRes = await api.get("doctors/");
                setDoctors(doctorsRes.data);
            } catch {
                setDoctors([]);
            }

        } catch (error) {
            console.error("Dashboard fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const recentPatients = [...patients].slice(-5).reverse();

    if (loading) {
        return (
            <MainLayout>
                <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
                    <CircularProgress />
                </Box>
            </MainLayout>
        );
    }

    return (
        <MainLayout>

            <Typography variant="h4" sx={{ fontWeight: "bold", mb: 4 }}>
                Doctor Dashboard
            </Typography>

            <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
                <Button
                    variant="contained"
                    onClick={() => navigate("/patients")}
                >
                    Add Patient
                </Button>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, borderLeft: "6px solid #1976d2" }}>
                        <Typography color="text.secondary">Total Patients</Typography>
                        <Typography variant="h3">{patients.length}</Typography>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, borderLeft: "6px solid #2e7d32" }}>
                        <Typography color="text.secondary">Prescriptions</Typography>
                        <Typography variant="h3">{prescriptions.length}</Typography>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, borderLeft: "6px solid #ed6c02" }}>
                        <Typography color="text.secondary">Doctors</Typography>
                        <Typography variant="h3">{doctors.length}</Typography>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 3, borderLeft: "6px solid #9c27b0" }}>
                        <Typography color="text.secondary">Patients Today</Typography>
                        <Typography variant="h3">{patientsToday}</Typography>
                    </Paper>
                </Grid>
            </Grid>

            <Box sx={{ mt: 5 }}>
                <Typography variant="h5" sx={{ mb: 2 }}>
                    Disease Distribution
                </Typography>

                <Paper sx={{ p: 3, height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={diseaseData} dataKey="value" outerRadius={100}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                {diseaseData.map((entry, index) => (
                                    <Cell key={index} fill={getColor(index, diseaseData.length)} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </Paper>
            </Box>

            <Box sx={{ mt: 5 }}>
                <Typography variant="h5" sx={{ mb: 2 }}>
                    Recent Patients
                </Typography>

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Age</TableCell>
                                <TableCell>Gender</TableCell>
                                <TableCell>Disease</TableCell>
                                <TableCell>Phone</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {recentPatients.map((patient) => (
                                <TableRow
                                    key={patient.id}
                                    hover
                                    sx={{ cursor: "pointer" }}
                                    onClick={() => navigate(`/patients/${patient.id}`)}
                                >
                                    <TableCell>{patient.name}</TableCell>
                                    <TableCell>{patient.age}</TableCell>
                                    <TableCell>{patient.gender}</TableCell>
                                    <TableCell>{patient.disease}</TableCell>
                                    <TableCell>{patient.phone}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            <DoctorAppointments />

        </MainLayout>
    );
}

export default Dashboard;