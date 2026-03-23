import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import jsPDF from "jspdf";
import api from "../api/axios";

import {
  Typography,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box
} from "@mui/material";

function PatientDetails() {

  const { id } = useParams();

  const [patient, setPatient] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);

  const [open, setOpen] = useState(false);

  const [diagnosis, setDiagnosis] = useState("");
  const [medicines, setMedicines] = useState("");
  const [notes, setNotes] = useState("");
  const [reports, setReports] = useState([]);

  const fetchReports = async () => {
    try {
      const res = await api.get(`patients/${id}/reports/`);
      setReports(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchPatient = async () => {
    try {
      const response = await api.get(`patients/${id}/`);
      setPatient(response.data);
    } catch (error) {
      console.error("Error fetching patient:", error);
    }
  };

  const fetchPrescriptions = async () => {
    try {
      // ✅ FIXED ENDPOINT
      const response = await api.get(`patients/${id}/prescriptions/`);
      setPrescriptions(response.data);
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
    }
  };

  const addPrescription = async () => {
    try {
      // ✅ FIXED ENDPOINT + VARIABLE NAME
      await api.post(
        `patients/${id}/prescriptions/`,
        {
          diagnosis,
          medicines,
          notes
        }
      );

      setOpen(false);
      setDiagnosis("");
      setMedicines("");
      setNotes("");

      fetchPrescriptions();

    } catch (error) {
      console.error("Error adding prescription:", error.response?.data);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchPatient();
      await fetchPrescriptions();
    };

    loadData();
  }, [id]);

  if (!patient) {
    return (
      <MainLayout>
        <Typography variant="h6">Loading patient details...</Typography>
      </MainLayout>
    );
  }

const generatePDF = (prescription, action = "download") => {
  const doc = new jsPDF();

  // Header
  doc.setFillColor(25, 118, 210);
  doc.rect(0, 0, 210, 35, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text("City Hospital", 20, 18);

  doc.setFontSize(10);
  doc.text("Medical Prescription", 20, 26);

  // Reset
  doc.setTextColor(0, 0, 0);

  // Patient Info
  doc.setFontSize(12);
  doc.text(`Patient: ${patient.name}`, 20, 50);
  doc.text(`Age: ${patient.age}`, 20, 58);
  doc.text(`Gender: ${patient.gender}`, 20, 66);

  // Doctor Info
  doc.text(`Doctor: ${prescription.doctor_name || "Doctor"}`, 140, 50);
  doc.text(`Date: ${prescription.date}`, 140, 58);

  doc.line(20, 75, 190, 75);

  // Content
  doc.setFontSize(13);
  doc.text("Diagnosis", 20, 90);
  doc.setFontSize(11);
  doc.text(prescription.diagnosis || "-", 20, 98);

  doc.setFontSize(13);
  doc.text("Medicines", 20, 115);
  doc.setFontSize(11);
  doc.text(prescription.medicines || "-", 20, 123);

  doc.setFontSize(13);
  doc.text("Notes", 20, 140);
  doc.setFontSize(11);
  doc.text(prescription.notes || "-", 20, 148);

  // Footer
  doc.line(20, 165, 190, 165);
  doc.setFontSize(10);
  doc.text("Doctor Signature", 140, 175);

  // Actions
  if (action === "download") {
    doc.save(`prescription-${patient.name}.pdf`);
  } else if (action === "open") {
    window.open(doc.output("bloburl"));
  } else if (action === "print") {
    const win = window.open(doc.output("bloburl"));
    win.onload = () => win.print();
  }
};

  return (
    <MainLayout>

      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
        Patient Details
      </Typography>

      {/* Patient Info Card */}

      <Card sx={{ mb: 4 }}>
        <CardContent>

          <Grid container spacing={3}>

            <Grid item xs={6}>
              <Typography variant="subtitle2">Name</Typography>
              <Typography variant="h6">{patient.name}</Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="subtitle2">Age</Typography>
              <Typography variant="h6">{patient.age}</Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="subtitle2">Gender</Typography>
              <Typography variant="h6">{patient.gender}</Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="subtitle2">Phone</Typography>
              <Typography variant="h6">{patient.phone}</Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2">Disease</Typography>
              <Typography variant="h6">{patient.disease}</Typography>
            </Grid>

          </Grid>

        </CardContent>
      </Card>

      {/* Prescriptions Section */}

      <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
        Prescriptions
      </Typography>

      <Button
        variant="contained"
        sx={{ mb: 2 }}
        onClick={() => setOpen(true)}
      >
        Add Prescription
      </Button>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Diagnosis</TableCell>
            <TableCell>Medicines</TableCell>
            <TableCell>Notes</TableCell>
            <TableCell>Download</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {prescriptions?.map((p) => (
            <TableRow key={p.id}>
              <TableCell>{p.date}</TableCell>
              <TableCell>{p.diagnosis}</TableCell>
              <TableCell>{p.medicines}</TableCell>
              <TableCell>{p.notes}</TableCell>
              <TableCell>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => generatePDF(p, "download")}
                  sx={{ mr: 1 }}
                >
                  Download
                </Button>

                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => generatePDF(p, "open")}
                  sx={{ mr: 1 }}
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Dialog */}

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>Add Prescription</DialogTitle>

        <DialogContent>
          <TextField
            label="Diagnosis"
            fullWidth
            margin="normal"
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
          />

          <TextField
            label="Medicines"
            fullWidth
            margin="normal"
            value={medicines}
            onChange={(e) => setMedicines(e.target.value)}
          />

          <TextField
            label="Notes"
            fullWidth
            margin="normal"
            multiline
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>
            Cancel
          </Button>

          <Button variant="contained" onClick={addPrescription}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
  Health Reports
</Typography>

  {reports.length === 0 ? (
    <Typography>No reports uploaded</Typography>
      ) : (
      reports.map((r) => (
        <Box key={r.id} sx={{ mb: 1 }}>
        <a
          href={`http://127.0.0.1:8000${r.file}`}
          target="_blank"
          rel="noreferrer"
        >
          View Report ({new Date(r.uploaded_at).toLocaleDateString()})
      </a>
    </Box>
      ))
    )}

    </MainLayout>
  );
}

export default PatientDetails;