import React, { useState, useEffect, useRef } from 'react';
import { FaUpload, FaTrash, FaEye, FaDownload,FaArrowUp, FaArrowDown, FaThumbsUp } from 'react-icons/fa';
import Modal from 'react-modal';
import axios from 'axios';
import './UploadReports.css';

Modal.setAppElement('#root');

const UploadReports = ({ phone, user_id }) => {
  const [reports, setReports] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filename, setReportName] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportDetails, setReportDetails] = useState(null);
  const [reportType, setReportType] = useState('Medical Report');
  const [errorMessage, setErrorMessage] = useState('');
  const [processingReports, setProcessingReports] = useState([]);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const tableRef = useRef(null);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const fetchReports = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/app2/report-details/?patient_id=${user_id}`);
      const sortedReports = response.data.sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at));
      setReports(sortedReports.map(report => ({
        ...report,
        report_name: report.report_name || 'Processing...',
        doctor_name: report.doctor_name || 'Processing...',
        patient_name: report.patient_name || 'Processing...',
        gender: report.gender || 'Processing...',
        age: report.age || 'Processing...'
      })));
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const fetchReportDetails = async (reportId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/app1/testdetails/${reportId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching report details:', error);
      return null;
    }
  };

  const updateReportDetails = async () => {
    const updatedReports = await Promise.all(reports.map(async (report) => {
      if (report.report_name === 'Processing...' || report.doctor_name === 'Processing...' || report.patient_name === 'Processing...' || report.gender === 'Processing...'|| report.age === 'Processing...') {
        const details = await fetchReportDetails(report.report_id);
        if (details) {
          return {
            ...report,
            report_name: details.report_name || report.report_name,
            doctor_name: details.doctor_name || report.doctor_name,
            patient_name: details.patient_name || report.patient_name,
            gender: details.gender || report.gender,
            age: details.age || report.age
          };
        }
      }
      return report;
    }));
    setReports(updatedReports);
  };

  useEffect(() => {
    fetchReports();
    const interval = setInterval(() => {
      fetchReports();
      updateReportDetails();
    }, 30000);
    return () => clearInterval(interval);
  }, [user_id]);

  useEffect(() => {
    if (processingReports.length > 0) {
      const interval = setInterval(() => {
        fetchReports();
        updateReportDetails();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [processingReports]);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setErrorMessage('');
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorMessage('Please select a file to upload.');
      return;
    }

    // if (!filename) {
    //   setErrorMessage('Please enter a report name.');
    //   return;
    // }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('report_type', reportType);
    formData.append('filename', filename);

    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/app1/upload/?phone_number=${phone}`, formData);

      const newReport = {
        report_id: response.data.report_id,
        report_name: 'Processing...',
        uploaded_at: new Date().toISOString(),
        doctor_name: 'Processing...',
        patient_name: 'Processing...',
        gender: 'Processing...',
        age:'Processing...'
      };

      setReports([newReport, ...reports]);
      setProcessingReports([response.data.report_id, ...processingReports]);
      setLoading(false);
      setSelectedFile(null);
      setReportName('');
      setModalIsOpen(false);
    } catch (error) {
      console.error('Error uploading report:', error);
      setLoading(false);
    }
  };

  const handleDeleteReport = async (reportId) => {
    try {
      await axios.delete(`${API_BASE_URL}/app2/delete-report/?report_id=${reportId}`);
      setReports(reports.filter(report => report.report_id !== reportId));
      setShowSuccessPopup(true);
      setTimeout(() => setShowSuccessPopup(false), 3000);
    } catch (error) {
      console.error('Error deleting report:', error);
    }
  };

  const handleViewReport = async (report) => {
    setSelectedReport(report);
    setModalIsOpen(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/app1/testdetails/${report.report_id}`);
      setReportDetails(response.data);
    } catch (error) {
      console.error('Error fetching report details:', error);
    }
  };

  const handleDownloadReport = async (reportId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/app1/download/?report_id=${reportId}`);
  
      if (response.data && response.data.url) {
        window.location.href = response.data.url;
      } else {
        console.error('Invalid download URL:', response.data);
      }
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedReport(null);
    setReportDetails(null);
    setErrorMessage('');
  };

  const handleScroll = (scrollOffset) => {
    if (tableRef.current) {
      tableRef.current.scrollLeft += scrollOffset;
    }
  };

  const sortedReportDetails = reportDetails ? reportDetails.sort((a, b) => {
    const statusOrder = { 'high': 1, 'low': 2, 'normal': 3 };
    return statusOrder[a.status] - statusOrder[b.status];
  }) : [];

  return (
    <div className="upload-reports-container">
      <div className="upload-reports-header">
        <h2>Reports</h2>
        <button className="upload-button" onClick={() => setModalIsOpen(true)}>
          <FaUpload /> Upload Report
        </button>
      </div>

      <div className="table-container">
        <table ref={tableRef} className="table table-bordered">
          <thead>
            <tr>
              <th>ID</th>
              <th>Report Name</th>
              <th>Uploaded At</th>
              <th>Doctor Name</th>
              <th>Patient Name</th>
              <th>Gender</th>
              <th>Age</th>
              <th className="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report, index) => (
              <tr key={index} className={
                (report.report_name === 'Processing...' || report.doctor_name === 'Processing...'  || report.gender === 'Processing...'|| report.age === 'Processing...') ? 'processing-row' : ''
              }>
                <td>{report.report_id}</td>
                <td>{report.report_name === 'Processing...' ? (
                  <div className="processing-animation">Processing...</div>
                ) : report.report_name}</td>
                <td>{new Date(report.uploaded_at).toLocaleDateString()}</td>
                <td>{report.doctor_name === 'Processing...' ? (
                  <div className="processing-animation">Processing...</div>
                ) : report.doctor_name}</td>
                <td>{report.patient_name === 'Processing...' ? (
                  <div className="processing-animation">Processing...</div>
                ) : report.patient_name}</td>
                <td>{report.gender === 'Processing...' ? (
                  <div className="processing-animation">Processing...</div>
                ) : report.gender}</td>
                <td>{report.age === 'Processing...' ? (
                  <div className="processing-animation">Processing...</div>
                ) : report.age}</td>
                <td className="text-center">
                  <button className="action-button view-button" onClick={() => handleViewReport(report)}>
                    <FaEye /> View
                  </button>
                  <button className="action-button download-button" onClick={() => handleDownloadReport(report.report_id)}>
                    <FaDownload /> 
                  </button>
                  <button className="action-button delete-button" onClick={() => handleDeleteReport(report.report_id)}>
                    <FaTrash /> 
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Upload Report"
        className="modal"
        overlayClassName="modal-overlay"
      >
        {selectedReport ? (
          <div>
            <h2>Report Details</h2>
            {reportDetails ? (
              <div className="details-table-container">
                <table className="details-table">
                  <thead>
                    <tr>
                      <th>Test Name</th>
                      <th>Test Value</th>
                      <th>Status</th>
                      <th>Unit</th>
                    </tr>
                  </thead>
                  <tbody>
  {reportDetails.map((detail, index) => (
    <tr key={index}>
      <td>{detail.testname}</td>
      <td>{detail.testvalue}</td>
      <td className={
        detail.status === 'high' ? 'status-high' :
        detail.status === 'low' ? 'status-low' :
        'status-normal'
      }>
        {detail.status.charAt(0).toUpperCase() + detail.status.slice(1)}
        {' '}
        {detail.status === 'high' && <FaArrowUp />}
        {detail.status === 'low' && <FaArrowDown />}
        {detail.status === 'normal' && <FaThumbsUp />}
      </td>
      <td>{detail.unit}</td>
    </tr>
  ))}
</tbody>

                </table>
              </div>
            ) : (
              <p>Loading...</p>
              
            )}
             <div className="modal-buttons">
                
                <button className="close-button" onClick={closeModal}>Close</button>
              </div>
          </div>
        ) : (
          <div>
            <h2>Upload Report</h2>
            <div className="form-group">
              <label htmlFor="reportType">Report Type:</label>
              <select
                id="reportType"
                className="form-control"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="Medical Report">Medical Report</option>
                {/* <option value="Prescription">Prescription</option> */}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="filename">Report Name:</label>
              <input
                type="text"
                id="filename"
                className="form-control"
                value={filename}
                onChange={(e) => setReportName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="fileInput">Select File:</label>
              <input type="file" id="fileInput" className="form-control" onChange={handleFileChange} />
            </div>
            {loading ? (
              <p>Uploading...</p>
            ) : (
              <div className="modal-buttons">
                <button className="upload-button" onClick={handleUpload}>
                  <FaUpload /> Upload
                </button>
                <button className="close-button" onClick={closeModal}>Close</button>
              </div>
            )}
            {errorMessage && <p className="error-message">{errorMessage}</p>}
          </div>
        )}
      </Modal>

      {showSuccessPopup && (
        <div className="success-popup">
          Report deleted successfully!
        </div>
      )}
    </div>
  );
};

export default UploadReports;
