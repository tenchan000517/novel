// src/components/public/latest-chapters.tsx
import { Chapter } from '@/types/chapters';

// モックデータ（実際の実装では API から取得）
const mockChapters: Partial<Chapter>[] = [
  {
    metadata: {
      id: '1',
      number: 10,
      title: '遥かなる旅路の始まり',
      createdAt: new Date('2025-04-30'),
      updatedAt: new Date('2025-05-01'), // ←追加！
    },
    summary: '主人公が謎の少女と出会い、彼女の正体に疑問を抱く。遠くの街へと向かう旅路が始まる。',
  },
  {
    metadata: {
      id: '2',
      number: 9,
      title: '森の奥に潜む影',
      createdAt: new Date('2025-04-29'),
      updatedAt: new Date('2025-05-01'), // ←追加！
    },
    summary: '深い森を進む中、一行は何者かに見られている感覚に襲われる。夜になり、キャンプを張った場所に謎の訪問者が現れる。',
  },
  {
    metadata: {
      id: '3',
      number: 8,
      title: '古都の秘密',
      createdAt: new Date('2025-04-28'),
      updatedAt: new Date('2025-05-01'), // ←追加！
    },
    summary: '古都に到着した一行は、地元の伝説について知る。かつてこの地を支配していた古代文明の遺跡を探索することになる。',
  },
];

export const LatestChapters = () => {
  return (
    <section className="latest-chapters">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">最新チャプター</h2>
        <a href="/chapters" className="text-indigo-600 hover:text-indigo-800 font-medium">
          すべて見る
        </a>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockChapters.map((chapter) => (
          <div key={chapter.metadata?.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-gray-900 hover:text-indigo-600">
                  <a href={`/chapters/${chapter.metadata?.id}`}>
                    {chapter.metadata?.title}
                  </a>
                </h3>
                <span className="text-sm font-medium text-gray-500">
                  第{chapter.metadata?.number}章
                </span>
              </div>
              <p className="text-gray-600 mb-4 line-clamp-3">
                {chapter.summary}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {chapter.metadata?.createdAt?.toLocaleDateString()}
                </span>
                <a 
                  href={`/chapters/${chapter.metadata?.id}`}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                >
                  続きを読む →
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};