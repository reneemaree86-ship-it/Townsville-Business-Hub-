import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { base44 } from '@/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/card';
import { Button } from '@/button';
import { Input } from '@/input';
import { Label } from '@/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/select';
import { Textarea } from '@/textarea';
import { Badge } from '@/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/dialog';
import { Separator } from '@/separator';
import { Plus, Eye, Save, Trash2, Send, FileText, ChevronDown, ChevronUp, X } from 'lucide-react';

const SERVICE_RATES = {
  'Standard Clean': 75,
  'Detailed Refresh Clean': 85,
  'Deep Clean': 95,
  'Office/Commercial': 98,
  'Pressure Washing': 90,
  'Pre-Sale/Rental Inspection Rescue': 92,
};

const ADD_ONS = [
  { label: 'Security Screen', price: 8 },
  { label: 'Sliding Glass Door', price: 25 },
  { label: 'Oven Clean', price: 85 },
  { label: 'Rangehood Clean', price: 65 },
  { label: 'Fridge Internal', price: 55 },
  { label: 'Fridge/Freezer Combo', price: 85 },
];

const STATUS_COLORS = {
  draft: 'bg-muted text-muted-foreground',
  sent: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
};

function InvoicePreviewModal({ invoice, client, onClose }) {
  const today = new Date();
  const invoiceDate = today.toLocaleDateString('en-AU', { day: '2-digit', month: 'long', year: 'numeric' });
  const dueDate = invoice.due_date
    ? new Date(invoice.due_date).toLocaleDateString('en-AU', { day: '2-digit', month: 'long', year: 'numeric' })
    : 'Upon receipt';

  const lineItems = invoice.line_items || [];
  const subtotal = parseFloat(invoice.amount || 0);
  const gst = parseFloat(invoice.gst_amount || 0);
  const total = parseFloat(invoice.total_amount || 0);
  const travelFee = parseFloat(invoice.travel_fee || 0);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-4 h-4" /> Invoice Preview
          </DialogTitle>
        </DialogHeader>

        <div className="bg-card border border-border rounded-lg p-6 space-y-6 font-sans">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-foreground">Renee's Cleaning Services</h2>
              <p className="text-xs text-muted-foreground mt-1">Townsville, QLD, Australia</p>
              <p className="text-xs text-muted-foreground">reneescleaningservicestsv.com</p>
              <p className="text-xs text-muted-foreground">ABN: 12 345 678 901</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">INVOICE</div>
              <p className="text-sm font-semibold text-foreground mt-1">
                #{invoice.invoice_number || 'DRAFT'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Date: {invoiceDate}</p>
              <p className="text-xs text-muted-foreground">Due: {dueDate}</p>
            </div>
          </div>

          <Separator />

          {/* Bill To */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Bill To</p>
            <p className="text-sm font-semibold text-foreground">{client?.name || 'Client Name'}</p>
            {client?.address && <p className="text-xs text-muted-foreground">{client.address}</p>}
            {client?.suburb && <p className="text-xs text-muted-foreground">{client.suburb}, QLD</p>}
            {client?.phone && <p className="text-xs text-muted-foreground">{client.phone}</p>}
            {client?.email && <p className="text-xs text-muted-foreground">{client.email}</p>}
          </div>

          <Separator />

          {/* Line Items */}
          <div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-xs font-semibold text-muted-foreground uppercase">Description</th>
                  <th className="text-right py-2 text-xs font-semibold text-muted-foreground uppercase">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {lineItems.length > 0 ? lineItems.map((item, i) => (
                  <tr key={i}>
                    <td className="py-2 text-foreground">{item.description}</td>
                    <td className="py-2 text-right text-foreground">${parseFloat(item.amount || 0).toFixed(2)}</td>
                  </tr>
                )) : (
                  <tr>
                    <td className="py-2 text-foreground">{invoice.service_type || 'Cleaning Service'}</td>
                    <td className="py-2 text-right text-foreground">${subtotal.toFixed(2)}</td>
                  </tr>
                )}
                {travelFee > 0 && (
                  <tr>
                    <td className="py-2 text-muted-foreground">Travel Fee</td>
                    <td className="py-2 text-right text-muted-foreground">${travelFee.toFixed(2)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Separator />

          {/* Totals */}
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal (excl. GST)</span>
              <span className="text-foreground">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">GST (10%)</span>
              <span className="text-foreground">${gst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t border-border pt-2 mt-1">
              <span className="text-foreground">Total (incl. GST)</span>
              <span className="text-primary">${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method */}
          {invoice.payment_method && (
            <>
              <Separator />
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Payment Method</p>
                <p className="text-sm text-foreground">{invoice.payment_method}</p>
              </div>
            </>
          )}

          {/* Notes */}
          {invoice.notes && (
            <>
              <Separator />
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Notes</p>
                <p className="text-sm text-muted-foreground">{invoice.notes}</p>
              </div>
            </>
          )}

          <div className="text-center text-xs text-muted-foreground pt-2">
            Thank you for your business! 💐
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>Close Preview</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InvoiceForm({ clients, businesses, activeBusiness, onSave, onCancel, existing }) {
  const [form, setForm] = useState({
    invoice_number: existing?.invoice_number || `INV-${Date.now().toString().slice(-6)}`,
    client_id: existing?.client_id || '',
    service_type: existing?.service_type || '',
    amount: existing?.amount || '',
    gst_amount: existing?.gst_amount || '',
    total_amount: existing?.total_amount || '',
    due_date: existing?.due_date || '',
    payment_method: existing?.payment_method || 'Bank Transfer',
    status: existing?.status || 'draft',
    notes: existing?.notes || '',
    line_items: existing?.line_items || [],
    travel_fee: existing?.travel_fee || 0,
  });
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  const selectedClient = clients.find(c => c.id === form.client_id);

  const calcTotals = (amount, travel = 0) => {
    const subtotal = parseFloat(amount || 0) + parseFloat(travel || 0);
    const gst = subtotal * 0.1;
    const total = subtotal + gst;
    return { gst: gst.toFixed(2), total: total.toFixed(2) };
  };

  const handleServiceChange = (val) => {
    const rate = SERVICE_RATES[val] || 0;
    const { gst, total } = calcTotals(rate, form.travel_fee);
    setForm(f => ({ ...f, service_type: val, amount: rate, gst_amount: gst, total_amount: total }));
  };

  const handleAmountChange = (val) => {
    const { gst, total } = calcTotals(val, form.travel_fee);
    setForm(f => ({ ...f, amount: val, gst_amount: gst, total_amount: total }));
  };

  const handleTravelChange = (val) => {
    const { gst, total } = calcTotals(form.amount, val);
    setForm(f => ({ ...f, travel_fee: val, gst_amount: gst, total_amount: total }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        ...form,
        business_id: activeBusiness?.id,
      });
    } finally {
      setSaving(false);
    }
  };

  const previewInvoice = {
    ...form,
    service_type: form.service_type,
  };

  return (
    <div className="space-y-5">
      {showPreview && (
        <InvoicePreviewModal
          invoice={previewInvoice}
          client={selectedClient}
          onClose={() => setShowPreview(false)}
        />
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs">Invoice Number</Label>
          <Input className="mt-1 text-sm" value={form.invoice_number}
            onChange={e => setForm(f => ({ ...f, invoice_number: e.target.value }))} />
        </div>
        <div>
          <Label className="text-xs">Status</Label>
          <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
            <SelectTrigger className="mt-1 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className="text-xs">Client</Label>
        <Select value={form.client_id} onValueChange={v => setForm(f => ({ ...f, client_id: v }))}>
          <SelectTrigger className="mt-1 text-sm"><SelectValue placeholder="Select client..." /></SelectTrigger>
          <SelectContent>
            {clients.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.name} — {c.suburb || c.address}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs">Service Type</Label>
          <Select value={form.service_type} onValueChange={handleServiceChange}>
            <SelectTrigger className="mt-1 text-sm"><SelectValue placeholder="Select service..." /></SelectTrigger>
            <SelectContent>
              {Object.keys(SERVICE_RATES).map(s => (
                <SelectItem key={s} value={s}>{s} (${SERVICE_RATES[s]}/hr)</SelectItem>
              ))}
              <SelectItem value="Custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Due Date</Label>
          <Input type="date" className="mt-1 text-sm" value={form.due_date}
            onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label className="text-xs">Amount (excl. GST) $</Label>
          <Input type="number" className="mt-1 text-sm" value={form.amount}
            onChange={e => handleAmountChange(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">Travel Fee $</Label>
          <Input type="number" className="mt-1 text-sm" value={form.travel_fee}
            onChange={e => handleTravelChange(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">GST (10%) $</Label>
          <Input type="number" value={form.gst_amount} readOnly className="mt-1 text-sm bg-muted cursor-not-allowed" />
        </div>
      </div>

      <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg">
        <span className="text-sm font-semibold text-foreground">Total (incl. GST)</span>
        <span className="text-lg font-bold text-primary">${parseFloat(form.total_amount || 0).toFixed(2)}</span>
      </div>

      <div>
        <Label className="text-xs">Payment Method</Label>
        <Select value={form.payment_method} onValueChange={v => setForm(f => ({ ...f, payment_method: v }))}>
          <SelectTrigger className="mt-1 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
            <SelectItem value="Cash">Cash</SelectItem>
            <SelectItem value="Card">Card</SelectItem>
            <SelectItem value="Stripe">Stripe</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs">Notes</Label>
        <Textarea className="mt-1 text-sm" rows={3} value={form.notes}
          placeholder="Any additional notes for the client..."
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
        <Button variant="outline" onClick={() => setShowPreview(true)} className="flex items-center gap-2">
          <Eye className="w-4 h-4" /> Preview Invoice
        </Button>
        <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Invoice'}
        </Button>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

export default function Invoices() {
  const { activeBusiness } = useOutletContext();
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [previewInvoice, setPreviewInvoice] = useState(null);
  const [previewClient, setPreviewClient] = useState(null);

  useEffect(() => {
    loadData();
  }, [activeBusiness]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [inv, cli, biz] = await Promise.all([
        base44.entities.Invoice.list(),
        base44.entities.Client.list(),
        base44.entities.Business.list(),
      ]);
      setInvoices(inv);
      setClients(cli);
      setBusinesses(biz);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data) => {
    if (editingInvoice) {
      await base44.entities.Invoice.update(editingInvoice.id, data);
    } else {
      await base44.entities.Invoice.create(data);
    }
    setShowForm(false);
    setEditingInvoice(null);
    loadData();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this invoice?')) {
      await base44.entities.Invoice.delete(id);
      loadData();
    }
  };

  const openPreview = (inv) => {
    const client = clients.find(c => c.id === inv.client_id);
    setPreviewInvoice(inv);
    setPreviewClient(client);
  };

  const totalsByStatus = invoices.reduce((acc, inv) => {
    acc[inv.status] = (acc[inv.status] || 0) + parseFloat(inv.total_amount || 0);
    return acc;
  }, {});

  return (
    <div className="p-6 space-y-6">
      {/* Preview Modal */}
      {previewInvoice && (
        <InvoicePreviewModal
          invoice={previewInvoice}
          client={previewClient}
          onClose={() => { setPreviewInvoice(null); setPreviewClient(null); }}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Invoices</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Create, manage and preview invoices</p>
        </div>
        {!showForm && (
          <Button onClick={() => { setShowForm(true); setEditingInvoice(null); }}
            className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Invoice
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {['draft', 'sent', 'paid', 'overdue'].map(status => (
          <Card key={status} className="border border-border">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground capitalize">{status}</p>
              <p className="text-lg font-bold text-foreground mt-1">
                ${(totalsByStatus[status] || 0).toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">
                {invoices.filter(i => i.status === status).length} invoice{invoices.filter(i => i.status === status).length !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <Card className="border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              {editingInvoice ? 'Edit Invoice' : 'New Invoice'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <InvoiceForm
              clients={clients}
              businesses={businesses}
              activeBusiness={activeBusiness}
              existing={editingInvoice}
              onSave={handleSave}
              onCancel={() => { setShowForm(false); setEditingInvoice(null); }}
            />
          </CardContent>
        </Card>
      )}

      {/* Invoice List */}
      <Card className="border border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FileText className="w-4 h-4" /> All Invoices
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground text-sm">Loading invoices...</div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No invoices yet. Click <strong>New Invoice</strong> to create your first one.
            </div>
          ) : (
            <div className="space-y-2">
              {invoices.map(inv => {
                const client = clients.find(c => c.id === inv.client_id);
                return (
                  <div key={inv.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/40 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">#{inv.invoice_number}</span>
                        <Badge className={`text-[10px] px-1.5 ${STATUS_COLORS[inv.status] || ''}`}>
                          {inv.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {client?.name || 'Unknown Client'} · {inv.service_type || '—'} · Due: {inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-AU') : '—'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <span className="text-sm font-bold text-foreground whitespace-nowrap">
                        ${parseFloat(inv.total_amount || 0).toFixed(2)}
                      </span>
                      <Button size="sm" variant="outline"
                        onClick={() => openPreview(inv)}
                        className="flex items-center gap-1 text-xs h-7 px-2">
                        <Eye className="w-3 h-3" /> Preview
                      </Button>
                      <Button size="sm" variant="ghost"
                        onClick={() => { setEditingInvoice(inv); setShowForm(true); }}
                        className="text-xs h-7 px-2">Edit</Button>
                      <Button size="sm" variant="ghost"
                        onClick={() => handleDelete(inv.id)}
                        className="text-xs h-7 px-2 text-destructive hover:text-destructive">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
