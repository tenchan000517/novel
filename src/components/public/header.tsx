// src/components/public/header.tsx
export const Header = () => {
    return (
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">Auto Novel</h1>
            <span className="ml-2 text-sm text-gray-500">AIが紡ぐ物語の世界</span>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-gray-600 hover:text-gray-900">
              <span className="sr-only">検索</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </button>
            <button className="text-gray-600 hover:text-gray-900">
              <span className="sr-only">テーマ切替</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            </button>
          </div>
        </div>
      </header>
    );
  };
  
  // src/components/public/navigation.tsx
  export const Navigation = () => {
    return (
      <nav className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <ul className="flex space-x-8">
            <li className="py-3 border-b-2 border-indigo-600 text-indigo-600 font-medium">
              <a href="/">ホーム</a>
            </li>
            <li className="py-3 text-gray-600 hover:text-gray-900">
              <a href="/chapters">チャプター一覧</a>
            </li>
            <li className="py-3 text-gray-600 hover:text-gray-900">
              <a href="/characters">キャラクター図鑑</a>
            </li>
            <li className="py-3 text-gray-600 hover:text-gray-900">
              <a href="/about">物語について</a>
            </li>
          </ul>
        </div>
      </nav>
    );
  };