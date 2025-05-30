/**
 * @fileoverview 共通型定義
 * @description
 * アプリケーション全体で使用される主要な型定義を提供します。
 */

/**
 * 主語パターン最適化結果
 * @interface SubjectPatternOptimization
 */
export interface SubjectPatternOptimization {
    /** 主語多様性スコア（0-1、高いほど多様） */
    score: number;
    /** 主語パターンの問題点リスト */
    problems: string[];
    /** 改善提案リスト */
    suggestions: string[];
  }
  
  /**
   * 文構造改善提案
   * @interface StructureRecommendation
   */
  export interface StructureRecommendation {
    /** 改善のタイプ（バリエーション、リズム、修飾語、主述関係など） */
    type: string;
    /** 現在の文体における問題や改善点 */
    issue: string;
    /** 具体的な改善アイデア */
    suggestion: string;
    /** 改善例 */
    example: {
      /** 改善前の例 */
      before: string;
      /** 改善後の例 */
      after: string;
    };
  }
  
  /**
   * 繰り返し表現の代替提案
   * @interface RepetitionAlternative
   */
  export interface RepetitionAlternative {
    /** 元の表現 */
    original: string;
    /** 代替表現のリスト */
    alternatives: string[];
    /** 表現が使われる一般的な文脈 */
    context: string;
  }

  /**
 * @fileoverview テーマ強化に関する型定義
 * @description
 * テーマ分析や強化に関連するデータ型を定義します。
 * テーマの共鳴分析、テーマ強化提案、文学技法、象徴要素、伏線機会などの型を提供します。
 */

/**
 * テーマ共鳴分析結果
 */
export interface ThemeResonanceAnalysis {
    /**
     * 各テーマの分析情報
     */
    themes?: {
      [themeName: string]: {
        /**
         * 明示的な言及（テキスト内の直接的な表現）
         */
        explicitMentions?: string[];
        
        /**
         * 暗示的な表現（テキスト内の間接的な表現）
         */
        implicitExpressions?: string[];
        
        /**
         * テーマの強度（0-1）
         */
        strength?: number;
        
        /**
         * テーマの表現方法
         */
        expressionMethods?: string[];
        
        /**
         * 関連するテーマ
         */
        relatedThemes?: string[];
      }
    };
    
    /**
     * 全体的な一貫性スコア
     */
    overallCoherence?: number;
    
    /**
     * 最も強いテーマ
     */
    dominantTheme?: string;
    
    /**
     * テーマ間の緊張関係
     */
    themeTensions?: {
      [key: string]: {
        /**
         * 緊張関係にあるテーマのペア
         */
        themes: [string, string];
        
        /**
         * 緊張の強度（0-1）
         */
        tensionLevel: number;
        
        /**
         * 緊張の性質の説明
         */
        description?: string;
      }
    };
  }
  
  /**
   * テーマ強化提案
   */
  export interface ThemeEnhancement {
    /**
     * テーマ名
     */
    theme: string;
    
    /**
     * 現在の強度（0-1）
     */
    currentStrength?: number;
    
    /**
     * 具体的な改善提案
     */
    suggestion: string;
    
    /**
     * 使用するアプローチ（象徴、対比、メタファーなど）
     */
    approach?: string;
    
    /**
     * 具体例
     */
    example?: string;
    
    /**
     * 期待される効果
     */
    impact?: string;
  }
  
  /**
   * 文学的技法
   */
  export interface LiteraryTechnique {
    /**
     * 技法名
     */
    techniqueName: string;
    
    /**
     * 技法の説明
     */
    description: string;
    
    /**
     * 具体的な使用例
     */
    example: string;
    
    /**
     * 期待される効果
     */
    effect: string;
    
    /**
     * 適切なジャンル
     */
    suitableGenres: string[];
    
    /**
     * テーマとの関連性（0-1）
     */
    themeRelevance: number;
  }
  
  /**
   * 文学的技法提案
   */
  export interface LiteraryInspiration {
    /**
     * プロット技法
     */
    plotTechniques: {
      /**
       * 技法名
       */
      technique: string;
      
      /**
       * 技法の説明
       */
      description: string;
      
      /**
       * 具体的な適用例
       */
      example: string;
      
      /**
       * 参考となる使用例
       */
      reference: string;
    }[];
    
    /**
     * キャラクター技法
     */
    characterTechniques: {
      technique: string;
      description: string;
      example: string;
      reference: string;
    }[];
    
    /**
     * 雰囲気技法
     */
    atmosphereTechniques: {
      technique: string;
      description: string;
      example: string;
      reference: string;
    }[];
  }
  
  /**
   * テーマを強化するための象徴要素
   */
  export interface SymbolicElement {
    /**
     * 関連するテーマ
     */
    theme: string;
    
    /**
     * 象徴の名前/種類
     */
    symbolName: string;
    
    /**
     * 象徴の説明
     */
    description: string;
    
    /**
     * 物語での使用方法
     */
    usage: string;
    
    /**
     * 期待される効果
     */
    effect: string;
    
    /**
     * 使用時の注意点
     */
    caution: string;
  }
  
  /**
   * 伏線機会
   */
  export interface ForeshadowingOpportunity {
    /**
     * 伏線要素の説明
     */
    element: string;
    
    /**
     * テキスト内の位置の説明
     */
    textPosition: string;
    
    /**
     * 将来の展開での活用方法
     */
    possibleDevelopments: string[];
    
    /**
     * 推奨される解決章
     */
    suggestedResolutionChapter: number;
    
    /**
     * 関連するテーマ
     */
    relatedTheme: string;
    
    /**
     * 重要度（0-1）
     */
    importance: number;
  }
  
  /**
   * テーマ強化リクエスト
   */
  export interface ThemeEnhancementRequest {
    /**
     * テーマ分析結果
     */
    themeAnalysis: ThemeResonanceAnalysis;
    
    /**
     * 章番号
     */
    chapterNumber: number;
    
    /**
     * コンテキスト情報
     */
    context: any;
    
    /**
     * ジャンル
     */
    genre: string;
    
    /**
     * ストーリーフェーズ
     */
    storyPhase: string;
  }
  
  /**
   * 文学的技法リクエスト
   */
  export interface LiteraryTechniqueRequest {
    /**
     * 章番号
     */
    chapterNumber: number;
    
    /**
     * 世界設定
     */
    worldSettings: string;
    
    /**
     * テーマ設定
     */
    themeSettings: string;
    
    /**
     * ジャンル
     */
    genre: string;
    
    /**
     * 総章数
     */
    totalChapters: number;
    
    /**
     * テンション値（0-1）
     */
    tension: number;
    
    /**
     * ストーリーフェーズ
     */
    storyPhase: string;
  }

  export interface ExpressionUsage {
    expression: string;            // 表現テキスト
    count: number;                 // 使用回数
    firstUsedInChapter: number;    // 初めて使用されたチャプター番号
    lastUsedInChapter: number;     // 最後に使用されたチャプター番号
    chapters: number[];            // 使用されたチャプター番号のリスト
    contexts?: string[];           // 使用コンテキスト例
    category?: 'DESCRIPTION' | 'DIALOGUE' | 'ACTION' | 'TRANSITION'; // 表現カテゴリ
}

export interface ExpressionUsageResult {
    newExpressions: string[];     // 新しく追跡された表現
    repeatedExpressions: string[]; // 繰り返された表現
    totalTracked: number;         // 追跡された表現の総数
    diversityScore: number;       // 多様性スコア (0-1)
}

/**
 * 伏線要素
 */
export interface ForeshadowingElement {
  id: string;
  description: string;
  chapter_introduced: number;
  urgency: 'low' | 'medium' | 'high';
  potential_resolution?: string;
  resolved?: boolean;
  resolution_chapter?: number;
  resolution_description?: string;
}

/**
 * 象徴分析結果
 */
export interface SymbolismAnalysis {
  symbols: Array<{
    symbol: string;
    occurrences?: string[];
    meaning?: string;
    thematicConnection?: string;
  }>;
  motifs: Array<{
    motif: string;
    occurrences?: string[];
    significance?: string;
  }>;
  metaphors: Array<{
    expression?: string;
    context?: string;
    interpretation?: string;
  }>;
  similes: Array<{
    expression?: string;
    context?: string;
    effect?: string;
  }>;
  thematicIntegration: string;
}

/**
 * テーマの存在感可視化結果
 */
export interface ThemePresenceVisualization {
  presenceMap: Array<{
    position: number;
    strength: number;
  }>;
  highPoints: Array<{
    position: number;
    excerpt: string;
  }>;
  overallScore: number;
}

/**
 * テーマと要素の共鳴分析
 */
export interface ThemeElementResonance {
  relevance: number;
  suggestions: string[];
  symbolicPotential: string;
}

/**
 * テーマの一貫性分析結果
 */
export interface ThemeConsistencyAnalysis {
  consistencyScore: number;
  strengthByChapter: number[];
  developmentPattern: string;
  weakPoints: Array<{
    chapter: number;
    issue: string;
  }>;
  improvementSuggestions: string[];
}

/**
 * テーマイメージのマッピング
 */
export interface ThemeImageryMapping {
  dominantSymbols: Array<{
    name: string;
    occurrenceCount: number;
    chapterOccurrences: number[];
    meanings: string[];
  }>;
  recurringMotifs: Array<{
    name: string;
    occurrenceCount: number;
    chapterOccurrences: number[];
    significances: string[];
  }>;
  imageryNetworks: Array<{
    name: string;
    elements: string[];
    thematicImplication: string;
  }>;
  developmentSuggestions: string[];
}

/**
 * モチーフ追跡結果
 */
export interface MotifTrackingResult {
  motif: string;
  occurrencesByChapter: Array<{
    chapter: number;
    occurrenceCount: number;
    significance: number;
    examples: string[];
    usage: string;
    meaning: string;
  }>;
  developmentPattern: string;
  thematicConnection: string;
  effectiveUses: string[];
  suggestions: string[];
}