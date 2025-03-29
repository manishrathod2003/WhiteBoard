import React from 'react';
import './LandingPage.css'
import { Navigate } from 'react-router-dom';
import { SignInButton, useAuth } from '@clerk/clerk-react'

const LandingPage = () => {

  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="collabboard-landing">
      <header className="collabboard-header">
        <div className="collabboard-logo">CollabBoard</div>
        <nav className="collabboard-navigation">
          <a href="#features" className="nav-link">Features</a>
          <a href="#pricing" className="nav-link">Pricing</a>
          <a href="#contact" className="nav-link">Contact</a>
          <SignInButton>
            <button className="btn login-btn">Login</button>
          </SignInButton>
        </nav>
      </header>

      <main className="collabboard-hero">
        <div className="hero-content">
          <h1 className="hero-title">Collaborate in Real-Time</h1>
          <h2 className="hero-subtitle">Unleash Creativity with CollabBoard</h2>
          <p className="hero-description">
            The ultimate online whiteboard for teams, students,
            and creative professionals. Brainstorm, design,
            and innovate together – seamlessly.
          </p>
          <div className="cta-buttons">
            <button className="btn primary-btn">Get Started</button>
            <button className="btn secondary-btn">Watch Demo</button>
          </div>
        </div>
        <div className="hero-image">
          {/* Placeholder for whiteboard illustration */}
          <div className="whiteboard-placeholder"></div>
        </div>
      </main>

      <section id="features" className="collabboard-features">
        <h2 className="features-title">Why Choose CollabBoard?</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <h3 className="feature-title">Real-Time Collaboration</h3>
            <p className="feature-description">
              Multiple users can work on the same board simultaneously.
            </p>
          </div>
          <div className="feature-card">
            <h3 className="feature-title">Infinite Canvas</h3>
            <p className="feature-description">
              No limits to your creativity with our expansive workspace.
            </p>
          </div>
          <div className="feature-card">
            <h3 className="feature-title">Rich Tools</h3>
            <p className="feature-description">
              Draw, type, import images, and use advanced drawing tools.
            </p>
          </div>
          <div className="feature-card">
            <h3 className="feature-title">Easy Sharing</h3>
            <p className="feature-description">
              Invite team members with a single click.
            </p>
          </div>
        </div>
      </section>

      <footer className="collabboard-footer">
        <div className="footer-content">
          <div className="footer-logo">CollabBoard</div>
          <div className="footer-links">
            <a href="#privacy" className="footer-link">Privacy Policy</a>
            <a href="#terms" className="footer-link">Terms of Service</a>
            <a href="#contact" className="footer-link">Contact Us</a>
          </div>
          <div className="social-icons">
            {/* Placeholder for social media icons */}
          </div>
        </div>
        <div className="copyright">
          © 2024 CollabBoard. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
