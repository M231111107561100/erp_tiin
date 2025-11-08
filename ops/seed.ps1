Write-Host "== ERP Tiin :: seed =="
# Exemple : exécuter le script SQL de seed du module Finance dans le conteneur
$seedPath = Join-Path $PSScriptRoot "..\backend\Services\Finance\scripts\seed.sql"
if (-not (Test-Path $seedPath)) {
  Write-Warning "Aucun seed SQL trouvé: $seedPath"
  exit 0
}
Write-Host "Copie du seed dans le conteneur db..."
docker cp $seedPath db:/tmp/seed.sql | Out-Null
Write-Host "Exécution du seed..."
docker exec -e PGPASSWORD=$env:POSTGRES_PASSWORD db psql -U $env:POSTGRES_USER -d $env:POSTGRES_DB -f /tmp/seed.sql
Write-Host "Seed terminé."
