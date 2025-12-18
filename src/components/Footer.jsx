import React from 'react';
import { translations } from '../translations';
import './Footer.css';

const Footer = ({ language }) => {
  const t = translations[language].footer;
  return (
    <footer className="footer">
      <div className="footer-content">
        <p className="footer-text">
          {t.copyright}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
