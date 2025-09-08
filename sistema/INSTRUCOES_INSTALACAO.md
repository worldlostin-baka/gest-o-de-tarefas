# Instruções de Instalação - Sistema de Gestão de Reservas

## 📋 Pré-requisitos

Antes de executar o sistema, certifique-se de ter instalado:

- **Python 3.11 ou superior**
- **Node.js 20 ou superior**
- **pnpm** (recomendado) ou **npm**

## 🔧 Instalação do Backend (Flask)

1. **Navegue para o diretório do backend:**
   ```bash
   cd gestao-reservas-backend
   ```

2. **Crie um ambiente virtual Python:**
   ```bash
   python -m venv venv
   ```

3. **Ative o ambiente virtual:**
   - **Linux/Mac:**
     ```bash
     source venv/bin/activate
     ```
   - **Windows:**
     ```bash
     venv\Scripts\activate
     ```

4. **Instale as dependências:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Execute o servidor backend:**
   ```bash
   python src/main.py
   ```

6. **Verifique se está funcionando:**
   - O servidor estará disponível em: `http://localhost:5000`
   - Você deve ver a mensagem: "Sistema iniciado com sucesso!"

## ⚛️ Instalação do Frontend (React)

1. **Abra um novo terminal e navegue para o diretório do frontend:**
   ```bash
   cd gestao-reservas-frontend
   ```

2. **Instale as dependências:**
   ```bash
   pnpm install
   ```
   
   *Ou se preferir usar npm:*
   ```bash
   npm install
   ```

3. **Execute o servidor de desenvolvimento:**
   ```bash
   pnpm run dev
   ```
   
   *Ou com npm:*
   ```bash
   npm run dev
   ```

4. **Acesse a aplicação:**
   - Abra seu navegador em: `http://localhost:5173`
   - Você verá a tela de login do sistema

## 🔑 Credenciais de Teste

O sistema vem com usuários pré-configurados:

- **Administrador:**
  - Usuário: `admin`
  - Senha: `admin123`

- **Usuário comum:**
  - Usuário: `usuario`
  - Senha: `user123`

## 🗄️ Banco de Dados

O sistema utiliza SQLite para desenvolvimento, que é criado automaticamente na primeira execução. O arquivo do banco será criado em:
```
gestao-reservas-backend/instance/database.db
```

## 🚀 Testando o Sistema

1. **Faça login como administrador** para ter acesso completo
2. **Crie algumas salas** na aba "Gestão de Salas"
3. **Faça reservas** na aba "Minhas Reservas"
4. **Visualize o calendário** na aba "Calendário"

## 🔧 Solução de Problemas

### Backend não inicia
- Verifique se o Python 3.11+ está instalado
- Certifique-se de que o ambiente virtual está ativado
- Verifique se todas as dependências foram instaladas

### Frontend não carrega
- Verifique se o Node.js 20+ está instalado
- Certifique-se de que as dependências foram instaladas
- Verifique se o backend está rodando na porta 5000

### Erro de CORS
- Certifique-se de que o backend está rodando antes do frontend
- O proxy está configurado no Vite para redirecionar `/api/*` para o backend

### Problemas de autenticação
- Verifique se está usando as credenciais corretas
- Limpe o localStorage do navegador se necessário

## 📁 Estrutura dos Arquivos

```
gestao-reservas-backend/
├── src/
│   ├── main.py              # Arquivo principal
│   ├── models/              # Modelos de dados
│   └── routes/              # Rotas da API
├── requirements.txt         # Dependências Python
└── README.md

gestao-reservas-frontend/
├── src/
│   ├── App.jsx             # Componente principal
│   ├── components/         # Componentes React
│   └── main.jsx           # Ponto de entrada
├── package.json           # Dependências Node.js
└── vite.config.js        # Configuração do Vite
```

## 🌐 Portas Utilizadas

- **Backend (Flask):** http://localhost:5000
- **Frontend (React):** http://localhost:5173

Certifique-se de que essas portas estão disponíveis antes de executar o sistema.

---

**Desenvolvido por:** Philipe Enggist  
**Data:** 22/08/2025

