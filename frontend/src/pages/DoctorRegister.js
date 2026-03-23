import React, { useState } from "react";
import { Container, TextField, Button, Typography, Paper, Box } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function DoctorRegister() {

    const [form, setForm] = useState({
        username: "",
        password: "",
        specialization: "",
        age: "",
        gender: "",
        experience: "",
        qualification: ""
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {

        try {
            await axios.post("http://127.0.0.1:8000/api/doctor-register/", form);
            alert("Registered! Wait for Admin Approval");
            navigate("/");
        } catch (err) {
            console.log("FULL ERROR: ", err.response?.data);
            console.log("DATA: ", JSON.stringify(err.response?.data));
            alert("Registration Failed");
        }
    };

    return (
        <Container maxWidth="sm">
            <Paper sx={{ p: 4, mt: 10 }}>
                <Typography variant="h5">Doctor Register</Typography>

                <Box mt={2}>
                    <TextField fullWidth label="Username" name="username" onChange={handleChange} margin="normal" />
                    <TextField fullWidth label="Password" name="password" onChange={handleChange} margin="normal" />
                    <TextField fullWidth label="Specialization" name="specialization" onChange={handleChange} margin="normal" />
                    <TextField fullWidth label="Age" name="age" onChange={handleChange} margin="normal" />
                    <TextField fullWidth label="Gender" name="gender" onChange={handleChange} margin="normal" />
                    <TextField fullWidth label="Experience" name="experience" onChange={handleChange} margin="normal" />
                    <TextField fullWidth label="Qualification" name="qualificattion" onChange={handleChange} margin="normal" />

                    <Button fullWidth variant="contained" sx={{ mt: 2 }} onClick={handleSubmit}>
                        Register
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default DoctorRegister;