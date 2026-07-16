import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, BarChart2, Mic, MicOff, Volume2, VolumeX, Settings, X, Menu, BrainCircuit, AlertTriangle } from 'lucide-react';
import styles from './AiCeoMode.module.css';
import { useBusinessData } from '../context/BusinessDataContext';
import { Dropdown } from '../components/ui/Dropdown';
import { ChatSidebar } from '../components/chat/ChatSidebar';
import { chatService, getLocalConversations } from '../lib/chatService';
import type { Conversation } from '../lib/chatService';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  hasChart?: boolean;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const AiCeoMode: React.FC = () => {
  const { 
    healthScore, totalRevenue, activeCustomers, monthlyExpenses, cashFlow, documents, aiContext,
    monthlyChartData, topProductsData, revenueSourcesData, inventoryChartData 
  } = useBusinessData();
  
  // Optimistic initial load from cache
  const [conversations, setConversations] = useState<Conversation[]>(getLocalConversations());
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    getLocalConversations().length > 0 ? getLocalConversations()[0].id : null
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [language, setLanguage] = useState('en-US');
  const [isTyping, setIsTyping] = useState(false);
  
  const [groqApiKey, setGroqApiKey] = useState<string>(() => localStorage.getItem('takeover_groq_api_key') || '');
  const [showSettings, setShowSettings] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const languages = [
    { code: 'en-US', name: 'English' },
    { code: 'es-ES', name: 'Español' },
    { code: 'fr-FR', name: 'Français' },
    { code: 'de-DE', name: 'Deutsch' },
    { code: 'zh-CN', name: '中文' },
    { code: 'hi-IN', name: 'हिन्दी' },
    { code: 'te-IN', name: 'తెలుగు' },
    { code: 'ar-SA', name: 'العربية' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSaveApiKey = (key: string) => {
    setGroqApiKey(key);
    localStorage.setItem('takeover_groq_api_key', key);
  };

  // Background fetch to update conversations
  useEffect(() => {
    let isMounted = true;
    chatService.getConversations().then(data => {
      if (!isMounted) return;
      setConversations(data);
      setIsLoadingConversations(false);
      
      // If we didn't have an active convo from cache, and we fetched some, set it
      if (data.length > 0 && !activeConversationId) {
        setActiveConversationId(data[0].id);
      } else if (data.length === 0) {
        handleNewChat();
      }
    });
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (!activeConversationId) return;
    chatService.getMessages(activeConversationId).then(data => {
      if (data.length === 0) {
        setMessages([{
          id: `ai-intro-${Date.now()}`,
          sender: 'ai',
          text: 'Hello. I am PulseAI. I am currently monitoring all real-time data metrics. What strategic objective shall we focus on today?'
        }]);
      } else {
        setMessages(data.map(m => ({
          id: m.id,
          sender: m.role === 'assistant' ? 'ai' : 'user',
          text: m.content
        })));
      }
    });
  }, [activeConversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language;
    }
  }, [language]);

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
      if (recognitionRef.current) recognitionRef.current.stop();
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

  const handleNewChat = async () => {
    const convo = await chatService.createConversation();
    setConversations(prev => [convo, ...prev]);
    setActiveConversationId(convo.id);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const handleDeleteChat = async (id: string) => {
    await chatService.deleteConversation(id);
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConversationId === id) {
      const remaining = conversations.filter(c => c.id !== id);
      if (remaining.length > 0) setActiveConversationId(remaining[0].id);
      else handleNewChat();
    }
  };

  const handleRenameChat = async (id: string, newTitle: string) => {
    await chatService.updateConversationTitle(id, newTitle);
    setConversations(prev => prev.map(c => c.id === id ? { ...c, title: newTitle } : c));
  };

  const generateAutoTitle = async (firstMessage: string, convoId: string) => {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${groqApiKey.trim()}`
        },
        body: JSON.stringify({
           model: 'llama-3.1-8b-instant',
           messages: [
             { role: 'system', content: 'You generate short titles for conversations. Output ONLY the title, max 5 words, no quotes.' },
             { role: 'user', content: firstMessage }
           ]
        })
      });
      if (response.ok) {
        const data = await response.json();
        const title = data.choices[0].message.content.trim().replace(/['"]/g, '');
        await handleRenameChat(convoId, title);
      }
    } catch(e) {}
  };

  const streamAiResponse = async (userText: string, chatHistory: Message[], aiMsgId: string, currentConvoId: string) => {
    const generateMockResponse = (input: string) => {
      const lowerInput = input.toLowerCase();
      const responses: Record<string, string[]> = {
        revenue: ["(Demo Mode) Revenue is trending positively this quarter. Our predictive models suggest a 12% increase by year-end."],
        expense: ["(Demo Mode) Operating expenses are slightly higher than projected due to increased software licensing costs."],
        customer: ["(Demo Mode) Customer retention is strong at 92%. However, new acquisition has slowed down."],
        inventory: ["(Demo Mode) We have a potential stockout risk for our top-selling product."],
        general: ["(Demo Mode) According to the latest data pulse, we are on track to meet our annual targets, provided we keep expenses in check."]
      };
      let category = 'general';
      if (lowerInput.includes('revenue') || lowerInput.includes('sale') || lowerInput.includes('profit')) category = 'revenue';
      else if (lowerInput.includes('expense') || lowerInput.includes('cost') || lowerInput.includes('spend')) category = 'expense';
      else if (lowerInput.includes('customer') || lowerInput.includes('client') || lowerInput.includes('user')) category = 'customer';
      else if (lowerInput.includes('inventory') || lowerInput.includes('stock') || lowerInput.includes('product')) category = 'inventory';
      return responses[category][Math.floor(Math.random() * responses[category].length)];
    };

    let finalResponseText = '';

    try {
      const systemPrompt = `You are an elite AI Business Executive Assistant.
CRITICAL RULES:
1. Speak exactly like a real human having a direct conversation. Use a warm, natural, and highly realistic conversational tone. 
2. DO NOT use ANY markdown formatting (no asterisks **, no hash tags #, no bullet points). Keep responses concise.
3. You MUST NEVER calculate business health, scores, revenue, or metrics. You MUST ONLY explain the provided JSON object and any Business Data explicitly provided by the user.
4. NEVER invent risks, weaknesses, strengths, or inventory problems. If information is not in the JSON or the user's prompt, say "Insufficient data".
5. Every recommendation must be supported by the supplied metrics. Never contradict numerical values.
6. ALL financial numbers in the data are in Indian Rupees (INR). You MUST ALWAYS use the ₹ symbol or the word "Rupees" when discussing money. Never use dollars or $.

CURRENT BUSINESS INTELLIGENCE CONTEXT (STRICT TRUTH):
${JSON.stringify({
  aiContext: aiContext || { status: 'No data' },
  topProducts: topProductsData || [],
  monthlySales: monthlyChartData ? monthlyChartData.filter(m => m.actual) : [],
  revenueSources: revenueSourcesData || []
}, null, 2)}

IMPORTANT: You must provide your entire response translated into the following language code: ${language}`;
      
      const messagesPayload = chatHistory
        .filter(msg => msg.id !== '1' && msg.id !== aiMsgId && msg.text && !msg.text.includes('Hello. I am PulseAI.')) 
        .map(msg => ({
          role: msg.sender === 'ai' ? 'assistant' : 'user',
          content: msg.text
        }));

      // --- Query Classification and Data Interception Engine ---
      const interceptAnalyticalQuery = (query: string): string | null => {
        const q = query.toLowerCase();
        
        // 1. Product Analysis (aiContext)
        if (q.includes('product') || q.includes('project') || q.includes('item') || q.includes('sold') || q.includes('revenue')) {
          if (!aiContext || (!aiContext.topProducts && !aiContext.highestSoldProduct && !aiContext.highestRevenueProduct)) {
             return "The uploaded data does not contain enough information to determine product performance.";
          }
          
          if (q.includes('highest') || q.includes('best') || q.includes('most') || q.includes('top') || q.includes('fast')) {
            if (q.includes('revenue') || q.includes('gross') || q.includes('money')) {
              if (aiContext.highestRevenueProduct) {
                return `Highest Revenue Product:\nProduct Name: ${aiContext.highestRevenueProduct.name}\nRevenue: ₹${aiContext.highestRevenueProduct.revenue.toLocaleString()}`;
              }
            } else if (aiContext.highestSoldProduct) {
              return `Highest Sold Product:\nProduct Name: ${aiContext.highestSoldProduct.name}\nQuantity Sold: ${aiContext.highestSoldProduct.quantity.toLocaleString()}`;
            }
          }
          if (q.includes('lowest') || q.includes('worst') || q.includes('least') || q.includes('bottom') || q.includes('slow')) {
            if (q.includes('revenue') || q.includes('gross') || q.includes('money')) {
              if (aiContext.lowestRevenueProduct) {
                return `Lowest Revenue Product:\nProduct Name: ${aiContext.lowestRevenueProduct.name}\nRevenue: ₹${aiContext.lowestRevenueProduct.revenue.toLocaleString()}`;
              }
            } else if (aiContext.lowestSoldProduct) {
              return `Lowest Sold Product:\nProduct Name: ${aiContext.lowestSoldProduct.name}\nQuantity Sold: ${aiContext.lowestSoldProduct.quantity.toLocaleString()}`;
            }
          }
        }
        
        // 2. Time/Month Analysis (monthlyChartData)
        if (q.includes('month') || q.includes('when')) {
          if (!monthlyChartData || monthlyChartData.length === 0) return "The uploaded data does not contain enough information to determine monthly trends.";
          
          const validMonths = monthlyChartData.filter(m => m.actual && m.revenue !== null);
          if (validMonths.length === 0) return "There is no actual monthly data available to answer this question.";
          
          if (q.includes('revenue') || q.includes('sales')) {
            const sortedRev = [...validMonths].sort((a, b) => (b.revenue || 0) - (a.revenue || 0));
            if (q.includes('highest') || q.includes('best') || q.includes('most')) {
              return `Highest Revenue Month:\nMonth: ${sortedRev[0].month}\nRevenue: ₹${(sortedRev[0].revenue || 0).toLocaleString()}`;
            }
            if (q.includes('lowest') || q.includes('worst') || q.includes('least')) {
              const lowest = sortedRev[sortedRev.length - 1];
              return `Lowest Revenue Month:\nMonth: ${lowest.month}\nRevenue: ₹${(lowest.revenue || 0).toLocaleString()}`;
            }
          }
          if (q.includes('profit')) {
            const sortedProfit = [...validMonths].sort((a, b) => (b.profit || 0) - (a.profit || 0));
            if (q.includes('highest') || q.includes('best') || q.includes('most')) {
              return `Highest Profit Month:\nMonth: ${sortedProfit[0].month}\nProfit: ₹${(sortedProfit[0].profit || 0).toLocaleString()}`;
            }
            if (q.includes('lowest') || q.includes('worst') || q.includes('least')) {
              const lowest = sortedProfit[sortedProfit.length - 1];
              return `Lowest Profit Month:\nMonth: ${lowest.month}\nProfit: ₹${(lowest.profit || 0).toLocaleString()}`;
            }
          }
          if (q.includes('expense') || q.includes('cost')) {
            const sortedExp = [...validMonths].sort((a, b) => (b.expenses || 0) - (a.expenses || 0));
            if (q.includes('highest') || q.includes('most')) {
              return `Highest Expense Month:\nMonth: ${sortedExp[0].month}\nExpenses: ₹${(sortedExp[0].expenses || 0).toLocaleString()}`;
            }
            if (q.includes('lowest') || q.includes('least')) {
              const lowest = sortedExp[sortedExp.length - 1];
              return `Lowest Expense Month:\nMonth: ${lowest.month}\nExpenses: ₹${(lowest.expenses || 0).toLocaleString()}`;
            }
          }
        }
        
        // 3. Category/Source Analysis (revenueSourcesData)
        if (q.includes('category') || q.includes('source') || q.includes('channel')) {
          if (!revenueSourcesData || revenueSourcesData.length === 0) return "The uploaded data does not contain enough information to determine category performance.";
          
          const sortedCat = [...revenueSourcesData].sort((a, b) => b.value - a.value);
          if (q.includes('highest') || q.includes('best') || q.includes('most')) {
            return `Best Performing Category:\nCategory Name: ${sortedCat[0].name}\nRevenue Generated: ₹${sortedCat[0].value.toLocaleString()}`;
          }
          if (q.includes('lowest') || q.includes('worst') || q.includes('least')) {
            const lowest = sortedCat[sortedCat.length - 1];
            return `Worst Performing Category:\nCategory Name: ${lowest.name}\nRevenue Generated: ₹${lowest.value.toLocaleString()}`;
          }
        }

        return null;
      };

      const analyticalData = interceptAnalyticalQuery(userText);
      let augmentedUserPrompt = userText;
      
      if (analyticalData) {
        augmentedUserPrompt = `Business Data:\n${analyticalData}\n\nQuestion:\n${userText}\n\nInstruction: Answer the user's question by explicitly stating the intercepted Business Data above, then explain why this metric might be the case and provide strategic recommendations to improve it. Do not attempt to calculate the numbers yourself, trust the Business Data provided completely.`;
      }

      messagesPayload.unshift({ role: 'system', content: systemPrompt });
      messagesPayload.push({ role: 'user', content: augmentedUserPrompt });

      const url = groqApiKey ? 'https://api.groq.com/openai/v1/chat/completions' : 'http://localhost:11434/api/chat';
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (groqApiKey) headers['Authorization'] = `Bearer ${groqApiKey.trim()}`;
      
      const bodyPayload = groqApiKey 
        ? { model: 'llama-3.1-8b-instant', messages: messagesPayload, stream: true }
        : { model: 'llama3', messages: messagesPayload, stream: true };

      const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(bodyPayload) });
      
      if (!response.ok) {
        let errorText = await response.text();
        try {
           const parsed = JSON.parse(errorText);
           if (parsed.error && parsed.error.message) errorText = parsed.error.message;
        } catch(e) {}
        throw new Error(groqApiKey ? `Groq API Failed: ${errorText}` : "Ollama API Failed");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      
      if (!reader) throw new Error("No reader available");

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
            let textChunk = "";
            if (groqApiKey) {
              if (trimmedLine === 'data: [DONE]') continue;
              if (trimmedLine.startsWith('data: ')) {
                const data = JSON.parse(trimmedLine.slice(6));
                if (data.choices && data.choices[0].delta && data.choices[0].delta.content) {
                  textChunk = data.choices[0].delta.content;
                }
              }
            } else {
              const data = JSON.parse(trimmedLine);
              if (data.message && data.message.content) textChunk = data.message.content;
            }
            
            if (textChunk) {
              textChunk = textChunk.replace(/\*\*/g, '').replace(/\*/g, '').replace(/#/g, '');
              finalResponseText += textChunk;
              setIsTyping(false);
              setMessages(prev => {
                const exists = prev.some(msg => msg.id === aiMsgId);
                if (exists) return prev.map(msg => msg.id === aiMsgId ? { ...msg, text: msg.text + textChunk } : msg);
                return [...prev, { id: aiMsgId, sender: 'ai', text: textChunk }];
              });
            }
          } catch (e) {
            console.warn('Error parsing chunk:', e);
          }
        }
      }

    } catch (error: any) {
      console.error("API Error:", error);
      setIsTyping(false);
      let errorResponse = "";
      if (groqApiKey) {
        errorResponse = `(Error) Groq API connection failed. Check your API key or console for details. Error: ${error.message}`;
      } else {
        errorResponse = generateMockResponse(userText);
      }
      finalResponseText = errorResponse;
      
      setMessages(prev => {
        const exists = prev.some(msg => msg.id === aiMsgId);
        if (!exists) return [...prev, { id: aiMsgId, sender: 'ai', text: errorResponse }];
        return prev.map(msg => msg.id === aiMsgId ? { ...msg, text: errorResponse } : msg);
      });
    }

    // Save final AI response to DB
    if (finalResponseText) {
      await chatService.saveMessage({
        conversation_id: currentConvoId,
        role: 'assistant',
        content: finalResponseText
      });
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping || !activeConversationId) return;
    
    const userText = inputValue;
    const currentConvoId = activeConversationId;
    
    // Auto title generation if new conversation
    const activeConvo = conversations.find(c => c.id === currentConvoId);
    if (activeConvo && activeConvo.title === 'New Conversation' && groqApiKey) {
      generateAutoTitle(userText, currentConvoId);
    }

    // Save User Msg
    const dbUserMsg = await chatService.saveMessage({
      conversation_id: currentConvoId,
      role: 'user',
      content: userText
    });
    
    const newUserMsg: Message = { id: dbUserMsg.id, sender: 'user', text: userText };
    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');

    if (isListening && recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
      setIsListening(false);
    }
    
    setIsTyping(true);
    const aiMsgId = `ai-${Date.now()}`;
    
    try {
      await streamAiResponse(userText, messages, aiMsgId, currentConvoId);
    } catch (error) {
      console.error("Fatal Error in AI response:", error);
      setIsTyping(false);
    }
  };

  return (
    <div className={styles.container}>
      <ChatSidebar 
        isOpen={sidebarOpen}
        isLoading={isLoadingConversations}
        conversations={conversations}
        activeId={activeConversationId}
        onSelect={(id) => {
          setActiveConversationId(id);
          if (window.innerWidth < 768) setSidebarOpen(false);
        }}
        onNew={handleNewChat}
        onDelete={handleDeleteChat}
        onRename={handleRenameChat}
      />

      <div className={styles.mainContent}>
        <header className={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              className={styles.settingsBtn} 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title="Toggle Sidebar"
            >
              <Menu size={22} color="#fff" />
            </button>
            <div className={styles.headerTitle}>
              <BrainCircuit className={styles.headerIcon} />
              <h1 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '4px' }}>PulseAI</h1>
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Your AI Business Intelligence Assistant</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '140px' }}>
              <Dropdown
                value={language}
                onChange={(val) => setLanguage(val as string)}
                options={languages.map(lang => ({ value: lang.code, label: lang.name }))}
              />
            </div>
            <button 
              className={styles.settingsBtn} 
              onClick={() => setShowSettings(!showSettings)}
              title="Configure AI API"
            >
              <Settings size={22} color={groqApiKey ? "var(--accent-success)" : "#9ca3af"} />
            </button>
          </div>
        </header>

        {showSettings && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className={styles.settingsPanel}
          >
            <div className={styles.settingsHeader}>
              <h3>Cloud AI Integration (Groq + RAG)</h3>
              <button onClick={() => setShowSettings(false)} className={styles.closeBtn}><X size={18} /></button>
            </div>
            <div className={styles.apiWarning}>
              <AlertTriangle size={20} className={styles.warningIcon} />
              <p>Enter your free Groq API key to unlock the true power of PulseAI instead of using the mock offline demo. Your key is stored safely and locally in your browser.</p>
            </div>
            <div className={styles.inputGroup}>
              <input 
                type="password" 
                placeholder="gsk_..." 
                value={groqApiKey} 
                onChange={(e) => handleSaveApiKey(e.target.value)} 
                className={styles.apiKeyInput}
              />
            </div>
          </motion.div>
        )}

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
              placeholder={isListening ? "Listening..." : "Ask PulseAI..."} 
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
    </div>
  );
};
