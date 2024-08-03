import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { FaUser, FaHome, FaChartBar, FaFileUpload, FaSignOutAlt, FaBars, FaAngleDown, FaPrescriptionBottle, FaMapMarkerAlt, FaTrash } from 'react-icons/fa';
import '../Styles/HomeDashboard.css';
import HomePage from './DoctorCompo/DoctorHomePage';
import UploadPrescription from './DashbordCompo/UploadPrescription';
import UploadReports from './DoctorCompo/UploadReports';
import Profile from './DashbordCompo/Profile';
import DetailedReport from './DashbordCompo/DetailedReport';
import logo from "../Styles/images/logo.png";
import KnowYourPrescription from './DashbordCompo/KnowYourPrescription';

const DoctorDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState({});
  const [loading] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [activeSubSection, setActiveSubSection] = useState('');
  const [expandedMenu, setExpandedMenu] = useState('');
  const navigate = useNavigate();

  
  useEffect(() => {
    // Load user information from localStorage
    const user_id = localStorage.getItem('user_id');
    const email = localStorage.getItem('email');
    const phone = localStorage.getItem('phone');
    const username = localStorage.getItem('username');
    const user_type = localStorage.getItem('user_type');
    
    setUser({ user_id, email, phone, username, user_type });
  }, []);

  // Function to handle logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('phone');
    localStorage.removeItem('username');
    localStorage.removeItem('user_type');
    navigate('/login');
  };


  
  const handleSectionChange = (section) => {
    setActiveSection(section);
    setActiveSubSection('');
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const handleSubSectionChange = (subSection) => {
    setActiveSubSection(subSection);
    setActiveSection('');
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleMenu = (menu) => {
    setExpandedMenu(expandedMenu === menu ? '' : menu);
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header logo1">
        <Link to="/" className="logo-link1">
        <img src={logo} alt="Logo" className="logo-image1" />
          </Link>
        </div>
        <div className="sidebar-menu">
          <a className={`sidebar-menu-item ${activeSection === 'overview' ? 'active' : ''}`} onClick={() => handleSectionChange('overview')}>
            <FaHome />
            <span>Overview</span>
          </a>
          <a className={`sidebar-menu-item ${expandedMenu === 'knowYourReports' ? 'active' : ''}`} onClick={() => toggleMenu('knowYourReports')}>
            <FaChartBar />
            <span>Reports</span>
            <FaAngleDown />
          </a>
          {expandedMenu === 'knowYourReports' && (
            <div className="submenu">
              <a className={`sidebar-menu-item ${activeSubSection === 'uploadReports' ? 'active' : ''}`} onClick={() => handleSubSectionChange('uploadReports')}>
                <FaFileUpload />
                <span>Reports</span>
              </a>
              <a className={`sidebar-menu-item ${activeSubSection === 'DetailedReport' ? 'active' : ''}`} onClick={() => handleSubSectionChange('DetailedReport')}>
                <FaChartBar />
                <span>Analyze Reports</span>
              </a>
            </div>
          )}
          <a className={`sidebar-menu-item ${expandedMenu === 'knowPrescription' ? 'active' : ''}`} onClick={() => toggleMenu('knowPrescription')}>
            <FaPrescriptionBottle />
            <span>Prescription</span>
            
          </a>
          <a className={`sidebar-menu-item ${activeSection === 'trash' ? 'active' : ''}`} onClick={() => handleSectionChange('trash')}>
            <FaTrash />
            <span>Trash</span>
          </a>
          <a className="sidebar-menu-item" onClick={() => {
            localStorage.removeItem('token');
            navigate('/login');
          }}>
            <FaSignOutAlt />
            <span>Log out</span>
          </a>
          
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="top-bar">
          <button className="menu-button" onClick={toggleSidebar}>
            <FaBars />
          </button>
          <div className="profile-icon">
            <a onClick={() => handleSectionChange('profile')}><FaUser /></a>
          </div>
        </div>
        <div className="content">
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading...</p>
            </div>
          ) : (
            <>
              {activeSection === 'overview' && <HomePage />}
              {activeSection === 'profile' && <Profile user={user} />}
              {activeSubSection === 'uploadReports' && <UploadReports user_id={user.user_id} phone={user.phone} />}
              {activeSubSection === 'DetailedReport' && <DetailedReport />}
              {activeSubSection === 'uploadPrescription' && <UploadPrescription />}
              {activeSubSection === 'KnowYourPrescription' && <KnowYourPrescription />}
              {activeSection === 'trash' && <div>Trash Section</div>}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
