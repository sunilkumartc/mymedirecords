import React, { useState, useEffect } from 'react';
import axiosInstance from './axiosInstance'; // Assuming axiosInstance handles token management
import { FaUpload, FaTrash, FaEye } from 'react-icons/fa';
import 'react-datepicker/dist/react-datepicker.css';
import { addDays } from 'date-fns';
import Modal from 'react-modal';
import './UploadReports.css';

Modal.setAppElement('#root');

const UploadPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dateRange] = useState([new Date(), addDays(new Date(), 7)]);
  const [loading, setLoading] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const loggedInUser = 'Logged User'; // Replace with actual logged-in user info

  useEffect(() => {
    fetchPrescriptions();
  }, [dateRange]);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.post('/get-prescriptions', { dateRange });
      setPrescriptions(response.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Error fetching prescriptions:', error);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('patientName', loggedInUser);
    formData.append('dateRange', JSON.stringify(dateRange));
    formData.append('uploadedAt', new Date().toISOString()); // Add the current date and time

    setLoading(true);

    try {
      const response = await axiosInstance.post('/upload-prescription', formData);
      setPrescriptions([...prescriptions, response.data]);
      setLoading(false);
      setSelectedFile(null);
    } catch (error) {
      setLoading(false);
      console.error('Upload failed:', error);
    }
  };

  

  const handleDeletePrescription = async (prescriptionId) => {
    try {
      await axiosInstance.delete(`/delete-prescription/${prescriptionId}`);
      const updatedPrescriptions = prescriptions.filter(prescription => prescription._id !== prescriptionId);
      setPrescriptions(updatedPrescriptions);
    } catch (error) {
      console.error('Error deleting prescription:', error);
    }
  };

  const handleViewPrescription = (prescription) => {
    setSelectedPrescription(prescription);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedPrescription(null);
  };

  return (
    <div className="upload-prescriptions-container">
      <div className="upload-prescriptions-header">
        <h2>Uploaded Prescriptions</h2>
      
        <button className="upload-button" onClick={() => document.getElementById('file-upload').click()}>
          <FaUpload /> Upload Prescription
        </button>
        <input id="file-upload" type="file" onChange={handleFileChange} style={{ display: 'none' }} />
        {selectedFile && (
          <button onClick={handleUpload} className="upload-confirm-button">
            {loading ? 'Uploading...' : 'Upload'}
          </button>
        )}
      </div>
      <div className="table-responsive">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>ID</th>
              <th>Prescription Name</th>
              <th>Uploaded At</th>
              <th>Doctor Name</th>
              <th>Patient Name</th>
              <th className="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {prescriptions.map((prescription, index) => (
              <tr key={index}>
                <td>{prescription._id}</td>
                <td>{prescription.fileName}</td>
                <td>{new Date(prescription.uploadedAt).toLocaleDateString()}</td> {/* Display the uploaded date */}
                <td>{prescription.doctorName}</td>
                <td>{prescription.patientName}</td>
                <td className="text-center">
                  <button className="action-button" onClick={() => handleDeletePrescription(prescription._id)}>
                    <FaTrash /> Delete
                  </button>
                  <button className="action-button" onClick={() => handleViewPrescription(prescription)}>
                    <FaEye /> View
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
        contentLabel="View Prescription"
        className="modal"
        overlayClassName="modal-overlay"
      >
        <h2>Prescription Details</h2>
        {selectedPrescription && (
          <div>
            <p><strong>ID:</strong> {selectedPrescription._id}</p>
            <p><strong>Prescription Name:</strong> {selectedPrescription.fileName}</p>
            <p><strong>Uploaded At:</strong> {new Date(selectedPrescription.uploadedAt).toLocaleDateString()}</p>
            <p><strong>Doctor Name:</strong> {selectedPrescription.doctorName}</p>
            <p><strong>Patient Name:</strong> {selectedPrescription.patientName}</p>
            <p><strong>Prescription Content:</strong></p>
            <iframe src={selectedPrescription.fileUrl} title="Prescription Content" style={{ width: '100%', height: '400px' }} />
          </div>
        )}
        <button onClick={closeModal} className="close-modal-button">Close</button>
      </Modal>
    </div>
  );
};

export default UploadPrescriptions;
