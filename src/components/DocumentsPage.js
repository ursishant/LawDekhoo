import React, { useState, useEffect } from 'react';
import { postToChat } from '../services/apiService';
import { documentTemplates as initialTemplates } from '../data/documentTemplates';

// --- Helper Components ---
const TemplateCard = ({ tpl, isSelected, onClick }) => (
  <div onClick={onClick} className={`template-card ${isSelected ? 'selected' : ''}`}>
    <i className={`fas ${tpl.icon}`}></i>
    <div className="template-info">
      <h4>{tpl.title}</h4>
      <p>{tpl.description}</p>
    </div>
  </div>
);

// --- Main Documents Page Component ---
const DocumentsPage = () => {
  const [docTemplates, setDocTemplates] = useState(initialTemplates);
  const [selected, setSelected] = useState(null);
  const [formData, setFormData] = useState({});
  const [generated, setGenerated] = useState('');
  const [customDocDescription, setCustomDocDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('initial');
  const [aiQuestions, setAiQuestions] = useState([]);
  const [customAnswers, setCustomAnswers] = useState({});

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // --- UPDATED: Function now saves the document's content ---
  const saveDocumentRecord = (title, content) => {
    const newDocRecord = {
      id: Date.now(),
      title: title,
      content: content, // Save the actual content
      date: new Date().toLocaleDateString(),
    };
    const existingDocs = JSON.parse(localStorage.getItem('lawdekho_documents') || '[]');
    localStorage.setItem('lawdekho_documents', JSON.stringify([...existingDocs, newDocRecord]));
  };

  const handleTemplateClick = (key) => {
    setSelected(key);
    setFormData({});
    setGenerated('');
    setGenerationStep('initial');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCustomAnswerChange = (e) => {
    const { name, value } = e.target;
    setCustomAnswers((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!selected) return;
    const template = docTemplates[selected].template;
    let result = template;
    docTemplates[selected].fields.forEach((field) => {
      const val = formData[field.id] || `[${field.label}]`;
      const regex = new RegExp('{' + field.id + '}', 'g');
      result = result.replace(regex, val);
    });
    setGenerated(result);
    // --- SAVE RECORD with content ---
    saveDocumentRecord(docTemplates[selected].title, result);
  };

  const handleAiStep1_GetQuestions = async () => {
    if (!customDocDescription.trim()) {
      alert("Please describe the document you need.");
      return;
    }
    setIsGenerating(true);
    const prompt = `Based on a user's request for a legal document ("${customDocDescription}"), what specific questions must you ask to gather all necessary details? Provide your response as a JSON array of objects, where each object has an 'id' (camelCase) and a 'question' (string). Example: [{"id": "partyOneName", "question": "What is the full name of the first party?"}]`;
    try {
      const responseText = await postToChat([{ parts: [{ text: prompt }] }]);
      const cleanedText = responseText.replace(/```json|```/g, "").trim();
      const questions = JSON.parse(cleanedText);
      setAiQuestions(questions);
      setGenerationStep('questions');
    } catch (error) {
      alert("Could not get clarifying questions from the AI. Please try rephrasing your request.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAiStep2_GenerateDocument = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    const answersText = Object.entries(customAnswers).map(([key, value]) => `- ${aiQuestions.find(q => q.id === key)?.question}: ${value}`).join('\n');
    const prompt = `Generate a formal legal document for the following request: "${customDocDescription}". Use the following details provided by the user:\n\n${answersText}\n\nGenerate only the full text of the document.`;
    try {
        const responseText = await postToChat([{ parts: [{ text: prompt }] }]);
        setGenerated(responseText);
        setGenerationStep('final');
        // --- SAVE RECORD with content ---
        saveDocumentRecord(`AI: ${customDocDescription.substring(0, 20)}...`, responseText);
    } catch (error) {
        alert("Failed to generate the final document. Please try again.");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleDownloadTXT = () => {
    if (!generated) return;
    const blob = new Blob([generated], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const docTitle = docTemplates[selected]?.title.replace(/ /g, '_') || 'AI_Generated_Document';
    link.download = `${docTitle}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = () => {
    if (!generated || !window.jspdf) {
        alert("PDF library not loaded yet, or no document generated.");
        return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(41, 121, 255);
    doc.text("Lawdekho", 15, 20);
    doc.setDrawColor(229, 231, 235);
    doc.line(15, 25, pageWidth - 15, 25);
    const docTitle = docTemplates[selected]?.title.toUpperCase() || 'AI GENERATED DOCUMENT';
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(52, 58, 64);
    doc.text(docTitle, pageWidth / 2, 40, { align: 'center' });
    doc.setFont("times", "normal");
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    const splitText = doc.splitTextToSize(generated, 180);
    doc.text(splitText, 15, 55);
    const footerY = pageHeight - 20;
    doc.setDrawColor(229, 231, 235);
    doc.line(15, footerY - 5, pageWidth - 15, footerY - 5);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(108, 117, 125);
    const disclaimer = "Disclaimer: This document is AI-generated and should be reviewed by a legal professional.";
    const footerText = `Generated by Lawdekho (lawdekhoo.com) - Free AI-Powered Legal Platform`;
    doc.text(disclaimer, pageWidth / 2, footerY, { align: 'center' });
    doc.text(footerText, pageWidth / 2, footerY + 4, { align: 'center' });
    doc.save(`${docTitle.replace(/ /g, '_')}.pdf`);
  };

  return (
    <div className="documents-page">
      <h2 className="section-title">Legal Document Generator</h2>
      <p className="page-subtitle">Choose a template or describe a custom document to generate it with AI.</p>
      <div className="doc-layout">
        <aside className="templates-sidebar">
          <h3>Templates</h3>
          {Object.keys(docTemplates).map((key) => (
            <TemplateCard key={key} tpl={docTemplates[key]} isSelected={selected === key} onClick={() => handleTemplateClick(key)} />
          ))}
        </aside>
        <main className="document-workspace">
          {!selected ? (
            <div className="card">
              {generationStep === 'initial' && (
                <div className="custom-doc-generator">
                  <h3>Need Something Else?</h3>
                  <p>Describe the legal document you need, and our AI will ask clarifying questions.</p>
                  <textarea value={customDocDescription} onChange={(e) => setCustomDocDescription(e.target.value)} placeholder="e.g., A freelance contract for a web developer..." />
                  <button onClick={handleAiStep1_GetQuestions} disabled={isGenerating} className="btn btn-primary">
                    {isGenerating ? 'Analyzing...' : 'Start AI Assistant'}
                  </button>
                </div>
              )}
              {generationStep === 'questions' && (
                <form onSubmit={handleAiStep2_GenerateDocument} className="doc-form">
                  <h3>Please provide the following details:</h3>
                  {aiQuestions.map((q) => (
                    <div key={q.id} className="form-field">
                      <label htmlFor={q.id}>{q.question}</label>
                      <input id={q.id} name={q.id} type="text" required value={customAnswers[q.id] || ''} onChange={handleCustomAnswerChange} />
                    </div>
                  ))}
                  <button type="submit" disabled={isGenerating} className="btn btn-primary">
                    {isGenerating ? 'Generating...' : 'Generate Document'}
                  </button>
                </form>
              )}
              {generationStep === 'final' && (
                 <div className="preview-section">
                    <div className="preview-header">
                        <h4>AI Generated Document</h4>
                        <div>
                            <button onClick={handleDownloadTXT} className="btn btn-secondary dark"><i className="fas fa-download"></i> .txt</button>
                            <button onClick={handleDownloadPDF} className="btn btn-secondary dark"><i className="fas fa-file-pdf"></i> .pdf</button>
                        </div>
                    </div>
                    <textarea readOnly value={generated} />
                </div>
              )}
            </div>
          ) : (
            <div className="card">
              <h3>Generate {docTemplates[selected].title}</h3>
              <form onSubmit={handleGenerate} className="doc-form">
                {docTemplates[selected].fields.map((field) => (
                  <div key={field.id} className="form-field">
                    <label htmlFor={field.id}>{field.label}</label>
                    {field.type === 'textarea' ? (
                      <textarea id={field.id} name={field.id} required value={formData[field.id] || ''} onChange={handleChange} />
                    ) : (
                      <input id={field.id} name={field.id} type={field.type || 'text'} required value={formData[field.id] || ''} onChange={handleChange} />
                    )}
                  </div>
                ))}
                <button type="submit" className="btn btn-primary">Generate Preview</button>
              </form>
              {generated && (
                <div className="preview-section">
                  <div className="preview-header">
                    <h4>Document Preview</h4>
                    <div>
                        <button onClick={handleDownloadTXT} className="btn btn-secondary dark"><i className="fas fa-download"></i> .txt</button>
                        <button onClick={handleDownloadPDF} className="btn btn-secondary dark"><i className="fas fa-file-pdf"></i> .pdf</button>
                    </div>
                  </div>
                  <textarea readOnly value={generated} />
                </div>
              )}
            </div>
          )}
        </main>
      </div>
      <div className="doc-info-section">
        <h3 className="section-title">Documents You Can Create Yourself</h3>
        <p className="info-disclaimer">
            <strong>Important Note:</strong> The following documents can often be prepared without a lawyer. Parties themselves can sign, stamp, and register them if needed. However, for complex situations, consulting a legal professional is always recommended.
        </p>
        <div className="info-columns">
            <div className="info-column">
                <h4>Agreements & Contracts</h4>
                <ul>
                    <li>Rent/Lease Agreement (below 11 months)</li>
                    <li>Partnership Agreement</li>
                    <li>Employment Agreement / Offer Letter</li>
                    <li>Freelance / Service Agreement</li>
                    <li>Sale of Goods Agreement</li>
                    <li>Loan Agreement (between individuals)</li>
                    <li>Non-Disclosure Agreement (NDA)</li>
                    <li>Memorandum of Understanding (MoU)</li>
                </ul>
                <h4>Affidavits & Declarations</h4>
                <ul>
                    <li>Name Change Affidavit</li>
                    <li>Address Proof Affidavit</li>
                    <li>Affidavit for Lost Documents</li>
                    <li>Self-Declaration Forms</li>
                </ul>
            </div>
            <div className="info-column">
                <h4>Personal Legal Documents</h4>
                <ul>
                    <li>Power of Attorney</li>
                    <li>Gift Deed</li>
                    <li>Will (Testament)</li>
                </ul>
                <h4>Business & Corporate</h4>
                <ul>
                    <li>Memorandum & Articles of Association</li>
                    <li>Board Resolutions</li>
                    <li>Shareholder Agreements</li>
                </ul>
                <h4>Everyday Legal Documents</h4>
                <ul>
                    <li>Rental Receipts</li>
                    <li>Indemnity Bonds</li>
                    <li>Undertakings</li>
                </ul>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentsPage;
