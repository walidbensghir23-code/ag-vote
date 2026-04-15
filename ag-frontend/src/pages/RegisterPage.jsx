import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function RegisterPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: '', password: '', confirmPassword: '', prenom: '', nom: '', email: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (form.password !== form.confirmPassword) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }
        if (form.password.length < 4) {
            setError('Le mot de passe doit contenir au moins 4 caractères.');
            return;
        }
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:8080/api/auth/register', {
                username: form.username,
                password: form.password,
                nom: form.nom,
                prenom: form.prenom,
                email: form.email,
            });
            const data = res.data;
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data));
            navigate('/user/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Ce nom d\'utilisateur est déjà utilisé.');
        } finally {
            setLoading(false);
        }
    };

    const f = (field, placeholder, type = 'text') => (
        <div className="form-group">
            <label className="form-label">{placeholder}</label>
            <input type={type} className="form-control" placeholder={placeholder}
                value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} required />
        </div>
    );

    return (
        <div className="login-page">
            <div className="login-bg-orb orb1" />
            <div className="login-bg-orb orb2" />
            <div className="login-card" style={{ maxWidth: 440 }}>
                <div className="login-header">
                    <div className="login-logo">🏛️</div>
                    <h1 className="login-title">Créer un compte</h1>
                    <p className="login-sub">Rejoignez la plateforme AG Vote</p>
                </div>

                {error && <div className="login-error">⚠️ {error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div className="form-group">
                            <label className="form-label">Prénom</label>
                            <input className="form-control" placeholder="Prénom" value={form.prenom}
                                onChange={e => setForm({ ...form, prenom: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Nom</label>
                            <input className="form-control" placeholder="Nom" value={form.nom}
                                onChange={e => setForm({ ...form, nom: e.target.value })} required />
                        </div>
                    </div>
                    {f('email', 'Email', 'email')}
                    {f('username', "Nom d'utilisateur")}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div className="form-group">
                            <label className="form-label">Mot de passe</label>
                            <input type="password" className="form-control" placeholder="••••••••" value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Confirmer</label>
                            <input type="password" className="form-control" placeholder="••••••••" value={form.confirmPassword}
                                onChange={e => setForm({ ...form, confirmPassword: e.target.value })} required />
                        </div>
                    </div>

                    <button className="btn-login" type="submit" disabled={loading}>
                        {loading ? '⏳ Création...' : '✅ Créer mon compte'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Déjà un compte ?{' '}
                    <Link to="/login" style={{ color: 'var(--primary-light)', fontWeight: 600, textDecoration: 'none' }}>
                        Se connecter
                    </Link>
                </p>
            </div>
        </div>
    );
}
