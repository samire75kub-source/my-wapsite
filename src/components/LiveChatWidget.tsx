import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  X, 
  Bot, 
  User, 
  Sparkles, 
  ChevronDown,
  CreditCard,
  ShieldCheck
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
}

export const LiveChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'bot',
      text: 'Hello! Welcome to NexusHost Global 24/7 Support. How can I help you today? Ask about bKash/Nagad upgrades, live edge deployment, or sandboxed execution.',
      time: 'Just now'
    }
  ]);
  const [inputVal, setInputVal] = useState('');

  const quickPrompts = [
    'How do I pay with bKash / Nagad?',
    'Where is my live hosted URL?',
    'How does JavaScript sandboxing work?',
    'What are the free limits?'
  ];

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || inputVal).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: 'u_' + Date.now(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputVal('');

    // Automated Assistant Intelligence
    setTimeout(() => {
      let reply = "Our global edge network is operating at 100% capacity. You can deploy any HTML/CSS/JS file right now via our Cloud IDE!";
      const q = query.toLowerCase();

      if (q.includes('bkash') || q.includes('nagad') || q.includes('pay') || q.includes('price')) {
        reply = "To upgrade via bKash or Nagad, click 'bKash/Nagad Upgrade' in the navbar or your dashboard. Send ৳550 for Pro or ৳1,650 for Enterprise to our official merchant numbers (bKash: 01700-112233, Nagad: 01900-445566) and submit your TrxID. Activation is verified within 1-5 minutes!";
      } else if (q.includes('url') || q.includes('domain') || q.includes('view') || q.includes('subdomain')) {
        reply = "Every hosted project generates an instant live edge URL: yoursite.com/view/username/project-slug. It is globally reachable in milliseconds!";
      } else if (q.includes('sandbox') || q.includes('security') || q.includes('iframe') || q.includes('malware')) {
        reply = "All code executes inside a hardened, isolated sandbox iframe with real-time console log bridging. In addition, our automated malware scanner checks all uploaded files for crypto-miners and phishing scripts before deployment.";
      } else if (q.includes('limit') || q.includes('free') || q.includes('quota')) {
        reply = "Free accounts get up to 5 hosted projects and 50MB storage. Pro Developer gives 50 projects and 5GB storage, while Enterprise Cloud offers 9,999+ projects and 50GB storage.";
      }

      const botMsg: ChatMessage = {
        id: 'b_' + Date.now(),
        sender: 'bot',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    }, 600);
  };

  return (
    <div className="fixed bottom-6 left-6 z-40">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-2xl shadow-cyan-500/30 transition-all transform hover:scale-105 active:scale-95"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5 fill-current" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <span>Live Support Chat</span>
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[480px] animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  Nexus AI Support Bot
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </h4>
                <p className="text-[10px] text-slate-400">bKash/Nagad & Hosting Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-[#080d1a]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'bot' && (
                  <div className="w-6 h-6 rounded-md bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 text-xs mt-1">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] p-2.5 rounded-xl text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-cyan-500 text-slate-950 font-medium rounded-tr-none'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}
                >
                  <p>{m.text}</p>
                  <span className={`block text-[9px] mt-1 ${m.sender === 'user' ? 'text-slate-800 text-right' : 'text-slate-500'}`}>
                    {m.time}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Questions Pills */}
          <div className="px-3 py-2 bg-slate-950/80 border-t border-slate-800 flex gap-1.5 overflow-x-auto shrink-0 text-[10px] scrollbar-none">
            {quickPrompts.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="whitespace-nowrap px-2 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-cyan-500/40 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-2.5 bg-slate-950 border-t border-slate-800 flex items-center gap-2 shrink-0">
            <input
              type="text"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
              placeholder="Ask anything about hosting or payments..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-500"
            />
            <button
              onClick={() => handleSend()}
              className="p-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl transition-colors shrink-0 font-bold"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
