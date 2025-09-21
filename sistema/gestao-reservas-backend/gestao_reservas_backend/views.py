from django.http import HttpResponse

def home(request):
    return HttpResponse("<h1>Bem-vindo ao Backend de Gestão de Reservas 🚀</h1>")
