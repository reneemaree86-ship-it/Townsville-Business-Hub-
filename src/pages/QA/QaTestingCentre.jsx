import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TestTube, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function QaTestingCentre() {
  const qc = useQueryClient();

  const { data: tests = [] } = useQuery({
    queryKey: ['qa-tests'],
    queryFn: () => base44.entities.QaTest.list('-created_date', 100),
  });

  const runMutation = useMutation({
    mutationFn: () => base44.functions.invoke('runQaTests', {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['qa-tests'] }),
  });

  const passed = tests.filter(t => t.status === 'passed').length;
  const failed = tests.filter(t => t.status === 'failed').length;
  const lastRun = tests[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title="QA Testing Centre"
        description="Automated testing for all systems and features"
        actions={
          <Button onClick={() => runMutation.mutate()} disabled={runMutation.isPending} className="gap-2">
            {runMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <TestTube className="w-4 h-4" />}
            {runMutation.isPending ? 'Running...' : 'Run Tests'}
          </Button>
        }
      />

      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-[10px] text-muted-foreground">Total Tests</p>
            <p className="text-2xl font-bold mt-1">{tests.length}</p>
          </CardContent>
        </Card>
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="p-4 text-center">
            <p className="text-[10px] text-emerald-700">Passed</p>
            <p className="text-2xl font-bold mt-1 text-emerald-600">{passed}</p>
          </CardContent>
        </Card>
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="p-4 text-center">
            <p className="text-[10px] text-red-700">Failed</p>
            <p className="text-2xl font-bold mt-1 text-red-600">{failed}</p>
          </CardContent>
        </Card>
      </div>

      {lastRun && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Latest Run</CardTitle></CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            <p>{format(new Date(lastRun.created_date), 'dd MMM yyyy HH:mm')} • {lastRun.duration_seconds}s duration</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Test Results</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px]">Test Name</TableHead>
                  <TableHead className="text-[10px]">Category</TableHead>
                  <TableHead className="text-[10px]">Status</TableHead>
                  <TableHead className="text-[10px]">Duration</TableHead>
                  <TableHead className="text-[10px]">Last Run</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tests.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center text-xs text-muted-foreground py-8">No tests run yet. Click "Run Tests" to start.</TableCell></TableRow>
                ) : (
                  tests.map(test => (
                    <TableRow key={test.id}>
                      <TableCell className="text-xs">{test.name}</TableCell>
                      <TableCell className="text-[10px] capitalize">{test.category?.replace(/_/g, ' ')}</TableCell>
                      <TableCell><StatusBadge status={test.status} /></TableCell>
                      <TableCell className="text-[10px]">{test.duration_ms}ms</TableCell>
                      <TableCell className="text-[10px]">{format(new Date(test.created_date), 'dd MMM HH:mm')}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
