import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function ScanLogPanel({ scanLog, scans }) {
  const [expanded, setExpanded] = useState(false);

  if (!scanLog || scanLog.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Scan Details</CardTitle>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="space-y-1 text-[10px]">
          {scanLog.map((entry, i) => (
            <div key={i} className="p-2 rounded bg-muted/30">
              <p className="font-medium">{entry.source}</p>
              <p className="text-muted-foreground">{entry.message}</p>
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  );
}
