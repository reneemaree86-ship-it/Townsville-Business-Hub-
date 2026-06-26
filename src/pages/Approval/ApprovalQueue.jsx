import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import StatCard from '@/components/shared/StatCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckSquare, Eye } from 'lucide-react';

export default function ApprovalQueue() {
  const { activeBusiness } = useOutletContext();
  const bid = activeBusiness?.id;
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState('leads');

  const { data: leadsToApprove = [] } = useQuery({
    queryKey: ['leads-approval', bid],
    queryFn: () => bid ? base44.entities.Lead.filter({ business_id: bid, status: 'needs_approval' }) : [],
    enabled: !!bid,
  });

  const { data: adsToApprove = [] } = useQuery({
    queryKey: ['ads-approval', bid],
    queryFn: () => bid ? base44.entities.AdDraft.filter({ business_id: bid, status: 'draft' }) : [],
    enabled: !!bid,
  });

  const updateLeadMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Lead.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['leads-approval'] }); qc.invalidateQueries({ queryKey: ['leads'] }); },
  });

  const updateAdMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.AdDraft.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ads-approval'] }),
  });

  if (!activeBusiness) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Approval Queue"
        description="Review and approve pending items"
        business={activeBusiness}
      />

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Leads Pending" value={leadsToApprove.length} icon={Eye} color="text-amber-500" />
        <StatCard label="Ads Pending" value={adsToApprove.length} icon={CheckSquare} color="text-blue-500" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="leads">Leads ({leadsToApprove.length})</TabsTrigger>
          <TabsTrigger value="ads">Ads ({adsToApprove.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="leads" className="space-y-3">
          {leadsToApprove.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-xs text-muted-foreground">No leads awaiting approval.</CardContent></Card>
          ) : (
            leadsToApprove.map(lead => (
              <Card key={lead.id}>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{lead.service_needed}</p>
                        <p className="text-xs text-muted-foreground">{lead.name} • {lead.suburb}</p>
                      </div>
                      <p className="text-sm font-bold text-primary">{lead.score}/100</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => updateLeadMutation.mutate({ id: lead.id, data: { status: 'hot' } })}>
                        ✓ Approve as Hot
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => updateLeadMutation.mutate({ id: lead.id, data: { status: 'new' } })}>
                        Mark New
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="ads" className="space-y-3">
          {adsToApprove.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-xs text-muted-foreground">No ads awaiting approval.</CardContent></Card>
          ) : (
            adsToApprove.map(ad => (
              <Card key={ad.id}>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">{ad.service_focus}</p>
                    <p className="text-xs bg-muted/40 p-2 rounded whitespace-pre-wrap max-h-24 overflow-y-auto">{ad.ad_copy}</p>
                    <div className="flex gap-2">
                      <Button size="sm" className="h-7 text-[10px]" onClick={() => updateAdMutation.mutate({ id: ad.id, data: { status: 'published' } })}>
                        ✓ Publish
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => updateAdMutation.mutate({ id: ad.id, data: { status: 'rejected' } })}>
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
