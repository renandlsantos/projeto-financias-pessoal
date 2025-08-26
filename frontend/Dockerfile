# Dockerfile para React Frontend - FinanceFlow

# Usar Node.js 20 Alpine para imagem mais leve
FROM node:20-alpine

# Definir diretório de trabalho
WORKDIR /app

# Instalar dependências do sistema
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências NPM
RUN npm ci --only=production=false

# Copiar código fonte
COPY . .

# Expor porta do Vite dev server
EXPOSE 3000

# Comando para desenvolvimento (com hot reload)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]
