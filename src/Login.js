import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Importe o CSS apropriado

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Hook para redirecionamento

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userHandle = `${username}.bsky.social`; // Anexa .bsky.social ao username
      const response = await axios.post('https://bsky.social/xrpc/com.atproto.server.createSession', {
        identifier: userHandle,
        password,
      });

      // Armazena o token e o username no localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data.userId);
      localStorage.setItem('username', username); // Armazena o username

      // Redireciona para a tela de perfil
      navigate('/profile');
    } catch (err) {
      setError('Login falhou. Verifique suas credenciais.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Usu&aacute;rio:</label>
          <div className="username-input">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <span className="domain">.bsky.social</span> {/* Exibe o domínio ao lado */}
          </div>
        </div>
        <div>
          <label>Senha:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Carregando...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default Login;
