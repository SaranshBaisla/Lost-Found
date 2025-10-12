// src/components/Footer.js
import React from "react";
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer text-light py-4 mt-5">
      <div className="container text-center f-info">
        <p className="mb-1">
          &copy; {new Date().getFullYear()} <strong>Lost & Found</strong>. All rights reserved.
        </p>

        {/* Links */}
        <div className="mb-2">
          <a href="/about" className="footer-link mx-2">About</a> |
          <a href="/contact" className="footer-link mx-2">Contact</a> |
          <a href="/privacy" className="footer-link mx-2">Privacy Policy</a>
        </div>

        {/* Social Media Icons */}
        <div className="social-icons">
          <a href="https://facebook.com" target="_blank" rel="noreferrer" className="social-link">
            <i className="bi bi-facebook"></i>
          </a>
          <a href="https://twitter.com" target="_blank" rel="noreferrer" className="social-link">
            <i className="bi bi-twitter"></i>
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="social-link">
            <i className="bi bi-linkedin"></i>
          </a>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="social-link">
            <i className="bi bi-github"></i>
          </a>
        </div>
      </div>
    </footer>
  );
}
