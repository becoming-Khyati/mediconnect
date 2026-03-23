from django.contrib import admin
from .models import Patient, Prescription
# Register your models here.

admin.site.register(Patient)
admin.site.register(Prescription)