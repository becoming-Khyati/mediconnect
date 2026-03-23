from rest_framework import serializers
from .models import Patient, Prescription, Appointment, Notification, HealthReport
from users.models import User


# ------------------ PATIENT ------------------

class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = '__all__'
        read_only_fields = ["doctor", "user"]


# ------------------ PRESCRIPTION ------------------

class PrescriptionSerializer(serializers.ModelSerializer):
    
    doctor_name = serializers.CharField(source="doctor.username", read_only=True)
    patient_name = serializers.CharField(source="patient.name", read_only=True)
    
    class Meta:
        model = Prescription
        fields = '__all__'
        read_only_fields = ["doctor", "patient", "date"]


# ------------------ DOCTOR REGISTER ------------------

class DoctorSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = [ "username", "password", "specialization", "age", "gender", "experience", "qualification"]
        extra_kwargs = {
            "password": {"write_only": True}
        }

    def create(self, validated_data):

        validated_data["role"] = "doctor" 

        user = User.objects.create_user(
            username=validated_data["username"],
            password=validated_data["password"],
            role="doctor",
            specialization = validated_data.get("specialization"),
            age = validated_data.get("age"),
            gender = validated_data.get("gender"),
            experience = validated_data.get("experience"),
            qualification = validated_data.get("qualification"),
            is_approved=False
        )

        return user
    
    
    #------------------APPOINTMENT--------------------
    
class AppointmentSerializer(serializers.ModelSerializer):
    
    doctor_name = serializers.CharField(source="doctor.username", read_only=True)
    patient_name = serializers.CharField(source="patient.name", read_only=True)
    patient_id = serializers.IntegerField(source="patient.id", read_only=True)
    
    doctor_specialization = serializers.CharField(
        source="doctor.specialization",
        read_only = True
    )
    
    class Meta:
            model = Appointment
            fields = "__all__"
            read_only_fields = ["patient", "doctor"]
            
            
#------------------------------- NOTIFICATION -----------------------------------------

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields ="__all__"
        
#---------------------------- HEALTH REPORT -------------------------------------------

class HealthReportSerializer(serializers.ModelSerializer):
    
    patient_name = serializers.CharField(source="patient.name", read_only=True)
    
    class Meta:
        model = HealthReport
        fields = "__all__"