import React, { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import styles from "./NavigatePage.module.css";
import { useNavigate } from 'react-router-dom';

const NavigatePage = () => {
  const navigate = useNavigate();
  const [applicationExists, setApplicationExists] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const storedPersonId = localStorage.getItem("personId");
    const personId = storedPersonId ? JSON.parse(storedPersonId) : null;

    if (personId) {
      fetch(`http://localhost:5265/api/Application/CheckExists/${personId}`)
        .then(res => res.json())
        .then(exists => setApplicationExists(exists))
        .catch(() => setApplicationExists(false));
    }
  }, []);

  const downloadId = async () => {
    if (isDownloading) return; // Prevent multiple simultaneous downloads
    
    try {
      setIsDownloading(true);
      const storedPersonId = localStorage.getItem("personId");
      const personId = storedPersonId ? JSON.parse(storedPersonId) : null;
      
      if (!personId) {
        alert('No person ID found. Please log in again.');
        return;
      }

      console.log('Starting download for person ID:', personId);
      
      const response = await fetch(`http://localhost:5265/api/ID/Generate/${personId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      
      // Check if the blob is actually a PDF
      if (blob.type !== 'application/pdf' && !blob.type.includes('pdf')) {
        console.warn('Response may not be a PDF file. Type:', blob.type);
      }
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `ID_${personId}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Append to body, click, and cleanup
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
      
      console.log('Download initiated successfully');
      
    } catch (error) {
      console.error('Error downloading ID:', error);
      alert('Failed to download ID. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('personId');
    localStorage.removeItem('currentUserEmail');
    navigate('/');
  };

  // Handle click on Generate ID link
  const handleGenerateClick = (e) => {
    e.preventDefault(); // Always prevent default navigation
    
    if (!applicationExists) {
      alert('You must submit an application first before generating an ID.');
      return;
    }
    
    if (isDownloading) {
      alert('Download already in progress. Please wait.');
      return;
    }
    
    downloadId();
  };

  // Handle Generate ID button click
  const handleGenerateButtonClick = () => {
    if (!applicationExists) {
      alert('You must submit an application first before generating an ID.');
      return;
    }
    
    if (isDownloading) {
      alert('Download already in progress. Please wait.');
      return;
    }
    
    downloadId();
  };

  return (
    <div className={styles.container}>
      {/* Top Navbar */}
      <nav className={styles.navbar}>
        <i className='bx bx-menu'></i>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <a href="#" className={styles.notif}>
            <i className='bx bx-bell'></i>
          </a>
          <button
            className={styles.signOutButton}
            onClick={handleSignOut}
          >
            <i className='bx bx-log-out-circle'></i> Sign Out
          </button>
        </div>
      </nav>

      <main className={styles.main}>
        {/* Welcome Section */}
        <div className={styles.welcomeSection}>
          <div className={styles.welcomeContent}>
            <h1>Welcome to Your Virtual ID Dashboard</h1>
            <p>Manage your digital identity securely and efficiently.</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={styles.quickActions}>
          <NavLink to="/apply" className={styles.quickActionBtn}>
            <i className='bx bx-plus'></i> Apply for ID
          </NavLink>
          <button
            className={`${styles.quickActionBtn} ${!applicationExists ? styles.disabled : ''} ${isDownloading ? styles.loading : ''}`}
            onClick={handleGenerateButtonClick}
            disabled={!applicationExists || isDownloading}
            title={
              !applicationExists 
                ? "You must apply first before generating an ID"
                : isDownloading 
                  ? "Download in progress..."
                  : "Download your ID"
            }
          >
            <i className={`bx ${isDownloading ? 'bx-loader-alt bx-spin' : 'bx-download'}`}></i>
            {isDownloading ? 'Downloading...' : 'Generate ID'}
          </button>
          <NavLink to="/dashboard" className={styles.quickActionBtn}>
            <i className='bx bx-user'></i> View Profile
          </NavLink>
        </div>

        {/* Description Section */}
        <div className={styles.virtualIDDescription}>
          <h2>What is the Virtual ID System?</h2>
          <p>
            The Virtual ID System allows users to apply for, manage, and generate a secure digital ID.
            It provides a streamlined process for identity verification, application submission,
            and instant generation of downloadable IDs. This system ensures data privacy, security,
            and ease of access to personal identification documents online.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className={styles.dashboardGrid}>
          <NavLink to="/apply" className={styles.dashboardCard}>
            <i className='bx bx-plus card-icon'></i>
            <h3>Apply for ID</h3>
            <p>Submit your personal information and begin the ID creation process.</p>
          </NavLink>
          <NavLink
            to="#"
            className={`${styles.dashboardCard} ${!applicationExists ? styles.disabledCard : ''}`}
            onClick={handleGenerateClick}
            aria-disabled={!applicationExists}
            title={applicationExists ? "" : "You must submit an application first/you have already generated your ID."}
          >
            <i className='bx bx-download card-icon'></i>
            <h3>Generate ID</h3>
            <p>
              {!applicationExists
                ? "You must submit an application first/you have already generated your ID."
                : "Download your verified digital ID once your application is approved."}
            </p>
          </NavLink>
          <NavLink to="/dashboard" className={styles.dashboardCard}>
            <i className='bx bx-user card-icon'></i>
            <h3>View Profile</h3>
            <p>Review and update your personal details used in the ID application.</p>
          </NavLink>
        </div>

        {/* Nested Routes */}
        <Outlet />
      </main>
    </div>
  );
};

export default NavigatePage;