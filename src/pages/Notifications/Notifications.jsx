import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function Notifications() {
  const qc = useQueryClient();
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications-all'],
    queryFn: () => base44.entities.Notification.list('-created_date', 100),
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { read: true }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notifications-all'] }); qc.invalidateQueries({ queryKey: ['notifications-unread'] }); },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => { for (const n of notifications.filter(n => !n.read)) await base44.entities.Notification.update(n.id, { read: true }); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notifications-all'] }); qc.invalidateQueries({ queryKey: ['notifications-unread'] }); },
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Notifications" description={`${unreadCount} unread messages`} />
        {unreadCount > 0 && (
          <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => markAllReadMutation.mutate()} disabled={markAllReadMutation.isPending}>
            Mark all as read
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {notifications.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-xs text-muted-foreground">No notifications.</CardContent></Card>
        ) : (
          notifications.map(notif => (
            <Card key={notif.id} className={notif.read ? '' : 'border-primary/30 bg-primary/5'}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <Bell className={`w-4 h-4 mt-0.5 flex-shrink-0 ${notif.read ? 'text-muted-foreground' : 'text-primary'}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium">{notif.title}</p>
                        {!notif.read && <Badge variant="default" className="text-[9px] h-5">New</Badge>}
                        <StatusBadge status={notif.severity} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{notif.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-2">{format(new Date(notif.created_date), 'dd MMM HH:mm')}</p>
                    </div>
                  </div>
                  {!notif.read && (
                    <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => markReadMutation.mutate(notif.id)} disabled={markReadMutation.isPending}>
                      Mark read
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
