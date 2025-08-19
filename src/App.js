import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, NavLink } from 'react-router-dom';
import HomePage from './components/HomePage';
import ChatPage from './components/ChatPage';
import DocumentsPage from './components/DocumentsPage';
import LegalAidPage from './components/LegalAidPage';
import DashboardPage from './components/ActivityPage';
import BlogPage from './components/BlogPage';
import BlogPostPage from './components/BlogPostPage';
import AuthorPage from './components/AuthorPage';

// --- Main App Component ---
const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    const handleScroll = () => {
      if (window.scrollY > 50) {
        document.body.classList.add('scrolled');
      } else {
        document.body.classList.remove('scrolled');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className="app">
      <header className="navbar">
        <div className="nav-container">
          <Link to="/" onClick={closeMenu} className="logo">
            Lawdekho
          </Link>

          <nav className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
            <ul>
              <li><NavLink to="/" onClick={closeMenu}>Home</NavLink></li>
              <li><NavLink to="/chat" onClick={closeMenu}>AI Chat</NavLink></li>
              <li><NavLink to="/documents" onClick={closeMenu}>Documents</NavLink></li>
              <li><NavLink to="/legalaid" onClick={closeMenu}>Legal Aid</NavLink></li>
              <li><NavLink to="/activity" onClick={closeMenu}>Recent Activity</NavLink></li>
              <li><NavLink to="/blog" onClick={closeMenu}>Blog</NavLink></li>
            </ul>
          </nav>
          
          <div className="nav-right">
             <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
                {theme === 'light' ? <i className="fas fa-moon"></i> : <i className="fas fa-sun"></i>}
             </button>
             <button className="hamburger" onClick={toggleMenu} aria-label="Toggle navigation">
                <i className={isMenuOpen ? 'fas fa-times' : 'fas fa-bars'}></i>
             </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/legalaid" element={<LegalAidPage />} />
          <Route path="/activity" element={<DashboardPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:id" element={<BlogPostPage />} />
          <Route path="/author/:id" element={<AuthorPage />} />
        </Routes>
      </main>

      <footer className="footer">
        <div className="footer-content">
            <div className="footer-section">
                <h4>Lawdekho</h4>
                <p>Empowering every Indian with accessible and understandable legal assistance through the power of AI.</p>
            </div>
            <div className="footer-section">
                <h4>Quick Links</h4>
                <ul>
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/chat">AI Chat</Link></li>
                    <li><Link to="/documents">Documents</Link></li>
                    <li><Link to="/legalaid">Legal Aid Finder</Link></li>
                    <li><Link to="/blog">Blog</Link></li>
                </ul>
            </div>
            <div className="footer-section">
                <h4>Contact Us</h4>
                <div className="footer-contact">
                    <p><i className="fas fa-map-marker-alt"></i> New Delhi, India</p>
                    <p><i className="fas fa-envelope"></i> help@lawdekhoo.com</p>
                </div>
                <div className="footer-socials">
                    <a href="#" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
                    <a href="#" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
                    <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
                </div>
            </div>
            <div className="footer-disclaimer">
                <h4><i className="fas fa-exclamation-triangle"></i> Disclaimer</h4>
                <p>Lawdekho is an AI-powered platform for informational purposes only. It is not a law firm and does not provide legal advice. Please consult a qualified lawyer for any legal issues.</p>
            </div>
        </div>
        <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} Lawdekho. Made with <i className="fas fa-heart"></i> for a just India.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
