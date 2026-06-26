import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Save } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export default function BusinessSettings() {
  const { activeBusiness } = useOutletContext();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: activeBusiness?.name || '',
    website_url: activeBusiness?.website_url || '',
    description: activeBusiness?.description || '',
    contact_email: activeBusiness?.contact_email || '',
    phone: activeBusiness?.phone || '',
  });

  const saveMutation = useMutation({
    mutationFn: () => base44.entities.Business.update(activeBusiness.id, form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['businesses'] }); toast({ title: 'Success', description: 'Settings saved' }); },
  });

  if (!activeBusiness) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Business Settings" description="Manage your business information" />

      <Card>
        <CardHeader><CardTitle className="text-sm">Basic Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs">Business Name</Label>
            <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="h-9 text-sm mt-1" />
          </div>
          <div>
            <Label className="text-xs">Website URL</Label>
            <Input value={form.website_url} onChange={e => setForm({...form, website_url: e.target.value})} className="h-9 text-sm mt-1" />
          </div>
          <div>
            <Label className="text-xs">Description</Label>
            <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} className="text-sm mt-1" />
          </div>
          <div>
            <Label className="text-xs">Contact Email</Label>
            <Input type="email" value={form.contact_email} onChange={e => setForm({...form, contact_email: e.target.value})} className="h-9 text-sm mt-1" />
          </div>
          <div>
            <Label className="text-xs">Phone</Label>
            <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="h-9 text-sm mt-1" />
          </div>
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="gap-2">
            {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saveMutation.isPending ? 'Saving...' : 'Save Settings'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
