import React from 'react';

const PlotSystemDiagram = () => {
  return (
    <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-6 text-center">AI小説生成システムにおけるプロットマネージャーの役割</h2>
      
      {/* Main Diagram */}
      <div className="w-full flex flex-col">
        {/* Config Files Section */}
        <div className="flex justify-center mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-100 p-3 rounded-lg border border-blue-300">
              <h3 className="font-semibold text-blue-800">World Settings</h3>
              <div className="text-xs text-gray-700 mt-1">config/world-settings.yaml</div>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg border border-blue-300">
              <h3 className="font-semibold text-blue-800">Theme Settings</h3>
              <div className="text-xs text-gray-700 mt-1">config/theme-tracker.yaml</div>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg border border-blue-300">
              <h3 className="font-semibold text-blue-800">Abstract Plot</h3>
              <div className="text-xs text-gray-700 mt-1">config/abstract-plot.yaml</div>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg border border-blue-300">
              <h3 className="font-semibold text-blue-800">Concrete Plot</h3>
              <div className="text-xs text-gray-700 mt-1">config/concrete-plot.yaml</div>
            </div>
          </div>
        </div>
        
        {/* Plot Manager Section */}
        <div className="flex justify-center mb-4">
          <div className="bg-green-100 p-4 rounded-lg border border-green-300 w-3/4">
            <h3 className="font-bold text-center text-green-800">Plot Manager</h3>
            <div className="grid grid-cols-3 gap-2 mt-3">
              <div className="bg-white p-2 rounded text-sm text-center">PlotChecker</div>
              <div className="bg-white p-2 rounded text-sm text-center">PlotContextBuilder</div>
              <div className="bg-white p-2 rounded text-sm text-center">WorldSettingsManager</div>
              <div className="bg-white p-2 rounded text-sm text-center">LiteraryComparisonSystem</div>
              <div className="bg-white p-2 rounded text-sm text-center">ThemeResonanceAnalyzer</div>
              <div className="bg-white p-2 rounded text-sm text-center">SceneStructureOptimizer</div>
            </div>
          </div>
        </div>
        
        {/* Arrow Down */}
        <div className="flex justify-center my-1">
          <svg height="40" width="30">
            <polygon points="15,0 0,15 30,15" className="fill-gray-400" />
            <rect x="10" y="15" width="10" height="25" className="fill-gray-400" />
          </svg>
        </div>
        
        {/* Context Generator */}
        <div className="flex justify-center mb-4">
          <div className="bg-purple-100 p-4 rounded-lg border border-purple-300 w-3/4">
            <h3 className="font-bold text-center text-purple-800">Context Generator</h3>
            <div className="text-sm mt-2 text-center">
              物語の現状、キャラクター、プロット要素などあらゆる情報を
              <br />統合してAI生成の入力コンテキストを構築
            </div>
          </div>
        </div>
        
        {/* Arrow Down */}
        <div className="flex justify-center my-1">
          <svg height="40" width="30">
            <polygon points="15,0 0,15 30,15" className="fill-gray-400" />
            <rect x="10" y="15" width="10" height="25" className="fill-gray-400" />
          </svg>
        </div>
        
        {/* Prompt Template */}
        <div className="flex justify-center mb-4">
          <div className="bg-yellow-100 p-4 rounded-lg border border-yellow-300 w-3/4">
            <h3 className="font-bold text-center text-yellow-800">Enhanced Prompt Template</h3>
            <div className="text-sm mt-2 text-center">
              生成コンテキストを基に構造化された詳細なプロンプトを生成
              <br />（文学的手法、テーマ深化、テンション調整などを統合）
            </div>
          </div>
        </div>
        
        {/* Arrow Down */}
        <div className="flex justify-center my-1">
          <svg height="40" width="30">
            <polygon points="15,0 0,15 30,15" className="fill-gray-400" />
            <rect x="10" y="15" width="10" height="25" className="fill-gray-400" />
          </svg>
        </div>
        
        {/* AI Generation */}
        <div className="flex justify-center">
          <div className="bg-red-100 p-4 rounded-lg border border-red-300 w-3/4">
            <h3 className="font-bold text-center text-red-800">AI Text Generation</h3>
            <div className="text-sm mt-2 text-center">
              構造化プロンプトに基づいて一貫性のある小説チャプターを生成
            </div>
          </div>
        </div>
      </div>
      
      {/* Flow explanation */}
      <div className="mt-6 p-3 bg-white rounded-lg shadow border text-sm w-full">
        <p className="font-semibold mb-2">主要な機能フロー:</p>
        <ol className="list-decimal pl-5 space-y-1">
          <li>設定ファイルからプロット情報を読み込み</li>
          <li>章番号に応じたプロットコンテキストを構築</li>
          <li>文学的インスピレーション・テーマ分析による品質向上処理</li>
          <li>生成コンテキストの構築と統合</li>
          <li>最適化されたプロンプトの生成</li>
          <li>AI生成および生成内容のプロット整合性検証</li>
        </ol>
      </div>
    </div>
  );
};

export default PlotSystemDiagram;