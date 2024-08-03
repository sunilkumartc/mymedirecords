import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Modal from 'react-modal';
import Header from '../../Header1';
import styles from '../../Styles/LoginABHA.module.css';
import { FaPhone, FaLock, FaIdCard } from 'react-icons/fa';

Modal.setAppElement('#root'); // Set the root element for accessibility

const ABHAadharLogin = () => {
  const [aadhaarNumber, setAadhaarNumber] = useState({ part1: '', part2: '', part3: '' });
  const [txnId, setTxnId] = useState('');
  const [otp, setOtp] = useState({ digit1: '', digit2: '', digit3: '', digit4: '', digit5: '', digit6: '' });
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [message, setMessage] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isResendActive, setIsResendActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(150); // 2 minutes and 30 seconds
  const [errorMessage, setErrorMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); // State to manage modal 
  const navigate = useNavigate();

  const part1Ref = useRef(null);
  const part2Ref = useRef(null);
  const part3Ref = useRef(null);
  const otpRefs = useRef([null, null, null, null, null, null]);

  const abhaApiUrl = process.env.REACT_APP_ABHA_API_URL;

  const handleAadhaarChange = (e) => {
    const { name, value } = e.target;
    if (value.length <= 4) {
      setAadhaarNumber(prevState => ({
        ...prevState,
        [name]: value
      }));
      if (value.length === 4) {
        if (name === 'part1') {
          part2Ref.current.focus();
        } else if (name === 'part2') {
          part3Ref.current.focus();
        }
      }
    }
  };

  const handleAadhaarSubmit = async (e) => {
    e.preventDefault();
    const { part1, part2, part3 } = aadhaarNumber;
    const fullAadhaarNumber = part1 + part2 + part3;

    try {
      if (fullAadhaarNumber.length !== 12) {
        setMessage('');
        setErrorMessage('Please enter a valid 12-digit Aadhaar number.');
        return;
      }

      const response = await axios.post(`${abhaApiUrl}/v1/patient/generate/byAadhaar/${fullAadhaarNumber}`);
      const { txnId, mobileNumber } = response.data;
      setTxnId(txnId);
      setPhoneNumber(mobileNumber);
      setIsOtpSent(true);
      setMessage(`OTP sent to phone number ending with ${mobileNumber.slice(-4)}`);
      setErrorMessage('');
      setTimeLeft(150);
      setIsResendActive(false);
    } catch (error) {
      console.error('Error generating ABHA:', error);
      if (error.response && error.response.status === 400) {
        setMessage('');
        setErrorMessage('Invalid Aadhaar number. Please check and try again.');
      } else {
        setMessage('');
        setErrorMessage('Failed to generate ABHA. Please try again.');
      }
    }
  };

  const handleOtpChange = (e, index) => {
    const { value } = e.target;
    if (value.length <= 1) {
      const newOtp = { ...otp, [`digit${index + 1}`]: value };
      setOtp(newOtp);

      if (value.length === 1 && index < 5) {
        otpRefs.current[index + 1].focus();
      }
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const fullOtp = Object.values(otp).join('');
  
    try {
      const response = await axios.post(`${abhaApiUrl}/v1/patient/verify/otp/${fullOtp}/${txnId}`);
      const responseData = response.data;
  
      if (responseData.token) {
        // Store token in local storage (if needed) and pass it via navigation state
        localStorage.setItem('abhaToken', JSON.stringify(responseData));
        navigate('/ABHAProfile', { state: { abhaToken: responseData } });
      } else {
        setErrorMessage('You do not have an ABHA account. Please create one.');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setMessage('');
      setErrorMessage('Failed to verify OTP. Please try again.');
    }
  };
  

  const handleResendOtp = async () => {
    try {
      if (!txnId) {
        setMessage('');
        setErrorMessage('Transaction ID missing. Please enter Aadhaar number and submit to receive OTP.');
        return;
      }
      const response = await axios.post(`${abhaApiUrl}/v1/patient/resendAadhaar/otp/${txnId}`);
      setMessage(`OTP resent to phone number ending with ${phoneNumber.slice(-4)}`);
      setErrorMessage('');
      setTimeLeft(150);
      setIsResendActive(false);
    } catch (error) {
      console.error('Error resending OTP:', error);
      setMessage('');
      setErrorMessage('Failed to resend OTP. Please try again.');
    }
  };

  useEffect(() => {
    let timer;
    if (isOtpSent && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prevTimeLeft => prevTimeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsResendActive(true);
    }
    return () => clearInterval(timer);
  }, [isOtpSent, timeLeft]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className={styles.loginAbhaContainer}>
      <Header />
      <div className={styles.contentWrapper}>
        <h1><FaIdCard /> ABHA Aadhaar Login</h1>
        {!isOtpSent ? (
          <form onSubmit={handleAadhaarSubmit}>
            <div className={styles.inputGroup}>
              <FaIdCard className={styles.icon} />
              <input
                type="text"
                name="part1"
                placeholder="XXXX"
                value={aadhaarNumber.part1}
                onChange={handleAadhaarChange}
                ref={part1Ref}
              />
              <input
                type="text"
                name="part2"
                placeholder="XXXX"
                value={aadhaarNumber.part2}
                onChange={handleAadhaarChange}
                ref={part2Ref}
              />
              <input
                type="text"
                name="part3"
                placeholder="XXXX"
                value={aadhaarNumber.part3}
                onChange={handleAadhaarChange}
                ref={part3Ref}
              />
            </div>
            <button type="submit" className={styles.button}>Send OTP</button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit}>
            <div className={styles.inputGroup}>
              <FaLock className={styles.icon} />
              {Array(6).fill().map((_, index) => (
                <input
                  key={index}
                  type="text"
                  value={otp[`digit${index + 1}`]}
                  onChange={(e) => handleOtpChange(e, index)}
                  ref={(el) => otpRefs.current[index] = el}
                  maxLength="1"
                  className={styles.otpInput}
                />
              ))}
            </div>
            <button type="submit" className={styles.button}>Verify OTP</button>
            <button type="button" onClick={handleResendOtp} className={styles.button} disabled={!isResendActive}>Resend OTP</button>
          </form>
        )}
        <p className={styles.message}>{message}</p>
        <p className={styles.errorMessage}>{errorMessage}</p>
        <Link to="/ABHAPhoneLogin" className={styles.link}>Click here to login via Phone</Link>
      </div>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="Select Health ID"
        className={styles.modal}
        overlayClassName={styles.overlay}
      >
        <h2>Select Health ID</h2>
        <button onClick={() => setIsModalOpen(false)} className={styles.closeButton}>Close</button>
        {/* Modal content goes here */}
      </Modal>
    </div>
  );
};

export default ABHAadharLogin;
