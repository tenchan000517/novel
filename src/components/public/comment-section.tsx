// src/components/public/comment-section.tsx
import { useState } from 'react';

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
  likes: number;
}

interface CommentSectionProps {
  chapterId: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ chapterId }) => {
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      author: 'user123',
      content: '主人公の心情描写が素晴らしいです。次の展開がとても気になります！',
      timestamp: new Date('2025-05-01T09:30:00'),
      likes: 5,
    },
    {
      id: '2',
      author: 'novelFan',
      content: '美咲のキャラクターが本当に魅力的。彼女の秘密が早く知りたいです。',
      timestamp: new Date('2025-05-01T10:15:00'),
      likes: 3,
    }
  ]);
  
  const [newComment, setNewComment] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    // 実際の実装ではAPIコールが入ります
    const comment: Comment = {
      id: Date.now().toString(),
      author: 'あなた',
      content: newComment,
      timestamp: new Date(),
      likes: 0,
    };
    
    setComments([comment, ...comments]);
    setNewComment('');
  };
  
  return (
    <section className="comment-section mt-8 bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">コメント ({comments.length})</h3>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="この章についてのコメントを残してください..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            rows={3}
          ></textarea>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            コメントを投稿
          </button>
        </div>
      </form>
      
      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="border-b border-gray-200 pb-4 last:border-b-0">
            <div className="flex justify-between items-start mb-2">
              <div className="font-medium text-gray-900">{comment.author}</div>
              <div className="text-sm text-gray-500">
                {comment.timestamp.toLocaleString()}
              </div>
            </div>
            <p className="text-gray-800 mb-2">{comment.content}</p>
            <div className="flex items-center text-sm text-gray-500">
              <button
                onClick={() => {
                  setComments(
                    comments.map((c) =>
                      c.id === comment.id ? { ...c, likes: c.likes + 1 } : c
                    )
                  );
                }}
                className="flex items-center text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                </svg>
                いいね {comment.likes}
              </button>
              <button className="ml-4 flex items-center text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                返信
              </button>
              <button className="ml-4 flex items-center text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
                </svg>
                報告
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};