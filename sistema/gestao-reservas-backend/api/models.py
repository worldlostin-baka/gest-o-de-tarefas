from django.db import models

class User(models.Model):
    username = models.CharField(max_length=100, unique=True)
    password = models.CharField(max_length=100)  # Nota: Em produção, use um campo hasheado
    nivel_acesso = models.CharField(max_length=50, default='user')

    def __str__(self):
        return self.username

class Sala(models.Model):
    nome = models.CharField(max_length=100)
    capacidade = models.IntegerField()

    def __str__(self):
        return self.nome

class Reserva(models.Model):
    sala = models.ForeignKey(Sala, on_delete=models.CASCADE)
    usuario = models.CharField(max_length=100)
    data = models.DateField()
    hora_inicio = models.TimeField()
    hora_fim = models.TimeField()

    def __str__(self):
        return f"{self.usuario} - {self.sala.nome} ({self.data})"