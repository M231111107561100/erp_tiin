#!/bin/bash

set -e

echo "Configuring Keycloak realm..."

# Attendre que Keycloak soit démarré
until curl -f http://localhost:8080/health/ready; do
  echo "Waiting for Keycloak to be ready..."
  sleep 10
done

# Obtenir le token d'administration
TOKEN=$(curl -s -X POST \
  http://localhost:8080/realms/master/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=${KEYCLOAK_ADMIN}" \
  -d "password=${KEYCLOAK_ADMIN_PASSWORD}" \
  -d "grant_type=password" \
  -d "client_id=admin-cli" | jq -r '.access_token')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "Failed to get admin token"
  exit 1
fi

# Vérifier si le realm existe déjà
EXISTS=$(curl -s -o /dev/null -w "%{http_code}" \
  http://localhost:8080/admin/realms/erp_tiin \
  -H "Authorization: Bearer $TOKEN")

if [ "$EXISTS" = "200" ]; then
  echo "Realm already exists, skipping creation"
  exit 0
fi

# Créer le realm
curl -s -X POST \
  http://localhost:8080/admin/realms \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "realm": "erp_tiin",
    "enabled": true,
    "registrationAllowed": false,
    "loginWithEmailAllowed": true,
    "resetPasswordAllowed": true
  }'

# Créer les clients
curl -s -X POST \
  http://localhost:8080/admin/realms/erp_tiin/clients \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "erp_tiin-web",
    "publicClient": true,
    "redirectUris": ["http://localhost:8080/*","http://localhost:5173/*"],
    "webOrigins": ["+"],
    "standardFlowEnabled": true,
    "implicitFlowEnabled": false,
    "directAccessGrantsEnabled": false
  }'

curl -s -X POST \
  http://localhost:8080/admin/realms/erp_tiin/clients \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"clientId\": \"erp_tiin-api\",
    \"publicClient\": false,
    \"secret\": \"${KEYCLOAK_BACKEND_CLIENT_SECRET}\",
    \"redirectUris\": [\"http://finance:5000/*\",\"http://hr:5000/*\"],
    \"serviceAccountsEnabled\": true,
    \"standardFlowEnabled\": false,
    \"directAccessGrantsEnabled\": false
  }"

# Créer les rôles
for role in admin finance sales hr; do
  curl -s -X POST \
    http://localhost:8080/admin/realms/erp_tiin/roles \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"name\": \"$role\"}"
done

echo "Keycloak realm configuration completed successfully"