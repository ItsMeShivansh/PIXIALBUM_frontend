import React, { useRef, useState } from 'react';
import './Profile.css';

function Profile({ user, goBack }) {
  const [profilePhoto, setProfilePhoto] = useState(user.profilePhoto || '');
  const fileInputRef = useRef(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setProfilePhoto(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="profile-page">
      <button className="profile-back-btn" onClick={goBack}>
        <i className="fa-solid fa-arrow-left"></i> Back
      </button>
      <div className="profile-card">
        <div className="profile-photo-section">
          <div
            className="profile-photo"
            style={{
              backgroundImage: profilePhoto
                ? `url(${profilePhoto})`
                : 'url("https://ui-avatars.com/api/?name=' + encodeURIComponent(user.companyName || user.ownerName || user.username) + '&background=23272f&color=1976d2&size=128")'
            }}
            onClick={() => fileInputRef.current.click()}
            title="Click to change photo"
          >
            <span className="profile-photo-edit">
              <i className="fa-solid fa-camera"></i>
            </span>
          </div>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handlePhotoChange}
          />
        </div>
        <div className="profile-info">
          <h2>{user.companyName || user.ownerName || user.username}</h2>
          <div className="profile-info-list">
            <div>
              <span className="profile-label">Username:</span>
              <span>{user.vendorId}</span>
            </div>
            {user.companyName && (
              <div>
                <span className="profile-label">Company Name:</span>
                <span>{user.companyName}</span>
              </div>
            )}
            {user.ownerName && (
              <div>
                <span className="profile-label">Owner Name:</span>
                <span>{user.ownerName}</span>
              </div>
            )}
            {user.emailId && (
              <div>
                <span className="profile-label">Email:</span>
                <span>{user.emailId}</span>
              </div>
            )}
            {user.phoneNumber && (
              <div>
                <span className="profile-label">Phone:</span>
                <span>{user.phoneNumber}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;