import React, { useState } from 'react';
import './PhotographerLogin.css'; 
import { isValidEmail, isStrongPassword } from '../../utils/validators';
import { createUser } from '../../utils/api';
import logo from '../../assets/logo.png'; // adjust path as needed
import { useNavigate } from 'react-router-dom';

function PhotographerLogin({ onLogin, goBack }) {
  const [mode, setMode] = useState('signin'); // 'signin' or 'signup'
  const navigate = useNavigate();

  // Sign In state
  const [signInUsername, setSignInUsername] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Sign Up state
  const [signUpUsername, setSignUpUsername] = useState('');
  const [signUpOwnername, setSignUpOwnername] = useState('');
  const [signUpCompany, setSignUpCompany] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [signUpError, setSignUpError] = useState('');

  // Handle Sign In
  const handleSignIn = (e) => {
    e.preventDefault();
    console.log('Sign In:', signInUsername, signInPassword);
    onLogin(signInUsername, signInPassword);
  };

  const handleBack = () => {
    goBack();
    navigate('/'); // Navigate back to the previous page
  }

  // Handle Sign Up
  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!signUpUsername) {
      setSignUpError('Username is required.');
      return;
    }
    if (!signUpOwnername) {
      setSignUpError('Owner name is required.');
      return;
    }
    if (!isValidEmail(signUpEmail)) {
      setSignUpError('Please enter a valid email address.');
      return;
    }
    if (!signUpPhone) {
      setSignUpError('Phone number is required.');
      return;
    }
    if (!isStrongPassword(signUpPassword)) {
      setSignUpError('Password must be at least 8 characters and include a number.');
      return;
    }
    if (signUpPassword !== signUpConfirmPassword) {
      setSignUpError('Passwords do not match.');
      return;
    }
    setSignUpError('');

    // API call to backend
    try {
      let createUserRequest = {};
      let user = {};
      user.userId = signUpUsername;
      user.emailId = signUpEmail;
      user.password = signUpPassword;
      user.userType = "VENDOR";
      createUserRequest.user = user;
      createUserRequest.companyName = signUpCompany;
      createUserRequest.phoneNumber = signUpPhone;
      createUserRequest.ownerName = signUpOwnername;
      const response = await createUser(createUserRequest);

      if (response.ok) {
        alert('Sign up successful! You can now sign in.');
        setMode('signin');
        setSignUpUsername('');
        setSignUpOwnername('');
        setSignUpCompany('');
        setSignUpEmail('');
        setSignUpPhone('');
        setSignUpPassword('');
        setSignUpConfirmPassword('');
      } else {
        setSignUpError(response.message || 'Sign up failed. Please try again.');
      }
    } catch (error) {
      setSignUpError('Network error. Please try again.');
      console.error('Sign up error:', error);
    }
  };

  return (
    <div className="container">
      <div className="photographer-login-form">
        <img src={logo} alt="Logo" className="form-logo" />
        <div className="photographer-login-tabs">
          <button
            onClick={() => setMode('signin')}
            className={mode === 'signin' ? 'active' : ''}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('signup')}
            className={mode === 'signup' ? 'active' : ''}
          >
            Sign Up
          </button>
        </div>

        {/* Place the Back button at the top right for better UX */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <button
            type="button"
            onClick={handleBack}
            className="back-btn"
          >
            ← Back
          </button>
        </div>

        {mode === 'signin' ? (
          <form onSubmit={handleSignIn}>
            {/* <h2>Photographer Sign In</h2> */}
            <input
              type="text"
              placeholder="Username"
              value={signInUsername}
              onChange={e => setSignInUsername(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={signInPassword}
              onChange={e => setSignInPassword(e.target.value)}
              required
            />
            <button type="submit">Sign In</button>
          </form>
        ) : (
          <form onSubmit={handleSignUp}>
            {/* <h2>Photographer Sign Up</h2> */}
            <input
              type="text"
              placeholder="Username"
              value={signUpUsername}
              onChange={e => setSignUpUsername(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Company Name (optional)"
              value={signUpCompany}
              onChange={e => setSignUpCompany(e.target.value)}
            />
            <input 
              type="text"
              placeholder="Owner Name"
              value={signUpOwnername}
              onChange={e => setSignUpOwnername(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email ID"
              value={signUpEmail}
              onChange={e => setSignUpEmail(e.target.value)}
              required
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={signUpPhone}
              onChange={e => setSignUpPhone(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Set Password"
              value={signUpPassword}
              onChange={e => setSignUpPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={signUpConfirmPassword}
              onChange={e => setSignUpConfirmPassword(e.target.value)}
              required
            />
            {signUpError && (
              <div className="photographer-login-error">
                {signUpError}
              </div>
            )}
            <button type="submit">Sign Up</button>
          </form>
        )}
      </div>
    </div>
  );
}

export default PhotographerLogin;