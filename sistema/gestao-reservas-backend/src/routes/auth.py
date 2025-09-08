from flask import Blueprint, request, jsonify
from src.models.user import User, db
from functools import wraps

auth_bp = Blueprint('auth', __name__)

def token_required(f):
    """Decorator para verificar autenticação JWT"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token é obrigatório'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            
            payload = User.verify_token(token)
            if not payload:
                return jsonify({'message': 'Token inválido'}), 401
            
            current_user = User.query.get(payload['user_id'])
            if not current_user or not current_user.ativo:
                return jsonify({'message': 'Usuário não encontrado ou inativo'}), 401
            
        except Exception as e:
            return jsonify({'message': 'Token inválido'}), 401
        
        return f(current_user, *args, **kwargs)
    return decorated

def admin_required(f):
    """Decorator para verificar se usuário é admin"""
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        if current_user.nivel_acesso != 'admin':
            return jsonify({'message': 'Acesso negado. Privilégios de administrador necessários.'}), 403
        return f(current_user, *args, **kwargs)
    return decorated

@auth_bp.route('/login', methods=['POST'])
def login():
    """Endpoint para login de usuários"""
    try:
        data = request.get_json()
        
        if not data or not data.get('username') or not data.get('password'):
            return jsonify({'message': 'Username e password são obrigatórios'}), 400
        
        user = User.query.filter_by(username=data['username']).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({'message': 'Credenciais inválidas'}), 401
        
        if not user.ativo:
            return jsonify({'message': 'Usuário inativo'}), 401
        
        token = user.generate_token()
        
        return jsonify({
            'message': 'Login realizado com sucesso',
            'token': token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

@auth_bp.route('/register', methods=['POST'])
def register():
    """Endpoint para cadastro de novos usuários"""
    try:
        data = request.get_json()
        
        if not data or not all(k in data for k in ['username', 'email', 'password']):
            return jsonify({'message': 'Username, email e password são obrigatórios'}), 400
        
        # Verificar se usuário já existe
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'message': 'Username já existe'}), 400
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'message': 'Email já existe'}), 400
        
        # Criar novo usuário
        user = User(
            username=data['username'],
            email=data['email'],
            nivel_acesso=data.get('nivel_acesso', 'usuario')
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            'message': 'Usuário criado com sucesso',
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    """Endpoint para obter dados do usuário atual"""
    return jsonify({'user': current_user.to_dict()}), 200

@auth_bp.route('/verify', methods=['POST'])
def verify_token():
    """Endpoint para verificar validade do token"""
    try:
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'valid': False, 'message': 'Token não fornecido'}), 401
        
        if token.startswith('Bearer '):
            token = token[7:]
        
        payload = User.verify_token(token)
        if not payload:
            return jsonify({'valid': False, 'message': 'Token inválido'}), 401
        
        user = User.query.get(payload['user_id'])
        if not user or not user.ativo:
            return jsonify({'valid': False, 'message': 'Usuário não encontrado'}), 401
        
        return jsonify({
            'valid': True,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'valid': False, 'message': f'Erro: {str(e)}'}), 500

