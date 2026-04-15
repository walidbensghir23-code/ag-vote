// ============================================================
// APP.JSX — Fichier principal de l'application
//
// Ce fichier configure :
//   1. Le système d'authentification (AuthProvider)
//   2. Le routeur (BrowserRouter → permet de naviguer entre les pages)
//   3. La protection des routes (PrivateRoute)
//   4. La structure générale de la page (Sidebar + contenu)
// ============================================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// ---- Import du composant Sidebar (menu de navigation) ----
import Sidebar from './components/Sidebar';

// ---- Import des pages Admin ----
import EntreprisesPage from './pages/admin/EntreprisesPage';
import ActionnairesPage from './pages/admin/ActionnairesPage';
import ResolutionsPage from './pages/admin/ResolutionsPage';
import AGPage from './pages/admin/AGPage';

// ---- Import des pages Utilisateur ----
import DashboardPage from './pages/user/DashboardPage';
import AGVotePage from './pages/user/AGVotePage';
import MyVotesPage from './pages/user/MyVotesPage';
import GuidePage from './pages/GuidePage';

// ---- Import de la page de connexion ----
import LoginPage from './pages/LoginPage';

// ============================================================
// COMPOSANT : PrivateRoute
// 
// Protège une page : si l'utilisateur n'est PAS connecté,
// il est redirigé vers /login.
// 
// Si adminOnly=true, seul un ADMIN peut accéder à la page.
// Sinon, redirigé vers le dashboard.
// ============================================================
function PrivateRoute({ children, adminOnly }) {
  const { user, loading } = useAuth();

  // Pendant que l'app vérifie si l'utilisateur est connecté → rien afficher
  if (loading) return null;

  // Si pas connecté → rediriger vers la page de connexion
  if (!user) return <Navigate to="/login" replace />;

  // Si la page est réservée aux admins ET que l'utilisateur n'est pas admin
  if (adminOnly && user.role !== 'ADMIN') return <Navigate to="/user/dashboard" replace />;

  // Sinon → afficher la page normalement
  return children;
}

// ============================================================
// COMPOSANT : AppLayout
//
// La mise en page générale de l'application :
//   ┌─────────────┬─────────────────────┐
//   │   Sidebar   │   Contenu (pages)   │
//   └─────────────┴─────────────────────┘
// ============================================================
function AppLayout({ children }) {
  return (
    <div className="layout">
      {/* Menu de navigation à gauche */}
      <Sidebar />
      {/* Contenu de la page à droite */}
      <main className="main-content">{children}</main>
    </div>
  );
}

// ============================================================
// COMPOSANT : AppRoutes
//
// Définit toutes les routes (URLs) de l'application.
// Chaque <Route> associe une URL à un composant de page.
// ============================================================
function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* ---- Page de connexion ---- */}
      <Route path="/login" element={<LoginPage />} />

      {/* ---- Pages Admin (protégées : adminOnly) ---- */}
      <Route path="/admin/entreprises" element={<PrivateRoute adminOnly><AppLayout><EntreprisesPage /></AppLayout></PrivateRoute>} />
      <Route path="/admin/actionnaires" element={<PrivateRoute adminOnly><AppLayout><ActionnairesPage /></AppLayout></PrivateRoute>} />
      <Route path="/admin/resolutions" element={<PrivateRoute adminOnly><AppLayout><ResolutionsPage /></AppLayout></PrivateRoute>} />
      <Route path="/admin/ag" element={<PrivateRoute adminOnly><AppLayout><AGPage /></AppLayout></PrivateRoute>} />

      <Route path="/admin/guide" element={<PrivateRoute adminOnly><AppLayout><GuidePage /></AppLayout></PrivateRoute>} />

      {/* ---- Pages Utilisateur (protégées : connecté) ---- */}
      <Route path="/user/dashboard" element={<PrivateRoute><AppLayout><DashboardPage /></AppLayout></PrivateRoute>} />
      <Route path="/user/ag" element={<PrivateRoute><AppLayout><AGVotePage /></AppLayout></PrivateRoute>} />
      <Route path="/user/votes" element={<PrivateRoute><AppLayout><MyVotesPage /></AppLayout></PrivateRoute>} />
      <Route path="/user/guide" element={<PrivateRoute><AppLayout><GuidePage /></AppLayout></PrivateRoute>} />

      {/* ---- Redirection automatique selon le rôle ---- */}
      <Route path="/" element={
        user
          ? <Navigate to={user.role === 'ADMIN' ? '/admin/entreprises' : '/user/dashboard'} replace />
          : <Navigate to="/login" replace />
      } />

      {/* ---- Route inconnue → retour accueil ---- */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// ============================================================
// COMPOSANT RACINE : App
//
// Le composant principal qui englobe tout.
// AuthProvider → partage les infos de connexion avec toute l'app
// BrowserRouter → active la navigation par URL
// ============================================================
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
