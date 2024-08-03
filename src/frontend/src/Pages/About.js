import React from "react";
import Doctor from "../Assets/doctor-group.png";
import SolutionStep from "./SolutionStep";
import "../Styles/About.css";

function About() {
  return (
    <div className="about-section" id="about">
      <div className="about-image-content">
        <img src={Doctor} alt="Doctor Group" className="about-image1" />
        <div className="about-image-text">About Us</div>
      </div>

      <div className="about-text-content">
        <h3 className="about-title">
          <span>About Us</span>
        </h3>
        <p className="about-description">
          Welcome to Mymedirecords,<br/> Mymedirecords is a health-tech startup company  based in Bengaluru.<br />This online portal is available on website <a href="http://mymedirecords.com/">mymedirecords.com</a> and on our WhatsApp business page +91 7975812925 Here patients and family members share reports to get smart analysis of reports. <br />We will provide second consultation for the same  from best doctors - Registered practitioners as per new MCI online consultation rules.
        </p>

        <SolutionStep
          title="Upload Your Records"
          description="Easily upload your medical records to Mymedirecords. Our system ensures that your data is securely stored and ready for analysis."
        />

        <SolutionStep
          title="Analyze and Report"
          description="Our advanced system analyzes your medical records and generates a comprehensive smart report. This report offers valuable insights and personalized recommendations for your health."
        />

        <SolutionStep
          title="Get Expert Advice"
          description="Our team of medical professionals reviews your smart report and provides expert advice and tailored treatment plans, helping you achieve optimal health."
        />

        {/* <h4 className="about-text-title">Security and Privacy</h4>
         <p className="about-description">
          At Mymedirecords, we prioritize the security and privacy of your
          medical records. Our platform utilizes state-of-the-art encryption
          and security protocols to ensure that your data is always protected.
          Your trust is our top priority.
        </p> */}
      </div>
    </div>
  );
}

export default About;
