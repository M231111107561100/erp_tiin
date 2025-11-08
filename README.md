# ERP Tiin 🚀

ERP moderne inspiré de Dynamics NAV, conforme SYSCOHADA et adapté au contexte Sénégalais.

## 🌟 Fonctionnalités Principales

### 📊 Finance & Comptabilité
- **Plan de comptes SYSCOHADA** complet
- **Saisie d'écritures** avec validation automatique
- **Journaux comptables** (Général, Ventes, Achats, Banque)
- **Grand livre** et balance de vérification
- **États financiers** conformes SYSCOHADA

### 👥 Ressources Humaines
- **Gestion des employés** avec fiches détaillées
- **Calcul de paie** automatique (IPRES, CSS, IR, IPM, TRIMF)
- **Bulletins de paie** génération automatique
- **Gestion des congés** et absences

### 🛒 Ventes & Achats
- **Gestion des clients** et fournisseurs
- **Devis et commandes** avec workflow complet
- **Facturation** automatique
- **Suivi des règlements**

### 📦 Stock & Inventaire
- **Gestion multi-magasins**
- **Mouvements de stock** (entrées, sorties, transferts)
- **Inventaire physique**
- **Valorisation** (FIFO, LIFO, CMUP)

## 🏗️ Architecture Technique

### Backend (.NET 8)
- **Microservices** architecture
- **CQRS** avec MediatR
- **Entity Framework Core** + PostgreSQL
- **API RESTful** avec OpenAPI/Swagger
- **Authentification** JWT + Keycloak
- **OpenTelemetry** pour l'observabilité

### Frontend (React 18 + TypeScript)
- **Vite** pour le build ultra-rapide
- **TailwindCSS** avec thème personnalisé
- **Components** modulaires et réutilisables
- **React Query** pour la gestion d'état serveur
- **React Router** pour la navigation

### Infrastructure
- **Docker Compose** pour le développement
- **PostgreSQL** base de données principale
- **Redis** pour le caching
- **RabbitMQ** pour la messagerie
- **MinIO** pour le stockage fichiers
- **Traefik** comme reverse proxy

## 🚀 Démarrage Rapide

### Prérequis
- Docker Desktop
- .NET 8 SDK
- Node.js 18+

### Installation

1. **Cloner le repository**
```bash
git clone <repository-url>
cd erp_tiin