import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaFileDownload, FaTrash, FaEye } from 'react-icons/fa';
import './KnowYourPrescription.css';

const KnowYourPrescription = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:2000/get-prescriptions'); // Adjust URL as needed
      setPrescriptions(response.data);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (prescriptionId) => {
    // Implement view details functionality
    console.log('Viewing details for prescription:', prescriptionId);
  };

  const handleDownload = (prescriptionId) => {
    // Implement download functionality
    console.log('Downloading prescription:', prescriptionId);
  };

  const handleDelete = async (prescriptionId) => {
    // Implement delete functionality
    try {
      await axios.delete(`http://localhost:2000/delete-prescription/${prescriptionId}`); // Adjust URL as needed
      setPrescriptions(prescriptions.filter(prescription => prescription.id !== prescriptionId));
    } catch (error) {
      console.error('Error deleting prescription:', error);
    }
  };

  return (
    <div className="prescription-container">
      <h2>Know Your Prescriptions</h2>
      {loading ? (
        <div className="loading-spinner">Loading...</div>
      ) : (
        <div className="prescription-list">
          {prescriptions.map((prescription) => (
            <div key={prescription.id} className="prescription-item">
              <div className="prescription-info">
                <h3>{prescription.name}</h3>
                <p>{prescription.date}</p>
                <p>{prescription.doctor}</p>
              </div>
              <div className="prescription-actions">
                <button onClick={() => handleViewDetails(prescription.id)}>
                  <FaEye /> View
                </button>
                <button onClick={() => handleDownload(prescription.id)}>
                  <FaFileDownload /> Download
                </button>
                <button onClick={() => handleDelete(prescription.id)}>
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default KnowYourPrescription;
