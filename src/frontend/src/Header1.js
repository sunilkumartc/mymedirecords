import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Header.css";
import logo from "./Styles/images/logo.png"; // Adjust the path as necessary

const Header1 = ({ isLoggedIn, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAbdmMenuOpen, setIsAbdmMenuOpen] = useState(true);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleAbdmMenuToggle = () => {
    setIsAbdmMenuOpen(!isAbdmMenuOpen);
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
        <Link to="/" className="nav-link" >Home</Link>
          <div className="nav-link abdm-menu">
            <button onClick={handleAbdmMenuToggle} className="abdm-button">ABDM ▼</button>
            {isAbdmMenuOpen && (
              <div className="abdm-dropdown">
                <Link to="/CreateABHA" className="dropdown-link" onClick={handleMenuToggle}>Create ABHA</Link>
                <Link to="/AboutABDM" className="dropdown-link" onClick={handleMenuToggle}>About ABDM</Link>
                <Link to="/AboutPmjay" className="dropdown-link" onClick={handleMenuToggle}>About PMJAY</Link>
              </div>
            )}
          </div>
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

export default Header1;
