import React, { useEffect, useState } from "react";
import MainLayout from "../layout/MainLayout";
import api from "../api/axios";
import AppointmentBooking from "../components/AppointmentBooking";
import MyAppointments from "../components/MyAppointments";
import jsPDF from "jspdf";

import {
  Typography,
  Paper,
  Divider,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  Button,
  Box
} from "@mui/material";

function PatientDashboard() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [refreshFlag, setRefreshFlag] = useState(false);

  // ✅ Fetch Prescriptions
  const fetchPrescriptions = async () => {
    try {
      const res = await api.get("my-prescriptions/");
      setPrescriptions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, [refreshFlag]);

  // ✅ Refresh after booking appointment
  const handleAppointmentBooked = () => {
    setRefreshFlag((prev) => !prev);
  };

  // ✅ PDF Generation for patient prescriptions
  const generatePDF = (prescription, action = "download") => {
  const doc = new jsPDF();

  // Header
  doc.setFillColor(25, 118, 210);
  doc.rect(0, 0, 210, 35, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text("City Hospital", 20, 18);

  doc.setFontSize(10);
  doc.text("Healthcare with Care", 20, 26);

  // Reset color
  doc.setTextColor(0, 0, 0);

  // Patient + Doctor Info
  doc.setFontSize(12);
  doc.text(`Patient: ${prescription.patient_name || "-"}`, 20, 50);
  doc.text(`Doctor: ${prescription.doctor_name || "-"}`, 20, 58);
  doc.text(`Date: ${prescription.date}`, 150, 50);

  doc.line(20, 65, 190, 65);

  // Diagnosis
  doc.setFontSize(13);
  doc.text("Diagnosis", 20, 80);
  doc.setFontSize(11);
  doc.text(prescription.diagnosis || "-", 20, 88);

  // Medicines
  doc.setFontSize(13);
  doc.text("Medicines", 20, 105);
  doc.setFontSize(11);
  doc.text(prescription.medicines || "-", 20, 113);

  // Notes
  doc.setFontSize(13);
  doc.text("Notes", 20, 130);
  doc.setFontSize(11);
  doc.text(prescription.notes || "-", 20, 138);

  // Footer
  doc.line(20, 160, 190, 160);
  doc.setFontSize(10);
  doc.text("Doctor Signature", 140, 170);

  // Actions
  if (action === "download") {
    doc.save(`prescription-${prescription.patient_name}.pdf`);
  } else if (action === "open") {
    window.open(doc.output("bloburl"));
  } else if (action === "print") {
    const win = window.open(doc.output("bloburl"));
    win.onload = () => win.print();
  }
};

  return (
    <MainLayout>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold" }}>
        Patient Dashboard
      </Typography>

      {/* ----------------- APPOINTMENTS SECTION ----------------- */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
          My Appointments
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <MyAppointments refreshFlag={refreshFlag} />
      </Paper>

      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
          Book Appointment
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <AppointmentBooking onBooked={handleAppointmentBooked} />
      </Paper>

      {/* ----------------- PRESCRIPTIONS SECTION ----------------- */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
          My Prescriptions
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: "#f0f0f0" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Diagnosis</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Medicines</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Notes</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {prescriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    No prescriptions found
                  </TableCell>
                </TableRow>
              ) : (
                prescriptions.map((p) => (
                  <TableRow key={p.id} hover>
                    <TableCell>{p.date}</TableCell>
                    <TableCell>{p.diagnosis}</TableCell>
                    <TableCell>{p.medicines}</TableCell>
                    <TableCell>{p.notes}</TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => generatePDF(p, "download")}
                        >
                          Download
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => generatePDF(p, "open")}
                        >
                          Open
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => generatePDF(p, "print")}
                        >
                          Print
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </MainLayout>
  );
}

export default PatientDashboard;