from flask import Blueprint, request, jsonify
from src.models.sala import Sala, db
from src.routes.auth import token_required, admin_required
import json

salas_bp = Blueprint('salas', __name__)

@salas_bp.route('/salas', methods=['GET'])
@token_required
def get_salas(current_user):
    """Listar todas as salas ativas"""
    try:
        # Parâmetros de filtro
        tipo = request.args.get('tipo')
        capacidade_min = request.args.get('capacidade_min', type=int)
        equipamento = request.args.get('equipamento')
        
        query = Sala.query.filter_by(ativa=True)
        
        if tipo:
            query = query.filter(Sala.tipo == tipo)
        
        if capacidade_min:
            query = query.filter(Sala.capacidade >= capacidade_min)
        
        if equipamento:
            query = query.filter(Sala.equipamentos.contains(equipamento))
        
        salas = query.all()
        
        return jsonify({
            'salas': [sala.to_dict() for sala in salas],
            'total': len(salas)
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

@salas_bp.route('/salas/<int:sala_id>', methods=['GET'])
@token_required
def get_sala(current_user, sala_id):
    """Obter detalhes de uma sala específica"""
    try:
        sala = Sala.query.get_or_404(sala_id)
        
        if not sala.ativa:
            return jsonify({'message': 'Sala não encontrada'}), 404
        
        return jsonify({'sala': sala.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

@salas_bp.route('/salas', methods=['POST'])
@token_required
@admin_required
def create_sala(current_user):
    """Criar nova sala (apenas administradores)"""
    try:
        data = request.get_json()
        
        if not data or not all(k in data for k in ['nome', 'capacidade', 'localizacao', 'tipo']):
            return jsonify({'message': 'Nome, capacidade, localização e tipo são obrigatórios'}), 400
        
        # Verificar se sala já existe
        if Sala.query.filter_by(nome=data['nome']).first():
            return jsonify({'message': 'Sala com este nome já existe'}), 400
        
        # Processar equipamentos (converter lista para JSON string)
        equipamentos = data.get('equipamentos', [])
        if isinstance(equipamentos, list):
            equipamentos = json.dumps(equipamentos)
        
        sala = Sala(
            nome=data['nome'],
            capacidade=data['capacidade'],
            localizacao=data['localizacao'],
            tipo=data['tipo'],
            equipamentos=equipamentos
        )
        
        db.session.add(sala)
        db.session.commit()
        
        return jsonify({
            'message': 'Sala criada com sucesso',
            'sala': sala.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

@salas_bp.route('/salas/<int:sala_id>', methods=['PUT'])
@token_required
@admin_required
def update_sala(current_user, sala_id):
    """Atualizar sala existente (apenas administradores)"""
    try:
        sala = Sala.query.get_or_404(sala_id)
        data = request.get_json()
        
        if not data:
            return jsonify({'message': 'Dados não fornecidos'}), 400
        
        # Verificar se novo nome já existe (exceto para a própria sala)
        if 'nome' in data and data['nome'] != sala.nome:
            if Sala.query.filter_by(nome=data['nome']).first():
                return jsonify({'message': 'Sala com este nome já existe'}), 400
        
        # Atualizar campos
        if 'nome' in data:
            sala.nome = data['nome']
        if 'capacidade' in data:
            sala.capacidade = data['capacidade']
        if 'localizacao' in data:
            sala.localizacao = data['localizacao']
        if 'tipo' in data:
            sala.tipo = data['tipo']
        if 'equipamentos' in data:
            equipamentos = data['equipamentos']
            if isinstance(equipamentos, list):
                equipamentos = json.dumps(equipamentos)
            sala.equipamentos = equipamentos
        if 'ativa' in data:
            sala.ativa = data['ativa']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Sala atualizada com sucesso',
            'sala': sala.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

@salas_bp.route('/salas/<int:sala_id>', methods=['DELETE'])
@token_required
@admin_required
def delete_sala(current_user, sala_id):
    """Desativar sala (soft delete) - apenas administradores"""
    try:
        sala = Sala.query.get_or_404(sala_id)
        
        # Verificar se há reservas futuras
        from src.models.reserva import Reserva
        from datetime import datetime
        
        reservas_futuras = Reserva.query.filter(
            Reserva.sala_id == sala_id,
            Reserva.data_inicio > datetime.utcnow(),
            Reserva.status == 'confirmada'
        ).count()
        
        if reservas_futuras > 0:
            return jsonify({
                'message': f'Não é possível desativar sala com {reservas_futuras} reservas futuras'
            }), 400
        
        sala.ativa = False
        db.session.commit()
        
        return jsonify({'message': 'Sala desativada com sucesso'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

@salas_bp.route('/salas/tipos', methods=['GET'])
@token_required
def get_tipos_sala(current_user):
    """Obter lista de tipos de sala disponíveis"""
    tipos = ['Reunião', 'Auditório', 'Laboratório', 'Sala de Treinamento', 'Escritório', 'Coworking']
    return jsonify({'tipos': tipos}), 200

