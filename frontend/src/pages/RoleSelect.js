import React from "react";
import { Container, Paper, Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

function RoleSelect() {

    const navigate = useNavigate();

    return (
        <Container maxWidth="sm">
            <Paper elevation={4} sx={{ p: 4, mt: 10, textAlign: "center" }}>

                <Typography variant="h4" gutterBottom>
                    Mediconnect
                </Typography>

                <Typography color="text.secondary" mb={4}>
                    Select Your Role to Continue
                </Typography>

                <Box display="flex" flexDirection="column" gap={2}>

                    <Button
                        variant="contained"
                        size="large"
                        onClick={() => navigate("/doctor-login")}
                    >
                        Login as Doctor
                    </Button>

                    <Button
                        variant="outlined"
                        size="large"
                        onClick={() => navigate("/patient-login")}
                    >
                        Login as Patient
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}

export default RoleSelect;