// ============================================================
// PAGE DE VOTE — Version Débutant
//
// Cette page permet à un actionnaire de :
//   - Voir toutes ses assemblées générales
//   - Cliquer sur une AG pour voir ses résolutions
//   - Voter POUR, CONTRE ou s'ABSTENIR sur chaque résolution
// ============================================================

import { useState, useEffect } from 'react';
import { getUserAGs, vote, getMyVotes } from '../../api/api';

export default function AGVotePage() {
    // ---- Données du backend ----
    const [assemblees, setAssemblees] = useState([]);  // liste des AGs
    const [mesVotes, setMesVotes] = useState([]);       // mes votes déjà exprimés

    // ---- État de l'interface ----
    const [chargement, setChargement] = useState(true);
    const [agOuverte, setAgOuverte] = useState(null);  // ID de l'AG affichée (null = aucune)
    const [voteEnCours, setVoteEnCours] = useState(null); // ID de la résolution en train d'être votée
    const [message, setMessage] = useState(null);      // message de succès ou d'erreur

    // ============================================================
    // Charger les données au démarrage
    // ============================================================
    useEffect(() => {
        const charger = async () => {
            try {
                // Charger les AGs et mes votes en parallèle
                const [resAgs, resVotes] = await Promise.all([
                    getUserAGs(),
                    getMyVotes()
                ]);
                setAssemblees(resAgs.data || []);
                setMesVotes(resVotes.data || []);
            } catch (err) {
                console.error('Erreur de chargement:', err);
            }
            setChargement(false);
        };
        charger();
    }, []);

    // ============================================================
    // Afficher un message temporaire (3 secondes)
    // ============================================================
    const afficherMessage = (texte, succes = true) => {
        setMessage({ texte, succes });
        // Après 3 secondes, effacer le message
        setTimeout(() => setMessage(null), 3000);
    };

    // ============================================================
    // Trouver mon vote pour une résolution donnée
    // Retourne : 'POUR', 'CONTRE', 'NEUTRE' ou undefined
    // ============================================================
    const monVotePour = (resolutionId) => {
        const monVote = mesVotes.find(v => v.resolutionId === resolutionId);
        return monVote?.choix; // le "?" évite une erreur si monVote est undefined
    };

    // ============================================================
    // Enregistrer un vote
    // ============================================================
    const voter = async (resolutionId, choix) => {
        setVoteEnCours(resolutionId); // désactiver les boutons de cette résolution

        try {
            // Envoyer le vote au backend
            await vote({ resolutionId, choix });

            // Mettre à jour mes votes localement (sans recharger depuis le backend)
            setMesVotes(votesActuels => {
                const votExistant = votesActuels.find(v => v.resolutionId === resolutionId);

                if (votExistant) {
                    // SI j'avais déjà voté → modifier mon vote
                    return votesActuels.map(v =>
                        v.resolutionId === resolutionId ? { ...v, choix } : v
                    );
                } else {
                    // SI je n'avais pas encore voté → ajouter mon vote
                    return [...votesActuels, { resolutionId, choix }];
                }
            });

            afficherMessage(`Vote "${choix}" enregistré ✓`, true);
        } catch (err) {
            afficherMessage('Erreur : vous n\'êtes peut-être pas actionnaire de cette entreprise', false);
        }

        setVoteEnCours(null); // réactiver les boutons
    };

    // Formater une date
    const formaterDate = (dateString) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    // ============================================================
    // RENDU
    // ============================================================
    if (chargement) {
        return (
            <div style={{ padding: 24, textAlign: 'center', color: '#9ca3af' }}>
                ⏳ Chargement...
            </div>
        );
    }

    return (
        <div style={{ padding: 24, maxWidth: 720, margin: '0 auto' }}>

            {/* ---- Message de succès / erreur (en haut à droite) ---- */}
            {message && (
                <div style={{
                    position: 'fixed',
                    top: 20,
                    right: 20,
                    zIndex: 999,
                    padding: '12px 20px',
                    borderRadius: 10,
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    background: message.succes ? '#f0fdf4' : '#fef2f2',
                    color: message.succes ? '#065f46' : '#b91c1c',
                    border: `1px solid ${message.succes ? '#a7f3d0' : '#fca5a5'}`,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                }}>
                    {message.texte}
                </div>
            )}

            {/* En-tête */}
            <div style={{ marginBottom: 24 }}>
                <h1 style={styles.titrePage}>🗳️ Mes Assemblées & Votes</h1>
                <p style={styles.sousTitrePage}>Cliquez sur une assemblée pour voir les résolutions et voter</p>
            </div>

            {/* Message si aucune AG */}
            {assemblees.length === 0 && (
                <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>🗳️</div>
                    <p>Aucune assemblée générale disponible</p>
                </div>
            )}

            {/* ---- Liste des assemblées ---- */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {assemblees.map(ag => {
                    // Trier les résolutions par ordre
                    const resolutions = (ag.resolutions || []).sort((a, b) => (a.ordre || 0) - (b.ordre || 0));

                    const estOuverte = agOuverte === ag.id; // cette AG est-elle affichée ?
                    const nombreVotes = resolutions.filter(r => monVotePour(r.id)).length; // combien j'ai voté
                    const totalResolutions = resolutions.length;

                    return (
                        <div key={ag.id} style={{
                            ...styles.carteAG,
                            border: `1.5px solid ${estOuverte ? '#059669' : '#e5e7eb'}`,
                            boxShadow: estOuverte ? '0 4px 20px rgba(5,150,105,0.1)' : '0 1px 4px rgba(0,0,0,0.05)',
                        }}>

                            {/* ---- En-tête cliquable de l'AG ---- */}
                            <div
                                style={{
                                    ...styles.enteteAG,
                                    background: estOuverte ? '#f0fdf8' : '#fff',
                                }}
                                onClick={() => setAgOuverte(estOuverte ? null : ag.id)} // toggle : ouvrir/fermer
                            >
                                <div>
                                    <div style={styles.titreAG}>{ag.titre}</div>
                                    <div style={styles.metaAG}>
                                        <span>🏢 {ag.entrepriseNom}</span>
                                        <span>📅 {formaterDate(ag.date)}</span>
                                        {ag.lieu && <span>📍 {ag.lieu}</span>}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    {/* Compteur de votes */}
                                    {totalResolutions > 0 && (
                                        <span style={{
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            padding: '3px 10px',
                                            borderRadius: 99,
                                            background: nombreVotes === totalResolutions ? '#d1fae5' : '#f0fdf8',
                                            color: nombreVotes === totalResolutions ? '#065f46' : '#059669',
                                            border: '1px solid #a7f3d0',
                                        }}>
                                            {nombreVotes}/{totalResolutions} votés
                                        </span>
                                    )}
                                    {/* Flèche qui tourne quand ouvert */}
                                    <span style={{
                                        color: '#9ca3af',
                                        transform: estOuverte ? 'rotate(180deg)' : 'none',
                                        transition: '0.2s',
                                        display: 'inline-block',
                                    }}>
                                        ▼
                                    </span>
                                </div>
                            </div>

                            {/* ---- Résolutions (visible seulement quand l'AG est ouverte) ---- */}
                            {estOuverte && (
                                <div style={{ borderTop: '1px solid #e5e7eb', padding: '16px 20px' }}>

                                    {/* Description de l'AG */}
                                    {ag.description && (
                                        <p style={{ fontSize: '0.82rem', color: '#6b7280', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #e5e7eb' }}>
                                            {ag.description}
                                        </p>
                                    )}

                                    {totalResolutions === 0 && (
                                        <p style={{ color: '#9ca3af', fontSize: '0.85rem', textAlign: 'center' }}>
                                            Aucune résolution pour cette assemblée
                                        </p>
                                    )}

                                    {/* ---- Liste des résolutions ---- */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        {resolutions.map(resolution => {
                                            const monChoix = monVotePour(resolution.id); // mon vote actuel
                                            const enTrainDeVoter = voteEnCours === resolution.id;

                                            return (
                                                <div key={resolution.id} style={{
                                                    border: `1px solid ${monChoix === 'POUR' ? '#a7f3d0' : // vert si POUR
                                                            monChoix === 'CONTRE' ? '#fca5a5' : // rouge si CONTRE
                                                                '#e5e7eb'                           // gris sinon
                                                        }`,
                                                    borderRadius: 10,
                                                    padding: '14px 16px',
                                                    background: monChoix ? '#fafffe' : '#fafafa',
                                                }}>

                                                    {/* Numéro + Titre + Description */}
                                                    <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                                                        {/* Numéro d'ordre */}
                                                        <span style={{
                                                            width: 26, height: 26,
                                                            borderRadius: 7,
                                                            background: '#059669',
                                                            color: '#fff',
                                                            fontSize: '0.7rem',
                                                            fontWeight: 800,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            flexShrink: 0,
                                                        }}>
                                                            #{resolution.ordre}
                                                        </span>
                                                        <div>
                                                            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1a1a2e' }}>
                                                                {resolution.titre}
                                                            </div>
                                                            {resolution.description && (
                                                                <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: 3, lineHeight: 1.5 }}>
                                                                    {resolution.description}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* ---- Boutons POUR / CONTRE / ABSTENTION ---- */}
                                                    <div style={{ display: 'flex', gap: 8 }}>

                                                        {/* Bouton POUR */}
                                                        <button
                                                            disabled={enTrainDeVoter}
                                                            onClick={() => voter(resolution.id, 'POUR')}
                                                            style={{
                                                                ...styles.boutonVote,
                                                                background: monChoix === 'POUR' ? '#d1fae5' : '#fff',
                                                                color: monChoix === 'POUR' ? '#059669' : '#6b7280',
                                                                border: `1.5px solid ${monChoix === 'POUR' ? '#6ee7b7' : '#e5e7eb'}`,
                                                                opacity: enTrainDeVoter ? 0.5 : 1,
                                                            }}
                                                        >
                                                            ✅ Pour
                                                        </button>

                                                        {/* Bouton CONTRE */}
                                                        <button
                                                            disabled={enTrainDeVoter}
                                                            onClick={() => voter(resolution.id, 'CONTRE')}
                                                            style={{
                                                                ...styles.boutonVote,
                                                                background: monChoix === 'CONTRE' ? '#fee2e2' : '#fff',
                                                                color: monChoix === 'CONTRE' ? '#dc2626' : '#6b7280',
                                                                border: `1.5px solid ${monChoix === 'CONTRE' ? '#fca5a5' : '#e5e7eb'}`,
                                                                opacity: enTrainDeVoter ? 0.5 : 1,
                                                            }}
                                                        >
                                                            ❌ Contre
                                                        </button>

                                                        {/* Bouton ABSTENTION */}
                                                        <button
                                                            disabled={enTrainDeVoter}
                                                            onClick={() => voter(resolution.id, 'NEUTRE')}
                                                            style={{
                                                                ...styles.boutonVote,
                                                                background: monChoix === 'NEUTRE' ? '#f3f4f6' : '#fff',
                                                                color: monChoix === 'NEUTRE' ? '#374151' : '#6b7280',
                                                                border: `1.5px solid ${monChoix === 'NEUTRE' ? '#d1d5db' : '#e5e7eb'}`,
                                                                opacity: enTrainDeVoter ? 0.5 : 1,
                                                            }}
                                                        >
                                                            ⚪ Abstention
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
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
    carteAG: {
        background: '#fff',
        borderRadius: 14,
        overflow: 'hidden',
        transition: 'box-shadow 0.2s',
    },
    enteteAG: {
        padding: '16px 20px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        userSelect: 'none', // empêche la sélection de texte au clic
    },
    titreAG: {
        fontWeight: 800,
        fontSize: '0.96rem',
        color: '#1a1a2e',
        marginBottom: 4,
    },
    metaAG: {
        fontSize: '0.75rem',
        color: '#6b7280',
        display: 'flex',
        gap: 12,
    },
    boutonVote: {
        flex: 1,
        padding: '9px 6px',
        borderRadius: 8,
        fontSize: '0.8rem',
        fontWeight: 700,
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'all 0.15s',
    },
};
