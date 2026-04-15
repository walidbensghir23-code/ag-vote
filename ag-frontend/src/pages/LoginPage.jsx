// ============================================================
// PAGE DE CONNEXION SIMPLE
// Permet à l'utilisateur de se connecter avec son username et mot de passe
// ============================================================

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
    // ---- useAuth nous donne la fonction login ----
    const { login } = useAuth();

    // ---- useNavigate permet de changer de page après connexion ----
    const navigate = useNavigate();

    // ---- Les données du formulaire ----
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [erreur, setErreur] = useState('');       // message d'erreur
    const [chargement, setChargement] = useState(false); // bouton désactivé pendant connexion

    // ---- Quand l'utilisateur clique sur "Se connecter" ----
    const handleConnexion = async (e) => {
        e.preventDefault(); // empêche le rechargement de la page

        setChargement(true);
        setErreur('');

        try {
            // login() envoie les identifiants au backend Java et retourne l'utilisateur
            const utilisateur = await login(username, password);

            // Redirection selon le rôle : ADMIN → page admin, sinon → dashboard
            if (utilisateur.role === 'ADMIN') {
                navigate('/admin/entreprises');
            } else {
                navigate('/user/dashboard');
            }
        } catch {
            // Si la connexion échoue, on affiche un message d'erreur
            setErreur('Identifiants incorrects. Vérifiez votre nom d\'utilisateur et mot de passe.');
        }

        setChargement(false);
    };

    // ============================================================
    // AFFICHAGE DU FORMULAIRE
    // ============================================================
    return (
        <div style={styles.page}>
            <div style={styles.carte}>

                {/* Titre */}
                <div style={styles.titre}>
                    <span style={{ fontSize: 40 }}>🏛️</span>
                    <h1 style={styles.h1}>AG Vote</h1>
                    <p style={styles.sousTitre}>Connectez-vous à votre espace</p>
                </div>

                {/* Message d'erreur (affiché seulement si erreur) */}
                {erreur && (
                    <div style={styles.erreur}>
                        ⚠️ {erreur}
                    </div>
                )}

                {/* Formulaire */}
                <form onSubmit={handleConnexion}>

                    {/* Champ nom d'utilisateur */}
                    <div style={styles.champGroupe}>
                        <label style={styles.label}>Nom d'utilisateur</label>
                        <input
                            style={styles.input}
                            type="text"
                            placeholder="Ex: admin"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    {/* Champ mot de passe */}
                    <div style={styles.champGroupe}>
                        <label style={styles.label}>Mot de passe</label>
                        <input
                            style={styles.input}
                            type="password"
                            placeholder="Votre mot de passe"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {/* Bouton de connexion */}
                    <button
                        type="submit"
                        style={{
                            ...styles.bouton,
                            opacity: chargement ? 0.6 : 1,
                            cursor: chargement ? 'not-allowed' : 'pointer'
                        }}
                        disabled={chargement}
                    >
                        {chargement ? '⏳ Connexion...' : '🔐 Se connecter'}
                    </button>
                </form>

                {/* Aide pour les tests */}
                <div style={styles.aide}>
                    <strong>Comptes de test :</strong>
                    <br />
                    👑 Admin : <code>admin</code> / <code>admin</code>
                    <br />
                    👤 Utilisateur : <code>martin</code> / <code>martin</code>
                </div>

            </div>
        </div>
    );
}

// ============================================================
// STYLES — objets JavaScript simples
// ============================================================
const styles = {
    page: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #11998e, #38ef7d)',
        padding: 20,
    },
    carte: {
        background: '#fff',
        borderRadius: 16,
        padding: '48px 40px',
        width: '100%',
        maxWidth: 420,
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
    },
    titre: {
        textAlign: 'center',
        marginBottom: 32,
    },
    h1: {
        fontSize: '2rem',
        fontWeight: 800,
        color: '#1a1a2e',
        margin: '8px 0 4px',
    },
    sousTitre: {
        color: '#9ca3af',
        fontSize: '0.9rem',
        margin: 0,
    },
    erreur: {
        background: '#fff0f0',
        border: '1px solid #fecaca',
        color: '#b91c1c',
        borderRadius: 8,
        padding: '10px 14px',
        fontSize: '0.85rem',
        marginBottom: 20,
    },
    champGroupe: {
        marginBottom: 16,
    },
    label: {
        display: 'block',
        fontWeight: 600,
        fontSize: '0.85rem',
        color: '#374151',
        marginBottom: 6,
    },
    input: {
        width: '100%',
        padding: '12px 14px',
        border: '1.5px solid #e2e8f0',
        borderRadius: 8,
        fontSize: '0.9rem',
        outline: 'none',
        boxSizing: 'border-box',
        background: '#f8fafc',
        color: '#1a1a2e',
    },
    bouton: {
        width: '100%',
        padding: '13px',
        background: 'linear-gradient(135deg, #11998e, #38ef7d)',
        color: '#fff',
        border: 'none',
        borderRadius: 8,
        fontSize: '1rem',
        fontWeight: 700,
        marginTop: 8,
    },
    aide: {
        marginTop: 24,
        padding: '12px 16px',
        background: '#f0fdf4',
        border: '1px solid #bbf7d0',
        borderRadius: 8,
        fontSize: '0.82rem',
        color: '#166534',
        lineHeight: 1.8,
    },
};
