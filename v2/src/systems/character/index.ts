/**
 * キャラクター管理システム エクスポート
 * MBTI統合、心理分析、成長管理、関係性管理を含む包括的なキャラクター管理システム
 */

// メインマネージャー
import { CharacterManager } from './core/character-manager';

// 専門サービス
import { MBTIAnalyzer } from './services/mbti-analyzer';
import { PsychologyAnalyzer } from './services/psychology-analyzer';

// Re-export
export { CharacterManager, MBTIAnalyzer, PsychologyAnalyzer };

// インターフェースと型
export type * from './interfaces';
export type * from './types';

// システム統合ファクトリー
export class CharacterSystemFactory {
  static createCharacterManager(): CharacterManager {
    return new CharacterManager();
  }
  
  static createMBTIAnalyzer(): MBTIAnalyzer {
    return new MBTIAnalyzer();
  }
  
  static createPsychologyAnalyzer(): PsychologyAnalyzer {
    return new PsychologyAnalyzer();
  }
}