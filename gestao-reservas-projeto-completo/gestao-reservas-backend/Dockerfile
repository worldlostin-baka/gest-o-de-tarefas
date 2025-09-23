FROM python:3.12-slim

WORKDIR /app

# dependências do sistema
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    netcat-openbsd \
 && rm -rf /var/lib/apt/lists/*

# instalar dependências
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# copiar código do backend
COPY . .

# copiar script de espera do banco
COPY wait-for-db.sh /wait-for-db.sh
RUN chmod +x /wait-for-db.sh

# copiar entrypoint para rodar migrações + superuser
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/entrypoint.sh"]
