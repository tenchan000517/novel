// src/types/validation.ts

/**
 * 検証結果
 */
export interface ValidationResult {
    isValid: boolean;
    checks: ValidationCheck[];
    qualityScore: number;
  }
  
  /**
   * 検証チェック
   */
  export interface ValidationCheck {
    name: string;
    passed: boolean;
    message: string;
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    details?: any;
  }
  
  /**
   * バリデーション問題
   */
  export interface ValidationIssue {
    type: string;
    description: string;
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    location?: {
      position: string;
      context: string;
    };
    suggestion?: string;
  }
  
  /**
   * 提案
   */
  export interface Suggestion {
    target: string;
    issue: string;
    suggestion: string;
    reason: string;
    priority: number;
  }
  
  /**
   * 品質スコア
   */
  export interface QualityScore {
    readability: number;
    coherence: number;
    engagement: number;
    characterConsistency: number;
    overall: number;
  }
  
  /**
   * 修正候補
   */
  export interface CorrectionCandidate {
    original: string;
    corrected: string;
    reason: string;
    confidence: number;
  }
  
  /**
   * スタイル問題
   */
  export interface StyleIssue {
    voiceIssues: string[];
    toneIssues: string[];
  }
  
  /**
   * インテグリティ結果
   */
  export interface IntegrityResult {
    passed: boolean;
    issues: IntegrityIssue[];
  }
  
  /**
   * インテグリティ問題
   */
  export interface IntegrityIssue {
    type: string;
    description: string;
    location?: string;
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
  }
  
  /**
   * スタイル結果
   */
  export interface StyleResult {
    consistent: boolean;
    issues: StyleIssue;
  }
  
  /**
   * 改善領域
   */
  export interface ImprovementArea {
    aspect: string;
    description: string;
    suggestion: string;
    priority: number;
  }