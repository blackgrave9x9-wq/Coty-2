// src/components/AIConcierge.tsx
import React, { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import ReactMarkdown from 'react-markdown';
import { t } from '../i18n';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIConcierge({ user, products, lang }: { user: any, products: any[], lang: string }) {
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', content: lang === 'sw' ? "Habari! Mimi ni LYRA, msaidizi wako wa Coty Luxury. Nikupe nini leo?" : "Hi! I'm LYRA, your Coty Luxury AI Assistant. What can I help you with today?" }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const systemPrompt = `You are "LYRA", the Coty Luxury AI Assistant. ALWAYS use Swahili.`;

      // HII NDIO URL YAKO HALISI - HAKUNA PLACEHOLDER TENA
      const response = await fetch('https://cotycostumerservice.blackgrave9x9.workers.dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: "user", content: userMessage }
          ]
        })
      });

      if (!response.ok) throw new Error(`Status ${response.status}`);

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.choices[0].message.content }]);
    } catch (error) {
      console.error("AI Error Details:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: `Samahani, nimepata hitilafu. (Details: ${error.message})` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="h-64 overflow-y-auto mb-4 border p-2">
        {messages.map((m, i) => <p key={i}><strong>{m.role}:</strong> {m.content}</p>)}
      </div>
      <input value={input} onChange={(e) => setInput(e.target.value)} className="border p-2 w-full" placeholder="Andika ujumbe..." />
      <button onClick={handleSend} className="bg-blue-500 text-white p-2 mt-2 w-full">Tuma</button>
    </div>
  );
}
