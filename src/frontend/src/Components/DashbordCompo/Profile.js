import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiUser, FiMail, FiPhone } from 'react-icons/fi';
import styles from './Profile.module.css';

const Profile = ({ user }) => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    username: user.username || '',
    phone: user.phone || '',
    certificate_no: user.certificate || '',
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    console.log('User object:', user); // Check if user_type is included
  }, [user]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateInformation = () => {
    const url = `http://192.168.29.25:8001/update-user/${user.user_id}?username=${formData.username}&phone=${formData.phone}&certificate_no=${formData.certificate_no}`;
    axios.post(url)
      .then((response) => {
        setMessage('Information updated successfully');
        setShowModal(false);
      })
      .catch((error) => {
        setMessage('Failed to update information');
      });
  };

  return (
    <div className={styles.profileSection}>
      <div className={styles.profileContainer}>
        <h2>User Profile</h2>
        {user.username && (
          <div className={styles.infoItem}>
            <FiUser className={styles.icon} />
            <strong>Username:</strong> {user.username}
          </div>
        )}
        {user.email && (
          <div className={styles.infoItem}>
            <FiMail className={styles.icon} />
            <strong>Email:</strong> {user.email}
          </div>
        )}
        {user.phone && (
          <div className={styles.infoItem}>
            <FiPhone className={styles.icon} />
            <strong>Phone:</strong> {user.phone}
          </div>
        )}
        {user.user_type && (
          <div className={styles.infoItem}>
            <strong>User Type:</strong> {user.user_type}
          </div>
        )}
        <button
          className={styles.updateButton}
          onClick={() => setShowModal(true)}
        >
          Update Information
        </button>

        {showModal && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h3>Update Information</h3>
              <div className={styles.modalItem}>
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                />
              </div>
              <div className={styles.modalItem}>
                <label>Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              {user.user_type === 'doctor' && (
                <div className={styles.modalItem}>
                  <label>Certificate No</label>
                  <input
                    type="text"
                    name="certificate_no"
                    value={formData.certificate_no}
                    onChange={handleInputChange}
                  />
                </div>
              )}
              <button
                onClick={handleUpdateInformation}
                className={styles.saveButton}
              >
                Save
              </button>
              <button
                onClick={() => setShowModal(false)}
                className={styles.cancelButton}
              >
                Cancel
              </button>
              {message && <p className={styles.message}>{message}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
