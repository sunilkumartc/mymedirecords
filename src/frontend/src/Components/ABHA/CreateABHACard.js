import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../Styles/CreateABHACard.css';
import { FaPhoneAlt, FaKey, FaUser, FaCalendar, FaIdCard, FaMapMarkerAlt } from 'react-icons/fa';

const CreateABHACard = () => {
  const location = useLocation();
  const { abhaData } = location.state || {};
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [txnId, setTxnId] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const abhaApiUrl = process.env.REACT_APP_ABHA_API_URL;

  useEffect(() => {
    if (abhaData) {
      setTxnId(abhaData.txnId || '');
    }
  }, [abhaData]);

  const validatePhoneNumber = (number) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(number);
  };

  const handlePhoneNumberSubmit = async (e) => {
    e.preventDefault();
    if (!validatePhoneNumber(phoneNumber)) {
      setErrorMessage('Invalid phone number. Please enter a 10-digit number starting with 6, 7, 8, or 9.');
      return;
    }
    setErrorMessage('');
    try {
      const response = await axios.post(`${abhaApiUrl}/v1/patient/checkAndGenerateMobile/otp/${phoneNumber}/${txnId}`, {});
      const { mobileLinked } = response.data;

      if (mobileLinked) {
        navigate('/newABHACard', { state: { abhaData, txnId } });
      } else {
        setIsOtpSent(true);
        setMessage('OTP sent to your phone number.');
      }
    } catch (error) {
      console.error('Error checking and generating mobile OTP:', error);
      setMessage('Failed to generate mobile OTP. Please try again.');
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${abhaApiUrl}/v1/patient/verifyMobile/otp/${otp}/${txnId}`, {});
      const { txnId: newTxnId } = response.data;

      // Use the new txnId for further navigation
      navigate('/newABHACard', { state: { abhaData, txnId: newTxnId } });
    } catch (error) {
      console.error('Error verifying OTP:', error);
      if (error.response && error.response.status === 400) {
        setMessage(''); 
        setErrorMessage('Invalid OTP. Please check and try again.');
      } else {
        setMessage('');
        setErrorMessage('Failed to verify OTP. Please try again.');
      }
    }
  };

  return (
    <div className="create-abha-card-container">
      <div className="card">
        <h1 className="card-title">Create Your ABHA Card</h1>
        {abhaData && (
          <div className="abha-info">
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
          </div>
        )}
        {!isOtpSent ? (
          <form onSubmit={handlePhoneNumberSubmit} className="form">
            <div className="form-group">
              <FaPhoneAlt className="form-icon" />
              <input
                type="text"
                placeholder="Enter your phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="form-input"
              />
            </div>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <button type="submit" className="form-button">Submit</button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="form">
            <p className="message">{message}</p>
            <div className="form-group">
              <FaKey className="form-icon" />
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="form-input"
              />
            </div>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <button type="submit" className="form-button">Verify OTP</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateABHACard;
