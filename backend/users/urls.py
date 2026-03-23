from django.urls import path
from .views import login_view, doctor_profile

urlpatterns = [
    path("login/", login_view, name="login"),
    path("profile/", doctor_profile),
]