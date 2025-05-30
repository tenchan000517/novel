// src/lib/editor/intent-recognizer.ts
import { ContextHistory } from './context-history';

/**
 * 処理済みテキスト
 */
interface ProcessedText {
  normalized: string;
  tokens: string[];
  entities: Record<string, any>;
}

/**
 * インテントパターン
 */
interface IntentPattern {
  intent: string;
  patterns: RegExp[];
  keywords: string[];
  paramExtractors: Record<string, (text: string) => any>;
  contextTags: string[];
}

/**
 * インテントマッチ
 */
interface IntentMatch {
  intent: string;
  confidence: number;
  params: Record<string, any>;
}

/**
 * 認識されたインテント
 */
export interface RecognizedIntent {
  primary: IntentMatch;
  alternatives: IntentMatch[];
  confidence: number;
  context: any;
}

/**
 * 自然言語からユーザーの意図を認識するクラス
 */
export class IntentRecognizer {
  private intentPatterns: IntentPattern[] = [];
  private contextHistory: ContextHistory = new ContextHistory();
  
  constructor() {
    this.initializeIntentPatterns();
  }
  
  /**
   * インテントパターンの初期化
   */
  private initializeIntentPatterns() {
    this.intentPatterns = [
      // キャラクター追加
      {
        intent: 'ADD_CHARACTER',
        patterns: [
          /新しいキャラクター.*追加/,
          /キャラクター.*作成/,
          /キャラクター.*登場させ/
        ],
        keywords: ['キャラクター', '追加', '作成', '新規', '登場'],
        paramExtractors: {
          name: (text) => {
            const match = text.match(/名前[はが]「([^」]+)」/);
            return match ? match[1] : null;
          },
          type: (text) => {
            if (text.includes('メイン')) return 'MAIN';
            if (text.includes('サブ')) return 'SUB';
            if (text.includes('モブ')) return 'MOB';
            return 'MOB';
          }
        },
        contextTags: ['character', 'creation']
      },
      
      // キャラクター修正
      {
        intent: 'MODIFY_CHARACTER',
        patterns: [
          /キャラクター.*変更/,
          /キャラクター.*修正/,
          /キャラクター.*調整/,
          /(.+)の性格を(.+)に/
        ],
        keywords: ['キャラクター', '変更', '修正', '調整', '性格', '外見', '能力'],
        paramExtractors: {
          characterName: (text) => {
            const match = text.match(/「([^」]+)」|『([^』]+)』/);
            return match ? match[1] || match[2] : null;
          },
          trait: (text) => {
            const match = text.match(/性格を「([^」]+)」|性格を(.+)に/);
            return match ? match[1] || match[2] : null;
          }
        },
        contextTags: ['character', 'modification']
      },
      
      // プロット変更
      {
        intent: 'CHANGE_PLOT',
        patterns: [
          /プロット.*変更/,
          /ストーリー.*変更/,
          /展開.*変更/,
          /次.*チャプターで/
        ],
        keywords: ['プロット', 'ストーリー', '展開', '変更', '修正', '次'],
        paramExtractors: {
          chapterNumber: (text) => {
            const match = text.match(/チャプター(\d+)|第(\d+)章/);
            return match ? parseInt(match[1] || match[2], 10) : null;
          },
          description: (text) => {
            const match = text.match(/「([^」]+)」|『([^』]+)』/);
            return match ? match[1] || match[2] : text;
          }
        },
        contextTags: ['plot', 'story']
      },
      
      // シーン修正
      {
        intent: 'MODIFY_SCENE',
        patterns: [
          /シーン.*修正/,
          /シーン.*変更/,
          /場面.*変更/
        ],
        keywords: ['シーン', '場面', '修正', '変更', '調整'],
        paramExtractors: {
          location: (text) => {
            const match = text.match(/場所[をに]「([^」]+)」/);
            return match ? match[1] : null;
          },
          time: (text) => {
            const match = text.match(/時間[をに]「([^」]+)」/);
            return match ? match[1] : null;
          }
        },
        contextTags: ['scene', 'modification']
      },
      
      // その他の多数のインテントパターン...
    ];
  }
  
  /**
   * ユーザーの意図を認識
   * @param input 自然言語入力
   * @returns 認識された意図
   */
  async recognizeIntent(input: string): Promise<RecognizedIntent> {
    // コンテキストを考慮して意図を認識
    const context = this.contextHistory.getContext();
    
    // テキストの前処理
    const preprocessed = this.preprocessText(input);
    
    // 意図パターンのマッチング
    const matches = this.patternMatching(preprocessed);
    
    // コンテキストによる絞り込み
    const refined = this.refineWithContext(matches, context);
    
    // 認識結果を返す
    return {
      primary: refined[0] || { intent: 'UNKNOWN', confidence: 0, params: {} },
      alternatives: refined.slice(1),
      confidence: refined[0]?.confidence || 0,
      context,
    };
  }
  
  /**
   * テキストの前処理
   */
  private preprocessText(text: string): ProcessedText {
    // 正規化
    const normalized = text.toLowerCase().trim();
    
    // トークン化
    const tokens = normalized.split(/\s+/).filter(Boolean);
    
    // エンティティ抽出
    const entities = this.extractEntities(text);
    
    return {
      normalized,
      tokens,
      entities,
    };
  }
  
  /**
   * エンティティ抽出
   */
  private extractEntities(text: string): Record<string, any> {
    const entities: Record<string, any> = {};
    
    // キャラクター名の抽出
    const characterMatch = text.match(/「([^」]+)」|『([^』]+)』/);
    if (characterMatch) {
      entities.character = characterMatch[1] || characterMatch[2];
    }
    
    // 章番号の抽出
    const chapterMatch = text.match(/チャプター(\d+)|第(\d+)章/);
    if (chapterMatch) {
      entities.chapter = parseInt(chapterMatch[1] || chapterMatch[2], 10);
    }
    
    // その他のエンティティ抽出...
    
    return entities;
  }
  
  /**
   * パターンマッチング
   */
  private patternMatching(processed: ProcessedText): IntentMatch[] {
    const matches: IntentMatch[] = [];
    
    // 各インテントパターンについてマッチングを試行
    for (const pattern of this.intentPatterns) {
      const score = this.calculateMatchScore(processed, pattern);
      
      if (score > 0.5) {
        // パラメータ抽出
        const params = this.extractParams(processed.normalized, pattern);
        
        matches.push({
          intent: pattern.intent,
          confidence: score,
          params,
        });
      }
    }
    
    // スコア降順でソート
    return matches.sort((a, b) => b.confidence - a.confidence);
  }
  
  /**
   * マッチスコアの計算
   */
  private calculateMatchScore(processed: ProcessedText, pattern: IntentPattern): number {
    let score = 0;
    
    // 正規表現パターンのマッチング
    for (const regex of pattern.patterns) {
      if (regex.test(processed.normalized)) {
        score += 0.5;
        break;
      }
    }
    
    // キーワードの一致度
    let keywordMatches = 0;
    for (const keyword of pattern.keywords) {
      if (processed.normalized.includes(keyword)) {
        keywordMatches++;
      }
    }
    
    if (pattern.keywords.length > 0) {
      score += 0.5 * (keywordMatches / pattern.keywords.length);
    }
    
    return Math.min(1, score);
  }
  
  /**
   * パラメータ抽出
   */
  private extractParams(text: string, pattern: IntentPattern): Record<string, any> {
    const params: Record<string, any> = {};
    
    // 各パラメータエクストラクタを実行
    for (const [paramName, extractor] of Object.entries(pattern.paramExtractors)) {
      const value = extractor(text);
      if (value !== null) {
        params[paramName] = value;
      }
    }
    
    return params;
  }
  
  /**
   * コンテキストによるマッチング結果の絞り込み
   */
  private refineWithContext(matches: IntentMatch[], context: any): IntentMatch[] {
    if (matches.length === 0) {
      return [];
    }
    
    // コンテキストタグに基づく重み付け
    const weighted = matches.map(match => {
      let contextBoost = 0;
      const pattern = this.intentPatterns.find(p => p.intent === match.intent);
      
      if (pattern && context && context.tags) {
        // コンテキストタグの一致数に基づくブースト
        const matchingTags = pattern.contextTags.filter(tag => context.tags.includes(tag));
        contextBoost = 0.1 * (matchingTags.length / pattern.contextTags.length);
      }
      
      return {
        ...match,
        confidence: Math.min(1, match.confidence + contextBoost)
      };
    });
    
    // 再ソート
    return weighted.sort((a, b) => b.confidence - a.confidence);
  }
}