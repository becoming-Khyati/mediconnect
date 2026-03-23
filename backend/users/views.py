from django.contrib.auth import authenticate, login
from django.shortcuts import render, redirect
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

def login_view(request):
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password"]

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)

            # 👇 ROLE CHECK HAPPENS HERE
            if user.role == "doctor":
                return redirect("doctor-dashboard")

            elif user.role == "patient":
                return redirect("patient-dashboard")

        else:
            return render(request, "login.html", {"error": "Invalid credentials"})

    return render(request, "login.html")

#-------------------------- DOCTOR PROFILE --------------------------------------------------

@api_view(["GET", "PUT"])
@permission_classes([IsAuthenticated])
def doctor_profile(request):
    
    user = request.user
    
    if request.method == "GET":
        return Response ({
            "username": user.username,
            "specialization": user.specialization,
            "age": user.age,
            "gender": user.gender,
            "experience": user.experience,
            "qualification": user.qualification,
            "profile_picture": user.profile_picture.url if user.profile_picture else None
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
        "experience": user.experience,
        "qualification": user.qualification,
        "profile_picture": user.profile_picture.url if user.profile_picture else None
      })