Write-Host "== ERP Tiin :: migrate =="
# Les migrations EF sont exécutées automatiquement au démarrage du service Finance (Program.cs -> db.Database.Migrate()).
# Ce script sert de commande explicite si vous basculez en mode SDK local plus tard.
Write-Host "Aucune action requise : auto-migration au démarrage Finance."
