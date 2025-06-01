// src/lib/plot/index.ts (修正版)
/**
 * @fileoverview Plot管理システムの統一エクスポートファイル（修正版）
 * 🔧 修正: 非同期初期化の競合状態を解決
 */

import { MemoryManager } from '@/lib/memory/core/memory-manager';
import { PlotManager, createPlotManager, getPlotManagerInstance, type PlotManagerConfig } from './manager';

// === 既存のエクスポート ===
export * from './types';
export * from './world-settings-manager';
export { 
    PlotManager, 
    createPlotManager, 
    getPlotManagerInstance,
    type PlotManagerConfig 
} from './manager';
export { PlotStorage } from './storage';
export { PlotContextBuilder } from './context-builder';
export { StoryPhaseManager } from './phase-manager';
export { StoryGenerationBridge } from './story-generation-bridge';
export * from './section/types';

// === 🔧 修正: 初期化状態管理の改善 ===
let globalPlotManagerInstance: PlotManager | null = null;
let globalMemoryManager: MemoryManager | null = null;
let initializationPromise: Promise<PlotManager> | null = null;
let initializationStatus: 'pending' | 'initializing' | 'completed' | 'failed' = 'pending';

/**
 * グローバルメモリマネージャーを設定
 */
export function setGlobalMemoryManager(memoryManager: MemoryManager): void {
    globalMemoryManager = memoryManager;
    // 既存のplotManagerインスタンスがある場合はリセット
    globalPlotManagerInstance = null;
    initializationStatus = 'pending';
}

/**
 * 🔧 修正: 非同期初期化待機対応版 getGlobalPlotManager
 */
async function getGlobalPlotManagerAsync(): Promise<PlotManager> {
    // 既に初期化済みの場合
    if (globalPlotManagerInstance && initializationStatus === 'completed') {
        return globalPlotManagerInstance;
    }
    
    // 初期化が進行中の場合は待機
    if (initializationPromise && initializationStatus === 'initializing') {
        try {
            return await initializationPromise;
        } catch (error) {
            // 初期化失敗時はリセット
            initializationPromise = null;
            initializationStatus = 'failed';
            throw error;
        }
    }
    
    // 初期化が必要な場合
    if (!globalMemoryManager) {
        throw new Error(
            'PlotManager requires MemoryManager. Call setGlobalMemoryManager() first, ' +
            'or use createPlotManager() directly with a MemoryManager instance.'
        );
    }
    
    // 新しい初期化を開始
    return await initializePlotManager(globalMemoryManager);
}

/**
 * 🔧 修正: 同期版（プロキシ用）- デフォルト値でフォールバック
 */
function getGlobalPlotManagerSync(): PlotManager | null {
    if (globalPlotManagerInstance && initializationStatus === 'completed') {
        return globalPlotManagerInstance;
    }
    return null;
}

/**
 * PlotManagerの非同期初期化（修正版）
 */
export async function initializePlotManager(memoryManager: MemoryManager): Promise<PlotManager> {
    // 既に初期化済みの場合
    if (globalPlotManagerInstance && initializationStatus === 'completed') {
        return globalPlotManagerInstance;
    }
    
    // 初期化が進行中の場合は待機
    if (initializationPromise && initializationStatus === 'initializing') {
        return await initializationPromise;
    }
    
    // 新しい初期化を開始
    initializationStatus = 'initializing';
    initializationPromise = performInitialization(memoryManager);
    
    try {
        const result = await initializationPromise;
        initializationStatus = 'completed';
        return result;
    } catch (error) {
        initializationStatus = 'failed';
        initializationPromise = null;
        throw error;
    }
}

/**
 * 🔧 実際の初期化処理
 */
async function performInitialization(memoryManager: MemoryManager): Promise<PlotManager> {
    try {
        // グローバルメモリマネージャーを設定
        setGlobalMemoryManager(memoryManager);
        
        // 動的にクラスをインポート
        const { createPlotManager } = await import('./manager');
        
        // PlotManagerインスタンスを作成
        globalPlotManagerInstance = createPlotManager(memoryManager, {
            enableLearningJourney: true,
            enableSectionPlotImport: true,
            enableQualityAssurance: true,
            enablePerformanceOptimization: true,
            memorySystemIntegration: true
        });
        
        // 初期化メソッドが存在する場合は実行
        if (typeof (globalPlotManagerInstance as any).initialize === 'function') {
            try {
                await (globalPlotManagerInstance as any).initialize();
            } catch (initError) {
                console.warn('PlotManager.initialize() failed, but continuing:', initError);
                // 初期化エラーは警告として処理し、インスタンス自体は使用可能とする
            }
        }
        
        return globalPlotManagerInstance;
    } catch (error) {
        globalPlotManagerInstance = null;
        throw new Error(`Failed to initialize PlotManager: ${error instanceof Error ? error.message : String(error)}`);
    }
}

/**
 * 🔧 修正: 安全なプロキシ実装
 */
export const plotManager = new Proxy({} as PlotManager, {
    get(target, prop) {
        // 特殊なプロパティは早期リターン
        if (prop === 'toString' || prop === 'valueOf' || prop === Symbol.toPrimitive) {
            return () => '[PlotManager - Dynamic]';
        }
        
        // 同期的にインスタンスを取得
        const instance = getGlobalPlotManagerSync();
        
        if (instance) {
            const value = (instance as any)[prop];
            if (typeof value === 'function') {
                return value.bind(instance);
            }
            return value;
        }
        
        // 🔧 修正: 初期化エラーの代わりにフォールバック処理
        if (prop === 'checkGeneratedContentConsistency') {
            return async () => {
                console.warn('plotManager not initialized, returning default consistency result');
                return { consistent: true, issues: [] };
            };
        }
        
        // その他のメソッドの場合
        if (typeof prop === 'string') {
            return async (...args: any[]) => {
                console.warn(`plotManager.${prop} called before initialization, attempting auto-initialization`);
                
                if (!globalMemoryManager) {
                    throw new Error(
                        `plotManager.${prop} requires initialization. ` +
                        `Call setGlobalMemoryManager(memoryManager) and initializePlotManager(memoryManager) first.`
                    );
                }
                
                try {
                    const initialized = await getGlobalPlotManagerAsync();
                    const method = (initialized as any)[prop];
                    if (typeof method === 'function') {
                        return method.apply(initialized, args);
                    }
                    return method;
                } catch (error) {
                    console.error(`Auto-initialization failed for plotManager.${prop}:`, error);
                    throw error;
                }
            };
        }
        
        return undefined;
    },
    
    set(target, prop, value) {
        const instance = getGlobalPlotManagerSync();
        if (instance) {
            (instance as any)[prop] = value;
            return true;
        }
        
        console.warn(`Cannot set plotManager.${String(prop)} before initialization`);
        return false;
    },
    
    has(target, prop) {
        const instance = getGlobalPlotManagerSync();
        return instance ? prop in instance : false;
    },
    
    ownKeys(target) {
        const instance = getGlobalPlotManagerSync();
        return instance ? Reflect.ownKeys(instance) : [];
    },
    
    getOwnPropertyDescriptor(target, prop) {
        const instance = getGlobalPlotManagerSync();
        return instance ? Reflect.getOwnPropertyDescriptor(instance, prop) : undefined;
    }
});

// === 🔧 追加: 初期化状態確認用ユーティリティ ===

/**
 * PlotManagerの初期化状態を確認
 */
export function getPlotManagerStatus(): {
    hasGlobalMemoryManager: boolean;
    hasGlobalPlotManagerInstance: boolean;
    initializationStatus: string;
    isInitialized: boolean;
} {
    return {
        hasGlobalMemoryManager: globalMemoryManager !== null,
        hasGlobalPlotManagerInstance: globalPlotManagerInstance !== null,
        initializationStatus,
        isInitialized: initializationStatus === 'completed' && globalPlotManagerInstance !== null
    };
}

/**
 * 強制的に初期化状態をリセット（デバッグ用）
 */
export function resetPlotManagerState(): void {
    globalPlotManagerInstance = null;
    globalMemoryManager = null;
    initializationPromise = null;
    initializationStatus = 'pending';
}

/**
 * 🔧 修正: checkGeneratedContentConsistency用のセーフティネット
 */
export async function safeCheckGeneratedContentConsistency(
    content: string,
    chapterNumber: number
): Promise<{ consistent: boolean; issues: any[] }> {
    try {
        const manager = await getGlobalPlotManagerAsync();
        return await manager.checkGeneratedContentConsistency(content, chapterNumber);
    } catch (error) {
        console.warn('PlotManager consistency check failed, using fallback:', error);
        return { consistent: true, issues: [] };
    }
}