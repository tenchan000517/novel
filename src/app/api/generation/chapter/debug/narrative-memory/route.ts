// src/app/api/generation/chapter/debug/narrative-memory/route.ts
// 🔧 TypeScriptエラー修正版

import { NextRequest, NextResponse } from 'next/server';
import { memoryManager } from '@/lib/memory/manager';
import { storageProvider } from '@/lib/storage';
import { logger } from '@/lib/utils/logger';
import { Chapter } from '@/types/chapters';
import { NarrativeMemoryStatus } from '@/lib/memory/narrative/types';

// 修正された型定義
interface ComponentStatus {
  name: string;
  initialized: boolean;
  healthy: boolean;
  error?: string;
  initTime?: number;
}

interface TestResult {
  timestamp: string;
  action: string;
  success: boolean;
  details: any;
  errors: string[];
  warnings: string[];
}

interface FileStatus {
  exists: boolean;
  size?: number;
  isValidJSON?: boolean;
  isEmpty?: boolean;
  preview?: string;
  readable?: boolean;
  error?: string;
  checkError?: string;
}

interface FileDiagnosisResult {
  totalFiles: number;
  existingFiles: number;
  missingFiles: number;
  fileStatus: Record<string, FileStatus>;
  errors: string[];
  summary: {
    healthy: boolean;
    issues: number;
  };
}

interface InitializationStep {
  step: string;
  success: boolean;
  time: number;
  error?: string;
}

interface ManagerSaveResult {
  name: string;
  success: boolean;
  error: string | null;
  filesBeforeSave: Record<string, boolean>;
  filesAfterSave: Record<string, boolean>;
  createdFiles: string[];
  missingFiles: string[];
  saveTime: number;
  dataValidation: DataValidation;  // 🔧 修正：型を明確化
}

// テスト用のダミーチャプター
const createTestChapter = (chapterNumber: number): Chapter => ({
  id: `test-chapter-${chapterNumber}`,
  chapterNumber,
  title: `テスト章 ${chapterNumber}`,
  content: `これは章${chapterNumber}のテスト用コンテンツです。主人公は困難に立ち向かい、重要な決断を下します。`,
  createdAt: new Date(),
  updatedAt: new Date(),
  metadata: {}
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, chapterNumber = 1 } = body;

    const results: TestResult = {
      timestamp: new Date().toISOString(),
      action,
      success: false,
      details: {},
      errors: [],
      warnings: []
    };

    switch (action) {
      case 'diagnose_files':
        results.details = await diagnoseStorageFiles();
        break;

      case 'test_initialization':
        results.details = await testManagerInitialization();
        break;

      case 'test_save_operation':
        results.details = await testSaveOperation();
        break;

      case 'test_chapter_processing':
        results.details = await testChapterProcessing(chapterNumber);
        break;

      case 'full_diagnosis':
        results.details = await runFullDiagnosis();
        break;

      case 'repair_storage':
        results.details = await attemptStorageRepair();
        break;

      case 'check_manager_status':
        results.details = await checkManagerStatus();
        break;

      // 🔧 新しいアクション
      case 'test_individual_managers':
        results.details = await testIndividualManagerSaves();
        break;

      case 'test_storage_provider':
        results.details = await testStorageProviderDetails();
        break;

      case 'test_initialization_order':
        results.details = await testInitializationOrder();
        break;

      case 'debug_chapter_analysis':
        results.details = await debugChapterAnalysisManager();
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    results.success = results.errors.length === 0;
    return NextResponse.json(results);

  } catch (error) {
    logger.error('Narrative memory test API error', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

// === 既存のテスト関数群 (修正版) ===

async function diagnoseStorageFiles(): Promise<FileDiagnosisResult> {
  const expectedFiles = [
    'narrative-memory/summaries.json',
    'narrative-memory/chapter-analysis-config.json',
    'narrative-memory/characters.json',
    'narrative-memory/character-changes.json',
    'narrative-memory/character-tracking-config.json',
    'narrative-memory/emotional-dynamics.json',
    'narrative-memory/state.json',
    'narrative-memory/turning-points.json',
    'narrative-memory/world-context.json'
  ];

  const fileStatus: Record<string, FileStatus> = {};
  let existingCount = 0;
  let missingCount = 0;
  const errors: string[] = [];

  for (const filePath of expectedFiles) {
    try {
      const exists = await storageProvider.fileExists(filePath);
      
      if (exists) {
        existingCount++;
        try {
          const content = await storageProvider.readFile(filePath);
          const isValidJSON = isValidJSONString(content);
          
          fileStatus[filePath] = {
            exists: true,
            size: content.length,
            isValidJSON,
            isEmpty: content.length === 0,
            preview: content.substring(0, 100) + (content.length > 100 ? '...' : '')
          };
        } catch (readError) {
          fileStatus[filePath] = {
            exists: true,
            readable: false,
            error: readError instanceof Error ? readError.message : String(readError)
          };
          errors.push(`${filePath}: 読み取りエラー - ${readError}`);
        }
      } else {
        missingCount++;
        fileStatus[filePath] = {
          exists: false
        };
      }
    } catch (error) {
      fileStatus[filePath] = {
        exists: false,
        checkError: error instanceof Error ? error.message : String(error)
      };
      errors.push(`${filePath}: 存在確認エラー - ${error}`);
    }
  }

  return {
    totalFiles: expectedFiles.length,
    existingFiles: existingCount,
    missingFiles: missingCount,
    fileStatus,
    errors,
    summary: {
      healthy: errors.length === 0 && missingCount === 0,
      issues: errors.length + missingCount
    }
  };
}

async function testManagerInitialization() {
  const results = {
    memoryManagerInitialized: false,
    initializationTime: 0,
    initializationStatus: null as any,
    narrativeMemoryAvailable: false,
    errors: [] as string[],
    componentStatus: [] as ComponentStatus[]
  };

  try {
    const startTime = Date.now();
    
    // MemoryManagerの初期化確認
    const isInitialized = await memoryManager.isInitialized();
    results.memoryManagerInitialized = isInitialized;

    if (!isInitialized) {
      await memoryManager.initialize();
      results.initializationTime = Date.now() - startTime;
    }

    // 初期化ステータスの取得
    try {
      results.initializationStatus = memoryManager.getInitializationStatus();
    } catch (error) {
      results.errors.push(`初期化ステータス取得エラー: ${error}`);
    }

    // NarrativeMemoryの利用可能性確認
    const narrativeMemory = memoryManager.getNarrativeMemory();
    results.narrativeMemoryAvailable = !!narrativeMemory;

    if (!narrativeMemory) {
      results.errors.push('NarrativeMemoryインスタンスが取得できません');
    }

  } catch (error) {
    results.errors.push(`初期化テストエラー: ${error instanceof Error ? error.message : String(error)}`);
  }

  return results;
}

async function testSaveOperation() {
  const results = {
    saveSuccessful: false,
    saveTime: 0,
    beforeFileCheck: {} as FileDiagnosisResult,
    afterFileCheck: {} as FileDiagnosisResult,
    errors: [] as string[]
  };

  try {
    // 保存前のファイル状態をチェック
    results.beforeFileCheck = await diagnoseStorageFiles();

    // 🔧 修正：MemoryManagerの初期化確認
    if (!await memoryManager.isInitialized()) {
      logger.info('MemoryManager not initialized, initializing now...');
      await memoryManager.initialize();
    }

    // NarrativeMemoryの取得
    const narrativeMemory = memoryManager.getNarrativeMemory();
    if (!narrativeMemory) {
      throw new Error('NarrativeMemoryが利用できません');
    }

    // 🔧 修正：NarrativeMemoryの初期化確認
    await narrativeMemory.initialize();

    // 保存処理の実行
    const startTime = Date.now();
    await narrativeMemory.save();
    results.saveTime = Date.now() - startTime;
    results.saveSuccessful = true;

    // 保存後のファイル状態をチェック
    results.afterFileCheck = await diagnoseStorageFiles();

  } catch (error) {
    results.errors.push(`保存テストエラー: ${error instanceof Error ? error.message : String(error)}`);
  }

  return results;
}

async function testChapterProcessing(chapterNumber: number) {
  const results = {
    chapterProcessed: false,
    processingTime: 0,
    beforeState: {} as any,
    afterState: {} as any,
    errors: [] as string[]
  };

  try {
    // 🔧 修正：MemoryManagerの初期化確認
    if (!await memoryManager.isInitialized()) {
      logger.info('MemoryManager not initialized, initializing now...');
      await memoryManager.initialize();
    }

    // 処理前の状態取得
    try {
      results.beforeState = await memoryManager.getNarrativeState(chapterNumber);
    } catch (error) {
      results.errors.push(`処理前状態取得エラー: ${error}`);
    }

    // テスト用章データの作成
    const testChapter = createTestChapter(chapterNumber);

    // 章処理の実行
    const startTime = Date.now();
    await memoryManager.updateNarrativeState(testChapter);
    results.processingTime = Date.now() - startTime;
    results.chapterProcessed = true;

    // 処理後の状態取得
    try {
      results.afterState = await memoryManager.getNarrativeState(chapterNumber);
    } catch (error) {
      results.errors.push(`処理後状態取得エラー: ${error}`);
    }

  } catch (error) {
    results.errors.push(`章処理テストエラー: ${error instanceof Error ? error.message : String(error)}`);
  }

  return results;
}

async function runFullDiagnosis() {
  const diagnosis = {
    startTime: Date.now(),
    steps: {} as any,
    overallHealth: 'HEALTHY' as 'HEALTHY' | 'ISSUES' | 'CRITICAL',
    recommendations: [] as string[],
    totalTime: 0,
    error: undefined as string | undefined
  };

  try {
    // Step 1: ファイル診断
    diagnosis.steps.filesDiagnosis = await diagnoseStorageFiles();

    // Step 2: 初期化テスト
    diagnosis.steps.initializationTest = await testManagerInitialization();

    // Step 3: 保存テスト
    diagnosis.steps.saveTest = await testSaveOperation();

    // Step 4: 章処理テスト
    diagnosis.steps.chapterTest = await testChapterProcessing(1);

    // Step 5: マネージャーステータス
    diagnosis.steps.managerStatus = await checkManagerStatus();

    // 総合判定
    diagnosis.overallHealth = assessOverallHealth(diagnosis.steps);
    diagnosis.recommendations = generateRecommendations(diagnosis.steps);

  } catch (error) {
    diagnosis.error = error instanceof Error ? error.message : String(error);
  }

  diagnosis.totalTime = Date.now() - diagnosis.startTime;
  return diagnosis;
}

async function attemptStorageRepair() {
  const results = {
    repairAttempted: false,
    repairSuccessful: false,
    repairResults: null as any,
    errors: [] as string[]
  };

  try {
    // 🔧 修正：MemoryManagerの初期化確認
    if (!await memoryManager.isInitialized()) {
      logger.info('MemoryManager not initialized, initializing now...');
      await memoryManager.initialize();
    }

    const narrativeMemory = memoryManager.getNarrativeMemory();
    if (!narrativeMemory) {
      throw new Error('NarrativeMemoryが利用できません');
    }

    // 🔧 修正：NarrativeMemoryの初期化確認
    await narrativeMemory.initialize();

    results.repairResults = await narrativeMemory.repairStorage();
    results.repairAttempted = true;
    results.repairSuccessful = results.repairResults.success;

  } catch (error) {
    results.errors.push(`修復エラー: ${error instanceof Error ? error.message : String(error)}`);
  }

  return results;
}

async function checkManagerStatus() {
  const status = {
    memoryManagerStatus: {} as any,
    narrativeMemoryStatus: null as NarrativeMemoryStatus | null,
    systemStatus: null as any,
    errors: [] as string[]
  };

  try {
    // 🔧 修正：MemoryManagerの初期化確認
    if (!await memoryManager.isInitialized()) {
      logger.info('MemoryManager not initialized, initializing now...');
      await memoryManager.initialize();
    }

    // MemoryManagerのステータス
    status.memoryManagerStatus = memoryManager.getInitializationStatus();

    // NarrativeMemoryのステータス
    const narrativeMemory = memoryManager.getNarrativeMemory();
    if (narrativeMemory) {
      // 🔧 修正：NarrativeMemoryの初期化確認
      await narrativeMemory.initialize();
      status.narrativeMemoryStatus = await narrativeMemory.getStatus();
    }

    // システム全体のステータス
    status.systemStatus = await memoryManager.getStatus();

  } catch (error) {
    status.errors.push(`ステータス取得エラー: ${error instanceof Error ? error.message : String(error)}`);
  }

  return status;
}

// === 🔧 新しいテスト関数群 ===

async function testIndividualManagerSaves() {
  const results = {
    managers: {} as Record<string, ManagerSaveResult>,
    overallSuccess: false,
    summary: {
      total: 0,
      successful: 0,
      failed: 0
    },
    recommendations: [] as string[]
  };

  // 🔧 修正：MemoryManagerの初期化を確実に行う
  try {
    logger.info('Ensuring MemoryManager is initialized...');
    
    if (!await memoryManager.isInitialized()) {
      logger.info('MemoryManager not initialized, initializing now...');
      await memoryManager.initialize();
    }
    
    const isInitialized = await memoryManager.isInitialized();
    logger.info('MemoryManager initialization status', { isInitialized });
  } catch (initError) {
    logger.error('Failed to initialize MemoryManager', { 
      error: initError instanceof Error ? initError.message : String(initError) 
    });
    throw new Error(`MemoryManager初期化エラー: ${initError instanceof Error ? initError.message : String(initError)}`);
  }

  // 🔧 修正：NarrativeMemoryの取得と初期化
  let narrativeMemory;
  try {
    narrativeMemory = memoryManager.getNarrativeMemory();
    
    if (!narrativeMemory) {
      logger.error('NarrativeMemory is null after MemoryManager initialization');
      throw new Error('NarrativeMemoryがMemoryManager初期化後もnullです');
    }
    
    logger.info('NarrativeMemory obtained successfully');
    
    // NarrativeMemory自体の初期化も確実に行う
    await narrativeMemory.initialize();
    logger.info('NarrativeMemory initialized successfully');
    
  } catch (narrativeError) {
    logger.error('Failed to get or initialize NarrativeMemory', { 
      error: narrativeError instanceof Error ? narrativeError.message : String(narrativeError) 
    });
    throw new Error(`NarrativeMemory取得/初期化エラー: ${narrativeError instanceof Error ? narrativeError.message : String(narrativeError)}`);
  }

  // 各マネージャーを個別にテスト
  const managerTests = [
    {
      name: 'ChapterAnalysisManager',
      expectedFiles: ['narrative-memory/summaries.json', 'narrative-memory/chapter-analysis-config.json'],
      testFunction: async () => {
        // テスト用のサンプルデータで更新を実行
        const testChapter = createTestChapter(1);
        await narrativeMemory.updateFromChapter(testChapter);
        return (narrativeMemory as any).chapterAnalysisManager.save();
      }
    },
    {
      name: 'CharacterTrackingManager', 
      expectedFiles: [
        'narrative-memory/characters.json',
        'narrative-memory/character-changes.json',
        'narrative-memory/character-tracking-config.json'
      ],
      testFunction: async () => {
        return (narrativeMemory as any).characterTrackingManager.save();
      }
    },
    {
      name: 'EmotionalDynamicsManager',
      expectedFiles: ['narrative-memory/emotional-dynamics.json'],
      testFunction: async () => {
        return (narrativeMemory as any).emotionalDynamicsManager.save();
      }
    },
    {
      name: 'NarrativeStateManager',
      expectedFiles: ['narrative-memory/state.json', 'narrative-memory/turning-points.json'],
      testFunction: async () => {
        return (narrativeMemory as any).narrativeStateManager.save();
      }
    },
    {
      name: 'WorldContextManager',
      expectedFiles: ['narrative-memory/world-context.json'],
      testFunction: async () => {
        return (narrativeMemory as any).worldContextManager.save();
      }
    }
  ];

  for (const test of managerTests) {
    results.summary.total++;
    
    const managerResult: ManagerSaveResult = {
      name: test.name,
      success: false,
      error: null,
      filesBeforeSave: {},
      filesAfterSave: {},
      createdFiles: [],
      missingFiles: [],
      saveTime: 0,
      dataValidation: {
        hasData: false,
        dataCount: 0,
        dataIntegrity: false
      }
    };

    try {
      logger.info(`Testing manager: ${test.name}`);
      
      // 保存前のファイル状態チェック
      for (const file of test.expectedFiles) {
        managerResult.filesBeforeSave[file] = await storageProvider.fileExists(file);
      }

      // 保存実行
      const startTime = Date.now();
      await test.testFunction();
      managerResult.saveTime = Date.now() - startTime;

      // 保存後のファイル状態チェック
      for (const file of test.expectedFiles) {
        managerResult.filesAfterSave[file] = await storageProvider.fileExists(file);
        
        if (!managerResult.filesBeforeSave[file] && managerResult.filesAfterSave[file]) {
          managerResult.createdFiles.push(file);
        } else if (!managerResult.filesAfterSave[file]) {
          managerResult.missingFiles.push(file);
        }
      }

      // データ検証
      await validateManagerData(test.name, managerResult.dataValidation);

      // 成功判定
      managerResult.success = managerResult.missingFiles.length === 0;
      
      if (managerResult.success) {
        results.summary.successful++;
        logger.info(`Manager ${test.name} test successful`);
      } else {
        results.summary.failed++;
        managerResult.error = `以下のファイルが作成されませんでした: ${managerResult.missingFiles.join(', ')}`;
        logger.warn(`Manager ${test.name} test failed`, { error: managerResult.error });
      }

    } catch (error) {
      results.summary.failed++;
      managerResult.error = error instanceof Error ? error.message : String(error);
      logger.error(`Manager ${test.name} test error`, { 
        error: error instanceof Error ? error.message : String(error) 
      });
    }

    results.managers[test.name] = managerResult;
  }

  // 総合判定と推奨事項
  results.overallSuccess = results.summary.failed === 0;
  results.recommendations = generateManagerSpecificRecommendations(results.managers);

  return results;
}

// 🔧 修正された型定義
interface DataValidation {
  hasData: boolean;
  dataCount: number;
  dataIntegrity: boolean;
}

async function validateManagerData(managerName: string, validation: DataValidation): Promise<void> {
  const narrativeMemory = memoryManager.getNarrativeMemory();
  
  // 🔧 修正：narrativeMemoryのnullチェック
  if (!narrativeMemory) {
    validation.hasData = false;
    validation.dataCount = 0;
    validation.dataIntegrity = false;
    return;
  }
  
  try {
    switch (managerName) {
      case 'ChapterAnalysisManager':
        const summaries = await narrativeMemory.getAllChapterSummaries();
        validation.hasData = summaries.length > 0;
        validation.dataCount = summaries.length;
        validation.dataIntegrity = summaries.every(s => s.summary && s.chapterNumber);
        break;

      case 'CharacterTrackingManager':
        try {
          const characters = (narrativeMemory as any).characterTrackingManager?.getAllCharacterProgress() || [];
          validation.hasData = characters.length > 0;
          validation.dataCount = characters.length;
          validation.dataIntegrity = Array.isArray(characters) && 
            characters.every((c: any) => c && c.name && typeof c.firstAppearance === 'number');
        } catch (error) {
          validation.hasData = false;
          validation.dataCount = 0;
          validation.dataIntegrity = false;
        }
        break;

      case 'EmotionalDynamicsManager':
        try {
          const tensionLevel = (narrativeMemory as any).emotionalDynamicsManager?.getCurrentTensionLevel();
          validation.hasData = typeof tensionLevel === 'number' && tensionLevel > 0;
          validation.dataCount = validation.hasData ? 1 : 0;
          validation.dataIntegrity = typeof tensionLevel === 'number' && tensionLevel >= 0;
        } catch (error) {
          validation.hasData = false;
          validation.dataCount = 0;
          validation.dataIntegrity = false;
        }
        break;

      case 'NarrativeStateManager':
        try {
          const turningPoints = (narrativeMemory as any).narrativeStateManager?.getTurningPoints() || [];
          validation.hasData = turningPoints.length > 0;
          validation.dataCount = turningPoints.length;
          validation.dataIntegrity = Array.isArray(turningPoints) && 
            turningPoints.every((tp: any) => tp && tp.chapter && tp.description);
        } catch (error) {
          validation.hasData = false;
          validation.dataCount = 0;
          validation.dataIntegrity = false;
        }
        break;

      case 'WorldContextManager':
        try {
          const envInfo = (narrativeMemory as any).worldContextManager?.getEnvironmentInfo() || {};
          validation.hasData = !!(envInfo.location || envInfo.timeOfDay || envInfo.weather);
          validation.dataCount = validation.hasData ? 1 : 0;
          validation.dataIntegrity = typeof envInfo === 'object' && envInfo !== null;
        } catch (error) {
          validation.hasData = false;
          validation.dataCount = 0;
          validation.dataIntegrity = false;
        }
        break;

      default:
        validation.hasData = false;
        validation.dataCount = 0;
        validation.dataIntegrity = false;
        break;
    }
  } catch (error) {
    logger.error(`Manager data validation failed for ${managerName}`, { 
      error: error instanceof Error ? error.message : String(error) 
    });
    validation.hasData = false;
    validation.dataCount = 0;
    validation.dataIntegrity = false;
  }
}

function generateManagerSpecificRecommendations(managers: Record<string, ManagerSaveResult>): string[] {
  const recommendations: string[] = [];

  for (const [name, result] of Object.entries(managers)) {
    if (!result.success) {
      if (result.error?.includes('JSON')) {
        recommendations.push(`${name}: データのJSON変換に問題があります。データ構造を確認してください。`);
      } else if (result.missingFiles.length > 0) {
        recommendations.push(`${name}: ${result.missingFiles.length}個のファイル作成に失敗。ストレージ権限を確認してください。`);
      } else if (!result.dataValidation.dataIntegrity) {
        recommendations.push(`${name}: データの整合性に問題があります。初期化を確認してください。`);
      } else {
        recommendations.push(`${name}: 原因不明のエラー。ログを詳細に確認してください。`);
      }
    }
  }

  if (recommendations.length === 0) {
    recommendations.push('すべてのマネージャーが正常に動作しています。');
  }

  return recommendations;
}

async function testStorageProviderDetails() {
  const results = {
    basicWrite: false,
    basicRead: false,
    jsonWrite: false,
    jsonRead: false,
    directoryCreate: false,
    concurrentWrite: false,
    errors: [] as string[]
  };

  try {
    // 基本的な書き込みテスト
    const testContent = 'test content';
    await storageProvider.writeFile('test-basic.txt', testContent);
    results.basicWrite = true;

    // 基本的な読み込みテスト
    const readContent = await storageProvider.readFile('test-basic.txt');
    results.basicRead = readContent === testContent;

    // JSON書き込みテスト
    const testJson = { test: true, number: 123, array: [1, 2, 3] };
    await storageProvider.writeFile('test-json.json', JSON.stringify(testJson, null, 2));
    results.jsonWrite = true;

    // JSON読み込みテスト
    const readJson = JSON.parse(await storageProvider.readFile('test-json.json'));
    results.jsonRead = JSON.stringify(readJson) === JSON.stringify(testJson);

    // ディレクトリパス書き込みテスト
    await storageProvider.writeFile('test-dir/test-file.json', JSON.stringify({ inDirectory: true }));
    results.directoryCreate = true;

    // 同時書き込みテスト
    const concurrentPromises = [
      storageProvider.writeFile('concurrent-1.json', '{"id": 1}'),
      storageProvider.writeFile('concurrent-2.json', '{"id": 2}'),
      storageProvider.writeFile('concurrent-3.json', '{"id": 3}')
    ];
    await Promise.all(concurrentPromises);
    results.concurrentWrite = true;

  } catch (error) {
    results.errors.push(error instanceof Error ? error.message : String(error));
  }

  return results;
}

async function testInitializationOrder() {
  const results = {
    initializationSteps: [] as InitializationStep[],
    finalState: {
      memoryManagerReady: false,
      narrativeMemoryReady: false,
      allManagersReady: false
    }
  };

  // Step 1: MemoryManager初期化
  await executeInitStep('MemoryManager初期化', async () => {
    if (!await memoryManager.isInitialized()) {
      await memoryManager.initialize();
    }
    results.finalState.memoryManagerReady = await memoryManager.isInitialized();
  }, results);

  // Step 2: NarrativeMemory取得
  await executeInitStep('NarrativeMemory取得', async () => {
    const narrativeMemory = memoryManager.getNarrativeMemory();
    results.finalState.narrativeMemoryReady = !!narrativeMemory;
    
    // 🔧 修正：NarrativeMemoryが取得できた場合は初期化も実行
    if (narrativeMemory) {
      await narrativeMemory.initialize();
      logger.info('NarrativeMemory initialized in test');
    }
  }, results);

  // Step 3: 個別マネージャー初期化確認
  await executeInitStep('個別マネージャー確認', async () => {
    const narrativeMemory = memoryManager.getNarrativeMemory();
    if (narrativeMemory) {
      await narrativeMemory.getStatus();
      results.finalState.allManagersReady = true;
    }
  }, results);

  return results;
}

async function executeInitStep(
  stepName: string, 
  testFunction: () => Promise<void>, 
  results: { initializationSteps: InitializationStep[] }
): Promise<void> {
  const step: InitializationStep = { step: stepName, success: false, time: 0 };
  const startTime = Date.now();
  
  try {
    await testFunction();
    step.success = true;
  } catch (error) {
    step.error = error instanceof Error ? error.message : String(error);
  }
  
  step.time = Date.now() - startTime;
  results.initializationSteps.push(step);
}

// === ヘルパー関数 ===

function isValidJSONString(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

function assessOverallHealth(steps: any): 'HEALTHY' | 'ISSUES' | 'CRITICAL' {
  let issueCount = 0;

  if (steps.filesDiagnosis?.errors?.length > 0) issueCount++;
  if (steps.initializationTest?.errors?.length > 0) issueCount++;
  if (steps.saveTest?.errors?.length > 0) issueCount++;
  if (steps.chapterTest?.errors?.length > 0) issueCount++;

  if (issueCount === 0) return 'HEALTHY';
  if (issueCount <= 2) return 'ISSUES';
  return 'CRITICAL';
}

function generateRecommendations(steps: any): string[] {
  const recommendations: string[] = [];

  if (steps.filesDiagnosis?.missingFiles > 0) {
    recommendations.push(`${steps.filesDiagnosis.missingFiles}個のファイルが不足しています。ストレージの初期化が必要です。`);
  }

  if (steps.initializationTest?.errors?.length > 0) {
    recommendations.push('マネージャーの初期化に問題があります。システムの再起動を検討してください。');
  }

  if (steps.saveTest?.errors?.length > 0) {
    recommendations.push('保存処理に問題があります。権限とストレージ設定を確認してください。');
  }

  if (steps.chapterTest?.errors?.length > 0) {
    recommendations.push('章処理に問題があります。MemoryManagerの設定を確認してください。');
  }

  return recommendations;
}

// === 🔧 ChapterAnalysisManager詳細デバッグ ===

async function debugChapterAnalysisManager() {
  const results = {
    step1_initialization: { success: false, error: null as string | null, details: {} as any },
    step2_dataInspection: { success: false, error: null as string | null, details: {} as any },
    step3_updateTest: { success: false, error: null as string | null, details: {} as any },
    step4_saveTest: { success: false, error: null as string | null, details: {} as any },
    step5_jsonTest: { success: false, error: null as string | null, details: {} as any },
    overallDiagnosis: '',
    recommendations: [] as string[]
  };

  // Step 1: 初期化確認
  try {
    logger.info('Step 1: ChapterAnalysisManager initialization check');
    
    if (!await memoryManager.isInitialized()) {
      await memoryManager.initialize();
    }
    
    const narrativeMemory = memoryManager.getNarrativeMemory();
    if (!narrativeMemory) {
      throw new Error('NarrativeMemory not available');
    }
    
    await narrativeMemory.initialize();
    const chapterAnalysisManager = (narrativeMemory as any).chapterAnalysisManager;
    
    if (!chapterAnalysisManager) {
      throw new Error('ChapterAnalysisManager not found');
    }
    
    results.step1_initialization.success = true;
    results.step1_initialization.details = {
      managerExists: !!chapterAnalysisManager,
      hasMethodSave: typeof chapterAnalysisManager.save === 'function',
      hasMethodGetAllChapterSummaries: typeof chapterAnalysisManager.getAllChapterSummaries === 'function'
    };
    
  } catch (error) {
    results.step1_initialization.error = error instanceof Error ? error.message : String(error);
  }

  // Step 2: 現在のデータを調査
  try {
    logger.info('Step 2: Data inspection');
    
    const narrativeMemory = memoryManager.getNarrativeMemory();
    if (!narrativeMemory) {
      throw new Error('NarrativeMemory not available in step 2');
    }
    
    const chapterAnalysisManager = (narrativeMemory as any).chapterAnalysisManager;
    if (!chapterAnalysisManager) {
      throw new Error('ChapterAnalysisManager not available in step 2');
    }
    
    // 既存の章要約を取得
    const summaries = await chapterAnalysisManager.getAllChapterSummaries();
    
    // 内部データ構造を調査（プライベートプロパティにアクセス）
    const internalData = {
      chapterSummariesSize: chapterAnalysisManager.chapterSummaries?.size || 'undefined',
      genre: chapterAnalysisManager.genre || 'undefined',
      initialized: chapterAnalysisManager.initialized || 'undefined',
      geminiClient: !!chapterAnalysisManager.geminiClient
    };
    
    results.step2_dataInspection.success = true;
    results.step2_dataInspection.details = {
      summariesCount: summaries.length,
      summariesSample: summaries.slice(0, 2),
      internalData
    };
    
  } catch (error) {
    results.step2_dataInspection.error = error instanceof Error ? error.message : String(error);
  }

  // Step 3: updateFromChapter テスト
  try {
    logger.info('Step 3: updateFromChapter test');
    
    const narrativeMemory = memoryManager.getNarrativeMemory();
    if (!narrativeMemory) {
      throw new Error('NarrativeMemory not available in step 3');
    }
    
    const testChapter = createTestChapter(999); // 特別な章番号でテスト
    
    // updateFromChapter の実行をテスト
    await narrativeMemory.updateFromChapter(testChapter);
    
    results.step3_updateTest.success = true;
    results.step3_updateTest.details = {
      testChapterNumber: 999,
      updateCompleted: true
    };
    
  } catch (error) {
    results.step3_updateTest.error = error instanceof Error ? error.message : String(error);
    results.step3_updateTest.details = {
      errorType: (error as any)?.constructor?.name,
      errorStack: error instanceof Error ? error.stack?.split('\n').slice(0, 5) : undefined
    };
  }

  // Step 4: 直接保存テスト
  try {
    logger.info('Step 4: Direct save test');
    
    const narrativeMemory = memoryManager.getNarrativeMemory();
    if (!narrativeMemory) {
      throw new Error('NarrativeMemory not available in step 4');
    }
    
    const chapterAnalysisManager = (narrativeMemory as any).chapterAnalysisManager;
    if (!chapterAnalysisManager) {
      throw new Error('ChapterAnalysisManager not available in step 4');
    }
    
    // 保存前のファイル状態
    const beforeSave = {
      summariesExists: await storageProvider.fileExists('narrative-memory/summaries.json'),
      configExists: await storageProvider.fileExists('narrative-memory/chapter-analysis-config.json')
    };
    
    // 直接保存を実行
    await chapterAnalysisManager.save();
    
    // 保存後のファイル状態
    const afterSave = {
      summariesExists: await storageProvider.fileExists('narrative-memory/summaries.json'),
      configExists: await storageProvider.fileExists('narrative-memory/chapter-analysis-config.json')
    };
    
    results.step4_saveTest.success = true;
    results.step4_saveTest.details = {
      beforeSave,
      afterSave,
      filesCreated: []
    };
    
    // 新しく作成されたファイルを特定
    if (!beforeSave.summariesExists && afterSave.summariesExists) {
      (results.step4_saveTest.details as any).filesCreated.push('summaries.json');
    }
    if (!beforeSave.configExists && afterSave.configExists) {
      (results.step4_saveTest.details as any).filesCreated.push('chapter-analysis-config.json');
    }
    
  } catch (error) {
    results.step4_saveTest.error = error instanceof Error ? error.message : String(error);
    results.step4_saveTest.details = {
      errorType: (error as any)?.constructor?.name,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack?.split('\n').slice(0, 5) : undefined
    };
  }

  // Step 5: JSON シリアライゼーションテスト
  try {
    logger.info('Step 5: JSON serialization test');
    
    const narrativeMemory = memoryManager.getNarrativeMemory();
    if (!narrativeMemory) {
      throw new Error('NarrativeMemory not available in step 5');
    }
    
    const chapterAnalysisManager = (narrativeMemory as any).chapterAnalysisManager;
    if (!chapterAnalysisManager) {
      throw new Error('ChapterAnalysisManager not available in step 5');
    }
    
    // 内部データのJSON変換テスト
    const summaries = await chapterAnalysisManager.getAllChapterSummaries();
    const genre = chapterAnalysisManager.getGenre();
    
    // 各データ要素のJSON変換テスト
    const jsonTests = {
      summaries: { success: false, error: null as string | null, size: 0 },
      config: { success: false, error: null as string | null, size: 0 }
    };
    
    // summaries.json のテスト
    try {
      const summariesJson = JSON.stringify(summaries, null, 2);
      jsonTests.summaries.success = true;
      jsonTests.summaries.size = summariesJson.length;
    } catch (error) {
      jsonTests.summaries.error = error instanceof Error ? error.message : String(error);
    }
    
    // chapter-analysis-config.json のテスト
    try {
      const config = { genre };
      const configJson = JSON.stringify(config, null, 2);
      jsonTests.config.success = true;
      jsonTests.config.size = configJson.length;
    } catch (error) {
      jsonTests.config.error = error instanceof Error ? error.message : String(error);
    }
    
    results.step5_jsonTest.success = jsonTests.summaries.success && jsonTests.config.success;
    results.step5_jsonTest.details = jsonTests;
    
  } catch (error) {
    results.step5_jsonTest.error = error instanceof Error ? error.message : String(error);
  }

  // 総合診断
  const successfulSteps = [
    results.step1_initialization.success,
    results.step2_dataInspection.success, 
    results.step3_updateTest.success,
    results.step4_saveTest.success,
    results.step5_jsonTest.success
  ].filter(Boolean).length;
  
  if (successfulSteps === 5) {
    results.overallDiagnosis = 'ChapterAnalysisManager は正常に動作しています';
  } else if (successfulSteps >= 3) {
    results.overallDiagnosis = 'ChapterAnalysisManager に部分的な問題があります';
  } else {
    results.overallDiagnosis = 'ChapterAnalysisManager に重大な問題があります';
  }

  // 推奨事項の生成
  if (!results.step3_updateTest.success) {
    results.recommendations.push('updateFromChapter処理でエラーが発生しています。テスト章データの内容を確認してください。');
  }
  if (!results.step4_saveTest.success) {
    results.recommendations.push('直接保存処理でエラーが発生しています。ファイル権限またはデータ構造を確認してください。');
  }
  if (!results.step5_jsonTest.success) {
    results.recommendations.push('JSON変換でエラーが発生しています。データに循環参照や不正な値が含まれている可能性があります。');
  }

  return results;
}