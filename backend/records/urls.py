from django.urls import path
from .views import (PatientListAPIView, PatientDetailAPIView, PrescriptionListAPIView, PatientPrescriptionAPIView, patient_register, doctor_register, doctor_list, book_appointment, available_slots, my_appointments, cancel_appointment, doctor_appointments, complete_appointment, AllPrescriptionsAPIView, send_otp,verify_otp, pending_doctors, approve_doctor, delete_doctor_account, profile_view, my_notifications, mark_notifications_read, upload_report, get_reports)

urlpatterns = [
    path('patients/', PatientListAPIView.as_view()),
    path('patients/<int:patient_id>/prescriptions/', PrescriptionListAPIView.as_view()),
    path('patients/<int:pk>/', PatientDetailAPIView.as_view()),
    path('my-prescriptions/', PatientPrescriptionAPIView.as_view()),
    path('patient-register/', patient_register),
    path('doctor-register/', doctor_register),
    path('doctors/', doctor_list),
    path('appointments/book/', book_appointment),
    path('appointments/slots/<int:doctor_id>/', available_slots),
    path('appointments/my/', my_appointments),
    path('appointments/cancel/<int:appointment_id>/', cancel_appointment),
    path('appointments/doctor/', doctor_appointments),
    path('appointments/complete/<int:appointment_id>/', complete_appointment),
    path('prescriptions/', AllPrescriptionsAPIView.as_view()),
    path('send-otp/', send_otp, name="send-otp"),
    path('verify-otp/', verify_otp, name="verify-otp"),
    path('admin/pending-doctors/', pending_doctors),
    path('admin/approve-doctor/<int:doctor_id>/', approve_doctor),
    path('doctor/delete-account/', delete_doctor_account),
    path('profile/', profile_view),
    path('notifications/', my_notifications),
    path('notifications/read/', mark_notifications_read),
    path("upload-report/", upload_report),
    path("patients/<int:patient_id>/reports/", get_reports),
]