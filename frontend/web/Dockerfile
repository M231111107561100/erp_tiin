# ===== Build =====
FROM node:20-alpine AS build
WORKDIR /app

# Copier tout le dossier avant l'installation (évite l'erreur ENOENT sur package.json)
COPY . .

# Sécurité: échoue proprement si package.json est absent
RUN test -f package.json || (echo "ERROR: package.json introuvable dans /app" && exit 1)

# Installer dépendances et builder
RUN npm install
ARG VITE_API_BASE_URL
ARG VITE_KEYCLOAK_URL
ARG VITE_KEYCLOAK_REALM
ARG VITE_KEYCLOAK_CLIENT_ID
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_KEYCLOAK_URL=$VITE_KEYCLOAK_URL \
    VITE_KEYCLOAK_REALM=$VITE_KEYCLOAK_REALM \
    VITE_KEYCLOAK_CLIENT_ID=$VITE_KEYCLOAK_CLIENT_ID
RUN npm run build

# ===== Run (serve statique) =====
FROM node:20-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/dist ./dist
EXPOSE 5173
CMD ["serve","-s","dist","-l","5173"]
