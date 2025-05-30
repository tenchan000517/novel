// // src/components/admin/editor/preview-panel.tsx
// import { useState } from 'react';
// import { useEditor } from '@/hooks/use-editor';
// import { DiffViewer } from './diff-viewer';
// import { QualityIndicators } from './quality-indicators';

// export const PreviewPanel: React.FC = () => {
//   const { currentDocument, originalDocument, applyChanges, isApplying } = useEditor();
//   const [showDiff, setShowDiff] = useState(false);
  
//   if (!currentDocument) {
//     return (
//       <div className="bg-white rounded-lg shadow p-6">
//         <div className="text-center py-8">
//           <p className="text-gray-500">プレビューするドキュメントがありません</p>
//         </div>
//       </div>
//     );
//   }
  
//   return (
//     <div className="bg-white rounded-lg shadow">
//       <div className="p-4 border-b flex justify-between items-center">
//         <h2 className="text-lg font-semibold">プレビュー</h2>
//         <div className="flex space-x-2">
//           <button
//             onClick={() => setShowDiff(!showDiff)}
//             className="px-3 py-1 text-sm border rounded-md hover:bg-gray-50"
//           >
//             {showDiff ? '通常表示' : '差分表示'}
//           </button>
//           <button
//             onClick={applyChanges}
//             disabled={isApplying}
//             className={`px-3 py-1 text-sm bg-green-600 text-white rounded-md ${
//               isApplying ? 'opacity-70 cursor-not-allowed' : 'hover:bg-green-700'
//             }`}
//           >
//             {isApplying ? '適用中...' : '変更を適用'}
//           </button>
//         </div>
//       </div>
      
//       <div className="p-4">
//         {showDiff ? (
//           <DiffViewer
//             original={originalDocument}
//             modified={currentDocument}
//           />
//         ) : (
//           <div className="prose max-w-none">
//             <h1>{currentDocument.title}</h1>
//             <div className="whitespace-pre-wrap">
//               {currentDocument.content}
//             </div>
//           </div>
//         )}
        
//         <QualityIndicators document={currentDocument} />
//       </div>
//     </div>
//   );
// };