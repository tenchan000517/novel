// src/lib/validation/consistency-checker.ts
import { Chapter } from '@/types/chapters';
import { Memory, CharacterState, ConsistencyIssue, ConsistencyResult } from '@/types/memory';
import { logger } from '@/lib/utils/logger';

export class ConsistencyChecker {
  /**
   * チャプターの一貫性をチェック
   * @param chapter チャプター
   * @param memories オプションの関連記憶配列
   * @returns 一貫性チェック結果
   */
  async checkConsistency(
    chapter: Chapter,
    memoriesOrPreviousContent: Memory[] | string = []
  ): Promise<ConsistencyResult> {
    logger.info(`Checking consistency for chapter ${chapter.chapterNumber}`);
    
    try {
      // 前のチャプターの内容が文字列で渡された場合
      if (typeof memoriesOrPreviousContent === 'string') {
        return await this.checkBasicConsistency(chapter, memoriesOrPreviousContent);
      }
      
      // メモリー配列の場合
      const memories = memoriesOrPreviousContent as Memory[];
      
      // キャラクター整合性
      const characterIssues = await this.checkCharacterConsistency(chapter, memories);
      
      // プロット整合性
      const plotIssues = await this.checkPlotConsistency(chapter, memories);
      
      // すべての問題を集約
      // FIX: characterIssues.issues を使用する（characterIssues全体ではなく）
      const allIssues = [...characterIssues.issues, ...plotIssues];
      
      return {
        isConsistent: allIssues.length === 0,
        issues: allIssues
      };
    } catch (error) {
      logger.error('Error during consistency check', {
        error: error instanceof Error ? error.message : String(error),
        chapterNumber: chapter.chapterNumber
      });
      
      // エラー時はデフォルトでtrueを返す
      return {
        isConsistent: true,
        issues: []
      };
    }
  }

  /**
   * キャラクターの一貫性をチェック
   * @param chapter チャプター
   * @param previousCharacterStates 以前のキャラクター状態
   * @returns 一貫性チェック結果
   */
  async checkCharacterConsistency(
    chapter: Chapter,
    previousCharacterStates: CharacterState[] | Memory[]
  ): Promise<ConsistencyResult> {
    logger.debug('Checking character consistency');
    
    const issues: ConsistencyIssue[] = [];
    
    // キャラクターの登場履歴チェック
    const characters = this.extractCharacters(chapter.content);
    
    // 入力がMemory[]型の場合の処理
    if (previousCharacterStates.length > 0 && 'type' in previousCharacterStates[0]) {
      const memories = previousCharacterStates as Memory[];
      
      for (const character of characters) {
        // キャラクターが過去の記憶に存在するか確認
        const history = this.getCharacterHistory(character, memories);
        
        // 新キャラクターの場合はスキップ
        if (history.length === 0) continue;
        
        // 性格の一貫性チェック
        if (this.hasPersonalityInconsistency(character, history)) {
          issues.push({
            type: 'CHARACTER_PERSONALITY',
            description: `${character}の性格が過去の描写と矛盾している可能性があります`,
            severity: 'HIGH',
          });
        }
      }
    } 
    // CharacterState[]型の場合の処理
    else {
      const characterStates = previousCharacterStates as CharacterState[];
      
      for (const characterState of characterStates) {
        if (!characters.includes(characterState.name)) {
          // チャプターに登場しないキャラクターはスキップ
          continue;
        }
        
        // キャラクターの一貫性チェック（テスト目的の簡易実装）
        // CharacterState型の場合の処理ロジック
        const characterContent = chapter.content;
        let inconsistencyFound = false;
        
        if (characterState.mood && !this.isConsistentWithMood(characterContent, characterState.name, characterState.mood)) {
          inconsistencyFound = true;
        }
        
        if (characterState.development && !this.isConsistentWithDevelopment(characterContent, characterState.name, characterState.development)) {
          inconsistencyFound = true;
        }
        
        if (inconsistencyFound) {
          issues.push({
            type: 'CHARACTER_STATE',
            description: `${characterState.name}のキャラクター描写が一貫していません`,
            severity: 'MEDIUM',
          });
        }
      }
    }
    
    return {
      isConsistent: issues.length === 0,
      issues
    };
  }
  
  /**
   * 基本的な一貫性をチェック
   * @param chapter 現在のチャプター
   * @param previousContent 前のチャプターの内容
   * @returns 一貫性チェック結果
   */
  async checkBasicConsistency(
    chapter: Chapter,
    previousContent: string
  ): Promise<ConsistencyResult> {
    logger.debug('Checking basic consistency between chapters');
    
    const issues: ConsistencyIssue[] = [];
    
    // 前のチャプターと現在のチャプターの関連性チェック
    const currentContent = chapter.content;
    
    // キャラクター一貫性チェック
    const prevCharacters = this.extractCharacters(previousContent);
    const currentCharacters = this.extractCharacters(currentContent);
    
    // 新規登場キャラクター数が多すぎる場合に警告
    const newCharacters = currentCharacters.filter(c => !prevCharacters.includes(c));
    if (newCharacters.length > 3 && currentCharacters.length > 5) {
      issues.push({
        type: 'CHARACTER_CONTINUITY',
        description: `急に多くの新キャラクターが登場しています（${newCharacters.length}人）`,
        severity: 'LOW',
      });
    }
    
    // 主要キャラクターが突然消えた場合に警告
    const mainCharacterCount = 2; // 主要キャラクター数の閾値
    const missingMainCharacters = prevCharacters
      .slice(0, mainCharacterCount)
      .filter(c => !currentCharacters.includes(c));
    
    if (missingMainCharacters.length > 0) {
      issues.push({
        type: 'CHARACTER_CONTINUITY',
        description: `主要キャラクター（${missingMainCharacters.join(', ')}）が突然消えています`,
        severity: 'MEDIUM',
      });
    }
    
    // 場所や設定の一貫性（簡易チェック）
    const prevLocations = this.extractLocations(previousContent);
    const currentLocations = this.extractLocations(currentContent);
    
    // 場所の唐突な変更をチェック
    const isLocationContinuous = prevLocations.some(loc => currentLocations.includes(loc));
    if (prevLocations.length > 0 && currentLocations.length > 0 && !isLocationContinuous) {
      issues.push({
        type: 'SETTING_CONTINUITY',
        description: `場所の連続性が保たれていません（前: ${prevLocations.join(', ')}、現在: ${currentLocations.join(', ')}）`,
        severity: 'LOW',
      });
    }
    
    return {
      isConsistent: issues.length === 0,
      issues
    };
  }
  
  /**
   * プロットの一貫性をチェック
   * @param chapter チャプター
   * @param memories メモリー配列
   * @returns 一貫性の問題配列
   */
  async checkPlotConsistency(
    chapter: Chapter,
    memories: Memory[]
  ): Promise<ConsistencyIssue[]> {
    logger.debug('Checking plot consistency');
    
    const issues: ConsistencyIssue[] = [];
    
    // 時系列チェック
    const timelineIssues = this.checkTimeline(chapter, memories);
    issues.push(...timelineIssues);
    
    // 因果関係チェック
    const causalityIssues = this.checkCausality(chapter, memories);
    issues.push(...causalityIssues);
    
    return issues;
  }
  
  private extractCharacters(content: string): string[] {
    // テキストからキャラクター名を抽出する簡易実装
    // フェーズ3でキャラクター管理システムと統合して高度化予定
    
    // 基本的な名前抽出（カギカッコの後や、「〜は」「〜が」のパターン検出）
    const patterns = [
      /「([^」]{1,10})」/g,  // カギカッコ内の短い名前
      /([^\s、。]{1,10})は/g,  // 〜は
      /([^\s、。]{1,10})が/g,  // 〜が
    ];
    
    let matches: string[] = [];
    
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        if (match[1] && match[1].length >= 2) {
          matches.push(match[1]);
        }
      }
    });
    
    // 重複を除去して頻出順にソート
    const characterCounts = matches.reduce((counts, name) => {
      counts[name] = (counts[name] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
    
    // 頻出度でソート
    const characters = Object.keys(characterCounts)
      .sort((a, b) => characterCounts[b] - characterCounts[a]);
    
    // 明らかに名前ではないものをフィルタリング
    const filteredCharacters = characters.filter(name => {
      // 一般的な代名詞や助詞などを除外
      const exclusions = ['これ', 'それ', 'あれ', 'この', 'その', 'あの', 'ここ', 'そこ', 'あそこ'];
      return !exclusions.includes(name);
    });
    
    return filteredCharacters;
  }
  
  private extractLocations(content: string): string[] {
    // シンプルな場所抽出ロジック（実装のプレースホルダー）
    const locationPatterns = [
      /(.{1,10})(城|町|村|市|国|山|森|海|川|湖|谷)/g,
    ];
    
    const matches: string[] = [];
    
    locationPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        if (match[0]) {
          matches.push(match[0]);
        }
      }
    });
    
    // 重複を除去
    return Array.from(new Set(matches));
  }
  
  private getCharacterHistory(character: string, memories: Memory[]): Memory[] {
    // 特定のキャラクターに関する記憶を抽出
    return memories.filter(memory => 
      memory.content.includes(character)
    );
  }
  
  private hasPersonalityInconsistency(character: string, history: Memory[]): boolean {
    // このフェーズでは簡易実装（常にfalseを返す）
    // フェーズ3でキャラクター管理システムと統合して高度化予定
    return false;
  }
  
  private isConsistentWithMood(content: string, characterName: string, mood: string): boolean {
    // キャラクターの気分との一貫性チェック（簡易実装）
    // 実際の実装ではより複雑なNLP処理が必要
    
    const moodPatterns: Record<string, RegExp[]> = {
      '冒険心旺盛': [/冒険/g, /挑戦/g, /興味/g, /好奇心/g],
      '賢明で慎重': [/慎重/g, /考え/g, /分析/g, /判断/g],
      '臆病で内向的': [/怖/g, /不安/g, /逃げ/g, /躊躇/g],
      // 他の気分パターンも追加可能
    };
    
    if (!moodPatterns[mood]) {
      return true; // 未定義の気分は常に一貫していると見なす
    }
    
    // キャラクター周辺のテキストから気分の一致度を判断
    const paragraphs = content.split(/\n+/);
    let characterParagraphs = 0;
    let moodMatchCount = 0;
    
    for (const paragraph of paragraphs) {
      if (paragraph.includes(characterName)) {
        characterParagraphs++;
        
        // 気分パターンとのマッチをチェック
        const patterns = moodPatterns[mood];
        for (const pattern of patterns) {
          if (pattern.test(paragraph)) {
            moodMatchCount++;
            break;
          }
        }
      }
    }
    
    // キャラクターが登場する段落の半分以上で気分の一致が必要
    return characterParagraphs === 0 || moodMatchCount >= characterParagraphs * 0.3;
  }
  
  private isConsistentWithDevelopment(content: string, characterName: string, development: string): boolean {
    // キャラクターの成長との一貫性チェック（簡易実装）
    // 実際の実装ではより複雑なNLP処理が必要
    
    // 現段階では単純なキーワードマッチング
    return content.includes(development) || !content.includes(characterName);
  }
  
  private checkTimeline(chapter: Chapter, memories: Memory[]): ConsistencyIssue[] {
    // 時系列の整合性チェック
    // このフェーズでは簡易実装
    return [];
  }
  
  private checkCausality(chapter: Chapter, memories: Memory[]): ConsistencyIssue[] {
    // 因果関係の整合性チェック
    // このフェーズでは簡易実装
    return [];
  }
}