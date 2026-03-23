from django.contrib.auth.models import AbstractUser
from django.db import models

# Create your models here.

class User(AbstractUser):
    USER_ROLE_CHOICES = (
        ('doctor', 'Doctor'),
        ('patient', 'Patient'),
        ('admin', 'Admin'),
    )
    
    role = models.CharField(max_length=10, choices=USER_ROLE_CHOICES)
    specialization = models.CharField(max_length=100, blank=True, null=True)
    age = models.IntegerField(null=True, blank=True)
    gender = models.CharField(max_length=10, blank=True, null=True)
    experience = models.IntegerField(null=True, blank=True)
    qualification = models.CharField(max_length=50, null=True, blank=True)
    profile_picture = models.ImageField(upload_to="profiles/", null=True, blank=True)
    
    is_approved = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.username} ({self.role})"
    