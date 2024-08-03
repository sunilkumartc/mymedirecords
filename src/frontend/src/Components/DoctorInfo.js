import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit } from 'react-icons/fa';
import '../Styles/DoctorInfo.css';
import Header from '../Header';

const DoctorInfo = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRecord, setTotalRecord] = useState(0);
  const [searchAdName, setSearchAdName] = useState('');
  const [searchAdEmail, setSearchAdEmail] = useState('');
  const [searchByAdType, setSearchByAdType] = useState('');
  const [numRecordPerPage, setNumRecordPerPage] = useState(10);
  const [start, setStart] = useState(0);

  useEffect(() => {
    fetchDoctors();
  }, [numRecordPerPage, start, searchAdName, searchAdEmail, searchByAdType]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/get-doctors', {
        searchAdName,
        searchAdEmail,
        searchByAdType,
        numRecordPerPage,
        start,
      });
      setDoctors(response.data.doctors);
      setTotalRecord(response.data.total);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
    // Handle edit logic
    console.log('Editing doctor with ID:', id);
  };

  const handlePageChange = (pageNumber) => {
    setStart((pageNumber - 1) * numRecordPerPage);
  };

  const resetFilters = () => {
    setSearchAdName('');
    setSearchAdEmail('');
    setSearchByAdType('');
    setStart(0);
    fetchDoctors();
  };

  return (
    <div className="content-wrapper">
      <div className="content-header">
        <div className="container-fluid">
            <div className="col-sm-12 text-center"> {/* Updated to center align */}
              <h1 className="m-0">Doctor Information</h1>
            </div>
        </div>
      </div>
      <section className="content">
        <div className="container-fluid">
          <div className="card">
            <div className="card-header pb-0">
              <form>
                <div className="row">
                  <div className="col-md-3">
                    <div className="form-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Doctor Name"
                        value={searchAdName}
                        onChange={(e) => setSearchAdName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Doctor Email"
                        value={searchAdEmail}
                        onChange={(e) => setSearchAdEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <select
                        className="form-control"
                        value={searchByAdType}
                        onChange={(e) => setSearchByAdType(e.target.value)}
                      >
                        <option value="">Status</option>
                        <option value="1">Active</option>
                        <option value="0">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <button type="button" className="btn btn-primary" onClick={fetchDoctors}>Search</button>
                    <button type="button" className="btn btn-secondary" onClick={resetFilters}>Reset</button>
                  </div>
                </div>
              </form>
              <div className="row">
                <div className="col-md-6">
                  <p>Total <b>{totalRecord}</b> Record(s) Found.</p>
                </div>
              </div>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="loading-spinner">Loading...</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Doctor Name</th>
                        <th>Doctor Email</th>
                        <th>Phone Number</th>
                        <th>Status</th>
                        <th>Created DateTime</th>
                        <th style={{ textAlign: 'center' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {doctors.map((doctor, index) => (
                        <tr key={doctor.id}>
                          <td>{index + 1 + start}</td>
                          <td>{doctor.adminname}</td>
                          <td>{doctor.adminemail}</td>
                          <td>{doctor.mobile}</td>
                          <td className={doctor.status === 1 ? 'status-active flash' : 'status-inactive dark-flash'}>
                            {doctor.status === 1 ? 'Active' : 'Inactive'}
                          </td>
                          <td>{new Date(doctor.createdat).toLocaleString()}</td>
                          <td style={{ textAlign: 'center' }}>
                            <button type="button" className="btn btn-default" onClick={() => handleEdit(doctor.id)}>
                              <FaEdit />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="card-footer">
              <div className="row">
                <div className="col-md-2 col-lg-2 pt-2">
                  <div className="form-group">
                    <select
                      className="form-control"
                      value={numRecordPerPage}
                      onChange={(e) => setNumRecordPerPage(e.target.value)}
                    >
                      {[8, 10, 25, 50, 100, 200].map((num) => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="col-md-10 col-lg-10 pt-2">
                  <div className="dataTables_paginate paging_simple_numbers table-responsive">
                    <ul className="pagination">
                      {Array.from({ length: Math.ceil(totalRecord / numRecordPerPage) }, (_, i) => (
                        <li
                          key={i}
                          className={`page-item ${start / numRecordPerPage === i ? 'active' : ''}`}
                        >
                          <button className="page-link" onClick={() => handlePageChange(i + 1)}>
                            {i + 1}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Header />
    </div>
  );
};

export default DoctorInfo;
