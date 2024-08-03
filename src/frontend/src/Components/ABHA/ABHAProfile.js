import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styles from '../../Styles/ABHAProfile.module.css';
import { FaUser, FaIdCard, FaPhone, FaDownload, FaVenusMars, FaBirthdayCake } from 'react-icons/fa';
import axios from 'axios';
import Header1 from '../../Header1';

const ABHAProfile = () => {
  const location = useLocation();
  const token = location.state?.profile?.token || localStorage.getItem('abhaToken');
  const [profile, setProfile] = useState(null);
  const [message, setMessage] = useState('');

  const abhaApiUrl = process.env.REACT_APP_ABHA_API_URL;

  useEffect(() => {
    if (token) {
      fetchProfileData(token);
    }
  }, [token]);

  const fetchProfileData = async (token) => {
    try {
      const response = await axios.get(`${abhaApiUrl}/v1/patient/account/profile/token/${token}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setProfile(response.data);
      localStorage.setItem('abhaProfile', JSON.stringify(response.data));
    } catch (error) {
      console.error('Error fetching profile data:', error.response ? error.response.data : error.message);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await axios.get(`${abhaApiUrl}/v1/patient/account/getCard/token/${token}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'ABHA_Card.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading ABHA card:', error);
      setMessage('Failed to download ABHA card. Please try again.');
    }
  };

  if (!profile) {
    return <div>No profile data found.</div>;
  }

  const profilePicture = profile.profilePhoto ? `data:image/jpeg;base64,${profile.profilePhoto}` : '';
  return (
    <div className={styles.abhaProfileContainer}>
        <Header1 />
      <div className={styles.abhaProfileCard}>
        <h1><FaUser /> ABHA Profile</h1>
        <div className={styles.abhaProfilePicture}>
          {profilePicture ? (
            <img src={profilePicture} alt="Profile" className={styles.abhaProfileImage} />
          ) : (
            <div className={styles.abhaNoImage}>No Profile Picture</div>
          )}
        </div>
        <div className={styles.abhaProfileInfo}>
        <div className={styles.abhaProfileItem}>
            <FaUser className={styles.abhaIcon} />
            <div>
              <span>Name:</span>
              <p>{profile.name}</p>
            </div>
          </div>
          <div className={styles.abhaProfileItem}>
            <FaIdCard className={styles.abhaIcon} />
            <div>
              <span>Health ID:</span>
              <p>{profile.healthId}</p>
            </div>
          </div>
          <div className={styles.abhaProfileItem}>
            <FaPhone className={styles.abhaIcon} />
            <div>
              <span>Mobile:</span>
              <p>{profile.mobile}</p>
            </div>
          </div>
          <div className={styles.abhaProfileItem}>
            <FaIdCard className={styles.abhaIcon} />
            <div>
              <span>Health ID Number:</span>
              <p>{profile.healthIdNumber}</p>
            </div>
          </div>
          
          <div className={styles.abhaProfileItem}>
            <FaVenusMars className={styles.abhaIcon} />
            <div>
              <span>Gender:</span>
              <p>{profile.gender}</p>
            </div>
          </div>
          <div className={styles.abhaProfileItem}>
            <FaBirthdayCake className={styles.abhaIcon} />
            <div>
              <span>Date of Year:</span>
              <p>{profile.yearOfBirth}</p>
            </div>
          </div>
        </div>
        <button className={styles.downloadButton} onClick={handleDownload}>
          <FaDownload /> Download ABHA Card
        </button>
        {message && <p className={styles.errorMessage}>{message}</p>}
      </div>
    </div>
  );
};

export default ABHAProfile;
