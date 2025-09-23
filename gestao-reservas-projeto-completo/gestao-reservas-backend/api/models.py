from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    nivel_acesso = models.CharField(max_length=20, default="user")

    def __str__(self):
        return self.username

class Sala(models.Model):
    nome = models.CharField(max_length=100)
    capacidade = models.IntegerField()

    def __str__(self):
        return self.nome

class Reserva(models.Model):
    sala = models.ForeignKey(Sala, on_delete=models.CASCADE)
    usuario = models.ForeignKey(User, on_delete=models.CASCADE)
    data = models.DateField()
    hora_inicio = models.TimeField()
    hora_fim = models.TimeField()

    def __str__(self):
        return f"{self.usuario.username} - {self.sala.nome} ({self.data})"
