import { Suspense } from 'react';
import { CharacterList } from '@/components/admin/character-management/character-list';
import { CharacterFilters } from '@/components/admin/character-management/character-filters';
import { AddCharacterButton } from '@/components/admin/character-management/add-character-button';
import { RelationshipGraph } from '@/components/admin/character-management/relationship-graph';

// ローディングプレースホルダー
const Loading = () => (
  <div className="animate-pulse">
    <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
  </div>
);

export default function CharactersPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">キャラクター管理</h1>
        <AddCharacterButton />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Suspense fallback={<Loading />}>
            <CharacterFilters />
          </Suspense>
          
          <Suspense fallback={<Loading />}>
            <CharacterList />
          </Suspense>
        </div>
        
        <div>
          <Suspense fallback={<Loading />}>
            <RelationshipGraph />
          </Suspense>
        </div>
      </div>
    </div>
  );
}