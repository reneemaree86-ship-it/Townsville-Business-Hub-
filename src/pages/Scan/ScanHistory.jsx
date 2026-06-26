import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { History } from 'lucide-react';
import { format } from 'date-fns';

export default function ScanHistory() {
  const { activeBusiness } = useOutletContext();
  const bid = activeBusiness?.id;
  const [scanType, setScanType] = useState('all');

  const { data: leadScans = [] } = useQuery({
    queryKey: ['scan-history-leads', bid],
    queryFn: () => bid ? base44.entities.LeadScan.filter({ business_id: bid }, '-created_date', 50) : [],
    enabled: !!bid,
  });

  const { data: seoScans = [] } = useQuery({
    queryKey: ['scan-history-seo', bid],
    queryFn: () => bid ? base44.entities.SeoAudit.filter({ business_id: bid }, '-created_date', 50) : [],
    enabled: !!bid,
  });

  const allScans = [
    ...leadScans.map(s => ({ ...s, type: 'lead', created_date: s.created_date })),
    ...seoScans.map(s => ({ ...s, type: 'seo', created_date: s.created_date })),
  ].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  const filtered = scanType === 'all' ? allScans : allScans.filter(s => s.type === scanType);

  if (!activeBusiness) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Scan History" description="All historical scans and audits" business={activeBusiness} />

      <div className="flex gap-2">
        <Select value={scanType} onValueChange={setScanType}>
          <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Scans</SelectItem>
            <SelectItem value="lead">Lead Scans</SelectItem>
            <SelectItem value="seo">SEO Audits</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-xs text-muted-foreground">No scans found.</CardContent></Card>
        ) : (
          filtered.map((scan, i) => (
            <Card key={`${scan.type}-${scan.id}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <History className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium capitalize">{scan.type} Scan</p>
                      {scan.type === 'lead' && <p className="text-xs text-muted-foreground">{scan.leads_found} leads found</p>}
                      {scan.type === 'seo' && <p className="text-xs text-muted-foreground">{scan.pages_crawled} pages · {scan.issues_found} issues</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {scan.status && <StatusBadge status={scan.status} />}
                    <span className="text-xs text-muted-foreground">{format(new Date(scan.created_date), 'dd MMM HH:mm')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
