import React, { useState } from 'react';
import axios from 'axios';

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
    if (!text.trim()) { setError('Please describe your problem first'); return; }
    setLoading(true); setError(null); setResult(null); setLetter(null); setCenters([]);
    try {
      const res = await axios.post(`${API}/analyze`, { text, language: 'english' });
      setResult(res.data);

      // Save to MongoDB
      try {
        await axios.post(`${API}/save-case`, {
          text: text,
          category: res.data.analysis.category,
          stress_score: res.data.analysis.stress_score,
          law_sections: res.data.analysis.law_sections,
          rights: res.data.analysis.rights,
          next_steps: res.data.analysis.next_steps,
          urgent: res.data.analysis.urgent,
          user_name: name || 'Anonymous',
          city: city || 'Unknown'
        });
      } catch (saveErr) {
        console.log('Save failed silently:', saveErr);
      }

      if (city) {
        const centersRes = await axios.get(`${API}/legal-centers?city=${city}`);
        setCenters(centersRes.data.centers);
      }
    } catch (err) { setError('Something went wrong. Please try again!'); }
    setLoading(false);
  };

  const generateLetter = async () => {
    if (!result) return;
    setLetterLoading(true);
    try {
      const res = await axios.post(`${API}/generate-letter`, {
        text, category: result.analysis.category,
        law_sections: result.analysis.law_sections,
        user_name: name || 'The Complainant',
        user_address: address || 'Address of Complainant'
      });
      setLetter(res.data.letter);
    } catch (err) { setError('Could not generate letter. Try again!'); }
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
    if (score <= 3) return 'bg-green-600';
    if (score <= 6) return 'bg-yellow-500';
    return 'bg-red-600';
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Navbar */}
      <nav className="bg-slate-900 px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚖️</span>
          <div>
            <h1 className="text-white font-bold text-xl tracking-widest">NYAYA AI</h1>
            <p className="text-yellow-400 text-xs tracking-widest uppercase">Legal Rights Assistant</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6 text-slate-400 text-sm">
          <span className="hover:text-yellow-400 cursor-pointer transition">Home</span>
          <span className="hover:text-yellow-400 cursor-pointer transition">About</span>
          <span className="bg-yellow-400 text-slate-900 px-4 py-2 rounded font-semibold text-sm hover:bg-yellow-300 cursor-pointer transition">Free Legal Help</span>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{backgroundImage: 'repeating-linear-gradient(90deg, #c9a84c 0px, #c9a84c 1px, transparent 1px, transparent 60px)'}}></div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-block bg-yellow-400 text-slate-900 text-xs font-bold px-4 py-1 rounded-full tracking-widest uppercase mb-6">
            Free • Instant • Confidential
          </div>
          <h2 className="text-white text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Know Your <span className="text-yellow-400">Legal Rights</span>
          </h2>
          <p className="text-slate-400 text-lg mb-2">
            AI-powered legal assistance for every Indian citizen
          </p>
          <p className="text-slate-500 text-sm">
            Describe your problem → Get the law on your side → File a complaint
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* Input Card */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden mb-8">
          <div className="bg-slate-900 px-6 py-4 flex items-center gap-3">
            <span className="text-yellow-400 text-lg">📝</span>
            <h3 className="text-white font-semibold tracking-wide">Describe Your Legal Problem</h3>
          </div>
          <div className="p-6">
            <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-2">Your Situation</p>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Describe your problem in detail. Example: My employer has not paid my salary for 3 months and threatens to fire me if I complain..."
              className="w-full h-36 p-4 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 resize-none focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 transition"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
              {[
                { val: name, set: setName, placeholder: 'Your full name', label: 'Name' },
                { val: address, set: setAddress, placeholder: 'Your address', label: 'Address' },
                { val: city, set: setCity, placeholder: 'Your city', label: 'City' },
              ].map((f, i) => (
                <div key={i}>
                  <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-1">{f.label}</p>
                  <input
                    type="text"
                    value={f.val}
                    onChange={e => f.set(e.target.value)}
                    placeholder={f.placeholder}
                    className="w-full p-3 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 transition"
                  />
                </div>
              ))}
            </div>
            {error && (
              <div className="mt-4 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded text-sm">
                ⚠️ {error}
              </div>
            )}
            <button
              onClick={analyze}
              disabled={loading}
              className="mt-5 w-full bg-slate-900 hover:bg-yellow-400 text-yellow-400 hover:text-slate-900 border-2 border-slate-900 font-bold py-3 rounded-lg tracking-widest uppercase text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Analyzing Your Problem...' : '🔍 Get Legal Help Now'}
            </button>
          </div>
        </div>

        {result && (
          <div className="space-y-6">

            {/* Case Assessment */}
            <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
              <div className="bg-slate-900 px-6 py-4 flex items-center gap-3">
                <span className="text-yellow-400 text-lg">📊</span>
                <h3 className="text-white font-semibold tracking-wide">Case Assessment</h3>
              </div>
              <div className="p-6 flex items-center gap-6">
                <div className={`${getStressColor(result.analysis.stress_score)} w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg flex-shrink-0`}>
                  {result.analysis.stress_score}
                </div>
                <div>
                  <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-1">Stress Level</p>
                  <p className="font-bold text-lg text-slate-800 mb-1">
                    {result.analysis.stress_score >= 7 ? '🔴 High Distress Detected' : result.analysis.stress_score >= 4 ? '🟡 Moderate Stress' : '🟢 Low Stress'}
                  </p>
                  <p className="text-slate-500 text-sm">
                    Category: <span className="font-bold text-slate-800 capitalize">{result.analysis.category}</span>
                    {result.analysis.urgent && (
                      <span className="ml-2 bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide border border-red-200">
                        🚨 Urgent
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Legal Rights */}
            <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
              <div className="bg-slate-900 px-6 py-4 flex items-center gap-3">
                <span className="text-yellow-400 text-lg">⚖️</span>
                <h3 className="text-white font-semibold tracking-wide">Your Legal Rights</h3>
              </div>
              <div className="p-6">
                <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-2">Rights Explanation</p>
                <p className="text-slate-600 leading-relaxed mb-6">{result.analysis.rights}</p>
                <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-3">Applicable Law Sections</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {result.analysis.law_sections.map((s, i) => (
                    <span key={i} className="bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1 rounded text-sm font-medium">
                      {s}
                    </span>
                  ))}
                </div>
                <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-2">Recommended Next Steps</p>
                <p className="text-slate-600 leading-relaxed">{result.analysis.next_steps}</p>
              </div>
            </div>

            {/* Mental Health */}
            {result.mental_health_support && (
              <div className="bg-amber-50 rounded-xl border border-amber-200 border-l-4 border-l-yellow-400 p-6">
                <p className="text-xs font-bold tracking-widest text-yellow-600 uppercase mb-2">Wellbeing Support</p>
                <p className="font-bold text-amber-800 text-lg mb-2">💛 We Care About Your Wellbeing</p>
                <p className="text-amber-700 mb-2 text-sm">{result.mental_health_support.suggestion}</p>
                <p className="font-bold text-amber-800">📞 {result.mental_health_support.helpline}</p>
              </div>
            )}

            {/* Helplines */}
            <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
              <div className="bg-slate-900 px-6 py-4 flex items-center gap-3">
                <span className="text-yellow-400 text-lg">📞</span>
                <h3 className="text-white font-semibold tracking-wide">Emergency Helplines</h3>
              </div>
              <div className="p-6 space-y-3">
                {result.helplines.map((h, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border-l-4 border-yellow-400 hover:bg-slate-100 transition">
                    <div>
                      <p className="font-semibold text-slate-800">{h.name}</p>
                      <p className="text-xs text-slate-400 mt-1">🕐 {h.available}</p>
                    </div>
                    <span className="text-2xl font-bold text-slate-900">{h.number}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Letter Generator */}
            <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
              <div className="bg-slate-900 px-6 py-4 flex items-center gap-3">
                <span className="text-yellow-400 text-lg">📄</span>
                <h3 className="text-white font-semibold tracking-wide">Complaint Letter Generator</h3>
              </div>
              <div className="p-6">
                <p className="text-slate-500 text-sm mb-5 leading-relaxed">
                  Generate a professionally formatted, legally worded complaint letter ready to be submitted to the appropriate authority.
                </p>
                <button
                  onClick={generateLetter}
                  disabled={letterLoading}
                  className="bg-green-700 hover:bg-green-800 text-white font-bold py-3 px-6 rounded-lg text-sm tracking-wide transition disabled:opacity-50"
                >
                  {letterLoading ? '⏳ Drafting Letter...' : '✍️ Generate Complaint Letter'}
                </button>
                {letter && (
                  <div>
                    <div className="mt-5 bg-slate-50 border border-slate-200 rounded-lg p-5 whitespace-pre-wrap text-sm leading-loose text-slate-700 font-mono">
                      {letter}
                    </div>
                    <button
                      onClick={downloadLetter}
                      className="mt-4 bg-transparent border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-yellow-400 font-bold py-2 px-6 rounded-lg text-sm tracking-wide transition"
                    >
                      📥 Download as PDF
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Legal Centers */}
            {centers.length > 0 && (
              <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
                <div className="bg-slate-900 px-6 py-4 flex items-center gap-3">
                  <span className="text-yellow-400 text-lg">📍</span>
                  <h3 className="text-white font-semibold tracking-wide">Nearest Legal Aid Centers</h3>
                </div>
                <div className="p-6 space-y-3">
                  {centers.map((c, i) => (
                    <div key={i} className="p-4 bg-slate-50 rounded-lg border-l-4 border-slate-900 hover:bg-slate-100 transition">
                      <p className="font-semibold text-slate-800 mb-1">{c.name}</p>
                      <p className="text-xs text-slate-500 mb-1">📍 {c.address}</p>
                      <p className="text-sm">📞 <strong>{c.phone}</strong> &nbsp;|&nbsp; ✉️ {c.email}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-slate-200">
          <p className="text-slate-900 font-bold text-lg tracking-widest">⚖️ NYAYA AI</p>
          <p className="text-slate-500 text-sm mt-1">Free Legal Assistance for Every Indian Citizen</p>
          <p className="text-slate-400 text-xs mt-3">
            This tool provides general legal guidance only. Please consult a qualified lawyer for complex legal matters.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;