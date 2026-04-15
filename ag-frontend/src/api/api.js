// ================================================================
//  api.js — Module de communication avec le backend Spring Boot
// ================================================================
//
//  Ce fichier fait 3 choses importantes :
//
//  1. CONFIGURE AXIOS
//     Axios est une librairie pour faire des requêtes HTTP (GET, POST, PUT, DELETE).
//     On crée une instance avec la baseURL du backend pour ne pas répéter l'URL partout.
//
//  2. INJECTEUR DE TOKEN (intercepteur de requête)
//     Avant chaque requête API, on ajoute automatiquement le token JWT
//     dans l'en-tête "Authorization: Bearer <token>".
//     Le backend vérifie ce token pour savoir qui fait la requête.
//
//  3. GESTIONNAIRE D'ERREUR 401 (intercepteur de réponse)
//     Si le backend répond 401 (token expiré ou invalide),
//     on nettoie le localStorage et on redirige vers la page login.
//
//  UTILISATION dans les composants :
//     import { getEntreprises, createEntreprise } from '../../api/api';
//     const reponse = await getEntreprises();
//     const entreprises = reponse.data; // tableau des entreprises
// ================================================================

import axios from 'axios';

// URL de base du backend Spring Boot
// Toutes les requêtes seront envoyées à http://localhost:8080/api/...
const API_URL = 'http://localhost:8080/api';

// Création de l'instance Axios configurée
const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' }, // on envoie du JSON
});

// ================================================================
//  INTERCEPTEUR DE REQUÊTE — ajout automatique du token JWT
// ================================================================
// Ce code s'exécute AVANT chaque appel API.
// Il récupère le token dans localStorage et l'ajoute dans le header.
//
// Sans ce header, le backend répondrait 401 sur les routes protégées.
// Grâce à lui, le JwtAuthFilter du backend peut vérifier l'identité.
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token'); // récupérer le token JWT

    if (token) {
        // Ajouter le header : Authorization: Bearer eyJhbGci...
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config; // retourner la config modifiée
});

// ================================================================
//  INTERCEPTEUR DE RÉPONSE — gestion de l'expiration du token
// ================================================================
// Ce code s'exécute APRÈS chaque réponse du backend.
// Si on reçoit une erreur 401 → le token a expiré ou est invalide.
// On nettoie la session et on redirige vers la page de connexion.
api.interceptors.response.use(
    (res) => res, // si tout va bien → retourner la réponse normalement

    (err) => {
        if (err.response?.status === 401) {
            // Token expiré ou invalide → déconnexion forcée
            localStorage.clear();           // supprimer token + user
            window.location.href = '/login'; // rediriger vers login
        }
        return Promise.reject(err); // propager l'erreur pour les catch locaux
    }
);


// ================================================================
//  FONCTIONS AUTH — Authentification
// ================================================================

/** Connexion : envoie username + password, reçoit le token JWT */
export const login = (data) => api.post('/auth/login', data);


// ================================================================
//  FONCTIONS ADMIN — Entreprises
// ================================================================

/** Retourne la liste de toutes les entreprises */
export const getEntreprises = () => api.get('/admin/entreprises');

/** Retourne une entreprise par son ID */
export const getEntreprise = (id) => api.get(`/admin/entreprises/${id}`);

/** Crée une nouvelle entreprise */
export const createEntreprise = (data) => api.post('/admin/entreprises', data);

/** Met à jour une entreprise existante */
export const updateEntreprise = (id, data) => api.put(`/admin/entreprises/${id}`, data);

/** Supprime une entreprise */
export const deleteEntreprise = (id) => api.delete(`/admin/entreprises/${id}`);


// ================================================================
//  FONCTIONS ADMIN — Actionnaires
// ================================================================

/** Retourne tous les actionnaires */
export const getActionnaires = () => api.get('/admin/actionnaires');

/** Retourne les actionnaires d'une entreprise spécifique */
export const getActionnairesParEntreprise = (id) => api.get(`/admin/actionnaires/entreprise/${id}`);

/** Crée un actionnaire (lien user ↔ entreprise avec nombre d'actions) */
export const createActionnaire = (data) => api.post('/admin/actionnaires', data);

/** Met à jour le nombre d'actions d'un actionnaire */
export const updateActionnaire = (id, data) => api.put(`/admin/actionnaires/${id}`, data);

/** Supprime le lien actionnaire */
export const deleteActionnaire = (id) => api.delete(`/admin/actionnaires/${id}`);

/** Retourne tous les utilisateurs (pour les menus déroulants) */
export const getUsers = () => api.get('/admin/users');

/** Crée un utilisateur depuis l'espace admin */
export const createUser = (data) => api.post('/admin/users', data);


// ================================================================
//  FONCTIONS ADMIN — Résolutions
// ================================================================

/** Retourne toutes les résolutions */
export const getResolutions = () => api.get('/admin/resolutions');

/** Retourne les résolutions d'une entreprise */
export const getResolutionsParEntreprise = (id) => api.get(`/admin/resolutions/entreprise/${id}`);

/** Crée une résolution */
export const createResolution = (data) => api.post('/admin/resolutions', data);

/** Met à jour une résolution */
export const updateResolution = (id, data) => api.put(`/admin/resolutions/${id}`, data);

/** Supprime une résolution */
export const deleteResolution = (id) => api.delete(`/admin/resolutions/${id}`);


// ================================================================
//  FONCTIONS ADMIN — Assemblées Générales
// ================================================================

/** Retourne toutes les AGs */
export const getAGs = () => api.get('/admin/ag');

/** Retourne une AG avec ses résolutions */
export const getAG = (id) => api.get(`/admin/ag/${id}`);

/** Crée une AG */
export const createAG = (data) => api.post('/admin/ag', data);

/** Met à jour une AG */
export const updateAG = (id, data) => api.put(`/admin/ag/${id}`, data);

/** Supprime une AG */
export const deleteAG = (id) => api.delete(`/admin/ag/${id}`);


// ================================================================
//  FONCTIONS USER — Espace actionnaire
// ================================================================

/** Retourne les AGs accessibles à l'actionnaire connecté */
export const getUserAGs = () => api.get('/user/ag');

/** Retourne le détail d'une AG (avec résolutions) */
export const getUserAG = (id) => api.get(`/user/ag/${id}`);

/** Retourne les résolutions d'une AG (pour la page de vote) */
export const getResolutionsByAG = (agId) => api.get(`/user/resolutions/ag/${agId}`);

/** Exprime un vote sur une résolution (POUR / CONTRE / NEUTRE) */
export const vote = (data) => api.post('/user/vote', data);

/** Retourne l'historique de votes de l'utilisateur connecté */
export const getMyVotes = () => api.get('/user/votes');

/** Retourne tous les votes sur une résolution spécifique */
export const getVotesByResolution = (id) => api.get(`/user/votes/resolution/${id}`);


// ================================================================
//  UPLOAD D'IMAGE
// ================================================================

/**
 * Envoie une image vers le backend en multipart/form-data
 * @param {File} file - Le fichier image sélectionné par l'utilisateur
 * @returns {Promise} { url: "http://localhost:8080/uploads/..." }
 */
export const uploadLogo = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

// Exporter l'instance axios pour usage avancé si besoin
export default api;
