import React from 'react';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <div className="w-full max-w-md bg-card text-card-foreground rounded-lg border shadow-sm p-8">
        {children}
      </div>
    </div>
  );
}
