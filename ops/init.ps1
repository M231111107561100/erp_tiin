param(
  [switch]$Recreate
)

Write-Host "== ERP Tiin :: init =="

# 1) .env présent ?
$envPath = Join-Path $PSScriptRoot "..\.env"
if (-not (Test-Path $envPath)) {
  throw ".env introuvable à la racine. Copiez .env.example en .env et renseignez les mots de passe (****)."
}

# 1.1) Bloque si des placeholders **** sont encore présents pour les variables critiques
$requiredKeys = @(
  'POSTGRES_PASSWORD','REDIS_PASSWORD','RABBITMQ_DEFAULT_PASS',
  'MINIO_ROOT_PASSWORD','KEYCLOAK_BACKEND_CLIENT_SECRET','KEYCLOAK_ADMIN_PASSWORD'
)
$envContent = Get-Content $envPath -Raw
$missing = @()
foreach ($k in $requiredKeys) {
  if ($envContent -match "(?m)^\s*$k\s*=\s*\*\*\*\*") { $missing += $k }
}
if ($missing.Count -gt 0) {
  throw "Remplace **** dans .env pour : $($missing -join ', ')."
}

Push-Location (Join-Path $PSScriptRoot "..\docker")

if ($Recreate) {
  docker compose --env-file ..\.env -f docker-compose.dev.yml down -v
}

function Wait-Http($url, $timeoutSec=180) {
  $sw = [Diagnostics.Stopwatch]::StartNew()
  while ($sw.Elapsed.TotalSeconds -lt $timeoutSec) {
    try {
      $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 5
      if ($r.StatusCode -ge 200 -and $r.StatusCode -lt 500) { return $true }
    } catch { Start-Sleep -Seconds 3 }
  }
  return $false
}

# === Étape A : INFRA d'abord ===
Write-Host "Démarrage INFRA (traefik, db, redis, rabbitmq, minio, keycloak, otel)..."
docker compose --env-file ..\.env -f docker-compose.dev.yml up -d --build `
  traefik db redis rabbitmq minio keycloak otel-collector

Write-Host "Attente Keycloak (http://localhost:8081)..."
if (-not (Wait-Http "http://localhost:8081")) { throw "Keycloak indisponible." }

# Copier les artefacts Keycloak
$realmJson = Join-Path $PSScriptRoot "..\docker\keycloak\realm-export.json"
$scriptFile = Join-Path $PSScriptRoot "..\docker\keycloak\configure-realm.sh"
docker cp $realmJson keycloak:/tmp/realm-export.json | Out-Null
docker cp $scriptFile keycloak:/configure-realm.sh | Out-Null

# Nettoyage BOM/CRLF -> nouveau fichier /tmp/realm-clean.json
Write-Host "Import du realm Keycloak..."
docker exec keycloak bash -lc "sed -e '1s/^\xEF\xBB\xBF//' /tmp/realm-export.json | tr -d '\r' > /tmp/realm-clean.json"

# Exécuter le script avec REALM_FILE explicite (pas de curl)
docker exec -e REALM_FILE=/tmp/realm-clean.json keycloak bash -lc "sed -e '1s/^\xEF\xBB\xBF//' /configure-realm.sh | tr -d '\r' > /tmp/kk.sh && bash /tmp/kk.sh"

# === Étape B : APIs (.NET) ===
Write-Host "Démarrage APIs (finance, hr)..."
docker compose --env-file ..\.env -f docker-compose.dev.yml up -d --build finance hr

Write-Host "Vérification endpoints APIs (via Traefik)..."
if (-not (Wait-Http "http://localhost/health")) { Write-Warning "Finance /health KO (via Traefik)"; }
if (-not (Wait-Http "http://localhost/ready"))  { Write-Warning "Finance /ready KO (via Traefik)"; }
if (-not (Wait-Http "http://localhost/api/health/ping")) { Write-Warning "Finance controller ping KO (via Traefik)"; }

# === Étape C : FRONT (web) ===
Write-Host "Démarrage FRONT (web)..."
docker compose --env-file ..\.env -f docker-compose.dev.yml up -d --build web

docker compose --env-file ..\.env -f docker-compose.dev.yml ps
Pop-Location
Write-Host "Init terminé."
