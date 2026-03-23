import React, { useEffect, useState } from "react";
import MainLayout from "../layout/MainLayout";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import api from "../api/axios";

function Patients() {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [patients, setPatients] = useState([]);

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [disease, setDisease] = useState("");
  const [phone, setPhone] = useState("");

  const [search, setSearch] = useState("");
  const [editingPatient, setEditingPatient] = useState(null);

  const handleOpen = () => {
    setEditingPatient(null);
    setName("");
    setAge("");
    setGender("");
    setDisease("");
    setPhone("");
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingPatient(null);
  };

  const handleEdit = (patient) => {
    setEditingPatient(patient);
    setName(patient.name);
    setAge(patient.age);
    setGender(patient.gender);
    setDisease(patient.disease);
    setPhone(patient.phone);
    setOpen(true);
  };

  const fetchPatients = async () => {
    try {
      const response = await api.get("patients/");
      setPatients(response.data);
    } catch (error) {
      console.error("Fetch patients failed:", error);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const addPatient = async () => {
    try {
      await api.post("patients/", {
        name,
        age: Number(age),
        gender,
        disease,
        phone,
      });

      handleClose();
      fetchPatients();
    } catch (error) {
      if (error.response) {
        console.log("Backend error:", error.response.data);
      } else {
        console.log("Network error:", error.message);
      }
      alert("Failed to add patient");
    }
  };

  const updatePatient = async () => {
    try {
      await api.put(`patients/${editingPatient.id}/`, {
        name,
        age: Number(age),
        gender,
        disease,
        phone,
      });

      handleClose();
      fetchPatients();
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update patient");
    }
  };

  const deletePatient = async (id) => {
    try {
      await api.delete(`patients/${id}/`);
      fetchPatients();
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete patient");
    }
  };

  return (
    <MainLayout>
      <Typography variant="h4" sx={{ fontWeight: "bold", marginBottom: 3 }}>
        Patients
      </Typography>

      <Button
        variant="contained"
        color="primary"
        sx={{ marginBottom: 3 }}
        onClick={handleOpen}
      >
        Add Patient
      </Button>

      <TextField
        label="Search Patient"
        variant="outlined"
        fullWidth
        sx={{ marginBottom: 3 }}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Age</TableCell>
              <TableCell>Gender</TableCell>
              <TableCell>Disease</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {patients
              .filter((patient) =>
                patient.name?.toLowerCase().includes(search.toLowerCase())
              )
              .map((patient) => (
                <TableRow
                  key={patient.id}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() => navigate(`/patients/${patient.id}`)}
                >
                  <TableCell>{patient.name}</TableCell>
                  <TableCell>{patient.age}</TableCell>
                  <TableCell>{patient.gender}</TableCell>
                  <TableCell>{patient.disease}</TableCell>
                  <TableCell>{patient.phone}</TableCell>

                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ marginRight: 1 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(patient);
                      }}
                    >
                      Edit
                    </Button>

                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm("Delete this patient?")) {
                          deletePatient(patient.id);
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>
          {editingPatient ? "Edit Patient" : "Add Patient"}
        </DialogTitle>

        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <TextField
            label="Age"
            fullWidth
            margin="normal"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />

          <TextField
            label="Gender"
            fullWidth
            margin="normal"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          />

          <TextField
            label="Disease"
            fullWidth
            margin="normal"
            value={disease}
            onChange={(e) => setDisease(e.target.value)}
          />

          <TextField
            label="Phone"
            fullWidth
            margin="normal"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>

          <Button
            variant="contained"
            onClick={editingPatient ? updatePatient : addPatient}
            disabled={!name || !age || !gender || !phone}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
}

export default Patients;