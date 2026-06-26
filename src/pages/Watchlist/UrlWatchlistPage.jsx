import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, ExternalLink, Trash2 } from 'lucide-react';

export default function UrlWatchlistPage() {
  const { activeBusiness } = useOutletContext();
  const bid = activeBusiness?.id;
  const qc = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({ url: '', label: '', platform: '', check_frequency: 'daily' });

  const { data: watchlist = [] } = useQuery({
    queryKey: ['watchlist', bid],
    queryFn: () => bid ? base44.entities.UrlWatchlist.filter({ business_id: bid }) : [],
    enabled: !!bid,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.UrlWatchlist.create({ ...data, business_id: bid, status: 'active' }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['watchlist'] }); setShowDialog(false); setForm({ url: '', label: '', platform: '', check_frequency: 'daily' }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.UrlWatchlist.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['watchlist'] }),
  });

  if (!activeBusiness) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="URL Watchlist"
        description="Monitor URLs for lead opportunities"
        business={activeBusiness}
        actions={
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2" size="sm"><Plus className="w-4 h-4" /> Add URL</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add URL to Watchlist</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">URL</Label>
                  <Input value={form.url} onChange={e => setForm({...form, url: e.target.value})} placeholder="https://example.com" className="h-8 text-xs mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Label</Label>
                  <Input value={form.label} onChange={e => setForm({...form, label: e.target.value})} placeholder="e.g., Gumtree Cleaning" className="h-8 text-xs mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Platform</Label>
                  <Select value={form.platform} onValueChange={v => setForm({...form, platform: v})}>
                    <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gumtree">Gumtree</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="airtasker">Airtasker</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending || !form.url.trim()} className="w-full">
                  {createMutation.isPending ? 'Adding...' : 'Add to Watchlist'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="space-y-3">
        {watchlist.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-xs text-muted-foreground">No URLs on watchlist. Add one to start monitoring.</CardContent></Card>
        ) : (
          watchlist.map(item => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{item.label}</p>
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 mt-0.5">
                      {item.url} <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                    <div className="flex gap-2 mt-1 text-[10px] text-muted-foreground">
                      <span className="capitalize">{item.platform}</span>
                      <span>•</span>
                      <span>Check: {item.check_frequency}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StatusBadge status={item.status} />
                    <Button size="sm" variant="destructive" className="h-6 text-[10px]" disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate(item.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
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
