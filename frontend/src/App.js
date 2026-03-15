import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const API = 'https://nyaya-ai-backend.onrender.com';

function App() {
  const [text, setText] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [result, setResult] = useState(null);
  const [letter, setLetter] = useState(null);
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [letterLoading, setLetterLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyze = async () => {
    if (!text.trim()) {
      setError('Please describe your problem first');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    setLetter(null);
    setCenters([]);
    try {
      const res = await axios.post(`${API}/analyze`, {
        text,
        language: 'english'
      });
      setResult(res.data);

      // Also fetch legal centers
      if (city) {
        const centersRes = await axios.get(`${API}/legal-centers?city=${city}`);
        setCenters(centersRes.data.centers);
      }
    } catch (err) {
      setError('Something went wrong. Make sure your backend is running!');
    }
    setLoading(false);
  };

  const generateLetter = async () => {
    if (!result) return;
    setLetterLoading(true);
    try {
      const res = await axios.post(`${API}/generate-letter`, {
        text,
        category: result.analysis.category,
        law_sections: result.analysis.law_sections,
        user_name: name || 'The Complainant',
        user_address: address || 'Address of Complainant'
      });
      setLetter(res.data.letter);
    } catch (err) {
      setError('Could not generate letter. Try again!');
    }
    setLetterLoading(false);
  };

  const downloadLetter = () => {
    if (!letter) return;
    const { jsPDF } = require('jspdf');
    const doc = new jsPDF();
    const lines = doc.splitTextToSize(letter, 180);
    doc.setFontSize(12);
    doc.text(lines, 15, 20);
    doc.save('nyaya-ai-complaint-letter.pdf');
  };

  const getStressColor = (score) => {
    if (score <= 3) return '#22c55e';
    if (score <= 6) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Arial, sans-serif' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1e3a5f, #2563eb)', padding: '24px', textAlign: 'center' }}>
        <h1 style={{ color: 'white', fontSize: '2rem', margin: 0 }}>⚖️ NYAYA AI</h1>
        <p style={{ color: '#93c5fd', margin: '8px 0 0' }}>Free Legal Help for Every Indian</p>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>

        {/* Input Section */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <h2 style={{ margin: '0 0 16px', color: '#1e3a5f' }}>Describe Your Problem</h2>

          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Example: My landlord is not returning my security deposit of ₹50,000 even after 3 months of vacating the house..."
            style={{ width: '100%', height: '120px', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', resize: 'vertical', boxSizing: 'border-box' }}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', margin: '12px 0' }}>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }}
            />
            <input
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Your address"
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }}
            />
            <input
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder="Your city"
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }}
            />
          </div>

          {error && <p style={{ color: '#ef4444', margin: '8px 0' }}>{error}</p>}

          <button
            onClick={analyze}
            disabled={loading}
            style={{ background: '#2563eb', color: 'white', border: 'none', padding: '12px 32px', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', width: '100%', marginTop: '8px' }}
          >
            {loading ? 'Analyzing...' : '🔍 Analyze My Problem'}
          </button>
        </div>

        {/* Results Section */}
        {result && (
          <div>
            {/* Stress Score */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '24px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <h3 style={{ margin: '0 0 12px', color: '#1e3a5f' }}>Legal Stress Score</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: getStressColor(result.analysis.stress_score), display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px', fontWeight: 'bold' }}>
                  {result.analysis.stress_score}
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>
                    {result.analysis.stress_score >= 7 ? 'High Stress Detected' : result.analysis.stress_score >= 4 ? 'Moderate Stress' : 'Low Stress'}
                  </p>
                  <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>
                    Category: <strong>{result.analysis.category}</strong>
                    {result.analysis.urgent && <span style={{ marginLeft: '8px', background: '#fef2f2', color: '#ef4444', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>🚨 URGENT</span>}
                  </p>
                </div>
              </div>
            </div>

            {/* Your Rights */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '24px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <h3 style={{ margin: '0 0 12px', color: '#1e3a5f' }}>⚖️ Your Legal Rights</h3>
              <p style={{ margin: '0 0 12px', lineHeight: '1.6' }}>{result.analysis.rights}</p>
              <h4 style={{ margin: '16px 0 8px', color: '#1e3a5f' }}>Relevant Law Sections</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {result.analysis.law_sections.map((s, i) => (
                  <span key={i} style={{ background: '#eff6ff', color: '#2563eb', padding: '4px 12px', borderRadius: '20px', fontSize: '13px' }}>{s}</span>
                ))}
              </div>
              <h4 style={{ margin: '16px 0 8px', color: '#1e3a5f' }}>Next Steps</h4>
              <p style={{ margin: 0, lineHeight: '1.6', color: '#475569' }}>{result.analysis.next_steps}</p>
            </div>

            {/* Mental Health Support */}
            {result.mental_health_support && (
              <div style={{ background: '#fef3c7', borderRadius: '12px', padding: '24px', marginBottom: '16px', border: '1px solid #fcd34d' }}>
                <h3 style={{ margin: '0 0 8px', color: '#92400e' }}>💛 We Care About You</h3>
                <p style={{ margin: '0 0 4px' }}>{result.mental_health_support.message}</p>
                <p style={{ margin: '0 0 4px' }}>{result.mental_health_support.suggestion}</p>
                <p style={{ margin: 0, fontWeight: 'bold' }}>📞 {result.mental_health_support.helpline}</p>
              </div>
            )}

            {/* Helplines */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '24px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <h3 style={{ margin: '0 0 12px', color: '#1e3a5f' }}>📞 Helplines</h3>
              {result.helplines.map((h, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f8fafc', borderRadius: '8px', marginBottom: '8px' }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px' }}>{h.name}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>{h.available}</p>
                  </div>
                  <p style={{ margin: 0, fontWeight: 'bold', color: '#2563eb', fontSize: '18px' }}>{h.number}</p>
                </div>
              ))}
            </div>

            {/* Generate Letter */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '24px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <h3 style={{ margin: '0 0 8px', color: '#1e3a5f' }}>📄 Complaint Letter</h3>
              <p style={{ margin: '0 0 16px', color: '#64748b', fontSize: '14px' }}>Generate a ready-to-file legal complaint letter</p>
              <button
                onClick={generateLetter}
                disabled={letterLoading}
                style={{ background: '#059669', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', marginRight: '12px' }}
              >
                {letterLoading ? 'Generating...' : '✍️ Generate Letter'}
              </button>

              {letter && (
                <div style={{ marginTop: '16px' }}>
                  <pre style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', whiteSpace: 'pre-wrap', fontSize: '13px', lineHeight: '1.6', border: '1px solid #e2e8f0' }}>
                    {letter}
                  </pre>
                  <button
                    onClick={downloadLetter}
                    style={{ background: '#7c3aed', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', marginTop: '12px' }}
                  >
                    📥 Download as PDF
                  </button>
                </div>
              )}
            </div>

            {/* Legal Centers */}
            {centers.length > 0 && (
              <div style={{ background: 'white', borderRadius: '12px', padding: '24px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <h3 style={{ margin: '0 0 12px', color: '#1e3a5f' }}>📍 Nearest Legal Aid Centers</h3>
                {centers.map((c, i) => (
                  <div key={i} style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', marginBottom: '8px' }}>
                    <p style={{ margin: '0 0 4px', fontWeight: 'bold' }}>{c.name}</p>
                    <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#64748b' }}>📍 {c.address}</p>
                    <p style={{ margin: 0, fontSize: '13px' }}>📞 <strong>{c.phone}</strong> | ✉️ {c.email}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
