# 🔐 Comment ça marche — Sécurité JWT du projet AG Vote

> Ce document explique en français simple comment fonctionne la sécurité
> du projet. Il est destiné aux **débutants** qui veulent comprendre JWT.

---

## 📌 C'est quoi JWT ?

**JWT** = JSON Web Token

C'est un **jeton numérique** que le serveur donne à l'utilisateur quand il se connecte.
L'utilisateur le présente à chaque requête pour prouver son identité — comme un **badge d'accès**.

Un token JWT ressemble à ça :

```
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJBRE1JTiJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

Il est divisé en 3 parties séparées par des points `.` :

| Partie | Nom | Contenu |
|--------|-----|---------|
| `eyJhbGci...` | Header | Algorithme utilisé (HS256) |
| `eyJzdWIi...` | Payload | Données : username, rôle, expiration |
| `SflKxwRJ...` | Signature | Preuve d'authenticité |

---

## 🔄 Le flux complet (étape par étape)

### 1️⃣ Connexion (Login)

```
[React LoginPage]
    ↓ formulaire username + password
    ↓ POST /api/auth/login
[Spring AuthController]
    ↓ vérifie username en base H2
    ↓ compare mot de passe avec BCrypt
    ↓ génère un token JWT (valable 24h)
    ↓ retourne : { token, username, role, userId, nom, prenom }
[React AuthContext]
    ↓ stocke token dans localStorage["token"]
    ↓ stocke user  dans localStorage["user"]
    ↓ setUser(data) → l'app sait que l'utilisateur est connecté
    ↓ redirige : ADMIN → /admin/entreprises | USER → /user/dashboard
```

### 2️⃣ Requête API sécurisée

```
[React composant (ex: EntreprisesPage)]
    ↓ appelle getEntreprises()
[api.js intercepteur de requête]
    ↓ lit token dans localStorage
    ↓ ajoute header : Authorization: Bearer eyJhbGci...
    ↓ GET /api/admin/entreprises
[Spring JwtAuthFilter]
    ↓ lit le header Authorization
    ↓ extrait le token (supprime "Bearer ")
    ↓ valide la signature avec la clé secrète
    ↓ extrait le username du token
    ↓ charge l'utilisateur depuis la base
    ↓ enregistre l'authentification dans Spring Security
[Spring SecurityConfig]
    ↓ vérifie que l'utilisateur a le rôle ADMIN
    ↓ laisse passer ✅
[AdminController]
    ↓ traite la requête
    ↓ retourne la liste des entreprises en JSON
[React]
    ↓ affiche les entreprises dans le tableau
```

### 3️⃣ Token invalide ou expiré

```
[React] → envoie une requête avec un token expiré
[Spring JwtAuthFilter]
    ↓ la validation du token échoue (JwtException)
    ↓ ne pas enregistrer d'authentification
[Spring SecurityConfig]
    ↓ aucune authentification trouvée
    ↓ retourne 401 Unauthorized ❌
[api.js intercepteur de réponse]
    ↓ détecte le statut 401
    ↓ localStorage.clear() → supprime le token
    ↓ window.location.href = '/login' → redirige vers connexion
```

### 4️⃣ Déconnexion (Logout)

```
[React bouton "Se déconnecter"]
    ↓ appelle logout() depuis AuthContext
[AuthContext logout()]
    ↓ localStorage.clear() → supprime token + user
    ↓ setUser(null) → l'app ne reconnaît plus l'utilisateur
    ↓ App.jsx redirige vers /login (car user === null)
[Serveur] → rien à faire ! JWT est "stateless" :
            il n'y a pas de session à détruire côté serveur.
            Le token est simplement ignoré une fois supprimé du client.
```

---

## 📁 Fichiers du projet — Qui fait quoi ?

### Backend (Spring Boot)

```
ag-backend/src/main/java/com/ag/
│
├── security/
│   ├── JwtUtil.java              ← Génère et valide les tokens JWT
│   ├── JwtAuthFilter.java        ← Filtre : vérifie le token à chaque requête
│   └── UserDetailsServiceImpl.java ← Charge l'utilisateur depuis la base
│
├── config/
│   ├── SecurityConfig.java       ← Configure les règles d'accès (ADMIN/USER/PUBLIC)
│   └── WebConfig.java            ← Config CORS (autorise le frontend React)
│
├── controller/
│   ├── AuthController.java       ← Routes publiques : /api/auth/login, /register
│   ├── AdminController.java      ← Routes ADMIN : /api/admin/**
│   └── UserController.java       ← Routes USER : /api/user/**
│
├── service/
│   ├── AuthService.java          ← Logique de connexion et inscription
│   └── ...                       ← Services métier (entreprises, votes...)
│
└── entity/
    ├── User.java                 ← Table "users" en base
    ├── Role.java                 ← Enum : ADMIN | USER
    └── ...                       ← Autres entités (Entreprise, AG, Vote...)
```

### Frontend (React)

```
ag-frontend/src/
│
├── context/
│   └── AuthContext.jsx     ← Stocke l'utilisateur + token, partage avec tous
│
├── api/
│   └── api.js              ← Axios configuré + intercepteur JWT + toutes les fonctions API
│
├── App.jsx                 ← Routes + PrivateRoute (protection des pages)
│
└── pages/
    ├── LoginPage.jsx       ← Formulaire de connexion
    ├── admin/              ← Pages réservées aux ADMIN
    │   ├── EntreprisesPage.jsx
    │   ├── ActionnairesPage.jsx
    │   ├── ResolutionsPage.jsx
    │   └── AGPage.jsx
    └── user/              ← Pages pour les actionnaires connectés
        ├── DashboardPage.jsx
        ├── AGVotePage.jsx
        └── MyVotesPage.jsx
```

---

## 🔑 Configuration JWT (application.properties)

```properties
# La clé secrète est utilisée pour SIGNER les tokens.
# Elle doit faire minimum 32 caractères. À ne jamais partager !
app.jwt.secret=AgVoteSystemSecretKey2024XYZ123456789ABCDEF

# Durée de validité du token = 24 heures (en millisecondes)
# 86400000 = 86400 secondes = 1440 minutes = 24 heures
app.jwt.expiration=86400000
```

---

## 🛡️ Règles d'accès (SecurityConfig.java)

| URL | Accès | Explication |
|-----|-------|-------------|
| `POST /api/auth/login` | 🌐 Public | Connexion — pas besoin de token |
| `POST /api/auth/register` | 🌐 Public | Inscription — pas besoin de token |
| `GET /api/admin/**` | 👑 ADMIN | Token JWT + rôle ADMIN requis |
| `POST /api/admin/**` | 👑 ADMIN | Token JWT + rôle ADMIN requis |
| `GET /api/user/**` | 👤 USER/ADMIN | Token JWT valide requis |
| `POST /api/user/vote` | 👤 USER/ADMIN | Token JWT valide requis |

---

## 🧪 Comment tester

### Test avec le navigateur (page login)

1. Lancer le backend : `cd ag-backend && mvn spring-boot:run`
2. Lancer le frontend : `cd ag-frontend && npm run dev`
3. Ouvrir http://localhost:5173
4. Se connecter avec :
   - **Admin** : `admin` / `admin`
   - **Utilisateur** : `martin` / `martin`

### Test avec un outil comme Postman

**1. Connexion :**
```http
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
    "username": "admin",
    "password": "admin"
}
```

**Réponse :**
```json
{
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "username": "admin",
    "role": "ADMIN",
    "userId": 1
}
```

**2. Requête sécurisée (avec le token) :**
```http
GET http://localhost:8080/api/admin/entreprises
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

**3. Requête sans token :**
```http
GET http://localhost:8080/api/admin/entreprises
```
→ Réponse `401 Unauthorized` ❌

---

## ✅ Résumé en une phrase

> **L'utilisateur se connecte une fois** (login) et reçoit un token JWT.
> **Il présente ce token à chaque requête** → le serveur vérifie le token
> et autorise ou refuse l'accès **sans jamais créer de session**.
