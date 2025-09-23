#!/bin/sh
# Espera pelo banco de dados antes de iniciar o Django

set -e

host="$1"
shift
cmd="$@"

until nc -z "$host" 5432; do
  echo "⏳ Aguardando banco de dados em $host:5432..."
  sleep 2
done

echo "✅ Banco de dados disponível, iniciando aplicação..."
exec $cmd
