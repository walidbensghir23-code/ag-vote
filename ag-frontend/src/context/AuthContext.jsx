// ================================================================
//  AuthContext.jsx — Contexte d'authentification global
// ================================================================
//
//  QUOI ?
//  Ce fichier crée un "contexte" React qui stocke les infos de
//  l'utilisateur connecté et les partage avec TOUS les composants.
//
//  POURQUOI UN CONTEXTE ?
//  Sans contexte, on devrait passer les infos (user, logout...) en
//  "props" de composant en composant. C'est fastidieux.
//  Avec un contexte, n'importe quel composant peut accéder aux
//  infos de connexion avec : const { user, logout } = useAuth();
//
//  CE QUE ÇA STOCKE :
//  → user    : les infos de l'utilisateur connecté
//              { token, username, role, userId, nom, prenom }
//              null si personne n'est connecté
//  → loading : true pendant la vérification initiale
//  → login() : fonction pour se connecter
//  → logout(): fonction pour se déconnecter
//
//  OÙ EST STOCKÉ LE TOKEN JWT ?
//  → Dans localStorage (mémoire persistante du navigateur)
//  → Clé "token" : le token JWT (envoyé dans chaque requête API)
//  → Clé "user"  : les infos de l'utilisateur (nom, rôle...)
//  → Ces infos survivent au rafraîchissement de la page !
// ================================================================

import { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin } from '../api/api';

// Créer le contexte (comme une "boîte partagée" vide au départ)
const AuthContext = createContext(null);

// ================================================================
//  AuthProvider — Le composant qui englobe toute l'application
//  Il est utilisé dans App.jsx : <AuthProvider>...</AuthProvider>
// ================================================================
export function AuthProvider({ children }) {

    // L'utilisateur connecté (null = personne n'est connecté)
    const [user, setUser] = useState(null);

    // true pendant qu'on vérifie si un token est déjà enregistré
    // Évite le "flash" (affichage bref de la page login avant redirection)
    const [loading, setLoading] = useState(true);

    // ──────────────────────────────────────────────────────────────
    // RESTAURATION DE SESSION au chargement de la page
    // ──────────────────────────────────────────────────────────────
    // Quand l'utilisateur rafraîchit la page (F5), le state React
    // est réinitialisé. Ce useEffect vérifie si un token est déjà
    // enregistré dans localStorage pour restaurer la session.
    useEffect(() => {
        const token = localStorage.getItem('token'); // récupérer le token
        const stored = localStorage.getItem('user'); // récupérer les infos user

        if (token && stored) {
            // Un token existe → restaurer l'utilisateur dans le state
            setUser(JSON.parse(stored));
        }

        // Indiquer que la vérification est terminée
        setLoading(false);
    }, []); // [] = exécuter une seule fois au chargement

    // ──────────────────────────────────────────────────────────────
    // Fonction LOGIN
    // ──────────────────────────────────────────────────────────────
    // 1. Envoie username + password au backend (/api/auth/login)
    // 2. Le backend retourne : { token, username, role, userId, nom, prenom }
    // 3. On stocke le token dans localStorage → il sera envoyé dans toutes les requêtes
    // 4. On met à jour le state → l'app sait que l'utilisateur est connecté
    const login = async (username, password) => {
        // Appel API vers le backend Spring Boot
        const res = await apiLogin({ username, password });
        const data = res.data; // { token, username, role, userId, nom, prenom }

        // Stocker dans localStorage (persiste après rafraîchissement)
        localStorage.setItem('token', data.token);       // le token JWT
        localStorage.setItem('user', JSON.stringify(data)); // les infos utilisateur

        // Mettre à jour le state React → tous les composants sont informés
        setUser(data);

        // Retourner les données pour la redirection dans LoginPage.jsx
        return data;
    };

    // ──────────────────────────────────────────────────────────────
    // Fonction LOGOUT
    // ──────────────────────────────────────────────────────────────
    // Déconnexion CÔTÉ CLIENT uniquement.
    // JWT est "stateless" → le serveur n'a pas de session à détruire !
    // Il suffit de supprimer le token du localStorage.
    // Sans token, les requêtes API recevront une erreur 401.
    const logout = () => {
        localStorage.clear(); // Supprime token + user du navigateur
        setUser(null);        // Réinitialise le state → redirection vers /login
    };

    // Fournir les valeurs à tous les composants enfants
    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

// ================================================================
//  Hook personnalisé useAuth()
// ================================================================
// Permet d'accéder facilement au contexte depuis n'importe quel composant.
//
// Utilisation :
//   const { user, logout } = useAuth();
//   if (user?.role === 'ADMIN') { ... }
//   if (!user) { // pas connecté }
// ================================================================
export const useAuth = () => useContext(AuthContext);
