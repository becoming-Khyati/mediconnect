from django.shortcuts import render
from rest_framework import generics
from .models import Patient, Prescription, Appointment, OTP, Notification, HealthReport
from .serializers import (
    PatientSerializer,
    PrescriptionSerializer,
    DoctorSerializer,
    AppointmentSerializer,
    NotificationSerializer,
    HealthReportSerializer,
)
from rest_framework.permissions import IsAuthenticated
from .permissions import IsDoctor, IsPatient
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from users.models import User
from datetime import datetime, timedelta
from django.utils import timezone
from rest_framework import serializers
import random
from rest_framework_simplejwt.tokens import RefreshToken
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Q
from rest_framework.exceptions import NotFound


def create_notification(user, message):
    Notification.objects.create(user=user, message=message)


# ------------------ PATIENT LIST ------------------

class PatientListAPIView(generics.ListCreateAPIView):
    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        return Patient.objects.filter(
            Q(doctor=user) | Q(appointment__doctor=user)
        ).distinct()

    def perform_create(self, request, *args, **kwargs):
        phone = request.data.get("phone")

        if not phone:
            return Response({"error": "Phone is Required"}, status=400)

        user, created = User.objects.get_or_create(
            username=phone,
            defaults={
                "role": "patient"
            }
        )

        user.set_password(phone)
        user.is_active = True
        user.save()

        patient = Patient.objects.create(
            user=user,
            doctor=self.request.user,
            name=request.data.get("name"),
            phone=phone,
            age=request.data.get("age"),
            gender=request.data.get("gender"),
            disease=request.data.get("disease")
        )

        serializer = self.get_serializer(patient)
        return Response(serializer.data, status=201)


# ------------------ PATIENT DETAIL ------------------

class PatientDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        return Patient.objects.filter(
            Q(doctor=user) | Q(appointment__doctor=user)
        ).distinct()


# ------------------ PRESCRIPTION ------------------

class PrescriptionListAPIView(generics.ListCreateAPIView):
    serializer_class = PrescriptionSerializer
    permission_classes = [IsAuthenticated, IsDoctor]

    def get_queryset(self):
        patient_id = self.kwargs["patient_id"]
        return Prescription.objects.filter(patient_id=patient_id)

    def perform_create(self, serializer):
        patient_id = self.kwargs["patient_id"]

        try:
            patient = Patient.objects.get(id=patient_id, doctor=self.request.user)
        except Patient.DoesNotExist:
            raise NotFound("Patient not found")

        serializer.save(
            doctor=self.request.user,
            patient=patient
        )


# ------------------ PATIENT PRESCRIPTIONS ------------------

class PatientPrescriptionAPIView(generics.ListAPIView):
    serializer_class = PrescriptionSerializer
    permission_classes = [IsAuthenticated, IsPatient]

    def get_queryset(self):
        return Prescription.objects.filter(patient__user=self.request.user)


# ------------------ PATIENT REGISTER ------------------

@api_view(["POST"])
def patient_register(request):
    phone = request.data.get("phone")

    existing_patient = Patient.objects.filter(phone=phone).first()

    if existing_patient:
        return Response({
            "message": "Patient already exists",
            "name": existing_patient.name
        })

    user = User.objects.create_user(
        username=phone,
        password=phone,
        role="patient"
    )

    patient = Patient.objects.create(
        user=user,
        name=request.data.get("name"),
        phone=phone,
        age=request.data.get("age"),
        gender=request.data.get("gender")
    )

    return Response({"message": "Patient Registered"})


# ------------------ DOCTOR REGISTER ------------------

@api_view(["POST"])
def doctor_register(request):
    serializer = DoctorSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Doctor Registered"})

    return Response(serializer.errors, status=400)


# --------------------- DOCTOR LIST ---------------------

@api_view(["GET"])
def doctor_list(request):
    doctors = User.objects.filter(role="doctor").values("id", "username")
    return Response(doctors)


# ---------------------- APPOINTMENT ------------------------

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def book_appointment(request):
    try:
        patient = Patient.objects.get(user=request.user)
    except Patient.DoesNotExist:
        return Response({"error": "Patient not found"}, status=404)

    doctor_id = request.data.get("doctor")
    date = request.data.get("date")
    time = request.data.get("time")

    if not doctor_id or not date or not time:
        return Response({"error": "All fields required"}, status=400)

    if Appointment.objects.filter(
        doctor_id=doctor_id,
        date=date,
        time=time,
        status="booked"
    ).exists():
        return Response({"error": "Slot already booked"}, status=400)

    appointment = Appointment.objects.create(
        patient=patient,
        doctor_id=doctor_id,
        date=date,
        time=time
    )

    create_notification(
        patient.user,
        f"Appointment booked with Dr. {appointment.doctor.username} on {date} at {time}"
    )

    create_notification(
        appointment.doctor,
        f"New appointment booked by {patient.name} on {date} at {time}"
    )

    return Response({
        "message": "Appointment booked successfully",
        "appointment_id": appointment.id
    })


@api_view(["GET"])
def available_slots(request, doctor_id):
    date = request.GET.get("date")

    if not date:
        return Response({"error": "Date required"}, status=400)

    all_slots = [
        "10:00", "11:00", "12:00",
        "14:00", "15:00", "16:00"
    ]

    booked = Appointment.objects.filter(
        doctor_id=doctor_id,
        date=date,
        status="booked"
    ).values_list("time", flat=True)

    booked = [t.strftime("%H:%M") for t in booked]
    available = [slot for slot in all_slots if slot not in booked]

    return Response(available)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_appointments(request):
    try:
        patient = Patient.objects.get(user=request.user)
    except Patient.DoesNotExist:
        return Response({"error": "Patient not found"}, status=404)

    appointments = Appointment.objects.filter(patient=patient).order_by("-date")
    serializer = AppointmentSerializer(appointments, many=True)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def cancel_appointment(request, appointment_id):
    try:
        appointment = Appointment.objects.get(id=appointment_id)
    except Appointment.DoesNotExist:
        return Response({"error": "Appointment Not Found"}, status=404)

    if appointment.patient.user != request.user and appointment.doctor != request.user:
        return Response({"error": "Unauthorized"}, status=403)

    if appointment.status == "cancelled":
        return Response({"error": "Already cancelled"}, status=400)

    appointment_datetime = datetime.combine(appointment.date, appointment.time)
    now = timezone.now()
    appointment_datetime = timezone.make_aware(appointment_datetime)

    if appointment_datetime - now < timedelta(hours=4):
        return Response(
            {"error": "Cannot cancel within 4 hours of appointment"},
            status=400
        )

    appointment.status = "cancelled"
    appointment.save()

    create_notification(
        appointment.patient.user,
        f"Your appointment on {appointment.date} at {appointment.time} was cancelled"
    )

    create_notification(
        appointment.doctor,
        f"{appointment.patient.name}'s appointment was cancelled"
    )

    return Response({"message": "Appointment Cancelled"})


# -------------------------- DOCTOR APPOINTMENTS ---------------------------

@api_view(["GET"])
@permission_classes([IsAuthenticated, IsDoctor])
def doctor_appointments(request):
    appointments = Appointment.objects.filter(
        doctor=request.user
    ).order_by("-date", "-time")

    serializer = AppointmentSerializer(appointments, many=True)
    return Response(serializer.data)


# --------------------- COMPLETE APPOINTMENT -----------------------------

@api_view(["POST"])
@permission_classes([IsAuthenticated, IsDoctor])
def complete_appointment(request, appointment_id):
    try:
        appointment = Appointment.objects.get(id=appointment_id)
    except Appointment.DoesNotExist:
        return Response({"error": "Appointment not found"}, status=404)

    if appointment.doctor != request.user:
        return Response({"error": "Unauthorized"}, status=403)

    if appointment.status == "completed":
        return Response({"error": "Already completed"}, status=400)

    appointment.status = "completed"
    appointment.save()

    create_notification(
        appointment.patient.user,
        f"Your appointment on {appointment.date} has been completed"
    )

    create_notification(
        appointment.doctor,
        f"Appointment with {appointment.patient.name} marked as completed"
    )

    return Response({"message": "Appointment marked as completed"})


# -------------------------- PRESCRIPTION COUNT -------------------------------

class AllPrescriptionsAPIView(generics.ListAPIView):
    serializer_class = PrescriptionSerializer
    permission_classes = [IsAuthenticated, IsDoctor]

    def get_queryset(self):
        return Prescription.objects.filter(doctor=self.request.user)


# ------------------------------ GENERATE OTP -----------------------------------------------

@csrf_exempt
@api_view(['POST'])
def send_otp(request):
    phone = request.data.get("phone")

    if not phone:
        return Response({"error": "Phone required"}, status=400)

    if not Patient.objects.filter(phone=phone).exists():
        return Response({"error": "Patient not registered"}, status=404)

    otp = str(random.randint(100000, 999999))
    OTP.objects.create(phone=phone, otp=otp)

    print("OTP:", otp)

    return Response({"message": "OTP sent"})


# -------------------------------- VERIFY OTP --------------------------------------------------

@api_view(["POST"])
def verify_otp(request):
    phone = request.data.get("phone")
    otp = request.data.get("otp")

    try:
        otp_obj = OTP.objects.filter(phone=phone).latest("created_at")
    except OTP.DoesNotExist:
        return Response({"error": "OTP not found"}, status=400)

    if timezone.now() - otp_obj.created_at > timedelta(minutes=5):
        return Response({"error": "OTP Expired"}, status=400)

    if otp_obj.otp != otp:
        return Response({"error": "Invalid OTP"}, status=400)

    patient = Patient.objects.get(phone=phone)
    user = patient.user

    refresh = RefreshToken.for_user(user)

    return Response({
        "access": str(refresh.access_token),
        "refresh": str(refresh)
    })


# ----------------------------------- ADMIN: PENDING DOCTORS ------------------------------------------

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def pending_doctors(request):
    if request.user.role != "admin":
        return Response({"error": "Unauthorized"}, status=403)

    doctors = User.objects.filter(role="doctor", is_approved=False)
    data = [{"id": d.id, "username": d.username, "specialization": d.specialization} for d in doctors]

    return Response(data)


# ------------------------------------- ADMIN: APPROVE DOCTOR --------------------------------------------------

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def approve_doctor(request, doctor_id):
    if request.user.role != "admin":
        return Response({"error": "Unauthorized"}, status=403)

    try:
        doctor = User.objects.get(id=doctor_id, role="doctor")
    except User.DoesNotExist:
        return Response({"error": "Doctor not found"}, status=404)

    doctor.is_approved = True
    doctor.save()

    return Response({"message": "Doctor Approved"})


# ------------------------------------- DELETE API ---------------------------------------------------

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_doctor_account(request):
    user = request.user

    if user.role != "doctor":
        return Response({"error": "Only doctors can delete account"}, status=403)

    user.delete()

    return Response({"message": "Account deleted successfully"})


# ------------------ PROFILE (DOCTOR + PATIENT) ------------------

@api_view(["GET", "PUT"])
@permission_classes([IsAuthenticated])
def profile_view(request):
    user = request.user

    if user.role == "doctor":
        if request.method == "GET":
            return Response({
                "username": user.username,
                "specialization": user.specialization,
                "age": user.age,
                "gender": user.gender,
                "profile_picture": request.build_absolute_uri(user.profile_picture.url) if user.profile_picture else None,
                "role": "doctor"
            })

        elif request.method == "PUT":
            user.specialization = request.data.get("specialization", user.specialization)
            user.age = request.data.get("age", user.age)
            user.gender = request.data.get("gender", user.gender)

            if "profile_picture" in request.FILES:
                user.profile_picture = request.FILES["profile_picture"]

            user.save()

            return Response({
                "username": user.username,
                "specialization": user.specialization,
                "age": user.age,
                "gender": user.gender,
                "profile_picture": request.build_absolute_uri(user.profile_picture.url) if user.profile_picture else None,
                "role": "doctor"
            })

    elif user.role == "patient":
        try:
            patient = Patient.objects.get(user=user)
        except Patient.DoesNotExist:
            return Response({"error": "Patient not found"}, status=404)

        if request.method == "GET":
            return Response({
                "name": patient.name,
                "phone": patient.phone,
                "age": patient.age,
                "gender": patient.gender,
                "role": "patient"
            })

        elif request.method == "PUT":
            patient.name = request.data.get("name", patient.name)
            patient.age = request.data.get("age", patient.age)
            patient.gender = request.data.get("gender", patient.gender)
            patient.save()

            return Response({
                "name": patient.name,
                "phone": patient.phone,
                "age": patient.age,
                "gender": patient.gender,
                "role": "patient"
            })

    return Response({"error": "Invalid user role"}, status=400)


# ----------------------------- NOTIFICATION -------------------------------------------

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_notifications(request):
    notifications = Notification.objects.filter(user=request.user).order_by("-created_at")
    serializer = NotificationSerializer(notifications, many=True)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def mark_notifications_read(request):
    Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
    return Response({"message": "Notifications marked as read"})


# ---------------------------- UPLOAD REPORT ----------------------------------------------------

@api_view(["POST"])
@permission_classes([IsAuthenticated, IsPatient])
def upload_report(request):
    try:
        patient = Patient.objects.get(user=request.user)
    except Patient.DoesNotExist:
        return Response({"error": "Patient not found"}, status=404)

    file = request.FILES.get("file")

    if not file:
        return Response({"error": "File Required"}, status=400)

    report = HealthReport.objects.create(
        patient=patient,
        file=file
    )

    serializer = HealthReportSerializer(report)
    return Response(serializer.data)


# ------------------------------- GET REPORTS -------------------------------------------------------

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_reports(request, patient_id):
    user = request.user
    reports = HealthReport.objects.filter(patient_id=patient_id).order_by("-uploaded_at")

    if user.role == "doctor":
        reports = reports.filter(
            Q(patient__doctor=user) | Q(patient__appointment__doctor=user)
        ).distinct()

    elif user.role == "patient":
        reports = reports.filter(patient__user=user)

    else:
        return Response({"error": "Unauthorized"}, status=403)

    serializer = HealthReportSerializer(reports, many=True)
    return Response(serializer.data)