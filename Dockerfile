# Imagen base con Node y Python para node-gyp
FROM node:20.18.1

# Instalar Python y herramientas necesarias
RUN apt-get update && apt-get install -y python3 make g++ \
    && ln -sf python3 /usr/bin/python

# Crear directorio de la app
WORKDIR /app

# Copiar package.json y package-lock.json (si existe)
COPY package*.json ./

# Instalar dependencias
RUN npm install --force

# Copiar el resto de los archivos del bot
COPY . .

# Puerto que usa Railway
ENV PORT=3000

# Comando para iniciar el bot
CMD ["npm", "start"]
