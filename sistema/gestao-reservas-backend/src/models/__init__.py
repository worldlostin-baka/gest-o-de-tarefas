# Importações dos modelos para garantir que sejam registrados corretamente
from .user import User, db
from .sala import Sala
from .reserva import Reserva

__all__ = ['User', 'Sala', 'Reserva', 'db']

