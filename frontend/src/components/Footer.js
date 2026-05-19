import React from 'react';
import '../styles/Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>About SLP</h3>
            <p>Student Learning Platform provides comprehensive educational content for students in Classes 6-10, covering all major subjects with interactive learning resources.</p>
          </div>

          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/services">Services</a></li>
              <li><a href="/login">Login</a></li>
              <li><a href="/register">Register</a></li>
            </ul>
          </div>

        </div>

        <div className="footer-social">
          <h3>Follow Us</h3>
          <div className="social-links">
            <a 
              href="https://www.instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-link instagram"
              title="Instagram"
            >
              <i className="fab fa-instagram"></i>
            </a>
            <a 
              href="https://www.facebook.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-link facebook"
              title="Facebook"
            >
              <i className="fab fa-facebook"></i>
            </a>
            <a 
              href="https://wa.me/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-link whatsapp"
              title="WhatsApp"
            >
              <i className="fab fa-whatsapp"></i>
            </a>
          </div>
          
          <div className="footer-section" style={{ marginTop: '30px' }}>
            <h3>Contact Info</h3>
            <p>Email: contact@slp.edu</p>
            <p>Phone: +91 XXXXXXXXXX</p>
            <p>Address: India</p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2024 Student Learning Platform. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
