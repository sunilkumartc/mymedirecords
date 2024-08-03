import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../Styles/CreateABHA.css';
import Header from '../../Header1';
import { FaCheckCircle, FaQuestionCircle, FaRegAddressCard, FaUserShield, FaSignInAlt } from 'react-icons/fa';
import TermsAndConditions from './TermsAndConditions'; // Import the modal 

const CreateABHA = () => {
  const [aadhaarNumber, setAadhaarNumber] = useState({ part1: '', part2: '', part3: '' });
  const [txnId, setTxnId] = useState('');
  const [otp, setOtp] = useState({ digit1: '', digit2: '', digit3: '', digit4: '', digit5: '', digit6: '' });
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [message, setMessage] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(150); // 2 minutes and 30 seconds
  const [isResendActive, setIsResendActive] = useState(false);
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

      localStorage.setItem('abhaData', JSON.stringify(responseData));

      if (responseData.new) {
        navigate('/createABHACard', { state: { abhaData: responseData, new: true } });
      } else {
        navigate('/getABHACard', { state: { abhaData: responseData, new: false } });
      }
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
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);


  return (
    <div className="abha-create-abha-container">
      <Header />
      <div className="abha-content-wrapper1">
        <section className="abha-abha-info">
          <h1><FaRegAddressCard /> ABHA - Ayushman Bharat Health Account</h1>
          <p>The <strong>ABHA card</strong> is managed under the Ayushman Bharat Digital Mission (ABDM), which is a digital healthcare initiative of the National Health Authority (NHA). With this <strong>health card</strong>, Indian citizens are provided with numerous benefits, such as hassle-free access to medical treatments and healthcare facilities, easy sign-up options for personal health record applications, and a trustworthy identity.</p>
          <h2><FaQuestionCircle /> Important Points</h2>
          <ul>
            <li><FaCheckCircle /> Health records associated with Health IDs or ABHA numbers can only be accessed with the informed consent of the individual.</li>
            <li><FaCheckCircle /> People have the option to create an alias, referred to as an "ABHA address" (similar to an email ID).</li>
            <li><FaCheckCircle /> The ABHA card simplifies the process of accessing medical records across different healthcare providers</li>
            <li><FaCheckCircle /> It enhances the interoperability of health records, allowing for seamless data exchange between different systems.</li>
          </ul>
        </section>

        <section className="abha-create-abha-card">
          <div className="abha-card">
            <h2><FaUserShield /> Create Ayushman Bharat Health Account ABHA (Health ID) Card</h2>
            {!isOtpSent ? (
              <form onSubmit={handleAadhaarSubmit}>
                <div className="abha-aadhaar-inputs">
                  <input
                    type="text"
                    name="part1"
                    maxLength="4"
                    placeholder="xxxx"
                    value={aadhaarNumber.part1}
                    onChange={handleAadhaarChange}
                    ref={part1Ref}
                  />
                  <input
                    type="text"
                    name="part2"
                    maxLength="4"
                    placeholder="xxxx"
                    value={aadhaarNumber.part2}
                    onChange={handleAadhaarChange}
                    ref={part2Ref}
                  />
                  <input
                    type="text"
                    name="part3"
                    maxLength="4"
                    placeholder="xxxx"
                    value={aadhaarNumber.part3}
                    onChange={handleAadhaarChange}
                    ref={part3Ref}
                  />
                </div>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                <label className="abha-checkbox-label">
                  <input type="checkbox" checked={isChecked} onChange={() => setIsChecked(!isChecked)} />
                  <span>I agree to the <a href="#" onClick={openModal}>Terms and Conditions</a></span>
                </label>
                <button type="submit" className="verify-otp-button" disabled={!isChecked}><FaSignInAlt /> Create ABHA</button>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit}>
                <div className="abha-otp-inputs">
                  {[...Array(6)].map((_, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength="1"
                      value={otp[`digit${index + 1}`]}
                      onChange={(e) => handleOtpChange(e, index)}
                      ref={el => otpRefs.current[index] = el}
                    />
                  ))}
                </div>
                {message && <p className="abha-message">{message}</p>}
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                <button type="submit" className="verify-otp-button"><FaSignInAlt /> Verify OTP</button>
                <p className="abha-timer">Time left: {formatTime(timeLeft)}</p>
                <button type="button" className="verify-otp-button" onClick={handleResendOtp} disabled={!isResendActive}>Resend OTP</button>
              </form>
            )}
            {!isOtpSent && (
              <div className="existing-abha-link">
                <FaSignInAlt /> <a href="/LoginABHA"> click here to log in your ABHA Account.</a>
              </div>
            )}
          </div>
        </section>
        <TermsAndConditions isOpen={isModalOpen} onClose={closeModal} />
      </div>
      <section className="abha-stats">
        <h2>The cumulative number of ABHA created & registered across states and union territories in India as per Govt. of India @healthid.ndhm.gov.in</h2>
        <table>
          <tbody>
            <tr>
              <td><strong>Scheme</strong></td>
              <td>ABHA health card</td>
            </tr>
            <tr>
              <td><strong>Launched by</strong></td>
              <td>Ministry of Health and Family Welfare</td>
            </tr>
            <tr>
              <td><strong>Application fee</strong></td>
              <td>Free of cost</td>
            </tr>
            <tr>
              <td><strong>Documents necessary</strong></td>
              <td>Aadhaar card/driving licence</td>
            </tr>
            <tr>
              <td><strong>App</strong></td>
              <td>MyMediRecords, ABHA app</td>
            </tr>
            <tr>
              <td><strong>Website</strong></td>
              <td><a href="#">www.MyMediRecords.com</a>, <a href="#">healthid.ndhm.gov.in</a></td>
            </tr>
          </tbody>
        </table>
        <div className="stats">
          <div>
            <span>64,84,80,957</span>
            <p>ABHA Created</p>
          </div>
          <div>
            <span>3,06,219</span>
            <p>Verified Facilities On HFR</p>
          </div>
          <div>
            <span>4,05,298</span>
            <p>Verified Health Care Professionals</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CreateABHA;
