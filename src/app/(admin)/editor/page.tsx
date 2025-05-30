
// src/app/(admin)/editor/page.tsx
'use client';

import { EditorDashboard } from '@/components/admin/editor/dashboard';
import { RealtimeMonitor } from '@/components/admin/editor/realtime-monitor';
import { QuickActions } from '@/components/admin/editor/quick-actions';
import { InterventionPanel } from '@/components/admin/editor/intervention-panel';
import { PreviewPanel } from '@/components/admin/editor/preview-panel';

export default function EditorPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8">編集者ダッシュボード</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <EditorDashboard />
          <PreviewPanel />
        </div>
        <div className="space-y-6">
          <RealtimeMonitor />
          <QuickActions />
          <InterventionPanel />
        </div>
      </div>
    </div>
  );
}