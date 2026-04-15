// ============================================================
// TABLEAU DE BORD UTILISATEUR — Version Débutant
//
// Cette page affiche :
//   - Des statistiques (nombre d'AGs, à venir, passées)
//   - La liste des assemblées générales disponibles pour l'utilisateur
//   - Un bouton pour accéder à chaque AG et voter
// ============================================================

import { useState, useEffect } from 'react';
import { getUserAGs } from '../../api/api'; // appel API pour récupérer les AGs de l'utilisateur
import { useNavigate } from 'react-router-dom'; // pour naviguer vers la page de vote

export default function DashboardPage() {
    // ---- Données du backend ----
    const [assembleesGerales, setAssembleesGenerales] = useState([]); // liste des AGs
    const [chargement, setChargement] = useState(true);

    // useNavigate permet de changer de page programmatiquement
    const navigate = useNavigate();

    // ============================================================
    // Charger les AGs au démarrage de la page
    // ============================================================
    useEffect(() => {
        const charger = async () => {
            try {
                const reponse = await getUserAGs();
                setAssembleesGenerales(reponse.data);
            } catch (err) {
                console.error('Erreur de chargement:', err);
            }
            setChargement(false);
        };

        charger();
    }, []); // [] = s'exécute une seule fois

    // ============================================================
    // Fonction utilitaire pour formater une date en français
    // Exemple : "2024-03-15" → "15 mars 2024"
    // ============================================================
    const formaterDate = (dateString) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    // ============================================================
    // Séparer les AGs à venir et les AGs passées
    // new Date() = la date d'aujourd'hui
    // ============================================================
    const agsAVenir = assembleesGerales.filter(ag => ag.date && new Date(ag.date) >= new Date());
    const agsPassees = assembleesGerales.filter(ag => ag.date && new Date(ag.date) < new Date());

    // Calculer le total de résolutions de toutes les AGs
    const totalResolutions = assembleesGerales.reduce((somme, ag) => {
        return somme + (ag.resolutions?.length || 0);
    }, 0);

    // ============================================================
    // RENDU DE LA PAGE
    // ============================================================
    if (chargement) {
        return (
            <div style={{ padding: 24, textAlign: 'center', color: '#9ca3af' }}>
                ⏳ Chargement...
            </div>
        );
    }

    return (
        <div style={{ padding: 24 }}>

            {/* En-tête */}
            <div style={{ marginBottom: 28 }}>
                <h1 style={styles.titrePage}>🏠 Tableau de bord</h1>
                <p style={styles.sousTitrePage}>Vos assemblées générales et résolutions</p>
            </div>

            {/* ---- Statistiques ---- */}
            <div style={styles.grilleStats}>

                {/* Carte stat : total AGs */}
                <div style={styles.carteStats}>
                    <span style={{ ...styles.iconeStats, background: 'rgba(139,92,246,0.15)' }}>🗳️</span>
                    <div>
                        <div style={styles.valeurStats}>{assembleesGerales.length}</div>
                        <div style={styles.libelleStats}>Assemblées totales</div>
                    </div>
                </div>

                {/* Carte stat : AGs à venir */}
                <div style={styles.carteStats}>
                    <span style={{ ...styles.iconeStats, background: 'rgba(16,185,129,0.15)' }}>📅</span>
                    <div>
                        <div style={styles.valeurStats}>{agsAVenir.length}</div>
                        <div style={styles.libelleStats}>À venir</div>
                    </div>
                </div>

                {/* Carte stat : résolutions */}
                <div style={styles.carteStats}>
                    <span style={{ ...styles.iconeStats, background: 'rgba(245,158,11,0.15)' }}>📋</span>
                    <div>
                        <div style={styles.valeurStats}>{totalResolutions}</div>
                        <div style={styles.libelleStats}>Résolutions totales</div>
                    </div>
                </div>

                {/* Carte stat : AGs passées */}
                <div style={styles.carteStats}>
                    <span style={{ ...styles.iconeStats, background: 'rgba(59,130,246,0.15)' }}>✅</span>
                    <div>
                        <div style={styles.valeurStats}>{agsPassees.length}</div>
                        <div style={styles.libelleStats}>Passées</div>
                    </div>
                </div>
            </div>

            {/* ---- AGs À VENIR ---- */}
            {agsAVenir.length > 0 && (
                <div style={{ marginBottom: 32 }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16, color: '#059669' }}>
                        📅 Assemblées à venir
                    </h2>
                    <div style={styles.grilleCartes}>
                        {agsAVenir.map(ag => (
                            <div
                                key={ag.id}
                                style={styles.carteAG}
                                // Au clic, naviguer vers la page de vote pour cette AG
                                onClick={() => navigate(`/user/ag/${ag.id}`)}
                            >
                                <div style={styles.carteEnTete}>
                                    <div>
                                        <div style={styles.carteTitre}>{ag.titre}</div>
                                        <div style={styles.carteMeta}>
                                            <span>🏢 {ag.entrepriseNom}</span>
                                            <span>📅 {formaterDate(ag.date)}</span>
                                        </div>
                                    </div>
                                    {/* Badge vert pour "à venir" */}
                                    <span style={{ ...styles.badge, background: '#d1fae5', color: '#065f46' }}>
                                        À venir
                                    </span>
                                </div>
                                <div style={styles.cartePied}>
                                    <span>📋 {(ag.resolutions || []).length} résolution(s)</span>
                                    <span>📍 {ag.lieu || 'Lieu non défini'}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ---- AGs PASSÉES ---- */}
            {agsPassees.length > 0 && (
                <div>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16, color: '#6b7280' }}>
                        🕓 Assemblées passées
                    </h2>
                    <div style={styles.grilleCartes}>
                        {agsPassees.map(ag => (
                            <div
                                key={ag.id}
                                style={{ ...styles.carteAG, opacity: 0.7 }}
                                onClick={() => navigate(`/user/ag/${ag.id}`)}
                            >
                                <div style={styles.carteEnTete}>
                                    <div>
                                        <div style={styles.carteTitre}>{ag.titre}</div>
                                        <div style={styles.carteMeta}>
                                            <span>🏢 {ag.entrepriseNom}</span>
                                            <span>📅 {formaterDate(ag.date)}</span>
                                        </div>
                                    </div>
                                    {/* Badge gris pour "passée" */}
                                    <span style={{ ...styles.badge, background: '#f3f4f6', color: '#6b7280' }}>
                                        Passée
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Message si aucune AG */}
            {assembleesGerales.length === 0 && (
                <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>🗳️</div>
                    <p>Aucune assemblée générale disponible pour le moment</p>
                </div>
            )}
        </div>
    );
}

// ============================================================
// STYLES
// ============================================================
const styles = {
    titrePage: {
        fontSize: '1.8rem',
        fontWeight: 800,
        color: '#1a1a2e',
        margin: '0 0 4px',
    },
    sousTitrePage: {
        color: '#6b7280',
        margin: 0,
    },
    // Grille des statistiques (4 colonnes)
    grilleStats: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: 16,
        marginBottom: 32,
    },
    carteStats: {
        background: '#fff',
        borderRadius: 12,
        border: '1px solid #e5e7eb',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
    },
    iconeStats: {
        width: 48,
        height: 48,
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.4rem',
        flexShrink: 0,
    },
    valeurStats: {
        fontSize: '1.8rem',
        fontWeight: 800,
        color: '#1a1a2e',
    },
    libelleStats: {
        fontSize: '0.8rem',
        color: '#6b7280',
        marginTop: 2,
    },
    // Grille des cartes AG
    grilleCartes: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: 16,
    },
    carteAG: {
        background: '#fff',
        borderRadius: 12,
        border: '1px solid #e5e7eb',
        cursor: 'pointer',
        overflow: 'hidden',
        transition: 'box-shadow 0.2s',
    },
    carteEnTete: {
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottom: '1px solid #f3f4f6',
    },
    carteTitre: {
        fontWeight: 700,
        fontSize: '1rem',
        color: '#1a1a2e',
        marginBottom: 6,
    },
    carteMeta: {
        display: 'flex',
        gap: 12,
        fontSize: '0.82rem',
        color: '#6b7280',
    },
    cartePied: {
        padding: '10px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.82rem',
        color: '#6b7280',
    },
    badge: {
        padding: '3px 10px',
        borderRadius: 99,
        fontSize: '0.78rem',
        fontWeight: 600,
        flexShrink: 0,
    },
};
