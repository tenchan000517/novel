// src/components/public/social-share.tsx
import { Chapter } from '@/types/chapters';

export const SocialShare: React.FC<{ chapter: Chapter }> = ({ chapter }) => {
  const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://example.com'}/chapters/${chapter.metadata.id}`;
  const shareText = `「${chapter.metadata.title}」を読んでいます。`;
  
  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    line: `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`,
  };
  
  return (
    <div className="social-share mt-8 p-6 bg-white rounded-lg shadow-md text-center">
      <h3 className="text-lg font-medium text-gray-900 mb-4">この物語をシェアする</h3>
      
      <div className="flex justify-center space-x-4">
        <button 
          onClick={() => window.open(shareLinks.twitter, '_blank')}
          className="flex items-center px-4 py-2 rounded-md bg-blue-400 hover:bg-blue-500 text-white transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
          </svg>
          Twitterでシェア
        </button>
        
        <button 
          onClick={() => window.open(shareLinks.facebook, '_blank')}
          className="flex items-center px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
          </svg>
          Facebookでシェア
        </button>
        
        <button 
          onClick={() => window.open(shareLinks.line, '_blank')}
          className="flex items-center px-4 py-2 rounded-md bg-green-500 hover:bg-green-600 text-white transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.816 4.269 8.852 10.036 9.608.391.084.921.258 1.056.592.122.303.079.778.039 1.085l-.171 1.027c-.053.303-.242 1.186 1.039.647 1.281-.54 6.911-4.069 9.428-6.967 1.739-1.907 2.573-3.849 2.573-5.992zm-18.558 2.625c0-.375.304-.679.679-.679h3.813c.375 0 .679.304.679.679v.178c0 .375-.304.679-.679.679h-3.813c-.375 0-.679-.304-.679-.679v-.178zm13.33.178c0 .375-.304.679-.678.679h-3.814c-.375 0-.679-.304-.679-.679v-.178c0-.375.304-.679.679-.679h3.814c.374 0 .678.304.678.679v.178zm-8.535-3.937c0-.375.304-.679.679-.679h3.813c.375 0 .679.304.679.679v.178c0 .375-.304.679-.679.679h-3.813c-.375 0-.679-.304-.679-.679v-.178zm9.435 0c0 .375-.304.679-.678.679h-1.262c-.375 0-.679-.304-.679-.679v-.178c0-.375.304-.679.679-.679h1.262c.374 0 .678.304.678.679v.178z" />
          </svg>
          LINEでシェア
        </button>
      </div>
    </div>
  );
};