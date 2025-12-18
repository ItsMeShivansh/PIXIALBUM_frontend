import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './Components/Login/Login';
import PhotographerLogin from './Components/PhotographerLogin/PhotographerLogin';
import RoleSelect from './Components/RoleSelect/RoleSelect';
import PhotographerDashboard from './Components/PhotographerDashboard/PhotographerDashboard';
import ViewerDashboard from './Components/ViewerDashboard/ViewerDashboard';
import EventCard from './Components/PhotographerDashboard/EventCard';
import { authenticateUser } from './utils/api';
import { USER_ROLES } from './constants';
import './App.css';
import Gallery from './Components/ViewerDashboard/Gallery';
import NewGallery from './Components/ViewerDashboard/NewGallery';
// import MasonryGallery from './Components/ViewerDashboard/temp';

function AppRoutes({ role, setRole, loggedIn, setLoggedIn, username, setUsername, loading, onLogout, events, setEvents}) {
  const navigate = useNavigate();

  const handleLogin = async (usernameInput, password) => {
    // console.log('handleLogin called', usernameInput, password);
    // console.log('Selected role:', role);
    let body = {
      userid: usernameInput,
      password: password,
      userType: role === USER_ROLES.PHOTOGRAPHER ? "VENDOR" : "VIEWER"
    };
    try {
      const data = await authenticateUser(body);
      if (data.authenticated) {
        setLoggedIn(true);
        setUsername(usernameInput);
        localStorage.setItem('role', role);
        localStorage.setItem('username', usernameInput);
        if (role === USER_ROLES.PHOTOGRAPHER) {
          navigate('/dashboard');
        } else {
          navigate('/viewer');
        }
      } else {
        alert(data.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error: ' + error.message);
    }
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          loading ? (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span>Loading...</span>
            </div>
          ) : loggedIn ? (
            role === USER_ROLES.PHOTOGRAPHER ? <Navigate to="/dashboard" /> :
            role === USER_ROLES.VIEWER ? <Navigate to="/viewer" /> :
            <Navigate to="/roleselect" />
          ) : (
            <Navigate to="/roleselect" />
          )
        }
      />
      <Route path="/roleselect" element={<RoleSelect onSelect={setRole} />} />
      <Route
        path="/login"
        element={
          role === USER_ROLES.PHOTOGRAPHER
            ? <PhotographerLogin onLogin={handleLogin} goBack={() => setRole(null)} />
            : <Login onLogin={handleLogin} role={role} goBack={() => setRole(null)} />
        }
      />
      <Route
        path="/dashboard"
        element={
          loggedIn && role === USER_ROLES.PHOTOGRAPHER
            ? <PhotographerDashboard
                username={username}
                events={events}
                setEvents={setEvents}
                onLogout={onLogout}
              />
            : <Navigate to="/" />
        }
      />
      <Route
        path="/viewer"
        element={
          loggedIn && role === USER_ROLES.VIEWER
            ? <ViewerDashboard 
                username={username}
                events={events}
                setEvents={setEvents}
                onLogout={onLogout}
              />
            : <Navigate to="/" />
        }
      />
      <Route
        path="/viewer/:eventId"
        element={
          loggedIn && role === USER_ROLES.VIEWER
            ? <Gallery
                events={events}
                setEvents={setEvents}
                goBack={() => navigate('/viewer')}
              />
            : <Navigate to="/" />
        }
      />
      <Route
        path="/dashboard/event/:eventId"
        element={
          loggedIn && role === USER_ROLES.PHOTOGRAPHER
            ? <EventCard events={events}/>
            : <Navigate to="/" />
        }
      />
      {/* Redirect unknown routes to root */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  const [role, setRole] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);

  // Check for JWT token on mount and keep user logged in if token exists
  useEffect(() => {
    const savedRole = localStorage.getItem('role');
    const savedUsername = localStorage.getItem('username');
    if (savedRole) setRole(savedRole);
    if (savedRole && savedUsername) {
      setLoggedIn(true);
      setUsername(savedUsername);
    } else {
      setLoggedIn(false);
      setUsername('');
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    setLoggedIn(false);
    setRole(null);
    setUsername('');
    // Optionally: setEvents([]);
    document.cookie = 'jwt_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AppRoutes
        role={role}
        setRole={setRole}
        loggedIn={loggedIn}
        setLoggedIn={setLoggedIn}
        username={username}
        setUsername={setUsername}
        loading={loading}
        onLogout={handleLogout}
        events={events}
        setEvents={setEvents}
      />
    </BrowserRouter>
  );
}

export default App;


// ssh -i ec2-dev-key.pem ec2-user@ec2-13-204-97-159.ap-south-1.compute.amazonaws.com
// scp -i ec2-dev-key.pem -r ~/Desktop/Work/Projects/JS\ tutorial/Gallery/gallery-app/build/* ec2-user@ec2-13-204-97-159.ap-south-1.compute.amazonaws.com:/home/ec2-user/build/