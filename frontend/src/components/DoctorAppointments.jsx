import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Chip,
    Tabs,
    Tab,
    Button,
    Divider
} from "@mui/material";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

function DoctorAppointments() {

    const [appointments, setAppointments] = useState([]);
    const [tab, setTab] = useState(0);

    const navigate = useNavigate();

    const fetchAppointments = async () => {
        try {
            const res = await api.get("appointments/doctor/");
            setAppointments(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    // Filters
    const upcoming = appointments.filter(a => a.status === "booked");
    const completed = appointments.filter(a => a.status === "completed");
    const cancelled = appointments.filter(a => a.status === "cancelled");

    const getData = () => {
        if (tab === 0) return upcoming;
        if (tab === 1) return completed;
        return cancelled;
    };

    const handleComplete = async (id) => {
        try {
            await api.post(`appointments/complete/${id}/`);
            fetchAppointments();
        } catch (err) {
            alert(err.response?.data?.error || "Error updating");
        }
    };

    const handleCancel = async (id) => {
        try {
            await api.post(`appointments/cancel/${id}/`);
            fetchAppointments();
        } catch (err) {
            alert(err.response?.data?.error || "Error Cancelling");
        }
    };

    return (
        <Box mt={4} px={{ xs: 1, md: 3 }}>
            
            {/* Header */}
            <Typography variant="h5" fontWeight="700" mb={2}>
                Appointments
            </Typography>

            {/* Tabs */}
            <Tabs
                value={tab}
                onChange={(e, val) => setTab(val)}
                sx={{
                    mb: 2,
                    "& .MuiTabs-indicator": { height: 3, borderRadius: 2 }
                }}
            >
                <Tab label="Upcoming" />
                <Tab label="Completed" />
                <Tab label="Cancelled" />
            </Tabs>

            {/* Cards */}
            <Grid container spacing={3}>
                {getData().length === 0 ? (
                    <Box width="100%" textAlign="center" mt={5}>
                        <Typography color="text.secondary">
                            No appointments found
                        </Typography>
                    </Box>
                ) : (
                    getData().map((appt) => (
                        <Grid item xs={12} key={appt.id}>
                            <Card
                                sx={{
                                    borderRadius: 4,
                                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                                    transition: "0.3s",
                                    "&:hover": {
                                        boxShadow: "0 6px 25px rgba(0,0,0,0.12)",
                                        transform: "translateY(-2px)"
                                    }
                                }}
                            >
                                <CardContent>

                                    {/* Patient Name */}
                                    <Typography
                                        fontWeight="600"
                                        fontSize="1.1rem"
                                        sx={{
                                            cursor: "pointer",
                                            color: "#1976d2",
                                            mb: 1,
                                            "&:hover": {
                                                textDecoration: "underline"
                                            }
                                        }}
                                        // 🔥 FIX: pass full object or correct ID fallback
                                        onClick={() =>
                                            navigate(`/patients/${appt.patient_id || appt.patient}`)
                                        }
                                    >
                                        {appt.patient_name}
                                    </Typography>

                                    <Divider sx={{ mb: 1.5 }} />

                                    {/* Date + Time */}
                                    <Typography color="text.secondary" fontSize="0.95rem">
                                        📅 {appt.date}
                                    </Typography>

                                    <Typography color="text.secondary" fontSize="0.95rem" mb={2}>
                                        ⏰ {appt.time}
                                    </Typography>

                                    {/* Bottom Row */}
                                    <Box
                                        display="flex"
                                        justifyContent="space-between"
                                        alignItems="center"
                                        flexWrap="wrap"
                                        gap={2}
                                    >
                                        <Chip
                                            label={appt.status.toUpperCase()}
                                            sx={{
                                                fontWeight: 600,
                                                letterSpacing: 0.5
                                            }}
                                            color={
                                                appt.status === "booked"
                                                    ? "primary"
                                                    : appt.status === "completed"
                                                    ? "success"
                                                    : "error"
                                            }
                                        />

                                        {appt.status === "booked" && (
                                            <Box display="flex" gap={1.5}>
                                                <Button
                                                    variant="contained"
                                                    color="success"
                                                    size="small"
                                                    sx={{
                                                        borderRadius: 2,
                                                        textTransform: "none",
                                                        px: 2
                                                    }}
                                                    onClick={() => handleComplete(appt.id)}
                                                >
                                                    Complete
                                                </Button>

                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    size="small"
                                                    sx={{
                                                        borderRadius: 2,
                                                        textTransform: "none",
                                                        px: 2
                                                    }}
                                                    onClick={() => handleCancel(appt.id)}
                                                >
                                                    Cancel
                                                </Button>
                                            </Box>
                                        )}
                                    </Box>

                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                )}
            </Grid>
        </Box>
    );
}

export default DoctorAppointments;