import React, { useRef } from 'react';
import '../Styles/UploadOptions.css';

const UploadOptions = () => {
  const smartReportRef = useRef(null);
  const secondOpinionRef = useRef(null);

  return (
    <div className="upload-options">
      <div ref={smartReportRef} className="upload-options__section">
        <div className="upload-options__title font-montserrat">
          <h2><span>Get Smart Report</span></h2>
          <div className="upload-options__underline"></div>
        </div>
        <div className="upload-options__cards">
          <div className="upload-options__card">
            <img src="https://static.vecteezy.com/system/resources/thumbnails/008/302/609/small/eps10-red-upload-icon-or-logo-in-simple-flat-trendy-modern-style-isolated-on-white-background-free-vector.jpg" alt="Upload Icon" className="upload-options__icon" />
            <h2>Upload Reports</h2>
            <p>Through</p><p>Whatsapp(+91 7975812925) or Web</p>
          </div>
          <div className="upload-options__arrow">→</div>
          <div className="upload-options__card">
            <img src="https://cdn1.vectorstock.com/i/1000x1000/39/95/report-analysis-icon-vector-21023995.jpg" alt="Upload Icon" className="upload-options__icon" />
            <h2>Analysis Of Reports</h2>
          </div>
          <div className="upload-options__arrow">→</div>
          <div className="upload-options__card">
            <img src="https://previews.123rf.com/images/tanyastock/tanyastock1701/tanyastock170103109/70487051-share-icon-send-social-media-information-symbol-report-chart-download-and-magnifier-search-signs.jpg" alt="Upload Icon" className="upload-options__icon" />
            <h2>Get Smart Report</h2>
          </div>
        </div>
      </div>
      <div ref={secondOpinionRef} className="upload-options__section">
        <div className="upload-options__title font-montserrat">
          <h2><span>Get Second Opinion</span></h2>
          <div className="upload-options__underline1"></div>
        </div>
        <div className="upload-options__cards">
          <div className="upload-options__card">
            <img src="https://static.vecteezy.com/system/resources/thumbnails/008/302/609/small/eps10-red-upload-icon-or-logo-in-simple-flat-trendy-modern-style-isolated-on-white-background-free-vector.jpg" alt="Upload Icon" className="upload-options__icon" />
            <h2>Upload Reports</h2>
            <p>Through</p><p>Whatsapp(+91 7975812925) or Web</p>
          </div>
          <div className="upload-options__arrow">→</div>
          <div className="upload-options__card">
            <img src="https://cdn1.vectorstock.com/i/1000x1000/39/95/report-analysis-icon-vector-21023995.jpg" alt="Upload Icon" className="upload-options__icon" />
            <h2>Analysis Of Reports</h2>
          </div>
          <div className="upload-options__arrow">→</div>
          <div className="upload-options__card">
            <img src="https://previews.123rf.com/images/tanyastock/tanyastock1701/tanyastock170103109/70487051-share-icon-send-social-media-information-symbol-report-chart-download-and-magnifier-search-signs.jpg" alt="Upload Icon" className="upload-options__icon" />
            <h2>Second Opinion and Suggestion From Doctor</h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadOptions;
