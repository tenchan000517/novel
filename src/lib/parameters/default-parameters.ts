import { SystemParameters } from '../../types/parameters';

/**
 * デフォルトパラメータ設定
 * システム初期化時や設定リセット時に使用される値
 */
export const DEFAULT_PARAMETERS: SystemParameters = {
  generation: {
    targetLength: 8000,
    minLength: 7500,
    maxLength: 8500,
    model: "gemini-2.0-flash-lite",
    models: {
      default: "gemini-2.0-flash-lite",
      summary: "gemini-2.0-flash-lite",
      content: "gemini-2.0-flash",
      analysis: "gemini-2.0-flash-lite",
      characterization: "gemini-2.0-flash"
    },
    temperature: 0.7,
    topP: 0.9,
    topK: 50,  // ← 追加（適切な値を設定してください）
    frequencyPenalty: 0.6,
    presencePenalty: 0.3,
    apiLimits: {
      requestsPerMinute: 50,
      tokensPerMinute: 100000,
      retryLimit: 3,
      backoffMultiplier: 2
    },
    queueSettings: {
      enableBatching: false,
      batchSize: 1,
      batchInterval: 2000,
      highPriorityTimeout: 30000,
      lowPriorityTimeout: 600000
    }
  },
  memory: {
    shortTermChapters: 8,
    midTermArcSize: 4,
    summaryDetailLevel: 7,
    consistencyThreshold: 0.85
  },
  characters: {
    maxMainCharacters: 5,
    maxSubCharacters: 15,
    characterBleedTolerance: 0.2,
    newCharacterIntroRate: 0.15
  },
  plot: {
    foreshadowingDensity: 0.6,
    resolutionDistance: 8,
    abstractConcreteBalance: 0.5,
    coherenceCheckFrequency: 1
  },
  progression: {
    maxSameStateChapters: 3,
    stagnationThreshold: 0.8,
    tensionMinVariance: 0.1,
    dialogActionRatio: 0.6
  },
  system: {
    autoSaveInterval: 15,
    maxHistoryItems: 100,
    logLevel: "info",
    workingDirectory: "./data",
    backupEnabled: true,
    backupCount: 5
  }
};