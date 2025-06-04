import { useState, useEffect } from 'react';
import { FaUser, FaEdit, FaTimes, FaCheck } from 'react-icons/fa';
import { motion } from 'framer-motion';
import  './UserProfileModal.css'

export default function UserProfileModal({ isOpen, onClose }) {
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    phone: '',
    college: ''
  });

  // Load user data from localStorage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('userData'));
    if (storedUser) {
      setUserData(storedUser);
      setEditData({
        name: storedUser.name || '',
        email: storedUser.email || '',
        phone: storedUser.phone || '',
        college: storedUser.college || ''
      });
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    const updatedUser = { ...userData, ...editData };
    localStorage.setItem('userData', JSON.stringify(updatedUser));
    setUserData(updatedUser);
    setIsEditing(false);
  };

  if (!isOpen || !userData) return null;

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <motion.div 
        className="profile-modal-content"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="profile-modal-close" onClick={onClose}>
          <FaTimes />
        </button>

        <div className="profile-header">
          <div className="profile-avatar">
            {userData.avatar ? (
              <img src={userData.avatar} alt="Profile" />
            ) : (
              <span>{userData.name ? userData.name.charAt(0).toUpperCase() : 'U'}</span>
            )}
          </div>
          <h3>{userData.name || 'User'}</h3>
        </div>

        <div className="profile-details">
          {isEditing ? (
            <>
              <div className="profile-field">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={editData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="profile-field">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={editData.email}
                  onChange={handleInputChange}
                />
              </div>
              <div className="profile-field">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={editData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="profile-field">
                <label>College</label>
                <input
                  type="text"
                  name="college"
                  value={editData.college}
                  onChange={handleInputChange}
                />
              </div>
            </>
          ) : (
            <>
              <div className="profile-field">
                <span className="field-label">Name</span>
                <span className="field-value">{userData.name || 'Not provided'}</span>
              </div>
              <div className="profile-field">
                <span className="field-label">Email</span>
                <span className="field-value">{userData.email || 'Not provided'}</span>
              </div>
              <div className="profile-field">
                <span className="field-label">Phone</span>
                <span className="field-value">{userData.phone || 'Not provided'}</span>
              </div>
              <div className="profile-field">
                <span className="field-label">College</span>
                <span className="field-value">{userData.college || 'Not provided'}</span>
              </div>
            </>
          )}
        </div>

        <div className="profile-actions">
          {isEditing ? (
            <button className="save-btn" onClick={handleSave}>
              <FaCheck /> Save Changes
            </button>
          ) : (
            <button className="edit-btn" onClick={() => setIsEditing(true)}>
              <FaEdit /> Edit Profile
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}