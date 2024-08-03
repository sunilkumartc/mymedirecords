import React, { useState } from 'react';
import '../Styles/WhatWeDo.css';

const WhatWeDo = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const handleToggle = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const accordionData = [
    {
      title: "Smart Report",
      items: [
        {
          name: "Upload  Reports",
          description: "Users have the option to securely upload their medical reports onto our platform. From MRI scans to blood test results, our system seamlessly handles various file formats with ease."
        },
        {
          name: "Smart Analysis",
          description: "Our advanced system meticulously reviews and analyzes every detail within uploaded medical reports. From interpreting lab values to identifying key findings, our algorithm ensures a thorough understanding of the user's medical data."
        },
        {
          name: "Smart Report Generation",
          description: "Following analysis, our system generates a comprehensive and intelligible report tailored to the specific medical condition or concern highlighted in the user's document. This report provides insights, recommendations, and potential next steps based on the analyzed data."
        },
        {
          name: "Analyze Multiple Reports",
          description: "Our platform allows for the analysis of multiple medical reports to provide a holistic view of the user's health. This ensures that insights are comprehensive and take into account various aspects of the user's medical history."
        },
        {
          name: "Share Reports to Doctors",
          description: "Users can easily share their generated reports with their doctors, ensuring seamless communication and better-informed healthcare decisions."
        }
      ]
    }
  ];

  const rightSideData = [
    {
      title: "Second Opinion",
      items: [
        {
          name: "Upload Reports",
          description: "Securely upload your medical reports for a second opinion from top doctors."
        },
        {
          name: "Report Analysis",
          description: "Our experts analyze your reports to provide detailed insights."
        },
        {
          name: "Second Opinion and Suggestion from Doctors",
          description: "Receive suggestions and second opinions from specialized doctors."
        },
        {
          name: "Talk to Doctors",
          description: "Schedule a consultation with doctors to discuss your reports and get advice."
        },
        {
          name: "Follow-up and Monitoring",
          description: "After the consultation, get ongoing follow-up and monitoring to track your health progress and receive continuous support from healthcare professionals."
        }
      ]
    }
  ];

  return (
    <div className="whatwedo font-montserrat">
      <h1 className="section-title1 font-montserrat"><span>How It Works</span></h1>
      <div className="flowchart-container">
        <div className="section">
          <h2 className="section-subtitle">{accordionData[0].title}</h2>
          <div className="accordion">
            {accordionData[0].items.map((item, index) => (
              <div key={index} className="accordion-item">
                <div
                  className={`accordion-title ${activeIndex === index ? 'active' : ''}`}
                  onClick={() => handleToggle(index)}
                >
                  {item.name}
                </div>
                <div className={`accordion-content ${activeIndex === index ? 'open' : ''}`}>
                  {item.description}
                </div>
                {index < accordionData[0].items.length - 1 && (
                  <div className="arrow-down">&#x2193;</div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="divider"></div>
        <div className="section">
          <h2 className="section-subtitle">{rightSideData[0].title}</h2>
          <div className="accordion">
            {rightSideData[0].items.map((item, index) => (
              <div key={index} className="accordion-item">
                <div
                  className={`accordion-title ${activeIndex === index + accordionData[0].items.length ? 'active' : ''}`}
                  onClick={() => handleToggle(index + accordionData[0].items.length)}
                >
                  {item.name}
                </div>
                <div className={`accordion-content ${activeIndex === index + accordionData[0].items.length ? 'open' : ''}`}>
                  {item.description}
                </div>
                {index < rightSideData[0].items.length - 1 && (
                  <div className="arrow-down">&#x2193;</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatWeDo;
