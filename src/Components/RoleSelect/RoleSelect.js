import React from 'react';
import { useNavigate } from 'react-router-dom';
import './RoleSelect.css';
import logo from '../../assets/logo.png'; 

function RoleSelect({ onSelect }) {
  const navigate = useNavigate();

  const handleSelect = (role) => {
    onSelect(role);
    localStorage.setItem('role', role); // Store role in localStorage
    navigate('/login');
  };

  return (
    <div className='container'>
      <div className="role-select">
        <div className="role-select-logo">
          <img src={logo} alt="Logo" />
        </div>
        {/* <h2>Select Your Role</h2> */}
        <div className="role-select-btn-group">
          <button onClick={() => handleSelect('viewer')}>
            <i className="fa-solid fa-user"></i>
            Viewer
          </button>
          <button onClick={() => handleSelect('photographer')}>
            <i className="fa-solid fa-camera"></i>
            Photographer
          </button>
        </div>
      </div>
    </div>
  );
}

export default RoleSelect;