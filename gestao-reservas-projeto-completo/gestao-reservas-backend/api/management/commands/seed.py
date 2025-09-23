from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from api.models import Sala, Reserva
from datetime import date, time

User = get_user_model()

class Command(BaseCommand):
    help = "Popula o banco com dados iniciais"

    def handle(self, *args, **kwargs):
        if not User.objects.filter(username="admin").exists():
            User.objects.create_superuser("admin", "admin@example.com", "123")
            self.stdout.write(self.style.SUCCESS("Usuário admin criado"))

        salas = [
            ("Sala 1", 30),
            ("Sala 2", 20),
            ("Sala 3", 15),
        ]
        for nome, capacidade in salas:
            Sala.objects.get_or_create(nome=nome, capacidade=capacidade)
        self.stdout.write(self.style.SUCCESS("Salas criadas"))

        user = User.objects.first()
        sala = Sala.objects.first()
        Reserva.objects.get_or_create(
            sala=sala,
            usuario=user,
            data=date.today(),
            hora_inicio=time(9, 0),
            hora_fim=time(10, 0),
        )
        self.stdout.write(self.style.SUCCESS("Reserva de exemplo criada"))
