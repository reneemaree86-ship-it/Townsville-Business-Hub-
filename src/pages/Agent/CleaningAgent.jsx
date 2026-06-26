import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, MessageSquare } from 'lucide-react';
import MessageBubble from '@/components/Agent/MessageBubble';

export default function CleaningAgent() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  const startNewConversation = async () => {
    setMessages([{ role: 'assistant', content: 'Hello! I\'m your Cleaning Business Assistant. How can I help you today?' }]);
    setSessionId(Date.now().toString());
  };

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await base44.functions.invoke('agentChat', { session_id: sessionId, message: text });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data?.response || 'No response' }]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, there was an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !loading) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Business Assistant" description="Get help with your cleaning business" />

      <Card className="h-96 flex flex-col">
        <CardHeader className="pb-3 border-b"><CardTitle className="text-sm flex items-center gap-2"><MessageSquare className="w-4 h-4" />Chat with Agent</CardTitle></CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
          {!sessionId ? (
            <div className="flex items-center justify-center h-full">
              <Button onClick={startNewConversation}>Start Conversation</Button>
            </div>
          ) : (
            messages.map((msg, i) => <MessageBubble key={i} message={msg} />)
          )}
        </CardContent>
        {sessionId && (
          <div className="border-t p-3 space-y-2">
            <Textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              rows={2}
              className="text-xs resize-none"
              disabled={loading}
            />
            <Button onClick={() => sendMessage(input)} disabled={loading || !input.trim()} size="sm" className="w-full">
              {loading ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Send className="w-3 h-3 mr-2" />}
              Send
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
