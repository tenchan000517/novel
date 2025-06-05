// src/components/public/chapter-navigation.tsx
interface ChapterNavigationProps {
    previousChapter: { id: string; number: number; title: string } | null;
    nextChapter: { id: string; number: number; title: string } | null;
  }
  
  export const ChapterNavigation: React.FC<ChapterNavigationProps> = ({
    previousChapter,
    nextChapter
  }) => {
    return (
      <nav className="chapter-navigation flex justify-between items-center my-8">
        {previousChapter ? (
          <a
            href={`/chapters/${previousChapter.id}`}
            className="flex items-center px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <div>
              <div className="text-xs text-gray-500">前へ</div>
              <div className="text-sm font-medium text-gray-900">第{previousChapter.number}章: {previousChapter.title}</div>
            </div>
          </a>
        ) : (
          <div></div>
        )}
        
        {nextChapter ? (
          <a
            href={`/chapters/${nextChapter.id}`}
            className="flex items-center px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition"
          >
            <div className="text-right">
              <div className="text-xs text-gray-500">次へ</div>
              <div className="text-sm font-medium text-gray-900">第{nextChapter.number}章: {nextChapter.title}</div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </a>
        ) : (
          <div></div>
        )}
      </nav>
    );
  };