from django.db import models
from users.models import User

# ------------------ PATIENT ------------------

class Patient(models.Model):

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        limit_choices_to={'role': 'patient'},
        null=True,
        blank=True
    )

    doctor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="patients",
        limit_choices_to={'role': 'doctor'}
    )

    name = models.CharField(max_length=50, blank=True)
    age = models.IntegerField()
    gender = models.CharField(max_length=10)
    disease = models.CharField(max_length=50, blank=True)
    phone = models.CharField(max_length=15, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


# ------------------ PRESCRIPTION ------------------

class Prescription(models.Model):

    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name='prescriptions'
    )

    doctor = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        limit_choices_to={'role': 'doctor'}
    )

    diagnosis = models.TextField()
    medicines = models.TextField()
    notes = models.TextField(blank=True)
    date = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.patient.name} - {self.date}"
    
    
    #------------------APPOINTMENT---------------------
    
class Appointment(models.Model):
        
        patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
        doctor = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'doctor'})
        
        date = models.DateField()
        time = models.TimeField()
        
        status = models.CharField(
            max_length=20,
            choices=[
                ("booked", "Booked"),
                ("completed", "Completed"),
                ("cancelled", "Cancelled")
            ],
            default="booked"
        )
        
        def __str__(self):
            return f"{self.patient.name} - {self.doctor.username} - {self.date} {self.time}"
        
# ------------------------------ OTP -----------------------------------------------------------------

class OTP(models.Model):
    phone = models.CharField(max_length=15)
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.phone} - {self.otp}"
    

# ------------------------------- NOTIFICATIONS -------------------------------------------------------------

class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.message[:20]}"
    

#---------------------------------- PATIENT HEALTH REPORTS -------------------------------------------------------

class HealthReport(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name="reports")
    file = models.FileField(upload_to="health-reports/")
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.patient.name} - Report"
    
    
    
    