import React from 'react';
import '../../Styles/AboutABDM.css'; // Import the CSS file for styling
import { Link } from 'react-router-dom';

// Import images
import nha from '../../Styles/images/nha.png';
import ministryHealth from '../../Styles/images/2.png';
import ministryElectronics from '../../Styles/images/4.png';
import dataGov from '../../Styles/images/5.png';
import Header from '../../Header1';

const AboutABDM = () => {
  return (
    <div className="about-abdm">
      <header className="header-section">
        <div className="header-content">
          <h1>Ayushman Bharat Digital Mission (ABDM)</h1>
          <p>Developing the necessary background to support an integrated digital health infrastructure for India.</p>
          <Link to="/CreateABHA" className="create-abha-button">Create ABHA</Link>
          <div className="sponsors">
            <img src={nha} alt="National Health Authority" />
            <img src={ministryHealth} alt="Ministry of Health and Family Welfare" />
            <img src={ministryElectronics} alt="Ministry of Electronics and Information Technology" />
            <img src={dataGov} alt="data.gov.in" />
          </div>
        </div>
      </header>
      <section className="about-section">
        <h2>About Ayushman Bharat Digital Mission</h2>
        <p>With the objective of strengthening access and equity of healthcare services, Ayushman Bharat Digital Mission was launched on 27 September 2021 through video conferencing. This mission leverages IT and its related technologies to support existing health systems with a 'citizen-centric' approach. ABDM's vision is to create a digital health ecosystem for the nation that supports universal health coverage in an efficient, accessible, inclusive, affordable, timely and secure manner. This mission is expected to improve the efficiency, effectiveness and transparency of the health service.</p>
      </section>
      <Header />
    </div>
  );
};

export default AboutABDM;
