import React, { useState, useEffect, useRef } from 'react';
import '../Styles/App.css';
import WhatWeDo from './WhatWeDoSection';
import UploadOptions from './UploadOptions';
import About from './About';
import Footer from '../Components/common/Footer';
import Header from '../Header';
import slide1 from '../Styles/images/slide1.png';
import slide2 from '../Styles/images/slide2.png';

function App() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    {
      title: "Get Expert Second Opinions",
      text: "Consult with top doctors worldwide to ensure you receive the best care and advice. Your health is our priority.",
      backgroundImage: `url(${slide1})`
    },
    {
      title: "Manage Your Health Records Effortlessly",
      text: "Our platform provides a seamless experience for managing all your personal health records. Stay organized and in control.",
      backgroundImage: `url(${slide2})`
    },
  ];

  const whatWeDoRef = useRef(null);
  const aboutRef = useRef(null);
  const smartReportRef = useRef(null);
  const secondOpinionRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide - 1 + slides.length) % slides.length);
  };

  return (
    <div>
      <Header 
        whatWeDoRef={whatWeDoRef} 
        aboutRef={aboutRef}
        smartReportRef={smartReportRef}
        secondOpinionRef={secondOpinionRef} 
      />
      <div className="hero-container">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`slide ${index === currentSlide ? "active" : ""}`}
            style={{ backgroundImage: slide.backgroundImage }}
          >
            <div className="slide-content">
              <h1 className="font-montserrat">{slide.title}</h1>
              <p className="font-poppins">{slide.text}</p>
            </div>
          </div>
        ))}
        <button className="slide-button prev" onClick={prevSlide}>
          &#10094;
        </button>
        <button className="slide-button next" onClick={nextSlide}>
          &#10095;
        </button>
      </div>
      <div ref={whatWeDoRef}>
        <WhatWeDo />
      </div>
      <div ref={smartReportRef}>
        <UploadOptions />
      </div>
      <div ref={aboutRef}>
        <About />
      </div>
      <Footer />
    </div>
  );
}

export default App;
