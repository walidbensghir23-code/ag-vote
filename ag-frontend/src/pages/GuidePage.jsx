import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const adminSteps = [
    {
        icon: '🏢',
        title: '1. Créer vos Entreprises',
        description: 'Commencez par ajouter les entreprises dans le menu "Entreprises". Renseignez le nom, le SIRET, le secteur d\'activité et une description. C\'est la base de toute l\'organisation.',
        tip: '💡 Exemple : "TechInnovation SA", secteur "Technologies"',
    },
    {
        icon: '👥',
        title: '2. Ajouter des Actionnaires',
        description: 'Allez dans "Actionnaires" pour associer des utilisateurs à une entreprise. Vous pouvez créer un nouvel utilisateur directement depuis cette page. Définissez le nombre d\'actions — ce chiffre détermine le poids du vote de cet actionnaire.',
        tip: '⚖️ Un actionnaire avec 500 actions pèse 2x plus qu\'un actionnaire avec 250 actions.',
    },
    {
        icon: '📋',
        title: '3. Créer des Résolutions',
        description: 'Les résolutions sont les sujets soumis au vote. Allez dans "Résolutions" et créez-en pour chaque entreprise. Définissez un titre clair, une description et un numéro d\'ordre.',
        tip: '💡 Exemple : "Approbation des comptes 2024", ordre 1 — "Distribution de dividendes", ordre 2',
    },
    {
        icon: '🗳️',
        title: '4. Organiser une Assemblée Générale',
        description: 'Allez dans "Assemblées Générales" puis cliquez sur "Créer une AG". Sélectionnez l\'entreprise, la date, le lieu et cochez les résolutions à inclure. Une fois créée, les actionnaires de l\'entreprise pourront voter.',
        tip: '📅 Planifiez l\'AG au moins quelques jours avant la date de vote.',
    },
    {
        icon: '📊',
        title: '5. Consulter les résultats',
        description: 'Les actionnaires votent depuis leur espace personnel. Vous pouvez consulter les votes en accédant aux résolutions. Chaque vote est pondéré par le nombre d\'actions du votant.',
        tip: '✅ Un vote POUR de 1000 actions l\'emporte sur 3 votes POUR de 200 actions chacun.',
    },
];

const userSteps = [
    {
        icon: '🔐',
        title: '1. Se connecter à votre espace',
        description: 'Connectez-vous avec les identifiants fournis par l\'administrateur. Si vous n\'avez pas de compte, utilisez le lien "Créer un compte" sur la page de connexion.',
        tip: '💡 Vos identifiants sont communiqués par l\'administrateur de la plateforme.',
    },
    {
        icon: '🏠',
        title: '2. Consulter votre Tableau de bord',
        description: 'Le tableau de bord affiche toutes les Assemblées Générales auxquelles vous participez, séparées en "À venir" et "Passées". Cliquez sur une AG pour voir ses résolutions.',
        tip: '📅 Les AG à venir sont celles où votre vote est encore attendu.',
    },
    {
        icon: '🗳️',
        title: '3. Voter sur les résolutions',
        description: 'Allez dans "Mes Assemblées & Votes". Pour chaque résolution, vous avez 3 options : ✅ POUR, ❌ CONTRE ou ⚪ NEUTRE. Cliquez sur votre choix — il est enregistré immédiatement. Vous pouvez changer votre vote à tout moment.',
        tip: '⚖️ Votre vote est pondéré par votre nombre d\'actions dans l\'entreprise concernée.',
    },
    {
        icon: '📊',
        title: '4. Suivre vos votes',
        description: 'Dans "Mes Votes", consultez l\'historique de tous vos votes exprimés avec les statistiques : nombre de POUR, CONTRE et NEUTRES. Le poids de chaque vote (en nombre d\'actions) est aussi affiché.',
        tip: '💡 Un vote exprimé ne peut pas être annulé, seulement modifié.',
    },
];

export default function GuidePage() {
    const { user } = useAuth();
    const isAdmin = user?.role === 'ADMIN';
    const [tab, setTab] = useState(isAdmin ? 'admin' : 'user');

    const steps = tab === 'admin' ? adminSteps : userSteps;

    return (
        <div className="guide-container">
            <div className="page-header">
                <h1 className="page-title">📖 Guide d'utilisation</h1>
                <p className="page-subtitle">Suivez ces étapes pour utiliser la plateforme efficacement</p>
            </div>

            <div className="guide-info-banner">
                <div style={{ fontSize: '1.5rem' }}>ℹ️</div>
                <div>
                    <div style={{ fontWeight: 700, marginBottom: 4, fontSize: '0.9rem' }}>À propos de la plateforme</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                        <strong>AG Vote System</strong> est une plateforme de digitalisation des Assemblées Générales.
                        Elle permet aux entreprises d'organiser leurs votes en ligne, avec une pondération des voix
                        basée sur le nombre d'actions détenues par chaque actionnaire.
                    </div>
                </div>
            </div>

            <div className="guide-tabs">
                {isAdmin && (
                    <button
                        className={`guide-tab ${tab === 'admin' ? 'active' : ''}`}
                        onClick={() => setTab('admin')}
                    >
                        🔑 Guide Administrateur
                    </button>
                )}
                <button
                    className={`guide-tab ${tab === 'user' ? 'active' : ''}`}
                    onClick={() => setTab('user')}
                >
                    👤 Guide Actionnaire
                </button>
            </div>

            <div>
                {steps.map((step, i) => (
                    <div key={i} className="guide-step-card">
                        <div className="step-number">{i + 1}</div>
                        <div className="step-content">
                            <h3>{step.icon} {step.title}</h3>
                            <p>{step.description}</p>
                            <div className="step-tip">{step.tip}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{
                marginTop: 28, padding: '20px 24px',
                background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)',
                borderRadius: 'var(--radius)', fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.8
            }}>
                <strong style={{ color: 'var(--primary-light)', display: 'block', marginBottom: 6 }}>
                    🔑 Comptes de test disponibles
                </strong>
                <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: 4 }}>admin / admin</code>
                {' '} — Accès administrateur complet<br />
                <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: 4 }}>martin / martin</code>
                {' '} — Actionnaire TechInnovation (500 actions) & GreenEnergy (400 actions)<br />
                <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: 4 }}>leblanc / leblanc</code>
                {' '} — Actionnaire TechInnovation (300 actions) & GreenEnergy (600 actions)<br />
                <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: 4 }}>moreau / moreau</code>
                {' '} — Actionnaire TechInnovation (200 actions)
            </div>
        </div>
    );
}
