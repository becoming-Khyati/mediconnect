import React, { useEffect, useState } from "react";
import api from "../api/axios";
import {
    TextField,
    Button,
    Container,
    Typography,
    Paper,
    Box,
    Avatar,
    IconButton
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";

const BASE_URL = "http://127.0.0.1:8000";

function DoctorProfile() {

    const [form, setForm] = useState({
        username: "",
        specialization: "",
        age: "",
        gender: "",
        profile_picture: null
    });

    const [preview, setPreview] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get("profile/");
            setForm({
                ...res.data,
                profile_picture: res.data.profile_picture || null
            });
        } catch (error) {
            console.error(error);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            setForm({ ...form, profile_picture: file });
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {
        const data = new FormData();

        data.append("specialization", form.specialization || "");
        data.append("age", form.age || "");
        data.append("gender", form.gender || "");

        // ✅ ONLY send file if it's actually a file
        if (form.profile_picture instanceof File) {
            data.append("profile_picture", form.profile_picture);
        }

        try {
            const res = await api.put("profile/", data, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            setForm({
                ...res.data,
                profile_picture: res.data.profile_picture || null
            });

            setPreview(null);

            alert("Profile Updated");
            navigate("/dashboard");

        } catch (error) {
            console.error(error);
            alert("Update Failed");
        }
    };

    const handleDeleteAccount = async () => {
        const confirmDelete = window.confirm(
            "Are you sure? This will delete all your data permanently."
        );

        if (!confirmDelete) return;

        try {
            await api.delete("doctor/delete-account/");
            alert("Account deleted");

            localStorage.clear();
            window.location.href = "/";
        } catch (error) {
            console.error(error);
            alert("Failed to Delete Account");
        }
    };

    return (
        <Container maxWidth="sm">

            <Paper
                elevation={4}
                sx={{
                    p: 4,
                    mt: 5,
                    borderRadius: 4,
                    textAlign: "center"
                }}
            >
                <Typography variant="h5" sx={{ mb: 3 }}>
                    Doctor Profile
                </Typography>

                {/* 🔥 Avatar Section */}
                <Box sx={{ position: "relative", display: "inline-block" }}>

                    <Avatar
                        src={
                            preview
                                ? preview
                                : form.profile_picture
                                ? form.profile_picture.startsWith("http")
                                    ? form.profile_picture
                                    : `${BASE_URL}${form.profile_picture}`
                                : "/default-avatar.png"
                        }
                        onError={(e) => {
                            e.target.src = "/default-avatar.png";
                        }}
                        sx={{ width: 120, height: 120, margin: "auto" }}
                    />

                    <IconButton
                        component="label"
                        sx={{
                            position: "absolute",
                            bottom: 0,
                            right: 0,
                            background: "#1976d2",
                            color: "white",
                            "&:hover": { background: "#1565c0" }
                        }}
                    >
                        <EditIcon />
                        <input hidden type="file" onChange={handleFileChange} />
                    </IconButton>
                </Box>

                {/* 🔥 Fields */}
                <Box mt={3}>
                    <TextField
                        fullWidth
                        label="Username"
                        value={form.username}
                        disabled
                        margin="normal"
                    />

                    <TextField
                        fullWidth
                        label="Specialization"
                        name="specialization"
                        value={form.specialization || ""}
                        onChange={handleChange}
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

                    <Button
                        fullWidth
                        variant="contained"
                        sx={{ mt: 2 }}
                        onClick={handleSubmit}
                    >
                        Save Changes
                    </Button>

                    <Button
                        fullWidth
                        variant="contained"
                        color="error"
                        sx={{ mt: 2 }}
                        onClick={handleDeleteAccount}
                    >
                        Delete Account
                    </Button>
                </Box>

            </Paper>
        </Container>
    );
}

export default DoctorProfile;