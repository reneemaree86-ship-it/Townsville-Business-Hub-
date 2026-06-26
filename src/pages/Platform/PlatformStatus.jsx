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
import { Plus, Loader2, Trash2 } from 'lucide-react';

const PLATFORMS = [
  { name: 'Google Business Profile', connection_type: 'api', icon: '📍' },
  { name: 'Facebook Business', connection_type: 'oauth', icon: '👥' },
  { name: 'Instagram Business', connection_type: 'oauth', icon: '📸' },
  { name: 'LinkedIn Business', connection_type: 'oauth', icon: '💼' },
  { name: 'TikTok Business', connection_type: 'oauth', icon: '🎵' },
  { name: 'Google Ads', connection_type: 'api', icon: '📢' },
];

export default function PlatformStatus() {
  const { activeBusiness } = useOutletContext();
  const bid = activeBusiness?.id;
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ platform_name: '', connection_status: 'not_connected', connection_type: 'oauth', notes: '' });

  const { data: connections = [] } = useQuery({
    queryKey: ['platform-connections'],
    queryFn: () => base44.entities.PlatformConnection.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.PlatformConnection.create({ ...data, business_id: bid, last_checked: new Date().toISOString() }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['platform-connections'] }); setOpen(false); setForm({ platform_name: '', connection_status: 'not_connected', connection_type: 'oauth', notes: '' }); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PlatformConnection.update(id, { ...data, last_checked: new Date().toISOString() }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['platform-connections'] }); setOpen(false); setEditing(null); setForm({ platform_name: '', connection_status: 'not_connected', connection_type: 'oauth', notes: '' }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PlatformConnection.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['platform-connections'] }),
  });

  const empty = { platform_name: '', connection_status: 'not_connected', connection_type: 'oauth', notes: '' };

  const openEdit = (conn) => { setEditing(conn); setForm({ platform_name: conn.platform_name, connection_status: conn.connection_status, connection_type: conn.connection_type, notes: conn.notes || '' }); setOpen(true); };
  const openNew = (preset = null) => { setEditing(null); setForm(preset ? { platform_name: preset.name, connection_status: 'not_connected', connection_type: preset.connection_type, notes: preset.notes || '' } : empty); setOpen(true); };

  const handleSave = () => { if (editing) updateMutation.mutate({ id: editing.id, data: form }); else createMutation.mutate(form); };

  if (!activeBusiness) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Platform Status" description="Manage connections to social and advertising platforms" business={activeBusiness} />
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {PLATFORMS.map(p => (
          <Button key={p.name} variant="outline" size="sm" className="text-xs h-auto py-2 justify-start" onClick={() => openNew(p)}>
            <span className="text-lg mr-2">{p.icon}</span>
            <div className="text-left"><div className="font-medium">{p.name}</div></div>
          </Button>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="gap-2"><Plus className="w-4 h-4" /> Add Platform</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit Platform' : 'Add Platform Connection'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Platform Name</Label>
              <Input value={form.platform_name} onChange={e => setForm({...form, platform_name: e.target.value})} className="h-8 text-xs mt-1" />
            </div>
            <div>
              <Label className="text-xs">Connection Status</Label>
              <Select value={form.connection_status} onValueChange={v => setForm({...form, connection_status: v})}>
                <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_connected">Not Connected</SelectItem>
                  <SelectItem value="connected">Connected</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending} className="w-full">
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid gap-3">
        {connections.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-xs text-muted-foreground">No platforms added yet. Click "Add Platform" to get started.</CardContent></Card>
        ) : (
          connections.map(conn => (
            <Card key={conn.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{conn.platform_name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{conn.connection_type}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StatusBadge status={conn.connection_status} />
                    <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => openEdit(conn)}>Edit</Button>
                    <Button size="sm" variant="destructive" className="h-7 text-[10px]" disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate(conn.id)}>
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
