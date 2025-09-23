#!/bin/sh

echo "📌 Aplicando migrações..."
python manage.py makemigrations api --noinput
python manage.py migrate --noinput

echo "📌 Criando superuser (se não existir)..."
DJANGO_SUPERUSER_USERNAME=admin \
DJANGO_SUPERUSER_EMAIL=admin@example.com \
DJANGO_SUPERUSER_PASSWORD=admin123 \
python manage.py createsuperuser --noinput || true

echo "🚀 Iniciando servidor Django..."
exec python manage.py runserver 0.0.0.0:8000
