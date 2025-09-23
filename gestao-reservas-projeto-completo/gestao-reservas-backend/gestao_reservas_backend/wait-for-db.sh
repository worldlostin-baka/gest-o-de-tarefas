#!/bin/sh
set -e

echo "⏳ Aguardando o banco de dados em $DB_HOST:$DB_PORT..."

until nc -z $DB_HOST $DB_PORT; do
  sleep 1
done

echo "✅ Banco de dados disponível!"

python manage.py migrate --noinput

exec "$@"
