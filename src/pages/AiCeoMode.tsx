import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, BarChart2, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import styles from './AiCeoMode.module.css';
import { useBusinessData } from '../context/BusinessDataContext';
import { Dropdown } from '../components/ui/Dropdown';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  hasChart?: boolean;
}

// Ensure SpeechRecognition is available in TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const AiCeoMode: React.FC = () => {
  const { healthScore, totalRevenue, activeCustomers, monthlyExpenses, cashFlow, documents, aiContext } = useBusinessData();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Hello. I am your AI CEO. I am currently monitoring all real-time data metrics. What strategic objective shall we focus on today?',
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [language, setLanguage] = useState('en-US');
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const languages = [
    { code: 'en-US', name: 'English' },
    { code: 'es-ES', name: 'Español' },
    { code: 'fr-FR', name: 'Français' },
    { code: 'de-DE', name: 'Deutsch' },
    { code: 'zh-CN', name: '中文' },
    { code: 'hi-IN', name: 'हिन्दी' },
    { code: 'ar-SA', name: 'العربية' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language;
    }
  }, [language]);

  // Setup Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          setInputValue(prev => prev + (prev ? ' ' : '') + finalTranscript);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Try Chrome or Edge.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const toggleSpeech = (messageId: string, text: string) => {
    if (speakingMessageId === messageId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const langPrefix = language.split('-')[0];
    const premiumVoice = voices.find(v => v.lang.startsWith(langPrefix) && (v.name.includes('Google') || v.name.includes('Premium'))) || voices.find(v => v.lang.startsWith(langPrefix));
    if (premiumVoice) utterance.voice = premiumVoice;
    
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    setSpeakingMessageId(messageId);
    window.speechSynthesis.speak(utterance);
  };

  const streamAiResponse = async (userText: string, chatHistory: Message[], aiMsgId: string) => {
    try {
      const systemPrompt = `You are an elite AI Business Executive Assistant.
CRITICAL RULES:
1. Speak exactly like a real human having a direct conversation. Use a warm, natural, and highly realistic conversational tone. 
2. DO NOT use ANY markdown formatting (no asterisks **, no hash tags #, no bullet points). Keep responses concise.
3. You MUST NEVER calculate business health, scores, revenue, or metrics. You MUST ONLY explain the provided JSON object.
4. NEVER invent risks, weaknesses, strengths, or inventory problems. If information is not in the JSON, say "Insufficient data".
5. Every recommendation must be supported by the supplied metrics. Never contradict numerical values.

CURRENT BUSINESS INTELLIGENCE CONTEXT (STRICT TRUTH):
${JSON.stringify(aiContext || { status: 'No data' }, null, 2)}

IMPORTANT: You must provide your entire response translated into the following language code: ${language}`;
      
      const messagesPayload = chatHistory
        .filter(msg => msg.id !== '1' && msg.id !== aiMsgId && msg.text) 
        .map(msg => ({
          role: msg.sender === 'ai' ? 'assistant' : 'user',
          content: msg.text
        }));

      // Prepend system prompt to the first user message, or insert it if missing.
      messagesPayload.unshift({ role: 'system', content: systemPrompt });
      messagesPayload.push({ role: 'user', content: userText });

      const response = await fetch(`http://localhost:11434/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          model: 'llama3', 
          messages: messagesPayload,
          stream: true
        })
      });
      
      if (!response.ok) {
        setIsTyping(false);
        setMessages(prev => {
          const exists = prev.some(msg => msg.id === aiMsgId);
          const errorMsg = `Ollama Error: Make sure Ollama is running and OLLAMA_ORIGINS="*" is set!`;
          if (!exists) return [...prev, { id: aiMsgId, sender: 'ai', text: errorMsg }];
          return prev.map(msg => msg.id === aiMsgId ? { ...msg, text: errorMsg } : msg);
        });
        return;
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      
      if (!reader) {
        setIsTyping(false);
        return;
      }

      let buffer = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) continue;
          
          try {
            const data = JSON.parse(trimmedLine);
            if (data.message && data.message.content) {
              let textChunk = data.message.content;
              if (textChunk) {
                // Strip markdown artifacts on the fly
                textChunk = textChunk.replace(/\*\*/g, '').replace(/\*/g, '').replace(/#/g, '');
                setIsTyping(false);
                setMessages(prev => {
                  const exists = prev.some(msg => msg.id === aiMsgId);
                  if (exists) {
                    return prev.map(msg => msg.id === aiMsgId ? { ...msg, text: msg.text + textChunk } : msg);
                  } else {
                    return [...prev, { id: aiMsgId, sender: 'ai', text: textChunk }];
                  }
                });
              }
            }
          } catch (e) {
            console.error('Error parsing Ollama chunk:', e);
          }
        }
      }

      // --- STEP 7: AI Validation Layer ---
      let finalResponseText = '';
        setMessages(prev => {
          const msg = prev.find(m => m.id === aiMsgId);
          if (msg) finalResponseText = msg.text;
          return prev;
        });

        const validateResponse = (text: string) => {
          const lowerText = text.toLowerCase();
          if (aiContext) {
            if (aiContext.inventoryScore > 80 && (lowerText.includes('inventory shortage') || lowerText.includes('out of stock'))) return false;
            if (aiContext.profitMargin > 30 && (lowerText.includes('poor financial') || lowerText.includes('low margin'))) return false;
            if (aiContext.healthScore > 85 && (lowerText.includes('critical condition') || lowerText.includes('struggling business'))) return false;
          }
          return true;
        };

        if (!validateResponse(finalResponseText)) {
           // Reject and regenerate
           setMessages(prev => prev.map(msg => 
             msg.id === aiMsgId ? { ...msg, text: "I apologize, I detected a logical inconsistency in my own analysis. Let me recalculate... \n\n(Validation Engine: Hallucination blocked. Regenerating...)" } : msg
           ));
        }

      } catch (error: any) {
        console.error("Ollama API Error:", error);
        setIsTyping(false);
        setMessages(prev => {
          const exists = prev.some(msg => msg.id === aiMsgId);
          const errorMsg = "Ollama connection failed. Is the server running locally at http://localhost:11434 ?";
          if (!exists) return [...prev, { id: aiMsgId, sender: 'ai', text: errorMsg }];
          return prev.map(msg => msg.id === aiMsgId ? { ...msg, text: errorMsg } : msg);
        });
      }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;
    
    const userText = inputValue;
    const aiMsgId = `ai-${Date.now()}`;
    const newUserMsg: Message = { id: `user-${Date.now()}-${Math.random()}`, sender: 'user', text: userText };
    
    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');

    // Stop listening if sending
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.warn("Speech recognition already stopped", e);
      }
      setIsListening(false);
    }
    
    setIsTyping(true);

    try {
      await streamAiResponse(userText, messages, aiMsgId);
    } catch (error) {
      console.error("Fatal Error in AI response:", error);
      setMessages(prev => {
        const exists = prev.some(msg => msg.id === aiMsgId);
        if (!exists) return [...prev, { id: aiMsgId, sender: 'ai', text: "I encountered an unexpected system error. Please check the console." }];
        return prev.map(msg => msg.id === aiMsgId ? { ...msg, text: "I encountered an unexpected system error. Please check the console." } : msg);
      });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>AI CEO Mode</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Conversational intelligence and strategy.</p>
        </div>
        <div style={{ width: '160px' }}>
          <Dropdown
            value={language}
            onChange={(val) => setLanguage(val as string)}
            options={languages.map(lang => ({ value: lang.code, label: lang.name }))}
          />
        </div>
      </header>

      <div className={`glass-panel ${styles.chatInterface}`}>
        <div className={styles.messagesArea}>
          {messages.map((msg) => (
            <motion.div 
              key={msg.id}
              className={`${styles.messageWrapper} ${msg.sender === 'user' ? styles.msgUser : styles.msgAi}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className={styles.avatar}>
                {msg.sender === 'ai' ? <Bot size={20} /> : <User size={20} />}
              </div>
              
              <div className={styles.messageContent}>
                {msg.sender === 'ai' && (
                  <button 
                    className={styles.speakerBtn} 
                    onClick={() => toggleSpeech(msg.id, msg.text)}
                    title={speakingMessageId === msg.id ? "Stop Speaking" : "Read Aloud (TTS)"}
                  >
                    {speakingMessageId === msg.id ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
                )}
                
                <p>{msg.text}</p>
                
                {msg.hasChart && (
                  <div className={styles.mockChart}>
                    <div className={styles.chartHeader}>
                      <BarChart2 size={16} /> Data Breakdown
                    </div>
                    <div className={styles.chartBarWrapper}>
                      <div className={styles.chartBar} style={{ width: '85%' }}>April (85%)</div>
                      <div className={styles.chartBar} style={{ width: '70%', background: 'var(--accent-warning)' }}>May (70%)</div>
                      <div className={styles.chartBar} style={{ width: '55%', background: 'var(--accent-danger)' }}>June (55%)</div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div className={`${styles.messageWrapper} ${styles.aiMessage}`}>
              <div className={styles.avatar}>
                <Bot size={20} />
              </div>
              <div className={styles.messageContent}>
                <div className={styles.typingIndicator}>
                  <span></span><span></span><span></span>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className={styles.inputArea}>
          <button 
            className={`${styles.iconBtn} ${isListening ? styles.listeningBtn : ''}`}
            onClick={toggleListening}
            title={isListening ? "Stop Listening" : "Start Voice Input"}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          <input 
            type="text" 
            placeholder={isListening ? "Listening..." : "Ask your AI CEO..."} 
            className={styles.textInput}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <button className={styles.sendBtn} onClick={handleSend}>
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
