import React from 'react';
import './MoreMenu.css';

function MoreMenu({ onProfile, onContact, onThemeToggle, onFeedback, onLogout }) {
  return (
    <div className="more-menu">
      <button className="more-menu-item" onClick={onProfile}>
      <i className="fa-solid fa-user"></i>
        Profile
      </button>
      <button className="more-menu-item" onClick={onContact}>
        <i className="fa-solid fa-envelope"></i>
        Contact Us
      </button>
      {/* <button className="more-menu-item" onClick={onThemeToggle}>Toggle Theme</button> */}
      <button className="more-menu-item" onClick={onFeedback}>
        <i className="fa-solid fa-comment-dots"></i>
        Feedback
      </button>
      <button className="more-menu-item logout" onClick={onLogout}>
        <i className="fa-solid fa-right-from-bracket"></i>
        Logout
      </button>
    </div>
  );
}

export default MoreMenu;