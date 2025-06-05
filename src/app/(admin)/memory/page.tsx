import { Suspense } from 'react';
import { MemoryViewer } from '@/components/admin/memory-management/memory-viewer';
import { MemoryHierarchy } from '@/components/admin/memory-management/memory-hierarchy';
import { MemoryTimeline } from '@/components/admin/memory-management/memory-timeline';
import { MemorySearch } from '@/components/admin/memory-management/memory-search';

// ローディングプレースホルダー
const Loading = () => (
  <div className="animate-pulse">
    <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
  </div>
);

export default function MemoryPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">記憶管理</h1>
      </div>
      
      <Suspense fallback={<Loading />}>
        <MemorySearch />
      </Suspense>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<Loading />}>
          <MemoryHierarchy />
        </Suspense>
        
        <Suspense fallback={<Loading />}>
          <MemoryTimeline />
        </Suspense>
      </div>
      
      <Suspense fallback={<Loading />}>
        <MemoryViewer />
      </Suspense>
    </div>
  );
}