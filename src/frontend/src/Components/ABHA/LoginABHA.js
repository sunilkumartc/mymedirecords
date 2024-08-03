import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../../Header1';
import styles from '../../Styles/LoginABHA.module.css';
import { FaPhone, FaLock, FaRegAddressCard, FaIdCard } from 'react-icons/fa';

const LoginABHA = () => {
  const [healthId, setHealthId] = useState('');
  const [authMethod, setAuthMethod] = useState('AADHAAR_OTP');
  const [txnId, setTxnId] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const abhaApiUrl = process.env.REACT_APP_ABHA_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${abhaApiUrl}/v1/patient/abha/login/mobileOrAdhara/otp/authMethod/healthid/${authMethod}/${healthId}`);
      const { txnId } = response.data;
      setTxnId(txnId);
      setIsOtpSent(true);
      setMessage('OTP sent successfully.');
    } catch (error) {
      console.error('Error generating OTP:', error);
      setMessage('Failed to send OTP. Please try again.');
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${abhaApiUrl}/v1/patient/abha/login/mobile/confirmWithOTP/otp/txnId/authMethod/${otp}/${txnId}/${authMethod}`);
      const responseData = response.data;
      localStorage.setItem('abhaToken', JSON.stringify(responseData));
      navigate('/ABHAProfile', { state: { profile: responseData } });
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setMessage('Failed to verify OTP. Please try again.');
    }
  };

  const handleResendOtp = async () => {
    try {
      await axios.post(`${abhaApiUrl}/v1/patient/abha/login/resendAuthOTP/authMethod/txnId/${authMethod}/${txnId}`);
      setMessage('OTP resent successfully.');
    } catch (error) {
      console.error('Error resending OTP:', error);
      setMessage('Failed to resend OTP. Please try again.');
    }
  };

  return (
    <div className={styles.loginAbhaContainer}>
      <Header />
      <div className={styles.contentWrapper}>
        <h1><FaRegAddressCard /> ABHA Login</h1>
        {!isOtpSent ? (
          <form onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <FaIdCard className={styles.icon} />
              <input
                type="text"
                placeholder="Enter your Health ID"
                value={healthId}
                onChange={(e) => setHealthId(e.target.value)}
              />
            </div>
            <div className={styles.inputGroup}>
              <select
                value={authMethod}
                onChange={(e) => setAuthMethod(e.target.value)}
              >
                <option value="AADHAAR_OTP">Aadhar OTP</option>
                <option value="MOBILE_OTP">Mobile OTP</option>
              </select>
            </div>
            <button type="submit" className={styles.button}>Send OTP</button>
            <p className={styles.link}>
              Don't have a Health ID? <Link to="/ABHAPhoneLogin">Click here</Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit}>
            <div className={styles.inputGroup}>
              <FaLock className={styles.icon} />
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
            <button type="submit" className={styles.button}>Verify OTP</button>
            <button type="button" onClick={handleResendOtp} className={styles.button}>Resend OTP</button>
          </form>
        )}
        <p className={styles.message}>{message}</p>
      </div>
    </div>
  );
};

export default LoginABHA;
