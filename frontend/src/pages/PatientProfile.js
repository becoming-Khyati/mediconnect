import React, { useEffect, useState } from "react";
import api from "../api/axios";
import {
    TextField,
    Button,
    Container,
    Typography,
    Paper,
    Box
} from "@mui/material";
import { useNavigate } from "react-router-dom";

function PatientProfile() {

    const [form, setForm] = useState({
        name: "",
        phone: "",
        age: "",
        gender: ""
    });

    const [file, setFile] = useState(null);

    const handleUpload = async () => {
        if (!file) return alert("Select File");

        const formData = new FormData();
        formData.append("file", file);

        try {
            await api.post("upload-report/", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            alert("Report Uploaded");
            setFile(null);
        } catch(err) {
            console.error(err);
        }
    };

    const navigate = useNavigate();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        const res = await api.get("profile/");
        setForm(res.data);
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        try {
            const res = await api.put("profile/", form);
            setForm(res.data);
            alert("Profile Updated");
            navigate("/patient-dashboard");
        } catch {
            alert("Update Failed");
        }
    };

    return (
        <Container maxWidth="sm">
            <Paper sx={{ p: 4, mt: 5, borderRadius: 4 }}>
                <Typography variant="h5" fontWeight="600" mb={1}>
                    Welcome, {form.name || "Patient"} 👋
                </Typography>

                <Typography variant="body2" color="text.secondary" mb={3}>
                    Manage your profile details below.
                </Typography>

                <TextField
                    fullWidth
                    label="Name"
                    name="name"
                    value={form.name || ""}
                    onChange={handleChange}
                    margin="normal"
                />

                <TextField
                    fullWidth
                    label="Phone"
                    value={form.phone || ""}
                    disabled
                    margin="normal"
                />

                <TextField
                    fullWidth
                    label="Age"
                    name="age"
                    value={form.age || ""}
                    onChange={handleChange}
                    margin="normal"
                />

                <TextField
                    fullWidth
                    label="Gender"
                    name="gender"
                    value={form.gender || ""}
                    onChange={handleChange}
                    margin="normal"
                />

                <Box mt={3}>
                    <Typography variant="h6">Upload Health Report</Typography>

                    <input
                        type="file"
                        onChange={(e) => setFile(e.target.files[0])}
                    />

                    <Button variant="contained" sx={{ mt: 1 }} onClick={handleUpload}>
                        Upload
                    </Button>

                </Box>

                <Button
                    fullWidth
                    variant="contained"
                    sx={{ mt: 2 }}
                    onClick={handleSubmit}
                >
                    Save Changes
                </Button>
            </Paper>
        </Container>
    );
}

export default PatientProfile;