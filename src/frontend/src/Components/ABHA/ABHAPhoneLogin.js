import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Modal from 'react-modal';
import Header from '../../Header1';
import styles from '../../Styles/LoginABHA.module.css';
import { FaPhone, FaLock } from 'react-icons/fa';

Modal.setAppElement('#root'); // Set the root element for accessibility

const ABHAPhoneLogin = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [txnId, setTxnId] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [message, setMessage] = useState('');
  const [healthIds, setHealthIds] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const abhaApiUrl = process.env.REACT_APP_ABHA_API_URL;
  const localApiUrl = `${abhaApiUrl}/v1/patient/userAuthorizedToken`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${abhaApiUrl}/v1/patient/mobile/login/generateOtp/mobileNumber/${phoneNumber}`);
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
      const response = await axios.post(`${abhaApiUrl}/v1/patient/mobile/login/verifyOtp/otp/txnId/${otp}/${txnId}`);
      const { token, mobileLinkedHid } = response.data;

      localStorage.setItem('initialToken', token);
      localStorage.setItem('txnId', txnId);

      if (mobileLinkedHid.length > 1) {
        setHealthIds(mobileLinkedHid);
        setIsModalOpen(true);
      } else {
        const healthIdNumber = mobileLinkedHid.length > 0 ? mobileLinkedHid[0].healthIdNumber : null;
        navigateToProfile(token, healthIdNumber);
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setMessage('Invalid OTP. Please try again.');
    }
  };

  const navigateToProfile = async (token, healthIdNumber) => {
    try {
      localStorage.setItem('healthId', healthIdNumber);
      const body = { healthId: healthIdNumber, txnId, token };
      const authResponse = await axios.post(localApiUrl, body);
      const modifiedToken = authResponse.data.token;

      localStorage.setItem('token', modifiedToken);
      navigate('/ABHAProfile', { state: { profile: authResponse.data } });
    } catch (error) {
      console.error('Error getting the modified token:', error);
      setMessage('Failed to get the modified token. Please try again.');
    }
  };

  const handleResendOtp = async () => {
    try {
      await axios.post(`${abhaApiUrl}/v1/patient/mobile/login/resendOtp/txnId/${txnId}`);
      setMessage('OTP resent successfully.');
    } catch (error) {
      console.error('Error resending OTP:', error);
      setMessage('Failed to resend OTP. Please try again.');
    }
  };

  const handleSelectHealthId = (healthIdNumber) => {
    setIsModalOpen(false);
    navigateToProfile(localStorage.getItem('initialToken'), healthIdNumber);
  };

  return (
    <div className={styles.loginAbhaContainer}>
      <Header />
      <div className={styles.contentWrapper}>
        <h1><FaPhone /> ABHA Phone Login</h1>
        {!isOtpSent ? (
          <form onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <FaPhone className={styles.icon} />
              <input
                type="text"
                placeholder="Enter your Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            <button type="submit" className={styles.button}>Send OTP</button>
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
        <p className={styles.message}>
          <Link to="/ABHAadharLogin" className={styles.link}>Click here to login with Aadhaar</Link>
        </p>
      </div>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="Select Health ID"
        className={styles.modal}
        overlayClassName={styles.overlay}
      >
        <h2>Select Health ID</h2>
        <ul className={styles.healthIdList}>
          {healthIds.map((hid, index) => (
            <li key={index} onClick={() => handleSelectHealthId(hid.healthIdNumber)} className={styles.healthIdItem}>
              {hid.name} ({hid.healthIdNumber})
            </li>
          ))}
        </ul>
      </Modal>
    </div>
  );
};

export default ABHAPhoneLogin;
