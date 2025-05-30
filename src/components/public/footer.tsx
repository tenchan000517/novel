// src/components/public/footer.tsx
export const Footer = () => {
    return (
      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:justify-between">
            <div className="mb-4 md:mb-0">
              <h2 className="text-lg font-semibold text-gray-900">Auto Novel System</h2>
              <p className="text-gray-600 mt-1">AIによる自動小説生成プロジェクト</p>
            </div>
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">物語</h3>
                <ul className="mt-2 space-y-2">
                  <li><a href="/chapters" className="text-gray-600 hover:text-gray-900">最新チャプター</a></li>
                  <li><a href="/characters" className="text-gray-600 hover:text-gray-900">キャラクター</a></li>
                  <li><a href="/world" className="text-gray-600 hover:text-gray-900">世界観</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">プロジェクト</h3>
                <ul className="mt-2 space-y-2">
                  <li><a href="/about" className="text-gray-600 hover:text-gray-900">概要</a></li>
                  <li><a href="/technology" className="text-gray-600 hover:text-gray-900">技術説明</a></li>
                  <li><a href="/team" className="text-gray-600 hover:text-gray-900">チーム</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-200 pt-4">
            <p className="text-gray-500 text-sm text-center">© {new Date().getFullYear()} Auto Novel System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    );
  };