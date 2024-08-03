import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Header.css";
import logo from "./Styles/images/logo.png"; // Adjust the path as necessary
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faIdCard, faInfoCircle, faUserMd } from '@fortawesome/free-solid-svg-icons';

const Header = ({ isLoggedIn, onLogout, whatWeDoRef, aboutRef, smartReportRef, secondOpinionRef }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAbdmMenuOpen, setIsAbdmMenuOpen] = useState(false); // Default to false for dropdown

  const headerHeight = 70; // Adjust this value based on the actual header height

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleAbdmMenuToggle = () => {
    setIsAbdmMenuOpen(!isAbdmMenuOpen);
  };

  const scrollToSection = (ref) => {
    if (ref && ref.current) {
      window.scrollTo({
        top: ref.current.offsetTop - headerHeight,
        behavior: 'smooth'
      });
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="header">
      <div className="container">
        <div className="logo">
          <Link to="/" className="logo-link">
            <img src={logo} alt="Logo" className="logo-image" />
          </Link>
        </div>
        <nav className={`nav ${isMenuOpen ? "open" : ""}`}>
          <div className="nav-link abdm-menu">
            <button onClick={handleAbdmMenuToggle} className="abdm-button">ABDM ▼</button>
            {isAbdmMenuOpen && (
              <div className="abdm-dropdown">
              <Link to="/CreateABHA" className="dropdown-link" onClick={handleMenuToggle}>
                <FontAwesomeIcon icon={faIdCard} /> Create ABHA
              </Link>
              <Link to="/AboutABDM" className="dropdown-link" onClick={handleMenuToggle}>
                <FontAwesomeIcon icon={faInfoCircle} /> About ABDM
              </Link>
              <Link to="/AboutPmjay" className="dropdown-link" onClick={handleMenuToggle}>
                <FontAwesomeIcon icon={faUserMd} /> About PMJAY
              </Link>
            </div>
            )}
          </div>
          <Link className="nav-link" onClick={() => scrollToSection(whatWeDoRef)}>How It Works</Link>
          <Link className="nav-link" onClick={() => scrollToSection(smartReportRef)}>Get Smart Report</Link>
          <Link className="nav-link" onClick={() => scrollToSection(smartReportRef)}>Second Opinion</Link>
          <Link className="nav-link" onClick={() => scrollToSection(aboutRef)}>About Us</Link>
          {isLoggedIn ? (
            <>
              <Link to="/dashboard" className="nav-link" onClick={handleMenuToggle}>Dashboard</Link>
              <Link to="/" onClick={() => { onLogout(); handleMenuToggle(); }} className="nav-link">Logout</Link>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link" onClick={handleMenuToggle}>Sign In</Link>
              <Link to="/register" className="nav-link" onClick={handleMenuToggle}>Sign Up</Link>
            </>
          )}
        </nav>
        <button className="menu-button" onClick={handleMenuToggle}>
          ☰
        </button>
      </div>
    </header>
  );
};

export default Header;
