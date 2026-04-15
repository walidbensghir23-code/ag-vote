// ============================================================
// PAGE ACTIONNAIRES — Version Débutant
// 
// Cette page permet de :
//   - Voir la liste de tous les actionnaires
//   - Ajouter un actionnaire (lier un utilisateur à une entreprise)
//   - Modifier le nombre d'actions
//   - Supprimer un actionnaire
//   - Créer un nouvel utilisateur directement
// ============================================================

import { useState, useEffect } from 'react';
import {
    getActionnaires,
    createActionnaire,
    updateActionnaire,
    deleteActionnaire,
    getEntreprises,
    getUsers,
    createUser
} from '../../api/api';

// ============================================================
// COMPOSANT : Formulaire pour créer un nouvel utilisateur
// Props reçues :
//   - onFermer : fonction pour fermer le formulaire
//   - onUtilisateurCree : fonction appelée après création réussie
// ============================================================
function FormulaireNouvelUtilisateur({ onFermer, onUtilisateurCree }) {
    // Les données du formulaire (on utilise un objet pour regrouper tous les champs)
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        nom: '',
        prenom: '',
        email: ''
    });

    // Fonction pour mettre à jour un champ du formulaire
    // "champ" est le nom du champ (ex: 'username'), "valeur" est la nouvelle valeur
    const modifierChamp = (champ, valeur) => {
        setFormData({ ...formData, [champ]: valeur });
    };

    // Quand l'utilisateur clique sur "Créer"
    const handleCreer = async () => {
        try {
            await createUser(formData); // envoi au backend
            onUtilisateurCree(); // on ferme et on recharge la liste
        } catch (err) {
            alert('Erreur lors de la création: ' + (err.response?.data?.message || 'Erreur inconnue'));
        }
    };

    return (
        // Fond sombre qui couvre toute la page
        <div style={styles.overlay}>
            {/* La boîte blanche au centre */}
            <div style={styles.modal}>
                <h2 style={styles.modalTitre}>👤 Créer un Utilisateur</h2>

                {/* Champ : Prénom */}
                <div style={styles.champ}>
                    <label style={styles.label}>Prénom</label>
                    <input
                        style={styles.input}
                        type="text"
                        value={formData.prenom}
                        onChange={(e) => modifierChamp('prenom', e.target.value)}
                        placeholder="Ex: Jean"
                    />
                </div>

                {/* Champ : Nom */}
                <div style={styles.champ}>
                    <label style={styles.label}>Nom</label>
                    <input
                        style={styles.input}
                        type="text"
                        value={formData.nom}
                        onChange={(e) => modifierChamp('nom', e.target.value)}
                        placeholder="Ex: Dupont"
                    />
                </div>

                {/* Champ : Email */}
                <div style={styles.champ}>
                    <label style={styles.label}>Email</label>
                    <input
                        style={styles.input}
                        type="email"
                        value={formData.email}
                        onChange={(e) => modifierChamp('email', e.target.value)}
                        placeholder="Ex: jean@email.com"
                    />
                </div>

                {/* Champ : Nom d'utilisateur */}
                <div style={styles.champ}>
                    <label style={styles.label}>Nom d'utilisateur (username)</label>
                    <input
                        style={styles.input}
                        type="text"
                        value={formData.username}
                        onChange={(e) => modifierChamp('username', e.target.value)}
                        placeholder="Ex: jean123"
                    />
                </div>

                {/* Champ : Mot de passe */}
                <div style={styles.champ}>
                    <label style={styles.label}>Mot de passe</label>
                    <input
                        style={styles.input}
                        type="password"
                        value={formData.password}
                        onChange={(e) => modifierChamp('password', e.target.value)}
                        placeholder="Mot de passe"
                    />
                </div>

                {/* Boutons en bas */}
                <div style={styles.boutons}>
                    <button style={styles.boutonAnnuler} onClick={onFermer}>
                        Annuler
                    </button>
                    <button style={styles.boutonPrimaire} onClick={handleCreer}>
                        💾 Créer
                    </button>
                </div>
            </div>
        </div>
    );
}

// ============================================================
// COMPOSANT : Formulaire pour ajouter ou modifier un actionnaire
// Props reçues :
//   - formData : l'objet avec les données du formulaire
//   - setFormData : pour modifier les données
//   - entreprises : la liste des entreprises disponibles (pour le menu déroulant)
//   - utilisateurs : la liste des utilisateurs disponibles
//   - onEnregistrer : fonction appelée pour sauvegarder
//   - onFermer : fonction pour annuler/fermer
// ============================================================
function FormulaireActionnaire({ formData, setFormData, entreprises, utilisateurs, onEnregistrer, onFermer }) {
    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                {/* Le titre change selon si c'est un ajout ou une modification */}
                <h2 style={styles.modalTitre}>
                    {formData.id ? '✏️ Modifier un Actionnaire' : '➕ Ajouter un Actionnaire'}
                </h2>

                {/* Sélection de l'utilisateur */}
                <div style={styles.champ}>
                    <label style={styles.label}>Utilisateur *</label>
                    <select
                        style={styles.input}
                        value={formData.userId || ''}
                        onChange={(e) => setFormData({ ...formData, userId: Number(e.target.value) })}
                    >
                        <option value="">-- Sélectionner un utilisateur --</option>
                        {utilisateurs.map(u => (
                            <option key={u.id} value={u.id}>
                                {u.prenom} {u.nom} ({u.username})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Sélection de l'entreprise */}
                <div style={styles.champ}>
                    <label style={styles.label}>Entreprise *</label>
                    <select
                        style={styles.input}
                        value={formData.entrepriseId || ''}
                        onChange={(e) => setFormData({ ...formData, entrepriseId: Number(e.target.value) })}
                    >
                        <option value="">-- Sélectionner une entreprise --</option>
                        {entreprises.map(e => (
                            <option key={e.id} value={e.id}>
                                {e.nom}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Nombre d'actions */}
                <div style={styles.champ}>
                    <label style={styles.label}>Nombre d'actions *</label>
                    <input
                        style={styles.input}
                        type="number"
                        min={1}
                        value={formData.nombreActions || ''}
                        onChange={(e) => setFormData({ ...formData, nombreActions: Number(e.target.value) })}
                        placeholder="Ex: 500"
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
// COMPOSANT PRINCIPAL : La page Actionnaires
// ============================================================
export default function ActionnairesPage() {
    // ---- Données chargées depuis le backend ----
    const [actionnaires, setActionnaires] = useState([]);   // liste des actionnaires
    const [entreprises, setEntreprises] = useState([]);     // liste des entreprises
    const [utilisateurs, setUtilisateurs] = useState([]);   // liste des utilisateurs

    // ---- État de l'interface ----
    const [formulaireOuvert, setFormulaireOuvert] = useState(null); // null | 'actionnaire' | 'utilisateur'
    const [formData, setFormData] = useState({});           // données du formulaire actionnaire
    const [chargement, setChargement] = useState(true);     // afficher le spinner
    const [filtreEntreprise, setFiltreEntreprise] = useState(''); // filtre par entreprise

    // ============================================================
    // Chargement des données depuis le backend au démarrage
    // useEffect s'exécute une fois quand le composant se charge
    // ============================================================
    const chargerDonnees = async () => {
        setChargement(true);
        try {
            // On lance les 3 requêtes en même temps (parallèle) pour aller plus vite
            const [resActionnaires, resEntreprises, resUtilisateurs] = await Promise.all([
                getActionnaires(),
                getEntreprises(),
                getUsers()
            ]);

            setActionnaires(resActionnaires.data);
            setEntreprises(resEntreprises.data);
            setUtilisateurs(resUtilisateurs.data);
        } catch (err) {
            console.error('Erreur de chargement:', err);
        }
        setChargement(false);
    };

    // useEffect avec [] vide = exécuter une seule fois au chargement de la page
    useEffect(() => {
        chargerDonnees();
    }, []);

    // ============================================================
    // Filtrage des actionnaires par entreprise
    // ============================================================
    const actionnairesFiltres = filtreEntreprise
        ? actionnaires.filter(a => String(a.entrepriseId) === filtreEntreprise)
        : actionnaires; // si pas de filtre, on affiche tous

    // ============================================================
    // Sauvegarde d'un actionnaire (création ou modification)
    // ============================================================
    const enregistrerActionnaire = async () => {
        try {
            if (formData.id) {
                // Si formData.id existe → c'est une MODIFICATION
                await updateActionnaire(formData.id, formData);
            } else {
                // Sinon → c'est une CRÉATION
                await createActionnaire(formData);
            }
            setFormulaireOuvert(null); // fermer le formulaire
            chargerDonnees();           // recharger la liste
        } catch (err) {
            alert('Erreur: ' + (err.response?.data?.message || 'Vérifiez les données'));
        }
    };

    // ============================================================
    // Suppression d'un actionnaire
    // ============================================================
    const supprimerActionnaire = async (id) => {
        // Demander confirmation avant de supprimer
        if (window.confirm('Voulez-vous vraiment supprimer cet actionnaire ?')) {
            try {
                await deleteActionnaire(id);
                chargerDonnees(); // recharger après suppression
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

            {/* En-tête de la page */}
            <div style={styles.enTete}>
                <div>
                    <h1 style={styles.titrePage}>👥 Actionnaires</h1>
                    <p style={styles.sousTitre}>Gérez les actionnaires et leurs parts dans les entreprises</p>
                </div>
            </div>

            {/* Tableau principal */}
            <div style={styles.conteneur}>

                {/* Barre d'outils : filtre + boutons */}
                <div style={styles.barreDOutils}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {/* Compteur */}
                        <span style={styles.compteur}>
                            {actionnairesFiltres.length} actionnaire(s)
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

                    {/* Boutons d'action */}
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button
                            style={styles.boutonSecondaire}
                            onClick={() => setFormulaireOuvert('utilisateur')}
                        >
                            👤 Créer utilisateur
                        </button>
                        <button
                            style={styles.boutonPrimaire}
                            onClick={() => {
                                setFormData({}); // vider le formulaire pour une nouvelle création
                                setFormulaireOuvert('actionnaire');
                            }}
                        >
                            ➕ Ajouter actionnaire
                        </button>
                    </div>
                </div>

                {/* Affichage conditionnel : spinner ou tableau */}
                {chargement ? (
                    /* Spinner de chargement */
                    <div style={{ textAlign: 'center', padding: 40 }}>
                        <div style={styles.spinner}></div>
                        <p style={{ color: '#9ca3af' }}>Chargement...</p>
                    </div>
                ) : (
                    /* Tableau des actionnaires */
                    <table style={styles.tableau}>
                        <thead>
                            <tr style={styles.ligneEntete}>
                                <th style={styles.enteteColonne}>Actionnaire</th>
                                <th style={styles.enteteColonne}>Username</th>
                                <th style={styles.enteteColonne}>Entreprise</th>
                                <th style={styles.enteteColonne}>Nb. Actions</th>
                                <th style={styles.enteteColonne}>Part (%)</th>
                                <th style={styles.enteteColonne}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {actionnairesFiltres.map(actionnaire => {
                                // Calculer le total des actions dans la même entreprise
                                const totalActions = actionnaires
                                    .filter(a => a.entrepriseId === actionnaire.entrepriseId)
                                    .reduce((somme, a) => somme + a.nombreActions, 0);

                                // Calculer le pourcentage de cet actionnaire
                                const pourcentage = totalActions > 0
                                    ? ((actionnaire.nombreActions / totalActions) * 100).toFixed(1)
                                    : 0;

                                return (
                                    <tr key={actionnaire.id} style={styles.ligne}>
                                        {/* Nom complet */}
                                        <td style={styles.cellule}>
                                            <strong>{actionnaire.userPrenom} {actionnaire.userNom}</strong>
                                        </td>

                                        {/* Username */}
                                        <td style={styles.cellule}>
                                            <code style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                                                {actionnaire.username}
                                            </code>
                                        </td>

                                        {/* Entreprise */}
                                        <td style={styles.cellule}>
                                            <span style={styles.badge}>{actionnaire.entrepriseNom}</span>
                                        </td>

                                        {/* Nombre d'actions */}
                                        <td style={styles.cellule}>
                                            <strong>{actionnaire.nombreActions?.toLocaleString()}</strong>
                                        </td>

                                        {/* Pourcentage + barre de progression */}
                                        <td style={styles.cellule}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                {/* Barre de progression */}
                                                <div style={styles.barreContainer}>
                                                    <div style={{
                                                        ...styles.barreRemplie,
                                                        width: `${pourcentage}%`
                                                    }} />
                                                </div>
                                                <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                                                    {pourcentage}%
                                                </span>
                                            </div>
                                        </td>

                                        {/* Boutons Modifier / Supprimer */}
                                        <td style={styles.cellule}>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <button
                                                    style={styles.boutonSecondairePetit}
                                                    onClick={() => {
                                                        setFormData({ ...actionnaire }); // copier les données dans le formulaire
                                                        setFormulaireOuvert('actionnaire');
                                                    }}
                                                >
                                                    ✏️ Modifier
                                                </button>
                                                <button
                                                    style={styles.boutonDanger}
                                                    onClick={() => supprimerActionnaire(actionnaire.id)}
                                                >
                                                    🗑️ Suppr.
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}

                            {/* Message si aucun résultat */}
                            {actionnairesFiltres.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
                                        👥 Aucun actionnaire trouvé
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Formulaire Actionnaire (affiché seulement si ouvert) */}
            {formulaireOuvert === 'actionnaire' && (
                <FormulaireActionnaire
                    formData={formData}
                    setFormData={setFormData}
                    entreprises={entreprises}
                    utilisateurs={utilisateurs}
                    onEnregistrer={enregistrerActionnaire}
                    onFermer={() => setFormulaireOuvert(null)}
                />
            )}

            {/* Formulaire Nouvel Utilisateur (affiché seulement si ouvert) */}
            {formulaireOuvert === 'utilisateur' && (
                <FormulaireNouvelUtilisateur
                    onFermer={() => setFormulaireOuvert(null)}
                    onUtilisateurCree={() => {
                        setFormulaireOuvert(null);
                        chargerDonnees(); // recharger les utilisateurs
                    }}
                />
            )}
        </div>
    );
}

// ============================================================
// STYLES — objets JavaScript simples pour le CSS
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
    sousTitre: {
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
    ligneEntete: {
        background: '#f9fafb',
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
    barreContainer: {
        width: 60,
        height: 6,
        background: '#e5e7eb',
        borderRadius: 3,
        overflow: 'hidden',
    },
    barreRemplie: {
        height: '100%',
        background: 'linear-gradient(135deg, #11998e, #38ef7d)',
        borderRadius: 3,
    },
    // ---- Styles des formulaires modaux ----
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
        maxWidth: 480,
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
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
    boutonSecondaire: {
        padding: '10px 20px',
        background: '#f3f4f6',
        color: '#374151',
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        fontWeight: 600,
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
    spinner: {
        width: 32,
        height: 32,
        border: '3px solid #e5e7eb',
        borderTopColor: '#11998e',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        margin: '0 auto 12px',
    },
};
