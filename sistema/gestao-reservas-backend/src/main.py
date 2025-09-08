import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from src.models import db, User, Sala, Reserva
from src.routes.user import user_bp
from src.routes.auth import auth_bp
from src.routes.salas import salas_bp
from src.routes.reservas import reservas_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT'

# Configurar CORS para permitir requisições do frontend
CORS(app, origins=['*'])

# Registrar blueprints
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(salas_bp, url_prefix='/api')
app.register_blueprint(reservas_bp, url_prefix='/api')

# Configuração do banco de dados
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# Criar tabelas e dados iniciais
with app.app_context():
    db.create_all()
    
    # Criar usuário admin padrão se não existir
    admin = User.query.filter_by(username='admin').first()
    if not admin:
        admin = User(
            username='admin',
            email='admin@gestao-reservas.com',
            nivel_acesso='admin'
        )
        admin.set_password('admin123')
        db.session.add(admin)
        
        # Criar usuário comum de exemplo
        user = User(
            username='usuario',
            email='usuario@gestao-reservas.com',
            nivel_acesso='usuario'
        )
        user.set_password('user123')
        db.session.add(user)
        
        db.session.commit()
        print("Usuários padrão criados:")
        print("Admin: admin / admin123")
        print("Usuário: usuario / user123")
    
    # Criar salas de exemplo se não existirem
    if Sala.query.count() == 0:
        salas_exemplo = [
            {
                'nome': 'Sala de Reunião A',
                'capacidade': 8,
                'localizacao': 'Andar 1 - Ala Norte',
                'tipo': 'Reunião',
                'equipamentos': '["Projetor", "Quadro branco", "Sistema de videoconferência"]'
            },
            {
                'nome': 'Auditório Principal',
                'capacidade': 100,
                'localizacao': 'Térreo - Entrada Principal',
                'tipo': 'Auditório',
                'equipamentos': '["Sistema de som", "Projetor", "Microfones", "Iluminação cênica"]'
            },
            {
                'nome': 'Laboratório de Informática',
                'capacidade': 20,
                'localizacao': 'Andar 2 - Ala Sul',
                'tipo': 'Laboratório',
                'equipamentos': '["20 Computadores", "Projetor", "Quadro digital"]'
            },
            {
                'nome': 'Sala de Treinamento B',
                'capacidade': 15,
                'localizacao': 'Andar 1 - Ala Sul',
                'tipo': 'Sala de Treinamento',
                'equipamentos': '["Projetor", "Flipchart", "Sistema de som"]'
            }
        ]
        
        for sala_data in salas_exemplo:
            sala = Sala(**sala_data)
            db.session.add(sala)
        
        db.session.commit()
        print(f"Criadas {len(salas_exemplo)} salas de exemplo")

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
            return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
