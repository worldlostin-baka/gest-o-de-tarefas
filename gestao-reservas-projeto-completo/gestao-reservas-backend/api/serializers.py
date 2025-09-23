from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Sala, Reserva

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "nivel_acesso"]

class SalaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sala
        fields = ["id", "nome", "capacidade"]

class ReservaSerializer(serializers.ModelSerializer):
    sala = SalaSerializer(read_only=True)
    usuario = UserSerializer(read_only=True)

    sala_id = serializers.PrimaryKeyRelatedField(
        queryset=Sala.objects.all(), source="sala", write_only=True
    )
    usuario_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source="usuario", write_only=True
    )

    class Meta:
        model = Reserva
        fields = [
            "id", "sala", "usuario", "data", "hora_inicio", "hora_fim",
            "sala_id", "usuario_id"
        ]
