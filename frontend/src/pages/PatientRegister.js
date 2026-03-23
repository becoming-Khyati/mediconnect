import React, { useState } from "react";
import { Container, TextField, Button, Typography, Paper, Box } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function PatientRegister() {

    const [form, setForm] = useState({
        name: "",
        phone: "",
        age: "",
        gender: ""
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        try {
            await axios.post("http://127.0.0.1:8000/api/patient-register/", form);
            alert("Registered Successfully");
            navigate("/patient-login");
        } catch (err) {
            alert("Registration Failed");
        }
    }

    return (
        <Container maxWidth="sm">
            <Paper sx={{ p:4, mt:10 }}>

                <Typography variant="h5">Patient Register</Typography>

                <Box mt={2}>
                    <TextField fullWidth label="Name" name="name" onChange={handleChange} margin="normal"/>
                    <TextField fullWidth label="Phone" name="phone" onChange={handleChange} margin="normal"/>
                    <TextField fullWidth label="Age" name="age" onChange={handleChange} margin="normal"/>
                    <TextField fullWidth label="Gender" name="gender" onChange={handleChange} margin="normal"/>

                    <Button fullWidth variant="contained" sx={{ mt: 2 }} onClick={handleSubmit}>
                        Register
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}

export default PatientRegister;