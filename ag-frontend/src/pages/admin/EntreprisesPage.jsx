// ============================================================
// PAGE ENTREPRISES — Version Débutant
//
// Cette page permet de :
//   - Voir la liste des entreprises
//   - Ajouter une nouvelle entreprise
//   - Modifier une entreprise existante
//   - Supprimer une entreprise
// ============================================================

import { useState, useEffect } from 'react';
import { getEntreprises, createEntreprise, updateEntreprise, deleteEntreprise } from '../../api/api';

// ============================================================
// COMPOSANT : Formulaire pour ajouter / modifier une entreprise
// Props reçues :
//   - formData : l'objet avec les données du formulaire
//   - setFormData : pour modifier les données
//   - estModification : true si on modifie, false si on crée
//   - onEnregistrer : fonction appelée pour sauvegarder
//   - onFermer : fonction pour annuler/fermer
// ============================================================
function FormulaireEntreprise({ formData, setFormData, estModification, onEnregistrer, onFermer }) {
    return (
        // Fond sombre qui couvre toute la page
        <div style={styles.overlay}>
            {/* La boîte blanche au centre */}
            <div style={styles.modal}>
                <h2 style={styles.modalTitre}>
                    {estModification ? '✏️ Modifier l\'entreprise' : '➕ Nouvelle entreprise'}
                </h2>

                {/* Champ : Nom de l'entreprise */}
                <div style={styles.champ}>
                    <label style={styles.label}>Nom de l'entreprise *</label>
                    <input
                        style={styles.input}
                        type="text"
                        value={formData.nom || ''}
                        onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                        placeholder="Ex: TechCorp SA"
                    />
                </div>

                {/* Champ : Secteur d'activité */}
                <div style={styles.champ}>
                    <label style={styles.label}>Secteur d'activité</label>
                    <input
                        style={styles.input}
                        type="text"
                        value={formData.secteur || ''}
                        onChange={(e) => setFormData({ ...formData, secteur: e.target.value })}
                        placeholder="Ex: Technologies, Finance, Santé..."
                    />
                </div>

                {/* Champ : Description */}
                <div style={styles.champ}>
                    <label style={styles.label}>Description</label>
                    <textarea
                        style={{ ...styles.input, resize: 'vertical', minHeight: 80 }}
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Description de l'entreprise..."
                        rows={3}
                    />
                </div>

                {/* Champ : URL du logo */}
                <div style={styles.champ}>
                    <label style={styles.label}>URL du Logo (optionnel)</label>
                    <input
                        style={styles.input}
                        type="url"
                        value={formData.logoUrl || ''}
                        onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                        placeholder="https://exemple.com/logo.png"
                    />
                    {/* Aperçu du logo si une URL est saisie */}
                    {formData.logoUrl && (
                        <img
                            src={formData.logoUrl}
                            alt="Aperçu"
                            style={{ width: 60, height: 60, borderRadius: 8, marginTop: 8, objectFit: 'cover' }}
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                    )}
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
// COMPOSANT PRINCIPAL : La page Entreprises
// ============================================================
export default function EntreprisesPage() {
    // ---- Données chargées depuis le backend ----
    const [entreprises, setEntreprises] = useState([]); // liste des entreprises

    // ---- État de l'interface ----
    const [formulaireOuvert, setFormulaireOuvert] = useState(false); // true/false pour ouvrir/fermer le formulaire
    const [formData, setFormData] = useState({});       // données du formulaire
    const [estModification, setEstModification] = useState(false); // true si on modifie
    const [chargement, setChargement] = useState(true); // afficher le spinner pendant le chargement

    // ============================================================
    // Charger les entreprises depuis le backend
    // ============================================================
    const chargerEntreprises = async () => {
        setChargement(true);
        try {
            const reponse = await getEntreprises();
            setEntreprises(reponse.data); // reponse.data contient le tableau d'entreprises
        } catch (err) {
            console.error('Erreur de chargement:', err);
        }
        setChargement(false);
    };

    // Charger au démarrage de la page
    useEffect(() => {
        chargerEntreprises();
    }, []);

    // ============================================================
    // Ouvrir le formulaire pour CRÉER une entreprise
    // ============================================================
    const ouvrirCreation = () => {
        setFormData({});            // vider le formulaire
        setEstModification(false);  // c'est une création, pas une modification
        setFormulaireOuvert(true);
    };

    // ============================================================
    // Ouvrir le formulaire pour MODIFIER une entreprise
    // ============================================================
    const ouvrirModification = (entreprise) => {
        setFormData({ ...entreprise }); // copier les données de l'entreprise dans le formulaire
        setEstModification(true);       // c'est une modification
        setFormulaireOuvert(true);
    };

    // ============================================================
    // Sauvegarder (création ou modification)
    // ============================================================
    const enregistrer = async () => {
        try {
            if (estModification) {
                // Modification : on envoie les nouvelles données avec l'ID de l'entreprise
                await updateEntreprise(formData.id, formData);
            } else {
                // Création : on envoie les données sans ID
                await createEntreprise(formData);
            }
            setFormulaireOuvert(false); // fermer le formulaire
            chargerEntreprises();       // recharger la liste
        } catch (err) {
            alert('Erreur lors de l\'enregistrement: ' + (err.response?.data?.message || 'Erreur inconnue'));
        }
    };

    // ============================================================
    // Supprimer une entreprise
    // ============================================================
    const supprimer = async (id) => {
        if (window.confirm('Voulez-vous vraiment supprimer cette entreprise ?')) {
            try {
                await deleteEntreprise(id);
                chargerEntreprises(); // recharger après suppression
            } catch (err) {
                alert('Erreur lors de la suppression');
            }
        }
    };

    // ============================================================
    // RENDU (ce qui s'affiche à l'écran)
    // ============================================================
    return (
        <div style={{ padding: 24 }}>

            {/* En-tête */}
            <div style={styles.enTete}>
                <div>
                    <h1 style={styles.titrePage}>🏢 Entreprises</h1>
                    <p style={styles.sousTitrePage}>Gérez le portefeuille d'entreprises</p>
                </div>
            </div>

            {/* Tableau */}
            <div style={styles.conteneur}>

                {/* Barre d'outils */}
                <div style={styles.barreDOutils}>
                    <span style={styles.compteur}>
                        {entreprises.length} entreprise(s)
                    </span>
                    <button style={styles.boutonPrimaire} onClick={ouvrirCreation}>
                        ➕ Nouvelle entreprise
                    </button>
                </div>

                {/* Contenu : spinner ou tableau */}
                {chargement ? (
                    <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
                        ⏳ Chargement...
                    </div>
                ) : (
                    <table style={styles.tableau}>
                        <thead>
                            <tr style={{ background: '#f9fafb' }}>
                                <th style={styles.enteteColonne}>Logo</th>
                                <th style={styles.enteteColonne}>Nom</th>
                                <th style={styles.enteteColonne}>Secteur</th>
                                <th style={styles.enteteColonne}>Description</th>
                                <th style={styles.enteteColonne}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entreprises.map(entreprise => (
                                <tr key={entreprise.id} style={styles.ligne}>

                                    {/* Logo */}
                                    <td style={styles.cellule}>
                                        {entreprise.logoUrl ? (
                                            <img
                                                src={entreprise.logoUrl}
                                                alt={entreprise.nom}
                                                style={{ width: 38, height: 38, borderRadius: 8, objectFit: 'cover' }}
                                                onError={(e) => {
                                                    // Si l'image ne charge pas, afficher les initiales
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        <div style={{
                                            width: 38, height: 38, borderRadius: 8,
                                            background: 'linear-gradient(135deg, #0f4c75, #2196f3)',
                                            display: entreprise.logoUrl ? 'none' : 'flex',
                                            alignItems: 'center', justifyContent: 'center',
                                            color: '#fff', fontWeight: 800, fontSize: '0.9rem'
                                        }}>
                                            {(entreprise.nom || '?').slice(0, 2).toUpperCase()}
                                        </div>
                                    </td>

                                    {/* Nom */}
                                    <td style={styles.cellule}>
                                        <strong>{entreprise.nom}</strong>
                                    </td>

                                    {/* Secteur */}
                                    <td style={styles.cellule}>
                                        {entreprise.secteur ? (
                                            <span style={styles.badge}>{entreprise.secteur}</span>
                                        ) : (
                                            <span style={{ color: '#9ca3af' }}>—</span>
                                        )}
                                    </td>

                                    {/* Description (tronquée si trop longue) */}
                                    <td style={{ ...styles.cellule, maxWidth: 200, color: '#6b7280', fontSize: '0.85rem' }}>
                                        {entreprise.description
                                            ? entreprise.description.slice(0, 80) + (entreprise.description.length > 80 ? '...' : '')
                                            : '—'
                                        }
                                    </td>

                                    {/* Boutons Modifier / Supprimer */}
                                    <td style={styles.cellule}>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button
                                                style={styles.boutonSecondairePetit}
                                                onClick={() => ouvrirModification(entreprise)}
                                            >
                                                ✏️ Modifier
                                            </button>
                                            <button
                                                style={styles.boutonDanger}
                                                onClick={() => supprimer(entreprise.id)}
                                            >
                                                🗑️ Suppr.
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {/* Message si aucune entreprise */}
                            {entreprises.length === 0 && (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
                                        🏢 Aucune entreprise enregistrée
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Formulaire modal (affiché seulement si ouvert) */}
            {formulaireOuvert && (
                <FormulaireEntreprise
                    formData={formData}
                    setFormData={setFormData}
                    estModification={estModification}
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
    enTete: {
        marginBottom: 24,
    },
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
    // ---- Styles modaux ----
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
        maxWidth: 500,
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
