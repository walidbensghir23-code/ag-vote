// ============================================================
// PAGE MES VOTES — Version Débutant
//
// Cette page affiche l'historique de tous les votes exprimés
// par l'utilisateur connecté
// ============================================================

import { useState, useEffect } from 'react';
import { getMyVotes } from '../../api/api';

export default function MyVotesPage() {
    // ---- Données du backend ----
    const [votes, setVotes] = useState([]); // liste de tous mes votes
    const [chargement, setChargement] = useState(true);

    // ============================================================
    // Charger mes votes au démarrage
    // ============================================================
    useEffect(() => {
        const charger = async () => {
            try {
                const reponse = await getMyVotes();
                setVotes(reponse.data);
            } catch (err) {
                console.error('Erreur:', err);
            }
            setChargement(false);
        };
        charger();
    }, []);

    // ============================================================
    // Calculer les statistiques de mes votes
    // ============================================================
    const nombrePour = votes.filter(v => v.choix === 'POUR').length;
    const nombreContre = votes.filter(v => v.choix === 'CONTRE').length;
    const nombreNeutre = votes.filter(v => v.choix === 'NEUTRE').length;

    // ============================================================
    // Fonction pour afficher un badge coloré selon le vote
    // ============================================================
    const BadgeVote = ({ choix }) => {
        // Couleurs selon le choix
        const couleurs = {
            POUR: { background: '#d1fae5', color: '#065f46' },
            CONTRE: { background: '#fee2e2', color: '#991b1b' },
            NEUTRE: { background: '#f3f4f6', color: '#374151' },
        };
        const emojis = {
            POUR: '✅',
            CONTRE: '❌',
            NEUTRE: '⚪',
        };

        const style = couleurs[choix] || { background: '#f3f4f6', color: '#374151' };
        const emoji = emojis[choix] || '—';

        return (
            <span style={{
                ...style,
                padding: '4px 12px',
                borderRadius: 99,
                fontSize: '0.85rem',
                fontWeight: 700,
            }}>
                {emoji} {choix}
            </span>
        );
    };

    // ============================================================
    // RENDU
    // ============================================================
    return (
        <div style={{ padding: 24 }}>

            {/* En-tête */}
            <div style={{ marginBottom: 24 }}>
                <h1 style={styles.titrePage}>✅ Mes Votes</h1>
                <p style={styles.sousTitrePage}>Historique de tous vos votes exprimés</p>
            </div>

            {/* Statistiques (affichées seulement si on a des votes) */}
            {votes.length > 0 && (
                <div style={styles.grilleStats}>

                    <div style={styles.carteStats}>
                        <span style={{ ...styles.iconeStats, background: 'rgba(16,185,129,0.15)' }}>✅</span>
                        <div>
                            <div style={styles.valeurStats}>{nombrePour}</div>
                            <div style={styles.libelleStats}>Votes POUR</div>
                        </div>
                    </div>

                    <div style={styles.carteStats}>
                        <span style={{ ...styles.iconeStats, background: 'rgba(239,68,68,0.15)' }}>❌</span>
                        <div>
                            <div style={styles.valeurStats}>{nombreContre}</div>
                            <div style={styles.libelleStats}>Votes CONTRE</div>
                        </div>
                    </div>

                    <div style={styles.carteStats}>
                        <span style={{ ...styles.iconeStats, background: 'rgba(156,163,175,0.15)' }}>⚪</span>
                        <div>
                            <div style={styles.valeurStats}>{nombreNeutre}</div>
                            <div style={styles.libelleStats}>Votes NEUTRES</div>
                        </div>
                    </div>

                    <div style={styles.carteStats}>
                        <span style={{ ...styles.iconeStats, background: 'rgba(139,92,246,0.15)' }}>🗳️</span>
                        <div>
                            <div style={styles.valeurStats}>{votes.length}</div>
                            <div style={styles.libelleStats}>Total votes</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tableau des votes */}
            <div style={styles.conteneur}>
                <div style={styles.barreDOutils}>
                    <span style={styles.compteur}>
                        {votes.length} vote(s) exprimé(s)
                    </span>
                </div>

                {chargement ? (
                    <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
                        ⏳ Chargement...
                    </div>
                ) : (
                    <table style={styles.tableau}>
                        <thead>
                            <tr style={{ background: '#f9fafb' }}>
                                <th style={styles.enteteColonne}>Résolution</th>
                                <th style={styles.enteteColonne}>Mon vote</th>
                                <th style={styles.enteteColonne}>Poids (actions)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {votes.map(vote => (
                                <tr key={vote.id} style={styles.ligne}>

                                    {/* Titre de la résolution */}
                                    <td style={styles.cellule}>
                                        <strong>{vote.resolutionTitre}</strong>
                                    </td>

                                    {/* Mon choix (POUR / CONTRE / NEUTRE) avec badge coloré */}
                                    <td style={styles.cellule}>
                                        <BadgeVote choix={vote.choix} />
                                    </td>

                                    {/* Nombre d'actions (poids du vote) */}
                                    <td style={styles.cellule}>
                                        <span style={{ fontWeight: 600, color: '#059669' }}>
                                            {vote.poids?.toLocaleString()} actions
                                        </span>
                                    </td>
                                </tr>
                            ))}

                            {/* Message si aucun vote */}
                            {votes.length === 0 && (
                                <tr>
                                    <td colSpan={3} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
                                        <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
                                        <p>Vous n'avez pas encore exprimé de vote</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
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
    grilleStats: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: 16,
        marginBottom: 28,
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
    conteneur: {
        background: '#fff',
        borderRadius: 12,
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
    },
    barreDOutils: {
        padding: '16px 20px',
        borderBottom: '1px solid #e5e7eb',
    },
    compteur: {
        fontWeight: 600,
        color: '#374151',
    },
    tableau: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    enteteColonne: {
        padding: '12px 16px',
        textAlign: 'left',
        fontWeight: 600,
        fontSize: '0.8rem',
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        borderBottom: '1px solid #e5e7eb',
    },
    ligne: {
        borderBottom: '1px solid #f3f4f6',
    },
    cellule: {
        padding: '14px 16px',
        verticalAlign: 'middle',
    },
};
