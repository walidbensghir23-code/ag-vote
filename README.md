# 🗳️ AG Vote — Application de Gestion des Assemblées Générales

Application web fullstack de gestion et de vote lors des Assemblées Générales d'actionnaires.

---

## 📋 Description

Cette application permet de :
- **Créer et gérer des entreprises, actionnaires, et résolutions** (espace Admin)
- **Organiser des Assemblées Générales** avec une interface en étapes
- **Voter POUR / CONTRE / ABSTENTION** sur chaque résolution (espace Actionnaire)
- **Sécuriser les accès** avec JWT (JSON Web Token)

---

## 🏗️ Architecture

```
projet/
├── ag-backend/     → API REST Spring Boot (Java)
└── ag-frontend/    → Interface React (Vite)
```

### Stack Technique

| Couche      | Technologie         |
|-------------|---------------------|
| Frontend    | React + Vite        |
| Backend     | Spring Boot 3 (Java)|
| Base de données | MySQL (JPA/Hibernate) |
| Sécurité    | JWT (JSON Web Token)|
| HTTP Client | Axios               |

---

## 🚀 Lancer le projet

### Prérequis
- Java 17+
- Node.js 18+
- MySQL 8+

### 1. Backend (Spring Boot)

```bash
cd ag-backend
./mvnw spring-boot:run
```
> API disponible sur : `http://localhost:8080`

### 2. Frontend (React)

```bash
cd ag-frontend
npm install
npm run dev
```
> Application disponible sur : `http://localhost:5173`

---

## 🔐 Sécurité JWT

1. L'utilisateur se connecte → le backend génère un **token JWT**
2. Le token est stocké dans le **localStorage** du navigateur
3. Chaque requête API envoie ce token dans le header `Authorization: Bearer <token>`
4. Le backend vérifie le token via `JwtAuthFilter` avant de traiter la requête

---

## 👥 Rôles

| Rôle  | Accès                                                  |
|-------|--------------------------------------------------------|
| ADMIN | Gestion entreprises, actionnaires, résolutions, AGs    |
| USER  | Consulter les AGs et voter sur les résolutions         |

---

## 📡 API Endpoints principaux

```
POST /api/auth/login          → Connexion (retourne un token JWT)
POST /api/auth/register       → Créer un compte

GET  /api/admin/entreprises   → Liste des entreprises
POST /api/admin/ag            → Créer une AG

GET  /api/user/ag             → AGs disponibles pour l'actionnaire
POST /api/user/vote           → Voter sur une résolution
GET  /api/user/votes          → Mon historique de votes
```

---

## 👨‍🎓 Projet réalisé dans le cadre du PFE — OFPPT NTIC 2
