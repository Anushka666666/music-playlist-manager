import { useState } from 'react';

export default function LoginPage({ onLoginSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!username.trim()) {
      setError('Username is required.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }
    if (mode === 'register' && password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`http://localhost:3001/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong.');
      }

      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_username', data.username);
      onLoginSuccess(data.username);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Music Playlist Manager</h1>
        <p className="login-subtitle">
          {mode === 'login' ? 'Welcome back!' : 'Create a new account'}
        </p>

        <div className="login-form">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => { setUsername(e.target.value); if (error) setError(''); }}
            autoComplete="username"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); if (error) setError(''); }}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(e); }}
          />

          {error && <p className="error-text">{error}</p>}

          <button
            className="btn-primary btn-login"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? '...'
              : mode === 'login'
              ? 'Log In'
              : 'Create Account'}
          </button>

          <p className="login-switch">
            {mode === 'login'
              ? "Don't have an account?"
              : 'Already have an account?'}{' '}
            <button
              className="link-button"
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
            >
              {mode === 'login' ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
