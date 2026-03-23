import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Divider,
} from "@mui/material";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import api from "../api/axios";

const AppointmentBooking = ({ onBooked }) => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState("");

  // ✅ Fetch doctors
  useEffect(() => {
    api
      .get("doctors/")
      .then((res) => setDoctors(res.data))
      .catch((err) => console.log(err));
  }, []);

  // ✅ Fetch slots for selected doctor and date
  const fetchSlots = () => {
    if (!selectedDoctor || !date) return;

    api
      .get(`appointments/slots/${selectedDoctor}/?date=${date}`)
      .then((res) => setSlots(res.data))
      .catch((err) => console.log(err));
  };

  // ✅ Handle booking
  const handleBooking = () => {
    api
      .post("appointments/book/", {
        doctor: selectedDoctor,
        date: date,
        time: selectedTime,
      })
      .then(() => {
        alert("Appointment booked ✅");
        // Refresh appointments in dashboard
        if (onBooked) onBooked();
        setSelectedDoctor("");
        setDate("");
        setSlots([]);
        setSelectedTime("");
      })
      .catch((err) =>
        alert(err.response?.data?.error || "Error booking appointment")
      );
  };

  // ✅ Disable past dates
  const today = new Date().toISOString().split("T")[0];

  return (
    <Card
      elevation={3}
      sx={{
        borderRadius: 4,
        p: 3,
        background: "linear-gradient(145deg, #ffffff, #f7f9fc)",
        border: "1px solid #e0e0e0",
      }}
    >
      <CardContent>
        {/* Header */}
        <Box display="flex" alignItems="center" mb={3}>
          <Avatar sx={{ bgcolor: "#1976d2", mr: 2 }}>
            <EventAvailableIcon />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight="bold">
              Book Appointment
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Schedule a consultation with your doctor
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          {/* Doctor Selection */}
          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              label="Select Doctor"
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              InputProps={{
                startAdornment: (
                  <LocalHospitalIcon sx={{ mr: 1, color: "gray" }} />
                ),
              }}
            >
              {doctors.map((doc) => (
                <MenuItem key={doc.id} value={doc.id}>
                  Dr. {doc.username}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Date Picker */}
          <Grid item xs={12}>
            <TextField
              type="date"
              fullWidth
              label="Select Date"
              InputLabelProps={{ shrink: true }}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              inputProps={{ min: today }} // ✅ disable past dates
            />
          </Grid>

          {/* Fetch Slots */}
          <Grid item xs={12}>
            <Button
              variant="outlined"
              fullWidth
              size="large"
              onClick={fetchSlots}
              disabled={!selectedDoctor || !date}
              sx={{
                borderRadius: 3,
                textTransform: "none",
                fontWeight: "bold",
                "&:hover": { boxShadow: "0px 4px 12px rgba(25,118,210,0.3)" },
              }}
            >
              Check Available Slots
            </Button>
          </Grid>

          {/* Slots */}
          {slots.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                Available Time Slots
              </Typography>

              <Box display="flex" flexWrap="wrap" gap={1}>
                {slots.map((slot) => (
                  <Chip
                    key={slot}
                    label={slot}
                    clickable
                    icon={<AccessTimeIcon />}
                    color={selectedTime === slot ? "primary" : "default"}
                    variant={selectedTime === slot ? "filled" : "outlined"}
                    onClick={() => setSelectedTime(slot)}
                    sx={{
                      px: 2,
                      py: 1.5,
                      fontWeight: "500",
                      borderRadius: 2,
                      cursor: "pointer",
                      transition: "0.2s",
                      "&:hover": { transform: "scale(1.05)" },
                    }}
                  />
                ))}
              </Box>
            </Grid>
          )}

          {/* Appointment Summary */}
          {selectedDoctor && date && selectedTime && (
            <Grid item xs={12}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 3,
                  backgroundColor: "#f1f6ff",
                  border: "1px dashed #1976d2",
                  transition: "0.3s",
                }}
              >
                <Typography fontWeight="bold" mb={1}>
                  Appointment Summary
                </Typography>
                <Typography variant="body2">
                  Doctor ID: {selectedDoctor}
                </Typography>
                <Typography variant="body2">Date: {date}</Typography>
                <Typography variant="body2">Time: {selectedTime}</Typography>
              </Box>
            </Grid>
          )}

          {/* Book Button */}
          <Grid item xs={12}>
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleBooking}
              disabled={!selectedDoctor || !date || !selectedTime}
              sx={{
                borderRadius: 3,
                py: 1.5,
                fontWeight: "bold",
                textTransform: "none",
                boxShadow: "0px 4px 12px rgba(25,118,210,0.3)",
              }}
            >
              Confirm Appointment
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default AppointmentBooking;