// ============================================================
// PAGE ASSEMBLÉES GÉNÉRALES — Avec barre d'étapes (Steps)
//
// La création d'une AG se fait en 3 étapes sur la même page :
//   Étape 1 → Informations de l'AG (titre, date, lieu...)
//   Étape 2 → Actionnaires (gérer et marquer les présents)
//   Étape 3 → Résolutions (sélectionner celles à voter)
//
// En bas : la liste des AGs existantes
// ============================================================

import { useState, useEffect } from 'react';
import {
    getAGs, createAG, updateAG, deleteAG,
    getEntreprises,
    getResolutions, createResolution,
    getActionnaires, createActionnaire, deleteActionnaire,
    getUsers
} from '../../api/api';

// ============================================================
// COMPOSANT : Barre d'étapes en haut du formulaire
// Props : etapeActuelle (0, 1 ou 2)
// ============================================================
function BarreEtapes({ etapeActuelle }) {
    const etapes = [
        { numero: 1, label: 'Infos AG', icone: '🗳️' },
        { numero: 2, label: 'Actionnaires', icone: '👥' },
        { numero: 3, label: 'Résolutions', icone: '📋' },
    ];

    return (
        <div style={{ display: 'flex', marginBottom: 28 }}>
            {etapes.map((etape, index) => {
                const estFaite = index < etapeActuelle;   // étape déjà complétée
                const estActive = index === etapeActuelle; // étape en cours
                const estDerniere = index === etapes.length - 1;

                // Couleur de fond selon l'état
                const fond = estFaite || estActive
                    ? 'linear-gradient(135deg, #11998e, #38ef7d)'
                    : '#f3f4f6';
                const couleurTexte = estFaite || estActive ? '#fff' : '#6b7280';

                return (
                    <div key={index} style={{ display: 'flex', alignItems: 'stretch', flex: 1 }}>

                        {/* Bloc de l'étape */}
                        <div style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '10px 16px',
                            background: fond,
                            color: couleurTexte,
                            borderRadius: index === 0 ? '10px 0 0 10px'
                                : estDerniere ? '0 10px 10px 0'
                                    : 0,
                            boxShadow: estActive ? '0 4px 16px rgba(17,153,142,0.25)' : 'none',
                            transition: 'all 0.3s',
                        }}>
                            <span style={{ fontSize: '1.1rem' }}>{etape.icone}</span>
                            <div>
                                <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', opacity: 0.75 }}>
                                    Étape {etape.numero}
                                </div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>
                                    {etape.label}
                                </div>
                            </div>
                            {/* Coche si étape terminée */}
                            {estFaite && <span style={{ marginLeft: 'auto', fontWeight: 800 }}>✓</span>}
                        </div>

                        {/* Flèche entre les étapes (sauf après la dernière) */}
                        {!estDerniere && (
                            <div style={{
                                width: 20,
                                background: estFaite ? 'linear-gradient(135deg, #11998e, #38ef7d)' : '#f3f4f6',
                                clipPath: 'polygon(0 0, 60% 0, 100% 50%, 60% 100%, 0 100%)',
                                flexShrink: 0,
                            }} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ============================================================
// ÉTAPE 1 : Formulaire des infos de l'AG
// ============================================================
function Etape1InfosAG({ formData, setFormData, entreprises }) {
    return (
        <div>
            <h3 style={styles.titreEtape}>🗳️ Informations de l'Assemblée Générale</h3>

            <div style={styles.champGroupe}>
                <label style={styles.label}>Titre *</label>
                <input
                    style={styles.input}
                    type="text"
                    value={formData.titre}
                    onChange={e => setFormData({ ...formData, titre: e.target.value })}
                    placeholder="Ex: AG Ordinaire 2024"
                />
            </div>

            <div style={styles.champGroupe}>
                <label style={styles.label}>Entreprise *</label>
                <select
                    style={styles.input}
                    value={formData.entrepriseId}
                    onChange={e => setFormData({
                        ...formData,
                        entrepriseId: e.target.value,
                        resolutionIds: []   // vider la sélection si on change d'entreprise
                    })}
                >
                    <option value="">-- Sélectionner une entreprise --</option>
                    {entreprises.map(e => (
                        <option key={e.id} value={e.id}>{e.nom}</option>
                    ))}
                </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={styles.champGroupe}>
                    <label style={styles.label}>Date</label>
                    <input
                        style={styles.input}
                        type="date"
                        value={formData.date}
                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                    />
                </div>
                <div style={styles.champGroupe}>
                    <label style={styles.label}>Lieu</label>
                    <input
                        style={styles.input}
                        type="text"
                        value={formData.lieu}
                        onChange={e => setFormData({ ...formData, lieu: e.target.value })}
                        placeholder="Paris, Lyon..."
                    />
                </div>
            </div>

            <div style={styles.champGroupe}>
                <label style={styles.label}>Description</label>
                <textarea
                    style={{ ...styles.input, resize: 'vertical', minHeight: 80 }}
                    rows={3}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Contexte et objectifs de l'AG..."
                />
            </div>
        </div>
    );
}

// ============================================================
// ÉTAPE 2 : Actionnaires
// Affiche les actionnaires de l'entreprise + permet d'en ajouter
// ============================================================
function Etape2Actionnaires({ formData, setFormData, actionnaires, setActionnaires, utilisateurs }) {
    const entrepriseId = Number(formData.entrepriseId);

    // Actionnaires de l'entreprise sélectionnée
    const actionnairesEntreprise = actionnaires.filter(a => a.entrepriseId === entrepriseId);

    // IDs des actionnaires marqués présents
    const presentsIds = formData.actionnairesPresentsIds || [];

    // Total d'actions dans l'entreprise
    const totalActions = actionnairesEntreprise.reduce((s, a) => s + (a.nombreActions || 0), 0);

    // ---- Formulaire d'ajout rapide ----
    const [formAjout, setFormAjout] = useState({ userId: '', nombreActions: '' });
    const [ajoutVisible, setAjoutVisible] = useState(false);
    const [enregistrement, setEnregistrement] = useState(false);

    // Cocher / décocher un actionnaire comme présent
    const togglePresent = (id) => {
        const dejaPresent = presentsIds.includes(id);
        setFormData({
            ...formData,
            actionnairesPresentsIds: dejaPresent
                ? presentsIds.filter(x => x !== id)
                : [...presentsIds, id]
        });
    };

    // Ajouter un nouvel actionnaire à l'entreprise
    const ajouterActionnaire = async () => {
        if (!formAjout.userId || !formAjout.nombreActions) {
            alert('Sélectionnez un utilisateur et entrez le nombre d\'actions');
            return;
        }
        setEnregistrement(true);
        try {
            const res = await createActionnaire({
                userId: Number(formAjout.userId),
                entrepriseId,
                nombreActions: Number(formAjout.nombreActions)
            });
            setActionnaires(prev => [...prev, res.data]);
            setFormAjout({ userId: '', nombreActions: '' });
            setAjoutVisible(false);
        } catch (err) {
            alert('Erreur : ' + (err.response?.data?.message || 'Cet utilisateur est peut-être déjà actionnaire'));
        }
        setEnregistrement(false);
    };

    // Supprimer un actionnaire
    const supprimerActionnaire = async (id) => {
        if (!window.confirm('Retirer cet actionnaire ?')) return;
        await deleteActionnaire(id);
        setActionnaires(prev => prev.filter(a => a.id !== id));
        setFormData({
            ...formData,
            actionnairesPresentsIds: presentsIds.filter(x => x !== id)
        });
    };

    // Utilisateurs qui ne sont pas encore actionnaires de cette entreprise
    const utilisateursDispo = utilisateurs.filter(
        u => !actionnairesEntreprise.some(a => a.userId === u.id)
    );

    if (!entrepriseId) return (
        <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
            ⚠️ Veuillez d'abord sélectionner une entreprise à l'étape 1
        </div>
    );

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={styles.titreEtape}>👥 Actionnaires</h3>
                <button
                    style={styles.boutonSecondaire}
                    onClick={() => setAjoutVisible(v => !v)}
                >
                    ➕ Ajouter un actionnaire
                </button>
            </div>

            {/* Formulaire d'ajout rapide */}
            {ajoutVisible && (
                <div style={styles.carteAjout}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#059669', marginBottom: 12 }}>
                        ➕ Lier un utilisateur à l'entreprise
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10, marginBottom: 10 }}>
                        <div>
                            <label style={styles.label}>Utilisateur *</label>
                            <select
                                style={styles.input}
                                value={formAjout.userId}
                                onChange={e => setFormAjout({ ...formAjout, userId: e.target.value })}
                            >
                                <option value="">-- Choisir --</option>
                                {utilisateursDispo.map(u => (
                                    <option key={u.id} value={u.id}>{u.prenom} {u.nom} ({u.username})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={styles.label}>Nb. Actions *</label>
                            <input
                                style={styles.input}
                                type="number"
                                min={1}
                                value={formAjout.nombreActions}
                                onChange={e => setFormAjout({ ...formAjout, nombreActions: e.target.value })}
                                placeholder="500"
                            />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <button style={styles.boutonAnnuler} onClick={() => setAjoutVisible(false)}>Annuler</button>
                        <button style={styles.boutonPrimaire} onClick={ajouterActionnaire} disabled={enregistrement}>
                            💾 Ajouter
                        </button>
                    </div>
                </div>
            )}

            {/* Information sur les présents */}
            <p style={{ fontSize: '0.82rem', color: '#6b7280', marginBottom: 12 }}>
                ☑️ Cochez les actionnaires <strong>présents</strong> à cette AG ({presentsIds.length}/{actionnairesEntreprise.length})
            </p>

            {actionnairesEntreprise.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 32, color: '#9ca3af' }}>
                    👥 Aucun actionnaire pour cette entreprise.<br />
                    Cliquez sur "Ajouter un actionnaire" pour en créer.
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {actionnairesEntreprise.map(a => {
                        const estPresent = presentsIds.includes(a.id);
                        const pct = totalActions > 0 ? ((a.nombreActions / totalActions) * 100).toFixed(1) : 0;
                        return (
                            <div
                                key={a.id}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 12,
                                    padding: '12px 14px',
                                    borderRadius: 10,
                                    border: `1.5px solid ${estPresent ? '#86efac' : '#e5e7eb'}`,
                                    background: estPresent ? '#f0fdf4' : '#fafafa',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s',
                                }}
                                onClick={() => togglePresent(a.id)}
                            >
                                {/* Case à cocher visuelle */}
                                <div style={{
                                    width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                                    border: `2px solid ${estPresent ? '#22c55e' : '#d1d5db'}`,
                                    background: estPresent ? '#22c55e' : '#fff',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#fff', fontSize: '0.75rem', fontWeight: 800,
                                }}>
                                    {estPresent && '✓'}
                                </div>

                                {/* Infos de l'actionnaire */}
                                <div style={{ flex: 1 }}>
                                    <strong>{a.userPrenom} {a.userNom}</strong>
                                    <code style={{ fontSize: '0.75rem', color: '#6b7280', marginLeft: 8 }}>{a.username}</code>
                                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 2 }}>
                                        {a.nombreActions?.toLocaleString()} actions — {pct}% du capital
                                    </div>
                                </div>

                                {/* Badge présent/absent */}
                                <span style={{
                                    padding: '3px 10px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700,
                                    background: estPresent ? '#d1fae5' : '#f3f4f6',
                                    color: estPresent ? '#065f46' : '#6b7280',
                                }}>
                                    {estPresent ? '✅ Présent' : '⬜ Absent'}
                                </span>

                                {/* Bouton supprimer (stoppe la propagation pour ne pas toggler) */}
                                <button
                                    style={{ ...styles.boutonDanger, padding: '4px 8px' }}
                                    onClick={e => { e.stopPropagation(); supprimerActionnaire(a.id); }}
                                >
                                    🗑️
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ============================================================
// ÉTAPE 3 : Résolutions
// Sélectionner les résolutions à inclure dans l'AG + en créer
// ============================================================
function Etape3Resolutions({ formData, setFormData, resolutions, setResolutions }) {
    const entrepriseId = Number(formData.entrepriseId);

    // Résolutions de l'entreprise sélectionnée
    const resolutionsDispo = resolutions.filter(r => r.entrepriseId === entrepriseId);

    // IDs des résolutions sélectionnées pour cette AG
    const selectionnes = formData.resolutionIds || [];

    // ---- Formulaire de création rapide ----
    const [formNouv, setFormNouv] = useState({ titre: '', ordre: 1, description: '' });
    const [ajoutVisible, setAjoutVisible] = useState(false);
    const [enregistrement, setEnregistrement] = useState(false);

    // Cocher / décocher une résolution
    const toggleResolution = (id) => {
        const dejaDedans = selectionnes.includes(id);
        setFormData({
            ...formData,
            resolutionIds: dejaDedans
                ? selectionnes.filter(x => x !== id)
                : [...selectionnes, id]
        });
    };

    // Créer une nouvelle résolution
    const creerResolution = async () => {
        if (!formNouv.titre) { alert('Le titre est obligatoire'); return; }
        setEnregistrement(true);
        try {
            const res = await createResolution({ ...formNouv, entrepriseId });
            const nouvelleRes = res.data;
            setResolutions(prev => [...prev, nouvelleRes]);
            // La sélectionner automatiquement
            setFormData({ ...formData, resolutionIds: [...selectionnes, nouvelleRes.id] });
            setFormNouv({ titre: '', ordre: resolutionsDispo.length + 2, description: '' });
            setAjoutVisible(false);
        } catch (err) {
            alert('Erreur lors de la création');
        }
        setEnregistrement(false);
    };

    if (!entrepriseId) return (
        <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
            ⚠️ Veuillez d'abord sélectionner une entreprise à l'étape 1
        </div>
    );

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={styles.titreEtape}>📋 Résolutions ({selectionnes.length} sélectionnée(s))</h3>
                <button style={styles.boutonSecondaire} onClick={() => setAjoutVisible(v => !v)}>
                    ➕ Nouvelle résolution
                </button>
            </div>

            {/* Formulaire création résolution */}
            {ajoutVisible && (
                <div style={styles.carteAjout}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#059669', marginBottom: 12 }}>
                        📋 Créer une résolution
                    </p>
                    <div style={styles.champGroupe}>
                        <label style={styles.label}>Titre *</label>
                        <input
                            style={styles.input}
                            value={formNouv.titre}
                            onChange={e => setFormNouv({ ...formNouv, titre: e.target.value })}
                            placeholder="Ex: Approbation des comptes 2024"
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                        <div>
                            <label style={styles.label}>Ordre</label>
                            <input
                                style={styles.input}
                                type="number" min={1}
                                value={formNouv.ordre}
                                onChange={e => setFormNouv({ ...formNouv, ordre: Number(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label style={styles.label}>Description</label>
                            <input
                                style={styles.input}
                                value={formNouv.description}
                                onChange={e => setFormNouv({ ...formNouv, description: e.target.value })}
                                placeholder="Optionnel..."
                            />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <button style={styles.boutonAnnuler} onClick={() => setAjoutVisible(false)}>Annuler</button>
                        <button style={styles.boutonPrimaire} onClick={creerResolution} disabled={enregistrement}>
                            💾 Créer
                        </button>
                    </div>
                </div>
            )}

            <p style={{ fontSize: '0.82rem', color: '#6b7280', marginBottom: 12 }}>
                ☑️ Sélectionnez les résolutions à inclure dans cette AG
            </p>

            {resolutionsDispo.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 32, color: '#9ca3af' }}>
                    📋 Aucune résolution disponible.<br />
                    Créez-en une avec le bouton ci-dessus.
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {resolutionsDispo
                        .sort((a, b) => (a.ordre || 0) - (b.ordre || 0))
                        .map(res => {
                            const estSelectionnee = selectionnes.includes(res.id);
                            return (
                                <div
                                    key={res.id}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 12,
                                        padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                                        border: `1.5px solid ${estSelectionnee ? '#86efac' : '#e5e7eb'}`,
                                        background: estSelectionnee ? '#f0fdf4' : '#fff',
                                        transition: 'all 0.15s',
                                    }}
                                    onClick={() => toggleResolution(res.id)}
                                >
                                    {/* Case à cocher */}
                                    <div style={{
                                        width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                                        border: `2px solid ${estSelectionnee ? '#22c55e' : '#d1d5db'}`,
                                        background: estSelectionnee ? '#22c55e' : '#fff',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#fff', fontSize: '0.7rem', fontWeight: 800,
                                    }}>
                                        {estSelectionnee && '✓'}
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1a1a2e' }}>
                                            <span style={{ color: '#059669', marginRight: 6 }}>#{res.ordre}</span>
                                            {res.titre}
                                        </div>
                                        {res.description && (
                                            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 2 }}>
                                                {res.description.slice(0, 80)}{res.description.length > 80 ? '...' : ''}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                </div>
            )}
        </div>
    );
}

// ============================================================
// COMPOSANT PRINCIPAL : Page Assemblées Générales
// ============================================================
export default function AGPage() {
    // ---- Données du backend ----
    const [listeAGs, setListeAGs] = useState([]);
    const [entreprises, setEntreprises] = useState([]);
    const [resolutions, setResolutions] = useState([]);
    const [actionnaires, setActionnaires] = useState([]);
    const [utilisateurs, setUtilisateurs] = useState([]);

    // ---- Formulaire de création / modification ----
    const [formData, setFormData] = useState({
        titre: '',
        entrepriseId: '',
        date: '',
        lieu: '',
        description: '',
        resolutionIds: [],
        actionnairesPresentsIds: [],
    });

    // ---- État de l'interface ----
    const [etapeActuelle, setEtapeActuelle] = useState(0);   // 0, 1 ou 2
    const [estModification, setEstModification] = useState(false);
    const [chargement, setChargement] = useState(true);
    const [messageSucces, setMessageSucces] = useState('');

    // ============================================================
    // Charger toutes les données au démarrage
    // ============================================================
    const chargerDonnees = async () => {
        setChargement(true);
        try {
            const [rAGs, rEnts, rRes, rActs, rUsers] = await Promise.all([
                getAGs(), getEntreprises(), getResolutions(),
                getActionnaires(), getUsers()
            ]);
            setListeAGs(rAGs.data);
            setEntreprises(rEnts.data);
            setResolutions(rRes.data);
            setActionnaires(rActs.data);
            setUtilisateurs(rUsers.data);
        } catch (err) {
            console.error('Erreur:', err);
        }
        setChargement(false);
    };

    useEffect(() => { chargerDonnees(); }, []);

    // ============================================================
    // Réinitialiser le formulaire
    // ============================================================
    const reinitialiser = () => {
        setFormData({
            titre: '', entrepriseId: '', date: '', lieu: '',
            description: '', resolutionIds: [], actionnairesPresentsIds: []
        });
        setEstModification(false);
        setEtapeActuelle(0);
    };

    // ============================================================
    // Charger une AG pour modification
    // ============================================================
    const chargerPourModification = (ag) => {
        setFormData({
            id: ag.id,
            titre: ag.titre || '',
            entrepriseId: String(ag.entrepriseId || ''),
            date: ag.date ? ag.date.slice(0, 10) : '',
            lieu: ag.lieu || '',
            description: ag.description || '',
            resolutionIds: (ag.resolutions || []).map(r => r.id),
            actionnairesPresentsIds: ag.actionnairesPresentsIds || [],
        });
        setEstModification(true);
        setEtapeActuelle(0);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ============================================================
    // Navigation entre étapes
    // ============================================================
    const etapeSuivante = () => {
        if (etapeActuelle === 0 && (!formData.titre || !formData.entrepriseId)) {
            alert('Le titre et l\'entreprise sont obligatoires');
            return;
        }
        setEtapeActuelle(e => Math.min(e + 1, 2));
    };

    const etapePrecedente = () => setEtapeActuelle(e => Math.max(e - 1, 0));

    // ============================================================
    // Créer ou modifier l'AG
    // ============================================================
    const enregistrerAG = async () => {
        try {
            if (estModification) {
                await updateAG(formData.id, formData);
                afficherSucces('AG modifiée avec succès !');
            } else {
                await createAG(formData);
                afficherSucces('AG créée avec succès !');
            }
            reinitialiser();
            chargerDonnees();
        } catch (err) {
            alert('Erreur: ' + (err.response?.data?.message || 'Vérifiez les données'));
        }
    };

    // ============================================================
    // Supprimer une AG
    // ============================================================
    const supprimerAG = async (id) => {
        if (window.confirm('Supprimer cette AG ?')) {
            await deleteAG(id);
            chargerDonnees();
        }
    };

    const afficherSucces = (msg) => {
        setMessageSucces(msg);
        setTimeout(() => setMessageSucces(''), 3500);
    };

    const formaterDate = (d) => {
        if (!d) return '—';
        return new Date(d).toLocaleDateString('fr-FR', {
            day: '2-digit', month: 'long', year: 'numeric'
        });
    };

    // ============================================================
    // RENDU
    // ============================================================
    return (
        <div style={{ padding: 24 }}>

            {/* En-tête */}
            <div style={{ marginBottom: 24 }}>
                <h1 style={styles.titrePage}>🗳️ Assemblées Générales</h1>
                <p style={styles.sousTitre}>Créez et gérez les assemblées générales</p>
            </div>

            {/* Message succès */}
            {messageSucces && (
                <div style={styles.messageSucces}>✅ {messageSucces}</div>
            )}

            {/* ============================================================
           FORMULAIRE AVEC BARRE D'ÉTAPES (toujours visible)
         ============================================================ */}
            <div style={styles.carteFormulaire}>

                {/* Titre du formulaire + bouton annuler modification */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1a1a2e', margin: 0 }}>
                        {estModification ? '✏️ Modifier une AG' : '➕ Créer une AG'}
                    </h2>
                    {estModification && (
                        <button style={styles.boutonAnnulerModif} onClick={reinitialiser}>
                            ✕ Annuler
                        </button>
                    )}
                </div>

                {/* BARRE D'ÉTAPES */}
                <BarreEtapes etapeActuelle={etapeActuelle} />

                {/* CONTENU DE L'ÉTAPE ACTIVE */}
                <div style={{ minHeight: 280 }}>
                    {etapeActuelle === 0 && (
                        <Etape1InfosAG
                            formData={formData}
                            setFormData={setFormData}
                            entreprises={entreprises}
                        />
                    )}
                    {etapeActuelle === 1 && (
                        <Etape2Actionnaires
                            formData={formData}
                            setFormData={setFormData}
                            actionnaires={actionnaires}
                            setActionnaires={setActionnaires}
                            utilisateurs={utilisateurs}
                        />
                    )}
                    {etapeActuelle === 2 && (
                        <Etape3Resolutions
                            formData={formData}
                            setFormData={setFormData}
                            resolutions={resolutions}
                            setResolutions={setResolutions}
                        />
                    )}
                </div>

                {/* BOUTONS DE NAVIGATION (Précédent / Suivant / Enregistrer) */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
                    <button
                        style={etapeActuelle === 0 ? { ...styles.boutonAnnuler, opacity: 0.4, cursor: 'not-allowed' } : styles.boutonAnnuler}
                        onClick={etapePrecedente}
                        disabled={etapeActuelle === 0}
                    >
                        ← Précédent
                    </button>

                    <span style={{ fontSize: '0.78rem', color: '#9ca3af' }}>
                        Étape {etapeActuelle + 1} / 3
                    </span>

                    {etapeActuelle < 2 ? (
                        <button style={styles.boutonPrimaire} onClick={etapeSuivante}>
                            Suivant →
                        </button>
                    ) : (
                        <button style={styles.boutonPrimaire} onClick={enregistrerAG}>
                            {estModification ? '💾 Enregistrer' : '✅ Créer l\'AG'}
                        </button>
                    )}
                </div>
            </div>

            {/* ============================================================
           LISTE DES AGs EXISTANTES (en bas)
         ============================================================ */}
            <div style={{ ...styles.carteFormulaire, marginTop: 24 }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1a1a2e', margin: '0 0 16px' }}>
                    📋 Liste des AG ({listeAGs.length})
                </h2>

                {chargement ? (
                    <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>⏳ Chargement...</div>
                ) : listeAGs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
                        <div style={{ fontSize: 40, marginBottom: 8 }}>🗳️</div>
                        <p>Aucune assemblée générale. Utilisez le formulaire ci-dessus pour en créer une.</p>
                    </div>
                ) : (
                    <table style={styles.tableau}>
                        <thead>
                            <tr style={{ background: '#f9fafb' }}>
                                <th style={styles.enteteCol}>Titre</th>
                                <th style={styles.enteteCol}>Entreprise</th>
                                <th style={styles.enteteCol}>Date</th>
                                <th style={styles.enteteCol}>Lieu</th>
                                <th style={styles.enteteCol}>Résolutions</th>
                                <th style={styles.enteteCol}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {listeAGs.map(ag => (
                                <tr key={ag.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                    <td style={styles.cellule}><strong>{ag.titre}</strong></td>
                                    <td style={styles.cellule}>
                                        <span style={styles.badge}>{ag.entrepriseNom || '—'}</span>
                                    </td>
                                    <td style={{ ...styles.cellule, color: '#6b7280', fontSize: '0.82rem' }}>
                                        📅 {formaterDate(ag.date)}
                                    </td>
                                    <td style={{ ...styles.cellule, color: '#6b7280', fontSize: '0.82rem' }}>
                                        📍 {ag.lieu || '—'}
                                    </td>
                                    <td style={styles.cellule}>
                                        <span style={{ ...styles.badge, background: '#e0e7ff', color: '#3730a3' }}>
                                            {(ag.resolutions || []).length} résolution(s)
                                        </span>
                                    </td>
                                    <td style={styles.cellule}>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button style={styles.boutonModifier} onClick={() => chargerPourModification(ag)}>
                                                ✏️ Modifier
                                            </button>
                                            <button style={styles.boutonSupprimer} onClick={() => supprimerAG(ag.id)}>
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
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
        fontSize: '1.8rem', fontWeight: 800, color: '#1a1a2e', margin: '0 0 4px',
    },
    sousTitre: {
        color: '#6b7280', margin: 0,
    },
    messageSucces: {
        background: '#f0fdf4', border: '1px solid #86efac',
        color: '#166534', borderRadius: 8, padding: '10px 16px',
        marginBottom: 20, fontWeight: 600, fontSize: '0.9rem',
    },
    carteFormulaire: {
        background: '#fff', borderRadius: 12,
        border: '1px solid #e5e7eb', padding: 24,
    },
    titreEtape: {
        fontSize: '1rem', fontWeight: 800, color: '#1a1a2e',
        marginTop: 0, marginBottom: 20,
    },
    carteAjout: {
        background: '#f0fdf4', border: '1px solid #86efac',
        borderRadius: 12, padding: 16, marginBottom: 16,
    },
    champGroupe: { marginBottom: 14 },
    label: {
        display: 'block', fontWeight: 600, fontSize: '0.85rem',
        color: '#374151', marginBottom: 5,
    },
    input: {
        width: '100%', padding: '9px 12px',
        border: '1.5px solid #e2e8f0', borderRadius: 8,
        fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box',
        background: '#f8fafc', color: '#1a1a2e', fontFamily: 'inherit',
    },
    boutonPrimaire: {
        padding: '10px 24px',
        background: 'linear-gradient(135deg, #11998e, #38ef7d)',
        color: '#fff', border: 'none', borderRadius: 8,
        fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
    },
    boutonSecondaire: {
        padding: '8px 16px', background: '#f3f4f6',
        color: '#374151', border: '1px solid #e5e7eb', borderRadius: 8,
        fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
    },
    boutonAnnuler: {
        padding: '10px 20px', background: '#f3f4f6',
        color: '#374151', border: '1px solid #e5e7eb', borderRadius: 8,
        fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
    },
    boutonAnnulerModif: {
        padding: '5px 12px', background: '#fee2e2', color: '#dc2626',
        border: '1px solid #fca5a5', borderRadius: 6,
        fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
    },
    boutonDanger: {
        padding: '5px 10px', background: '#fee2e2', color: '#b91c1c',
        border: '1px solid #fca5a5', borderRadius: 6,
        fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem',
    },
    boutonModifier: {
        padding: '6px 12px', background: '#f3f4f6', color: '#374151',
        border: '1px solid #e5e7eb', borderRadius: 6,
        fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem',
    },
    boutonSupprimer: {
        padding: '6px 10px', background: '#fee2e2', color: '#b91c1c',
        border: '1px solid #fecaca', borderRadius: 6,
        fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem',
    },
    tableau: { width: '100%', borderCollapse: 'collapse' },
    enteteCol: {
        padding: '12px 16px', textAlign: 'left', fontWeight: 600,
        fontSize: '0.8rem', color: '#6b7280', textTransform: 'uppercase',
        letterSpacing: '0.05em', borderBottom: '1px solid #e5e7eb',
    },
    cellule: { padding: '14px 16px', verticalAlign: 'middle' },
    badge: {
        background: '#d1fae5', color: '#065f46', padding: '3px 10px',
        borderRadius: 99, fontSize: '0.8rem', fontWeight: 600,
    },
};
