import React, { useState } from 'react';
import './DoctorHomePage.css';
import { FaEnvelope, FaPhone, FaArrowRight } from 'react-icons/fa';

const DoctorHomePage = ({ doctor }) => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(0);

  const handleSendOtp = () => {
    setOtpSent(true);
    setTimer(120);
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev === 1) clearInterval(interval);
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendOtp = () => {
    setOtpSent(false);
    setOtp('');
  };

  return (
    
    <div className="doctor-home-page">
      <div className="content-wrapper">
        <h1 className="title">Patient Consent</h1>
        <div className="input-group">
          <div className="input-wrapper">
            <FaEnvelope className="icon1" />
            <input
              type="email"
              className="input-field"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <span className="or">or</span>
          <div className="input-wrapper">
            <FaPhone className="icon1" />
            <input
              type="tel"
              className="input-field"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>
        <div className="button-group">
          {!otpSent && (
            <button className="send-otp-btn" onClick={handleSendOtp}>
              Send OTP <FaArrowRight className="icon-btn" />
            </button>
          )}
          {otpSent && (
            <>
              <div className="input-wrapper otp-wrapper">
                <input
                  type="text"
                  className="input-field otp-field"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
              <button className="submit-btn">Submit <FaArrowRight className="icon-btn" /></button>
              {timer === 0 ? (
                <button className="resend-otp-btn" onClick={handleResendOtp}>
                  Resend OTP <FaArrowRight className="icon-btn" />
                </button>
              ) : (
                <span className="timer">{`Resend OTP in ${timer}s`}</span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorHomePage;
