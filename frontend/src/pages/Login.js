import React, { useState } from "react";
import axios from "axios";
import {
    Container,
    TextField,
    Button,
    Typography,
    Box,
    Paper
} from "@mui/material";
import { useNavigate } from "react-router-dom";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {

        try {

            const response = await axios.post(
                "http://127.0.0.1:8000/api/token/",
                {
                    username: username,
                    password: password
                }
            );

            localStorage.removeItem("patientToken");

            localStorage.setItem("doctorToken", response.data.access);
            localStorage.setItem("role", "doctor");
            navigate("/dashboard");
        }
            catch (error) {
                console.log(error.response?.data);
                alert(error.response?.data?.detail || "Login Failed");
            }
    };

    return (

        <Container maxWidth="sm">
            <Paper elevation={3} style={{ padding: 30, marginTop: 100}}>
                <Typography variant="h4" align="center" gutterBottom>
                    Mediconnect
                </Typography>

                <Typography align="center" color="textSecondary">
                    Doctor Login
                </Typography>

                <Box mt={4}>
                    <TextField 
                        fullWidth
                        label="Username"
                        margin="normal"
                        onChange={(e)=>setUsername(e.target.value)}
                    />

                    <TextField 
                        fullWidth
                        label="Password"
                        type="password"
                        margin="normal"
                        onChange={(e)=>setPassword(e.target.value)}
                    />

                    <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        style={{marginTop:20}}
                        onClick={handleLogin}
                    >
                        Login
                    </Button>

                    <Button
                        fullWidth
                        sx={{ marginTop: 2}}
                        onClick={() => navigate("/doctor-register")}
                    >
                        Create Account
                    </Button>
    
                </Box>
            </Paper>
        </Container>
    );
}

export default Login;