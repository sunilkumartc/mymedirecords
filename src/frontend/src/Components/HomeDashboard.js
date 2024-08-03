import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { FaUser, FaHome, FaChartBar, FaFileUpload, FaSignOutAlt, FaBars, FaAngleDown, FaPrescriptionBottle, FaMapMarkerAlt, FaTrash } from 'react-icons/fa';
import '../Styles/HomeDashboard.css';
import HomePage from './DashbordCompo/HomePage';
import Profile from './DashbordCompo/Profile';
import UploadPrescription from './DashbordCompo/UploadPrescription';
import UploadReports from './DashbordCompo/UploadReports';
import DetailedReport from './DashbordCompo/DetailedReport';
import KnowYourPrescription from './DashbordCompo/KnowYourPrescription';
import logo from "../Styles/images/logo.png";

const HomeDashboard = () => {
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

  // Function to toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Function to toggle expanded menu
  const toggleMenu = (menu) => {
    setExpandedMenu(expandedMenu === menu ? '' : menu);
  };

  // Function to handle section change
  const handleSectionChange = (section) => {
    setActiveSection(section);
    setActiveSubSection('');
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  // Function to handle sub-section change
  const handleSubSectionChange = (subSection) => {
    setActiveSubSection(subSection);
    setActiveSection('');
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
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
                <span>Upload Reports</span>
              </a>
              <a className={`sidebar-menu-item ${activeSubSection === 'DetailedReport' ? 'active' : ''}`} onClick={() => handleSubSectionChange('DetailedReport')}>
                <FaChartBar />
                <span>Know Your Reports</span>
              </a>
            </div>
          )}
          <a className={`sidebar-menu-item ${expandedMenu === 'knowPrescription' ? 'active' : ''}`} onClick={() => toggleMenu('knowPrescription')}>
            <FaPrescriptionBottle />
            <span>Prescription</span>
            <FaAngleDown />
          </a>
          {expandedMenu === 'knowPrescription' && (
            <div className="submenu">
              <a className={`sidebar-menu-item ${activeSubSection === 'uploadPrescription' ? 'active' : ''}`} onClick={() => handleSubSectionChange('uploadPrescription')}>
                <FaFileUpload />
                <span>Upload Prescription</span>
              </a>
              <a className={`sidebar-menu-item ${activeSubSection === 'KnowYourPrescription' ? 'active' : ''}`} onClick={() => handleSubSectionChange('KnowYourPrescription')}>
                <FaUser />
                <span>Know Your Prescription</span>
              </a>
            </div>
          )}
          <a className={`sidebar-menu-item ${activeSection === 'trash' ? 'active' : ''}`} onClick={() => handleSectionChange('trash')}>
            <FaTrash />
            <span>Trash</span>
          </a>
          <a className="sidebar-menu-item" onClick={logout}>
            <FaSignOutAlt />
            <span>Log out</span>
          </a>
          <a className="sidebar-menu-item" onClick={() => alert('Implement Find Diagnosis Near Me functionality')}>
            <FaMapMarkerAlt />
            <span>Find Diagnosis Near Me</span>
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
              {activeSection === 'profile' && <Profile user={user}  user_type={user.user_type}/>}
              {activeSubSection === 'uploadReports' && <UploadReports user_id={user.user_id} phone={user.phone} />}
              {activeSubSection === 'DetailedReport' && <DetailedReport user_id={user.user_id} />}
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

export default HomeDashboard;
