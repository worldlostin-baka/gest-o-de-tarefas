from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SalaViewSet, ReservaViewSet, UserViewSet

router = DefaultRouter()
router.register("salas", SalaViewSet)
router.register("reservas", ReservaViewSet)
router.register("usuarios", UserViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
