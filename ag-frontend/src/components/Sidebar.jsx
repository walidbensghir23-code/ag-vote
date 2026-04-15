import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Barre de navigation latérale de l'application.
 *
 * Affiche les liens de navigation adaptés au rôle de l'utilisateur connecté :
 * - ADMIN : accès au CRUD des entreprises, actionnaires, résolutions et AGs
 * - USER  : accès au tableau de bord, à la page de vote et à l'historique des votes
 *
 * Le lien actif est mis en évidence automatiquement grâce à NavLink de React Router.
 * Un guide d'utilisation est disponible pour les deux rôles.
 */

/** Liens de navigation pour l'administrateur */
const adminLinks = [
    { to: '/admin/entreprises', icon: '🏢', label: 'Entreprises' },
    { to: '/admin/ag', icon: '🗳️', label: 'Assemblées Générales' },
];

/** Liens de navigation pour l'actionnaire (utilisateur) */
const userLinks = [
    { to: '/user/dashboard', icon: '🏠', label: 'Tableau de bord' },
    { to: '/user/ag', icon: '🗳️', label: 'Mes Assemblées & Votes' },
    { to: '/user/votes', icon: '✅', label: 'Mes Votes' },
];

export default function Sidebar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Sélection des liens selon le rôle de l'utilisateur
    const links = user?.role === 'ADMIN' ? adminLinks : userLinks;

    // Route du guide adaptée au rôle
    const guideLink = user?.role === 'ADMIN' ? '/admin/guide' : '/user/guide';

    /** Déconnexion : vide le localStorage et redirige vers /login */
    const handleLogout = () => { logout(); navigate('/login'); };

    /** Initiales de l'utilisateur pour l'avatar (ex: "AD" pour "admin") */
    const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : '?';

    return (
        <div className="sidebar">
            {/* En-tête avec logo et nom de l'application */}
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">🏛️</div>
                    <div>
                        <div className="sidebar-title">AG Vote</div>
                        <div className="sidebar-sub">Assemblées Générales</div>
                    </div>
                </div>
            </div>

            {/* Navigation principale (liens selon le rôle) */}
            <nav className="sidebar-nav">
                <div className="sidebar-section">
                    <div className="sidebar-section-label">
                        {user?.role === 'ADMIN' ? '⚙️ Administration' : '👤 Mon espace'}
                    </div>
                    {links.map(link => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                        >
                            <span className="nav-icon">{link.icon}</span>
                            {link.label}
                        </NavLink>
                    ))}
                </div>

                {/* Section aide / guide */}
                <div className="sidebar-section">
                    <div className="sidebar-section-label">📚 Aide</div>
                    <NavLink
                        to={guideLink}
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                    >
                        <span className="nav-icon">📖</span>
                        Guide d'utilisation
                    </NavLink>
                </div>
            </nav>

            {/* Pied de sidebar : profil utilisateur + bouton déconnexion */}
            <div className="sidebar-footer">
                <div className="user-chip">
                    <div className="user-avatar">{initials}</div>
                    <div>
                        <div className="user-name">{user?.username}</div>
                        <div className="user-role">
                            {user?.role === 'ADMIN' ? '🔑 Administrateur' : '👤 Actionnaire'}
                        </div>
                    </div>
                </div>
                <button className="logout-btn" onClick={handleLogout}>
                    🚪 Se déconnecter
                </button>
            </div>
        </div>
    );
}
