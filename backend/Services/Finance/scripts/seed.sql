-- Active l'extension pgcrypto pour gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Crée la table Accounts si elle n'existe pas
CREATE TABLE IF NOT EXISTS "Accounts" (
  "Id" uuid PRIMARY KEY,
  "CreatedAt" timestamp NOT NULL,
  "UpdatedAt" timestamp NULL,
  "Number" text NOT NULL UNIQUE,
  "Name" text NOT NULL,
  "Currency" text NULL,
  "IsActive" boolean NOT NULL
);

-- Insère quelques comptes SYSCOHADA minimaux (sans doublons)
INSERT INTO "Accounts" ("Id","CreatedAt","Number","Name","IsActive")
VALUES
(gen_random_uuid(), now(), '1011', 'Capital social', true),
(gen_random_uuid(), now(), '2111', 'Terrains', true),
(gen_random_uuid(), now(), '4011', 'Fournisseurs', true),
(gen_random_uuid(), now(), '4111', 'Clients', true),
(gen_random_uuid(), now(), '5121', 'Banque', true)
ON CONFLICT ("Number") DO NOTHING;
