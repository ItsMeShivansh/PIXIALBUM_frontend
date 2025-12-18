import React, { useState } from 'react';
import './Login.css';
import logo from '../../assets/logo.png';
import { useNavigate } from 'react-router-dom';

function Login({ onLogin, goBack, role, error }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(username, password);
  };

  const handleBack = () => {
    goBack();
    navigate('/'); // Navigate back to the previous page
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <img src={logo} alt="Logo" className="form-logo" />
      <button type="button" onClick={handleBack} className="back-btn">← Back</button>
      <p>Login</p>
      {/* <p>
        {role === 'viewer'
          ? 'Please enter your Viewer credentials to fetch your Clicks!'
          : 'Please enter your Username and Password to log in as a Photographer.'}
      </p> */}
      <div>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
      </div>
      <div>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
      </div>
      {error && <div className="login-error">{error}</div>}
      <button type="submit">Log In</button>
    </form>
  );
}

export default Login;