# Etapa 1 - Build do frontend
FROM node:20-slim AS build

WORKDIR /app

# Copia pacotes e instala dependências (com Tailwind)
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copia o restante do projeto
COPY . .

# Garante que Tailwind esteja configurado
RUN if [ ! -f tailwind.config.js ]; then \
      npm install -D tailwindcss postcss autoprefixer && \
      npx tailwindcss init -p && \
      echo 'export default { content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"], theme: { extend: {} }, plugins: [] }' > tailwind.config.js && \
      echo '@tailwind base;\n@tailwind components;\n@tailwind utilities;' > src/index.css; \
    fi

# Faz o build da aplicação
RUN npm run build

# Etapa 2 - Servidor nginx
FROM nginx:stable-alpine

# Copia os arquivos estáticos do build
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
