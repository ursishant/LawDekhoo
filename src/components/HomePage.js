import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// --- Static Data for new sections ---
const testimonials = [
  { text: "LegalBridge helped me draft a legal notice in minutes. An incredible and much-needed service!", name: 'Rohan S.', rating: 5 },
  { text: "The AI chat gave me the clarity I needed to understand my tenant rights. Highly recommended.", name: 'Priya K.', rating: 5 },
  { text: "I found a pro bono lawyer through this platform. Thank you for making justice accessible.", name: 'Amit G.', rating: 5 },
];

const faqs = [
  {
    question: "Is the legal guidance provided by AI a substitute for a lawyer?",
    answer: "No, the guidance provided by our AI assistant is for informational purposes only and should not be considered legal advice. It is a tool to help you understand legal concepts and navigate basic issues. For complex matters, you should always consult with a qualified legal professional."
  },
  {
    question: "Are my conversations with the AI confidential?",
    answer: "Yes, your privacy is our priority. All conversations and document data are encrypted and handled with the highest level of security. We do not share your personal information with any third parties."
  },
  {
    question: "How do I create a custom document?",
    answer: "On the Documents page, simply describe the legal document you need in the text box. Our AI will analyze your request and generate a custom template with all the necessary fields for you to fill in."
  },
  {
    question: "What is the Legal Aid Finder?",
    answer: "Our Legal Aid Finder helps you connect with government legal aid services, non-profit organizations, and pro bono lawyers in your area. We provide contact details and information about the services they offer to make legal assistance more accessible."
  }
];

// --- Sub-components for a cleaner structure ---

// New Hero Section with gradient background
const HeroSection = () => (
  <section className="hero-section">
    <div className="hero-content">
      <h1 className="hero-title">Free Legal Help, Empowering You</h1>
      <p className="hero-subtitle">
        Get instant legal guidance, generate documents, and find pro bono lawyers—all powered by AI to make justice accessible for every Indian.
      </p>
      <div className="hero-buttons">
        <Link to="/chat" className="btn btn-primary">Ask Legal AI</Link>
        <Link to="/documents" className="btn btn-secondary">Create a Document</Link>
      </div>
    </div>

  </section>
);

// New Stats Section
const StatsSection = () => (
  <section className="stats-section">
    <div className="stat-card">
      <span className="stat-value">50,000+</span>
      <span className="stat-label">AI Queries Answered</span>
    </div>
    <div className="stat-card">
      <span className="stat-value">1,00,000+</span>
      <span className="stat-label">Documents Generated</span>
    </div>
    <div className="stat-card">
      <span className="stat-value">25,000+</span>
      <span className="stat-label">Legal Aid Connections</span>
    </div>
    <div className="stat-card">
      <span className="stat-value">2 min</span>
      <span className="stat-label">Average Response Time</span>
    </div>
  </section>
);

// Updated "How It Works" Section
const HowItWorksSection = () => (
  <section className="how-it-works-section">
    <h2 className="section-title">How LegalBridge India Works</h2>
    <div className="steps-container">
      <div className="step-card">
        <div className="step-icon">1</div>
        <h3>Describe Your Problem</h3>
        <p>Use our AI Chat to explain your legal situation in simple terms.</p>
      </div>
      <div className="step-card">
        <div className="step-icon">2</div>
        <h3>Get AI-powered Guidance</h3>
        <p>Receive instant answers, draft legal notices, and manage your cases.</p>
      </div>
      <div className="step-card">
        <div className="step-icon">3</div>
        <h3>Take Action</h3>
        <p>Generate a legal document or connect with a local legal aid organization.</p>
      </div>
    </div>
  </section>
);

// Updated Features Section
const FeaturesSection = () => (
  <section className="features-section">
    <h2 className="section-title">Everything You Need for Legal Help</h2>
    <div className="features-grid">
      <div className="feature-card">
        <i className="fas fa-robot"></i>
        <h4>AI Legal Assistant</h4>
        <p>Get instant, AI-powered answers to your legal questions, available 24/7.</p>
      </div>
      <div className="feature-card">
        <i className="fas fa-file-signature"></i>
        <h4>Document Generator</h4>
        <p>Generate professional legal documents, from rental agreements to legal notices.</p>
      </div>
      <div className="feature-card">
        <i className="fas fa-map-marked-alt"></i>
        <h4>Legal Aid Finder</h4>
        <p>Find and connect with verified pro bono lawyers and legal aid clinics in your area.</p>
      </div>
      <div className="feature-card">
        <i className="fas fa-briefcase"></i>
        <h4>Case Tracker</h4>
        <p>Organize and manage your legal matters, and track your case history.</p>
      </div>
      <div className="feature-card">
        <i className="fas fa-shield-alt"></i>
        <h4>Privacy & Security</h4>
        <p>All your data and conversations are kept confidential and secure with end-to-end encryption.</p>
      </div>
      <div className="feature-card">
        <i className="fas fa-globe"></i>
        <h4>Multi-language Support</h4>
        <p>Communicate in your preferred language to make legal guidance truly accessible.</p>
      </div>
    </div>
  </section>
);

// Updated Testimonials Section
const TestimonialsSection = () => (
  <section className="testimonials-section">
    <h2 className="section-title">What People are Saying</h2>
    <div className="testimonials-grid">
      {testimonials.map((testimonial, index) => (
        <div key={index} className="testimonial-card">
          <div className="testimonial-rating">
            {Array.from({ length: testimonial.rating }, (_, i) => (
              <i key={i} className="fas fa-star"></i>
            ))}
          </div>
          <p className="testimonial-text">"{testimonial.text}"</p>
          <span className="testimonial-author">- {testimonial.name}</span>
        </div>
      ))}
    </div>
  </section>
);

// New FAQ Section
const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="faq-section">
      <h2 className="section-title">Frequently Asked Questions</h2>
      <div className="faq-container">
        {faqs.map((faq, index) => (
          <div key={index} className="faq-item">
            <button className="faq-question" onClick={() => toggleFAQ(index)}>
              <span>{faq.question}</span>
              <i className={`fas fa-chevron-${openIndex === index ? 'up' : 'down'}`}></i>
            </button>
            <div className={`faq-answer ${openIndex === index ? 'open' : ''}`}>
              <p>{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// New CTA Section
const CtaSection = () => (
  <section className="cta-section">
    <div className="cta-content">
      <h3>Ready to Get Legal Help?</h3>
      <p>Start your legal journey with us today.</p>
      <Link to="/chat" className="btn btn-primary">Start AI Chat</Link>
    </div>
  </section>
);


// --- Main HomePage Component ---
const HomePage = () => {
  return (
    <div className="home-page">
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <FAQSection />
      <CtaSection />
    </div>
  );
};

export default HomePage;
