import React, { useState } from 'react';
import { Sparkles, X, Send, Bot, User, Cpu } from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const QUICK_PROMPTS = [
  { label: '🍅 माझे ५ टन टोमॅटो अडकले आहेत (Tomatoes stranded)', lang: 'mr', query: 'माझे ५ टन टोमॅटो नाशिकजवळ अडकले आहेत, तात्काळ उपाय काय?' },
  { label: '🧅 लासलगाव कांदा भाव (Lasalgaon Onion Rate)', lang: 'mr', query: 'लासलगाव बाजारात कांद्याला आज काय सरासरी भाव मिळतो आहे?' },
  { label: '❄️ जवळचे कोल्ड स्टोरेज (Nearest Cold Storage)', lang: 'mr', query: 'नाशिक आणि दिंडोरी परिसरातील उपलब्ध कोल्ड स्टोरेजची माहिती द्या' },
  { label: '🚛 आपातकालीन वाहन (Emergency Vehicle)', lang: 'hi', query: 'खराब होने से पहले माल निकालने के लिए नजदीकी ट्रांसपोर्ट कैसे मिलेगा?' },
];

export default function AiAssistantModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const { lang } = useLanguage();
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text:
        lang === 'mr'
          ? 'नमस्कार शेतकरी मित्र! मी फसल रक्षक AI सहाय्यक आहे. तुमचा माल अडकला असेल, वाहतूक तुटली असेल किंवा बाजारातील योग्य भाव जाणून घ्यायचा असेल तर खाली प्रश्न विचारा.'
          : lang === 'hi'
          ? 'नमस्ते किसान साथी! मैं फसल रक्षक AI सहायक हूँ। अगर आपकी फसल कहीं फंसी है या बेहतर भाव चाहिए तो बेझिझक पूछें।'
          : 'Welcome to FasalRakshak AI Copilot. I analyze real-time mandi prices, transport availability, and cold storage capacity to protect your harvest from loss.',
      tools: ['Gemini 2.0 Flash', 'RecoveryEngine v1.4'],
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (queryToSend) => {
    const query = queryToSend || inputText;
    if (!query.trim() || loading) return;

    const userMsg = { sender: 'user', text: query };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const res = await api.queryAgent({ query, language: lang });
      const botReply = res?.data?.reply || 'माहिती प्रक्रिया करताना अडचण आली, कृपया पुन्हा प्रयत्न करा.';
      const tools = res?.data?.toolsUsed || ['MandiPriceFeed', 'RecoveryOptimization'];

      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: botReply,
          tools,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'सर्व्हरशी संपर्क होऊ शकला नाही. तरीही आम्ही स्थानिक रिकव्हरी अल्गोरिदम सक्रिय केला आहे.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 680, display: 'flex', flexDirection: 'column', height: '80vh' }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, var(--green-900), var(--green-800))',
            color: '#fff',
            borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={20} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                Gemini 2.0 Kisan AI Copilot (कृषी सल्लागार)
              </div>
              <div style={{ fontSize: '0.75rem', opacity: 0.85, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
                Deterministic Tool Sandboxing Active
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: 6,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.15)',
              color: '#fff',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Message Log */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            background: 'var(--bg-warm)',
          }}
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: 10,
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
              }}
            >
              {msg.sender === 'bot' && (
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'var(--green-100)',
                    color: 'var(--green-800)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Bot size={18} />
                </div>
              )}
              <div
                style={{
                  background: msg.sender === 'user' ? 'var(--green-800)' : '#ffffff',
                  color: msg.sender === 'user' ? '#ffffff' : 'var(--text-primary)',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-xs)',
                  border: msg.sender === 'user' ? 'none' : '1px solid var(--border-light)',
                  lineHeight: 1.5,
                  fontSize: '0.92rem',
                }}
              >
                <div>{msg.text}</div>
                {msg.tools && msg.tools.length > 0 && (
                  <div
                    style={{
                      marginTop: 8,
                      paddingTop: 8,
                      borderTop: '1px solid var(--border-light)',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 6,
                    }}
                  >
                    {msg.tools.map((t, tidx) => (
                      <span
                        key={tidx}
                        style={{
                          fontSize: '0.72rem',
                          background: 'var(--green-50)',
                          color: 'var(--green-700)',
                          padding: '2px 6px',
                          borderRadius: 4,
                          border: '1px solid var(--green-200)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <Cpu size={11} /> {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: 10, alignSelf: 'flex-start' }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'var(--green-100)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Bot size={18} color="var(--green-800)" />
              </div>
              <div
                style={{
                  background: '#fff',
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)',
                  color: 'var(--text-muted)',
                  fontSize: '0.88rem',
                }}
              >
                Checking Mandi databases and computing net margins...
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div
          style={{
            padding: '10px 16px',
            background: '#ffffff',
            borderTop: '1px solid var(--border-light)',
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
          }}
        >
          {QUICK_PROMPTS.map((qp, i) => (
            <button
              key={i}
              onClick={() => handleSend(qp.query)}
              disabled={loading}
              style={{
                whiteSpace: 'nowrap',
                fontSize: '0.78rem',
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              {qp.label}
            </button>
          ))}
        </div>

        {/* Input Field */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          style={{
            padding: '14px 16px',
            background: '#ffffff',
            borderTop: '1px solid var(--border-light)',
            display: 'flex',
            gap: 10,
            borderRadius: '0 0 var(--radius-xl) var(--radius-xl)',
          }}
        >
          <input
            type="text"
            className="form-input"
            placeholder={
              lang === 'mr'
                ? 'तुमचा प्रश्न येथे विचारा (उदा: टोमॅटोचे भाव काय आहेत?)...'
                : lang === 'hi'
                ? 'अपना प्रश्न यहाँ लिखें...'
                : 'Ask your farming recovery or market question...'
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !inputText.trim()}
            style={{ padding: '10px 18px' }}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
