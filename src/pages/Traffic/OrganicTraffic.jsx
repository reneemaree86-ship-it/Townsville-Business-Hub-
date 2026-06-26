import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, TrendingUp, Lightbulb } from 'lucide-react';

export default function OrganicTraffic() {
  const { activeBusiness } = useOutletContext();
  const bid = activeBusiness?.id;
  const [result, setResult] = useState(null);
  const [customNotes, setCustomNotes] = useState('');

  const trafficMutation = useMutation({
    mutationFn: () => base44.functions.invoke('getTrafficRecommendations', { business_id: bid }),
    onSuccess: (res) => setResult(res.data),
  });

  if (!activeBusiness) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Organic Traffic"
        description="Traffic analysis and growth recommendations"
        business={activeBusiness}
        actions={
          <Button onClick={() => trafficMutation.mutate()} disabled={trafficMutation.isPending} className="gap-2">
            {trafficMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
            {trafficMutation.isPending ? 'Analysing...' : 'Analyse Traffic'}
          </Button>
        }
      />

      {result ? (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-muted/40">
                  <p className="text-[10px] text-muted-foreground">Current Monthly Visits</p>
                  <p className="text-2xl font-bold mt-1">{result.current_monthly_visits || 0}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/40">
                  <p className="text-[10px] text-muted-foreground">Avg. Pages/Session</p>
                  <p className="text-2xl font-bold mt-1">{result.avg_pages_per_session?.toFixed(1) || 0}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/40">
                  <p className="text-[10px] text-muted-foreground">Bounce Rate</p>
                  <p className="text-2xl font-bold mt-1">{result.bounce_rate || 0}%</p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-500/10">
                  <p className="text-[10px] text-emerald-700">Growth Potential</p>
                  <p className="text-2xl font-bold mt-1 text-emerald-600">+{result.growth_potential || 0}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {result.recommendations && result.recommendations.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-semibold">Recommendations</h3>
                </div>
                <div className="space-y-2">
                  {result.recommendations.map((rec, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-muted/40 border border-border/50">
                      <p className="text-xs font-medium">{rec.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{rec.description}</p>
                      {rec.impact && <p className="text-[10px] text-emerald-600 mt-1">Est. Impact: {rec.impact}</p>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center text-xs text-muted-foreground">
            Click "Analyse Traffic" to get personalised recommendations for growing organic traffic.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
