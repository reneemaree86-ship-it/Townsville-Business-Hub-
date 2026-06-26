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
import { Clock, Plus, Loader2 } from 'lucide-react';
import { format, isPast } from 'date-fns';

export default function FollowUps() {
  const { activeBusiness } = useOutletContext();
  const bid = activeBusiness?.id;
  const qc = useQueryClient();
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ lead_id: '', due_date: '', priority: 'medium', notes: '' });

  const { data: followups = [] } = useQuery({
    queryKey: ['followups-all', bid],
    queryFn: () => bid ? base44.entities.FollowUp.filter({ business_id: bid }, 'due_date', 100) : [],
    enabled: !!bid,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.FollowUp.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['followups-all'] }),
  });

  const overdue = followups.filter(f => isPast(new Date(f.due_date)) && f.status !== 'completed').length;
  const due = followups.filter(f => !isPast(new Date(f.due_date)) && f.status === 'pending').length;

  if (!activeBusiness) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Follow-up Reminders"
        description="Never miss a lead follow-up"
        business={activeBusiness}
        actions={
          <Dialog open={showNew} onOpenChange={setShowNew}>
            <DialogTrigger asChild>
              <Button className="gap-2" size="sm"><Plus className="w-4 h-4" /> New Follow-up</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Schedule Follow-up</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Lead</Label>
                  <Input value={form.lead_id} onChange={e => setForm({...form, lead_id: e.target.value})} className="h-8 text-xs mt-1" placeholder="Lead ID" />
                </div>
                <div>
                  <Label className="text-xs">Due Date</Label>
                  <Input type="date" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} className="h-8 text-xs mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Priority</Label>
                  <Select value={form.priority} onValueChange={v => setForm({...form, priority: v})}>
                    <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full">Schedule</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-[10px] text-muted-foreground">Due Today/Soon</p>
            <p className="text-2xl font-bold mt-1 text-amber-600">{due}</p>
          </CardContent>
        </Card>
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="p-4 text-center">
            <p className="text-[10px] text-red-700">Overdue</p>
            <p className="text-2xl font-bold mt-1 text-red-600">{overdue}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-[10px] text-muted-foreground">Total</p>
            <p className="text-2xl font-bold mt-1">{followups.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-2">
        {followups.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-xs text-muted-foreground">No follow-ups scheduled.</CardContent></Card>
        ) : (
          followups.map(fu => (
            <Card key={fu.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">Lead #{fu.lead_id}</p>
                      <p className="text-xs text-muted-foreground">{fu.notes}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-muted-foreground">{format(new Date(fu.due_date), 'dd MMM')}</span>
                    <StatusBadge status={fu.priority} />
                    {fu.status !== 'completed' && (
                      <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => updateMutation.mutate({ id: fu.id, data: { status: 'completed' } })} disabled={updateMutation.isPending}>
                        Done
                      </Button>
                    )}
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
