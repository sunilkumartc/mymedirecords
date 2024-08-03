import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import '../../Styles/NewABHACard.css';
import { FaDownload, FaUser, FaCalendar, FaIdCard, FaMapMarkerAlt } from 'react-icons/fa';

const NewABHACard = () => {
  const [message, setMessage] = useState('');
  const [token, setToken] = useState('');
  const [isCardAvailable, setIsCardAvailable] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { txnId, abhaData } = location.state || {};

  const abhaApiUrl = process.env.REACT_APP_ABHA_API_URL;

  useEffect(() => {
    if (txnId) {
      const createHealthId = async () => {
        try {
          const response = await axios.post(`${abhaApiUrl}/v1/patient/createHealthIdWithPreVerified/txnId/${txnId}`);
          setMessage('Your ABHA card has been created successfully.');
          setToken(response.data.token); // Assuming token is returned in response data
          setIsCardAvailable(true);

          // Navigate to CreateABHA page after 20 seconds
          setTimeout(() => {
            navigate('/CreateABHA');
          }, 20000);
        } catch (error) {
          console.error('Error creating health ID:', error);
          setMessage('Failed to create health ID. Please try again.');
        }
      };

      createHealthId();
    } else {
      setMessage('Missing transaction ID.');
    }
  }, [txnId, navigate, abhaApiUrl]);

  const handleDownload = async () => {
    if (!token) {
      setMessage('No token available for downloading ABHA card.');
      return;
    }

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

  return (
    <div className="new-abha-card-container">
      <div className="card">
        <h1 className="card-title">New ABHA Card Details</h1>
        {abhaData && (
          <div className="card-info">
            <div className="info-item">
              <FaUser className="info-icon" />
              <p><strong>Name:</strong> {abhaData.name}</p>
            </div>
            <div className="info-item">
              <FaCalendar className="info-icon" />
              <p><strong>Gender:</strong> {abhaData.gender}</p>
            </div>
            <div className="info-item">
              <FaCalendar className="info-icon" />
              <p><strong>Birthdate:</strong> {abhaData.birthdate}</p>
            </div>
            <div className="info-item">
              <FaIdCard className="info-icon" />
              <p><strong>Aadhaar:</strong> {abhaData.aadhaar}</p>
            </div>
            <div className="info-item">
              <FaMapMarkerAlt className="info-icon" />
              <p><strong>State:</strong> {abhaData.state}</p>
            </div>
            <div className="info-item">
              <FaIdCard className="info-icon" />
              <p><strong>Transaction ID:</strong> {txnId}</p>
            </div>
          </div>
        )}
        {message && <p className="message">{message}</p>}
        {isCardAvailable && (
          <div className="download-section">
            <h2><FaDownload /> Download ABHA Card</h2>
            <button onClick={handleDownload} className="download-button">Download ABHA Card</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewABHACard;
