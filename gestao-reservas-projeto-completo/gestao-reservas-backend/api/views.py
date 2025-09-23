from rest_framework import viewsets, permissions
from .models import Sala, Reserva
from .serializers import SalaSerializer, ReservaSerializer, UserSerializer
from .permissions import IsAdminOrReadOnly
from django.contrib.auth import get_user_model

User = get_user_model()

class SalaViewSet(viewsets.ModelViewSet):
    queryset = Sala.objects.all()
    serializer_class = SalaSerializer
    permission_classes = [IsAdminOrReadOnly]


class ReservaViewSet(viewsets.ModelViewSet):
    queryset = Reserva.objects.select_related("sala", "usuario").all()
    serializer_class = ReservaSerializer
    permission_classes = [permissions.IsAuthenticated]


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]
