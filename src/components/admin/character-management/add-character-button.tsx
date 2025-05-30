import { useState } from 'react';
import { CharacterEditor } from './character-editor';

export const AddCharacterButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5 mr-1" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path 
            fillRule="evenodd" 
            d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" 
            clipRule="evenodd" 
          />
        </svg>
        キャラクター追加
      </button>
      
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">新しいキャラクターを追加</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                </svg>
              </button>
            </div>
            
            <div className="p-4">
              <CharacterEditor 
                onSave={() => setIsModalOpen(false)}
                onCancel={() => setIsModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};