from django.urls import path
from .views import login, salas, reservas

urlpatterns = [
    path('login/', login, name='login'),
    path('salas/', salas, name='salas'),
    path('reservas/', reservas, name='reservas'),
]