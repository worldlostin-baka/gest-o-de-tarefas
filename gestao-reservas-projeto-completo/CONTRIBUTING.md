# Guia de Contribuição – Gestão de Reservas

Bem-vindo ao projeto 🎉  
Este documento explica como configurar seu ambiente e seguir as boas práticas para contribuir.

---

## 🔧 Pré-requisitos

- **Backend**
  - Python 3.12+
  - pip + virtualenv
- **Frontend**
  - Node.js 20+
  - npm 10+
- **Banco**
  - PostgreSQL 15 (ou usar Docker com `docker-compose`)

---

## ⚙️ Setup

### Backend
```bash
cd gestao-reservas-backend
python -m venv venv
source venv/bin/activate   # Linux/Mac
venv\Scripts\activate    # Windows

pip install -r requirements.txt
python manage.py migrate
python manage.py seed
python manage.py runserver
```

### Frontend
```bash
cd gestao-reservas-frontend
npm install
npm run dev
```

---

## 🐳 Docker

Subir tudo (db + backend + frontend):
```bash
docker-compose up --build
```

- Backend → http://localhost:8000  
- Docs Swagger → http://localhost:8000/api/docs/  
- Frontend → http://localhost:5173  

---

## 🧹 Lint & Formatação

### Backend
```bash
cd gestao-reservas-backend
black .
flake8 .
```

### Frontend
```bash
cd gestao-reservas-frontend
npm run lint
npm run format
```

---

## 🧪 Testes

### Backend
```bash
cd gestao-reservas-backend
python manage.py test
```

### Frontend
```bash
cd gestao-reservas-frontend
npm run test
```

---

## 🔒 Hooks de Qualidade

### Backend
- **pre-commit** roda:
  - Black (formatação automática).
  - Flake8 (lint).
  - Testes Django.

### Frontend
- **pre-commit** → ESLint + Prettier (somente arquivos alterados).
- **pre-push** → roda testes do **backend e frontend**.
- Se qualquer teste falhar, o commit/push é bloqueado.

---

## 🤝 Boas práticas

- Sempre crie branchs para novas features:
  ```bash
  git checkout -b feature/minha-feature
  ```
- Rode os testes **antes de abrir PR**.
- Use commits claros e objetivos (ex: `feat: adicionar endpoint de reservas`).

---

Pronto 🎯  
Seguindo este guia, você garante que seu código entra limpo, testado e padronizado no projeto.
