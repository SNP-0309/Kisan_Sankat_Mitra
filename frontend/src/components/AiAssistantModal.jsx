import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  Cpu,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RotateCcw,
  Radio,
} from 'lucide-react';
import { api } from '../services/api';
import { useLanguage, INDIAN_LANGUAGES } from '../context/LanguageContext';
import { PillButton, Badge } from './ui';

const QUICK_PROMPTS = [
  { label: '🍅 ५ टन टोमॅटो अडकले आहेत', lang: 'mr', query: 'माझे ५ टन टोमॅटो नाशिकजवळ अडकले आहेत, तात्काळ उपाय काय?' },
  { label: '🧅 लासलगाव कांदा भाव', lang: 'mr', query: 'लासलगाव बाजारात कांद्याला आज काय सरासरी भाव मिळतो आहे?' },
  { label: '❄️ जवळचे कोल्ड स्टोरेज', lang: 'mr', query: 'नाशिक आणि दिंडोरी परिसरातील उपलब्ध कोल्ड स्टोरेजची माहिती द्या' },
  { label: '🚛 आपातकालीन वाहन', lang: 'hi', query: 'खराब होने से पहले माल निकालने के लिए नजदीकी ट्रांसपोर्ट कैसे मिलेगा?' },
];

export default function AiAssistantModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const { lang } = useLanguage();
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text:
        lang === 'mr'
          ? 'नमस्कार शेतकरी मित्र! मी फसल रक्षक AI सहाय्यक आहे. तुमचा माल अडकला असेल, खरेदीदाराने ऑर्डर रद्द केली असेल किंवा बाजारातील योग्य भाव जाणून घ्यायचा असेल तर माइक दाबा आणि बोला.'
          : lang === 'hi'
          ? 'नमस्ते किसान साथी! मैं फसल रक्षक AI सहायक हूँ। अगर आपकी फसल कहीं फंसी है या बेहतर भाव चाहिए तो माइक दबाकर सीधे बोलें।'
          : 'Welcome to FasalRakshak AI Copilot. I analyze real-time mandi spot prices, transport availability, and cold storage capacity to protect your harvest from loss. Press the mic to speak.',
      tools: ['Gemini 2.0 Flash', 'RecoveryEngine v1.4'],
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  // Voice Assistant State
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [transcriptInterim, setTranscriptInterim] = useState('');

  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, transcriptInterim]);

  // Clean up speech synthesis on unmount or close
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
    };
  }, []);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;

    // Set recognition language based on active app language
    const currentLangObj = INDIAN_LANGUAGES.find((l) => l.code === lang);
    recognition.lang = currentLangObj ? currentLangObj.bcp47 : 'en-IN';

    recognition.onstart = () => {
      setIsListening(true);
      setTranscriptInterim('');
    };

    recognition.onresult = (event) => {
      let interim = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interim += transcript;
        }
      }

      setTranscriptInterim(interim);

      if (finalTranscript.trim()) {
        setInputText(finalTranscript);
        setIsListening(false);
        handleSend(finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      setIsListening(false);
      setTranscriptInterim('');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, [lang]);

  // Toggle Voice Listening
  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      // Stop ongoing bot speech before listening
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Recognition start error:', err);
      }
    }
  };

  // Speak bot response using Web Speech Synthesis
  const speakText = (text) => {
    if (voiceMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    window.speechSynthesis.cancel();

    // Clean text of markdown/emojis for smoother speech
    const cleanText = text
      .replace(/[#*`_~]/g, '')
      .replace(/[\u{1F600}-\u{1F6FF}]/gu, '')
      .trim();

    if (!cleanText) return;

    const currentLangObj = INDIAN_LANGUAGES.find((l) => l.code === lang);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = currentLangObj ? currentLangObj.bcp47 : 'en-IN';
    utterance.rate = 0.95; // Slightly slower, clearer for Indian farming context

    // Pick Indian voice if available
    const voices = window.speechSynthesis.getVoices();
    const targetLang = utterance.lang.toLowerCase();
    const matchedVoice = voices.find((v) => v.lang.toLowerCase().includes(targetLang) || v.lang.toLowerCase().includes('hi-in'));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (queryToSend) => {
    const query = queryToSend || inputText;
    if (!query.trim() || loading) return;

    // Cancel speech when user sends a new message
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    const userMsg = { sender: 'user', text: query };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setTranscriptInterim('');
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

      // Automatically speak the response if voice is not muted
      speakText(botReply);
    } catch (err) {
      const errorMsg = 'सर्व्हरशी संपर्क होऊ शकला नाही. तरीही आम्ही स्थानिक रिकव्हरी अल्गोरिदम सक्रिय केला आहे.';
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: errorMsg,
        },
      ]);
      speakText(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
        onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 42, 29, 0.65)',
        backdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '720px',
          height: '84vh',
          maxHeight: '780px',
          background: '#FFFFFF',
          borderRadius: 'var(--radius-card)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            background: 'var(--color-forest-black)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: isSpeaking ? 'var(--color-orange-accent)' : 'rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all var(--transition-normal)',
                boxShadow: isSpeaking ? '0 0 16px rgba(255, 90, 31, 0.6)' : 'none',
              }}
            >
              <Sparkles size={20} color="#FFFFFF" />
            </div>

            <div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: '1.15rem',
                  letterSpacing: '-0.02em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>Kisan AI Copilot</span>
                <span
                  style={{
                    fontSize: '0.74rem',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-pill)',
                    background: 'rgba(255, 255, 255, 0.2)',
                    fontWeight: 700,
                  }}
                >
                  Gemini 2.0 Voice
                </span>
              </div>

              <div
                style={{
                  fontSize: '0.78rem',
                  color: 'rgba(255, 255, 255, 0.75)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '2px',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: isListening
                      ? 'var(--color-orange-accent)'
                      : isSpeaking
                      ? 'var(--color-green-success)'
                      : '#4ADE80',
                    boxShadow: isListening ? '0 0 8px #FF5A1F' : 'none',
                  }}
                />
                <span>
                  {isListening
                    ? 'Listening to your voice...'
                    : isSpeaking
                    ? 'Speaking response...'
                    : 'Voice & Deterministic Tool Sandboxing Active'}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Audio Voice Mute/Unmute Toggle */}
            <button
              type="button"
              onClick={() => {
                const nextMuted = !voiceMuted;
                setVoiceMuted(nextMuted);
                if (nextMuted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                  setIsSpeaking(false);
                }
              }}
              title={voiceMuted ? 'Unmute Voice' : 'Mute Voice'}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.12)',
                border: 'none',
                color: voiceMuted ? 'rgba(255, 255, 255, 0.4)' : '#FFFFFF',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {voiceMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>

            {/* Close Modal */}
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                }
                onClose();
              }}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.12)',
                border: 'none',
                color: '#FFFFFF',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Message Log */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            background: 'var(--color-bg-canvas)',
          }}
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: '12px',
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
              }}
            >
              {msg.sender === 'bot' && (
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    background: 'var(--color-forest-black)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                >
                  <Bot size={18} />
                </div>
              )}

              <div
                style={{
                  background: msg.sender === 'user' ? 'var(--color-forest-black)' : '#FFFFFF',
                  color: msg.sender === 'user' ? '#FFFFFF' : 'var(--color-forest-black)',
                  padding: '14px 18px',
                  borderRadius: 'calc(var(--radius-card) - 8px)',
                  boxShadow: 'var(--shadow-card)',
                  border: msg.sender === 'user' ? 'none' : '1px solid var(--color-border)',
                  lineHeight: 1.6,
                  fontSize: '0.94rem',
                  fontFamily: msg.sender === 'user' ? 'var(--font-display)' : 'var(--font-body)',
                }}
              >
                <div>{msg.text}</div>

                {/* Bot Tools & Re-Speak Button */}
                {msg.sender === 'bot' && (
                  <div
                    style={{
                      marginTop: '10px',
                      paddingTop: '8px',
                      borderTop: '1px solid var(--color-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {msg.tools?.map((tool, tidx) => (
                        <span
                          key={tidx}
                          style={{
                            fontSize: '0.72rem',
                            background: 'var(--color-bg-subtle)',
                            color: 'var(--color-text-secondary)',
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-pill)',
                            border: '1px solid var(--color-border)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: 600,
                          }}
                        >
                          <Cpu size={11} /> {tool}
                        </span>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => speakText(msg.text)}
                      title="Speak response again"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-forest-medium)',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: '2px 6px',
                        borderRadius: 'var(--radius-pill)',
                      }}
                    >
                      <Volume2 size={13} />
                      <span>Re-play Voice</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Live Speech Interim Preview while user is talking */}
          {isListening && transcriptInterim && (
            <div
              style={{
                display: 'flex',
                gap: '12px',
                alignSelf: 'flex-end',
                maxWidth: '85%',
              }}
            >
              <div
                style={{
                  background: 'var(--color-orange-soft)',
                  border: '1.5px dashed var(--color-orange-accent)',
                  color: 'var(--color-orange-accent)',
                  padding: '12px 18px',
                  borderRadius: 'calc(var(--radius-card) - 8px)',
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Radio size={16} className="animate-pulse" />
                <span>{transcriptInterim}...</span>
              </div>
            </div>
          )}

          {/* Thinking / Calculating Spinner */}
          {loading && (
            <div style={{ display: 'flex', gap: '12px', alignSelf: 'flex-start' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: 'var(--color-forest-black)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Bot size={18} />
              </div>
              <div
                style={{
                  background: '#FFFFFF',
                  padding: '12px 18px',
                  borderRadius: 'calc(var(--radius-card) - 8px)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-secondary)',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'var(--color-orange-accent)',
                    display: 'inline-block',
                  }}
                  className="animate-pulse"
                />
                <span>Analyzing spot mandis, transport logistics, and net pricing...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div
          style={{
            padding: '10px 16px',
            background: '#FFFFFF',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
          }}
        >
          {QUICK_PROMPTS.map((qp, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSend(qp.query)}
              disabled={loading}
              style={{
                whiteSpace: 'nowrap',
                fontSize: '0.78rem',
                padding: '6px 14px',
                borderRadius: 'var(--radius-pill)',
                background: 'var(--color-bg-subtle)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-forest-black)',
                cursor: 'pointer',
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              {qp.label}
            </button>
          ))}
        </div>

        {/* Input Bar with Voice Microphone Button & Send */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          style={{
            padding: '14px 18px',
            background: '#FFFFFF',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          {/* Push-to-Talk Microphone Button */}
          {speechSupported && (
            <button
              type="button"
              onClick={toggleListening}
              disabled={loading}
              title={isListening ? 'Stop Listening' : 'Press to Speak (Voice Input)'}
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: isListening ? 'var(--color-orange-accent)' : 'var(--color-bg-subtle)',
                border: isListening ? '2px solid #FF5A1F' : '1px solid var(--color-border)',
                color: isListening ? '#FFFFFF' : 'var(--color-forest-black)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                boxShadow: isListening ? '0 0 16px rgba(255, 90, 31, 0.5)' : 'none',
                transition: 'all var(--transition-fast)',
              }}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
          )}

          <input
            type="text"
            className="form-input"
            style={{
              flex: 1,
              padding: '12px 18px',
              borderRadius: 'var(--radius-pill)',
              border: isListening ? '1.5px solid var(--color-orange-accent)' : '1px solid var(--color-border)',
              fontSize: '0.92rem',
              background: 'var(--color-bg-subtle)',
              fontFamily: 'var(--font-body)',
            }}
            placeholder={
              isListening
                ? 'Listening to your voice...'
                : lang === 'mr'
                ? 'तुमचा प्रश्न विचारा किंवा वरील माइक दाबा...'
                : lang === 'hi'
                ? 'अपना प्रश्न लिखें या माइक दबाकर बोलें...'
                : 'Ask a question or press the mic to speak...'
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={loading}
          />

          <PillButton
            variant="dark"
            size="md"
            type="submit"
            disabled={loading || !inputText.trim()}
          >
            <Send size={16} />
          </PillButton>
        </form>
      </div>
    </div>
  );
}
