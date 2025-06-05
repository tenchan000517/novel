// src/app/(public)/page.tsx
import { LatestChapters } from '@/components/public/latest-chapters';
import { CharacterSpotlight } from '@/components/public/character-spotlight';
import { StoryProgress } from '@/components/public/story-progress';

export default function HomePage() {
  return (
    <div className="space-y-12">
      <section className="hero-section bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-8 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4 sm:text-5xl">
            AIが紡ぐ物語の世界へようこそ
          </h1>
          <p className="text-xl text-indigo-100 mb-6">
            毎日更新される小説をお楽しみください
          </p>
          <div className="flex justify-center gap-4">
            <a href="/chapters/latest" className="px-6 py-3 bg-white text-indigo-600 font-semibold rounded-md shadow hover:bg-indigo-50 transition">
              最新話を読む
            </a>
            <a href="/about" className="px-6 py-3 bg-indigo-700 text-white font-semibold rounded-md shadow hover:bg-indigo-800 transition">
              詳細を見る
            </a>
          </div>
        </div>
      </section>
      
      <StoryProgress />
      <LatestChapters />
      <CharacterSpotlight />
    </div>
  );
}