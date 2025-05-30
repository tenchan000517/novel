import { SystemParameters } from '../../types/parameters';

/**
 * パラメータバリデーションを行うユーティリティクラス
 * パラメータの構造と値の範囲を検証する
 */
export class ParameterValidator {
  /**
   * パラメータ構造の検証
   * 必要なカテゴリとプロパティの存在を確認
   * 
   * @param params 検証対象のパラメータオブジェクト
   * @returns 構造が正しい場合はtrue
   */
  static validateStructure(params: any): boolean {
    // 必要なカテゴリとプロパティが存在するか確認
    if (!params || typeof params !== 'object') return false;
    
    const requiredCategories = ['generation', 'memory', 'characters', 'plot', 'progression', 'system'];
    for (const category of requiredCategories) {
      if (!params[category] || typeof params[category] !== 'object') return false;
    }
    
    // 各カテゴリの必須プロパティを確認
    const requiredProps = {
      generation: ['targetLength', 'minLength', 'maxLength', 'model', 'temperature', 'topP', 'frequencyPenalty', 'presencePenalty'],
      memory: ['shortTermChapters', 'midTermArcSize', 'summaryDetailLevel', 'consistencyThreshold'],
      characters: ['maxMainCharacters', 'maxSubCharacters', 'characterBleedTolerance', 'newCharacterIntroRate'],
      plot: ['foreshadowingDensity', 'resolutionDistance', 'abstractConcreteBalance', 'coherenceCheckFrequency'],
      progression: ['maxSameStateChapters', 'stagnationThreshold', 'tensionMinVariance', 'dialogActionRatio'],
      system: ['autoSaveInterval', 'maxHistoryItems', 'logLevel', 'workingDirectory', 'backupEnabled', 'backupCount']
    };
    
    for (const [category, props] of Object.entries(requiredProps)) {
      for (const prop of props) {
        if (params[category][prop] === undefined) return false;
      }
    }
    
    return true;
  }
  
  /**
   * パラメータ値の範囲チェック
   * 各パラメータ値が適切な範囲内かを検証
   * 
   * @param params 検証対象のパラメータオブジェクト
   * @returns 検証結果と発見されたエラーのリスト
   */
  static validateValues(params: SystemParameters): {
    valid: boolean;
    errors: { path: string, message: string }[]
  } {
    const errors: { path: string, message: string }[] = [];
    
    // generation カテゴリ
    if (params.generation.targetLength < 1000 || params.generation.targetLength > 20000) {
      errors.push({
        path: 'generation.targetLength',
        message: '目標文字数は1000から20000の範囲で指定してください'
      });
    }
    
    if (params.generation.minLength > params.generation.targetLength) {
      errors.push({
        path: 'generation.minLength',
        message: '最小文字数は目標文字数以下である必要があります'
      });
    }
    
    if (params.generation.maxLength < params.generation.targetLength) {
      errors.push({
        path: 'generation.maxLength',
        message: '最大文字数は目標文字数以上である必要があります'
      });
    }
    
    if (params.generation.temperature < 0 || params.generation.temperature > 1) {
      errors.push({
        path: 'generation.temperature',
        message: '温度パラメータは0から1の範囲で指定してください'
      });
    }
    
    if (params.generation.topP < 0 || params.generation.topP > 1) {
      errors.push({
        path: 'generation.topP',
        message: 'Top-Pは0から1の範囲で指定してください'
      });
    }
    
    if (params.generation.frequencyPenalty < 0 || params.generation.frequencyPenalty > 2) {
      errors.push({
        path: 'generation.frequencyPenalty',
        message: '頻度ペナルティは0から2の範囲で指定してください'
      });
    }
    
    if (params.generation.presencePenalty < 0 || params.generation.presencePenalty > 2) {
      errors.push({
        path: 'generation.presencePenalty',
        message: '存在ペナルティは0から2の範囲で指定してください'
      });
    }
    
    // memory カテゴリ
    if (params.memory.shortTermChapters < 1 || params.memory.shortTermChapters > 20) {
      errors.push({
        path: 'memory.shortTermChapters',
        message: '短期記憶チャプター数は1から20の範囲で指定してください'
      });
    }
    
    if (params.memory.midTermArcSize < 1 || params.memory.midTermArcSize > 10) {
      errors.push({
        path: 'memory.midTermArcSize',
        message: '中期記憶アークサイズは1から10の範囲で指定してください'
      });
    }
    
    if (params.memory.summaryDetailLevel < 1 || params.memory.summaryDetailLevel > 10) {
      errors.push({
        path: 'memory.summaryDetailLevel',
        message: '要約詳細レベルは1から10の範囲で指定してください'
      });
    }
    
    if (params.memory.consistencyThreshold < 0 || params.memory.consistencyThreshold > 1) {
      errors.push({
        path: 'memory.consistencyThreshold',
        message: '整合性閾値は0から1の範囲で指定してください'
      });
    }
    
    // characters カテゴリ
    if (params.characters.maxMainCharacters < 1 || params.characters.maxMainCharacters > 10) {
      errors.push({
        path: 'characters.maxMainCharacters',
        message: 'メインキャラクターの最大数は1から10の範囲で指定してください'
      });
    }
    
    if (params.characters.maxSubCharacters < 0 || params.characters.maxSubCharacters > 30) {
      errors.push({
        path: 'characters.maxSubCharacters',
        message: 'サブキャラクターの最大数は0から30の範囲で指定してください'
      });
    }
    
    if (params.characters.characterBleedTolerance < 0 || params.characters.characterBleedTolerance > 1) {
      errors.push({
        path: 'characters.characterBleedTolerance',
        message: 'キャラブレ許容度は0から1の範囲で指定してください'
      });
    }
    
    if (params.characters.newCharacterIntroRate < 0 || params.characters.newCharacterIntroRate > 1) {
      errors.push({
        path: 'characters.newCharacterIntroRate',
        message: '新キャラ導入率は0から1の範囲で指定してください'
      });
    }
    
    // plot カテゴリ
    if (params.plot.foreshadowingDensity < 0 || params.plot.foreshadowingDensity > 1) {
      errors.push({
        path: 'plot.foreshadowingDensity',
        message: '伏線密度は0から1の範囲で指定してください'
      });
    }
    
    if (params.plot.resolutionDistance < 1 || params.plot.resolutionDistance > 30) {
      errors.push({
        path: 'plot.resolutionDistance',
        message: '伏線回収距離は1から30の範囲で指定してください'
      });
    }
    
    if (params.plot.abstractConcreteBalance < 0 || params.plot.abstractConcreteBalance > 1) {
      errors.push({
        path: 'plot.abstractConcreteBalance',
        message: '抽象・具体バランスは0から1の範囲で指定してください'
      });
    }
    
    if (params.plot.coherenceCheckFrequency < 0 || params.plot.coherenceCheckFrequency > 5) {
      errors.push({
        path: 'plot.coherenceCheckFrequency',
        message: '整合性チェック頻度は0から5の範囲で指定してください'
      });
    }
    
    // progression カテゴリ
    if (params.progression.maxSameStateChapters < 1 || params.progression.maxSameStateChapters > 10) {
      errors.push({
        path: 'progression.maxSameStateChapters',
        message: '同一状態の最大許容チャプター数は1から10の範囲で指定してください'
      });
    }
    
    if (params.progression.stagnationThreshold < 0 || params.progression.stagnationThreshold > 1) {
      errors.push({
        path: 'progression.stagnationThreshold',
        message: '停滞判定閾値は0から1の範囲で指定してください'
      });
    }
    
    if (params.progression.tensionMinVariance < 0 || params.progression.tensionMinVariance > 1) {
      errors.push({
        path: 'progression.tensionMinVariance',
        message: 'テンション最小変動量は0から1の範囲で指定してください'
      });
    }
    
    if (params.progression.dialogActionRatio < 0 || params.progression.dialogActionRatio > 1) {
      errors.push({
        path: 'progression.dialogActionRatio',
        message: '対話・行動比率は0から1の範囲で指定してください'
      });
    }
    
    // system カテゴリ
    if (params.system.autoSaveInterval < 1 || params.system.autoSaveInterval > 60) {
      errors.push({
        path: 'system.autoSaveInterval',
        message: '自動保存間隔は1から60の範囲で指定してください'
      });
    }
    
    if (params.system.maxHistoryItems < 10 || params.system.maxHistoryItems > 1000) {
      errors.push({
        path: 'system.maxHistoryItems',
        message: '履歴保持最大数は10から1000の範囲で指定してください'
      });
    }
    
    if (!['debug', 'info', 'warn', 'error'].includes(params.system.logLevel)) {
      errors.push({
        path: 'system.logLevel',
        message: 'ログレベルは debug, info, warn, error のいずれかを指定してください'
      });
    }
    
    if (params.system.backupCount < 1 || params.system.backupCount > 20) {
      errors.push({
        path: 'system.backupCount',
        message: 'バックアップ保持数は1から20の範囲で指定してください'
      });
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * インポートデータの検証
   * インポートされるデータの構造と値を検証
   * 
   * @param importData インポートされるデータオブジェクト
   * @returns 検証結果とエラーメッセージのリスト
   */
  static validateImport(importData: any): {
    valid: boolean;
    errors: string[]
  } {
    const errors: string[] = [];
    
    // インポートデータの構造検証
    if (!importData || typeof importData !== 'object') {
      errors.push('インポートデータが不正な形式です');
      return { valid: false, errors };
    }
    
    // パラメータが存在するか確認
    if (!importData.parameters) {
      errors.push('parameters フィールドが見つかりません');
      return { valid: false, errors };
    }
    
    // バージョン互換性チェック
    if (importData.version && importData.version !== '1.0.0') {
      errors.push(`互換性のないバージョンです: ${importData.version}`);
    }
    
    // パラメータ構造の検証
    if (!this.validateStructure(importData.parameters)) {
      errors.push('パラメータ構造が不正です');
    }
    
    // パラメータ値の範囲チェック
    const valueValidation = this.validateValues(importData.parameters as SystemParameters);
    if (!valueValidation.valid) {
      errors.push(...valueValidation.errors.map(err => `${err.path}: ${err.message}`));
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}