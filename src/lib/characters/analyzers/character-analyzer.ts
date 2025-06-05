/**
 * @fileoverview キャラクター分析コンポーネント
 * @description
 * キャラクターの変化検出、分類、一貫性の検証を担当するクラス。
 * 既存の変化検出、分類、一貫性検証ロジックを単一のコンポーネントに統合し、
 * キャラクターの状態変化を分析する機能を提供します。
 */
import { ICharacterAnalyzer } from '../core/interfaces';
import { 
  Character, 
  CharacterDiff, 
  CharacterChange, 
  ChangeType, 
  ChangeScope, 
  ChangeClassification,
  PlotContext,
  ValidationResult
} from '../core/types';
import { logger } from '@/lib/utils/logger';
import { VALIDATION_THRESHOLDS } from '../core/constants';
import { GeminiClient } from '@/lib/generation/gemini-client';
import { ChapterMemory, ArcMemory } from '@/types/memory'; // 正しいパスから型をインポート

/**
 * キャラクター分析クラス
 * キャラクターの変化と一貫性の分析を担当
 */
export class CharacterAnalyzer implements ICharacterAnalyzer {
  private geminiClient: GeminiClient;
  
  /**
   * コンストラクタ
   */
  constructor() {
    this.geminiClient = new GeminiClient();
    logger.info('CharacterAnalyzer: 初期化完了');
  }

  /**
   * 変化検出
   * キャラクターの基本情報と現在状態を比較し、変化を検出します
   * 
   * @param baseState 基本状態
   * @param currentState 現在状態
   * @returns 検出された差分
   */
  detectChanges(baseState: any, currentState: any): CharacterDiff {
    try {
      const changes: CharacterChange[] = [];
      
      // 基本的な属性の比較
      const basicAttributes = ['mood', 'development', 'emotionalState'];
      for (const key of basicAttributes) {
        if (currentState[key] && baseState[key] !== currentState[key]) {
          changes.push({
            attribute: key,
            previousValue: baseState[key],
            currentValue: currentState[key]
          });
        }
      }
      
      // 発展段階の変化検出
      if (currentState.state?.developmentStage !== undefined && 
          baseState.state?.developmentStage !== currentState.state.developmentStage) {
        changes.push({
          attribute: 'developmentStage',
          previousValue: baseState.state?.developmentStage,
          currentValue: currentState.state.developmentStage
        });
      }
      
      // 関係性の変化検出
      this.detectRelationshipChanges(baseState, currentState, changes);
      
      // 性格特性の変化検出
      this.detectPersonalityChanges(baseState, currentState, changes);
      
      // スキルと能力の変化検出
      this.detectSkillChanges(baseState, currentState, changes);
      
      return {
        name: baseState.name,
        id: baseState.id || `character-${baseState.name.toLowerCase().replace(/\s+/g, '-')}`,
        lastAppearance: currentState.state?.lastAppearance || currentState.lastAppearance,
        developmentStage: currentState.state?.developmentStage || currentState.developmentStage,
        changes
      };
    } catch (error) {
      logger.error('キャラクター変化検出中にエラーが発生しました', {
        character: baseState?.name,
        error: error instanceof Error ? error.message : String(error)
      });
      
      return {
        name: baseState?.name || 'unknown',
        id: baseState?.id || 'unknown',
        changes: []
      };
    }
  }

  /**
   * 変化分類
   * 検出された変化を分類し、変化の重要度や種類を判定します
   * 
   * @param characterDiff キャラクター差分
   * @param plotContext プロット文脈
   * @returns 分類された差分
   */
  async classifyChanges(
    characterDiff: CharacterDiff,
    plotContext?: PlotContext
  ): Promise<CharacterDiff> {
    try {
      if (characterDiff.changes.length === 0) {
        return characterDiff; // 変化がない場合はそのまま返す
      }
      
      const classifiedChanges: CharacterChange[] = [];
      
      // 変化ごとに分類を実行（AIを使わずルールベースで）
      for (const change of characterDiff.changes) {
        try {
          // ルールベースの分類実行
          const classification = this.classifyByRules(
            change.attribute,
            change.previousValue,
            change.currentValue,
            characterDiff.developmentStage
          );
          
          // 分類済み変化を追加
          classifiedChanges.push({
            ...change,
            classification
          });
        } catch (error) {
          logger.error('変化分類に失敗', {
            character: characterDiff.name,
            attribute: change.attribute,
            error: error instanceof Error ? error.message : String(error)
          });
          
          // フォールバック分類を適用
          classifiedChanges.push({
            ...change,
            classification: this.getFallbackClassification(change, characterDiff.developmentStage)
          });
        }
      }
      
      // 変化のポストプロセシング - 矛盾する分類がないかチェック
      const finalChanges = this.postProcessChanges(classifiedChanges);
      
      return {
        ...characterDiff,
        changes: finalChanges
      };
    } catch (error) {
      logger.error('変化分類プロセス全体に失敗', {
        character: characterDiff.name,
        error: error instanceof Error ? error.message : String(error)
      });
      
      // 全てのchangesにフォールバック分類を適用
      return {
        ...characterDiff,
        changes: characterDiff.changes.map(change => ({
          ...change,
          classification: this.getFallbackClassification(change, characterDiff.developmentStage)
        }))
      };
    }
  }

  /**
   * アクション検証
   * キャラクターのアクションが一貫性を持つか検証します
   * 
   * @param character キャラクター
   * @param proposedAction 提案されたアクション
   * @param context 文脈
   * @returns 検証結果
   */
  async validateAction(
    character: Character,
    proposedAction: string,
    context: string
  ): Promise<ValidationResult> {
    try {
      logger.info(`キャラクター「${character.name}」のアクション一貫性を検証します`, {
        action: proposedAction.substring(0, 50) + '...'
      });
      
      // プロンプト作成
      const prompt = `
あなたはキャラクターの一貫性と行動の妥当性を評価する専門家です。
以下のキャラクター情報と提案された行動が、キャラクターの性格や過去の行動と一貫しているかを分析してください。

## キャラクター情報
名前: ${character.name}
タイプ: ${character.type}
説明: ${character.description}
性格特性: ${character.personality?.traits?.join(', ') || '(特性なし)'}
価値観: ${character.personality?.values?.join(', ') || '(価値観なし)'}
現在の感情状態: ${character.state?.emotionalState || 'NEUTRAL'}
発展段階: ${character.state?.developmentStage || 0}/5

## 過去の行動パターン
${this.formatCharacterHistory(character)}

## 状況
${context}

## 提案された行動
${proposedAction}

## 分析
この行動がキャラクターの性格や過去の行動パターンと一貫しているかどうかを詳細に分析してください。
一貫性の度合いを0から1のスケールで評価し、その理由を説明してください。
もし一貫性に問題があれば、より適切な代替行動を提案してください。

以下のJSONフォーマットで回答してください:
{
  "consistent": true または false,
  "confidence": 0から1の数値（確信度）,
  "explanation": "一貫性の分析理由",
  "suggestedAlternatives": ["代替行動1", "代替行動2"] // 一貫性がない場合のみ
}
`;
      
      // AIによる一貫性検証
      const result = await this.geminiClient.generateText(prompt, {
        temperature: 0.3
      });
      
      // JSONを解析
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse consistency validation JSON');
      }
      
      const validationData = JSON.parse(jsonMatch[0]);
      
      // ValidationResult形式に変換
      const validationResult: ValidationResult = {
        isValid: validationData.consistent,
        confidenceScore: validationData.confidence,
        reason: validationData.explanation,
        alternatives: validationData.suggestedAlternatives
      };
      
      return validationResult;
    } catch (error) {
      logger.error(`キャラクター「${character.name}」のアクション一貫性検証に失敗しました`, {
        error: error instanceof Error ? error.message : String(error)
      });
      
      // エラー時のフォールバック
      return {
        isValid: true,
        confidenceScore: 0.5,
        reason: 'エラーが発生したため、一貫性の検証を完了できませんでした。デフォルトで一貫性があると判断します。'
      };
    }
  }

  /**
   * 履歴との比較
   * 提案されたアクションを履歴と比較して一貫性を評価します
   * 
   * @param character キャラクター
   * @param proposedAction 提案されたアクション
   * @returns 一貫性スコア
   */
  async compareWithHistory(
    character: Character,
    proposedAction: string
  ): Promise<number> {
    try {
      // 履歴がない場合は常に一貫していると見なす
      if (!character.history || !character.history.interactions || character.history.interactions.length === 0) {
        return 1.0;
      }
      
      // キャラクターの履歴から一貫性スコアを計算
      // 履歴が短い場合は高めのスコアを返す
      if (character.history.interactions.length < 3) {
        return 0.8;
      }
      
      // プロンプト作成
      const prompt = `
あなたはキャラクターの行動の一貫性を評価する専門家です。
以下のキャラクターの過去の行動パターンと提案された新しい行動の一貫性を評価してください。

## キャラクター情報
名前: ${character.name}
タイプ: ${character.type}
説明: ${character.description}

## 過去の行動パターン
${this.formatCharacterHistory(character)}

## 提案された新しい行動
${proposedAction}

## 分析
過去の行動パターンから見て、この新しい行動がどの程度一貫しているかを0から1のスケールで評価してください。
1は完全に一貫しており自然な行動、0は完全に矛盾している行動を意味します。

数値のみを出力してください。
`;
      
      const result = await this.geminiClient.generateText(prompt, {
        temperature: 0.1,
        targetLength: 10
      });
      
      // 数値を抽出
      const scoreMatch = result.match(/0\.\d+|1\.0|1/);
      if (scoreMatch) {
        return parseFloat(scoreMatch[0]);
      }
      
      // 数値が見つからない場合は中程度のスコア
      return 0.7;
    } catch (error) {
      logger.error(`キャラクター「${character.name}」の履歴比較に失敗しました`, {
        error: error instanceof Error ? error.message : String(error)
      });
      return 0.7; // フォールバック値
    }
  }

  /**
   * プロット文脈を抽出する
   * 最近のチャプターメモリからプロット文脈情報を抽出します
   * 
   * @param recentMemories 最近のチャプターメモリ配列
   * @param arcMemory 現在のアークメモリ
   * @returns プロット文脈
   */
  async extractPlotContext(
    recentMemories: ChapterMemory[],
    arcMemory?: ArcMemory
  ): Promise<PlotContext> {
    try {
      if (!recentMemories || recentMemories.length === 0) {
        return {
          recentSummaries: '利用可能なプロット文脈がありません',
          keyEvents: []
        };
      }
      
      // チャプター番号で降順ソート（最新が先頭に）
      const sortedMemories = [...recentMemories].sort((a, b) => 
        (b.chapter || 0) - (a.chapter || 0)
      );
      
      // 最新3つのチャプターのサマリーを結合
      const recentSummaries = sortedMemories.slice(0, 3)
        .map(m => `チャプター${m.chapter}: ${m.summary}`)
        .join('\n\n');
      
      // 重要イベントを抽出
      const keyEvents = sortedMemories
        .flatMap(m => m.key_events || [])
        .slice(0, 5)
        .map(e => typeof e === 'string' ? e : e.event || String(e))
        .filter(Boolean);
      
      // アーク情報の取得
      const currentArc = arcMemory?.arc_name || arcMemory?.summary;
      
      // テーマ情報の取得（存在する場合）
      const themes = arcMemory?.themes || [];
      
      return {
        recentSummaries,
        keyEvents,
        currentArc,
        themes: Array.isArray(themes) ? themes : []
      };
    } catch (error) {
      logger.error('プロット文脈抽出中にエラーが発生しました', {
        error: error instanceof Error ? error.message : String(error)
      });
      
      return {
        recentSummaries: '利用可能なプロット文脈がありません',
        keyEvents: []
      };
    }
  }

  /**
   * 詳細な変化分析
   * キャラクターの変化を詳細に分析し、重要度やストーリーへの影響を評価します
   * 
   * @param characterDiff キャラクター差分
   * @param plotContext プロット文脈
   * @returns 分析結果
   */
  async analyzeChangeSignificance(
    characterDiff: CharacterDiff,
    plotContext?: PlotContext
  ): Promise<any> {
    try {
      // 変化がない場合
      if (characterDiff.changes.length === 0) {
        return {
          overallSignificance: 0,
          narrativeImpact: 'NONE',
          summary: 'キャラクターに重要な変化はありません'
        };
      }
      
      // 既に分類されたchangesを使用
      const hasClassification = characterDiff.changes.some(c => c.classification);
      const changes = hasClassification ? 
        characterDiff.changes : 
        (await this.classifyChanges(characterDiff, plotContext)).changes;
      
      // 全体的な重要度を計算
      let totalSignificance = 0;
      let maxSignificance = 0;
      let significantChanges = 0;
      
      for (const change of changes) {
        if (change.classification) {
          const significance = change.classification.narrativeSignificance || 0;
          totalSignificance += significance;
          maxSignificance = Math.max(maxSignificance, significance);
          
          if (significance > 0.5) {
            significantChanges++;
          }
        }
      }
      
      // 平均重要度
      const averageSignificance = changes.length > 0 ? 
        totalSignificance / changes.length : 0;
      
      // 物語への影響度合いを判定
      let narrativeImpact = 'LOW';
      if (maxSignificance > 0.8 || (averageSignificance > 0.6 && significantChanges >= 2)) {
        narrativeImpact = 'HIGH';
      } else if (maxSignificance > 0.6 || (averageSignificance > 0.4 && significantChanges >= 1)) {
        narrativeImpact = 'MEDIUM';
      }
      
      // 分析の概要を生成
      const growthChanges = changes.filter(c => 
        c.classification && c.classification.type === 'GROWTH'
      );
      
      const temporaryChanges = changes.filter(c => 
        c.classification && c.classification.type === 'TEMPORARY'
      );
      
      let summary = '';
      if (growthChanges.length > 0) {
        summary += `キャラクターに${growthChanges.length}件の成長的変化があります。`;
      }
      if (temporaryChanges.length > 0) {
        summary += `キャラクターに${temporaryChanges.length}件の一時的変化があります。`;
      }
      
      if (narrativeImpact === 'HIGH') {
        summary += '物語への影響は重大です。';
      } else if (narrativeImpact === 'MEDIUM') {
        summary += '物語への影響は中程度です。';
      } else {
        summary += '物語への影響は軽微です。';
      }
      
      return {
        overallSignificance: averageSignificance,
        maxSignificance,
        narrativeImpact,
        significantChanges,
        summary,
        growthChangesCount: growthChanges.length,
        temporaryChangesCount: temporaryChanges.length
      };
    } catch (error) {
      logger.error('変化重要度分析に失敗しました', {
        character: characterDiff.name,
        error: error instanceof Error ? error.message : String(error)
      });
      
      return {
        overallSignificance: 0.3,
        narrativeImpact: 'LOW',
        summary: '分析エラーが発生しました。デフォルトの評価を返します。'
      };
    }
  }

  // プライベートヘルパーメソッド
  
  /**
   * 関係性の変化を検出
   * @private
   */
  private detectRelationshipChanges(baseState: any, currentState: any, changes: CharacterChange[]): void {
    // 現在状態の関係性配列を確認
    const currentRelations = currentState.relationships || currentState.state?.relationships || [];
    if (!Array.isArray(currentRelations)) return;
    
    // 基本状態の関係性配列
    const baseRelations = baseState.relationships || baseState.state?.relationships || [];
    
    // 各関係性をチェック
    for (const relation of currentRelations) {
      if (!relation.character && !relation.targetId) continue;
      
      // character または targetId を使用して関係性を識別
      const targetIdentifier = relation.character || relation.targetId;
      
      // 基本状態の対応する関係性を検索
      const baseRelation = Array.isArray(baseRelations)
        ? baseRelations.find((r: any) => 
            (r.character === targetIdentifier) || (r.targetId === targetIdentifier))
        : null;
      
      // 新規または変更された関係性を検出
      if (!baseRelation || 
          this.hasRelationshipChanged(baseRelation, relation)) {
        changes.push({
          attribute: `relationship_${targetIdentifier}`,
          previousValue: baseRelation || null,
          currentValue: relation
        });
      }
    }
  }

  /**
   * 関係性が変化したかどうかを判定
   * @private
   */
  private hasRelationshipChanged(baseRelation: any, currentRelation: any): boolean {
    // 関係の種類が変化したか
    if ((baseRelation.relation !== currentRelation.relation) && 
        (baseRelation.type !== currentRelation.type)) {
      return true;
    }
    
    // 信頼度や関係の強さが変化したか
    if ((baseRelation.trust_level !== currentRelation.trust_level) || 
        (baseRelation.strength !== currentRelation.strength)) {
      return true;
    }
    
    // その他の属性で変化があれば検出
    if (baseRelation.description !== currentRelation.description) {
      return true;
    }
    
    return false;
  }

  /**
   * 性格特性の変化を検出
   * @private
   */
  private detectPersonalityChanges(baseState: any, currentState: any, changes: CharacterChange[]): void {
    // 基本の性格特性
    const basePersonality = baseState.personality || {};
    
    // 現在の性格特性
    const currentPersonality = currentState.personality || {};
    
    // 特性の配列比較
    if (basePersonality.traits && currentPersonality.traits) {
      const baseTraits = new Set(basePersonality.traits);
      const currentTraits = new Set(currentPersonality.traits);
      
      // 新しく追加された特性
      const addedTraits = [...currentTraits].filter(trait => !baseTraits.has(trait));
      // 削除された特性
      const removedTraits = [...baseTraits].filter(trait => !currentTraits.has(trait));
      
      if (addedTraits.length > 0 || removedTraits.length > 0) {
        changes.push({
          attribute: 'personality_traits',
          previousValue: [...baseTraits],
          currentValue: [...currentTraits]
        });
      }
    }
    
    // 他の性格要素（speechPatterns, quirks, values）も同様に比較
    const personalityElements = ['speechPatterns', 'quirks', 'values'];
    
    for (const element of personalityElements) {
      if (currentPersonality[element] && 
          JSON.stringify(basePersonality[element]) !== JSON.stringify(currentPersonality[element])) {
        changes.push({
          attribute: `personality_${element}`,
          previousValue: basePersonality[element] || [],
          currentValue: currentPersonality[element]
        });
      }
    }
  }

  /**
   * スキルと能力の変化を検出
   * @private
   */
  private detectSkillChanges(baseState: any, currentState: any, changes: CharacterChange[]): void {
    // スキルや能力の構造は実装によって異なる可能性がある
    // 可能な限り汎用的に検出
    
    const skillPaths = [
      'abilities', 'skills', 'powers', 'state.abilities', 'state.skills', 'state.powers'
    ];
    
    for (const path of skillPaths) {
      const keys = path.split('.');
      
      // 深いネストからのプロパティ取得
      const getNestedProp = (obj: any, keys: string[]): any => {
        return keys.reduce((acc, key) => acc && acc[key] !== undefined ? acc[key] : undefined, obj);
      };
      
      const baseSkills = getNestedProp(baseState, keys);
      const currentSkills = getNestedProp(currentState, keys);
      
      if (currentSkills && JSON.stringify(baseSkills) !== JSON.stringify(currentSkills)) {
        changes.push({
          attribute: path,
          previousValue: baseSkills || {},
          currentValue: currentSkills
        });
      }
    }
  }

  /**
   * ルールベースの分類
   * @private
   */
  private classifyByRules(
    attribute: string, 
    prevValue: any, 
    currValue: any, 
    developmentStage?: number
  ): ChangeClassification {
    // 1. 属性タイプによる初期分類
    let type: ChangeType = 'TEMPORARY';
    let scope: ChangeScope = 'EMOTIONAL_STATE';
    let narrativeSignificance = 0.3;
    let explanation = '';
    
    // 感情・気分関連は一時的変化
    if (attribute === 'mood' || attribute === 'emotionalState') {
      type = 'TEMPORARY';
      scope = 'EMOTIONAL_STATE';
      narrativeSignificance = 0.4;
      explanation = '感情状態の変化は一般的に一時的なものです';
    } 
    // 性格特性関連は重要な変化（成長段階に応じて）
    else if (attribute.startsWith('personality_')) {
      // 発展段階が高いほど成長変化として扱う
      type = (developmentStage && developmentStage >= 3) ? 'GROWTH' : 'TEMPORARY';
      scope = 'CORE_PERSONALITY';
      narrativeSignificance = 0.7;
      explanation = type === 'GROWTH' 
        ? '重要な性格変化はキャラクターの成長を示します' 
        : '発展段階が進んでいないため一時的な性格変化と判断します';
    }
    // 関係性の変化（変化の大きさで判断）
    else if (attribute.startsWith('relationship_')) {
      // 関係性の変化の大きさを計算
      const isSignificantChange = this.isSignificantRelationshipChange(prevValue, currValue);
      type = isSignificantChange ? 'GROWTH' : 'TEMPORARY';
      scope = 'RELATIONSHIPS';
      narrativeSignificance = isSignificantChange ? 0.8 : 0.4;
      explanation = isSignificantChange 
        ? '関係性の重要な変化を検出しました' 
        : '関係性に軽微な変化がありました';
    }
    // スキルや能力の向上は成長
    else if (attribute.includes('skill') || attribute.includes('abilit')) {
      type = 'GROWTH';
      scope = 'SKILLS';
      narrativeSignificance = 0.6;
      explanation = 'スキルや能力の向上はキャラクターの成長を示します';
    }
    // 発展段階の変化は常に重要
    else if (attribute === 'developmentStage') {
      type = 'GROWTH';
      scope = 'CORE_PERSONALITY';
      narrativeSignificance = 0.9;
      explanation = '発展段階の変化は物語上重要な意味を持ちます';
    }
    // 一般的な変化
    else {
      // デフォルトでは一時的変化としておく
      type = 'TEMPORARY';
      scope = 'EMOTIONAL_STATE';
      narrativeSignificance = 0.3;
      explanation = '標準的な変化と判断します';
    }
    
    return {
      type,
      scope,
      confidence: 0.9, // ルールベースなので高い確信度
      explanation,
      narrativeSignificance
    };
  }

  /**
   * 関係性の変化の重要度を判定
   * @private
   */
  private isSignificantRelationshipChange(prev: any, curr: any): boolean {
    if (!prev || !curr) return true; // どちらかがnullの場合は重要な変化
    
    // 関係の種類が変わった場合は重要
    if (prev.type !== curr.type || prev.relation !== curr.relation) {
      return true;
    }
    
    // 信頼度の変化が大きい場合は重要
    const prevTrust = prev.trust_level || 0;
    const currTrust = curr.trust_level || 0;
    if (Math.abs(currTrust - prevTrust) >= 2) {
      return true;
    }
    
    // 関係の強さに大きな変化がある場合
    const prevStrength = prev.strength || 0;
    const currStrength = curr.strength || 0;
    if (Math.abs(currStrength - prevStrength) >= 2) {
      return true;
    }
    
    return false;
  }

  /**
   * 複数の変化の整合性を確保するポストプロセシング
   * @private
   */
  private postProcessChanges(classifiedChanges: CharacterChange[]): CharacterChange[] {
    // 性格変化と矛盾する関係性変化がないかチェック
    const personalityChanges = classifiedChanges.filter(
      c => c.attribute.startsWith('personality_') && c.classification?.type === 'GROWTH'
    );
    
    return classifiedChanges.map(change => {
      // 関係性の変化で、性格変化と矛盾する場合
      if (change.attribute.startsWith('relationship_') && 
          change.classification?.type === 'GROWTH' &&
          personalityChanges.length > 0) {
        
        // 性格変化と関係性変化が矛盾していないかチェック
        // ここでは簡略化のため、確信度が低い場合は一時的変化に調整
        if (change.classification.confidence < 0.7) {
          return {
            ...change,
            classification: {
              ...change.classification,
              type: 'TEMPORARY',
              explanation: `${change.classification.explanation} (性格変化との整合性のため一時的変化に調整)`
            }
          };
        }
      }
      
      return change;
    });
  }

  /**
   * フォールバック分類
   * エラー時に使用する安全な分類
   * @private
   */
  private getFallbackClassification(
    change: CharacterChange, 
    developmentStage?: number
  ): ChangeClassification {
    // 属性名に基づいた初期推測
    let suggestedType: ChangeType = 'TEMPORARY';
    let suggestedScope: ChangeScope = 'EMOTIONAL_STATE';
    
    // 特定の属性に基づいて分類を調整
    if (change.attribute.startsWith('personality_')) {
      suggestedType = developmentStage && developmentStage >= 3 ? 'GROWTH' : 'TEMPORARY';
      suggestedScope = 'CORE_PERSONALITY';
    } else if (change.attribute.startsWith('relationship_')) {
      suggestedType = 'TEMPORARY';
      suggestedScope = 'RELATIONSHIPS';
    } else if (change.attribute === 'mood' || change.attribute === 'emotionalState') {
      suggestedType = 'TEMPORARY';
      suggestedScope = 'EMOTIONAL_STATE';
    } else if (change.attribute === 'developmentStage') {
      suggestedType = 'GROWTH';
      suggestedScope = 'CORE_PERSONALITY';
    } else if (change.attribute.includes('skill') || change.attribute.includes('abilit')) {
      suggestedType = 'GROWTH';
      suggestedScope = 'SKILLS';
    }
    
    return {
      type: suggestedType,
      scope: suggestedScope,
      confidence: 0.5,
      explanation: '自動分類に失敗したため、属性タイプに基づく推測分類を適用しました',
      narrativeSignificance: suggestedType === 'GROWTH' ? 0.7 : 0.3
    };
  }

  /**
   * キャラクター履歴のフォーマット
   * @private
   */
  private formatCharacterHistory(character: Character): string {
    let history = '';
    
    // インタラクション履歴
    if (character.history?.interactions && character.history.interactions.length > 0) {
      const recentInteractions = character.history.interactions
        .sort((a, b) => {
          const aTime = a.timestamp instanceof Date ? a.timestamp.getTime() : 0;
          const bTime = b.timestamp instanceof Date ? b.timestamp.getTime() : 0;
          return bTime - aTime;
        })
        .slice(0, 5);
      
      history += '### 最近のインタラクション\n';
      history += recentInteractions
        .map(interaction => `- ${interaction.description || interaction.type}`)
        .join('\n');
    }
    
    // 発展履歴
    if (character.history?.developmentPath && character.history.developmentPath.length > 0) {
      const recentDevelopment = character.history.developmentPath
        .sort((a, b) => {
          const aTime = a.achievedAt instanceof Date ? a.achievedAt.getTime() : 0;
          const bTime = b.achievedAt instanceof Date ? b.achievedAt.getTime() : 0;
          return bTime - aTime;
        })
        .slice(0, 2);
      
      if (history) history += '\n\n';
      history += '### 発展履歴\n';
      history += recentDevelopment
        .map(dev => `- ${dev.description || `ステージ${dev.stage}への成長`}`)
        .join('\n');
    }
    
    // 情報がない場合
    if (!history) {
      return '過去の行動履歴はありません。';
    }
    
    return history;
  }
}

// シングルトンインスタンスをエクスポート
export const characterAnalyzer = new CharacterAnalyzer();