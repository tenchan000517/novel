// src/app/admin/analytics/page.tsx
import React from 'react';
import { Suspense } from 'react';
import { QualityChart } from '@/components/admin/analytics/quality-chart';
import { TensionCurve } from '@/components/admin/analytics/tension-curve';
import { CharacterAnalysis } from '@/components/admin/analytics/character-analysis';
import { ForeshadowingTracker } from '@/components/admin/analytics/foreshadowing-tracker';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

// ローディングプレースホルダー
const Loading = () => (
  <div className="animate-pulse">
    <div className="h-64 bg-gray-200 rounded-lg mb-4"></div>
  </div>
);

export default function AnalyticsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">分析・可視化</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<Loading />}>
          <Card>
            <CardHeader>
              <CardTitle>品質スコア推移</CardTitle>
              <CardDescription>チャプターごとの品質評価の変化</CardDescription>
            </CardHeader>
            <CardContent>
              <QualityChart />
            </CardContent>
          </Card>
        </Suspense>
        
        <Suspense fallback={<Loading />}>
          <TensionCurve />
        </Suspense>
        
        <Suspense fallback={<Loading />}>
          <Card>
            <CardHeader>
              <CardTitle>キャラクター分析</CardTitle>
              <CardDescription>登場人物の関係性と重要度</CardDescription>
            </CardHeader>
            <CardContent>
              <CharacterAnalysis />
            </CardContent>
          </Card>
        </Suspense>
        
        <Suspense fallback={<Loading />}>
          <Card>
            <CardHeader>
              <CardTitle>伏線トラッカー</CardTitle>
              <CardDescription>伏線の配置と解決状況</CardDescription>
            </CardHeader>
            <CardContent>
              <ForeshadowingTracker />
            </CardContent>
          </Card>
        </Suspense>
      </div>
    </div>
  );
}