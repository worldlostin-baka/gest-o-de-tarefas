from flask import Blueprint, request, jsonify
from src.models.reserva import Reserva, db
from src.models.sala import Sala
from src.routes.auth import token_required, admin_required
from datetime import datetime, timedelta
from sqlalchemy import and_, or_

reservas_bp = Blueprint('reservas', __name__)

@reservas_bp.route('/reservas', methods=['GET'])
@token_required
def get_reservas(current_user):
    """Listar reservas do usuário ou todas (se admin)"""
    try:
        # Parâmetros de filtro
        start_date = request.args.get('start')
        end_date = request.args.get('end')
        sala_id = request.args.get('sala_id', type=int)
        status = request.args.get('status')
        
        # Admins podem ver todas as reservas, usuários apenas as suas
        if current_user.nivel_acesso == 'admin':
            query = Reserva.query
        else:
            query = Reserva.query.filter_by(usuario_id=current_user.id)
        
        # Aplicar filtros
        if start_date:
            start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            query = query.filter(Reserva.data_fim >= start_dt)
        
        if end_date:
            end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            query = query.filter(Reserva.data_inicio <= end_dt)
        
        if sala_id:
            query = query.filter_by(sala_id=sala_id)
        
        if status:
            query = query.filter_by(status=status)
        
        reservas = query.order_by(Reserva.data_inicio).all()
        
        # Incluir dados da sala e usuário
        result = []
        for reserva in reservas:
            reserva_dict = reserva.to_dict()
            reserva_dict['sala'] = reserva.sala.to_dict() if reserva.sala else None
            reserva_dict['usuario'] = reserva.usuario.to_dict() if reserva.usuario else None
            result.append(reserva_dict)
        
        return jsonify({
            'reservas': result,
            'total': len(result)
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

@reservas_bp.route('/reservas/<int:reserva_id>', methods=['GET'])
@token_required
def get_reserva(current_user, reserva_id):
    """Obter detalhes de uma reserva específica"""
    try:
        reserva = Reserva.query.get_or_404(reserva_id)
        
        # Verificar permissão (usuário só pode ver suas próprias reservas)
        if current_user.nivel_acesso != 'admin' and reserva.usuario_id != current_user.id:
            return jsonify({'message': 'Acesso negado'}), 403
        
        reserva_dict = reserva.to_dict()
        reserva_dict['sala'] = reserva.sala.to_dict() if reserva.sala else None
        reserva_dict['usuario'] = reserva.usuario.to_dict() if reserva.usuario else None
        
        return jsonify({'reserva': reserva_dict}), 200
        
    except Exception as e:
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

@reservas_bp.route('/reservas', methods=['POST'])
@token_required
def create_reserva(current_user):
    """Criar nova reserva"""
    try:
        data = request.get_json()
        
        required_fields = ['titulo', 'data_inicio', 'data_fim', 'sala_id']
        if not data or not all(k in data for k in required_fields):
            return jsonify({'message': 'Título, data_inicio, data_fim e sala_id são obrigatórios'}), 400
        
        # Converter datas
        try:
            data_inicio = datetime.fromisoformat(data['data_inicio'].replace('Z', '+00:00'))
            data_fim = datetime.fromisoformat(data['data_fim'].replace('Z', '+00:00'))
        except ValueError:
            return jsonify({'message': 'Formato de data inválido. Use ISO 8601'}), 400
        
        # Validações básicas
        if data_inicio >= data_fim:
            return jsonify({'message': 'Data de início deve ser anterior à data de fim'}), 400
        
        if data_inicio < datetime.utcnow():
            return jsonify({'message': 'Não é possível criar reservas no passado'}), 400
        
        # Verificar se sala existe e está ativa
        sala = Sala.query.get(data['sala_id'])
        if not sala or not sala.ativa:
            return jsonify({'message': 'Sala não encontrada ou inativa'}), 404
        
        # Verificar conflitos de horário
        conflitos = Reserva.query.filter(
            Reserva.sala_id == data['sala_id'],
            Reserva.status == 'confirmada',
            or_(
                and_(Reserva.data_inicio <= data_inicio, Reserva.data_fim > data_inicio),
                and_(Reserva.data_inicio < data_fim, Reserva.data_fim >= data_fim),
                and_(Reserva.data_inicio >= data_inicio, Reserva.data_fim <= data_fim)
            )
        ).first()
        
        if conflitos:
            return jsonify({
                'message': 'Conflito de horário detectado',
                'conflito': conflitos.to_dict()
            }), 409
        
        # Criar reserva
        reserva = Reserva(
            titulo=data['titulo'],
            descricao=data.get('descricao', ''),
            data_inicio=data_inicio,
            data_fim=data_fim,
            sala_id=data['sala_id'],
            usuario_id=current_user.id,
            status='confirmada'
        )
        
        db.session.add(reserva)
        db.session.commit()
        
        # Retornar com dados da sala
        reserva_dict = reserva.to_dict()
        reserva_dict['sala'] = sala.to_dict()
        reserva_dict['usuario'] = current_user.to_dict()
        
        return jsonify({
            'message': 'Reserva criada com sucesso',
            'reserva': reserva_dict
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

@reservas_bp.route('/reservas/<int:reserva_id>', methods=['PUT'])
@token_required
def update_reserva(current_user, reserva_id):
    """Atualizar reserva existente"""
    try:
        reserva = Reserva.query.get_or_404(reserva_id)
        
        # Verificar permissão
        if current_user.nivel_acesso != 'admin' and reserva.usuario_id != current_user.id:
            return jsonify({'message': 'Acesso negado'}), 403
        
        data = request.get_json()
        if not data:
            return jsonify({'message': 'Dados não fornecidos'}), 400
        
        # Atualizar campos permitidos
        if 'titulo' in data:
            reserva.titulo = data['titulo']
        if 'descricao' in data:
            reserva.descricao = data['descricao']
        if 'status' in data and data['status'] in ['confirmada', 'cancelada', 'pendente']:
            reserva.status = data['status']
        
        # Atualizar datas (com validações)
        if 'data_inicio' in data or 'data_fim' in data:
            data_inicio = reserva.data_inicio
            data_fim = reserva.data_fim
            
            if 'data_inicio' in data:
                data_inicio = datetime.fromisoformat(data['data_inicio'].replace('Z', '+00:00'))
            if 'data_fim' in data:
                data_fim = datetime.fromisoformat(data['data_fim'].replace('Z', '+00:00'))
            
            if data_inicio >= data_fim:
                return jsonify({'message': 'Data de início deve ser anterior à data de fim'}), 400
            
            # Verificar conflitos (excluindo a própria reserva)
            conflitos = Reserva.query.filter(
                Reserva.sala_id == reserva.sala_id,
                Reserva.id != reserva.id,
                Reserva.status == 'confirmada',
                or_(
                    and_(Reserva.data_inicio <= data_inicio, Reserva.data_fim > data_inicio),
                    and_(Reserva.data_inicio < data_fim, Reserva.data_fim >= data_fim),
                    and_(Reserva.data_inicio >= data_inicio, Reserva.data_fim <= data_fim)
                )
            ).first()
            
            if conflitos:
                return jsonify({
                    'message': 'Conflito de horário detectado',
                    'conflito': conflitos.to_dict()
                }), 409
            
            reserva.data_inicio = data_inicio
            reserva.data_fim = data_fim
        
        db.session.commit()
        
        # Retornar com dados relacionados
        reserva_dict = reserva.to_dict()
        reserva_dict['sala'] = reserva.sala.to_dict() if reserva.sala else None
        reserva_dict['usuario'] = reserva.usuario.to_dict() if reserva.usuario else None
        
        return jsonify({
            'message': 'Reserva atualizada com sucesso',
            'reserva': reserva_dict
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

@reservas_bp.route('/reservas/<int:reserva_id>', methods=['DELETE'])
@token_required
def cancel_reserva(current_user, reserva_id):
    """Cancelar reserva"""
    try:
        reserva = Reserva.query.get_or_404(reserva_id)
        
        # Verificar permissão
        if current_user.nivel_acesso != 'admin' and reserva.usuario_id != current_user.id:
            return jsonify({'message': 'Acesso negado'}), 403
        
        reserva.status = 'cancelada'
        db.session.commit()
        
        return jsonify({'message': 'Reserva cancelada com sucesso'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

@reservas_bp.route('/reservas/disponibilidade', methods=['GET'])
@token_required
def check_disponibilidade(current_user):
    """Verificar disponibilidade de sala em período específico"""
    try:
        sala_id = request.args.get('sala_id', type=int)
        data_inicio = request.args.get('data_inicio')
        data_fim = request.args.get('data_fim')
        
        if not all([sala_id, data_inicio, data_fim]):
            return jsonify({'message': 'sala_id, data_inicio e data_fim são obrigatórios'}), 400
        
        # Converter datas
        try:
            dt_inicio = datetime.fromisoformat(data_inicio.replace('Z', '+00:00'))
            dt_fim = datetime.fromisoformat(data_fim.replace('Z', '+00:00'))
        except ValueError:
            return jsonify({'message': 'Formato de data inválido'}), 400
        
        # Verificar se sala existe
        sala = Sala.query.get(sala_id)
        if not sala or not sala.ativa:
            return jsonify({'message': 'Sala não encontrada'}), 404
        
        # Buscar conflitos
        conflitos = Reserva.query.filter(
            Reserva.sala_id == sala_id,
            Reserva.status == 'confirmada',
            or_(
                and_(Reserva.data_inicio <= dt_inicio, Reserva.data_fim > dt_inicio),
                and_(Reserva.data_inicio < dt_fim, Reserva.data_fim >= dt_fim),
                and_(Reserva.data_inicio >= dt_inicio, Reserva.data_fim <= dt_fim)
            )
        ).all()
        
        return jsonify({
            'disponivel': len(conflitos) == 0,
            'conflitos': [c.to_dict() for c in conflitos]
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

