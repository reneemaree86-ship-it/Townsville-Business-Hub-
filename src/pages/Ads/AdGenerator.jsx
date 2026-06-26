import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Megaphone, Copy, Loader2, Trash2, Plus } from 'lucide-react';

export default function AdGenerator() {
  const { activeBusiness } = useOutletContext();
  const bid = activeBusiness?.id;
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [serviceFocus, setServiceFocus] = useState('');
  const [suburbs, setSuburbs] = useState('');
  const [notes, setNotes] = useState('');

  const { data: drafts = [] } = useQuery({
    queryKey: ['ad-drafts', bid],
    queryFn: () => bid ? base44.entities.AdDraft.filter({ business_id: bid }, '-created_date', 50) : [],
    enabled: !!bid,
  });

  const generateMutation = useMutation({
    mutationFn: () => base44.functions.invoke('generateAd', {
      business_id: bid,
      service_focus: serviceFocus,
      suburbs: suburbs.split(',').map(s => s.trim()),
      notes: notes,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ad-drafts'] }); setServiceFocus(''); setSuburbs(''); setNotes(''); setShowForm(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.AdDraft.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ad-drafts'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.AdDraft.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ad-drafts'] }),
  });

  if (!activeBusiness) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ad Generator"
        description="Generate and manage ad copy for local services"
        business={activeBusiness}
        actions={
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Generate Ad
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Generate New Ad</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs">Service Focus</Label>
                  <Input value={serviceFocus} onChange={e => setServiceFocus(e.target.value)} placeholder="e.g., House Cleaning, Window Washing" className="h-8 text-xs mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Target Suburbs (comma-separated)</Label>
                  <Input value={suburbs} onChange={e => setSuburbs(e.target.value)} placeholder="e.g., Townsville, Aitkenvale, Thuringowa" className="h-8 text-xs mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Additional Notes</Label>
                  <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any special features or promotions" rows={3} className="text-xs mt-1" />
                </div>
                <Button onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending || !serviceFocus.trim()} className="w-full">
                  {generateMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-2" />Generating...</>
                  ) : (
                    <><Megaphone className="w-4 h-4 mr-2" />Generate Ad</>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard label="Total Ads" value={drafts.length} icon={Megaphone} />
        <StatCard label="Draft" value={drafts.filter(d => d.status === 'draft').length} />
        <StatCard label="Published" value={drafts.filter(d => d.status === 'published').length} color="text-emerald-500" />
      </div>

      <div className="space-y-3">
        {drafts.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-xs text-muted-foreground">No ads yet. Click "Generate Ad" to create one.</CardContent></Card>
        ) : (
          drafts.map(draft => (
            <Card key={draft.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-sm">{draft.service_focus}</CardTitle>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{draft.suburbs?.join(', ')}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1" onClick={() => navigator.clipboard.writeText(draft.ad_copy)}>
                      <Copy className="w-3 h-3" /> Copy
                    </Button>
                    <Button size="sm" variant="destructive" className="h-7 text-[10px]" disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate(draft.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs bg-muted/40 p-3 rounded whitespace-pre-wrap">{draft.ad_copy}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
