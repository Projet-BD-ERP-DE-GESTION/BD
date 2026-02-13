import React, { useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import './Login.scss';

const Login = () => {
  const { login } = useContext(AuthContext);
  const history = useHistory();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('cashier');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);

    // Simulation authentification
    setTimeout(() => {
      login(username, password, role);

    // Redirection basée sur le rôle
      if (role === 'admin') {
        history.push('/dashboard');
      } else if (role === 'cashier') {
        history.push('/cashier/register');
      } else if (role === 'manager') {
        history.push('/manager/sales-dashboard');
      }
      setLoading(false);
    }, 800);
  };

  const handleQuickLogin = (selectedRole) => {
    const usernames = {
      admin: 'Admin',
      cashier: 'Pierre',
      manager: 'Sophie'
    };
    
    setUsername(usernames[selectedRole]);
    setPassword('123456');
    setRole(selectedRole);
    setLoading(true);

    login(usernames[selectedRole], '123456', selectedRole);

    setTimeout(() => {
      if (selectedRole === 'admin') {
        history.push('/dashboard');
      } else if (selectedRole === 'cashier') {
        history.push('/cashier/register');
      } else if (selectedRole === 'manager') {
        history.push('/manager/sales-dashboard');
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="container-scroller">
      <div className="container-fluid page-body-wrapper full-page-wrapper">
        <div className="content-wrapper d-flex align-items-center auth auth-bg-1 theme-two">
          <div className="row w-100">
            <div className="col-lg-4 mx-auto">
              <div className="auto-form-wrapper">
                <form onSubmit={handleLogin}>
                  <div className="form-group">
                    <div className="brand-logo">
                      <img src={require("../../assets/images/logo.svg")} alt="logo" style={{ maxWidth: '100px' }} />
                    </div>
                  </div>

                  <h4 className="text-center mb-4">Supermarché Central</h4>
                  <h6 className="text-center text-muted mb-4">Système de Gestion</h6>

                  <div className="form-group">
                    <label className="label"><strong>Sélectionner un rôle:</strong></label>
                    <div className="role-selector">
                      <button
                        type="button"
                        className={`role-btn ${role === 'admin' ? 'active' : ''}`}
                        onClick={() => { setRole('admin'); setError(''); }}
                      >
                        <i className="mdi mdi-shield-admin"></i>
                        <span>Admin</span>
                      </button>
                      <button
                        type="button"
                        className={`role-btn ${role === 'cashier' ? 'active' : ''}`}
                        onClick={() => { setRole('cashier'); setError(''); }}
                      >
                        <i className="mdi mdi-cash-register"></i>
                        <span>Caissier</span>
                      </button>
                      <button
                        type="button"
                        className={`role-btn ${role === 'manager' ? 'active' : ''}`}
                        onClick={() => { setRole('manager'); setError(''); }}
                      >
                        <i className="mdi mdi-briefcase"></i>
                        <span>Gérant</span>
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="label">Nom d'utilisateur</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Entrez votre nom"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label className="label">Mot de passe</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Entrez votre mot de passe"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  {error && (
                    <div className="alert alert-danger" role="alert">
                      <i className="mdi mdi-alert-circle"></i> {error}
                    </div>
                  )}

                  <button type="submit" className="btn btn-primary btn-block mb-2" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm mr-2"></span>
                        Connexion en cours...
                      </>
                    ) : (
                      <>
                        <i className="mdi mdi-login"></i> Se Connecter
                      </>
                    )}
                  </button>
                </form>

                <hr className="my-3" />

                <div>
                  <p className="text-center text-muted mb-3"><small>Connexion rapide:</small></p>
                  <div className="d-grid gap-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-info mb-2"
                      onClick={() => handleQuickLogin('admin')}
                      disabled={loading}
                    >
                      <i className="mdi mdi-shield-admin"></i> Admin
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-success mb-2"
                      onClick={() => handleQuickLogin('cashier')}
                      disabled={loading}
                    >
                      <i className="mdi mdi-cash-register"></i> Caissier
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-warning"
                      onClick={() => handleQuickLogin('manager')}
                      disabled={loading}
                    >
                      <i className="mdi mdi-briefcase"></i> Gérant
                    </button>
                  </div>
                </div>

                <div className="text-center mt-4 small text-muted">
                  <p>Système de gestion pour Supermarché Central</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
