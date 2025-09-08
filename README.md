# Sistema de Gestão de Reservas - Projeto Completo

**Desenvolvido por:** Philipe Enggist  
**Data:** 22/08/2025  
**Disciplina:** Aula 4 - Daily Scrum

## 📁 Estrutura do Projeto

```
projeto_final/
├── README.md                           # Este arquivo
├── relatorio/                          # Relatórios e entregas
│   ├── daily_scrum_aula4.pdf          # Relatório final em PDF (ENTREGA PRINCIPAL)
│   └── daily_scrum_aula4_real.md      # Relatório em Markdown
├── sistema/                            # Código fonte da aplicação
│   ├── gestao-reservas-backend/        # Backend Flask
│   └── gestao-reservas-frontend/       # Frontend React
├── documentacao/                       # Documentação e arquivos de apoio
│   ├── todo.md                         # Acompanhamento de tarefas
│   └── arquivos_originais/             # Arquivos fornecidos originalmente
└── screenshots/                        # Capturas de tela da aplicação
```

## 🚀 Como Executar o Sistema

### Pré-requisitos
- Python 3.11+
- Node.js 20+
- pnpm ou npm

### Backend (Flask)
```bash
cd sistema/gestao-reservas-backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou venv\Scripts\activate  # Windows
pip install -r requirements.txt
python src/main.py
```
O backend estará disponível em: http://localhost:5000

### Frontend (React)
```bash
cd sistema/gestao-reservas-frontend
pnpm install
pnpm run dev
```
O frontend estará disponível em: http://localhost:5173

### Credenciais de Teste
- **Admin:** admin / admin123
- **Usuário:** usuario / user123

## ✅ Funcionalidades Implementadas

### 🔐 Autenticação e Autorização
- Sistema de login/logout seguro
- Autenticação JWT com tokens
- Dois níveis de acesso (admin/usuário)
- Criptografia de senhas com hash

### 🏢 Gestão de Salas
- CRUD completo de salas
- Informações detalhadas (capacidade, localização, equipamentos)
- Diferentes tipos de sala (reunião, auditório, laboratório, etc.)
- Interface administrativa para gestão

### 📅 Sistema de Reservas
- Criação e gestão de reservas
- Validação automática de conflitos de horário
- Visualização de reservas por usuário
- Status de reservas (confirmada, cancelada, pendente)

### 📊 Dashboard e Relatórios
- Estatísticas em tempo real
- Calendário visual de reservas
- Interface responsiva para desktop e mobile
- Cards informativos com métricas do sistema

## 🛠️ Tecnologias Utilizadas

### Backend
- **Flask** - Framework web Python
- **SQLAlchemy** - ORM para banco de dados
- **JWT** - Autenticação stateless
- **SQLite** - Banco de dados (desenvolvimento)
- **Werkzeug** - Segurança e utilitários

### Frontend
- **React** - Biblioteca de interface
- **Vite** - Build tool e servidor de desenvolvimento
- **Tailwind CSS** - Framework de estilização
- **shadcn/ui** - Componentes de interface
- **Lucide React** - Ícones

## 📋 Relatório Daily Scrum

O arquivo principal de entrega é o **`relatorio/daily_scrum_aula4.pdf`** que contém:

- **O que foi feito:** Desenvolvimento completo da aplicação
- **Bloqueios encontrados:** 7 desafios técnicos detalhados
- **Próximos passos:** 10 funcionalidades planejadas
- **Reflexões:** Aprendizados sobre desenvolvimento full-stack

## 🎯 Próximas Funcionalidades

1. Sistema de notificações por email
2. Reservas recorrentes
3. Integração com calendários externos
4. Relatórios avançados e analytics
5. Sistema de aprovação de reservas
6. Otimizações de performance
7. Testes automatizados
8. Deploy em produção

## 📞 Suporte

Para dúvidas ou suporte técnico, consulte a documentação no diretório `documentacao/` ou entre em contato com o desenvolvedor.

---

**Status:** ✅ Projeto Completo e Funcional  
**Versão:** 1.0  
**Última atualização:** 22/08/2025

