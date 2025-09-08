from src.models.user import db
from datetime import datetime

class Sala(db.Model):
    __tablename__ = 'salas'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    capacidade = db.Column(db.Integer, nullable=False)
    localizacao = db.Column(db.String(200), nullable=False)
    equipamentos = db.Column(db.Text)  # JSON string com lista de equipamentos
    tipo = db.Column(db.String(50), nullable=False)  # Reunião, Auditório, Laboratório, etc.
    ativa = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamento com reservas será definido após importação de todos os modelos
    # reservas = db.relationship('Reserva', backref='sala', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'capacidade': self.capacidade,
            'localizacao': self.localizacao,
            'equipamentos': self.equipamentos,
            'tipo': self.tipo,
            'ativa': self.ativa,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<Sala {self.nome}>'

