import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.css';
import LearnoQubeLogo from './LearnoQubeLogo';

function Footer() {
  return (
    <footer id="site-footer" className="premium-footer">
      <div className="container">
        <div className="footer-grid">
          
          {/* Column 1: Brand Info */}
          <div className="footer-brand-col">
            <div className="footer-logo-wrap" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <LearnoQubeLogo className="w-8 h-8 shrink-0" />
              <span className="font-bold text-2xl tracking-wide bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                LearnoQube
              </span>
            </div>
            <p className="footer-brand-desc">
              Smart learning platform for Class 6–10 students with Telugu, Hindi, Maths, Science, and AI-powered educational support.
            </p>
            <div className="footer-social-icons">
              <a href="#facebook" className="footer-social-box" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
              <a href="#twitter" className="footer-social-box" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
              <a href="#instagram" className="footer-social-box" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
              <a href="#linkedin" className="footer-social-box" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="footer-links-col">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><a href="/#courses">Courses</a></li>
              <li><a href="/#live-classes">Live Classes</a></li>
              <li><a href="/#quizzes">Quizzes</a></li>
            </ul>
          </div>

          {/* Column 3: Courses Support */}
          <div className="footer-links-col">
            <h4>Courses Support</h4>
            <ul>
              <li><a href="/#courses">Telugu Support</a></li>
              <li><a href="/#courses">Hindi Support</a></li>
              <li><a href="/#courses">Maths & Science</a></li>
              <li><a href="/#materials">Study Materials</a></li>
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div className="footer-contact-col">
            <h4>Contact Info</h4>
            <div className="footer-contact-item">
              <i className="fa-solid fa-envelope"></i>
              <p><b>Email:</b> <a href="mailto:contact@learnoqube.edu">contact@learnoqube.edu</a></p>
            </div>
            <div className="footer-contact-item">
              <i className="fa-solid fa-phone"></i>
              <p><b>Phone:</b> <a href="tel:+91XXXXXXXXXX">+91 XXXXXXXXXX</a></p>
            </div>
            <div className="footer-contact-item">
              <i className="fa-solid fa-location-dot"></i>
              <p><b>Address:</b> Hyderabad, Telangana, India</p>
            </div>
          </div>

        </div>

        {/* Footer Bottom Bar */}
        <div className="footer-bottom-bar">
          <p className="mb-0">&copy; {new Date().getFullYear()} LearnoQube Learning Platform. All rights reserved.</p>
          <p className="mb-0">
            Designed with <i className="fa-solid fa-heart footer-heart"></i> for standard school excellence.
          </p>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
