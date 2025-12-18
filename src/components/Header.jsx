import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { translations } from '../translations';
import './Header.css';

const Header = ({ language, setLanguage }) => {
  const headerRef = useRef(null);
  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const decorationRef = useRef(null);

  const t = translations[language].header;

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Set initial state
      gsap.set(".left-content > *", { opacity: 0, y: 50 });
      gsap.set(".nav-card", { opacity: 0, x: 50 });
      gsap.set(".nav-title", { opacity: 0, y: 30 });

      // Left panel text animation
      gsap.to(".left-content > *", {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out"
      });

      // Right panel title animation
      gsap.to(".nav-title", {
        y: 0,
        opacity: 1,
        duration: 1,
        delay: 0.2,
        ease: "power3.out"
      });

      // Right panel cards animation
      gsap.to(".nav-card", {
        x: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.2,
        delay: 0.4,
        ease: "power3.out"
      });

      // Floating animation for decoration elements
      gsap.to(".floating-star", {
        y: -10,
        rotation: 360,
        duration: 4,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        stagger: {
          each: 0.5,
          from: "random"
        }
      });

      // Blob morphing animations
      gsap.to(".blob", {
        scale: 1.2,
        duration: 8,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        stagger: {
          each: 2,
          from: "random"
        }
      });

      gsap.to(".blob-1", {
        x: 50,
        y: 30,
        duration: 10,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut"
      });

      gsap.to(".blob-2", {
        x: -30,
        y: 40,
        duration: 12,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut"
      });

      gsap.to(".blob-3", {
        x: 40,
        y: -20,
        duration: 14,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut"
      });

      // Particle floating
      gsap.utils.toArray(".particle").forEach((particle, i) => {
        gsap.to(particle, {
          y: -30 - (i * 5),
          x: Math.random() * 40 - 20,
          opacity: 0.8,
          duration: 3 + (i * 0.2),
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
          delay: i * 0.1
        });
      });

    }, headerRef);

    return () => ctx.revert();
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      console.warn(`Section with id '${id}' not found`);
    }
  };

  return (
    <header className="header" ref={headerRef}>
      {/* Language Toggle */}
      <div className="language-toggle">
        <svg className="globe-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor" strokeWidth="2" />
        </svg>
        <button
          className={`lang-btn ${language === 'ko' ? 'active' : ''}`}
          onClick={() => setLanguage('ko')}
        >
          ko
        </button>
        <span className="lang-divider">|</span>
        <button
          className={`lang-btn ${language === 'en' ? 'active' : ''}`}
          onClick={() => setLanguage('en')}
        >
          en
        </button>
      </div>

      <div className="header-container">
        {/* Left Section */}
        <div className="left-section" ref={leftRef}>
          <div className="left-content">
            <h1 className="main-title">{t.welcome} <span className="highlight">{t.name}</span></h1>
            <h2 className="sub-title">{t.subtitle}</h2>
            <p className="description">
              {t.description1}
            </p>
            <p className="description-bold">
              {t.description2}<br />
              {t.description3}
            </p>
          </div>

          {/* Animated Decoration Area */}
          <div className="decoration-area" ref={decorationRef}>
            {/* Gradient Blobs */}
            <div className="blob blob-1"></div>
            <div className="blob blob-2"></div>
            <div className="blob blob-3"></div>

            {/* Floating Particles */}
            {[...Array(25)].map((_, i) => (
              <div key={i} className={`particle particle-${i + 1}`}></div>
            ))}

            {/* Minimal Stars */}
            <svg className="floating-element floating-star star-1" viewBox="0 0 24 24" width="25" height="25">
              <path fill="#a78bfa" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <svg className="floating-element floating-star star-2" viewBox="0 0 24 24" width="15" height="15">
              <path fill="#c4b5fd" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <svg className="floating-element floating-star star-3" viewBox="0 0 24 24" width="20" height="20">
              <path fill="#8b5cf6" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
        </div>

        {/* Right Section */}
        <div className="right-section" ref={rightRef}>
          <h3 className="nav-title">{t.navTitle}</h3>
          <div className="nav-cards">
            <div className="nav-card" onClick={() => scrollToSection('calendar')}>
              <div className="card-number">01</div>
              <div className="card-content">
                <h4>{t.calendar.title}</h4>
                <p>{t.calendar.desc}</p>
              </div>
              <div className="card-arrow">→</div>
            </div>

            <div className="nav-card" onClick={() => scrollToSection('analysis')}>
              <div className="card-number">02</div>
              <div className="card-content">
                <h4>{t.analysis.title}</h4>
                <p>{t.analysis.desc}</p>
              </div>
              <div className="card-arrow">→</div>
            </div>

            <div className="nav-card" onClick={() => scrollToSection('ai-insights')}>
              <div className="card-number">03</div>
              <div className="card-content">
                <h4>{t.insights.title}</h4>
                <p>{t.insights.desc}</p>
              </div>
              <div className="card-arrow">→</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
