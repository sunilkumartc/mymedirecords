import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrash, FaUndo } from 'react-icons/fa';
import './UploadReports.css'; // Create this CSS file for styling as needed

const TrashPage = () => {
  const [trashedReports, setTrashedReports] = useState([]);

  useEffect(() => {
    fetchTrashedReports();
  }, []);

  const fetchTrashedReports = async () => {
    try {
      const response = await axios.get(`http://192.168.29.25:8001/trash-reports`);
      setTrashedReports(response.data);
    } catch (error) {
      console.error('Error fetching trashed reports:', error);
    }
  };

  const handleRestoreReport = async (reportId) => {
    try {
      await axios.put(`http://192.168.29.25:8001/restore-report/?report_id=${reportId}`);
      setTrashedReports(trashedReports.filter(report => report.report_id !== reportId));
    } catch (error) {
      console.error('Error restoring report:', error);
    }
  };

  const handlePermanentlyDelete = async (reportId) => {
    try {
      await axios.delete(`http://192.168.29.25:8001/permanent-delete/?report_id=${reportId}`);
      setTrashedReports(trashedReports.filter(report => report.report_id !== reportId));
    } catch (error) {
      console.error('Error permanently deleting report:', error);
    }
  };

  return (
    <div className="trash-page-container">
      <h2>Trash</h2>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>Report Name</th>
            <th>Uploaded At</th>
            <th>Doctor Name</th>
            <th>Patient Name</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {trashedReports.map((report, index) => (
            <tr key={index}>
              <td>{report.report_id}</td>
              <td>{report.report_name}</td>
              <td>{new Date(report.uploaded_at).toLocaleDateString()}</td>
              <td>{report.doctor_name}</td>
              <td>{report.patient_name}</td>
              <td className="text-center">
                <button className="action-button restore-button" onClick={() => handleRestoreReport(report.report_id)}>
                  <FaUndo /> Restore
                </button>
                <button className="action-button delete-button" onClick={() => handlePermanentlyDelete(report.report_id)}>
                  <FaTrash /> Permanently Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TrashPage;
