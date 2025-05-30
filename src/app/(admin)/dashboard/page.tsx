import { Suspense } from 'react';
import { SystemStatus } from '@/components/admin/dashboard/system-status';
import { GenerationMetrics } from '@/components/admin/dashboard/generation-metrics';
import { RecentActivity } from '@/components/admin/dashboard/recent-activity';
import { EditorSummary } from '@/components/admin/dashboard/editor-summary';
import { DashboardActions } from '@/components/admin/dashboard/dashboard-actions';

// ローディングプレースホルダー
const Loading = () => (
  <div className="animate-pulse">
    <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
  </div>
);

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">管理ダッシュボード</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Suspense fallback={<Loading />}>
          <SystemStatus />
        </Suspense>
        
        <Suspense fallback={<Loading />}>
          <GenerationMetrics />
        </Suspense>
        
        <DashboardActions />
        
        <Suspense fallback={<Loading />}>
          <EditorSummary />
        </Suspense>
        
        <div className="lg:col-span-3">
          <Suspense fallback={<Loading />}>
            <RecentActivity />
          </Suspense>
        </div>
      </div>
    </div>
  );
}