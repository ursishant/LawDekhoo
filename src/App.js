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
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import ProfilePage from './components/ProfilePage';

// --- Main App Component ---
const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [token, setToken] = useState(localStorage.getItem('auth_token'));

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

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('keydown', handleKeyDown);
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

  useEffect(() => {
    const onStorage = () => setToken(localStorage.getItem('auth_token'));
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <div className="app">
      <header className="navbar">
        <div className="nav-container">
          <Link to="/" onClick={closeMenu} className="logo">
            Lawdekho
          </Link>

          <div className={`nav-overlay ${isMenuOpen ? 'show' : ''}`} onClick={closeMenu}></div>
          <nav className={`nav-links ${isMenuOpen ? 'active' : ''}`} aria-hidden={!isMenuOpen}>
            <ul>
              <li><NavLink to="/" onClick={closeMenu}>Home</NavLink></li>
              <li><NavLink to="/chat" onClick={closeMenu}>AI Chat</NavLink></li>
              <li><NavLink to="/documents" onClick={closeMenu}>Documents</NavLink></li>
              <li><NavLink to="/legalaid" onClick={closeMenu}>Legal Aid</NavLink></li>
              <li><NavLink to="/activity" onClick={closeMenu}>Recent Activity</NavLink></li>
              {token && (
                <li><NavLink to="/profile" onClick={closeMenu}>Profile</NavLink></li>
              )}
              <li><NavLink to="/blog" onClick={closeMenu}>Blog</NavLink></li>
              {!token && (
                <>
                  <li><NavLink to="/login" onClick={closeMenu}>Login</NavLink></li>
                  <li><NavLink to="/signup" onClick={closeMenu}>Sign up</NavLink></li>
                </>
              )}
            </ul>
          </nav>
          
          <div className="nav-right">
             <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
                {theme === 'light' ? <i className="fas fa-moon"></i> : <i className="fas fa-sun"></i>}
             </button>
             {!token && (
               <div className="auth-buttons">
                  <Link to="/login" className="btn btn-secondary small">Login</Link>
                  <Link to="/signup" className="btn btn-primary small">Sign up</Link>
               </div>
             )}
             {token && (
               <div className="auth-buttons">
                  <Link to="/profile" className="btn btn-primary small">Profile</Link>
               </div>
             )}
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
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:id" element={<BlogPostPage />} />
          <Route path="/author/:id" element={<AuthorPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
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
