from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from .models import Sala, Reserva

User = get_user_model()

class ApiTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(username="admin", password="123")
        self.sala = Sala.objects.create(nome="Sala Teste", capacidade=10)

    def test_login_ok(self):
        resp = self.client.post(
            "/api/auth/login/",
            {"username": "admin", "password": "123"},
            content_type="application/json"
        )
        self.assertEqual(resp.status_code, 200)
        self.assertIn("token", resp.json())

    def test_login_fail(self):
        resp = self.client.post(
            "/api/auth/login/",
            {"username": "admin", "password": "errado"},
            content_type="application/json"
        )
        self.assertEqual(resp.status_code, 401)

    def test_listar_salas(self):
        resp = self.client.get("/api/salas/")
        self.assertEqual(resp.status_code, 200)
        # DRF retorna lista direta
        self.assertTrue(isinstance(resp.json(), list))
        self.assertEqual(len(resp.json()), 1)

    def test_criar_reserva(self):
        login = self.client.post(
            "/api/auth/login/",
            {"username": "admin", "password": "123"},
            content_type="application/json"
        )
        token = login.json()["token"]
        resp = self.client.post(
            "/api/reservas/",
            {
                "sala_id": self.sala.id,
                "usuario_id": self.user.id,
                "data": "2025-09-21",
                "hora_inicio": "09:00",
                "hora_fim": "10:00"
            },
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Token {token}"
        )
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(Reserva.objects.count(), 1)
