// src\lib\analysis\services\reader\interfaces.ts
/**
 * 小説生成AIシステム - TypeScript インターフェース定義
 */

// 共通型定義
export interface Chapter {
  chapterNumber: number;
  title: string;
  content: string;
  scenes?: Scene[];
}

export interface Scene {
  id: string;
  type: string;
  title: string;
  startPosition: number;
  endPosition: number;
  characters: string[];
  summary: string;
}

// 読者体験分析結果インターフェース
export interface ReaderExperienceAnalysis {
  /** 興味維持度 (1-10) */
  interestRetention: number;
  /** 感情移入度 (1-10) */
  empathy: number;
  /** 理解度 (1-10) */
  clarity: number;
  /** 意外性 (1-10) */
  unexpectedness: number;
  /** 続きへの期待度 (1-10) */
  anticipation: number;
  /** 総合スコア (1-10) */
  overallScore: number;
  /** 弱点 */
  weakPoints: Array<{
    point: string;
    suggestion?: string;
  }>;
  /** 強み */
  strengths: string[];
}

// API リクエスト/レスポンス インターフェース

// 読者体験分析
export interface AnalyzeReaderExperienceRequest {
  chapter: Chapter;
  previousChapters?: Chapter[];
}

export interface AnalyzeReaderExperienceResponse {
  analysis: ReaderExperienceAnalysis;
}

// 改善提案生成
export interface GenerateImprovementsRequest {
  analysis: ReaderExperienceAnalysis;
}

export interface GenerateImprovementsResponse {
  improvements: string[];
}

// シーン改善提案
export interface GenerateSceneImprovementsRequest {
  chapter: Chapter;
  analysis: ReaderExperienceAnalysis;
}

export interface GenerateSceneImprovementsResponse {
  sceneImprovements: {
    [sceneId: string]: string[];
  };
}

// ジャンル期待分析
export interface GetGenreExpectationsRequest {
  genre: string;
  chapterNumber: number;
  totalChapters?: number;
}

export interface GetGenreExpectationsResponse {
  expectations: string[];
}

// 読者タイプ分析
export interface AnalyzeForReaderTypeRequest {
  chapter: Chapter;
  readerType: 'casual' | 'critical' | 'genre' | 'emotional';
}

export interface AnalyzeForReaderTypeResponse {
  recommendations: string[];
}

// シーン抽出
export interface ExtractScenesRequest {
  content: string;
  options?: {
    minSceneLength?: number;
    detectCharacters?: boolean;
  };
}

export interface ExtractScenesResponse {
  scenes: Scene[];
}

// エラーレスポンス
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: string;
  };
}

// API サービスインターフェース
export interface NovelAISystemAPI {
  // 読者体験分析
  analyzeReaderExperience(
    request: AnalyzeReaderExperienceRequest
  ): Promise<AnalyzeReaderExperienceResponse>;
  
  // 改善提案生成
  generateImprovements(
    request: GenerateImprovementsRequest
  ): Promise<GenerateImprovementsResponse>;
  
  // シーン改善提案生成
  generateSceneImprovements(
    request: GenerateSceneImprovementsRequest
  ): Promise<GenerateSceneImprovementsResponse>;
  
  // ジャンル期待分析
  getGenreExpectations(
    request: GetGenreExpectationsRequest
  ): Promise<GetGenreExpectationsResponse>;
  
  // 読者タイプ分析
  analyzeForReaderType(
    request: AnalyzeForReaderTypeRequest
  ): Promise<AnalyzeForReaderTypeResponse>;
  
  // シーン抽出
  extractScenes(
    request: ExtractScenesRequest
  ): Promise<ExtractScenesResponse>;
}