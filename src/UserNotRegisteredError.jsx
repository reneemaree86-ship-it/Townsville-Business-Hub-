import React from 'react';

export default function UserNotRegisteredError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <div className="w-full max-w-md bg-card text-card-foreground rounded-lg border shadow-sm p-8 text-center">
        <h2 className="text-xl font-semibold mb-2">Account Not Registered</h2>
        <p className="text-muted-foreground">Your account has not been set up yet. Please contact the administrator to get access.</p>
      </div>
    </div>
  );
}
