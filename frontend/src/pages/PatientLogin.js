import React, { useState, useEffect, useRef } from "react";
import {
    Container,
    TextField,
    Button,
    Typography,
    Box,
    Paper,
    Divider,
    Snackbar,
    Alert
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function PatientLogin() {
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(0);

    const [snack, setSnack] = useState({ open: false, message: "", severity: "info" });

    const navigate = useNavigate();
    const timerRef = useRef(null);

    // ✅ Snack handler
    const showSnack = (message, severity = "info") => {
        setSnack({ open: true, message, severity });
    };

    const handleCloseSnack = () => {
        setSnack({ ...snack, open: false });
    };

    // ✅ Start OTP timer
    const startTimer = () => {
        setTimer(300);
        if (timerRef.current) clearInterval(timerRef.current);

        timerRef.current = setInterval(() => {
            setTimer(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    showSnack("OTP expired. Please request a new one.", "warning");
                    setStep(1);
                    setOtp("");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const formatTimer = (seconds) => {
        const min = Math.floor(seconds / 60).toString().padStart(2, "0");
        const sec = (seconds % 60).toString().padStart(2, "0");
        return `${min}:${sec}`;
    };

    // ✅ Send OTP
    const sendOtp = async () => {
        if (!phone) {
            showSnack("Enter phone number", "warning");
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post("http://127.0.0.1:8000/api/send-otp/", { phone });
            console.log("OTP Response:", res.data);

            if (res.data.message) {
                showSnack(res.data.message, "success");
                setStep(2);
                startTimer();
            } else if (res.data.error) {
                showSnack(res.data.error, "error");
            } else {
                showSnack("Error sending OTP", "error");
            }
        } catch (err) {
            console.error("OTP Request Failed:", err.response?.data || err);
            showSnack("Error sending OTP: " + (err.response?.data?.error || "Unknown"), "error");
        } finally {
            setLoading(false);
        }
    };

    // ✅ Verify OTP
    const verifyOtp = async () => {
        if (!otp) {
            showSnack("Enter OTP", "warning");
            return;
        }

        if (timer <= 0) {
            showSnack("OTP expired. Please request a new OTP.", "warning");
            setStep(1);
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post("http://127.0.0.1:8000/api/verify-otp/", { phone, otp });
            localStorage.setItem("patientToken", res.data.access);
            localStorage.setItem("role", "patient");
            showSnack("OTP verified successfully!", "success");
            navigate("/patient-dashboard");
        } catch (err) {
            console.error("OTP Verification Failed:", err.response?.data || err);
            const error = err.response?.data?.error || "Invalid OTP";
            showSnack(error, "error");
            if (error === "OTP Expired") {
                setStep(1);
                setOtp("");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    return (
        <Container maxWidth="sm">
            <Paper elevation={5} sx={{ p: 5, mt: 10, borderRadius: 3, bgcolor: "#f5f5f5" }}>
                <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 700 }}>
                    Mediconnect
                </Typography>

                <Typography align="center" color="text.secondary" mb={4}>
                    Patient Login (OTP)
                </Typography>

                <Divider sx={{ mb: 3 }} />

                <Box display="flex" flexDirection="column" gap={2}>
                    <TextField
                        fullWidth
                        label="Phone Number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        disabled={step === 2}
                        variant="outlined"
                    />

                    {step === 1 && (
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={sendOtp}
                            disabled={loading}
                            sx={{ py: 1.5, fontWeight: 600 }}
                        >
                            {loading ? "Sending OTP..." : "Send OTP"}
                        </Button>
                    )}

                    {step === 2 && (
                        <>
                            <TextField
                                fullWidth
                                label="Enter OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                variant="outlined"
                            />

                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="body2" color="text.secondary">
                                    {timer > 0 ? `OTP expires in: ${formatTimer(timer)}` : "OTP expired"}
                                </Typography>
                                <Button
                                    onClick={sendOtp}
                                    disabled={loading}
                                    size="small"
                                >
                                    Resend OTP
                                </Button>
                            </Box>

                            <Button
                                fullWidth
                                variant="contained"
                                onClick={verifyOtp}
                                disabled={loading || timer <= 0}
                                sx={{ py: 1.5, fontWeight: 600, mt: 1 }}
                            >
                                {loading ? "Verifying..." : "Verify & Login"}
                            </Button>
                        </>
                    )}
                </Box>

                {/* ✅ Snackbar */}
                <Snackbar
                    open={snack.open}
                    autoHideDuration={4000}
                    onClose={handleCloseSnack}
                    anchorOrigin={{ vertical: "top", horizontal: "center" }}
                >
                    <Alert onClose={handleCloseSnack} severity={snack.severity} sx={{ width: "100%" }}>
                        {snack.message}
                    </Alert>
                </Snackbar>
            </Paper>
        </Container>
    );
}

export default PatientLogin;