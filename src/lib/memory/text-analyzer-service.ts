// src/lib/memory/text-analyzer-service.ts
import { CharacterState } from '@/types/memory';
import { logger } from '@/lib/utils/logger';
import { GeminiClient } from '@/lib/generation/gemini-client';

/**
 * @class TextAnalyzerService
 * @description
 * テキスト分析を提供するサービスクラスです。
 * AIベースとルールベースの分析を組み合わせ、テキストから有用な情報を抽出します。
 * AIリクエストの最適化のため、キャッシュを活用し、必要な場合のみAIを使用します。
 */
export class TextAnalyzerService {
  // キャッシュ
  private characterStateCache = new Map<string, CharacterState[]>();
  
  /**
   * コンストラクタ
   * 
   * @param geminiClient AIテキスト生成クライアント（オプション）
   */
  constructor(private geminiClient?: GeminiClient) {}
  
  /**
   * キャラクター状態を分析します
   * 
   * @param text 分析対象のテキスト
   * @param characterNames キャラクター名の配列
   * @returns {Promise<CharacterState[]>} キャラクター状態の配列
   */
  async analyzeCharacterStates(
    text: string,
    characterNames: string[]
  ): Promise<CharacterState[]> {
    // キャッシュの使用
    const cacheKey = this.generateCacheKey(text, characterNames);
    if (this.characterStateCache.has(cacheKey)) {
      return this.characterStateCache.get(cacheKey)!;
    }
    
    // まずルールベースの分析を実行
    const ruleBasedStates = this.analyzeCharacterStatesRuleBased(text, characterNames);
    
    // AIクライアントがある場合、AIによる分析も実行
    if (this.geminiClient && characterNames.length > 0) {
      try {
        const aiStates = await this.analyzeCharacterStatesWithAI(text, characterNames);
        
        // ルールベースとAIの結果をマージ
        const mergedStates = this.mergeCharacterStates(ruleBasedStates, aiStates);
        
        // キャッシュに保存
        this.characterStateCache.set(cacheKey, mergedStates);
        
        return mergedStates;
      } catch (error) {
        logger.warn('AI-based character state analysis failed, falling back to rule-based', { error: error instanceof Error ? error.message : String(error) });
        return ruleBasedStates;
      }
    }
    
    return ruleBasedStates;
  }
  
  /**
   * キャッシュキーを生成します
   */
  private generateCacheKey(text: string, characterNames: string[]): string {
    // テキストのハッシュ化（簡易的な実装）
    const textHash = this.simpleHash(text);
    const namesHash = this.simpleHash(characterNames.sort().join(','));
    return `${textHash}-${namesHash}`;
  }
  
  /**
   * 簡易的なハッシュ関数
   */
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 32bit整数に変換
    }
    return Math.abs(hash);
  }
  
  /**
   * ルールベースでキャラクター状態を分析します
   */
  private analyzeCharacterStatesRuleBased(
    text: string,
    characterNames: string[]
  ): CharacterState[] {
    const states: CharacterState[] = [];
    
    for (const name of characterNames) {
      // キャラクター周辺のテキストを取得
      const nameContexts = this.extractCharacterContexts(text, name);
      
      // 感情分析
      const mood = this.analyzeMood(nameContexts);
      
      // 発展/変化分析
      const development = this.analyzeDevelopment(nameContexts, name);
      
      // 関係性分析（簡略化）
      const relationships = this.analyzeRelationships(nameContexts, name, characterNames);
      
      states.push({
        name,
        mood,
        development,
        relationships
      });
    }
    
    return states;
  }
  
  /**
   * キャラクター周辺のテキストを抽出します
   */
  private extractCharacterContexts(text: string, characterName: string): string[] {
    const contexts: string[] = [];
    
    // キャラクター名の前後の文脈を取得するパターン
    const patterns = [
      new RegExp(`[^。！？]{0,30}${characterName}[^。！？]{0,50}[。！？]`, 'g'),
      new RegExp(`[。！？][^。！？]{0,30}${characterName}[^。！？]{0,30}`, 'g')
    ];
    
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        contexts.push(match[0]);
      }
    });
    
    return contexts;
  }
  
  /**
   * 感情を分析します
   */
  private analyzeMood(contexts: string[]): string {
    const moodKeywords: Record<string, string[]> = {
      '喜び': ['笑', '嬉し', '楽し', '喜', '幸せ', '愉快'],
      '悲しみ': ['泣', '悲し', '辛', '寂し', '悲嘆', '憂鬱'],
      '怒り': ['怒', '激怒', '苛立', '不満', '憤', '激昂'],
      '恐怖': ['恐', '怖', '震え', '怯え', '恐怖', '戦慄'],
      '驚き': ['驚', 'びっくり', '目を見開', '衝撃', '動揺'],
      '平静': ['冷静', '落ち着', '静か', '平静', '無表情']
    };
    
    // 各感情のカウント
    const moodCounts: Record<string, number> = Object.keys(moodKeywords).reduce((acc, mood) => {
      acc[mood] = 0;
      return acc;
    }, {} as Record<string, number>);
    
    // 各文脈で感情キーワードをカウント
    for (const context of contexts) {
      for (const [mood, keywords] of Object.entries(moodKeywords)) {
        for (const keyword of keywords) {
          if (context.includes(keyword)) {
            moodCounts[mood]++;
            break; // 同じ感情は1回のみカウント
          }
        }
      }
    }
    
    // 最も多い感情を返す
    const dominantMood = Object.entries(moodCounts).reduce(
      (max, [mood, count]) => count > max[1] ? [mood, count] : max,
      ['不明', 0]
    );
    
    return dominantMood[1] > 0 ? dominantMood[0] : '不明';
  }
  
  /**
   * 発展/変化を分析します
   */
  private analyzeDevelopment(contexts: string[], characterName: string): string {
    const developmentPatterns = [
      `${characterName}(は|が).*?(変わった|成長した|気づいた|決意した|悟った)`,
      `${characterName}(の|に).*?(変化|成長|決断|覚醒|気づき)`,
      `${characterName}(は|が|の).*?(人物|人間|性格).*?(変わる|変化する|成長する)`
    ];
    
    // 発展を示す文脈を抽出
    const developmentContexts: string[] = [];
    
    for (const context of contexts) {
      for (const pattern of developmentPatterns) {
        if (new RegExp(pattern).test(context)) {
          developmentContexts.push(context);
          break;
        }
      }
    }
    
    // 発展がない場合は空文字列を返す
    if (developmentContexts.length === 0) {
      return '';
    }
    
    // 最初の発展文脈を返す
    return developmentContexts[0];
  }
  
  /**
   * 関係性を分析します
   */
  private analyzeRelationships(
    contexts: string[],
    characterName: string,
    allCharacters: string[]
  ) {
    // 他のキャラクターとの関係を示す文脈を検索
    const relationships = [];
    
    for (const otherChar of allCharacters) {
      if (otherChar === characterName) continue;
      
      // 両方のキャラクターが含まれる文脈を検索
      const relatedContexts = contexts.filter(ctx => ctx.includes(otherChar));
      
      if (relatedContexts.length > 0) {
        // 関係性を単純に決定
        const relationship = this.determineRelationshipType(relatedContexts, characterName, otherChar);
        
        relationships.push({
          character: otherChar,
          relation: relationship
        });
      }
    }
    
    return relationships;
  }
  
  /**
   * 関係性のタイプを決定します
   */
  private determineRelationshipType(
    contexts: string[],
    character1: string,
    character2: string
  ): string {
    const relationKeywords: Record<string, string[]> = {
      '友人': ['友', '仲間', '親友', '共に'],
      '家族': ['父', '母', '兄', '姉', '弟', '妹', '息子', '娘', '夫', '妻', '親戚'],
      '恋愛': ['恋', '愛', 'キス', '抱きしめ', '好き'],
      '敵対': ['敵', '憎', '対立', '戦う', '反対'],
      '師弟': ['師', '弟子', '教え', '学ぶ'],
      '同僚': ['同僚', '同士', '仕事', '職場'],
      '知人': ['知り合い', '顔見知り', '知人']
    };
    
    // 各関係性のカウント
    const relationCounts: Record<string, number> = Object.keys(relationKeywords).reduce((acc, rel) => {
      acc[rel] = 0;
      return acc;
    }, {} as Record<string, number>);
    
    // 各文脈で関係性キーワードをカウント
    for (const context of contexts) {
      for (const [relation, keywords] of Object.entries(relationKeywords)) {
        for (const keyword of keywords) {
          if (context.includes(keyword)) {
            relationCounts[relation]++;
            break; // 同じ関係性は1回のみカウント
          }
        }
      }
    }
    
    // 最も多い関係性を返す
    const dominantRelation = Object.entries(relationCounts).reduce(
      (max, [relation, count]) => count > max[1] ? [relation, count] : max,
      ['関係者', 0]
    );
    
    return dominantRelation[1] > 0 ? dominantRelation[0] : '関係者';
  }
  
  /**
   * AIを使用してキャラクター状態を分析します
   */
  private async analyzeCharacterStatesWithAI(
    text: string,
    characterNames: string[]
  ): Promise<CharacterState[]> {
    if (!this.geminiClient) {
      throw new Error('GeminiClient is required for AI analysis');
    }
    
    // テキストが長すぎる場合は適切な長さに切り詰める
    const truncatedText = text.length > 6000 ? text.substring(0, 6000) + '...' : text;
    
    const prompt = `
以下の物語テキストから、登場する各キャラクターの状態を分析してください。
指定されたキャラクターごとに以下を分析してください:
1. 感情状態（喜び、悲しみ、怒り、恐怖、驚き、平静など）
2. 発展や変化（成長、決意、気づき、変化など）
3. 他のキャラクターとの関係性（可能であれば）

キャラクター: ${characterNames.join(', ')}

物語テキスト:
${truncatedText}

以下の形式でJSONで出力してください:
[
  {
    "name": "キャラクター名",
    "mood": "感情状態",
    "development": "発展や変化の説明",
    "relationships": [
      {
        "character": "関係のあるキャラクター名",
        "relation": "関係性の説明"
      }
    ]
  }
]

存在しない情報は省略してもかまいません。
`;

    try {
      const response = await this.geminiClient.generateText(prompt, {
        temperature: 0.1,
        targetLength: 500 * characterNames.length
      });
      
      // JSONをパース
      const startIndex = response.indexOf('[');
      const endIndex = response.lastIndexOf(']') + 1;
      
      if (startIndex === -1 || endIndex === -1) {
        throw new Error('Invalid JSON format in response');
      }
      
      const jsonString = response.substring(startIndex, endIndex);
      const parsedResult = JSON.parse(jsonString) as CharacterState[];
      
      return parsedResult;
    } catch (error) {
      logger.error('Failed to analyze character states with AI', { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }
  
  /**
   * キャラクター状態を2つのソースからマージします
   */
  private mergeCharacterStates(
    ruleBasedStates: CharacterState[],
    aiStates: CharacterState[]
  ): CharacterState[] {
    const result: CharacterState[] = [];
    
    // すべてのキャラクター名を収集
    const allCharacters = new Set<string>();
    ruleBasedStates.forEach(state => allCharacters.add(state.name));
    aiStates.forEach(state => allCharacters.add(state.name));
    
    // 各キャラクターについて、両方のソースの情報をマージ
    for (const name of allCharacters) {
      const ruleBasedState = ruleBasedStates.find(s => s.name === name);
      const aiState = aiStates.find(s => s.name === name);
      
      if (ruleBasedState && aiState) {
        // 両方の情報があれば優先度を付けてマージ
        result.push({
          name,
          // AIの感情分析が不明の場合はルールベースを使用
          mood: aiState.mood === '不明' ? ruleBasedState.mood : aiState.mood,
          // 発展情報はAIを優先
          development: aiState.development || ruleBasedState.development,
          // 関係性情報は両方をマージ
          relationships: this.mergeRelationships(
            ruleBasedState.relationships || [], 
            aiState.relationships || []
          )
        });
      } else if (ruleBasedState) {
        // ルールベースのみの場合
        result.push(ruleBasedState);
      } else if (aiState) {
        // AIのみの場合
        result.push(aiState);
      }
    }
    
    return result;
  }
  
  /**
   * 関係性情報をマージします
   */
  private mergeRelationships(ruleBased: any[], aiRelationships: any[]): any[] {
    const result: any[] = [...ruleBased];
    
    // AIの関係性で、まだ結果に存在しないものを追加
    for (const aiRel of aiRelationships) {
      const exists = result.some(r => r.character === aiRel.character);
      if (!exists) {
        result.push(aiRel);
      }
    }
    
    return result;
  }
}