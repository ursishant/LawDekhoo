import React, { useState, useEffect, useRef } from 'react';
import { postToChat, fetchUrlContent } from '../services/apiService';

const ChatPage = () => {
  // --- STATE MANAGEMENT ---
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en-IN");
  const [fileContent, setFileContent] = useState(null);
  const [fileName, setFileName] = useState("");
  const [processingStatus, setProcessingStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const LEGAL_ASSISTANT_PROMPT = `You are "Lawdekho AI," an AI-powered legal assistant...`; // Updated Brand Name

  const quickQuestions = [
    { text: "Consumer Complaint", prompt: "I bought a new refrigerator that stopped working within a week. What are my rights?" },
    { text: "Tenant Eviction Issue", prompt: "My landlord is trying to evict me without a valid reason. What should I do?" },
    { text: "Cheque Bounce Problem", prompt: "I received a cheque that bounced. What is the legal procedure to recover the money?" },
    { text: "Online Fraud Query", prompt: "I was scammed online and lost money. How can I file a cybercrime complaint?" },
  ];

  const supportedLanguages = {
      "en-IN": { name: "English", localName: "English" },
      "hi-IN": { name: "Hindi", localName: "हिंदी" },
      "bn-IN": { name: "Bengali", localName: "বাংলা" },
      "gu-IN": { name: "Gujarati", localName: "ગુજરાતી" },
      "kn-IN": { name: "Kannada", localName: "ಕನ್ನಡ" },
      "ml-IN": { name: "Malayalam", localName: "മലയാളം" },
      "mr-IN": { name: "Marathi", localName: "मराठी" },
      "pa-IN": { name: "Punjabi", localName: "ਪੰਜਾਬੀ" },
      "ta-IN": { name: "Tamil", localName: "தமிழ்" },
      "te-IN": { name: "Telugu", localName: "తెలుగు" },
      "ur-IN": { name: "Urdu", localName: "اردو" },
      "as-IN": { name: "Assamese", localName: "অসমীয়া" },
      "or-IN": { name: "Odia", localName: "ଓଡିଆ" },
  };

  useEffect(() => {
    const loadScript = (src, id) => {
      return new Promise((resolve, reject) => {
        if (document.getElementById(id)) { resolve(); return; }
        const script = document.createElement('script');
        script.src = src; script.id = id; script.crossOrigin = "anonymous";
        script.onload = () => resolve();
        script.onerror = (e) => reject(new Error(`Script load error: ${e.message}`));
        document.body.appendChild(script);
      });
    };
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.min.js', 'pdfjs-script')
      .then(() => {
        if (window.pdfjsLib) {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js`;
            return loadScript('https://cdn.jsdelivr.net/npm/tesseract.js@2.1.5/dist/tesseract.min.js', 'tesseract-script');
        }
        throw new Error("pdf.js library failed to initialize.");
      }).catch(error => console.error(error));
  }, []);

  useEffect(() => {
    const initialMessages = [
        { id: Date.now(), sender: "bot", text: "Hello! I'm Lawdekho AI. How may I assist you today?" },
        { id: Date.now() + 1, sender: "system", text: "🔒 All conversations are private and confidential.", type: "notification" }
    ];
    try {
      const storedHistory = localStorage.getItem("lawdekho_chat_history");
      setMessages(storedHistory ? JSON.parse(storedHistory) : initialMessages);
    } catch (error) {
      setMessages(initialMessages);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) localStorage.setItem("lawdekho_chat_history", JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, processingStatus]);

  const handleLanguageSelect = (langCode) => {
    setSelectedLanguage(langCode);
    setShowLanguageModal(false);
  };

  const sendMessage = async (text, isSummaryRequest = false) => {
    const trimmedText = text.trim();
    if (!trimmedText && !isSummaryRequest) return;
    setLoading(true); setInput("");
    if (!isSummaryRequest) {
        setMessages(prev => [...prev, { id: Date.now(), sender: "user", text: trimmedText }]);
    } else {
        setMessages(prev => [...prev, { id: Date.now(), sender: "system", text: `✨ Summarizing ${fileName}...`, type: "notification" }]);
    }
    let finalPrompt = `${LEGAL_ASSISTANT_PROMPT}\n\n---\nLanguage: ${supportedLanguages[selectedLanguage].name}.`;
    if (isSummaryRequest && fileContent) {
        finalPrompt += ` Please summarize the following document:\n\n**DOCUMENT:**\n\`\`\`\n${fileContent}\n\`\`\``;
    } else {
        if (fileContent) finalPrompt += `\n\n**DOCUMENT CONTEXT:**\n\`\`\`\n${fileContent}\n\`\`\`\n\nAnswer the user's query based on the document:`;
        finalPrompt += `\n\n**USER QUERY:**\n${trimmedText}`;
    }
    try {
      const botResponseText = await postToChat([{ parts: [{ text: finalPrompt }] }]);
      
      const formattedText = botResponseText
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
        .replace(/\*(.*?)\*/g, '<b>$1</b>')
        .replace(/### (.*?)(?:\n|$)/g, '<b>$1</b><br/>');

      const botMessage = { 
          id: Date.now(), 
          sender: "bot", 
          text: isSummaryRequest ? `<b>Summary of ${fileName}:</b><br/><br/>` + formattedText : formattedText 
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now(), sender: "bot", text: `An error occurred: ${error.message}` }]);
    } finally {
      setLoading(false);
    }
  };
  const handleClearDocument = () => {
    setFileContent(null); setFileName("");
    setMessages(prev => [...prev, { id: Date.now(), sender: "system", text: "Document context cleared.", type: "notification" }]);
  };
  const processPdfFile = async (file) => {
      if (!window.pdfjsLib || !window.Tesseract) { 
          setMessages(prev => [...prev, { id: Date.now(), sender: "system", text: "⚠️ PDF processing libraries are not loaded. Please check your connection and refresh.", type: "notification" }]);
          return;
      }
      setLoading(true); setProgress(0);
      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(file);
      fileReader.onload = async (event) => {
          try {
              const pdf = await window.pdfjsLib.getDocument(event.target.result).promise;
              
              // --- NEW: Page limit check ---
              if (pdf.numPages > 120) {
                  setMessages(prev => [...prev, { id: Date.now(), sender: "system", text: "⚠️ Your PDF exceeds the page limit of 120. Please upload a smaller one.", type: "notification" }]);
                  setLoading(false);
                  return;
              }

              let fullText = '';
              for (let i = 1; i <= pdf.numPages; i++) {
                  const currentProgress = Math.round((i / pdf.numPages) * 100);
                  setProgress(currentProgress);
                  setProcessingStatus(`Processing page ${i}/${pdf.numPages}...`);
                  const page = await pdf.getPage(i);
                  const textContent = await page.getTextContent();
                  const pageText = textContent.items.map(item => item.str).join(' ');
                  if (pageText.trim().length > 50) {
                      fullText += pageText + '\n\n';
                  } else {
                      setProcessingStatus(`Recognizing text on page ${i} (OCR)...`);
                      const viewport = page.getViewport({ scale: 1.5 });
                      const canvas = document.createElement('canvas');
                      canvas.height = viewport.height; canvas.width = viewport.width;
                      const context = canvas.getContext('2d');
                      await page.render({ canvasContext: context, viewport: viewport }).promise;
                      const { data: { text } } = await window.Tesseract.recognize(canvas, 'eng');
                      fullText += text + '\n\n';
                  }
              }
              setFileContent(fullText); setFileName(file.name); setProcessingStatus(""); setProgress(0);
              setMessages(prev => [...prev, { id: Date.now(), sender: "system", text: `✅ Processed ${file.name}. Ask a question about it.`, type: "notification" }]);
          } catch (error) {
              setProcessingStatus(`Error: ${error.message}`);
          } finally { setLoading(false); }
      };
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (fileName) handleClearDocument();
    if (file.type === "application/pdf" || file.type === "text/plain") {
        if (file.type === "application/pdf") processPdfFile(file);
        else {
            const reader = new FileReader();
            reader.onload = (event) => {
                setFileContent(event.target.result); setFileName(file.name);
                setMessages(prev => [...prev, { id: Date.now(), sender: "system", text: `📎 Loaded ${file.name}.`, type: "notification" }]);
            };
            reader.readAsText(file);
        }
    } else {
        setMessages(prev => [...prev, { id: Date.now(), sender: "system", text: `⚠️ Unsupported file type.`, type: "notification" }]);
    }
    e.target.value = null;
  };
  const handleUrlFetch = async (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setLoading(true); setProcessingStatus(`Fetching...`); setShowUrlModal(false);
    try {
        const textContent = await fetchUrlContent(urlInput);
        setFileContent(textContent); setFileName(urlInput); setUrlInput("");
        setMessages(prev => [...prev, { id: Date.now(), sender: "system", text: `✅ Fetched content.`, type: "notification" }]);
    } catch (error) {
        setMessages(prev => [...prev, { id: Date.now(), sender: "system", text: `❌ Fetch failed: ${error.message}`, type: "notification" }]);
    } finally { setLoading(false); setProcessingStatus(""); }
  };
  const handleSubmit = (e) => { e.preventDefault(); sendMessage(input); };
  const handleSpeak = (textToSpeak) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = selectedLanguage;
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };
  const handleCopy = (textToCopy) => {
    navigator.clipboard.writeText(textToCopy).then(() => alert("Copied!")).catch(err => console.error(err));
  };

  return (
    <>
      <div className="chat-app-container">
        <div className="chat-header">
          <div className="header-info">
              <div className="header-icon"><i className="fas fa-balance-scale"></i></div>
              <div>
                  <h1 className="header-title">Lawdekho AI</h1>
                  <p className="header-subtitle">
                    <span className={`status-dot ${loading ? 'typing' : 'online'}`}></span>
                    {loading ? 'Typing...' : 'Online'}
                  </p>
              </div>
          </div>
          <button className="language-selector-button" onClick={() => setShowLanguageModal(true)}>
            <i className="fas fa-language"></i>
            <span>{supportedLanguages[selectedLanguage].localName}</span>
          </button>
        </div>

        <div className="messages-container">
            {messages.map((msg) => (
             <div key={msg.id} className={`message-wrapper ${msg.sender} ${msg.type || ''}`}>
                {msg.sender === 'bot' && <div className="avatar bot-avatar"><i className="fas fa-robot"></i></div>}
                <div className={`message-bubble ${msg.sender} ${msg.type || ''}`}>
                  <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />') }} />
                  {msg.sender === 'bot' && msg.type !== 'notification' && (
                    <div className="message-actions">
                      <button onClick={() => handleSpeak(msg.text)} className="message-action-btn" title="Read aloud"><i className={`fas ${isSpeaking ? 'fa-stop-circle' : 'fa-play-circle'}`}></i></button>
                      <button onClick={() => handleCopy(msg.text)} className="message-action-btn" title="Copy text"><i className="fas fa-copy"></i></button>
                    </div>
                  )}
                </div>
                 {msg.sender === 'user' && <div className="avatar user-avatar"><i className="fas fa-user"></i></div>}
            </div>
          ))}
          {loading && !processingStatus && (
            <div className="message-wrapper bot">
                <div className="avatar bot-avatar"><i className="fas fa-robot"></i></div>
                <div className="message-bubble bot"><div className="typing-indicator"><span/><span/><span/></div></div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="input-area">
            {(fileName || processingStatus) && (
            <div className="file-context-area">
              {processingStatus ? (
                <div className="processing-status-bar">
                  <p>{processingStatus}</p>
                  <div className="progress-bar-container"><div className="progress-bar" style={{ width: `${progress}%` }}></div></div>
                </div>
              ) : (
                <div className="file-info">
                  <i className="fas fa-file-alt"></i>
                  <span>Ready to discuss: <strong>{fileName}</strong></span>
                  <button onClick={handleClearDocument} className="clear-context-btn" title="Clear Document"><i className="fas fa-times"></i></button>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="input-form-wrapper">
            <div className="input-form">
              <button type="button" className="chat-action-btn icon-btn" onClick={() => fileInputRef.current.click()} disabled={loading}><i className="fas fa-paperclip"></i></button>
              <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} accept=".txt,.pdf" />
              <input type="text" className="input-field" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask a legal question or describe your issue..." disabled={loading} />
              <button type="submit" className="chat-action-btn send-btn" disabled={loading || !input.trim()}><i className="fas fa-arrow-up"></i></button>
            </div>
          </form>

          {!fileName && (
            <div className="quick-questions-grid">
              {quickQuestions.map(({ text, prompt }) => (
                <button key={text} disabled={loading} onClick={() => sendMessage(prompt)} className="quick-question-btn">
                  {text}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {showLanguageModal && (
        <div className="language-modal-overlay" onClick={() => setShowLanguageModal(false)}>
            <div className="language-modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>Select a Language</h3>
                <div className="language-grid">
                    {Object.entries(supportedLanguages).map(([code, { name, localName }]) => (
                        <button 
                            key={code} 
                            className={`language-option ${selectedLanguage === code ? 'active' : ''}`}
                            onClick={() => handleLanguageSelect(code)}
                        >
                            <span className="local-name">{localName}</span>
                            <span className="english-name">{name}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
      )}

      {showUrlModal && (
        <div className="modal-overlay">
            <div className="modal-content card">
                <h3>Add Link to Discuss</h3>
                <form onSubmit={handleUrlFetch}>
                    <input value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="https://example.com/document.html" />
                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => setShowUrlModal(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Fetch</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </>
  );
};

export default ChatPage;
