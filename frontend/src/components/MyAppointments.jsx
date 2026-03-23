import React, { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    Typography,
    Button,
    Grid,
    Chip,
    Box,
    Snackbar,
    Alert
} from "@mui/material";
import api from "../api/axios";

const MyAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    const fetchAppointments = () => {
        api.get("appointments/my/")
            .then((res) => setAppointments(res.data))
            .catch((err) => console.log(err));
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const handleCancel = (id) => {
        api.post(`appointments/cancel/${id}/`)
            .then(() => {
                setSnackbar({
                    open: true,
                    message: "Appointment Cancelled ✅",
                    severity: "success",
                });
                fetchAppointments();
            })
            .catch((err) => {
                setSnackbar({
                    open: true,
                    message:
                        err.response?.data?.detail ||
                        "Error Cancelling Appointment",
                    severity: "error",
                });
            });
    };

    return (
        <Box mt={4}>
            <Typography variant="h5" fontWeight="bold" mb={2}>
                My Appointments
            </Typography>

            <Grid container spacing={2}>
                {appointments.map((appt) => (
                    <Grid item xs={12} key={appt.id}>
                        <Card sx={{ borderRadius: 3, 
                                    boxShadow: 3,
                                    transition: "0.3s",
                                    "&:hover": {
                                        boxShadow: 6,
                                        transform: "translateY(-3px)",
                                    },
                            }}
                        >
                            <CardContent>
                                <Box>
                                <Typography fontWeight="bold" fontSize="18px">
                                   Dr. {appt.doctor_name}
                                </Typography>

                                <Typography color="text.secondary" fontSize="14px">
                                    {appt.doctor_specialization || "General"}
                                </Typography>
                                </Box>

                                <Typography>
                                    Date: {appt.date}
                                </Typography>

                                <Typography>
                                    Time: {appt.time}
                                </Typography>

                                <Box mt={1} display="flex" justifyContent="space-between">
                                    <Chip
                                        label={appt.status}
                                        color={
                                            appt.status === "booked"
                                                ? "primary"
                                                : appt.status === "cancelled"
                                                ? "error"
                                                : "success"
                                        }
                                    />

                                    {appt.status === "booked" && (
                                        <Button
                                            color="error"
                                            onClick={() => handleCancel(appt.id)}
                                        >
                                            Cancel
                                        </Button>
                                    )}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() =>
                    setSnackbar((prev) => ({ ...prev, open: false }))
                }
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert
                    severity={snackbar.severity}
                    onClose={() =>
                        setSnackbar((prev) => ({ ...prev, open: false }))
                    }
                    sx={{ width: "100%" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default MyAppointments;