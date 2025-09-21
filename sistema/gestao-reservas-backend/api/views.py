from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import User, Sala, Reserva
import json

@csrf_exempt
def login(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body.decode('utf-8'))  # Decodifica o body
            username = data.get("username")
            password = data.get("password")

            try:
                user = User.objects.get(username=username, password=password)
                return JsonResponse({
                    "status": "ok",
                    "token": "fake-jwt-token",
                    "user": {"id": user.id, "nivel_acesso": user.nivel_acesso}
                })
            except User.DoesNotExist:
                return JsonResponse({"status": "erro", "message": "Credenciais inválidas"}, status=401)

        except json.JSONDecodeError:
            return JsonResponse({"status": "erro", "message": "Dados inválidos"}, status=400)
        except Exception as e:
            return JsonResponse({"status": "erro", "message": str(e)}, status=400)

    return JsonResponse({"status": "erro", "message": "Método não permitido"}, status=405)


def salas(request):
    salas = list(Sala.objects.values("id", "nome", "capacidade"))
    return JsonResponse({"salas": salas})


def reservas(request):
    reservas = list(
        Reserva.objects.values("id", "sala__nome", "usuario", "data", "hora_inicio", "hora_fim")
    )
    return JsonResponse({"reservas": reservas})