// ============================================================
// PAGE RÉSOLUTIONS — Version Débutant
//
// Cette page permet de :
//   - Voir la liste des résolutions
//   - Filtrer par entreprise
//   - Ajouter, modifier et supprimer des résolutions
//
// Une résolution = un sujet soumis au vote lors d'une assemblée générale
// ============================================================

import { useState, useEffect } from 'react';
import {
    getResolutions,
    createResolution,
    updateResolution,
    deleteResolution,
    getEntreprises
} from '../../api/api';

// ============================================================
// COMPOSANT : Formulaire pour ajouter / modifier une résolution
// ============================================================
function FormulaireResolution({ formData, setFormData, entreprises, onEnregistrer, onFermer }) {
    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <h2 style={styles.modalTitre}>
                    {formData.id ? '✏️ Modifier la résolution' : '➕ Nouvelle résolution'}
                </h2>

                {/* Titre de la résolution */}
                <div style={styles.champ}>
                    <label style={styles.label}>Titre *</label>
                    <input
                        style={styles.input}
                        type="text"
                        value={formData.titre || ''}
                        onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                        placeholder="Ex: Approbation du budget annuel"
                    />
                </div>

                {/* Entreprise associée */}
                <div style={styles.champ}>
                    <label style={styles.label}>Entreprise *</label>
                    <select
                        style={styles.input}
                        value={formData.entrepriseId || ''}
                        onChange={(e) => setFormData({ ...formData, entrepriseId: Number(e.target.value) })}
                    >
                        <option value="">-- Sélectionner une entreprise --</option>
                        {entreprises.map(e => (
                            <option key={e.id} value={e.id}>{e.nom}</option>
                        ))}
                    </select>
                </div>

                {/* Date de l'AG et ordre (côte à côte) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div style={styles.champ}>
                        <label style={styles.label}>Date de l'AG</label>
                        <input
                            style={styles.input}
                            type="date"
                            value={formData.dateAG || ''}
                            onChange={(e) => setFormData({ ...formData, dateAG: e.target.value })}
                        />
                    </div>
                    <div style={styles.champ}>
                        <label style={styles.label}>Ordre du jour</label>
                        <input
                            style={styles.input}
                            type="number"
                            min={1}
                            value={formData.ordre || ''}
                            onChange={(e) => setFormData({ ...formData, ordre: Number(e.target.value) })}
                            placeholder="Ex: 1, 2, 3..."
                        />
                    </div>
                </div>

                {/* Description */}
                <div style={styles.champ}>
                    <label style={styles.label}>Description</label>
                    <textarea
                        style={{ ...styles.input, resize: 'vertical', minHeight: 80 }}
                        rows={3}
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Description détaillée de la résolution..."
                    />
                </div>

                {/* Boutons */}
                <div style={styles.boutons}>
                    <button style={styles.boutonAnnuler} onClick={onFermer}>
                        Annuler
                    </button>
                    <button style={styles.boutonPrimaire} onClick={onEnregistrer}>
                        💾 Enregistrer
                    </button>
                </div>
            </div>
        </div>
    );
}

// ============================================================
// COMPOSANT PRINCIPAL : La page Résolutions
// ============================================================
export default function ResolutionsPage() {
    // ---- Données du backend ----
    const [resolutions, setResolutions] = useState([]);
    const [entreprises, setEntreprises] = useState([]);

    // ---- État de l'interface ----
    const [formulaireOuvert, setFormulaireOuvert] = useState(false);
    const [formData, setFormData] = useState({});
    const [chargement, setChargement] = useState(true);
    const [filtreEntreprise, setFiltreEntreprise] = useState(''); // '' = toutes les entreprises

    // ============================================================
    // Charger les données au démarrage
    // ============================================================
    const chargerDonnees = async () => {
        setChargement(true);
        try {
            // Requêtes en parallèle pour aller plus vite
            const [resRes, resEnt] = await Promise.all([
                getResolutions(),
                getEntreprises()
            ]);
            setResolutions(resRes.data);
            setEntreprises(resEnt.data);
        } catch (err) {
            console.error('Erreur:', err);
        }
        setChargement(false);
    };

    useEffect(() => {
        chargerDonnees();
    }, []);

    // ============================================================
    // Filtrage par entreprise
    // ============================================================
    const resolutionsFiltrees = filtreEntreprise
        ? resolutions.filter(r => String(r.entrepriseId) === filtreEntreprise)
        : resolutions;

    // ============================================================
    // Enregistrement (création ou modification)
    // ============================================================
    const enregistrer = async () => {
        try {
            if (formData.id) {
                await updateResolution(formData.id, formData);
            } else {
                await createResolution(formData);
            }
            setFormulaireOuvert(false);
            chargerDonnees();
        } catch (err) {
            alert('Erreur: ' + (err.response?.data?.message || 'Vérifiez les données'));
        }
    };

    // ============================================================
    // Suppression
    // ============================================================
    const supprimer = async (id) => {
        if (window.confirm('Supprimer cette résolution ?')) {
            try {
                await deleteResolution(id);
                chargerDonnees();
            } catch {
                alert('Erreur lors de la suppression');
            }
        }
    };

    // Formater une date en français
    const formaterDate = (dateString) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('fr-FR');
    };

    // ============================================================
    // RENDU
    // ============================================================
    return (
        <div style={{ padding: 24 }}>

            {/* En-tête */}
            <div style={{ marginBottom: 24 }}>
                <h1 style={styles.titrePage}>📋 Résolutions</h1>
                <p style={styles.sousTitrePage}>Gérez les résolutions soumises aux votes des actionnaires</p>
            </div>

            {/* Tableau */}
            <div style={styles.conteneur}>

                {/* Barre d'outils */}
                <div style={styles.barreDOutils}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={styles.compteur}>
                            {resolutionsFiltrees.length} résolution(s)
                        </span>

                        {/* Filtre par entreprise */}
                        <select
                            style={{ ...styles.input, width: 220 }}
                            value={filtreEntreprise}
                            onChange={(e) => setFiltreEntreprise(e.target.value)}
                        >
                            <option value="">📋 Toutes les entreprises</option>
                            {entreprises.map(e => (
                                <option key={e.id} value={e.id}>{e.nom}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        style={styles.boutonPrimaire}
                        onClick={() => {
                            setFormData({}); // vider le formulaire
                            setFormulaireOuvert(true);
                        }}
                    >
                        ➕ Nouvelle résolution
                    </button>
                </div>

                {/* Table ou loading */}
                {chargement ? (
                    <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
                        ⏳ Chargement...
                    </div>
                ) : (
                    <table style={styles.tableau}>
                        <thead>
                            <tr style={{ background: '#f9fafb' }}>
                                <th style={styles.enteteColonne}>#</th>
                                <th style={styles.enteteColonne}>Titre</th>
                                <th style={styles.enteteColonne}>Entreprise</th>
                                <th style={styles.enteteColonne}>Date AG</th>
                                <th style={styles.enteteColonne}>Description</th>
                                <th style={styles.enteteColonne}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {resolutionsFiltrees.map(resolution => (
                                <tr key={resolution.id} style={styles.ligne}>

                                    {/* Numéro d'ordre */}
                                    <td style={styles.cellule}>
                                        <span style={styles.badge}>#{resolution.ordre || '—'}</span>
                                    </td>

                                    {/* Titre */}
                                    <td style={styles.cellule}>
                                        <strong>{resolution.titre}</strong>
                                    </td>

                                    {/* Entreprise */}
                                    <td style={styles.cellule}>
                                        <span style={{ ...styles.badge, background: '#f0fdf4', color: '#166534' }}>
                                            {resolution.entrepriseNom}
                                        </span>
                                    </td>

                                    {/* Date */}
                                    <td style={{ ...styles.cellule, color: '#6b7280', fontSize: '0.85rem' }}>
                                        📅 {formaterDate(resolution.dateAG)}
                                    </td>

                                    {/* Description (tronquée) */}
                                    <td style={{ ...styles.cellule, maxWidth: 200, color: '#6b7280', fontSize: '0.85rem' }}>
                                        {resolution.description
                                            ? resolution.description.slice(0, 80) + (resolution.description.length > 80 ? '...' : '')
                                            : '—'
                                        }
                                    </td>

                                    {/* Boutons */}
                                    <td style={styles.cellule}>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button
                                                style={styles.boutonSecondairePetit}
                                                onClick={() => {
                                                    setFormData({ ...resolution });
                                                    setFormulaireOuvert(true);
                                                }}
                                            >
                                                ✏️ Modifier
                                            </button>
                                            <button
                                                style={styles.boutonDanger}
                                                onClick={() => supprimer(resolution.id)}
                                            >
                                                🗑️ Suppr.
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {/* Aucune résolution */}
                            {resolutionsFiltrees.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
                                        📋 Aucune résolution trouvée
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Formulaire modal */}
            {formulaireOuvert && (
                <FormulaireResolution
                    formData={formData}
                    setFormData={setFormData}
                    entreprises={entreprises}
                    onEnregistrer={enregistrer}
                    onFermer={() => setFormulaireOuvert(false)}
                />
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
    conteneur: {
        background: '#fff',
        borderRadius: 12,
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
    },
    barreDOutils: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
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
    badge: {
        background: '#e0e7ff',
        color: '#3730a3',
        padding: '3px 10px',
        borderRadius: 99,
        fontSize: '0.8rem',
        fontWeight: 600,
    },
    // Modaux
    overlay: {
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    modal: {
        background: '#fff',
        borderRadius: 16,
        padding: 32,
        width: '100%',
        maxWidth: 520,
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        maxHeight: '90vh',
        overflowY: 'auto',
    },
    modalTitre: {
        fontSize: '1.3rem',
        fontWeight: 800,
        color: '#1a1a2e',
        margin: '0 0 24px',
    },
    champ: {
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
        padding: '10px 14px',
        border: '1.5px solid #e2e8f0',
        borderRadius: 8,
        fontSize: '0.9rem',
        outline: 'none',
        boxSizing: 'border-box',
        background: '#f8fafc',
        color: '#1a1a2e',
        fontFamily: 'inherit',
    },
    boutons: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 10,
        marginTop: 24,
    },
    boutonPrimaire: {
        padding: '10px 20px',
        background: 'linear-gradient(135deg, #11998e, #38ef7d)',
        color: '#fff',
        border: 'none',
        borderRadius: 8,
        fontWeight: 700,
        cursor: 'pointer',
        fontSize: '0.9rem',
    },
    boutonAnnuler: {
        padding: '10px 20px',
        background: '#f3f4f6',
        color: '#374151',
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        fontWeight: 600,
        cursor: 'pointer',
        fontSize: '0.9rem',
    },
    boutonSecondairePetit: {
        padding: '6px 12px',
        background: '#f3f4f6',
        color: '#374151',
        border: '1px solid #e5e7eb',
        borderRadius: 6,
        fontWeight: 600,
        cursor: 'pointer',
        fontSize: '0.8rem',
    },
    boutonDanger: {
        padding: '6px 12px',
        background: '#fee2e2',
        color: '#b91c1c',
        border: '1px solid #fecaca',
        borderRadius: 6,
        fontWeight: 600,
        cursor: 'pointer',
        fontSize: '0.8rem',
    },
};
