import React, { useState } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import StatusBadge from '@/components/shared/StatusBadge';

export default function LeadDetailModal({ lead, onClose }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(lead);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Lead.update(lead.id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['leads'] }); setEditing(false); },
  });

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Lead Details</DialogTitle></DialogHeader>
        {!editing ? (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-xs text-muted-foreground">Name:</span> <p className="text-sm font-medium">{lead.name}</p></div>
              <div><span className="text-xs text-muted-foreground">Service:</span> <p className="text-sm font-medium">{lead.service_needed}</p></div>
              <div><span className="text-xs text-muted-foreground">Contact:</span> <p className="text-sm">{lead.contact_details}</p></div>
              <div><span className="text-xs text-muted-foreground">Score:</span> <p className="text-sm font-bold text-primary">{lead.score}/100</p></div>
              <div><span className="text-xs text-muted-foreground">Status:</span> <StatusBadge status={lead.status} /></div>
              <div><span className="text-xs text-muted-foreground">Urgency:</span> <StatusBadge status={lead.urgency} /></div>
            </div>
            {lead.original_post_text && (
              <div>
                <span className="text-xs text-muted-foreground">Original Post:</span>
                <p className="text-xs bg-muted/40 p-2 rounded mt-1 whitespace-pre-wrap max-h-32 overflow-y-auto">{lead.original_post_text}</p>
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-xs" onClick={() => setEditing(true)}>Edit</Button>
              <Button variant="outline" size="sm" className="text-xs" onClick={onClose}>Close</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            <div><Label className="text-xs">Name</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="h-8 text-xs" /></div>
            <div>
              <Label className="text-xs">Status</Label>
              <Select value={form.status} onValueChange={v => setForm({...form, status: v})}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="new">New</SelectItem><SelectItem value="hot">Hot</SelectItem><SelectItem value="cold">Cold</SelectItem><SelectItem value="won">Won</SelectItem><SelectItem value="lost">Lost</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="text-xs" onClick={() => updateMutation.mutate(form)} disabled={updateMutation.isPending}>Save</Button>
              <Button variant="outline" size="sm" className="text-xs" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
