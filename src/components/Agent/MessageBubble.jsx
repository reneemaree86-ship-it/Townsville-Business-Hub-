import React from 'react';

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs p-3 rounded-lg text-xs ${isUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
        {message.content}
      </div>
    </div>
  );
}
