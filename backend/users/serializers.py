from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers

class CustomTokenSerializer(TokenObtainPairSerializer):
    
    def validate(self, attrs):
        data = super().validate(attrs)
        
        if self.user.role == "doctor" and not self.user.is_approved:
            raise serializers.ValidationError("Doctor not approved by admin")
        
        return data