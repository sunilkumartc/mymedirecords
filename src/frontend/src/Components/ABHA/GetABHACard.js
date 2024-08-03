import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../Styles/GetABHACard.css';
import { FaDownload } from 'react-icons/fa';

const GetABHACard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const abhaData = location.state?.abhaData || JSON.parse(localStorage.getItem('abhaData'));
  const [message, setMessage] = useState('');

  // Extract token from jwtResponse if available
  const token = abhaData?.jwtResponse?.token || localStorage.getItem('token');

  // Define the API base URL
  const abhaApiUrl = process.env.REACT_APP_ABHA_API_URL;

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

  return (
    <div className="get-abha-card-container">
      <div className="card">
        <h1>ABHA Card Details</h1>
        <div className="card-info">
        {abhaData?.photo && <img src={`data:image/jpeg;base64,${abhaData.photo}`} alt="Profile" className="profile-photo" />}
          <p><strong>Name:</strong> {abhaData?.name}</p>
          <p><strong>Gender:</strong> {abhaData?.gender}</p>
          <p><strong>Aadhaar:</strong> {abhaData?.aadhaar}</p>
        </div>

        <h2><FaDownload /> Download ABHA Card</h2>
        <button onClick={handleDownload} className="download-button">Download ABHA Card</button>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
};

export default GetABHACard;
