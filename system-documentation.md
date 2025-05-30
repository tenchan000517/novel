# Novel Automation System Documentation

## Introduction

This documentation is automatically generated from JSDoc comments in the source code. It provides an overview of the system structure, modules, and their components.

## Table of Contents

- [C:/novel-automation-system/jest.config.js](#cnovel-automation-systemjestconfigjs)
  - [jest.config.js](#cnovel-automation-systemjestconfigjs)
- [C:/novel-automation-system/jsdoc-extractor.js](#cnovel-automation-systemjsdoc-extractorjs)
  - [jsdoc-extractor.js](#cnovel-automation-systemjsdoc-extractorjs)
- [C:/novel-automation-system/scripts](#cnovel-automation-systemscripts)
  - [rollback.ts](#cnovel-automation-systemscriptsrollbackts)
  - [seed-data.ts](#cnovel-automation-systemscriptsseed-datats)
- [C:/novel-automation-system/src](#cnovel-automation-systemsrc)
  - [route.ts](#cnovel-automation-systemsrcappapianalysismetricsroutets)
  - [route.ts](#cnovel-automation-systemsrcappapianalysisqualityroutets)
  - [route.ts](#cnovel-automation-systemsrcappapicharactersidroutets)
  - [route.ts](#cnovel-automation-systemsrcappapicharacterspromoteroutets)
  - [route.ts](#cnovel-automation-systemsrcappapicharactersrerationshipsroutets)
  - [route.ts](#cnovel-automation-systemsrcappapicharactersroutets)
  - [route.ts](#cnovel-automation-systemsrcappapicorrectionroutets)
  - [route.ts](#cnovel-automation-systemsrcappapieditorcollaborationroutets)
  - [route.ts](#cnovel-automation-systemsrcappapieditorfeedbackroutets)
  - [route.ts](#cnovel-automation-systemsrcappapieditorinterventionsroutets)
  - [route.ts](#cnovel-automation-systemsrcappapieditorlearningroutets)
  - [route.ts](#cnovel-automation-systemsrcappapiforeshadowingidroutets)
  - [route.ts](#cnovel-automation-systemsrcappapiforeshadowingresolveroutets)
  - [route.ts](#cnovel-automation-systemsrcappapiforeshadowingroutets)
  - [route.ts](#cnovel-automation-systemsrcappapiforeshadowingsuggestroutets)
  - [route.ts](#cnovel-automation-systemsrcappapigenerationchapterroutets)
  - [route.ts](#cnovel-automation-systemsrcappapigenerationcontextroutets)
  - [route.ts](#cnovel-automation-systemsrcappapigenerationgenerateroutets)
  - [route.ts](#cnovel-automation-systemsrcappapigenerationvalidateroutets)
  - [route.ts](#cnovel-automation-systemsrcappapimemorysearchroutets)
  - [route.ts](#cnovel-automation-systemsrcappapimemorysyncroutets)
  - [error.tsx](#cnovel-automation-systemsrcapperrortsx)
  - [layout.tsx](#cnovel-automation-systemsrcapplayouttsx)
  - [loading.tsx](#cnovel-automation-systemsrcapploadingtsx)
  - [not-found.tsx](#cnovel-automation-systemsrcappnot-foundtsx)
  - [page.tsx](#cnovel-automation-systemsrcapppagetsx)
  - [editor-summary.tsx](#cnovel-automation-systemsrccomponentsadmindashboardeditor-summarytsx)
  - [memory-management.tsx](#cnovel-automation-systemsrccomponentsadminmemory-managementmemory-managementtsx)
  - [alert.tsx](#cnovel-automation-systemsrccomponentssharedalerttsx)
  - [breadcrumbs.tsx](#cnovel-automation-systemsrccomponentssharedbreadcrumbstsx)
  - [error-boundary.tsx](#cnovel-automation-systemsrccomponentssharederror-boundarytsx)
  - [footer.tsx](#cnovel-automation-systemsrccomponentssharedfootertsx)
  - [header.tsx](#cnovel-automation-systemsrccomponentssharedheadertsx)
  - [navigation.tsx](#cnovel-automation-systemsrccomponentssharednavigationtsx)
  - [page-title.tsx](#cnovel-automation-systemsrccomponentssharedpage-titletsx)
  - [badge.tsx](#cnovel-automation-systemsrccomponentsuibadgetsx)
  - [button.tsx](#cnovel-automation-systemsrccomponentsuibuttontsx)
  - [card.tsx](#cnovel-automation-systemsrccomponentsuicardtsx)
  - [charts.tsx](#cnovel-automation-systemsrccomponentsuichartstsx)
  - [dialog.tsx](#cnovel-automation-systemsrccomponentsuidialogtsx)
  - [input.tsx](#cnovel-automation-systemsrccomponentsuiinputtsx)
  - [select.tsx](#cnovel-automation-systemsrccomponentsuiselecttsx)
  - [spinner.tsx](#cnovel-automation-systemsrccomponentsuispinnertsx)
  - [table.tsx](#cnovel-automation-systemsrccomponentsuitabletsx)
  - [textarea.tsx](#cnovel-automation-systemsrccomponentsuitextareatsx)
  - [api.ts](#cnovel-automation-systemsrcconfigapits)
  - [constants.ts](#cnovel-automation-systemsrcconfigconstantsts)
  - [environment.ts](#cnovel-automation-systemsrcconfigenvironmentts)
  - [use-character-analytics.ts](#cnovel-automation-systemsrchooksuse-character-analyticsts)
  - [use-character-relationships.ts](#cnovel-automation-systemsrchooksuse-character-relationshipsts)
  - [use-characters.tsx](#cnovel-automation-systemsrchooksuse-characterstsx)
  - [use-collaboration.ts](#cnovel-automation-systemsrchooksuse-collaborationts)
  - [use-editor.ts](#cnovel-automation-systemsrchooksuse-editorts)
  - [use-foreshadowing.ts](#cnovel-automation-systemsrchooksuse-foreshadowingts)
  - [performance-analyzer copy.ts](#cnovel-automation-systemsrclibanalysisperformance-analyzer-copyts)
  - [performance-analyzer.ts](#cnovel-automation-systemsrclibanalysisperformance-analyzerts)
  - [quality-analyzer copy.ts](#cnovel-automation-systemsrclibanalysisquality-analyzer-copyts)
  - [quality-analyzer.ts](#cnovel-automation-systemsrclibanalysisquality-analyzerts)
  - [rate-limiter.ts](#cnovel-automation-systemsrclibapirate-limiterts)
  - [redis-cache.ts](#cnovel-automation-systemsrclibcacheredis-cachets)
  - [evolution-system copy 2.ts](#cnovel-automation-systemsrclibcharactersevolution-system-copy-2ts)
  - [evolution-system copy.ts](#cnovel-automation-systemsrclibcharactersevolution-system-copyts)
  - [manager copy 2.ts](#cnovel-automation-systemsrclibcharactersmanager-copy-2ts)
  - [manager copy.ts](#cnovel-automation-systemsrclibcharactersmanager-copyts)
  - [promotion-system copy 2.ts](#cnovel-automation-systemsrclibcharacterspromotion-system-copy-2ts)
  - [promotion-system copy.ts](#cnovel-automation-systemsrclibcharacterspromotion-system-copyts)
  - [relationship-graph copy 2.ts](#cnovel-automation-systemsrclibcharactersrelationship-graph-copy-2ts)
  - [relationship-graph copy.ts](#cnovel-automation-systemsrclibcharactersrelationship-graph-copyts)
  - [timing-analyzer copy 2.ts](#cnovel-automation-systemsrclibcharacterstiming-analyzer-copy-2ts)
  - [timing-analyzer copy.ts](#cnovel-automation-systemsrclibcharacterstiming-analyzer-copyts)
  - [analyzer.ts](#cnovel-automation-systemsrclibcharactersanalyzerts)
  - [evolution-system.ts](#cnovel-automation-systemsrclibcharactersevolution-systemts)
  - [manager.ts](#cnovel-automation-systemsrclibcharactersmanagerts)
  - [promotion-system.ts](#cnovel-automation-systemsrclibcharacterspromotion-systemts)
  - [relationship-graph.ts](#cnovel-automation-systemsrclibcharactersrelationship-graphts)
  - [timing-analyzer.ts](#cnovel-automation-systemsrclibcharacterstiming-analyzerts)
  - [auto-correction copy.ts](#cnovel-automation-systemsrclibcorrectionauto-correction-copyts)
  - [auto-correction.ts](#cnovel-automation-systemsrclibcorrectionauto-correctionts)
  - [character-correction copy.ts](#cnovel-automation-systemsrclibcorrectioncharacter-correction-copyts)
  - [character-correction.ts](#cnovel-automation-systemsrclibcorrectioncharacter-correctionts)
  - [plot-correction copy.ts](#cnovel-automation-systemsrclibcorrectionplot-correction-copyts)
  - [plot-correction.ts](#cnovel-automation-systemsrclibcorrectionplot-correctionts)
  - [canary-deployment.ts](#cnovel-automation-systemsrclibdeploymentcanary-deploymentts)
  - [collaborative-editor copy.ts](#cnovel-automation-systemsrclibeditorcollaborative-editor-copyts)
  - [command-interpreter copy.ts](#cnovel-automation-systemsrclibeditorcommand-interpreter-copyts)
  - [conflict-resolver copy.ts](#cnovel-automation-systemsrclibeditorconflict-resolver-copyts)
  - [version-control copy.ts](#cnovel-automation-systemsrclibeditorversion-control-copyts)
  - [collaborative-editor.ts](#cnovel-automation-systemsrclibeditorcollaborative-editorts)
  - [command-interpreter.ts](#cnovel-automation-systemsrclibeditorcommand-interpreterts)
  - [command-registry.ts](#cnovel-automation-systemsrclibeditorcommand-registryts)
  - [conflict-resolver.ts](#cnovel-automation-systemsrclibeditorconflict-resolverts)
  - [context-history.ts](#cnovel-automation-systemsrclibeditorcontext-historyts)
  - [diff-algorithm.ts](#cnovel-automation-systemsrclibeditordiff-algorithmts)
  - [feedback-history.ts](#cnovel-automation-systemsrclibeditorfeedback-historyts)
  - [feedback-processor.ts](#cnovel-automation-systemsrclibeditorfeedback-processorts)
  - [intent-recognizer.ts](#cnovel-automation-systemsrclibeditorintent-recognizerts)
  - [intervention-system copy.ts](#cnovel-automation-systemsrclibeditorintervention-system-copyts)
  - [intervention-system.ts](#cnovel-automation-systemsrclibeditorintervention-systemts)
  - [learning-engine.ts](#cnovel-automation-systemsrclibeditorlearning-enginets)
  - [semantic-merger.ts](#cnovel-automation-systemsrclibeditorsemantic-mergerts)
  - [storage-adapter.ts](#cnovel-automation-systemsrclibeditorstorage-adapterts)
  - [version-control.ts](#cnovel-automation-systemsrclibeditorversion-controlts)
  - [auto-generator.ts](#cnovel-automation-systemsrclibforeshadowingauto-generatorts)
  - [engine.ts](#cnovel-automation-systemsrclibforeshadowingenginets)
  - [index.ts](#cnovel-automation-systemsrclibforeshadowingindexts)
  - [manager.ts](#cnovel-automation-systemsrclibforeshadowingmanagerts)
  - [resolution-advisor.ts](#cnovel-automation-systemsrclibforeshadowingresolution-advisorts)
  - [context-generator copy.ts](#cnovel-automation-systemsrclibgenerationcontext-generator-copyts)
  - [engine copy.ts](#cnovel-automation-systemsrclibgenerationengine-copyts)
  - [context-generator.ts](#cnovel-automation-systemsrclibgenerationcontext-generatorts)
  - [engine.ts](#cnovel-automation-systemsrclibgenerationenginets)
  - [gemini-client.ts](#cnovel-automation-systemsrclibgenerationgemini-clientts)
  - [output-parser.ts](#cnovel-automation-systemsrclibgenerationoutput-parserts)
  - [parallel-generator.ts](#cnovel-automation-systemsrclibgenerationparallel-generatorts)
  - [prompt-template.ts](#cnovel-automation-systemsrclibgenerationprompt-templatets)
  - [rate-limiter.ts](#cnovel-automation-systemsrclibgenerationrate-limiterts)
  - [long-term-memory copy2.ts](#cnovel-automation-systemsrclibmemorylong-term-memory-copy2ts)
  - [long-term-memory copy3.ts](#cnovel-automation-systemsrclibmemorylong-term-memory-copy3ts)
  - [index.ts](#cnovel-automation-systemsrclibmemoryindexts)
  - [long-term-memory.ts](#cnovel-automation-systemsrclibmemorylong-term-memoryts)
  - [manager.ts](#cnovel-automation-systemsrclibmemorymanagerts)
  - [mid-term-memory.ts](#cnovel-automation-systemsrclibmemorymid-term-memoryts)
  - [short-term-memory.ts](#cnovel-automation-systemsrclibmemoryshort-term-memoryts)
  - [types.ts](#cnovel-automation-systemsrclibmemorytypests)
  - [alert-manager.ts](#cnovel-automation-systemsrclibmonitoringalert-managerts)
  - [log-aggregator.ts](#cnovel-automation-systemsrclibmonitoringlog-aggregatorts)
  - [metrics-collector.ts](#cnovel-automation-systemsrclibmonitoringmetrics-collectorts)
  - [index copy.ts](#cnovel-automation-systemsrclibstorageindex-copyts)
  - [enhanced-storage.ts](#cnovel-automation-systemsrclibstorageenhanced-storagets)
  - [github-storage.ts](#cnovel-automation-systemsrclibstoragegithub-storagets)
  - [index copy 2.ts](#cnovel-automation-systemsrclibstorageindex-copy-2ts)
  - [index copy.ts](#cnovel-automation-systemsrclibstorageindex-copyts)
  - [index.ts](#cnovel-automation-systemsrclibstorageindexts)
  - [local-storage copy.ts](#cnovel-automation-systemsrclibstoragelocal-storage-copyts)
  - [local-storage.ts](#cnovel-automation-systemsrclibstoragelocal-storagets)
  - [optimized-storage.ts](#cnovel-automation-systemsrclibstorageoptimized-storagets)
  - [types copy.ts](#cnovel-automation-systemsrclibstoragetypes-copyts)
  - [types.ts](#cnovel-automation-systemsrclibstoragetypests)
  - [id-generator copy.ts](#cnovel-automation-systemsrclibutilsid-generator-copyts)
  - [error-handler.ts](#cnovel-automation-systemsrclibutilserror-handlerts)
  - [helpers.ts](#cnovel-automation-systemsrclibutilshelpersts)
  - [id-generator.ts](#cnovel-automation-systemsrclibutilsid-generatorts)
  - [logger.ts](#cnovel-automation-systemsrclibutilsloggerts)
  - [yaml-helper.ts](#cnovel-automation-systemsrclibutilsyaml-helperts)
  - [consistency-checker copy.ts](#cnovel-automation-systemsrclibvalidationconsistency-checker-copyts)
  - [consistency-checker.ts](#cnovel-automation-systemsrclibvalidationconsistency-checkerts)
  - [analysis.ts](#cnovel-automation-systemsrctypesanalysists)
  - [api.ts](#cnovel-automation-systemsrctypesapits)
  - [chapters.ts](#cnovel-automation-systemsrctypeschaptersts)
  - [characters copy.ts](#cnovel-automation-systemsrctypescharacters-copyts)
  - [characters.ts](#cnovel-automation-systemsrctypescharactersts)
  - [correction.ts](#cnovel-automation-systemsrctypescorrectionts)
  - [editor.ts](#cnovel-automation-systemsrctypeseditorts)
  - [generation copy.ts](#cnovel-automation-systemsrctypesgeneration-copyts)
  - [generation.ts](#cnovel-automation-systemsrctypesgenerationts)
  - [generation★.ts](#cnovel-automation-systemsrctypesgenerationts)
  - [memory copy.ts](#cnovel-automation-systemsrctypesmemory-copyts)
  - [memory.ts](#cnovel-automation-systemsrctypesmemoryts)
  - [memory★.ts](#cnovel-automation-systemsrctypesmemoryts)
  - [validation.ts](#cnovel-automation-systemsrctypesvalidationts)
- [C:/novel-automation-system/tests](#cnovel-automation-systemtests)
  - [context-generator.mock.ts](#cnovel-automation-systemtestsmockscontext-generatormockts)
  - [gemini-client.mock.ts](#cnovel-automation-systemtestsmocksgemini-clientmockts)
  - [modules.ts](#cnovel-automation-systemtestsmocksmodulests)
  - [simple-engine.test.ts](#cnovel-automation-systemtestssimple-enginetestts)
  - [simple-utils.test.ts](#cnovel-automation-systemtestsunitutilssimple-utilstestts)
  - [continuous-generation.test.ts](#cnovel-automation-systemtestscontinuouscontinuous-generationtestts)
  - [enhanced-storage-test.js](#cnovel-automation-systemtestsintegrationenhanced-storage-testjs)
  - [novel-generation.test.ts](#cnovel-automation-systemtestsintegrationnovel-generationtestts)
  - [gemini-client.mock.ts](#cnovel-automation-systemtestsmocksgemini-clientmockts)
  - [concurrent-requests.test.ts](#cnovel-automation-systemtestsperformanceconcurrent-requeststestts)

## System Overview

The Novel Automation System is designed to generate and manage novel content automatically. It consists of several core modules for memory management, character handling, story generation, and quality analysis.

## C:/novel-automation-system/jest.config.js {#cnovel-automation-systemjestconfigjs}

### jest.config.js {#cnovel-automation-systemjestconfigjs}

**Path:** `C:/novel-automation-system/jest.config.js`

/*.{ts,tsx}',
'!src/*

**@constructor:** function Object() { [native code] }


---

## C:/novel-automation-system/jsdoc-extractor.js {#cnovel-automation-systemjsdoc-extractorjs}

### jsdoc-extractor.js {#cnovel-automation-systemjsdoc-extractorjs}

**Path:** `C:/novel-automation-system/jsdoc-extractor.js`

JSDoc ExtractorThis script recursively extracts JSDoc comments, function names, class names,and method names from JavaScript/TypeScript files, then generates a comprehensivesystem documentation.

**@constructor:** function Object() { [native code] }

#### fs (variable)

JSDoc ExtractorThis script recursively extracts JSDoc comments, function names, class names,and method names from JavaScript/TypeScript files, then generates a comprehensivesystem documentation.

**@constructor:** function Object() { [native code] }

#### findFiles (function)

Recursively finds all files with specified extensions in a directory

**@constructor:** function Object() { [native code] }

#### extractJSDocFromFile (function)

Extracts JSDoc comments from a file along with their associated code elements

**@constructor:** function Object() { [native code] }

#### extractClassBody (function)

Extracts the class body from a position in the content

**@constructor:** function Object() { [native code] }

#### extractMethodsFromClass (function)

Extracts methods with JSDoc from a class body

**@constructor:** function Object() { [native code] }

#### cleanJSDoc (function)

Cleans JSDoc comment by removing comment markers and normalizing whitespace

**@constructor:** function Object() { [native code] }

#### parseJSDoc (function)

Parses a JSDoc comment to extract structured information

**@constructor:** function Object() { [native code] }

#### groupItemsByModule (function)

Groups items by their module or package

**@constructor:** function Object() { [native code] }

#### groupItemsByFile (function)

Groups items by their file

**@constructor:** function Object() { [native code] }

#### generateDocumentation (function)

Generates documentation from extracted JSDoc items

**@constructor:** function Object() { [native code] }

#### generateItemDoc (function)

Generates documentation for a single JSDoc item

**@constructor:** function Object() { [native code] }

#### getSlug (function)

Generates a slug for anchor links

**@constructor:** function Object() { [native code] }

#### main (function)

Main function to run the script

**@constructor:** function Object() { [native code] }


---

## C:/novel-automation-system/scripts {#cnovel-automation-systemscripts}

### rollback.ts {#cnovel-automation-systemscriptsrollbackts}

**Path:** `C:/novel-automation-system/scripts/rollback.ts`

ロールバック構成インターフェース

**@constructor:** function Object() { [native code] }

#### RollbackConfig (interface)

ロールバック構成インターフェース

**@constructor:** function Object() { [native code] }

#### DeploymentRecord (interface)

ターゲット環境 */
environment: 'production' | 'staging';

/** ロールバック先バージョン */
version: string;

/** ドライランモード */
dryRun: boolean;

/** 通知の有効化 */
notify: boolean;

/** 強制モード */
force: boolean;
}

/**デプロイメント記録

**@constructor:** function Object() { [native code] }

#### rollback (function)

指定されたバージョンへのロールバックを実行@param config ロールバック構成

**@constructor:** function Object() { [native code] }

#### loadDeploymentHistory (function)

デプロイメント履歴を読み込み@returns デプロイメント記録の配列

**@constructor:** function Object() { [native code] }

#### recordRollback (function)

ロールバックを記録@param rollbackInfo ロールバック情報

**@constructor:** function Object() { [native code] }

#### promptConfirmation (function)

ユーザー確認を促す@param message 確認メッセージ@returns ユーザー入力

**@constructor:** function Object() { [native code] }

#### sendRollbackNotification (function)

ロールバック通知を送信@param config ロールバック構成@param fromVersion ロールバック元バージョン@param success 成功フラグ

**@constructor:** function Object() { [native code] }


---

### seed-data.ts {#cnovel-automation-systemscriptsseed-datats}

**Path:** `C:/novel-automation-system/scripts/seed-data.ts`

サンプルデータ作成スクリプト開発環境でのテスト用にサンプルデータを生成します

**@constructor:** function Object() { [native code] }

#### mainCharacters (variable)

サンプルデータ作成スクリプト開発環境でのテスト用にサンプルデータを生成します/

import path from 'path';
import fs from 'fs/promises';
import { StorageProvider } from '../src/lib/storage/types';
import { LocalStorageProvider } from '../src/lib/storage/local-storage';
import { logger } from '../src/lib/utils/logger';
import { parseYaml, stringifyYaml } from '../src/lib/utils/helpers';

/**メインキャラクターのサンプルデータ

**@constructor:** function Object() { [native code] }

#### subCharacters (variable)

サブキャラクターのサンプルデータ

**@constructor:** function Object() { [native code] }

#### mobCharacters (variable)

モブキャラクターのサンプルデータ

**@constructor:** function Object() { [native code] }

#### sampleChapters (variable)

サンプルチャプター

**@constructor:** function Object() { [native code] }

#### seedData (function)

サンプルデータを作成する関数

**@constructor:** function Object() { [native code] }

#### createDirectories (function)

必要なディレクトリを作成する関数

**@constructor:** function Object() { [native code] }

#### seedConfigFiles (function)

設定ファイルを作成する関数

**@constructor:** function Object() { [native code] }

#### seedCharacters (function)

キャラクターデータを作成する関数

**@constructor:** function Object() { [native code] }

#### seedChapters (function)

チャプターデータを作成する関数

**@constructor:** function Object() { [native code] }

#### seedMemoryData (function)

記憶データを作成する関数

**@constructor:** function Object() { [native code] }

#### readSampleYaml (function)

サンプルYAMLファイルを読み込む関数

**@constructor:** function Object() { [native code] }


---

## C:/novel-automation-system/src {#cnovel-automation-systemsrc}

### route.ts {#cnovel-automation-systemsrcappapianalysismetricsroutets}

**Path:** `C:/novel-automation-system/src/app/api/analysis/metrics/route.ts`

@fileoverview パフォーマンスメトリクスAPI@descriptionシステムのパフォーマンスメトリクスを収集・提供するREST APIエンドポイント。Next.jsのAPIルートとして実装され、GET/POSTメソッドをサポートしています。- GET: システムパフォーマンスのメトリクスを取得- POST: システムイベントやパフォーマンスデータを記録@requires next/server@requires @/lib/analysis/performance-analyzer@requires @/lib/utils/logger@dependency PerformanceAnalyzer - システムメトリクスの収集・分析を行うシングルトンとして使用@dependency logger - エラーやイベントのロギングに使用@usageGET /api/metrics?types=generationSpeed,apiLatency&start=2025-01-01&end=2025-01-02POST /api/metrics { type: "generation", totalTime: 125, tokenCount: 450 }

**@constructor:** function Object() { [native code] }

#### GET (function)

@fileoverview パフォーマンスメトリクスAPI@descriptionシステムのパフォーマンスメトリクスを収集・提供するREST APIエンドポイント。Next.jsのAPIルートとして実装され、GET/POSTメソッドをサポートしています。- GET: システムパフォーマンスのメトリクスを取得- POST: システムイベントやパフォーマンスデータを記録@requires next/server@requires @/lib/analysis/performance-analyzer@requires @/lib/utils/logger@dependency PerformanceAnalyzer - システムメトリクスの収集・分析を行うシングルトンとして使用@dependency logger - エラーやイベントのロギングに使用@usageGET /api/metrics?types=generationSpeed,apiLatency&start=2025-01-01&end=2025-01-02POST /api/metrics { type: "generation", totalTime: 125, tokenCount: 450 }/

import { NextResponse } from 'next/server';
import { PerformanceAnalyzer } from '@/lib/analysis/performance-analyzer';
import { logger } from '@/lib/utils/logger';

/**パフォーマンスメトリクスAPIGET: システムパフォーマンスのメトリクスを取得/

// シングルトンのパフォーマンスアナライザインスタンス
let performanceAnalyzer: PerformanceAnalyzer;

/**@function GET@description システムパフォーマンスのメトリクスを取得するエンドポイント@param {Request} request - 受信したHTTPリクエスト@returns {Promise<NextResponse>} JSON形式のレスポンス@queryParams- start {string} - 開始日時 (ISO 8601形式) - オプション- end {string} - 終了日時 (ISO 8601形式) - オプション- types {string} - カンマ区切りのメトリクスタイプ（オプション）  利用可能タイプ: generationSpeed, apiLatency, memoryUsage, cacheEfficiency, errorRate@responseStructure{  success: boolean,  data: {    // コード内でフィルタリングされるメトリクスタイプに基づく    generationSpeed?: any, // 正確な構造はPerformanceAnalyzerの実装に依存    apiLatency?: any,    memoryUsage?: any,    cacheEfficiency?: any,    errorRate?: any  },  timestamp: string}@error- 500: METRICS_ERROR - PerformanceAnalyzerからのデータ取得に失敗@dependencies- PerformanceAnalyzer.analyzeSystemPerformance()- logger.info(), logger.error()

**@constructor:** function Object() { [native code] }

#### POST (function)

@function POST@description システムイベントやメトリクスを記録するエンドポイント@param {Request} request - 受信したHTTPリクエスト@returns {Promise<NextResponse>} JSON形式のレスポンス@requestBodyコードで処理される4種類のタイプ：- 'generation'タイプ: { type: 'generation', totalTime: number, tokenCount: number }- 'api'タイプ: { type: 'api', endpoint: string, latency: number, success: boolean }- 'cache'タイプ: { type: 'cache', hits: number, misses: number, evictions: number }- 'error'タイプ: { type: 'error', errorType: string, message: string, severity?: string, count?: number }@responseStructure成功時:{  success: true,  message: 'Performance metrics recorded successfully'}エラー時:{  success: false,  error: {    code: 'RECORD_ERROR',    message: 'Failed to record performance metrics'  }}@error- 500: RECORD_ERROR - メトリクスの記録に失敗@dependencies- PerformanceAnalyzer.recordGeneration(), recordApiCall(), recordCacheEvent(), recordError()- logger.debug(), logger.error(), logger.info()@example// テキスト生成メトリクスの記録例await fetch('/api/metrics', {  method: 'POST',  headers: { 'Content-Type': 'application/json' },  body: JSON.stringify({    type: 'generation',    totalTime: 350, // ミリ秒単位と推測    tokenCount: 750  })});

**@constructor:** function Object() { [native code] }


---

### route.ts {#cnovel-automation-systemsrcappapianalysisqualityroutets}

**Path:** `C:/novel-automation-system/src/app/api/analysis/quality/route.ts`

@fileoverview 品質分析API - チャプターの品質分析結果を提供するエンドポイント@description このファイルは小説や文章コンテンツのチャプター品質を分析するAPI endpointを実装しています。GET リクエストでチャプターの品質分析結果を取得します。分析対象のチャプターは、特定のIDによる指定、章番号の範囲指定、または最新のN章を対象とすることができます。@requires {NextResponse} next/server@requires {QualityAnalyzer} @/lib/analysis/quality-analyzer@requires {logger} @/lib/utils/logger@requires {storageProvider} @/lib/storage@requires {parseYaml} @/lib/utils/yaml-helper@typedef {Object} Chapter - チャプター情報@typedef {Object} QualityAnalysis - 品質分析結果

**@constructor:** function Object() { [native code] }

#### GET (function)

@fileoverview 品質分析API - チャプターの品質分析結果を提供するエンドポイント@description このファイルは小説や文章コンテンツのチャプター品質を分析するAPI endpointを実装しています。GET リクエストでチャプターの品質分析結果を取得します。分析対象のチャプターは、特定のIDによる指定、章番号の範囲指定、または最新のN章を対象とすることができます。@requires {NextResponse} next/server@requires {QualityAnalyzer} @/lib/analysis/quality-analyzer@requires {logger} @/lib/utils/logger@requires {storageProvider} @/lib/storage@requires {parseYaml} @/lib/utils/yaml-helper@typedef {Object} Chapter - チャプター情報@typedef {Object} QualityAnalysis - 品質分析結果/

import { NextResponse } from 'next/server';
import { QualityAnalyzer } from '@/lib/analysis/quality-analyzer';
import { logger } from '@/lib/utils/logger';
import { storageProvider } from '@/lib/storage';
import { parseYaml } from '@/lib/utils/yaml-helper';

/**品質分析APIGET: チャプターの品質分析を取得/

// シングルトンの品質分析インスタンス
const qualityAnalyzer = new QualityAnalyzer();

/**チャプターの品質分析を取得するAPI関数@async@function GET@param {Request} request - HTTPリクエストオブジェクト@returns {Promise<NextResponse>} 分析結果のJSONレスポンス@example// チャプターID指定での呼び出しGET /api/analysis/quality?chapterIds=1,2,3// 章番号範囲指定での呼び出しGET /api/analysis/quality?from=1&to=5// パラメータなしで最新5章を分析GET /api/analysis/quality@example// 正常レスポンス{  success: true,  data: {    overallScore: 0.75,    detailedMetrics: {      readability: 0.8,      coherence: 0.7,      engagement: 0.75,      characterConsistency: 0.73    },    trends: [...],    recommendations: [...],    chapterCount: 5,    chapterRange: { from: 1, to: 5 }  }}@example// エラーレスポンス{  success: false,  error: {    code: 'NO_CHAPTERS',    message: 'No chapters found for analysis'  }}

**@constructor:** function Object() { [native code] }

#### loadChapterById (function)

IDに基づいてチャプターを読み込む@async@function loadChapterById@param {string} id - チャプターID@returns {Promise<any|null>} チャプターオブジェクトまたはnull@private

**@constructor:** function Object() { [native code] }

#### loadChapterByNumber (function)

章番号に基づいてチャプターを読み込む@async@function loadChapterByNumber@param {number} number - チャプターの番号@returns {Promise<any|null>} チャプターオブジェクトまたはnull@private

**@constructor:** function Object() { [native code] }

#### loadLatestChapters (function)

最新のチャプターを読み込む@async@function loadLatestChapters@param {number} count - 読み込むチャプターの数@returns {Promise<any[]>} チャプターオブジェクトの配列@private

**@constructor:** function Object() { [native code] }

#### analyzeTrends (function)

品質傾向を分析@function analyzeTrends@param {any[]} chapters - チャプターのリスト@param {any[]} analyses - 分析結果のリスト@returns {any[]} 傾向分析結果@private

**@constructor:** function Object() { [native code] }

#### calculateTrend (function)

配列の傾向を計算@function calculateTrend@param {number[]} values - 分析値の配列@returns {'IMPROVING'|'DECLINING'|'STABLE'} 傾向の種類@private

**@constructor:** function Object() { [native code] }

#### generateRecommendations (function)

分析結果から推奨事項を生成@function generateRecommendations@param {any[]} analyses - 分析結果の配列@returns {string[]} 推奨事項の配列@private

**@constructor:** function Object() { [native code] }


---

### route.ts {#cnovel-automation-systemsrcappapicharactersidroutets}

**Path:** `C:/novel-automation-system/src/app/api/characters/[id]/route.ts`

@fileoverview 個別キャラクター管理API - 特定IDのキャラクターの取得、更新、削除（非アクティブ化）を行うエンドポイント@description このAPIは特定のキャラクターIDに対するREST操作（GET/PUT/DELETE）を提供します。- GET: 単一キャラクターの詳細取得とその関係性データを返します- PUT: キャラクター情報の更新を行います- DELETE: キャラクターを削除（実際には非アクティブ化）します@requires next/server@requires @/lib/characters/manager@requires @/lib/utils/logger

**@constructor:** function Object() { [native code] }

#### RequestContext (interface)

@fileoverview 個別キャラクター管理API - 特定IDのキャラクターの取得、更新、削除（非アクティブ化）を行うエンドポイント@description このAPIは特定のキャラクターIDに対するREST操作（GET/PUT/DELETE）を提供します。- GET: 単一キャラクターの詳細取得とその関係性データを返します- PUT: キャラクター情報の更新を行います- DELETE: キャラクターを削除（実際には非アクティブ化）します@requires next/server@requires @/lib/characters/manager@requires @/lib/utils/logger/

import { NextResponse } from 'next/server';
import { CharacterManager } from '@/lib/characters/manager';
import { logger } from '@/lib/utils/logger';

/**リクエストコンテキストのインターフェース@interface RequestContext@property {Object} params - URLパラメータ@property {string} params.id - キャラクターID

**@constructor:** function Object() { [native code] }

#### GET (function)

単一キャラクターの詳細取得@async@function GET@param {Request} request - HTTPリクエストオブジェクト@param {RequestContext} context - リクエストコンテキスト（キャラクターIDを含む）@returns {Promise<NextResponse>}  - 成功時: キャラクター情報、関係性データ、履歴、メトリクスを含むJSONレスポンス - エラー時: エラーコードとメッセージを含むJSONレスポンス@example// 成功レスポンス{  success: true,  data: {    character: {...},    relationships: {...},    history: {      appearances: [...],      developmentPath: [...]    },    metrics: {      appearanceCount: 5,      developmentStage: 2,      lastAppearance: 10    }  }}// エラーレスポンス{  success: false,  error: {    code: 'NOT_FOUND',    message: 'Character with ID 123 not found'  }}

**@constructor:** function Object() { [native code] }

#### PUT (function)

キャラクター情報の更新@async@function PUT@param {Request} request - HTTPリクエストオブジェクト。キャラクター更新データをJSONボディに含む@param {RequestContext} context - リクエストコンテキスト（キャラクターIDを含む）@returns {Promise<NextResponse>}  - 成功時: 更新されたキャラクター情報と変更内容を含むJSONレスポンス - エラー時: エラーコードとメッセージを含むJSONレスポンス@example// リクエストボディ{  name: "新しい名前",  description: "更新された説明"}// 成功レスポンス{  success: true,  data: {    character: {...},    changes: [      { field: "name", oldValue: "古い名前", newValue: "新しい名前" },      { field: "description", oldValue: "古い説明", newValue: "更新された説明" }    ]  }}

**@constructor:** function Object() { [native code] }

#### DELETE (function)

キャラクターの削除（非アクティブ化）@async@function DELETE@param {Request} request - HTTPリクエストオブジェクト@param {RequestContext} context - リクエストコンテキスト（キャラクターIDを含む）@returns {Promise<NextResponse>}  - 成功時: 非アクティブ化されたキャラクター情報を含むJSONレスポンス - エラー時: エラーコードとメッセージを含むJSONレスポンス@description このメソッドはキャラクターを物理的に削除せず、非アクティブ状態に設定します。これによりデータは保持されたまま、アプリケーション上では削除されたように見えます。@example// 成功レスポンス{  success: true,  data: {    message: "Character 123 has been deactivated",    character: {...} // 非アクティブ化されたキャラクターデータ  }}

**@constructor:** function Object() { [native code] }


---

### route.ts {#cnovel-automation-systemsrcappapicharacterspromoteroutets}

**Path:** `C:/novel-automation-system/src/app/api/characters/promote/route.ts`

@fileoverview キャラクター昇格APIエンドポイント@description このファイルはキャラクターを低位タイプ（MOB→SUB→MAIN）に昇格させるためのAPIエンドポイントを提供します。CharacterManagerを使用して昇格処理を実行し、キャラクターの昇格可能性を評価したうえで、適格な場合のみ昇格を許可します。昇格プロセスには以下のステップが含まれます：1. リクエストパラメータの検証2. キャラクターの存在確認3. 昇格適格性の評価4. 昇格処理の実行5. 昇格結果の返却昇格処理はPromotionSystemを通じて行われ、キャラクターの実績、プロット関連度、読者エンゲージメントなどのメトリクスに基づいて判断されます。昇格によりキャラクターの背景設定が拡張され、より多くの情報が追加されます。@requires next/server@requires @/lib/characters/manager@requires @/lib/utils/logger

**@constructor:** function Object() { [native code] }

#### POST (function)

@fileoverview キャラクター昇格APIエンドポイント@description このファイルはキャラクターを低位タイプ（MOB→SUB→MAIN）に昇格させるためのAPIエンドポイントを提供します。CharacterManagerを使用して昇格処理を実行し、キャラクターの昇格可能性を評価したうえで、適格な場合のみ昇格を許可します。昇格プロセスには以下のステップが含まれます：1. リクエストパラメータの検証2. キャラクターの存在確認3. 昇格適格性の評価4. 昇格処理の実行5. 昇格結果の返却昇格処理はPromotionSystemを通じて行われ、キャラクターの実績、プロット関連度、読者エンゲージメントなどのメトリクスに基づいて判断されます。昇格によりキャラクターの背景設定が拡張され、より多くの情報が追加されます。@requires next/server@requires @/lib/characters/manager@requires @/lib/utils/logger/

import { NextResponse } from 'next/server';
import { CharacterManager } from '@/lib/characters/manager';
import { logger } from '@/lib/utils/logger';

/**キャラクター昇格APIPOST: キャラクターを昇格させる/

// シングルトンのキャラクターマネージャーインスタンス
const characterManager = new CharacterManager();

/**キャラクターを昇格させるPOSTエンドポイント処理@async@function POST@param {Request} request - HTTPリクエストオブジェクト@returns {Promise<NextResponse>} JSONレスポンス@descriptionこのエンドポイントは次の処理を実行します：1. リクエストボディからcharacterIdを取得2. キャラクターの存在確認3. キャラクターが昇格可能かどうかを評価4. 昇格可能な場合は昇格処理を実行5. 昇格結果をJSON形式で返却@example// リクエストボディ例{  "characterId": "char_12345",  "targetType": "MAIN" // オプション}// 成功レスポンス例{  "success": true,  "data": {    "character": {...}, // 昇格後のキャラクターデータ    "promotionDetails": {      "fromType": "SUB",      "toType": "MAIN",      "timestamp": "2023-...",      "score": 0.85,      "reason": "十分な登場回数と物語への関与が認められます"    }  }}// エラーレスポンス例{  "success": false,  "error": {    "code": "NOT_ELIGIBLE",    "message": "Character is not eligible for promotion: 登場回数が不足しています"  }}@throws {400} VALIDATION_ERROR - 必須パラメータが不足している場合@throws {404} NOT_FOUND - 指定されたIDのキャラクターが存在しない場合@throws {400} NOT_ELIGIBLE - キャラクターが昇格条件を満たしていない場合@throws {400} INVALID_TARGET_TYPE - 指定された昇格先タイプが評価結果と一致しない場合@throws {500} PROMOTION_ERROR - 昇格処理中にエラーが発生した場合

**@constructor:** function Object() { [native code] }


---

### route.ts {#cnovel-automation-systemsrcappapicharactersrerationshipsroutets}

**Path:** `C:/novel-automation-system/src/app/api/characters/rerationships/route.ts`

@fileoverview キャラクター関係性のためのAPI実装@description このファイルはキャラクター間の関係性グラフを取得するためのAPIエンドポイントを提供します。次の3つのケースをサポートしています：1. 特定のキャラクターの関係性グラフを取得（characterIdクエリパラメータを使用）2. 特定タイプの関係性を持つキャラクターとその関係性を取得（typeクエリパラメータを使用）3. すべてのキャラクター間の関係性グラフを取得（パラメータなし）@requires next/server@requires @/lib/characters/manager@requires @/lib/utils/logger@requires @/types/characters@typedef {import('@/types/characters').Character} Character@typedef {import('@/types/characters').Relationship} Relationship@typedef {import('@/types/characters').RelationshipType} RelationshipType

**@constructor:** function Object() { [native code] }

#### GET (function)

@fileoverview キャラクター関係性のためのAPI実装@description このファイルはキャラクター間の関係性グラフを取得するためのAPIエンドポイントを提供します。次の3つのケースをサポートしています：1. 特定のキャラクターの関係性グラフを取得（characterIdクエリパラメータを使用）2. 特定タイプの関係性を持つキャラクターとその関係性を取得（typeクエリパラメータを使用）3. すべてのキャラクター間の関係性グラフを取得（パラメータなし）@requires next/server@requires @/lib/characters/manager@requires @/lib/utils/logger@requires @/types/characters@typedef {import('@/types/characters').Character} Character@typedef {import('@/types/characters').Relationship} Relationship@typedef {import('@/types/characters').RelationshipType} RelationshipType/

import { NextResponse } from 'next/server';
import { CharacterManager } from '@/lib/characters/manager';
import { logger } from '@/lib/utils/logger';
import { Character, Relationship, RelationshipType } from '@/types/characters';

// シングルトンのキャラクターマネージャーインスタンス
const characterManager = new CharacterManager();

/**キャラクター関係性グラフを取得する@async@function GET@param {Request} request - HTTPリクエストオブジェクト@returns {Promise<NextResponse>} 関係性グラフデータを含むJSONレスポンス@example// 特定のキャラクターの関係性を取得GET /api/characters/relationships?characterId=abc123// 特定タイプの関係性を取得GET /api/characters/relationships?type=FRIEND// すべての関係性を取得GET /api/characters/relationships@throws {NextResponse} 404 - 指定されたキャラクターが見つからない場合@throws {NextResponse} 500 - サーバーエラーが発生した場合

**@constructor:** function Object() { [native code] }


---

### route.ts {#cnovel-automation-systemsrcappapicharactersroutets}

**Path:** `C:/novel-automation-system/src/app/api/characters/route.ts`

@fileoverview キャラクター管理のためのAPIエンドポイント@description このファイルはキャラクター管理のためのREST APIエンドポイントを実装しています。GET リクエストでキャラクターリストの取得、POST リクエストで新しいキャラクターの作成が可能です。@requires NextResponse - Next.jsのレスポンスオブジェクト@requires CharacterManager - キャラクター管理を行うクラス@requires logger - ロギング機能@requires CharacterType - キャラクタータイプの型定義@dependency 各キャラクターはタイプ(MAIN/SUB/MOB)によって分類され、ステータス(active/inactive)を持ちます@dependency レスポンスは常に { success: boolean, data?: any, error?: { code: string, message: string } } の形式で返されます

**@constructor:** function Object() { [native code] }

#### characterManager (variable)

@fileoverview キャラクター管理のためのAPIエンドポイント@description このファイルはキャラクター管理のためのREST APIエンドポイントを実装しています。GET リクエストでキャラクターリストの取得、POST リクエストで新しいキャラクターの作成が可能です。@requires NextResponse - Next.jsのレスポンスオブジェクト@requires CharacterManager - キャラクター管理を行うクラス@requires logger - ロギング機能@requires CharacterType - キャラクタータイプの型定義@dependency 各キャラクターはタイプ(MAIN/SUB/MOB)によって分類され、ステータス(active/inactive)を持ちます@dependency レスポンスは常に { success: boolean, data?: any, error?: { code: string, message: string } } の形式で返されます/

import { NextResponse } from 'next/server';
import { CharacterManager } from '@/lib/characters/manager';
import { logger } from '@/lib/utils/logger';
import { CharacterType } from '@/types/characters';

/**アプリケーション内で使用するシングルトンのキャラクターマネージャーインスタンス@constant@type {CharacterManager}

**@constructor:** function Object() { [native code] }

#### GET (function)

キャラクターリストを取得するAPIエンドポイントHTTP GETメソッドに対応し、以下のクエリパラメータをサポートします:- type: キャラクタータイプによるフィルタリング（MAIN, SUB, MOBのいずれか）- status: アクティブ状態によるフィルタリング（active, inactiveのいずれか）- page: ページネーション用ページ番号（デフォルト: 1）- limit: 1ページあたりの件数（デフォルト: 20）@async@function GET@param {Request} request - HTTPリクエストオブジェクト@returns {Promise<NextResponse>} JSONレスポンス  - 成功時: { success: true, data: { characters: Character[], pagination: Object } }  - エラー時: { success: false, error: { code: string, message: string } }@example// 成功レスポンスの例{  "success": true,  "data": {    "characters": [...],    "pagination": {      "page": 1,      "limit": 20,      "total": 42,      "pages": 3    }  }}@throws {400} - 無効なキャラクタータイプが指定された場合@throws {500} - キャラクター取得処理で内部エラーが発生した場合

**@constructor:** function Object() { [native code] }

#### POST (function)

新しいキャラクターを作成するAPIエンドポイントHTTP POSTメソッドに対応し、リクエストボディにキャラクター情報を含める必要があります。必須フィールド:- name: キャラクター名- type: キャラクタータイプ（MAIN, SUB, MOBのいずれか）- description: キャラクターの説明@async@function POST@param {Request} request - HTTPリクエストオブジェクト（JSONボディを含む）@returns {Promise<NextResponse>} JSONレスポンス  - 成功時: { success: true, data: { character: Character } }  - エラー時: { success: false, error: { code: string, message: string } }@example// リクエストボディの例{  "name": "新キャラクター",  "type": "SUB",  "description": "キャラクターの説明..."}@throws {400} - リクエストデータが不正またはバリデーションエラーの場合@throws {500} - キャラクター作成処理で内部エラーが発生した場合

**@constructor:** function Object() { [native code] }


---

### route.ts {#cnovel-automation-systemsrcappapicorrectionroutets}

**Path:** `C:/novel-automation-system/src/app/api/correction/route.ts`

@fileoverview src\app\api\correction\route.ts@descriptionチャプターの自動修正を行うAPIエンドポイント。このファイルはNext.jsのAPIルートとして機能し、チャプターの自動修正処理と修正履歴の取得機能を提供します。提供されるエンドポイント:- POST: チャプターの自動修正を実行- GET: チャプターの修正履歴と統計情報を取得@requires next/server@requires @/lib/correction/auto-correction@requires @/lib/utils/logger@requires @/lib/storage@requires @/lib/utils/yaml-helper@requires @/types/correction@requires @/types/chapters

**@constructor:** function Object() { [native code] }

#### correctionSystem (variable)

@fileoverview src\app\api\correction\route.ts@descriptionチャプターの自動修正を行うAPIエンドポイント。このファイルはNext.jsのAPIルートとして機能し、チャプターの自動修正処理と修正履歴の取得機能を提供します。提供されるエンドポイント:- POST: チャプターの自動修正を実行- GET: チャプターの修正履歴と統計情報を取得@requires next/server@requires @/lib/correction/auto-correction@requires @/lib/utils/logger@requires @/lib/storage@requires @/lib/utils/yaml-helper@requires @/types/correction@requires @/types/chapters/

import { NextResponse } from 'next/server';
import { AutoCorrectionSystem } from '@/lib/correction/auto-correction';
import { logger } from '@/lib/utils/logger';
import { storageProvider } from '@/lib/storage';
import { parseYaml, stringifyYaml } from '@/lib/utils/yaml-helper';
import { CorrectionHistoryEntry } from '@/types/correction';
import { Chapter } from '@/types/chapters';

/**自動修正システムのシングルトンインスタンスこのインスタンスはAPIエンドポイント間で共有され、チャプターの修正処理を行います@type {AutoCorrectionSystem}

**@constructor:** function Object() { [native code] }

#### POST (function)

POST APIハンドラー - チャプターの自動修正を実行@async@function POST@param {Request} request - HTTPリクエストオブジェクト@returns {Promise<NextResponse>} 修正結果を含むJSON応答@descriptionチャプターIDまたはコンテンツを受け取り、自動修正システムを使用してチャプターの修正を行います。ドライラン（修正のシミュレーション）もサポートしています。@example// リクエストボディ{  "chapterId": "123",  // チャプターID（任意、contentと排他）  "content": "...",    // チャプターコンテンツ（任意、chapterIdと排他）  "dryRun": true       // ドライラン実行フラグ（任意）}// 成功レスポンス{  "success": true,  "data": {    "originalChapter": { ... },    "correctedChapter": { ... },    "issues": [ ... ],    "corrections": [ ... ],    "statistics": { ... }  }}

**@constructor:** function Object() { [native code] }

#### GET (function)

GET APIハンドラー - チャプターの修正情報を取得@async@function GET@param {Request} request - HTTPリクエストオブジェクト@returns {Promise<NextResponse>} チャプター情報と修正統計を含むJSON応答@descriptionチャプターIDを受け取り、そのチャプターの修正履歴や統計情報を取得します。修正履歴からは合計修正数、最終修正日時、修正タイプの集計、修正履歴の時系列を提供します。@example// URLクエリパラメータ// GET /api/correction?chapterId=123// 成功レスポンス{  "success": true,  "data": {    "chapter": { ... },    "correctionStats": {      "totalCorrections": 10,      "lastCorrected": "2023-05-01T12:34:56Z",      "issueTypes": { ... },      "history": [ ... ]    }  }}

**@constructor:** function Object() { [native code] }

#### loadChapter (function)

YAMLファイルからチャプターをロードする@async@function loadChapter@param {string} chapterId - ロードするチャプターのID@returns {Promise<Chapter | null>} ロードされたチャプター、存在しない場合はnull@description指定されたIDに対応するチャプターをYAMLファイルからロードします。ファイルパスは `chapters/chapter-${chapterId}.yaml` の形式で、ストレージプロバイダーを通じてアクセスします。

**@constructor:** function Object() { [native code] }

#### saveChapter (function)

チャプターをYAMLファイルに保存する@async@function saveChapter@param {string} chapterId - 保存するチャプターのID@param {Chapter} chapter - 保存するチャプターオブジェクト@returns {Promise<boolean>} 保存が成功したかどうか@description指定されたチャプターをYAMLファイルに保存します。ファイルパスは `chapters/chapter-${chapterId}.yaml` の形式で、保存前にチャプターの更新日時を現在時刻に更新します。

**@constructor:** function Object() { [native code] }

#### calculateChangePercentage (function)

テキストの変更率を計算する@function calculateChangePercentage@param {string} original - 元のテキスト@param {string} corrected - 修正後のテキスト @returns {number} 変更率（パーセンテージ）@description元のテキストと修正後のテキストの差異を計算し、変更率をパーセンテージで返します。現実装では文字数の変化率を計算しています。

**@constructor:** function Object() { [native code] }

#### getCorrectionTypeCounts (function)

修正タイプごとのカウントを取得する@function getCorrectionTypeCounts@param {CorrectionHistoryEntry[]} history - 修正履歴エントリーの配列@returns {Record<string, number>} 修正タイプをキー、カウントを値とするオブジェクト@description修正履歴エントリーから、各修正タイプの出現回数を集計します。結果は修正タイプをキー、出現回数を値とするオブジェクトです。

**@constructor:** function Object() { [native code] }


---

### route.ts {#cnovel-automation-systemsrcappapieditorcollaborationroutets}

**Path:** `C:/novel-automation-system/src/app/api/editor/collaboration/route.ts`

@fileoverview src/app/api/editor/collaboration/route.ts@description 協調編集機能のためのNextJS API Routeハンドラーを実装したファイル。このAPIは複数ユーザー間でのリアルタイム文書編集を可能にする協調編集システムのバックエンドエンドポイントを提供します。セッションの開始/終了、編集の適用、ドキュメント保存、コンフリクト解決、カーソル位置更新などの機能をサポートします。@requires next/server@requires @/lib/editor/collaborative-editor@requires @/lib/editor/storage-adapter@requires @/lib/utils/error-handler@requires @/lib/utils/id-generator@requires @/lib/storage

**@constructor:** function Object() { [native code] }

#### storageAdapter (variable)

@fileoverview src/app/api/editor/collaboration/route.ts@description 協調編集機能のためのNextJS API Routeハンドラーを実装したファイル。このAPIは複数ユーザー間でのリアルタイム文書編集を可能にする協調編集システムのバックエンドエンドポイントを提供します。セッションの開始/終了、編集の適用、ドキュメント保存、コンフリクト解決、カーソル位置更新などの機能をサポートします。@requires next/server@requires @/lib/editor/collaborative-editor@requires @/lib/editor/storage-adapter@requires @/lib/utils/error-handler@requires @/lib/utils/id-generator@requires @/lib/storage/

import { NextRequest, NextResponse } from 'next/server';
import { CollaborativeEditor, Document, EditorEdit, Resolution, ResolutionStrategy } from '@/lib/editor/collaborative-editor';
import { EditorStorageAdapter } from '@/lib/editor/storage-adapter';
import { logError } from '@/lib/utils/error-handler';
import { generateId } from '@/lib/utils/id-generator';
import { storageProvider } from '@/lib/storage';

/**ストレージアダプターの初期化CollaborativeEditorに文書の永続化を提供するストレージアダプターのインスタンス@constant@type {EditorStorageAdapter}

**@constructor:** function Object() { [native code] }

#### collaborativeEditor (variable)

協調エディタの初期化複数ユーザーによる同時編集機能を提供するエディタのインスタンス@constant@type {CollaborativeEditor}

**@constructor:** function Object() { [native code] }

#### POST (function)

POST handler for collaboration actions協調編集アクションのためのPOSTメソッドハンドラー@async@function POST@param {NextRequest} request - Next.jsリクエストオブジェクト@returns {Promise<NextResponse>} JSONレスポンス@throws {Error} リクエスト処理中のエラー@description各種協調編集アクション（セッション開始/終了、編集適用、保存、解決策適用など）を処理するためのハンドラー。リクエストのactionフィールドに基づいて適切なサブハンドラーにルーティングします。サポートされるアクション:- START_SESSION: 新しい編集セッションを開始- END_SESSION: 既存のセッションを終了- APPLY_EDIT: 単一の編集を適用- APPLY_EDITS: 複数の編集をバッチで適用- SAVE_DOCUMENT: ドキュメントを保存- APPLY_RESOLUTION: コンフリクト解決を適用- UPDATE_CURSOR: カーソル位置を更新- REVERT_VERSION: 以前のバージョンに戻す

**@constructor:** function Object() { [native code] }

#### GET (function)

GET handler for collaboration status協調編集状態取得のためのGETメソッドハンドラー@async@function GET@param {NextRequest} request - Next.jsリクエストオブジェクト@returns {Promise<NextResponse>} JSONレスポンス@throws {Error} リクエスト処理中のエラー@descriptionセッション情報やドキュメントバージョン情報を取得するためのハンドラー。クエリパラメータに基づいて適切なサブハンドラーにルーティングします。サポートされるクエリパラメータ:- sessionId: 特定のセッション情報を取得- documentId & versions: ドキュメントのバージョン情報を取得

**@constructor:** function Object() { [native code] }

#### handleStartSession (function)

新しい編集セッションを開始する@async@function handleStartSession@param {any} data - リクエストデータ（documentIdとeditorIdを含む）@returns {Promise<NextResponse>} セッション情報を含むJSONレスポンス@description指定されたドキュメントとエディタIDに対して新しい編集セッションを開始します。ドキュメントが存在しない場合は404エラーを返します。

**@constructor:** function Object() { [native code] }

#### handleEndSession (function)

セッションを終了する@async@function handleEndSession@param {any} data - リクエストデータ（sessionIdを含む）@returns {Promise<NextResponse>} 処理結果を含むJSONレスポンス@description指定されたセッションを終了し、関連リソースをクリーンアップします。セッションが存在しない場合は404エラーを返します。

**@constructor:** function Object() { [native code] }

#### handleApplyEdit (function)

単一の編集操作を適用する@async@function handleApplyEdit@param {any} data - リクエストデータ（sessionIdとeditを含む）@returns {Promise<NextResponse>} 処理結果を含むJSONレスポンス@description指定されたセッションに対して単一の編集操作を適用します。編集構造を検証し、コンフリクトがある場合はコンフリクト情報を返します。

**@constructor:** function Object() { [native code] }

#### handleApplyEdits (function)

複数の編集操作をバッチで適用する@async@function handleApplyEdits@param {any} data - リクエストデータ（sessionIdとedits配列を含む）@returns {Promise<NextResponse>} 処理結果を含むJSONレスポンス@description指定されたセッションに対して複数の編集操作をバッチで適用します。全ての編集構造を検証し、コンフリクトがある場合はコンフリクト情報を返します。

**@constructor:** function Object() { [native code] }

#### handleSaveDocument (function)

ドキュメントを保存する@async@function handleSaveDocument@param {any} data - リクエストデータ（sessionIdを含む）@returns {Promise<NextResponse>} 処理結果と更新されたドキュメントを含むJSONレスポンス@description指定されたセッションのドキュメント変更を永続化します。セッションが存在しない場合は404エラーを返します。

**@constructor:** function Object() { [native code] }

#### handleApplyResolution (function)

コンフリクト解決を適用する@async@function handleApplyResolution@param {any} data - リクエストデータ（sessionIdとstrategies配列を含む）@returns {Promise<NextResponse>} 処理結果と解決後のドキュメントを含むJSONレスポンス@description指定されたセッションに対してコンフリクト解決戦略を適用します。全ての解決戦略を検証し、セッションが存在しない場合は404エラーを返します。

**@constructor:** function Object() { [native code] }

#### handleUpdateCursor (function)

カーソル位置を更新する@async@function handleUpdateCursor@param {any} data - リクエストデータ（sessionId、editorId、position、selectionを含む）@returns {Promise<NextResponse>} 処理結果を含むJSONレスポンス@description指定されたセッションのエディタカーソル位置とテキスト選択情報を更新します。この情報は協調編集時に他のエディタに表示されるカーソル位置の更新に使用されます。

**@constructor:** function Object() { [native code] }

#### handleRevertVersion (function)

以前のバージョンに戻す@async@function handleRevertVersion@param {any} data - リクエストデータ（sessionIdとversionを含む）@returns {Promise<NextResponse>} 処理結果と元に戻されたドキュメントを含むJSONレスポンス@description指定されたセッションのドキュメントを特定のバージョンに戻します。セッションが存在しない場合は404エラーを返します。

**@constructor:** function Object() { [native code] }

#### handleGetSession (function)

セッション情報を取得する@async@function handleGetSession@param {string} sessionId - セッションID@returns {Promise<NextResponse>} セッション情報とアクティブエディタを含むJSONレスポンス@description指定されたセッションの詳細情報と、同じドキュメントで作業している他のアクティブなエディタの情報を取得します。セッションが存在しない場合は404エラーを返します。

**@constructor:** function Object() { [native code] }

#### handleGetVersionInfo (function)

バージョン情報を取得する@async@function handleGetVersionInfo@param {string} documentId - ドキュメントID@returns {Promise<NextResponse>} バージョン情報を含むJSONレスポンス@description指定されたドキュメントのバージョン履歴情報を取得します。ドキュメントが存在しない場合は404エラーを返します。

**@constructor:** function Object() { [native code] }

#### fetchDocument (function)

ドキュメントを取得する@async@function fetchDocument@param {string} documentId - ドキュメントID@returns {Promise<Document | null>} ドキュメントオブジェクトまたはnull@description指定されたIDのドキュメントを取得します。まず協調エディタから最新バージョンを取得し、なければストレージから読み込み、それも失敗した場合はデフォルトの空ドキュメントを作成します。

**@constructor:** function Object() { [native code] }

#### validateEdit (function)

編集操作の構造を検証する@function validateEdit@param {any} edit - 検証する編集操作@returns {boolean} 検証結果（有効な場合はtrue）@description編集操作の構造が有効かどうかを検証します。編集タイプと位置が必須で、タイプに応じて必要なフィールド（text、deleteLength、replaceTarget）を検証します。

**@constructor:** function Object() { [native code] }

#### validateResolutionStrategy (function)

解決戦略の構造を検証する@function validateResolutionStrategy@param {any} strategy - 検証する解決戦略@returns {boolean} 検証結果（有効な場合はtrue）@descriptionコンフリクト解決戦略の構造が有効かどうかを検証します。コンフリクトインデックスと戦略タイプが必須です。

**@constructor:** function Object() { [native code] }

#### formatLastActive (function)

最終アクティブ時間をフォーマットする@function formatLastActive@param {Date} lastActive - 最終アクティブ時間@returns {string} フォーマットされた文字列（例: "just now", "5m ago", "2h ago", "3d ago"）@description最終アクティブ時間を現在時刻との差に基づいて人間が読みやすい形式にフォーマットします。分、時間、日単位での表示に対応します。

**@constructor:** function Object() { [native code] }


---

### route.ts {#cnovel-automation-systemsrcappapieditorfeedbackroutets}

**Path:** `C:/novel-automation-system/src/app/api/editor/feedback/route.ts`

@fileoverview 編集者フィードバック処理と履歴取得のためのAPIルートハンドラー@file src/app/api/editor/feedback/route.ts@description このファイルはNext.jsのAPIルートハンドラーを実装し、編集者からのフィードバックを管理します。             新規フィードバックの送信（処理および分類）と、オプションの時間範囲フィルタリングによる             履歴フィードバックデータの取得のためのエンドポイントを提供します。@requires next/server.NextResponse@requires @/lib/editor/feedback-processor.FeedbackProcessor@requires @/types/editor.FeedbackType

**@constructor:** function Object() { [native code] }

#### feedbackProcessor (variable)

@fileoverview 編集者フィードバック処理と履歴取得のためのAPIルートハンドラー@file src/app/api/editor/feedback/route.ts@description このファイルはNext.jsのAPIルートハンドラーを実装し、編集者からのフィードバックを管理します。             新規フィードバックの送信（処理および分類）と、オプションの時間範囲フィルタリングによる             履歴フィードバックデータの取得のためのエンドポイントを提供します。@requires next/server.NextResponse@requires @/lib/editor/feedback-processor.FeedbackProcessor@requires @/types/editor.FeedbackType/

import { NextResponse } from 'next/server';
import { FeedbackProcessor } from '@/lib/editor/feedback-processor';

/**すべてのAPIリクエストで使用されるFeedbackProcessorのシングルトンインスタンス@type {FeedbackProcessor}

**@constructor:** function Object() { [native code] }

#### POST (function)

編集者フィードバック送信のためのPOSTリクエストを処理@async@function POST@param {Request} request - HTTPリクエストオブジェクト@returns {Promise<NextResponse>} 処理結果またはエラー情報を含むJSON応答@description 編集者フィードバックの送信を処理します。このエンドポイントは： - 必須フィールド（chapterId、type、content）を検証 - メタデータ（timestamp、editorId）を追加 - FeedbackProcessorシステムを通じてフィードバックを処理 - 処理結果または適切なエラーレスポンスを返却@example// 有効なリクエストボディの例：{  "chapterId": "chapter-42",  "type": "CHARACTER",  "content": "主人公のキャラクター一貫性に問題あり",  "rating": 3,  "suggestions": ["参考として第2章を再確認することを検討"],  "editorId": "editor-1"  // オプション、デフォルトは'anonymous'}@example// 成功レスポンスの構造：{  "success": true,  "result": {    "acknowledged": true,    "classification": {...},    "actionItems": [...],    "impact": {...}  }}@throws {400} 必須フィールドが不足している場合@throws {500} フィードバック処理が失敗した場合

**@constructor:** function Object() { [native code] }

#### GET (function)

フィードバック履歴取得のためのGETリクエストを処理@async@function GET@param {Request} request - HTTPリクエストオブジェクト@returns {Promise<NextResponse>} フィードバック履歴またはエラー情報を含むJSON応答@description FeedbackProcessorからフィードバック履歴を取得します。このエンドポイントは： - オプションのtimeRangeクエリパラメータ（例：'today'、'week'、'month'）を抽出 - timeRangeに基づいてフィルタリングされたフィードバック履歴を取得 - 履歴データまたは適切なエラーレスポンスを返却@example// リクエスト例：GET /api/editor/feedback?timeRange=week@example// 成功レスポンスの構造：{  "success": true,  "history": [    {      "feedback": {...},      "classification": {...},      "actionItems": [...],      "actionStatus": {...},      "learningStatus": {...}    },    ...  ]}@throws {500} フィードバック履歴の取得に失敗した場合

**@constructor:** function Object() { [native code] }


---

### route.ts {#cnovel-automation-systemsrcappapieditorinterventionsroutets}

**Path:** `C:/novel-automation-system/src/app/api/editor/interventions/route.ts`

@fileoverview src/app/api/editor/interventions/route.ts@description エディタ介入を管理するためのAPIルートハンドラー。このファイルはNext.jsのAPIルートハンドラーを提供し、介入リクエストの処理と介入履歴の取得を行います。このファイルは以下の2つのHTTPエンドポイントを実装しています：- POST: 新しい介入リクエストを処理- GET: オプションでフィルタリング可能な介入履歴を取得@requires next/server@requires @/lib/editor/intervention-system@requires @/lib/utils/error-handlerこのAPIはInterventionSystemと連携して、エディタ環境の様々な側面（キャラクター、プロット、メモリなど）を変更できるコマンドを実行します。

**@constructor:** function Object() { [native code] }

#### POST (function)

@fileoverview src/app/api/editor/interventions/route.ts@description エディタ介入を管理するためのAPIルートハンドラー。このファイルはNext.jsのAPIルートハンドラーを提供し、介入リクエストの処理と介入履歴の取得を行います。このファイルは以下の2つのHTTPエンドポイントを実装しています：- POST: 新しい介入リクエストを処理- GET: オプションでフィルタリング可能な介入履歴を取得@requires next/server@requires @/lib/editor/intervention-system@requires @/lib/utils/error-handlerこのAPIはInterventionSystemと連携して、エディタ環境の様々な側面（キャラクター、プロット、メモリなど）を変更できるコマンドを実行します。/

import { NextRequest, NextResponse } from 'next/server';
import { InterventionSystem } from '@/lib/editor/intervention-system';
import { logError } from '@/lib/utils/error-handler';

// 介入システムのインスタンスを作成
const interventionSystem = new InterventionSystem();

/**POSTを介して送信された介入リクエストを処理します。このハンドラーは受信リクエストボディを検証し、必要なフィールド（type、target、command）が含まれていることを確認した後、実行のためにInterventionSystemにリクエストを渡します。介入結果はJSONとして返されます。@param {NextRequest} request - 介入データを含むNext.jsリクエストオブジェクト@returns {Promise<NextResponse>} 介入結果またはエラー詳細を含むJSON応答@example// リクエストボディの例：// {//   "type": "CHARACTER",  // 介入タイプ//   "target": "CHARACTER", // 介入ターゲット//   "command": "キャラクターを追加"  // 自然言語コマンド// }@throws 必要なフィールドが不足している場合は400レスポンスを返します@throws 処理中に何らかのエラーが発生した場合は500レスポンスを返します

**@constructor:** function Object() { [native code] }

#### GET (function)

GETを介して介入履歴を取得します。このハンドラーはURL検索パラメータを処理して、介入履歴レコードをフィルタリングおよび制限します。履歴はInterventionSystemから取得され、JSON応答として返されます。@param {NextRequest} request - 検索パラメータを含むNext.jsリクエストオブジェクト@returns {Promise<NextResponse>} フィルタリングされた介入履歴を含むJSON応答@example// URL例: /api/editor/interventions?limit=10&types=CHARACTER,PLOT// - limit: 返すレコードの最大数// - types: フィルタリングする介入タイプのカンマ区切りリスト@throws 処理中に何らかのエラーが発生した場合は500レスポンスを返します

**@constructor:** function Object() { [native code] }


---

### route.ts {#cnovel-automation-systemsrcappapieditorlearningroutets}

**Path:** `C:/novel-automation-system/src/app/api/editor/learning/route.ts`

@fileoverview 編集者フィードバックの履歴から学習インサイトにアクセスするためのAPIエンドポイント。@file src/app/api/editor/learning/route.ts@description このファイルは、履歴フィードバックデータから学習インサイトを取得するNext.js APIルートを定義しています。LearningEngineを活用して、収集されたフィードバック履歴に基づいてパターンを分析し、潜在的な改善点を特定し、将来の問題を予測します。このエンドポイントは、編集者インターフェースに実用的なインサイトと学習ベースの推奨事項を提供し、時間の経過とともにコンテンツの品質と一貫性を向上させることを目的としています。@requires next/server@requires @/lib/editor/learning-engine

**@constructor:** function Object() { [native code] }

#### learningEngine (variable)

@fileoverview 編集者フィードバックの履歴から学習インサイトにアクセスするためのAPIエンドポイント。@file src/app/api/editor/learning/route.ts@description このファイルは、履歴フィードバックデータから学習インサイトを取得するNext.js APIルートを定義しています。LearningEngineを活用して、収集されたフィードバック履歴に基づいてパターンを分析し、潜在的な改善点を特定し、将来の問題を予測します。このエンドポイントは、編集者インターフェースに実用的なインサイトと学習ベースの推奨事項を提供し、時間の経過とともにコンテンツの品質と一貫性を向上させることを目的としています。@requires next/server@requires @/lib/editor/learning-engine/

import { NextResponse } from 'next/server';
import { LearningEngine } from '@/lib/editor/learning-engine';

/**フィードバック履歴の処理に使用されるLearningEngineのシングルトンインスタンス。

**@constructor:** function Object() { [native code] }

#### GET (function)

学習インサイトエンドポイントのGETハンドラー。@async@function GET@description 学習エンジンを通じて履歴フィードバックデータを処理することで学習インサイトを取得します。このメソッドは、過去の編集者フィードバックからパターン、改善提案、予測を抽出し、実用的なインサイトを提供します。@returns {Promise<NextResponse>} 以下を含むNext.js Responseオブジェクト：  - 成功時: `success: true`と以下を含む`result`オブジェクトを持つJSON:    - patterns: フィードバック履歴から認識されたパターンの配列    - improvements: 優先度付きのコンポーネント改善提案の配列    - predictions: 確率と予防戦略を持つ潜在的な将来の問題の配列  - 失敗時: エラー詳細と500ステータスコードを持つJSON@example// 成功時のレスポンス構造:{  success: true,  result: {    patterns: [      {        type: "CONSISTENCY_ISSUE",        description: "キャラクターまたはプロットの一貫性に関する問題",        confidence: 0.8,        parameters: { target: "CHARACTER" }      }    ],    improvements: [      {        component: "CHARACTER_MANAGER",        description: "キャラクターの一貫性チェック機能を強化する",        priority: "HIGH"      }    ],    predictions: [      {        issue: "キャラクター設定の矛盾",        probability: 0.75,        prevention: "キャラクターデータベースの統合的な管理"      }    ]  }}@throws 学習プロセスが失敗した場合、エラー詳細と共に500ステータスコードを返します

**@constructor:** function Object() { [native code] }


---

### route.ts {#cnovel-automation-systemsrcappapiforeshadowingidroutets}

**Path:** `C:/novel-automation-system/src/app/api/foreshadowing/[id]/route.ts`

@fileoverview 伏線（foreshadowing）のID指定による操作を提供するAPIエンドポイント@description このファイルでは特定IDの伏線の取得(GET)、更新(PUT)、削除(DELETE)機能を実装しています@requires next/server@requires @/lib/memory@requires @/lib/utils/logger@requires @/lib/utils/error-handler

**@constructor:** function Object() { [native code] }

#### GET (function)

@fileoverview 伏線（foreshadowing）のID指定による操作を提供するAPIエンドポイント@description このファイルでは特定IDの伏線の取得(GET)、更新(PUT)、削除(DELETE)機能を実装しています@requires next/server@requires @/lib/memory@requires @/lib/utils/logger@requires @/lib/utils/error-handler/

import { NextRequest, NextResponse } from 'next/server';
import { memoryManager } from '@/lib/memory'; // 正しいインポートパス
import { logger } from '@/lib/utils/logger';
import { logError } from '@/lib/utils/error-handler';

/**特定IDの伏線を取得するGETエンドポイント@async@function GET@param {NextRequest} request - 受信したHTTPリクエスト@param {Object} params - URLパラメータ@param {string} params.id - 取得する伏線のID@returns {Promise<NextResponse>} 成功時は取得した伏線データを含むレスポンス、失敗時はエラー情報を含むレスポンス@example// 成功時のレスポンス構造:{  "success": true,  "data": {    "id": "fs-1-abcd1234",    "description": "主人公の過去の秘密",    "chapter_introduced": 3,    "resolved": false,    "urgency": "medium",    "createdTimestamp": "2023-12-01T12:34:56.789Z",    "updatedTimestamp": "2023-12-01T12:34:56.789Z"  }}// 404エラー時のレスポンス構造:{  "success": false,  "error": {    "code": "NOT_FOUND",    "message": "Foreshadowing with ID fs-1-abcd1234 not found"  }}

**@constructor:** function Object() { [native code] }

#### PUT (function)

特定IDの伏線を更新するPUTエンドポイント@async@function PUT@param {NextRequest} request - 更新データを含むHTTPリクエスト@param {Object} params - URLパラメータ@param {string} params.id - 更新する伏線のID@returns {Promise<NextResponse>} 成功時は更新後の伏線データを含むレスポンス、失敗時はエラー情報を含むレスポンス@example// リクエスト本文の例:{  "description": "更新された伏線の説明",  "resolved": true,  "resolution_chapter": 10}// 成功時のレスポンス構造:{  "success": true,  "data": {    "id": "fs-1-abcd1234",    "description": "更新された伏線の説明",    "chapter_introduced": 3,    "resolved": true,    "resolution_chapter": 10,    "urgency": "medium",    "createdTimestamp": "2023-12-01T12:34:56.789Z",    "updatedTimestamp": "2023-12-02T10:11:12.345Z"  }}

**@constructor:** function Object() { [native code] }

#### DELETE (function)

特定IDの伏線を削除するDELETEエンドポイント@async@function DELETE@param {NextRequest} request - 受信したHTTPリクエスト@param {Object} params - URLパラメータ@param {string} params.id - 削除する伏線のID@returns {Promise<NextResponse>} 成功時は削除成功メッセージを含むレスポンス、失敗時はエラー情報を含むレスポンス@example// 成功時のレスポンス構造:{  "success": true,  "message": "Foreshadowing fs-1-abcd1234 successfully deleted"}// エラー時のレスポンス構造:{  "success": false,  "error": {    "code": "DELETE_ERROR",    "message": "Failed to delete foreshadowing"  }}

**@constructor:** function Object() { [native code] }


---

### route.ts {#cnovel-automation-systemsrcappapiforeshadowingresolveroutets}

**Path:** `C:/novel-automation-system/src/app/api/foreshadowing/resolve/route.ts`

@fileoverview 伏線解決APIエンドポイント@description 物語内の伏線（foreshadowing）を解決済み状態に更新するためのAPIエンドポイント。クライアントからのPOSTリクエストを受け取り、memoryManagerの長期記憶システムを使用して伏線の解決状態を更新する。@requires next/server@requires @/lib/memory@requires @/lib/utils/logger@requires @/lib/utils/error-handler

**@constructor:** function Object() { [native code] }

#### POST (function)

@fileoverview 伏線解決APIエンドポイント@description 物語内の伏線（foreshadowing）を解決済み状態に更新するためのAPIエンドポイント。クライアントからのPOSTリクエストを受け取り、memoryManagerの長期記憶システムを使用して伏線の解決状態を更新する。@requires next/server@requires @/lib/memory@requires @/lib/utils/logger@requires @/lib/utils/error-handler/

import { NextRequest, NextResponse } from 'next/server';
import { memoryManager } from '@/lib/memory'; // 正しいインポートパス
import { logger } from '@/lib/utils/logger';
import { logError } from '@/lib/utils/error-handler';

/**POSTリクエストハンドラー - 伏線解決処理を実行する@async@function POST@param {NextRequest} request - Next.jsのリクエストオブジェクト@returns {Promise<NextResponse>} JSONレスポンス@throws {Error} 伏線解決中にエラーが発生した場合@example// リクエスト例:{  "id": "fs-1-a1b2c3d4",        // 伏線ID  "resolutionChapter": 5,        // 解決されたチャプター番号  "resolutionDescription": "主人公が古い手紙を発見し、謎が明らかになった"  // 解決の説明}// 成功時のレスポンス例:{  "success": true,  "message": "Foreshadowing fs-1-a1b2c3d4 successfully resolved"}// バリデーションエラー時のレスポンス例:{  "success": false,  "error": {    "code": "VALIDATION_ERROR",    "message": "ID, resolutionChapter and resolutionDescription are required"  }}// 実行時エラー時のレスポンス例:{  "success": false,  "error": {    "code": "RESOLVE_ERROR",    "message": "Failed to resolve foreshadowing: Foreshadowing with ID \"fs-1-a1b2c3d4\" not found"  }}

**@constructor:** function Object() { [native code] }


---

### route.ts {#cnovel-automation-systemsrcappapiforeshadowingroutets}

**Path:** `C:/novel-automation-system/src/app/api/foreshadowing/route.ts`

@fileoverview 伏線(foreshadowing)データのAPI操作を提供するエンドポイント@description このファイルでは、物語の伏線データを取得および作成するためのREST APIエンドポイントを提供します。GET: 既存の伏線データの一覧を取得しますPOST: 新しい伏線データを作成します@requires next/server@requires @/lib/memory@requires @/lib/foreshadowing@requires @/lib/utils/logger@requires @/lib/utils/error-handler@dependency memoryManager - 記憶管理システムのメインインスタンス@dependency longTermMemory - 長期記憶を管理するコンポーネント

**@constructor:** function Object() { [native code] }

#### GET (function)

@fileoverview 伏線(foreshadowing)データのAPI操作を提供するエンドポイント@description このファイルでは、物語の伏線データを取得および作成するためのREST APIエンドポイントを提供します。GET: 既存の伏線データの一覧を取得しますPOST: 新しい伏線データを作成します@requires next/server@requires @/lib/memory@requires @/lib/foreshadowing@requires @/lib/utils/logger@requires @/lib/utils/error-handler@dependency memoryManager - 記憶管理システムのメインインスタンス@dependency longTermMemory - 長期記憶を管理するコンポーネント/

import { NextRequest, NextResponse } from 'next/server';
import { memoryManager } from '@/lib/memory';
import { foreshadowingManager } from '@/lib/foreshadowing';
import { logger } from '@/lib/utils/logger';
import { logError } from '@/lib/utils/error-handler';

/**伏線データを取得するGETエンドポイント@async@function GET@param {NextRequest} request - Next.jsリクエストオブジェクト@returns {Promise<NextResponse>} 伏線データまたはエラー情報を含むJSONレスポンス@example// 成功時のレスポンス構造:{  "success": true,  "data": [    {      "id": "fs-1-abc12345",      "description": "主人公が森で見つけた謎の鍵",      "chapter_introduced": 3,      "resolved": false,      "urgency": "medium",      "createdTimestamp": "2025-04-01T12:00:00Z",      "updatedTimestamp": "2025-04-01T12:00:00Z"    },    // 他の伏線データ...  ]}// エラー時のレスポンス構造:{  "success": false,  "error": {    "code": "FETCH_ERROR",    "message": "Failed to fetch foreshadowing data"  }}

**@constructor:** function Object() { [native code] }

#### POST (function)

新しい伏線データを作成するPOSTエンドポイント@async@function POST@param {NextRequest} request - Next.jsリクエストオブジェクト (伏線データを含むJSONボディが必要)@returns {Promise<NextResponse>} 作成された伏線データまたはエラー情報を含むJSONレスポンス@example// リクエストボディの例:{  "description": "主人公が図書館で見つけた古い日記",  "chapter_introduced": 5,  "urgency": "high",  "context": "主人公が過去の秘密を探る手がかりとなる",  "plannedResolution": 12,  "relatedCharacters": ["主人公", "図書館司書"]}// 成功時のレスポンス構造:{  "success": true,  "data": {    "id": "fs-2-def67890",    "description": "主人公が図書館で見つけた古い日記",    "chapter_introduced": 5,    "resolved": false,    "urgency": "high",    "context": "主人公が過去の秘密を探る手がかりとなる",    "plannedResolution": 12,    "relatedCharacters": ["主人公", "図書館司書"],    "createdTimestamp": "2025-04-05T14:30:00Z",    "updatedTimestamp": "2025-04-05T14:30:00Z"  }}// バリデーションエラー時のレスポンス構造:{  "success": false,  "error": {    "code": "VALIDATION_ERROR",    "message": "Description and chapter_introduced are required"  }}// その他エラー時のレスポンス構造:{  "success": false,  "error": {    "code": "CREATE_ERROR",    "message": "Failed to create foreshadowing"  }}

**@constructor:** function Object() { [native code] }


---

### route.ts {#cnovel-automation-systemsrcappapiforeshadowingsuggestroutets}

**Path:** `C:/novel-automation-system/src/app/api/foreshadowing/suggest/route.ts`

@fileoverview 小説のチャプターコンテンツから伏線を生成・提案するAPIエンドポイント@description このファイルはチャプター内容を分析し、新しい伏線を自動生成するとともに、既存の伏線の解決提案を返すAPIエンドポイントを定義しています。foreshadowingManagerを使用してチャプターの分析と処理を行います。@requires next/server@requires @/lib/foreshadowing@requires @/lib/utils/logger@requires @/lib/utils/error-handler

**@constructor:** function Object() { [native code] }

#### POST (function)

@fileoverview 小説のチャプターコンテンツから伏線を生成・提案するAPIエンドポイント@description このファイルはチャプター内容を分析し、新しい伏線を自動生成するとともに、既存の伏線の解決提案を返すAPIエンドポイントを定義しています。foreshadowingManagerを使用してチャプターの分析と処理を行います。@requires next/server@requires @/lib/foreshadowing@requires @/lib/utils/logger@requires @/lib/utils/error-handler/

/**POSTリクエストを処理する関数チャプターコンテンツを受け取り、伏線の生成と解決提案を行います@async@param {NextRequest} request - クライアントからのリクエスト@returns {Promise<NextResponse>} 処理結果を含むJSON形式のレスポンス@example// リクエスト例:{  "chapterContent": "彼女は窓から見える遠くの山々を眺めながら、祖父の遺した古い鍵のことを思い出した。その鍵が開けるものは何なのか、まだ誰も知らなかった。",  "chapterNumber": 3,  "generateCount": 2}// 成功時のレスポンス例:{  "success": true,  "data": {    "generatedCount": 2,    "resolutionSuggestions": [      {        "foreshadowing": {          "id": "fs-12345",          "description": "祖父の遺した古い鍵",          "chapter_introduced": 1,          "resolved": false,          "urgency": "medium"        },        "chapterContent": "遺された鍵について触れられている部分",        "reason": "現在のチャプターでキャラクターが鍵について再度言及しており、解決に適している",        "confidence": 0.8      }    ]  }}// バリデーションエラー時のレスポンス例:{  "success": false,  "error": {    "code": "VALIDATION_ERROR",    "message": "chapterContent and chapterNumber are required"  }}// 処理エラー時のレスポンス例:{  "success": false,  "error": {    "code": "SUGGESTION_ERROR",    "message": "Failed to process foreshadowing suggestions"  }}

**@constructor:** function Object() { [native code] }


---

### route.ts {#cnovel-automation-systemsrcappapigenerationchapterroutets}

**Path:** `C:/novel-automation-system/src/app/api/generation/chapter/route.ts`

@fileoverview 小説の章生成と状態確認を担当するAPI Route@description このファイルは、AIを用いて小説の新しい章を生成するためのエンドポイントと生成システムの状態を確認するためのエンドポイントを提供します。POSTメソッドでは、クライアントからのリクエストを受け取り、GenerationEngineを使用して指定された章番号に基づいて小説の章を生成します。生成された章はValidationSystemによって品質検証され、検証に合格した場合または強制生成フラグが設定されている場合に結果を返します。また、生成された章はMemoryManagerを通じて記憶システムに保存され、物語の一貫性維持に利用されます。GETメソッドでは、生成システムとメモリシステムの現在の状態を取得できます。@requires next/server@requires @/lib/generation/engine@requires @/lib/memory/manager@requires @/lib/validation/system@requires @/types/generation@requires @/lib/utils/logger@requires @/types/validation@requires @/lib/utils/error-handler

**@constructor:** function Object() { [native code] }

#### POST (function)

@fileoverview 小説の章生成と状態確認を担当するAPI Route@description このファイルは、AIを用いて小説の新しい章を生成するためのエンドポイントと生成システムの状態を確認するためのエンドポイントを提供します。POSTメソッドでは、クライアントからのリクエストを受け取り、GenerationEngineを使用して指定された章番号に基づいて小説の章を生成します。生成された章はValidationSystemによって品質検証され、検証に合格した場合または強制生成フラグが設定されている場合に結果を返します。また、生成された章はMemoryManagerを通じて記憶システムに保存され、物語の一貫性維持に利用されます。GETメソッドでは、生成システムとメモリシステムの現在の状態を取得できます。@requires next/server@requires @/lib/generation/engine@requires @/lib/memory/manager@requires @/lib/validation/system@requires @/types/generation@requires @/lib/utils/logger@requires @/types/validation@requires @/lib/utils/error-handler/
import { NextRequest, NextResponse } from 'next/server';
import { GenerationEngine } from '@/lib/generation/engine';
import { MemoryManager } from '@/lib/memory/manager';
import { ValidationSystem } from '@/lib/validation/system';
import { GenerateChapterRequest, GenerateChapterResponse } from '@/types/generation';
import { logger } from '@/lib/utils/logger';
import { ValidationCheck } from '@/types/validation';
import { GenerationError, ValidationError, formatErrorResponse } from '@/lib/utils/error-handler';

// シングルトンインスタンス
const generationEngine = new GenerationEngine();
const memoryManager = new MemoryManager();
const validationSystem = new ValidationSystem();

/**章生成エンドポイントのPOSTリクエストを処理する関数@async@param {NextRequest} request - Next.jsリクエストオブジェクト@returns {Promise<NextResponse>} 生成結果またはエラー情報を含むJSONレスポンス@description この関数はクライアントからのPOSTリクエストを処理し、新しい小説の章を生成します。リクエストからチャプター番号と生成オプションを抽出し、パラメータのバリデーション（チャプター番号、目標文字数、テンション値、ペーシング値）を行った後、GenerationEngineを使用して章を生成します。生成された章はValidationSystemによって品質検証され、検証に合格するか強制生成フラグが有効な場合のみ結果を返します。生成された章はMemoryManagerによって記憶システムに統合されます。@throws {ValidationError} チャプター番号や生成パラメータが無効な場合@throws {GenerationError} 章の生成処理中にエラーが発生した場合@throws {Error} その他の予期しないエラーが発生した場合@example// リクエスト例:// POST /api/generation/chapter?chapterNumber=1{  "targetLength": 8000,  "forcedGeneration": false,  "overrides": {    "tension": 0.8,    "pacing": 0.6  }}// 成功時のレスポンス例:{  "success": true,  "data": {    "chapter": {      "id": "chapter-1",      "title": "第1章",      "chapterNumber": 1,      "content": "章の本文テキスト...",      "wordCount": 8000,      "createdAt": "2025-05-05T10:00:00Z",      "updatedAt": "2025-05-05T10:00:00Z",      "summary": "この章では主人公が...",      "scenes": [...],      "analysis": {...},      "metadata": {        "pov": "主人公",        "location": "東京",        "timeframe": "現代",        "emotionalTone": "希望に満ちた",        "qualityScore": 85      }    },    "metrics": {      "generationTime": 5000,      "qualityScore": 85,      "correctionCount": 0    }  }}// バリデーションエラー時のレスポンス例:{  "success": false,  "error": {    "code": "VALIDATION_ERROR",    "message": "Invalid chapter number"  }}// 品質検証失敗時のレスポンス例:{  "success": false,  "error": {    "code": "VALIDATION_FAILED",    "message": "Generated chapter failed validation",    "details": {      "qualityScore": 45,      "failedChecks": [        {          "name": "length",          "message": "文字数: 5000 (目標: 8000±20%)",          "severity": "HIGH"        }      ],      "potentialSolutions": "Try adjusting the generation parameters or use forcedGeneration:true"    }  }}// 生成エラー時のレスポンス例:{  "success": false,  "error": {    "code": "GENERATION_ERROR",    "message": "Failed to generate chapter"  }}

**@constructor:** function Object() { [native code] }

#### GET (function)

生成システムの状態確認用GETリクエストを処理する関数@async@param {NextRequest} request - Next.jsリクエストオブジェクト@returns {Promise<NextResponse>} システム状態情報を含むJSONレスポンス@description この関数はクライアントからのGETリクエストを処理し、生成システムとメモリシステムの現在の状態を取得して返します。GenerationEngineの状態（APIキーの有効性、使用モデル情報など）とMemoryManagerの状態（メモリシステムの初期化状態、各記憶層の情報など）を取得し、クライアントに提供します。@throws {Error} 状態取得処理中にエラーが発生した場合@example// リクエスト例:// GET /api/generation/chapter// 成功時のレスポンス例:{  "success": true,  "data": {    "generation": {      "apiKeyValid": true,      "model": "gemini-pro",      "maxRetries": 3    },    "memory": {      "initialized": true,      "shortTerm": {        "entryCount": 5,        "lastUpdateTime": "2025-05-05T10:00:00Z"      },      "midTerm": {        "entryCount": 2,        "lastUpdateTime": "2025-05-05T09:30:00Z",        "currentArc": {          "number": 1,          "name": "冒険の始まり"        }      },      "longTerm": {        "initialized": true,        "lastCompressionTime": "2025-05-04T18:00:00Z"      }    }  }}// エラー時のレスポンス例:{  "success": false,  "error": {    "code": "STATUS_ERROR",    "message": "Failed to get generation system status"  }}

**@constructor:** function Object() { [native code] }


---

### route.ts {#cnovel-automation-systemsrcappapigenerationcontextroutets}

**Path:** `C:/novel-automation-system/src/app/api/generation/context/route.ts`

@fileoverview 小説生成のためのコンテキスト情報を提供するAPIエンドポイント@description このファイルは小説生成システムのためのコンテキスト情報を取得するためのAPIエンドポイントを提供します。チャプター番号に基づいて、階層的記憶管理システムから各種コンテキスト情報（短期記憶、中期記憶、長期記憶、キャラクター状態、伏線情報など）を取得し、AIが小説を生成するために必要な情報を返します。詳細フラグによって、編集者向けの詳細情報と生成システム向けの簡易情報の2種類のレスポース形式を切り替えられます。@requires next/server@requires @/lib/generation/context-generator@requires @/types/generation@requires @/lib/utils/logger@requires @/lib/utils/error-handler@dependency ContextGenerator - コンテキスト生成を行うクラス。階層的記憶管理システムからデータを取得する@dependency logger - ログ記録用ユーティリティ@dependency ValidationError - バリデーションエラーを表現するエラークラス@dependency formatErrorResponse - エラーレスポンスをフォーマットするユーティリティ関数

**@constructor:** function Object() { [native code] }

#### GET (function)

@fileoverview 小説生成のためのコンテキスト情報を提供するAPIエンドポイント@description このファイルは小説生成システムのためのコンテキスト情報を取得するためのAPIエンドポイントを提供します。チャプター番号に基づいて、階層的記憶管理システムから各種コンテキスト情報（短期記憶、中期記憶、長期記憶、キャラクター状態、伏線情報など）を取得し、AIが小説を生成するために必要な情報を返します。詳細フラグによって、編集者向けの詳細情報と生成システム向けの簡易情報の2種類のレスポース形式を切り替えられます。@requires next/server@requires @/lib/generation/context-generator@requires @/types/generation@requires @/lib/utils/logger@requires @/lib/utils/error-handler@dependency ContextGenerator - コンテキスト生成を行うクラス。階層的記憶管理システムからデータを取得する@dependency logger - ログ記録用ユーティリティ@dependency ValidationError - バリデーションエラーを表現するエラークラス@dependency formatErrorResponse - エラーレスポンスをフォーマットするユーティリティ関数/

import { NextRequest, NextResponse } from 'next/server';
import { ContextGenerator } from '@/lib/generation/context-generator';
import { ContextQueryParams, ContextResponse } from '@/types/generation';
import { logger } from '@/lib/utils/logger';
import { ValidationError, formatErrorResponse } from '@/lib/utils/error-handler';

// シングルトンインスタンス
const contextGenerator = new ContextGenerator();

/**コンテキスト生成APIエンドポイント指定されたチャプター番号に基づいて小説生成に必要なコンテキスト情報を取得します。detailedフラグによって、返却される情報の詳細度を変更できます。@param {NextRequest} request - APIリクエスト@returns {Promise<NextResponse>} JSONレスポンス@throws {ValidationError} チャプター番号が無効（数値でない、または1未満）の場合@example// リクエスト例GET /api/generation/context?chapterNumber=3&detailed=false// 成功時のレスポンス (detailed=false){  "success": true,  "data": {    "chapterNumber": 3,    "worldSettings": "ファンタジー世界の設定...",    "storyContext": "# 現在のアーク: 主人公の旅立ち\n## 重要イベント:\n- 故郷の村が襲撃される (1章)\n# 最近のチャプター\n## チャプター2\n主人公が旅に出ることを決意する...",    "theme": "成長と友情",    "tone": "自然で読みやすい文体",    "narrativeStyle": "三人称視点、過去形",    "targetLength": 8000,    "tension": 0.65,    "pacing": 0.4,    "characterCount": 5,    "foreshadowingCount": 2  }}// 成功時のレスポンス (detailed=true){  "success": true,  "data": {    "shortTerm": { "chapters": [...] },    "midTerm": { "currentArc": {...}, "keyEvents": [...] },    "longTerm": { "worldSettings": "...", "theme": "...", "causalityMap": [...] },    "characterStates": [       { "name": "主人公名", "description": "...", "personality": "...", "goals": "...", "currentState": "..." },      ...    ],    "expressionConstraints": [...],    "storyContext": "...",    "worldSettings": "...",    "foreshadowing": ["前章で言及された謎の人物...", ...],    "theme": "成長と友情",    "tone": "自然で読みやすい文体",    "narrativeStyle": "三人称視点、過去形",    "tension": 0.65,    "pacing": 0.4  }}// エラー時のレスポンス{  "success": false,  "error": {    "code": "VALIDATION_ERROR",    "message": "Invalid chapter number"  }}

**@constructor:** function Object() { [native code] }


---

### route.ts {#cnovel-automation-systemsrcappapigenerationgenerateroutets}

**Path:** `C:/novel-automation-system/src/app/api/generation/generate/route.ts`

@fileoverview 小説の章生成と状態確認を担当するAPI Route@description このファイルは、AIを用いて小説の新しい章を生成するためのエンドポイントと生成システムの状態を確認するためのエンドポイントを提供します。POSTメソッドでは、クライアントからのリクエストを受け取り、GenerationEngineを使用して指定された章番号に基づいて小説の章を生成します。生成された章はValidationSystemによって品質検証され、検証に合格した場合または強制生成フラグが設定されている場合に結果を返します。また、生成された章はMemoryManagerを通じて記憶システムに保存され、物語の一貫性維持に利用されます。GETメソッドでは、生成システムとメモリシステムの現在の状態を取得できます。@requires next/server@requires @/lib/generation/engine@requires @/lib/memory/manager@requires @/lib/validation/system@requires @/types/generation@requires @/lib/utils/logger@requires @/types/validation@requires @/lib/utils/error-handler

**@constructor:** function Object() { [native code] }

#### POST (function)

@fileoverview 小説の章生成と状態確認を担当するAPI Route@description このファイルは、AIを用いて小説の新しい章を生成するためのエンドポイントと生成システムの状態を確認するためのエンドポイントを提供します。POSTメソッドでは、クライアントからのリクエストを受け取り、GenerationEngineを使用して指定された章番号に基づいて小説の章を生成します。生成された章はValidationSystemによって品質検証され、検証に合格した場合または強制生成フラグが設定されている場合に結果を返します。また、生成された章はMemoryManagerを通じて記憶システムに保存され、物語の一貫性維持に利用されます。GETメソッドでは、生成システムとメモリシステムの現在の状態を取得できます。@requires next/server@requires @/lib/generation/engine@requires @/lib/memory/manager@requires @/lib/validation/system@requires @/types/generation@requires @/lib/utils/logger@requires @/types/validation@requires @/lib/utils/error-handler/
import { NextRequest, NextResponse } from 'next/server';
import { GenerationEngine } from '@/lib/generation/engine';
import { MemoryManager } from '@/lib/memory/manager';
import { ValidationSystem } from '@/lib/validation/system';
import { GenerateChapterRequest, GenerateChapterResponse } from '@/types/generation';
import { logger } from '@/lib/utils/logger';
import { ValidationCheck } from '@/types/validation';
import { GenerationError, ValidationError, formatErrorResponse } from '@/lib/utils/error-handler';

// シングルトンインスタンス
const generationEngine = new GenerationEngine();
const memoryManager = new MemoryManager();
const validationSystem = new ValidationSystem();

/**章生成エンドポイントのPOSTリクエストを処理する関数@async@param {NextRequest} request - Next.jsリクエストオブジェクト@returns {Promise<NextResponse>} 生成結果またはエラー情報を含むJSONレスポンス@description この関数はクライアントからのPOSTリクエストを処理し、新しい小説の章を生成します。リクエストからチャプター番号と生成オプションを抽出し、パラメータのバリデーション（チャプター番号、目標文字数、テンション値、ペーシング値）を行った後、GenerationEngineを使用して章を生成します。生成された章はValidationSystemによって品質検証され、検証に合格するか強制生成フラグが有効な場合のみ結果を返します。生成された章はMemoryManagerによって記憶システムに統合されます。@throws {ValidationError} チャプター番号や生成パラメータが無効な場合@throws {GenerationError} 章の生成処理中にエラーが発生した場合@throws {Error} その他の予期しないエラーが発生した場合@example// リクエスト例:// POST /api/generation/chapter?chapterNumber=1{  "targetLength": 8000,  "forcedGeneration": false,  "overrides": {    "tension": 0.8,    "pacing": 0.6  }}// 成功時のレスポンス例:{  "success": true,  "data": {    "chapter": {      "id": "chapter-1",      "title": "第1章",      "chapterNumber": 1,      "content": "章の本文テキスト...",      "wordCount": 8000,      "createdAt": "2025-05-05T10:00:00Z",      "updatedAt": "2025-05-05T10:00:00Z",      "summary": "この章では主人公が...",      "scenes": [...],      "analysis": {...},      "metadata": {        "pov": "主人公",        "location": "東京",        "timeframe": "現代",        "emotionalTone": "希望に満ちた",        "qualityScore": 85      }    },    "metrics": {      "generationTime": 5000,      "qualityScore": 85,      "correctionCount": 0    }  }}// バリデーションエラー時のレスポンス例:{  "success": false,  "error": {    "code": "VALIDATION_ERROR",    "message": "Invalid chapter number"  }}// 品質検証失敗時のレスポンス例:{  "success": false,  "error": {    "code": "VALIDATION_FAILED",    "message": "Generated chapter failed validation",    "details": {      "qualityScore": 45,      "failedChecks": [        {          "name": "length",          "message": "文字数: 5000 (目標: 8000±20%)",          "severity": "HIGH"        }      ],      "potentialSolutions": "Try adjusting the generation parameters or use forcedGeneration:true"    }  }}// 生成エラー時のレスポンス例:{  "success": false,  "error": {    "code": "GENERATION_ERROR",    "message": "Failed to generate chapter"  }}

**@constructor:** function Object() { [native code] }

#### GET (function)

生成システムの状態確認用GETリクエストを処理する関数@async@param {NextRequest} request - Next.jsリクエストオブジェクト@returns {Promise<NextResponse>} システム状態情報を含むJSONレスポンス@description この関数はクライアントからのGETリクエストを処理し、生成システムとメモリシステムの現在の状態を取得して返します。GenerationEngineの状態（APIキーの有効性、使用モデル情報など）とMemoryManagerの状態（メモリシステムの初期化状態、各記憶層の情報など）を取得し、クライアントに提供します。@throws {Error} 状態取得処理中にエラーが発生した場合@example// リクエスト例:// GET /api/generation/chapter// 成功時のレスポンス例:{  "success": true,  "data": {    "generation": {      "apiKeyValid": true,      "model": "gemini-pro",      "maxRetries": 3    },    "memory": {      "initialized": true,      "shortTerm": {        "entryCount": 5,        "lastUpdateTime": "2025-05-05T10:00:00Z"      },      "midTerm": {        "entryCount": 2,        "lastUpdateTime": "2025-05-05T09:30:00Z",        "currentArc": {          "number": 1,          "name": "冒険の始まり"        }      },      "longTerm": {        "initialized": true,        "lastCompressionTime": "2025-05-04T18:00:00Z"      }    }  }}// エラー時のレスポンス例:{  "success": false,  "error": {    "code": "STATUS_ERROR",    "message": "Failed to get generation system status"  }}

**@constructor:** function Object() { [native code] }


---

### route.ts {#cnovel-automation-systemsrcappapigenerationvalidateroutets}

**Path:** `C:/novel-automation-system/src/app/api/generation/validate/route.ts`

@fileoverview 小説チャプター検証APIエンドポイント@description このファイルは小説のチャプター内容を検証し、品質メトリクスや問題点、改善提案を提供するAPIエンドポイントを実装しています。@requires next/server@requires @/lib/validation/system@requires @/types/generation@requires @/types/validation@requires @/lib/utils/logger@requires @/types/chapters@requires @/lib/utils/error-handler

**@constructor:** function Object() { [native code] }

#### POST (function)

@fileoverview 小説チャプター検証APIエンドポイント@description このファイルは小説のチャプター内容を検証し、品質メトリクスや問題点、改善提案を提供するAPIエンドポイントを実装しています。@requires next/server@requires @/lib/validation/system@requires @/types/generation@requires @/types/validation@requires @/lib/utils/logger@requires @/types/chapters@requires @/lib/utils/error-handler/

import { NextRequest, NextResponse } from 'next/server';
import { ValidationSystem } from '@/lib/validation/system';
import {
ValidateChapterRequest,
ValidateChapterResponse,
QualityMetrics
} from '@/types/generation';
import { ValidationIssue, Suggestion, ValidationResult, ValidationCheck } from '@/types/validation';
import { logger } from '@/lib/utils/logger';
import { Chapter } from '@/types/chapters';
import { ValidationError, formatErrorResponse } from '@/lib/utils/error-handler';

// シングルトンインスタンス
const validationSystem = new ValidationSystem();

/**小説チャプター検証APIエンドポイント@async@function POST@param {NextRequest} request - APIリクエスト@returns {Promise<NextResponse>} APIレスポンス@throws {ValidationError} コンテンツやチャプター番号が指定されていない場合@example// リクエスト例:{  "content": "小説のチャプター内容...",  "chapterNumber": 1}// 成功時のレスポンス例:{  "success": true,  "data": {    "isValid": true,    "issues": [],    "suggestions": [],    "qualityScore": {      "readability": 90,      "coherence": 85,      "engagement": 80,      "characterConsistency": 85,      "characterDepiction": 80,      "consistency": 85,      "originality": 80,      "overall": 85    }  }}// エラー時のレスポンス例:{  "success": false,  "error": {    "code": "VALIDATION_ERROR",    "message": "Content and chapter number are required"  }}

**@constructor:** function Object() { [native code] }

#### generateSuggestion (function)

提案生成関数@function generateSuggestion@param {ValidationIssue} issue - 検証問題@returns {string} 提案文@example// 入力:{  type: 'LENGTH',  description: '文字数が目標値を超えています',  severity: 'MEDIUM'}// 出力:'目標文字数に近づくよう調整してください'

**@constructor:** function Object() { [native code] }

#### generateReason (function)

理由生成関数@function generateReason@param {ValidationIssue} issue - 検証問題@returns {string} 理由文@example// 入力:{  type: 'STYLE',  description: '文体が一貫していません',  severity: 'MEDIUM'}// 出力:'一貫した文体は読者の没入感を高めます'

**@constructor:** function Object() { [native code] }

#### calculatePriority (function)

優先度計算関数@function calculatePriority@param {ValidationIssue} issue - 検証問題@param {number} index - 問題のインデックス@returns {number} 優先度スコア@description 問題の重要度とタイプに基づいて優先度スコアを計算します。重要度（HIGH, MEDIUM, LOW）と問題タイプ（BASIC_CONSISTENCY, CHARACTER_CONSISTENCY等）に重み付けを行い、インデックスによる微調整を加えてスコアを算出します。

**@constructor:** function Object() { [native code] }

#### calculateReadabilityScore (function)

読みやすさスコア計算関数@function calculateReadabilityScore@param {ValidationResult} validation - 検証結果@returns {number} 読みやすさスコア（0-100）@description バリデーション結果からstyle、syntax、readabilityのチェック結果を抽出し、読みやすさスコアを計算します。専用のreadabilityチェックがある場合はその結果を使用し、ない場合はstyleとsyntaxスコアの平均値を返します。

**@constructor:** function Object() { [native code] }

#### calculateCoherenceScore (function)

一貫性スコア計算関数@function calculateCoherenceScore@param {ValidationResult} validation - 検証結果@returns {number} 一貫性スコア（0-100）@description バリデーション結果からconsistency、plot_consistency、coherenceのチェック結果を抽出し、一貫性スコアを計算します。専用のcoherenceチェックがある場合はその結果を使用し、ない場合はconsistencyとplotスコアの平均値を返します。

**@constructor:** function Object() { [native code] }

#### calculateEngagementScore (function)

魅力度スコア計算関数@function calculateEngagementScore@param {ValidationResult} validation - 検証結果@returns {number} 魅力度スコア（0-100）@description バリデーション結果からpacing、dialogue、engagementのチェック結果を抽出し、魅力度スコアを計算します。専用のengagementチェックがある場合はその結果を使用し、ない場合はpace、dialogueスコアとデフォルト値の平均を返します。

**@constructor:** function Object() { [native code] }

#### calculateCharacterConsistencyScore (function)

キャラクター一貫性スコア計算関数@function calculateCharacterConsistencyScore@param {ValidationResult} validation - 検証結果@returns {number} キャラクター一貫性スコア（0-100）@description バリデーション結果からcharacter_consistencyチェック結果を抽出し、キャラクター一貫性スコアを計算します。専用のcharacter_consistencyチェックがある場合はその結果を使用し、ない場合は基本的な一貫性チェックの結果を代用します。

**@constructor:** function Object() { [native code] }

#### calculateConsistencyScore (function)

一般的な一貫性スコア計算関数@function calculateConsistencyScore@param {ValidationResult} validation - 検証結果@returns {number} 一貫性スコア（0-100）@description 一貫性と整合性は類似の概念として扱い、calculateCoherenceScore関数の結果を再利用して一貫性スコアを返します。

**@constructor:** function Object() { [native code] }

#### calculateCharacterDepictionScore (function)

キャラクター描写スコア計算関数@function calculateCharacterDepictionScore@param {ValidationResult} validation - 検証結果@returns {number} キャラクター描写スコア（0-100）@description バリデーション結果からcharacter_depictionチェック結果を抽出し、キャラクター描写スコアを計算します。専用のcharacter_depictionチェックがある場合はその結果を使用し、ない場合はキャラクター一貫性スコアを代用します。

**@constructor:** function Object() { [native code] }

#### calculateOriginalityScore (function)

オリジナリティスコア計算関数@function calculateOriginalityScore@param {ValidationResult} validation - 検証結果@returns {number} オリジナリティスコア（0-100）@description バリデーション結果からoriginalityチェック結果を抽出し、オリジナリティスコアを計算します。専用のoriginalityチェックがある場合はその結果を使用し、ない場合はデフォルト値（80）を返します。

**@constructor:** function Object() { [native code] }


---

### route.ts {#cnovel-automation-systemsrcappapimemorysearchroutets}

**Path:** `C:/novel-automation-system/src/app/api/memory/search/route.ts`

@fileoverview メモリ検索APIのエンドポイント@description このファイルは記憶管理システムで保存されている記憶を検索するためのAPIエンドポイントを提供します。ユーザーは検索クエリやフィルタリングオプションを指定し、関連する記憶とその分析結果を取得できます。@requires next/server - Next.jsのサーバーサイドAPI用ユーティリティ@requires @/lib/memory/manager - 記憶管理システムの中央コントローラー@requires @/lib/utils/logger - ログ記録用ユーティリティ@requires @/types/memory - 記憶関連の型定義@requires @/lib/utils/error-handler - エラーハンドリング用ユーティリティ

**@constructor:** function Object() { [native code] }

#### GET (function)

@fileoverview メモリ検索APIのエンドポイント@description このファイルは記憶管理システムで保存されている記憶を検索するためのAPIエンドポイントを提供します。ユーザーは検索クエリやフィルタリングオプションを指定し、関連する記憶とその分析結果を取得できます。@requires next/server - Next.jsのサーバーサイドAPI用ユーティリティ@requires @/lib/memory/manager - 記憶管理システムの中央コントローラー@requires @/lib/utils/logger - ログ記録用ユーティリティ@requires @/types/memory - 記憶関連の型定義@requires @/lib/utils/error-handler - エラーハンドリング用ユーティリティ/

import { NextRequest, NextResponse } from 'next/server';
import { memoryManager } from '@/lib/memory/manager';
import { logger } from '@/lib/utils/logger';
import { MemoryType, SearchResult } from '@/types/memory';
import { logError } from '@/lib/utils/error-handler';

/**メモリ検索APIエンドポイント@async@function GET@param {NextRequest} request - Next.jsのリクエストオブジェクト@returns {Promise<NextResponse>} JSON形式のレスポンス@description 記憶管理システムに保存されている記憶を検索するためのAPIエンドポイント。検索クエリ、メモリタイプ、結果数制限、最小関連性スコアなどのパラメータを受け取り、条件に合致する記憶を返します。また、検索結果に基づいた分析インサイトも生成します。@example// リクエスト例:GET /api/memory/search?query=主人公の冒険&types=SHORT_TERM,MID_TERM&limit=5&minRelevance=0.7// 成功時のレスポンス構造:{  "success": true,  "data": {    "results": [      {        "memory": {          "type": "SHORT_TERM",          "content": "チャプター5: 主人公が森での冒険を開始する...",          "priority": 0.8        },        "relevance": 0.92,        "matches": ["主人公", "冒険"]      }    ],    "insights": [      {        "type": "TYPE_DISTRIBUTION",        "description": "検索結果の大部分は短期記憶からのものです（3件）"      }    ]  }}// エラー時のレスポンス構造:{  "success": false,  "error": {    "code": "VALIDATION_ERROR",    "message": "Search query is required"  }}

**@constructor:** function Object() { [native code] }

#### generateInsights (function)

検索結果からインサイト（洞察）を生成する関数@function generateInsights@param {SearchResult[]} results - 検索結果の配列@returns {any[]} 生成されたインサイトの配列@description検索結果を分析し、以下のような複数のインサイトを生成します：1. メモリタイプの分布 - 短期/中期/長期記憶の分布状況2. 関連性の分布 - 高/中/低の関連性を持つ結果の割合3. チャプター分布 - 検索結果がどのチャプター範囲に分布しているかインサイトは検索結果の特徴を示す情報として、日本語でユーザーに提供されます。@example// インサイトの例:[  {    "type": "TYPE_DISTRIBUTION",    "description": "検索結果の大部分は短期記憶からのものです（3件）"  },  {    "type": "RELEVANCE",    "description": "検索結果の多く（5件）が高い関連性を持っています"  },  {    "type": "CHAPTER_FOCUS",    "description": "検索結果はチャプター5～10に集中しています"  }]

**@constructor:** function Object() { [native code] }


---

### route.ts {#cnovel-automation-systemsrcappapimemorysyncroutets}

**Path:** `C:/novel-automation-system/src/app/api/memory/sync/route.ts`

@fileoverview メモリ同期APIエンドポイント@description このファイルはメモリ同期機能を提供するAPIエンドポイントを実装しています。クライアントからのリクエストを受け取り、メモリマネージャーを使用してチャプターデータを処理し、様々なメモリレベル（短期、中期、長期）間の同期を行います。@requires next/server@requires @/lib/memory/manager@requires @/types/memory@requires @/lib/utils/logger@requires @/lib/utils/error-handler@requires @/types/chapters

**@constructor:** function Object() { [native code] }

#### POST (function)

@fileoverview メモリ同期APIエンドポイント@description このファイルはメモリ同期機能を提供するAPIエンドポイントを実装しています。クライアントからのリクエストを受け取り、メモリマネージャーを使用してチャプターデータを処理し、様々なメモリレベル（短期、中期、長期）間の同期を行います。@requires next/server@requires @/lib/memory/manager@requires @/types/memory@requires @/lib/utils/logger@requires @/lib/utils/error-handler@requires @/types/chapters/

import { NextRequest, NextResponse } from 'next/server';
import { memoryManager } from '@/lib/memory/manager';
import { SyncMemoryRequest, SyncMemoryResponse } from '@/types/memory';
import { logger } from '@/lib/utils/logger';
import { logError } from '@/lib/utils/error-handler';
import { Chapter } from '@/types/chapters';

/**POSTリクエストを処理するAPIハンドラーメモリ同期処理を実行し、結果を返します。リクエストには強制同期モード（force）またはチャプター番号が必要です。forceモードの場合は直接syncMemoriesを呼び出し、通常モードの場合はチャプターを取得してからprocessChapterとsyncMemoriesを呼び出します。@param {NextRequest} request - 受信したHTTPリクエスト@returns {Promise<NextResponse>} HTTPレスポンス@example// リクエスト構造（通常同期）:{  "chapterNumber": 5}// リクエスト構造（強制同期）:{  "chapterNumber": 5,  "force": true}// 成功時のレスポンス構造:{  "success": true,  "data": {    "updatedMemories": ["SHORT_TERM", "MID_TERM"],    "compressionActions": [      {        "type": "compress",        "source": "SHORT_TERM",        "target": "MID_TERM",        "details": "5のチャプターメモリを圧縮"      }    ]  }}// バリデーションエラー時のレスポンス構造:{  "success": false,  "error": {    "code": "VALIDATION_ERROR",    "message": "Chapter number is required unless force is true"  }}// チャプターが見つからない場合のレスポンス構造:{  "success": false,  "error": {    "code": "NOT_FOUND",    "message": "Chapter 5 not found"  }}// 同期エラー時のレスポンス構造:{  "success": false,  "error": {    "code": "SYNC_ERROR",    "message": "エラーメッセージ"  }}

**@constructor:** function Object() { [native code] }

#### getChapter (function)

チャプター番号からチャプターを取得するヘルパー関数指定されたチャプター番号に対応するチャプターデータをAPIまたはデータベースから取得します。これは簡易実装であり、実際のデータアクセス方法は実装者によって置き換えられることを想定しています。@param {number} chapterNumber - 取得するチャプターの番号@returns {Promise<Chapter | null>} 取得したチャプターオブジェクト、見つからない場合はnull@example// 使用例const chapter = await getChapter(5);if (chapter) {  // チャプターが見つかった場合の処理} else {  // チャプターが見つからなかった場合の処理}

**@constructor:** function Object() { [native code] }


---

### error.tsx {#cnovel-automation-systemsrcapperrortsx}

**Path:** `C:/novel-automation-system/src/app/error.tsx`

エラーページコンポーネントクライアントコンポーネントである必要がある

**@constructor:** function Object() { [native code] }

#### Error (function)

エラーページコンポーネントクライアントコンポーネントである必要がある

**@constructor:** function Object() { [native code] }


---

### layout.tsx {#cnovel-automation-systemsrcapplayouttsx}

**Path:** `C:/novel-automation-system/src/app/layout.tsx`

ルートレイアウト
アプリケーション全体のレイアウトを定義

**@constructor:** function Object() { [native code] }

#### RootLayout (function)

ルートレイアウト
アプリケーション全体のレイアウトを定義

**@constructor:** function Object() { [native code] }


---

### loading.tsx {#cnovel-automation-systemsrcapploadingtsx}

**Path:** `C:/novel-automation-system/src/app/loading.tsx`

ローディング状態のコンポーネントNext.jsのサスペンスの仕組みで使用される

**@constructor:** function Object() { [native code] }

#### Loading (function)

ローディング状態のコンポーネントNext.jsのサスペンスの仕組みで使用される

**@constructor:** function Object() { [native code] }


---

### not-found.tsx {#cnovel-automation-systemsrcappnot-foundtsx}

**Path:** `C:/novel-automation-system/src/app/not-found.tsx`

404 Not Foundページ

**@constructor:** function Object() { [native code] }

#### NotFound (function)

404 Not Foundページ

**@constructor:** function Object() { [native code] }


---

### page.tsx {#cnovel-automation-systemsrcapppagetsx}

**Path:** `C:/novel-automation-system/src/app/page.tsx`

ホームページ

**@constructor:** function Object() { [native code] }

#### Home (function)

ホームページ

**@constructor:** function Object() { [native code] }


---

### editor-summary.tsx {#cnovel-automation-systemsrccomponentsadmindashboardeditor-summarytsx}

**Path:** `C:/novel-automation-system/src/components/admin/dashboard/editor-summary.tsx`

エディタ情報のサマリーコンポーネント管理者ダッシュボードで使用するために、エディタの状態を簡潔に表示

**@constructor:** function Object() { [native code] }

#### EditorSummary (variable)

エディタ情報のサマリーコンポーネント管理者ダッシュボードで使用するために、エディタの状態を簡潔に表示

**@constructor:** function Object() { [native code] }


---

### memory-management.tsx {#cnovel-automation-systemsrccomponentsadminmemory-managementmemory-managementtsx}

**Path:** `C:/novel-automation-system/src/components/admin/memory-management/memory-management.tsx`

記憶検索コンポーネント

**@constructor:** function Object() { [native code] }

#### MemorySearch (variable)

記憶検索コンポーネント

**@constructor:** function Object() { [native code] }

#### MemoryHierarchy (variable)

記憶階層表示コンポーネント

**@constructor:** function Object() { [native code] }

#### MemoryNodeProps (interface)

記憶ノードコンポーネント

**@constructor:** function Object() { [native code] }

#### MemoryTimeline (variable)

記憶タイムラインコンポーネント

**@constructor:** function Object() { [native code] }

#### MemoryViewer (variable)

記憶ビューワーコンポーネント

**@constructor:** function Object() { [native code] }


---

### alert.tsx {#cnovel-automation-systemsrccomponentssharedalerttsx}

**Path:** `C:/novel-automation-system/src/components/shared/alert.tsx`

アラートコンポーネントのプロップス

**@constructor:** function Object() { [native code] }

#### AlertProps (interface)

アラートコンポーネントのプロップス

**@constructor:** function Object() { [native code] }

#### Alert (variable)

アラートのタイトル/
title?: string;
/**アイコン要素/
icon?: React.ReactNode;
/**閉じるボタンを表示するかどうか/
closable?: boolean;
/**閉じるボタンがクリックされたときのコールバック/
onClose?: () => void;
}

/**アラートコンポーネント

**@constructor:** function Object() { [native code] }


---

### breadcrumbs.tsx {#cnovel-automation-systemsrccomponentssharedbreadcrumbstsx}

**Path:** `C:/novel-automation-system/src/components/shared/breadcrumbs.tsx`

パンくずリンクの型定義

**@constructor:** function Object() { [native code] }

#### BreadcrumbLink (interface)

パンくずリンクの型定義

**@constructor:** function Object() { [native code] }

#### BreadcrumbsProps (interface)

表示名/
name: string;
/**リンク先URL/
href: string;
}

/**パンくずリストのプロップス

**@constructor:** function Object() { [native code] }

#### Breadcrumbs (function)

カスタムリンク（オプション）/
links?: BreadcrumbLink[];
/**自動生成を使用するか/
useAutoGeneration?: boolean;
/**ホームリンクの名前/
homeLabel?: string;
/**除外するパスセグメント/
excludeSegments?: string[];
/**セグメント名のマッピング/
segmentMapping?: Record<string, string>;
}

/**パンくずリストコンポーネント

**@constructor:** function Object() { [native code] }


---

### error-boundary.tsx {#cnovel-automation-systemsrccomponentssharederror-boundarytsx}

**Path:** `C:/novel-automation-system/src/components/shared/error-boundary.tsx`

エラーバウンダリーコンポーネントのプロップス

**@constructor:** function Object() { [native code] }

#### ErrorBoundary (class)

エラーが発生したかどうか/
hasError: boolean;
/**エラーオブジェクト/
error?: Error;
}

/**エラーバウンダリーコンポーネント子コンポーネントでエラーが発生した場合にフォールバックUIを表示

**@constructor:** function Object() { [native code] }

#### ErrorBoundaryProps (interface)

エラーバウンダリーコンポーネントのプロップス

**@constructor:** function Object() { [native code] }

#### ErrorBoundaryState (interface)

子要素/
children: ReactNode;
/**カスタムフォールバックUI/
fallback?: ReactNode;
/**エラー発生時のコールバック/
onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

/**エラーバウンダリーコンポーネントの状態

**@constructor:** function Object() { [native code] }


---

### footer.tsx {#cnovel-automation-systemsrccomponentssharedfootertsx}

**Path:** `C:/novel-automation-system/src/components/shared/footer.tsx`

フッターコンポーネント

**@constructor:** function Object() { [native code] }

#### Footer (function)

フッターコンポーネント

**@constructor:** function Object() { [native code] }


---

### header.tsx {#cnovel-automation-systemsrccomponentssharedheadertsx}

**Path:** `C:/novel-automation-system/src/components/shared/header.tsx`

ナビゲーションリンクの型定義

**@constructor:** function Object() { [native code] }

#### NavLink (interface)

ナビゲーションリンクの型定義

**@constructor:** function Object() { [native code] }

#### navLinks (variable)

ナビゲーションリンク設定

**@constructor:** function Object() { [native code] }

#### Header (function)

ヘッダーコンポーネント

**@constructor:** function Object() { [native code] }


---

### navigation.tsx {#cnovel-automation-systemsrccomponentssharednavigationtsx}

**Path:** `C:/novel-automation-system/src/components/shared/navigation.tsx`

ナビゲーションアイテムの型定義

**@constructor:** function Object() { [native code] }

#### NavItem (interface)

ナビゲーションアイテムの型定義

**@constructor:** function Object() { [native code] }

#### NavSection (interface)

ナビゲーションセクションの型定義

**@constructor:** function Object() { [native code] }

#### NavigationProps (interface)

ナビゲーションコンポーネントのプロップス

**@constructor:** function Object() { [native code] }

#### Navigation (function)

サイドナビゲーションコンポーネント

**@constructor:** function Object() { [native code] }


---

### page-title.tsx {#cnovel-automation-systemsrccomponentssharedpage-titletsx}

**Path:** `C:/novel-automation-system/src/components/shared/page-title.tsx`

ページタイトルコンポーネントのプロップス

**@constructor:** function Object() { [native code] }

#### PageTitleProps (interface)

ページタイトルコンポーネントのプロップス

**@constructor:** function Object() { [native code] }

#### PageTitle (function)

タイトル/
title: string;
/**サブタイトル/
subtitle?: string;
/**アクション要素（ボタンなど）/
actions?: React.ReactNode;
/**クラス名/
className?: string;
}

/**ページタイトルコンポーネント

**@constructor:** function Object() { [native code] }


---

### badge.tsx {#cnovel-automation-systemsrccomponentsuibadgetsx}

**Path:** `C:/novel-automation-system/src/components/ui/badge.tsx`

バッジコンポーネントのプロップス

**@constructor:** function Object() { [native code] }

#### BadgeProps (interface)

バッジコンポーネントのプロップス

**@constructor:** function Object() { [native code] }

#### Badge (variable)

バッジコンポーネントステータスや分類を表示するための小さなラベル

**@constructor:** function Object() { [native code] }


---

### button.tsx {#cnovel-automation-systemsrccomponentsuibuttontsx}

**Path:** `C:/novel-automation-system/src/components/ui/button.tsx`

ボタンコンポーネントのプロップス

**@constructor:** function Object() { [native code] }

#### ButtonProps (interface)

ボタンコンポーネントのプロップス

**@constructor:** function Object() { [native code] }

#### Button (variable)

子要素/
children: React.ReactNode;
/**フルワイドスタイルの適用/
fullWidth?: boolean;
/**読み込み状態/
isLoading?: boolean;
}

/**汎用ボタンコンポーネント

**@constructor:** function Object() { [native code] }


---

### card.tsx {#cnovel-automation-systemsrccomponentsuicardtsx}

**Path:** `C:/novel-automation-system/src/components/ui/card.tsx`

カードコンポーネントのプロップス

**@constructor:** function Object() { [native code] }

#### CardProps (interface)

カードコンポーネントのプロップス

**@constructor:** function Object() { [native code] }

#### Card (variable)

子要素/
children: React.ReactNode;
/**影のサイズ/
shadow?: 'none' | 'sm' | 'md' | 'lg';
/**ボーダー有無/
bordered?: boolean;
}

/**汎用カードコンポーネント

**@constructor:** function Object() { [native code] }

#### CardHeader (variable)

カードヘッダーコンポーネント

**@constructor:** function Object() { [native code] }

#### CardTitle (variable)

カードタイトルコンポーネント

**@constructor:** function Object() { [native code] }

#### CardDescription (variable)

カード説明コンポーネント

**@constructor:** function Object() { [native code] }

#### CardBody (variable)

カード本文コンポーネント

**@constructor:** function Object() { [native code] }

#### CardContent (variable)

カード本文コンポーネント（CardBodyの別名）

**@constructor:** function Object() { [native code] }

#### CardFooter (variable)

カードフッターコンポーネント

**@constructor:** function Object() { [native code] }


---

### charts.tsx {#cnovel-automation-systemsrccomponentsuichartstsx}

**Path:** `C:/novel-automation-system/src/components/ui/charts.tsx`

シンプルな折れ線グラフコンポーネント

**@constructor:** function Object() { [native code] }

#### LineChart (component)

シンプルな折れ線グラフコンポーネント

**@constructor:** function Object() { [native code] }

#### BarChart (component)

シンプルな棒グラフコンポーネント

**@constructor:** function Object() { [native code] }

#### PieChartProps (interface)

シンプルな円グラフコンポーネント

**@constructor:** function Object() { [native code] }

#### AreaChartProps (interface)

シンプルなエリアチャートコンポーネント

**@constructor:** function Object() { [native code] }


---

### dialog.tsx {#cnovel-automation-systemsrccomponentsuidialogtsx}

**Path:** `C:/novel-automation-system/src/components/ui/dialog.tsx`

ダイアログコンポーネントのプロップス

**@constructor:** function Object() { [native code] }

#### DialogProps (interface)

ダイアログコンポーネントのプロップス

**@constructor:** function Object() { [native code] }

#### Dialog (component)

ダイアログを開くかどうか/
isOpen: boolean;
/**ダイアログを閉じる関数/
onClose: () => void;
/**タイトル/
title?: string;
/**説明/
description?: string;
/**子要素/
children: React.ReactNode;
/**フッター/
footer?: React.ReactNode;
/**最大幅/
maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

/**ダイアログコンポーネント

**@constructor:** function Object() { [native code] }

#### ConfirmDialogProps (interface)

確認ダイアログコンポーネントのプロップス

**@constructor:** function Object() { [native code] }

#### ConfirmDialog (component)

ダイアログを開くかどうか/
isOpen: boolean;
/**ダイアログを閉じる関数/
onClose: () => void;
/**確認時のコールバック/
onConfirm: () => void;
/**タイトル/
title: string;
/**メッセージ/
message: string;
/**確認ボタンのテキスト/
confirmText?: string;
/**キャンセルボタンのテキスト/
cancelText?: string;
/**確認ボタンの種類/
confirmVariant?: 'primary' | 'danger';
}

/**確認ダイアログコンポーネント

**@constructor:** function Object() { [native code] }


---

### input.tsx {#cnovel-automation-systemsrccomponentsuiinputtsx}

**Path:** `C:/novel-automation-system/src/components/ui/input.tsx`

入力フィールドのプロップス

**@constructor:** function Object() { [native code] }

#### InputProps (interface)

入力フィールドのプロップス

**@constructor:** function Object() { [native code] }

#### Input (variable)

エラーメッセージ/
error?: string;
/**ヘルプテキスト/
helpText?: string;
/**入力フィールドの左側に表示するアイコンまたは要素/
startAdornment?: React.ReactNode;
/**入力フィールドの右側に表示するアイコンまたは要素/
endAdornment?: React.ReactNode;
/**フルワイドスタイルの適用/
fullWidth?: boolean;
}

/**汎用入力フィールドコンポーネント

**@constructor:** function Object() { [native code] }


---

### select.tsx {#cnovel-automation-systemsrccomponentsuiselecttsx}

**Path:** `C:/novel-automation-system/src/components/ui/select.tsx`

セレクトオプション

**@constructor:** function Object() { [native code] }

#### SelectOption (interface)

セレクトオプション

**@constructor:** function Object() { [native code] }

#### SelectProps (interface)

オプション値/
value: string;
/**表示ラベル/
label: string;
/**無効化フラグ/
disabled?: boolean;
}

/**セレクトコンポーネントのプロップス

**@constructor:** function Object() { [native code] }

#### Select (variable)

オプション配列/
options: SelectOption[];
/**エラーメッセージ/
error?: string;
/**ヘルプテキスト/
helpText?: string;
/**プレースホルダー/
placeholder?: string;
/**フルワイドスタイルの適用/
fullWidth?: boolean;
}

/**汎用セレクトコンポーネント

**@constructor:** function Object() { [native code] }


---

### spinner.tsx {#cnovel-automation-systemsrccomponentsuispinnertsx}

**Path:** `C:/novel-automation-system/src/components/ui/spinner.tsx`

スピナーコンポーネントのプロップス

**@constructor:** function Object() { [native code] }

#### SpinnerProps (interface)

スピナーコンポーネントのプロップス

**@constructor:** function Object() { [native code] }

#### Spinner (component)

サイズ/
size?: 'sm' | 'md' | 'lg';
/**カラー/
color?: 'primary' | 'secondary' | 'gray';
/**クラス名/
className?: string;
}

/**読み込み中を示すスピナーコンポーネント

**@constructor:** function Object() { [native code] }


---

### table.tsx {#cnovel-automation-systemsrccomponentsuitabletsx}

**Path:** `C:/novel-automation-system/src/components/ui/table.tsx`

テーブルコンポーネント

**@constructor:** function Object() { [native code] }

#### Table (variable)

テーブルコンポーネント

**@constructor:** function Object() { [native code] }

#### TableHeader (variable)

テーブルヘッダーコンポーネント

**@constructor:** function Object() { [native code] }

#### TableBody (variable)

テーブル本体コンポーネント

**@constructor:** function Object() { [native code] }

#### TableFooter (variable)

テーブルフッターコンポーネント

**@constructor:** function Object() { [native code] }

#### TableRow (variable)

テーブル行コンポーネント

**@constructor:** function Object() { [native code] }

#### TableHead (variable)

テーブルヘッダーセルコンポーネント

**@constructor:** function Object() { [native code] }

#### TableCell (variable)

テーブルセルコンポーネント

**@constructor:** function Object() { [native code] }

#### TableCaption (variable)

テーブルキャプションコンポーネント

**@constructor:** function Object() { [native code] }


---

### textarea.tsx {#cnovel-automation-systemsrccomponentsuitextareatsx}

**Path:** `C:/novel-automation-system/src/components/ui/textarea.tsx`

テキストエリアのプロップス

**@constructor:** function Object() { [native code] }

#### TextareaProps (interface)

テキストエリアのプロップス

**@constructor:** function Object() { [native code] }

#### Textarea (variable)

エラーメッセージ/
error?: string;
/**ヘルプテキスト/
helpText?: string;
/**フルワイドスタイルの適用/
fullWidth?: boolean;
}

/**汎用テキストエリアコンポーネント

**@constructor:** function Object() { [native code] }


---

### api.ts {#cnovel-automation-systemsrcconfigapits}

**Path:** `C:/novel-automation-system/src/config/api.ts`

API設定

**@constructor:** function Object() { [native code] }

#### apiConfig (variable)

API設定/

import { config } from './environment';
import { API } from './constants';

/**API基本設定

**@constructor:** function Object() { [native code] }

#### geminiApiConfig (variable)

APIベースURL/
baseUrl: config.app.apiUrl,

/**APIバージョン/
version: API.VERSION,

/**デフォルトのヘッダー/
headers: {
'Content-Type': 'application/json',
},

/**タイムアウト（ミリ秒）/
timeout: 30000,

/**リクエスト再試行設定/
retry: {
/**最大再試行回数/
maxRetries: 3,

/**初期遅延（ミリ秒）/
initialDelay: 300,

/**遅延倍率/
backoffFactor: 2,
},
};

/**Gemini API設定

**@constructor:** function Object() { [native code] }

#### apiEndpoints (variable)

APIベースURL/
baseUrl: 'https://generativelanguage.googleapis.com',

/**APIバージョン/
version: 'v1',

/**APIキー/
apiKey: config.gemini.apiKey,

/**レート制限（リクエスト/分）/
rateLimit: config.gemini.rateLimit,

/**タイムアウト（ミリ秒）/
timeout: 60000,

/**デフォルトのモデル/
defaultModel: 'gemini-pro',

/**再試行設定/
retry: {
maxRetries: 2,
initialDelay: 500,
backoffFactor: 1.5,
},
};

/**API エンドポイント

**@constructor:** function Object() { [native code] }


---

### constants.ts {#cnovel-automation-systemsrcconfigconstantsts}

**Path:** `C:/novel-automation-system/src/config/constants.ts`

アプリケーション全体で使用される定数

**@constructor:** function Object() { [native code] }

#### Environment (enum)

アプリケーション全体で使用される定数/

/**アプリケーション環境

**@constructor:** function Object() { [native code] }

#### CURRENT_ENV (variable)

現在の環境

**@constructor:** function Object() { [native code] }

#### APP_NAME (variable)

アプリケーション名

**@constructor:** function Object() { [native code] }

#### CharacterType (enum)

キャラクタータイプ

**@constructor:** function Object() { [native code] }

#### CharacterRole (enum)

キャラクター役割

**@constructor:** function Object() { [native code] }

#### MemoryType (enum)

記憶タイプ

**@constructor:** function Object() { [native code] }

#### API (variable)

API関連の定数

**@constructor:** function Object() { [native code] }

#### GENERATION (variable)

API バージョン/
VERSION: 'v1',

/**最大ページサイズ/
MAX_PAGE_SIZE: 100,

/**デフォルトページサイズ/
DEFAULT_PAGE_SIZE: 20,

/**レート制限（リクエスト/分）/
RATE_LIMIT: 60,
};

/**生成関連の定数

**@constructor:** function Object() { [native code] }

#### STORAGE (variable)

デフォルトの目標文字数/
DEFAULT_TARGET_LENGTH: 8000,

/**文字数許容範囲（±）/
LENGTH_TOLERANCE: 0.1,

/**最大再試行回数/
MAX_RETRIES: 3,

/**短期記憶の最大チャプター数/
SHORT_TERM_MEMORY_SIZE: 10,

/**中期記憶の圧縮閾値/
MID_TERM_COMPRESSION_THRESHOLD: 5,
};

/**ストレージ関連の定数

**@constructor:** function Object() { [native code] }


---

### environment.ts {#cnovel-automation-systemsrcconfigenvironmentts}

**Path:** `C:/novel-automation-system/src/config/environment.ts`

環境設定

**@constructor:** function Object() { [native code] }

#### EnvironmentConfig (interface)

環境設定/

import { Environment, CURRENT_ENV } from './constants';
import { logger, LogLevel } from '../lib/utils/logger';

/**環境ごとの設定

**@constructor:** function Object() { [native code] }

#### developmentConfig (variable)

ログレベル/
logLevel: LogLevel;

/**Gemini API設定/
gemini: {
/**APIキー/
apiKey: string | undefined;

/**レート制限（リクエスト/分）/
rateLimit: number;
};

/**GitHub設定/
github: {
/**トークン/
token: string | undefined;

/**リポジトリ/
repo: string | undefined;

/**ブランチ/
branch: string;
};

/**ストレージ設定/
storage: {
/**ローカルストレージを使用するか/
useLocalStorage: boolean;

/**ローカルストレージのベースディレクトリ/
localStorageDir: string;
};

/**アプリケーション設定/
app: {
/**アプリケーションURL/
url: string;

/**API URL/
apiUrl: string;
};
}

/**開発環境設定

**@constructor:** function Object() { [native code] }

#### stagingConfig (variable)

ステージング環境設定

**@constructor:** function Object() { [native code] }

#### productionConfig (variable)

本番環境設定

**@constructor:** function Object() { [native code] }

#### configMap (variable)

環境ごとの設定マップ

**@constructor:** function Object() { [native code] }

#### config (variable)

現在の環境設定を取得

**@constructor:** function Object() { [native code] }


---

### use-character-analytics.ts {#cnovel-automation-systemsrchooksuse-character-analyticsts}

**Path:** `C:/novel-automation-system/src/hooks/use-character-analytics.ts`

Custom hook for fetching and analyzing character statisticsProvides appearance frequency, interaction data, and development metrics

**@constructor:** function Object() { [native code] }

#### useCharacterAnalytics (variable)

Custom hook for fetching and analyzing character statisticsProvides appearance frequency, interaction data, and development metrics

**@constructor:** function Object() { [native code] }


---

### use-character-relationships.ts {#cnovel-automation-systemsrchooksuse-character-relationshipsts}

**Path:** `C:/novel-automation-system/src/hooks/use-character-relationships.ts`

Custom hook for managing character relationship data and operationsProvides data for relationship visualization, analysis, and updates

**@constructor:** function Object() { [native code] }

#### useCharacterRelationships (variable)

Custom hook for managing character relationship data and operationsProvides data for relationship visualization, analysis, and updates

**@constructor:** function Object() { [native code] }


---

### use-characters.tsx {#cnovel-automation-systemsrchooksuse-characterstsx}

**Path:** `C:/novel-automation-system/src/hooks/use-characters.tsx`

カスタムフック: キャラクター一覧の取得と操作キャラクターリストの取得、作成、更新、非アクティブ化、昇格などの機能を提供します。API通信と状態管理を担当します。

**@constructor:** function Object() { [native code] }

#### useCharacters (variable)

カスタムフック: キャラクター一覧の取得と操作キャラクターリストの取得、作成、更新、非アクティブ化、昇格などの機能を提供します。API通信と状態管理を担当します。

**@constructor:** function Object() { [native code] }

#### fetchCharacters (variable)

キャラクター一覧を取得する

**@constructor:** function Object() { [native code] }

#### createCharacter (variable)

新しいキャラクターを作成する

**@constructor:** function Object() { [native code] }

#### updateCharacter (variable)

キャラクターを更新する

**@constructor:** function Object() { [native code] }

#### deactivateCharacter (variable)

キャラクターを非アクティブにする（論理削除）

**@constructor:** function Object() { [native code] }

#### promoteCharacter (variable)

キャラクターを昇格する

**@constructor:** function Object() { [native code] }

#### getCharacterRelationships (variable)

キャラクターの関係性を取得する

**@constructor:** function Object() { [native code] }

#### getAppearanceTiming (variable)

キャラクター登場タイミングの推奨を取得する

**@constructor:** function Object() { [native code] }

#### useCharacter (variable)

カスタムフック: 単一キャラクターの取得と操作1人のキャラクターの詳細情報取得、更新、発展経路取得など単一キャラクターに対する操作を提供します。

**@constructor:** function Object() { [native code] }

#### fetchCharacter (variable)

キャラクター詳細を取得する

**@constructor:** function Object() { [native code] }

#### updateCharacter (variable)

キャラクターを更新する

**@constructor:** function Object() { [native code] }

#### getDevelopmentPath (variable)

キャラクターの発展経路を取得する

**@constructor:** function Object() { [native code] }

#### recordAppearance (variable)

キャラクター登場記録

**@constructor:** function Object() { [native code] }


---

### use-collaboration.ts {#cnovel-automation-systemsrchooksuse-collaborationts}

**Path:** `C:/novel-automation-system/src/hooks/use-collaboration.ts`

ドキュメント型定義

**@constructor:** function Object() { [native code] }

#### Document (interface)

ドキュメント型定義

**@constructor:** function Object() { [native code] }

#### EditorInfo (interface)

編集者情報

**@constructor:** function Object() { [native code] }

#### ConflictInfo (interface)

編集者ID */
id: string;

/** 編集者名 */
name: string;

/** ステータス */
status: 'ACTIVE' | 'IDLE' | 'OFFLINE';

/** 最終アクティビティ */
lastActivity: string;

/** カーソル位置 */
cursorPosition?: number;

/** 選択範囲 */
selection?: { start: number; end: number };
}

/**コンフリクト情報

**@constructor:** function Object() { [native code] }

#### ResolutionResult (interface)

コンフリクト数 */
count: number;

/** コンフリクト詳細 */
details: {
lineNumber: number;
baseContent: string;
editedContent: string;
otherContent: string;
}[];

/** 解決戦略 */
strategies: {
conflictIndex: number;
type: string;
suggestedContent?: string;
}[];
}

/**解決結果

**@constructor:** function Object() { [native code] }

#### EditResult (interface)

成功フラグ */
success: boolean;

/** 結果ドキュメント */
document?: Document;

/** エラーメッセージ */
error?: string;
}

/**編集結果

**@constructor:** function Object() { [native code] }

#### EditorEdit (interface)

成功フラグ */
success: boolean;

/** 結果ドキュメント */
document?: Document;

/** コンフリクト情報 */
conflict?: ConflictInfo;

/** エラーメッセージ */
error?: string;
}

/**編集操作型定義

**@constructor:** function Object() { [native code] }

#### VersionInfo (interface)

編集タイプ */
type: 'INSERT' | 'DELETE' | 'REPLACE';

/** 編集位置 */
position: number;

/** 編集内容（挿入・置換時）*/
text?: string;

/** 削除長（削除時）*/
deleteLength?: number;

/** 置換対象（置換時）*/
replaceTarget?: string;

/** タイムスタンプ */
timestamp: Date;

/** 編集者ID */
editorId: string;

/** メタデータ */
metadata?: Record<string, any>;
}

/**バージョン情報

**@constructor:** function Object() { [native code] }

#### useCollaboration (variable)

現在のバージョン */
currentVersion: number;

/** 履歴 */
versions: {
version: number;
timestamp: Date;
}[];
}

/**協調編集のためのフック@param editorId 編集者ID - 必須パラメータ

**@constructor:** function Object() { [native code] }

#### startCollaboration (variable)

協調編集を開始@param targetDocumentId ドキュメントID@param initialContent 初期コンテンツ (オプション)

**@constructor:** function Object() { [native code] }

#### endCollaboration (variable)

協調編集を終了

**@constructor:** function Object() { [native code] }

#### applyEdit (variable)

編集を適用@param edit 編集操作

**@constructor:** function Object() { [native code] }

#### applyEdits (variable)

複数の編集を一括適用@param edits 編集操作の配列

**@constructor:** function Object() { [native code] }

#### saveDocument (variable)

ドキュメントを保存

**@constructor:** function Object() { [native code] }

#### resolveConflicts (variable)

コンフリクトを解決@param strategyIndices 採用する戦略のインデックス

**@constructor:** function Object() { [native code] }

#### updateCursorPosition (variable)

カーソル位置を更新@param position カーソル位置@param selection 選択範囲 (オプション)

**@constructor:** function Object() { [native code] }

#### revertToVersion (variable)

特定バージョンに戻す@param version バージョン番号

**@constructor:** function Object() { [native code] }

#### fetchVersionInfo (variable)

バージョン情報を取得

**@constructor:** function Object() { [native code] }

#### updateSessionInfo (variable)

セッション情報を更新

**@constructor:** function Object() { [native code] }

#### startPolling (variable)

ポーリングを開始

**@constructor:** function Object() { [native code] }

#### stopPolling (variable)

ポーリングを停止

**@constructor:** function Object() { [native code] }

#### onDocumentEdit (variable)

編集イベントのリスナーを設定@param callback コールバック関数

**@constructor:** function Object() { [native code] }

#### onConflictDetected (variable)

コンフリクトイベントのリスナーを設定@param callback コールバック関数

**@constructor:** function Object() { [native code] }


---

### use-editor.ts {#cnovel-automation-systemsrchooksuse-editorts}

**Path:** `C:/novel-automation-system/src/hooks/use-editor.ts`

エディタの状態と操作を管理するフック

**@constructor:** function Object() { [native code] }

#### useEditor (variable)

エディタの状態と操作を管理するフック

**@constructor:** function Object() { [native code] }

#### loadDocument (variable)

ドキュメントを読み込む

**@constructor:** function Object() { [native code] }

#### saveDocument (variable)

ドキュメントを保存する

**@constructor:** function Object() { [native code] }

#### updateContent (variable)

エディタ内容を更新する（保存せずに状態のみ更新）

**@constructor:** function Object() { [native code] }


---

### use-foreshadowing.ts {#cnovel-automation-systemsrchooksuse-foreshadowingts}

**Path:** `C:/novel-automation-system/src/hooks/use-foreshadowing.ts`

UI表示用の伏線要素の型定義

**@constructor:** function Object() { [native code] }

#### ForeshadowingElement (interface)

UI表示用の伏線要素の型定義

**@constructor:** function Object() { [native code] }

#### ForeshadowingStatistics (interface)

伏線の統計情報の型定義

**@constructor:** function Object() { [native code] }

#### useForeshadowing (variable)

伏線データを管理するカスタムフック

**@constructor:** function Object() { [native code] }

#### fetchForeshadowingData (variable)

バックエンドから伏線データを取得する

**@constructor:** function Object() { [native code] }

#### addForeshadowingElement (variable)

新しい伏線を追加する

**@constructor:** function Object() { [native code] }

#### resolveForeshadowingElement (variable)

伏線の解決をマークする

**@constructor:** function Object() { [native code] }

#### updateForeshadowingElement (variable)

伏線要素を更新する

**@constructor:** function Object() { [native code] }

#### deleteForeshadowingElement (variable)

伏線要素を削除する

**@constructor:** function Object() { [native code] }

#### suggestForeshadowingToResolve (variable)

現在のチャプターで解決すべき伏線を推奨

**@constructor:** function Object() { [native code] }

#### convertToForeshadowingElement (variable)

バックエンドの伏線データをUI用に変換する

**@constructor:** function Object() { [native code] }

#### mapPriorityToUrgency (variable)

優先度文字列を緊急度文字列に変換する

**@constructor:** function Object() { [native code] }

#### mapUrgencyToPriority (variable)

緊急度文字列を優先度に変換する

**@constructor:** function Object() { [native code] }

#### calculateStatistics (variable)

伏線要素から統計情報を計算する

**@constructor:** function Object() { [native code] }


---

### performance-analyzer copy.ts {#cnovel-automation-systemsrclibanalysisperformance-analyzer-copyts}

**Path:** `C:/novel-automation-system/src/lib/analysis/#/performance-analyzer copy.ts`

//  * パフォーマンス分析器
//  * システム全体のパフォーマンスを測定・分析する
//

**@constructor:** function Object() { [native code] }


---

### performance-analyzer.ts {#cnovel-automation-systemsrclibanalysisperformance-analyzerts}

**Path:** `C:/novel-automation-system/src/lib/analysis/performance-analyzer.ts`

@fileoverview パフォーマンス分析システム@descriptionシステムのパフォーマンス（生成速度、メモリ使用量、API遅延、キャッシュ効率など）を測定・分析するためのモジュール。リアルタイムのパフォーマンスモニタリングと長期的なトレンド分析を提供します。@role- システムのパフォーマンスメトリクス収集と分析- パフォーマンス最適化のための推奨事項の提供- システムヘルスの継続的なモニタリング@dependencies- @/types/analysis - パフォーマンス関連の型定義- @/lib/utils/logger - ログ出力機能- @/lib/storage - データ永続化機能（インポートされているが現在未使用）- @/lib/utils/error-handler - エラーハンドリングとログ出力@types- @/types/analysis - PerformanceMetrics, SpeedMetrics, LatencyMetrics, CacheMetrics@flow1. パフォーマンスアナライザーのインスタンス化2. 各種パフォーマンスイベントの記録（生成、API呼び出し、キャッシュ、エラーなど）3. 定期的なメモリ使用量サンプリング（自動実行）4. パフォーマンス分析レポートの生成（analyzeSystemPerformance呼び出し時）

**@constructor:** function Object() { [native code] }

#### PerformanceAnalyzer (class)

@fileoverview パフォーマンス分析システム@descriptionシステムのパフォーマンス（生成速度、メモリ使用量、API遅延、キャッシュ効率など）を測定・分析するためのモジュール。リアルタイムのパフォーマンスモニタリングと長期的なトレンド分析を提供します。@role- システムのパフォーマンスメトリクス収集と分析- パフォーマンス最適化のための推奨事項の提供- システムヘルスの継続的なモニタリング@dependencies- @/types/analysis - パフォーマンス関連の型定義- @/lib/utils/logger - ログ出力機能- @/lib/storage - データ永続化機能（インポートされているが現在未使用）- @/lib/utils/error-handler - エラーハンドリングとログ出力@types- @/types/analysis - PerformanceMetrics, SpeedMetrics, LatencyMetrics, CacheMetrics@flow1. パフォーマンスアナライザーのインスタンス化2. 各種パフォーマンスイベントの記録（生成、API呼び出し、キャッシュ、エラーなど）3. 定期的なメモリ使用量サンプリング（自動実行）4. パフォーマンス分析レポートの生成（analyzeSystemPerformance呼び出し時）/

import { PerformanceMetrics, SpeedMetrics, LatencyMetrics, CacheMetrics } from '@/types/analysis';
import { logger } from '@/lib/utils/logger';
import { storageProvider } from '@/lib/storage';
import { logError, getErrorMessage } from '@/lib/utils/error-handler';

/**@class PerformanceAnalyzer@descriptionシステムのパフォーマンス（生成速度、メモリ使用量、API遅延など）を分析するクラス。様々なパフォーマンスメトリクスを収集・集計・分析し、システムのヘルス状態をモニタリングするための機能を提供します。@role- パフォーマンスメトリクスの収集と保存- 短期・長期のパフォーマンストレンド分析- パフォーマンス最適化のための推奨事項の生成- メモリ使用量の定期的なサンプリング@depends-on- logger - ログ出力のため- logError - エラー記録のため- getErrorMessage - エラーメッセージ抽出のため@lifecycle1. インスタンス化：メトリクス保存用のデータ構造を初期化2. メモリサンプリング開始：定期的（30秒ごと）にメモリ使用量をサンプリング3. 各種イベント記録：API呼び出し、生成処理、キャッシュ操作、エラー発生時に対応するメソッドで記録4. 分析実行：analyzeSystemPerformance()メソッドで総合的な分析を実行5. クリーンアップ：グローバル変数経由でインターバルタイマーをクリーンアップ可能@example-flowアプリケーション → PerformanceAnalyzerインスタンス化 →  定期的なメモリサンプリング（自動） →  各種イベント記録（recordXXX()メソッド） →  analyzeSystemPerformance()呼び出し →  パフォーマンスレポート生成 →  最適化推奨事項の提供

**@constructor:** function Object() { [native code] }

#### Methods of PerformanceAnalyzer

##### PerformanceAnalyzer.constructor (method)

パフォーマンス分析システムを初期化するメトリクス記録用のデータ構造を初期化し、メモリ使用量の定期サンプリングを開始します。インスタンス化時に自動的にメモリモニタリングを開始します。@constructor@usage// パフォーマンスアナライザーの初期化const analyzer = new PerformanceAnalyzer();@call-flow1. メトリクス保存用のデータ構造を初期化2. 開始時間を記録3. メモリ使用量の定期サンプリングを開始4. 初期化完了をログに記録@initialization- 空のメトリクス保存用データ構造を作成- 30秒ごとのメモリサンプリングインターバルを設定- グローバルクリーンアップハンドラを登録@error-handlingメモリサンプリング開始時のエラーをキャッチし、ログに記録

**@constructor:** function Object() { [native code] }

##### PerformanceAnalyzer.analyzeSystemPerformance (method)

システムパフォーマンスを総合的に分析する生成速度、メモリ使用量、API遅延、キャッシュ効率、エラー率を含む総合的なパフォーマンスメトリクスを収集・分析します。@async@returns {Promise<PerformanceMetrics>} システムパフォーマンスの総合分析結果@usage// パフォーマンス分析の実行const metrics = await performanceAnalyzer.analyzeSystemPerformance();console.log(metrics.generationSpeed.tokenPerSecond); // トークン生成速度の確認@call-flow1. 分析開始をログに記録2. 各種パフォーマンスメトリクスを測定   - 生成速度の測定   - メモリ使用量の測定   - API遅延の測定   - キャッシュ効率の測定   - エラー率の計算3. 測定結果を組み合わせて総合レポートを作成@helper-methods- measureGenerationSpeed - 生成速度測定- measureMemoryUsage - メモリ使用量測定- measureApiLatency - API遅延測定- measureCacheEfficiency - キャッシュ効率測定- calculateErrorRate - エラー率計算@error-handlingエラー発生時も部分的な情報を返すようにしています。エラーをログに記録した後、デフォルト値を使用して可能な限り情報を返します。@performance-considerationsエラーが発生しても完全に失敗せず、利用可能な情報は返すように設計されています。@monitoring- ログレベル: INFO/ERROR

**@constructor:** function Object() { [native code] }

##### PerformanceAnalyzer.measureGenerationSpeed (method)

生成速度を測定する最近の生成速度データを分析し、平均生成時間、トークンあたりの速度、効率（理想値との比較）、トレンドなどを計算します。@async@returns {Promise<SpeedMetrics>} 生成速度に関するメトリクス@usage// 生成速度の測定const speedMetrics = await performanceAnalyzer.measureGenerationSpeed();console.log(`トークン/秒: ${speedMetrics.tokenPerSecond}`);@call-flow1. 最近の生成速度レコード（最大10件）を取得2. 平均生成時間を計算3. トークンあたりの速度を計算4. 理想値との比較による効率を計算5. 速度トレンドを分析6. 計算結果をまとめて返却@helper-methods- analyzeSpeedTrend - 速度トレンドの分析- getDefaultSpeedMetrics - デフォルト値の取得@error-handlingエラー発生時はログに記録し、デフォルト値を返します@performance-considerations計算は最近の10件のレコードのみを対象とし、計算量を抑えています

**@constructor:** function Object() { [native code] }

##### PerformanceAnalyzer.analyzeSpeedTrend (method)

生成速度の傾向を分析する

**@constructor:** function Object() { [native code] }

##### PerformanceAnalyzer.measureMemoryUsage (method)

メモリ使用量を測定する収集されたメモリサンプルを分析し、平均使用量、ピーク使用量、使用量のトレンドなどを計算します。@async@returns {Promise<PerformanceMetrics['memoryUsage']>} メモリ使用量に関するメトリクス@usage// メモリ使用量の測定const memoryMetrics = await performanceAnalyzer.measureMemoryUsage();console.log(`平均メモリ使用量: ${memoryMetrics.average}MB`);@call-flow1. 記録されたメモリサンプルを取得2. 現在のメモリ使用量を取得（最新サンプル）3. 平均メモリ使用量を計算4. ピークメモリ使用量を特定5. メモリ使用量のトレンドを分析6. 計算結果をまとめて返却@helper-methods- analyzeMemoryTrend - メモリトレンドの分析- getDefaultMemoryMetrics - デフォルト値の取得@error-handlingエラー発生時はログに記録し、デフォルト値を返します

**@constructor:** function Object() { [native code] }

##### PerformanceAnalyzer.analyzeMemoryTrend (method)

メモリ使用量の傾向を分析する

**@constructor:** function Object() { [native code] }

##### PerformanceAnalyzer.measureApiLatency (method)

API遅延を測定する記録されたAPIエンドポイントごとの遅延データを分析し、平均遅延、p95遅延、エンドポイント別の内訳、遅延トレンドなどを計算します。@async@returns {Promise<LatencyMetrics>} API遅延に関するメトリクス@usage// API遅延の測定const latencyMetrics = await performanceAnalyzer.measureApiLatency();console.log(`平均API遅延: ${latencyMetrics.average}ms`);@call-flow1. 記録されたAPIエンドポイント遅延データを取得2. すべてのエンドポイントの遅延を結合3. 全体の平均遅延を計算4. 全体のp95遅延を計算5. エンドポイント別の統計を計算6. 遅延のトレンドを分析7. 計算結果をまとめて返却@helper-methods- calculatePercentile - パーセンタイルの計算- analyzeLatencyTrend - 遅延トレンドの分析- getDefaultLatencyMetrics - デフォルト値の取得@error-handlingエラー発生時はログに記録し、デフォルト値を返します

**@constructor:** function Object() { [native code] }

##### PerformanceAnalyzer.analyzeLatencyTrend (method)

遅延の傾向を分析する

**@constructor:** function Object() { [native code] }

##### PerformanceAnalyzer.measureCacheEfficiency (method)

キャッシュ効率を測定する記録されたキャッシュイベント（ヒット、ミス、削除）を分析し、ヒット率、ミス率、削除率、効率のトレンド、改善提案などを計算します。@async@returns {Promise<CacheMetrics>} キャッシュ効率に関するメトリクス@usage// キャッシュ効率の測定const cacheMetrics = await performanceAnalyzer.measureCacheEfficiency();console.log(`キャッシュヒット率: ${cacheMetrics.hitRate * 100}%`);@call-flow1. 記録されたキャッシュサンプルを取得2. ヒット、ミス、削除の合計を集計3. 各種レート（ヒット率、ミス率、削除率）を計算4. キャッシュ効率のトレンドを分析5. 改善提案を生成6. 履歴データを作成7. 計算結果をまとめて返却@helper-methods- analyzeCacheTrend - キャッシュトレンドの分析- generateCacheRecommendations - キャッシュ改善提案の生成- getDefaultCacheMetrics - デフォルト値の取得@error-handlingエラー発生時はログに記録し、デフォルト値を返します

**@constructor:** function Object() { [native code] }

##### PerformanceAnalyzer.analyzeCacheTrend (method)

キャッシュの傾向を分析する

**@constructor:** function Object() { [native code] }

##### PerformanceAnalyzer.generateCacheRecommendations (method)

キャッシュの改善提案を生成する

**@constructor:** function Object() { [native code] }

##### PerformanceAnalyzer.calculateErrorRate (method)

エラー率を計算する記録されたエラーイベントを分析し、全体のエラー率、タイプ別エラー率、重大度別エラー率、トレンド、改善提案などを計算します。@async@returns {Promise<PerformanceMetrics['errorRate']>} エラー率に関するメトリクス@usage// エラー率の計算const errorRateMetrics = await performanceAnalyzer.calculateErrorRate();console.log(`全体エラー率: ${errorRateMetrics.overall * 100}%`);@call-flow1. 記録されたエラーレコードを取得2. 総リクエスト数を推定（エラーは全体の10%と仮定）3. 全体エラー率を計算4. タイプ別エラー率を計算5. 重大度別エラー率を計算6. エラートレンドを分析7. 改善提案を生成8. 計算結果をまとめて返却@helper-methods- analyzeErrorTrend - エラートレンドの分析- generateErrorRecommendations - エラー改善提案の生成- groupBy - データのグループ化@error-handlingエラー発生時はログに記録し、デフォルト値を返します@note総リクエスト数は推定値であり、実際の実装では正確に計測する必要があります

**@constructor:** function Object() { [native code] }

##### PerformanceAnalyzer.analyzeErrorTrend (method)

エラーの傾向を分析する

**@constructor:** function Object() { [native code] }

##### PerformanceAnalyzer.generateErrorRecommendations (method)

エラーの改善提案を生成する

**@constructor:** function Object() { [native code] }

##### PerformanceAnalyzer.recordGeneration (method)

生成イベントを記録する生成処理の実行時間とトークン数を記録し、後の分析に使用します。@param {number} totalTime - 生成にかかった合計時間（ミリ秒）@param {number} tokenCount - 生成されたトークン数@param {Date} [timestamp=new Date()] - タイムスタンプ（デフォルトは現在時刻）@usage// 生成イベントの記録performanceAnalyzer.recordGeneration(1200, 150); // 1.2秒で150トークン生成@call-flow1. 新しい生成メトリクスレコードを作成2. メトリクス配列に追加3. 配列サイズが上限（100件）を超えた場合、古いレコードを削除@state-changesmetrics.speed 配列に新しいレコードが追加されます

**@constructor:** function Object() { [native code] }

##### PerformanceAnalyzer.recordApiCall (method)

API呼び出しを記録する

APIエンドポイントの呼び出し結果（遅延、成功/失敗）を記録し、後の分析に使用します。

@param endpoint — 呼び出したAPIエンドポイント

@param latency — 呼び出しにかかった時間（ミリ秒）

@param success — 呼び出しが成功したかどうか

@param timestamp — タイムスタンプ（デフォルトは現在時刻）

@usage
// API呼び出しの記録 performanceAnalyzer.recordApiCall('/api/generate', 350, true); // 成功 performanceAnalyzer.recordApiCall('/api/analyze', 500, false); // 失敗

@call-flow

エンドポイント用の配列が存在しない場合は初期化
新しい遅延サンプルを作成
エンドポイント別のサンプル配列に追加
配列サイズが上限（100件）を超えた場合、古いサンプルを削除
呼び出しが失敗した場合、エラーとしても記録
@state-changes
metrics.latency[endpoint] 配列に新しいサンプルが追加されます 失敗した場合は metrics.errors にもエラーが追加されます

@helper-methods — - recordError - エラーの記録（呼び出し失敗時）

**@constructor:** function Object() { [native code] }

##### PerformanceAnalyzer.recordCacheEvent (method)

キャッシュイベントを記録するキャッシュの使用状況（ヒット数、ミス数、削除数）を記録し、後の分析に使用します。@param {number} hits - キャッシュヒット数@param {number} misses - キャッシュミス数@param {number} evictions - キャッシュ削除数@param {Date} [timestamp=new Date()] - タイムスタンプ（デフォルトは現在時刻）@usage// キャッシュイベントの記録performanceAnalyzer.recordCacheEvent(45, 5, 2); // 45ヒット、5ミス、2削除@call-flow1. 新しいキャッシュサンプルを作成2. サンプル配列に追加3. 配列サイズが上限（100件）を超えた場合、古いサンプルを削除@state-changesmetrics.cache 配列に新しいサンプルが追加されます

**@constructor:** function Object() { [native code] }

##### PerformanceAnalyzer.recordError (method)

エラーを記録するシステム内で発生したエラーを記録し、後の分析に使用します。@param {string} type - エラータイプ@param {string} message - エラーメッセージ@param {'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'} severity - エラーの重大度@param {number} [count=1] - エラーの発生回数@param {Date} [timestamp=new Date()] - タイムスタンプ（デフォルトは現在時刻）@usage// エラーの記録performanceAnalyzer.recordError('DATABASE_ERROR', '接続失敗', 'HIGH');@call-flow1. 新しいエラーレコードを作成2. エラー配列に追加3. 配列サイズが上限（200件）を超えた場合、古いレコードを削除4. 重大度が高い（HIGH/CRITICAL）場合はログにも記録@state-changesmetrics.errors 配列に新しいレコードが追加されます@monitoring- 重大度が HIGH または CRITICAL の場合、ERROR レベルでログに記録

**@constructor:** function Object() { [native code] }

##### PerformanceAnalyzer.startMemorySampling (method)

メモリ使用量のサンプリングを開始する定期的（30秒ごと）にシステムのメモリ使用量をサンプリングし、内部データ構造に記録します。@private@call-flow1. 初回のメモリ使用量サンプリングを実行2. 30秒ごとのインターバルタイマーを設定3. メモリリーク防止のためのクリーンアップ関数をグローバルスコープに登録@error-handling初期化時およびサンプリング実行時のエラーをキャッチし、ログに記録@state-changesmetrics.memory 配列に定期的に新しいサンプルが追加されますglobalThis.__performanceAnalyzerCleanup にクリーンアップ関数が登録されます@helper-methods- recordMemorySample - メモリサンプルの記録

**@constructor:** function Object() { [native code] }

##### PerformanceAnalyzer.recordMemorySample (method)

メモリサンプルを記録するシステムのメモリ使用状況を内部データ構造に記録します。サンプル数が上限を超えた場合は古いサンプルを削除します。@private@param {number} used - 使用中のメモリ量（MB単位）@param {number} total - 合計メモリ量（MB単位）@param {number} [external] - 外部メモリ量（MB単位、オプション）@call-flow1. 新しいメモリサンプルを作成2. サンプル配列に追加3. 配列サイズが上限（1000件）を超えた場合、古いサンプルを削除@state-changesmetrics.memory 配列に新しいサンプルが追加されます

**@constructor:** function Object() { [native code] }

##### PerformanceAnalyzer.calculatePercentile (method)

パーセンタイルを計算する数値配列から指定されたパーセンタイル値を計算します。例えば、95パーセンタイルは、値の95%がその値以下となる閾値です。@private@param {number[]} values - パーセンタイルを計算する数値の配列@param {number} percentile - 計算するパーセンタイル（0-100）@returns {number} 計算されたパーセンタイル値@call-flow1. 配列が空の場合は0を返す2. 数値配列をソート3. パーセンタイルに対応するインデックスを計算4. 該当インデックスの値を返却@error-handling配列が空の場合は0を返します

**@constructor:** function Object() { [native code] }

##### PerformanceAnalyzer.getDefaultSpeedMetrics (method)

配列をキーでグループ化する配列内のオブジェクトを指定されたキーでグループ化し、キーごとのオブジェクト配列を持つオブジェクトを返します。@private@template T@param {T[]} array - グループ化する配列@param {keyof T} key - グループ化に使用するオブジェクトのキー@returns {Record<string, T[]>} グループ化された結果@call-flow1. 空のグループオブジェクトを作成2. 配列の各要素に対して処理3. 要素のキー値を文字列に変換4. キーに対応するグループがない場合は初期化5. 要素を適切なグループに追加@usage// 内部で使用される例：エラーをタイプでグループ化const typeGroups = this.groupBy(errors, 'type');/
private groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
return array.reduce((groups, item) => {
const value = String(item[key]);
if (!groups[value]) {
groups[value] = [];
}
groups[value].push(item);
return groups;
}, {} as Record<string, T[]>);
}

/**デフォルトの速度メトリクスを取得する速度メトリクスの初期値または計算不能時のデフォルト値を提供します。@private@returns {SpeedMetrics} デフォルトの速度メトリクス@call-flow1. デフォルト値を設定した速度メトリクスオブジェクトを作成2. 作成したオブジェクトを返却@usage// 内部で使用される例：データが不足している場合や// エラー発生時のフォールバック値return this.getDefaultSpeedMetrics();

**@constructor:** function Object() { [native code] }

##### PerformanceAnalyzer.getDefaultMemoryMetrics (method)

デフォルトのメモリメトリクスを取得するメモリ使用量メトリクスの初期値または計算不能時のデフォルト値を提供します。@private@returns {PerformanceMetrics['memoryUsage']} デフォルトのメモリ使用量メトリクス@call-flow1. デフォルト値を設定したメモリ使用量メトリクスオブジェクトを作成2. 作成したオブジェクトを返却@usage// 内部で使用される例：データが不足している場合や// エラー発生時のフォールバック値return this.getDefaultMemoryMetrics();

**@constructor:** function Object() { [native code] }

##### PerformanceAnalyzer.getDefaultLatencyMetrics (method)

デフォルトの遅延メトリクスを取得するAPI遅延メトリクスの初期値または計算不能時のデフォルト値を提供します。@private@returns {LatencyMetrics} デフォルトの遅延メトリクス@call-flow1. デフォルト値を設定した遅延メトリクスオブジェクトを作成2. 作成したオブジェクトを返却@usage// 内部で使用される例：データが不足している場合や// エラー発生時のフォールバック値return this.getDefaultLatencyMetrics();

**@constructor:** function Object() { [native code] }

##### PerformanceAnalyzer.getDefaultCacheMetrics (method)

デフォルトのキャッシュメトリクスを取得するキャッシュ効率メトリクスの初期値または計算不能時のデフォルト値を提供します。@private@returns {CacheMetrics} デフォルトのキャッシュメトリクス@call-flow1. デフォルト値を設定したキャッシュメトリクスオブジェクトを作成2. 作成したオブジェクトを返却@usage// 内部で使用される例：データが不足している場合や// エラー発生時のフォールバック値return this.getDefaultCacheMetrics();

**@constructor:** function Object() { [native code] }

#### SpeedMetricsRecord (interface)

パフォーマンス分析システムを初期化するメトリクス記録用のデータ構造を初期化し、メモリ使用量の定期サンプリングを開始します。インスタンス化時に自動的にメモリモニタリングを開始します。@constructor@usage// パフォーマンスアナライザーの初期化const analyzer = new PerformanceAnalyzer();@call-flow1. メトリクス保存用のデータ構造を初期化2. 開始時間を記録3. メモリ使用量の定期サンプリングを開始4. 初期化完了をログに記録@initialization- 空のメトリクス保存用データ構造を作成- 30秒ごとのメモリサンプリングインターバルを設定- グローバルクリーンアップハンドラを登録@error-handlingメモリサンプリング開始時のエラーをキャッチし、ログに記録/
constructor() {
this.metrics = {
speed: [],
latency: {},
memory: [],
cache: [],
errors: []
};

this.startTime = new Date();

// メモリ使用量の定期サンプリングを開始
this.startMemorySampling();

logger.info('パフォーマンス分析システムを初期化しました');
}

/**システムパフォーマンスを総合的に分析する生成速度、メモリ使用量、API遅延、キャッシュ効率、エラー率を含む総合的なパフォーマンスメトリクスを収集・分析します。@async@returns {Promise<PerformanceMetrics>} システムパフォーマンスの総合分析結果@usage// パフォーマンス分析の実行const metrics = await performanceAnalyzer.analyzeSystemPerformance();console.log(metrics.generationSpeed.tokenPerSecond); // トークン生成速度の確認@call-flow1. 分析開始をログに記録2. 各種パフォーマンスメトリクスを測定   - 生成速度の測定   - メモリ使用量の測定   - API遅延の測定   - キャッシュ効率の測定   - エラー率の計算3. 測定結果を組み合わせて総合レポートを作成@helper-methods- measureGenerationSpeed - 生成速度測定- measureMemoryUsage - メモリ使用量測定- measureApiLatency - API遅延測定- measureCacheEfficiency - キャッシュ効率測定- calculateErrorRate - エラー率計算@error-handlingエラー発生時も部分的な情報を返すようにしています。エラーをログに記録した後、デフォルト値を使用して可能な限り情報を返します。@performance-considerationsエラーが発生しても完全に失敗せず、利用可能な情報は返すように設計されています。@monitoring- ログレベル: INFO/ERROR/
async analyzeSystemPerformance(): Promise<PerformanceMetrics> {
try {
logger.info('システムパフォーマンス分析を開始します');

return {
generationSpeed: await this.measureGenerationSpeed(),
memoryUsage: await this.measureMemoryUsage(),
apiLatency: await this.measureApiLatency(),
cacheEfficiency: await this.measureCacheEfficiency(),
errorRate: await this.calculateErrorRate(),
};
} catch (error: unknown) {
logError(error, {}, `パフォーマンス分析中にエラーが発生しました`);

// エラー発生時もできるだけ情報を返す
return {
generationSpeed: this.getDefaultSpeedMetrics(),
memoryUsage: this.getDefaultMemoryMetrics(),
apiLatency: this.getDefaultLatencyMetrics(),
cacheEfficiency: this.getDefaultCacheMetrics(),
errorRate: {
overall: 0,
byType: {}
},
};
}
}

/**生成速度を測定する最近の生成速度データを分析し、平均生成時間、トークンあたりの速度、効率（理想値との比較）、トレンドなどを計算します。@async@returns {Promise<SpeedMetrics>} 生成速度に関するメトリクス@usage// 生成速度の測定const speedMetrics = await performanceAnalyzer.measureGenerationSpeed();console.log(`トークン/秒: ${speedMetrics.tokenPerSecond}`);@call-flow1. 最近の生成速度レコード（最大10件）を取得2. 平均生成時間を計算3. トークンあたりの速度を計算4. 理想値との比較による効率を計算5. 速度トレンドを分析6. 計算結果をまとめて返却@helper-methods- analyzeSpeedTrend - 速度トレンドの分析- getDefaultSpeedMetrics - デフォルト値の取得@error-handlingエラー発生時はログに記録し、デフォルト値を返します@performance-considerations計算は最近の10件のレコードのみを対象とし、計算量を抑えています/
async measureGenerationSpeed(): Promise<SpeedMetrics> {
try {
// 最近の生成速度データを使用
const recentRecords = this.metrics.speed.slice(-10);

if (recentRecords.length === 0) {
return this.getDefaultSpeedMetrics();
}

// 平均生成時間
const totalTime = recentRecords.reduce((sum, record) => sum + record.totalTime, 0);
const averageTime = totalTime / recentRecords.length;

// トークンあたりの速度
const totalTokens = recentRecords.reduce((sum, record) => sum + record.tokenCount, 0);
const tokenPerSecond = (totalTokens / totalTime) * 1000; // ミリ秒→秒に変換

// 効率（理想値との比較）
const idealTokensPerSecond = 30; // 理想的なトークン/秒の値
const efficiency = Math.min(tokenPerSecond / idealTokensPerSecond, 1);

// 傾向の分析
const trend = this.analyzeSpeedTrend(recentRecords);

return {
averageTime,
tokenPerSecond,
efficiency,
trend,
recentHistory: recentRecords.map(r => ({
averageTime: r.totalTime,
tokenPerSecond: (r.tokenCount / r.totalTime) * 1000,
efficiency: Math.min((r.tokenCount / r.totalTime) * 1000 / idealTokensPerSecond, 1)
}))
};
} catch (error: unknown) {
logError(error, {}, `生成速度測定中にエラーが発生しました`);

return this.getDefaultSpeedMetrics();
}
}

/**生成速度の傾向を分析する/
private analyzeSpeedTrend(records: SpeedMetricsRecord[]): 'IMPROVING' | 'STABLE' | 'DECLINING' {
if (records.length < 3) return 'STABLE';

// 最初と最後の1/3ずつを比較
const firstThird = records.slice(0, Math.floor(records.length / 3));
const lastThird = records.slice(-Math.floor(records.length / 3));

const firstAvg = firstThird.reduce((sum, r) => sum + r.totalTime, 0) / firstThird.length;
const lastAvg = lastThird.reduce((sum, r) => sum + r.totalTime, 0) / lastThird.length;

// 10%以上の変化があれば傾向ありとみなす
const changeRatio = (firstAvg - lastAvg) / firstAvg;

if (changeRatio > 0.1) return 'IMPROVING'; // 時間が減少=改善
if (changeRatio < -0.1) return 'DECLINING'; // 時間が増加=悪化
return 'STABLE';
}

/**メモリ使用量を測定する収集されたメモリサンプルを分析し、平均使用量、ピーク使用量、使用量のトレンドなどを計算します。@async@returns {Promise<PerformanceMetrics['memoryUsage']>} メモリ使用量に関するメトリクス@usage// メモリ使用量の測定const memoryMetrics = await performanceAnalyzer.measureMemoryUsage();console.log(`平均メモリ使用量: ${memoryMetrics.average}MB`);@call-flow1. 記録されたメモリサンプルを取得2. 現在のメモリ使用量を取得（最新サンプル）3. 平均メモリ使用量を計算4. ピークメモリ使用量を特定5. メモリ使用量のトレンドを分析6. 計算結果をまとめて返却@helper-methods- analyzeMemoryTrend - メモリトレンドの分析- getDefaultMemoryMetrics - デフォルト値の取得@error-handlingエラー発生時はログに記録し、デフォルト値を返します/
async measureMemoryUsage(): Promise<PerformanceMetrics['memoryUsage']> {
try {
const samples = this.metrics.memory;

if (samples.length === 0) {
return this.getDefaultMemoryMetrics();
}

// 現在のメモリ使用量
const current = samples[samples.length - 1];

// 平均メモリ使用量
const totalUsed = samples.reduce((sum, sample) => sum + sample.used, 0);
const average = totalUsed / samples.length;

// ピークメモリ使用量
const peak = Math.max(...samples.map(sample => sample.used));

// トレンドの計算
const trend = this.analyzeMemoryTrend(samples);

return {
average,
peak,
trend,
current: {
total: current.total,
used: current.used,
external: current.external || 0
},
history: samples.map(sample => ({
timestamp: sample.timestamp,
used: sample.used
}))
};
} catch (error: unknown) {
logError(error, {}, `メモリ使用量測定中にエラーが発生しました`);
return this.getDefaultMemoryMetrics();
}
}

/**メモリ使用量の傾向を分析する/
private analyzeMemoryTrend(samples: MemorySample[]): 'INCREASING' | 'STABLE' | 'DECREASING' {
if (samples.length < 10) return 'STABLE';

// 最初と最後の1/4ずつを比較
const firstQuarter = samples.slice(0, Math.floor(samples.length / 4));
const lastQuarter = samples.slice(-Math.floor(samples.length / 4));

const firstAvg = firstQuarter.reduce((sum, s) => sum + s.used, 0) / firstQuarter.length;
const lastAvg = lastQuarter.reduce((sum, s) => sum + s.used, 0) / lastQuarter.length;

// 15%以上の変化があれば傾向ありとみなす
const changeRatio = (lastAvg - firstAvg) / firstAvg;

if (changeRatio > 0.15) return 'INCREASING';
if (changeRatio < -0.15) return 'DECREASING';
return 'STABLE';
}

/**API遅延を測定する記録されたAPIエンドポイントごとの遅延データを分析し、平均遅延、p95遅延、エンドポイント別の内訳、遅延トレンドなどを計算します。@async@returns {Promise<LatencyMetrics>} API遅延に関するメトリクス@usage// API遅延の測定const latencyMetrics = await performanceAnalyzer.measureApiLatency();console.log(`平均API遅延: ${latencyMetrics.average}ms`);@call-flow1. 記録されたAPIエンドポイント遅延データを取得2. すべてのエンドポイントの遅延を結合3. 全体の平均遅延を計算4. 全体のp95遅延を計算5. エンドポイント別の統計を計算6. 遅延のトレンドを分析7. 計算結果をまとめて返却@helper-methods- calculatePercentile - パーセンタイルの計算- analyzeLatencyTrend - 遅延トレンドの分析- getDefaultLatencyMetrics - デフォルト値の取得@error-handlingエラー発生時はログに記録し、デフォルト値を返します/
async measureApiLatency(): Promise<LatencyMetrics> {
try {
const latencies = this.metrics.latency;
const endpoints = Object.keys(latencies);

if (endpoints.length === 0) {
return this.getDefaultLatencyMetrics();
}

// 全エンドポイントの遅延を結合
const allLatencies = Object.values(latencies).flat().map(sample => sample.latency);

// 平均遅延
const average = allLatencies.length > 0
? allLatencies.reduce((sum, lat) => sum + lat, 0) / allLatencies.length
: 0;

// p95遅延
const p95 = this.calculatePercentile(allLatencies, 95);

// エンドポイント別の内訳
const breakdown: Record<string, {
average: number;
p95: number;
min?: number;
max?: number;
count?: number;
}> = {};

for (const [endpoint, samples] of Object.entries(latencies)) {
if (samples.length === 0) continue;

const endpointLatencies = samples.map(sample => sample.latency);

breakdown[endpoint] = {
average: endpointLatencies.reduce((sum, lat) => sum + lat, 0) / endpointLatencies.length,
p95: this.calculatePercentile(endpointLatencies, 95),
min: Math.min(...endpointLatencies),
max: Math.max(...endpointLatencies),
count: samples.length
};
}

// トレンドの分析
const trend = this.analyzeLatencyTrend(latencies);

return {
average,
p95,
breakdown,
trend
};
} catch (error: unknown) {
logError(error, {}, `API遅延測定中にエラーが発生しました`);
return this.getDefaultLatencyMetrics();
}
}

/**遅延の傾向を分析する/
private analyzeLatencyTrend(latencies: Record<string, LatencySample[]>): 'IMPROVING' | 'STABLE' | 'DEGRADING' {
// 最近のサンプルが十分にあるエンドポイントだけを分析
const eligibleEndpoints = Object.entries(latencies)
.filter(([_, samples]) => samples.length >= 10)
.map(([endpoint, samples]) => {
// 日付でソート
samples.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

// 最初と最後の1/3ずつを比較
const firstThird = samples.slice(0, Math.floor(samples.length / 3));
const lastThird = samples.slice(-Math.floor(samples.length / 3));

const firstAvg = firstThird.reduce((sum, s) => sum + s.latency, 0) / firstThird.length;
const lastAvg = lastThird.reduce((sum, s) => sum + s.latency, 0) / lastThird.length;

// 変化率
return (firstAvg - lastAvg) / firstAvg;
});

if (eligibleEndpoints.length === 0) return 'STABLE';

// 平均変化率
const avgChange = eligibleEndpoints.reduce((sum, change) => sum + change, 0) / eligibleEndpoints.length;

// 15%以上の変化があれば傾向ありとみなす
if (avgChange > 0.15) return 'IMPROVING'; // 遅延が減少=改善
if (avgChange < -0.15) return 'DEGRADING'; // 遅延が増加=悪化
return 'STABLE';
}

/**キャッシュ効率を測定する記録されたキャッシュイベント（ヒット、ミス、削除）を分析し、ヒット率、ミス率、削除率、効率のトレンド、改善提案などを計算します。@async@returns {Promise<CacheMetrics>} キャッシュ効率に関するメトリクス@usage// キャッシュ効率の測定const cacheMetrics = await performanceAnalyzer.measureCacheEfficiency();console.log(`キャッシュヒット率: ${cacheMetrics.hitRate * 100}%`);@call-flow1. 記録されたキャッシュサンプルを取得2. ヒット、ミス、削除の合計を集計3. 各種レート（ヒット率、ミス率、削除率）を計算4. キャッシュ効率のトレンドを分析5. 改善提案を生成6. 履歴データを作成7. 計算結果をまとめて返却@helper-methods- analyzeCacheTrend - キャッシュトレンドの分析- generateCacheRecommendations - キャッシュ改善提案の生成- getDefaultCacheMetrics - デフォルト値の取得@error-handlingエラー発生時はログに記録し、デフォルト値を返します/
async measureCacheEfficiency(): Promise<CacheMetrics> {
try {
const samples = this.metrics.cache;

if (samples.length === 0) {
return this.getDefaultCacheMetrics();
}

// サンプルを集計
const totalHits = samples.reduce((sum, sample) => sum + sample.hits, 0);
const totalMisses = samples.reduce((sum, sample) => sum + sample.misses, 0);
const totalEvictions = samples.reduce((sum, sample) => sum + sample.evictions, 0);
const totalRequests = totalHits + totalMisses;

// レート計算
const hitRate = totalRequests > 0 ? totalHits / totalRequests : 0;
const missRate = totalRequests > 0 ? totalMisses / totalRequests : 0;
const evictionRate = totalRequests > 0 ? totalEvictions / totalRequests : 0;

// トレンドの分析
const trend = this.analyzeCacheTrend(samples);

// 改善提案の生成
const recommendations = this.generateCacheRecommendations(hitRate, evictionRate, trend);

// 履歴データの作成
const history = samples.map(sample => {
const total = sample.hits + sample.misses;
return {
timestamp: sample.timestamp,
hitRate: total > 0 ? sample.hits / total : 0,
missRate: total > 0 ? sample.misses / total : 0,
evictionRate: total > 0 ? sample.evictions / total : 0
};
});

return {
hitRate,
missRate,
evictionRate,
trend,
recommendations,
history
};
} catch (error: unknown) {
logError(error, {}, `キャッシュ効率測定中にエラーが発生しました`);
return this.getDefaultCacheMetrics();
}
}

/**キャッシュの傾向を分析する/
private analyzeCacheTrend(samples: CacheSample[]): 'IMPROVING' | 'STABLE' | 'DEGRADING' {
if (samples.length < 5) return 'STABLE';

// 日付でソート
samples.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

// 最初と最後の1/3ずつを比較
const firstThird = samples.slice(0, Math.floor(samples.length / 3));
const lastThird = samples.slice(-Math.floor(samples.length / 3));

// ヒット率の比較
const firstHitRate = firstThird.reduce((sum, s) => {
const total = s.hits + s.misses;
return sum + (total > 0 ? s.hits / total : 0);
}, 0) / firstThird.length;

const lastHitRate = lastThird.reduce((sum, s) => {
const total = s.hits + s.misses;
return sum + (total > 0 ? s.hits / total : 0);
}, 0) / lastThird.length;

// 変化率
const changeRatio = (lastHitRate - firstHitRate) / (firstHitRate || 1);

// 10%以上の変化があれば傾向ありとみなす
if (changeRatio > 0.1) return 'IMPROVING'; // ヒット率が増加=改善
if (changeRatio < -0.1) return 'DEGRADING'; // ヒット率が減少=悪化
return 'STABLE';
}

/**キャッシュの改善提案を生成する/
private generateCacheRecommendations(hitRate: number, evictionRate: number, trend: 'IMPROVING' | 'STABLE' | 'DEGRADING'): string[] {
const recommendations: string[] = [];

// ヒット率に基づく提案
if (hitRate < 0.5) {
recommendations.push("キャッシュヒット率が低いため、キャッシュキーの設計を見直すことを検討してください。");
}

// 削除率に基づく提案
if (evictionRate > 0.1) {
recommendations.push("キャッシュ削除率が高いため、キャッシュサイズの増加を検討してください。");
}

// トレンドに基づく提案
if (trend === 'DEGRADING') {
recommendations.push("キャッシュパフォーマンスが悪化しています。データアクセスパターンの変化がないか確認してください。");
}

// 特に問題がない場合
if (recommendations.length === 0) {
if (hitRate > 0.8) {
recommendations.push("キャッシュは効率的に動作しています。現在の設定を維持してください。");
} else {
recommendations.push("キャッシュは許容範囲内で動作しています。必要に応じて設定を微調整してください。");
}
}

return recommendations;
}

/**エラー率を計算する記録されたエラーイベントを分析し、全体のエラー率、タイプ別エラー率、重大度別エラー率、トレンド、改善提案などを計算します。@async@returns {Promise<PerformanceMetrics['errorRate']>} エラー率に関するメトリクス@usage// エラー率の計算const errorRateMetrics = await performanceAnalyzer.calculateErrorRate();console.log(`全体エラー率: ${errorRateMetrics.overall * 100}%`);@call-flow1. 記録されたエラーレコードを取得2. 総リクエスト数を推定（エラーは全体の10%と仮定）3. 全体エラー率を計算4. タイプ別エラー率を計算5. 重大度別エラー率を計算6. エラートレンドを分析7. 改善提案を生成8. 計算結果をまとめて返却@helper-methods- analyzeErrorTrend - エラートレンドの分析- generateErrorRecommendations - エラー改善提案の生成- groupBy - データのグループ化@error-handlingエラー発生時はログに記録し、デフォルト値を返します@note総リクエスト数は推定値であり、実際の実装では正確に計測する必要があります/
async calculateErrorRate(): Promise<PerformanceMetrics['errorRate']> {
try {
const errors = this.metrics.errors;

if (errors.length === 0) {
return {
overall: 0,
byType: {}
};
}

// 総リクエスト数の推定
// 実際の実装ではリクエスト総数を正確に計測する必要がある
const totalRequests = errors.reduce((sum, record) => sum + record.count, 0) * 10; // エラーは10%程度と仮定

// 全体エラー率
const totalErrors = errors.reduce((sum, record) => sum + record.count, 0);
const overall = totalRequests > 0 ? totalErrors / totalRequests : 0;

// タイプ別エラー率
const byType: Record<string, { count: number, rate: number }> = {};

// エラータイプでグループ化
const typeGroups = this.groupBy(errors, 'type');

for (const [type, records] of Object.entries(typeGroups)) {
const typeCount = records.reduce((sum, record) => sum + record.count, 0);
byType[type] = {
count: typeCount,
rate: totalRequests > 0 ? typeCount / totalRequests : 0
};
}

// 重大度別エラー率
const bySeverity: Record<string, number> = {};

// 重大度でグループ化
const severityGroups = this.groupBy(errors, 'severity');

for (const [severity, records] of Object.entries(severityGroups)) {
const severityCount = records.reduce((sum, record) => sum + record.count, 0);
bySeverity[severity] = totalRequests > 0 ? severityCount / totalRequests : 0;
}

// トレンドの分析
const trend = this.analyzeErrorTrend(errors);

// 改善提案の生成
const recommendations = this.generateErrorRecommendations(overall, byType);

return {
overall,
byType,
bySeverity,
trend,
recommendations
};
} catch (error: unknown) {
logError(error, {}, `エラー率計算中にエラーが発生しました`);
return {
overall: 0,
byType: {}
};
}
}

/**エラーの傾向を分析する/
private analyzeErrorTrend(errors: ErrorRecord[]): string {
if (errors.length < 10) return 'INSUFFICIENT_DATA';

// 日付でソート
errors.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

// 直近1/3と最初の1/3を比較
const firstThird = errors.slice(0, Math.floor(errors.length / 3));
const lastThird = errors.slice(-Math.floor(errors.length / 3));

const firstCount = firstThird.reduce((sum, e) => sum + e.count, 0);
const lastCount = lastThird.reduce((sum, e) => sum + e.count, 0);

// 変化率
const changeRatio = firstCount > 0 ? (lastCount - firstCount) / firstCount : 0;

if (changeRatio > 0.2) return 'INCREASING';
if (changeRatio < -0.2) return 'DECREASING';
return 'STABLE';
}

/**エラーの改善提案を生成する/
private generateErrorRecommendations(overall: number, byType: Record<string, { count: number, rate: number }>): string[] {
const recommendations: string[] = [];

// 全体エラー率に基づく提案
if (overall > 0.05) {
recommendations.push("全体のエラー率が高いため、システム全体の安定性向上が必要です。");
}

// タイプ別エラーに基づく提案
const sortedTypes = Object.entries(byType)
.sort((a, b) => b[1].count - a[1].count)
.slice(0, 3);

for (const [type, { count, rate }] of sortedTypes) {
if (rate > 0.01) {
recommendations.push(`「${type}」エラーが多発しています。このタイプのエラー処理を強化してください。`);
}
}

// 特に問題がない場合
if (recommendations.length === 0) {
recommendations.push("エラー率は許容範囲内です。現在のエラー処理を維持してください。");
}

return recommendations;
}

/**生成イベントを記録する生成処理の実行時間とトークン数を記録し、後の分析に使用します。@param {number} totalTime - 生成にかかった合計時間（ミリ秒）@param {number} tokenCount - 生成されたトークン数@param {Date} [timestamp=new Date()] - タイムスタンプ（デフォルトは現在時刻）@usage// 生成イベントの記録performanceAnalyzer.recordGeneration(1200, 150); // 1.2秒で150トークン生成@call-flow1. 新しい生成メトリクスレコードを作成2. メトリクス配列に追加3. 配列サイズが上限（100件）を超えた場合、古いレコードを削除@state-changesmetrics.speed 配列に新しいレコードが追加されます/

recordGeneration(totalTime: number, tokenCount: number, timestamp = new Date()): void {
this.metrics.speed.push({
totalTime,
tokenCount,
timestamp
});

// 最大100件まで保持
if (this.metrics.speed.length > 100) {
this.metrics.speed.shift();
}
}

/**
API呼び出しを記録する

APIエンドポイントの呼び出し結果（遅延、成功/失敗）を記録し、後の分析に使用します。

@param endpoint — 呼び出したAPIエンドポイント

@param latency — 呼び出しにかかった時間（ミリ秒）

@param success — 呼び出しが成功したかどうか

@param timestamp — タイムスタンプ（デフォルトは現在時刻）

@usage
// API呼び出しの記録 performanceAnalyzer.recordApiCall('/api/generate', 350, true); // 成功 performanceAnalyzer.recordApiCall('/api/analyze', 500, false); // 失敗

@call-flow

エンドポイント用の配列が存在しない場合は初期化
新しい遅延サンプルを作成
エンドポイント別のサンプル配列に追加
配列サイズが上限（100件）を超えた場合、古いサンプルを削除
呼び出しが失敗した場合、エラーとしても記録
@state-changes
metrics.latency[endpoint] 配列に新しいサンプルが追加されます 失敗した場合は metrics.errors にもエラーが追加されます

@helper-methods — - recordError - エラーの記録（呼び出し失敗時）/
recordApiCall(endpoint: string, latency: number, success: boolean, timestamp = new Date()): void {
if (!this.metrics.latency[endpoint]) {
this.metrics.latency[endpoint] = [];
}

this.metrics.latency[endpoint].push({
latency,
success,
timestamp
});

// エンドポイントごとに最大100件まで保持
if (this.metrics.latency[endpoint].length > 100) {
this.metrics.latency[endpoint].shift();
}

// エラーの場合はエラー記録にも追加
if (!success) {
this.recordError('API_ERROR', `API Error: ${endpoint}`, 'MEDIUM');
}
}

/**キャッシュイベントを記録するキャッシュの使用状況（ヒット数、ミス数、削除数）を記録し、後の分析に使用します。@param {number} hits - キャッシュヒット数@param {number} misses - キャッシュミス数@param {number} evictions - キャッシュ削除数@param {Date} [timestamp=new Date()] - タイムスタンプ（デフォルトは現在時刻）@usage// キャッシュイベントの記録performanceAnalyzer.recordCacheEvent(45, 5, 2); // 45ヒット、5ミス、2削除@call-flow1. 新しいキャッシュサンプルを作成2. サンプル配列に追加3. 配列サイズが上限（100件）を超えた場合、古いサンプルを削除@state-changesmetrics.cache 配列に新しいサンプルが追加されます/
recordCacheEvent(hits: number, misses: number, evictions: number, timestamp = new Date()): void {
this.metrics.cache.push({
hits,
misses,
evictions,
timestamp
});

// 最大100件まで保持
if (this.metrics.cache.length > 100) {
this.metrics.cache.shift();
}
}

/**エラーを記録するシステム内で発生したエラーを記録し、後の分析に使用します。@param {string} type - エラータイプ@param {string} message - エラーメッセージ@param {'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'} severity - エラーの重大度@param {number} [count=1] - エラーの発生回数@param {Date} [timestamp=new Date()] - タイムスタンプ（デフォルトは現在時刻）@usage// エラーの記録performanceAnalyzer.recordError('DATABASE_ERROR', '接続失敗', 'HIGH');@call-flow1. 新しいエラーレコードを作成2. エラー配列に追加3. 配列サイズが上限（200件）を超えた場合、古いレコードを削除4. 重大度が高い（HIGH/CRITICAL）場合はログにも記録@state-changesmetrics.errors 配列に新しいレコードが追加されます@monitoring- 重大度が HIGH または CRITICAL の場合、ERROR レベルでログに記録/
recordError(type: string, message: string, severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL', count = 1, timestamp = new Date()): void {
this.metrics.errors.push({
type,
message,
severity,
count,
timestamp
});

// 最大200件まで保持
if (this.metrics.errors.length > 200) {
this.metrics.errors.shift();
}

// 重大なエラーの場合はログに記録
if (severity === 'HIGH' || severity === 'CRITICAL') {
// error変数が定義されていないので、新しいErrorオブジェクトを作成
logger.error(`[${severity}] ${type}: ${message}`);
}
}

/**メモリ使用量のサンプリングを開始する定期的（30秒ごと）にシステムのメモリ使用量をサンプリングし、内部データ構造に記録します。@private@call-flow1. 初回のメモリ使用量サンプリングを実行2. 30秒ごとのインターバルタイマーを設定3. メモリリーク防止のためのクリーンアップ関数をグローバルスコープに登録@error-handling初期化時およびサンプリング実行時のエラーをキャッチし、ログに記録@state-changesmetrics.memory 配列に定期的に新しいサンプルが追加されますglobalThis.__performanceAnalyzerCleanup にクリーンアップ関数が登録されます@helper-methods- recordMemorySample - メモリサンプルの記録/
private startMemorySampling(): void {
// 実際の実装では定期的にメモリ使用量を測定
// ブラウザ環境では異なる測定方法が必要

// この実装はNode.js環境を想定
try {
// 初回サンプリング
if (typeof process !== 'undefined' && process.memoryUsage) {
const memory = process.memoryUsage();
this.recordMemorySample(memory.rss / 1024 / 1024, memory.heapTotal / 1024 / 1024, memory.external / 1024 / 1024);
} else {
// ブラウザ環境などの場合はダミーデータ
this.recordMemorySample(100, 200, 10);
}

// 定期サンプリング（30秒ごと）
const interval = setInterval(() => {
try {
if (typeof process !== 'undefined' && process.memoryUsage) {
const memory = process.memoryUsage();
this.recordMemorySample(memory.rss / 1024 / 1024, memory.heapTotal / 1024 / 1024, memory.external / 1024 / 1024);
} else {
// ブラウザ環境などの場合はダミーデータ
const variation = Math.random() * 10 - 5; // -5から+5の変動
this.recordMemorySample(100 + variation, 200, 10);
}
} catch (error: unknown) {
logError(error, {}, `メモリサンプリング中にエラーが発生しました`);
}
}, 30000);

// メモリリークを防ぐためのクリーンアップ
if (typeof globalThis !== 'undefined') {
// @ts-ignore
globalThis.__performanceAnalyzerCleanup = () => {
clearInterval(interval);
};
}
} catch (error: unknown) {
logError(error, {}, `メモリサンプリング初期化中にエラーが発生しました`);
}
}

/**メモリサンプルを記録するシステムのメモリ使用状況を内部データ構造に記録します。サンプル数が上限を超えた場合は古いサンプルを削除します。@private@param {number} used - 使用中のメモリ量（MB単位）@param {number} total - 合計メモリ量（MB単位）@param {number} [external] - 外部メモリ量（MB単位、オプション）@call-flow1. 新しいメモリサンプルを作成2. サンプル配列に追加3. 配列サイズが上限（1000件）を超えた場合、古いサンプルを削除@state-changesmetrics.memory 配列に新しいサンプルが追加されます/
private recordMemorySample(used: number, total: number, external?: number): void {
this.metrics.memory.push({
used, // MB単位
total, // MB単位
external, // MB単位（オプション）
timestamp: new Date()
});

// 最大1000件まで保持（約8時間分）
if (this.metrics.memory.length > 1000) {
this.metrics.memory.shift();
}
}

/**パーセンタイルを計算する数値配列から指定されたパーセンタイル値を計算します。例えば、95パーセンタイルは、値の95%がその値以下となる閾値です。@private@param {number[]} values - パーセンタイルを計算する数値の配列@param {number} percentile - 計算するパーセンタイル（0-100）@returns {number} 計算されたパーセンタイル値@call-flow1. 配列が空の場合は0を返す2. 数値配列をソート3. パーセンタイルに対応するインデックスを計算4. 該当インデックスの値を返却@error-handling配列が空の場合は0を返します/
private calculatePercentile(values: number[], percentile: number): number {
if (values.length === 0) return 0;

// 値をソート
const sorted = [...values].sort((a, b) => a - b);

// パーセンタイルの位置を計算
const index = Math.ceil((percentile / 100) * sorted.length) - 1;

return sorted[index];
}

/**配列をキーでグループ化する配列内のオブジェクトを指定されたキーでグループ化し、キーごとのオブジェクト配列を持つオブジェクトを返します。@private@template T@param {T[]} array - グループ化する配列@param {keyof T} key - グループ化に使用するオブジェクトのキー@returns {Record<string, T[]>} グループ化された結果@call-flow1. 空のグループオブジェクトを作成2. 配列の各要素に対して処理3. 要素のキー値を文字列に変換4. キーに対応するグループがない場合は初期化5. 要素を適切なグループに追加@usage// 内部で使用される例：エラーをタイプでグループ化const typeGroups = this.groupBy(errors, 'type');/
private groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
return array.reduce((groups, item) => {
const value = String(item[key]);
if (!groups[value]) {
groups[value] = [];
}
groups[value].push(item);
return groups;
}, {} as Record<string, T[]>);
}

/**デフォルトの速度メトリクスを取得する速度メトリクスの初期値または計算不能時のデフォルト値を提供します。@private@returns {SpeedMetrics} デフォルトの速度メトリクス@call-flow1. デフォルト値を設定した速度メトリクスオブジェクトを作成2. 作成したオブジェクトを返却@usage// 内部で使用される例：データが不足している場合や// エラー発生時のフォールバック値return this.getDefaultSpeedMetrics();/
private getDefaultSpeedMetrics(): SpeedMetrics {
return {
averageTime: 0,
tokenPerSecond: 0,
efficiency: 0
};
}

/**デフォルトのメモリメトリクスを取得するメモリ使用量メトリクスの初期値または計算不能時のデフォルト値を提供します。@private@returns {PerformanceMetrics['memoryUsage']} デフォルトのメモリ使用量メトリクス@call-flow1. デフォルト値を設定したメモリ使用量メトリクスオブジェクトを作成2. 作成したオブジェクトを返却@usage// 内部で使用される例：データが不足している場合や// エラー発生時のフォールバック値return this.getDefaultMemoryMetrics();/
private getDefaultMemoryMetrics(): PerformanceMetrics['memoryUsage'] {
return {
average: 0,
peak: 0,
trend: 'STABLE'
};
}

/**デフォルトの遅延メトリクスを取得するAPI遅延メトリクスの初期値または計算不能時のデフォルト値を提供します。@private@returns {LatencyMetrics} デフォルトの遅延メトリクス@call-flow1. デフォルト値を設定した遅延メトリクスオブジェクトを作成2. 作成したオブジェクトを返却@usage// 内部で使用される例：データが不足している場合や// エラー発生時のフォールバック値return this.getDefaultLatencyMetrics();/
private getDefaultLatencyMetrics(): LatencyMetrics {
return {
average: 0,
p95: 0,
breakdown: {}
};
}

/**デフォルトのキャッシュメトリクスを取得するキャッシュ効率メトリクスの初期値または計算不能時のデフォルト値を提供します。@private@returns {CacheMetrics} デフォルトのキャッシュメトリクス@call-flow1. デフォルト値を設定したキャッシュメトリクスオブジェクトを作成2. 作成したオブジェクトを返却@usage// 内部で使用される例：データが不足している場合や// エラー発生時のフォールバック値return this.getDefaultCacheMetrics();/
private getDefaultCacheMetrics(): CacheMetrics {
return {
hitRate: 0,
missRate: 0,
evictionRate: 0
};
}
}

/**@interface SpeedMetricsRecord@description生成速度の測定結果を記録するためのデータ構造@property {number} totalTime - 生成にかかった合計時間（ミリ秒）@property {number} tokenCount - 生成されたトークン数@property {Date} timestamp - 記録された時刻@usage// 内部で使用される例const record: SpeedMetricsRecord = {  totalTime: 1200,    // 1.2秒  tokenCount: 150,    // 150トークン  timestamp: new Date()};

**@constructor:** function Object() { [native code] }

#### LatencySample (interface)

@interface LatencySample@descriptionAPI呼び出しの遅延サンプルを記録するためのデータ構造@property {number} latency - 遅延時間（ミリ秒）@property {boolean} success - API呼び出しが成功したかどうか@property {Date} timestamp - 記録された時刻@usage// 内部で使用される例const sample: LatencySample = {  latency: 350,     // 350ミリ秒  success: true,    // 成功  timestamp: new Date()};

**@constructor:** function Object() { [native code] }

#### MemorySample (interface)

@interface MemorySample@descriptionメモリ使用量のサンプルを記録するためのデータ構造@property {number} used - 使用中のメモリ量（MB単位）@property {number} total - 合計メモリ量（MB単位）@property {number} [external] - 外部メモリ量（MB単位、オプション）@property {Date} timestamp - 記録された時刻@usage// 内部で使用される例const sample: MemorySample = {  used: 256,        // 256MB  total: 512,       // 512MB  external: 10,     // 10MB  timestamp: new Date()};

**@constructor:** function Object() { [native code] }

#### CacheSample (interface)

@interface CacheSample@descriptionキャッシュ使用状況のサンプルを記録するためのデータ構造@property {number} hits - キャッシュヒット数@property {number} misses - キャッシュミス数@property {number} evictions - キャッシュからの削除数@property {Date} timestamp - 記録された時刻@usage// 内部で使用される例const sample: CacheSample = {  hits: 45,         // 45ヒット  misses: 5,        // 5ミス  evictions: 2,     // 2削除  timestamp: new Date()};

**@constructor:** function Object() { [native code] }

#### ErrorRecord (interface)

@interface ErrorRecord@descriptionシステム内で発生したエラーを記録するためのデータ構造@property {string} type - エラータイプ（例: DATABASE_ERROR, API_ERROR）@property {string} message - エラーメッセージ@property {'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'} severity - エラーの重大度@property {number} count - エラーの発生回数@property {Date} timestamp - 記録された時刻@usage// 内部で使用される例const record: ErrorRecord = {  type: 'DATABASE_ERROR',  message: '接続失敗',  severity: 'HIGH',  count: 1,  timestamp: new Date()};

**@constructor:** function Object() { [native code] }


---

### quality-analyzer copy.ts {#cnovel-automation-systemsrclibanalysisquality-analyzer-copyts}

**Path:** `C:/novel-automation-system/src/lib/analysis/quality-analyzer copy.ts`

//  * 品質分析器
//  * 生成された小説の品質を分析する
//

**@constructor:** function Object() { [native code] }


---

### quality-analyzer.ts {#cnovel-automation-systemsrclibanalysisquality-analyzerts}

**Path:** `C:/novel-automation-system/src/lib/analysis/quality-analyzer.ts`

@fileoverview チャプター品質分析モジュール@description生成されたノベルのチャプターの品質を様々な観点から分析し、数値スコアと改善提案を提供するモジュールです。@role- 小説チャプターの品質を客観的に評価する- 読みやすさ、引き込み度、一貫性、オリジナリティ、感情的インパクトを数値化- チャプター改善のための具体的な提案を生成する@dependencies- @/types/chapters - Chapterインターフェースの型定義- @/types/analysis - 分析結果関連の型定義- @/lib/utils/logger - ログ出力機能- @/lib/storage - ストレージアクセス機能（未使用）- @/lib/utils/error-handler - エラーハンドリング機能@types- @/types/chapters - Chapter型- @/types/analysis - QualityAnalysis, ReadabilityScore, EngagementScore, ConsistencyScore, OriginalityScore, EmotionalImpactScore型@flow1. チャプターデータを受け取る2. 各評価カテゴリ（読みやすさ、引き込み度など）ごとに分析を実行3. 各カテゴリの結果を統合して総合スコアを計算4. スコアに基づいて改善提案を生成5. 分析結果をオブジェクトとして返却

**@constructor:** function Object() { [native code] }

#### QualityAnalyzer (class)

@fileoverview チャプター品質分析モジュール@description生成されたノベルのチャプターの品質を様々な観点から分析し、数値スコアと改善提案を提供するモジュールです。@role- 小説チャプターの品質を客観的に評価する- 読みやすさ、引き込み度、一貫性、オリジナリティ、感情的インパクトを数値化- チャプター改善のための具体的な提案を生成する@dependencies- @/types/chapters - Chapterインターフェースの型定義- @/types/analysis - 分析結果関連の型定義- @/lib/utils/logger - ログ出力機能- @/lib/storage - ストレージアクセス機能（未使用）- @/lib/utils/error-handler - エラーハンドリング機能@types- @/types/chapters - Chapter型- @/types/analysis - QualityAnalysis, ReadabilityScore, EngagementScore, ConsistencyScore, OriginalityScore, EmotionalImpactScore型@flow1. チャプターデータを受け取る2. 各評価カテゴリ（読みやすさ、引き込み度など）ごとに分析を実行3. 各カテゴリの結果を統合して総合スコアを計算4. スコアに基づいて改善提案を生成5. 分析結果をオブジェクトとして返却/

import { Chapter } from '@/types/chapters';
import {
QualityAnalysis,
ReadabilityScore,
EngagementScore,
ConsistencyScore,
OriginalityScore,
EmotionalImpactScore
} from '@/types/analysis';
import { logger } from '@/lib/utils/logger';
import { storageProvider } from '@/lib/storage';
import { logError, getErrorMessage } from '@/lib/utils/error-handler';

/**@class QualityAnalyzer@description 生成されたチャプターの品質を総合的に分析するクラス@role- チャプターテキストを複数の観点から分析し、品質スコアを算出- 分析結果に基づく改善提案の生成- 各品質メトリクスの詳細な数値評価の提供@depends-on- logger - ログ出力のための依存- logError - エラー処理のための依存- Chapter型 - 分析対象のチャプターデータ構造- 各種スコア型 - 分析結果を格納するデータ構造@lifecycle1. インスタンス化2. analyzeChapterメソッドを呼び出し3. 内部で各種分析メソッドを実行4. 結果をまとめてQualityAnalysisオブジェクトとして返却@example-flowアプリケーション → QualityAnalyzer.analyzeChapter(chapter) →  calculateReadability() →  calculateEngagement() →  calculateConsistency() →  calculateOriginality() →  calculateEmotionalImpact() →  calculateOverallScore() →  generateRecommendations() →  結果返却

**@constructor:** function Object() { [native code] }

#### Methods of QualityAnalyzer

##### QualityAnalyzer.analyzeChapter (method)

品質分析システムを初期化する現在の実装では特別な初期化処理は行っていませんが、将来的には設定読み込みや参照データの準備などを行う可能性があります。@constructor@usage// 正確な初期化方法const analyzer = new QualityAnalyzer();@initialization現時点では特別な初期化処理は行っていません。コメントのみ存在します。/
}

/**チャプターの品質を分析する複数の観点（読みやすさ、引き込み度、一貫性、オリジナリティ、感情的インパクト）からチャプターの品質を総合的に評価し、スコアと改善提案を含む分析結果を返す。@async@param {Chapter} chapter - 分析対象のチャプター@returns {Promise<QualityAnalysis>} 品質分析結果@throws {unknown} 分析処理中に発生したエラー@usage// 基本的な使用例try {  const quality = await analyzer.analyzeChapter(chapter);  console.log(`総合スコア: ${quality.overallScore}`);  console.log(`改善提案: ${quality.recommendations.join('\n')}`);} catch (error) {  // エラーハンドリング}@call-context- 同期/非同期: 非同期メソッド（await必須）- 前提条件: 有効なChapterオブジェクトが必要@call-flow1. ログ出力（分析開始）2. 読みやすさの分析実行3. 引き込み度の分析実行4. 一貫性の分析実行5. オリジナリティの分析実行6. 感情的インパクトの分析実行7. 総合スコアの計算8. 改善提案の生成9. ログ出力（分析完了）10. 結果の返却@error-handlingエラーが発生した場合は捕捉してログに記録し、そのまま上位層に例外を再スローします。部分的な分析失敗ではエラーを投げず、デフォルト値を使用する場合もあります。@monitoring- ログレベル: INFO- ログポイント: 分析開始時と完了時@example// 使用例const analyzer = new QualityAnalyzer();const analysisResult = await analyzer.analyzeChapter(myChapter);console.log(`総合評価: ${analysisResult.overallScore * 100}点`);

**@constructor:** function Object() { [native code] }

##### QualityAnalyzer.calculateReadability (method)

読みやすさを計算するチャプターの文の複雑さ、語彙レベル、文章の流れ、段落構造を分析し、読みやすさのスコアを算出します。@async@private@param {Chapter} chapter - 分析対象のチャプター@returns {Promise<ReadabilityScore>} 読みやすさスコアと詳細情報@call-flow1. 文の複雑さを分析2. 語彙レベルを分析3. 文章の流れを分析4. 段落構造を分析5. 平均スコアを計算@helper-methods- analyzeSentenceComplexity - 文の複雑さを分析- analyzeVocabularyLevel - 語彙レベルを分析- analyzeFlow - 文章の流れを分析- analyzeParagraphStructure - 段落構造を分析@error-handlingエラーが発生した場合は捕捉してログに記録し、デフォルトスコア0.5を持つオブジェクトを返します。部分的なエラーでは分析を継続し、できる限り有効な結果を返すようにしています。

**@constructor:** function Object() { [native code] }

##### QualityAnalyzer.analyzeSentenceComplexity (method)

文の複雑さを分析するテキスト内の文を分析し、文の長さのバランス、接続詞の使用率などから文の複雑さを数値化します。@private@param {string} content - 分析対象のテキスト内容@returns {number} 文の複雑さスコア（0-1）@call-flow1. 文を分割2. 文の長さの分布を分析3. 長すぎる文や短すぎる文の割合を計算4. 接続詞の使用率を分析5. 最終スコアを計算@error-handlingエラーが発生した場合は捕捉してログに記録し、デフォルト値の0.5を返します。

**@constructor:** function Object() { [native code] }

##### QualityAnalyzer.analyzeVocabularyLevel (method)

語彙レベルを分析するテキスト内の語彙の多様性を分析し、語彙レベルを数値化します。@private@param {string} content - 分析対象のテキスト内容@returns {number} 語彙レベルスコア（0-1）@call-flow1. テキストを単語に分割2. ユニークな単語のセットを作成3. 語彙の多様性を計算@error-handlingエラーが発生した場合は捕捉してログに記録し、デフォルト値の0.5を返します。

**@constructor:** function Object() { [native code] }

##### QualityAnalyzer.analyzeFlow (method)

文章の流れを分析する段落の構成、長さのバランス、段落間の接続性などから文章の流れの良さを数値化します。@private@param {string} content - 分析対象のテキスト内容@returns {number} 文章の流れスコア（0-1）@call-flow1. 段落を分割2. 段落の長さのバランスを分析3. 段落間の接続性（接続詞の使用など）を分析4. 最終スコアを計算@error-handlingエラーが発生した場合は捕捉してログに記録し、デフォルト値の0.5を返します。

**@constructor:** function Object() { [native code] }

##### QualityAnalyzer.analyzeParagraphStructure (method)

段落構造を分析する段落数、段落あたりの文数、1文段落の割合など段落構造の適切さを数値化します。@private@param {string} content - 分析対象のテキスト内容@returns {number} 段落構造スコア（0-1）@call-flow1. 段落を分割2. 適切な段落数を評価3. 段落あたりの文数を分析4. 1文段落の比率を計算5. 最終スコアを計算@error-handlingエラーが発生した場合は捕捉してログに記録し、デフォルト値の0.5を返します。

**@constructor:** function Object() { [native code] }

##### QualityAnalyzer.calculateEngagement (method)

引き込み度を計算するテンション曲線、ペーシング、驚き要素、キャラクター関与度を分析し、読者の引き込み度のスコアを算出します。@async@private@param {Chapter} chapter - 分析対象のチャプター@returns {Promise<EngagementScore>} 引き込み度スコアと詳細情報@call-flow1. テンション曲線を分析2. ペーシングを分析3. 驚きの要素を分析4. キャラクター関与度を分析5. 平均スコアを計算@helper-methods- analyzeTensionCurve - テンション曲線を分析- analyzePacing - ペーシングを分析- analyzeSurpriseFactor - 驚き要素を分析- analyzeCharacterInvolvement - キャラクター関与度を分析@error-handlingエラーが発生した場合は捕捉してログに記録し、デフォルトスコア0.5を持つオブジェクトを返します。

**@constructor:** function Object() { [native code] }

##### QualityAnalyzer.analyzeTensionCurve (method)

テンション曲線を分析するシーン情報がある場合はそれを使用し、テンションの適切な波形（上昇→最高→解決など）を評価します。@private@param {Chapter} chapter - 分析対象のチャプター@returns {number} テンション曲線スコア（0-1）@call-flow1. シーン情報があればそのテンション値を取得2. テンションの最高値の位置を特定3. 前半の上昇傾向、後半の下降傾向を分析4. テンションパターンに基づきスコアを算出@helper-methods- isIncreasingTrend - 数値配列が増加傾向かを判定- isDecreasingTrend - 数値配列が減少傾向かを判定@error-handlingエラーが発生した場合は捕捉してログに記録し、デフォルト値の0.5を返します。

**@constructor:** function Object() { [native code] }

##### QualityAnalyzer.isIncreasingTrend (method)

数値配列が増加傾向かを判定する値の変化を分析し、増加の回数が減少の回数より多い場合に「増加傾向」と判定します。@private@param {number[]} values - 分析対象の数値配列@returns {boolean} 増加傾向の場合はtrue@call-flow1. 配列が2未満の場合はtrueを返す2. 隣接する値を比較し、増加回数と減少回数をカウント3. 増加回数が減少回数より多い場合はtrueを返す

**@constructor:** function Object() { [native code] }

##### QualityAnalyzer.isDecreasingTrend (method)

数値配列が減少傾向かを判定する値の変化を分析し、減少の回数が増加の回数より多い場合に「減少傾向」と判定します。@private@param {number[]} values - 分析対象の数値配列@returns {boolean} 減少傾向の場合はtrue@call-flow1. 配列が2未満の場合はtrueを返す2. 隣接する値を比較し、増加回数と減少回数をカウント3. 減少回数が増加回数より多い場合はtrueを返す

**@constructor:** function Object() { [native code] }

##### QualityAnalyzer.analyzePacing (method)

ペーシングを分析するシーン切り替えの頻度、シーンの長さのバランス、ダイアログと説明文のバランスなどからペーシングを評価します。@private@param {Chapter} chapter - 分析対象のチャプター@returns {number} ペーシングスコア（0-1）@call-flow1. シーン情報がある場合は、シーン数と長さのバランスを分析2. シーン情報がない場合は、対話と説明文のバランスを分析3. スコアを計算@error-handlingエラーが発生した場合は捕捉してログに記録し、デフォルト値の0.5を返します。

**@constructor:** function Object() { [native code] }

##### QualityAnalyzer.analyzeSurpriseFactor (method)

驚き要素を分析するテキスト内の驚きを示す表現の頻度から、ストーリーの予測不可能性や意外性を数値化します。@private@param {Chapter} chapter - 分析対象のチャプター@returns {number} 驚き要素スコア（0-1）@call-flow1. 驚きを示す表現（「突然」「意外」など）の出現回数をカウント2. チャプター長に対する適切な比率を計算3. 理想的な範囲からの逸脱度に基づきスコアを算出@error-handlingエラーが発生した場合は捕捉してログに記録し、デフォルト値の0.5を返します。

**@constructor:** function Object() { [native code] }

##### QualityAnalyzer.analyzeCharacterInvolvement (method)

キャラクター関与度を分析する登場キャラクターの存在感、会話参加度、メインキャラクターの焦点などを分析します。@private@param {Chapter} chapter - 分析対象のチャプター@returns {number} キャラクター関与度スコア（0-1）@call-flow1. キャラクター登場情報がある場合は、登場バランス、会話参加度、主要キャラクターの存在感を分析2. 情報がない場合は、セリフ数と名前の出現頻度から推定3. スコアを計算@error-handlingエラーが発生した場合は捕捉してログに記録し、デフォルト値の0.5を返します。

**@constructor:** function Object() { [native code] }

##### QualityAnalyzer.calculateConsistency (method)

一貫性を計算する短期一貫性（チャプター内）、長期一貫性（過去チャプターとの整合）、キャラクター一貫性、世界観一貫性を分析します。@async@private@param {Chapter} chapter - 分析対象のチャプター@returns {Promise<ConsistencyScore>} 一貫性スコアと詳細情報@call-flow1. 短期一貫性を分析2. 長期一貫性を分析3. キャラクター一貫性を分析4. 世界観一貫性を分析5. 平均スコアを計算@helper-methods- analyzeShortTermConsistency - 短期一貫性を分析- analyzeLongTermConsistency - 長期一貫性を分析- analyzeCharacterConsistency - キャラクター一貫性を分析- analyzeWorldBuildingConsistency - 世界観一貫性を分析@error-handlingエラーが発生した場合は捕捉してログに記録し、デフォルトスコア0.5を持つオブジェクトを返します。

**@constructor:** function Object() { [native code] }

##### QualityAnalyzer.analyzeShortTermConsistency (method)

短期一貫性を分析するチャプター内での時系列、論理整合性を分析します。現在の実装では修正履歴から一貫性を推定しています。@async@private@param {Chapter} chapter - 分析対象のチャプター@returns {Promise<number>} 短期一貫性スコア（0-1）@call-flow1. 修正履歴があれば、その数から元の一貫性を推定2. 修正が多いほど元の一貫性が低かったと仮定3. スコアを計算（修正がない場合はデフォルト値を返す）@error-handlingエラーが発生した場合は捕捉してログに記録し、デフォルト値の0.5を返します。

**@constructor:** function Object() { [native code] }

##### QualityAnalyzer.analyzeLongTermConsistency (method)

長期一貫性を分析する過去チャプターとの整合性を分析します。現在の実装では簡易的な固定値を返します。@async@private@param {Chapter} chapter - 分析対象のチャプター@returns {Promise<number>} 長期一貫性スコア（0-1）@call-flow1. 実際の実装では過去チャプターを参照する必要があるが、現在は簡易実装2. 固定値（0.7）を返す@error-handlingエラーが発生した場合は捕捉してログに記録し、デフォルト値の0.5を返します。

**@constructor:** function Object() { [native code] }

##### QualityAnalyzer.analyzeCharacterConsistency (method)

キャラクターの一貫性を分析するキャラクターの言動や設定の一貫性を分析します。現在の実装では検出された問題から一貫性を推定しています。@async@private@param {Chapter} chapter - 分析対象のチャプター@returns {Promise<number>} キャラクター一貫性スコア（0-1）@call-flow1. 検出された問題（CHARACTER_で始まる問題タイプ）をフィルタリング2. 問題の数に応じてスコアを減点3. 問題がない場合はデフォルト値（0.8）を返す@error-handlingエラーが発生した場合は捕捉してログに記録し、デフォルト値の0.5を返します。

**@constructor:** function Object() { [native code] }

##### QualityAnalyzer.analyzeWorldBuildingConsistency (method)

世界観の一貫性を分析する世界設定の一貫性を分析します。現在の実装では検出された問題から一貫性を推定しています。@async@private@param {Chapter} chapter - 分析対象のチャプター@returns {Promise<number>} 世界観一貫性スコア（0-1）@call-flow1. 検出された問題（WORLD_で始まる問題タイプ）をフィルタリング2. 問題の数に応じてスコアを減点3. 問題がない場合はデフォルト値（0.8）を返す@error-handlingエラーが発生した場合は捕捉してログに記録し、デフォルト値の0.5を返します。

**@constructor:** function Object() { [native code] }

##### QualityAnalyzer.calculateOriginality (method)

オリジナリティを計算する表現の新鮮さ、プロットのオリジナリティ、キャラクターのオリジナリティ、世界観のオリジナリティを分析します。@async@private@param {Chapter} chapter - 分析対象のチャプター@returns {Promise<OriginalityScore>} オリジナリティスコアと詳細情報@call-flow1. 表現の新鮮さを分析2. プロットのオリジナリティを分析3. キャラクターのオリジナリティを分析4. 世界観のオリジナリティを分析5. 平均スコアを計算@helper-methods- analyzeExpressionFreshness - 表現の新鮮さを分析- analyzePlotOriginality - プロットのオリジナリティを分析- analyzeCharacterOriginality - キャラクターのオリジナリティを分析- analyzeWorldBuildingOriginality - 世界観のオリジナリティを分析@error-handlingエラーが発生した場合は捕捉してログに記録し、デフォルトスコア0.5を持つオブジェクトを返します。

**@constructor:** function Object() { [native code] }

##### QualityAnalyzer.analyzeExpressionFreshness (method)

表現の新鮮さを分析するクリシェ表現やありがちな表現を検出し、表現の新鮮さを数値化します。現在の実装では簡易的な固定値を返します。@private@param {Chapter} chapter - 分析対象のチャプター@returns {number} 表現の新鮮さスコア（0-1）@call-flow1. 実際の実装ではありがちな表現との照合が必要2. 現在は簡易実装で固定値（0.7）を返す@error-handlingエラーが発生した場合は捕捉してログに記録し、デフォルト値の0.5を返します。

**@constructor:** function Object() { [native code] }

##### QualityAnalyzer.analyzePlotOriginality (method)

プロットのオリジナリティを分析する

**@constructor:** function Object() { [native code] }

##### QualityAnalyzer.analyzeCharacterOriginality (method)

キャラクターのオリジナリティを分析する

**@constructor:** function Object() { [native code] }

##### QualityAnalyzer.analyzeWorldBuildingOriginality (method)

世界観のオリジナリティを分析する

**@constructor:** function Object() { [native code] }

##### QualityAnalyzer.calculateEmotionalImpact (method)

感情的インパクトを計算する感情の強度、感情の変化、共感度、記憶に残る度合いを分析し、感情的インパクトのスコアを算出します。@async@private@param {Chapter} chapter - 分析対象のチャプター@returns {Promise<EmotionalImpactScore>} 感情的インパクトスコアと詳細情報@call-flow1. 感情の強度を分析2. 感情の変化を分析3. 共感度を分析4. 記憶に残る度合いを分析5. 平均スコアを計算@helper-methods- analyzeEmotionalIntensity - 感情の強度を分析- analyzeEmotionalVariation - 感情の変化を分析- analyzeEmpathyFactor - 共感度を分析- analyzeMemorabilityFactor - 記憶に残る度合いを分析@error-handlingエラーが発生した場合は捕捉してログに記録し、デフォルトスコア0.5を持つオブジェクトを返します。

**@constructor:** function Object() { [native code] }

##### QualityAnalyzer.analyzeEmotionalIntensity (method)

感情の強度を分析するテキスト内の感情を表す単語の頻度を分析し、感情表現の強度を数値化します。@private@param {Chapter} chapter - 分析対象のチャプター@returns {number} 感情の強度スコア（0-1）@call-flow1. 喜び、悲しみ、怒りなどの感情カテゴリごとに関連する単語をリスト化2. 各感情の出現回数をカウント3. チャプター長に対する理想的な比率を計算4. 理想からの逸脱度に基づきスコアを算出@error-handlingエラーが発生した場合は捕捉してログに記録し、デフォルト値の0.5を返します。

**@constructor:** function Object() { [native code] }

##### QualityAnalyzer.analyzeEmotionalVariation (method)

感情の変化を分析する

**@constructor:** function Object() { [native code] }

##### QualityAnalyzer.analyzeEmpathyFactor (method)

共感度を分析する内面描写の豊かさを分析し、読者の共感を得やすさを数値化します。@private@param {Chapter} chapter - 分析対象のチャプター@returns {number} 共感度スコア（0-1）@call-flow1. 内面描写を示す表現（「思」「感じ」「心」など）の出現回数をカウント2. チャプター長に対する理想的な比率を計算3. 理想からの逸脱度に基づきスコアを算出@error-handlingエラーが発生した場合は捕捉してログに記録し、デフォルト値の0.5を返します。

**@constructor:** function Object() { [native code] }

##### QualityAnalyzer.analyzeMemorabilityFactor (method)

記憶に残る度合いを分析する

**@constructor:** function Object() { [native code] }

##### QualityAnalyzer.calculateOverallScore (method)

総合スコアを計算する各メトリクス（読みやすさ、引き込み度、一貫性、オリジナリティ、感情的インパクト）に重み付けを行い、総合スコアを算出します。@private@param {Object} scores - 各カテゴリのスコア@param {ReadabilityScore} scores.readability - 読みやすさスコア@param {EngagementScore} scores.engagement - 引き込み度スコア@param {ConsistencyScore} scores.consistency - 一貫性スコア@param {OriginalityScore} scores.originality - オリジナリティスコア@param {EmotionalImpactScore} scores.emotionalImpact - 感情的インパクトスコア@returns {number} 総合スコア（0-1）@call-flow1. 各カテゴリに重み付け（読みやすさ:0.15、引き込み度:0.25、一貫性:0.20、オリジナリティ:0.15、感情的インパクト:0.25）2. 重み付けした値を合計3. 0から1の範囲に正規化@error-handlingエラーが発生した場合は捕捉してログに記録し、デフォルト値の0.5を返します。

**@constructor:** function Object() { [native code] }

##### QualityAnalyzer.generateRecommendations (method)

改善提案を生成する各カテゴリの分析結果に基づいて、品質向上のための具体的な改善提案リストを生成します。@private@param {Object} scores - 各カテゴリのスコア@param {ReadabilityScore} scores.readability - 読みやすさスコア@param {EngagementScore} scores.engagement - 引き込み度スコア@param {ConsistencyScore} scores.consistency - 一貫性スコア@param {OriginalityScore} scores.originality - オリジナリティスコア@param {EmotionalImpactScore} scores.emotionalImpact - 感情的インパクトスコア@returns {string[]} 改善提案の配列@call-flow1. 各カテゴリのスコアを評価2. スコアが閾値（0.6）未満の項目について提案を生成3. 詳細スコアを確認して具体的な改善点を特定4. 提案がない場合は「高品質」メッセージを追加@expected-format```[  "文の長さをより均等にし、100文字を超える長文を分割することで読みやすさが向上します。",  "テンションの起伏を明確にし、クライマックスに向けて緊張感を高める展開を検討してください。"]```

**@constructor:** function Object() { [native code] }


---

### rate-limiter.ts {#cnovel-automation-systemsrclibapirate-limiterts}

**Path:** `C:/novel-automation-system/src/lib/api/rate-limiter.ts`

@fileoverview APIリクエストのレート制限を管理するためのユーティリティ@descriptionこのモジュールは、APIリクエストに対するレート制限機能を提供します。Redisベースのレート制限を実装し、異なるタイプのエンドポイントに対する様々なレート制限設定を構成します。また、Next.js APIルートと統合するためのラッパー関数も提供します。@role- APIリクエストのレート制限を管理- Redisベースのレート制限の実装- 異なるタイプのエンドポイントに対する複数のレート制限設定- Next.js APIルートと統合するためのヘルパー関数- レート制限超過時の標準的なエラーレスポンス提供@dependencies- express-rate-limit - レート制限の主要機能を提供- rate-limit-redis - レート制限情報をRedisに保存するためのストア- ioredis - Redisクライアント- @/lib/utils/logger - ロギング機能- @/lib/utils/error-handler - エラーハンドリング機能@types- NextApiRequest, NextApiResponse (next) - Next.js APIルートの型定義@api-endpointsこのファイルは直接APIエンドポイントを実装していませんが、APIルートハンドラーをラップするためのミドルウェアを提供します。@flow1. Redisクライアントの初期化2. レート制限設定の構成3. APIリクエストの受信4. レート制限チェックの実行5. 制限内であればAPIルートハンドラーの実行、超過時はエラーレスポンスの返却

**@constructor:** function Object() { [native code] }

#### createRateLimiter (variable)

@fileoverview APIリクエストのレート制限を管理するためのユーティリティ@descriptionこのモジュールは、APIリクエストに対するレート制限機能を提供します。Redisベースのレート制限を実装し、異なるタイプのエンドポイントに対する様々なレート制限設定を構成します。また、Next.js APIルートと統合するためのラッパー関数も提供します。@role- APIリクエストのレート制限を管理- Redisベースのレート制限の実装- 異なるタイプのエンドポイントに対する複数のレート制限設定- Next.js APIルートと統合するためのヘルパー関数- レート制限超過時の標準的なエラーレスポンス提供@dependencies- express-rate-limit - レート制限の主要機能を提供- rate-limit-redis - レート制限情報をRedisに保存するためのストア- ioredis - Redisクライアント- @/lib/utils/logger - ロギング機能- @/lib/utils/error-handler - エラーハンドリング機能@types- NextApiRequest, NextApiResponse (next) - Next.js APIルートの型定義@api-endpointsこのファイルは直接APIエンドポイントを実装していませんが、APIルートハンドラーをラップするためのミドルウェアを提供します。@flow1. Redisクライアントの初期化2. レート制限設定の構成3. APIリクエストの受信4. レート制限チェックの実行5. 制限内であればAPIルートハンドラーの実行、超過時はエラーレスポンスの返却/

import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { Redis } from 'ioredis';
import { logger } from '@/lib/utils/logger';
import { logError } from '@/lib/utils/error-handler';
import { NextApiRequest, NextApiResponse } from 'next';

/**Redisベースのレート制限ミドルウェアを作成しますexpress-rate-limitとRedisStoreを使用して、APIリクエストに対するレート制限ミドルウェアを作成します。Redis接続に失敗した場合は、インメモリストアにフォールバックします。@param {number} [windowMs=15 * 60 * 1000] - 制限ウィンドウ時間（ミリ秒）。デフォルト: 15分@param {number} [max=100] - ウィンドウあたりの最大リクエスト数。デフォルト: 100リクエスト@returns {Function} 設定されたレート制限ミドルウェア@throws {unknown} Redis接続エラー（内部でキャッチされインメモリストアにフォールバック）@usage// 基本的な使用法const limiter = createRateLimiter();// カスタム設定const customLimiter = createRateLimiter(5 * 60 * 1000, 10); // 5分あたり10リクエスト@call-context- 同期/非同期: 同期関数- 推奨呼び出し環境: サーバーサイドのみ- 前提条件: Redis接続情報が環境変数またはデフォルト値で利用可能であること@call-flow1. Redisクライアントの初期化2. ロガーによる設定情報の記録3. RedisStoreオプションの設定4. express-rate-limitの設定と初期化5. Redis接続エラー時、インメモリストアへのフォールバック@called-by- configureRateLimits - 各種エンドポイントタイプ別のレート制限設定を作成する際に呼び出し@external-dependencies- Redisサーバー - 設定情報の保存先@error-handlingRedis接続エラーが発生した場合:1. エラーをログに記録2. インメモリストアを使用したフォールバックレート制限ミドルウェアを返却レート制限超過時:1. 警告をログに記録（path、ip、userAgentを含む）2. 429ステータスコードとカスタムエラーメッセージを返却@performance-considerations- Redis接続はパフォーマンスに影響する可能性があります- keyGenerator関数はリクエストごとに実行されるため効率的であるべき@monitoring- ログレベル: INFO（初期化時）、WARN（レート制限超過時）- エラーログ: Redis接続エラー時

**@constructor:** function Object() { [native code] }

#### configureRateLimits (variable)

特定のユーザータイプやエンドポイントに対するレート制限設定を提供します異なるタイプのAPIエンドポイントに適した複数のレート制限設定を作成し、オブジェクトとして返します。@returns {{  general: Function,  generation: Function,  search: Function,  auth: Function}} 設定済みのレート制限ミドルウェアオブジェクト@usage// すべての制限設定を取得const limits = configureRateLimits();// 特定のタイプの制限を使用const searchLimiter = limits.search;const authLimiter = limits.auth;@call-context- 同期/非同期: 同期関数- 推奨呼び出し環境: サーバーサイドのみ- 前提条件: Redis接続情報が環境変数またはデフォルト値で利用可能であること@call-flow1. 各タイプのエンドポイント用に異なるパラメータでcreateRateLimiterを呼び出し2. 作成されたミドルウェアをオブジェクトとして返却@called-by- withRateLimit - APIルートハンドラーをラップする際に設定を取得するために呼び出し@helper-methods- createRateLimiter - 各制限設定の作成に使用@performance-considerations- 各レート制限設定の初期化時にRedis接続が作成されるため、  アプリケーション起動時に一度だけ呼び出すことが推奨されます

**@constructor:** function Object() { [native code] }

#### withRateLimit (variable)

Next.js APIルートハンドラーにレート制限を適用するためのラッパー関数指定されたレート制限タイプを適用したNext.js APIルートハンドラーを返します。レート制限チェックが通過した場合のみ、元のハンドラーが実行されます。@param {Function} handler - APIルートハンドラー関数@param {keyof ReturnType<typeof configureRateLimits>} [limitType='general'] - 適用するレート制限タイプ。  'general', 'generation', 'search', 'auth'のいずれか。@returns {Function} レート制限が適用されたAPIルートハンドラー@throws {unknown} レート制限ミドルウェア内部でエラーが発生した場合@usage// 基本的な使用法（一般的なレート制限）export default withRateLimit(async (req, res) => {  // APIルートの処理  res.status(200).json({ success: true });});// カスタムレート制限タイプを指定export default withRateLimit(  async (req, res) => {    // 認証処理    res.status(200).json({ token: '...' });  },  'auth');@call-context- 同期/非同期: 非同期関数を返します- 推奨呼び出し環境: Next.js APIルート定義内@call-flow1. configureRateLimitsを呼び出して制限設定を取得2. 指定されたタイプのレート制限ミドルウェアを選択3. レート制限ミドルウェアでラップされたPromiseを返却4. リクエスト時:   a. レート制限チェックの実行   b. 制限内であれば元のハンドラーを実行   c. 制限超過時はエラーレスポンスを返却@api-equivalentこのラッパー関数は特定のAPI仕様を実装するのではなく、既存のAPIルートにレート制限機能を追加します。@error-handlingレート制限ミドルウェア内部でエラーが発生した場合:1. Promiseのrejectを呼び出し2. Next.jsのエラーハンドリングメカニズムに処理を委譲レート制限超過時:1. 429ステータスコードとカスタムエラーメッセージを返却2. リトライタイミングに関する情報を提供

**@constructor:** function Object() { [native code] }


---

### redis-cache.ts {#cnovel-automation-systemsrclibcacheredis-cachets}

**Path:** `C:/novel-automation-system/src/lib/cache/redis-cache.ts`

@fileoverview Redisベースのキャッシュシステム@descriptionこのファイルはRedisを利用したキャッシュシステムを実装しています。アプリケーション全体で一貫したキャッシュ機能を提供し、データアクセスの高速化と負荷分散を実現します。@role- アプリケーション全体のキャッシュレイヤーを担当- 重複データ取得の防止によるパフォーマンス向上- 頻繁にアクセスされるデータの高速な取得を実現- Redisとの接続管理と操作のカプセル化@dependencies- ioredis - Redis接続とコマンド実行を提供- @/lib/utils/logger - アプリケーションログの出力- @/lib/utils/error-handler - エラー状態のログ記録と処理@flow1. シングルトンパターンによるRedisクライアントの初期化2. キャッシュの読み書き・削除操作の提供3. キャッシュヒット/ミスの記録とログ出力4. エラー発生時の適切なエラーハンドリングとログ記録

**@constructor:** function Object() { [native code] }

#### RedisCache (class)

@fileoverview Redisベースのキャッシュシステム@descriptionこのファイルはRedisを利用したキャッシュシステムを実装しています。アプリケーション全体で一貫したキャッシュ機能を提供し、データアクセスの高速化と負荷分散を実現します。@role- アプリケーション全体のキャッシュレイヤーを担当- 重複データ取得の防止によるパフォーマンス向上- 頻繁にアクセスされるデータの高速な取得を実現- Redisとの接続管理と操作のカプセル化@dependencies- ioredis - Redis接続とコマンド実行を提供- @/lib/utils/logger - アプリケーションログの出力- @/lib/utils/error-handler - エラー状態のログ記録と処理@flow1. シングルトンパターンによるRedisクライアントの初期化2. キャッシュの読み書き・削除操作の提供3. キャッシュヒット/ミスの記録とログ出力4. エラー発生時の適切なエラーハンドリングとログ記録/

import Redis from 'ioredis';
import { logger } from '@/lib/utils/logger';
import { logError } from '@/lib/utils/error-handler';

/**@class RedisCache@description Redisを使用したキャッシュシステムシステム全体でのデータ取得の最適化とパフォーマンス向上を提供@role- システム全体でのキャッシュ機能の一元管理- Redis接続の確立と維持- キャッシュの読み書き・削除・無効化操作の提供- キャッシュ操作のエラーハンドリングとログ記録@used-by- コードからは確認できない（他のサービスやコントローラーから使用されると推測される）@depends-on- Redis - キャッシュストレージとして使用- logger - 操作のログ記録- logError - エラー状態の記録@lifecycle1. getRedisCache()からのシングルトンインスタンス作成2. Redisサーバーへの接続確立3. 接続イベントとエラーイベントのハンドリング設定4. キャッシュ操作の提供（get, set, delete, invalidate等）@example-flowサービスレイヤー → getRedisCache() → RedisCache.get/set →  Redis操作 →  結果のシリアライズ/デシリアライズ →  結果または例外ハンドリング →  呼び出し元への返却

**@constructor:** function Object() { [native code] }

#### Methods of RedisCache

##### RedisCache.constructor (method)

RedisCache クラスのコンストラクタRedisサーバーへの接続を確立し、接続イベントとエラーイベントのハンドラを設定します。環境変数 REDIS_URL からRedis接続情報を取得し、未設定の場合はデフォルト値を使用します。@constructor@usage// 直接インスタンス化（推奨されない）const cache = new RedisCache();// 推奨される使用方法（シングルトンパターン）const cache = getRedisCache();@call-flow1. REDIS_URL環境変数の取得（未設定時はデフォルト値使用）2. Redisクライアントのインスタンス化3. エラーイベントハンドラの設定4. 接続成功イベントハンドラの設定@initialization- デフォルトTTLを3600秒（1時間）に設定- 環境変数またはデフォルト値（redis://localhost:6379）を使用してRedis接続@error-handling- Redis接続エラーはlogError関数でログに記録- 接続成功時はINFOレベルでログ記録

**@constructor:** function Object() { [native code] }

##### RedisCache.set (method)

キャッシュからデータを取得指定されたキーに対応するキャッシュデータを取得し、JSONとしてパースして返します。キャッシュミスの場合はnullを返します。@async@param {string} key - キャッシュキー@returns {Promise<T | null>} 取得したデータ（JSONパース済み）またはキャッシュミス時はnull@usage// 使用例const data = await cache.get<UserProfile>('user:profile:123');if (data) {  // キャッシュヒット時の処理} else {  // キャッシュミス時の処理}@call-context- 同期/非同期: 非同期メソッド（await必須）- 推奨呼び出し環境: サーバーサイド- 前提条件: Redisサーバーが接続済みであること@call-flow1. Redisからキーに対応する値を取得2. 値が存在しない場合はnullを返し、DEBUGレベルでログ記録3. 値が存在する場合はJSONとしてパース4. パースした値を返し、DEBUGレベルでログ記録@external-dependencies- Redis - キャッシュデータの取得先@error-handling- Redis操作エラーはlogError関数でログに記録- エラー発生時はnullを返し処理を続行（フェイルソフト）- JSONパースエラーも同様に処理@performance-considerations- Redisへの単一キーアクセスのため比較的高速- JSONパースのオーバーヘッドあり@monitoring- ログレベル: DEBUG- ログポイント: キャッシュヒット/ミス、エラー発生時/
async get<T>(key: string): Promise<T | null> {
try {
const value = await this.client.get(key);

if (!value) {
logger.debug(`Cache miss for key: ${key}`);
return null;
}

logger.debug(`Cache hit for key: ${key}`);
return JSON.parse(value) as T;
} catch (error: unknown) {
logError(error, { key }, 'Cache get error');
return null;
}
}

/**データをキャッシュに保存指定されたキーと有効期限でデータをキャッシュに保存します。データは自動的にJSON文字列に変換されます。@async@param {string} key - キャッシュキー@param {any} value - 保存するデータ（自動的にJSONに変換）@param {number} [ttl=this.defaultTTL] - 有効期限（秒）、デフォルトは3600秒（1時間）@returns {Promise<void>} 処理完了後に解決するPromise@usage// 基本的な使用例await cache.set('user:profile:123', userProfile);// カスタムTTLを指定await cache.set('temporary:data', data, 300); // 5分間有効@call-context- 同期/非同期: 非同期メソッド（await必須）- 推奨呼び出し環境: サーバーサイド- 前提条件: Redisサーバーが接続済みであること@call-flow1. データをJSON文字列に変換2. Redis SETコマンドを実行し、EXオプションでTTLを設定3. 処理結果をDEBUGレベルでログ記録@external-dependencies- Redis - キャッシュデータの保存先@error-handling- Redis操作エラーはlogError関数でログに記録- エラー発生時も例外を上位に伝播せず処理を続行（フェイルソフト）@performance-considerations- JSONシリアライズのオーバーヘッドあり- 大きなオブジェクトの場合はメモリ使用量に注意@monitoring- ログレベル: DEBUG- ログポイント: キャッシュ保存完了、エラー発生時

**@constructor:** function Object() { [native code] }

##### RedisCache.delete (method)

キャッシュからデータを削除指定されたキーに対応するキャッシュデータを削除します。@async@param {string} key - 削除するキャッシュキー@returns {Promise<void>} 処理完了後に解決するPromise@usage// 基本的な使用例await cache.delete('user:profile:123');@call-context- 同期/非同期: 非同期メソッド（await必須）- 推奨呼び出し環境: サーバーサイド- 前提条件: Redisサーバーが接続済みであること@call-flow1. Redis DELコマンドを実行2. 処理結果をDEBUGレベルでログ記録@external-dependencies- Redis - キャッシュデータの削除対象@error-handling- Redis操作エラーはlogError関数でログに記録- エラー発生時も例外を上位に伝播せず処理を続行（フェイルソフト）@monitoring- ログレベル: DEBUG- ログポイント: キャッシュ削除完了、エラー発生時

**@constructor:** function Object() { [native code] }

##### RedisCache.invalidate (method)

パターンに一致するキャッシュを無効化指定されたパターンに一致するすべてのキャッシュを削除します。Redisのキーパターン（ワイルドカード）を使用できます。@async@param {string} pattern - 無効化するキーのパターン（例: 'user:*'）@returns {Promise<void>} 処理完了後に解決するPromise@usage// 基本的な使用例await cache.invalidate('user:profile:*'); // すべてのユーザープロファイルキャッシュを無効化@call-context- 同期/非同期: 非同期メソッド（await必須）- 推奨呼び出し環境: サーバーサイド- 前提条件: Redisサーバーが接続済みであること@call-flow1. Redisのキー検索を実行（KEYSコマンド）2. 見つかったキーが1つの場合は単一のDELコマンドを実行3. 見つかったキーが複数の場合は可変引数でDELコマンドを実行4. 処理結果をDEBUGレベルでログ記録@external-dependencies- Redis - キャッシュデータの検索と削除@error-handling- Redis操作エラーはlogError関数でログに記録- エラー発生時も例外を上位に伝播せず処理を続行（フェイルソフト）@performance-considerations- KEYSコマンドはRedisのブロッキング操作であり、キー数が多い場合はパフォーマンスに影響する可能性あり- 本番環境での大規模なパターン一致には注意が必要@monitoring- ログレベル: DEBUG- ログポイント: キャッシュ無効化完了（キー数を含む）、該当キーなし、エラー発生時

**@constructor:** function Object() { [native code] }

##### RedisCache.setExpiry (method)

キャッシュキーの有効期限を設定既存のキャッシュエントリに対して新しい有効期限（TTL）を設定します。@async@param {string} key - キャッシュキー@param {number} ttl - 新しい有効期限（秒）@returns {Promise<void>} 処理完了後に解決するPromise@usage// 基本的な使用例await cache.setExpiry('user:profile:123', 7200); // 2時間に延長@call-context- 同期/非同期: 非同期メソッド（await必須）- 推奨呼び出し環境: サーバーサイド- 前提条件: Redisサーバーが接続済みであること、キーが存在すること@call-flow1. Redis EXPIREコマンドを実行2. 処理結果をDEBUGレベルでログ記録@external-dependencies- Redis - キャッシュキーの有効期限設定@error-handling- Redis操作エラーはlogError関数でログに記録- エラー発生時も例外を上位に伝播せず処理を続行（フェイルソフト）@monitoring- ログレベル: DEBUG- ログポイント: 有効期限設定完了、エラー発生時

**@constructor:** function Object() { [native code] }

##### RedisCache.getStats (method)

キャッシュの統計情報を取得Redisサーバーから統計情報を取得し、解析して返します。サーバー情報とキースペース情報を含みます。@async@returns {Promise<Record<string, any>>} キャッシュの統計情報を含むオブジェクト@usage// 基本的な使用例const stats = await cache.getStats();console.log('メモリ使用量:', stats.info.used_memory_human);console.log('キースペース情報:', stats.keyspace);@call-context- 同期/非同期: 非同期メソッド（await必須）- 推奨呼び出し環境: サーバーサイド、管理系機能- 前提条件: Redisサーバーが接続済みであること@call-flow1. Redis INFOコマンドを実行して一般情報を取得2. Redis INFO KEYSPACEコマンドを実行してキースペース情報を取得3. 情報を解析して構造化されたオブジェクトを生成4. 結果オブジェクトを返却@external-dependencies- Redis - 統計情報の取得先@error-handling- Redis操作エラーはlogError関数でログに記録- エラー発生時は空のオブジェクトを返却（フェイルソフト）@performance-considerations- INFOコマンドは比較的軽量だが、高頻度での呼び出しは避けるべき- 監視目的での使用を想定@monitoring- ログレベル: ERROR（エラー発生時のみ）- ログポイント: エラー発生時@returns {Record<string, any>} 以下の構造を持つオブジェクト:{  keyspace: string, // キースペース情報（データベースごとのキー数等）  info: {    [key: string]: string // サーバー情報の各項目  }}

**@constructor:** function Object() { [native code] }


---

### evolution-system copy 2.ts {#cnovel-automation-systemsrclibcharactersevolution-system-copy-2ts}

**Path:** `C:/novel-automation-system/src/lib/characters/#/evolution-system copy 2.ts`

//  * キャラクター進化システム
//  * 物語の進行に応じたキャラクターの成長・変化を管理するクラス
//

**@constructor:** function Object() { [native code] }


---

### evolution-system copy.ts {#cnovel-automation-systemsrclibcharactersevolution-system-copyts}

**Path:** `C:/novel-automation-system/src/lib/characters/#/evolution-system copy.ts`

//    * キャラクター進化システム
//    * 物語の進行に伴うキャラクターの成長と変化を管理する
//

**@constructor:** function Object() { [native code] }


---

### manager copy 2.ts {#cnovel-automation-systemsrclibcharactersmanager-copy-2ts}

**Path:** `C:/novel-automation-system/src/lib/characters/#/manager copy 2.ts`

//  * キャラクター管理システム
//  * キャラクターの追加、更新、取得、関係性管理など、
//  * キャラクターに関する全ての操作を管理するクラス
//

**@constructor:** function Object() { [native code] }


---

### manager copy.ts {#cnovel-automation-systemsrclibcharactersmanager-copyts}

**Path:** `C:/novel-automation-system/src/lib/characters/#/manager copy.ts`

//  * キャラクター管理システム
//  * 小説内のキャラクターの追加、更新、昇格、関係性などを管理する
//

**@constructor:** function Object() { [native code] }


---

### promotion-system copy 2.ts {#cnovel-automation-systemsrclibcharacterspromotion-system-copy-2ts}

**Path:** `C:/novel-automation-system/src/lib/characters/#/promotion-system copy 2.ts`

キャラクター昇格システムモブキャラクター→サブキャラクター→メインキャラクターへの昇格を評価し実行するクラス

**@constructor:** function Object() { [native code] }

#### PromotionSystem (class)

キャラクター昇格システムモブキャラクター→サブキャラクター→メインキャラクターへの昇格を評価し実行するクラス

**@constructor:** function Object() { [native code] }

#### Methods of PromotionSystem

##### PromotionSystem.evaluate (method)

昇格の閾値設定各キャラクタータイプからの昇格に必要な条件/
private readonly PROMOTION_THRESHOLDS = {
MOB_TO_SUB: {
appearances: 3,     // 最低登場回数
interactions: 5,    // 最低相互作用回数
plotRelevance: 0.3, // 最低プロット関連度
},
SUB_TO_MAIN: {
appearances: 10,    // 最低登場回数
interactions: 15,   // 最低相互作用回数
plotRelevance: 0.7, // 最低プロット関連度
characterDevelopment: 3, // 最低キャラクター発展段階
},
};

/**キャラクターの昇格適格性を評価する

**@constructor:** function Object() { [native code] }

##### PromotionSystem.promote (method)

キャラクターを昇格させる

**@constructor:** function Object() { [native code] }

##### PromotionSystem.calculateMetrics (method)

キャラクターの昇格メトリクスを計算する

**@constructor:** function Object() { [native code] }

##### PromotionSystem.calculatePromotionScore (method)

昇格のスコアを計算する

**@constructor:** function Object() { [native code] }

##### PromotionSystem.meetsThreshold (method)

キャラクターが閾値を満たしているか確認する

**@constructor:** function Object() { [native code] }

##### PromotionSystem.calculatePlotRelevance (method)

キャラクターのプロット関連度を計算する

**@constructor:** function Object() { [native code] }

##### PromotionSystem.estimateReaderEngagement (method)

読者のエンゲージメントを推定する

**@constructor:** function Object() { [native code] }

##### PromotionSystem.generateRecommendation (method)

昇格の推奨メッセージを生成する

**@constructor:** function Object() { [native code] }

##### PromotionSystem.generateExpandedBackstory (method)

拡張されたバックストーリーを生成する

**@constructor:** function Object() { [native code] }

##### PromotionSystem.generateDetailedHistory (method)

詳細な歴史を生成する

**@constructor:** function Object() { [native code] }

##### PromotionSystem.generateMotivations (method)

動機を生成する

**@constructor:** function Object() { [native code] }

##### PromotionSystem.generateSecrets (method)

秘密を生成する

**@constructor:** function Object() { [native code] }


---

### promotion-system copy.ts {#cnovel-automation-systemsrclibcharacterspromotion-system-copyts}

**Path:** `C:/novel-automation-system/src/lib/characters/#/promotion-system copy.ts`

//  * キャラクター昇格システム
//  * モブキャラクターからサブキャラクター、サブキャラクターからメインキャラクターへの
//  * 昇格を評価・管理するシステム
//

**@constructor:** function Object() { [native code] }


---

### relationship-graph copy 2.ts {#cnovel-automation-systemsrclibcharactersrelationship-graph-copy-2ts}

**Path:** `C:/novel-automation-system/src/lib/characters/#/relationship-graph copy 2.ts`

関係性グラフ管理キャラクター間の関係性を保持・分析するためのクラス

**@constructor:** function Object() { [native code] }

#### RelationshipGraph (class)

関係性グラフ管理キャラクター間の関係性を保持・分析するためのクラス

**@constructor:** function Object() { [native code] }

#### Methods of RelationshipGraph

##### RelationshipGraph.addCharacter (method)

キャラクターをグラフに追加する

**@constructor:** function Object() { [native code] }

##### RelationshipGraph.updateRelationship (method)

関係性を更新する

**@constructor:** function Object() { [native code] }

##### RelationshipGraph.reverseRelationship (method)

関係性を逆方向に変換する

**@constructor:** function Object() { [native code] }

##### RelationshipGraph.getReverseRelationshipType (method)

逆方向の関係タイプを取得する

**@constructor:** function Object() { [native code] }

##### RelationshipGraph.getRelationshipHistory (method)

関係性履歴を取得する

**@constructor:** function Object() { [native code] }

##### RelationshipGraph.saveRelationship (method)

関係性を保存する

**@constructor:** function Object() { [native code] }

##### RelationshipGraph.getRelationship (method)

関係性を取得する

**@constructor:** function Object() { [native code] }

##### RelationshipGraph.getConnectedCharacters (method)

接続されたキャラクターを取得する

**@constructor:** function Object() { [native code] }

##### RelationshipGraph.analyzeRelationshipDynamics (method)

関係性の動的分析を行う

**@constructor:** function Object() { [native code] }

##### RelationshipGraph.detectClusters (method)

クラスターを検出する関係性の強さに基づいてキャラクターをグループ化

**@constructor:** function Object() { [native code] }

##### RelationshipGraph.buildCluster (method)

単一のクラスターを構築する

**@constructor:** function Object() { [native code] }

##### RelationshipGraph.getDominantRelationType (method)

クラスター内の優勢な関係タイプを取得する

**@constructor:** function Object() { [native code] }

##### RelationshipGraph.calculateClusterCohesion (method)

クラスターの結束度を計算する

**@constructor:** function Object() { [native code] }

##### RelationshipGraph.detectTensions (method)

対立関係を検出する

**@constructor:** function Object() { [native code] }

##### RelationshipGraph.generateTensionDescription (method)

対立関係の説明を生成する

**@constructor:** function Object() { [native code] }

##### RelationshipGraph.trackRelationshipDevelopments (method)

関係性の発展を追跡する

**@constructor:** function Object() { [native code] }

##### RelationshipGraph.generateVisualizationData (method)

可視化データを生成する

**@constructor:** function Object() { [native code] }


---

### relationship-graph copy.ts {#cnovel-automation-systemsrclibcharactersrelationship-graph-copyts}

**Path:** `C:/novel-automation-system/src/lib/characters/#/relationship-graph copy.ts`

//  * 関係性グラフ管理
//  * キャラクター間の関係性を管理し、分析するシステム
//

**@constructor:** function Object() { [native code] }


---

### timing-analyzer copy 2.ts {#cnovel-automation-systemsrclibcharacterstiming-analyzer-copy-2ts}

**Path:** `C:/novel-automation-system/src/lib/characters/#/timing-analyzer copy 2.ts`

キャラクター登場タイミング分析ストーリーの流れとキャラクターの特性に基づいて最適な登場タイミングを分析・推奨するクラス

**@constructor:** function Object() { [native code] }

#### TimingAnalyzer (class)

キャラクター登場タイミング分析ストーリーの流れとキャラクターの特性に基づいて最適な登場タイミングを分析・推奨するクラス

**@constructor:** function Object() { [native code] }

#### Methods of TimingAnalyzer

##### TimingAnalyzer.getTimingRecommendation (method)

キャラクターの登場タイミング推奨を取得する

**@constructor:** function Object() { [native code] }

##### TimingAnalyzer.analyzeTimingFactors (method)

タイミング要因を分析する

**@constructor:** function Object() { [native code] }

##### TimingAnalyzer.analyzePlotRelevance (method)

プロット関連度を分析する

**@constructor:** function Object() { [native code] }

##### TimingAnalyzer.analyzeCharacterDevelopment (method)

キャラクター発展を分析する

**@constructor:** function Object() { [native code] }

##### TimingAnalyzer.analyzeNarrativePacing (method)

ナラティブペーシングを分析する

**@constructor:** function Object() { [native code] }

##### TimingAnalyzer.analyzeReaderExpectations (method)

読者期待を分析する

**@constructor:** function Object() { [native code] }

##### TimingAnalyzer.synthesizeAnalysis (method)

分析結果を統合する

**@constructor:** function Object() { [native code] }

##### TimingAnalyzer.calculatePlotRelevance (method)

プロット関連度を計算する

**@constructor:** function Object() { [native code] }

##### TimingAnalyzer.calculateImpact (method)

スコアから影響度を計算する

**@constructor:** function Object() { [native code] }

##### TimingAnalyzer.calculateExpectedStage (method)

期待される発展段階を計算する

**@constructor:** function Object() { [native code] }

##### TimingAnalyzer.calculateCharacterDensity (method)

キャラクター密度を計算する

**@constructor:** function Object() { [native code] }

##### TimingAnalyzer.calculatePacingScore (method)

ペーシングスコアを計算する

**@constructor:** function Object() { [native code] }

##### TimingAnalyzer.calculatePacingImpact (method)

ペーシング影響を計算する

**@constructor:** function Object() { [native code] }

##### TimingAnalyzer.getOptimalReappearanceInterval (method)

最適な再登場間隔を取得する

**@constructor:** function Object() { [native code] }

##### TimingAnalyzer.calculateOptimalChapter (method)

最適な登場チャプターを計算する

**@constructor:** function Object() { [native code] }

##### TimingAnalyzer.getBaseDelayByType (method)

キャラクタータイプによる基本遅延を取得する

**@constructor:** function Object() { [native code] }

##### TimingAnalyzer.calculateAlternativeChapters (method)

代替登場チャプターを計算する

**@constructor:** function Object() { [native code] }

##### TimingAnalyzer.calculateAppearanceSignificance (method)

登場の重要度を計算する

**@constructor:** function Object() { [native code] }

##### TimingAnalyzer.determineRequiredPreparation (method)

必要な準備を決定する

**@constructor:** function Object() { [native code] }

##### TimingAnalyzer.findRelevantUpcomingPlotPoints (method)

関連する今後のプロットポイントを検索する

**@constructor:** function Object() { [native code] }


---

### timing-analyzer copy.ts {#cnovel-automation-systemsrclibcharacterstiming-analyzer-copyts}

**Path:** `C:/novel-automation-system/src/lib/characters/#/timing-analyzer copy.ts`

//    * 登場タイミング分析器
//    * キャラクターの最適な登場タイミングを分析・推奨するシステム
//

**@constructor:** function Object() { [native code] }


---

### analyzer.ts {#cnovel-automation-systemsrclibcharactersanalyzerts}

**Path:** `C:/novel-automation-system/src/lib/characters/analyzer.ts`

@fileoverview キャラクター分析モジュール@description小説内のキャラクター抽出、分析、感情追跡などを行うためのモジュール。テキストからキャラクターを抽出し、その特性や感情状態を分析します。キャラクターの一貫性評価など、物語内のキャラクター品質確保に関する分析機能を提供します。@role- テキストからのキャラクター抽出と特性分析- キャラクターの感情変化の追跡と章ごとの分析- キャラクターの一貫性評価- AIを活用した高度なキャラクター分析@dependencies- @/types/characters (Character, EmotionalState, EmotionalStateValues) - キャラクター関連の型定義- @/lib/characters/manager (CharacterManager) - キャラクター管理システム- @/lib/utils/logger (logger) - ログ記録機能- @/lib/utils/error-handler (logError, getErrorMessage) - エラー処理機能- @/lib/generation/gemini-client (GeminiClient) - Gemini AIクライアント@flow1. クラスの初期化（CharacterManager、GeminiClientの初期化）2. テキスト分析依頼の受け取り3. Gemini AIを使用したキャラクター抽出・分析4. キャラクター感情や一貫性の分析5. 結果の整形と返却

**@constructor:** function Object() { [native code] }

#### CharacterAnalyzer (class)

@fileoverview キャラクター分析モジュール@description小説内のキャラクター抽出、分析、感情追跡などを行うためのモジュール。テキストからキャラクターを抽出し、その特性や感情状態を分析します。キャラクターの一貫性評価など、物語内のキャラクター品質確保に関する分析機能を提供します。@role- テキストからのキャラクター抽出と特性分析- キャラクターの感情変化の追跡と章ごとの分析- キャラクターの一貫性評価- AIを活用した高度なキャラクター分析@dependencies- @/types/characters (Character, EmotionalState, EmotionalStateValues) - キャラクター関連の型定義- @/lib/characters/manager (CharacterManager) - キャラクター管理システム- @/lib/utils/logger (logger) - ログ記録機能- @/lib/utils/error-handler (logError, getErrorMessage) - エラー処理機能- @/lib/generation/gemini-client (GeminiClient) - Gemini AIクライアント@flow1. クラスの初期化（CharacterManager、GeminiClientの初期化）2. テキスト分析依頼の受け取り3. Gemini AIを使用したキャラクター抽出・分析4. キャラクター感情や一貫性の分析5. 結果の整形と返却/
import { Character, EmotionalState, EmotionalStateValues } from '@/types/characters';
import { CharacterManager } from '@/lib/characters/manager';
import { logger } from '@/lib/utils/logger';
import { logError, getErrorMessage } from '@/lib/utils/error-handler';
import { GeminiClient } from '@/lib/generation/gemini-client';

/**@class CharacterAnalyzer@description小説内のキャラクター抽出、分析、感情追跡などを行うクラス。テキスト分析やキャラクターの感情変化追跡、一貫性分析などの機能を提供します。Gemini AIを活用して高度なテキスト分析を行います。@role- テキストからのキャラクター情報抽出- キャラクターの感情状態の追跡と分析- 章ごとのキャラクター一貫性の評価- AIを活用した自然言語分析の実行@used-by- コードからは直接の使用元は確認できません@depends-on- CharacterManager - キャラクター情報の取得と管理- GeminiClient - AI分析の実行- logger - ログ出力- logError - エラー情報のログ記録@lifecycle1. インスタンス化時にCharacterManagerとGeminiClientを初期化2. 必要に応じてテキスト分析や感情追跡メソッドが呼び出される3. 分析結果を呼び出し元に返却@example-flowアプリケーション → CharacterAnalyzer.extractCharactersFromText →   GeminiClient.generateText →  JSON解析処理 →  キャラクター情報の返却

**@constructor:** function Object() { [native code] }

#### Methods of CharacterAnalyzer

##### CharacterAnalyzer.constructor (method)

CharacterAnalyzerクラスのコンストラクタキャラクター管理とAI分析のためのインスタンスを初期化します。CharacterManagerとGeminiClientのインスタンスを作成し、初期化完了をログに記録します。@constructor@usage// 正確な初期化方法const characterAnalyzer = new CharacterAnalyzer();@call-flow1. CharacterManagerのインスタンス化2. GeminiClientのインスタンス化3. 初期化完了のログ記録@initializationこのコンストラクタでは、キャラクター管理とAI分析の依存サービスを初期化します。特に初期設定パラメータは必要なく、デフォルト設定で各サービスが初期化されます。

**@constructor:** function Object() { [native code] }

##### CharacterAnalyzer.extractCharactersFromText (method)

テキストからキャラクターを抽出して分析する入力されたテキストを分析し、登場するキャラクターとその特性を抽出します。Gemini AIを活用してテキスト分析を行い、キャラクターの名前、役割、性格特性、行動などを構造化されたJSON形式で取得します。@async@param {string} text 分析対象のテキスト@returns {Promise<any[]>} 抽出されたキャラクター情報の配列@usage// 使用例const characters = await characterAnalyzer.extractCharactersFromText(novelText);@call-context- 同期/非同期: 非同期メソッド（await必須）- 前提条件: GeminiClientが初期化されていること@call-flow1. 処理開始のログ記録2. Geminiへのプロンプト構築3. GeminiClientでテキスト生成APIを呼び出し4. レスポンスからJSONデータを正規表現で抽出5. 抽出されたJSONをパース6. 結果のログ記録と返却@external-dependencies- GeminiClient.generateText - テキスト分析のためのAI呼び出し@error-handlingtry-catchブロックで例外を捕捉し、エラーを詳細情報付きでログに記録します。エラー発生時は空の配列を返します。JSONの抽出に失敗した場合もログ警告を出力し、空の配列を返します。@expected-format```[  {    "name": "キャラクター名",    "role": "役割",    "traits": ["特性1", "特性2", ...],    "actions": ["行動1", "行動2", ...]  },  ...]```

**@constructor:** function Object() { [native code] }

##### CharacterAnalyzer.trackCharacterEmotions (method)

特定のキャラクターの感情変化を章ごとに追跡する指定されたキャラクターの感情状態を各章ごとに分析し、感情変化を追跡します。キャラクターの登場情報から感情を分析し、情報がない場合はGemini AIを使用して推定します。@async@param {string} characterName キャラクターの名前@param {number[]} chapters 追跡する章番号の配列@returns {Promise<any[]>} 感情追跡結果の配列@usage// 使用例const emotionTrack = await characterAnalyzer.trackCharacterEmotions("主人公名", [1, 2, 3, 4]);@call-context- 同期/非同期: 非同期メソッド（await必須）- 前提条件: CharacterManagerが初期化され、対象キャラクターが存在すること@call-flow1. 処理開始のログ記録2. CharacterManagerから全キャラクター取得3. 名前でキャラクターを検索4. 感情追跡の結果配列を初期化5. 各章ごとに:   a. キャラクターの登場情報を確認   b. 登場情報がある場合は直接感情分析   c. 登場情報がない場合はGemini AIで分析6. 結果のログ記録と返却@helper-methods- analyzeEmotionFromAppearance - 登場情報から感情を分析- analyzeEmotionWithGemini - GeminiでAI分析@error-handlingtry-catchブロックで例外を捕捉し、エラーをログに記録します。キャラクターが見つからない場合は警告ログを出力し、空の配列を返します。エラー発生時は空の配列を返します。@expected-format```[{  name: "キャラクター名",  emotions: [    { chapter: 章番号, emotion: "感情の説明", intensity: 感情の強度 },    ...  ]}]```

**@constructor:** function Object() { [native code] }

##### CharacterAnalyzer.analyzeEmotionFromAppearance (method)

登場情報から感情を分析するキャラクターの登場情報と状態に基づいて感情を分析し、説明と強度を返します。キャラクターの感情状態に基づいた説明文を生成し、登場情報のサマリーがある場合はそれを補足情報として追加します。@private@param {any} appearance 登場情報@param {Character} character キャラクター情報@returns {{description: string; intensity: number}} 感情の説明と強度@call-context- 同期/非同期: 同期メソッド- 内部利用: trackCharacterEmotionsから呼び出される内部メソッド@call-flow1. キャラクターの感情状態を取得（未設定の場合はNEUTRAL）2. 登場情報から感情的影響度を取得（未設定の場合は0.5）3. 感情状態に応じた説明文を生成（switch文でマッピング）4. 登場情報のサマリーがあれば説明に追加5. 説明文と影響度を返却@expected-format```{  description: "喜びと充実感（登場時の状況サマリー）",  intensity: 0.5 // 感情の強度（0〜1）}```

**@constructor:** function Object() { [native code] }

##### CharacterAnalyzer.analyzeEmotionWithGemini (method)

Geminiを使って感情を分析するキャラクター名と章番号を基にGemini AIを使用して感情状態を推定します。小説内のコンテキストを考慮して、最も可能性の高い感情状態とその強度をAI分析で取得します。@private@async@param {string} characterName キャラクター名@param {number} chapter 章番号@returns {Promise<{chapter: number; emotion: string; intensity: number} | undefined>} 感情情報または未定義@call-context- 同期/非同期: 非同期メソッド（await必須）- 内部利用: trackCharacterEmotionsから呼び出される内部メソッド@call-flow1. Geminiへのプロンプト構築2. GeminiClientでテキスト生成3. レスポンスからJSONデータを正規表現で抽出4. JSONデータをパース5. 章番号、感情、強度を含むオブジェクトを返却@external-dependencies- GeminiClient.generateText - 感情分析のためのAI呼び出し@error-handlingtry-catchブロックで例外を捕捉し、エラーをログに記録します。JSONの抽出に失敗した場合はundefinedを返します。エラー発生時はフォールバック値（章番号、"不明"感情、強度0.5）を返します。@expected-format```{  chapter: 章番号,  emotion: "感情の説明",  intensity: 0.5 // 感情の強度（0〜1）}```

**@constructor:** function Object() { [native code] }

##### CharacterAnalyzer.analyzeCharacterConsistency (method)

キャラクターの一貫性を分析する指定された期間（章の範囲）におけるキャラクターの一貫性を分析し、一貫性スコアと詳細な分析結果を返します。感情変化のパターンを分析し、急激な変化がないかを評価します。@async@param {string} characterName キャラクター名@param {number} startChapter 開始章@param {number} endChapter 終了章@returns {Promise<any>} 一貫性スコアと分析@usage// 使用例const consistencyAnalysis = await characterAnalyzer.analyzeCharacterConsistency("主人公名", 1, 5);@call-context- 同期/非同期: 非同期メソッド（await必須）- 前提条件: CharacterManagerが初期化され、対象キャラクターが存在すること@call-flow1. 処理開始のログ記録2. CharacterManagerから全キャラクター取得3. 名前でキャラクターを検索4. 対象章の登場情報を抽出5. 登場情報が不足している場合は早期リターン6. 感情の変化を分析し、急激な変化をカウント7. 一貫性スコアを計算8. スコアに基づく分析テキストを生成9. 分析結果を構築して返却@error-handlingtry-catchブロックで例外を捕捉し、エラーをログに記録します。キャラクターが見つからない場合は警告ログを出力し、エラー情報を返します。分析対象の章に十分な登場がない場合は、その旨を説明する結果を返します。エラー発生時は最小限の情報（スコア0、エラーメッセージ）を返します。@expected-format```{  score: 0.8, // 一貫性スコア（0〜1）  analysis: "「キャラクター名」は高い一貫性を持って描写されています...",  details: {    appearanceCount: 登場回数,    emotionalChanges: [      { chapter: 章番号, emotionalImpact: 影響度, state: 感情状態 },      ...    ],    inconsistencyCount: 一貫性がない箇所の数  }}```

**@constructor:** function Object() { [native code] }


---

### evolution-system.ts {#cnovel-automation-systemsrclibcharactersevolution-systemts}

**Path:** `C:/novel-automation-system/src/lib/characters/evolution-system.ts`

@fileoverview キャラクター進化システム@description物語の進行に応じたキャラクターの成長・変化を管理するモジュール。様々なイベントタイプに基づいてキャラクターの内面的・外面的な発展を計算・追跡するロジックを提供する。@role- キャラクター発展のライフサイクル管理- チャプターイベントに基づく性格変化の計算- 関係性の発展と影響の追跡- 発展経路とマイルストーンの生成と管理- 変容アークの識別と計画@dependencies- @/types/characters - キャラクター関連の型定義- @/lib/utils/logger - ロギング機能- @/lib/storage - ストレージアクセス機能- @/lib/utils/error-handler - エラーハンドリング機能@types- Character - キャラクター情報- CharacterDevelopment - キャラクター発展情報- DevelopmentPath - 発展経路情報- ChapterEvent - チャプターイベント- TransformationArc - 変容アーク情報@flow1. チャプターイベントの発生2. イベントの影響分析3. キャラクター特性に基づく影響の調整4. 発展段階の評価と更新5. 発展履歴への記録

**@constructor:** function Object() { [native code] }

#### EvolutionSystem (class)

@fileoverview キャラクター進化システム@description物語の進行に応じたキャラクターの成長・変化を管理するモジュール。様々なイベントタイプに基づいてキャラクターの内面的・外面的な発展を計算・追跡するロジックを提供する。@role- キャラクター発展のライフサイクル管理- チャプターイベントに基づく性格変化の計算- 関係性の発展と影響の追跡- 発展経路とマイルストーンの生成と管理- 変容アークの識別と計画@dependencies- @/types/characters - キャラクター関連の型定義- @/lib/utils/logger - ロギング機能- @/lib/storage - ストレージアクセス機能- @/lib/utils/error-handler - エラーハンドリング機能@types- Character - キャラクター情報- CharacterDevelopment - キャラクター発展情報- DevelopmentPath - 発展経路情報- ChapterEvent - チャプターイベント- TransformationArc - 変容アーク情報@flow1. チャプターイベントの発生2. イベントの影響分析3. キャラクター特性に基づく影響の調整4. 発展段階の評価と更新5. 発展履歴への記録/

import { Character, CharacterDevelopment, DevelopmentPath, DevelopmentImpact, ChapterEvent, DevelopmentPathPhase, TransformationArc, GrowthEvent, Milestone, ArcType } from '@/types/characters';
import { logger } from '@/lib/utils/logger';
import { storageProvider } from '@/lib/storage';
import { logError, getErrorMessage } from '@/lib/utils/error-handler';

/**@class EvolutionSystem@description キャラクター進化システム - 物語の進行に応じたキャラクターの成長・変化を管理するクラス@role- チャプターイベントに基づくキャラクター発展の計算と適用- 性格特性、関係性、スキル、感情の変化の追跡- 発展段階の評価と昇格の管理- 発展経路とマイルストーンの生成- 変容アークの識別と管理@depends-on- logger - ログ記録用ユーティリティ- storageProvider - キャラクターデータの永続化- logError - エラー処理と記録@lifecycle1. インスタンス化とシステム初期化2. チャプターイベントの処理と影響計算3. キャラクター特性に基づく影響の調整4. 発展段階の評価と更新5. 発展履歴の管理と保存@example-flowストーリーイベント発生 → processCharacterDevelopment →   analyzeDevelopmentImpact → applyEventImpact →   adjustImpactsBasedOnBackground → evaluateDevelopmentStage →  updateDevelopmentHistory → ストレージに保存

**@constructor:** function Object() { [native code] }

#### Methods of EvolutionSystem

##### EvolutionSystem.constructor (method)

EvolutionSystemクラスのコンストラクタシステムの初期化を行い、基本的なログメッセージを出力する。@constructor@usage// システムのインスタンス化const evolutionSystem = new EvolutionSystem();@call-flow1. インスタンス生成2. ログメッセージの出力 ('EvolutionSystem initialized')@initializationシステムの初期化時に特別な設定は不要。STAGE_THRESHOLDSとMAX_DEVELOPMENT_STAGEの定義値がコンストラクタ実行前に設定される。

**@constructor:** function Object() { [native code] }

##### EvolutionSystem.processCharacterDevelopment (method)

チャプターイベントに基づくキャラクター発展を処理する指定されたキャラクターに対して、チャプターで発生したイベントの影響を分析し、性格特性や関係性などの変化を計算する。必要に応じて発展段階の更新も行う。@async@param {Character} character - 対象キャラクター@param {ChapterEvent[]} chapterEvents - チャプターで発生したイベント配列@returns {Promise<CharacterDevelopment>} キャラクターの発展情報@throws {Error} 処理中にエラーが発生した場合@usage// キャラクター発展の処理try {  const development = await evolutionSystem.processCharacterDevelopment(    character,    chapterEvents  );  // 発展情報の利用} catch (error) {  // エラー処理}@call-context- 同期/非同期: 非同期メソッド（await必須）- 推奨呼び出し環境: サーバーサイド- 前提条件: 有効なcharacterオブジェクトとchapterEvents配列@call-flow1. ログ記録開始2. 発展影響の分析（analyzeDevelopmentImpact）3. 発展結果の構築4. 発展段階の評価と更新（evaluateDevelopmentStage）5. 段階進行のある場合、進行理由の生成6. 発展履歴の更新（updateDevelopmentHistory）7. 処理完了のログ記録8. 発展情報の返却@helper-methods- analyzeDevelopmentImpact - イベントの影響分析- evaluateDevelopmentStage - 発展段階の評価- generateStageProgressionReason - 段階進行理由の生成- updateDevelopmentHistory - 発展履歴の更新@error-handlingすべての例外をキャッチし、logError関数でエラーログを記録した後、元の例外を再スローする。エラー情報にはキャラクターIDが含まれる。@state-changes- キャラクターの発展履歴が更新される- 発展段階が更新される可能性がある@monitoring- ログレベル: INFO、ERROR

**@constructor:** function Object() { [native code] }

##### EvolutionSystem.evaluateDevelopmentStage (method)

発展段階の評価と更新キャラクターの発展情報に基づいて、発展段階を評価し、新しい発展段階を計算する。@private@param {number} currentStage - 現在の発展段階@param {CharacterDevelopment} development - 発展情報@param {string} characterType - キャラクタータイプ@returns {number} 新しい発展段階@call-flow1. 性格、関係性、感情の発展度を計算2. 重み付けされた発展指数の計算3. 発展指数に基づいた段階増加の判定4. キャラクタータイプに応じた最大段階の制限の適用@state-changesこのメソッド自体は状態を変更しない（純粋な計算のみ）。計算結果は呼び出し元で利用される。

**@constructor:** function Object() { [native code] }

##### EvolutionSystem.generateStageProgressionReason (method)

発展段階進行理由の生成キャラクターの発展情報に基づいて、発展段階の進行理由を説明テキストとして生成する。@private@param {CharacterDevelopment} development - 発展情報@param {Character} character - キャラクター@returns {string} 進行理由の説明文@call-flow1. 最も大きな影響を受けた要素を特定  - 性格変化（getStrongestChange）  - 関係性変化（getStrongestRelationshipChange）  - 感情的影響  - 物語上の重要性2. 特定した影響要素に基づく理由パターンの選択と生成@helper-methods- getStrongestChange - 最大の性格変化の取得- getStrongestRelationshipChange - 最大の関係性変化の取得@state-changesこのメソッド自体は状態を変更しない（文字列生成のみ）。

**@constructor:** function Object() { [native code] }

##### EvolutionSystem.getStrongestChange (method)

オブジェクト内で最も大きな変化の要素を取得変化オブジェクト内で最も値の絶対値が大きい要素とその値を返す。@private@param {Record<string, number>} changes - 変化オブジェクト@returns {{ key: string; value: number } | null} 最大変化要素とその値、または空の場合はnull@call-flow1. 変化オブジェクトが空の場合はnullを返す2. 初期の最大要素を設定3. すべての要素をループして絶対値が最大の要素を特定4. 最大要素とその値を返す

**@constructor:** function Object() { [native code] }

##### EvolutionSystem.getStrongestRelationshipChange (method)

関係性オブジェクトで最も大きな変化の要素を取得関係性変化オブジェクト内で変化の絶対値が最も大きい要素とその情報を返す。@private@param {Record<string, { change: number; reason: string }>} changes - 関係性変化オブジェクト@returns {{ id: string; change: number; reason: string } | null} 最大変化要素とその値、または空の場合はnull@call-flow1. 関係性オブジェクトが空の場合はnullを返す2. 初期の最大要素を設定3. すべての要素をループして変化の絶対値が最大の要素を特定4. 最大要素のID、変化値、理由を返す

**@constructor:** function Object() { [native code] }

##### EvolutionSystem.generateDevelopmentPath (method)

キャラクターの発展経路を生成するキャラクターの現在の状態に基づいて、今後の発展経路を計画・生成する。マイルストーン、成長イベント、変容アークなどを含む。@async@param {Character} character - 対象キャラクター@returns {Promise<DevelopmentPath>} 発展経路@throws {Error} 処理中にエラーが発生した場合@usage// キャラクターの発展経路を生成try {  const path = await evolutionSystem.generateDevelopmentPath(character);  // 発展経路の利用} catch (error) {  // エラー処理}@call-context- 同期/非同期: 非同期メソッド（await必須）- 推奨呼び出し環境: サーバーサイド- 前提条件: 有効なcharacterオブジェクト@call-flow1. 現在の発展段階と目標段階の取得2. 発展経路フェーズの決定（determinePathPhase）3. マイルストーンの生成（generateMilestones）4. 成長イベントの計画（planGrowthEvents）5. 変容アークの識別（identifyTransformationArcs）6. 完了予測チャプターの推定（estimateCompletionChapter）7. 発展経路オブジェクトの構築と返却@helper-methods- determinePathPhase - 発展経路フェーズの決定- generateMilestones - マイルストーンの生成- planGrowthEvents - 成長イベントの計画- identifyTransformationArcs - 変容アークの識別- estimateCompletionChapter - 完了予測チャプターの推定@error-handlingすべての例外をキャッチし、logError関数でエラーログを記録した後、元の例外を再スローする。エラー情報にはキャラクターIDが含まれる。@monitoring- ログレベル: INFO、ERROR

**@constructor:** function Object() { [native code] }

##### EvolutionSystem.determinePathPhase (method)

発展経路フェーズを決定するキャラクターの種類、現在の発展段階、目標発展段階に基づいて適切な発展経路フェーズを決定する。@private@param {Character} character - キャラクター@param {number} currentStage - 現在の発展段階@param {number} targetStage - 目標発展段階@returns {DevelopmentPathPhase} 発展経路フェーズ@call-flow1. 現在段階と目標段階の差を計算2. キャラクタータイプに基づく条件分岐  - MAIN: 初期状態、完成状態、大変化、通常進行のいずれか  - SUB: 初期状態、サポート役、小変化のいずれか  - MOB: 静的扱い3. 適切なフェーズを返却@state-changesこのメソッド自体は状態を変更しない（フェーズ決定のみ）。

**@constructor:** function Object() { [native code] }

##### EvolutionSystem.estimateCompletionChapter (method)

目標達成の予想チャプターを推定する@param character キャラクター@param targetStage 目標段階@returns 予想達成チャプター

**@constructor:** function Object() { [native code] }

##### EvolutionSystem.analyzeDevelopmentImpact (method)

発展影響を分析する@param character キャラクター@param events イベント配列@returns 発展影響情報

**@constructor:** function Object() { [native code] }

##### EvolutionSystem.adjustImpactsBasedOnBackground (method)

背景に基づいて発展影響を調整する@param impacts 発展影響@param character キャラクター

**@constructor:** function Object() { [native code] }

##### EvolutionSystem.applyEventImpact (method)

イベント影響をキャラクターに適用する@param impacts 発展影響@param event イベント@param character キャラクター

**@constructor:** function Object() { [native code] }

##### EvolutionSystem.applyConflictImpact (method)

対立イベントの影響を適用する@param impacts 発展影響@param event イベント@param character キャラクター

**@constructor:** function Object() { [native code] }

##### EvolutionSystem.applyRevelationImpact (method)

啓示イベントの影響を適用する@param impacts 発展影響@param event イベント@param character キャラクター

**@constructor:** function Object() { [native code] }

##### EvolutionSystem.applyRelationshipImpact (method)

関係性イベントの影響を適用する@param impacts 発展影響@param event イベント@param character キャラクター

**@constructor:** function Object() { [native code] }

##### EvolutionSystem.applySkillDevelopmentImpact (method)

スキル発展イベントの影響を適用する@param impacts 発展影響@param event イベント@param character キャラクター

**@constructor:** function Object() { [native code] }

##### EvolutionSystem.applyEmotionalImpact (method)

感情イベントの影響を適用する@param impacts 発展影響@param event イベント@param character キャラクター

**@constructor:** function Object() { [native code] }

##### EvolutionSystem.applyDecisionImpact (method)

決断イベントの影響を適用する@param impacts 発展影響@param event イベント@param character キャラクター

**@constructor:** function Object() { [native code] }

##### EvolutionSystem.applyChallengeImpact (method)

挑戦イベントの影響を適用する@param impacts 発展影響@param event イベント@param character キャラクター

**@constructor:** function Object() { [native code] }

##### EvolutionSystem.applySacrificeImpact (method)

犠牲イベントの影響を適用する@param impacts 発展影響@param event イベント@param character キャラクター

**@constructor:** function Object() { [native code] }

##### EvolutionSystem.calculateTargetStage (method)

目標発展段階を計算する@param character キャラクター@returns 目標発展段階

**@constructor:** function Object() { [native code] }

##### EvolutionSystem.generateMilestones (method)

発展マイルストーンを生成する@param currentStage 現在の発展段階@param targetStage 目標発展段階@param character キャラクター@returns マイルストーン配列

**@constructor:** function Object() { [native code] }

##### EvolutionSystem.generateMilestoneDescription (method)

マイルストーンの説明を生成する@param stage 発展段階@param character キャラクター@returns マイルストーン説明

**@constructor:** function Object() { [native code] }

##### EvolutionSystem.generateStageRequirements (method)

段階ごとの要件を生成する@param stage 発展段階@param character キャラクター@returns 段階要件

**@constructor:** function Object() { [native code] }

##### EvolutionSystem.estimateChapterForStage (method)

段階到達の予測チャプターを推定する@param stage 発展段階@param character キャラクター@returns 予測チャプター

**@constructor:** function Object() { [native code] }

##### EvolutionSystem.planGrowthEvents (method)

成長イベントを計画する@param character キャラクター@param pathPhase 発展経路フェーズ@returns 成長イベント配列

**@constructor:** function Object() { [native code] }

##### EvolutionSystem.selectGrowthEventType (method)

成長イベントタイプを選択する@param pathPhase 発展経路フェーズ@param index イベントインデックス@param totalEvents 総イベント数@param character キャラクター@returns イベントタイプ

**@constructor:** function Object() { [native code] }

##### EvolutionSystem.generateGrowthEventDescription (method)

成長イベントの説明を生成する@param eventType イベントタイプ@param character キャラクター@param pathPhase 発展経路フェーズ@param index イベントインデックス@param prevEvent 前のイベント@returns イベント説明

**@constructor:** function Object() { [native code] }

##### EvolutionSystem.calculateEventSignificance (method)

イベントの重要度を計算する@param pathPhase 発展経路フェーズ@param index イベントインデックス@param totalEvents 総イベント数@returns 重要度（0-1）

**@constructor:** function Object() { [native code] }

##### EvolutionSystem.generateEventTriggers (method)

イベントのトリガー条件を生成する@param eventType イベントタイプ@param character キャラクター@returns トリガー条件配列

**@constructor:** function Object() { [native code] }

##### EvolutionSystem.generatePotentialOutcomes (method)

イベントの潜在的な結果を生成する@param eventType イベントタイプ@param character キャラクター@returns 潜在的結果配列

**@constructor:** function Object() { [native code] }

##### EvolutionSystem.identifyTransformationArcs (method)

変容アークを識別する@param character キャラクター@param pathPhase 発展経路フェーズ@returns 変容アーク配列

**@constructor:** function Object() { [native code] }

##### EvolutionSystem.filterArcsBasedOnCharacter (method)

キャラクターの特性に基づいてアークをフィルタリングする@param arcTypes アークタイプ配列@param character キャラクター@returns フィルタリングされたアークタイプ配列

**@constructor:** function Object() { [native code] }

##### EvolutionSystem.constructTransformationArc (method)

変容アークを構築する@param arcType アークタイプ@param character キャラクター@param pathPhase 発展経路フェーズ@returns 変容アーク

**@constructor:** function Object() { [native code] }

##### EvolutionSystem.generateArcTheme (method)

アークの主要テーマを生成する@param arcType アークタイプ@param character キャラクター@returns アークテーマ

**@constructor:** function Object() { [native code] }

##### EvolutionSystem.generateArcKeyPoints (method)

アークのキーポイントを生成する@param arcType アークタイプ@param character キャラクター@param beginStage 開始段階@param peakStage ピーク段階@param resolutionStage 解決段階@returns キーポイント配列

**@constructor:** function Object() { [native code] }

##### EvolutionSystem.distributeStages (method)

段階を均等に分布させる@param start 開始値@param end 終了値@param count 分割数@returns 分布した段階の配列

**@constructor:** function Object() { [native code] }

##### EvolutionSystem.updateDevelopmentHistory (method)

発展履歴を更新する@param character キャラクター@param development 発展情報

**@constructor:** function Object() { [native code] }

##### EvolutionSystem.summarizePersonalityChanges (method)

性格変化の要約を生成する@param changes 性格変化オブジェクト@returns 要約文字列

**@constructor:** function Object() { [native code] }

##### EvolutionSystem.summarizeRelationshipChanges (method)

関係性変化の要約を生成する@param changes 関係性変化オブジェクト@returns 要約文字列

**@constructor:** function Object() { [native code] }

##### EvolutionSystem.getDirectoryByType (method)

キャラクタータイプに応じたディレクトリを取得する@param type キャラクタータイプ@returns ディレクトリパス

**@constructor:** function Object() { [native code] }


---

### manager.ts {#cnovel-automation-systemsrclibcharactersmanagerts}

**Path:** `C:/novel-automation-system/src/lib/characters/manager.ts`

@fileoverview キャラクター管理システム@descriptionキャラクターの追加、更新、取得、関係性管理など、キャラクターに関するすべての操作を行うための中央管理モジュールです。このモジュールはストレージとの連携、キャラクターデータの変換、関係グラフの管理、キャラクター発展の処理などを統合的に提供します。@role- キャラクターのCRUD操作の提供- キャラクターデータの永続化管理- キャラクター間の関係性管理- キャラクターの発展と成長の処理- キャラクターの昇格処理- キャラクターの登場タイミング分析@dependencies- @/types/characters - キャラクター関連の型定義- ./promotion-system - キャラクター昇格処理- ./relationship-graph - キャラクター間の関係性グラフ管理- ./evolution-system - キャラクターの発展と成長処理- ./timing-analyzer - キャラクターの登場タイミング分析- @/lib/storage - ストレージ操作ユーティリティ- @/lib/utils/logger - ロギング機能- @/lib/utils/helpers - ヘルパー関数- @/lib/utils/error-handler - エラー処理ユーティリティ- @/lib/utils/yaml-helper - YAML変換ユーティリティ@flow1. インスタンス化と依存サービスの初期化2. ストレージからキャラクターデータのロード3. 関係グラフの構築4. キャラクター操作API（追加/更新/取得）の提供5. キャラクター発展・分析APIの提供6. ストレージへのキャラクターデータ保存

**@constructor:** function Object() { [native code] }

#### CharacterManager (class)

@fileoverview キャラクター管理システム@descriptionキャラクターの追加、更新、取得、関係性管理など、キャラクターに関するすべての操作を行うための中央管理モジュールです。このモジュールはストレージとの連携、キャラクターデータの変換、関係グラフの管理、キャラクター発展の処理などを統合的に提供します。@role- キャラクターのCRUD操作の提供- キャラクターデータの永続化管理- キャラクター間の関係性管理- キャラクターの発展と成長の処理- キャラクターの昇格処理- キャラクターの登場タイミング分析@dependencies- @/types/characters - キャラクター関連の型定義- ./promotion-system - キャラクター昇格処理- ./relationship-graph - キャラクター間の関係性グラフ管理- ./evolution-system - キャラクターの発展と成長処理- ./timing-analyzer - キャラクターの登場タイミング分析- @/lib/storage - ストレージ操作ユーティリティ- @/lib/utils/logger - ロギング機能- @/lib/utils/helpers - ヘルパー関数- @/lib/utils/error-handler - エラー処理ユーティリティ- @/lib/utils/yaml-helper - YAML変換ユーティリティ@flow1. インスタンス化と依存サービスの初期化2. ストレージからキャラクターデータのロード3. 関係グラフの構築4. キャラクター操作API（追加/更新/取得）の提供5. キャラクター発展・分析APIの提供6. ストレージへのキャラクターデータ保存/
import {
Character,
CharacterType,
CharacterData,
CharacterState,
CharacterHistory,
CharacterAppearance,
PromotionEvaluation,
Backstory,
Relationship,
EmotionalState,
EmotionalStateValues // この行を追加
} from '@/types/characters';
import { PromotionSystem } from './promotion-system';
import { RelationshipGraph } from './relationship-graph';
import { EvolutionSystem } from './evolution-system';
import { TimingAnalyzer } from './timing-analyzer';
import { storageProvider } from '@/lib/storage';
import { logger } from '@/lib/utils/logger';
import { generateId } from '@/lib/utils/helpers';
import { logError, getErrorMessage } from '@/lib/utils/error-handler';
import { parseYaml, stringifyYaml } from '@/lib/utils/yaml-helper';

/**@class CharacterManager@descriptionキャラクターの追加、更新、取得、関係性管理など、キャラクターに関する全ての操作を管理するクラス@role- キャラクターのライフサイクル管理- キャラクターデータのロードと保存- キャラクター間の関係性管理- キャラクターの発展と成長の処理- キャラクターの昇格管理- キャラクターの分析（タイミング、関係性等）@used-by- API層 - キャラクターの取得/追加/更新/昇格等の操作- ストーリー管理層 - キャラクターの登場タイミングと関係性の分析@depends-on- PromotionSystem - キャラクターの昇格評価と処理- RelationshipGraph - キャラクター間の関係性の管理- EvolutionSystem - キャラクターの成長と発展の管理- TimingAnalyzer - キャラクターの登場タイミングの分析- storageProvider - キャラクターデータの永続化@lifecycle1. インスタンス化：必要な依存サービスを初期化2. データロード：ストレージからキャラクターデータをロード3. 関係グラフ構築：キャラクター間の関係性を初期化4. 操作提供：追加/更新/取得/分析などの操作を提供5. データ保存：変更されたキャラクターデータをストレージに保存@example-flowAPIリクエスト → CharacterManager.getCharacter →   データ取得 →  関連するキャラクター関係の取得 →  レスポンス生成 →  APIレスポンス

**@constructor:** function Object() { [native code] }

#### Methods of CharacterManager

##### CharacterManager.constructor (method)

CharacterManagerクラスのコンストラクタ必要な依存サービスを初期化し、キャラクターデータの初期ロードを開始します。初期化は非同期で行われ、initializationPromiseプロパティで追跡されます。@constructor@usage// マネージャーのインスタンス化const characterManager = new CharacterManager();// 初期化完了を待機してから使用await characterManager.someMethod();@call-flow1. 依存サービスのインスタンス化2. 初期ロード処理の開始（非同期）@initializationPromotionSystem、RelationshipGraph、EvolutionSystem、TimingAnalyzerのインスタンスを作成し、initialize()メソッドを呼び出してキャラクターデータの初期ロードを開始します。初期化の完了状態はinitialized（ブール値）で追跡されます。

**@constructor:** function Object() { [native code] }

##### CharacterManager.initialize (method)

キャラクターデータを初期化するストレージからキャラクターデータをロードし、マネージャーの初期化状態を設定します。@private@async@returns {Promise<void>} 初期化完了を表すPromise@throws {Error} 初期化中にエラーが発生した場合@call-flow1. loadCharacters()を呼び出してデータをロード2. initialized フラグを true に設定3. 初期化完了をログに記録@error-handlingエラーが発生した場合、logError()でログを記録し、エラーを上位に再スローします。@state-changes- initialized フラグが true に設定される@monitoring- ログレベル: INFO、ERROR

**@constructor:** function Object() { [native code] }

##### CharacterManager.ensureInitialized (method)

キャラクターデータを初期化するストレージからキャラクターデータをロードし、マネージャーの初期化状態を設定します。@private@async@returns {Promise<void>} 初期化完了を表すPromise@throws {Error} 初期化中にエラーが発生した場合@call-flow1. loadCharacters()を呼び出してデータをロード2. initialized フラグを true に設定3. 初期化完了をログに記録@error-handlingエラーが発生した場合、logError()でログを記録し、エラーを上位に再スローします。@state-changes- initialized フラグが true に設定される@monitoring- ログレベル: INFO、ERROR

**@constructor:** function Object() { [native code] }

##### CharacterManager.loadCharacters (method)

ストレージからキャラクターデータをロードする各タイプ（メイン、サブ、モブ）のキャラクターをロードし、関係グラフを再構築します。@private@async@returns {Promise<void>} ロード完了を表すPromise@throws {Error} データロード中にエラーが発生した場合@call-flow1. メインキャラクターのロード2. サブキャラクターのロード3. モブキャラクターのロード4. すべてのキャラクターをcharactersマップに追加5. 関係グラフの再構築6. ロード完了のログ記録@error-handlingエラーが発生した場合、logError()でログを記録し、エラーを上位に再スローします。@monitoring- ログレベル: INFO、ERROR

**@constructor:** function Object() { [native code] }

##### CharacterManager.loadCharactersByType (method)

指定されたタイプのキャラクターをロードする指定されたディレクトリから特定タイプのキャラクターファイルを読み込み、パースします。@private@async@param {string} type - ロードするキャラクターのタイプ/ディレクトリ名@returns {Promise<Character[]>} ロードされたキャラクターの配列@throws {Error} データロード中にエラーが発生した場合@call-flow1. 指定されたタイプのディレクトリ内のファイル一覧を取得2. YAML/JSONファイルを並行してロード3. 各ファイルの内容をパースしてキャラクターオブジェクトに変換4. パースに成功したキャラクターを配列に追加5. すべてのロード処理の完了を待機6. キャラクター配列を返却@error-handling- 個別ファイルのロードエラーはログに記録するが処理を続行- ディレクトリ操作のエラーは記録し、空配列を返却@monitoring- ログレベル: ERROR

**@constructor:** function Object() { [native code] }

##### CharacterManager.parseCharacterData (method)

文字列データからキャラクター情報をパースするファイル内容をJSON/YAMLからパースし、必須フィールドのバリデーションと日付変換を行います。@private@param {string} data - パースするデータ文字列@param {string} filePath - データの元ファイルパス@returns {Character | null} パースされたキャラクターデータ、または失敗時はnull@call-flow1. ファイル拡張子に基づいて適切なパース方法を選択（JSON/YAML）2. データをパース3. 必須フィールドのバリデーション4. 日付文字列をDateオブジェクトに変換5. Characterオブジェクトとして返却@error-handlingエラーが発生した場合、logError()でログを記録し、nullを返します。@monitoring- ログレベル: WARN、ERROR

**@constructor:** function Object() { [native code] }

##### CharacterManager.validateCharacterData (method)

キャラクターデータの必須フィールドをバリデーションするパースされたデータに必要なフィールドが含まれているかを確認します。@private@param {any} data - バリデーションするデータオブジェクト@param {string} filePath - データの元ファイルパス@returns {boolean} バリデーション成功の場合はtrue、失敗の場合はfalse@call-flow1. 必須フィールドのリストを定義2. 各必須フィールドの存在をチェック3. 不足しているフィールドがある場合は警告をログに記録してfalseを返す4. すべてのフィールドが存在する場合はtrueを返す@monitoring- ログレベル: WARN

**@constructor:** function Object() { [native code] }

##### CharacterManager.convertDates (method)

オブジェクト内の日付文字列をDateオブジェクトに変換するオブジェクト内のISO形式の日付文字列を再帰的に検索し、JavaScriptのDateオブジェクトに変換します。@private@param {any} obj - 変換対象のオブジェクト@returns {void}@call-flow1. 引数のnullまたは非オブジェクトチェック2. オブジェクトの各プロパティを反復処理3. ISO形式の日付文字列を検出したらDateオブジェクトに変換4. ネストしたオブジェクトに対して再帰的に処理@state-changes引数のオブジェクト内のISO形式日付文字列がDateオブジェクトに変換される

**@constructor:** function Object() { [native code] }

##### CharacterManager.rebuildRelationshipGraph (method)

関係グラフを再構築する全キャラクターのデータをもとに、キャラクター間の関係性グラフを構築します。@private@async@returns {Promise<void>} 再構築完了を表すPromise@call-flow1. 関係グラフをクリア（新しいインスタンスを作成）2. すべてのキャラクターをグラフに追加3. 関係性データをロード4. ロードした関係性データをグラフに設定5. 完了ログの記録@error-handlingエラーが発生した場合、logError()でログを記録します。このメソッドはエラーを上位に伝播させません。@monitoring- ログレベル: INFO、ERROR

**@constructor:** function Object() { [native code] }

##### CharacterManager.loadRelationshipData (method)

関係性データをロードするストレージから関係性データファイルを読み込み、パースします。@private@async@returns {Promise<any[]>} ロードされた関係性データの配列@call-flow1. 関係性ディレクトリの確認と必要に応じた作成2. 関係性ファイル一覧の取得3. YAML/JSONファイルを並行してロード4. 各ファイルの内容をパースして関係性オブジェクトに変換5. 必要なフィールド変換と検証6. すべてのロード処理の完了を待機7. 関係性データ配列を返却@error-handling- 個別ファイルのロードエラーはログに記録するが処理を続行- ディレクトリ操作のエラーは記録し、空配列を返却@monitoring- ログレベル: DEBUG、ERROR

**@constructor:** function Object() { [native code] }

##### CharacterManager.addCharacter (method)

新しいキャラクターを追加する提供されたデータをもとに新しいキャラクターオブジェクトを作成し、ストレージに保存します。@async@param {CharacterData} data - 追加するキャラクターのデータ@returns {Promise<Character>} 作成されたキャラクターオブジェクト@throws {Error} キャラクター追加中にエラーが発生した場合@usage// キャラクターを追加const newCharacter = await characterManager.addCharacter({  name: "キャラクター名",  type: "SUB",  description: "キャラクターの説明",  // その他のプロパティ...});@call-flow1. 初期化完了を確認2. データバリデーション3. キャラクターオブジェクトの作成（IDの生成など）4. キャラクターマップに追加5. 関係グラフに追加6. ストレージに保存7. ログ記録8. 作成したキャラクターを返却@error-handlingエラーが発生した場合、logError()でログを記録し、エラーメッセージを含む例外をスローします。@state-changes- charactersマップに新しいキャラクターが追加される- 関係グラフにキャラクターが追加される- ストレージに新しいキャラクターファイルが作成される@monitoring- ログレベル: INFO、ERROR

**@constructor:** function Object() { [native code] }

##### CharacterManager.validateNewCharacterData (method)

新規キャラクターデータのバリデーション追加するキャラクターデータが必要な条件を満たしているか検証します。@private@param {CharacterData} data - バリデーションするキャラクターデータ@returns {void}@throws {Error} バリデーションに失敗した場合@call-flow1. 必須フィールド（name, type, description）の存在確認2. typeの有効性確認（MAIN, SUB, MOBのいずれか）3. 関係性データのバリデーション（存在する場合）@error-handlingバリデーションに失敗した場合、具体的なエラーメッセージを含む例外をスローします。

**@constructor:** function Object() { [native code] }

##### CharacterManager.updateCharacter (method)

キャラクターを更新する指定されたIDのキャラクターを提供されたデータで更新します。@async@param {string} id - 更新するキャラクターのID@param {Partial<CharacterData>} updates - 更新データ@returns {Promise<Character>} 更新されたキャラクターオブジェクト@throws {Error} キャラクターが存在しない場合やバリデーションに失敗した場合@usage// キャラクターを更新const updatedCharacter = await characterManager.updateCharacter("char_123", {  name: "新しい名前",  description: "新しい説明"});@call-flow1. 初期化完了を確認2. 既存キャラクターの存在確認3. 更新データのバリデーション4. 更新されたキャラクターオブジェクトの作成5. マップの更新6. 関係性がある場合は関係グラフも更新7. ストレージに保存8. ログ記録9. 更新されたキャラクターを返却@error-handling- キャラクターが存在しない場合は例外をスロー- バリデーションに失敗した場合は例外をスロー- 保存中にエラーが発生した場合は例外をスロー@state-changes- charactersマップ内の該当キャラクターが更新される- 関係性が更新された場合は関係グラフも更新される- ストレージ内のキャラクターファイルが更新される@monitoring- ログレベル: INFO、ERROR

**@constructor:** function Object() { [native code] }

##### CharacterManager.validateCharacterUpdates (method)

キャラクター更新データのバリデーション更新データが有効かどうかを検証します。@private@param {Partial<CharacterData>} updates - バリデーションする更新データ@param {Character} existing - 既存のキャラクターデータ@returns {void}@throws {Error} バリデーションに失敗した場合@call-flow1. タイプの更新チェック（直接更新は禁止、昇格APIを使用する必要あり）2. 関係性データのバリデーション（存在する場合）   - targetIdの存在確認   - 自己参照関係のチェック   - typeの存在確認   - strength値の範囲チェック（0-1）@error-handlingバリデーションに失敗した場合、具体的なエラーメッセージを含む例外をスローします。

**@constructor:** function Object() { [native code] }

##### CharacterManager.mergeBackstory (method)

バックストーリーをマージする既存のバックストーリーと更新データをマージします。@private@param {Backstory | undefined} existing - 既存のバックストーリー@param {Partial<Backstory>} updates - 更新データ@returns {Backstory} マージされたバックストーリー@call-flow1. 既存のバックストーリーが存在しない場合は新規作成2. 既存のバックストーリーと更新データをマージ3. 配列フィールド（significantEvents, trauma）は特別に処理4. マージされたバックストーリーを返却

**@constructor:** function Object() { [native code] }

##### CharacterManager.mergeRelationships (method)

関係性をマージする既存の関係性配列と更新データをマージします。@private@param {Relationship[]} existing - 既存の関係性配列@param {Relationship[]} updates - 更新データ@returns {Relationship[]} マージされた関係性配列@call-flow1. 既存の関係性配列をコピー2. 各更新データに対して:   - 同じtargetIdを持つ既存の関係性があれば更新   - なければ新しい関係性として追加3. マージされた関係性配列を返却@state-changes既存の配列は変更されず、新しい配列が返されます。

**@constructor:** function Object() { [native code] }

##### CharacterManager.getCharacter (method)

キャラクターを取得する指定されたIDのキャラクターを取得します。@async@param {string} id - 取得するキャラクターのID@returns {Promise<Character | undefined>} キャラクターオブジェクト、存在しない場合はundefined@usage// キャラクターを取得const character = await characterManager.getCharacter("char_123");if (character) {  // キャラクターが存在する場合の処理}@call-flow1. 初期化完了を確認2. マップからキャラクターを取得して返却

**@constructor:** function Object() { [native code] }

##### CharacterManager.getAllCharacters (method)

すべてのキャラクターを取得する管理下にあるすべてのキャラクターを配列として取得します。@async@returns {Promise<Character[]>} キャラクターオブジェクトの配列@usage// すべてのキャラクターを取得const allCharacters = await characterManager.getAllCharacters();@call-flow1. 初期化完了を確認2. charactersマップの値を配列として返却

**@constructor:** function Object() { [native code] }

##### CharacterManager.getCharactersByType (method)

タイプ別にキャラクターを取得する指定されたタイプのキャラクターをすべて取得します。@async@param {CharacterType} type - 取得するキャラクターのタイプ（MAIN, SUB, MOB）@returns {Promise<Character[]>} 指定タイプのキャラクターオブジェクト配列@usage// メインキャラクターを取得const mainCharacters = await characterManager.getCharactersByType("MAIN");@call-flow1. 初期化完了を確認2. charactersマップの値を配列に変換3. 指定されたタイプに一致するキャラクターでフィルタリング4. フィルタリングされた配列を返却

**@constructor:** function Object() { [native code] }

##### CharacterManager.getActiveCharacters (method)

アクティブなキャラクターを取得する現在アクティブ状態のキャラクターをすべて取得します。@async@returns {Promise<Character[]>} アクティブなキャラクターオブジェクトの配列@usage// アクティブなキャラクターを取得const activeCharacters = await characterManager.getActiveCharacters();@call-flow1. 初期化完了を確認2. charactersマップの値を配列に変換3. state.isActiveがtrueのキャラクターでフィルタリング4. フィルタリングされた配列を返却

**@constructor:** function Object() { [native code] }

##### CharacterManager.promoteCharacter (method)

キャラクターを昇格するキャラクターを現在のタイプから上位タイプに昇格させます（MOB→SUB→MAIN）。@async@param {string} id - 昇格するキャラクターのID@returns {Promise<Character>} 昇格後のキャラクターオブジェクト@throws {Error} キャラクターが存在しない場合や昇格条件を満たさない場合@usage// キャラクターを昇格try {  const promotedCharacter = await characterManager.promoteCharacter("char_123");  console.log(`${promotedCharacter.name}を${promotedCharacter.type}に昇格しました`);} catch (error) {  console.error("昇格に失敗しました:", error.message);}@call-flow1. 初期化完了を確認2. キャラクターの存在確認3. 昇格適格性の評価4. 昇格条件を満たさない場合はエラー5. 昇格処理の実行6. キャラクター更新7. タイプに応じたディレクトリにファイルを移動8. 昇格履歴の更新9. マップの更新10. ストレージに保存11. 昇格したキャラクターを返却@error-handling- キャラクターが存在しない場合は例外をスロー- 昇格条件を満たさない場合は例外をスロー- ファイル移動に失敗した場合は例外をスロー@state-changes- キャラクターのタイプが変更される- キャラクターのバックストーリーが拡張される- キャラクターの発展段階がリセットされる- 昇格履歴に新しいエントリが追加される- ストレージ内のファイルが移動される@monitoring- ログレベル: INFO、ERROR

**@constructor:** function Object() { [native code] }

##### CharacterManager.moveCharacterFile (method)

キャラクターファイルを移動するキャラクターの新しいタイプに応じたディレクトリにファイルを移動します。@private@async@param {Character} character - 移動するキャラクター@param {CharacterType} newType - 新しいキャラクタータイプ@returns {Promise<void>} 移動完了を表すPromise@throws {Error} ファイル操作中にエラーが発生した場合@call-flow1. 古いファイルパスと新しいファイルパスを取得2. 古いファイルの内容を読み込み3. 新しいパスに内容を書き込み4. 古いファイルを削除5. ログ記録@error-handlingエラーが発生した場合、logError()でログを記録し、エラーを上位に再スローします。@monitoring- ログレベル: INFO、ERROR

**@constructor:** function Object() { [native code] }

##### CharacterManager.getDirectoryByType (method)

タイプに応じたディレクトリを取得するキャラクタータイプに対応するストレージディレクトリ名を返します。@private@param {CharacterType} type - キャラクタータイプ@returns {string} ディレクトリ名@call-flow1. タイプに基づいて適切なディレクトリ名を返す:   - MAIN → 'main'   - SUB → 'sub-characters'   - MOB → 'mob-characters'   - デフォルト → 'mob-characters'

**@constructor:** function Object() { [native code] }

##### CharacterManager.getCharacterFilePath (method)

キャラクターのファイルパスを取得するキャラクターのストレージ内のファイルパスを生成します。@private@param {Character} character - キャラクター@returns {string} ファイルパス@call-flow1. タイプに応じたディレクトリを取得2. `characters/{ディレクトリ}/{id}.yaml` 形式のパスを組み立て3. 生成したパスを返却

**@constructor:** function Object() { [native code] }

##### CharacterManager.saveCharacter (method)

キャラクターをストレージに保存するキャラクターデータをYAML形式でストレージに書き込みます。@private@async@param {Character} character - 保存するキャラクター@returns {Promise<void>} 保存完了を表すPromise@throws {Error} ファイル操作中にエラーが発生した場合@call-flow1. キャラクターのファイルパスを取得2. ディレクトリの存在確認と必要に応じた作成3. キャラクターデータをYAML形式に変換4. ファイルに書き込み5. ログ記録@error-handlingエラーが発生した場合、logError()でログを記録し、エラーを上位に再スローします。@monitoring- ログレベル: INFO、ERROR

**@constructor:** function Object() { [native code] }

##### CharacterManager.ensureDirectoryExists (method)

ディレクトリの存在を確認し、存在しない場合は作成する指定されたディレクトリパスが存在するか確認し、存在しない場合は新しく作成します。@private@async@param {string} dirPath - 確認・作成するディレクトリパス@returns {Promise<void>} 処理完了を表すPromise@call-flow1. ディレクトリの存在を確認2. 存在しない場合は作成を試みる3. 作成結果をログに記録@error-handlingエラーが発生した場合、ログに警告を記録しますが、例外はスローせず、後続の処理で対応します。@monitoring- ログレベル: INFO、WARN

**@constructor:** function Object() { [native code] }

##### CharacterManager.updateRelationships (method)

キャラクターの関係性を更新するキャラクターの関係性データを関係グラフに反映します。@private@async@param {Character} character - 関係性を更新するキャラクター@returns {Promise<void>} 更新完了を表すPromise@call-flow1. キャラクターに関係性データがあるか確認2. 各関係性について関係グラフを更新   - キャラクターID   - 対象キャラクターID   - 関係タイプ   - 関係の強さ   - 関係の説明@state-changes関係グラフ内の関係性が更新されます。

**@constructor:** function Object() { [native code] }

##### CharacterManager.initializeCharacterState (method)

キャラクターの状態を初期化する新しいキャラクターの初期状態を生成します。@private@param {CharacterData} data - キャラクターデータ@returns {CharacterState} 初期化された状態オブジェクト@call-flow1. データから状態情報を取得または初期値を設定:   - isActive: データから取得またはタイプに基づいて設定（MAINの場合はtrue）   - emotionalState: データから取得またはNEUTRAL   - developmentStage: データから取得または0   - lastAppearance: データから取得またはnull   - relationships: 空配列2. 初期化された状態オブジェクトを返却

**@constructor:** function Object() { [native code] }

##### CharacterManager.initializeHistory (method)

キャラクターの履歴を初期化する新しいキャラクターの履歴構造を生成します。@private@returns {CharacterHistory} 初期化された履歴オブジェクト@call-flow1. 以下のプロパティを含む空の履歴オブジェクトを作成:   - appearances: 空配列   - developmentPath: 空配列   - interactions: 空配列2. 初期化された履歴オブジェクトを返却

**@constructor:** function Object() { [native code] }

##### CharacterManager.analyzeAppearanceTiming (method)

キャラクターの登場タイミングを分析する物語コンテキストに基づいてキャラクターの最適な登場タイミングを分析します。@async@param {string} characterId - 分析するキャラクターのID@param {any} storyContext - 物語コンテキスト情報@returns {Promise<any>} タイミング推奨情報@throws {Error} キャラクターが存在しない場合@usage// 登場タイミングを分析const timing = await characterManager.analyzeAppearanceTiming(  "char_123",  { currentChapter: 5, storyArc: "arc_1" }console.log(`推奨チャプター: ${timing.recommendedChapter}`);@call-flow1. 初期化完了を確認2. キャラクターの存在確認3. TimingAnalyzerを使用してタイミング推奨を取得4. 推奨情報を返却@error-handlingキャラクターが存在しない場合は例外をスローします。

**@constructor:** function Object() { [native code] }

##### CharacterManager.processCharacterDevelopment (method)

キャラクターの成長を処理するチャプターイベントに基づいてキャラクターの発展を進行させます。@async@param {string} characterId - 発展させるキャラクターのID@param {any[]} chapterEvents - チャプターイベントの配列@returns {Promise<Character>} 発展後のキャラクターオブジェクト@throws {Error} キャラクターが存在しない場合やエラーが発生した場合@usage// キャラクターの成長を処理const updatedCharacter = await characterManager.processCharacterDevelopment(  "char_123",  [    { type: "CONFLICT", intensity: 0.7, affectedCharacters: ["char_123"] },    { type: "REVELATION", intensity: 0.5, affectedCharacters: ["char_123"] }  ]);@call-flow1. 初期化完了を確認2. キャラクターの存在確認3. EvolutionSystemを使用して発展処理4. 発展情報に基づくキャラクター更新データの作成5. 発展パスの更新準備6. キャラクターの更新7. 発展パスの最終更新8. マップの更新9. ストレージに保存10. 発展後のキャラクターを返却@error-handling- キャラクターが存在しない場合は例外をスロー- 発展処理中にエラーが発生した場合は例外をスロー@state-changes- キャラクターのパーソナリティが変化する可能性あり- キャラクターの感情状態が変化する可能性あり- キャラクターの発展段階が変化する可能性あり- 発展履歴に新しいエントリが追加される可能性あり@monitoring- ログレベル: INFO、ERROR

**@constructor:** function Object() { [native code] }

##### CharacterManager.deriveEmotionalState (method)

感情成長データから感情状態を導出する発展処理で生成された感情影響データから、キャラクターの現在の感情状態を判断します。@private@param {Record<string, any>} emotionalGrowth - 感情成長データ@returns {EmotionalState} 導出された感情状態@call-flow1. 感情成長データの存在確認2. データがない場合はNEUTRALを返却3. 最も影響力の大きい感情を特定4. 感情の種類に基づいて対応する感情状態を返却:   - happy/joy/excitement → HAPPY   - sad/sorrow/grief → SAD   - angry/rage/frustration → ANGRY   など@state-changesこのメソッド自体はキャラクターの状態を変更しません。

**@constructor:** function Object() { [native code] }

##### CharacterManager.getRelationshipAnalysis (method)

関係性グラフの分析を取得する全キャラクター間の関係性グラフの分析結果を返します。@async@returns {Promise<any>} 関係性グラフ分析結果@usage// 関係性分析を取得const analysis = await characterManager.getRelationshipAnalysis();console.log(`クラスター数: ${analysis.clusters.length}`);console.log(`対立関係: ${analysis.tensions.length}`);@call-flow1. 初期化完了を確認2. RelationshipGraphから分析結果を取得3. 分析結果を返却

**@constructor:** function Object() { [native code] }

##### CharacterManager.getCharacterRelationships (method)

キャラクターの関係データを取得する指定されたキャラクターと他のキャラクターとの関係性を取得します。@async@param {string} characterId - 関係データを取得するキャラクターのID@returns {Promise<any>} キャラクターと関係性データ@throws {Error} キャラクターが存在しない場合@usage// キャラクターの関係データを取得const relationships = await characterManager.getCharacterRelationships("char_123");@call-flow1. 初期化完了を確認2. キャラクターの存在確認3. 関係グラフから接続されたキャラクターIDを取得4. 各接続キャラクターの情報と関係性データを取得5. キャラクターと関係性データを含むオブジェクトを作成6. 結果を返却@error-handlingキャラクターが存在しない場合は例外をスローします。@expected-format```{  character: {    id: "char_123",    name: "キャラクター名",    type: "MAIN",    description: "キャラクターの説明"  },  relationships: [    {      character: {        id: "char_456",        name: "関連キャラクター名",        type: "SUB",        description: "関連キャラクターの説明"      },      relationship: {        type: "FRIEND",        strength: 0.8,        description: "親密な友人関係"      }    },    // その他の関係...  ]}```

**@constructor:** function Object() { [native code] }

##### CharacterManager.evaluateCharacterPromotion (method)

キャラクターの関係データを取得する指定されたキャラクターと他のキャラクターとの関係性を取得します。@async@param {string} characterId - 関係データを取得するキャラクターのID@returns {Promise<any>} キャラクターと関係性データ@throws {Error} キャラクターが存在しない場合@usage// キャラクターの関係データを取得const relationships = await characterManager.getCharacterRelationships("char_123");@call-flow1. 初期化完了を確認2. キャラクターの存在確認3. 関係グラフから接続されたキャラクターIDを取得4. 各接続キャラクターの情報と関係性データを取得5. キャラクターと関係性データを含むオブジェクトを作成6. 結果を返却@error-handlingキャラクターが存在しない場合は例外をスローします。@expected-format```{  character: {    id: "char_123",    name: "キャラクター名",    type: "MAIN",    description: "キャラクターの説明"  },  relationships: [    {      character: {        id: "char_456",        name: "関連キャラクター名",        type: "SUB",        description: "関連キャラクターの説明"      },      relationship: {        type: "FRIEND",        strength: 0.8,        description: "親密な友人関係"      }    },    // その他の関係...  ]}```

**@constructor:** function Object() { [native code] }

##### CharacterManager.recordCharacterAppearance (method)

キャラクターの登場を記録するチャプターにおけるキャラクターの登場情報を記録します。@async@param {string} characterId - 登場を記録するキャラクターのID@param {number} chapterNumber - 登場したチャプター番号@param {string} summary - 登場の要約@param {number} [emotionalImpact=0] - 感情的影響度（0-1）@returns {Promise<Character>} 更新されたキャラクターオブジェクト@throws {Error} キャラクターが存在しない場合@usage// キャラクターの登場を記録const updatedCharacter = await characterManager.recordCharacterAppearance(  "char_123",  5,  "重要な決断を下した",  0.8);@call-flow1. 初期化完了を確認2. キャラクターの存在確認3. 登場記録の作成4. キャラクターの状態更新（lastAppearance）5. 登場履歴の更新6. マップの更新7. ストレージに保存8. 更新されたキャラクターを返却@error-handlingキャラクターが存在しない場合は例外をスローします。@state-changes- キャラクターのlastAppearanceが更新される- キャラクターの登場履歴に新しいエントリが追加される

**@constructor:** function Object() { [native code] }

##### CharacterManager.recordCharacterInteraction (method)

キャラクター間のインタラクションを記録するチャプターにおけるキャラクター間の相互作用を記録します。@async@param {string} characterId - 主体となるキャラクターのID@param {string} targetCharacterId - 対象となるキャラクターのID@param {number} chapterNumber - インタラクションが発生したチャプター番号@param {string} type - インタラクションのタイプ@param {string} description - インタラクションの説明@param {number} impact - インタラクションの影響度（0-1）@returns {Promise<Character>} 更新されたキャラクターオブジェクト@throws {Error} キャラクターが存在しない場合@usage// キャラクター間のインタラクションを記録const updatedCharacter = await characterManager.recordCharacterInteraction(  "char_123",  "char_456",  5,  "CONFLICT",  "激しい言い争いをした",  0.7);@call-flow1. 初期化完了を確認2. 主体キャラクターの存在確認3. 対象キャラクターの存在確認4. インタラクション記録の作成5. キャラクターのインタラクション履歴の更新6. マップの更新7. ストレージに保存8. 更新されたキャラクターを返却@error-handling- 主体キャラクターが存在しない場合は例外をスロー- 対象キャラクターが存在しない場合は例外をスロー@state-changes- キャラクターのインタラクション履歴に新しいエントリが追加される

**@constructor:** function Object() { [native code] }

##### CharacterManager.generateDevelopmentPath (method)

発展経路を生成するキャラクターの将来の発展経路を計画・生成します。@async@param {string} characterId - 発展経路を生成するキャラクターのID@returns {Promise<any>} 発展経路情報@throws {Error} キャラクターが存在しない場合@usage// キャラクターの発展経路を生成const developmentPath = await characterManager.generateDevelopmentPath("char_123");console.log(`目標発展段階: ${developmentPath.targetStage}`);console.log(`マイルストーン数: ${developmentPath.milestones.length}`);@call-flow1. 初期化完了を確認2. キャラクターの存在確認3. EvolutionSystemを使用して発展経路を生成4. 生成された発展経路を返却@error-handlingキャラクターが存在しない場合は例外をスローします。@expected-format```{  milestones: [...],  growthEvents: [...],  transformationArcs: [...],  phase: "PROGRESSION",  targetStage: 3,  currentStage: 1,  estimatedCompletionChapter: 15}```

**@constructor:** function Object() { [native code] }


---

### promotion-system.ts {#cnovel-automation-systemsrclibcharacterspromotion-systemts}

**Path:** `C:/novel-automation-system/src/lib/characters/promotion-system.ts`

キャラクター昇格システムモブキャラクター→サブキャラクター→メインキャラクターへの昇格を評価し実行するクラス

**@constructor:** function Object() { [native code] }

#### PromotionSystem (class)

キャラクター昇格システムモブキャラクター→サブキャラクター→メインキャラクターへの昇格を評価し実行するクラス

**@constructor:** function Object() { [native code] }

#### Methods of PromotionSystem

##### PromotionSystem.evaluate (method)

昇格の閾値設定各キャラクタータイプからの昇格に必要な条件/
private readonly PROMOTION_THRESHOLDS = {
MOB_TO_SUB: {
appearances: 3,     // 最低登場回数
interactions: 5,    // 最低相互作用回数
plotRelevance: 0.3, // 最低プロット関連度
},
SUB_TO_MAIN: {
appearances: 10,    // 最低登場回数
interactions: 15,   // 最低相互作用回数
plotRelevance: 0.7, // 最低プロット関連度
characterDevelopment: 3, // 最低キャラクター発展段階
},
};

/**キャラクターの昇格適格性を評価する

**@constructor:** function Object() { [native code] }

##### PromotionSystem.promote (method)

キャラクターを昇格させる

**@constructor:** function Object() { [native code] }

##### PromotionSystem.calculateMetrics (method)

キャラクターの昇格メトリクスを計算する

**@constructor:** function Object() { [native code] }

##### PromotionSystem.calculatePromotionScore (method)

昇格のスコアを計算する

**@constructor:** function Object() { [native code] }

##### PromotionSystem.meetsThreshold (method)

キャラクターが閾値を満たしているか確認する

**@constructor:** function Object() { [native code] }

##### PromotionSystem.calculatePlotRelevance (method)

キャラクターのプロット関連度を計算する

**@constructor:** function Object() { [native code] }

##### PromotionSystem.calculateCharacterDevelopment (method)

キャラクターの発展度を計算する

**@constructor:** function Object() { [native code] }

##### PromotionSystem.estimateReaderEngagement (method)

読者のエンゲージメントを推定する

**@constructor:** function Object() { [native code] }

##### PromotionSystem.generateRecommendation (method)

昇格の推奨メッセージを生成する

**@constructor:** function Object() { [native code] }

##### PromotionSystem.identifyCharacterStrengths (method)

キャラクターの強みを特定する

**@constructor:** function Object() { [native code] }

##### PromotionSystem.suggestPotentialArcs (method)

潜在的なストーリーアークを提案する

**@constructor:** function Object() { [native code] }

##### PromotionSystem.generateExpandedBackstory (method)

拡張されたバックストーリーを生成する

**@constructor:** function Object() { [native code] }

##### PromotionSystem.generateDetailedHistory (method)

詳細な歴史を生成する

**@constructor:** function Object() { [native code] }

##### PromotionSystem.generateMotivations (method)

動機を生成する

**@constructor:** function Object() { [native code] }

##### PromotionSystem.generateSecrets (method)

秘密を生成する

**@constructor:** function Object() { [native code] }


---

### relationship-graph.ts {#cnovel-automation-systemsrclibcharactersrelationship-graphts}

**Path:** `C:/novel-automation-system/src/lib/characters/relationship-graph.ts`

@fileoverview キャラクター関係性グラフ管理モジュール@descriptionこのファイルはキャラクター間の関係性を管理・分析するためのクラスを定義します。キャラクター間の関係性の追加、更新、分析、可視化などの機能を提供します。@role- キャラクター間の関係性データの保持と管理- 関係性の双方向マッピング（片方を更新すると反対側も自動更新）- 関係性の履歴管理と変更追跡- 関係性グラフの分析（クラスター検出、対立関係検出、発展追跡）- 関係性データの永続化（JSONファイル保存）- 関係性データの可視化用フォーマット提供@dependencies- @/types/characters - キャラクターと関係性に関する型定義- @/lib/utils/logger - ロギング機能- @/lib/storage - ストレージ操作のための抽象化レイヤー- @/lib/utils/error-handler - エラー処理ユーティリティ@types- Character - キャラクター情報の型- Relationship - 関係性情報の型- RelationshipType - 関係性タイプの型- RelationshipAnalysis - 関係性分析結果の型- CharacterCluster - キャラクタークラスターの型- RelationshipTension - 関係性の対立・緊張の型@flow1. インスタンス化: 関係グラフの初期化2. キャラクター追加: グラフにキャラクターノードを追加3. 関係性更新: キャラクター間の関係性を設定・更新4. データ永続化: 関係性データをJSONファイルとして保存5. 関係性分析: クラスター検出、対立関係検出、発展追跡6. データ取得: 関係性データや分析結果の取得@error-handling- 各メソッドでは try-catch ブロックを使用- エラーは logger でログ記録後、上位層に再スロー- logError 関数を使用して構造化されたエラー情報を記録

**@constructor:** function Object() { [native code] }

#### RelationshipGraph (class)

@fileoverview キャラクター関係性グラフ管理モジュール@descriptionこのファイルはキャラクター間の関係性を管理・分析するためのクラスを定義します。キャラクター間の関係性の追加、更新、分析、可視化などの機能を提供します。@role- キャラクター間の関係性データの保持と管理- 関係性の双方向マッピング（片方を更新すると反対側も自動更新）- 関係性の履歴管理と変更追跡- 関係性グラフの分析（クラスター検出、対立関係検出、発展追跡）- 関係性データの永続化（JSONファイル保存）- 関係性データの可視化用フォーマット提供@dependencies- @/types/characters - キャラクターと関係性に関する型定義- @/lib/utils/logger - ロギング機能- @/lib/storage - ストレージ操作のための抽象化レイヤー- @/lib/utils/error-handler - エラー処理ユーティリティ@types- Character - キャラクター情報の型- Relationship - 関係性情報の型- RelationshipType - 関係性タイプの型- RelationshipAnalysis - 関係性分析結果の型- CharacterCluster - キャラクタークラスターの型- RelationshipTension - 関係性の対立・緊張の型@flow1. インスタンス化: 関係グラフの初期化2. キャラクター追加: グラフにキャラクターノードを追加3. 関係性更新: キャラクター間の関係性を設定・更新4. データ永続化: 関係性データをJSONファイルとして保存5. 関係性分析: クラスター検出、対立関係検出、発展追跡6. データ取得: 関係性データや分析結果の取得@error-handling- 各メソッドでは try-catch ブロックを使用- エラーは logger でログ記録後、上位層に再スロー- logError 関数を使用して構造化されたエラー情報を記録/
import { Character, Relationship, RelationshipType, RelationshipAnalysis, CharacterCluster, RelationshipTension } from '@/types/characters';
import { logger } from '@/lib/utils/logger';
import { storageProvider } from '@/lib/storage';
import { logError, getErrorMessage } from '@/lib/utils/error-handler';

/**@class RelationshipGraph@description キャラクター間の関係性を保持・分析するためのクラス@role- キャラクター間の関係性データの中央リポジトリ- 関係性の追加・更新・取得・分析の機能提供- 関係性データの永続化と履歴管理- グラフ分析アルゴリズムの実装（クラスタリング、対立検出など）@used-by- CharacterManager（推定） - キャラクター関係性の管理- APIエンドポイント（推定） - 関係性データの取得・更新@depends-on- storageProvider - 関係性データの永続化- logger - ログ記録- logError - エラー処理@lifecycle1. コンストラクタでグラフ初期化2. addCharacterメソッドでキャラクター追加3. updateRelationshipメソッドで関係性更新4. 分析メソッド（analyzeRelationshipDynamics等）で関係性分析5. 各種ゲッターメソッドでデータ取得@example-flowCharacterManager →   RelationshipGraph.addCharacter →   RelationshipGraph.updateRelationship →   saveRelationship →   storageProvider.writeFile →  関係性データの永続化

**@constructor:** function Object() { [native code] }

#### Methods of RelationshipGraph

##### RelationshipGraph.constructor (method)

関係グラフを初期化するコンストラクタキャラクター間の関係性を保持するグラフ構造を初期化します。グラフはMap<string, Map<string, Relationship>>として実装され、キャラクターIDから関係マップへのマッピングを提供します。@constructor@usage// 関係グラフのインスタンス化const relationshipGraph = new RelationshipGraph();@call-flow1. グラフ構造（Map）の初期化2. logger.debugによる初期化ログの記録@initializationグラフ構造を空のMapとして初期化します。この時点ではキャラクターや関係性は追加されていません。@error-handling初期化時の特別なエラー処理は実装されていません。

**@constructor:** function Object() { [native code] }

##### RelationshipGraph.addCharacter (method)

キャラクターをグラフに追加する指定されたキャラクターをグラフ構造に追加します。すでに存在する場合は何もしません。@async@param {Character} character 追加するキャラクター@returns {Promise<void>}@throws {Error} キャラクター追加処理に失敗した場合@usage// キャラクターの追加await relationshipGraph.addCharacter(characterObject);@call-context- 同期/非同期: 非同期メソッド（await必須）- 前提条件: 有効なキャラクターオブジェクトが必要@call-flow1. キャラクターIDが既にグラフに存在するか確認2. 存在しない場合、新しい関係Map（空）を作成3. デバッグログを記録@error-handlingtry-catchブロックでエラーをキャッチし、ログに記録した後、上位層に再スローします。@monitoring- ログレベル: DEBUG（成功時）、ERROR（失敗時）

**@constructor:** function Object() { [native code] }

##### RelationshipGraph.updateRelationship (method)

関係性を更新する2つのキャラクター間の関係性を更新または新規作成します。このメソッドは双方向の関係性を自動的に設定し、関係性の履歴も保持します。@async@param {string} character1Id 関係の主体となるキャラクターID@param {string} character2Id 関係の対象となるキャラクターID@param {RelationshipType} relationship 関係性タイプ@param {number} strength 関係の強さ (0-1)@param {string} [description] 関係の説明 (オプション)@returns {Promise<void>}@throws {Error} 関係の強度値が無効な場合（0-1の範囲外）@throws {Error} 指定されたキャラクターがグラフに存在しない場合@throws {Error} 関係性の更新に失敗した場合@usage// キャラクター間の関係性を更新await relationshipGraph.updateRelationship(  'char123',   'char456',   'FRIEND',   0.8,   '幼馴染の関係');@call-context- 同期/非同期: 非同期メソッド（await必須）- 前提条件: 両方のキャラクターがすでにグラフに追加されていること@call-flow1. 関係の強度値のバリデーション (0-1の範囲)2. 両キャラクターのグラフ内存在確認3. 関係性の履歴取得4. 以前の関係がある場合、履歴に追加5. 新しい関係性データの作成6. 双方向の関係性を設定7. 更新ログを記録8. 関係性をストレージに保存@helper-methods- getRelationshipHistory - 関係性履歴を取得- reverseRelationship - 関係性を逆方向に変換- saveRelationship - 関係性を保存@error-handlingtry-catchブロックでエラーをキャッチし、ログに記録した後、上位層に再スローします。また、関係の強度値が0-1の範囲外の場合や、キャラクターが存在しない場合は明示的にエラーをスローします。@state-changes- 内部グラフ構造を更新- ストレージに関係性データを保存@monitoring- ログレベル: DEBUG（成功時）、ERROR（失敗時）

**@constructor:** function Object() { [native code] }

##### RelationshipGraph.reverseRelationship (method)

関係性を逆方向に変換する与えられた関係性オブジェクトから、逆方向の関係性オブジェクトを生成します。例: PARENT→CHILDなど、非対称的な関係タイプは適切に反転されます。@private@param {Relationship} relationship 関係性オブジェクト@param {string} originalSourceId 元の関係性の主体ID@returns {Relationship} 逆方向の関係性オブジェクト@usage// 内部使用のみconst reversedRelation = this.reverseRelationship(relation, character1Id);@call-context- 同期/非同期: 同期メソッド- 使用：updateRelationship内部で使用@call-flow1. 逆方向の関係タイプを取得2. 新しい関係性オブジェクトを作成して返却@helper-methods- getReverseRelationshipType - 逆方向の関係タイプを取得@state-changesこのメソッドは状態を変更せず、新しいオブジェクトを返します。

**@constructor:** function Object() { [native code] }

##### RelationshipGraph.getReverseRelationshipType (method)

逆方向の関係タイプを取得する与えられた関係タイプから、逆方向の関係タイプを返します。対称的な関係（FRIEND, ENEMYなど）は同じタイプを返し、非対称的な関係（PARENT/CHILD, MENTOR/STUDENTなど）は対応する逆関係を返します。@private@param {RelationshipType} type 関係タイプ@returns {RelationshipType} 逆方向の関係タイプ@usage// 内部使用のみconst reversedType = this.getReverseRelationshipType('PARENT');// 'CHILD'が返される@call-context- 同期/非同期: 同期メソッド- 使用：reverseRelationship内部で使用@call-flow1. 対称的な関係かチェック2. 対称的であれば同じタイプを返す3. 非対称的であれば対応する逆関係を返す@state-changesこのメソッドは状態を変更せず、計算された値を返します。

**@constructor:** function Object() { [native code] }

##### RelationshipGraph.getRelationshipHistory (method)

関係性履歴を取得する2つのキャラクター間の関係性履歴を取得します。既存の履歴がある場合はそれを使用し、ない場合は空の配列を返します。@private@async@param {string} character1Id 関係の主体となるキャラクターID@param {string} character2Id 関係の対象となるキャラクターID@returns {Promise<any[]>} 関係性履歴の配列@usage// 内部使用のみconst history = await this.getRelationshipHistory(char1Id, char2Id);@call-context- 同期/非同期: 非同期メソッド- 使用：updateRelationship内部で使用@call-flow1. 既存の関係性を取得2. 既存の履歴があればそれを使用、なければ空の配列を使用3. 履歴の配列コピーを返却@helper-methods- getRelationship - 関係性を取得@error-handlingtry-catchブロックでエラーをキャッチし、ログに記録した後、空の配列を返します。エラーは上位層に再スローせず、処理を継続させます。@monitoring- ログレベル: ERROR（失敗時のみ）

**@constructor:** function Object() { [native code] }

##### RelationshipGraph.saveRelationship (method)

関係性を保存する2つのキャラクター間の関係性をJSONファイルとしてストレージに保存します。ファイルパスは常に同じ順序にソートされたキャラクターIDから生成されます。@private@async@param {string} character1Id 関係の主体となるキャラクターID@param {string} character2Id 関係の対象となるキャラクターID@param {Relationship} relationship 関係性オブジェクト@returns {Promise<void>}@throws {Error} 保存処理に失敗した場合@usage// 内部使用のみawait this.saveRelationship(char1Id, char2Id, relationshipData);@call-context- 同期/非同期: 非同期メソッド- 使用：updateRelationship内部で使用@call-flow1. 関係性データの構築2. ファイルパスの生成（IDを常にソートして一意にする）3. ディレクトリの存在確認4. JSONとしてデータをシリアライズ5. ストレージプロバイダーによるファイル書き込み6. ログ記録@helper-methods- ensureDirectoryExists - ディレクトリの存在を確認し作成@external-dependencies- storageProvider.writeFile - ファイル書き込み@error-handlingtry-catchブロックでエラーをキャッチし、ログに記録した後、上位層に再スローします。@monitoring- ログレベル: DEBUG（成功時）、ERROR（失敗時）

**@constructor:** function Object() { [native code] }

##### RelationshipGraph.ensureDirectoryExists (method)

ディレクトリの存在を確認し、存在しない場合は作成する関係性ファイルを保存するディレクトリの存在を確認し、存在しない場合は作成します。@private@async@param {string} dirPath ディレクトリパス@returns {Promise<void>}@usage// 内部使用のみawait this.ensureDirectoryExists('characters/relationships');@call-context- 同期/非同期: 非同期メソッド- 使用：saveRelationship内部で使用@call-flow1. ディレクトリの存在を確認2. 存在しない場合、ディレクトリを作成3. ログ記録@external-dependencies- storageProvider.directoryExists - ディレクトリ存在確認- storageProvider.createDirectory - ディレクトリ作成@error-handlingtry-catchブロックでエラーをキャッチし、警告としてログに記録します。エラーは上位層に再スローせず、処理を継続させます。@monitoring- ログレベル: DEBUG（成功時）、WARN（失敗時）

**@constructor:** function Object() { [native code] }

##### RelationshipGraph.getRelationship (method)

関係性を取得する2つのキャラクター間の関係性を取得します。@param {string} character1Id 関係の主体となるキャラクターID@param {string} character2Id 関係の対象となるキャラクターID@returns {Relationship | null} 関係性オブジェクトまたはnull@usage// 2つのキャラクター間の関係を取得const relation = relationshipGraph.getRelationship('char123', 'char456');if (relation) {  console.log(`関係タイプ: ${relation.type}, 強度: ${relation.strength}`);}@call-context- 同期/非同期: 同期メソッド@call-flow1. character1Idに関連する関係マップを取得2. 関係マップからcharacter2Idに対する関係を取得して返却3. 関係が存在しない場合はnullを返却@state-changesこのメソッドは状態を変更せず、データの取得のみを行います。

**@constructor:** function Object() { [native code] }

##### RelationshipGraph.getConnectedCharacterIds (method)

接続されたキャラクターのIDを取得する指定されたキャラクターIDに関連付けられた（関係性がある）すべてのキャラクターIDの配列を返します。@param {string} characterId キャラクターID@returns {string[]} 接続されたキャラクターID配列@usage// キャラクターに関連するすべてのキャラクターIDを取得const connectedIds = relationshipGraph.getConnectedCharacterIds('char123');console.log(`関連キャラクター数: ${connectedIds.length}`);@call-context- 同期/非同期: 同期メソッド@call-flow1. characterIdに関連する関係マップを取得2. 関係マップが存在しない場合は空配列を返却3. 関係マップからすべてのキーを配列として取得して返却@state-changesこのメソッドは状態を変更せず、データの取得のみを行います。

**@constructor:** function Object() { [native code] }

##### RelationshipGraph.getConnectedCharacters (method)

接続されたキャラクターを取得する指定されたキャラクターIDに関連付けられた（関係性がある）すべてのキャラクターIDの配列を返します。注意: このメソッドは実際のCharacterオブジェクトは返しません。@async@param {string} characterId キャラクターID@returns {Promise<string[]>} 接続ID配列@usage// キャラクターに関連するすべてのキャラクターIDを非同期で取得const connectedIds = await relationshipGraph.getConnectedCharacters('char123');@call-context- 同期/非同期: 非同期メソッド（await必須）@call-flow1. getConnectedCharacterIdsメソッドを呼び出し2. 結果を返却@helper-methods- getConnectedCharacterIds - 接続されたキャラクターIDを取得@error-handlingtry-catchブロックでエラーをキャッチし、ログに記録した後、空の配列を返します。@monitoring- ログレベル: ERROR（失敗時のみ）@noteこのメソッドは実際のCharacterオブジェクトを返しません。CharacterManagerクラスで実際のキャラクター情報を取得する必要があります。

**@constructor:** function Object() { [native code] }

##### RelationshipGraph.analyzeRelationshipDynamics (method)

関係性の動的分析を行うキャラクター間の関係性グラフに対して複数の分析を実行し、クラスター、対立関係、発展、可視化データなどを含む総合的な分析結果を返します。@async@returns {Promise<RelationshipAnalysis>} 関係性分析結果@usage// 関係性グラフの分析を実行const analysis = await relationshipGraph.analyzeRelationshipDynamics();console.log(`検出されたクラスター数: ${analysis.clusters.length}`);console.log(`検出された対立関係数: ${analysis.tensions.length}`);@call-context- 同期/非同期: 非同期メソッド（await必須）@call-flow1. クラスター検出2. 対立関係検出3. 関係性発展の追跡4. 可視化データの生成5. 分析結果オブジェクトの構築と返却@helper-methods- detectClusters - クラスター検出- detectTensions - 対立関係検出- trackRelationshipDevelopments - 関係性発展の追跡- generateVisualizationData - 可視化データの生成@error-handlingtry-catchブロックでエラーをキャッチし、ログに記録した後、最小限のレスポンス（空の配列や空のオブジェクト）を返します。@monitoring- ログレベル: ERROR（失敗時のみ）@expected-format```{  clusters: CharacterCluster[],  tensions: RelationshipTension[],  developments: any[],  visualData: { nodes: any[], edges: any[] }}```

**@constructor:** function Object() { [native code] }

##### RelationshipGraph.detectClusters (method)

クラスターを検出する関係性の強さに基づいてキャラクターをグループ化し、クラスター（密接に関連したキャラクターのグループ）を検出します。@private@returns {CharacterCluster[]} クラスター配列@usage// 内部使用のみconst clusters = this.detectClusters();@call-context- 同期/非同期: 同期メソッド- 使用：analyzeRelationshipDynamics内部で使用@call-flow1. 訪問済みキャラクターを追跡するSetを初期化2. すべてのキャラクターを反復処理3. 未訪問のキャラクターからクラスター構築を開始4. 構築されたクラスターを結果配列に追加5. クラスター配列を返却@helper-methods- buildCluster - 単一のクラスターを構築@error-handlingtry-catchブロックでエラーをキャッチし、ログに記録した後、空の配列を返します。@monitoring- ログレベル: ERROR（失敗時のみ）

**@constructor:** function Object() { [native code] }

##### RelationshipGraph.buildCluster (method)

単一のクラスターを構築する指定されたキャラクターIDを起点として、関係性の強さに基づいて幅優先探索でクラスター（密接に関連したキャラクターのグループ）を構築します。@private@param {string} startId 開始キャラクターID@param {Set<string>} visited 訪問済みキャラクターIDのセット@returns {CharacterCluster} クラスターオブジェクト@usage// 内部使用のみconst cluster = this.buildCluster(characterId, visitedSet);@call-context- 同期/非同期: 同期メソッド- 使用：detectClusters内部で使用@call-flow1. クラスターオブジェクトの初期化2. 幅優先探索のキューを初期化3. 開始キャラクターを訪問済みとしてマーク4. 幅優先探索の実行  a. 現在のキャラクターをクラスターに追加  b. 関係性を取得  c. 強い関係性を持つキャラクターをキューに追加5. クラスター内の優勢な関係タイプを特定6. クラスターの結束度を計算7. 完成したクラスターを返却@helper-methods- getDominantRelationType - クラスター内の優勢な関係タイプを取得- calculateClusterCohesion - クラスターの結束度を計算@state-changesこのメソッドは内部状態を変更せず、新しいクラスターオブジェクトを返します。引数として渡された`visited`セットは更新されます。

**@constructor:** function Object() { [native code] }

##### RelationshipGraph.getDominantRelationType (method)

クラスター内の優勢な関係タイプを取得するクラスター内のメンバー間の関係性を調査し、最も多く出現する関係タイプを特定します。@private@param {string[]} members クラスターメンバーのID配列@returns {RelationshipType} 優勢な関係タイプ@usage// 内部使用のみconst dominantType = this.getDominantRelationType(clusterMembers);@call-context- 同期/非同期: 同期メソッド- 使用：buildCluster内部で使用@call-flow1. 関係タイプのカウント用オブジェクトを初期化2. 各メンバー間の関係をカウント3. 最も多い関係タイプを特定4. 優勢な関係タイプを返却@helper-methods- getRelationship - 関係性を取得@state-changesこのメソッドは状態を変更せず、計算された値を返します。

**@constructor:** function Object() { [native code] }

##### RelationshipGraph.calculateClusterCohesion (method)

クラスターの結束度を計算するクラスター内のメンバー間の関係強度の平均を計算し、クラスターの結束度を0から1の値で返します。@private@param {string[]} members クラスターメンバーのID配列@returns {number} 結束度（0-1）@usage// 内部使用のみconst cohesion = this.calculateClusterCohesion(clusterMembers);@call-context- 同期/非同期: 同期メソッド- 使用：buildCluster内部で使用@call-flow1. メンバーが1人以下の場合は0を返却2. 各メンバー間の関係強度の合計を計算3. 関係数をカウント4. 平均強度（結束度）を計算して返却@helper-methods- getRelationship - 関係性を取得@state-changesこのメソッドは状態を変更せず、計算された値を返します。

**@constructor:** function Object() { [native code] }

##### RelationshipGraph.detectTensions (method)

対立関係を検出するグラフ内の対立関係（ENEMY, RIVAL）を検出し、強度が高い対立関係をRelationshipTension配列として返します。@private@returns {RelationshipTension[]} 対立関係の配列@usage// 内部使用のみconst tensions = this.detectTensions();@call-context- 同期/非同期: 同期メソッド- 使用：analyzeRelationshipDynamics内部で使用@call-flow1. 対立関係配列の初期化2. 対立関係のタイプ定義（ENEMY, RIVAL）3. すべての関係性を調査4. IDが小さい方だけ処理（重複を避けるため）5. 対立関係で強度が高いものを検出6. 対立関係の説明を生成7. 対立関係配列を返却@helper-methods- generateTensionDescription - 対立関係の説明を生成@error-handlingtry-catchブロックでエラーをキャッチし、ログに記録した後、空の配列を返します。@monitoring- ログレベル: ERROR（失敗時のみ）

**@constructor:** function Object() { [native code] }

##### RelationshipGraph.generateTensionDescription (method)

対立関係の説明を生成する対立関係のタイプと強度に基づいて、人間が読みやすい説明文を生成します。@private@param {string} char1Id 対立の主体となるキャラクターID@param {string} char2Id 対立の対象となるキャラクターID@param {Relationship} relation 関係性オブジェクト@returns {string} 対立関係の説明文@usage// 内部使用のみconst description = this.generateTensionDescription(char1Id, char2Id, relation);@call-context- 同期/非同期: 同期メソッド- 使用：detectTensions内部で使用@call-flow1. カスタム説明があればそれを使用2. なければ、関係タイプに基づいてデフォルトの説明を生成3. 説明文を返却@state-changesこのメソッドは状態を変更せず、新しい文字列を返します。

**@constructor:** function Object() { [native code] }

##### RelationshipGraph.trackRelationshipDevelopments (method)

関係性の発展を追跡するグラフ内の関係性履歴を分析し、関係性の変化（タイプや強度の変化）を検出して追跡します。@private@returns {any[]} 関係性発展の分析結果@usage// 内部使用のみconst developments = this.trackRelationshipDevelopments();@call-context- 同期/非同期: 同期メソッド- 使用：analyzeRelationshipDynamics内部で使用@call-flow1. 発展配列の初期化2. すべての関係性を調査3. IDが小さい方だけ処理（重複を避けるため）4. 履歴がある場合のみ発展を分析5. 最新の履歴エントリと一つ前を比較6. 関係タイプまたは強度に変化がある場合、発展として記録7. 重要度順にソート8. 発展配列を返却@error-handlingtry-catchブロックでエラーをキャッチし、ログに記録した後、空の配列を返します。@monitoring- ログレベル: ERROR（失敗時のみ）

**@constructor:** function Object() { [native code] }

##### RelationshipGraph.generateVisualizationData (method)

可視化データを生成する関係性グラフをノードとエッジのデータ構造に変換し、可視化に適した形式で返します。@private@returns {any} 可視化用のノードとエッジデータ@usage// 内部使用のみconst visualData = this.generateVisualizationData();@call-context- 同期/非同期: 同期メソッド- 使用：analyzeRelationshipDynamics内部で使用@call-flow1. ノードとエッジの配列を初期化2. キャラクターをノードとして追加3. 関係性をエッジとして追加（重複を避けるため片方向のみ）4. 可視化データオブジェクトを返却@error-handlingtry-catchブロックでエラーをキャッチし、ログに記録した後、空のオブジェクトを返します。@monitoring- ログレベル: ERROR（失敗時のみ）@expected-format```{  nodes: [    { id: "character1Id", connections: 5 },    ...  ],  edges: [    { source: "char1Id", target: "char2Id", type: "FRIEND", strength: 0.8 },    ...  ]}```

**@constructor:** function Object() { [native code] }

##### RelationshipGraph.getCharacterRelationships (method)

単一キャラクターに対する関係マップを取得する指定されたキャラクターIDに関連する関係マップを取得します。@param {string} characterId キャラクターID@returns {Map<string, Relationship> | undefined} 関係マップまたはundefined@usage// キャラクターの関係マップを取得const relationMap = relationshipGraph.getCharacterRelationships('char123');if (relationMap) {  console.log(`関係性の数: ${relationMap.size}`);}@call-context- 同期/非同期: 同期メソッド@call-flow1. グラフからキャラクターIDに関連する関係マップを取得2. 関係マップを返却@state-changesこのメソッドは状態を変更せず、データの取得のみを行います。

**@constructor:** function Object() { [native code] }

##### RelationshipGraph.getRelationshipsByType (method)

関係の種類ごとにフィルタリングする指定された関係タイプに一致する関係性のみをフィルタリングして返します。@param {RelationshipType} type 関係タイプ@returns {{ char1Id: string, char2Id: string, relationship: Relationship }[]} フィルタリングされた関係性の配列@usage// 特定の関係タイプでフィルタリングconst friendRelations = relationshipGraph.getRelationshipsByType('FRIEND');console.log(`友人関係の数: ${friendRelations.length}`);@call-context- 同期/非同期: 同期メソッド@call-flow1. 結果配列の初期化2. すべての関係性を調査3. IDが小さい方だけ処理（重複を避けるため）4. 指定されたタイプに一致する関係性を結果配列に追加5. 結果配列を返却@state-changesこのメソッドは状態を変更せず、データの取得のみを行います。

**@constructor:** function Object() { [native code] }

##### RelationshipGraph.getAllNodes (method)

グラフ内のすべてのノード（キャラクターID）を取得するグラフに登録されているすべてのキャラクターIDを配列として返します。@returns {string[]} キャラクターIDの配列@usage// グラフ内のすべてのキャラクターIDを取得const allCharacterIds = relationshipGraph.getAllNodes();console.log(`グラフ内のキャラクター数: ${allCharacterIds.length}`);@call-context- 同期/非同期: 同期メソッド@call-flow1. グラフのキー（キャラクターID）を配列として取得2. キャラクターID配列を返却@state-changesこのメソッドは状態を変更せず、データの取得のみを行います。

**@constructor:** function Object() { [native code] }

##### RelationshipGraph.getGraphSize (method)

グラフの現在のサイズを取得するグラフに登録されているキャラクターの数を返します。@returns {number} グラフに含まれるキャラクター数@usage// グラフのサイズを取得const graphSize = relationshipGraph.getGraphSize();console.log(`グラフサイズ: ${graphSize}キャラクター`);@call-context- 同期/非同期: 同期メソッド@call-flow1. グラフのサイズを取得して返却@state-changesこのメソッドは状態を変更せず、データの取得のみを行います。

**@constructor:** function Object() { [native code] }

##### RelationshipGraph.getGraphStats (method)

グラフの統計情報を取得するグラフ全体の統計情報（ノード数、関係数、平均強度、タイプ分布）を返します。@returns {any} グラフの統計情報@usage// グラフの統計情報を取得const stats = relationshipGraph.getGraphStats();console.log(`ノード数: ${stats.nodeCount}, 関係数: ${stats.relationshipCount}`);@call-context- 同期/非同期: 同期メソッド@call-flow1. 統計データの初期化2. 全ての関係を集計3. 双方向関係なので、実際の関係数は半分4. 統計情報オブジェクトを返却@state-changesこのメソッドは状態を変更せず、データの取得のみを行います。@expected-format```{  nodeCount: 10,  relationshipCount: 15,  averageStrength: 0.75,  typeDistribution: {    "FRIEND": 8,    "ENEMY": 3,    ...  }}```

**@constructor:** function Object() { [native code] }


---

### timing-analyzer.ts {#cnovel-automation-systemsrclibcharacterstiming-analyzerts}

**Path:** `C:/novel-automation-system/src/lib/characters/timing-analyzer.ts`

@fileoverview キャラクター登場タイミング分析モジュール@descriptionこのファイルはストーリーコンテキストとキャラクター特性に基づいて、キャラクターがストーリー内で最適に登場するタイミングを分析・推奨する機能を提供します。複数の要因（プロット関連度、キャラクター発展、ナラティブペーシング、読者期待）を考慮して総合的なタイミング推奨を行います。@role- キャラクター管理システム内でのタイミング分析サービス- 物語の流れに沿ったキャラクター登場の適切なタイミングを判断- 登場時に必要な準備や代替タイミングの提案@dependencies- @/lib/utils/logger - ログ出力処理- @/lib/storage - ストレージアクセス- @/lib/utils/error-handler - エラーハンドリング@types- @/types/characters - キャラクター関連の型定義（Character, TimingRecommendation, StoryContext, TimingAnalysis, TimingFactor）@flow1. キャラクターIDとストーリーコンテキストを指定してタイミング分析をリクエスト2. 各分析要因（プロット関連度、キャラクター発展、ナラティブペーシング、読者期待）を評価3. 各要因のスコアを重み付けして統合分析を実施4. 最適な登場チャプター、重要度、準備必要事項などを含む推奨を生成して返却

**@constructor:** function Object() { [native code] }

#### TimingAnalyzer (class)

@fileoverview キャラクター登場タイミング分析モジュール@descriptionこのファイルはストーリーコンテキストとキャラクター特性に基づいて、キャラクターがストーリー内で最適に登場するタイミングを分析・推奨する機能を提供します。複数の要因（プロット関連度、キャラクター発展、ナラティブペーシング、読者期待）を考慮して総合的なタイミング推奨を行います。@role- キャラクター管理システム内でのタイミング分析サービス- 物語の流れに沿ったキャラクター登場の適切なタイミングを判断- 登場時に必要な準備や代替タイミングの提案@dependencies- @/lib/utils/logger - ログ出力処理- @/lib/storage - ストレージアクセス- @/lib/utils/error-handler - エラーハンドリング@types- @/types/characters - キャラクター関連の型定義（Character, TimingRecommendation, StoryContext, TimingAnalysis, TimingFactor）@flow1. キャラクターIDとストーリーコンテキストを指定してタイミング分析をリクエスト2. 各分析要因（プロット関連度、キャラクター発展、ナラティブペーシング、読者期待）を評価3. 各要因のスコアを重み付けして統合分析を実施4. 最適な登場チャプター、重要度、準備必要事項などを含む推奨を生成して返却/
import { Character, TimingRecommendation, StoryContext, TimingAnalysis, TimingFactor } from '@/types/characters';
import { logger } from '@/lib/utils/logger';
import { storageProvider } from '@/lib/storage';
import { logError, getErrorMessage } from '@/lib/utils/error-handler';

/**@class TimingAnalyzer@description キャラクターの物語内での最適な登場タイミングを分析・推奨するクラス@role- ストーリーの流れとキャラクターの特性に基づいて最適な登場タイミングを評価- 複数の要因を考慮した総合的な分析の提供- 代替タイミングや登場前に必要な準備の提案@depends-on- logger - ログ出力のためのユーティリティ- logError - エラーログ記録ユーティリティ@lifecycle1. インスタンス生成時にシステムの初期化2. getTimingRecommendationメソッドを通じて分析を実行3. 内部で各要因の分析メソッドを呼び出し4. 分析結果を統合して推奨を返却@example-flow外部コンポーネント → getTimingRecommendation →  analyzeTimingFactors →    analyzePlotRelevance / analyzeCharacterDevelopment / analyzeNarrativePacing / analyzeReaderExpectations →  synthesizeAnalysis →  タイミング推奨の返却

**@constructor:** function Object() { [native code] }

#### Methods of TimingAnalyzer

##### TimingAnalyzer.getTimingRecommendation (method)

タイミング分析システムを初期化するタイミング分析に必要な初期設定を行います。現在の実装ではロギングの初期化のみを行っています。@constructor@usage// タイミング分析システムの初期化const analyzer = new TimingAnalyzer();@call-flow1. logger.debugによるシステム初期化ログの出力@initializationシステム起動時の初期化。特別なパラメータは不要。/
logger.debug('TimingAnalyzer initialized');
}

/**キャラクターの登場タイミング推奨を取得する指定されたキャラクターとストーリーコンテキストに基づいて、キャラクターの最適な登場タイミングを分析し、推奨チャプター、重要度、理由、代替案、必要な準備を含む推奨情報を返します。@async@param {Character} character - 分析対象のキャラクター@param {StoryContext} storyContext - 現在のストーリー文脈情報@returns {Promise<TimingRecommendation>} 登場タイミング推奨情報@throws {unknown} 分析処理中に発生したエラー@usage// キャラクターのタイミング推奨を取得const recommendation = await analyzer.getTimingRecommendation(character, storyContext);@call-context- 同期/非同期: 非同期メソッド（await必須）- 前提条件: 有効なキャラクターオブジェクトとストーリーコンテキストが必要@call-flow1. ログ出力による分析開始の記録2. analyzeTimingFactorsによる各要因の分析3. 分析結果から推奨オブジェクトの構築4. ログ出力による分析完了の記録5. 推奨結果の返却@helper-methods- analyzeTimingFactors - 各要因の分析を行うプライベートメソッド@error-handlingtry-catchブロックで分析処理全体を囲み、エラー発生時はlogError関数でログ記録し、元のエラーを再スローします。@monitoring- ログレベル: INFO@expected-format```{  recommendedChapter: number, // 推奨登場チャプター番号  significance: 'LOW' | 'MEDIUM' | 'HIGH', // 登場の重要度  reason: string, // 推奨理由  alternatives: number[], // 代替チャプター番号の配列  preparationNeeded: string[] // 登場前に必要な準備リスト}```

**@constructor:** function Object() { [native code] }

##### TimingAnalyzer.analyzeTimingFactors (method)

タイミング要因を分析するキャラクターとストーリーコンテキストに基づいて、4つの主要要因（プロット関連度、キャラクター発展、ナラティブペーシング、読者期待）を分析し、その結果を返します。@private@async@param {Character} character - 分析対象のキャラクター@param {StoryContext} context - 現在のストーリー文脈情報@returns {Promise<TimingAnalysis>} タイミング分析結果@throws {unknown} 分析処理中に発生したエラー@call-flow1. 各要因の分析メソッドを非同期で呼び出し2. synthesizeAnalysisメソッドを使用して分析結果を統合3. 統合結果の返却@helper-methods- analyzePlotRelevance - プロット関連度分析- analyzeCharacterDevelopment - キャラクター発展分析- analyzeNarrativePacing - ナラティブペーシング分析- analyzeReaderExpectations - 読者期待分析- synthesizeAnalysis - 分析結果の統合@error-handlingtry-catchブロックでエラーをキャッチし、logError関数でログ記録後、再スロー

**@constructor:** function Object() { [native code] }

##### TimingAnalyzer.analyzePlotRelevance (method)

プロット関連度を分析するキャラクターとプロットポイントの関連度を計算し、プロット関連度要因のスコアと影響度を決定します。@private@async@param {Character} character - 分析対象のキャラクター@param {StoryContext} context - 現在のストーリー文脈情報@returns {Promise<TimingFactor>} プロット関連度の分析結果@call-flow1. キャラクターとプロットポイントの関連度を計算2. 計算された関連度に基づいてスコアと影響度を決定3. 結果の返却@helper-methods- calculatePlotRelevance - プロット関連度計算- calculateImpact - 影響度計算@error-handlingtry-catchブロックでエラーをキャッチし、デフォルト値を持つフォールバック結果を返却

**@constructor:** function Object() { [native code] }

##### TimingAnalyzer.analyzeCharacterDevelopment (method)

キャラクター発展を分析するキャラクターの発展段階とストーリーの現在位置を比較し、キャラクター発展要因のスコアと影響度を決定します。@private@async@param {Character} character - 分析対象のキャラクター@param {StoryContext} context - 現在のストーリー文脈情報@returns {Promise<TimingFactor>} キャラクター発展の分析結果@call-flow1. キャラクターの発展段階を取得2. ストーリーの進行度に基づく期待発展段階を計算3. 段階の差に基づいてスコアを計算4. スコアから影響度を決定5. 結果の返却@helper-methods- calculateExpectedStage - 期待される発展段階を計算- calculateImpact - 影響度計算@error-handlingtry-catchブロックでエラーをキャッチし、デフォルト値を持つフォールバック結果を返却

**@constructor:** function Object() { [native code] }

##### TimingAnalyzer.analyzeNarrativePacing (method)

ナラティブペーシングを分析する物語のペースとキャラクター登場の密度を分析し、ナラティブペーシング要因のスコアと影響度を決定します。@private@async@param {Character} character - 分析対象のキャラクター@param {StoryContext} context - 現在のストーリー文脈情報@returns {Promise<TimingFactor>} ナラティブペーシングの分析結果@call-flow1. 物語のペースを取得2. キャラクター登場密度を計算3. ペースと密度に基づいてペーシングスコアを計算4. キャラクタータイプに基づくペーシング影響を計算5. 結果の返却@helper-methods- calculateCharacterDensity - キャラクター密度計算- calculatePacingScore - ペーシングスコア計算- calculatePacingImpact - ペーシング影響計算@error-handlingtry-catchブロックでエラーをキャッチし、デフォルト値を持つフォールバック結果を返却

**@constructor:** function Object() { [native code] }

##### TimingAnalyzer.analyzeReaderExpectations (method)

読者期待を分析する前回の登場からの経過チャプター数とキャラクタータイプに基づいて、読者期待要因のスコアと影響度を決定します。@private@async@param {Character} character - 分析対象のキャラクター@param {StoryContext} context - 現在のストーリー文脈情報@returns {Promise<TimingFactor>} 読者期待の分析結果@call-flow1. 前回の登場からの経過チャプター数を計算2. キャラクタータイプに応じた最適再登場間隔を取得3. 再登場時期の最適さを計算4. スコアから影響度を決定5. 結果の返却@helper-methods- getOptimalReappearanceInterval - 最適再登場間隔取得- calculateImpact - 影響度計算@error-handlingtry-catchブロックでエラーをキャッチし、デフォルト値を持つフォールバック結果を返却

**@constructor:** function Object() { [native code] }

##### TimingAnalyzer.synthesizeAnalysis (method)

分析結果を統合する各要因の分析結果を重み付けして統合し、最適な登場チャプター、代替チャプター、登場の重要度、必要な準備などを決定します。@private@param {TimingFactor[]} factors - 各要因の分析結果配列@param {Character} character - 分析対象のキャラクター@param {StoryContext} context - 現在のストーリー文脈情報@returns {TimingAnalysis} 統合された分析結果@call-flow1. 各要因のスコアを重み付けして統合2. 統合スコアから最適な登場チャプターを計算3. 代替チャプターを計算4. 登場の重要度を計算5. 必要な準備を決定6. 統合結果の構築と返却@helper-methods- calculateOptimalChapter - 最適チャプター計算- calculateAlternativeChapters - 代替チャプター計算- calculateAppearanceSignificance - 登場重要度計算- determineRequiredPreparation - 必要準備の決定@error-handlingtry-catchブロックでエラーをキャッチし、フォールバック値を返却

**@constructor:** function Object() { [native code] }

##### TimingAnalyzer.calculatePlotRelevance (method)

プロット関連度を計算するキャラクターとプロットポイントの関連性を分析し、0から1の間のスコアで関連度を返します。@private@param {Character} character - 分析対象のキャラクター@param {any[]} plotPoints - プロットポイントの配列@returns {number} プロット関連度スコア（0-1）@call-flow1. プロットポイントが空の場合はデフォルト値（0.5）を返却2. キャラクターに関連するプロットポイントをカウント3. 関連プロットポイントの重要度を集計4. 関連ポイントの比率と平均重要度から最終スコアを計算

**@constructor:** function Object() { [native code] }

##### TimingAnalyzer.calculateImpact (method)

スコアから影響度を計算する数値スコアを3段階の影響度（LOW、MEDIUM、HIGH）に変換します。@private@param {number} score - 0から1の間のスコア@returns {'LOW' | 'MEDIUM' | 'HIGH'} 影響度@call-flow1. スコアが0.3未満の場合は'LOW'を返却2. スコアが0.3以上0.7未満の場合は'MEDIUM'を返却3. スコアが0.7以上の場合は'HIGH'を返却

**@constructor:** function Object() { [native code] }

##### TimingAnalyzer.calculateExpectedStage (method)

期待される発展段階を計算するストーリーの進行度に基づいて、キャラクターに期待される発展段階を計算します。@private@param {number} currentChapter - 現在のチャプター番号@param {number} totalChapters - 総チャプター数@returns {number} 期待される発展段階（0-5）@call-flow1. ストーリーの進行度（現在チャプター/総チャプター数）を計算2. 進行度を5段階のスケールに変換して返却

**@constructor:** function Object() { [native code] }

##### TimingAnalyzer.calculateCharacterDensity (method)

キャラクター密度を計算する直近のチャプターにおけるキャラクター登場数の平均を計算します。@private@param {StoryContext} context - ストーリーコンテキスト@returns {number} キャラクター密度（平均登場キャラクター数）@call-flow1. recentAppearancesが空の場合はデフォルト値（5）を返却2. 各チャプターのキャラクター数を合計3. チャプター数で割って平均を計算し返却

**@constructor:** function Object() { [native code] }

##### TimingAnalyzer.calculatePacingScore (method)

ペーシングスコアを計算するペーシングと密度に基づいて、ナラティブペーシングのスコアを計算します。@private@param {string} pacing - ペーシング（'FAST'、'MEDIUM'、'SLOW'）@param {number} characterDensity - キャラクター密度@returns {number} ペーシングスコア（0-1）@call-flow1. ペーシングに応じた最適密度を決定2. 実際の密度と最適密度の差に基づいてスコアを計算

**@constructor:** function Object() { [native code] }

##### TimingAnalyzer.calculatePacingImpact (method)

ペーシング影響を計算するキャラクタータイプに基づいて、ペーシングの影響度を決定します。@private@param {string} characterType - キャラクタータイプ@returns {'LOW' | 'MEDIUM' | 'HIGH'} ペーシング影響度@call-flow1. キャラクタータイプに応じた影響度を返却   - MAIN: LOW （メインキャラはペーシングに関わらず登場）   - SUB: MEDIUM （サブキャラはある程度影響を受ける）   - MOB: HIGH （モブキャラは強く影響を受ける）

**@constructor:** function Object() { [native code] }

##### TimingAnalyzer.getOptimalReappearanceInterval (method)

最適な再登場間隔を取得するキャラクタータイプに応じた最適な再登場間隔を返します。@private@param {string} characterType - キャラクタータイプ@returns {number} 最適な再登場までのチャプター数@call-flow1. キャラクタータイプに応じた間隔を返却   - MAIN: 1 （メインキャラはほぼ毎回登場）   - SUB: 3 （サブキャラは3章ごとくらい）   - MOB: 10 （モブは10章ごとくらい）

**@constructor:** function Object() { [native code] }

##### TimingAnalyzer.calculateOptimalChapter (method)

最適な登場チャプターを計算する総合スコアとキャラクタータイプに基づいて、最適な登場チャプターを計算します。@private@param {number} score - 総合スコア（0-1）@param {Character} character - 分析対象のキャラクター@param {StoryContext} context - ストーリーコンテキスト@returns {number} 最適な登場チャプター番号@call-flow1. スコアから緊急性係数を計算2. キャラクタータイプに基づく基本遅延を取得3. 緊急性に応じた遅延チャプター数を計算4. 現在のチャプターに遅延を加えて返却@helper-methods- getBaseDelayByType - キャラクタータイプによる基本遅延を取得

**@constructor:** function Object() { [native code] }

##### TimingAnalyzer.getBaseDelayByType (method)

キャラクタータイプによる基本遅延を取得するキャラクタータイプに応じた基本的な登場遅延チャプター数を返します。@private@param {string} characterType - キャラクタータイプ@returns {number} 基本遅延チャプター数@call-flow1. キャラクタータイプに応じた遅延値を返却   - MAIN: 1   - SUB: 3   - MOB: 5

**@constructor:** function Object() { [native code] }

##### TimingAnalyzer.calculateAlternativeChapters (method)

代替登場チャプターを計算する最適チャプターの前後に代替となるチャプターを提案します。@private@param {number} optimalChapter - 最適チャプター番号@param {Character} character - 分析対象のキャラクター@param {StoryContext} context - ストーリーコンテキスト@returns {number[]} 代替チャプター番号の配列@call-flow1. キャラクタータイプに応じた柔軟性を決定2. 最適チャプターが現在チャプターより後の場合、前側の代替チャプターを追加3. 後側の代替チャプターを追加4. 代替チャプター配列を返却

**@constructor:** function Object() { [native code] }

##### TimingAnalyzer.calculateAppearanceSignificance (method)

登場の重要度を計算するスコアとキャラクタータイプに基づいて、登場の重要度を決定します。@private@param {number} score - 総合スコア（0-1）@param {Character} character - 分析対象のキャラクター@returns {'LOW' | 'MEDIUM' | 'HIGH'} 登場の重要度@call-flow1. キャラクタータイプに応じた重み係数を決定2. スコアとタイプ重みを組み合わせて総合スコアを計算3. 総合スコアから影響度を計算して返却@helper-methods- calculateImpact - 影響度計算

**@constructor:** function Object() { [native code] }

##### TimingAnalyzer.determineRequiredPreparation (method)

必要な準備を決定するキャラクターの登場に必要な準備を決定します。@private@param {Character} character - 分析対象のキャラクター@param {number} targetChapter - 目標登場チャプター@param {StoryContext} context - ストーリーコンテキスト@returns {string[]} 必要な準備のリスト@call-flow1. 準備リストを初期化2. 初登場の場合は紹介と背景情報提示を追加3. 長期間登場していない場合は経過説明と状態変化描写を追加4. キャラクタータイプに応じた準備を追加5. プロット関連の準備を追加6. 準備リストを返却@helper-methods- findRelevantUpcomingPlotPoints - 関連する今後のプロットポイントを検索

**@constructor:** function Object() { [native code] }

##### TimingAnalyzer.findRelevantUpcomingPlotPoints (method)

関連する今後のプロットポイントを検索するキャラクターに関連する今後のプロットポイントを検索します。@private@param {Character} character - 分析対象のキャラクター@param {StoryContext} context - ストーリーコンテキスト@returns {any[]} 関連するプロットポイントの配列@call-flow1. plotPointsが空の場合は空配列を返却2. 現在のチャプターより後のプロットポイントをフィルタリング3. キャラクターIDが関連キャラクターに含まれるかチェック4. キーワードがキャラクターの特性や背景に一致するかチェック5. 関連するプロットポイントを返却

**@constructor:** function Object() { [native code] }


---

### auto-correction copy.ts {#cnovel-automation-systemsrclibcorrectionauto-correction-copyts}

**Path:** `C:/novel-automation-system/src/lib/correction/auto-correction copy.ts`

//  * 自動修正システム
//  * 小説の不整合を検出し、自動的に修正するシステム
//

**@constructor:** function Object() { [native code] }


---

### auto-correction.ts {#cnovel-automation-systemsrclibcorrectionauto-correctionts}

**Path:** `C:/novel-automation-system/src/lib/correction/auto-correction.ts`

自動修正システム物語の一貫性問題を検出し、自動的に修正するためのクラス

**@constructor:** function Object() { [native code] }

#### AutoCorrectionSystem (class)

自動修正システム物語の一貫性問題を検出し、自動的に修正するためのクラス

**@constructor:** function Object() { [native code] }

#### Methods of AutoCorrectionSystem

##### AutoCorrectionSystem.correctChapter (method)

チャプターの不整合を検出し修正する

**@constructor:** function Object() { [native code] }

##### AutoCorrectionSystem.detectInconsistencies (method)

不整合を検出する

**@constructor:** function Object() { [native code] }

##### AutoCorrectionSystem.generateCorrections (method)

修正案を生成する

**@constructor:** function Object() { [native code] }

##### AutoCorrectionSystem.applyCorrections (method)

修正を適用する

**@constructor:** function Object() { [native code] }

##### AutoCorrectionSystem.applyCorrection (method)

単一の修正を適用する

**@constructor:** function Object() { [native code] }

##### AutoCorrectionSystem.insertAtPosition (method)

指定位置にテキストを挿入する

**@constructor:** function Object() { [native code] }

##### AutoCorrectionSystem.deleteRange (method)

指定範囲のテキストを削除する

**@constructor:** function Object() { [native code] }

##### AutoCorrectionSystem.detectTimelineIssues (method)

時系列の問題を検出する

**@constructor:** function Object() { [native code] }

##### AutoCorrectionSystem.detectExpressionIssues (method)

表現・語彙の問題を検出する

**@constructor:** function Object() { [native code] }

##### AutoCorrectionSystem.generateTimelineCorrection (method)

時系列修正を生成する

**@constructor:** function Object() { [native code] }

##### AutoCorrectionSystem.generateExpressionCorrection (method)

表現修正を生成する

**@constructor:** function Object() { [native code] }

##### AutoCorrectionSystem.sortIssuesBySeverity (method)

問題を深刻度でソートする

**@constructor:** function Object() { [native code] }

##### AutoCorrectionSystem.sortCorrectionsByPosition (method)

修正を位置でソートする

**@constructor:** function Object() { [native code] }

##### AutoCorrectionSystem.getCorrectionPosition (method)

修正の位置を取得する

**@constructor:** function Object() { [native code] }

##### AutoCorrectionSystem.saveCorrectionHistory (method)

修正履歴を保存する

**@constructor:** function Object() { [native code] }


---

### character-correction copy.ts {#cnovel-automation-systemsrclibcorrectioncharacter-correction-copyts}

**Path:** `C:/novel-automation-system/src/lib/correction/character-correction copy.ts`

//  * キャラクター修正クラス
//  * キャラクターに関する不整合を検出・修正する
//

**@constructor:** function Object() { [native code] }


---

### character-correction.ts {#cnovel-automation-systemsrclibcorrectioncharacter-correctionts}

**Path:** `C:/novel-automation-system/src/lib/correction/character-correction.ts`

キャラクター修正クラスキャラクターの一貫性問題を検出・修正するためのクラス

**@constructor:** function Object() { [native code] }

#### CharacterCorrection (class)

キャラクター修正クラスキャラクターの一貫性問題を検出・修正するためのクラス

**@constructor:** function Object() { [native code] }

#### Methods of CharacterCorrection

##### CharacterCorrection.detect (method)

キャラクターの不整合を検出する

**@constructor:** function Object() { [native code] }

##### CharacterCorrection.generateCorrection (method)

不整合に対する修正を生成する

**@constructor:** function Object() { [native code] }

##### CharacterCorrection.extractCharacterInstances (method)

チャプターからキャラクターの出現を抽出する

**@constructor:** function Object() { [native code] }

##### CharacterCorrection.loadCharacters (method)

キャラクターデータをロードする

**@constructor:** function Object() { [native code] }

##### CharacterCorrection.getHistoricalPersonality (method)

過去の性格描写を取得する

**@constructor:** function Object() { [native code] }

##### CharacterCorrection.checkPersonalityConsistency (method)

性格の一貫性をチェックする

**@constructor:** function Object() { [native code] }

##### CharacterCorrection.detectPersonalityInconsistency (method)

性格の不一致を検出する

**@constructor:** function Object() { [native code] }

##### CharacterCorrection.checkBehaviorConsistency (method)

行動の一貫性をチェックする

**@constructor:** function Object() { [native code] }

##### CharacterCorrection.checkDialogueConsistency (method)

セリフの一貫性をチェックする

**@constructor:** function Object() { [native code] }

##### CharacterCorrection.checkAbilityConsistency (method)

能力の一貫性をチェックする

**@constructor:** function Object() { [native code] }

##### CharacterCorrection.generatePersonalityCorrection (method)

性格修正を生成する

**@constructor:** function Object() { [native code] }

##### CharacterCorrection.generateBehaviorCorrection (method)

行動修正を生成する

**@constructor:** function Object() { [native code] }

##### CharacterCorrection.generateDialogueCorrection (method)

セリフ修正を生成する

**@constructor:** function Object() { [native code] }

##### CharacterCorrection.generateAbilityCorrection (method)

能力修正を生成する

**@constructor:** function Object() { [native code] }


---

### plot-correction copy.ts {#cnovel-automation-systemsrclibcorrectionplot-correction-copyts}

**Path:** `C:/novel-automation-system/src/lib/correction/plot-correction copy.ts`

//  * プロット修正クラス
//  * プロットに関する不整合を検出・修正する
//

**@constructor:** function Object() { [native code] }


---

### plot-correction.ts {#cnovel-automation-systemsrclibcorrectionplot-correctionts}

**Path:** `C:/novel-automation-system/src/lib/correction/plot-correction.ts`

プロット修正クラスプロットの一貫性問題を検出・修正するためのクラス

**@constructor:** function Object() { [native code] }

#### PlotCorrection (class)

プロット修正クラスプロットの一貫性問題を検出・修正するためのクラス

**@constructor:** function Object() { [native code] }

#### Methods of PlotCorrection

##### PlotCorrection.detect (method)

プロットの不整合を検出する

**@constructor:** function Object() { [native code] }

##### PlotCorrection.generateCorrection (method)

不整合に対する修正を生成する

**@constructor:** function Object() { [native code] }

##### PlotCorrection.checkCausalityConsistency (method)

因果関係の一貫性をチェックする

**@constructor:** function Object() { [native code] }

##### PlotCorrection.extractEvents (method)

チャプターからイベントを抽出する

**@constructor:** function Object() { [native code] }

##### PlotCorrection.buildCausalChain (method)

因果関係チェーンを構築する

**@constructor:** function Object() { [native code] }

##### PlotCorrection.getPriorChapterEvents (method)

前のチャプターのイベントを取得する

**@constructor:** function Object() { [native code] }

##### PlotCorrection.hasValidCause (method)

イベントに有効な原因があるか確認する

**@constructor:** function Object() { [native code] }

##### PlotCorrection.generateCauseSuggestion (method)

原因の提案を生成する

**@constructor:** function Object() { [native code] }

##### PlotCorrection.checkTimelineConsistency (method)

時系列の一貫性をチェックする

**@constructor:** function Object() { [native code] }

##### PlotCorrection.checkForeshadowingConsistency (method)

伏線の一貫性をチェックする

**@constructor:** function Object() { [native code] }

##### PlotCorrection.checkWorldBuildingConsistency (method)

世界設定の一貫性をチェックする

**@constructor:** function Object() { [native code] }

##### PlotCorrection.generateCausalityCorrection (method)

因果関係修正を生成する

**@constructor:** function Object() { [native code] }

##### PlotCorrection.generateTimelineCorrection (method)

時系列修正を生成する

**@constructor:** function Object() { [native code] }

##### PlotCorrection.generateForeshadowingCorrection (method)

伏線修正を生成する

**@constructor:** function Object() { [native code] }

##### PlotCorrection.generateWorldBuildingCorrection (method)

世界設定修正を生成する

**@constructor:** function Object() { [native code] }


---

### canary-deployment.ts {#cnovel-automation-systemsrclibdeploymentcanary-deploymentts}

**Path:** `C:/novel-automation-system/src/lib/deployment/canary-deployment.ts`

カナリアデプロイメント設定

**@constructor:** function Object() { [native code] }

#### CanaryDeployment (class)

カナリア有効フラグ */
enabled: boolean;

/** カナリア割合（%） */
percentage: number;

/** カナリアバージョン */
version: string;

/** ターゲットグループ（オプション） */
targetGroups?: {
/** グループ名 */
name: string;

/** セレクター条件 */
selector: (req: any) => boolean;

/** 割り当て率（%） */
allocation: number;
}[];

/** モニタリング設定 */
monitoring?: {
/** メトリクス収集間隔（ms） */
metricInterval: number;

/** 自動ロールバックしきい値 */
autoRollbackThreshold: number;

/** 自動昇格しきい値 */
autoPromoteThreshold: number;
};
}

/**カナリアデプロイメント管理クラストラフィックの段階的なルーティングと自動監視を提供

**@constructor:** function Object() { [native code] }

#### Methods of CanaryDeployment

##### CanaryDeployment.constructor (method)

設定 */
private config: CanaryConfig;

/** カナリアメトリクス */
private metrics: {
requests: { stable: number; canary: number };
errors: { stable: number; canary: number };
latency: { stable: number[]; canary: number[] };
};

/** モニタリングタイマーID */
private monitoringTimer?: NodeJS.Timeout;

/**カナリアデプロイメント管理を初期化

**@constructor:** function Object() { [native code] }

##### CanaryDeployment.loadConfig (method)

環境変数から設定を読み込み@returns カナリア設定

**@constructor:** function Object() { [native code] }

##### CanaryDeployment.shouldUseCanary (method)

リクエストをカナリアにルーティングすべきか判定@param req HTTPリクエスト@returns カナリーにルーティングすべきかのフラグ

**@constructor:** function Object() { [native code] }

##### CanaryDeployment.getVersion (method)

現在のバージョンを取得@param req HTTPリクエスト（オプション）@returns 適用されるバージョン

**@constructor:** function Object() { [native code] }

##### CanaryDeployment.middleware (method)

カナリールーティングミドルウェア@returns Expressミドルウェア

**@constructor:** function Object() { [native code] }

##### CanaryDeployment.startMonitoring (method)

カナリー評価モニタリングを開始

**@constructor:** function Object() { [native code] }

##### CanaryDeployment.evaluateCanary (method)

カナリーを評価し、必要に応じて自動アクションを実行

**@constructor:** function Object() { [native code] }

##### CanaryDeployment.calculateErrorRate (method)

エラー率を計算@param version バージョン（'stable' または 'canary'）@returns エラー率

**@constructor:** function Object() { [native code] }

##### CanaryDeployment.calculateAverageLatency (method)

平均レイテンシーを計算@param version バージョン（'stable' または 'canary'）@returns 平均レイテンシー

**@constructor:** function Object() { [native code] }

##### CanaryDeployment.triggerRollback (method)

自動ロールバックを開始@param canaryMetric カナリーメトリック値@param stableMetric 安定版メトリック値@param metricType メトリックタイプ

**@constructor:** function Object() { [native code] }

##### CanaryDeployment.considerPromotion (method)

カナリー昇格を検討

**@constructor:** function Object() { [native code] }

##### CanaryDeployment.sendNotification (method)

通知送信@param notification 通知内容

**@constructor:** function Object() { [native code] }

##### CanaryDeployment.updateConfig (method)

カナリーの設定を更新@param newConfig 新しい設定

**@constructor:** function Object() { [native code] }

##### CanaryDeployment.getConfig (method)

現在のカナリー設定を取得@returns カナリー設定

**@constructor:** function Object() { [native code] }

##### CanaryDeployment.getStats (method)

カナリー統計を取得@returns カナリー統計

**@constructor:** function Object() { [native code] }

##### CanaryDeployment.resetStats (method)

カナリー統計をリセット

**@constructor:** function Object() { [native code] }

#### CanaryConfig (interface)

カナリアデプロイメント設定

**@constructor:** function Object() { [native code] }


---

### collaborative-editor copy.ts {#cnovel-automation-systemsrclibeditorcollaborative-editor-copyts}

**Path:** `C:/novel-automation-system/src/lib/editor/#/collaborative-editor copy.ts`

//  * エディタセッション
//

**@constructor:** function Object() { [native code] }


---

### command-interpreter copy.ts {#cnovel-automation-systemsrclibeditorcommand-interpreter-copyts}

**Path:** `C:/novel-automation-system/src/lib/editor/#/command-interpreter copy.ts`

自然言語コマンドを解釈するインタープリター

**@constructor:** function Object() { [native code] }

#### CommandInterpreter (class)

自然言語コマンドを解釈するインタープリター

**@constructor:** function Object() { [native code] }

#### Methods of CommandInterpreter

##### CommandInterpreter.interpret (method)

自然言語コマンドを解釈して実行可能なコマンドに変換@param command 自然言語コマンド@returns 解釈されたコマンド

**@constructor:** function Object() { [native code] }

##### CommandInterpreter.parseCommand (method)

コマンドを初期解析

**@constructor:** function Object() { [native code] }

##### CommandInterpreter.extractEntities (method)

テキストからエンティティを抽出

**@constructor:** function Object() { [native code] }

##### CommandInterpreter.extractParameters (method)

パラメータ値を抽出

**@constructor:** function Object() { [native code] }


---

### conflict-resolver copy.ts {#cnovel-automation-systemsrclibeditorconflict-resolver-copyts}

**Path:** `C:/novel-automation-system/src/lib/editor/#/conflict-resolver copy.ts`

//  * コンフリクト解決クラス
//  * 編集操作間のコンフリクトを検出し、解決策を提供
//

**@constructor:** function Object() { [native code] }


---

### version-control copy.ts {#cnovel-automation-systemsrclibeditorversion-control-copyts}

**Path:** `C:/novel-automation-system/src/lib/editor/#/version-control copy.ts`

//  * 変更履歴
//

**@constructor:** function Object() { [native code] }


---

### collaborative-editor.ts {#cnovel-automation-systemsrclibeditorcollaborative-editorts}

**Path:** `C:/novel-automation-system/src/lib/editor/collaborative-editor.ts`

ドキュメント

**@constructor:** function Object() { [native code] }

#### CollaborativeEditor (class)

成功フラグ */
success: boolean;

/** 結果ドキュメント */
document?: Document;

/** コンフリクト */
conflicts?: Conflict[];

/** 解決提案 */
resolution?: Resolution;

/** エラーメッセージ */
error?: string;
}

/**協調編集クラス複数ユーザーによる同時編集をサポート

**@constructor:** function Object() { [native code] }

#### Methods of CollaborativeEditor

##### CollaborativeEditor.constructor (method)

協調編集システムを初期化@param storageAdapter ストレージアダプター（オプション）

**@constructor:** function Object() { [native code] }

##### CollaborativeEditor.startSession (method)

セッションを開始@param editorId 編集者ID@param document ドキュメント@returns セッション

**@constructor:** function Object() { [native code] }

##### CollaborativeEditor.findExistingSession (method)

既存のセッションを検索@param editorId 編集者ID@param documentId ドキュメントID@returns 既存セッション（存在すれば）

**@constructor:** function Object() { [native code] }

##### CollaborativeEditor.endSession (method)

セッションを終了@param sessionId セッションID@returns 成功フラグ

**@constructor:** function Object() { [native code] }

##### CollaborativeEditor.applyEdit (method)

編集を適用@param sessionId セッションID@param edit 編集操作@returns 編集結果

**@constructor:** function Object() { [native code] }

##### CollaborativeEditor.applyEdits (method)

複数の編集を適用@param sessionId セッションID@param edits 編集操作の配列@returns 編集結果

**@constructor:** function Object() { [native code] }

##### CollaborativeEditor.saveDocument (method)

ドキュメントを保存@param sessionId セッションID@returns 成功フラグ

**@constructor:** function Object() { [native code] }

##### CollaborativeEditor.applyResolution (method)

解決戦略を適用@param sessionId セッションID@param resolution 解決内容@returns 編集結果

**@constructor:** function Object() { [native code] }

##### CollaborativeEditor.getSessionInfo (method)

セッション情報を取得@param sessionId セッションID@returns セッション情報（存在しない場合はnull）

**@constructor:** function Object() { [native code] }

##### CollaborativeEditor.getDocumentSessions (method)

ドキュメントのセッションを取得@param documentId ドキュメントID@returns セッションの配列

**@constructor:** function Object() { [native code] }

##### CollaborativeEditor.getEditorSessions (method)

編集者のアクティブセッションを取得@param editorId 編集者ID@returns セッションの配列

**@constructor:** function Object() { [native code] }

##### CollaborativeEditor.getLatestDocument (method)

ドキュメントの最新バージョンを取得@param documentId ドキュメントID@returns ドキュメント（存在しない場合はnull）

**@constructor:** function Object() { [native code] }

##### CollaborativeEditor.getEditHistory (method)

編集履歴を取得@param documentId ドキュメントID@returns 変更履歴

**@constructor:** function Object() { [native code] }

##### CollaborativeEditor.revertToVersion (method)

特定バージョンに戻す@param documentId ドキュメントID@param version バージョン番号@returns 成功フラグ

**@constructor:** function Object() { [native code] }

##### CollaborativeEditor.getVersionInfo (method)

バージョン情報を取得@param documentId ドキュメントID@returns バージョン情報

**@constructor:** function Object() { [native code] }

##### CollaborativeEditor.applyEditToDocument (method)

ドキュメントに編集を適用@param document ドキュメント@param edit 編集操作@returns 編集後のドキュメント

**@constructor:** function Object() { [native code] }

##### CollaborativeEditor.getOtherActiveSessions (method)

他のアクティブセッションを取得@param currentSessionId 現在のセッションID@param documentId ドキュメントID@returns 他のアクティブセッションの配列

**@constructor:** function Object() { [native code] }

##### CollaborativeEditor.cleanupInactiveSessions (method)

非アクティブセッションのクリーンアップ

**@constructor:** function Object() { [native code] }

#### Document (interface)

ドキュメント

**@constructor:** function Object() { [native code] }

#### EditorEdit (interface)

ドキュメントID */
id: string;

/** ドキュメントタイトル */
title: string;

/** ドキュメント内容 */
content: string;

/** ドキュメントバージョン */
version: number;

/** 最終更新日時 */
updatedAt: Date;

/** メタデータ */
metadata: Record<string, any>;
}

/**編集操作

**@constructor:** function Object() { [native code] }

#### EditorSession (interface)

編集タイプ */
type: 'INSERT' | 'DELETE' | 'REPLACE';

/** 編集位置 */
position: number;

/** 編集内容（挿入・置換時）*/
text?: string;

/** 削除長（削除時）*/
deleteLength?: number;

/** 置換対象（置換時）*/
replaceTarget?: string;

/** タイムスタンプ */
timestamp: Date;

/** 編集者ID */
editorId: string;

/** メタデータ */
metadata?: Record<string, any>;
}

/**エディタセッション

**@constructor:** function Object() { [native code] }

#### Conflict (interface)

セッションID */
id: string;

/** 編集者ID */
editorId: string;

/** ドキュメント */
document: Document;

/** セッション開始時間 */
startedAt: Date;

/** 最終アクティブ時間 */
lastActive: Date;

/** セッションのステータス */
status: 'ACTIVE' | 'IDLE' | 'ENDED';

/** 保留中の編集 */
pendingEdits: EditorEdit[];

/** メタデータ */
metadata?: Record<string, any>;
}

/**コンフリクト

**@constructor:** function Object() { [native code] }

#### ResolutionStrategy (interface)

行番号 */
lineNumber: number;

/** 基本内容 */
baseContent: string;

/** 編集内容 */
editedContent: string;

/** 他の内容 */
otherContent: string;

/** コンフリクトタイプ */
type: string;
}

/**解決戦略

**@constructor:** function Object() { [native code] }

#### Resolution (interface)

コンフリクトインデックス */
conflictIndex: number;

/** 戦略タイプ */
type: 'TAKE_MINE' | 'TAKE_THEIRS' | 'MERGE' | 'MANUAL';

/** 提案内容 */
suggestedContent?: string;
}

/**解決内容

**@constructor:** function Object() { [native code] }

#### EditResult (interface)

コンフリクト */
conflicts: Conflict[];

/** 解決戦略 */
strategies: ResolutionStrategy[];

/** マージ済みドキュメント */
mergedDocument: Document;
}

/**編集結果

**@constructor:** function Object() { [native code] }


---

### command-interpreter.ts {#cnovel-automation-systemsrclibeditorcommand-interpreterts}

**Path:** `C:/novel-automation-system/src/lib/editor/command-interpreter.ts`

自然言語コマンドを解釈するクラス

**@constructor:** function Object() { [native code] }

#### CommandInterpreter (class)

自然言語コマンドを解釈するクラス

**@constructor:** function Object() { [native code] }

#### Methods of CommandInterpreter

##### CommandInterpreter.interpretCommand (method)

コマンドを解釈@param text 自然言語コマンド@returns 解釈されたコマンドと信頼度

**@constructor:** function Object() { [native code] }

##### CommandInterpreter.addCommand (method)

サポートされているコマンドを追加@param command コマンド定義

**@constructor:** function Object() { [native code] }

##### CommandInterpreter.getSupportedCommands (method)

サポートされているコマンドを取得@returns コマンド一覧

**@constructor:** function Object() { [native code] }

##### CommandInterpreter.findCommand (method)

コマンドを検索@param type コマンドタイプ@param action アクション@returns コマンド定義

**@constructor:** function Object() { [native code] }

##### CommandInterpreter.initializeCommands (method)

コマンドの初期化

**@constructor:** function Object() { [native code] }

##### CommandInterpreter.parseCommand (method)

コマンドを解析@param text 自然言語コマンド@returns 解析結果

**@constructor:** function Object() { [native code] }

##### CommandInterpreter.identifyIntent (method)

インテントを特定@param parsed 解析結果@param context コンテキスト@returns 特定されたインテント

**@constructor:** function Object() { [native code] }

##### CommandInterpreter.extractParameters (method)

パラメータを抽出@param parsed 解析結果@param intent 特定されたインテント@param context コンテキスト@returns 抽出されたパラメータ

**@constructor:** function Object() { [native code] }

##### CommandInterpreter.updateContext (method)

コンテキストを更新@param command 解釈されたコマンド

**@constructor:** function Object() { [native code] }


---

### command-registry.ts {#cnovel-automation-systemsrclibeditorcommand-registryts}

**Path:** `C:/novel-automation-system/src/lib/editor/command-registry.ts`

利用可能なコマンドを管理するレジストリ

**@constructor:** function Object() { [native code] }

#### CommandRegistry (class)

利用可能なコマンドを管理するレジストリ

**@constructor:** function Object() { [native code] }

#### Methods of CommandRegistry

##### CommandRegistry.registerDefaultCommands (method)

デフォルトコマンドの登録

**@constructor:** function Object() { [native code] }

##### CommandRegistry.registerCommand (method)

新しいコマンドを登録

**@constructor:** function Object() { [native code] }

##### CommandRegistry.findCommand (method)

インテントに一致するコマンドを検索

**@constructor:** function Object() { [native code] }

##### CommandRegistry.getAllCommands (method)

登録されているすべてのコマンドを取得

**@constructor:** function Object() { [native code] }


---

### conflict-resolver.ts {#cnovel-automation-systemsrclibeditorconflict-resolverts}

**Path:** `C:/novel-automation-system/src/lib/editor/conflict-resolver.ts`

コンフリクト解決クラス編集操作間のコンフリクトを検出し、解決策を提供

**@constructor:** function Object() { [native code] }

#### ConflictResolver (class)

コンフリクト解決クラス編集操作間のコンフリクトを検出し、解決策を提供

**@constructor:** function Object() { [native code] }

#### Methods of ConflictResolver

##### ConflictResolver.checkConflicts (method)

コンフリクトをチェック@param baseDocument 基本ドキュメント@param editedDocument 編集後ドキュメント@param otherSessions 他のセッション@returns コンフリクトの配列

**@constructor:** function Object() { [native code] }

##### ConflictResolver.detectConflicts (method)

ドキュメント間のコンフリクトを検出@param base 基本ドキュメント@param edited 編集後ドキュメント@param other 他のドキュメント@returns コンフリクトの配列

**@constructor:** function Object() { [native code] }

##### ConflictResolver.detectOrderConflicts (method)

順序コンフリクトを検出@param baseLines 基本行@param editedLines 編集行@param otherLines 他方行@param conflicts コンフリクト配列（結果を追加）

**@constructor:** function Object() { [native code] }

##### ConflictResolver.suggestResolution (method)

コンフリクトの解決案を提案@param conflicts コンフリクトの配列@returns 解決案

**@constructor:** function Object() { [native code] }

##### ConflictResolver.determineStrategy (method)

コンフリクトの解決戦略を決定@param conflict コンフリクト@param index コンフリクトのインデックス@returns 解決戦略

**@constructor:** function Object() { [native code] }

##### ConflictResolver.determineContentStrategy (method)

コンテンツコンフリクトの解決戦略を決定@param conflict コンフリクト@param index コンフリクトのインデックス@returns 解決戦略

**@constructor:** function Object() { [native code] }

##### ConflictResolver.mergeLine (method)

行のマージを試みる@param base 基本行@param mine 自分の行@param theirs 他方の行@returns マージされた行

**@constructor:** function Object() { [native code] }

##### ConflictResolver.applyStrategies (method)

解決戦略に基づいてドキュメントをマージ@param conflicts コンフリクトの配列@param strategies 解決戦略の配列@returns マージされたドキュメント

**@constructor:** function Object() { [native code] }

##### ConflictResolver.extractDocumentContent (method)

コンフリクトからドキュメントの内容を抽出コンフリクトの情報から再構築する@param conflicts コンフリクト配列@returns ドキュメント内容

**@constructor:** function Object() { [native code] }


---

### context-history.ts {#cnovel-automation-systemsrclibeditorcontext-historyts}

**Path:** `C:/novel-automation-system/src/lib/editor/context-history.ts`

コンテキスト履歴を管理するクラス

**@constructor:** function Object() { [native code] }

#### ContextHistory (class)

コンテキスト履歴を管理するクラス

**@constructor:** function Object() { [native code] }

#### Methods of ContextHistory

##### ContextHistory.getContext (method)

現在のコンテキストを取得

**@constructor:** function Object() { [native code] }

##### ContextHistory.updateContext (method)

コンテキストを更新

**@constructor:** function Object() { [native code] }

##### ContextHistory.clearContext (method)

コンテキストをクリア

**@constructor:** function Object() { [native code] }

##### ContextHistory.revertToPrevious (method)

一つ前のコンテキストに戻る

**@constructor:** function Object() { [native code] }


---

### diff-algorithm.ts {#cnovel-automation-systemsrclibeditordiff-algorithmts}

**Path:** `C:/novel-automation-system/src/lib/editor/diff-algorithm.ts`

差分操作の種類

**@constructor:** function Object() { [native code] }

#### DiffAlgorithm (class)

元テキストでの開始位置 */
startPosition: number;

/** 元テキストでの終了位置 */
endPosition: number;
}

/**文字レベルの差分を検出する差分アルゴリズムGoogle diff-match-patchアルゴリズムの概念を利用

**@constructor:** function Object() { [native code] }

#### Methods of DiffAlgorithm

##### DiffAlgorithm.computeDiff (method)

2つのテキスト間の差分を計算@param oldText 元のテキスト@param newText 新しいテキスト@returns 差分操作の配列

**@constructor:** function Object() { [native code] }

##### DiffAlgorithm.computePositionedDiff (method)

位置情報付きの差分を計算@param oldText 元のテキスト@param newText 新しいテキスト@returns 位置情報付きの差分操作の配列

**@constructor:** function Object() { [native code] }

##### DiffAlgorithm.computeCharacterDiff (method)

文字単位の差分を計算（Myers差分アルゴリズムベース）@param oldText 元のテキスト@param newText 新しいテキスト@returns 差分操作の配列

**@constructor:** function Object() { [native code] }

##### DiffAlgorithm.computeMiddleDiff (method)

中間部分の差分を計算@param oldMiddle 元テキストの中間部分@param newMiddle 新テキストの中間部分@returns 差分操作の配列

**@constructor:** function Object() { [native code] }

##### DiffAlgorithm.computeCharByCharDiff (method)

文字単位の差分を計算@param oldText 元のテキスト@param newText 新しいテキスト@returns 差分操作の配列

**@constructor:** function Object() { [native code] }

##### DiffAlgorithm.cleanupDiff (method)

差分操作の配列をクリーンアップ（最適化）@param changes 差分操作の配列@returns 最適化された差分操作の配列

**@constructor:** function Object() { [native code] }

##### DiffAlgorithm.hasCommonSubstring (method)

2つのテキストの間に共通の部分文字列があるか確認@param text1 テキスト1@param text2 テキスト2@param minLength 最小共通長@returns 共通部分があるか

**@constructor:** function Object() { [native code] }

##### DiffAlgorithm.findCommonPrefix (method)

共通の接頭辞の長さを見つける@param text1 テキスト1@param text2 テキスト2@returns 共通接頭辞の長さ

**@constructor:** function Object() { [native code] }

##### DiffAlgorithm.findCommonSuffix (method)

共通の接尾辞の長さを見つける@param text1 テキスト1@param text2 テキスト2@returns 共通接尾辞の長さ

**@constructor:** function Object() { [native code] }

##### DiffAlgorithm.findSplitPoint (method)

分割ポイントを見つける長いテキストを効率的に処理するための最適な分割点を探す@param oldText 元のテキスト@param newText 新しいテキスト@returns 分割ポイント情報

**@constructor:** function Object() { [native code] }

##### DiffAlgorithm.getLineDiff (method)

行分割された差分を取得@param oldText 元のテキスト@param newText 新しいテキスト@returns 行単位の差分

**@constructor:** function Object() { [native code] }

##### DiffAlgorithm.computeLCS (method)

最長共通部分列（LCS）を計算@param sequences1 シーケンス1@param sequences2 シーケンス2@returns 最長共通部分列

**@constructor:** function Object() { [native code] }

#### DiffOperation (enum)

差分操作の種類

**@constructor:** function Object() { [native code] }

#### DiffChange (interface)

テキスト追加 */
INSERT = 'INSERT',

/** テキスト削除 */
DELETE = 'DELETE',

/** テキスト保持（変更なし） */
EQUAL = 'EQUAL'
}

/**差分操作

**@constructor:** function Object() { [native code] }

#### PositionedDiff (interface)

操作タイプ */
operation: DiffOperation;

/** テキスト */
text: string;
}

/**テキスト位置情報付き差分

**@constructor:** function Object() { [native code] }


---

### feedback-history.ts {#cnovel-automation-systemsrclibeditorfeedback-historyts}

**Path:** `C:/novel-automation-system/src/lib/editor/feedback-history.ts`

フィードバック履歴エントリ

**@constructor:** function Object() { [native code] }

#### FeedbackHistory (class)

フィードバック */
feedback: EditorFeedback;

/** 分類結果 */
classification: ClassifiedFeedback;

/** アクションアイテム */
actionItems: ActionItem[];

/** アクション状態 */
actionStatus: {
completedCount: number;
totalCount: number;
lastUpdate: Date;
};

/** 学習ステータス */
learningStatus: {
applied: boolean;
model: string;
timestamp: Date;
};
}

/**フィードバック履歴管理クラス

**@constructor:** function Object() { [native code] }

#### Methods of FeedbackHistory

##### FeedbackHistory.record (method)

フィードバックを記録@param feedback 編集者フィードバック@param classification 分類結果@param actionItems アクションアイテム@returns 成功フラグ

**@constructor:** function Object() { [native code] }

##### FeedbackHistory.getHistory (method)

履歴を取得@param fromDate 開始日時@returns 履歴エントリの配列

**@constructor:** function Object() { [native code] }

##### FeedbackHistory.updateActionStatus (method)

アクション状態を更新@param feedbackId フィードバックID@param completedCount 完了したアクション数@returns 成功フラグ

**@constructor:** function Object() { [native code] }

##### FeedbackHistory.updateLearningStatus (method)

学習状態を更新@param feedbackId フィードバックID@param applied 適用フラグ@param model モデル名@returns 成功フラグ

**@constructor:** function Object() { [native code] }

##### FeedbackHistory.loadHistory (method)

履歴をロード

**@constructor:** function Object() { [native code] }

##### FeedbackHistory.saveHistory (method)

履歴を保存

**@constructor:** function Object() { [native code] }

#### FeedbackHistoryEntry (interface)

フィードバック履歴エントリ

**@constructor:** function Object() { [native code] }


---

### feedback-processor.ts {#cnovel-automation-systemsrclibeditorfeedback-processorts}

**Path:** `C:/novel-automation-system/src/lib/editor/feedback-processor.ts`

フィードバックの分類

**@constructor:** function Object() { [native code] }

#### FeedbackProcessor (class)

チャプターID */
chapterId: string;

/** フィードバックタイプ */
type: FeedbackType;

/** フィードバック内容 */
content: string;

/** 評価 (1-5) */
rating?: number;

/** 提案 */
suggestions?: string[];

/** 編集者ID */
editorId: string;

/** タイムスタンプ */
timestamp: Date;
}

/**フィードバックプロセッサ編集者からのフィードバックを処理し、学習に活用するクラス

**@constructor:** function Object() { [native code] }

#### Methods of FeedbackProcessor

##### FeedbackProcessor.processFeedback (method)

フィードバックを処理@param feedback 編集者フィードバック@returns 処理結果

**@constructor:** function Object() { [native code] }

##### FeedbackProcessor.getFeedbackHistory (method)

フィードバック履歴を取得@param timeRange 時間範囲（オプション）@returns フィードバック履歴

**@constructor:** function Object() { [native code] }

##### FeedbackProcessor.classifyFeedback (method)

フィードバックの分類@param feedback 編集者フィードバック@returns 分類結果

**@constructor:** function Object() { [native code] }

##### FeedbackProcessor.categorizeFeedback (method)

フィードバックのカテゴリー分類@param feedback 編集者フィードバック@returns カテゴリーの配列

**@constructor:** function Object() { [native code] }

##### FeedbackProcessor.analyzeSentiment (method)

感情分析@param feedback 編集者フィードバック@returns 感情分析結果

**@constructor:** function Object() { [native code] }

##### FeedbackProcessor.calculatePriority (method)

優先度の計算@param feedback 編集者フィードバック@param categories カテゴリー@param sentiment 感情分析結果@returns 優先度

**@constructor:** function Object() { [native code] }

##### FeedbackProcessor.identifyAffectedComponents (method)

影響を受けるコンポーネントの特定@param feedback 編集者フィードバック@returns コンポーネントの配列

**@constructor:** function Object() { [native code] }

##### FeedbackProcessor.generateActionItems (method)

アクションアイテムの生成@param classified 分類されたフィードバック@returns アクションアイテムの配列

**@constructor:** function Object() { [native code] }

##### FeedbackProcessor.getActionsForCategory (method)

カテゴリーに対するアクションを取得@param category カテゴリー@returns アクションの配列

**@constructor:** function Object() { [native code] }

##### FeedbackProcessor.determineAssignee (method)

担当者の決定@param action アクション@param classified 分類されたフィードバック@returns 担当者

**@constructor:** function Object() { [native code] }

##### FeedbackProcessor.calculateDueDate (method)

期日の計算@param action アクション@param classified 分類されたフィードバック@returns 期日

**@constructor:** function Object() { [native code] }

##### FeedbackProcessor.assessImpact (method)

影響評価@param classified 分類されたフィードバック@returns 影響評価

**@constructor:** function Object() { [native code] }

##### FeedbackProcessor.generateSuggestedChanges (method)

提案される変更を生成@param classified 分類されたフィードバック@returns 提案される変更の配列

**@constructor:** function Object() { [native code] }

#### ClassifiedFeedback (interface)

フィードバックの分類

**@constructor:** function Object() { [native code] }

#### ActionItem (interface)

元のフィードバック */
originalFeedback: EditorFeedback;

/** カテゴリー */
categories: string[];

/** 感情分析結果 */
sentiment: {
score: number;
label: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
};

/** 優先度 */
priority: 'LOW' | 'MEDIUM' | 'HIGH';

/** 影響を受けるコンポーネント */
affectedComponents: string[];
}

/**アクションアイテム

**@constructor:** function Object() { [native code] }

#### FeedbackResult (interface)

タイトル */
title: string;

/** 説明 */
description: string;

/** 優先度 */
priority: 'LOW' | 'MEDIUM' | 'HIGH';

/** 担当者 */
assignee: string;

/** 期日 */
dueDate: Date;
}

/**フィードバック結果

**@constructor:** function Object() { [native code] }

#### EditorFeedback (interface)

確認フラグ */
acknowledged: boolean;

/** 分類結果 */
classification: ClassifiedFeedback;

/** アクションアイテム */
actionItems: ActionItem[];

/** 影響評価 */
impact: {
scope: string;
significance: number;
suggestedChanges: string[];
};
}

/**編集者フィードバック

**@constructor:** function Object() { [native code] }


---

### intent-recognizer.ts {#cnovel-automation-systemsrclibeditorintent-recognizerts}

**Path:** `C:/novel-automation-system/src/lib/editor/intent-recognizer.ts`

処理済みテキスト

**@constructor:** function Object() { [native code] }

#### IntentRecognizer (class)

自然言語からユーザーの意図を認識するクラス

**@constructor:** function Object() { [native code] }

#### Methods of IntentRecognizer

##### IntentRecognizer.initializeIntentPatterns (method)

インテントパターンの初期化

**@constructor:** function Object() { [native code] }

##### IntentRecognizer.recognizeIntent (method)

ユーザーの意図を認識@param input 自然言語入力@returns 認識された意図

**@constructor:** function Object() { [native code] }

##### IntentRecognizer.preprocessText (method)

テキストの前処理

**@constructor:** function Object() { [native code] }

##### IntentRecognizer.extractEntities (method)

エンティティ抽出

**@constructor:** function Object() { [native code] }

##### IntentRecognizer.patternMatching (method)

パターンマッチング

**@constructor:** function Object() { [native code] }

##### IntentRecognizer.calculateMatchScore (method)

マッチスコアの計算

**@constructor:** function Object() { [native code] }

##### IntentRecognizer.extractParams (method)

パラメータ抽出

**@constructor:** function Object() { [native code] }

##### IntentRecognizer.refineWithContext (method)

コンテキストによるマッチング結果の絞り込み

**@constructor:** function Object() { [native code] }

#### ProcessedText (interface)

処理済みテキスト

**@constructor:** function Object() { [native code] }

#### IntentPattern (interface)

インテントパターン

**@constructor:** function Object() { [native code] }

#### IntentMatch (interface)

インテントマッチ

**@constructor:** function Object() { [native code] }

#### RecognizedIntent (interface)

認識されたインテント

**@constructor:** function Object() { [native code] }


---

### intervention-system copy.ts {#cnovel-automation-systemsrclibeditorintervention-system-copyts}

**Path:** `C:/novel-automation-system/src/lib/editor/intervention-system copy.ts`

編集者の介入を処理するシステム

**@constructor:** function Object() { [native code] }

#### InterventionSystem (class)

編集者の介入を処理するシステム

**@constructor:** function Object() { [native code] }

#### Methods of InterventionSystem

##### InterventionSystem.execute (method)

介入を実行@param command 解釈されたコマンド@param context コンテキスト情報@returns 実行結果

**@constructor:** function Object() { [native code] }

##### InterventionSystem.getManagerForType (method)

コマンドタイプに基づいてマネージャーを取得

**@constructor:** function Object() { [native code] }

##### InterventionSystem.executeWithManager (method)

マネージャーを使用してコマンドを実行

**@constructor:** function Object() { [native code] }

#### ExecutionResult (interface)

介入を実行@param command 解釈されたコマンド@param context コンテキスト情報@returns 実行結果/
async execute(
command: InterpretedCommand,
context?: Record<string, any>
): Promise<ExecutionResult> {
// コマンドタイプに基づいて適切なマネージャーを選択
const manager = this.getManagerForType(command.type);

if (!manager) {
throw new Error(`No manager found for command type: ${command.type}`);
}

// コマンドを実行
const result = await this.executeWithManager(manager, command, context);

return {
success: true,
actions: result.actions,
affectedComponents: result.affectedComponents,
message: result.message
};
}

/**コマンドタイプに基づいてマネージャーを取得/
private getManagerForType(type: string): any {
switch (type) {
case 'CHARACTER':
return this.characterManager;
case 'PLOT':
return this.plotManager;
case 'SCENE':
return this.sceneManager;
case 'MEMORY':
return this.memoryManager;
case 'GENERATION':
return this.generationManager;
case 'SYSTEM':
return this.systemManager;
default:
return null;
}
}

/**マネージャーを使用してコマンドを実行/
private async executeWithManager(
manager: any,
command: InterpretedCommand,
context?: Record<string, any>
): Promise<any> {
// 実際の実装ではマネージャーの対応するメソッドを呼び出す
// ここではシミュレーション
return {
actions: [
{ type: command.action, description: `${command.action} operation performed` }
],
affectedComponents: [
{ component: command.type, impact: 'MODIFIED' }
],
message: `Successfully executed ${command.action} on ${command.type}`
};
}
}

/**実行結果

**@constructor:** function Object() { [native code] }


---

### intervention-system.ts {#cnovel-automation-systemsrclibeditorintervention-systemts}

**Path:** `C:/novel-automation-system/src/lib/editor/intervention-system.ts`

介入ハンドラインターフェース

**@constructor:** function Object() { [native code] }

#### InterventionSystem (class)

介入ID */
id: string;

/** タイムスタンプ */
timestamp: Date;

/** 介入リクエスト */
request: InterventionRequest;

/** 介入レスポンス */
response: InterventionResponse;

/** 適用コンテキスト */
context?: Record<string, any>;
}

/**編集者の介入を処理するシステム

**@constructor:** function Object() { [native code] }

#### Methods of InterventionSystem

##### InterventionSystem.executeIntervention (method)

介入を実行@param request 介入リクエスト@param context コンテキスト情報@returns 介入レスポンス

**@constructor:** function Object() { [native code] }

##### InterventionSystem.executeBatch (method)

コマンドをバッチ実行@param commands コマンドの配列@param context コンテキスト情報@returns 実行結果の配列

**@constructor:** function Object() { [native code] }

##### InterventionSystem.registerHandler (method)

カスタムハンドラを登録@param handler 介入ハンドラ

**@constructor:** function Object() { [native code] }

##### InterventionSystem.getInterventionHistory (method)

介入履歴を取得@param limit 取得数@param types フィルタするタイプ@returns 介入履歴

**@constructor:** function Object() { [native code] }

##### InterventionSystem.evaluateImpact (method)

介入の影響を評価@param recordId 介入記録ID@returns 影響評価

**@constructor:** function Object() { [native code] }

##### InterventionSystem.registerDefaultHandlers (method)

デフォルトハンドラを登録

**@constructor:** function Object() { [native code] }

##### InterventionSystem.interpretCommand (method)

コマンドを解釈@param command 自然言語コマンド@param type 介入タイプ@param parameters 追加パラメータ@returns 解釈されたコマンド

**@constructor:** function Object() { [native code] }

##### InterventionSystem.getHandlerForCommand (method)

コマンドに適したハンドラを取得@param command 解釈されたコマンド@returns 介入ハンドラ

**@constructor:** function Object() { [native code] }

##### InterventionSystem.generateSuggestions (method)

提案を生成@param command 解釈されたコマンド@param result ハンドラレスポンス@returns 提案の配列

**@constructor:** function Object() { [native code] }

##### InterventionSystem.createErrorResponse (method)

エラーレスポンスを作成@param message エラーメッセージ@returns エラーレスポンス

**@constructor:** function Object() { [native code] }

##### InterventionSystem.recordIntervention (method)

介入を履歴に記録@param request 介入リクエスト@param response 介入レスポンス@param context コンテキスト

**@constructor:** function Object() { [native code] }

#### InterventionHandler (interface)

介入ハンドラインターフェース

**@constructor:** function Object() { [native code] }

#### HandlerResponse (interface)

ハンドラ名 */
name: string;

/** サポートするインテント */
supportedIntents: string[];

/** 介入実行 */
execute(command: InterpretedCommand, context?: Record<string, any>): Promise<HandlerResponse>;
}

/**ハンドラレスポンス

**@constructor:** function Object() { [native code] }

#### InterventionRecord (interface)

成功フラグ */
success: boolean;

/** 実行されたアクション */
actions: { type: string; description: string }[];

/** 影響を受けたコンポーネント */
affectedComponents: { component: string; impact: string }[];

/** 応答メッセージ */
message: string;

/** デバッグ情報 */
debug?: Record<string, any>;
}

/**介入記録

**@constructor:** function Object() { [native code] }


---

### learning-engine.ts {#cnovel-automation-systemsrclibeditorlearning-enginets}

**Path:** `C:/novel-automation-system/src/lib/editor/learning-engine.ts`

パターン認識結果

**@constructor:** function Object() { [native code] }

#### LearningEngine (class)

パターン */
patterns: RecognizedPattern[];

/** トレンド */
trends: {
category: string;
direction: 'INCREASING' | 'STABLE' | 'DECREASING';
significance: number;
}[];

/** 相関関係 */
correlations: {
source: string;
target: string;
strength: number;
}[];

/** 推奨事項 */
recommendations: {
target: string;
action: string;
benefit: string;
}[];
}

/**フィードバックからの学習エンジン

**@constructor:** function Object() { [native code] }

#### Methods of LearningEngine

##### LearningEngine.incorporateFeedback (method)

フィードバックを学習に取り込む@param feedback 分類されたフィードバック

**@constructor:** function Object() { [native code] }

##### LearningEngine.learnFromHistory (method)

履歴からの学習

**@constructor:** function Object() { [native code] }

##### LearningEngine.findMatchingPatterns (method)

既存パターンとの照合@param patterns 認識されたパターン@returns マッチするパターンの配列

**@constructor:** function Object() { [native code] }

##### LearningEngine.registerNewPatterns (method)

新規パターンの登録@param patterns 新規パターン

**@constructor:** function Object() { [native code] }

##### LearningEngine.getFeedbackHistory (method)

フィードバック履歴の取得

**@constructor:** function Object() { [native code] }

##### LearningEngine.extractInsights (method)

インサイトの抽出@param history 履歴データ@returns 学習インサイト

**@constructor:** function Object() { [native code] }

##### LearningEngine.identifyTrends (method)

トレンドの特定@param patterns パターン@returns トレンド

**@constructor:** function Object() { [native code] }

##### LearningEngine.findCorrelations (method)

相関関係の検出@param patterns パターン@returns 相関関係

**@constructor:** function Object() { [native code] }

##### LearningEngine.generateRecommendations (method)

推奨事項の生成@param patterns パターン@param trends トレンド@returns 推奨事項

**@constructor:** function Object() { [native code] }

##### LearningEngine.generateImprovements (method)

改善点の生成@param insights インサイト@returns 改善点

**@constructor:** function Object() { [native code] }

##### LearningEngine.predictFutureIssues (method)

将来問題の予測@param insights インサイト@returns 予測

**@constructor:** function Object() { [native code] }

#### PatternRecognizer (class)

フィードバックを学習に取り込む@param feedback 分類されたフィードバック/
async incorporateFeedback(feedback: ClassifiedFeedback): Promise<void> {
console.log(`Incorporating feedback for learning: ${feedback.originalFeedback.type}`);

// パターン認識
const patterns = await this.patternRecognizer.analyze(feedback);

// 既存パターンとの照合
const matchingPatterns = await this.findMatchingPatterns(patterns);

// 新規パターンの登録
const newPatterns = patterns.filter(p => !matchingPatterns.includes(p));
await this.registerNewPatterns(newPatterns);

// 適応ルールの更新
await this.adaptationEngine.updateRules(patterns, feedback);

console.log(`Learning complete: ${patterns.length} patterns identified, ${newPatterns.length} new patterns registered`);
}

/**履歴からの学習/
async learnFromHistory(): Promise<LearningResult> {
console.log('Learning from feedback history');

// 履歴データを取得
const history = await this.getFeedbackHistory();

// インサイトを抽出
const insights = await this.extractInsights(history);

return {
patterns: insights.patterns,
improvements: await this.generateImprovements(insights),
predictions: await this.predictFutureIssues(insights),
};
}

/**既存パターンとの照合@param patterns 認識されたパターン@returns マッチするパターンの配列/
private async findMatchingPatterns(patterns: RecognizedPattern[]): Promise<RecognizedPattern[]> {
// 実際の実装ではデータベースからパターンを検索
return [];
}

/**新規パターンの登録@param patterns 新規パターン/
private async registerNewPatterns(patterns: RecognizedPattern[]): Promise<void> {
// 実際の実装ではデータベースにパターンを保存
console.log(`Registered ${patterns.length} new learning patterns`);
}

/**フィードバック履歴の取得/
private async getFeedbackHistory(): Promise<any[]> {
// 実際の実装ではデータベースからフィードバック履歴を取得
return [];
}

/**インサイトの抽出@param history 履歴データ@returns 学習インサイト/
private async extractInsights(history: any[]): Promise<LearningInsights> {
// 履歴からパターンを分析
const patterns = await this.patternRecognizer.analyzeHistory(history);

// トレンドの特定
const trends = this.identifyTrends(patterns);

// 相関関係の検出
const correlations = this.findCorrelations(patterns);

// 推奨事項の生成
const recommendations = this.generateRecommendations(patterns, trends);

return {
patterns,
trends,
correlations,
recommendations
};
}

/**トレンドの特定@param patterns パターン@returns トレンド/
private identifyTrends(patterns: RecognizedPattern[]): any[] {
// 実際の実装ではパターンの時系列分析からトレンドを抽出
return [];
}

/**相関関係の検出@param patterns パターン@returns 相関関係/
private findCorrelations(patterns: RecognizedPattern[]): any[] {
// 実際の実装ではパターン間の相関関係を分析
return [];
}

/**推奨事項の生成@param patterns パターン@param trends トレンド@returns 推奨事項/
private generateRecommendations(patterns: RecognizedPattern[], trends: any[]): any[] {
// 実際の実装ではパターンとトレンドに基づく推奨事項を生成
return [];
}

/**改善点の生成@param insights インサイト@returns 改善点/
private async generateImprovements(insights: LearningInsights): Promise<any[]> {
// 実際の実装ではインサイトに基づく改善点を生成
return [];
}

/**将来問題の予測@param insights インサイト@returns 予測/
private async predictFutureIssues(insights: LearningInsights): Promise<any[]> {
// 実際の実装ではインサイトに基づく将来問題を予測
return [];
}
}

/**パターン認識クラス

**@constructor:** function Object() { [native code] }

#### Methods of PatternRecognizer

##### PatternRecognizer.analyze (method)

フィードバックを分析@param feedback 分類されたフィードバック@returns 認識されたパターン

**@constructor:** function Object() { [native code] }

##### PatternRecognizer.analyzeHistory (method)

履歴を分析@param history 履歴データ@returns 認識されたパターン

**@constructor:** function Object() { [native code] }

##### PatternRecognizer.analyzeContent (method)

内容分析@param feedback 分類されたフィードバック@returns 認識されたパターン

**@constructor:** function Object() { [native code] }

##### PatternRecognizer.analyzeCategories (method)

カテゴリー分析@param feedback 分類されたフィードバック@returns 認識されたパターン

**@constructor:** function Object() { [native code] }

##### PatternRecognizer.analyzeSentiment (method)

感情分析@param feedback 分類されたフィードバック@returns 認識されたパターン

**@constructor:** function Object() { [native code] }

#### AdaptationEngine (class)

フィードバックを分析@param feedback 分類されたフィードバック@returns 認識されたパターン/
async analyze(feedback: ClassifiedFeedback): Promise<RecognizedPattern[]> {
const patterns: RecognizedPattern[] = [];

// 内容に基づくパターン認識
const contentPatterns = this.analyzeContent(feedback);
patterns.push(...contentPatterns);

// カテゴリーに基づくパターン認識
const categoryPatterns = this.analyzeCategories(feedback);
patterns.push(...categoryPatterns);

// 感情に基づくパターン認識
const sentimentPatterns = this.analyzeSentiment(feedback);
patterns.push(...sentimentPatterns);

return patterns;
}

/**履歴を分析@param history 履歴データ@returns 認識されたパターン/
async analyzeHistory(history: any[]): Promise<RecognizedPattern[]> {
// 実際の実装では履歴全体のパターンを分析
return [];
}

/**内容分析@param feedback 分類されたフィードバック@returns 認識されたパターン/
private analyzeContent(feedback: ClassifiedFeedback): RecognizedPattern[] {
const patterns: RecognizedPattern[] = [];
const content = feedback.originalFeedback.content.toLowerCase();

// 特定のキーフレーズに基づくパターン認識
// 例: キャラクターの一貫性に関するパターン
if (content.includes('一貫性') || content.includes('ブレ') || content.includes('矛盾')) {
patterns.push({
type: 'CONSISTENCY_ISSUE',
description: 'キャラクターまたはプロットの一貫性に関する問題',
confidence: 0.8,
parameters: {
target: content.includes('キャラクター') ? 'CHARACTER' : 'PLOT'
}
});
}

// 例: 表現に関するパターン
if (content.includes('表現') || content.includes('文体') || content.includes('描写')) {
patterns.push({
type: 'EXPRESSION_ISSUE',
description: '表現方法に関する問題または提案',
confidence: 0.7,
parameters: {
aspect: content.includes('描写') ? 'DESCRIPTION' : 'STYLE'
}
});
}

return patterns;
}

/**カテゴリー分析@param feedback 分類されたフィードバック@returns 認識されたパターン/
private analyzeCategories(feedback: ClassifiedFeedback): RecognizedPattern[] {
const patterns: RecognizedPattern[] = [];

// カテゴリーの組み合わせに基づくパターン
const categories = feedback.categories;

// 例: 品質と一貫性の両方に関するパターン
if (categories.includes('QUALITY') && categories.includes('CONSISTENCY')) {
patterns.push({
type: 'QUALITY_CONSISTENCY_CORRELATION',
description: '品質問題と一貫性問題の相関',
confidence: 0.75,
parameters: {
priority: feedback.priority
}
});
}

// 例: キャラクターとプロットの両方に関するパターン
if (categories.includes('CHARACTER') && categories.includes('PLOT')) {
patterns.push({
type: 'CHARACTER_PLOT_INTERACTION',
description: 'キャラクターとプロットの相互作用に関する問題',
confidence: 0.8,
parameters: {
priority: feedback.priority
}
});
}

return patterns;
}

/**感情分析@param feedback 分類されたフィードバック@returns 認識されたパターン/
private analyzeSentiment(feedback: ClassifiedFeedback): RecognizedPattern[] {
const patterns: RecognizedPattern[] = [];
const sentiment = feedback.sentiment;

// 感情とカテゴリーの組み合わせに基づくパターン
if (sentiment.label === 'NEGATIVE' && feedback.priority === 'HIGH') {
patterns.push({
type: 'HIGH_PRIORITY_NEGATIVE_FEEDBACK',
description: '高優先度の否定的フィードバック',
confidence: 0.9,
parameters: {
sentiment: sentiment.score,
categories: feedback.categories
}
});
}

return patterns;
}
}

/**適応エンジン

**@constructor:** function Object() { [native code] }

#### Methods of AdaptationEngine

##### AdaptationEngine.updateRules (method)

ルールを更新@param patterns 認識されたパターン@param feedback 分類されたフィードバック

**@constructor:** function Object() { [native code] }

##### AdaptationEngine.updateRuleForPattern (method)

パターンに対するルール更新@param pattern 認識されたパターン@param feedback 分類されたフィードバック

**@constructor:** function Object() { [native code] }

##### AdaptationEngine.updateConsistencyRules (method)

一貫性ルールの更新@param pattern 認識されたパターン@param feedback 分類されたフィードバック

**@constructor:** function Object() { [native code] }

##### AdaptationEngine.updateExpressionRules (method)

表現ルールの更新@param pattern 認識されたパターン@param feedback 分類されたフィードバック

**@constructor:** function Object() { [native code] }

##### AdaptationEngine.updateQualityConsistencyRules (method)

品質一貫性ルールの更新@param pattern 認識されたパターン@param feedback 分類されたフィードバック

**@constructor:** function Object() { [native code] }

##### AdaptationEngine.updateCharacterPlotRules (method)

キャラクタープロットルールの更新@param pattern 認識されたパターン@param feedback 分類されたフィードバック

**@constructor:** function Object() { [native code] }

##### AdaptationEngine.updatePriorityRules (method)

優先度ルールの更新@param pattern 認識されたパターン@param feedback 分類されたフィードバック

**@constructor:** function Object() { [native code] }

#### RecognizedPattern (interface)

パターン認識結果

**@constructor:** function Object() { [native code] }

#### LearningResult (interface)

パターンタイプ */
type: string;

/** 説明 */
description: string;

/** 信頼度 */
confidence: number;

/** パラメータ */
parameters: Record<string, any>;
}

/**学習結果

**@constructor:** function Object() { [native code] }

#### LearningInsights (interface)

パターン */
patterns: RecognizedPattern[];

/** 改善点 */
improvements: {
component: string;
description: string;
priority: 'LOW' | 'MEDIUM' | 'HIGH';
}[];

/** 将来予測 */
predictions: {
issue: string;
probability: number;
prevention: string;
}[];
}

/**学習インサイト

**@constructor:** function Object() { [native code] }


---

### semantic-merger.ts {#cnovel-automation-systemsrclibeditorsemantic-mergerts}

**Path:** `C:/novel-automation-system/src/lib/editor/semantic-merger.ts`

マージ優先度

**@constructor:** function Object() { [native code] }

#### SemanticMerger (class)

マージされたテキスト */
mergedText: string;

/** マージで発生した競合 */
conflicts: {
mine: string;
theirs: string;
resolution: string;
position: number;
}[];

/** 自動解決された数 */
autoResolved: number;

/** 手動解決が必要だった数 */
manuallyResolved: number;
}

/**意味論的マージャー小説の文脈を理解し、より智能的なマージを行う

**@constructor:** function Object() { [native code] }

#### Methods of SemanticMerger

##### SemanticMerger.merge (method)

3つのテキストをマージ@param base 基本テキスト（共通の祖先）@param mine 自分の変更@param theirs 相手の変更@param context 小説コンテキスト（オプション）@param priority マージ優先度（オプション、デフォルトはSMART）@returns マージ結果

**@constructor:** function Object() { [native code] }

##### SemanticMerger.simpleThreeWayMerge (method)

3方向マージ（行ベース）パラグラフや行単位のマージに適したシンプルな実装@param base 基本テキスト@param mine 自分の変更@param theirs 相手の変更@returns マージ結果

**@constructor:** function Object() { [native code] }

##### SemanticMerger.chunkDiffs (method)

差分をチャンク化するパラグラフやシーンなどの意味のある単位でチャンク化@param diffs 差分配列@param baseText 基本テキスト@returns チャンク化された差分

**@constructor:** function Object() { [native code] }

##### SemanticMerger.mergeChunks (method)

チャンク化された差分をマージ@param base 基本テキスト@param mineChunks 自分の差分チャンク@param theirChunks 相手の差分チャンク@param context 小説コンテキスト@param priority マージ優先度@returns マージ結果

**@constructor:** function Object() { [native code] }

##### SemanticMerger.applyDiffs (method)

差分を適用してテキストを再構築@param baseText 基本テキスト@param diffs 差分配列@returns 再構築されたテキスト

**@constructor:** function Object() { [native code] }

##### SemanticMerger.mapDiffsToPositions (method)

差分ベースの位置をベーステキストの位置にマッピング@param baseText 基本テキスト@param diffs 差分配列@returns 位置マップ

**@constructor:** function Object() { [native code] }

##### SemanticMerger.findChunkStartPosition (method)

チャンクの開始位置を見つける@param baseText 基本テキスト@param chunk 差分チャンク@param startPos 探索開始位置@returns 開始位置

**@constructor:** function Object() { [native code] }

##### SemanticMerger.findChunkEndPosition (method)

チャンクの終了位置を見つける@param baseText 基本テキスト@param chunk 差分チャンク@param startPos 探索開始位置@returns 終了位置

**@constructor:** function Object() { [native code] }

##### SemanticMerger.findCorrespondingChunk (method)

対応するチャンクを見つける@param baseText 基本テキスト@param chunks チャンク配列@param startPos 開始位置@param endPos 終了位置@returns 対応するチャンク

**@constructor:** function Object() { [native code] }

##### SemanticMerger.mergeTextChunk (method)

テキストチャンクをマージ@param baseText 基本テキスト@param mineText 自分のテキスト@param theirText 相手のテキスト@param context 小説コンテキスト@param priority マージ優先度@returns マージ結果

**@constructor:** function Object() { [native code] }

##### SemanticMerger.attemptSemanticMerge (method)

意味論的なマージを試みる@param baseText 基本テキスト@param mineText 自分のテキスト@param theirText 相手のテキスト@param context 小説コンテキスト@returns マージ結果

**@constructor:** function Object() { [native code] }

##### SemanticMerger.getCharacterFocus (method)

テキストのキャラクターフォーカスを取得@param text テキスト@param characterNames キャラクター名リスト@returns フォーカスされているキャラクター名

**@constructor:** function Object() { [native code] }

##### SemanticMerger.countKeyEvents (method)

キーイベントの出現回数をカウント@param text テキスト@param keyEvents キーイベントリスト@returns カウント

**@constructor:** function Object() { [native code] }

##### SemanticMerger.analyzeTextStructure (method)

テキストの構造を分析@param text テキスト@returns 構造分析結果

**@constructor:** function Object() { [native code] }

#### MergePriority (enum)

マージ優先度

**@constructor:** function Object() { [native code] }

#### NovelContext (interface)

マージコンテキスト - 小説固有の情報

**@constructor:** function Object() { [native code] }

#### MergeResult (interface)

マージ結果

**@constructor:** function Object() { [native code] }


---

### storage-adapter.ts {#cnovel-automation-systemsrclibeditorstorage-adapterts}

**Path:** `C:/novel-automation-system/src/lib/editor/storage-adapter.ts`

協調編集のためのストレージパス設定

**@constructor:** function Object() { [native code] }

#### EditorStorageAdapter (class)

GitHubストレージと協調編集を接続するアダプターこのクラスは協調編集と永続化層の橋渡しをする

**@constructor:** function Object() { [native code] }

#### Methods of EditorStorageAdapter

##### EditorStorageAdapter.constructor (method)

エディタストレージアダプターを初期化@param storage ストレージプロバイダー@param paths カスタムパス設定（オプション）

**@constructor:** function Object() { [native code] }

##### EditorStorageAdapter.loadDocument (method)

ドキュメントを読み込む@param documentId ドキュメントID@returns ドキュメント（存在しない場合はnull）

**@constructor:** function Object() { [native code] }

##### EditorStorageAdapter.saveDocument (method)

ドキュメントを保存@param document ドキュメント@returns 成功フラグ

**@constructor:** function Object() { [native code] }

##### EditorStorageAdapter.saveRevision (method)

ドキュメントリビジョンを保存@param document ドキュメント@param revisionId リビジョンID（オプション、省略時は自動生成）@returns 成功フラグ

**@constructor:** function Object() { [native code] }

##### EditorStorageAdapter.loadRevision (method)

リビジョンを読み込む@param documentId ドキュメントID@param version バージョン番号@returns ドキュメント（存在しない場合はnull）

**@constructor:** function Object() { [native code] }

##### EditorStorageAdapter.listRevisions (method)

ドキュメントのリビジョン一覧を取得@param documentId ドキュメントID@returns リビジョン情報の配列

**@constructor:** function Object() { [native code] }

##### EditorStorageAdapter.saveSession (method)

セッション情報を保存@param sessionId セッションID@param sessionData セッションデータ@returns 成功フラグ

**@constructor:** function Object() { [native code] }

##### EditorStorageAdapter.loadSession (method)

セッション情報を読み込む@param sessionId セッションID@returns セッションデータ（存在しない場合はnull）

**@constructor:** function Object() { [native code] }

##### EditorStorageAdapter.deleteSession (method)

セッションを削除@param sessionId セッションID@returns 成功フラグ

**@constructor:** function Object() { [native code] }

##### EditorStorageAdapter.addSessionToDocument (method)

ドキュメントに関連するセッションを追加@param documentId ドキュメントID@param sessionId セッションID

**@constructor:** function Object() { [native code] }

##### EditorStorageAdapter.removeSessionFromDocument (method)

ドキュメントに関連するセッションを削除@param documentId ドキュメントID@param sessionId セッションID

**@constructor:** function Object() { [native code] }

##### EditorStorageAdapter.getDocumentSessions (method)

ドキュメントに関連するセッション一覧を取得@param documentId ドキュメントID@returns セッションID配列

**@constructor:** function Object() { [native code] }

##### EditorStorageAdapter.clearCache (method)

キャッシュをクリア

**@constructor:** function Object() { [native code] }

##### EditorStorageAdapter.invalidateDocumentCache (method)

特定のドキュメントのキャッシュをクリア@param documentId ドキュメントID

**@constructor:** function Object() { [native code] }

#### CollaborationStoragePaths (interface)

協調編集のためのストレージパス設定

**@constructor:** function Object() { [native code] }

#### DEFAULT_STORAGE_PATHS (variable)

ドキュメント本体のパス形式 */
documentPath: (documentId: string) => string;

/** リビジョンのパス形式 */
revisionPath: (documentId: string, version: number) => string;

/** セッション情報のパス形式 */
sessionPath: (sessionId: string) => string;

/** ドキュメントのセッション一覧パス形式 */
documentSessionsPath: (documentId: string) => string;
}

/**デフォルトのストレージパス設定

**@constructor:** function Object() { [native code] }


---

### version-control.ts {#cnovel-automation-systemsrclibeditorversion-controlts}

**Path:** `C:/novel-automation-system/src/lib/editor/version-control.ts`

変更履歴

**@constructor:** function Object() { [native code] }

#### VersionControl (class)

リビジョンID */
revisionId: string;

/** ドキュメント */
document: Document;

/** 関連変更履歴ID */
changeHistoryId: string;

/** リビジョンメタデータ */
metadata?: Record<string, any>;
}

/**バージョン管理クラスドキュメントの変更履歴を管理

**@constructor:** function Object() { [native code] }

#### Methods of VersionControl

##### VersionControl.constructor (method)

バージョン管理システムを初期化@param storage ストレージアダプター

**@constructor:** function Object() { [native code] }

##### VersionControl.recordChange (method)

変更を記録@param session エディタセッション@param edit 編集操作

**@constructor:** function Object() { [native code] }

##### VersionControl.recordChanges (method)

複数の変更を記録@param session エディタセッション@param edits 編集操作の配列

**@constructor:** function Object() { [native code] }

##### VersionControl.saveChanges (method)

変更を保存@param document ドキュメント@param changes 変更の配列

**@constructor:** function Object() { [native code] }

##### VersionControl.getLatestVersion (method)

最新バージョンを取得@param documentId ドキュメントID@returns 最新のドキュメント

**@constructor:** function Object() { [native code] }

##### VersionControl.getVersion (method)

特定バージョンを取得@param documentId ドキュメントID@param version バージョン番号@returns 指定バージョンのドキュメント

**@constructor:** function Object() { [native code] }

##### VersionControl.getHistory (method)

変更履歴を取得@param documentId ドキュメントID@returns 変更履歴の配列

**@constructor:** function Object() { [native code] }

##### VersionControl.getRevisionHistory (method)

リビジョン履歴を取得@param documentId ドキュメントID@returns リビジョン履歴

**@constructor:** function Object() { [native code] }

##### VersionControl.revertToVersion (method)

特定のバージョンに戻す@param documentId ドキュメントID@param version バージョン番号@returns 成功フラグ

**@constructor:** function Object() { [native code] }

##### VersionControl.setCommitMessage (method)

コミットメッセージを設定@param documentId ドキュメントID@param version バージョン番号@param message コミットメッセージ@returns 成功フラグ

**@constructor:** function Object() { [native code] }

##### VersionControl.getDiff (method)

バージョン間の差分を取得@param documentId ドキュメントID@param fromVersion 開始バージョン@param toVersion 終了バージョン@returns 差分情報

**@constructor:** function Object() { [native code] }

##### VersionControl.getVersionInfo (method)

バージョン情報を取得@param documentId ドキュメントID@returns バージョン情報

**@constructor:** function Object() { [native code] }

##### VersionControl.getBufferedChanges (method)

バッファされた変更を取得@param documentId ドキュメントID@returns 変更の配列

**@constructor:** function Object() { [native code] }

##### VersionControl.clearCache (method)

メモリキャッシュをクリア

**@constructor:** function Object() { [native code] }

##### VersionControl.invalidateDocumentCache (method)

ドキュメントキャッシュを無効化@param documentId ドキュメントID

**@constructor:** function Object() { [native code] }

#### ChangeHistory (interface)

変更履歴

**@constructor:** function Object() { [native code] }

#### DocumentRevision (interface)

履歴ID */
id: string;

/** ドキュメントID */
documentId: string;

/** 変更バージョン */
version: number;

/** 変更操作 */
changes: EditorEdit[];

/** 編集者ID */
editorId: string;

/** 変更日時 */
timestamp: Date;

/** コミットメッセージ */
message?: string;

/** メタデータ */
metadata?: Record<string, any>;
}

/**変更ドキュメント

**@constructor:** function Object() { [native code] }


---

### auto-generator.ts {#cnovel-automation-systemsrclibforeshadowingauto-generatorts}

**Path:** `C:/novel-automation-system/src/lib/foreshadowing/auto-generator.ts`

@fileoverview 伏線自動生成モジュール@description物語創作支援システムにおける伏線の自動生成機能を提供するモジュールです。AI (Gemini)を活用して物語のコンテキストから自然な伏線を生成し、検証し、メモリシステムに保存する機能を実装しています。@role- 物語コンテキストからの伏線の自動生成- 生成された伏線の検証と整形- 伏線の保存と重複管理- AIを活用した創造的コンテンツ生成@dependencies- @/lib/generation/gemini-client - Gemini APIを使用したテキスト生成クライアント- @/lib/memory/manager - メモリ管理システム（伏線の保存先）- @/lib/utils/logger - ログ出力機能- @/lib/utils/error-handler - エラーハンドリング機能@types- @/types/memory - Foreshadowing型など、メモリ関連の型定義@flow1. 物語コンテキストとパラメータ受け取り2. プロンプト生成とAI (Gemini)による伏線生成3. レスポンスのパースとJSON形式の抽出4. 生成されたデータの検証と整形5. メモリシステムへの保存（重複チェック含む）

**@constructor:** function Object() { [native code] }

#### ForeshadowingAutoGenerator (class)

@fileoverview 伏線自動生成モジュール@description物語創作支援システムにおける伏線の自動生成機能を提供するモジュールです。AI (Gemini)を活用して物語のコンテキストから自然な伏線を生成し、検証し、メモリシステムに保存する機能を実装しています。@role- 物語コンテキストからの伏線の自動生成- 生成された伏線の検証と整形- 伏線の保存と重複管理- AIを活用した創造的コンテンツ生成@dependencies- @/lib/generation/gemini-client - Gemini APIを使用したテキスト生成クライアント- @/lib/memory/manager - メモリ管理システム（伏線の保存先）- @/lib/utils/logger - ログ出力機能- @/lib/utils/error-handler - エラーハンドリング機能@types- @/types/memory - Foreshadowing型など、メモリ関連の型定義@flow1. 物語コンテキストとパラメータ受け取り2. プロンプト生成とAI (Gemini)による伏線生成3. レスポンスのパースとJSON形式の抽出4. 生成されたデータの検証と整形5. メモリシステムへの保存（重複チェック含む）/

import { GeminiClient } from '@/lib/generation/gemini-client';
import { memoryManager } from '@/lib/memory/manager';
import { Foreshadowing } from '@/types/memory';
import { logger } from '@/lib/utils/logger';
import { logError } from '@/lib/utils/error-handler';

/**@class ForeshadowingAutoGenerator@description物語の伏線を自動生成するクラス。Google Gemini APIを使用して物語のコンテキストから自然な伏線を生成し、検証して、メモリシステムに保存する機能を提供します。@role- AI (Gemini)を活用した伏線の自動生成- 生成された伏線データの検証と整形- メモリシステムとの連携による伏線の保存- 重複伏線の検出と管理@used-by- このクラスを使用するモジュールは明示的にコードから確認できません@depends-on- GeminiClient - AIテキスト生成サービス- memoryManager - 階層的記憶管理システム- logger - ログ出力サービス- logError - エラーハンドリングユーティリティ@lifecycle1. コンストラクタでGeminiClientの初期化2. generateForeshadowing()による伏線の生成3. validateGeneratedForeshadowing()による検証4. generateAndSaveForeshadowing()による保存@example-flow呼び出し元 → generateAndSaveForeshadowing() →   memoryManager初期化確認 →  generateForeshadowing() →  Gemini APIによる伏線生成 →  伏線検証と整形 →  重複チェック →  LongTermMemoryへの保存

**@constructor:** function Object() { [native code] }

#### Methods of ForeshadowingAutoGenerator

##### ForeshadowingAutoGenerator.constructor (method)

ForeshadowingAutoGeneratorクラスを初期化しますGeminiClientのインスタンスを作成します。@constructor@usage// 基本的な初期化const generator = new ForeshadowingAutoGenerator();@call-flow1. GeminiClientのインスタンス作成@initializationこのコンストラクタは特別なパラメータを必要としません。GeminiClientを新規に作成します。

**@constructor:** function Object() { [native code] }

##### ForeshadowingAutoGenerator.generateForeshadowing (method)

コンテキストに基づいて伏線を自動生成します提供された物語コンテキストからAI（Gemini）を使用して伏線を生成し、検証した結果を返します。@async@param {string} context - 物語の現在のコンテキスト@param {number} currentChapter - 現在のチャプター番号@param {number} [count=3] - 生成する伏線の数@returns {Promise<Foreshadowing[]>} 生成された伏線の配列@throws {Error} 伏線生成に失敗した場合や、AIレスポンスのパースに失敗した場合@usage// 基本的な使用方法const foreshadowings = await generator.generateForeshadowing(  "物語のこれまでの内容...",  5, // 現在のチャプター  3  // 生成する伏線の数);@call-context- 同期/非同期: 非同期メソッド（await必須）@call-flow1. ログ出力（開始）2. 伏線生成用プロンプトの作成3. GeminiClientによるテキスト生成4. 正規表現によるJSON部分の抽出5. JSONパース6. 生成された伏線の検証7. ログ出力（完了）8. 検証済み伏線の返却@external-dependencies- GeminiClient - AIテキスト生成@helper-methods- validateGeneratedForeshadowing - 生成された伏線の検証@error-handling- AIレスポンスパース失敗時にはエラーログを出力し、エラーをスロー- その他のエラーもログに記録し、再スロー@performance-considerations- コンテキストは4000文字に制限されており、長文の場合は切り詰められます- 生成する伏線数が多いほど処理時間が長くなります

**@constructor:** function Object() { [native code] }

##### ForeshadowingAutoGenerator.validateGeneratedForeshadowing (method)

生成された伏線をバリデーションしますAIによって生成された伏線データを検証し、必要な形式に整形します。必須フィールドの存在確認、値の検証、IDの生成などを行います。@private@param {any[]} foreshadowing - 生成された伏線データの配列@param {number} currentChapter - 現在のチャプター番号@returns {Foreshadowing[]} 検証・整形された伏線データの配列@call-flow1. 必須フィールドを持つアイテムのみをフィルタリング2. 各アイテムの検証と整形   - ユニークIDの生成   - 各フィールドの検証と修正   - オプションフィールドの追加3. 検証済みアイテムの配列を返却@helper-methods- validateUrgency - 優先度の検証

**@constructor:** function Object() { [native code] }

##### ForeshadowingAutoGenerator.validateUrgency (method)

urgencyの値を検証します伏線の優先度（urgency）値を検証し、有効な値であるかを確認します。無効な場合はデフォルト値を返します。@private@param {any} urgency - 検証する優先度の値@returns {string} 検証済みの優先度（'low', 'medium', 'high', 'critical'のいずれか）@call-flow1. 有効な優先度値のリスト定義2. 入力値の型と値の検証3. 有効な場合はその値を返却、無効な場合はデフォルト値を返却

**@constructor:** function Object() { [native code] }

##### ForeshadowingAutoGenerator.generateAndSaveForeshadowing (method)

伏線を生成して保存します物語コンテキストから伏線を生成し、重複をチェックした上でメモリシステムに保存します。@async@param {string} context - 物語の現在のコンテキスト@param {number} currentChapter - 現在のチャプター番号@param {number} [count=3] - 生成する伏線の数@returns {Promise<number>} 保存された伏線の数@throws {Error} 伏線の生成または保存に失敗した場合@usage// 基本的な使用方法const savedCount = await generator.generateAndSaveForeshadowing(  "物語のこれまでの内容...",  5, // 現在のチャプター  3  // 生成する伏線の数);console.log(`${savedCount}件の伏線を保存しました`);@call-context- 同期/非同期: 非同期メソッド（await必須）@call-flow1. memoryManagerの初期化確認（必要に応じて初期化）2. generateForeshadowingによる伏線生成3. 生成された各伏線に対して:   - 重複チェック   - 重複がなければ保存   - エラー発生時のログ記録（個別エラーは続行）4. 保存件数の返却@external-dependencies- memoryManager - 記憶管理システム@helper-methods- generateForeshadowing - 伏線の生成@error-handling- 個別の保存エラーはログに記録し、処理を続行- 全体的なエラーはログに記録し、エラーをスロー

**@constructor:** function Object() { [native code] }


---

### engine.ts {#cnovel-automation-systemsrclibforeshadowingenginets}

**Path:** `C:/novel-automation-system/src/lib/foreshadowing/engine.ts`

@fileoverview 伏線生成エンジン@description物語創作支援システムにおける伏線の生成と管理を担当するモジュールです。AIを活用して物語の文脈から自然な伏線を生成し、管理、追跡する機能を提供します。チャプター内容から新しい伏線を生成し、古い伏線の検出、解決すべき伏線の提案などの機能を実装しています。@role- 物語文脈からのAIを活用した伏線生成- 生成された伏線データの解析と整形- 伏線の保存と取得- 未解決の伏線管理と解決提案- 古い伏線（長期未解決）の検出@dependencies- @/types/memory - 伏線関連の型定義（Foreshadowing型）- @/lib/generation/gemini-client - Google Gemini APIによるテキスト生成- @/lib/memory - 階層的記憶管理システム（伏線の保存先）- @/lib/utils/logger - ログ出力機能- @/lib/utils/error-handler - エラーハンドリング機能@flow1. チャプター内容の受け取り2. AIによる伏線の生成3. レスポンスの解析と構造化4. 記憶システムへの伏線の保存5. 古い伏線の検出と解決推奨

**@constructor:** function Object() { [native code] }

#### ForeshadowingEngine (class)

@fileoverview 伏線生成エンジン@description物語創作支援システムにおける伏線の生成と管理を担当するモジュールです。AIを活用して物語の文脈から自然な伏線を生成し、管理、追跡する機能を提供します。チャプター内容から新しい伏線を生成し、古い伏線の検出、解決すべき伏線の提案などの機能を実装しています。@role- 物語文脈からのAIを活用した伏線生成- 生成された伏線データの解析と整形- 伏線の保存と取得- 未解決の伏線管理と解決提案- 古い伏線（長期未解決）の検出@dependencies- @/types/memory - 伏線関連の型定義（Foreshadowing型）- @/lib/generation/gemini-client - Google Gemini APIによるテキスト生成- @/lib/memory - 階層的記憶管理システム（伏線の保存先）- @/lib/utils/logger - ログ出力機能- @/lib/utils/error-handler - エラーハンドリング機能@flow1. チャプター内容の受け取り2. AIによる伏線の生成3. レスポンスの解析と構造化4. 記憶システムへの伏線の保存5. 古い伏線の検出と解決推奨/

import { Foreshadowing } from '@/types/memory';
import { GeminiClient } from '@/lib/generation/gemini-client';
import { memoryManager } from '@/lib/memory';
import { logger } from '@/lib/utils/logger';
import { logError } from '@/lib/utils/error-handler';

/**@class ForeshadowingEngine@description物語文脈から伏線の生成と管理を担当するクラス。Google Gemini AIを活用して物語のコンテキストから伏線を生成し、生成された伏線の管理、保存、解決提案などの機能を提供します。@role- AIを活用した伏線の自動生成機能の提供- 生成された伏線データの検証と整形- 記憶管理システムとの連携による伏線の保存と取得- 古い伏線の検出と管理- 解決すべき伏線の提案機能@depends-on- GeminiClient - AIテキスト生成サービス- memoryManager - 階層的記憶管理システム- logger - ログ出力サービス- logError - エラーハンドリングユーティリティ@lifecycle1. コンストラクタでのGeminiClientの初期化2. generateForeshadowing()による伏線の生成3. parseForeshadowingResponse()による構造化4. saveForeshadowing()による保存5. 必要に応じたcheckStaleForeshadowing()による古い伏線の検出6. suggestForeshadowingsToResolve()による解決提案@example-flowアプリケーション → processChapterAndGenerateForeshadowing() →   generateForeshadowing() →  Gemini APIによる伏線生成 →  parseForeshadowingResponse() →  saveForeshadowing() →  memoryManagerへの保存

**@constructor:** function Object() { [native code] }

#### Methods of ForeshadowingEngine

##### ForeshadowingEngine.constructor (method)

ForeshadowingEngineクラスを初期化しますGeminiClientのインスタンスを作成します。@constructor@usage// 基本的な初期化const engine = new ForeshadowingEngine();@call-flowGeminiClientのインスタンスを作成します。

**@constructor:** function Object() { [native code] }

##### ForeshadowingEngine.generateForeshadowing (method)

チャプター内容から新しい伏線を生成しますチャプターの内容を分析し、AIを使用して将来的に回収できる伏線を指定された数だけ生成します。@async@param {string} chapterContent チャプター内容@param {number} chapterNumber チャプター番号@param {number} [count=2] 生成する伏線の数@returns {Promise<Foreshadowing[]>} 生成された伏線の配列@usageconst foreshadowingItems = await engine.generateForeshadowing(  chapterContent,  5, // チャプター番号  3  // 生成する伏線の数);@call-flow1. ログ出力（開始）2. 伏線生成用プロンプトの作成3. GeminiClientによるテキスト生成4. レスポンスのパース5. ログ出力（完了）6. 生成された伏線のリストを返却@external-dependencies- GeminiClient - AIテキスト生成@helper-methods- parseForeshadowingResponse - レスポンスのパースと構造化@error-handlingエラーが発生した場合はログに記録し、空の配列を返します。@monitoring- ログレベル: INFO/ERROR

**@constructor:** function Object() { [native code] }

##### ForeshadowingEngine.parseForeshadowingResponse (method)

レスポンスから伏線データを抽出しますGeminiAPIからのレスポンスを解析し、構造化された伏線データを抽出します。@private@param {string} response AIからのレスポンステキスト@param {number} chapterNumber 伏線が導入されるチャプター番号@returns {Foreshadowing[]} 抽出された伏線データの配列@call-flow1. 結果配列の初期化2. 現在時刻の取得（タイムスタンプ用）3. 伏線パターンにマッチする正規表現の実行4. マッチごとに伏線オブジェクトを生成5. 各フィールドの抽出と検証6. 有効な伏線データの結果配列への追加7. 結果の返却@helper-methods- extractValue - テキストからフィールド値を抽出- standardizeUrgency - 重要度の標準化- parseChapterNumber - 予想解決チャプターの数値化@error-handlingパース処理中にエラーが発生した場合はログに記録し、空の配列を返します。

**@constructor:** function Object() { [native code] }

##### ForeshadowingEngine.saveForeshadowing (method)

伏線データをメモリマネージャに保存します生成された伏線データを検証し、記憶管理システムに保存します。重複する伏線はスキップされます。@async@param {Foreshadowing[]} foreshadowingItems 保存する伏線データの配列@returns {Promise<number>} 保存に成功した伏線の数@usageconst savedCount = await engine.saveForeshadowing(foreshadowingItems);console.log(`${savedCount}件の伏線を保存しました`);@call-flow1. 伏線データが空かチェック2. memoryManagerの初期化確認3. 各伏線データに対して:   - 重複チェック   - 重複なければ保存   - エラー時は個別にログ記録して続行4. 保存成功数の返却@error-handling個別の伏線保存に失敗した場合もプロセスは続行し、最終的な成功数を返します。全体的なエラーが発生した場合はログに記録し、0を返します。@state-changes長期記憶内の伏線データが更新されます。@monitoring- ログレベル: INFO/DEBUG/ERROR

**@constructor:** function Object() { [native code] }

##### ForeshadowingEngine.processChapterAndGenerateForeshadowing (method)

チャプターコンテンツから伏線を生成して保存しますチャプター生成後に自動的に呼び出され、チャプターの内容から伏線を生成して保存する統合処理を行います。@async@param {string} chapterContent チャプター内容@param {number} chapterNumber チャプター番号@param {number} [count=2] 生成する伏線の数@returns {Promise<number>} 保存された伏線の数@usageconst savedCount = await engine.processChapterAndGenerateForeshadowing(  chapterContent,  5, // チャプター番号  2  // 生成する伏線の数);@call-flow1. generateForeshadowing()による伏線の生成2. saveForeshadowing()による生成された伏線の保存3. 保存された伏線数の返却@helper-methods- generateForeshadowing - 伏線の生成- saveForeshadowing - 伏線の保存@error-handlingエラーが発生した場合はログに記録し、0を返します。

**@constructor:** function Object() { [native code] }

##### ForeshadowingEngine.checkStaleForeshadowing (method)

伏線データをチェックして古い（長期未解決の）伏線を検出します現在のチャプター番号を基準に、長期間未解決のままになっている伏線を検出します。@async@param {number} currentChapter 現在のチャプター番号@returns {Promise<Foreshadowing[]>} 古い未解決伏線の配列@usageconst staleItems = await engine.checkStaleForeshadowing(20);console.log(`${staleItems.length}件の古い伏線が検出されました`);@call-flow1. memoryManagerの初期化確認2. 未解決の伏線を取得3. 古い伏線の条件に合致するアイテムをフィルタリング:   - 現在のチャプターから一定数以上前に導入された   - 未解決である   - 計画解決チャプターが未設定または現在チャプターより前4. フィルタリングされた伏線を返却@error-handlingエラーが発生した場合はログに記録し、空の配列を返します。

**@constructor:** function Object() { [native code] }

##### ForeshadowingEngine.suggestForeshadowingsToResolve (method)

解決すべき伏線をAIに提案してもらいます現在のチャプター内容と未解決の伏線リストを分析し、現在のチャプターで解決すべき伏線を提案します。@async@param {string} chapterContent チャプター内容@param {number} chapterNumber チャプター番号@param {number} [count=2] 提案する伏線の最大数@returns {Promise<Foreshadowing[]>} 解決が推奨される伏線の配列@usageconst suggestedItems = await engine.suggestForeshadowingsToResolve(  chapterContent,  15, // チャプター番号  3   // 最大提案数);@call-flow1. memoryManagerの初期化確認2. 未解決の伏線を取得3. 未解決の伏線がない場合は空配列を返却4. 伏線提案用プロンプトの作成5. AIによる提案の生成6. レスポンスからの提案伏線インデックスの抽出7. 提案された伏線の配列を返却@external-dependencies- GeminiClient - AIによる提案生成- memoryManager - 未解決伏線の取得@error-handlingエラーが発生した場合はログに記録し、空の配列を返します。

**@constructor:** function Object() { [native code] }


---

### index.ts {#cnovel-automation-systemsrclibforeshadowingindexts}

**Path:** `C:/novel-automation-system/src/lib/foreshadowing/index.ts`

@fileoverview 伏線管理システム@description物語創作支援システムにおける伏線（foreshadowing）の管理機能を提供するモジュールです。伏線の自動生成、解決推奨、一括更新、整合性チェックなどの機能を統合しています。@role- 伏線の生成および管理のためのインターフェース提供- 伏線生成機能と解決推奨機能の統合- 複数の伏線に対する一括操作の実装- 伏線データの整合性検証@dependencies- './auto-generator' - 伏線の自動生成機能を提供- './resolution-advisor' - 伏線の解決推奨機能を提供- '@/lib/memory/manager' - 伏線データの永続化と取得を担当- '@/lib/utils/logger' - ログ出力機能@types- '@/types/memory' - Foreshadowing型の定義@flow1. 伏線マネージャーのインスタンス化2. メモリマネージャーの初期化確認3. 伏線生成または解決推奨の要求処理4. 伏線データの検証または更新5. 処理結果の返却

**@constructor:** function Object() { [native code] }

#### ForeshadowingManager (class)

@fileoverview 伏線管理システム@description物語創作支援システムにおける伏線（foreshadowing）の管理機能を提供するモジュールです。伏線の自動生成、解決推奨、一括更新、整合性チェックなどの機能を統合しています。@role- 伏線の生成および管理のためのインターフェース提供- 伏線生成機能と解決推奨機能の統合- 複数の伏線に対する一括操作の実装- 伏線データの整合性検証@dependencies- './auto-generator' - 伏線の自動生成機能を提供- './resolution-advisor' - 伏線の解決推奨機能を提供- '@/lib/memory/manager' - 伏線データの永続化と取得を担当- '@/lib/utils/logger' - ログ出力機能@types- '@/types/memory' - Foreshadowing型の定義@flow1. 伏線マネージャーのインスタンス化2. メモリマネージャーの初期化確認3. 伏線生成または解決推奨の要求処理4. 伏線データの検証または更新5. 処理結果の返却/

import { ForeshadowingAutoGenerator, foreshadowingGenerator } from './auto-generator';
import { ForeshadowingResolutionAdvisor, resolutionAdvisor } from './resolution-advisor';
import { memoryManager } from '@/lib/memory/manager';
import { Foreshadowing } from '@/types/memory';
import { logger } from '@/lib/utils/logger';

/**@class ForeshadowingManager@description伏線管理システム。伏線の追加、更新、削除、解決、自動生成、解決推奨の機能を統合するクラス。@role- 伏線自動生成と解決推奨機能の統合インターフェース- 複数伏線の一括処理機能の提供- 伏線データの整合性検証の実行- memoryManagerとの連携による伏線データの永続化@depends-on- ForeshadowingAutoGenerator - 伏線の自動生成機能- ForeshadowingResolutionAdvisor - 伏線の解決推奨機能- memoryManager - 記憶管理システム- logger - ログ出力ユーティリティ@lifecycle1. コンストラクタでのgeneratorとadvisorの初期化2. 各メソッド実行時のmemoryManager初期化確認3. 伏線処理の実行（生成/更新/チェック）4. 処理結果の返却@example-flowアプリケーション → ForeshadowingManager.processChapterAndGenerateForeshadowing →   memoryManager初期化確認 →  advisor.suggestResolutions →  generator.generateAndSaveForeshadowing →  ログ出力 →  結果返却

**@constructor:** function Object() { [native code] }

#### Methods of ForeshadowingManager

##### ForeshadowingManager.constructor (method)

ForeshadowingManagerクラスのコンストラクタ伏線生成コンポーネントと解決推奨コンポーネントを初期化します。@constructor@initializationgeneratorとadvisorのプロパティを、それぞれ外部からインポートしたシングルトンインスタンスで初期化します。

**@constructor:** function Object() { [native code] }

##### ForeshadowingManager.processChapterAndGenerateForeshadowing (method)

伏線自動生成とストーリー処理を統合しますチャプター生成時に呼び出され、解決すべき伏線の提案と新しい伏線の生成を行います。@async@param {string} chapterContent - チャプターの内容テキスト@param {number} chapterNumber - チャプター番号@param {number} [generateCount=2] - 生成する伏線の数@returns {Promise<{generatedCount: number; resolutionSuggestions: any[]}>}          生成された伏線の数と解決提案のリストを含むオブジェクト@usageconst result = await foreshadowingManager.processChapterAndGenerateForeshadowing(  chapterContent,  5, // チャプター番号  2  // 生成する伏線の数);console.log(`${result.generatedCount}件の伏線が生成され、${result.resolutionSuggestions.length}件の解決提案があります`);@call-flow1. memoryManagerの初期化確認2. 解決すべき伏線の提案取得（advisor.suggestResolutions）3. 新しい伏線の生成と保存（generator.generateAndSaveForeshadowing）4. ログ出力5. 結果オブジェクトの返却@helper-methods- advisor.suggestResolutions - 解決提案の生成- generator.generateAndSaveForeshadowing - 伏線の生成と保存@external-dependencies- memoryManager - 記憶管理システム@monitoring- ログレベル: INFO

**@constructor:** function Object() { [native code] }

##### ForeshadowingManager.bulkUpdateForeshadowing (method)

伏線のバルク操作を実行します複数の伏線を一度に更新するためのメソッドです。各更新は個別に実行され、一部の更新に失敗しても残りの処理は継続されます。@async@param {Array<{id: string, updates: Partial<Foreshadowing>}>} updates -        更新する伏線のIDと更新内容の配列@returns {Promise<number>} 正常に更新された伏線の数@usageconst successCount = await foreshadowingManager.bulkUpdateForeshadowing([  {    id: "fs-1-abc123",    updates: {       description: "更新された説明",      resolved: true    }  },  {    id: "fs-2-def456",    updates: {      urgency: "high"    }  }]);@call-flow1. memoryManagerの初期化確認2. 各更新項目に対して:   - memoryManager.getLongTermMemory().updateForeshadowing の呼び出し   - 成功時はカウンターをインクリメント   - 失敗時はエラーをログに記録して次の項目へ3. 成功数の返却@external-dependencies- memoryManager.getLongTermMemory().updateForeshadowing - 伏線の更新処理@error-handling- 個別の更新エラーは記録されるが処理は継続される- エラーメッセージはIDと共にログに記録される@monitoring- ログレベル: ERROR（エラー発生時のみ）

**@constructor:** function Object() { [native code] }

##### ForeshadowingManager.checkForeshadowingConsistency (method)

伏線の整合性チェックを実行します伏線データの矛盾や問題を検出するためのメソッドです。特に解決済みフラグと解決チャプターの不一致、長期未解決の伏線、予定解決チャプターを過ぎている伏線などを検出します。@async@returns {Promise<{isConsistent: boolean; issues: Array<{id: string, issue: string, severity: 'HIGH' | 'MEDIUM' | 'LOW'}>}>}         整合性チェック結果と問題リスト@usageconst result = await foreshadowingManager.checkForeshadowingConsistency();if (!result.isConsistent) {  console.log(`${result.issues.length}件の問題が見つかりました:`);  result.issues.forEach(issue => {    console.log(`[${issue.severity}] ${issue.id}: ${issue.issue}`);  });}@call-flow1. memoryManagerの初期化確認2. 全伏線データの取得3. 以下の整合性チェックを実行:   - 解決済みだが解決チャプターがない伏線の検出   - 過去に導入され長期間未解決の伏線の検出   - 解決予定が過ぎているのに未解決の伏線の検出4. 検出された問題の整理と重要度の設定5. 結果オブジェクトの返却@external-dependencies- memoryManager.getLongTermMemory().getForeshadowing - 伏線データの取得@return-structure返却されるオブジェクトは以下の構造:- isConsistent: 問題がない場合はtrue、ある場合はfalse- issues: 検出された問題の配列。各問題は以下を含む:  - id: 問題のある伏線のID  - issue: 問題の説明  - severity: 問題の重要度（'HIGH'/'MEDIUM'/'LOW'）

**@constructor:** function Object() { [native code] }


---

### manager.ts {#cnovel-automation-systemsrclibforeshadowingmanagerts}

**Path:** `C:/novel-automation-system/src/lib/foreshadowing/manager.ts`

@fileoverview 伏線管理システム@description物語創作支援システムにおける伏線の管理を担当するモジュールです。伏線の生成、更新、整合性チェック、解決推奨などの機能を統合的に提供し、伏線に関する様々な操作を一元管理します。@role- 伏線エンジンと解決アドバイザーの統合管理- チャプターからの伏線抽出と保存- 伏線の整合性チェックと問題検出- 解決すべき伏線の提案- 古い伏線の自動解決@dependencies- @/lib/memory/manager - 階層的記憶管理システム- @/lib/foreshadowing/engine - 伏線生成エンジン- @/lib/utils/logger - ログ出力機能- @/lib/utils/error-handler - エラーハンドリング機能- @/lib/foreshadowing/resolution-advisor - 伏線解決提案機能@types- @/types/memory - Foreshadowing型など記憶関連の型定義@flow1. チャプター内容の受け取りと処理2. 伏線エンジンによる新しい伏線の生成3. 解決アドバイザーによる解決提案の生成4. 伏線データの検証と整合性チェック5. 記憶システムへの保存と更新6. 古い伏線の自動解決や管理

**@constructor:** function Object() { [native code] }

#### ForeshadowingManager (class)

@fileoverview 伏線管理システム@description物語創作支援システムにおける伏線の管理を担当するモジュールです。伏線の生成、更新、整合性チェック、解決推奨などの機能を統合的に提供し、伏線に関する様々な操作を一元管理します。@role- 伏線エンジンと解決アドバイザーの統合管理- チャプターからの伏線抽出と保存- 伏線の整合性チェックと問題検出- 解決すべき伏線の提案- 古い伏線の自動解決@dependencies- @/lib/memory/manager - 階層的記憶管理システム- @/lib/foreshadowing/engine - 伏線生成エンジン- @/lib/utils/logger - ログ出力機能- @/lib/utils/error-handler - エラーハンドリング機能- @/lib/foreshadowing/resolution-advisor - 伏線解決提案機能@types- @/types/memory - Foreshadowing型など記憶関連の型定義@flow1. チャプター内容の受け取りと処理2. 伏線エンジンによる新しい伏線の生成3. 解決アドバイザーによる解決提案の生成4. 伏線データの検証と整合性チェック5. 記憶システムへの保存と更新6. 古い伏線の自動解決や管理/

import { memoryManager } from '@/lib/memory/manager';
import { foreshadowingEngine } from './engine';
import { Foreshadowing } from '@/types/memory';
import { logger } from '@/lib/utils/logger';
import { logError } from '@/lib/utils/error-handler';
import { resolutionAdvisor } from './resolution-advisor';

/**@class ForeshadowingManager@description伏線管理システムの統合インターフェースを提供するクラス。伏線エンジンと解決アドバイザーを統合し、伏線の生成、更新、整合性チェック、解決推奨などの機能を一元的に管理します。@role- 伏線関連機能の統合的なインターフェース提供- チャプター処理と伏線生成の調整- 伏線の一括操作と管理- 伏線の整合性確保と問題検出- 解決すべき伏線の推奨@used-by- APIエンドポイント（/api/foreshadowing/suggest）- 物語編集インターフェース- チャプター生成システム@depends-on- memoryManager - 記憶管理システム- foreshadowingEngine - 伏線生成エンジン- resolutionAdvisor - 解決提案アドバイザー- logger - ログ出力ユーティリティ- logError - エラーハンドリングユーティリティ@lifecycle1. 各メソッドの呼び出し時にmemoryManagerの初期化確認2. 必要に応じた伏線エンジンや解決アドバイザーの呼び出し3. 処理結果の集約と返却4. エラーハンドリングとログ記録@example-flowAPIリクエスト → ForeshadowingManager.processChapterAndGenerateForeshadowing →   foreshadowingEngine.processChapterAndGenerateForeshadowing →  resolutionAdvisor.suggestResolutions →  結果集約 →  レスポンス返却

**@constructor:** function Object() { [native code] }

#### Methods of ForeshadowingManager

##### ForeshadowingManager.processChapterAndGenerateForeshadowing (method)

チャプターに対する伏線処理を実行しますチャプターコンテンツから新しい伏線を生成し、解決すべき伏線を提案します。このメソッドは新しい伏線の生成と解決提案を並行して処理します。@async@param {string} chapterContent - チャプターの内容テキスト@param {number} chapterNumber - チャプター番号@param {number} [generateCount=2] - 生成する伏線の数@returns {Promise<{generatedCount: number; resolutionSuggestions: any[]}>}          生成された伏線の数と解決提案の配列を含むオブジェクト@usageconst result = await foreshadowingManager.processChapterAndGenerateForeshadowing(  chapterContent,  5, // チャプター番号  3  // 生成する伏線の数);console.log(`${result.generatedCount}件の伏線を生成し、${result.resolutionSuggestions.length}件の解決提案を取得しました`);@call-context- 同期/非同期: 非同期メソッド（await必須）- 前提条件: なし（内部でmemoryManagerの初期化を確認）@call-flow1. ログ出力（処理開始）2. memoryManagerの初期化確認と必要に応じた初期化3. 並行処理の実行：   a. foreshadowingEngineによる伏線生成   b. resolutionAdvisorによる解決提案4. ログ出力（処理完了）5. 結果オブジェクトの返却@external-dependencies- foreshadowingEngine - 伏線生成機能- resolutionAdvisor - 解決提案機能- memoryManager - 記憶管理システム@error-handlingエラーが発生した場合はログに記録し、空の結果オブジェクト（生成数0、提案数0）を返します。これにより、エラーが発生しても上位層の処理は継続できます。@monitoring- ログレベル: INFO/ERROR

**@constructor:** function Object() { [native code] }

##### ForeshadowingManager.bulkUpdateForeshadowing (method)

伏線のバルク操作を実行します複数の伏線を一度に更新するためのメソッドです。各更新は個別に実行され、一部の更新に失敗しても残りの処理は継続されます。@async@param {Array<{id: string, updates: Partial<Foreshadowing>}>} updates -        更新する伏線のIDと更新内容の配列@returns {Promise<number>} 正常に更新された伏線の数@usageconst successCount = await foreshadowingManager.bulkUpdateForeshadowing([  {    id: "fs-1-abc123",    updates: {       description: "更新された説明",      urgency: "high"    }  },  {    id: "fs-2-def456",    updates: {      plannedResolution: 10    }  }]);console.log(`${successCount}件の伏線を更新しました`);@call-context- 同期/非同期: 非同期メソッド（await必須）- 前提条件: なし（内部でmemoryManagerの初期化を確認）@call-flow1. memoryManagerの初期化確認と必要に応じた初期化2. 成功カウンターの初期化3. 各更新項目に対して:   a. 長期記憶の伏線更新メソッドを呼び出し   b. 成功時はカウンターをインクリメント   c. 失敗時はログに記録して次の項目へ進む4. ログ出力（処理完了と成功数）5. 成功数の返却@error-handling- 個別の更新に失敗した場合は、エラーをログに記録して次の更新に進みます- 全体的なエラーが発生した場合は、ログに記録して0を返します@monitoring- ログレベル: INFO/ERROR

**@constructor:** function Object() { [native code] }

##### ForeshadowingManager.checkForeshadowingConsistency (method)

伏線の整合性チェックを実行します現在のチャプターを基準に、矛盾や問題のある伏線を検出します。特に解決済みフラグと解決チャプターの不一致、長期未解決の伏線、予定解決チャプターを過ぎている伏線などを検出します。@async@param {number} currentChapter - 現在のチャプター番号@returns {Promise<{isConsistent: boolean; issues: Array<{id: string, issue: string, severity: 'HIGH' | 'MEDIUM' | 'LOW'}>}>}          整合性チェック結果と問題リスト@usageconst consistencyResult = await foreshadowingManager.checkForeshadowingConsistency(15);if (!consistencyResult.isConsistent) {  console.log(`${consistencyResult.issues.length}件の問題が検出されました:`);  consistencyResult.issues.forEach(issue => {    console.log(`${issue.severity}優先度: ${issue.issue}`);  });}@call-context- 同期/非同期: 非同期メソッド（await必須）- 前提条件: なし（内部でmemoryManagerの初期化を確認）@call-flow1. memoryManagerの初期化確認と必要に応じた初期化2. 全伏線データの取得3. 以下の整合性チェックを実行:   a. 解決済みだが解決チャプターがない伏線   b. 古すぎる未解決の伏線   c. 解決予定が過ぎている未解決の伏線   d. 導入チャプターが未来の伏線4. ログ出力（検出された問題数）5. 結果オブジェクトの返却@external-dependencies- memoryManager - 伏線データの取得@error-handlingエラーが発生した場合はログに記録し、問題なしの結果（isConsistent: true, issues: []）を返します。これにより、エラーが発生しても上位層の処理は継続できます。@monitoring- ログレベル: INFO/ERROR

**@constructor:** function Object() { [native code] }

##### ForeshadowingManager.getSuggestedForeshadowingsToResolve (method)

現在のチャプターで解決すべき伏線を取得しますチャプターコンテンツとチャプター番号を基に、現在のチャプターで解決すべき伏線を提案します。計画的な解決予定と文脈に基づくAI解析の両方から候補を収集します。@async@param {string} chapterContent - チャプターの内容テキスト@param {number} chapterNumber - チャプター番号@returns {Promise<Foreshadowing[]>} 解決が推奨される伏線の配列@usageconst suggestedForeshadowings = await foreshadowingManager.getSuggestedForeshadowingsToResolve(  chapterContent,  15 // チャプター番号);console.log(`${suggestedForeshadowings.length}件の伏線の解決が推奨されています`);@call-context- 同期/非同期: 非同期メソッド（await必須）- 前提条件: なし（内部でmemoryManagerの初期化を確認）@call-flow1. memoryManagerの初期化確認と必要に応じた初期化2. 以下の2つの方法で解決候補を取得:   a. チャプター番号に基づく計画的な推奨（getLongTermMemory().suggestForeshadowingToResolve）   b. AI解析による文脈に基づく推奨（foreshadowingEngine.suggestForeshadowingsToResolve）3. 2つの配列を結合し、重複を除去4. 結合した伏線配列を返却@external-dependencies- memoryManager - 計画的な解決候補の取得- foreshadowingEngine - 文脈に基づく解決候補の取得@error-handlingエラーが発生した場合はログに記録し、空の配列を返します。これにより、エラーが発生しても上位層の処理は継続できます。@monitoring- ログレベル: ERROR

**@constructor:** function Object() { [native code] }

##### ForeshadowingManager.resolveStaleForeshadowings (method)

古い伏線をまとめて解決します長期間未解決のままになっている伏線を一括で解決するためのヘルパーメソッドです。特定のチャプター番号を解決チャプターとして設定し、指定された解決理由で複数の古い伏線を一度に解決します。@async@param {number} currentChapter - 現在のチャプター番号@param {string} [resolution="物語の進行に伴い暗黙的に解決されました"] - 解決理由の説明@returns {Promise<number>} 解決された伏線の数@usageconst resolvedCount = await foreshadowingManager.resolveStaleForeshadowings(  20, // 現在のチャプター  "ストーリーの進行に伴い、この伏線は自然に解決されました");console.log(`${resolvedCount}件の古い伏線を解決しました`);@call-context- 同期/非同期: 非同期メソッド（await必須）- 前提条件: なし（内部でmemoryManagerの初期化を確認）@call-flow1. foreshadowingEngineを使用して古い伏線を検出2. 古い伏線がない場合は0を返却して終了3. memoryManagerの初期化確認と必要に応じた初期化4. 各古い伏線に対して:   a. 長期記憶の伏線解決メソッドを呼び出し   b. 成功時はカウンターをインクリメント   c. 失敗時はログに記録して次の項目へ進む5. ログ出力（解決した伏線数）6. 解決数の返却@external-dependencies- foreshadowingEngine - 古い伏線の検出- memoryManager - 伏線の解決処理@error-handling- 個別の解決に失敗した場合は、警告をログに記録して次の伏線に進みます- 全体的なエラーが発生した場合は、ログに記録して0を返します@monitoring- ログレベル: INFO/WARN/ERROR

**@constructor:** function Object() { [native code] }


---

### resolution-advisor.ts {#cnovel-automation-systemsrclibforeshadowingresolution-advisorts}

**Path:** `C:/novel-automation-system/src/lib/foreshadowing/resolution-advisor.ts`

@fileoverview 伏線解決提案生成モジュール@description物語内の伏線（foreshadowing）に対する解決提案を生成するモジュールです。チャプター内容を分析し、既存の未解決伏線に対して、現在のチャプターで解決可能かどうかを評価し、解決提案を生成します。@role- チャプター内容に基づく伏線解決提案の生成- 伏線の解決可能性とその信頼度の評価- 適切なタイミングでの伏線解決のアドバイス提供- AI（Gemini）を活用した伏線解決可能性の分析@dependencies- @/lib/memory/manager - メモリマネージャーからの伏線情報取得- @/types/memory - 伏線関連の型定義- @/lib/generation/gemini-client - AI生成機能クライアント- @/lib/utils/logger - ログ出力機能- @/lib/utils/error-handler - エラーハンドリング機能@flow1. チャプター内容から解決提案を生成するリクエスト受付2. メモリマネージャーから未解決の伏線情報を取得3. 各伏線について現在のチャプターでの解決可能性を評価4. 解決可能性のある伏線に対する解決提案の生成5. 信頼度の高い順に提案をソートして返却

**@constructor:** function Object() { [native code] }

#### ForeshadowingResolutionAdvisor (class)

@fileoverview 伏線解決提案生成モジュール@description物語内の伏線（foreshadowing）に対する解決提案を生成するモジュールです。チャプター内容を分析し、既存の未解決伏線に対して、現在のチャプターで解決可能かどうかを評価し、解決提案を生成します。@role- チャプター内容に基づく伏線解決提案の生成- 伏線の解決可能性とその信頼度の評価- 適切なタイミングでの伏線解決のアドバイス提供- AI（Gemini）を活用した伏線解決可能性の分析@dependencies- @/lib/memory/manager - メモリマネージャーからの伏線情報取得- @/types/memory - 伏線関連の型定義- @/lib/generation/gemini-client - AI生成機能クライアント- @/lib/utils/logger - ログ出力機能- @/lib/utils/error-handler - エラーハンドリング機能@flow1. チャプター内容から解決提案を生成するリクエスト受付2. メモリマネージャーから未解決の伏線情報を取得3. 各伏線について現在のチャプターでの解決可能性を評価4. 解決可能性のある伏線に対する解決提案の生成5. 信頼度の高い順に提案をソートして返却/

import { memoryManager } from '@/lib/memory/manager';
import { Foreshadowing } from '@/types/memory';
import { GeminiClient } from '@/lib/generation/gemini-client';
import { logger } from '@/lib/utils/logger';
import { logError } from '@/lib/utils/error-handler';

interface ResolutionSuggestion {
foreshadowing: Foreshadowing;
chapterContent: string;
reason: string;
confidence: number;  // 0.0-1.0
}

/**@class ForeshadowingResolutionAdvisor@description伏線解決の提案を生成するアドバイザークラス。チャプター内容を分析し、適切な伏線解決のタイミングと方法を提案します。AIを活用して伏線解決の可能性と適切性を評価します。@role- チャプター内容に基づく伏線解決提案の生成- 伏線の解決可能性と信頼度の評価- 計画された解決タイミングと現在のチャプターの関係性分析- AI（Gemini）を活用した伏線解決分析@depends-on- GeminiClient - AIを使用した解決可能性評価- memoryManager - 長期記憶から未解決の伏線情報を取得@lifecycle1. コンストラクタでのGeminiClientの初期化2. suggestResolutions()による伏線解決提案の生成3. evaluateResolutionPossibility()による個別伏線の解決可能性評価@example-flow呼び出し元 → ForeshadowingResolutionAdvisor.suggestResolutions →   memoryManager.getLongTermMemory().getUnresolvedForeshadowing() →  evaluateResolutionPossibility() →  GeminiClient.generateText() →  結果の信頼度に基づくフィルタリングとソート →  解決提案の返却

**@constructor:** function Object() { [native code] }

#### Methods of ForeshadowingResolutionAdvisor

##### ForeshadowingResolutionAdvisor.suggestResolutions (method)

伏線解決提案を生成します指定されたチャプター内容と番号に基づいて、未解決の伏線に対する解決提案を生成します。各伏線について解決可能性を評価し、信頼度の高い順にソートした結果を返します。@async@param {string} chapterContent チャプター内容@param {number} chapterNumber チャプター番号@param {number} [maxSuggestions=3] 最大提案数@returns {Promise<ResolutionSuggestion[]>} 伏線解決提案の配列@throws {Error} 提案生成に失敗した場合@usage// 提案の生成const suggestions = await resolutionAdvisor.suggestResolutions(  chapterContent,  chapterNumber,  5 // 最大5つの提案を生成);@call-context- 同期/非同期: 非同期メソッド（await必須）- 前提条件: チャプター内容が有効な文字列であること@call-flow1. メモリマネージャーの初期化状態の確認と初期化2. 未解決の伏線の取得3. 未解決の伏線がない場合は空配列を返却4. チャプター内容を解析用に切り詰め（6000文字まで）5. 各未解決伏線について解決可能性を評価6. 信頼度が一定以上（0.6以上）の提案をフィルタリング7. 信頼度の高い順にソート8. 指定された上限数まで結果を制限@helper-methods- evaluateResolutionPossibility - 伏線の解決可能性を評価@error-handling処理中にエラーが発生した場合は、チャプター番号と共にログに記録し、上位層に例外をスローします。個々の伏線評価でのエラーはその伏線をスキップする形で処理されます。

**@constructor:** function Object() { [native code] }

##### ForeshadowingResolutionAdvisor.evaluateResolutionPossibility (method)

伏線の解決可能性を評価します特定の伏線に対して、現在のチャプターでの解決可能性を評価します。計画された解決タイミングとの関連性やチャプター内容との整合性を考慮し、AIを使用して解決可能性とその信頼度を算出します。@private@async@param {Foreshadowing} foreshadowing 評価対象の伏線@param {string} chapterContent チャプター内容@param {number} chapterNumber チャプター番号@returns {Promise<{  isPossible: boolean;  confidence: number;  reason: string;  snippetForResolution?: string;}>} 評価結果@call-flow1. 伏線の計画解決チャプターを確認2. 計画チャプターと現在のチャプターの距離に基づくタイミング信頼度の設定3. AIに伏線解決可能性の評価を依頼するプロンプトの作成4. GeminiClientを使用したAI評価の実行5. レスポンスの解析（正規表現を使用）6. タイミングの信頼度を加味した最終的な評価結果の生成@external-dependencies- GeminiClient - AI評価の実行@error-handlingAIからのレスポンス解析に失敗した場合も、デフォルト値を使用して処理を継続します。

**@constructor:** function Object() { [native code] }


---

### context-generator copy.ts {#cnovel-automation-systemsrclibgenerationcontext-generator-copyts}

**Path:** `C:/novel-automation-system/src/lib/generation/#/context-generator copy.ts`

//  * 生成コンテキストを作成するクラス
//

**@constructor:** function Object() { [native code] }


---

### engine copy.ts {#cnovel-automation-systemsrclibgenerationengine-copyts}

**Path:** `C:/novel-automation-system/src/lib/generation/#/engine copy.ts`

//      * チャプターを生成する
//

**@constructor:** function Object() { [native code] }


---

### context-generator.ts {#cnovel-automation-systemsrclibgenerationcontext-generatorts}

**Path:** `C:/novel-automation-system/src/lib/generation/context-generator.ts`

@fileoverview 小説生成コンテキスト生成モジュール@descriptionこのファイルは、AIが小説を生成するためのコンテキスト情報を準備するクラスを提供します。階層的記憶管理システムからデータを取得し、チャプター番号に基づいた生成コンテキストを構築します。このコンテキストには物語の短期・中期・長期記憶、キャラクター情報、伏線、表現設定などが含まれます。@role- 小説生成システムのコンテキスト生成レイヤーを担当- 階層的記憶管理システムとAI生成エンジンの間の橋渡し役- 生成に必要なすべての情報を統合して一貫性のあるコンテキストを構築@dependencies- @/lib/utils/logger - ログ記録ユーティリティ- @/types/generation - 生成関連の型定義- @/lib/memory/manager - 記憶管理システム- @/lib/storage - ストレージプロバイダー- @/lib/utils/yaml-helper - YAML操作ユーティリティ- @/lib/utils/error-handler - エラーハンドリング- @/types/memory - 記憶関連の型定義@flow1. チャプター番号を受け取る2. 階層的記憶システムから短期・中期・長期記憶を取得3. キャラクター情報と伏線情報を取得4. 表現設定を取得5. 各情報を統合してコンテキストオブジェクトを構築6. エラー発生時はフォールバックコンテキストを生成@api-endpointsこのファイルから使用される/このファイルが実装するAPIエンドポイント:- GET /api/generation/context - コンテキスト情報を取得するエンドポイント

**@constructor:** function Object() { [native code] }

#### ContextGenerator (class)

@fileoverview 小説生成コンテキスト生成モジュール@descriptionこのファイルは、AIが小説を生成するためのコンテキスト情報を準備するクラスを提供します。階層的記憶管理システムからデータを取得し、チャプター番号に基づいた生成コンテキストを構築します。このコンテキストには物語の短期・中期・長期記憶、キャラクター情報、伏線、表現設定などが含まれます。@role- 小説生成システムのコンテキスト生成レイヤーを担当- 階層的記憶管理システムとAI生成エンジンの間の橋渡し役- 生成に必要なすべての情報を統合して一貫性のあるコンテキストを構築@dependencies- @/lib/utils/logger - ログ記録ユーティリティ- @/types/generation - 生成関連の型定義- @/lib/memory/manager - 記憶管理システム- @/lib/storage - ストレージプロバイダー- @/lib/utils/yaml-helper - YAML操作ユーティリティ- @/lib/utils/error-handler - エラーハンドリング- @/types/memory - 記憶関連の型定義@flow1. チャプター番号を受け取る2. 階層的記憶システムから短期・中期・長期記憶を取得3. キャラクター情報と伏線情報を取得4. 表現設定を取得5. 各情報を統合してコンテキストオブジェクトを構築6. エラー発生時はフォールバックコンテキストを生成@api-endpointsこのファイルから使用される/このファイルが実装するAPIエンドポイント:- GET /api/generation/context - コンテキスト情報を取得するエンドポイント/

import { logger } from '@/lib/utils/logger';
import { GenerationContext } from '@/types/generation';
import { MemoryManager } from '@/lib/memory/manager';
import { storageProvider } from '@/lib/storage';
import { parseYaml } from '@/lib/utils/yaml-helper';
import { GenerationError } from '@/lib/utils/error-handler';
import { ChapterMemory, KeyEvent, CharacterState, Foreshadowing } from '@/types/memory';

/**@class ContextGenerator@description 生成コンテキスト生成クラス階層的記憶管理システムからコンテキスト情報を取得し、AIが小説を生成するためのコンテキストを準備する@role- 小説生成AIに必要なコンテキスト情報の収集と整形- 階層的記憶（短期・中期・長期）からの情報統合- キャラクター情報、伏線、表現設定の取得と統合- エラー時のフォールバックコンテキスト生成@used-by- src\app\api\generation\context\route.ts - APIエンドポイントからコンテキスト情報を取得するために使用@depends-on- MemoryManager - 階層的記憶システムへのアクセス- storageProvider - ファイルストレージへのアクセス- parseYaml - YAML形式の設定ファイルのパース- logger - ログ記録@lifecycle1. インスタンス化: MemoryManagerのインスタンスを生成2. コンテキスト生成: チャプター番号に基づき必要な情報を収集3. エラー時のフォールバック: 問題発生時は代替コンテキストを提供@example-flowAPIリクエスト → ContextGenerator.generateContext(chapterNumber) →   記憶システムからのデータ取得 →  設定ファイルからの情報取得 →  コンテキストオブジェクトの構築 →  結果のコンテキストを返却

**@constructor:** function Object() { [native code] }

#### Methods of ContextGenerator

##### ContextGenerator.constructor (method)

コンストラクタContextGeneratorクラスのインスタンスを初期化します。内部で使用するMemoryManagerインスタンスを生成し、インスタンス化をログに記録します。@constructor@initialization特別な初期化パラメータは不要です。内部的にMemoryManagerを初期化します。

**@constructor:** function Object() { [native code] }

##### ContextGenerator.generateContext (method)

チャプターのコンテキスト生成指定されたチャプター番号に基づいて、AIが小説を生成するために必要なコンテキスト情報を収集し、それらを統合したGenerationContextオブジェクトを返します。@async@param {number} chapterNumber - 生成するチャプター番号@returns {Promise<GenerationContext>} 生成コンテキスト@call-flow1. 初期化確認 - 最初のチャプターの場合は基本設定を確認2. 階層的記憶の取得（短期・中期・長期）3. キャラクター情報の取得4. 伏線情報の取得5. 表現設定の取得6. コンテキストの構築7. デバッグ情報をログに記録@error-handlingエラーが発生した場合、ログに記録し、createSmartFallbackContextメソッドを使用して基本的な設定からフォールバックコンテキストを生成します。@helper-methods- ensureBasicSettingsExist - 基本設定の存在確認- getShortTermMemory - 短期記憶の取得- getMidTermMemory - 中期記憶の取得- getLongTermMemory - 長期記憶の取得- getCharacterStates - キャラクター状態の取得- getForeshadowing - 伏線情報の取得- getExpressionSettings - 表現設定の取得- buildStoryContext - ストーリーコンテキストの構築- calculateTension - テンション値の計算- calculatePacing - ペーシング値の計算@monitoring- ログレベル: INFO, DEBUG, ERROR- ログ情報: 処理されたチャプター番号、取得した情報のサイズ、エラー情報

**@constructor:** function Object() { [native code] }

##### ContextGenerator.ensureBasicSettingsExist (method)

基本設定の存在を確認し、必要に応じて初期化する特に最初のチャプター生成前に呼び出され、世界設定、テーマトラッカー、アーク情報などの基本的な設定ファイルが存在するかを確認します。@private@async@returns {Promise<void>}@call-flow1. 世界設定ファイルの存在確認2. テーマトラッカーファイルの存在確認3. アーク情報の確認4. 不足している場合はログに警告を記録@error-handlingエラーが発生した場合はログに記録しますが、例外を再スローしません。これにより、欠落した設定があっても処理を続行できます。

**@constructor:** function Object() { [native code] }

##### ContextGenerator.getShortTermMemory (method)

短期記憶の取得MemoryManagerから指定されたチャプター番号に関連する短期記憶（最近のチャプターメモリ）を取得します。@private@async@param {number} chapterNumber - チャプター番号@returns {Promise<any>} 短期記憶データ@call-flow1. MemoryManagerから最近のチャプターメモリを取得2. メモリが存在しない場合は警告をログに記録3. 取得したメモリを適切な形式に整形して返却@error-handlingエラーが発生した場合はログに記録し、空の短期記憶オブジェクトを返します。

**@constructor:** function Object() { [native code] }

##### ContextGenerator.getMidTermMemory (method)

中期記憶の取得MemoryManagerから指定されたチャプター番号に関連する中期記憶（現在のアーク情報と重要イベント）を取得します。@private@async@param {number} chapterNumber - チャプター番号@returns {Promise<any>} 中期記憶データ@call-flow1. MemoryManagerから現在のアーク情報を取得2. アーク情報がない場合は警告をログに記録し、基本的なストーリー構成から抽出3. 現在のアークの重要イベントを取得4. アーク情報と重要イベントを組み合わせた中期記憶を返却@error-handlingエラーが発生した場合はログに記録し、基本設定から生成した中期記憶を返します。@helper-methods- getBasicStoryInfo - 基本的なストーリー情報の取得

**@constructor:** function Object() { [native code] }

##### ContextGenerator.getLongTermMemory (method)

長期記憶の取得世界設定、テーマ、重要な因果関係などの長期記憶を取得します。@private@async@returns {Promise<any>} 長期記憶データ@call-flow1. 世界設定の取得2. テーマの取得3. 重要な因果関係の取得4. これらの情報を組み合わせた長期記憶を返却@error-handlingエラーが発生した場合はログに記録し、基本設定から生成した長期記憶を返します。@helper-methods- getWorldSettings - 世界設定の取得- getTheme - テーマの取得- getCausalityMap - 因果関係マップの取得- getBasicStoryInfo - 基本的なストーリー情報の取得

**@constructor:** function Object() { [native code] }

##### ContextGenerator.getWorldSettings (method)

世界設定の取得世界設定ファイルから情報を読み込み、整形して返します。@private@async@returns {Promise<string>} 整形された世界設定@call-flow1. 世界設定ファイルの存在確認2. ファイルが存在する場合はYAML形式から読み込み3. 設定の整形（地域、歴史、ルールなどのセクション分け）4. 整形された世界設定を返却@error-handlingエラーが発生した場合はログに記録し、基本的なストーリー情報から取得した世界設定を返します。@helper-methods- storageProvider.fileExists - ファイルの存在確認- storageProvider.readFile - ファイル読み込み- parseYaml - YAML形式のパース- getBasicStoryInfo - 基本的なストーリー情報の取得

**@constructor:** function Object() { [native code] }

##### ContextGenerator.getTheme (method)

テーマの取得テーマトラッカーファイルから現在のテーマ情報を読み込みます。@private@async@returns {Promise<string>} テーマ@call-flow1. テーマトラッカーファイルの存在確認2. ファイルが存在する場合はYAML形式から読み込み3. テーマの説明または最新のテーマ進化を取得4. テーマ情報を返却@error-handlingエラーが発生した場合はログに記録し、基本的なストーリー情報から取得したテーマを返します。@helper-methods- storageProvider.fileExists - ファイルの存在確認- storageProvider.readFile - ファイル読み込み- parseYaml - YAML形式のパース- getBasicStoryInfo - 基本的なストーリー情報の取得

**@constructor:** function Object() { [native code] }

##### ContextGenerator.getCausalityMap (method)

因果関係マップの取得物語内の重要な因果関係をマップとして取得します。@private@async@returns {Promise<any[]>} 因果関係マップ@call-flow1. 因果関係マップファイルの存在確認2. ファイルが存在する場合はYAML形式から読み込み3. 有効な形式の場合はそのまま返却、そうでなければ空配列を返却@error-handlingエラーが発生した場合はログに記録し、空配列を返します。@helper-methods- storageProvider.fileExists - ファイルの存在確認- storageProvider.readFile - ファイル読み込み- parseYaml - YAML形式のパース

**@constructor:** function Object() { [native code] }

##### ContextGenerator.getCharacterStates (method)

キャラクター状態の取得指定されたチャプター番号に関連するキャラクターの最新状態を取得します。@private@async@param {number} chapterNumber - チャプター番号@returns {Promise<any[]>} キャラクター状態の配列@call-flow1. MemoryManagerから最近のチャプターメモリを取得2. メモリからキャラクター状態を抽出3. 新しいメモリから古いメモリの順に処理して最新状態を優先4. 結果をオブジェクトから配列に変換して返却5. 情報が取得できない場合はファイルからキャラクター情報を取得@error-handlingエラーが発生した場合はログに記録し、ファイルからキャラクター情報を取得します。@helper-methods- getCharactersFromFiles - ファイルからキャラクター情報を取得

**@constructor:** function Object() { [native code] }

##### ContextGenerator.getCharactersFromFiles (method)

ファイルからキャラクター情報を取得キャラクターディレクトリからキャラクター設定ファイルを読み込み、キャラクター情報を取得します。@private@async@returns {Promise<any[]>} キャラクター情報の配列@call-flow1. メインキャラクターとサブキャラクターのディレクトリからキャラクター情報を読み込み2. 取得した情報を結合3. 情報が取得できない場合は基本的なストーリー情報からキャラクター情報を作成4. すべての方法が失敗した場合は汎用的なキャラクター情報を返却@error-handlingエラーが発生した場合はログに記録し、基本的なストーリー情報からキャラクター情報を取得、またはフォールバックとして汎用的なキャラクター情報を返します。@helper-methods- loadCharactersFromDirectory - ディレクトリからキャラクター情報を読み込む- getBasicStoryInfo - 基本的なストーリー情報の取得

**@constructor:** function Object() { [native code] }

##### ContextGenerator.loadCharactersFromDirectory (method)

ディレクトリからキャラクター情報を読み込む指定されたディレクトリ内のYAMLファイルからキャラクター情報を読み込みます。@private@async@param {string} directory - ディレクトリパス@returns {Promise<any[]>} キャラクター情報の配列@call-flow1. ディレクトリの存在確認2. ディレクトリ内のYAMLファイルリストを取得3. 各ファイルを読み込み、パースしてキャラクター情報を抽出4. 結果を配列として返却@error-handlingディレクトリが存在しない場合や、ファイルのパースエラーが発生した場合はログに記録し、利用可能な情報のみを返します。ディレクトリ処理全体でエラーが発生した場合は空配列を返します。@helper-methods- storageProvider.directoryExists - ディレクトリの存在確認- storageProvider.listFiles - ファイルリスト取得- storageProvider.readFile - ファイル読み込み- parseYaml - YAML形式のパース

**@constructor:** function Object() { [native code] }

##### ContextGenerator.getForeshadowing (method)

伏線情報の取得指定されたチャプター番号に関連する伏線情報を取得します。@private@async@param {number} chapterNumber - チャプター番号@returns {Promise<string[]>} 伏線情報の説明文配列@call-flow1. 伏線マップファイルの存在確認と読み込み2. 現在のチャプターで関連する伏線を抽出   - まだ回収されていない伏線   - 過去に導入された伏線   - 現在のチャプターで導入予定の伏線3. 伏線情報を結合して最大5つまで制限4. 伏線の説明文を配列として返却@error-handlingエラーが発生した場合はログに記録し、空配列を返します。@helper-methods- storageProvider.fileExists - ファイルの存在確認- storageProvider.readFile - ファイル読み込み- parseYaml - YAML形式のパース

**@constructor:** function Object() { [native code] }

##### ContextGenerator.getExpressionSettings (method)

表現設定の取得小説の文体や視点などの表現に関する設定を取得します。@private@async@returns {Promise<any>} 表現設定@call-flow1. 表現設定ファイルの存在確認2. ファイルが存在する場合はYAML形式から読み込み3. トーン、ナラティブスタイル、制約などの設定を取得4. 結果を返却@error-handlingエラーが発生した場合はログに記録し、デフォルトの表現設定を返します。@helper-methods- storageProvider.fileExists - ファイルの存在確認- storageProvider.readFile - ファイル読み込み- parseYaml - YAML形式のパース

**@constructor:** function Object() { [native code] }

##### ContextGenerator.buildStoryContext (method)

ストーリーコンテキストの構築短期記憶と中期記憶から物語のコンテキスト情報を構築します。@private@param {any} shortTermMemory - 短期記憶@param {any} midTermMemory - 中期記憶@returns {string} ストーリーコンテキスト@call-flow1. 中期記憶（アーク情報）の処理   - 現在のアークテーマと要約を追加   - 重要イベントを追加2. 短期記憶（最近のチャプター）の処理   - 各チャプターの要約を追加   - 各チャプターの重要イベントを追加3. Markdown形式でフォーマットされたストーリーコンテキストを返却

**@constructor:** function Object() { [native code] }

##### ContextGenerator.calculateTension (method)

テンション値の計算チャプター番号と中期記憶に基づいて物語のテンション値を計算します。@private@param {number} chapterNumber - チャプター番号@param {any} midTermMemory - 中期記憶@returns {number} テンション値 (0-1)@call-flow1. アーク情報がある場合は、アーク内でのチャプターの位置を計算2. アーク内の位置に基づいて起承転結カーブでテンション値を算出3. アーク情報がない場合はチャプター番号から概算4. 算出されたテンション値を返却

**@constructor:** function Object() { [native code] }

##### ContextGenerator.calculatePacing (method)

ペーシング値の計算チャプター番号と中期記憶に基づいて物語のペーシング値を計算します。@private@param {number} chapterNumber - チャプター番号@param {any} midTermMemory - 中期記憶@returns {number} ペーシング値 (0-1)@call-flow1. アーク情報がある場合は、アーク内でのチャプターの位置を計算2. アーク内の位置に基づいてペーシングカーブ（導入部→展開前半→展開後半→結末）でペーシング値を算出3. アーク情報がない場合はチャプター番号から概算4. 算出されたペーシング値を返却

**@constructor:** function Object() { [native code] }

##### ContextGenerator.getBasicStoryInfo (method)

基本的なストーリー情報の取得様々なファイルから集約した基本的なストーリー情報を提供します。@private@async@returns {Promise<any>} 基本的なストーリー情報@call-flow1. story-plot.yamlファイルの読み込み2. 世界設定ファイルの読み込み3. テーマトラッカーファイルの読み込み4. キャラクター情報の収集5. 各情報を統合して基本情報を構築6. 結果を返却@error-handlingエラーが発生した場合はログに記録し、最小限の汎用情報を返します。@helper-methods- storageProvider.fileExists - ファイルの存在確認- storageProvider.readFile - ファイル読み込み- parseYaml - YAML形式のパース- getCharactersFromFiles - ファイルからキャラクター情報を取得

**@constructor:** function Object() { [native code] }

##### ContextGenerator.createSmartFallbackContext (method)

スマートフォールバックコンテキストの作成設定ファイルから情報を取得して適応的なフォールバックを提供します。エラーが発生した際に呼び出され、最小限の情報でも有効なコンテキストを生成します。@private@async@param {number} chapterNumber - チャプター番号@returns {Promise<GenerationContext>} フォールバックコンテキスト@call-flow1. 基本的なストーリー情報を取得2. アーク情報の推定3. キャラクター情報の確認と必要に応じて汎用的なキャラクターの提供4. テンションとペーシングの計算5. 汎用的なフォールバック伏線の準備6. ジャンル特有のコンテキストを生成7. 各種情報を統合したフォールバックコンテキストを生成して返却@helper-methods- getBasicStoryInfo - 基本的なストーリー情報の取得@expected-format```{  chapterNumber: 数値,  storyContext: "現在のアーク情報と最近のチャプター情報",  worldSettings: "物語の舞台設定",  theme: "物語のテーマ",  tone: "自然で読みやすい文体",  narrativeStyle: "三人称視点、過去形",  targetLength: 8000,  tension: 0.0～1.0の値,  pacing: 0.0～1.0の値,  characters: キャラクター情報の配列,  shortTermMemory: { chapters: [] },  midTermMemory: { ... },  longTermMemory: { ... }}```

**@constructor:** function Object() { [native code] }


---

### engine.ts {#cnovel-automation-systemsrclibgenerationenginets}

**Path:** `C:/novel-automation-system/src/lib/generation/engine.ts`

@fileoverview 小説生成エンジンモジュール@descriptionこのファイルは、AIを活用した小説のチャプター自動生成機能を提供します。Gemini APIを利用して、指定されたチャプター番号に基づいた一貫性のある新しいチャプターを生成し、その品質分析も行います。@role- 小説生成システムのコア生成エンジンを担当- チャプター生成に必要なコンテキスト取得、プロンプト構築、テキスト生成、結果解析の一連の処理を提供- 生成結果の品質分析と構造化データの抽出@dependencies- ./gemini-client - Gemini APIとの通信を担当するクライアント- ./context-generator - 生成に必要なコンテキスト情報を収集するモジュール- @/lib/utils/logger - ログ記録ユーティリティ- @/lib/utils/error-handler - エラーハンドリングユーティリティ- @/lib/storage - ストレージアクセスプロバイダー- @/lib/utils/yaml-helper - YAML解析ユーティリティ@types- @/types/generation - 生成関連の型定義（GenerationOptions, GenerationContext, CharacterAppearance等）- @/types/chapters - チャプター関連の型定義（Chapter）@api-endpointsこのファイルから使用される/このファイルが実装するAPIエンドポイント:- POST /api/generation/chapter - チャプター生成APIエンドポイント- GET /api/generation/chapter - 生成システム状態確認エンドポイント@flow1. チャプター番号と生成オプションを受け取る2. コンテキストジェネレータから物語コンテキストを取得3. 生成プロンプトを構築4. Gemini APIを通じてテキスト生成5. 生成テキストの解析と構造化6. チャプター分析の実施7. 完成したチャプターオブジェクトの返却

**@constructor:** function Object() { [native code] }

#### GenerationEngine (class)

@fileoverview 小説生成エンジンモジュール@descriptionこのファイルは、AIを活用した小説のチャプター自動生成機能を提供します。Gemini APIを利用して、指定されたチャプター番号に基づいた一貫性のある新しいチャプターを生成し、その品質分析も行います。@role- 小説生成システムのコア生成エンジンを担当- チャプター生成に必要なコンテキスト取得、プロンプト構築、テキスト生成、結果解析の一連の処理を提供- 生成結果の品質分析と構造化データの抽出@dependencies- ./gemini-client - Gemini APIとの通信を担当するクライアント- ./context-generator - 生成に必要なコンテキスト情報を収集するモジュール- @/lib/utils/logger - ログ記録ユーティリティ- @/lib/utils/error-handler - エラーハンドリングユーティリティ- @/lib/storage - ストレージアクセスプロバイダー- @/lib/utils/yaml-helper - YAML解析ユーティリティ@types- @/types/generation - 生成関連の型定義（GenerationOptions, GenerationContext, CharacterAppearance等）- @/types/chapters - チャプター関連の型定義（Chapter）@api-endpointsこのファイルから使用される/このファイルが実装するAPIエンドポイント:- POST /api/generation/chapter - チャプター生成APIエンドポイント- GET /api/generation/chapter - 生成システム状態確認エンドポイント@flow1. チャプター番号と生成オプションを受け取る2. コンテキストジェネレータから物語コンテキストを取得3. 生成プロンプトを構築4. Gemini APIを通じてテキスト生成5. 生成テキストの解析と構造化6. チャプター分析の実施7. 完成したチャプターオブジェクトの返却/
import { GeminiClient } from './gemini-client';
import { ContextGenerator } from './context-generator';
import { logger } from '@/lib/utils/logger';
import { GenerationError } from '@/lib/utils/error-handler';
import {
GenerationOptions,
GenerationContext,
CharacterAppearance,
Scene,
ForeshadowingElement,
ThemeOccurrence,
ChapterAnalysis,
QualityMetrics,
GenerationResult,
GenerateChapterRequest
} from '@/types/generation';
import { Chapter } from '@/types/chapters';
import { storageProvider } from '@/lib/storage';
import { withErrorHandling } from '@/lib/utils/error-handler';
import { parseYaml } from '@/lib/utils/yaml-helper';

/**@class GenerationEngine@description 小説のチャプター生成を担当するクラス@role- AIモデル（Gemini）を使用した小説生成の中核エンジン- コンテキスト取得、プロンプト構築、テキスト生成、結果解析の一連のフローを管理- チャプター内容の品質分析と構造化データ抽出@used-by- src/app/api/generation/chapter/route.ts - チャプター生成APIエンドポイント@depends-on- GeminiClient - AIテキスト生成クライアント- ContextGenerator - 生成コンテキスト取得クラス- storageProvider - ファイルストレージアクセス- logger - ログ記録@lifecycle1. インスタンス化: GeminiClientとContextGeneratorを初期化2. コンテキスト生成: 物語の前後関係情報を取得3. プロンプト構築: AIモデル向けの指示文を構築4. テキスト生成: AIモデルを使用してチャプター内容を生成5. 結果解析: 生成テキストの解析と構造化6. チャプター分析: 内容の品質分析と特徴抽出@example-flowAPIリクエスト → GenerationEngine.generateChapter(chapterNumber, options) →   コンテキスト生成 →  プロンプト構築 →  Gemini APIによるテキスト生成 →  生成テキストのパース →  チャプター分析 →  チャプターオブジェクトの構築と返却

**@constructor:** function Object() { [native code] }

#### Methods of GenerationEngine

##### GenerationEngine.constructor (method)

コンストラクタGenerationEngineクラスのインスタンスを初期化します。内部で使用するGeminiClientとContextGeneratorのインスタンスを生成し、インスタンス化をログに記録します。@constructor@initialization特別な初期化パラメータは不要です。内部的にGeminiClientとContextGeneratorを初期化します。@call-flow1. GeminiClientのインスタンス化2. ContextGeneratorのインスタンス化3. 初期化完了のログ記録@error-handling初期化中にGeminiClientでエラーが発生する可能性があります（APIキー不足など）。このエラーはキャッチされず、呼び出し元に伝播します。

**@constructor:** function Object() { [native code] }

##### GenerationEngine.generateChapter (method)

チャプターの生成指定されたチャプター番号に基づいて小説のチャプターを生成します。コンテキスト取得、プロンプト構築、テキスト生成、結果解析の一連のプロセスを実行し、構造化されたChapterオブジェクトを返します。@async@param {number} chapterNumber チャプター番号@param {GenerateChapterRequest} [options] 生成オプション@returns {Promise<Chapter>} 生成されたチャプター@throws {GenerationError} チャプター生成に失敗した場合@usage// 基本的な呼び出しconst chapter = await generationEngine.generateChapter(1);// オプション付きの呼び出しconst chapter = await generationEngine.generateChapter(2, {  targetLength: 10000,  overrides: {    tension: 0.8,    pacing: 0.6  }});@call-context- 同期/非同期: 非同期メソッド（await必須）- 推奨呼び出し環境: サーバーサイドのみ- 前提条件: 有効なGemini APIキーが設定されていること@call-flow1. 処理開始の記録2. コンテキストの生成3. プロンプトの構築4. テキスト生成の実行5. 生成テキストのパース6. チャプター内容の分析7. Chapterオブジェクトの構築8. 処理完了の記録と結果の返却@called-by- src/app/api/generation/chapter/route.ts - チャプター生成APIエンドポイント@external-dependencies- Gemini API - テキスト生成に使用@helper-methods- generateContext - コンテキスト情報の生成- buildGenerationPrompt - プロンプトの構築- parseGeneratedContent - 生成テキストの解析- analyzeChapter - チャプター内容の分析- countWords - 文字数のカウント@error-handling処理中に発生したエラーはキャッチし、GenerationErrorとしてラップして再スローします。エラー内容はログに記録されます。@monitoring- ログレベル: INFO, DEBUG, ERROR- ログ情報: チャプター番号、オプション、コンテキストサイズ、プロンプト長、生成時間、エラー情報

**@constructor:** function Object() { [native code] }

##### GenerationEngine.generateContext (method)

生成コンテキストの取得チャプター生成に必要なコンテキスト情報をContextGeneratorから取得し、必要に応じてオプションに基づいた上書き設定を適用します。@private@async@param {number} chapterNumber チャプター番号@param {GenerateChapterRequest} [options] 生成オプション@returns {Promise<GenerationContext>} 生成コンテキスト@throws {GenerationError} コンテキスト生成に失敗した場合@call-flow1. ContextGeneratorからベースコンテキストを取得2. オプションによる上書き設定の適用（tension, pacing）3. 目標文字数の設定4. 完成したコンテキストの返却@helper-methods- contextGenerator.generateContext - 基本コンテキストの生成@error-handlingContextGenerator使用時のエラーはログに記録し、GenerationErrorとしてラップして再スローします。

**@constructor:** function Object() { [native code] }

##### GenerationEngine.buildGenerationPrompt (method)

生成プロンプトの構築チャプター番号、コンテキスト情報、オプションを元に、AIモデル向けの生成プロンプトを構築します。@private@param {number} chapterNumber チャプター番号@param {GenerationContext} context 生成コンテキスト@param {GenerateChapterRequest} [options] 生成オプション@returns {string} 構築されたプロンプト@call-flow1. システムプロンプト（基本指示）の構築2. 世界観設定プロンプトの追加3. ストーリーコンテキストプロンプトの追加4. キャラクタープロンプトの追加5. 伏線プロンプトの追加6. テーマと表現スタイルプロンプトの追加7. チャプター構造プロンプトの追加8. 出力形式プロンプトの追加9. 全セクションの結合と完全なプロンプトの返却@helper-methods- formatCharacters - キャラクター情報のフォーマット- formatForeshadowing - 伏線情報のフォーマット

**@constructor:** function Object() { [native code] }

##### GenerationEngine.formatCharacters (method)

キャラクター情報のフォーマット生成プロンプト用にキャラクター情報を構造化テキスト形式にフォーマットします。@private@param {any[]} characters キャラクター情報配列@returns {string} フォーマットされたキャラクター情報@call-flow1. 各キャラクターについて処理2. 基本情報（名前、概要）の追加3. 性格情報の追加（存在する場合）4. 目標情報の追加（存在する場合）5. 現在の状態情報の追加（存在する場合）6. 関係性情報の追加（存在する場合）7. すべてのキャラクター情報を結合して返却

**@constructor:** function Object() { [native code] }

##### GenerationEngine.formatForeshadowing (method)

伏線情報のフォーマット生成プロンプト用に伏線情報を構造化テキスト形式にフォーマットします。@private@param {any[]} foreshadowing 伏線情報配列@returns {string} フォーマットされた伏線情報@call-flow1. 各伏線について処理2. 基本情報（説明）の追加3. 導入章情報の追加（存在する場合）4. 状態情報（未回収/回収済み）の追加5. 想定される回収方法の追加（未回収の場合）6. 優先度情報の追加（存在する場合）7. すべての伏線情報を結合して返却

**@constructor:** function Object() { [native code] }

##### GenerationEngine.parseGeneratedContent (method)

生成コンテンツのパースGemini APIから返された生成テキストを解析し、本文とメタデータに分離します。@private@param {string} generatedText 生成されたテキスト@param {number} chapterNumber チャプター番号@returns {{content: string; metadata: any;}} パースされたコンテンツとメタデータ@call-flow1. 出力のセクション分割（区切り文字`---`で分割）2. フォーマットが不適切な場合のフォールバック処理3. ヘッダーメタデータの解析（YAML形式）4. 本文コンテンツの抽出5. フッターメタデータの解析（YAML形式）6. シーンデータと追加メタデータの抽出7. 全メタデータの統合と結果の返却@error-handlingパース失敗時はエラーをログに記録し、フォールバックとして基本的なメタデータと生成されたコンテンツをそのまま返します。@helper-methods- parseYaml - YAML形式のパース

**@constructor:** function Object() { [native code] }

##### GenerationEngine.analyzeChapter (method)

チャプター内容の分析生成されたチャプター内容をAIモデルを使用して分析し、キャラクターの登場状況、テーマの出現、伏線要素、品質メトリクスなどを抽出します。@private@async@param {string} content チャプターコンテンツ@param {number} chapterNumber チャプター番号@param {GenerationContext} context 生成コンテキスト@returns {Promise<ChapterAnalysis>} チャプター分析結果@call-flow1. 分析プロンプトの構築2. Gemini APIを使用した分析の実行3. JSON形式の分析結果の抽出4. 分析結果のバリデーションと構造化5. 分析結果の各セクションをフォーマット6. 完成した分析オブジェクトの返却@error-handling分析失敗時はエラーをログに記録し、createFallbackAnalysisメソッドを使用して基本的な情報からフォールバック分析結果を生成します。@helper-methods- formatCharacterAppearances - キャラクター登場情報のフォーマット- formatThemeOccurrences - テーマ出現情報のフォーマット- formatForeshadowingElements - 伏線要素のフォーマット- formatQualityMetrics - 品質メトリクスのフォーマット- createFallbackAnalysis - フォールバック分析の作成

**@constructor:** function Object() { [native code] }

##### GenerationEngine.formatCharacterAppearances (method)

キャラクター登場情報のフォーマット分析結果から抽出したキャラクター登場情報を標準形式にフォーマットします。@private@param {any[]} appearances キャラクター登場情報@param {GenerationContext} context 生成コンテキスト@returns {CharacterAppearance[]} フォーマットされたキャラクター登場情報@call-flow1. 入力配列の妥当性検証2. 各キャラクター登場情報について処理3. 必須フィールドの存在確認と標準形式への変換4. デフォルト値の適用（存在しないフィールド用）5. 数値情報の正規化（0-1の範囲に収める）6. フォーマットされた登場情報の配列を返却

**@constructor:** function Object() { [native code] }

##### GenerationEngine.formatThemeOccurrences (method)

テーマ出現情報のフォーマット分析結果から抽出したテーマ出現情報を標準形式にフォーマットします。@private@param {any[]} occurrences テーマ出現情報@param {GenerationContext} context 生成コンテキスト@returns {ThemeOccurrence[]} フォーマットされたテーマ出現情報@call-flow1. 入力配列の妥当性検証2. 各テーマ出現情報について処理3. 必須フィールドの存在確認と標準形式への変換4. デフォルト値の適用（存在しないフィールド用）5. 数値情報の正規化（0-1の範囲に収める）6. フォーマットされたテーマ出現情報の配列を返却

**@constructor:** function Object() { [native code] }

##### GenerationEngine.formatForeshadowingElements (method)

伏線要素のフォーマット分析結果から抽出した伏線要素を標準形式にフォーマットします。@private@param {any[]} elements 伏線要素@param {number} chapterNumber チャプター番号@returns {ForeshadowingElement[]} フォーマットされた伏線要素@call-flow1. 入力配列の妥当性検証2. 各伏線要素について処理3. 必須フィールドの存在確認と標準形式への変換4. デフォルト値の適用（存在しないフィールド用）5. plannedResolutionChapterの検証と標準形式への変換6. フォーマットされた伏線要素の配列を返却

**@constructor:** function Object() { [native code] }

##### GenerationEngine.formatQualityMetrics (method)

品質メトリクスのフォーマット分析結果から抽出した品質メトリクスを標準形式にフォーマットし、値を正規化します。@private@param {any} metrics 品質メトリクス@returns {QualityMetrics} フォーマットされた品質メトリクス@call-flow1. 入力オブジェクトの妥当性検証、無効な場合はデフォルト値を使用2. 値の正規化関数を定義（0-1の範囲に収める）3. 各メトリクス項目を正規化4. overall値の計算（他のメトリクスの平均値または指定値）5. フォーマットされた品質メトリクスオブジェクトを返却

**@constructor:** function Object() { [native code] }

##### GenerationEngine.createFallbackAnalysis (method)

フォールバック分析結果の作成通常の分析が失敗した場合に、コンテキスト情報から基本的な分析結果を生成します。@private@param {number} chapterNumber チャプター番号@param {GenerationContext} context 生成コンテキスト@returns {ChapterAnalysis} フォールバック分析結果@call-flow1. コンテキストからキャラクター情報を抽出2. テーマ情報の生成3. 伏線要素の生成4. 品質メトリクスのデフォルト値設定5. 構造化された分析結果オブジェクトの返却

**@constructor:** function Object() { [native code] }

##### GenerationEngine.countWords (method)

文字数カウントテキストの文字数をカウントします。日本語の場合は文字数をそのままカウントし、半角スペースや記号も1文字としてカウントします。@private@param {string} text テキスト@returns {number} 文字数@call-flow1. テキストの存在確認2. 日本語テキストの文字数をカウント3. カウント結果を返却

**@constructor:** function Object() { [native code] }

##### GenerationEngine.checkStatus (method)

生成エンジンの状態確認GeminiClientのAPIキー有効性確認とモデル情報を取得します。システムの状態確認に使用されます。@async@returns {Promise<{apiKeyValid: boolean; modelInfo: any;}>} 状態情報@call-flow1. GeminiClientのAPIキー検証2. モデル情報の取得3. 状態情報オブジェクトの作成と返却@called-by- src/app/api/generation/chapter/route.ts - 生成システム状態確認API@usage// 基本的な使用方法const status = await generationEngine.checkStatus();console.log(`API Key Valid: ${status.apiKeyValid}`);console.log(`Model: ${status.modelInfo.model}`);

**@constructor:** function Object() { [native code] }

#### generationEngine (variable)

コンストラクタGenerationEngineクラスのインスタンスを初期化します。内部で使用するGeminiClientとContextGeneratorのインスタンスを生成し、インスタンス化をログに記録します。@constructor@initialization特別な初期化パラメータは不要です。内部的にGeminiClientとContextGeneratorを初期化します。@call-flow1. GeminiClientのインスタンス化2. ContextGeneratorのインスタンス化3. 初期化完了のログ記録@error-handling初期化中にGeminiClientでエラーが発生する可能性があります（APIキー不足など）。このエラーはキャッチされず、呼び出し元に伝播します。/
constructor() {
this.geminiClient = new GeminiClient();
this.contextGenerator = new ContextGenerator();
logger.info('GenerationEngine initialized');
}

/**チャプターの生成指定されたチャプター番号に基づいて小説のチャプターを生成します。コンテキスト取得、プロンプト構築、テキスト生成、結果解析の一連のプロセスを実行し、構造化されたChapterオブジェクトを返します。@async@param {number} chapterNumber チャプター番号@param {GenerateChapterRequest} [options] 生成オプション@returns {Promise<Chapter>} 生成されたチャプター@throws {GenerationError} チャプター生成に失敗した場合@usage// 基本的な呼び出しconst chapter = await generationEngine.generateChapter(1);// オプション付きの呼び出しconst chapter = await generationEngine.generateChapter(2, {  targetLength: 10000,  overrides: {    tension: 0.8,    pacing: 0.6  }});@call-context- 同期/非同期: 非同期メソッド（await必須）- 推奨呼び出し環境: サーバーサイドのみ- 前提条件: 有効なGemini APIキーが設定されていること@call-flow1. 処理開始の記録2. コンテキストの生成3. プロンプトの構築4. テキスト生成の実行5. 生成テキストのパース6. チャプター内容の分析7. Chapterオブジェクトの構築8. 処理完了の記録と結果の返却@called-by- src/app/api/generation/chapter/route.ts - チャプター生成APIエンドポイント@external-dependencies- Gemini API - テキスト生成に使用@helper-methods- generateContext - コンテキスト情報の生成- buildGenerationPrompt - プロンプトの構築- parseGeneratedContent - 生成テキストの解析- analyzeChapter - チャプター内容の分析- countWords - 文字数のカウント@error-handling処理中に発生したエラーはキャッチし、GenerationErrorとしてラップして再スローします。エラー内容はログに記録されます。@monitoring- ログレベル: INFO, DEBUG, ERROR- ログ情報: チャプター番号、オプション、コンテキストサイズ、プロンプト長、生成時間、エラー情報/
async generateChapter(
chapterNumber: number,
options?: GenerateChapterRequest
): Promise<Chapter> {
const startTime = Date.now();
logger.info(`Starting chapter ${chapterNumber} generation`, { options });

try {
// 1. コンテキストの生成
const context = await this.generateContext(chapterNumber, options);
logger.debug('Context generation completed', {
chapterNumber,
contextSize: JSON.stringify(context).length,
characterCount: context.characters?.length || 0
});

// 2. プロンプトの構築
const prompt = this.buildGenerationPrompt(chapterNumber, context, options);
logger.debug('Built generation prompt', {
chapterNumber,
promptLength: prompt.length
});

// 3. テキスト生成
const generatedText = await this.geminiClient.generateText(prompt, {
targetLength: options?.targetLength || 8000,
temperature: 0.75, // 文学的創造性のために少し高めに設定
overrides: options?.overrides
});

// 4. 生成テキストのパース
const { content, metadata } = this.parseGeneratedContent(generatedText, chapterNumber);

// 5. チャプターオブジェクトの構築
const chapter: Chapter = {
id: `chapter-${chapterNumber}`,
title: metadata.title || `第${chapterNumber}章`,
chapterNumber: chapterNumber,
content: content,
wordCount: this.countWords(content),
createdAt: new Date(),
updatedAt: new Date(),
summary: metadata.summary || '',
scenes: metadata.scenes || [],
analysis: await this.analyzeChapter(content, chapterNumber, context),
metadata: {
pov: metadata.pov || '',
location: metadata.location || '',
timeframe: metadata.timeframe || '',
emotionalTone: metadata.emotionalTone || '',
keywords: metadata.keywords || [],
qualityScore: 0, // 初期値、後で検証システムにより更新される
events: metadata.events || [],
characters: metadata.characters || [],
foreshadowing: metadata.foreshadowing || [],
resolutions: metadata.resolutions || [],
correctionHistory: [],
updatedAt: new Date(),
generationVersion: '1.0',
generationTime: Date.now() - startTime
}
};

logger.info(`Chapter ${chapterNumber} generation completed`, {
generationTimeMs: Date.now() - startTime,
contentLength: content.length,
sceneCount: (metadata.scenes || []).length
});

return chapter;
} catch (error) {
logger.error(`Failed to generate chapter ${chapterNumber}`, {
error: error instanceof Error ? error.message : String(error),
stack: error instanceof Error ? error.stack : undefined
});
throw new GenerationError(
`Chapter ${chapterNumber} generation failed: ${error instanceof Error ? error.message : String(error)}`,
'CHAPTER_GENERATION_FAILED'
);
}
}

/**生成コンテキストの取得チャプター生成に必要なコンテキスト情報をContextGeneratorから取得し、必要に応じてオプションに基づいた上書き設定を適用します。@private@async@param {number} chapterNumber チャプター番号@param {GenerateChapterRequest} [options] 生成オプション@returns {Promise<GenerationContext>} 生成コンテキスト@throws {GenerationError} コンテキスト生成に失敗した場合@call-flow1. ContextGeneratorからベースコンテキストを取得2. オプションによる上書き設定の適用（tension, pacing）3. 目標文字数の設定4. 完成したコンテキストの返却@helper-methods- contextGenerator.generateContext - 基本コンテキストの生成@error-handlingContextGenerator使用時のエラーはログに記録し、GenerationErrorとしてラップして再スローします。/
private async generateContext(
chapterNumber: number,
options?: GenerateChapterRequest
): Promise<GenerationContext> {
try {
// コンテキストジェネレータから基本コンテキストを取得
const baseContext = await this.contextGenerator.generateContext(chapterNumber);

// オプションによる上書き設定の適用
if (options?.overrides) {
if (options.overrides.tension !== undefined) {
baseContext.tension = options.overrides.tension;
}
if (options.overrides.pacing !== undefined) {
baseContext.pacing = options.overrides.pacing;
}
}

// 目標文字数の設定
if (options?.targetLength) {
baseContext.targetLength = options.targetLength;
}

return baseContext;
} catch (error) {
logger.error(`Failed to generate context for chapter ${chapterNumber}`, {
error: error instanceof Error ? error.message : String(error)
});
throw new GenerationError(
`Context generation failed: ${error instanceof Error ? error.message : String(error)}`,
'CONTEXT_GENERATION_FAILED'
);
}
}

/**生成プロンプトの構築チャプター番号、コンテキスト情報、オプションを元に、AIモデル向けの生成プロンプトを構築します。@private@param {number} chapterNumber チャプター番号@param {GenerationContext} context 生成コンテキスト@param {GenerateChapterRequest} [options] 生成オプション@returns {string} 構築されたプロンプト@call-flow1. システムプロンプト（基本指示）の構築2. 世界観設定プロンプトの追加3. ストーリーコンテキストプロンプトの追加4. キャラクタープロンプトの追加5. 伏線プロンプトの追加6. テーマと表現スタイルプロンプトの追加7. チャプター構造プロンプトの追加8. 出力形式プロンプトの追加9. 全セクションの結合と完全なプロンプトの返却@helper-methods- formatCharacters - キャラクター情報のフォーマット- formatForeshadowing - 伏線情報のフォーマット/
private buildGenerationPrompt(
chapterNumber: number,
context: GenerationContext,
options?: GenerateChapterRequest
): string {
// システムプロンプト（AIへの基本指示）
const systemPrompt = `あなたは日本の小説家です。以下の情報を元に、第${chapterNumber}章を執筆してください。
一貫性があり、魅力的な物語を創造することを心がけてください。
約${options?.targetLength || 8000}文字程度の章を生成し、読者を引き込む表現で書いてください。`;

// 世界観設定プロンプト
const worldSettingsPrompt = context.worldSettings
? `# 世界観設定\n${context.worldSettings}\n\n`
: '';

// ストーリーコンテキストプロンプト
const storyContextPrompt = context.storyContext
? `# これまでのストーリー\n${context.storyContext}\n\n`
: '';

// キャラクタープロンプト
const charactersPrompt = context.characters && context.characters.length > 0
? `# 登場キャラクター\n${this.formatCharacters(context.characters)}\n\n`
: '';

// 伏線プロンプト
const foreshadowingPrompt = context.foreshadowing && context.foreshadowing.length > 0
? `# 伏線\n${this.formatForeshadowing(context.foreshadowing)}\n\n`
: '';

// テーマと表現スタイルプロンプト
const themeAndStylePrompt = `# テーマと表現スタイル
テーマ: ${context.theme || '物語のテーマは自由に解釈してください'}
トーン: ${context.tone || '自然で読みやすい文体'}
ナラティブスタイル: ${context.narrativeStyle || '三人称視点、過去形'}

`;

// チャプター構造プロンプト
const chapterStructurePrompt = `# 第${chapterNumber}章の構成
以下の構造で章を構成してください:
1. シーン展開: 複数のシーンで構成し、各シーンは明確な目的を持つこと
2. 適切な起承転結: 章の中でも小さなストーリーアークを形成すること
3. キャラクターの相互作用: 会話と行動を通じて関係性を描くこと
4. 伏線の配置または回収: 適宜、物語に深みを与える要素を含めること

`;

// 出力形式プロンプト
const outputFormatPrompt = `# 出力形式
以下の形式で出力してください:

---
title: 【章のタイトル】
pov: 【視点キャラクター】
location: 【主な舞台】
timeframe: 【時間設定】
emotionalTone: 【感情基調】
summary: 【章の要約（100文字程度）】
---

【本文】

---
scenes:
- title: 【シーン1タイトル】
type: 【INTRODUCTION/DEVELOPMENT/CLIMAX/RESOLUTION/TRANSITION】
characters: 【登場キャラクター（カンマ区切り）】
location: 【場所】
summary: 【シーンの要約】
- title: 【シーン2タイトル】
type: 【シーンタイプ】
characters: 【登場キャラクター】
location: 【場所】
summary: 【シーンの要約】
keywords: 【重要キーワード（カンマ区切り）】
events: 【主要イベント（カンマ区切り）】
---

注意:
- 指定された文字数（${options?.targetLength || 8000}文字程度）を守ってください
- キャラクターの一貫性を維持してください
- メタデータ（タイトル、視点、場所など）は必ず含めてください
- 日本語で執筆してください`;

// 完全なプロンプトの構築
const fullPrompt = [
systemPrompt,
worldSettingsPrompt,
storyContextPrompt,
charactersPrompt,
foreshadowingPrompt,
themeAndStylePrompt,
chapterStructurePrompt,
outputFormatPrompt
].join('\n');

return fullPrompt;
}

/**キャラクター情報のフォーマット生成プロンプト用にキャラクター情報を構造化テキスト形式にフォーマットします。@private@param {any[]} characters キャラクター情報配列@returns {string} フォーマットされたキャラクター情報@call-flow1. 各キャラクターについて処理2. 基本情報（名前、概要）の追加3. 性格情報の追加（存在する場合）4. 目標情報の追加（存在する場合）5. 現在の状態情報の追加（存在する場合）6. 関係性情報の追加（存在する場合）7. すべてのキャラクター情報を結合して返却/
private formatCharacters(characters: any[]): string {
return characters.map(char => {
let charInfo = `- ${char.name || 'Unknown'}:`;

if (char.description) {
charInfo += `\n  概要: ${char.description}`;
}

if (char.personality) {
charInfo += `\n  性格: ${char.personality}`;
}

if (char.goals) {
charInfo += `\n  目標: ${char.goals}`;
}

if (char.currentState) {
charInfo += `\n  現在の状態: ${char.currentState}`;
}

if (char.relationships && char.relationships.length > 0) {
charInfo += `\n  関係性:`;
char.relationships.forEach((rel: any) => {
charInfo += `\n    - ${rel.character}: ${rel.relation}`;
});
}

return charInfo;
}).join('\n\n');
}

/**伏線情報のフォーマット生成プロンプト用に伏線情報を構造化テキスト形式にフォーマットします。@private@param {any[]} foreshadowing 伏線情報配列@returns {string} フォーマットされた伏線情報@call-flow1. 各伏線について処理2. 基本情報（説明）の追加3. 導入章情報の追加（存在する場合）4. 状態情報（未回収/回収済み）の追加5. 想定される回収方法の追加（未回収の場合）6. 優先度情報の追加（存在する場合）7. すべての伏線情報を結合して返却/
private formatForeshadowing(foreshadowing: any[]): string {
return foreshadowing.map(fore => {
let foreInfo = `- ${fore.description || '未定義の伏線'}`;

if (fore.chapter_introduced) {
foreInfo += `\n  導入章: ${fore.chapter_introduced}章`;
}

if (fore.resolved === false) {
foreInfo += `\n  状態: まだ回収されていません`;

if (fore.potential_resolution) {
foreInfo += `\n  想定される回収: ${fore.potential_resolution}`;
}
} else if (fore.resolved === true) {
foreInfo += `\n  状態: 回収済み（${fore.resolution_chapter || '章不明'}章）`;
}

if (fore.urgency) {
foreInfo += `\n  優先度: ${fore.urgency}`;
}

return foreInfo;
}).join('\n\n');
}

/**生成コンテンツのパースGemini APIから返された生成テキストを解析し、本文とメタデータに分離します。@private@param {string} generatedText 生成されたテキスト@param {number} chapterNumber チャプター番号@returns {{content: string; metadata: any;}} パースされたコンテンツとメタデータ@call-flow1. 出力のセクション分割（区切り文字`---`で分割）2. フォーマットが不適切な場合のフォールバック処理3. ヘッダーメタデータの解析（YAML形式）4. 本文コンテンツの抽出5. フッターメタデータの解析（YAML形式）6. シーンデータと追加メタデータの抽出7. 全メタデータの統合と結果の返却@error-handlingパース失敗時はエラーをログに記録し、フォールバックとして基本的なメタデータと生成されたコンテンツをそのまま返します。@helper-methods- parseYaml - YAML形式のパース/
private parseGeneratedContent(generatedText: string, chapterNumber: number): {
content: string;
metadata: any;
} {
try {
// 出力のセクション分割（3つのセクションを想定）
const sections = generatedText.split(/---\n/g);

if (sections.length < 3) {
logger.warn(`Generated content for chapter ${chapterNumber} has improper formatting`, {
sectionsCount: sections.length
});

// フォールバック: 基本的なメタデータと生成されたコンテンツをそのまま返す
return {
content: generatedText,
metadata: {
title: `第${chapterNumber}章`,
summary: `自動生成された第${chapterNumber}章`,
pov: '',
location: '',
timeframe: '',
emotionalTone: '',
keywords: [],
scenes: []
}
};
}

// ヘッダーメタデータの解析（YAMLフォーマット）
const headerMetadata = parseYaml(sections[1]);

// 本文コンテンツ
const content = sections[2].trim();

// フッターメタデータの解析（YAMLフォーマット）
const footerSection = sections[3] || '';

// シーンデータと追加メタデータの抽出
let scenes: Scene[] = [];
let keywords: string[] = [];
let events: string[] = [];

try {
const footerData = parseYaml(footerSection);

// シーン情報の処理
if (footerData.scenes && Array.isArray(footerData.scenes)) {
scenes = footerData.scenes.map((scene: any, index: number) => {
return {
id: `scene-${chapterNumber}-${index + 1}`,
type: scene.type || 'DEVELOPMENT',
title: scene.title || `シーン${index + 1}`,
characters: scene.characters ?
(typeof scene.characters === 'string' ? scene.characters.split(',').map((c: string) => c.trim()) : scene.characters) :
[],
startPosition: 0, // 簡易実装のため0を設定
endPosition: 0,   // 後で解析して更新する必要あり
summary: scene.summary || '',
location: scene.location || '',
emotionalTone: scene.emotionalTone || '',
tension: 0.5 // デフォルト値
};
});
}

// キーワードの処理
if (footerData.keywords) {
keywords = typeof footerData.keywords === 'string' ?
footerData.keywords.split(',').map((k: string) => k.trim()) :
footerData.keywords;
}

// イベントの処理
if (footerData.events) {
events = typeof footerData.events === 'string' ?
footerData.events.split(',').map((e: string) => e.trim()) :
footerData.events;
}
} catch (error) {
logger.warn(`Failed to parse footer metadata for chapter ${chapterNumber}`, {
error: error instanceof Error ? error.message : String(error)
});
}

// 全メタデータの統合
const metadata = {
...headerMetadata,
scenes,
keywords,
events
};

return { content, metadata };
} catch (error) {
logger.error(`Failed to parse generated content for chapter ${chapterNumber}`, {
error: error instanceof Error ? error.message : String(error),
stack: error instanceof Error ? error.stack : undefined
});

// エラー時のフォールバック
return {
content: generatedText,
metadata: {
title: `第${chapterNumber}章`,
summary: `自動生成された第${chapterNumber}章`,
scenes: []
}
};
}
}

/**チャプター内容の分析生成されたチャプター内容をAIモデルを使用して分析し、キャラクターの登場状況、テーマの出現、伏線要素、品質メトリクスなどを抽出します。@private@async@param {string} content チャプターコンテンツ@param {number} chapterNumber チャプター番号@param {GenerationContext} context 生成コンテキスト@returns {Promise<ChapterAnalysis>} チャプター分析結果@call-flow1. 分析プロンプトの構築2. Gemini APIを使用した分析の実行3. JSON形式の分析結果の抽出4. 分析結果のバリデーションと構造化5. 分析結果の各セクションをフォーマット6. 完成した分析オブジェクトの返却@error-handling分析失敗時はエラーをログに記録し、createFallbackAnalysisメソッドを使用して基本的な情報からフォールバック分析結果を生成します。@helper-methods- formatCharacterAppearances - キャラクター登場情報のフォーマット- formatThemeOccurrences - テーマ出現情報のフォーマット- formatForeshadowingElements - 伏線要素のフォーマット- formatQualityMetrics - 品質メトリクスのフォーマット- createFallbackAnalysis - フォールバック分析の作成/
private async analyzeChapter(
content: string,
chapterNumber: number,
context: GenerationContext
): Promise<ChapterAnalysis> {
// 分析プロンプトの構築
const analysisPrompt = `
以下のチャプター内容を分析し、キャラクターの登場状況、テーマの出現、伏線要素、品質メトリクスを詳細に抽出してください。
JSON形式で出力してください。

# チャプター内容
${content.substring(0, 10000)}  // 長すぎる場合は一部を切り出す

# 分析項目
1. characterAppearances: 登場キャラクター分析
2. themeOccurrences: テーマ出現分析
3. foreshadowingElements: 伏線要素分析
4. qualityMetrics: 品質メトリクス分析

# JSON出力形式
{
"characterAppearances": [
{
"characterId": "キャラクターID",
"characterName": "キャラクター名",
"scenes": ["シーンID", ...],
"dialogueCount": 会話数,
"significance": 重要度(0-1),
"actions": ["行動1", "行動2", ...],
"emotions": ["感情1", "感情2", ...]
}
],
"themeOccurrences": [
{
"themeId": "テーマID",
"themeName": "テーマ名",
"expressions": ["表現1", "表現2", ...],
"strength": 強度(0-1),
"contexts": ["コンテキスト1", "コンテキスト2", ...]
}
],
"foreshadowingElements": [
{
"id": "伏線ID",
"description": "伏線の説明",
"position": テキスト位置,
"text": "伏線テキスト",
"plannedResolutionChapter": [最小章, 最大章],
"relatedCharacters": ["関連キャラクター1", ...]
}
],
"qualityMetrics": {
"readability": 読みやすさ(0-1),
"consistency": 整合性(0-1),
"engagement": 引き込み度(0-1),
"characterDepiction": キャラクター描写(0-1),
"originality": オリジナリティ(0-1),
"overall": 総合スコア(0-1)
}
}`;

try {
// 分析用のプロンプトを実行
const analysisResponse = await this.geminiClient.generateText(analysisPrompt, {
temperature: 0.1, // 分析タスクのため低温に設定
targetLength: 3000
});

// JSONレスポンスの解析
let analysis: ChapterAnalysis;

try {
// JSON文字列を抽出（マークダウンコードブロックからの抽出も考慮）
const jsonMatch = analysisResponse.match(/```(?:json)?\s*({[\s\S]*?})\s*```/) ||
analysisResponse.match(/{[\s\S]*?}/);

const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : analysisResponse;
const parsedAnalysis = JSON.parse(jsonStr);

// 基本構造の検証
if (!parsedAnalysis.characterAppearances ||
!parsedAnalysis.themeOccurrences ||
!parsedAnalysis.foreshadowingElements ||
!parsedAnalysis.qualityMetrics) {
throw new Error('Invalid analysis structure');
}

// 型強制と整形
analysis = {
characterAppearances: this.formatCharacterAppearances(parsedAnalysis.characterAppearances, context),
themeOccurrences: this.formatThemeOccurrences(parsedAnalysis.themeOccurrences, context),
foreshadowingElements: this.formatForeshadowingElements(parsedAnalysis.foreshadowingElements, chapterNumber),
qualityMetrics: this.formatQualityMetrics(parsedAnalysis.qualityMetrics),
detectedIssues: []
};
} catch (parseError) {
logger.error(`Failed to parse analysis response for chapter ${chapterNumber}`, {
error: parseError instanceof Error ? parseError.message : String(parseError),
response: analysisResponse.substring(0, 500) // 長すぎるレスポンスはログしない
});

// フォールバック分析結果
analysis = this.createFallbackAnalysis(chapterNumber, context);
}

return analysis;
} catch (error) {
logger.warn(`Chapter analysis failed for chapter ${chapterNumber}`, {
error: error instanceof Error ? error.message : String(error)
});

// 分析に失敗した場合はフォールバック分析結果を返す
return this.createFallbackAnalysis(chapterNumber, context);
}
}

/**キャラクター登場情報のフォーマット分析結果から抽出したキャラクター登場情報を標準形式にフォーマットします。@private@param {any[]} appearances キャラクター登場情報@param {GenerationContext} context 生成コンテキスト@returns {CharacterAppearance[]} フォーマットされたキャラクター登場情報@call-flow1. 入力配列の妥当性検証2. 各キャラクター登場情報について処理3. 必須フィールドの存在確認と標準形式への変換4. デフォルト値の適用（存在しないフィールド用）5. 数値情報の正規化（0-1の範囲に収める）6. フォーマットされた登場情報の配列を返却/
private formatCharacterAppearances(
appearances: any[],
context: GenerationContext
): CharacterAppearance[] {
if (!appearances || !Array.isArray(appearances)) {
return [];
}

return appearances.map(appearance => ({
characterId: appearance.characterId || `char-${appearance.characterName?.replace(/\s+/g, '-').toLowerCase() || 'unknown'}`,
characterName: appearance.characterName || 'Unknown Character',
scenes: Array.isArray(appearance.scenes) ? appearance.scenes : [],
dialogueCount: typeof appearance.dialogueCount === 'number' ? appearance.dialogueCount : 0,
significance: typeof appearance.significance === 'number' ?
Math.max(0, Math.min(1, appearance.significance)) : 0.5,
actions: Array.isArray(appearance.actions) ? appearance.actions : [],
emotions: Array.isArray(appearance.emotions) ? appearance.emotions : []
}));
}

/**テーマ出現情報のフォーマット分析結果から抽出したテーマ出現情報を標準形式にフォーマットします。@private@param {any[]} occurrences テーマ出現情報@param {GenerationContext} context 生成コンテキスト@returns {ThemeOccurrence[]} フォーマットされたテーマ出現情報@call-flow1. 入力配列の妥当性検証2. 各テーマ出現情報について処理3. 必須フィールドの存在確認と標準形式への変換4. デフォルト値の適用（存在しないフィールド用）5. 数値情報の正規化（0-1の範囲に収める）6. フォーマットされたテーマ出現情報の配列を返却/
private formatThemeOccurrences(
occurrences: any[],
context: GenerationContext
): ThemeOccurrence[] {
if (!occurrences || !Array.isArray(occurrences)) {
return [];
}

return occurrences.map(occurrence => ({
themeId: occurrence.themeId || `theme-${occurrence.themeName?.replace(/\s+/g, '-').toLowerCase() || 'unknown'}`,
themeName: occurrence.themeName || 'Unknown Theme',
expressions: Array.isArray(occurrence.expressions) ? occurrence.expressions : [],
strength: typeof occurrence.strength === 'number' ?
Math.max(0, Math.min(1, occurrence.strength)) : 0.5,
theme: occurrence.theme || occurrence.themeName || '',
contexts: Array.isArray(occurrence.contexts) ? occurrence.contexts : []
}));
}

/**伏線要素のフォーマット分析結果から抽出した伏線要素を標準形式にフォーマットします。@private@param {any[]} elements 伏線要素@param {number} chapterNumber チャプター番号@returns {ForeshadowingElement[]} フォーマットされた伏線要素@call-flow1. 入力配列の妥当性検証2. 各伏線要素について処理3. 必須フィールドの存在確認と標準形式への変換4. デフォルト値の適用（存在しないフィールド用）5. plannedResolutionChapterの検証と標準形式への変換6. フォーマットされた伏線要素の配列を返却/
private formatForeshadowingElements(
elements: any[],
chapterNumber: number
): ForeshadowingElement[] {
if (!elements || !Array.isArray(elements)) {
return [];
}

return elements.map((element, index) => ({
id: element.id || `foreshadowing-${chapterNumber}-${index + 1}`,
description: element.description || 'Undefined foreshadowing element',
position: typeof element.position === 'number' ? element.position : 0,
text: element.text || '',
plannedResolutionChapter: Array.isArray(element.plannedResolutionChapter) && element.plannedResolutionChapter.length === 2 ?
element.plannedResolutionChapter as [number, number] : [chapterNumber + 2, chapterNumber + 10],
relatedCharacters: Array.isArray(element.relatedCharacters) ? element.relatedCharacters : [],
element: element.element || element.description || '',
chapter: chapterNumber,
resolutionChapter: element.resolutionChapter,
isResolved: element.isResolved || false
}));
}

/**品質メトリクスのフォーマット分析結果から抽出した品質メトリクスを標準形式にフォーマットし、値を正規化します。@private@param {any} metrics 品質メトリクス@returns {QualityMetrics} フォーマットされた品質メトリクス@call-flow1. 入力オブジェクトの妥当性検証、無効な場合はデフォルト値を使用2. 値の正規化関数を定義（0-1の範囲に収める）3. 各メトリクス項目を正規化4. overall値の計算（他のメトリクスの平均値または指定値）5. フォーマットされた品質メトリクスオブジェクトを返却/
private formatQualityMetrics(metrics: any): QualityMetrics {
if (!metrics || typeof metrics !== 'object') {
// デフォルト値
return {
readability: 0.7,
consistency: 0.7,
engagement: 0.7,
characterDepiction: 0.7,
originality: 0.7,
overall: 0.7,
coherence: 0.7,
characterConsistency: 0.7
};
}

// 値の正規化（0-1の範囲に収める）
const normalize = (value: any) => {
if (typeof value !== 'number') return 0.7;
return Math.max(0, Math.min(1, value));
};

return {
readability: normalize(metrics.readability),
consistency: normalize(metrics.consistency),
engagement: normalize(metrics.engagement),
characterDepiction: normalize(metrics.characterDepiction),
originality: normalize(metrics.originality),
overall: normalize(metrics.overall ||
((metrics.readability || 0) +
(metrics.consistency || 0) +
(metrics.engagement || 0) +
(metrics.characterDepiction || 0) +
(metrics.originality || 0)) / 5),
coherence: normalize(metrics.coherence || metrics.consistency),
characterConsistency: normalize(metrics.characterConsistency || metrics.characterDepiction)
};
}

/**フォールバック分析結果の作成通常の分析が失敗した場合に、コンテキスト情報から基本的な分析結果を生成します。@private@param {number} chapterNumber チャプター番号@param {GenerationContext} context 生成コンテキスト@returns {ChapterAnalysis} フォールバック分析結果@call-flow1. コンテキストからキャラクター情報を抽出2. テーマ情報の生成3. 伏線要素の生成4. 品質メトリクスのデフォルト値設定5. 構造化された分析結果オブジェクトの返却/
private createFallbackAnalysis(
chapterNumber: number,
context: GenerationContext
): ChapterAnalysis {
// コンテキストからキャラクター情報を抽出
const characterAppearances: CharacterAppearance[] = (context.characters || [])
.slice(0, 5) // 最大5キャラクター
.map((char: any, index: number) => ({
characterId: `char-${char.name?.replace(/\s+/g, '-').toLowerCase() || `unknown-${index}`}`,
characterName: char.name || `Character ${index + 1}`,
scenes: [`scene-${chapterNumber}-1`],
dialogueCount: 5,
significance: 0.8 - (index * 0.1), // 重要度を少しずつ下げる
actions: [],
emotions: []
}));

// テーマ情報
const themeOccurrences: ThemeOccurrence[] = context.theme ?
[{
themeId: `theme-main`,
themeName: typeof context.theme === 'string' ? context.theme : 'Main Theme',
expressions: [],
strength: 0.8,
theme: typeof context.theme === 'string' ? context.theme : 'Main Theme',
contexts: []
}] : [];

// 伏線要素
const foreshadowingElements: ForeshadowingElement[] = (context.foreshadowing || [])
.slice(0, 3) // 最大3伏線
.map((fore: any, index: number) => ({
id: `foreshadowing-${chapterNumber}-${index + 1}`,
description: typeof fore === 'string' ? fore : `Foreshadowing element ${index + 1}`,
position: 500 * (index + 1), // 適当な位置
text: '',
plannedResolutionChapter: [chapterNumber + 2, chapterNumber + 10] as [number, number],
relatedCharacters: [],
element: typeof fore === 'string' ? fore : `Foreshadowing element ${index + 1}`,
chapter: chapterNumber,
resolutionChapter: undefined,
isResolved: false
}));

// 品質メトリクス
const qualityMetrics: QualityMetrics = {
readability: 0.75,
consistency: 0.7,
engagement: 0.7,
characterDepiction: 0.7,
originality: 0.65,
overall: 0.7,
coherence: 0.7,
characterConsistency: 0.7
};

return {
characterAppearances,
themeOccurrences,
foreshadowingElements,
qualityMetrics,
detectedIssues: []
};
}

/**文字数カウントテキストの文字数をカウントします。日本語の場合は文字数をそのままカウントし、半角スペースや記号も1文字としてカウントします。@private@param {string} text テキスト@returns {number} 文字数@call-flow1. テキストの存在確認2. 日本語テキストの文字数をカウント3. カウント結果を返却/
private countWords(text: string): number {
if (!text) return 0;

// 日本語の場合は文字数をそのままカウント
// 半角スペースや記号も1文字としてカウント
return text.length;
}

/**生成エンジンの状態確認GeminiClientのAPIキー有効性確認とモデル情報を取得します。システムの状態確認に使用されます。@async@returns {Promise<{apiKeyValid: boolean; modelInfo: any;}>} 状態情報@call-flow1. GeminiClientのAPIキー検証2. モデル情報の取得3. 状態情報オブジェクトの作成と返却@called-by- src/app/api/generation/chapter/route.ts - 生成システム状態確認API@usage// 基本的な使用方法const status = await generationEngine.checkStatus();console.log(`API Key Valid: ${status.apiKeyValid}`);console.log(`Model: ${status.modelInfo.model}`);/
async checkStatus(): Promise<{
apiKeyValid: boolean;
modelInfo: any;
}> {
const apiKeyValid = await this.geminiClient.validateApiKey();
const modelInfo = this.geminiClient.getModelInfo();

return {
apiKeyValid,
modelInfo
};
}
}

/**GenerationEngineのシングルトンインスタンスシステム全体で共有されるGenerationEngineのインスタンスです。@type {GenerationEngine}@singletonアプリケーション全体で単一のインスタンスを共有し、初期化コストの削減と一貫した状態管理を実現します。@initializationアプリケーション起動時に自動的に初期化されます。@usage// 直接インポートして使用import { generationEngine } from '@/lib/generation/engine';const status = await generationEngine.checkStatus();/

/**エラーハンドリング機能付きチャプター生成関数GenerationEngineのgenerateChapterメソッドをエラーハンドリングでラップした関数です。@type {(chapterNumber: number, options?: GenerateChapterRequest) => Promise<Chapter>}@wrapperwithErrorHandling関数でラップされており、エラー発生時の一貫した処理を提供します。@api-equivalentPOST /api/generation/chapter?chapterNumber=1Request: { targetLength, forcedGeneration, overrides }Response: { chapter }@usage// エラーハンドリング付き関数の使用import { generateChapter } from '@/lib/generation/engine';try {  const chapter = await generateChapter(1, { targetLength: 8000 });  // 結果の処理} catch (error) {  // エラー処理}

**@constructor:** function Object() { [native code] }


---

### gemini-client.ts {#cnovel-automation-systemsrclibgenerationgemini-clientts}

**Path:** `C:/novel-automation-system/src/lib/generation/gemini-client.ts`

@fileoverview Gemini AIサービス用クライアントモジュール@descriptionGoogle Gemini AIモデルとの通信を行い、テキスト生成機能を提供するクライアントクラスを実装します。このモジュールはテキスト生成処理の中核となり、API呼び出し、エラーハンドリング、再試行ロジック、トークン計算などを担当します。@role- テキスト生成サービスの基盤モジュール- 外部AIサービス（Google Gemini API）とのインターフェース- リトライとエラーハンドリングの実装- トークン数計算と制限管理@dependencies- @google/generative-ai - Google Gemini APIとの通信ライブラリ- @/lib/utils/logger - ログ出力ユーティリティ- @/lib/utils/error-handler - エラーハンドリングユーティリティ@types- @/types/generation - 生成関連の型定義（GenerationOptions）@flow1. 環境変数からの設定読み込みとクライアント初期化2. テキスト生成リクエストの受付と前処理3. APIへのリクエスト送信とレスポンス処理4. エラー発生時の再試行ロジック実行5. 生成結果の返却とログ記録

**@constructor:** function Object() { [native code] }

#### GeminiClient (class)

@fileoverview Gemini AIサービス用クライアントモジュール@descriptionGoogle Gemini AIモデルとの通信を行い、テキスト生成機能を提供するクライアントクラスを実装します。このモジュールはテキスト生成処理の中核となり、API呼び出し、エラーハンドリング、再試行ロジック、トークン計算などを担当します。@role- テキスト生成サービスの基盤モジュール- 外部AIサービス（Google Gemini API）とのインターフェース- リトライとエラーハンドリングの実装- トークン数計算と制限管理@dependencies- @google/generative-ai - Google Gemini APIとの通信ライブラリ- @/lib/utils/logger - ログ出力ユーティリティ- @/lib/utils/error-handler - エラーハンドリングユーティリティ@types- @/types/generation - 生成関連の型定義（GenerationOptions）@flow1. 環境変数からの設定読み込みとクライアント初期化2. テキスト生成リクエストの受付と前処理3. APIへのリクエスト送信とレスポンス処理4. エラー発生時の再試行ロジック実行5. 生成結果の返却とログ記録/

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { logger } from '@/lib/utils/logger';
import { GenerationError, ExternalServiceError } from '@/lib/utils/error-handler';
import { GenerationOptions } from '@/types/generation';

/**@class GeminiClient@descriptionGemini APIクライアント。テキスト生成の中核となるクラス。Google Gemini APIとの通信を管理し、エラーハンドリング、再試行ロジック、トークン計算機能を提供します。@role- Google Gemini APIとの通信担当- テキスト生成リクエストの管理と処理- エラー発生時の再試行処理と適応的バックオフの実装- トークン数の計算と推定@depends-on- GoogleGenerativeAI - Google提供のAIクライアントライブラリ- logger - ログ出力機能- GenerationError - 生成処理関連のエラークラス- ExternalServiceError - 外部サービス関連のエラークラス@lifecycle1. 環境変数からの設定読み込みとクライアント初期化2. テキスト生成機能の提供3. エラー発生時の再試行と適応的バックオフ4. APIキー検証機能の提供@example-flowアプリケーション → GeminiClient.generateText →   内部でのトークン計算 →   Gemini API呼び出し →   レスポンス処理/エラー処理 →   結果の返却

**@constructor:** function Object() { [native code] }

#### Methods of GeminiClient

##### GeminiClient.constructor (method)

GeminiClientのコンストラクタ環境変数から設定を読み込み、Google Gemini APIクライアントを初期化します。API_KEY、モデル名、API URL、再試行回数などの設定を行います。@constructor@usage// 初期化方法const geminiClient = new GeminiClient();@call-flow1. 環境変数からAPIキーの取得2. APIキー存在確認3. GoogleGenerativeAIクライアントの初期化4. モデル名、API URL、再試行回数の設定5. 初期化ログの出力@initialization以下の環境変数を使用:- GEMINI_API_KEY: 必須。APIキー- GEMINI_MODEL: オプション。デフォルトは'gemini-pro'- GEMINI_API_URL: オプション。デフォルトはGoogleのエンドポイント- GEMINI_MAX_RETRIES: オプション。デフォルトは3回@error-handlingAPIキーが環境変数に設定されていない場合、エラーをスローします。エラーの前にログにエラー情報を記録します。@throws {Error} GEMINI_API_KEYが環境変数に設定されていない場合

**@constructor:** function Object() { [native code] }

##### GeminiClient.generateText (method)

テキスト生成を行います指定されたプロンプトとオプションに基づいてGemini APIを呼び出し、テキストを生成します。エラー発生時は設定された回数まで再試行し、指数バックオフ戦略を使用します。@async@param {string} prompt 生成プロンプト@param {GenerationOptions} [options] 生成オプション@returns {Promise<string>} 生成されたテキスト@throws {GenerationError} 空のプロンプトが提供された場合、またはAPIが空の応答を返した場合@throws {ExternalServiceError} すべての再試行が失敗した場合@usage// 基本的な使用方法const text = await geminiClient.generateText("こんにちは、世界について教えてください");// オプション付きの使用方法const text = await geminiClient.generateText("詳細な分析をしてください", {  temperature: 0.5,  targetLength: 5000,  overrides: {    topK: 30,    topP: 0.9  }});@call-context- 同期/非同期: 非同期メソッド（await必須）- 前提条件: クライアントが正しく初期化されていること、有効なAPIキーが設定されていること@call-flow1. プロンプトの検証2. 生成オプションの準備3. 再試行ループ開始4. Gemini APIの呼び出し5. レスポンスの検証6. エラー発生時の再試行処理7. 生成結果の返却@external-dependencies- Google Gemini API - テキスト生成処理@helper-methods- calculateTokens - 出力トークン数の計算- estimateTokenCount - トークン数の推定- calculateBackoff - バックオフ時間の計算- isNonRetryableError - 再試行不可能なエラーの判定- sleep - 指定時間の待機@error-handling- 空プロンプトはGenerationErrorとして即時拒否- API呼び出しエラーは最大maxRetries回まで再試行- 再試行不可能なエラー（認証エラー、コンテンツポリシー違反など）は即時失敗- すべての再試行が失敗した場合はExternalServiceErrorをスロー@performance-considerations- 指数バックオフとジッターにより、同時リクエストの集中を避ける設計- 日本語テキストは英語よりもトークン消費が多い傾向があるため、係数1.8で調整@monitoring- ログレベル: INFO/DEBUG/ERROR- メトリクス: プロンプトトークン数、レスポンストークン数、生成時間、試行回数

**@constructor:** function Object() { [native code] }

##### GeminiClient.validateApiKey (method)

APIキーの有効性を検証しますテスト用のシンプルなリクエストを送信し、APIキーが有効かどうかを確認します。@async@returns {Promise<boolean>} APIキーが有効な場合はtrue、無効な場合はfalse@usage// APIキーの検証const isValid = await geminiClient.validateApiKey();if (isValid) {  console.log("APIキーは有効です");} else {  console.log("APIキーは無効です");}@call-flow1. ログ出力（検証開始）2. テスト用のモデル取得3. 単純なコンテンツ生成リクエスト4. 結果に基づいて有効性を返却5. エラー発生時はfalseを返却@error-handlingエラーが発生した場合はキャッチしてログ出力し、falseを返します。エラーはスローせず、戻り値で結果を通知します。@monitoring- ログレベル: DEBUG/INFO/WARN

**@constructor:** function Object() { [native code] }

##### GeminiClient.getModelInfo (method)

モデル情報を取得します現在使用しているモデル、API URL、再試行設定などの情報を返します。@returns {Object} モデル情報@returns {string} model - 使用中のモデル名@returns {string} apiUrl - API URL@returns {number} maxRetries - 最大再試行回数@usage// モデル情報の取得const info = geminiClient.getModelInfo();console.log(`使用中のモデル: ${info.model}`);console.log(`最大再試行回数: ${info.maxRetries}`);@call-flowインスタンス変数を単純にオブジェクトとして返します。

**@constructor:** function Object() { [native code] }

##### GeminiClient.calculateTokens (method)

目標文字数からトークン数を計算します日本語テキストのトークン消費特性を考慮して、目標文字数から必要なトークン数を推定します。@private@param {number} [targetLength] 目標文字数@returns {number} 推定トークン数@call-flow1. 日本語の変換率（1.8倍）を適用2. デフォルト値または指定値を使用3. トークン数を計算し、上限内に収まるよう調整@performance-considerations日本語は英語よりもトークン消費が多い傾向があるため、係数1.8で調整しています。最大値はGeminiの制限である8192トークンを超えないように設定されています。

**@constructor:** function Object() { [native code] }

##### GeminiClient.estimateTokenCount (method)

テキストのトークン数を推定します日本語と英語が混在したテキストのトークン数を文字の種類に基づいて推定します。@private@param {string} text 対象テキスト@returns {number} 推定トークン数@call-flow1. テキストが存在しない場合は0を返す2. 日本語の文字を正規表現で抽出3. 日本語以外の文字を抽出4. それぞれのトークン消費率で計算（日本語:1.8、非日本語:0.25）5. 合計値を切り上げて返却@performance-considerations簡易的な推定であり、実際のトークナイザーとは異なる場合があります。日本語の文字は英語と比較して約1.8倍のトークンを消費すると仮定しています。

**@constructor:** function Object() { [native code] }

##### GeminiClient.calculateBackoff (method)

再試行間隔を計算します（指数バックオフ）試行回数に基づいて指数関数的に増加する待機時間を計算し、ジッターを追加します。@private@param {number} attempt 試行回数@returns {number} 待機時間(ms)@call-flow1. 基本遅延（200ms）から開始2. 試行回数に基づいて指数関数的に増加（2倍ずつ）3. 最大遅延（5000ms）を超えないように制限4. ジッターを追加（0-100msのランダム値）@performance-considerations指数バックオフは再試行時のサービス負荷を分散させるための標準的な方法です。ジッターの追加により、同時リクエストによるサーバー負荷の集中を回避します。

**@constructor:** function Object() { [native code] }

##### GeminiClient.isNonRetryableError (method)

再試行すべきでないエラーを判定しますエラーメッセージに基づいて、再試行が無意味なエラーかどうかを判定します。@private@param {unknown} error エラーオブジェクト@returns {boolean} 再試行すべきでない場合はtrue@call-flow1. エラーがErrorインスタンスでない場合はfalseを返す2. 再試行不可能なエラーメッセージのリストと照合3. 一致するメッセージがある場合はtrueを返す@error-handlingAPI認証エラー、無効なプロンプト、コンテンツポリシー違反などは再試行しても解決しないため、即時に失敗として処理します。

**@constructor:** function Object() { [native code] }

##### GeminiClient.sleep (method)

指定時間の待機を行います非同期処理を一定時間停止するためのユーティリティメソッドです。@private@param {number} ms 待機時間(ms)@returns {Promise<void>} Promiseオブジェクト@usage// 内部的な使用例await this.sleep(1000); // 1秒待機@call-flowsetTimeout関数をPromiseでラップして、awaitで待機できるようにします。

**@constructor:** function Object() { [native code] }


---

### output-parser.ts {#cnovel-automation-systemsrclibgenerationoutput-parserts}

**Path:** `C:/novel-automation-system/src/lib/generation/output-parser.ts`

@fileoverview 生成された小説テキストをChapterオブジェクトに変換するパーサー@descriptionこのファイルはAIによって生成された小説テキストを解析し、アプリケーションで扱いやすい構造化されたChapterオブジェクトに変換するためのユーティリティクラスを提供します。テキストからチャプタータイトルの抽出、本文の整形、サマリーの自動生成、シーン構造の分析を行い、システム内で利用可能なデータモデルに変換します。@role- 生成AIの出力テキストと小説管理システムのデータモデルの橋渡し- テキスト解析とメタデータ抽出- 章構造の解析と整形@dependencies- @/lib/utils/helpers (generateId) - ユニークID生成- @/lib/utils/logger (logger) - ログ記録@types- @/types/generation (Scene) - シーン構造の型定義- @/types/chapters (Chapter) - チャプターデータの型定義@flow1. 生成テキストからチャプタータイトルの抽出2. 本文の整形（タイトル行の削除、不要な見出しの削除）3. チャプターサマリーの自動生成4. 段落構造からのシーン分析5. Chapterオブジェクトの構築と返却

**@constructor:** function Object() { [native code] }

#### OutputParser (class)

@fileoverview 生成された小説テキストをChapterオブジェクトに変換するパーサー@descriptionこのファイルはAIによって生成された小説テキストを解析し、アプリケーションで扱いやすい構造化されたChapterオブジェクトに変換するためのユーティリティクラスを提供します。テキストからチャプタータイトルの抽出、本文の整形、サマリーの自動生成、シーン構造の分析を行い、システム内で利用可能なデータモデルに変換します。@role- 生成AIの出力テキストと小説管理システムのデータモデルの橋渡し- テキスト解析とメタデータ抽出- 章構造の解析と整形@dependencies- @/lib/utils/helpers (generateId) - ユニークID生成- @/lib/utils/logger (logger) - ログ記録@types- @/types/generation (Scene) - シーン構造の型定義- @/types/chapters (Chapter) - チャプターデータの型定義@flow1. 生成テキストからチャプタータイトルの抽出2. 本文の整形（タイトル行の削除、不要な見出しの削除）3. チャプターサマリーの自動生成4. 段落構造からのシーン分析5. Chapterオブジェクトの構築と返却/
import { Scene } from '@/types/generation';
import { generateId } from '@/lib/utils/helpers';
import { logger } from '@/lib/utils/logger';
import { Chapter } from '@/types/chapters';

/**@class OutputParser@description 生成されたテキスト出力を解析し、構造化されたChapterオブジェクトに変換するクラス@role- テキスト解析ロジックのカプセル化- チャプター構造の抽出と整形- メタデータ（シーン、サマリー）の生成@used-by- コードから直接の使用箇所は確認できないが、おそらく生成システムからの出力処理で使用される@depends-on- generateId - ユニークID生成のユーティリティ関数- logger - ログ記録ユーティリティ@lifecycle1. インスタンス化（特別な初期化は不要）2. parseOutputメソッドを呼び出してテキスト解析3. 解析結果をChapterオブジェクトとして返却

**@constructor:** function Object() { [native code] }

#### Methods of OutputParser

##### OutputParser.parseOutput (method)

生成されたテキスト出力をパースしてChapterオブジェクトに変換するメソッドマークダウン形式のテキストを解析し、タイトル抽出、本文整形、サマリー生成、シーン分析を行って構造化されたChapterオブジェクトを生成します。@param {string} text - パース対象のテキスト（生成AIからの出力）@param {number} chapterNumber - チャプター番号@returns {Chapter} パース結果のChapterオブジェクト@usageconst parser = new OutputParser();const chapter = parser.parseOutput(generatedText, 1);@call-flow1. テキストからタイトルを正規表現で抽出2. タイトル行を削除して本文を整形3. 先頭の不要な見出しや空行を削除4. サマリーの自動生成5. シーン構造の分析6. タイムスタンプの生成7. Chapterオブジェクトの構築と返却@helper-methods- generateSummary - サマリー生成- analyzeScenes - シーン分析@error-handlingタイトルが見つからない場合は、チャプター番号から自動生成されるデフォルトタイトルを使用@monitoring- ログレベル: DEBUG- ログポイント: 処理開始時、処理完了時

**@constructor:** function Object() { [native code] }

##### OutputParser.generateSummary (method)

チャプター本文からサマリーを生成するメソッドテキスト長に応じて異なる要約戦略を適用し、チャプターの内容を簡潔に表現するサマリーを生成します。@private@param {string} content - サマリー生成対象のチャプター本文@returns {string} 生成したサマリーテキスト@call-flow1. テキストの長さを確認（短いテキストはそのまま返す）2. テキストを段落に分割3. 段落の状況に応じて要約戦略を適用:   - 最初の段落が短い場合: 最初の2段落を使用   - 最初の段落が長い場合: 最初の段落の一部を使用   - 段落が少ない場合: 文単位での要約を試行@error-handlingテキスト構造が想定外の場合もフォールバックロジックにより必ず何らかのサマリーを生成

**@constructor:** function Object() { [native code] }

##### OutputParser.analyzeScenes (method)

チャプター本文からシーン構造を分析するメソッドテキストを段落単位で区切り、各段落の位置とシーンタイプを分析してシーン構造のリストを生成します。@private@param {string} content - シーン分析対象のチャプター本文@returns {Scene[]} 分析結果のシーンリスト@call-flow1. テキストを段落に分割2. テキストが短い場合は単一シーンとして処理3. 段落ごとにシーン情報を生成:   - シーンID   - シーンタイプ（位置に基づいて自動判定）   - 開始・終了位置   - 登場キャラクター（現実装では空配列）   - テンション値（シーンタイプに基づく簡易設定）@error-handlingコンテンツが短すぎる場合や段落構造がない場合も単一シーンとして処理する

**@constructor:** function Object() { [native code] }


---

### parallel-generator.ts {#cnovel-automation-systemsrclibgenerationparallel-generatorts}

**Path:** `C:/novel-automation-system/src/lib/generation/parallel-generator.ts`

並列チャプター生成システム効率的なリソース使用とスケーラビリティを提供する並列処理用のジョブキュー

**@constructor:** function Object() { [native code] }

#### ParallelGenerator (class)

並列チャプター生成システム効率的なリソース使用とスケーラビリティを提供する並列処理用のジョブキュー

**@constructor:** function Object() { [native code] }

#### Methods of ParallelGenerator

##### ParallelGenerator.constructor (method)

並列ジェネレーターを初期化@param concurrency 並列処理数（デフォルト: 3）

**@constructor:** function Object() { [native code] }

##### ParallelGenerator.setupQueue (method)

キューの設定とイベントハンドラーの登録

**@constructor:** function Object() { [native code] }

##### ParallelGenerator.enqueueGeneration (method)

チャプター生成ジョブをキューに追加@param chapterNumber 生成するチャプター番号@param options 生成オプション@returns キューに追加されたジョブ

**@constructor:** function Object() { [native code] }

##### ParallelGenerator.cancelGeneration (method)

特定のチャプターの生成ジョブをキャンセル@param chapterNumber キャンセルするチャプター番号

**@constructor:** function Object() { [native code] }

##### ParallelGenerator.getQueueStats (method)

キューの状態を取得@returns キューの状態情報

**@constructor:** function Object() { [native code] }

##### ParallelGenerator.getActiveJobs (method)

アクティブなジョブのリストを取得

**@constructor:** function Object() { [native code] }

##### ParallelGenerator.getWaitingJobs (method)

待機中のジョブのリストを取得

**@constructor:** function Object() { [native code] }

##### ParallelGenerator.getFailedJobs (method)

失敗したジョブのリストを取得

**@constructor:** function Object() { [native code] }


---

### prompt-template.ts {#cnovel-automation-systemsrclibgenerationprompt-templatets}

**Path:** `C:/novel-automation-system/src/lib/generation/prompt-template.ts`

@fileoverview 小説生成用プロンプトテンプレート管理モジュール@descriptionこのファイルは、AI小説生成システムで使用するプロンプトテンプレートを管理するためのクラスを提供します。プロンプトテンプレートは、AIに対して小説の章を生成するための指示を含み、世界観、登場人物情報、これまでのストーリー、伏線、テーマなどの要素を適切にフォーマットして最終的なプロンプト文字列を生成します。@role- AI小説生成システムのプロンプト生成を担当- 生成コンテキストからAI生成用のテンプレートを作成- エラー発生時のフォールバックテンプレートを提供@dependencies- @/types/generation (GenerationContext) - 生成コンテキスト型定義- @/lib/utils/logger (logger) - ログ記録機能- @/types/characters (Character) - キャラクター型定義@flow1. 生成コンテキストを受け取る2. 基本プロンプトテンプレートに値を埋め込む3. キャラクター情報をフォーマット4. 伏線・矛盾情報をフォーマット5. プロット・表現制約があれば追加6. 完成したプロンプトを返却

**@constructor:** function Object() { [native code] }

#### PromptTemplate (class)

@fileoverview 小説生成用プロンプトテンプレート管理モジュール@descriptionこのファイルは、AI小説生成システムで使用するプロンプトテンプレートを管理するためのクラスを提供します。プロンプトテンプレートは、AIに対して小説の章を生成するための指示を含み、世界観、登場人物情報、これまでのストーリー、伏線、テーマなどの要素を適切にフォーマットして最終的なプロンプト文字列を生成します。@role- AI小説生成システムのプロンプト生成を担当- 生成コンテキストからAI生成用のテンプレートを作成- エラー発生時のフォールバックテンプレートを提供@dependencies- @/types/generation (GenerationContext) - 生成コンテキスト型定義- @/lib/utils/logger (logger) - ログ記録機能- @/types/characters (Character) - キャラクター型定義@flow1. 生成コンテキストを受け取る2. 基本プロンプトテンプレートに値を埋め込む3. キャラクター情報をフォーマット4. 伏線・矛盾情報をフォーマット5. プロット・表現制約があれば追加6. 完成したプロンプトを返却/

import { GenerationContext } from '@/types/generation';
import { logger } from '@/lib/utils/logger';
import { Character } from '@/types/characters';

/**@class PromptTemplate@description 小説生成用のプロンプトテンプレートを管理するクラス@role- 生成コンテキストからAI用プロンプトを生成- 各種情報（キャラクター、伏線等）の適切なフォーマット- エラーハンドリングとフォールバックの提供@used-by- 小説生成エンジン（具体的なパスはコードから確認できない）@depends-on- logger - ログ記録用ユーティリティ- GenerationContext型 - 生成コンテキスト情報の型定義- Character型 - キャラクター情報の型定義@lifecycle1. インスタンス化（特別な初期化不要）2. generate()メソッドによるプロンプト生成3. 内部ヘルパーメソッドによる各セクションのフォーマット@example-flow生成エンジン → PromptTemplate.generate(context) →  基本テンプレート取得 →  formatCharacters/formatForeshadowing等で情報整形 →  最終プロンプト文字列の生成と返却

**@constructor:** function Object() { [native code] }

#### Methods of PromptTemplate

##### PromptTemplate.generate (method)

コンテキストからプロンプトを生成する指定された生成コンテキスト情報を基に、AI小説生成用のプロンプトを構築します。世界観、キャラクター情報、ストーリーコンテキスト、執筆ガイドライン、伏線、テーマ、矛盾などの情報を適切に整形して組み込みます。また、エラー発生時にはシンプルなフォールバックプロンプトを返します。@param {GenerationContext} context - 生成コンテキスト情報@returns {string} 構築されたプロンプト文字列@usageconst promptTemplate = new PromptTemplate();const prompt = promptTemplate.generate(generationContext);@call-flow1. デバッグログ記録2. 基本テンプレートを取得し変数置換3. キャラクター情報のフォーマット4. 伏線情報のフォーマット5. 矛盾情報のフォーマット6. プロット・表現制約の追加（存在する場合）7. 完成したプロンプトの返却@helper-methods- formatCharacters - キャラクター情報のフォーマット- formatPersonality - キャラクターの性格情報のフォーマット- formatForeshadowing - 伏線情報のフォーマット- formatContradictions - 矛盾情報のフォーマット@error-handlingtry-catch構造でエラーを捕捉し、エラーログを記録した上でシンプルなフォールバックプロンプトを返します。@expected-format```あなたはプロの小説家です。以下の設定に基づいて、物語の一章を生成してください。【世界観】{worldSettingsの内容}【登場人物の情報】{フォーマットされたキャラクター情報}...（他のセクション）# タイトル本文...（約{targetLength}文字）```

**@constructor:** function Object() { [native code] }

##### PromptTemplate.formatCharacters (method)

キャラクター情報をフォーマットするCharacter配列を受け取り、プロンプトに適した形式でフォーマットします。各キャラクターの名前、説明、性格、役割などの情報を整形します。@private@param {Character[]} characters - フォーマットするキャラクター配列@returns {string} フォーマットされたキャラクター情報文字列@call-flow1. キャラクター配列の存在確認2. 各キャラクターの情報を整形3. 名前、説明、性格、役割を組み合わせ4. 全キャラクター情報を連結して返却@helper-methods- formatPersonality - キャラクターの性格情報のフォーマット@expected-format```- キャラクター名: 説明  性格: フォーマットされた性格情報  役割: キャラクターの役割- キャラクター名2: 説明  性格: フォーマットされた性格情報  役割: キャラクターの役割```

**@constructor:** function Object() { [native code] }

##### PromptTemplate.formatPersonality (method)

キャラクターの性格情報をフォーマットする性格情報オブジェクトを受け取り、プロンプトに適した形式で文字列化します。traitsプロパティがある場合は配列要素を連結し、オブジェクト形式の場合はキーと値のペアをフラットな文字列に変換します。@private@param {any} personality - フォーマットする性格情報オブジェクト@returns {string} フォーマットされた性格情報文字列@call-flow1. 性格情報の存在確認2. traitsプロパティがある場合は配列要素を連結3. オブジェクト形式の場合はキーと値のペアをフラットな文字列に変換4. 変換に失敗した場合は文字列化を試行@error-handlingtry-catch構造でオブジェクト変換エラーを捕捉し、エラー発生時には単純な文字列化を行います。@expected-format```trait1、trait2、trait3```または```key1: value1、key2: value2、key3: value3```

**@constructor:** function Object() { [native code] }

##### PromptTemplate.formatForeshadowing (method)

伏線情報をフォーマットする伏線情報の配列を受け取り、プロンプトに適した形式で文字列化します。オブジェクト形式でdescriptionプロパティがある場合はその値を使用し、それ以外の場合は文字列化して返します。@private@param {any[]} foreshadowing - フォーマットする伏線情報配列@returns {string} フォーマットされた伏線情報文字列@call-flow1. 伏線情報の存在確認2. 各伏線要素を処理  a. オブジェクトでdescriptionプロパティがある場合はその値を使用  b. それ以外の場合は文字列化3. 処理した要素を連結して返却@expected-format```伏線1、伏線2、伏線3```

**@constructor:** function Object() { [native code] }

##### PromptTemplate.formatContradictions (method)

矛盾情報をフォーマットする矛盾情報の配列を受け取り、プロンプトに適した形式で文字列化します。オブジェクト形式でdescriptionプロパティがある場合はその値を使用し、それ以外の場合は文字列化して返します。@private@param {any[]} contradictions - フォーマットする矛盾情報配列@returns {string} フォーマットされた矛盾情報文字列@call-flow1. 矛盾情報の存在確認2. 各矛盾要素を処理  a. オブジェクトでdescriptionプロパティがある場合はその値を使用  b. それ以外の場合は文字列化3. 処理した要素を連結して返却@expected-format```矛盾1、矛盾2、矛盾3```

**@constructor:** function Object() { [native code] }


---

### rate-limiter.ts {#cnovel-automation-systemsrclibgenerationrate-limiterts}

**Path:** `C:/novel-automation-system/src/lib/generation/rate-limiter.ts`

@fileoverview レート制限付き非同期関数実行モジュール@description非同期処理のレート制限と自動リトライを担当するユーティリティクラスを提供します。このモジュールは特にAPI呼び出しなど、一定間隔で実行する必要がある処理をレート制限に準拠して実行するための機能を提供します。@role- 非同期処理のレート制限管理- レート制限エラー時の自動リトライ処理- API呼び出しなど外部サービス呼び出しの頻度制御- エラーのログ記録と再試行の管理@dependencies- @/lib/utils/logger - ログ記録機能の提供- @/lib/utils/error-handler - エラーログ記録のためのユーティリティ@flow1. レート制限付き処理の実行リクエスト受信2. 前回の実行からの経過時間確認と必要に応じての待機3. 処理の実行と結果の返却または例外発生4. レート制限エラー発生時には設定に基づいて自動リトライ5. リトライ回数超過または他のエラーが発生した場合は例外をスロー@version 1.0.0

**@constructor:** function Object() { [native code] }

#### RateLimiter (class)

@fileoverview レート制限付き非同期関数実行モジュール@description非同期処理のレート制限と自動リトライを担当するユーティリティクラスを提供します。このモジュールは特にAPI呼び出しなど、一定間隔で実行する必要がある処理をレート制限に準拠して実行するための機能を提供します。@role- 非同期処理のレート制限管理- レート制限エラー時の自動リトライ処理- API呼び出しなど外部サービス呼び出しの頻度制御- エラーのログ記録と再試行の管理@dependencies- @/lib/utils/logger - ログ記録機能の提供- @/lib/utils/error-handler - エラーログ記録のためのユーティリティ@flow1. レート制限付き処理の実行リクエスト受信2. 前回の実行からの経過時間確認と必要に応じての待機3. 処理の実行と結果の返却または例外発生4. レート制限エラー発生時には設定に基づいて自動リトライ5. リトライ回数超過または他のエラーが発生した場合は例外をスロー@version 1.0.0/

import { logger } from '@/lib/utils/logger';
import { logWarn } from '@/lib/utils/error-handler';

/**@class RateLimiter@description 非同期処理に対するレート制限とリトライ機能を提供するクラス@role- 非同期関数実行のレート制限管理- リクエスト間の最小間隔の強制- レート制限エラー時の指数バックオフによる自動リトライ- エラーログ記録と詳細な診断情報の提供@used-by- コードからは確認できない（外部から利用されると想定）@depends-on- logger - デバッグ情報やエラー情報のログ記録- logWarn - 警告レベルのログ記録@lifecycle1. コンストラクタでのインスタンス生成とオプション設定2. execute()メソッドによる個別の非同期処理の実行3. 必要に応じてレート制限による待機4. エラー発生時の自動リトライまたは例外スロー@example-flow外部コンポーネント → RateLimiter.execute() →   内部での待機処理 →  渡された非同期関数の実行 →  成功時：結果の返却 →  エラー時：レート制限エラー検出 →   リトライ間隔の計算 →   待機 →   再実行または失敗時の例外スロー

**@constructor:** function Object() { [native code] }

#### Methods of RateLimiter

##### RateLimiter.constructor (method)

RateLimiterインスタンスを初期化しますレート制限の間隔、最大リトライ回数、リトライ間隔などを設定します。オプションが指定されなかった場合はデフォルト値が使用されます。@constructor@param {Object} [options] - レート制限とリトライの設定オプション@param {number} [options.minInterval=1000] - リクエスト間の最小間隔（ミリ秒）@param {number} [options.maxRetries=3] - 失敗時の最大リトライ回数@param {number} [options.retryDelay=2000] - 初回リトライまでの遅延時間（ミリ秒）@usage// デフォルト設定での初期化const limiter = new RateLimiter();// カスタム設定での初期化const customLimiter = new RateLimiter({  minInterval: 500,  // 0.5秒間隔  maxRetries: 5,     // 最大5回リトライ  retryDelay: 1000   // 初回リトライは1秒後});@initializationインスタンス変数の初期化とオプションで指定された値の設定を行います。キューやタイムスタンプ管理用の変数も初期化されます。

**@constructor:** function Object() { [native code] }

##### RateLimiter.isRateLimitError (method)

レート制限を適用して非同期関数を実行します前回の実行からの経過時間を確認し、必要に応じて待機した後に指定された非同期関数を実行します。レート制限エラーが発生した場合は指数バックオフ方式で自動的にリトライを行います。@async@template T 非同期関数の戻り値の型@param {() => Promise<T>} fn - 実行する非同期関数@returns {Promise<T>} 非同期関数の実行結果@throws {Error} 最大リトライ回数を超えた場合や、レート制限以外のエラーが発生した場合@usage// 単純な使用例const result = await rateLimiter.execute(async () => {  return await apiClient.fetchData();});// エラーハンドリング付きの使用例try {  const result = await rateLimiter.execute(async () => {    return await apiClient.fetchData();  });  // 結果の処理} catch (error) {  // エラーハンドリング}@call-context- 同期/非同期: 非同期メソッド（await必須）- 推奨呼び出し環境: API呼び出しやレート制限が必要な任意の環境- 前提条件: なし（独立して呼び出し可能）@call-flow1. 前回の実行からの経過時間を計算2. 最小間隔未満の場合は差分時間の待機3. 非同期関数の実行4. エラー発生時はレート制限エラーかを確認5. レート制限エラーで最大リトライ回数未満の場合は指数バックオフで待機後に再実行6. 正常終了時または最終リトライ失敗時は結果または例外を返却@helper-methods- isRateLimitError - エラーがレート制限に関連するものかを判定@error-handling- レート制限エラーは自動的にリトライ処理を行う- リトライ回数が上限に達した場合は最終的に例外をスロー- リトライ時はlogWarnでログ記録し、最終失敗時はloggerでエラーログを記録- エラー情報に元のエラーメッセージとスタックトレースを含める@state-changes- lastRequestプロパティが更新され、最後に実行したリクエストの時刻が記録される@performance-considerations- リクエスト間に強制的な待機時間が発生するため、同期的な連続呼び出しは避けるべき- 多数のリクエストが短時間に集中する場合はパフォーマンスが低下する可能性あり@monitoring- ログレベル: DEBUG（通常の実行時）、ERROR（最終失敗時）、WARN（リトライ時）- メトリクス: リトライ回数、待機時間@example// API呼び出しでの使用例const limiter = new RateLimiter({ minInterval: 1000 });async function fetchUserData(userId) {  return await limiter.execute(async () => {    const response = await fetch(`https://api.example.com/users/${userId}`);    return await response.json();  });}/
async execute<T>(fn: () => Promise<T>): Promise<T> {
const now = Date.now();
const timeSinceLastRequest = now - this.lastRequest;

// リクエスト間隔を確保
if (timeSinceLastRequest < this.minInterval) {
logger.debug(`Rate limiting: waiting ${this.minInterval - timeSinceLastRequest}ms`);
await new Promise(resolve =>
setTimeout(resolve, this.minInterval - timeSinceLastRequest)
);
}

// リトライロジック付き実行
let retries = 0;
while (true) {
try {
this.lastRequest = Date.now();
logger.debug('Executing rate-limited request');
return await fn();
} catch (error) {
// レート制限エラーや一時的なエラーの場合はリトライ
const isRateLimitError = this.isRateLimitError(error);

if (isRateLimitError && retries < this.maxRetries) {
retries++;
const delay = this.retryDelay * Math.pow(2, retries - 1);

// 引数の順序を修正: error, metadata, message
logWarn(`Rate limit hit, retrying in ${delay}ms (attempt ${retries}/${this.maxRetries})`, error, {
retries,
maxRetries: this.maxRetries,
delay
});

await new Promise(resolve => setTimeout(resolve, delay));
continue;
}

// リトライ回数超過または他のエラーは再スロー
logger.error(`Request failed after ${retries} retries`, {
error: error instanceof Error ? error.message : String(error),
stack: error instanceof Error ? error.stack : undefined,
retries
});
throw error;
}
}
}

/**エラーがレート制限に関連するものかを判定しますエラーメッセージの内容を確認し、レート制限に関連するキーワードが含まれているかを判定します。@private@param {unknown} error - 判定対象のエラーオブジェクト@returns {boolean} レート制限エラーである場合はtrue、それ以外はfalse@call-flow1. エラーオブジェクトの存在確認2. エラーメッセージの取得と小文字変換3. レート制限関連のキーワード含有チェック4. 判定結果の返却@helper-methodsなし@error-handling- エラーオブジェクトがnullやundefinedの場合はfalseを返却- エラーオブジェクトにmessageプロパティがない場合も安全に処理@usage// クラス内部での使用if (this.isRateLimitError(error)) {  // レート制限エラー時の処理}

**@constructor:** function Object() { [native code] }


---

### long-term-memory copy2.ts {#cnovel-automation-systemsrclibmemorylong-term-memory-copy2ts}

**Path:** `C:/novel-automation-system/src/lib/memory/#/long-term-memory copy2.ts`

//    * 長期記憶管理クラス
//    * 物語全体の設定・テーマ記憶を管理
//

**@constructor:** function Object() { [native code] }


---

### long-term-memory copy3.ts {#cnovel-automation-systemsrclibmemorylong-term-memory-copy3ts}

**Path:** `C:/novel-automation-system/src/lib/memory/#/long-term-memory copy3.ts`

//    * 長期記憶管理クラス
//    * 物語全体の設定・テーマ記憶を管理
//

**@constructor:** function Object() { [native code] }


---

### index.ts {#cnovel-automation-systemsrclibmemoryindexts}

**Path:** `C:/novel-automation-system/src/lib/memory/index.ts`

@fileoverview 階層的記憶管理システムのパブリックAPIモジュール@descriptionこのファイルは物語創作支援システムの階層的記憶管理システムの主要なコンポーネントと型定義をエクスポートします。システム内の各記憶層（短期・中期・長期）へのアクセスとメモリマネージャーのシングルトンインスタンスを提供します。@role- システム全体に記憶管理コンポーネントの統一的なアクセスポイントを提供- 記憶管理クラスと型定義の中央エクスポートハブとして機能- 階層的記憶システムのパブリックAPIを定義@dependencies- ./manager - メモリマネージャーのシングルトンインスタンス- ./long-term-memory - 長期記憶管理クラス- ./short-term-memory - 短期記憶管理クラス- ./mid-term-memory - 中期記憶管理クラス- ./types - 記憶管理システムの型定義@flow1. 外部モジュールからのimportによるコンポーネントへのアクセス2. メモリマネージャーの初期化と使用3. 必要に応じた各記憶層の個別アクセス

**@constructor:** function Object() { [native code] }


---

### long-term-memory.ts {#cnovel-automation-systemsrclibmemorylong-term-memoryts}

**Path:** `C:/novel-automation-system/src/lib/memory/long-term-memory.ts`

@fileoverview 長期記憶管理モジュール@description物語創作支援システムにおける長期記憶を管理するモジュールです。物語全体の設定、テーマ、伏線、キャラクターアーキタイプなどの長期的な情報を保存、管理、分析する機能を提供します。@role- 物語の世界設定、テーマ、伏線などの長期的な情報の管理- アーク記憶（中期記憶）からの情報統合- 伏線の追跡と管理- 物語の整合性チェック- キャラクターアーキタイプの抽出と管理@dependencies- @/types/memory - メモリ関連の型定義- @/types/chapters - チャプター関連の型定義- @/lib/validation/consistency-checker - 整合性検証機能- @/lib/storage - ストレージアクセス機能- @/lib/utils/yaml-helper - YAML形式データの操作ユーティリティ- @/lib/utils/logger - ログ出力機能- @/lib/utils/error-handler - エラーハンドリング機能- @/lib/generation/gemini-client - AI生成機能クライアント- uuid - 一意識別子生成ライブラリ@flow1. ストレージからの長期記憶データ（世界設定、テーマ、伏線など）の読み込み2. 中期記憶（アーク記憶）からのデータ統合3. 伏線の追加、更新、解決、削除などの管理4. テーマの発展追跡と全体テーマの更新5. キャラクターアーキタイプの抽出と記録6. 物語の整合性検証と問題報告

**@constructor:** function Object() { [native code] }

#### LongTermMemory (class)

@fileoverview 長期記憶管理モジュール@description物語創作支援システムにおける長期記憶を管理するモジュールです。物語全体の設定、テーマ、伏線、キャラクターアーキタイプなどの長期的な情報を保存、管理、分析する機能を提供します。@role- 物語の世界設定、テーマ、伏線などの長期的な情報の管理- アーク記憶（中期記憶）からの情報統合- 伏線の追跡と管理- 物語の整合性チェック- キャラクターアーキタイプの抽出と管理@dependencies- @/types/memory - メモリ関連の型定義- @/types/chapters - チャプター関連の型定義- @/lib/validation/consistency-checker - 整合性検証機能- @/lib/storage - ストレージアクセス機能- @/lib/utils/yaml-helper - YAML形式データの操作ユーティリティ- @/lib/utils/logger - ログ出力機能- @/lib/utils/error-handler - エラーハンドリング機能- @/lib/generation/gemini-client - AI生成機能クライアント- uuid - 一意識別子生成ライブラリ@flow1. ストレージからの長期記憶データ（世界設定、テーマ、伏線など）の読み込み2. 中期記憶（アーク記憶）からのデータ統合3. 伏線の追加、更新、解決、削除などの管理4. テーマの発展追跡と全体テーマの更新5. キャラクターアーキタイプの抽出と記録6. 物語の整合性検証と問題報告/

import {
ArcMemory,
WorldSettings,
Theme,
Foreshadowing,
ConsistencyResult,
ConsistencyIssue,
CharacterArchetype
} from '@/types/memory';
import { Chapter } from '@/types/chapters';
import { ConsistencyChecker } from '@/lib/validation/consistency-checker';
import { storageProvider } from '@/lib/storage';
import { parseYaml, stringifyYaml, getNestedYamlProperty } from '@/lib/utils/yaml-helper';
import { logger } from '@/lib/utils/logger';
import { logError } from '@/lib/utils/error-handler';
import { GeminiClient } from '@/lib/generation/gemini-client';
import { v4 as uuidv4 } from 'uuid';

/**@class LongTermMemory@description物語全体の設定やテーマを管理するための長期記憶クラス。世界設定、テーマの発展、伏線、キャラクターアーキタイプなどの長期的な情報の保存、管理、分析を担当します。@role- YAML形式での長期記憶データの保存と読み込み- 世界設定と物語テーマの管理- 伏線の追跡、管理、解決の支援- アーク記憶からの情報統合と長期的なパターン抽出- キャラクターアーキタイプの分析と記録- 物語の整合性検証@used-by- @/lib/memory/manager - メモリ管理システム@depends-on- ConsistencyChecker - 物語の整合性検証- GeminiClient - AIを活用したテーマ分析とキャラクター分析- storageProvider - 永続化ストレージへのアクセス@lifecycle1. コンストラクタでの基本的な依存関係の初期化2. initialize()メソッドによる設定ファイルの読み込みと初期化3. データの管理・更新（伏線追加、テーマ更新など）4. アーク記憶の統合処理5. 整合性チェックなどの分析処理@example-flowMemoryManager → LongTermMemory.initialize →   ストレージからの設定読み込み →  アーク記憶の統合処理 →  伏線管理 →  整合性チェック

**@constructor:** function Object() { [native code] }

#### Methods of LongTermMemory

##### LongTermMemory.constructor (method)

長期記憶クラスを初期化します整合性チェッカーとAI生成クライアントを初期化します。実際のデータ読み込みは initialize() メソッドで行います。@constructor@param {GeminiClient} [geminiClient] - AIテキスト生成クライアント（オプション）@usage// 基本的な初期化const longTermMemory = new LongTermMemory();await longTermMemory.initialize();// カスタムGeminiClientを使用した初期化const customClient = new GeminiClient();const longTermMemory = new LongTermMemory(customClient);await longTermMemory.initialize();@call-flow1. GeminiClientの設定（指定されていなければ新規作成）2. ConsistencyCheckerの初期化3. 初期化ログの出力

**@constructor:** function Object() { [native code] }

##### LongTermMemory.initialize (method)

初期化処理を実行します必要なディレクトリの確認、各種設定ファイルの読み込み、長期記憶データの読み込みなどの初期化処理を行います。@async@returns {Promise<void>} 初期化完了時に解決するPromise@throws {Error} 初期化に失敗した場合@usageconst longTermMemory = new LongTermMemory();await longTermMemory.initialize();@call-flow1. 必要なディレクトリの存在確認と作成2. 世界設定の読み込み (loadWorldSettings)3. テーマトラッカーの読み込み (loadThemeTracker)4. 伏線マップの読み込み (loadForeshadowingMap)5. 長期記憶要約データの読み込み6. 初期化完了フラグの設定@error-handling初期化処理中のエラーはキャッチしてログに記録し、上位層に再スローします。これにより、呼び出し元で適切なフォールバック処理を実装できます。

**@constructor:** function Object() { [native code] }

##### LongTermMemory.ensureDirectoriesExist (method)

必要なディレクトリが存在することを確認します長期記憶機能に必要なディレクトリ構造を確認し、存在しない場合は作成します。@private@async@returns {Promise<void>} ディレクトリ確認完了時に解決するPromise@call-flow1. 必要なディレクトリリストの定義 (history, config)2. 各ディレクトリの存在確認3. 存在しないディレクトリの作成@helper-methods- storageProvider.directoryExists - ディレクトリ存在確認- storageProvider.createDirectory - ディレクトリ作成/
await this.ensureDirectoriesExist();

// 各種設定ファイルを読み込み
await this.loadWorldSettings();
await this.loadThemeTracker();
await this.loadForeshadowingMap();

// 長期記憶の要約データを読み込み
const longTermExists = await storageProvider.fileExists(LongTermMemory.STORAGE_PATH);

if (longTermExists) {
const content = await storageProvider.readFile(LongTermMemory.STORAGE_PATH);
const data = parseYaml(content);

if (data && typeof data === 'object') {
this.characterArchetypes = data.characterArchetypes || [];
this.lastCompressionTime = data.lastCompressionTime ? new Date(data.lastCompressionTime) : null;
logger.info('Loaded long-term memory data from storage');
} else {
logger.warn('Invalid long-term memory data format, using defaults');
}
} else {
logger.info('No existing long-term memory found, using defaults');
}

this.initialized = true;
logger.info('Long-term memory initialization complete');
} catch (error) {
logError(error, {}, 'Failed to initialize long-term memory');
throw error;
}
}

/**必要なディレクトリが存在することを確認

**@constructor:** function Object() { [native code] }

##### LongTermMemory.save (method)

現在の記憶をストレージに保存しますキャラクターアーキタイプや圧縮時間などの長期記憶データをYAML形式でストレージに保存します。@private@async@returns {Promise<void>} 保存完了時に解決するPromise@throws {Error} 保存に失敗した場合@call-flow1. 保存データオブジェクトの作成2. データのYAML形式への変換3. ストレージへのファイル書き込み@error-handling保存処理中のエラーはキャッチしてログに記録し、上位層に再スローします。

**@constructor:** function Object() { [native code] }

##### LongTermMemory.loadWorldSettings (method)

世界設定を読み込みます設定ファイルから世界設定データを読み込みます。ファイルが存在しない場合やフォーマットが無効な場合はデフォルト設定を作成します。@private@async@returns {Promise<void>} 読み込み完了時に解決するPromise@call-flow1. 世界設定ファイルの存在確認2. ファイルが存在する場合は内容を読み込み3. データの検証と設定4. 無効な場合またはファイルが存在しない場合はデフォルト設定を作成@error-handling読み込み処理中のエラーはキャッチしてログに記録し、デフォルト設定を作成します。

**@constructor:** function Object() { [native code] }

##### LongTermMemory.createDefaultWorldSettings (method)

デフォルトの世界設定を作成します基本的な世界設定を作成し、ストレージに保存します。@private@async@returns {Promise<void>} 作成完了時に解決するPromise@call-flow1. デフォルトの世界設定オブジェクトの作成2. 設定データのYAML形式への変換3. ストレージへのファイル書き込み

**@constructor:** function Object() { [native code] }

##### LongTermMemory.loadThemeTracker (method)

テーマトラッカーを読み込みます設定ファイルからテーマトラッカーデータを読み込みます。ファイルが存在しない場合やフォーマットが無効な場合はデフォルト設定を作成します。@private@async@returns {Promise<void>} 読み込み完了時に解決するPromise@call-flow1. テーマトラッカーファイルの存在確認2. ファイルが存在する場合は内容を読み込み3. データの検証と設定4. 無効な場合またはファイルが存在しない場合はデフォルト設定を作成@error-handling読み込み処理中のエラーはキャッチしてログに記録し、デフォルト設定を作成します。

**@constructor:** function Object() { [native code] }

##### LongTermMemory.createDefaultThemeTracker (method)

デフォルトのテーマトラッカーを作成します基本的なテーマトラッカーを作成し、ストレージに保存します。@private@async@returns {Promise<void>} 作成完了時に解決するPromise@call-flow1. デフォルトのテーマトラッカーオブジェクトの作成2. データのYAML形式への変換3. ストレージへのファイル書き込み

**@constructor:** function Object() { [native code] }

##### LongTermMemory.loadForeshadowingMap (method)

伏線マップを読み込みます設定ファイルから伏線マップデータを読み込みます。ファイルが存在しない場合は空の伏線リストを初期化します。@private@async@returns {Promise<void>} 読み込み完了時に解決するPromise@call-flow1. 伏線マップファイルの存在確認2. ファイルが存在する場合は内容を読み込み3. データの検証と修正4. 無効な場合またはファイルが存在しない場合は空のリストを初期化@error-handling読み込み処理中のエラーはキャッチしてログに記録し、バックアップから復元を試みます。復元も失敗した場合は空のリストを初期化します。

**@constructor:** function Object() { [native code] }

##### LongTermMemory.validateAndFixForeshadowingData (method)

伏線データを検証して修正します伏線データの必須フィールドの欠落などを検証し、不足しているデータを補完します。@private@param {any[]} data 検証対象の伏線データ配列@returns {Foreshadowing[]} 検証・修正された伏線データ配列@call-flow1. 各伏線データ項目に対して検証と修正を実行2. 必須フィールド（id, description, chapter_introduced, resolved, urgency）の検証と補完3. オプションフィールドの追加@error-handling不足しているフィールドはデフォルト値または生成値で補完します。IDがない場合はUUIDを使って新規作成します。

**@constructor:** function Object() { [native code] }

##### LongTermMemory.validateUrgency (method)

urgencyの値を検証します伏線の優先度（urgency）値を検証し、有効な値でない場合はデフォルト値を返します。@private@param {any} urgency 検証対象の優先度値@returns {string} 検証済みの優先度値@call-flow1. 有効な優先度値のリスト定義2. 与えられた値が有効かどうかチェック3. 有効な場合はその値を、無効な場合はデフォルト値を返却

**@constructor:** function Object() { [native code] }

##### LongTermMemory.saveForeshadowingMap (method)

伏線マップを保存します現在の伏線データをYAML形式でストレージに保存します。保存前に既存ファイルのバックアップを作成します。@private@async@returns {Promise<void>} 保存完了時に解決するPromise@throws {Error} 保存に失敗した場合@call-flow1. 既存ファイルのバックアップ作成2. 伏線データのYAML形式への変換3. ストレージへのファイル書き込み@error-handling保存処理中のエラーはキャッチしてログに記録し、上位層に再スローします。

**@constructor:** function Object() { [native code] }

##### LongTermMemory.backupForeshadowingMap (method)

伏線マップをバックアップします現在の伏線マップファイルのバックアップコピーを作成します。@private@async@returns {Promise<void>} バックアップ完了時に解決するPromise@call-flow1. 伏線マップファイルの存在確認2. ファイルが存在する場合は内容を読み込み3. バックアップパスにファイルを書き込み@error-handlingバックアップ処理中のエラーはキャッチしてログに記録しますが、メイン処理に影響させないためにエラーを再スローしません。

**@constructor:** function Object() { [native code] }

##### LongTermMemory.restoreForeshadowingFromBackup (method)

バックアップから伏線マップを復元しますバックアップファイルから伏線データを読み込んで復元します。バックアップが存在しない場合や無効な場合は空のリストを初期化します。@private@async@returns {Promise<void>} 復元完了時に解決するPromise@call-flow1. バックアップファイルの存在確認2. ファイルが存在する場合は内容を読み込み3. データの検証と設定4. 無効な場合またはファイルが存在しない場合は空のリストを初期化@error-handling復元処理中のエラーはキャッチしてログに記録し、空のリストを初期化します。

**@constructor:** function Object() { [native code] }

##### LongTermMemory.getWorldSettings (method)

世界設定を取得します長期記憶に保存されている世界設定データを取得します。初期化されていない場合は初期化を実行します。@async@returns {Promise<WorldSettings>} 世界設定データ@usageconst worldSettings = await longTermMemory.getWorldSettings();console.log(`世界の説明: ${worldSettings.description}`);@call-flow1. 初期化状態の確認と必要に応じた初期化2. 世界設定データの返却（存在しない場合はデフォルト値）

**@constructor:** function Object() { [native code] }

##### LongTermMemory.getTheme (method)

テーマを取得します長期記憶に保存されている物語テーマデータを取得します。初期化されていない場合は初期化を実行します。@async@returns {Promise<Theme>} テーマデータ@usageconst theme = await longTermMemory.getTheme();console.log(`物語のテーマ: ${theme.description}`);@call-flow1. 初期化状態の確認と必要に応じた初期化2. テーマデータの返却（存在しない場合はデフォルト値）

**@constructor:** function Object() { [native code] }

##### LongTermMemory.getForeshadowing (method)

伏線状態を取得します長期記憶に保存されている全ての伏線データを取得します。初期化されていない場合は初期化を実行します。@async@returns {Promise<Foreshadowing[]>} 伏線データの配列@usageconst foreshadowings = await longTermMemory.getForeshadowing();console.log(`伏線の数: ${foreshadowings.length}`);@call-flow1. 初期化状態の確認と必要に応じた初期化2. 伏線データの配列を返却

**@constructor:** function Object() { [native code] }

##### LongTermMemory.getForeshadowingById (method)

伏線をIDで検索します指定されたIDに一致する伏線データを検索して取得します。初期化されていない場合は初期化を実行します。@async@param {string} id 検索対象の伏線ID@returns {Promise<Foreshadowing | null>} 見つかった伏線データ、または存在しない場合はnull@usageconst foreshadowing = await longTermMemory.getForeshadowingById("fs-1-abcd1234");if (foreshadowing) {  console.log(`伏線「${foreshadowing.description}」が見つかりました`);}@call-flow1. 初期化状態の確認と必要に応じた初期化2. 指定されたIDの伏線をリストから検索3. 見つかった場合はその伏線を返却、見つからない場合はnullを返却

**@constructor:** function Object() { [native code] }

##### LongTermMemory.getForeshadowingIndexById (method)

伏線のインデックスをIDから取得します指定されたIDに一致する伏線のインデックスを配列内から検索します。@private@param {string} id 検索対象の伏線ID@returns {number} 見つかった伏線のインデックス、または-1（見つからない場合）@call-flow1. 伏線配列内で指定されたIDと一致するアイテムのインデックスを検索

**@constructor:** function Object() { [native code] }

##### LongTermMemory.addForeshadowing (method)

新しい伏線を追加します新しい伏線データを作成し、長期記憶に追加します。初期化されていない場合は初期化を実行します。@async@param {Partial<Foreshadowing>} foreshadowing 追加する伏線の部分的なデータ@returns {Promise<Foreshadowing>} 追加された完全な伏線データ@usageconst newForeshadowing = await longTermMemory.addForeshadowing({  description: "謎の手紙",  chapter_introduced: 5,  urgency: "high"});console.log(`伏線「${newForeshadowing.description}」を追加しました（ID: ${newForeshadowing.id}）`);@call-flow1. 初期化状態の確認と必要に応じた初期化2. 現在時刻の取得（タイムスタンプ用）3. 必須フィールドの確認と補完による新しい伏線オブジェクトの作成4. オプションフィールドの追加5. 伏線リストへの追加6. 変更の保存7. 追加された伏線データの返却@state-changesこのメソッドは伏線リスト（this.foreshadowing）を変更し、変更をストレージに保存します。

**@constructor:** function Object() { [native code] }

##### LongTermMemory.resolveForeshadowing (method)

伏線の解決を記録します指定された伏線を解決済みとしてマークし、解決情報を記録します。初期化されていない場合は初期化を実行します。@async@param {number | string} indexOrId 伏線のインデックスまたはID@param {number} resolutionChapter 解決されたチャプター番号@param {string} resolutionDescription 解決内容の説明@returns {Promise<void>} 処理完了時に解決するPromise@throws {Error} 指定された伏線が見つからない場合@usage// IDで指定await longTermMemory.resolveForeshadowing("fs-1-abcd1234", 10, "主人公が手紙の差出人を発見した");// インデックスで指定await longTermMemory.resolveForeshadowing(2, 10, "主人公が手紙の差出人を発見した");@call-flow1. 初期化状態の確認と必要に応じた初期化2. インデックスまたはIDから対象の伏線を特定3. 伏線データの更新（resolved, resolution_chapter, potential_resolution, updatedTimestamp）4. 変更の保存@error-handling指定された伏線が見つからない場合はエラーをスローします。@state-changesこのメソッドは指定された伏線のデータを変更し、変更をストレージに保存します。

**@constructor:** function Object() { [native code] }

##### LongTermMemory.updateForeshadowing (method)

伏線情報を更新します指定された伏線の情報を更新します。初期化されていない場合は初期化を実行します。@async@param {number | string} indexOrId 伏線のインデックスまたはID@param {Partial<Foreshadowing>} updates 更新するフィールドと値@returns {Promise<Foreshadowing>} 更新後の伏線データ@throws {Error} 指定された伏線が見つからない場合@usage// IDで指定const updated = await longTermMemory.updateForeshadowing("fs-1-abcd1234", {  description: "更新された伏線の説明",  urgency: "critical"});@call-flow1. 初期化状態の確認と必要に応じた初期化2. インデックスまたはIDから対象の伏線を特定3. 不変のプロパティ（id, createdTimestamp）の保持4. 更新情報の適用5. 更新日時の設定6. 変更の保存7. 更新後の伏線データの返却@error-handling指定された伏線が見つからない場合はエラーをスローします。@state-changesこのメソッドは指定された伏線のデータを変更し、変更をストレージに保存します。

**@constructor:** function Object() { [native code] }

##### LongTermMemory.deleteForeshadowing (method)

伏線を削除します指定された伏線を長期記憶から削除します。初期化されていない場合は初期化を実行します。@async@param {number | string} indexOrId 伏線のインデックスまたはID@returns {Promise<void>} 処理完了時に解決するPromise@throws {Error} 指定された伏線が見つからない場合@usage// IDで指定await longTermMemory.deleteForeshadowing("fs-1-abcd1234");// インデックスで指定await longTermMemory.deleteForeshadowing(2);@call-flow1. 初期化状態の確認と必要に応じた初期化2. インデックスまたはIDから対象の伏線を特定3. 削除する伏線の説明を記録（ログ用）4. 伏線リストから対象を削除5. 変更の保存@error-handling指定された伏線が見つからない場合はエラーをスローします。@state-changesこのメソッドは伏線リスト（this.foreshadowing）を変更し、変更をストレージに保存します。

**@constructor:** function Object() { [native code] }

##### LongTermMemory.getUnresolvedForeshadowing (method)

未解決の伏線を取得します長期記憶から未解決（resolved = false）の伏線データを取得します。初期化されていない場合は初期化を実行します。@async@returns {Promise<Foreshadowing[]>} 未解決の伏線データの配列@usageconst unresolvedForeshadowings = await longTermMemory.getUnresolvedForeshadowing();console.log(`未解決の伏線: ${unresolvedForeshadowings.length}件`);@call-flow1. 初期化状態の確認と必要に応じた初期化2. 伏線リストからresolved = falseのアイテムをフィルタリング3. フィルタリングされた伏線の配列を返却

**@constructor:** function Object() { [native code] }

##### LongTermMemory.checkDuplicateForeshadowing (method)

伏線の重複チェックを行います指定された説明と一致する伏線が既に存在するかをチェックします。初期化されていない場合は初期化を実行します。@async@param {string} description チェックする伏線の説明@returns {Promise<boolean>} 重複が存在する場合はtrue、存在しない場合はfalse@usageconst isDuplicate = await longTermMemory.checkDuplicateForeshadowing("謎の手紙");if (isDuplicate) {  console.log("この伏線は既に登録されています");}@call-flow1. 初期化状態の確認と必要に応じた初期化2. 伏線リスト内で指定された説明と一致するアイテムの存在確認3. 存在するかどうかの真偽値を返却

**@constructor:** function Object() { [native code] }

##### LongTermMemory.suggestForeshadowingToResolve (method)

解決すべき伏線を推奨します現在のチャプターで解決すべき伏線を提案します。指定されたチャプターの前後3章以内に計画された解決チャプターがある未解決の伏線を抽出します。初期化されていない場合は初期化を実行します。@async@param {number} currentChapter 現在のチャプター番号@returns {Promise<Foreshadowing[]>} 推奨される伏線の配列@usageconst suggestedForeshadowings = await longTermMemory.suggestForeshadowingToResolve(7);console.log(`解決すべき伏線: ${suggestedForeshadowings.length}件`);@call-flow1. 初期化状態の確認と必要に応じた初期化2. チャプター範囲の設定（前後3章）3. 伏線リストから条件に合うアイテムをフィルタリング:   - 未解決 (resolved = false)   - 計画された解決チャプターがある (plannedResolution !== undefined)   - 計画された解決チャプターが現在のチャプター近辺にある4. フィルタリングされた伏線の配列を返却

**@constructor:** function Object() { [native code] }

##### LongTermMemory.integrateArcMemory (method)

アーク記憶を統合します中期記憶からのアーク記憶を長期記憶に統合します。テーマの発展や伏線の追加、キャラクターアーキタイプの抽出などを行います。初期化されていない場合は初期化を実行します。@async@param {ArcMemory} arcMemory 統合するアーク記憶@returns {Promise<void>} 処理完了時に解決するPromise@usageconst arcMemory = await midTermMemory.getArcMemory(2);await longTermMemory.integrateArcMemory(arcMemory);@call-flow1. 初期化状態の確認と必要に応じた初期化2. テーマの発展を記録   - 既存のアークエントリの確認と更新または新規追加   - テーマ発展に基づく全体テーマの更新   - テーマトラッカーの保存3. 伏線の統合   - 新しい伏線の追加（既存との重複チェック）   - 伏線マップの保存4. キャラクターアーキタイプの更新・抽出5. 圧縮時間の更新と保存@error-handling処理中のエラーはキャッチしてログに記録し、上位層に再スローします。@state-changesこのメソッドはテーマ情報、伏線リスト、キャラクターアーキタイプ、圧縮時間などの長期記憶データを更新し、変更をストレージに保存します。

**@constructor:** function Object() { [native code] }

##### LongTermMemory.updateOverallTheme (method)

全体テーマを更新します各アークのテーマ情報を基に、物語全体を貫く中心的なテーマをAIを使用して生成します。@private@async@returns {Promise<void>} 処理完了時に解決するPromise@call-flow1. テーマとその発展データの存在確認2. アークテーマを最新順に並べたプロンプトの作成3. GeminiClient（AI）を使用した全体テーマの生成4. テーマ説明の更新@error-handling処理中のエラーはキャッチしてログに記録しますが、エラー時はテーマを変更せず、処理を続行します。@external-dependencies- GeminiClient - AIを使用したテーマ生成@state-changesこのメソッドはテーマの説明（this.theme.description）を更新します。

**@constructor:** function Object() { [native code] }

##### LongTermMemory.extractCharacterArchetypes (method)

キャラクターアーキタイプを抽出しますアーク記憶からキャラクター情報を収集し、AIを使用して各キャラクターのアーキタイプと性格特性を分析・抽出します。@private@async@param {ArcMemory} arcMemory 分析対象のアーク記憶@returns {Promise<void>} 処理完了時に解決するPromise@call-flow1. アーク記憶からキャラクター情報の収集2. 既存のアーキタイプと新しいキャラクターの区別3. 新しいキャラクターのアーキタイプをAIで分析4. 分析結果の解析とキャラクターアーキタイプの追加5. 変更の保存@error-handling処理中のエラーはキャッチしてログに記録しますが、エラー時も可能な限り処理を続行します。JSONパース時のエラーも個別に処理します。@external-dependencies- GeminiClient - AIを使用したキャラクター分析@state-changesこのメソッドはキャラクターアーキタイプリスト（this.characterArchetypes）を更新し、変更をストレージに保存します。

**@constructor:** function Object() { [native code] }

##### LongTermMemory.checkConsistency (method)

整合性チェックを行います指定されたチャプターとこれまでの長期記憶情報との整合性を検証します。世界設定、キャラクター、プロットの整合性チェックを行います。初期化されていない場合は初期化を実行します。@async@param {Chapter} chapter チェック対象のチャプター@returns {Promise<ConsistencyResult>} 整合性チェック結果@usageconst result = await longTermMemory.checkConsistency(currentChapter);if (!result.isConsistent) {  console.log("整合性の問題が検出されました:");  result.issues.forEach(issue => console.log(issue.description));}@call-flow1. 初期化状態の確認と必要に応じた初期化2. 世界設定との整合性チェック3. キャラクター整合性チェック4. プロット整合性チェック5. すべての問題を集約した結果オブジェクトの作成@error-handling処理中のエラーはキャッチしてログに記録し、デフォルトの結果（isConsistent: true, issues: []）を返します。@external-dependencies- ConsistencyChecker - キャラクターとプロットの整合性チェック

**@constructor:** function Object() { [native code] }

##### LongTermMemory.checkWorldConsistency (method)

世界設定との整合性チェックを行います指定されたチャプターと世界設定ルールとの整合性を検証します。現在の実装では簡略化されており、将来的により高度なチェックを実装予定です。@private@async@param {Chapter} chapter チェック対象のチャプター@returns {Promise<ConsistencyIssue[]>} 整合性問題の配列@call-flow1. 世界設定ルールの存在確認2. ルールに基づく整合性チェック（現在は簡略化）3. 検出された問題の配列を返却@performance-considerations現在は簡略化された実装であり、検出能力は限定的です。将来的にはより高度で詳細なチェックを実装する予定です。

**@constructor:** function Object() { [native code] }

##### LongTermMemory.isInitialized (method)

初期化状態を確認します長期記憶マネージャーが正常に初期化されているかを確認します。@async@returns {Promise<boolean>} 初期化完了の場合はtrue、そうでない場合はfalse@usageconst initialized = await longTermMemory.isInitialized();if (!initialized) {  await longTermMemory.initialize();}@call-flow初期化フラグ（this.initialized）の値を返却します。

**@constructor:** function Object() { [native code] }

##### LongTermMemory.getLastCompressionTime (method)

最終圧縮時間を取得します長期記憶の最後の圧縮処理が実行された時間を取得します。圧縮処理が行われていない場合はnullを返します。@async@returns {Promise<Date | null>} 最終圧縮時間、または圧縮が行われていない場合はnull@usageconst lastCompression = await longTermMemory.getLastCompressionTime();if (lastCompression) {  console.log(`最終圧縮時間: ${lastCompression.toISOString()}`);} else {  console.log("まだ圧縮処理が実行されていません");}@call-flow最終圧縮時間（this.lastCompressionTime）の値を返却します。

**@constructor:** function Object() { [native code] }

##### LongTermMemory.getCharacterArchetypes (method)

キャラクターアーキタイプを取得します長期記憶に保存されているキャラクターアーキタイプ情報を取得します。初期化されていない場合は初期化を実行します。@async@returns {Promise<CharacterArchetype[]>} キャラクターアーキタイプの配列@usageconst archetypes = await longTermMemory.getCharacterArchetypes();archetypes.forEach(character => {  console.log(`${character.name}: ${character.traits.join(', ')}`);});@call-flow1. 初期化状態の確認と必要に応じた初期化2. キャラクターアーキタイプの配列を返却

**@constructor:** function Object() { [native code] }


---

### manager.ts {#cnovel-automation-systemsrclibmemorymanagerts}

**Path:** `C:/novel-automation-system/src/lib/memory/manager.ts`

@fileoverview 階層的記憶管理システムのマネージャー@description物語創作支援システムのための階層的記憶管理を制御する中央モジュールです。短期記憶、中期記憶、長期記憶の3階層で構成される記憶システムを統合的に管理し、物語の展開に応じた記憶の保存、圧縮、検索、および整合性確保の機能を提供します。@role- 階層的記憶管理システムの中央コントローラー- 短期/中期/長期記憶の統合管理- チャプター処理と記憶の更新- アーク境界の検出と管理- 記憶の圧縮と階層間統合- 自然言語による記憶検索- 重要イベントと伏線の追跡@dependencies- @/types/memory - メモリ関連の型定義- @/types/chapters - チャプター関連の型定義- @/lib/memory/short-term-memory - 短期記憶管理モジュール- @/lib/memory/mid-term-memory - 中期記憶管理モジュール- @/lib/memory/long-term-memory - 長期記憶管理モジュール- @/lib/utils/logger - ログ出力ユーティリティ- @/lib/utils/error-handler - エラーハンドリングユーティリティ- @/lib/generation/gemini-client - AI生成テキストクライアント@types- @/lib/memory/types - 記憶管理システムの型定義@flow1. システムの初期化と各階層記憶の読み込み2. チャプターの処理と短期記憶への保存3. アーク境界の検出と中期記憶の管理4. 短期記憶の圧縮と中期記憶への統合5. 中期記憶の長期記憶への統合6. 記憶の検索と関連情報の取得7. 記憶の同期と整合性の維持

**@constructor:** function Object() { [native code] }

#### MemoryManager (class)

@fileoverview 階層的記憶管理システムのマネージャー@description物語創作支援システムのための階層的記憶管理を制御する中央モジュールです。短期記憶、中期記憶、長期記憶の3階層で構成される記憶システムを統合的に管理し、物語の展開に応じた記憶の保存、圧縮、検索、および整合性確保の機能を提供します。@role- 階層的記憶管理システムの中央コントローラー- 短期/中期/長期記憶の統合管理- チャプター処理と記憶の更新- アーク境界の検出と管理- 記憶の圧縮と階層間統合- 自然言語による記憶検索- 重要イベントと伏線の追跡@dependencies- @/types/memory - メモリ関連の型定義- @/types/chapters - チャプター関連の型定義- @/lib/memory/short-term-memory - 短期記憶管理モジュール- @/lib/memory/mid-term-memory - 中期記憶管理モジュール- @/lib/memory/long-term-memory - 長期記憶管理モジュール- @/lib/utils/logger - ログ出力ユーティリティ- @/lib/utils/error-handler - エラーハンドリングユーティリティ- @/lib/generation/gemini-client - AI生成テキストクライアント@types- @/lib/memory/types - 記憶管理システムの型定義@flow1. システムの初期化と各階層記憶の読み込み2. チャプターの処理と短期記憶への保存3. アーク境界の検出と中期記憶の管理4. 短期記憶の圧縮と中期記憶への統合5. 中期記憶の長期記憶への統合6. 記憶の検索と関連情報の取得7. 記憶の同期と整合性の維持/
import {
ChapterMemory,
KeyEvent,
ArcMemory,
CompressedMemory,
SearchResult,
MemoryType,
SyncMemoryRequest,
SyncMemoryResponse,
CompressionAction,
Memory
} from '@/types/memory';
import { Chapter } from '@/types/chapters';
import { ShortTermMemory } from './short-term-memory';
import { MidTermMemory } from './mid-term-memory';
import { LongTermMemory } from './long-term-memory';
import { logger } from '@/lib/utils/logger';
import { logError } from '@/lib/utils/error-handler';
import { GeminiClient } from '@/lib/generation/gemini-client';
import { IMemoryManager, MemorySystemStatus, SearchOptions } from './types';

/**@class MemoryManager@description階層的記憶管理システムの中央制御を行うマネージャークラスです。短期記憶、中期記憶、長期記憶の3階層で構成される記憶システムを統合的に管理し、物語の展開に応じた記憶の保存、圧縮、検索、整合性確保の機能を提供します。メモリキャッシュを活用して効率的なアクセスをサポートします。@role- 階層的記憶システムの初期化と管理- チャプターからの記憶生成と保存- アーク境界の検出とアーク管理- 記憶の圧縮と階層間統合の制御- 自然言語による記憶検索の提供- 重要イベントと伏線の追跡管理- システム状態の監視と提供@used-by- 物語創作支援システムのコアモジュール- チャプター管理システム- 物語生成支援機能@depends-on- ShortTermMemory - 直近チャプターの詳細記憶管理- MidTermMemory - 現在のアークに関連する記憶管理- LongTermMemory - 世界設定、テーマ、伏線などの長期的記憶管理- GeminiClient - AIテキスト生成サービスとの連携@lifecycle1. コンストラクタでの依存関係初期化2. initialize()メソッドによる各記憶層の読み込み3. チャプター処理によるデータ蓄積4. 定期的な記憶の圧縮と階層間統合5. 必要に応じた記憶検索と取得@example-flowアプリケーション → MemoryManager.processChapter →   短期記憶への追加 →  アーク境界の検出 →  短期記憶の圧縮 →  中期記憶への統合 →  長期記憶への統合

**@constructor:** function Object() { [native code] }

#### Methods of MemoryManager

##### MemoryManager.constructor (method)

マネージャークラスを初期化しますGeminiClientと各記憶層のインスタンスを作成し、初期設定を行います。ただし、実際のデータ読み込みは initialize() メソッドで行われます。@constructor@usage// 基本的な初期化const memoryManager = new MemoryManager();await memoryManager.initialize();@call-flow1. GeminiClientインスタンスの作成2. 各記憶層（短期・中期・長期）のインスタンス作成3. メモリキャッシュマップの初期化4. ログ出力@initializationこのコンストラクタは各クラスのインスタンス作成のみを行い、実際のデータ読み込みや初期化処理は initialize() メソッドで非同期的に実行されます。

**@constructor:** function Object() { [native code] }

##### MemoryManager.initialize (method)

初期化処理を実行します各レベルの記憶システムを読み込み、初期化します。このメソッドは他のメソッドを呼び出す前に実行する必要があります。@async@returns {Promise<void>} 初期化完了時に解決するPromise@throws {Error} 初期化に失敗した場合@usage// 初期化の実行await memoryManager.initialize();@call-context- 同期/非同期: 非同期メソッド（await必須）- 前提条件: なし（システム起動時に呼び出される想定）@call-flow1. 初期化状態のチェック（二重初期化の防止）2. 各記憶層（短期・中期・長期）の並列初期化3. 初期化完了フラグの設定4. ログの記録@error-handling初期化中にエラーが発生した場合は、ログに記録した上で上位層に例外をスローします。これにより、アプリケーションは適切な回復処理を実装できます。

**@constructor:** function Object() { [native code] }

##### MemoryManager.processChapter (method)

チャプター処理を実行します新しいチャプターを処理し、短期記憶に追加、アーク境界の検出、必要に応じた記憶の圧縮を行います。@async@param {Chapter} chapter 処理対象のチャプター@returns {Promise<void>} 処理完了時に解決するPromise@throws {Error} 処理に失敗した場合@usage// チャプター処理の実行const chapter = {  chapterNumber: 5,  title: "新たな旅立ち",  content: "チャプターの内容...",  // その他のプロパティ};await memoryManager.processChapter(chapter);@call-context- 同期/非同期: 非同期メソッド（await必須）- 前提条件: システムが初期化されていること@call-flow1. 未初期化の場合は初期化処理を実行2. 短期記憶にチャプターを追加3. チャプターキャッシュの更新4. アーク境界の検出処理5. 短期記憶の圧縮（条件付き）6. 処理完了のログ記録@error-handling処理中にエラーが発生した場合は、チャプター番号と共にログに記録し、上位層に例外をスローします。@state-changes- 短期記憶にチャプターメモリが追加される- チャプターメモリキャッシュが更新される- アーク境界検出により新しいアークが開始される可能性がある- 短期記憶の圧縮条件を満たす場合、記憶の圧縮と統合が行われる

**@constructor:** function Object() { [native code] }

##### MemoryManager.detectArcBoundary (method)

アーク境界を検出しますチャプターの内容に基づいて、新しいアークの開始が必要かどうかを判断し、必要に応じて新しいアークを開始します。@private@async@param {Chapter} chapter 検査対象のチャプター@returns {Promise<void>} 処理完了時に解決するPromise@call-flow1. 現在のアークを取得2. アークが存在しない場合、新しいアークを開始3. 既存のアークがある場合、アーク終了条件を評価4. アーク終了条件を満たす場合、現在のアークを完了5. 新しいアークの開始6. アークキャッシュを無効化@helper-methods- deriveThemeFromChapter - チャプターからテーマを抽出- evaluateArcEndingCondition - アーク終了条件の評価- midTermMemory.startNewArc - 新しいアークの開始- midTermMemory.completeArc - アークの完了処理@error-handling処理中にエラーが発生した場合は、チャプター番号と共にログに記録しますが、例外はスローせず処理を継続します。

**@constructor:** function Object() { [native code] }

##### MemoryManager.deriveThemeFromChapter (method)

チャプターからテーマを導出しますチャプターの内容を分析し、AIを使用してこの部分の中心的なテーマを20-30文字程度で抽出します。@private@async@param {Chapter} chapter 分析対象のチャプター@returns {Promise<string>} 導出されたテーマ@call-flow1. チャプターのタイトルと内容からプロンプトを作成2. GeminiClientを使用してテキスト生成3. 生成されたテーマテキストの整形と返却@external-dependencies- GeminiClient - AIテキスト生成@error-handling処理中にエラーが発生した場合は、チャプター番号と共にログに記録し、「新たな展開」というデフォルトテーマを返します。

**@constructor:** function Object() { [native code] }

##### MemoryManager.evaluateArcEndingCondition (method)

アーク終了条件を評価します現在のチャプターと現在のアーク情報に基づいて、アークを終了すべきかどうかを判断します。@private@async@param {Chapter} chapter 現在のチャプター@param {ArcMemory} currentArc 現在のアーク@returns {Promise<boolean>} アークを終了すべき場合はtrue@call-flow1. 現在のアークのチャプター数を計算2. チャプター数に基づく単純な終了条件の評価（10チャプター以上）3. テーマ相違の検出評価4. 評価結果の返却@helper-methods- isThematicallyDifferent - テーマの相違を検出@error-handling処理中にエラーが発生した場合は、チャプター番号と共にログに記録し、falseを返して変更を行わないようにします。

**@constructor:** function Object() { [native code] }

##### MemoryManager.isThematicallyDifferent (method)

テーマの相違を検出します現在のチャプターが現在のアークのテーマから大きく逸脱しているかどうかを評価します。@private@async@param {Chapter} chapter 現在のチャプター@param {ArcMemory} currentArc 現在のアーク@returns {Promise<boolean>} テーマが大きく異なる場合はtrue@call-flow1. 直近のチャプターメモリを取得2. 比較対象が不足している場合はfalseを返却3. 要約情報からプロンプトを作成4. GeminiClientを使用してテーマの違いを分析5. 「はい」か「Yes」で始まる回答ならtrueを返却@external-dependencies- GeminiClient - AIテキスト生成による分析@helper-methods- getRecentChapterMemories - 直近のチャプターメモリを取得@error-handling処理中にエラーが発生した場合は、チャプター番号と共にログに記録し、falseを返して変更を行わないようにします。

**@constructor:** function Object() { [native code] }

##### MemoryManager.compressShortTermMemoryIfNeeded (method)

条件を満たした場合に短期記憶を圧縮します短期記憶のエントリ数が一定数を超えた場合に、圧縮処理を実行して中期記憶に統合します。@private@async@returns {Promise<void>} 処理完了時に解決するPromise@call-flow1. 短期記憶のエントリ数を取得2. エントリ数が閾値（5）以上かチェック3. 現在のアークを取得4. アーク開始以降のチャプターメモリを選択5. 選択されたメモリが閾値以上ある場合に圧縮を実行6. 中期記憶への統合7. 完了したアークを長期記憶に統合@helper-methods- midTermMemory.compressAndIntegrate - 中期記憶への圧縮と統合- integrateMidTermToLongTerm - 中期記憶の長期記憶への統合@error-handling処理中にエラーが発生した場合は、ログに記録しますが、例外はスローせず処理を継続します。

**@constructor:** function Object() { [native code] }

##### MemoryManager.integrateMidTermToLongTerm (method)

中期記憶を長期記憶に統合します完了済みのアークを長期記憶に統合し、物語の全体的な構造やテーマを更新します。@private@async@returns {Promise<void>} 処理完了時に解決するPromise@call-flow1. 全てのアークを取得2. 完了済み（is_complete=true）のアークを選別3. アークキャッシュで未処理のアークを特定4. 未処理の完了済みアークを長期記憶に統合5. アークキャッシュを更新@helper-methods- longTermMemory.integrateArcMemory - アーク記憶の長期記憶への統合@error-handling処理中にエラーが発生した場合は、ログに記録しますが、例外はスローせず処理を継続します。

**@constructor:** function Object() { [native code] }

##### MemoryManager.getRecentChapterMemories (method)

最近のチャプターメモリを取得します指定されたチャプター番号以下の最新のチャプターメモリを、オプションで指定された数だけ取得します。@async@param {number} upToChapter 取得する最大チャプター番号@param {number} [limit] 取得数の上限@returns {Promise<ChapterMemory[]>} チャプターメモリの配列@usage// 最新5つのチャプターメモリを取得const recentMemories = await memoryManager.getRecentChapterMemories(currentChapter, 5);// すべてのチャプターメモリを取得const allMemories = await memoryManager.getRecentChapterMemories(currentChapter);@call-context- 同期/非同期: 非同期メソッド（await必須）- 前提条件: システムが初期化されていること@call-flow1. 未初期化の場合は初期化処理を実行2. 短期記憶から全てのチャプターメモリを取得3. チャプター番号の降順でソート4. オプションで指定された数に制限5. 結果の返却@error-handling処理中にエラーが発生した場合は、パラメータと共にログに記録し、空の配列を返します。

**@constructor:** function Object() { [native code] }

##### MemoryManager.getCurrentArc (method)

現在のアーク情報を取得します指定されたチャプター番号が属するアークの情報を取得します。@async@param {number} chapterNumber チャプター番号@returns {Promise<ArcMemory | null>} 現在のアークメモリ、存在しない場合はnull@usage// 現在のアーク情報を取得const currentArc = await memoryManager.getCurrentArc(currentChapter);if (currentArc) {  console.log(`現在のアーク: ${currentArc.number} - ${currentArc.theme}`);}@call-context- 同期/非同期: 非同期メソッド（await必須）- 前提条件: システムが初期化されていること@call-flow1. 未初期化の場合は初期化処理を実行2. 中期記憶から現在のアーク情報を取得3. 結果の返却@helper-methods- midTermMemory.getCurrentArc - 中期記憶からアーク情報を取得@error-handling処理中にエラーが発生した場合は、チャプター番号と共にログに記録し、nullを返します。

**@constructor:** function Object() { [native code] }

##### MemoryManager.getImportantEvents (method)

重要イベントを取得します指定されたチャプター範囲内の重要イベントを取得します。短期記憶と中期記憶から重要度の高いイベントを収集します。@async@param {number} startChapter 開始チャプター番号@param {number} endChapter 終了チャプター番号@returns {Promise<KeyEvent[]>} 重要イベントの配列@usage// チャプター5から10までの重要イベントを取得const events = await memoryManager.getImportantEvents(5, 10);@call-context- 同期/非同期: 非同期メソッド（await必須）- 前提条件: システムが初期化されていること@call-flow1. 未初期化の場合は初期化処理を実行2. 短期記憶から指定範囲のチャプターメモリを取得3. チャプターメモリから重要イベントを抽出4. 中期記憶から関連するアークを取得5. アークの転換点から指定範囲のイベントを抽出6. 全イベントを重要度でソート7. 重複イベントを除去8. 結果の返却@helper-methods- removeDuplicateEvents - 重複イベントの除去@error-handling処理中にエラーが発生した場合は、パラメータと共にログに記録し、空の配列を返します。

**@constructor:** function Object() { [native code] }

##### MemoryManager.removeDuplicateEvents (method)

重複するイベントを除去しますイベントの説明とチャプター番号の組み合わせに基づいて重複するイベントを除去します。@private@param {KeyEvent[]} events 重要イベントの配列@returns {KeyEvent[]} 重複を除去したイベント配列@call-flow1. 結果格納用の配列を初期化2. 一意性チェック用のSetを作成3. 各イベントに対して一意性をチェック4. 未登録のイベントのみを結果配列に追加5. 結果の返却

**@constructor:** function Object() { [native code] }

##### MemoryManager.searchMemories (method)

記憶の自然言語検索を実行します指定された検索クエリに基づいて関連する記憶を検索し、関連度によってランク付けされた結果を返します。@async@param {string} query 検索クエリ@param {SearchOptions} [options] 検索オプション@returns {Promise<SearchResult[]>} 検索結果の配列@usage// 基本的な検索const results = await memoryManager.searchMemories("主人公が見つけた謎の手紙");// オプション付きの検索const results = await memoryManager.searchMemories("魔法の森での出来事", {  limit: 5,  minRelevance: 0.7,  memoryTypes: ['SHORT_TERM', 'MID_TERM'],  includeMeta: true});@call-context- 同期/非同期: 非同期メソッド（await必須）- 前提条件: システムが初期化されていること@call-flow1. 未初期化の場合は初期化処理を実行2. デフォルトオプションとのマージ3. 各記憶層から関連する記憶を収集   - 短期記憶: チャプター要約とキーイベント   - 中期記憶: アーク情報と圧縮された記憶   - 長期記憶: 世界設定、テーマ、伏線、キャラクターアーキタイプ4. 検索クエリに基づく関連性のスコアリング5. 関連性の高い順にソート6. 指定された件数に制限7. 結果の返却@helper-methods- scoreMemoryRelevance - 記憶の関連性スコアリング@error-handling処理中にエラーが発生した場合は、クエリと共にログに記録し、空の配列を返します。@performance-considerations大量の記憶を検索する場合は、キーワードによる事前フィルタリングとバッチ処理を行うことでパフォーマンスを最適化しています。

**@constructor:** function Object() { [native code] }

##### MemoryManager.scoreMemoryRelevance (method)

記憶の関連性スコアを計算します検索クエリに対する各記憶の関連性をスコアリングします。AIを使用した高精度な関連性評価とキーワードマッチングの組み合わせで実装されています。@private@async@param {string} query 検索クエリ@param {Memory[]} memories 記憶配列@param {number} minRelevance 最小関連性スコア@returns {Promise<SearchResult[]>} 検索結果の配列@call-flow1. 空の記憶配列チェック2. キーワードによる事前フィルタリング3. バッチ処理のための分割4. AIによる関連性評価5. 最小関連性以上のものをフィルタリング6. 結果の返却@helper-methods- prefilterMemoriesByKeywords - キーワードによる事前フィルタリング- evaluateRelevanceWithAI - AIによる関連性評価- fallbackKeywordSearch - フォールバック用のキーワード検索@error-handling処理中にエラーが発生した場合は、クエリと共にログに記録し、シンプルなキーワードマッチングによるフォールバック結果を返します。@performance-considerations大量の記憶を効率的に処理するため、以下の最適化を実装:- キーワードによる事前フィルタリング- 最大バッチサイズによる分割処理- エラー時のフォールバック検索メカニズム

**@constructor:** function Object() { [native code] }

##### MemoryManager.evaluateRelevanceWithAI (method)

AIを使用して記憶の関連性を評価しますGeminiClientを使用して、検索クエリに対する各記憶の関連性と関連する部分を抽出します。@private@async@param {string} query 検索クエリ@param {Memory[]} memories 記憶配列@returns {Promise<SearchResult[]>} 検索結果の配列@call-flow1. 空の記憶配列チェック2. 記憶テキストの結合とプロンプトの作成3. GeminiClientによるテキスト生成4. 生成結果のJSONパース5. 検索結果へのマッピング6. 結果の返却@external-dependencies- GeminiClient - AIテキスト生成による関連性評価@error-handlingJSONパースに失敗した場合は、エラーをログに記録し、各記憶のプライオリティをそのまま関連度として使用したフォールバック結果を返します。

**@constructor:** function Object() { [native code] }

##### MemoryManager.prefilterMemoriesByKeywords (method)

キーワードで記憶をプリフィルタリングします検索クエリからキーワードを抽出し、いずれかのキーワードを含む記憶のみをフィルタリングします。@private@param {string} query 検索クエリ@param {Memory[]} memories 記憶配列@returns {Memory[]} フィルタリングされた記憶配列@call-flow1. 検索クエリからキーワードを抽出2. 抽出したキーワードが空の場合は全ての記憶を返却3. いずれかのキーワードにマッチする記憶をフィルタリング4. フィルタリング結果の返却@performance-considerationsAIによる関連性評価の前に、単純なキーワードマッチングで候補を絞り込むことで、処理効率を向上させています。

**@constructor:** function Object() { [native code] }

##### MemoryManager.fallbackKeywordSearch (method)

フォールバックのキーワード検索を実行しますAIによる関連性評価に失敗した場合のフォールバックとして、シンプルなキーワードマッチングによる検索を実行します。@private@param {string} query 検索クエリ@param {Memory[]} memories 記憶配列@param {number} minRelevance 最小関連性スコア@returns {SearchResult[]} 検索結果の配列@call-flow1. 検索クエリからキーワードを抽出2. 抽出したキーワードが空の場合はプライオリティのみで評価3. 各記憶に対してキーワードマッチングを実行4. キーワードの出現状況に基づくスコアリング5. プライオリティを加味した最終スコアの計算6. 最小関連性以上のものをフィルタリング7. 関連性の高い順にソート8. 結果の返却@performance-considerations単純なテキストマッチングに基づくため、AIを使用した方法より精度は劣りますが、処理速度は高速です。

**@constructor:** function Object() { [native code] }

##### MemoryManager.syncMemories (method)

記憶の同期処理を実行します短期記憶から中期記憶、中期記憶から長期記憶への同期と圧縮処理を実行します。@async@param {SyncMemoryRequest} request 同期リクエスト@returns {Promise<SyncMemoryResponse>} 同期レスポンス@usage// 通常の同期const result = await memoryManager.syncMemories({  chapterNumber: currentChapter});// 強制同期const result = await memoryManager.syncMemories({  chapterNumber: currentChapter,  force: true});@call-context- 同期/非同期: 非同期メソッド（await必須）- 前提条件: システムが初期化されていること@call-flow1. 未初期化の場合は初期化処理を実行2. 短期記憶のエントリ数を取得3. 閾値に達した場合または強制フラグがある場合に圧縮を実行4. 中期記憶を長期記憶に統合（条件付き）5. 圧縮アクションと更新された記憶の情報を収集6. 同期レスポンスの作成と返却@helper-methods- integrateMidTermToLongTermIfNeeded - 条件付きの中期→長期統合@error-handling処理中にエラーが発生した場合は、チャプター番号と共にログに記録し、失敗を示す同期レスポンスを返します。

**@constructor:** function Object() { [native code] }

##### MemoryManager.integrateMidTermToLongTermIfNeeded (method)

条件を満たした場合に中期記憶を長期記憶に統合します完了したアークを検索し、それらを長期記憶に統合します。@private@async@param {boolean} [force] 強制実行フラグ@returns {Promise<boolean>} 更新が行われた場合はtrue@call-flow1. 完了したアークを検索2. 完了したアークがない場合かつ強制フラグがない場合はfalseを返却3. 検出した完了済みアークを長期記憶に統合4. アークが統合された場合はtrueを返却@helper-methods- longTermMemory.integrateArcMemory - アーク記憶の長期記憶への統合@error-handling処理中にエラーが発生した場合は、ログに記録し、falseを返します。

**@constructor:** function Object() { [native code] }

##### MemoryManager.getRelevantMemories (method)

特定のチャプターに関連するメモリを取得します指定されたチャプター番号に関連する記憶を各階層から取得します。@async@param {number} chapterNumber 対象チャプター番号@param {Object} [options] 取得オプション@param {MemoryType[]} [options.types] 取得する記憶タイプの配列@param {number} [options.limit] 取得数の上限@returns {Promise<Memory[]>} 関連する記憶の配列@usage// デフォルトオプションで取得const memories = await memoryManager.getRelevantMemories(currentChapter);// カスタムオプションで取得const memories = await memoryManager.getRelevantMemories(currentChapter, {  types: ['SHORT_TERM', 'MID_TERM'],  limit: 10});@call-context- 同期/非同期: 非同期メソッド（await必須）- 前提条件: システムが初期化されていること@call-flow1. 未初期化の場合は初期化処理を実行2. デフォルトオプションとのマージ3. 短期記憶からの関連メモリ収集（オプション指定時）4. 中期記憶からの関連メモリ収集（オプション指定時）5. 長期記憶からの関連メモリ収集（オプション指定時）6. メモリを優先度でソート7. 指定された件数に制限8. 結果の返却@error-handling処理中にエラーが発生した場合は、チャプター番号と共にログに記録し、空の配列を返します。

**@constructor:** function Object() { [native code] }

##### MemoryManager.getShortTermMemory (method)

短期記憶インスタンスへのアクセスを提供します短期記憶の管理インスタンスを取得し、直接操作を可能にします。@returns {ShortTermMemory} 短期記憶インスタンス@throws {Error} メモリーマネージャーが初期化されていない場合@usage// 短期記憶への直接アクセスconst shortTermMemory = memoryManager.getShortTermMemory();const chapterMemory = await shortTermMemory.getChapterMemory(5);@call-context- 同期/非同期: 同期メソッド- 前提条件: システムが初期化されていること@call-flow1. 初期化状態のチェック2. 短期記憶インスタンスの返却@error-handlingシステムが初期化されていない場合はエラーをスローします。

**@constructor:** function Object() { [native code] }

##### MemoryManager.getMidTermMemory (method)

中期記憶インスタンスへのアクセスを提供します中期記憶の管理インスタンスを取得し、直接操作を可能にします。@returns {MidTermMemory} 中期記憶インスタンス@throws {Error} メモリーマネージャーが初期化されていない場合@usage// 中期記憶への直接アクセスconst midTermMemory = memoryManager.getMidTermMemory();const arcMemory = await midTermMemory.getArcMemory(2);@call-context- 同期/非同期: 同期メソッド- 前提条件: システムが初期化されていること@call-flow1. 初期化状態のチェック2. 中期記憶インスタンスの返却@error-handlingシステムが初期化されていない場合はエラーをスローします。

**@constructor:** function Object() { [native code] }

##### MemoryManager.getLongTermMemory (method)

長期記憶インスタンスへのアクセスを提供します長期記憶の管理インスタンスを取得し、直接操作を可能にします。@returns {LongTermMemory} 長期記憶インスタンス@throws {Error} メモリーマネージャーが初期化されていない場合@usage// 長期記憶への直接アクセスconst longTermMemory = memoryManager.getLongTermMemory();const worldSettings = await longTermMemory.getWorldSettings();@call-context- 同期/非同期: 同期メソッド- 前提条件: システムが初期化されていること@call-flow1. 初期化状態のチェック2. 長期記憶インスタンスの返却@error-handlingシステムが初期化されていない場合はエラーをスローします。

**@constructor:** function Object() { [native code] }

##### MemoryManager.isInitialized (method)

初期化状態を確認します記憶マネージャーが正常に初期化されているかどうかを確認します。@async@returns {Promise<boolean>} 初期化済みの場合はtrue@usage// 初期化状態の確認const initialized = await memoryManager.isInitialized();if (!initialized) {  await memoryManager.initialize();}@call-context- 同期/非同期: 非同期メソッド（await必須）@call-flow初期化状態フラグ（this.initialized）をそのまま返却します。

**@constructor:** function Object() { [native code] }

##### MemoryManager.getStatus (method)

システムの状態情報を取得します階層的記憶システム全体の現在の状態情報を取得します。@async@returns {Promise<MemorySystemStatus>} メモリーシステムの状態@usage// システム状態の取得const status = await memoryManager.getStatus();console.log(`短期記憶エントリ数: ${status.shortTerm.entryCount}`);console.log(`現在のアーク: ${status.midTerm.currentArc?.name}`);@call-context- 同期/非同期: 非同期メソッド（await必須）- 前提条件: なし（未初期化の場合は内部で初期化処理を実行）@call-flow1. 未初期化の場合は初期化処理を実行2. 短期記憶の状態情報取得3. 中期記憶の状態情報取得4. 長期記憶の状態情報取得5. 各層の情報を統合した状態オブジェクトを作成6. 結果の返却@error-handling処理中にエラーが発生した場合は、ログに記録し、最小限の情報のみを含む状態オブジェクトを返します。

**@constructor:** function Object() { [native code] }


---

### mid-term-memory.ts {#cnovel-automation-systemsrclibmemorymid-term-memoryts}

**Path:** `C:/novel-automation-system/src/lib/memory/mid-term-memory.ts`

@fileoverview 中期記憶管理モジュール@description物語創作支援システムにおける中期記憶（ストーリーアーク）を管理するモジュールです。チャプターメモリを圧縮・統合し、現在進行中のストーリーアークに関する記憶を管理します。アークの開始、完了、要約生成などの機能を提供します。@role- 短期記憶から圧縮された情報の統合・管理- ストーリーアークの境界管理- アーク内の重要イベント・転換点の追跡- キャラクター変化の追跡- 中期記憶の永続化@dependencies- @/types/memory - メモリ関連の型定義- @/lib/storage - ストレージアクセス機能- @/lib/utils/yaml-helper - YAML形式データの操作ユーティリティ- @/lib/utils/logger - ログ出力機能- @/lib/utils/error-handler - エラーハンドリング機能- @/lib/generation/gemini-client - AI生成機能クライアント@flow1. ストレージからの中期記憶データ（アーク情報）の読み込み2. 短期記憶（チャプターメモリ）の圧縮と統合3. アーク情報の管理（開始、完了、更新）4. 圧縮された記憶の永続化5. 要約と分析の生成

**@constructor:** function Object() { [native code] }

#### MidTermMemory (class)

@fileoverview 中期記憶管理モジュール@description物語創作支援システムにおける中期記憶（ストーリーアーク）を管理するモジュールです。チャプターメモリを圧縮・統合し、現在進行中のストーリーアークに関する記憶を管理します。アークの開始、完了、要約生成などの機能を提供します。@role- 短期記憶から圧縮された情報の統合・管理- ストーリーアークの境界管理- アーク内の重要イベント・転換点の追跡- キャラクター変化の追跡- 中期記憶の永続化@dependencies- @/types/memory - メモリ関連の型定義- @/lib/storage - ストレージアクセス機能- @/lib/utils/yaml-helper - YAML形式データの操作ユーティリティ- @/lib/utils/logger - ログ出力機能- @/lib/utils/error-handler - エラーハンドリング機能- @/lib/generation/gemini-client - AI生成機能クライアント@flow1. ストレージからの中期記憶データ（アーク情報）の読み込み2. 短期記憶（チャプターメモリ）の圧縮と統合3. アーク情報の管理（開始、完了、更新）4. 圧縮された記憶の永続化5. 要約と分析の生成/
import {
ChapterMemory,
CompressedMemory,
ArcMemory,
ArcSummary,
KeyEvent
} from '@/types/memory';
import { storageProvider } from '@/lib/storage';
import { parseYaml, stringifyYaml } from '@/lib/utils/yaml-helper';
import { logger } from '@/lib/utils/logger';
import { logError } from '@/lib/utils/error-handler';
import { GeminiClient } from '@/lib/generation/gemini-client';

/**@class MidTermMemory@description現在のストーリーアークに関する記憶を管理するクラス。短期記憶から圧縮された情報を統合し、アーク単位での記憶を管理します。アークの開始、完了、要約生成、記憶の圧縮などの機能を提供します。@role- YAML形式での中期記憶データの保存と読み込み- アーク境界の管理（開始と完了）- 短期記憶の圧縮と統合- キャラクター発展の追跡- アーク要約の生成- 転換点の識別と管理@used-by- @/lib/memory/manager - メモリ管理システム@depends-on- storageProvider - 永続化ストレージへのアクセス- GeminiClient - AIを活用した要約と分析の生成@lifecycle1. コンストラクタでの基本的な依存関係の初期化2. initialize()メソッドによるストレージからのデータ読み込み3. startNewArc()による新しいアークの開始4. compressAndIntegrate()による短期記憶の統合5. completeArc()によるアークの完了処理@example-flowMemoryManager → MidTermMemory.initialize →   ストレージからの設定読み込み →  短期記憶の圧縮（compressAndIntegrate） →  アークへの統合（integrateToCurrentArc） →  保存（save）

**@constructor:** function Object() { [native code] }

#### Methods of MidTermMemory

##### MidTermMemory.constructor (method)

中期記憶クラスを初期化しますGeminiClientを設定し、クラスの基本構成を初期化します。実際のデータの読み込みはinitialize()メソッドで行われます。@constructor@param {GeminiClient} [geminiClient] - AIテキスト生成クライアント（オプション）@usage// 基本的な初期化const midTermMemory = new MidTermMemory();// カスタムGeminiClientを使用した初期化const customClient = new GeminiClient();const midTermMemory = new MidTermMemory(customClient);@call-flow1. GeminiClientの設定（指定されていなければ新規作成）2. arcsの空配列初期化3. lastUpdateTimeのnull初期化4. 初期化ログの出力

**@constructor:** function Object() { [native code] }

##### MidTermMemory.initialize (method)

初期化処理を実行しますストレージから既存の中期記憶データを読み込み、クラスの状態を設定します。データが存在しない場合は新しい空の状態で初期化します。@async@returns {Promise<void>} 初期化完了時に解決するPromise@usageawait midTermMemory.initialize();@call-flow1. ストレージパスの存在確認2. 存在する場合はデータを読み込み3. 有効なデータ形式かを検証4. 有効なら、arcsとlastUpdateTimeを設定5. 無効または存在しない場合は空の状態で初期化6. 必要に応じてディレクトリを作成@error-handling初期化エラーが発生した場合はログに記録し、空の配列で初期化します。

**@constructor:** function Object() { [native code] }

##### MidTermMemory.save (method)

現在の記憶をストレージに保存します中期記憶データをYAML形式に変換し、ストレージに保存します。保存時に最終更新時間も更新します。@private@async@returns {Promise<void>} 保存完了時に解決するPromise@throws {Error} 保存に失敗した場合@call-flow1. 最終更新時間を現在時刻に更新2. アークデータと最終更新時間を含むオブジェクトを作成3. オブジェクトをYAML文字列に変換4. ストレージにYAML文字列を書き込み5. 保存完了のログを出力@error-handling保存に失敗した場合はエラーをログに記録し、呼び出し元に例外をスロー

**@constructor:** function Object() { [native code] }

##### MidTermMemory.getArcMemory (method)

アークメモリを取得します指定されたアーク番号に対応するアークメモリを取得します。@async@param {number} arcNumber - アーク番号@returns {Promise<ArcMemory | null>} アークメモリ、または存在しない場合はnull@usageconst arc = await midTermMemory.getArcMemory(2);if (arc) {  console.log(`アーク${arc.number}: ${arc.theme}`);}@call-flowarcs配列からarcNumber一致するものを検索し、見つかった場合はそのアーク、見つからない場合はnullを返します。

**@constructor:** function Object() { [native code] }

##### MidTermMemory.getCurrentArc (method)

現在のアークを取得します指定されたチャプター番号を含むアークを検索して返します。該当するアークがない場合は最新のアークを返します。@async@param {number} chapterNumber - 現在のチャプター番号@returns {Promise<ArcMemory | null>} 現在のアークメモリ、または存在しない場合はnull@usageconst currentArc = await midTermMemory.getCurrentArc(15);@call-flow1. arcs配列をループして、チャプター番号が範囲内に含まれるアークを検索2. 見つかった場合はそのアークを返す3. 見つからない場合で、arcsが空でなければ最新のアークを返す4. それ以外の場合はnullを返す@helper-methods- getArcMemory - 特定のアーク番号のアークを取得

**@constructor:** function Object() { [native code] }

##### MidTermMemory.startNewArc (method)

新しいアークを開始します指定された情報を元に新しいアークを作成し、既存の進行中アークがあれば完了させます。@async@param {number} arcNumber - アーク番号@param {string} theme - アークのテーマ@param {number} startChapter - 開始チャプター番号@returns {Promise<ArcMemory>} 作成された新しいアーク@usageconst newArc = await midTermMemory.startNewArc(3, "新たな旅立ち", 21);@call-flow1. 開始ログの出力2. 現在進行中のアークを検索し、あれば終了処理3. 新しいアークオブジェクトの作成4. arcs配列への追加5. 保存処理の実行6. 新しいアークを返却@state-changes- 既存の進行中アークのis_completeがtrueに設定される- arcs配列に新しいアークが追加される- ストレージが更新される

**@constructor:** function Object() { [native code] }

##### MidTermMemory.compressAndIntegrate (method)

短期記憶を圧縮・統合します複数のチャプターメモリを圧縮し、中期記憶に統合します。@async@param {ChapterMemory[]} chapterMemories - チャプターメモリ配列@returns {Promise<CompressedMemory>} 圧縮されたメモリ@throws {Error} チャプターメモリが空の場合@usageconst compressedMemory = await midTermMemory.compressAndIntegrate(chapterMemories);@call-flow1. チャプターメモリが空でないか確認2. チャプター範囲の決定3. 重要イベントの収集とソート4. 圧縮要約の生成5. キャラクターの変化を抽出6. 圧縮メモリの作成7. 現在のアークに統合8. 圧縮メモリを返却@helper-methods- generateCompressedSummary - 圧縮要約の生成- extractCharacterDevelopment - キャラクター発展の抽出- integrateToCurrentArc - 現在のアークに統合@error-handlingチャプターメモリが空の場合はエラーをスロー

**@constructor:** function Object() { [native code] }

##### MidTermMemory.integrateToCurrentArc (method)

圧縮メモリを現在のアークに統合します圧縮されたメモリを適切なアークに統合し、必要に応じて新しいアークを作成します。@private@async@param {CompressedMemory} compressedMemory - 圧縮されたメモリ@returns {Promise<void>} 統合完了時に解決するPromise@call-flow1. 対象となるアークを特定2. アークが存在する場合  a. 圧縮メモリをアークのmemoriesに追加  b. 重要イベントから転換点を抽出  c. アークの転換点を更新  d. 変更を保存3. アークが存在しない場合  a. テーマを導出して新しいアークを開始  b. 新しいアークに圧縮メモリを追加  c. 転換点を設定  d. 変更を保存@helper-methods- getCurrentArc - 現在のアークを取得- startNewArc - 新しいアークを開始- deriveTheme - アークテーマの導出- save - 変更の保存@state-changes- アークのmemories配列に圧縮メモリが追加される- アークのturningPointsが更新される- 必要に応じて新しいアークが作成される- ストレージが更新される

**@constructor:** function Object() { [native code] }

##### MidTermMemory.generateCompressedSummary (method)

圧縮要約を生成します複数のチャプター要約を統合し、より簡潔な要約を生成します。@private@async@param {ChapterMemory[]} chapterMemories - チャプターメモリ配列@returns {Promise<string>} 生成された圧縮要約@call-flow1. チャプターメモリをチャプター番号でソート2. 各チャプターの要約を結合3. 要約生成プロンプトの作成4. GeminiClientを使用した要約の生成5. 生成された要約の返却@external-dependencies- GeminiClient - AI要約生成@error-handling要約生成に失敗した場合、元の要約を結合して返す

**@constructor:** function Object() { [native code] }

##### MidTermMemory.extractCharacterDevelopment (method)

キャラクター発展を抽出しますチャプターメモリからキャラクターの変化情報を収集し、要約します。@private@async@param {ChapterMemory[]} chapterMemories - チャプターメモリ配列@returns {Promise<any[]>} キャラクターの変化情報の配列@call-flow1. 全チャプターからキャラクター情報を収集2. キャラクターごとに出現状態をマップで管理3. 複数チャプターに登場するキャラクターのみを処理4. キャラクターごとの変化を要約5. 変化情報の配列を返却@helper-methods- summarizeCharacterDevelopment - キャラクター変化の要約生成@error-handlingキャラクター変化の要約に失敗した場合、最新の状態を使用

**@constructor:** function Object() { [native code] }

##### MidTermMemory.summarizeCharacterDevelopment (method)

キャラクター変化を要約しますキャラクターの状態履歴から変化と成長を要約します。@private@async@param {string} name - キャラクター名@param {any[]} states - 状態履歴@returns {Promise<string>} 変化の要約@call-flow1. 状態履歴をチャプター番号でソート2. 要約生成プロンプトの作成3. GeminiClientを使用した要約の生成4. 生成された要約の返却@external-dependencies- GeminiClient - AI要約生成

**@constructor:** function Object() { [native code] }

##### MidTermMemory.deriveTheme (method)

アークテーマを導出します圧縮されたメモリからアークのテーマを導出します。@private@async@param {CompressedMemory} compressedMemory - 圧縮されたメモリ@returns {Promise<string>} 導出されたテーマ@call-flow1. 主要イベントの説明を抽出2. テーマ導出プロンプトの作成3. GeminiClientを使用したテーマの生成4. 生成されたテーマの返却@external-dependencies- GeminiClient - AIテーマ生成@error-handlingテーマ導出に失敗した場合、デフォルトテーマ「新たな挑戦」を返す

**@constructor:** function Object() { [native code] }

##### MidTermMemory.generateArcSummary (method)

アーク要約を生成します指定されたアークの要約情報を生成します。@async@param {number} arcNumber - アーク番号@returns {Promise<ArcSummary>} アーク要約@throws {Error} 指定されたアークが見つからない場合@usageconst summary = await midTermMemory.generateArcSummary(2);console.log(`アーク${summary.arcNumber}の要約: ${summary.summary}`);@call-flow1. 指定されたアークの取得と存在確認2. 圧縮メモリの要約を結合3. 転換点の説明を抽出4. 要約生成プロンプトの作成5. GeminiClientを使用した要約の生成6. レスポンスの解析とセクション分割7. ArcSummaryオブジェクトの作成と返却@external-dependencies- GeminiClient - AI要約生成@error-handlingアークが見つからない場合はエラーをスロー要約生成に失敗した場合は基本情報のみの要約を返す

**@constructor:** function Object() { [native code] }

##### MidTermMemory.completeArc (method)

アークを完了します指定されたアークを完了状態にし、必要に応じて要約を生成します。@async@param {number} arcNumber - アーク番号@returns {Promise<void>} 完了時に解決するPromise@throws {Error} 指定されたアークが見つからない場合@usageawait midTermMemory.completeArc(2);@call-flow1. 指定されたアークの取得と存在確認2. アークが既に完了している場合は早期リターン3. 最後のチャプター番号を特定4. アークの終了チャプター番号とis_completeを更新5. サマリーがなければ生成6. 変更を保存@helper-methods- getArcMemory - アークメモリを取得- generateArcSummary - アーク要約を生成- save - 変更の保存@state-changes- アークのis_completeがtrueに設定される- アークのchapter_range.endが更新される- アークのsummaryが設定される- ストレージが更新される@error-handlingアークが見つからない場合はエラーをスロー

**@constructor:** function Object() { [native code] }

##### MidTermMemory.getEntryCount (method)

エントリ数を取得します管理しているアークの数を返します。@async@returns {Promise<number>} アーク数@usageconst count = await midTermMemory.getEntryCount();console.log(`管理中のアーク数: ${count}`);@call-flowarcs配列の長さを返します。

**@constructor:** function Object() { [native code] }

##### MidTermMemory.getLastUpdateTime (method)

最終更新時間を取得します中期記憶の最終更新時間を返します。@async@returns {Promise<Date | null>} 最終更新時間、または未更新の場合はnull@usageconst lastUpdate = await midTermMemory.getLastUpdateTime();if (lastUpdate) {  console.log(`最終更新: ${lastUpdate.toISOString()}`);}@call-flowlastUpdateTimeプロパティをそのまま返します。

**@constructor:** function Object() { [native code] }

##### MidTermMemory.getCurrentArcInfo (method)

現在のアーク情報を取得します現在進行中または最新のアークの基本情報を返します。@async@returns {Promise<{ number: number; name: string } | null>} アーク番号とテーマ、または存在しない場合はnull@usageconst arcInfo = await midTermMemory.getCurrentArcInfo();if (arcInfo) {  console.log(`現在のアーク: ${arcInfo.number} - ${arcInfo.name}`);}@call-flow1. 未完了のアークを検索2. 見つかった場合はその番号とテーマを返す3. 見つからず、アークが存在する場合は最新のアーク情報を返す4. どちらも該当しない場合はnullを返す

**@constructor:** function Object() { [native code] }


---

### short-term-memory.ts {#cnovel-automation-systemsrclibmemoryshort-term-memoryts}

**Path:** `C:/novel-automation-system/src/lib/memory/short-term-memory.ts`

@fileoverview 短期記憶管理モジュール@description物語創作支援システムにおける短期記憶（直近のチャプターの詳細記憶）を管理するモジュールです。チャプターの要約、キーイベント、キャラクターの状態などの詳細な情報を保存・管理し、それらをYAML形式で永続化します。@role- 直近のチャプターの詳細記憶の管理- チャプターからの記憶情報（要約、キーイベント、キャラクター状態）の抽出と生成- 短期記憶の永続化（YAML形式）- チャプターの重要度評価（感情的影響度、プロット重要度）@dependencies- @/types/chapters - チャプター関連の型定義- @/types/memory - メモリ関連の型定義- @/lib/storage - ストレージアクセス機能- @/lib/utils/yaml-helper - YAML形式データの操作ユーティリティ- @/lib/utils/logger - ログ出力機能- @/lib/utils/error-handler - エラーハンドリング機能- @/lib/generation/gemini-client - AI生成機能クライアント@flow1. ストレージからの短期記憶データの読み込み2. チャプターデータからのメモリ情報抽出（要約、キーイベント、キャラクター状態）3. AI技術を活用した情報の生成と抽出4. 重要度評価（感情的影響度、プロット重要度）5. メモリの管理（追加、取得、削除）6. YAMLファイルへの永続化

**@constructor:** function Object() { [native code] }

#### ShortTermMemory (class)

@fileoverview 短期記憶管理モジュール@description物語創作支援システムにおける短期記憶（直近のチャプターの詳細記憶）を管理するモジュールです。チャプターの要約、キーイベント、キャラクターの状態などの詳細な情報を保存・管理し、それらをYAML形式で永続化します。@role- 直近のチャプターの詳細記憶の管理- チャプターからの記憶情報（要約、キーイベント、キャラクター状態）の抽出と生成- 短期記憶の永続化（YAML形式）- チャプターの重要度評価（感情的影響度、プロット重要度）@dependencies- @/types/chapters - チャプター関連の型定義- @/types/memory - メモリ関連の型定義- @/lib/storage - ストレージアクセス機能- @/lib/utils/yaml-helper - YAML形式データの操作ユーティリティ- @/lib/utils/logger - ログ出力機能- @/lib/utils/error-handler - エラーハンドリング機能- @/lib/generation/gemini-client - AI生成機能クライアント@flow1. ストレージからの短期記憶データの読み込み2. チャプターデータからのメモリ情報抽出（要約、キーイベント、キャラクター状態）3. AI技術を活用した情報の生成と抽出4. 重要度評価（感情的影響度、プロット重要度）5. メモリの管理（追加、取得、削除）6. YAMLファイルへの永続化/
import { Chapter } from '@/types/chapters';
import { ChapterMemory, KeyEvent, CharacterState } from '@/types/memory';
import { storageProvider } from '@/lib/storage';
import { parseYaml, stringifyYaml } from '@/lib/utils/yaml-helper';
import { logger } from '@/lib/utils/logger';
import { logError } from '@/lib/utils/error-handler';
import { GeminiClient } from '@/lib/generation/gemini-client';

/**@class ShortTermMemory@description短期記憶管理クラス。直近のチャプターの詳細記憶を管理します。チャプターからの情報抽出、AI生成による要約・分析、YAML形式での永続化機能を提供します。@role- YAML形式での短期記憶データの保存と読み込み- チャプターからの記憶情報生成（要約、キーイベント等）- 最大保持チャプター数の管理（制限あり）- 記憶へのアクセス機能提供（単一チャプター、チャプター範囲）- 感情的影響度とプロット重要度の評価@used-by- @/lib/memory/manager - メモリ管理システム@depends-on- storageProvider - 永続化ストレージへのアクセス- GeminiClient - AIを活用した要約と分析の生成@lifecycle1. コンストラクタでの基本的な依存関係の初期化2. initialize()メソッドによるストレージからのデータ読み込み3. addChapterMemory()によるチャプターメモリの追加と処理4. save()による永続化@example-flowMemoryManager → ShortTermMemory.initialize →   ストレージからの設定読み込み →  チャプター処理（addChapterMemory） →  チャプター要約生成（generateChapterSummary） →  キーイベント抽出（extractKeyEvents） →  保存（save）

**@constructor:** function Object() { [native code] }

#### Methods of ShortTermMemory

##### ShortTermMemory.constructor (method)

短期記憶クラスを初期化しますGeminiClientを設定し、基本的な初期化を行います。実際のデータ読み込みはinitialize()メソッドで行われます。@constructor@param {GeminiClient} [geminiClient] - AIテキスト生成クライアント（オプション）@usage// 基本的な初期化const shortTermMemory = new ShortTermMemory();await shortTermMemory.initialize();// カスタムGeminiClientを使用した初期化const customClient = new GeminiClient();const shortTermMemory = new ShortTermMemory(customClient);await shortTermMemory.initialize();@call-flow1. GeminiClientの設定（指定されていなければ新規作成）2. 初期化ログの出力

**@constructor:** function Object() { [native code] }

##### ShortTermMemory.initialize (method)

初期化処理を実行しますストレージから既存の短期記憶データを読み込み、クラスの状態を設定します。データが存在しない場合は新しい空の状態で初期化します。@async@returns {Promise<void>} 初期化完了時に解決するPromise@usageawait shortTermMemory.initialize();@call-flow1. ストレージパスの存在確認2. 存在する場合はYAMLデータを読み込み3. 有効なデータ形式かを検証4. 有効ならmemoriesとlastUpdateTimeを設定5. 無効または存在しない場合は空の配列で初期化6. 必要に応じてディレクトリを作成@error-handling初期化エラーが発生した場合はログに記録し、空の配列で初期化します。

**@constructor:** function Object() { [native code] }

##### ShortTermMemory.save (method)

現在の記憶をストレージに保存しますメモリデータをYAML形式に変換し、ストレージに保存します。@private@async@returns {Promise<void>} 保存完了時に解決するPromise@throws {Error} 保存に失敗した場合@call-flow1. 最終更新時間を現在時刻に更新2. メモリデータと最終更新時間を含むオブジェクトを作成3. オブジェクトをYAML文字列に変換4. ストレージにYAML文字列を書き込み5. 保存完了のログを出力@error-handling保存に失敗した場合はエラーをログに記録し、呼び出し元に例外をスロー

**@constructor:** function Object() { [native code] }

##### ShortTermMemory.addChapterMemory (method)

チャプターメモリを追加します指定されたチャプターから記憶情報を生成し、短期記憶に追加します。チャプター要約、キーイベント、キャラクター状態などを抽出・生成し、感情的影響度とプロット重要度を評価します。@async@param {Chapter} chapter チャプター@returns {Promise<ChapterMemory>} 生成されたチャプターメモリ@throws {Error} 処理に失敗した場合@usageconst chapterMemory = await shortTermMemory.addChapterMemory(chapter);console.log(`チャプター${chapterMemory.chapter}のメモリを追加しました`);@call-flow1. 既存メモリ内のチャプター確認と重複処理2. チャプター要約の生成（generateChapterSummary）3. キーイベントの抽出（extractKeyEvents）4. キャラクター状態の抽出（extractCharacterStates）5. 感情的影響度とプロット重要度の評価6. 新しいチャプターメモリの作成7. メモリ配列への追加8. チャプター番号でのソート9. 上限（MAX_CHAPTERS）を超えた場合の古いメモリ削除10. 永続化（save）@helper-methods- generateChapterSummary - チャプター要約生成- extractKeyEvents - キーイベント抽出- extractCharacterStates - キャラクター状態抽出- evaluateEmotionalImpact - 感情的影響度評価- evaluatePlotSignificance - プロット重要度評価- save - 永続化@error-handling処理中にエラーが発生した場合はログに記録し、呼び出し元に例外をスロー

**@constructor:** function Object() { [native code] }

##### ShortTermMemory.getChapterMemory (method)

チャプターメモリを取得します指定されたチャプター番号のメモリを取得します。@async@param {number} chapterNumber チャプター番号@returns {Promise<ChapterMemory | null>} チャプターメモリ、存在しない場合はnull@usageconst memory = await shortTermMemory.getChapterMemory(5);if (memory) {  console.log(`チャプター5の要約: ${memory.summary}`);}@call-flowメモリ配列から指定されたチャプター番号に一致するメモリを検索し、見つかった場合はそのメモリを、見つからない場合はnullを返します。

**@constructor:** function Object() { [native code] }

##### ShortTermMemory.getChapterMemories (method)

指定範囲のチャプターメモリを取得します開始チャプター番号から終了チャプター番号までの範囲に含まれるチャプターメモリを取得します。@async@param {number} startChapter 開始チャプター番号@param {number} endChapter 終了チャプター番号@returns {Promise<ChapterMemory[]>} チャプターメモリの配列@usage// チャプター1から10までのメモリを取得const memories = await shortTermMemory.getChapterMemories(1, 10);console.log(`取得したメモリ数: ${memories.length}`);@call-flowメモリ配列から指定された範囲内（startChapter以上endChapter以下）のチャプター番号を持つメモリをフィルタリングして返します。

**@constructor:** function Object() { [native code] }

##### ShortTermMemory.generateChapterSummary (method)

チャプター要約を生成しますチャプターの内容からAIを使用して要約を生成します。チャプターに既に要約がある場合はそれを使用します。@private@async@param {Chapter} chapter チャプター@returns {Promise<string>} 生成された要約@call-flow1. チャプターに既存の要約があるか確認2. 既存の要約がある場合はそれを返却3. なければプロンプトを作成4. GeminiClientを使用した要約生成5. 生成された要約を返却@external-dependencies- GeminiClient - AI要約生成@error-handling要約生成に失敗した場合はエラーをログに記録し、シンプルな要約を生成して返します。

**@constructor:** function Object() { [native code] }

##### ShortTermMemory.extractKeyEvents (method)

キーイベントを抽出しますチャプターの内容からAIを使用して重要なイベントを抽出します。@private@async@param {Chapter} chapter チャプター@returns {Promise<KeyEvent[]>} 抽出されたキーイベントの配列@call-flow1. プロンプトの作成2. GeminiClientを使用したJSON形式でのイベント抽出3. JSONパース処理4. 結果の検証と変換5. キーイベント配列の返却@external-dependencies- GeminiClient - AIによるイベント抽出@error-handling抽出に失敗した場合やJSONパースエラーの場合はログに記録し、空配列を返します。

**@constructor:** function Object() { [native code] }

##### ShortTermMemory.extractCharacterStates (method)

キーイベントを抽出しますチャプターの内容からAIを使用して重要なイベントを抽出します。@private@async@param {Chapter} chapter チャプター@returns {Promise<KeyEvent[]>} 抽出されたキーイベントの配列@call-flow1. プロンプトの作成2. GeminiClientを使用したJSON形式でのイベント抽出3. JSONパース処理4. 結果の検証と変換5. キーイベント配列の返却@external-dependencies- GeminiClient - AIによるイベント抽出@error-handling抽出に失敗した場合やJSONパースエラーの場合はログに記録し、空配列を返します。

**@constructor:** function Object() { [native code] }

##### ShortTermMemory.evaluateEmotionalImpact (method)

感情的影響度を評価しますチャプターの内容から感情的な影響度を評価します。感情的なキーワードの出現頻度に基づいてスコアを算出します。@private@param {Chapter} chapter チャプター@returns {number} 感情的影響度（1-10）@call-flow1. 感情的キーワードのリスト定義2. デフォルトスコアの設定3. チャプター内容での各キーワードの出現回数カウント4. 出現頻度に基づくスコア調整5. 最終スコアの返却@performance-considerations簡易的な実装であり、将来的にはより高度なアルゴリズムを実装予定。現状では単純なキーワードマッチングによる評価を行っています。

**@constructor:** function Object() { [native code] }

##### ShortTermMemory.evaluatePlotSignificance (method)

プロット重要度を評価しますキーイベントの重要度に基づいてプロット全体の重要度を評価します。@private@param {KeyEvent[]} keyEvents キーイベント配列@returns {number} プロット重要度（1-10）@call-flow1. キーイベントが空の場合はデフォルト値を返却2. 全イベントの重要度の合計を計算3. 平均値を算出して返却

**@constructor:** function Object() { [native code] }

##### ShortTermMemory.getEntryCount (method)

エントリ数を取得します短期記憶に保存されているチャプターメモリの数を返します。@async@returns {Promise<number>} メモリ内のチャプター数@usageconst count = await shortTermMemory.getEntryCount();console.log(`保存されているチャプター数: ${count}`);@call-flowmemories配列の長さを返します。

**@constructor:** function Object() { [native code] }

##### ShortTermMemory.getLastUpdateTime (method)

最終更新時間を取得します短期記憶の最終更新時刻を返します。@async@returns {Promise<Date | null>} 最終更新時間、未更新の場合はnull@usageconst lastUpdate = await shortTermMemory.getLastUpdateTime();if (lastUpdate) {  console.log(`最終更新: ${lastUpdate.toISOString()}`);}@call-flowlastUpdateTimeプロパティをそのまま返します。

**@constructor:** function Object() { [native code] }

##### ShortTermMemory.clearAllMemories (method)

メモリの全消去を行います短期記憶内のすべてのチャプターメモリを削除します。主にテスト用途で使用されます。@async@returns {Promise<void>} 処理完了時に解決するPromise@usage// テスト環境での使用例await shortTermMemory.clearAllMemories();@call-flow1. memories配列を空にリセット2. 変更の永続化（save）3. ログ出力

**@constructor:** function Object() { [native code] }


---

### types.ts {#cnovel-automation-systemsrclibmemorytypests}

**Path:** `C:/novel-automation-system/src/lib/memory/types.ts`

@fileoverview 階層的記憶管理システムの型定義とインターフェース@description物語創作支援システムのための階層的記憶管理システムで使用される型定義とインターフェースを提供するモジュールです。メモリマネージャーの実装のための共通インターフェース、システム状態の型定義、検索オプションの型定義などを含みます。@role- 階層的記憶管理システムの型定義の一元管理- メモリマネージャーの実装のための共通インターフェース提供- 階層間（短期・中期・長期記憶）の統一的なアクセス方法の定義@dependencies- ./long-term-memory - 長期記憶管理クラス- ./short-term-memory - 短期記憶管理クラス- ./mid-term-memory - 中期記憶管理クラス- @/types/memory - メモリ関連の型定義- @/types/chapters - チャプター関連の型定義@flow1. メモリマネージャーがIMemoryManagerインターフェースを実装2. 短期・中期・長期の階層的記憶管理の統一的なアクセス提供3. 記憶の検索、処理、同期などの操作を定義4. システム状態の監視と提供

**@constructor:** function Object() { [native code] }

#### MemorySystemStatus (interface)

@fileoverview 階層的記憶管理システムの型定義とインターフェース@description物語創作支援システムのための階層的記憶管理システムで使用される型定義とインターフェースを提供するモジュールです。メモリマネージャーの実装のための共通インターフェース、システム状態の型定義、検索オプションの型定義などを含みます。@role- 階層的記憶管理システムの型定義の一元管理- メモリマネージャーの実装のための共通インターフェース提供- 階層間（短期・中期・長期記憶）の統一的なアクセス方法の定義@dependencies- ./long-term-memory - 長期記憶管理クラス- ./short-term-memory - 短期記憶管理クラス- ./mid-term-memory - 中期記憶管理クラス- @/types/memory - メモリ関連の型定義- @/types/chapters - チャプター関連の型定義@flow1. メモリマネージャーがIMemoryManagerインターフェースを実装2. 短期・中期・長期の階層的記憶管理の統一的なアクセス提供3. 記憶の検索、処理、同期などの操作を定義4. システム状態の監視と提供/

import { LongTermMemory } from './long-term-memory';
import { ShortTermMemory } from './short-term-memory';
import { MidTermMemory } from './mid-term-memory';
import { ChapterMemory, KeyEvent, ArcMemory, Memory, SearchResult, MemoryType, SyncMemoryRequest, SyncMemoryResponse } from '@/types/memory';
import { Chapter } from '@/types/chapters';

/**@interface MemorySystemStatus@description 階層的記憶システム全体の現在の状態を表す型定義@property {boolean} initialized - システム全体の初期化状態@property {Object} shortTerm - 短期記憶の状態情報@property {number} shortTerm.entryCount - 短期記憶のエントリ数@property {string|null} shortTerm.lastUpdateTime - 短期記憶の最終更新時間（ISO文字列形式、または未更新の場合はnull）@property {Object} midTerm - 中期記憶の状態情報@property {number} midTerm.entryCount - 中期記憶のエントリ数（アーク数）@property {string|null} midTerm.lastUpdateTime - 中期記憶の最終更新時間（ISO文字列形式、または未更新の場合はnull）@property {Object|null} midTerm.currentArc - 現在のアーク情報（存在しない場合はnull）@property {number} midTerm.currentArc.number - 現在のアーク番号@property {string} midTerm.currentArc.name - 現在のアークの名前またはテーマ@property {Object} longTerm - 長期記憶の状態情報@property {boolean} longTerm.initialized - 長期記憶の初期化状態@property {string|null} longTerm.lastCompressionTime - 長期記憶の最終圧縮時間（ISO文字列形式、または未圧縮の場合はnull）@used-by- メモリマネージャーの状態取得メソッド（getStatus）- 記憶システム状態表示UI

**@constructor:** function Object() { [native code] }

#### SearchOptions (interface)

@interface SearchOptions@description 記憶検索時のオプション設定を表す型定義@property {number} [limit] - 結果の最大件数（デフォルト値はメモリマネージャー実装に依存）@property {number} [minRelevance] - 最小関連度スコア（0.0～1.0の範囲、デフォルト値はメモリマネージャー実装に依存）@property {MemoryType[]} [memoryTypes] - 検索対象のメモリタイプ（'SHORT_TERM'、'MID_TERM'、'LONG_TERM'）@property {boolean} [includeMeta] - メタデータを含めるかどうか（デフォルト値はメモリマネージャー実装に依存）@used-by- メモリマネージャーの検索メソッド（searchMemories）- 記憶検索UI

**@constructor:** function Object() { [native code] }

#### IMemoryManager (interface)

@interface IMemoryManager@description 階層的記憶管理システムのマネージャーインターフェース短期記憶、中期記憶、長期記憶の3階層で構成される記憶システムを統合的に管理するためのインターフェース定義です。@role- 階層的記憶システムの初期化と管理- チャプターからの記憶生成と保存- アーク境界の検出とアーク管理- 記憶の圧縮と階層間統合の制御- 自然言語による記憶検索の提供- 重要イベントと伏線の追跡管理- システム状態の監視と提供@used-by- 物語創作支援システムのコアモジュール- チャプター管理システム- 物語生成支援機能@implementation-referenceこのインターフェースの実装例は `MemoryManager` クラスで確認できます。

**@constructor:** function Object() { [native code] }


---

### alert-manager.ts {#cnovel-automation-systemsrclibmonitoringalert-managerts}

**Path:** `C:/novel-automation-system/src/lib/monitoring/alert-manager.ts`

アラートの重要度

**@constructor:** function Object() { [native code] }

#### AlertManager (class)

アラート管理システムシステムの異常を検知し、通知を管理するクラス

**@constructor:** function Object() { [native code] }

#### Methods of AlertManager

##### AlertManager.setupDefaultRules (method)

デフォルトのアラートルールを設定

**@constructor:** function Object() { [native code] }

##### AlertManager.setupDefaultDestinations (method)

デフォルトの通知先を設定

**@constructor:** function Object() { [native code] }

##### AlertManager.addRule (method)

アラートルールを追加@param rule アラートルール

**@constructor:** function Object() { [native code] }

##### AlertManager.addDestination (method)

アラート通知先を追加@param destination 通知先設定

**@constructor:** function Object() { [native code] }

##### AlertManager.start (method)

アラートチェックを開始@param interval チェック間隔（ミリ秒）

**@constructor:** function Object() { [native code] }

##### AlertManager.stop (method)

アラートチェックを停止

**@constructor:** function Object() { [native code] }

##### AlertManager.checkAlerts (method)

すべてのアラートルールをチェック

**@constructor:** function Object() { [native code] }

##### AlertManager.sendAlert (method)

アラートを送信@param rule 発生したアラートルール

**@constructor:** function Object() { [native code] }

##### AlertManager.sendToSlack (method)

Slackにアラートを送信

**@constructor:** function Object() { [native code] }

##### AlertManager.sendToEmail (method)

メールでアラートを送信

**@constructor:** function Object() { [native code] }

##### AlertManager.sendToWebhook (method)

Webhookにアラートを送信

**@constructor:** function Object() { [native code] }

##### AlertManager.calculateErrorRate (method)

エラー率の計算

**@constructor:** function Object() { [native code] }

##### AlertManager.getAverageGenerationTime (method)

平均生成時間の取得

**@constructor:** function Object() { [native code] }

##### AlertManager.getAlertHistory (method)

アラート履歴を取得

**@constructor:** function Object() { [native code] }

##### AlertManager.getRules (method)

アラートルールのリストを取得

**@constructor:** function Object() { [native code] }

#### AlertSeverity (type)

アラートの重要度

**@constructor:** function Object() { [native code] }

#### AlertRule (interface)

アラートルール定義

**@constructor:** function Object() { [native code] }

#### AlertDestination (interface)

アラート通知先設定

**@constructor:** function Object() { [native code] }


---

### log-aggregator.ts {#cnovel-automation-systemsrclibmonitoringlog-aggregatorts}

**Path:** `C:/novel-automation-system/src/lib/monitoring/log-aggregator.ts`

//  * 構造化ロギングシステムを作成
//  * 開発環境とプロダクション環境向けに最適化
//  * @returns 設定済みのロガーインスタンス
//

**@constructor:** function Object() { [native code] }


---

### metrics-collector.ts {#cnovel-automation-systemsrclibmonitoringmetrics-collectorts}

**Path:** `C:/novel-automation-system/src/lib/monitoring/metrics-collector.ts`

システム全体のメトリクス収集を管理するクラスPrometheusフォーマットでメトリクスを収集・提供

**@constructor:** function Object() { [native code] }

#### MetricsCollector (class)

システム全体のメトリクス収集を管理するクラスPrometheusフォーマットでメトリクスを収集・提供

**@constructor:** function Object() { [native code] }

#### Methods of MetricsCollector

##### MetricsCollector.getInstance (method)

シングルトンインスタンスの取得

**@constructor:** function Object() { [native code] }

##### MetricsCollector.recordGenerationTime (method)

生成時間の記録@param duration 生成時間（秒）@param status 生成ステータス

**@constructor:** function Object() { [native code] }

##### MetricsCollector.recordGenerationSuccess (method)

生成成功の記録

**@constructor:** function Object() { [native code] }

##### MetricsCollector.recordGenerationFailure (method)

生成失敗の記録@param reason 失敗理由

**@constructor:** function Object() { [native code] }

##### MetricsCollector.incrementActiveGenerations (method)

アクティブ生成数の増加

**@constructor:** function Object() { [native code] }

##### MetricsCollector.decrementActiveGenerations (method)

アクティブ生成数の減少

**@constructor:** function Object() { [native code] }

##### MetricsCollector.recordStorageOperationTime (method)

ストレージ操作時間の記録@param operation 操作タイプ（read, write, list, delete）@param source ソース（cache, storage, error, total）@param duration 操作時間（ミリ秒）

**@constructor:** function Object() { [native code] }

##### MetricsCollector.incrementCacheHits (method)

キャッシュヒットの記録@param cache キャッシュタイプ

**@constructor:** function Object() { [native code] }

##### MetricsCollector.incrementCacheMisses (method)

キャッシュミスの記録@param cache キャッシュタイプ

**@constructor:** function Object() { [native code] }

##### MetricsCollector.recordApiRequest (method)

APIリクエストの記録@param method HTTPメソッド@param endpoint エンドポイント@param status HTTPステータスコード@param duration リクエスト時間（秒）

**@constructor:** function Object() { [native code] }

##### MetricsCollector.startPeriodicCollection (method)

定期的なメトリクス収集を開始

**@constructor:** function Object() { [native code] }

##### MetricsCollector.getMetrics (method)

メトリクスをPrometheusフォーマットで取得

**@constructor:** function Object() { [native code] }

##### MetricsCollector.getMetricValue (method)

特定のメトリクスの現在値を取得@param name メトリクス名

**@constructor:** function Object() { [native code] }

##### MetricsCollector.resetMetrics (method)

メトリクスレジストリをリセット

**@constructor:** function Object() { [native code] }


---

### index copy.ts {#cnovel-automation-systemsrclibstorageindex-copyts}

**Path:** `C:/novel-automation-system/src/lib/storage/#/index copy.ts`

環境に応じたストレージプロバイダーを作成@returns 設定済みのストレージプロバイダー

**@constructor:** function Object() { [native code] }

#### createStorageProvider (function)

環境に応じたストレージプロバイダーを作成@returns 設定済みのストレージプロバイダー

**@constructor:** function Object() { [native code] }


---

### enhanced-storage.ts {#cnovel-automation-systemsrclibstorageenhanced-storagets}

**Path:** `C:/novel-automation-system/src/lib/storage/enhanced-storage.ts`

@fileoverview ストレージ抽象化レイヤーの型定義（拡張版）@descriptionこのファイルは、ストレージ操作を抽象化するためのインターフェースと各ストレージプロバイダーの設定オプションの型定義を提供します。これらの型定義により、異なるストレージバックエンド間で一貫したAPIを提供することが可能になります。@role- ストレージ操作の統一インターフェースを定義- 各ストレージプロバイダーの設定オプションの型を定義- 型安全なストレージアクセスを提供@dependenciesなし（純粋な型定義ファイル）@used-by- ./index.ts - 型のエクスポートとストレージプロバイダーの作成- ./github-storage.ts - GitHubストレージプロバイダーの実装- ./local-storage.ts - ローカルストレージプロバイダーの実装- ./optimized-storage.ts - キャッシュを使用した最適化されたストレージプロバイダー- アプリケーション全体 - ストレージ操作のインターフェースとして

**@constructor:** function Object() { [native code] }

#### FileMetadata (interface)

@fileoverview ストレージ抽象化レイヤーの型定義（拡張版）@descriptionこのファイルは、ストレージ操作を抽象化するためのインターフェースと各ストレージプロバイダーの設定オプションの型定義を提供します。これらの型定義により、異なるストレージバックエンド間で一貫したAPIを提供することが可能になります。@role- ストレージ操作の統一インターフェースを定義- 各ストレージプロバイダーの設定オプションの型を定義- 型安全なストレージアクセスを提供@dependenciesなし（純粋な型定義ファイル）@used-by- ./index.ts - 型のエクスポートとストレージプロバイダーの作成- ./github-storage.ts - GitHubストレージプロバイダーの実装- ./local-storage.ts - ローカルストレージプロバイダーの実装- ./optimized-storage.ts - キャッシュを使用した最適化されたストレージプロバイダー- アプリケーション全体 - ストレージ操作のインターフェースとして/

/**ファイルのメタデータファイルに関する詳細情報を提供するインターフェースです。サイズ、作成日時、更新日時などのファイル属性を含みます。@role- ファイルに関する詳細情報を標準化された形式で提供- ファイル操作の前後でファイルの状態を確認するために使用@usage// ファイルメタデータの取得例const metadata = await storage.getFileMetadata('path/to/file.txt');console.log(`サイズ: ${metadata.size}バイト`);console.log(`更新日時: ${metadata.modifiedAt.toISOString()}`);

**@constructor:** function Object() { [native code] }

#### StorageProvider (interface)

ファイルパスストレージプロバイダーのベースディレクトリからの相対パスです。@type {string}/
path: string;

/**ファイルサイズ（バイト）ファイルのバイト単位のサイズです。@type {number}/
size: number;

/**作成日時ファイルが作成された日時です。@type {Date}/
createdAt: Date;

/**最終更新日時ファイルが最後に更新された日時です。@type {Date}/
modifiedAt: Date;

/**ディレクトリかどうかtrueの場合はディレクトリ、falseの場合はファイルを示します。@type {boolean}/
isDirectory: boolean;
}

/**ストレージプロバイダーのインターフェース異なるストレージバックエンド（GitHub、ローカルファイルシステムなど）間で一貫したファイル操作APIを提供するための共通インターフェースです。すべてのストレージプロバイダー実装はこのインターフェースに準拠する必要があります。@role- ファイルシステム操作の抽象化レイヤーを提供- 異なるストレージバックエンド間で一貫したAPIを確保- アプリケーションコードからストレージの実装詳細を隠蔽@implemented-by- GitHubStorageProvider - GitHubリポジトリをバックエンドとして使用- LocalStorageProvider - ローカルファイルシステムをバックエンドとして使用- OptimizedStorage - 基本ストレージプロバイダーにキャッシュ層を追加@usage// ストレージプロバイダーの使用例const storage: StorageProvider = new SomeStorageProvider(options);// ファイル読み込みconst content = await storage.readFile('path/to/file.txt');// ファイル書き込みawait storage.writeFile('path/to/file.txt', 'ファイル内容');

**@constructor:** function Object() { [native code] }

#### GitHubStorageOptions (interface)

ファイルを読み込みます指定されたパスのファイルを読み込み、その内容を文字列として返します。ファイルが存在しない場合は例外をスローします。@param {string} path - ファイルパス@returns {Promise<string>} ファイル内容の文字列@throws {Error} ファイルが存在しない場合@throws {Error} ファイル読み込み中にエラーが発生した場合@usagetry {  const content = await storage.readFile('path/to/file.txt');  console.log(content);} catch (error) {  console.error('ファイル読み込みエラー:', error.message);}/
readFile(path: string): Promise<string>;

/**ファイルを書き込みます指定されたパスにファイルを書き込みます。ファイルが存在しない場合は新規作成し、存在する場合は上書きします。必要に応じて親ディレクトリも作成します。@param {string} path - ファイルパス@param {string} content - 書き込む内容@returns {Promise<void>} 処理完了後に解決するPromise@throws {Error} ファイル書き込み中にエラーが発生した場合@usagetry {  await storage.writeFile('path/to/file.txt', 'ファイル内容');  console.log('ファイルが正常に書き込まれました');} catch (error) {  console.error('ファイル書き込みエラー:', error.message);}/
writeFile(path: string, content: string): Promise<void>;

/**ディレクトリ内のファイル一覧を取得します指定されたディレクトリ内のファイルパスのリストを返します。サブディレクトリは含まれません。ディレクトリが存在しない場合は空の配列を返します。@param {string} directory - ディレクトリパス@returns {Promise<string[]>} ファイルパスのリスト@throws {Error} ディレクトリ読み込み中にエラーが発生した場合@usagetry {  const files = await storage.listFiles('docs');  files.forEach(file => console.log(file));} catch (error) {  console.error('ファイル一覧取得エラー:', error.message);}/
listFiles(directory: string): Promise<string[]>;

/**ファイルが存在するか確認します指定されたパスにファイルが存在するかどうかを確認します。ディレクトリの場合はfalseを返します。@param {string} path - ファイルパス@returns {Promise<boolean>} ファイルが存在する場合はtrue、それ以外はfalse@throws {Error} 確認中にエラーが発生した場合@usagetry {  const exists = await storage.fileExists('path/to/file.txt');  console.log('ファイルは存在' + (exists ? 'します' : 'しません'));} catch (error) {  console.error('ファイル存在確認エラー:', error.message);}/
fileExists(path: string): Promise<boolean>;

/**ディレクトリが存在するか確認します指定されたパスにディレクトリが存在するかどうかを確認します。ファイルの場合はfalseを返します。@param {string} path - ディレクトリパス@returns {Promise<boolean>} ディレクトリが存在する場合はtrue、それ以外はfalse@throws {Error} 確認中にエラーが発生した場合@usagetry {  const exists = await storage.directoryExists('path/to/dir');  console.log('ディレクトリは存在' + (exists ? 'します' : 'しません'));} catch (error) {  console.error('ディレクトリ存在確認エラー:', error.message);}/
directoryExists(path: string): Promise<boolean>;

/**ディレクトリを作成します指定されたパスにディレクトリを作成します。親ディレクトリが存在しない場合は再帰的に作成します。@param {string} path - ディレクトリパス@returns {Promise<void>} 処理完了後に解決するPromise@throws {Error} ディレクトリ作成中にエラーが発生した場合@usagetry {  await storage.createDirectory('path/to/new/dir');  console.log('ディレクトリが正常に作成されました');} catch (error) {  console.error('ディレクトリ作成エラー:', error.message);}/
createDirectory(path: string): Promise<void>;

/**ファイルを削除します指定されたパスのファイルを削除します。ファイルが存在しない場合は何もせず正常終了します。@param {string} path - ファイルパス@returns {Promise<void>} 処理完了後に解決するPromise@throws {Error} ファイル削除中にエラーが発生した場合@usagetry {  await storage.deleteFile('path/to/file.txt');  console.log('ファイルが正常に削除されました');} catch (error) {  console.error('ファイル削除エラー:', error.message);}/
deleteFile(path: string): Promise<void>;

/**ファイルのメタデータを取得します指定されたパスのファイルに関するメタデータ情報を取得します。サイズ、作成日時、更新日時などの情報が含まれます。ファイルが存在しない場合はnullを返します。@param {string} path - ファイルパス@returns {Promise<FileMetadata | null>} ファイルメタデータまたはnull@throws {Error} メタデータ取得中にエラーが発生した場合@usagetry {  const metadata = await storage.getFileMetadata('path/to/file.txt');  if (metadata) {    console.log(`サイズ: ${metadata.size}バイト`);    console.log(`更新日時: ${metadata.modifiedAt.toISOString()}`);  } else {    console.log('ファイルが見つかりません');  }} catch (error) {  console.error('メタデータ取得エラー:', error.message);}/
getFileMetadata?(path: string): Promise<FileMetadata | null>;

/**ファイルを移動またはリネームします指定されたパスのファイルを別のパスに移動します。ファイルのリネームにも使用できます。移動先に既存のファイルがある場合は上書きします。必要に応じて移動先の親ディレクトリを作成します。@param {string} sourcePath - 元のファイルパス@param {string} targetPath - 移動先のパス@returns {Promise<void>} 処理完了後に解決するPromise@throws {Error} ファイル移動中にエラーが発生した場合@usagetry {  await storage.moveFile('path/to/old.txt', 'path/to/new.txt');  console.log('ファイルが正常に移動されました');} catch (error) {  console.error('ファイル移動エラー:', error.message);}/
moveFile?(sourcePath: string, targetPath: string): Promise<void>;

/**ファイルをコピーします指定されたパスのファイルを別のパスにコピーします。コピー先に既存のファイルがある場合は上書きします。必要に応じてコピー先の親ディレクトリを作成します。@param {string} sourcePath - 元のファイルパス@param {string} targetPath - コピー先のパス@returns {Promise<void>} 処理完了後に解決するPromise@throws {Error} ファイルコピー中にエラーが発生した場合@usagetry {  await storage.copyFile('path/to/original.txt', 'path/to/copy.txt');  console.log('ファイルが正常にコピーされました');} catch (error) {  console.error('ファイルコピーエラー:', error.message);}/
copyFile?(sourcePath: string, targetPath: string): Promise<void>;

/**ディレクトリ内のサブディレクトリ一覧を取得します指定されたディレクトリ内のサブディレクトリパスのリストを返します。ファイルは含まれません。ディレクトリが存在しない場合は空の配列を返します。@param {string} directory - ディレクトリパス@returns {Promise<string[]>} サブディレクトリパスのリスト@throws {Error} ディレクトリ読み込み中にエラーが発生した場合@usagetry {  const directories = await storage.listDirectories('content');  directories.forEach(dir => console.log(dir));} catch (error) {  console.error('ディレクトリ一覧取得エラー:', error.message);}/
listDirectories?(directory: string): Promise<string[]>;
}

/**GitHubストレージプロバイダーの設定オプションGitHubリポジトリをバックエンドとして使用するストレージプロバイダーの設定オプションを定義します。@role- GitHubStorageProviderクラスの初期化に必要なパラメータを定義- GitHub APIアクセスに必要な認証情報とリポジトリ設定を提供@usageconst options: GitHubStorageOptions = {  token: 'github_personal_access_token',  repo: 'username/repository',  branch: 'main',  baseDir: 'content'};const storage = new GitHubStorageProvider(options);

**@constructor:** function Object() { [native code] }

#### LocalStorageOptions (interface)

GitHubパーソナルアクセストークンGitHub APIにアクセスするための認証トークンです。リポジトリの読み書き権限が必要です。@type {string}@required/
token: string;

/**GitHubリポジトリ名'username/repo'形式のリポジトリ名です。例: 'octocat/Hello-World'@type {string}@required@format 'username/repo'/
repo: string;

/**GitHubブランチ名操作対象のブランチ名です。省略した場合は'main'が使用されます。@type {string}@optional@default 'main'/
branch: string;

/**ベースディレクトリパスリポジトリ内の操作対象となるベースディレクトリです。指定した場合、すべてのファイルパスはこのディレクトリからの相対パスとして解釈されます。省略した場合はリポジトリのルートが使用されます。@type {string}@optional/
baseDir?: string;
}

/**ローカルストレージプロバイダーの設定オプションローカルファイルシステムをバックエンドとして使用するストレージプロバイダーの設定オプションを定義します。@role- LocalStorageProviderクラスの初期化に必要なパラメータを定義- ファイルシステム操作の基準となるディレクトリ設定を提供@usageconst options: LocalStorageOptions = {  baseDir: './data',  createBaseDir: true,  backupEnabled: true,  logLevel: 'info'};const storage = new LocalStorageProvider(options);

**@constructor:** function Object() { [native code] }


---

### github-storage.ts {#cnovel-automation-systemsrclibstoragegithub-storagets}

**Path:** `C:/novel-automation-system/src/lib/storage/github-storage.ts`

@fileoverview GitHub APIを使用したストレージプロバイダー実装@descriptionこのファイルはGitHubリポジトリをバックエンドとしたストレージプロバイダーを実装しています。OctokitライブラリをラップしてStorageProviderインターフェースに準拠した形でファイル操作を提供し、ファイルの読み書き、リスト取得、存在確認、ディレクトリ作成、ファイル削除などの基本的なストレージ操作をGitHubリポジトリに対して行うことができます。@role- ストレージ抽象化レイヤーの一部として、GitHubリポジトリをストレージとして使用するための実装を提供- StorageProviderインターフェースに準拠し、ストレージ操作の統一されたAPIを提供- GitHub APIとの通信を抽象化し、エラーハンドリングとロギングを提供@dependencies- @octokit/rest - GitHub APIとの通信を行うライブラリ- ./types - StorageProviderインターフェースとGitHubStorageOptionsの型定義- ../utils/logger - ログ出力機能- @/lib/utils/error-handler - エラーハンドリング機能@types- StorageProvider (./types) - 実装するインターフェース- GitHubStorageOptions (./types) - 設定オプションの型@api-endpointsこのファイルからGitHub APIの以下のエンドポイントが利用されます:- GET /repos/{owner}/{repo}/contents/{path} - ファイル内容の取得、ディレクトリ一覧の取得、ファイル存在確認- PUT /repos/{owner}/{repo}/contents/{path} - ファイル作成・更新- DELETE /repos/{owner}/{repo}/contents/{path} - ファイル削除@flow1. GitHubStorageProviderのインスタンス化とオプション検証2. GitHub APIとの通信（Octokitを使用）3. エラーハンドリングとロギング4. 結果の返却または例外のスロー

**@constructor:** function Object() { [native code] }

#### GitHubStorageProvider (class)

@fileoverview GitHub APIを使用したストレージプロバイダー実装@descriptionこのファイルはGitHubリポジトリをバックエンドとしたストレージプロバイダーを実装しています。OctokitライブラリをラップしてStorageProviderインターフェースに準拠した形でファイル操作を提供し、ファイルの読み書き、リスト取得、存在確認、ディレクトリ作成、ファイル削除などの基本的なストレージ操作をGitHubリポジトリに対して行うことができます。@role- ストレージ抽象化レイヤーの一部として、GitHubリポジトリをストレージとして使用するための実装を提供- StorageProviderインターフェースに準拠し、ストレージ操作の統一されたAPIを提供- GitHub APIとの通信を抽象化し、エラーハンドリングとロギングを提供@dependencies- @octokit/rest - GitHub APIとの通信を行うライブラリ- ./types - StorageProviderインターフェースとGitHubStorageOptionsの型定義- ../utils/logger - ログ出力機能- @/lib/utils/error-handler - エラーハンドリング機能@types- StorageProvider (./types) - 実装するインターフェース- GitHubStorageOptions (./types) - 設定オプションの型@api-endpointsこのファイルからGitHub APIの以下のエンドポイントが利用されます:- GET /repos/{owner}/{repo}/contents/{path} - ファイル内容の取得、ディレクトリ一覧の取得、ファイル存在確認- PUT /repos/{owner}/{repo}/contents/{path} - ファイル作成・更新- DELETE /repos/{owner}/{repo}/contents/{path} - ファイル削除@flow1. GitHubStorageProviderのインスタンス化とオプション検証2. GitHub APIとの通信（Octokitを使用）3. エラーハンドリングとロギング4. 結果の返却または例外のスロー/

import { Octokit } from '@octokit/rest';
import { StorageProvider, GitHubStorageOptions } from './types';
import { logger } from '../utils/logger';
import { logError } from '@/lib/utils/error-handler';


/**@class GitHubStorageProvider@description GitHub APIを使用したストレージプロバイダー実装クラス@role- GitHubリポジトリをバックエンドとしたストレージプロバイダーを提供- StorageProviderインターフェースの実装- GitHub APIとの通信処理、エラーハンドリング、ロギングを担当@used-by- コードからは使用元を特定できません@depends-on- Octokit (@octokit/rest) - GitHub APIクライアント- logger (../utils/logger) - ロギング機能- logError (@/lib/utils/error-handler) - エラーハンドリング機能@lifecycle1. コンストラクタでの初期化（トークン、リポジトリ、ブランチなどの設定）2. StorageProviderインターフェースのメソッド呼び出し3. 内部的にGitHub APIとの通信処理4. 結果の返却またはエラーハンドリング@example-flow呼び出し元 → GitHubStorageProvider.readFile →   getFullPath →   octokit.repos.getContent →  Base64デコード →  内容の返却またはエラーハンドリング

**@constructor:** function Object() { [native code] }

#### Methods of GitHubStorageProvider

##### GitHubStorageProvider.constructor (method)

GitHubストレージプロバイダーを初期化します必要なパラメータの検証を行い、Octokitクライアントを初期化します。リポジトリ名は「username/repo」形式である必要があります。@constructor@param {GitHubStorageOptions} options - 設定オプション@param {string} options.token - GitHub APIトークン@param {string} options.repo - リポジトリ名（username/repo形式）@param {string} [options.branch='main'] - ブランチ名（デフォルトは'main'）@param {string} [options.baseDir=''] - ベースディレクトリパス（デフォルトは空文字）@throws {Error} GitHub tokenが指定されていない場合@throws {Error} リポジトリ名が無効な形式の場合@usage// 初期化方法const githubStorage = new GitHubStorageProvider({  token: 'github_personal_access_token',  repo: 'username/repository',  branch: 'main',  baseDir: 'storage'});@call-flow1. 引数の検証（トークンとリポジトリ名の形式）2. Octokitクライアントの初期化3. リポジトリ名の分解（owner/repo）4. 内部プロパティの設定5. 初期化完了のログ出力@initialization- Octokitクライアントを初期化し、認証情報を設定- リポジトリ名をowner/repo形式に分解- ブランチ名とベースディレクトリを設定（デフォルト値の適用）@error-handling- トークンが指定されていない場合、エラーをスロー- リポジトリ名が無効な形式の場合、エラーをスロー

**@constructor:** function Object() { [native code] }

##### GitHubStorageProvider.getFullPath (method)

ファイルパスを完全なパスに変換しますベースディレクトリが設定されている場合、相対パスとベースディレクトリを結合してGitHubリポジトリ内の完全なパスを生成します。@private@param {string} path - 相対パス@returns {string} リポジトリ内の完全なパス@usage// 内部的な使用方法const fullPath = this.getFullPath('path/to/file.txt');@call-flow1. ベースディレクトリの有無を確認2. ベースディレクトリがある場合は結合、ない場合はそのまま返却@called-by- readFile - 読み込むファイルの完全パスを取得- writeFile - 書き込むファイルの完全パスを取得- listFiles - 一覧を取得するディレクトリの完全パスを取得- fileExists - 存在確認するファイルの完全パスを取得- directoryExists - 存在確認するディレクトリの完全パスを取得- createDirectory - 作成するディレクトリの完全パスを取得- deleteFile - 削除するファイルの完全パスを取得

**@constructor:** function Object() { [native code] }

##### GitHubStorageProvider.readFile (method)

GitHubリポジトリからファイルを読み込みます指定されたパスのファイルをGitHub APIを通じて取得し、Base64デコードしてUTF-8文字列として返します。@async@param {string} path - ファイルパス@returns {Promise<string>} ファイル内容のPromise@throws {Error} ファイルが見つからない場合（404エラー）@throws {Error} パスがディレクトリの場合@throws {Error} コンテンツを取得できない場合@throws {Error} GitHub API通信エラーの場合@usage// 使用方法try {  const content = await githubStorage.readFile('path/to/file.txt');  console.log(content);} catch (error) {  console.error('ファイル読み込みエラー:', error.message);}@call-context- 同期/非同期: 非同期メソッド（await必須）- 推奨呼び出し環境: サーバーサイド- 前提条件: GitHubStorageProviderが正しく初期化済みであること@call-flow1. getFullPathを使用して完全パスを生成2. ファイル読み込み開始のデバッグログ出力3. GitHub APIを使用してファイル内容を取得4. 応答データの検証（ディレクトリではなくファイルであること）5. 応答データのcontentプロパティの存在確認6. Base64からUTF-8へのデコード7. デコードされた内容の返却@external-dependencies- GitHub API - /repos/{owner}/{repo}/contents/{path} エンドポイント@helper-methods- getFullPath - 相対パスを完全パスに変換@error-handling- 404エラーの場合は「ファイルが見つからない」エラーを生成- 応答がディレクトリの場合は適切なエラーを生成- contentプロパティがない場合はエラーを生成- その他のエラーはlogError関数でログ記録し、そのままスロー@performance-considerations- GitHub APIの呼び出し回数に制限がある可能性あり- 大きなファイルの場合はメモリ使用量に注意@monitoring- ログレベル: DEBUG（開始時）、WARN/ERROR（エラー時）

**@constructor:** function Object() { [native code] }

##### GitHubStorageProvider.writeFile (method)

GitHubリポジトリにファイルを書き込みます指定されたパスにファイルを作成または更新します。既存ファイルの場合はSHAを取得して更新、存在しない場合は新規作成します。@async@param {string} path - ファイルパス@param {string} content - 書き込む内容@returns {Promise<void>} 処理完了後に解決するPromise@throws {Error} GitHub API通信エラーの場合@usage// 使用方法try {  await githubStorage.writeFile('path/to/file.txt', 'ファイル内容');  console.log('ファイルが正常に書き込まれました');} catch (error) {  console.error('ファイル書き込みエラー:', error.message);}@call-context- 同期/非同期: 非同期メソッド（await必須）- 推奨呼び出し環境: サーバーサイド- 前提条件: GitHubStorageProviderが正しく初期化済みであること@call-flow1. getFullPathを使用して完全パスを生成2. ファイル書き込み開始のデバッグログ出力3. 既存ファイルのSHA取得を試行4. ファイルを作成または更新（SHAがある場合は更新、ない場合は作成）5. ファイル書き込み成功のログ出力@external-dependencies- GitHub API - /repos/{owner}/{repo}/contents/{path} エンドポイント（GET, PUT）@helper-methods- getFullPath - 相対パスを完全パスに変換@error-handling- 既存ファイルのSHA取得時の404エラーは正常として処理（新規作成として扱う）- その他のエラーはlogError関数でログ記録し、そのままスロー@state-changes- GitHubリポジトリ内のファイルが作成または更新される- コミットメッセージ: "Update {path}"@performance-considerations- GitHub APIの呼び出し回数に制限がある可能性あり（SHAの取得と書き込みで最大2回のAPI呼び出し）- 大きなファイルの場合はBase64エンコードによるオーバーヘッドに注意@monitoring- ログレベル: DEBUG（開始時）、INFO（成功時）、ERROR（エラー時）

**@constructor:** function Object() { [native code] }

##### GitHubStorageProvider.listFiles (method)

GitHubリポジトリの指定ディレクトリ内のファイル一覧を取得します指定されたディレクトリ内のファイルパスのリストを返します。ディレクトリは含まれません。@async@param {string} directory - ディレクトリパス@returns {Promise<string[]>} ファイルパスのリストのPromise@throws {Error} パスがディレクトリではない場合@throws {Error} GitHub API通信エラーの場合@usage// 使用方法try {  const files = await githubStorage.listFiles('docs');  console.log('ファイル一覧:', files);} catch (error) {  console.error('ファイル一覧取得エラー:', error.message);}@call-context- 同期/非同期: 非同期メソッド（await必須）- 推奨呼び出し環境: サーバーサイド- 前提条件: GitHubStorageProviderが正しく初期化済みであること@call-flow1. getFullPathを使用して完全パスを生成2. ディレクトリ一覧取得開始のデバッグログ出力3. GitHub APIを使用してディレクトリ内容を取得4. 応答データがディレクトリ（配列）であることを確認5. ファイルのみをフィルタリング6. ベースディレクトリを除去したパスのリストを返却@external-dependencies- GitHub API - /repos/{owner}/{repo}/contents/{path} エンドポイント@helper-methods- getFullPath - 相対パスを完全パスに変換@error-handling- 404エラーの場合は空の配列を返却- パスがディレクトリでない場合はエラーをスロー- その他のエラーはlogError関数でログ記録し、そのままスロー@performance-considerations- ディレクトリ内のファイル数が多い場合はレスポンスサイズに注意- GitHub APIのレート制限に注意@monitoring- ログレベル: DEBUG（開始時）、WARN（ディレクトリが存在しない場合）、ERROR（エラー時）

**@constructor:** function Object() { [native code] }

##### GitHubStorageProvider.fileExists (method)

ファイルが存在するか確認します指定されたパスにファイルが存在するかどうかを確認します。ディレクトリの場合はfalseを返します。@async@param {string} path - ファイルパス@returns {Promise<boolean>} ファイルが存在する場合はtrue、それ以外はfalse@throws {Error} GitHub API通信エラーの場合（404エラーを除く）@usage// 使用方法try {  const exists = await githubStorage.fileExists('path/to/file.txt');  console.log('ファイルは存在' + (exists ? 'します' : 'しません'));} catch (error) {  console.error('ファイル存在確認エラー:', error.message);}@call-context- 同期/非同期: 非同期メソッド（await必須）- 推奨呼び出し環境: サーバーサイド- 前提条件: GitHubStorageProviderが正しく初期化済みであること@call-flow1. getFullPathを使用して完全パスを生成2. GitHub APIを使用してファイル情報を取得3. 応答データがディレクトリ（配列）でない場合はtrue、それ以外はfalseを返却@external-dependencies- GitHub API - /repos/{owner}/{repo}/contents/{path} エンドポイント@helper-methods- getFullPath - 相対パスを完全パスに変換@error-handling- 404エラーの場合はfalseを返却（ファイルが存在しないことを示す）- その他のエラーはlogError関数でログ記録し、そのままスロー@performance-considerations- 単一のAPI呼び出しで完了するため比較的軽量- GitHub APIのレート制限に注意

**@constructor:** function Object() { [native code] }

##### GitHubStorageProvider.directoryExists (method)

ディレクトリが存在するか確認します指定されたパスにディレクトリが存在するかどうかを確認します。ファイルの場合はfalseを返します。@async@param {string} path - ディレクトリパス@returns {Promise<boolean>} ディレクトリが存在する場合はtrue、それ以外はfalse@throws {Error} GitHub API通信エラーの場合（404エラーを除く）@usage// 使用方法try {  const exists = await githubStorage.directoryExists('path/to/dir');  console.log('ディレクトリは存在' + (exists ? 'します' : 'しません'));} catch (error) {  console.error('ディレクトリ存在確認エラー:', error.message);}@call-context- 同期/非同期: 非同期メソッド（await必須）- 推奨呼び出し環境: サーバーサイド- 前提条件: GitHubStorageProviderが正しく初期化済みであること@call-flow1. getFullPathを使用して完全パスを生成2. GitHub APIを使用してパス情報を取得3. 応答データがディレクトリ（配列）の場合はtrue、それ以外はfalseを返却@external-dependencies- GitHub API - /repos/{owner}/{repo}/contents/{path} エンドポイント@helper-methods- getFullPath - 相対パスを完全パスに変換@error-handling- 404エラーの場合はfalseを返却（ディレクトリが存在しないことを示す）- その他のエラーはlogError関数でログ記録し、そのままスロー@performance-considerations- 単一のAPI呼び出しで完了するため比較的軽量- GitHub APIのレート制限に注意

**@constructor:** function Object() { [native code] }

##### GitHubStorageProvider.createDirectory (method)

ディレクトリを作成します指定されたパスにディレクトリを作成します。GitHubでは空のディレクトリは作成できないため、.gitkeepファイルを作成して代用します。@async@param {string} path - ディレクトリパス@returns {Promise<void>} 処理完了後に解決するPromise@throws {Error} ディレクトリ作成時のエラー（writeFileメソッドからの例外）@usage// 使用方法try {  await githubStorage.createDirectory('path/to/new/dir');  console.log('ディレクトリが正常に作成されました');} catch (error) {  console.error('ディレクトリ作成エラー:', error.message);}@call-context- 同期/非同期: 非同期メソッド（await必須）- 推奨呼び出し環境: サーバーサイド- 前提条件: GitHubStorageProviderが正しく初期化済みであること@call-flow1. getFullPathを使用して完全パスを生成2. ディレクトリ作成開始のデバッグログ出力3. .gitkeepファイルをディレクトリ内に作成（writeFileメソッドを使用）4. ディレクトリ作成成功のログ出力@external-dependencies- 内部的にwriteFileメソッドを使用しGitHub APIを呼び出し@helper-methods- getFullPath - 相対パスを完全パスに変換- writeFile - ファイル作成@state-changes- GitHubリポジトリに新しい.gitkeepファイルが作成される- 実質的にディレクトリ構造が作成される@monitoring- ログレベル: DEBUG（開始時）、INFO（成功時）- エラー時はwriteFileメソッド内でログ記録

**@constructor:** function Object() { [native code] }

##### GitHubStorageProvider.deleteFile (method)

ファイルを削除します指定されたパスのファイルをGitHubリポジトリから削除します。ファイルが存在しない場合は何もせず正常終了します。@async@param {string} path - 削除するファイルのパス@returns {Promise<void>} 処理完了後に解決するPromise@throws {Error} ファイルがディレクトリの場合@throws {Error} GitHub API通信エラーの場合（404エラーを除く）@usage// 使用方法try {  await githubStorage.deleteFile('path/to/file.txt');  console.log('ファイルが正常に削除されました');} catch (error) {  console.error('ファイル削除エラー:', error.message);}@call-context- 同期/非同期: 非同期メソッド（await必須）- 推奨呼び出し環境: サーバーサイド- 前提条件: GitHubStorageProviderが正しく初期化済みであること@call-flow1. getFullPathを使用して完全パスを生成2. ファイル削除開始のデバッグログ出力3. ファイルのSHAを取得4. 応答データがディレクトリでないことを確認5. GitHub APIを使用してファイルを削除6. ファイル削除成功のログ出力@external-dependencies- GitHub API - /repos/{owner}/{repo}/contents/{path} エンドポイント（GET, DELETE）@helper-methods- getFullPath - 相対パスを完全パスに変換@error-handling- 404エラーの場合は処理を終了（ファイルが存在しないため削除不要）- パスがディレクトリの場合はエラーをスロー- その他のエラーはlogError関数でログ記録し、そのままスロー@state-changes- GitHubリポジトリからファイルが削除される- コミットメッセージ: "Delete {path}"@performance-considerations- 2つのAPI呼び出し（SHAの取得と削除）が必要- GitHub APIのレート制限に注意@monitoring- ログレベル: DEBUG（開始時）、INFO（成功時）、WARN（ファイルが存在しない場合）、ERROR（エラー時）

**@constructor:** function Object() { [native code] }


---

### index copy 2.ts {#cnovel-automation-systemsrclibstorageindex-copy-2ts}

**Path:** `C:/novel-automation-system/src/lib/storage/index copy 2.ts`

@fileoverview ストレージプロバイダーのファクトリーとデフォルトインスタンスを提供@descriptionこのファイルは、環境設定に基づいて適切なストレージプロバイダーを作成し、アプリケーション全体で使用する単一のストレージプロバイダーインスタンスを提供します。また、ストレージ関連の型とクラスの再エクスポートも行います。@role- ストレージ抽象化レイヤーのエントリーポイントとして機能- 環境設定に基づく適切なストレージプロバイダーの作成- アプリケーション全体で使用するストレージインスタンスの提供- ストレージ関連の型と実装クラスの集約的なエクスポート@dependencies- ./types - ストレージプロバイダーのインターフェースと設定オプションの型定義- ./github-storage - GitHubをバックエンドとしたストレージプロバイダー実装- ./local-storage - ローカルファイルシステムをバックエンドとしたストレージプロバイダー実装- ../utils/logger - ロギング機能@flow1. 環境変数に基づいて使用するストレージプロバイダーを決定2. 対応するストレージプロバイダーのインスタンスを作成3. 作成したインスタンスをアプリケーション全体で使用できるようにエクスポート

**@constructor:** function Object() { [native code] }

#### createStorageProvider (function)

@fileoverview ストレージプロバイダーのファクトリーとデフォルトインスタンスを提供@descriptionこのファイルは、環境設定に基づいて適切なストレージプロバイダーを作成し、アプリケーション全体で使用する単一のストレージプロバイダーインスタンスを提供します。また、ストレージ関連の型とクラスの再エクスポートも行います。@role- ストレージ抽象化レイヤーのエントリーポイントとして機能- 環境設定に基づく適切なストレージプロバイダーの作成- アプリケーション全体で使用するストレージインスタンスの提供- ストレージ関連の型と実装クラスの集約的なエクスポート@dependencies- ./types - ストレージプロバイダーのインターフェースと設定オプションの型定義- ./github-storage - GitHubをバックエンドとしたストレージプロバイダー実装- ./local-storage - ローカルファイルシステムをバックエンドとしたストレージプロバイダー実装- ../utils/logger - ロギング機能@flow1. 環境変数に基づいて使用するストレージプロバイダーを決定2. 対応するストレージプロバイダーのインスタンスを作成3. 作成したインスタンスをアプリケーション全体で使用できるようにエクスポート/

import { StorageProvider, GitHubStorageOptions, LocalStorageOptions } from './types';
import { GitHubStorageProvider } from './github-storage';
import { LocalStorageProvider } from './local-storage';
import { logger } from '../utils/logger';

console.log('Loading storage/index.ts');
console.log('Environment variables in storage/index.ts:', {
ENABLE_LOCAL_STORAGE: process.env.ENABLE_LOCAL_STORAGE,
LOCAL_STORAGE_DIR: process.env.LOCAL_STORAGE_DIR
});

// 型とクラスのエクスポート
export type { StorageProvider, GitHubStorageOptions, LocalStorageOptions };
export { GitHubStorageProvider, LocalStorageProvider };

/**環境に応じたストレージプロバイダーを作成します環境変数の設定に基づいて、ローカルファイルシステムまたはGitHubリポジトリをバックエンドとしたストレージプロバイダーのインスタンスを作成し返却します。@returns {StorageProvider} 設定済みのストレージプロバイダー@throws {Error} GITHUB_TOKEN環境変数が設定されていない場合@throws {Error} GITHUB_REPO環境変数が設定されていない場合@usage// 直接呼び出し（通常は不要）const storage = createStorageProvider();@call-flow1. ENABLE_LOCAL_STORAGE環境変数の確認2. ローカルストレージが有効な場合:   a. LOCAL_STORAGE_DIR環境変数の取得（デフォルトは'data'）   b. LocalStorageProviderインスタンスの作成と返却3. GitHubストレージを使用する場合:   a. 必須環境変数（GITHUB_TOKEN、GITHUB_REPO）の確認   b. オプション環境変数（GITHUB_BRANCH、GITHUB_BASE_DIR）の取得   c. GitHubStorageProviderインスタンスの作成と返却@error-handling- 必須のGitHub設定（トークン、リポジトリ）が不足している場合、明示的なエラーをスロー- その他の設定エラーは各ストレージプロバイダーのコンストラクタで処理@monitoring- ログレベル: INFO（どのストレージプロバイダーを使用するかを記録）

**@constructor:** function Object() { [native code] }


---

### index copy.ts {#cnovel-automation-systemsrclibstorageindex-copyts}

**Path:** `C:/novel-automation-system/src/lib/storage/index copy.ts`

@fileoverview ストレージプロバイダーのファクトリーとデフォルトインスタンスを提供@descriptionこのファイルは、環境設定に基づいて適切なストレージプロバイダーを作成し、アプリケーション全体で使用する単一のストレージプロバイダーインスタンスを提供します。また、ストレージ関連の型とクラスの再エクスポートも行います。@role- ストレージ抽象化レイヤーのエントリーポイントとして機能- 環境設定に基づく適切なストレージプロバイダーの作成- アプリケーション全体で使用するストレージインスタンスの提供- ストレージ関連の型と実装クラスの集約的なエクスポート@dependencies- ./types - ストレージプロバイダーのインターフェースと設定オプションの型定義- ./github-storage - GitHubをバックエンドとしたストレージプロバイダー実装- ./local-storage - ローカルファイルシステムをバックエンドとしたストレージプロバイダー実装- ../utils/logger - ロギング機能@flow1. 環境変数に基づいて使用するストレージプロバイダーを決定2. 対応するストレージプロバイダーのインスタンスを作成3. 作成したインスタンスをアプリケーション全体で使用できるようにエクスポート

**@constructor:** function Object() { [native code] }

#### createStorageProvider (function)

@fileoverview ストレージプロバイダーのファクトリーとデフォルトインスタンスを提供@descriptionこのファイルは、環境設定に基づいて適切なストレージプロバイダーを作成し、アプリケーション全体で使用する単一のストレージプロバイダーインスタンスを提供します。また、ストレージ関連の型とクラスの再エクスポートも行います。@role- ストレージ抽象化レイヤーのエントリーポイントとして機能- 環境設定に基づく適切なストレージプロバイダーの作成- アプリケーション全体で使用するストレージインスタンスの提供- ストレージ関連の型と実装クラスの集約的なエクスポート@dependencies- ./types - ストレージプロバイダーのインターフェースと設定オプションの型定義- ./github-storage - GitHubをバックエンドとしたストレージプロバイダー実装- ./local-storage - ローカルファイルシステムをバックエンドとしたストレージプロバイダー実装- ../utils/logger - ロギング機能@flow1. 環境変数に基づいて使用するストレージプロバイダーを決定2. 対応するストレージプロバイダーのインスタンスを作成3. 作成したインスタンスをアプリケーション全体で使用できるようにエクスポート/

import { StorageProvider, GitHubStorageOptions, LocalStorageOptions } from './types';
import { GitHubStorageProvider } from './github-storage';
import { LocalStorageProvider } from './local-storage';
import { logger } from '../utils/logger';

console.log('Loading storage/index.ts');
console.log('Environment variables in storage/index.ts:', {
ENABLE_LOCAL_STORAGE: process.env.ENABLE_LOCAL_STORAGE,
LOCAL_STORAGE_DIR: process.env.LOCAL_STORAGE_DIR
});

// 型とクラスのエクスポート
export type { StorageProvider, GitHubStorageOptions, LocalStorageOptions };
export { GitHubStorageProvider, LocalStorageProvider };

/**環境に応じたストレージプロバイダーを作成します環境変数の設定に基づいて、ローカルファイルシステムまたはGitHubリポジトリをバックエンドとしたストレージプロバイダーのインスタンスを作成し返却します。@returns {StorageProvider} 設定済みのストレージプロバイダー@throws {Error} GITHUB_TOKEN環境変数が設定されていない場合@throws {Error} GITHUB_REPO環境変数が設定されていない場合@usage// 直接呼び出し（通常は不要）const storage = createStorageProvider();@call-flow1. ENABLE_LOCAL_STORAGE環境変数の確認2. ローカルストレージが有効な場合:   a. LOCAL_STORAGE_DIR環境変数の取得（デフォルトは'data'）   b. LocalStorageProviderインスタンスの作成と返却3. GitHubストレージを使用する場合:   a. 必須環境変数（GITHUB_TOKEN、GITHUB_REPO）の確認   b. オプション環境変数（GITHUB_BRANCH、GITHUB_BASE_DIR）の取得   c. GitHubStorageProviderインスタンスの作成と返却@error-handling- 必須のGitHub設定（トークン、リポジトリ）が不足している場合、明示的なエラーをスロー- その他の設定エラーは各ストレージプロバイダーのコンストラクタで処理@monitoring- ログレベル: INFO（どのストレージプロバイダーを使用するかを記録）

**@constructor:** function Object() { [native code] }


---

### index.ts {#cnovel-automation-systemsrclibstorageindexts}

**Path:** `C:/novel-automation-system/src/lib/storage/index.ts`

@fileoverview ストレージプロバイダーのファクトリーとデフォルトインスタンスを提供@descriptionこのファイルは、環境設定に基づいて適切なストレージプロバイダーを作成し、アプリケーション全体で使用する単一のストレージプロバイダーインスタンスを提供します。また、ストレージ関連の型とクラスの再エクスポートも行います。標準および拡張ストレージプロバイダーをサポートしています。@role- ストレージ抽象化レイヤーのエントリーポイントとして機能- 環境設定に基づく適切なストレージプロバイダーの作成- アプリケーション全体で使用するストレージインスタンスの提供- ストレージ関連の型と実装クラスの集約的なエクスポート@dependencies- ./types - ストレージプロバイダーのインターフェースと設定オプションの型定義- ./github-storage - GitHubをバックエンドとしたストレージプロバイダー実装- ./local-storage - ローカルファイルシステムをバックエンドとしたストレージプロバイダー実装- ./enhanced-local-storage - 拡張機能を持つローカルファイルシステムストレージプロバイダー実装- ../utils/logger - ロギング機能@flow1. 環境変数に基づいて使用するストレージプロバイダーを決定2. 対応するストレージプロバイダーのインスタンスを作成3. 作成したインスタンスをアプリケーション全体で使用できるようにエクスポート

**@constructor:** function Object() { [native code] }

#### createStorageProvider (function)

@fileoverview ストレージプロバイダーのファクトリーとデフォルトインスタンスを提供@descriptionこのファイルは、環境設定に基づいて適切なストレージプロバイダーを作成し、アプリケーション全体で使用する単一のストレージプロバイダーインスタンスを提供します。また、ストレージ関連の型とクラスの再エクスポートも行います。標準および拡張ストレージプロバイダーをサポートしています。@role- ストレージ抽象化レイヤーのエントリーポイントとして機能- 環境設定に基づく適切なストレージプロバイダーの作成- アプリケーション全体で使用するストレージインスタンスの提供- ストレージ関連の型と実装クラスの集約的なエクスポート@dependencies- ./types - ストレージプロバイダーのインターフェースと設定オプションの型定義- ./github-storage - GitHubをバックエンドとしたストレージプロバイダー実装- ./local-storage - ローカルファイルシステムをバックエンドとしたストレージプロバイダー実装- ./enhanced-local-storage - 拡張機能を持つローカルファイルシステムストレージプロバイダー実装- ../utils/logger - ロギング機能@flow1. 環境変数に基づいて使用するストレージプロバイダーを決定2. 対応するストレージプロバイダーのインスタンスを作成3. 作成したインスタンスをアプリケーション全体で使用できるようにエクスポート/

import {
StorageProvider,
GitHubStorageOptions,
LocalStorageOptions,
FileMetadata
} from './types';
import { GitHubStorageProvider } from './github-storage';
import { LocalStorageProvider } from './local-storage';
import { EnhancedLocalStorageProvider } from './enhanced-storage';
import { logger } from '../utils/logger';

console.log('Loading storage/index.ts');
console.log('Environment variables in storage/index.ts:', {
ENABLE_LOCAL_STORAGE: process.env.ENABLE_LOCAL_STORAGE,
LOCAL_STORAGE_DIR: process.env.LOCAL_STORAGE_DIR,
USE_ENHANCED_STORAGE: process.env.USE_ENHANCED_STORAGE,
ENABLE_BACKUP: process.env.ENABLE_BACKUP
});

// 型とクラスのエクスポート
export type {
StorageProvider,
GitHubStorageOptions,
LocalStorageOptions,
FileMetadata
};
export {
GitHubStorageProvider,
LocalStorageProvider,
EnhancedLocalStorageProvider
};

/**環境に応じたストレージプロバイダーを作成します環境変数の設定に基づいて、ローカルファイルシステム、拡張ローカルファイルシステム、またはGitHubリポジトリをバックエンドとしたストレージプロバイダーのインスタンスを作成し返却します。@returns {StorageProvider} 設定済みのストレージプロバイダー@throws {Error} GITHUB_TOKEN環境変数が設定されていない場合@throws {Error} GITHUB_REPO環境変数が設定されていない場合@usage// 直接呼び出し（通常は不要）const storage = createStorageProvider();@call-flow1. ENABLE_LOCAL_STORAGE環境変数の確認2. ローカルストレージが有効な場合:   a. USE_ENHANCED_STORAGE環境変数の確認   b. LOCAL_STORAGE_DIR環境変数の取得（デフォルトは'data'）   c. 拡張ストレージが有効な場合はEnhancedLocalStorageProviderインスタンスの作成   d. 標準の場合はLocalStorageProviderインスタンスの作成と返却3. GitHubストレージを使用する場合:   a. 必須環境変数（GITHUB_TOKEN、GITHUB_REPO）の確認   b. オプション環境変数（GITHUB_BRANCH、GITHUB_BASE_DIR）の取得   c. GitHubStorageProviderインスタンスの作成と返却@error-handling- 必須のGitHub設定（トークン、リポジトリ）が不足している場合、明示的なエラーをスロー- その他の設定エラーは各ストレージプロバイダーのコンストラクタで処理@monitoring- ログレベル: INFO（どのストレージプロバイダーを使用するかを記録）

**@constructor:** function Object() { [native code] }


---

### local-storage copy.ts {#cnovel-automation-systemsrclibstoragelocal-storage-copyts}

**Path:** `C:/novel-automation-system/src/lib/storage/local-storage copy.ts`

@fileoverview ローカルファイルシステムを使用したストレージプロバイダー@descriptionこのファイルはローカルファイルシステムを使用したStorageProviderインターフェースの実装を提供します。主に開発環境での使用を想定しており、ファイルの読み書きや一覧取得、存在確認、ディレクトリ作成、ファイル削除などの基本的なストレージ操作をローカルファイルシステムに対して行うことができます。@role- ストレージ抽象化レイヤーの一部として、ローカルファイルシステムをストレージとして使用するための実装を提供- StorageProviderインターフェースに準拠し、ストレージ操作の統一されたAPIを提供- 主に開発環境でのデータ永続化を担当@dependencies- fs/promises - ファイルシステム操作のための非同期APIを提供- path - ファイルパス操作のユーティリティを提供- ./types - StorageProviderインターフェースとLocalStorageOptionsの型定義- ../utils/logger - ログ出力機能- @/lib/utils/error-handler - エラーハンドリング機能@flow1. LocalStorageProviderのインスタンス化とベースディレクトリの設定2. ファイルシステムに対する各種操作（読み込み、書き込み、一覧取得など）3. エラーハンドリングとロギング4. 結果の返却または例外のスロー

**@constructor:** function Object() { [native code] }

#### LocalStorageProvider (class)

@fileoverview ローカルファイルシステムを使用したストレージプロバイダー@descriptionこのファイルはローカルファイルシステムを使用したStorageProviderインターフェースの実装を提供します。主に開発環境での使用を想定しており、ファイルの読み書きや一覧取得、存在確認、ディレクトリ作成、ファイル削除などの基本的なストレージ操作をローカルファイルシステムに対して行うことができます。@role- ストレージ抽象化レイヤーの一部として、ローカルファイルシステムをストレージとして使用するための実装を提供- StorageProviderインターフェースに準拠し、ストレージ操作の統一されたAPIを提供- 主に開発環境でのデータ永続化を担当@dependencies- fs/promises - ファイルシステム操作のための非同期APIを提供- path - ファイルパス操作のユーティリティを提供- ./types - StorageProviderインターフェースとLocalStorageOptionsの型定義- ../utils/logger - ログ出力機能- @/lib/utils/error-handler - エラーハンドリング機能@flow1. LocalStorageProviderのインスタンス化とベースディレクトリの設定2. ファイルシステムに対する各種操作（読み込み、書き込み、一覧取得など）3. エラーハンドリングとロギング4. 結果の返却または例外のスロー/

import fs from 'fs/promises';
import path from 'path';
import { StorageProvider, LocalStorageOptions } from './types';
import { logger } from '../utils/logger';
import { logError } from '@/lib/utils/error-handler';


/**@class LocalStorageProvider@description ローカルファイルシステムを使用したストレージプロバイダー実装クラス@role- ローカルファイルシステムをバックエンドとしたストレージプロバイダーを提供- StorageProviderインターフェースの実装- ファイルシステムとの通信処理、エラーハンドリング、ロギングを担当@used-by- コードからは使用元を特定できません@depends-on- fs/promises - ファイルシステム操作- path - パス操作- logger (../utils/logger) - ロギング機能- logError (@/lib/utils/error-handler) - エラーハンドリング機能@lifecycle1. コンストラクタでの初期化（ベースディレクトリの設定）2. StorageProviderインターフェースのメソッド呼び出し3. 内部的にファイルシステム操作4. 結果の返却またはエラーハンドリング@example-flow呼び出し元 → LocalStorageProvider.readFile →   getFullPath →   fs.readFile →  内容の返却またはエラーハンドリング

**@constructor:** function Object() { [native code] }

#### Methods of LocalStorageProvider

##### LocalStorageProvider.constructor (method)

ローカルストレージプロバイダーを初期化指定されたベースディレクトリを基準に、ファイルパスを解決します。初期化後、ログに初期化情報を記録します。@constructor@param {LocalStorageOptions} options - 設定オプション@param {string} options.baseDir - ベースディレクトリのパス@usage// 初期化方法const localStorage = new LocalStorageProvider({  baseDir: './data'});@call-flow1. options.baseDirを内部プロパティに設定2. 初期化完了のログ出力@initialization- ベースディレクトリパスを内部プロパティとして保持- 実際のディレクトリ作成は行わない（必要時に作成）

**@constructor:** function Object() { [native code] }

##### LocalStorageProvider.getFullPath (method)

ファイルパスを完全なパスに変換相対パスをベースディレクトリからの完全なパスに変換します。@private@param {string} filePath - 相対パス@returns {string} 完全なパス@usage// 内部的な使用方法const fullPath = this.getFullPath('path/to/file.txt');@call-flow1. path.joinを使用してベースディレクトリと相対パスを結合2. 結合されたパスを返却@called-by- readFile - 読み込むファイルの完全パスを取得- writeFile - 書き込むファイルの完全パスを取得- listFiles - 一覧を取得するディレクトリの完全パスを取得- fileExists - 存在確認するファイルの完全パスを取得- directoryExists - 存在確認するディレクトリの完全パスを取得- createDirectory - 作成するディレクトリの完全パスを取得- deleteFile - 削除するファイルの完全パスを取得

**@constructor:** function Object() { [native code] }

##### LocalStorageProvider.ensureDirectoryExists (method)

ファイルの親ディレクトリを再帰的に作成指定されたファイルパスの親ディレクトリが存在しない場合、再帰的に作成します。@private@async@param {string} filePath - ファイルパス@returns {Promise<void>} 処理完了後に解決するPromise@throws {Error} ディレクトリ作成中にエラーが発生した場合@usage// 内部的な使用方法await this.ensureDirectoryExists(fullPath);@call-flow1. path.dirnameを使用してファイルの親ディレクトリパスを取得2. fs.mkdirを使用して再帰的にディレクトリを作成3. エラー発生時はlogErrorでログ記録し、例外をスロー@called-by- writeFile - ファイル書き込み前にディレクトリを作成@error-handling- 作成中にエラーが発生した場合はlogError関数でログ記録- 発生したエラーをそのままスロー

**@constructor:** function Object() { [native code] }

##### LocalStorageProvider.readFile (method)

ファイルを読み込む指定されたパスのファイルを読み込み、文字列として返します。ファイルが存在しない場合や読み込み中にエラーが発生した場合は例外をスローします。@async@param {string} filePath - ファイルパス@returns {Promise<string>} ファイル内容のPromise@throws {Error} ファイルが見つからない場合（ENOENT）@throws {Error} その他のファイル読み込みエラーの場合@usage// 使用方法try {  const content = await localStorage.readFile('path/to/file.txt');  console.log(content);} catch (error) {  console.error('ファイル読み込みエラー:', error.message);}@call-context- 同期/非同期: 非同期メソッド（await必須）- 推奨呼び出し環境: 特に制限なし- 前提条件: LocalStorageProviderが正しく初期化済みであること@call-flow1. getFullPathを使用して完全パスを生成2. ファイル読み込み開始のデバッグログ出力3. fs.readFileを使用してファイル内容を取得4. 内容を返却@external-dependencies- fs/promises - readFileメソッド@helper-methods- getFullPath - 相対パスを完全パスに変換@error-handling- ENOENTエラーの場合は「ファイルが見つからない」エラーを生成- その他のエラーはlogError関数でログ記録し、そのままスロー@monitoring- ログレベル: DEBUG（開始時）、WARN/ERROR（エラー時）

**@constructor:** function Object() { [native code] }

##### LocalStorageProvider.writeFile (method)

ファイルを書き込む指定されたパスにファイルを書き込みます。ファイルの親ディレクトリが存在しない場合は自動的に作成します。@async@param {string} filePath - ファイルパス@param {string} content - 書き込む内容@returns {Promise<void>} 処理完了後に解決するPromise@throws {Error} ディレクトリ作成中にエラーが発生した場合@throws {Error} ファイル書き込み中にエラーが発生した場合@usage// 使用方法try {  await localStorage.writeFile('path/to/file.txt', 'ファイル内容');  console.log('ファイルが正常に書き込まれました');} catch (error) {  console.error('ファイル書き込みエラー:', error.message);}@call-context- 同期/非同期: 非同期メソッド（await必須）- 推奨呼び出し環境: 特に制限なし- 前提条件: LocalStorageProviderが正しく初期化済みであること@call-flow1. getFullPathを使用して完全パスを生成2. ファイル書き込み開始のデバッグログ出力3. ensureDirectoryExistsを使用して親ディレクトリを作成4. fs.writeFileを使用してファイルを書き込み5. 書き込み成功のログ出力@external-dependencies- fs/promises - writeFileメソッド、mkdirメソッド@helper-methods- getFullPath - 相対パスを完全パスに変換- ensureDirectoryExists - 親ディレクトリを作成@error-handling- ディレクトリ作成中のエラーはensureDirectoryExists内で処理- ファイル書き込み中のエラーはlogError関数でログ記録し、そのままスロー@state-changes- ローカルファイルシステムにファイルが作成または更新される- 必要に応じて親ディレクトリも作成される@monitoring- ログレベル: DEBUG（開始時）、INFO（成功時）、ERROR（エラー時）

**@constructor:** function Object() { [native code] }

##### LocalStorageProvider.listFiles (method)

ディレクトリ内のファイル一覧を取得指定されたディレクトリ内のファイルパスのリストを返します。ディレクトリが存在しない場合は空の配列を返します。@async@param {string} directory - ディレクトリパス@returns {Promise<string[]>} ファイルパスのリストのPromise@throws {Error} ディレクトリ読み込み中にエラーが発生した場合（ENOENTを除く）@usage// 使用方法try {  const files = await localStorage.listFiles('docs');  console.log('ファイル一覧:', files);} catch (error) {  console.error('ファイル一覧取得エラー:', error.message);}@call-context- 同期/非同期: 非同期メソッド（await必須）- 推奨呼び出し環境: 特に制限なし- 前提条件: LocalStorageProviderが正しく初期化済みであること@call-flow1. getFullPathを使用して完全パスを生成2. ディレクトリ一覧取得開始のデバッグログ出力3. fs.readdirを使用してディレクトリ内容を取得（withFileTypesオプションで）4. ディレクトリ項目をフィルタリングし、ファイルのみを抽出5. パスを連結してファイルパスのリストを生成6. リストを返却@external-dependencies- fs/promises - readdirメソッド- path - joinメソッド@helper-methods- getFullPath - 相対パスを完全パスに変換@error-handling- ENOENTエラーの場合は空の配列を返却- その他のエラーはlogError関数でログ記録し、そのままスロー@monitoring- ログレベル: DEBUG（開始時）、WARN（ディレクトリが存在しない場合）、ERROR（エラー時）

**@constructor:** function Object() { [native code] }

##### LocalStorageProvider.fileExists (method)

ファイルが存在するか確認指定されたパスにファイルが存在するかどうかを確認します。ディレクトリの場合はfalseを返します。@async@param {string} filePath - ファイルパス@returns {Promise<boolean>} ファイルが存在する場合はtrue、それ以外はfalse@throws {Error} ファイル存在確認中にエラーが発生した場合（ENOENTを除く）@usage// 使用方法try {  const exists = await localStorage.fileExists('path/to/file.txt');  console.log('ファイルは存在' + (exists ? 'します' : 'しません'));} catch (error) {  console.error('ファイル存在確認エラー:', error.message);}@call-context- 同期/非同期: 非同期メソッド（await必須）- 推奨呼び出し環境: 特に制限なし- 前提条件: LocalStorageProviderが正しく初期化済みであること@call-flow1. getFullPathを使用して完全パスを生成2. fs.statを使用してファイル情報を取得3. stat.isFileメソッドで結果を確認し、ファイルの場合はtrueを返却@external-dependencies- fs/promises - statメソッド@helper-methods- getFullPath - 相対パスを完全パスに変換@error-handling- ENOENTエラーの場合はfalseを返却（ファイルが存在しないことを示す）- その他のエラーはlogError関数でログ記録し、そのままスロー

**@constructor:** function Object() { [native code] }

##### LocalStorageProvider.directoryExists (method)

ディレクトリが存在するか確認指定されたパスにディレクトリが存在するかどうかを確認します。ファイルの場合はfalseを返します。@async@param {string} directoryPath - ディレクトリパス@returns {Promise<boolean>} ディレクトリが存在する場合はtrue、それ以外はfalse@throws {Error} ディレクトリ存在確認中にエラーが発生した場合（ENOENTを除く）@usage// 使用方法try {  const exists = await localStorage.directoryExists('path/to/dir');  console.log('ディレクトリは存在' + (exists ? 'します' : 'しません'));} catch (error) {  console.error('ディレクトリ存在確認エラー:', error.message);}@call-context- 同期/非同期: 非同期メソッド（await必須）- 推奨呼び出し環境: 特に制限なし- 前提条件: LocalStorageProviderが正しく初期化済みであること@call-flow1. getFullPathを使用して完全パスを生成2. fs.statを使用してファイル情報を取得3. stat.isDirectoryメソッドで結果を確認し、ディレクトリの場合はtrueを返却@external-dependencies- fs/promises - statメソッド@helper-methods- getFullPath - 相対パスを完全パスに変換@error-handling- ENOENTエラーの場合はfalseを返却（ディレクトリが存在しないことを示す）- その他のエラーはlogError関数でログ記録し、そのままスロー

**@constructor:** function Object() { [native code] }

##### LocalStorageProvider.createDirectory (method)

ディレクトリを作成指定されたパスにディレクトリを作成します。親ディレクトリが存在しない場合は再帰的に作成します。@async@param {string} directoryPath - ディレクトリパス@returns {Promise<void>} 処理完了後に解決するPromise@throws {Error} ディレクトリ作成中にエラーが発生した場合@usage// 使用方法try {  await localStorage.createDirectory('path/to/new/dir');  console.log('ディレクトリが正常に作成されました');} catch (error) {  console.error('ディレクトリ作成エラー:', error.message);}@call-context- 同期/非同期: 非同期メソッド（await必須）- 推奨呼び出し環境: 特に制限なし- 前提条件: LocalStorageProviderが正しく初期化済みであること@call-flow1. getFullPathを使用して完全パスを生成2. ディレクトリ作成開始のデバッグログ出力3. fs.mkdirを使用して再帰的にディレクトリを作成4. ディレクトリ作成成功のログ出力@external-dependencies- fs/promises - mkdirメソッド@helper-methods- getFullPath - 相対パスを完全パスに変換@error-handling- 作成中にエラーが発生した場合はlogError関数でログ記録- エラーをそのままスロー@state-changes- ローカルファイルシステムに新しいディレクトリが作成される- 必要に応じて親ディレクトリも作成される@monitoring- ログレベル: DEBUG（開始時）、INFO（成功時）、ERROR（エラー時）

**@constructor:** function Object() { [native code] }

##### LocalStorageProvider.deleteFile (method)

ファイルを削除指定されたパスのファイルをローカルファイルシステムから削除します。ファイルが存在しない場合は何もせず正常終了します。@async@param {string} filePath - 削除するファイルのパス@returns {Promise<void>} 処理完了後に解決するPromise@throws {Error} ファイル削除中にエラーが発生した場合（ENOENTを除く）@usage// 使用方法try {  await localStorage.deleteFile('path/to/file.txt');  console.log('ファイルが正常に削除されました');} catch (error) {  console.error('ファイル削除エラー:', error.message);}@call-context- 同期/非同期: 非同期メソッド（await必須）- 推奨呼び出し環境: 特に制限なし- 前提条件: LocalStorageProviderが正しく初期化済みであること@call-flow1. getFullPathを使用して完全パスを生成2. ファイル削除開始のデバッグログ出力3. fs.unlinkを使用してファイルを削除4. ファイル削除成功のログ出力@external-dependencies- fs/promises - unlinkメソッド@helper-methods- getFullPath - 相対パスを完全パスに変換@error-handling- ENOENTエラーの場合は処理を終了（ファイルが存在しないため削除不要）- その他のエラーはlogError関数でログ記録し、そのままスロー@state-changes- ローカルファイルシステムからファイルが削除される@monitoring- ログレベル: DEBUG（開始時）、INFO（成功時）、WARN（ファイルが存在しない場合）、ERROR（エラー時）

**@constructor:** function Object() { [native code] }


---

### local-storage.ts {#cnovel-automation-systemsrclibstoragelocal-storagets}

**Path:** `C:/novel-automation-system/src/lib/storage/local-storage.ts`

@fileoverview ローカルファイルシステムを使用したストレージプロバイダー@descriptionこのファイルはローカルファイルシステムを使用したStorageProviderインターフェースの実装を提供します。主に開発環境での使用を想定しており、ファイルの読み書きや一覧取得、存在確認、ディレクトリ作成、ファイル削除などの基本的なストレージ操作をローカルファイルシステムに対して行うことができます。@role- ストレージ抽象化レイヤーの一部として、ローカルファイルシステムをストレージとして使用するための実装を提供- StorageProviderインターフェースに準拠し、ストレージ操作の統一されたAPIを提供- 主に開発環境でのデータ永続化を担当@dependencies- fs/promises - ファイルシステム操作のための非同期APIを提供- path - ファイルパス操作のユーティリティを提供- ./types - StorageProviderインターフェースとLocalStorageOptionsの型定義- ../utils/logger - ログ出力機能- @/lib/utils/error-handler - エラーハンドリング機能@flow1. LocalStorageProviderのインスタンス化とベースディレクトリの設定2. ファイルシステムに対する各種操作（読み込み、書き込み、一覧取得など）3. エラーハンドリングとロギング4. 結果の返却または例外のスロー

**@constructor:** function Object() { [native code] }

#### LocalStorageProvider (class)

@fileoverview ローカルファイルシステムを使用したストレージプロバイダー@descriptionこのファイルはローカルファイルシステムを使用したStorageProviderインターフェースの実装を提供します。主に開発環境での使用を想定しており、ファイルの読み書きや一覧取得、存在確認、ディレクトリ作成、ファイル削除などの基本的なストレージ操作をローカルファイルシステムに対して行うことができます。@role- ストレージ抽象化レイヤーの一部として、ローカルファイルシステムをストレージとして使用するための実装を提供- StorageProviderインターフェースに準拠し、ストレージ操作の統一されたAPIを提供- 主に開発環境でのデータ永続化を担当@dependencies- fs/promises - ファイルシステム操作のための非同期APIを提供- path - ファイルパス操作のユーティリティを提供- ./types - StorageProviderインターフェースとLocalStorageOptionsの型定義- ../utils/logger - ログ出力機能- @/lib/utils/error-handler - エラーハンドリング機能@flow1. LocalStorageProviderのインスタンス化とベースディレクトリの設定2. ファイルシステムに対する各種操作（読み込み、書き込み、一覧取得など）3. エラーハンドリングとロギング4. 結果の返却または例外のスロー/

import fs from 'fs/promises';
import path from 'path';
import { StorageProvider, LocalStorageOptions } from './types';
import { logger } from '../utils/logger';
import { logError } from '@/lib/utils/error-handler';


/**@class LocalStorageProvider@description ローカルファイルシステムを使用したストレージプロバイダー実装クラス@role- ローカルファイルシステムをバックエンドとしたストレージプロバイダーを提供- StorageProviderインターフェースの実装- ファイルシステムとの通信処理、エラーハンドリング、ロギングを担当@used-by- コードからは使用元を特定できません@depends-on- fs/promises - ファイルシステム操作- path - パス操作- logger (../utils/logger) - ロギング機能- logError (@/lib/utils/error-handler) - エラーハンドリング機能@lifecycle1. コンストラクタでの初期化（ベースディレクトリの設定）2. StorageProviderインターフェースのメソッド呼び出し3. 内部的にファイルシステム操作4. 結果の返却またはエラーハンドリング@example-flow呼び出し元 → LocalStorageProvider.readFile →   getFullPath →   fs.readFile →  内容の返却またはエラーハンドリング

**@constructor:** function Object() { [native code] }

#### Methods of LocalStorageProvider

##### LocalStorageProvider.constructor (method)

ローカルストレージプロバイダーを初期化指定されたベースディレクトリを基準に、ファイルパスを解決します。初期化後、ログに初期化情報を記録します。@constructor@param {LocalStorageOptions} options - 設定オプション@param {string} options.baseDir - ベースディレクトリのパス@usage// 初期化方法const localStorage = new LocalStorageProvider({  baseDir: './data'});@call-flow1. options.baseDirを内部プロパティに設定2. 初期化完了のログ出力@initialization- ベースディレクトリパスを内部プロパティとして保持- 実際のディレクトリ作成は行わない（必要時に作成）

**@constructor:** function Object() { [native code] }

##### LocalStorageProvider.getFullPath (method)

ファイルパスを完全なパスに変換相対パスをベースディレクトリからの完全なパスに変換します。@private@param {string} filePath - 相対パス@returns {string} 完全なパス@usage// 内部的な使用方法const fullPath = this.getFullPath('path/to/file.txt');@call-flow1. path.joinを使用してベースディレクトリと相対パスを結合2. 結合されたパスを返却@called-by- readFile - 読み込むファイルの完全パスを取得- writeFile - 書き込むファイルの完全パスを取得- listFiles - 一覧を取得するディレクトリの完全パスを取得- fileExists - 存在確認するファイルの完全パスを取得- directoryExists - 存在確認するディレクトリの完全パスを取得- createDirectory - 作成するディレクトリの完全パスを取得- deleteFile - 削除するファイルの完全パスを取得

**@constructor:** function Object() { [native code] }

##### LocalStorageProvider.ensureDirectoryExists (method)

ファイルの親ディレクトリを再帰的に作成指定されたファイルパスの親ディレクトリが存在しない場合、再帰的に作成します。@private@async@param {string} filePath - ファイルパス@returns {Promise<void>} 処理完了後に解決するPromise@throws {Error} ディレクトリ作成中にエラーが発生した場合@usage// 内部的な使用方法await this.ensureDirectoryExists(fullPath);@call-flow1. path.dirnameを使用してファイルの親ディレクトリパスを取得2. fs.mkdirを使用して再帰的にディレクトリを作成3. エラー発生時はlogErrorでログ記録し、例外をスロー@called-by- writeFile - ファイル書き込み前にディレクトリを作成@error-handling- 作成中にエラーが発生した場合はlogError関数でログ記録- 発生したエラーをそのままスロー

**@constructor:** function Object() { [native code] }

##### LocalStorageProvider.readFile (method)

ファイルを読み込む指定されたパスのファイルを読み込み、文字列として返します。ファイルが存在しない場合や読み込み中にエラーが発生した場合は例外をスローします。@async@param {string} filePath - ファイルパス@returns {Promise<string>} ファイル内容のPromise@throws {Error} ファイルが見つからない場合（ENOENT）@throws {Error} その他のファイル読み込みエラーの場合@usage// 使用方法try {  const content = await localStorage.readFile('path/to/file.txt');  console.log(content);} catch (error) {  console.error('ファイル読み込みエラー:', error.message);}@call-context- 同期/非同期: 非同期メソッド（await必須）- 推奨呼び出し環境: 特に制限なし- 前提条件: LocalStorageProviderが正しく初期化済みであること@call-flow1. getFullPathを使用して完全パスを生成2. ファイル読み込み開始のデバッグログ出力3. fs.readFileを使用してファイル内容を取得4. 内容を返却@external-dependencies- fs/promises - readFileメソッド@helper-methods- getFullPath - 相対パスを完全パスに変換@error-handling- ENOENTエラーの場合は「ファイルが見つからない」エラーを生成- その他のエラーはlogError関数でログ記録し、そのままスロー@monitoring- ログレベル: DEBUG（開始時）、WARN/ERROR（エラー時）

**@constructor:** function Object() { [native code] }

##### LocalStorageProvider.writeFile (method)

ファイルを書き込む指定されたパスにファイルを書き込みます。ファイルの親ディレクトリが存在しない場合は自動的に作成します。@async@param {string} filePath - ファイルパス@param {string} content - 書き込む内容@returns {Promise<void>} 処理完了後に解決するPromise@throws {Error} ディレクトリ作成中にエラーが発生した場合@throws {Error} ファイル書き込み中にエラーが発生した場合@usage// 使用方法try {  await localStorage.writeFile('path/to/file.txt', 'ファイル内容');  console.log('ファイルが正常に書き込まれました');} catch (error) {  console.error('ファイル書き込みエラー:', error.message);}@call-context- 同期/非同期: 非同期メソッド（await必須）- 推奨呼び出し環境: 特に制限なし- 前提条件: LocalStorageProviderが正しく初期化済みであること@call-flow1. getFullPathを使用して完全パスを生成2. ファイル書き込み開始のデバッグログ出力3. ensureDirectoryExistsを使用して親ディレクトリを作成4. fs.writeFileを使用してファイルを書き込み5. 書き込み成功のログ出力@external-dependencies- fs/promises - writeFileメソッド、mkdirメソッド@helper-methods- getFullPath - 相対パスを完全パスに変換- ensureDirectoryExists - 親ディレクトリを作成@error-handling- ディレクトリ作成中のエラーはensureDirectoryExists内で処理- ファイル書き込み中のエラーはlogError関数でログ記録し、そのままスロー@state-changes- ローカルファイルシステムにファイルが作成または更新される- 必要に応じて親ディレクトリも作成される@monitoring- ログレベル: DEBUG（開始時）、INFO（成功時）、ERROR（エラー時）

**@constructor:** function Object() { [native code] }

##### LocalStorageProvider.listFiles (method)

ディレクトリ内のファイル一覧を取得指定されたディレクトリ内のファイルパスのリストを返します。ディレクトリが存在しない場合は空の配列を返します。@async@param {string} directory - ディレクトリパス@returns {Promise<string[]>} ファイルパスのリストのPromise@throws {Error} ディレクトリ読み込み中にエラーが発生した場合（ENOENTを除く）@usage// 使用方法try {  const files = await localStorage.listFiles('docs');  console.log('ファイル一覧:', files);} catch (error) {  console.error('ファイル一覧取得エラー:', error.message);}@call-context- 同期/非同期: 非同期メソッド（await必須）- 推奨呼び出し環境: 特に制限なし- 前提条件: LocalStorageProviderが正しく初期化済みであること@call-flow1. getFullPathを使用して完全パスを生成2. ディレクトリ一覧取得開始のデバッグログ出力3. fs.readdirを使用してディレクトリ内容を取得（withFileTypesオプションで）4. ディレクトリ項目をフィルタリングし、ファイルのみを抽出5. パスを連結してファイルパスのリストを生成6. リストを返却@external-dependencies- fs/promises - readdirメソッド- path - joinメソッド@helper-methods- getFullPath - 相対パスを完全パスに変換@error-handling- ENOENTエラーの場合は空の配列を返却- その他のエラーはlogError関数でログ記録し、そのままスロー@monitoring- ログレベル: DEBUG（開始時）、WARN（ディレクトリが存在しない場合）、ERROR（エラー時）

**@constructor:** function Object() { [native code] }

##### LocalStorageProvider.fileExists (method)

ファイルが存在するか確認指定されたパスにファイルが存在するかどうかを確認します。ディレクトリの場合はfalseを返します。@async@param {string} filePath - ファイルパス@returns {Promise<boolean>} ファイルが存在する場合はtrue、それ以外はfalse@throws {Error} ファイル存在確認中にエラーが発生した場合（ENOENTを除く）@usage// 使用方法try {  const exists = await localStorage.fileExists('path/to/file.txt');  console.log('ファイルは存在' + (exists ? 'します' : 'しません'));} catch (error) {  console.error('ファイル存在確認エラー:', error.message);}@call-context- 同期/非同期: 非同期メソッド（await必須）- 推奨呼び出し環境: 特に制限なし- 前提条件: LocalStorageProviderが正しく初期化済みであること@call-flow1. getFullPathを使用して完全パスを生成2. fs.statを使用してファイル情報を取得3. stat.isFileメソッドで結果を確認し、ファイルの場合はtrueを返却@external-dependencies- fs/promises - statメソッド@helper-methods- getFullPath - 相対パスを完全パスに変換@error-handling- ENOENTエラーの場合はfalseを返却（ファイルが存在しないことを示す）- その他のエラーはlogError関数でログ記録し、そのままスロー

**@constructor:** function Object() { [native code] }

##### LocalStorageProvider.directoryExists (method)

ディレクトリが存在するか確認指定されたパスにディレクトリが存在するかどうかを確認します。ファイルの場合はfalseを返します。@async@param {string} directoryPath - ディレクトリパス@returns {Promise<boolean>} ディレクトリが存在する場合はtrue、それ以外はfalse@throws {Error} ディレクトリ存在確認中にエラーが発生した場合（ENOENTを除く）@usage// 使用方法try {  const exists = await localStorage.directoryExists('path/to/dir');  console.log('ディレクトリは存在' + (exists ? 'します' : 'しません'));} catch (error) {  console.error('ディレクトリ存在確認エラー:', error.message);}@call-context- 同期/非同期: 非同期メソッド（await必須）- 推奨呼び出し環境: 特に制限なし- 前提条件: LocalStorageProviderが正しく初期化済みであること@call-flow1. getFullPathを使用して完全パスを生成2. fs.statを使用してファイル情報を取得3. stat.isDirectoryメソッドで結果を確認し、ディレクトリの場合はtrueを返却@external-dependencies- fs/promises - statメソッド@helper-methods- getFullPath - 相対パスを完全パスに変換@error-handling- ENOENTエラーの場合はfalseを返却（ディレクトリが存在しないことを示す）- その他のエラーはlogError関数でログ記録し、そのままスロー

**@constructor:** function Object() { [native code] }

##### LocalStorageProvider.createDirectory (method)

ディレクトリを作成指定されたパスにディレクトリを作成します。親ディレクトリが存在しない場合は再帰的に作成します。@async@param {string} directoryPath - ディレクトリパス@returns {Promise<void>} 処理完了後に解決するPromise@throws {Error} ディレクトリ作成中にエラーが発生した場合@usage// 使用方法try {  await localStorage.createDirectory('path/to/new/dir');  console.log('ディレクトリが正常に作成されました');} catch (error) {  console.error('ディレクトリ作成エラー:', error.message);}@call-context- 同期/非同期: 非同期メソッド（await必須）- 推奨呼び出し環境: 特に制限なし- 前提条件: LocalStorageProviderが正しく初期化済みであること@call-flow1. getFullPathを使用して完全パスを生成2. ディレクトリ作成開始のデバッグログ出力3. fs.mkdirを使用して再帰的にディレクトリを作成4. ディレクトリ作成成功のログ出力@external-dependencies- fs/promises - mkdirメソッド@helper-methods- getFullPath - 相対パスを完全パスに変換@error-handling- 作成中にエラーが発生した場合はlogError関数でログ記録- エラーをそのままスロー@state-changes- ローカルファイルシステムに新しいディレクトリが作成される- 必要に応じて親ディレクトリも作成される@monitoring- ログレベル: DEBUG（開始時）、INFO（成功時）、ERROR（エラー時）

**@constructor:** function Object() { [native code] }

##### LocalStorageProvider.deleteFile (method)

ファイルを削除指定されたパスのファイルをローカルファイルシステムから削除します。ファイルが存在しない場合は何もせず正常終了します。@async@param {string} filePath - 削除するファイルのパス@returns {Promise<void>} 処理完了後に解決するPromise@throws {Error} ファイル削除中にエラーが発生した場合（ENOENTを除く）@usage// 使用方法try {  await localStorage.deleteFile('path/to/file.txt');  console.log('ファイルが正常に削除されました');} catch (error) {  console.error('ファイル削除エラー:', error.message);}@call-context- 同期/非同期: 非同期メソッド（await必須）- 推奨呼び出し環境: 特に制限なし- 前提条件: LocalStorageProviderが正しく初期化済みであること@call-flow1. getFullPathを使用して完全パスを生成2. ファイル削除開始のデバッグログ出力3. fs.unlinkを使用してファイルを削除4. ファイル削除成功のログ出力@external-dependencies- fs/promises - unlinkメソッド@helper-methods- getFullPath - 相対パスを完全パスに変換@error-handling- ENOENTエラーの場合は処理を終了（ファイルが存在しないため削除不要）- その他のエラーはlogError関数でログ記録し、そのままスロー@state-changes- ローカルファイルシステムからファイルが削除される@monitoring- ログレベル: DEBUG（開始時）、INFO（成功時）、WARN（ファイルが存在しない場合）、ERROR（エラー時）

**@constructor:** function Object() { [native code] }


---

### optimized-storage.ts {#cnovel-automation-systemsrclibstorageoptimized-storagets}

**Path:** `C:/novel-automation-system/src/lib/storage/optimized-storage.ts`

@fileoverview 最適化されたストレージアクセスを提供するラッパーモジュール@descriptionこのファイルは、基本的なストレージ操作にキャッシュ層を追加し、パフォーマンスとスケーラビリティを向上させる最適化されたストレージ実装を提供します。メトリクス収集と詳細なログ記録も行い、システムの監視とデバッグをサポートします。@role- ストレージアクセスの抽象化レイヤーの一部として機能- キャッシュ戦略を実装し、パフォーマンスを最適化- ストレージ操作に関するメトリクスを収集- エラーハンドリングとログ記録を提供@dependencies- ./types.ts - ストレージプロバイダーのインターフェース定義- ../cache/redis-cache.ts - Redisベースのキャッシュ実装- ../utils/logger.ts - ログ記録機能- ../monitoring/metrics-collector.ts - メトリクス収集機能- @/lib/utils/error-handler.ts - エラーハンドリングユーティリティ@types- StorageProvider - ストレージ操作の基本インターフェース@flow1. ストレージ操作のリクエスト受信2. キャッシュからのデータ取得試行3. キャッシュヒットの場合はキャッシュからデータを返却4. キャッシュミスの場合は基礎となるストレージから取得5. 取得したデータをキャッシュに保存6. メトリクスの記録とログの出力7. クライアントへの結果返却

**@constructor:** function Object() { [native code] }

#### OptimizedStorage (class)

@fileoverview 最適化されたストレージアクセスを提供するラッパーモジュール@descriptionこのファイルは、基本的なストレージ操作にキャッシュ層を追加し、パフォーマンスとスケーラビリティを向上させる最適化されたストレージ実装を提供します。メトリクス収集と詳細なログ記録も行い、システムの監視とデバッグをサポートします。@role- ストレージアクセスの抽象化レイヤーの一部として機能- キャッシュ戦略を実装し、パフォーマンスを最適化- ストレージ操作に関するメトリクスを収集- エラーハンドリングとログ記録を提供@dependencies- ./types.ts - ストレージプロバイダーのインターフェース定義- ../cache/redis-cache.ts - Redisベースのキャッシュ実装- ../utils/logger.ts - ログ記録機能- ../monitoring/metrics-collector.ts - メトリクス収集機能- @/lib/utils/error-handler.ts - エラーハンドリングユーティリティ@types- StorageProvider - ストレージ操作の基本インターフェース@flow1. ストレージ操作のリクエスト受信2. キャッシュからのデータ取得試行3. キャッシュヒットの場合はキャッシュからデータを返却4. キャッシュミスの場合は基礎となるストレージから取得5. 取得したデータをキャッシュに保存6. メトリクスの記録とログの出力7. クライアントへの結果返却/

import { StorageProvider } from './types';
import { RedisCache } from '../cache/redis-cache';
import { logger } from '../utils/logger';
import { MetricsCollector } from '../monitoring/metrics-collector';
import { logError } from '@/lib/utils/error-handler';


/**@class OptimizedStorage@description最適化されたストレージアクセスを提供するラッパークラス。基本的なストレージプロバイダーへのアクセスにキャッシュ層を追加し、パフォーマンスと効率性を向上させます。また、詳細なメトリクス収集とログ記録を行い、システム監視と問題の診断をサポートします。@role- 基本ストレージプロバイダーへのアクセスを最適化- Redisベースのキャッシュ戦略を実装- 操作のメトリクスを収集- 詳細なログ記録とエラーハンドリングを提供- キャッシュの無効化とプリフェッチ機能を提供@implements {StorageProvider}@depends-on- StorageProvider - 基本的なストレージ操作のインターフェース- RedisCache - キャッシュ機能の提供- MetricsCollector - メトリクス収集機能- logger - ログ記録機能- logError - エラーハンドリング機能@lifecycle1. コンストラクタによる初期化（基本ストレージ、名前空間、TTLの設定）2. Redisキャッシュインスタンスの作成3. MetricsCollectorインスタンスの取得4. 読み取り/書き込み/検索などの操作実行（キャッシュ優先）5. キャッシュの無効化または更新6. メトリクスの記録とログの出力@example-flowクライアント → OptimizedStorage.readFile →   RedisCache.get (キャッシュチェック) →   ヒット時: 直接結果返却 →  ミス時: baseStorage.readFile →  RedisCache.set (キャッシュ更新) →  メトリクス記録 →  クライアントへの結果返却

**@constructor:** function Object() { [native code] }

#### Methods of OptimizedStorage

##### OptimizedStorage.constructor (method)

最適化されたストレージを初期化します基本となるストレージプロバイダーを受け取り、それをラップしてキャッシュ機能とメトリクス収集機能を追加します。名前空間とキャッシュTTLはオプションでカスタマイズ可能です。@constructor@param {StorageProvider} baseStorage - 基本ストレージプロバイダー@param {string} [namespace='storage'] - キャッシュ名前空間@param {number} [cacheTTL=300] - キャッシュTTL（秒）。デフォルトは5分。@usage// 最適化されたストレージの初期化const baseStorage = new S3Storage(); // または他のStorageProviderの実装const storage = new OptimizedStorage(baseStorage, 'user-data', 600); // 10分のTTL@call-flow1. プロパティの初期化 (baseStorage, namespace, cacheTTL)2. RedisCache インスタンスの作成3. MetricsCollector シングルトンインスタンスの取得4. 初期化ログの出力@initializationこのコンストラクタは、アプリケーションの起動時に一度呼び出されるか、または特定のコンテキスト（ユーザーセッションなど）ごとに呼び出されます。RedisCache インスタンスが内部で作成され、Redis接続が確立されます。@error-handlingコンストラクタ自体はエラーをスローしませんが、RedisCache の初期化中にエラーが発生した場合、RedisCache 内部でログが記録されます。

**@constructor:** function Object() { [native code] }

##### OptimizedStorage.getCacheKey (method)

キャッシュキーを生成します指定されたファイルパスに基づいて、名前空間を含むキャッシュキーを生成します。これにより、異なる名前空間間でのキャッシュの衝突を防ぎます。@private@param {string} path - ファイルパス@returns {string} 生成されたキャッシュキー@usage// クラス内部でのみ使用const cacheKey = this.getCacheKey('path/to/file.txt');@call-flow1. 名前空間とパスを結合してキャッシュキーを作成@helper-methodsなし@error-handlingエラーを発生させない純粋な関数@expected-format```'namespace:path/to/file.txt'```

**@constructor:** function Object() { [native code] }

##### OptimizedStorage.readFile (method)

ファイルを読み込みます（キャッシュ優先）指定されたパスのファイル内容を取得します。最初にキャッシュからの取得を試み、キャッシュにない場合は基本ストレージから読み込み、結果をキャッシュに保存します。この操作に関するメトリクスが収集され、詳細なログが記録されます。@async@param {string} path - ファイルパス@returns {Promise<string>} ファイルの内容@throws {Error} ファイル読み込み中にエラーが発生した場合@usage// 最適化されたファイル読み込みtry {  const content = await storage.readFile('path/to/file.txt');  // contentを処理} catch (error) {  // エラー処理}@call-context- 同期/非同期: 非同期メソッド（await必須）- 推奨呼び出し環境: サーバーサイド- 前提条件: ストレージプロバイダーが正しく初期化されていること@call-flow1. キャッシュキーの生成2. 操作開始時間の記録3. キャッシュからの取得試行4. キャッシュヒットの場合:   a. キャッシュヒットをログとメトリクスに記録   b. キャッシュデータを返却5. キャッシュミスの場合:   a. キャッシュミスをログとメトリクスに記録   b. 基本ストレージからのデータ取得   c. キャッシュへのデータ保存6. 操作時間の計測とメトリクスへの記録7. 結果の返却@external-dependencies- Redisキャッシュサーバー - キャッシュデータの保存@helper-methods- getCacheKey - キャッシュキーの生成@error-handling- すべてのエラーはキャッチされ、logError関数でログに記録- 操作時間はエラー発生時もメトリクスに記録- エラーは上位レイヤーへ再スローされる@performance-considerations- キャッシュヒット時は非常に高速（低レイテンシ）- キャッシュミス時は基本ストレージのパフォーマンスに依存- 頻繁にアクセスされるファイルに対して効果的@monitoring- ログレベル: DEBUG（操作詳細）- メトリクス: キャッシュヒット/ミス、読み取り操作時間（キャッシュ/ストレージ/合計）

**@constructor:** function Object() { [native code] }

##### OptimizedStorage.writeFile (method)

ファイルを書き込みます（キャッシュ更新付き）指定されたパスに内容を書き込み、同時にキャッシュを更新します。キャッシュの無効化ではなく更新を行うことで、書き込み後の即時読み取りがキャッシュミスを発生させないようにします。@async@param {string} path - ファイルパス@param {string} content - ファイルコンテンツ@returns {Promise<void>}@throws {Error} ファイル書き込み中にエラーが発生した場合@usage// ファイル書き込みtry {  await storage.writeFile('path/to/file.txt', 'ファイルの内容');} catch (error) {  // エラー処理}@call-context- 同期/非同期: 非同期メソッド（await必須）- 推奨呼び出し環境: サーバーサイド- 前提条件: ストレージプロバイダーが正しく初期化されていること@call-flow1. キャッシュキーの生成2. 操作開始時間の記録3. 基本ストレージへの書き込み4. キャッシュの更新（同じ内容で）5. 操作時間の計測とメトリクスへの記録6. ログの記録@helper-methods- getCacheKey - キャッシュキーの生成@error-handling- すべてのエラーはキャッチされ、logError関数でログに記録- 操作時間はエラー発生時もメトリクスに記録- エラーは上位レイヤーへ再スローされる@state-changes- 基本ストレージ内のファイル内容を更新- キャッシュ内の対応するエントリを更新@performance-considerations- 書き込み操作自体は基本ストレージのパフォーマンスに依存- キャッシュ更新は追加のオーバーヘッドを生じるが、後続の読み取りを高速化@monitoring- ログレベル: DEBUG（操作詳細）- メトリクス: 書き込み操作時間（合計/エラー）

**@constructor:** function Object() { [native code] }

##### OptimizedStorage.fileExists (method)

ファイルが存在するか確認します指定されたパスのファイルが存在するかどうかを確認します。結果はキャッシュされ、頻繁なチェックによるパフォーマンスへの影響を軽減します。@async@param {string} path - ファイルパス@returns {Promise<boolean>} ファイルが存在する場合はtrue@throws {Error} チェック中にエラーが発生した場合@usage// ファイルの存在確認try {  const exists = await storage.fileExists('path/to/file.txt');  if (exists) {    // ファイルが存在する場合の処理  } else {    // ファイルが存在しない場合の処理  }} catch (error) {  // エラー処理}@call-context- 同期/非同期: 非同期メソッド（await必須）- 推奨呼び出し環境: サーバーサイド- 前提条件: ストレージプロバイダーが正しく初期化されていること@call-flow1. 専用の存在確認用キャッシュキーの生成2. 操作開始時間の記録3. キャッシュからの結果取得試行4. キャッシュヒットの場合:   a. キャッシュヒットをログとメトリクスに記録   b. キャッシュデータを返却5. キャッシュミスの場合:   a. キャッシュミスをログとメトリクスに記録   b. 基本ストレージでの存在確認   c. 結果をキャッシュに保存6. 操作時間の計測とメトリクスへの記録7. 結果の返却@helper-methods- getCacheKey - キャッシュキーの生成@error-handling- すべてのエラーはキャッチされ、logError関数でログに記録- 操作時間はエラー発生時もメトリクスに記録- エラーは上位レイヤーへ再スローされる@performance-considerations- キャッシュヒット時は非常に高速- 頻繁に確認されるファイルパスに対して効果的- 存在状態が変わらないファイルに最適@monitoring- ログレベル: DEBUG（操作詳細）- メトリクス: キャッシュヒット/ミス、存在確認操作時間（キャッシュ/ストレージ/合計）

**@constructor:** function Object() { [native code] }

##### OptimizedStorage.listFiles (method)

ディレクトリ内のファイル一覧を取得します指定されたディレクトリ内のファイルパスのリストを取得します。結果はキャッシュされますが、ディレクトリリストは短いTTLが適用されます。@async@param {string} directory - ディレクトリパス@returns {Promise<string[]>} ファイルパスのリスト@throws {Error} ディレクトリ一覧取得中にエラーが発生した場合@usage// ディレクトリ内のファイル一覧取得try {  const files = await storage.listFiles('path/to/directory');  // filesを処理} catch (error) {  // エラー処理}@call-context- 同期/非同期: 非同期メソッド（await必須）- 推奨呼び出し環境: サーバーサイド- 前提条件: ディレクトリが存在すること@call-flow1. ディレクトリリスト用キャッシュキーの生成2. 操作開始時間の記録3. キャッシュからのリスト取得試行4. キャッシュヒットの場合:   a. キャッシュヒットをログとメトリクスに記録   b. キャッシュデータを返却5. キャッシュミスの場合:   a. キャッシュミスをログとメトリクスに記録   b. 基本ストレージからのディレクトリ一覧取得   c. 結果をキャッシュに保存（短いTTL）6. 操作時間の計測とメトリクスへの記録7. 結果の返却@helper-methods- getCacheKey - キャッシュキーの生成@error-handling- すべてのエラーはキャッチされ、logError関数でログに記録- 操作時間はエラー発生時もメトリクスに記録- エラーは上位レイヤーへ再スローされる@performance-considerations- ディレクトリ一覧のキャッシュTTLは短く設定される（最大1分）- ディレクトリ内容が頻繁に変更される環境ではキャッシュ効果が限定的@monitoring- ログレベル: DEBUG（操作詳細）- メトリクス: キャッシュヒット/ミス、一覧取得操作時間（キャッシュ/ストレージ/合計）

**@constructor:** function Object() { [native code] }

##### OptimizedStorage.deleteFile (method)

ファイルを削除します（キャッシュ無効化付き）指定されたパスのファイルを削除し、関連するキャッシュエントリを無効化します。ファイル内容、存在確認、親ディレクトリリストのキャッシュすべてが無効化されます。@async@param {string} path - ファイルパス@returns {Promise<void>}@throws {Error} ファイル削除中にエラーが発生した場合@usage// ファイルの削除try {  await storage.deleteFile('path/to/file.txt');} catch (error) {  // エラー処理}@call-context- 同期/非同期: 非同期メソッド（await必須）- 推奨呼び出し環境: サーバーサイド- 前提条件: ファイルが存在すること（ただし、存在しない場合もエラーとならない場合あり）@call-flow1. 必要なキャッシュキーの生成（ファイル内容用と存在確認用）2. 操作開始時間の記録3. 基本ストレージでのファイル削除4. 関連キャッシュの無効化:   a. ファイル内容キャッシュの削除   b. 存在確認キャッシュの削除5. 親ディレクトリのリストキャッシュの無効化6. 操作時間の計測とメトリクスへの記録7. ログの記録@helper-methods- getCacheKey - キャッシュキーの生成@error-handling- すべてのエラーはキャッチされ、logError関数でログに記録- 操作時間はエラー発生時もメトリクスに記録- エラーは上位レイヤーへ再スローされる@state-changes- 基本ストレージからファイルを削除- 複数の関連キャッシュエントリを無効化@performance-considerations- 複数のキャッシュエントリを無効化するため、追加のオーバーヘッドが発生- 基本的なファイル削除のパフォーマンスは基本ストレージに依存@monitoring- ログレベル: DEBUG（操作詳細）- メトリクス: 削除操作時間（合計/エラー）

**@constructor:** function Object() { [native code] }

##### OptimizedStorage.directoryExists (method)

ディレクトリが存在するか確認します指定されたパスのディレクトリが存在するかどうかを確認します。結果はキャッシュされ、頻繁なチェックによるパフォーマンスへの影響を軽減します。@async@param {string} directory - ディレクトリパス@returns {Promise<boolean>} ディレクトリが存在する場合はtrue@throws {Error} チェック中にエラーが発生した場合@usage// ディレクトリの存在確認try {  const exists = await storage.directoryExists('path/to/directory');  if (exists) {    // ディレクトリが存在する場合の処理  } else {    // ディレクトリが存在しない場合の処理  }} catch (error) {  // エラー処理}@call-context- 同期/非同期: 非同期メソッド（await必須）- 推奨呼び出し環境: サーバーサイド- 前提条件: ストレージプロバイダーが正しく初期化されていること@call-flow1. ディレクトリ存在確認用キャッシュキーの生成2. 操作開始時間の記録3. キャッシュからの結果取得試行4. キャッシュヒットの場合:   a. キャッシュヒットをログとメトリクスに記録   b. キャッシュデータを返却5. キャッシュミスの場合:   a. キャッシュミスをログとメトリクスに記録   b. 基本ストレージでのディレクトリ存在確認   c. 結果をキャッシュに保存6. 操作時間の計測とメトリクスへの記録7. 結果の返却@helper-methods- getCacheKey - キャッシュキーの生成@error-handling- すべてのエラーはキャッチされ、logError関数でログに記録- 操作時間はエラー発生時もメトリクスに記録- エラーは上位レイヤーへ再スローされる@performance-considerations- キャッシュヒット時は非常に高速- 頻繁に確認されるディレクトリパスに対して効果的- 存在状態が変わらないディレクトリに最適@monitoring- ログレベル: DEBUG（操作詳細）- メトリクス: キャッシュヒット/ミス、ディレクトリ存在確認操作時間（キャッシュ/ストレージ/合計）

**@constructor:** function Object() { [native code] }

##### OptimizedStorage.createDirectory (method)

ディレクトリを作成します指定されたパスにディレクトリを作成し、関連するキャッシュを更新します。親ディレクトリのリストキャッシュも無効化して、整合性を保ちます。@async@param {string} directory - ディレクトリパス@returns {Promise<void>}@throws {Error} ディレクトリ作成中にエラーが発生した場合@usage// ディレクトリの作成try {  await storage.createDirectory('path/to/new/directory');} catch (error) {  // エラー処理}@call-context- 同期/非同期: 非同期メソッド（await必須）- 推奨呼び出し環境: サーバーサイド- 前提条件: 親ディレクトリが存在すること@call-flow1. ディレクトリ存在確認用キャッシュキーの生成2. 操作開始時間の記録3. 基本ストレージでのディレクトリ作成4. ディレクトリ存在キャッシュの更新（true）5. 親ディレクトリのリストキャッシュの無効化6. 操作時間の計測とメトリクスへの記録7. ログの記録@helper-methods- getCacheKey - キャッシュキーの生成@error-handling- すべてのエラーはキャッチされ、logError関数でログに記録- 操作時間はエラー発生時もメトリクスに記録- エラーは上位レイヤーへ再スローされる@state-changes- 基本ストレージに新しいディレクトリを作成- ディレクトリ存在キャッシュを更新- 親ディレクトリのリストキャッシュを無効化@performance-considerations- 基本的なディレクトリ作成のパフォーマンスは基本ストレージに依存- キャッシュ更新と無効化による追加のオーバーヘッドが発生@monitoring- ログレベル: DEBUG（操作詳細）- メトリクス: ディレクトリ作成操作時間（合計/エラー）

**@constructor:** function Object() { [native code] }

##### OptimizedStorage.invalidateAllCache (method)

すべてのキャッシュを無効化しますこのインスタンスの名前空間に関連するすべてのキャッシュエントリを無効化します。システム全体のリフレッシュや緊急時のキャッシュクリアに使用されます。@async@returns {Promise<void>}@throws {Error} キャッシュ無効化中にエラーが発生した場合@usage// すべてのキャッシュを無効化try {  await storage.invalidateAllCache();} catch (error) {  // エラー処理}@call-context- 同期/非同期: 非同期メソッド（await必須）- 推奨呼び出し環境: サーバーサイド- 使用シナリオ: データの大規模更新後、システム再起動時、キャッシュの整合性問題発生時@call-flow1. 名前空間に基づくパターンマッチで全キャッシュエントリを無効化2. ログを記録@helper-methodsなし@error-handling- エラーはキャッチされ、logError関数でログに記録- エラーは上位レイヤーへ再スローされる@state-changes- この名前空間に関連するすべてのキャッシュエントリが削除される@performance-considerations- 大量のキャッシュエントリが存在する場合、リソース消費が増加する可能性あり- キャッシュが完全にクリアされるため、一時的にパフォーマンスが低下する可能性あり@monitoring- ログレベル: INFO（重要な操作）

**@constructor:** function Object() { [native code] }

##### OptimizedStorage.invalidateCache (method)

パスパターンに基づくキャッシュの無効化を行います特定のパスパターンに一致するキャッシュエントリのみを無効化します。選択的なキャッシュリフレッシュに使用されます。@async@param {string} pathPattern - 無効化するパスパターン@returns {Promise<void>}@throws {Error} キャッシュ無効化中にエラーが発生した場合@usage// 特定のパターンに一致するキャッシュを無効化try {  // 特定のディレクトリに関連するすべてのキャッシュを無効化  await storage.invalidateCache('path/to/directory/*');    // 特定の拡張子を持つファイルのキャッシュを無効化  await storage.invalidateCache('*.json');} catch (error) {  // エラー処理}@call-context- 同期/非同期: 非同期メソッド（await必須）- 推奨呼び出し環境: サーバーサイド- 使用シナリオ: 特定のファイルグループが更新された場合@call-flow1. 名前空間とパターンを組み合わせたキャッシュパターンを作成2. パターンに一致するキャッシュエントリを無効化3. ログを記録@helper-methodsなし@error-handling- エラーはキャッチされ、logError関数でログに記録- エラーは上位レイヤーへ再スローされる@state-changes- パターンに一致するキャッシュエントリが削除される@performance-considerations- パターンマッチングの範囲が広い場合、処理にリソースが必要- パターンに一致するエントリの数に比例してリソース消費が増加@monitoring- ログレベル: INFO（重要な操作）

**@constructor:** function Object() { [native code] }

##### OptimizedStorage.prefetch (method)

プリフェッチでキャッシュを温めます指定されたパスのリストのファイルをプリフェッチし、キャッシュに保存します。キャッシュに既に存在するファイルはスキップされます。パフォーマンス最適化のためのプロアクティブなキャッシュ管理に使用されます。@async@param {string[]} paths - プリフェッチするパスのリスト@returns {Promise<void>}@usage// 複数のファイルをプリフェッチconst filesToPrefetch = [  'path/to/file1.txt',  'path/to/file2.txt',  'path/to/config.json'];await storage.prefetch(filesToPrefetch);@call-context- 同期/非同期: 非同期メソッド（await必須）- 推奨呼び出し環境: サーバーサイド- 使用シナリオ: アプリケーション起動時、予測可能なアクセスパターンがある場合@call-flow1. パスリストが空の場合は早期リターン2. プリフェッチ開始のログを記録3. 操作開始時間の記録4. 各パスを並列処理:   a. キャッシュキーの生成   b. キャッシュにデータが存在するか確認   c. キャッシュにない場合:      i. 基本ストレージからファイル読み込み      ii. キャッシュへの保存      iii. 成功カウンタの増加5. エラーが発生した場合はログに記録し、エラーカウンタを増加6. 操作終了時間の記録と所要時間の計算7. プリフェッチ完了のログを記録（成功数、エラー数、所要時間を含む）@helper-methods- getCacheKey - キャッシュキーの生成@error-handling- 個々のファイル処理のエラーはキャッチされ、ログに記録- 他のファイルのプリフェッチは継続される（一部のエラーが全体を中断しない）- 最終的な結果レポートにエラー数が含まれる@performance-considerations- すべてのファイルを並列に処理するため、大量のファイルを同時にプリフェッチすると  システムリソースに負荷がかかる可能性あり- 既にキャッシュにあるファイルはスキップされるため、重複プリフェッチは効率的@monitoring- ログレベル: INFO（操作の開始と完了）

**@constructor:** function Object() { [native code] }


---

### types copy.ts {#cnovel-automation-systemsrclibstoragetypes-copyts}

**Path:** `C:/novel-automation-system/src/lib/storage/types copy.ts`

@fileoverview ストレージ抽象化レイヤーの型定義@descriptionこのファイルは、ストレージ操作を抽象化するためのインターフェースと各ストレージプロバイダーの設定オプションの型定義を提供します。これらの型定義により、異なるストレージバックエンド間で一貫したAPIを提供することが可能になります。@role- ストレージ操作の統一インターフェースを定義- 各ストレージプロバイダーの設定オプションの型を定義- 型安全なストレージアクセスを提供@dependenciesなし（純粋な型定義ファイル）@used-by- ./index.ts - 型のエクスポートとストレージプロバイダーの作成- ./github-storage.ts - GitHubストレージプロバイダーの実装- ./local-storage.ts - ローカルストレージプロバイダーの実装- ./optimized-storage.ts - キャッシュを使用した最適化されたストレージプロバイダー- アプリケーション全体 - ストレージ操作のインターフェースとして

**@constructor:** function Object() { [native code] }

#### StorageProvider (interface)

@fileoverview ストレージ抽象化レイヤーの型定義@descriptionこのファイルは、ストレージ操作を抽象化するためのインターフェースと各ストレージプロバイダーの設定オプションの型定義を提供します。これらの型定義により、異なるストレージバックエンド間で一貫したAPIを提供することが可能になります。@role- ストレージ操作の統一インターフェースを定義- 各ストレージプロバイダーの設定オプションの型を定義- 型安全なストレージアクセスを提供@dependenciesなし（純粋な型定義ファイル）@used-by- ./index.ts - 型のエクスポートとストレージプロバイダーの作成- ./github-storage.ts - GitHubストレージプロバイダーの実装- ./local-storage.ts - ローカルストレージプロバイダーの実装- ./optimized-storage.ts - キャッシュを使用した最適化されたストレージプロバイダー- アプリケーション全体 - ストレージ操作のインターフェースとして/

/**ストレージプロバイダーのインターフェース異なるストレージバックエンド（GitHub、ローカルファイルシステムなど）間で一貫したファイル操作APIを提供するための共通インターフェースです。すべてのストレージプロバイダー実装はこのインターフェースに準拠する必要があります。@role- ファイルシステム操作の抽象化レイヤーを提供- 異なるストレージバックエンド間で一貫したAPIを確保- アプリケーションコードからストレージの実装詳細を隠蔽@implemented-by- GitHubStorageProvider - GitHubリポジトリをバックエンドとして使用- LocalStorageProvider - ローカルファイルシステムをバックエンドとして使用- OptimizedStorage - 基本ストレージプロバイダーにキャッシュ層を追加@usage// ストレージプロバイダーの使用例const storage: StorageProvider = new SomeStorageProvider(options);// ファイル読み込みconst content = await storage.readFile('path/to/file.txt');// ファイル書き込みawait storage.writeFile('path/to/file.txt', 'ファイル内容');

**@constructor:** function Object() { [native code] }

#### GitHubStorageOptions (interface)

ファイルを読み込みます指定されたパスのファイルを読み込み、その内容を文字列として返します。ファイルが存在しない場合は例外をスローします。@param {string} path - ファイルパス@returns {Promise<string>} ファイル内容の文字列@throws {Error} ファイルが存在しない場合@throws {Error} ファイル読み込み中にエラーが発生した場合@usagetry {  const content = await storage.readFile('path/to/file.txt');  console.log(content);} catch (error) {  console.error('ファイル読み込みエラー:', error.message);}/
readFile(path: string): Promise<string>;

/**ファイルを書き込みます指定されたパスにファイルを書き込みます。ファイルが存在しない場合は新規作成し、存在する場合は上書きします。必要に応じて親ディレクトリも作成します。@param {string} path - ファイルパス@param {string} content - 書き込む内容@returns {Promise<void>} 処理完了後に解決するPromise@throws {Error} ファイル書き込み中にエラーが発生した場合@usagetry {  await storage.writeFile('path/to/file.txt', 'ファイル内容');  console.log('ファイルが正常に書き込まれました');} catch (error) {  console.error('ファイル書き込みエラー:', error.message);}/
writeFile(path: string, content: string): Promise<void>;

/**ディレクトリ内のファイル一覧を取得します指定されたディレクトリ内のファイルパスのリストを返します。サブディレクトリは含まれません。ディレクトリが存在しない場合は空の配列を返します。@param {string} directory - ディレクトリパス@returns {Promise<string[]>} ファイルパスのリスト@throws {Error} ディレクトリ読み込み中にエラーが発生した場合@usagetry {  const files = await storage.listFiles('docs');  files.forEach(file => console.log(file));} catch (error) {  console.error('ファイル一覧取得エラー:', error.message);}/
listFiles(directory: string): Promise<string[]>;

/**ファイルが存在するか確認します指定されたパスにファイルが存在するかどうかを確認します。ディレクトリの場合はfalseを返します。@param {string} path - ファイルパス@returns {Promise<boolean>} ファイルが存在する場合はtrue、それ以外はfalse@throws {Error} 確認中にエラーが発生した場合@usagetry {  const exists = await storage.fileExists('path/to/file.txt');  console.log('ファイルは存在' + (exists ? 'します' : 'しません'));} catch (error) {  console.error('ファイル存在確認エラー:', error.message);}/
fileExists(path: string): Promise<boolean>;

/**ディレクトリが存在するか確認します指定されたパスにディレクトリが存在するかどうかを確認します。ファイルの場合はfalseを返します。@param {string} path - ディレクトリパス@returns {Promise<boolean>} ディレクトリが存在する場合はtrue、それ以外はfalse@throws {Error} 確認中にエラーが発生した場合@usagetry {  const exists = await storage.directoryExists('path/to/dir');  console.log('ディレクトリは存在' + (exists ? 'します' : 'しません'));} catch (error) {  console.error('ディレクトリ存在確認エラー:', error.message);}/
directoryExists(path: string): Promise<boolean>;

/**ディレクトリを作成します指定されたパスにディレクトリを作成します。親ディレクトリが存在しない場合は再帰的に作成します。@param {string} path - ディレクトリパス@returns {Promise<void>} 処理完了後に解決するPromise@throws {Error} ディレクトリ作成中にエラーが発生した場合@usagetry {  await storage.createDirectory('path/to/new/dir');  console.log('ディレクトリが正常に作成されました');} catch (error) {  console.error('ディレクトリ作成エラー:', error.message);}/
createDirectory(path: string): Promise<void>;

/**ファイルを削除します指定されたパスのファイルを削除します。ファイルが存在しない場合は何もせず正常終了します。@param {string} path - ファイルパス@returns {Promise<void>} 処理完了後に解決するPromise@throws {Error} ファイル削除中にエラーが発生した場合@usagetry {  await storage.deleteFile('path/to/file.txt');  console.log('ファイルが正常に削除されました');} catch (error) {  console.error('ファイル削除エラー:', error.message);}/
deleteFile(path: string): Promise<void>;
}

/**GitHubストレージプロバイダーの設定オプションGitHubリポジトリをバックエンドとして使用するストレージプロバイダーの設定オプションを定義します。@role- GitHubStorageProviderクラスの初期化に必要なパラメータを定義- GitHub APIアクセスに必要な認証情報とリポジトリ設定を提供@usageconst options: GitHubStorageOptions = {  token: 'github_personal_access_token',  repo: 'username/repository',  branch: 'main',  baseDir: 'content'};const storage = new GitHubStorageProvider(options);

**@constructor:** function Object() { [native code] }

#### LocalStorageOptions (interface)

GitHubパーソナルアクセストークンGitHub APIにアクセスするための認証トークンです。リポジトリの読み書き権限が必要です。@type {string}@required/
token: string;

/**GitHubリポジトリ名'username/repo'形式のリポジトリ名です。例: 'octocat/Hello-World'@type {string}@required@format 'username/repo'/
repo: string;

/**GitHubブランチ名操作対象のブランチ名です。省略した場合は'main'が使用されます。@type {string}@optional@default 'main'/
branch: string;

/**ベースディレクトリパスリポジトリ内の操作対象となるベースディレクトリです。指定した場合、すべてのファイルパスはこのディレクトリからの相対パスとして解釈されます。省略した場合はリポジトリのルートが使用されます。@type {string}@optional/
baseDir?: string;
}

/**ローカルストレージプロバイダーの設定オプションローカルファイルシステムをバックエンドとして使用するストレージプロバイダーの設定オプションを定義します。@role- LocalStorageProviderクラスの初期化に必要なパラメータを定義- ファイルシステム操作の基準となるディレクトリ設定を提供@usageconst options: LocalStorageOptions = {  baseDir: './data'};const storage = new LocalStorageProvider(options);

**@constructor:** function Object() { [native code] }


---

### types.ts {#cnovel-automation-systemsrclibstoragetypests}

**Path:** `C:/novel-automation-system/src/lib/storage/types.ts`

@fileoverview ストレージ抽象化レイヤーの型定義（拡張版）@descriptionこのファイルは、ストレージ操作を抽象化するためのインターフェースと各ストレージプロバイダーの設定オプションの型定義を提供します。これらの型定義により、異なるストレージバックエンド間で一貫したAPIを提供することが可能になります。@role- ストレージ操作の統一インターフェースを定義- 各ストレージプロバイダーの設定オプションの型を定義- 型安全なストレージアクセスを提供@dependenciesなし（純粋な型定義ファイル）@used-by- ./index.ts - 型のエクスポートとストレージプロバイダーの作成- ./github-storage.ts - GitHubストレージプロバイダーの実装- ./local-storage.ts - ローカルストレージプロバイダーの実装- ./optimized-storage.ts - キャッシュを使用した最適化されたストレージプロバイダー- アプリケーション全体 - ストレージ操作のインターフェースとして

**@constructor:** function Object() { [native code] }

#### FileMetadata (interface)

@fileoverview ストレージ抽象化レイヤーの型定義（拡張版）@descriptionこのファイルは、ストレージ操作を抽象化するためのインターフェースと各ストレージプロバイダーの設定オプションの型定義を提供します。これらの型定義により、異なるストレージバックエンド間で一貫したAPIを提供することが可能になります。@role- ストレージ操作の統一インターフェースを定義- 各ストレージプロバイダーの設定オプションの型を定義- 型安全なストレージアクセスを提供@dependenciesなし（純粋な型定義ファイル）@used-by- ./index.ts - 型のエクスポートとストレージプロバイダーの作成- ./github-storage.ts - GitHubストレージプロバイダーの実装- ./local-storage.ts - ローカルストレージプロバイダーの実装- ./optimized-storage.ts - キャッシュを使用した最適化されたストレージプロバイダー- アプリケーション全体 - ストレージ操作のインターフェースとして/

/**ファイルのメタデータファイルに関する詳細情報を提供するインターフェースです。サイズ、作成日時、更新日時などのファイル属性を含みます。@role- ファイルに関する詳細情報を標準化された形式で提供- ファイル操作の前後でファイルの状態を確認するために使用@usage// ファイルメタデータの取得例const metadata = await storage.getFileMetadata('path/to/file.txt');console.log(`サイズ: ${metadata.size}バイト`);console.log(`更新日時: ${metadata.modifiedAt.toISOString()}`);

**@constructor:** function Object() { [native code] }

#### StorageProvider (interface)

ファイルパスストレージプロバイダーのベースディレクトリからの相対パスです。@type {string}/
path: string;

/**ファイルサイズ（バイト）ファイルのバイト単位のサイズです。@type {number}/
size: number;

/**作成日時ファイルが作成された日時です。@type {Date}/
createdAt: Date;

/**最終更新日時ファイルが最後に更新された日時です。@type {Date}/
modifiedAt: Date;

/**ディレクトリかどうかtrueの場合はディレクトリ、falseの場合はファイルを示します。@type {boolean}/
isDirectory: boolean;
}

/**ストレージプロバイダーのインターフェース異なるストレージバックエンド（GitHub、ローカルファイルシステムなど）間で一貫したファイル操作APIを提供するための共通インターフェースです。すべてのストレージプロバイダー実装はこのインターフェースに準拠する必要があります。@role- ファイルシステム操作の抽象化レイヤーを提供- 異なるストレージバックエンド間で一貫したAPIを確保- アプリケーションコードからストレージの実装詳細を隠蔽@implemented-by- GitHubStorageProvider - GitHubリポジトリをバックエンドとして使用- LocalStorageProvider - ローカルファイルシステムをバックエンドとして使用- OptimizedStorage - 基本ストレージプロバイダーにキャッシュ層を追加@usage// ストレージプロバイダーの使用例const storage: StorageProvider = new SomeStorageProvider(options);// ファイル読み込みconst content = await storage.readFile('path/to/file.txt');// ファイル書き込みawait storage.writeFile('path/to/file.txt', 'ファイル内容');

**@constructor:** function Object() { [native code] }

#### GitHubStorageOptions (interface)

ファイルを読み込みます指定されたパスのファイルを読み込み、その内容を文字列として返します。ファイルが存在しない場合は例外をスローします。@param {string} path - ファイルパス@returns {Promise<string>} ファイル内容の文字列@throws {Error} ファイルが存在しない場合@throws {Error} ファイル読み込み中にエラーが発生した場合@usagetry {  const content = await storage.readFile('path/to/file.txt');  console.log(content);} catch (error) {  console.error('ファイル読み込みエラー:', error.message);}/
readFile(path: string): Promise<string>;

/**ファイルを書き込みます指定されたパスにファイルを書き込みます。ファイルが存在しない場合は新規作成し、存在する場合は上書きします。必要に応じて親ディレクトリも作成します。@param {string} path - ファイルパス@param {string} content - 書き込む内容@returns {Promise<void>} 処理完了後に解決するPromise@throws {Error} ファイル書き込み中にエラーが発生した場合@usagetry {  await storage.writeFile('path/to/file.txt', 'ファイル内容');  console.log('ファイルが正常に書き込まれました');} catch (error) {  console.error('ファイル書き込みエラー:', error.message);}/
writeFile(path: string, content: string): Promise<void>;

/**ディレクトリ内のファイル一覧を取得します指定されたディレクトリ内のファイルパスのリストを返します。サブディレクトリは含まれません。ディレクトリが存在しない場合は空の配列を返します。@param {string} directory - ディレクトリパス@returns {Promise<string[]>} ファイルパスのリスト@throws {Error} ディレクトリ読み込み中にエラーが発生した場合@usagetry {  const files = await storage.listFiles('docs');  files.forEach(file => console.log(file));} catch (error) {  console.error('ファイル一覧取得エラー:', error.message);}/
listFiles(directory: string): Promise<string[]>;

/**ファイルが存在するか確認します指定されたパスにファイルが存在するかどうかを確認します。ディレクトリの場合はfalseを返します。@param {string} path - ファイルパス@returns {Promise<boolean>} ファイルが存在する場合はtrue、それ以外はfalse@throws {Error} 確認中にエラーが発生した場合@usagetry {  const exists = await storage.fileExists('path/to/file.txt');  console.log('ファイルは存在' + (exists ? 'します' : 'しません'));} catch (error) {  console.error('ファイル存在確認エラー:', error.message);}/
fileExists(path: string): Promise<boolean>;

/**ディレクトリが存在するか確認します指定されたパスにディレクトリが存在するかどうかを確認します。ファイルの場合はfalseを返します。@param {string} path - ディレクトリパス@returns {Promise<boolean>} ディレクトリが存在する場合はtrue、それ以外はfalse@throws {Error} 確認中にエラーが発生した場合@usagetry {  const exists = await storage.directoryExists('path/to/dir');  console.log('ディレクトリは存在' + (exists ? 'します' : 'しません'));} catch (error) {  console.error('ディレクトリ存在確認エラー:', error.message);}/
directoryExists(path: string): Promise<boolean>;

/**ディレクトリを作成します指定されたパスにディレクトリを作成します。親ディレクトリが存在しない場合は再帰的に作成します。@param {string} path - ディレクトリパス@returns {Promise<void>} 処理完了後に解決するPromise@throws {Error} ディレクトリ作成中にエラーが発生した場合@usagetry {  await storage.createDirectory('path/to/new/dir');  console.log('ディレクトリが正常に作成されました');} catch (error) {  console.error('ディレクトリ作成エラー:', error.message);}/
createDirectory(path: string): Promise<void>;

/**ファイルを削除します指定されたパスのファイルを削除します。ファイルが存在しない場合は何もせず正常終了します。@param {string} path - ファイルパス@returns {Promise<void>} 処理完了後に解決するPromise@throws {Error} ファイル削除中にエラーが発生した場合@usagetry {  await storage.deleteFile('path/to/file.txt');  console.log('ファイルが正常に削除されました');} catch (error) {  console.error('ファイル削除エラー:', error.message);}/
deleteFile(path: string): Promise<void>;

/**ファイルのメタデータを取得します指定されたパスのファイルに関するメタデータ情報を取得します。サイズ、作成日時、更新日時などの情報が含まれます。ファイルが存在しない場合はnullを返します。@param {string} path - ファイルパス@returns {Promise<FileMetadata | null>} ファイルメタデータまたはnull@throws {Error} メタデータ取得中にエラーが発生した場合@usagetry {  const metadata = await storage.getFileMetadata('path/to/file.txt');  if (metadata) {    console.log(`サイズ: ${metadata.size}バイト`);    console.log(`更新日時: ${metadata.modifiedAt.toISOString()}`);  } else {    console.log('ファイルが見つかりません');  }} catch (error) {  console.error('メタデータ取得エラー:', error.message);}/
getFileMetadata?(path: string): Promise<FileMetadata | null>;

/**ファイルを移動またはリネームします指定されたパスのファイルを別のパスに移動します。ファイルのリネームにも使用できます。移動先に既存のファイルがある場合は上書きします。必要に応じて移動先の親ディレクトリを作成します。@param {string} sourcePath - 元のファイルパス@param {string} targetPath - 移動先のパス@returns {Promise<void>} 処理完了後に解決するPromise@throws {Error} ファイル移動中にエラーが発生した場合@usagetry {  await storage.moveFile('path/to/old.txt', 'path/to/new.txt');  console.log('ファイルが正常に移動されました');} catch (error) {  console.error('ファイル移動エラー:', error.message);}/
moveFile?(sourcePath: string, targetPath: string): Promise<void>;

/**ファイルをコピーします指定されたパスのファイルを別のパスにコピーします。コピー先に既存のファイルがある場合は上書きします。必要に応じてコピー先の親ディレクトリを作成します。@param {string} sourcePath - 元のファイルパス@param {string} targetPath - コピー先のパス@returns {Promise<void>} 処理完了後に解決するPromise@throws {Error} ファイルコピー中にエラーが発生した場合@usagetry {  await storage.copyFile('path/to/original.txt', 'path/to/copy.txt');  console.log('ファイルが正常にコピーされました');} catch (error) {  console.error('ファイルコピーエラー:', error.message);}/
copyFile?(sourcePath: string, targetPath: string): Promise<void>;

/**ディレクトリ内のサブディレクトリ一覧を取得します指定されたディレクトリ内のサブディレクトリパスのリストを返します。ファイルは含まれません。ディレクトリが存在しない場合は空の配列を返します。@param {string} directory - ディレクトリパス@returns {Promise<string[]>} サブディレクトリパスのリスト@throws {Error} ディレクトリ読み込み中にエラーが発生した場合@usagetry {  const directories = await storage.listDirectories('content');  directories.forEach(dir => console.log(dir));} catch (error) {  console.error('ディレクトリ一覧取得エラー:', error.message);}/
listDirectories?(directory: string): Promise<string[]>;
}

/**GitHubストレージプロバイダーの設定オプションGitHubリポジトリをバックエンドとして使用するストレージプロバイダーの設定オプションを定義します。@role- GitHubStorageProviderクラスの初期化に必要なパラメータを定義- GitHub APIアクセスに必要な認証情報とリポジトリ設定を提供@usageconst options: GitHubStorageOptions = {  token: 'github_personal_access_token',  repo: 'username/repository',  branch: 'main',  baseDir: 'content'};const storage = new GitHubStorageProvider(options);

**@constructor:** function Object() { [native code] }

#### LocalStorageOptions (interface)

GitHubパーソナルアクセストークンGitHub APIにアクセスするための認証トークンです。リポジトリの読み書き権限が必要です。@type {string}@required/
token: string;

/**GitHubリポジトリ名'username/repo'形式のリポジトリ名です。例: 'octocat/Hello-World'@type {string}@required@format 'username/repo'/
repo: string;

/**GitHubブランチ名操作対象のブランチ名です。省略した場合は'main'が使用されます。@type {string}@optional@default 'main'/
branch: string;

/**ベースディレクトリパスリポジトリ内の操作対象となるベースディレクトリです。指定した場合、すべてのファイルパスはこのディレクトリからの相対パスとして解釈されます。省略した場合はリポジトリのルートが使用されます。@type {string}@optional/
baseDir?: string;
}

/**ローカルストレージプロバイダーの設定オプションローカルファイルシステムをバックエンドとして使用するストレージプロバイダーの設定オプションを定義します。@role- LocalStorageProviderクラスの初期化に必要なパラメータを定義- ファイルシステム操作の基準となるディレクトリ設定を提供@usageconst options: LocalStorageOptions = {  baseDir: './data',  createBaseDir: true,  backupEnabled: true,  logLevel: 'info'};const storage = new LocalStorageProvider(options);

**@constructor:** function Object() { [native code] }


---

### id-generator copy.ts {#cnovel-automation-systemsrclibutilsid-generator-copyts}

**Path:** `C:/novel-automation-system/src/lib/utils/#/id-generator copy.ts`

ユニークIDを生成@returns 生成されたID

**@constructor:** function Object() { [native code] }

#### generateId (function)

ユニークIDを生成@returns 生成されたID

**@constructor:** function Object() { [native code] }


---

### error-handler.ts {#cnovel-automation-systemsrclibutilserror-handlerts}

**Path:** `C:/novel-automation-system/src/lib/utils/error-handler.ts`

アプリケーション全体で使用するエラーハンドリング機能

**@constructor:** function Object() { [native code] }

#### AppError (class)

アプリケーション全体で使用するエラーハンドリング機能/

import { logger } from './logger';

export type LogMetadata = Record<string, unknown>;

/**アプリケーション固有のエラー基底クラス

**@constructor:** function Object() { [native code] }

#### Methods of AppError

##### AppError.constructor (method)

エラーコード/
public readonly code: string;

/**HTTPステータスコード/
public readonly statusCode: number;

/**追加詳細情報/
public readonly details?: Record<string, unknown>;

/**エラーを初期化@param message エラーメッセージ@param code エラーコード@param statusCode HTTPステータスコード@param details 追加詳細情報

**@constructor:** function Object() { [native code] }

#### ValidationError (class)

エラーコード/
public readonly code: string;

/**HTTPステータスコード/
public readonly statusCode: number;

/**追加詳細情報/
public readonly details?: Record<string, unknown>;

/**エラーを初期化@param message エラーメッセージ@param code エラーコード@param statusCode HTTPステータスコード@param details 追加詳細情報/
constructor(
message: string,
code = 'INTERNAL_ERROR',
statusCode = 500,
details?: Record<string, unknown>
) {
super(message);
this.name = this.constructor.name;
this.code = code;
this.statusCode = statusCode;
this.details = details;

// Error スタックトレースを正しく設定
Error.captureStackTrace(this, this.constructor);
}
}

/**バリデーションエラー

**@constructor:** function Object() { [native code] }

#### NotFoundError (class)

リソースが見つからないエラー

**@constructor:** function Object() { [native code] }

#### ForbiddenError (class)

権限エラー

**@constructor:** function Object() { [native code] }

#### ExternalServiceError (class)

外部サービスのエラー

**@constructor:** function Object() { [native code] }

#### RateLimitError (class)

レート制限エラー

**@constructor:** function Object() { [native code] }

#### logError (function)

エラーのスタックトレースとメタデータをログ出力@param error エラーオブジェクトまたは任意のエラー値@param metadata 追加メタデータ@param message オプションのカスタムエラーメッセージ

**@constructor:** function Object() { [native code] }

#### formatErrorResponse (function)

エラーをAPIレスポンス形式に変換@param error エラーオブジェクト@returns APIレスポンス形式のエラーオブジェクト

**@constructor:** function Object() { [native code] }

#### withErrorHandling (function)

API関数のエラーハンドリングをラップする高階関数@param fn API関数@returns ラップされた関数

**@constructor:** function Object() { [native code] }

#### logWarn (function)

警告をログに記録する@param message 警告メッセージ@param error エラーオブジェクトまたは任意のエラー値@param metadata 追加メタデータ

**@constructor:** function Object() { [native code] }

#### getErrorMessage (function)

未知のエラーから安全にメッセージを抽出

**@constructor:** function Object() { [native code] }


---

### helpers.ts {#cnovel-automation-systemsrclibutilshelpersts}

**Path:** `C:/novel-automation-system/src/lib/utils/helpers.ts`

汎用ヘルパー関数

**@constructor:** function Object() { [native code] }

#### sleep (function)

汎用ヘルパー関数/

/**指定ミリ秒間スリープする@param ms スリープ時間（ミリ秒）@returns Promise

**@constructor:** function Object() { [native code] }

#### retry (function)

指定回数まで関数の実行を再試行する@param fn 実行する関数@param retries 最大再試行回数@param delay 再試行の間隔（ミリ秒）@param backoff 再試行ごとの遅延倍率@returns 関数の実行結果

**@constructor:** function Object() { [native code] }

#### parseYaml (function)

オブジェクトの深いクローンを作成@param obj クローン対象のオブジェクト@returns クローンされたオブジェクト/
//   export function deepClone<T>(obj: T): T {
//     return JSON.parse(JSON.stringify(obj));
//   }

// より安全な深いクローンを実装
// JSON.parse(JSON.stringify(obj)) は関数やundefinedを失うため、注意が必要
export function deepClone<T>(obj: T): T {
if (obj === null || typeof obj !== 'object') {
return obj;
}

if (Array.isArray(obj)) {
return obj.map(item => deepClone(item)) as unknown as T;
}

const cloned = {} as Record<string, any>;
Object.keys(obj as Record<string, any>).forEach(key => {
cloned[key] = deepClone((obj as Record<string, any>)[key]);
});

return cloned as T;
}

/**YAMLデータをJavaScriptオブジェクトにパース@param yamlString YAMLデータ文字列@returns パースされたオブジェクト

**@constructor:** function Object() { [native code] }

#### stringifyYaml (function)

JavaScriptオブジェクトをYAML文字列に変換@param data 変換対象のオブジェクト@returns YAML文字列

**@constructor:** function Object() { [native code] }

#### formatDate (function)

ランダムなIDを生成@param prefix IDの接頭辞@returns ランダムなID/
// export function generateId(prefix = ''): string {
//     const timestamp = Date.now().toString(36);
//     const randomStr = Math.random().toString(36).substring(2, 10);
//     return `${prefix}${timestamp}${randomStr}`;
// }

export function generateId(length: number = 16): string {
return randomBytes(Math.ceil(length / 2))
.toString('hex')
.slice(0, length);
}

/**日付を YYYY-MM-DD 形式の文字列に変換する@param date 日付オブジェクト（デフォルト: 現在の日付）@returns フォーマットされた日付文字列

**@constructor:** function Object() { [native code] }

#### sortByDate (function)

オブジェクトを日付でソートする@param array ソートする配列@param dateField 日付フィールドのキー@param ascending 昇順にソートするかどうか（デフォルト: false = 降順）@returns ソートされた配列

**@constructor:** function Object() { [native code] }

#### chunkArray (function)

データを指定されたチャンクサイズに分割@param array 分割対象の配列@param chunkSize チャンクサイズ@returns 分割された配列の配列

**@constructor:** function Object() { [native code] }

#### truncateText (function)

文字列の文字数を制限する@param text 制限する文字列@param limit 最大文字数@param suffix 制限された場合に追加するサフィックス（デフォルト: '...'）@returns 制限された文字列

**@constructor:** function Object() { [native code] }

#### summarizeText (function)

文字列から要約を生成する@param text 元の文字列@param sentenceCount 要約に含める文の数（デフォルト: 3）@returns 要約された文字列

**@constructor:** function Object() { [native code] }

#### removeNullish (function)

オブジェクトからnullとundefinedのプロパティを除去@param obj 対象オブジェクト@returns nullとundefinedが除去されたオブジェクト

**@constructor:** function Object() { [native code] }

#### groupBy (function)

指定されたキーで配列をグループ化@param array グループ化する配列@param keyFn キーを取得する関数@returns グループ化されたオブジェクト

**@constructor:** function Object() { [native code] }

#### objectDiff (function)

2つのオブジェクトの差分を取得@param obj1 比較元オブジェクト@param obj2 比較先オブジェクト@returns 差分オブジェクト

**@constructor:** function Object() { [native code] }

#### truncateByWords (function)

文字列を単語数制限で切り詰める@param text 元の文字列@param wordLimit 単語数制限@param suffix 切り詰め時に追加する接尾辞@returns 切り詰められた文字列

**@constructor:** function Object() { [native code] }


---

### id-generator.ts {#cnovel-automation-systemsrclibutilsid-generatorts}

**Path:** `C:/novel-automation-system/src/lib/utils/id-generator.ts`

ユニークIDを生成@returns 生成されたID

**@constructor:** function Object() { [native code] }

#### generateId (function)

ユニークIDを生成@returns 生成されたID

**@constructor:** function Object() { [native code] }


---

### logger.ts {#cnovel-automation-systemsrclibutilsloggerts}

**Path:** `C:/novel-automation-system/src/lib/utils/logger.ts`

アプリケーション全体で使用するロガー

**@constructor:** function Object() { [native code] }

#### Logger (class)

ロガークラス

**@constructor:** function Object() { [native code] }

#### Methods of Logger

##### Logger.constructor (method)

ロガーを初期化@param options ロガーオプション

**@constructor:** function Object() { [native code] }

##### Logger.shouldLog (method)

ログレベルの重要度をチェック@param level チェックするログレベル@returns 出力すべき場合はtrue

**@constructor:** function Object() { [native code] }

##### Logger.createLogEntry (method)

ログエントリを作成@param level ログレベル@param message ログメッセージ@param metadata メタデータ@returns ログエントリ

**@constructor:** function Object() { [native code] }

##### Logger.output (method)

ログエントリを出力@param entry ログエントリ

**@constructor:** function Object() { [native code] }

##### Logger.debug (method)

デバッグレベルのログを出力@param message メッセージ@param metadata メタデータ

**@constructor:** function Object() { [native code] }

##### Logger.info (method)

情報レベルのログを出力@param message メッセージ@param metadata メタデータ

**@constructor:** function Object() { [native code] }

##### Logger.warn (method)

警告レベルのログを出力@param message メッセージ@param metadata メタデータ

**@constructor:** function Object() { [native code] }

##### Logger.error (method)

エラーレベルのログを出力@param message メッセージ@param metadata メタデータ

**@constructor:** function Object() { [native code] }

##### Logger.updateOptions (method)

内部設定を変更@param options 更新するオプション

**@constructor:** function Object() { [native code] }

#### LogLevel (enum)

アプリケーション全体で使用するロガー/

/**ログレベルの定義

**@constructor:** function Object() { [native code] }

#### LogMetadata (type)

ログのメタデータ型

**@constructor:** function Object() { [native code] }

#### LogEntry (interface)

ログエントリの型

**@constructor:** function Object() { [native code] }

#### LoggerOptions (interface)

ロガーのオプション

**@constructor:** function Object() { [native code] }

#### DEFAULT_OPTIONS (variable)

デフォルトのロガーオプション

**@constructor:** function Object() { [native code] }


---

### yaml-helper.ts {#cnovel-automation-systemsrclibutilsyaml-helperts}

**Path:** `C:/novel-automation-system/src/lib/utils/yaml-helper.ts`

YAMLテキストをJavaScriptオブジェクトにパースする@param text パースするYAMLテキスト@returns パースされたオブジェクト

**@constructor:** function Object() { [native code] }

#### parseYaml (function)

YAMLテキストをJavaScriptオブジェクトにパースする@param text パースするYAMLテキスト@returns パースされたオブジェクト

**@constructor:** function Object() { [native code] }

#### stringifyYaml (function)

JavaScriptオブジェクトをYAML形式の文字列に変換する@param data 変換するオブジェクト@returns YAML文字列

**@constructor:** function Object() { [native code] }

#### mergeYamlArrays (function)

YAML配列をマージする@param target マージ先の配列@param source マージ元の配列@param key 一意なキーとして使用するプロパティ名@returns マージされた配列

**@constructor:** function Object() { [native code] }

#### getNestedYamlProperty (function)

ネストされたYAMLオブジェクトから指定パスのプロパティを安全に取得する@param obj 対象オブジェクト@param path ドット区切りのプロパティパス (例: "user.profile.name")@param defaultValue プロパティが存在しない場合のデフォルト値@returns プロパティの値またはデフォルト値

**@constructor:** function Object() { [native code] }


---

### consistency-checker copy.ts {#cnovel-automation-systemsrclibvalidationconsistency-checker-copyts}

**Path:** `C:/novel-automation-system/src/lib/validation/consistency-checker copy.ts`

チャプターの一貫性をチェック@param chapter チャプター@param memories オプションの関連記憶配列@returns 一貫性チェック結果

**@constructor:** function Object() { [native code] }


---

### consistency-checker.ts {#cnovel-automation-systemsrclibvalidationconsistency-checkerts}

**Path:** `C:/novel-automation-system/src/lib/validation/consistency-checker.ts`

チャプターの一貫性をチェック@param chapter チャプター@param memories オプションの関連記憶配列@returns 一貫性チェック結果

**@constructor:** function Object() { [native code] }


---

### analysis.ts {#cnovel-automation-systemsrctypesanalysists}

**Path:** `C:/novel-automation-system/src/types/analysis.ts`

分析機能に関連する型定義

**@constructor:** function Object() { [native code] }

#### QualityAnalysis (interface)

分析機能に関連する型定義/

/**品質分析結果

**@constructor:** function Object() { [native code] }

#### ReadabilityScore (interface)

総合スコア (0-1) */
overallScore: number;

/** 読みやすさスコア */
readability: ReadabilityScore;

/** 引き込み度スコア */
engagement: EngagementScore;

/** 一貫性スコア */
consistency: ConsistencyScore;

/** オリジナリティスコア */
originality: OriginalityScore;

/** 感情的インパクトスコア */
emotionalImpact: EmotionalImpactScore;

/** 改善提案 */
recommendations: string[];
}

/**読みやすさスコア

**@constructor:** function Object() { [native code] }

#### EngagementScore (interface)

総合スコア (0-1) */
score: number;

/** 詳細スコア */
details: {
/** 文の複雑さ (0-1) */
sentenceComplexity?: number;

/** 語彙レベル (0-1) */
vocabularyLevel?: number;

/** 文章の流れ (0-1) */
flowScore?: number;

/** 段落構造 (0-1) */
paragraphStructure?: number;

/** その他の詳細スコア */
[key: string]: number | undefined;
};
}

/**引き込み度スコア

**@constructor:** function Object() { [native code] }

#### ConsistencyScore (interface)

総合スコア (0-1) */
score: number;

/** 詳細スコア */
details: {
/** テンション曲線 (0-1) */
tensionCurve?: number;

/** ペーシング (0-1) */
pacing?: number;

/** 驚き要素 (0-1) */
surpriseFactor?: number;

/** キャラクター関与度 (0-1) */
characterInvolvement?: number;

/** その他の詳細スコア */
[key: string]: number | undefined;
};
}

/**一貫性スコア

**@constructor:** function Object() { [native code] }

#### OriginalityScore (interface)

総合スコア (0-1) */
score: number;

/** 詳細スコア */
details: {
/** 短期一貫性 (0-1) */
shortTermScore: number;

/** 長期一貫性 (0-1) */
longTermScore: number;

/** キャラクター一貫性 (0-1) */
characterScore: number;

/** 世界観一貫性 (0-1) */
worldBuildingScore: number;

/** その他の詳細スコア */
[key: string]: number;
};
}

/**オリジナリティスコア

**@constructor:** function Object() { [native code] }

#### EmotionalImpactScore (interface)

総合スコア (0-1) */
score: number;

/** 詳細スコア */
details: {
/** 表現の新鮮さ (0-1) */
expressionFreshness: number;

/** プロットのオリジナリティ (0-1) */
plotOriginality: number;

/** キャラクターのオリジナリティ (0-1) */
characterOriginality: number;

/** 世界観のオリジナリティ (0-1) */
worldBuildingOriginality: number;

/** その他の詳細スコア */
[key: string]: number;
};
}

/**感情的インパクトスコア

**@constructor:** function Object() { [native code] }

#### PerformanceMetrics (interface)

総合スコア (0-1) */
score: number;

/** 詳細スコア */
details: {
/** 感情の強度 (0-1) */
emotionalIntensity: number;

/** 感情の変化 (0-1) */
emotionalVariation: number;

/** 共感度 (0-1) */
empathyFactor: number;

/** 記憶に残る度合い (0-1) */
memorabilityFactor: number;

/** その他の詳細スコア */
[key: string]: number;
};
}

/**パフォーマンスメトリクス

**@constructor:** function Object() { [native code] }

#### SpeedMetrics (interface)

生成速度メトリクス */
generationSpeed: SpeedMetrics;

/** メモリ使用量 */
memoryUsage: {
/** 平均使用量（MB） */
average: number;

/** ピーク使用量（MB） */
peak: number;

/** 傾向 */
trend: 'INCREASING' | 'STABLE' | 'DECREASING';

/** 現在の使用量 */
current?: {
/** 合計（MB） */
total: number;

/** 使用中（MB） */
used: number;

/** 外部使用量（MB） */
external: number;
};

/** 履歴 */
history?: Array<{
/** タイムスタンプ */
timestamp: Date;

/** 使用量（MB） */
used: number;
}>;
};

/** API遅延メトリクス */
apiLatency: LatencyMetrics;

/** キャッシュ効率 */
cacheEfficiency: CacheMetrics;

/** エラー率 */
errorRate: {
/** 全体のエラー率 */
overall: number;

/** タイプ別エラー率 */
byType: Record<string, { count: number, rate: number }>;

/** 重大度別エラー率 */
bySeverity?: Record<string, number>;

/** 傾向 */
trend?: string;

/** 推奨事項 */
recommendations?: string[];

/** サンプル */
samples?: any[];
};
}

/**速度メトリクス

**@constructor:** function Object() { [native code] }

#### LatencyMetrics (interface)

平均生成時間（ms） */
averageTime: number;

/** トークン毎秒 */
tokenPerSecond: number;

/** 効率（0-1） */
efficiency: number;

/** 傾向 */
trend?: 'IMPROVING' | 'STABLE' | 'DECLINING';

/** 最近の履歴 */
recentHistory?: SpeedMetrics[];
}

/**遅延メトリクス

**@constructor:** function Object() { [native code] }

#### CacheMetrics (interface)

平均遅延（ms） */
average: number;

/** 95パーセンタイル遅延（ms） */
p95: number;

/** 内訳 */
breakdown: Record<string, {
/** 平均（ms） */
average: number;

/** 95パーセンタイル（ms） */
p95: number;

/** 最小値（ms） */
min?: number;

/** 最大値（ms） */
max?: number;

/** 呼び出し回数 */
count?: number;
}>;

/** 傾向 */
trend?: 'IMPROVING' | 'STABLE' | 'DEGRADING';
}

/**キャッシュメトリクス

**@constructor:** function Object() { [native code] }


---

### api.ts {#cnovel-automation-systemsrctypesapits}

**Path:** `C:/novel-automation-system/src/types/api.ts`

API関連の型定義

**@constructor:** function Object() { [native code] }

#### ApiResponse (interface)

API関連の型定義/

import { Chapter, GenerationOptions, ValidationResult } from './generation★';
import { Character, PromotionEvaluation } from './characters';
import { SearchResult, MemoryHierarchy } from './memory★';

/**API共通レスポンス形式

**@constructor:** function Object() { [native code] }

#### GenerateChapterRequest (interface)

成功フラグ */
success: boolean;

/** データペイロード */
data?: T;

/** エラー情報 */
error?: {
code: string;
message: string;
details?: Record<string, unknown>;
};

/** メタデータ */
meta?: {
page?: number;
limit?: number;
total?: number;
};
}

/**チャプター生成リクエスト

**@constructor:** function Object() { [native code] }

#### GenerateChapterResponse (interface)

生成オプション */
options?: GenerationOptions;
}

/**チャプター生成レスポンス

**@constructor:** function Object() { [native code] }

#### CreateCharacterRequest (interface)

生成されたチャプター */
chapter: Chapter;

/** 生成メトリクス */
metrics: {
/** 生成時間 (ms) */
generationTime: number;

/** 品質スコア */
qualityScore: number;

/** 修正回数 */
correctionCount: number;
};
}

/**キャラクター作成リクエスト

**@constructor:** function Object() { [native code] }

#### CreateCharacterResponse (interface)

キャラクター名 */
name: string;

/** キャラクタータイプ */
type: 'MAIN' | 'SUB' | 'MOB';

/** 性格 */
personality: {
traits: string[];
speechPatterns: string[];
quirks: string[];
values: string[];
};

/** バックストーリー */
backstory: {
summary: string;
significantEvents: string[];
origin: string;
};

/** 役割 (オプション) */
role?: 'PROTAGONIST' | 'ANTAGONIST' | 'MENTOR' | 'ALLY' | 'RIVAL' | 'OTHER';
}

/**キャラクター作成レスポンス

**@constructor:** function Object() { [native code] }

#### PromoteCharacterRequest (interface)

作成されたキャラクター */
character: Character;
}

/**キャラクター昇格リクエスト

**@constructor:** function Object() { [native code] }

#### PromoteCharacterResponse (interface)

キャラクターID */
characterId: string;

/** 目標タイプ */
targetType: 'SUB' | 'MAIN';

/** バックストーリー詳細 (オプション) */
backstoryDetails?: {
summary?: string;
significantEvents?: string[];
};
}

/**キャラクター昇格レスポンス

**@constructor:** function Object() { [native code] }

#### MemorySearchRequest (interface)

成功フラグ */
success: boolean;

/** 更新されたキャラクター */
character: Character;

/** 昇格詳細 */
promotionDetails: {
/** 元のタイプ */
previousType: 'MOB' | 'SUB';

/** 新しいタイプ */
newType: 'SUB' | 'MAIN';

/** 推奨される登場チャプター */
recommendedAppearance?: number;
};
}

/**記憶検索リクエスト

**@constructor:** function Object() { [native code] }

#### MemorySearchResponse (interface)

検索クエリ */
query: string;

/** 検索対象記憶タイプ (オプション) */
types?: ('SHORT_TERM' | 'MID_TERM' | 'LONG_TERM')[];

/** 結果制限 */
limit?: number;
}

/**記憶検索レスポンス

**@constructor:** function Object() { [native code] }

#### ValidateChapterRequest (interface)

検索結果 */
results: SearchResult[];

/** 関連性スコア */
relevanceScores: {
term: string;
score: number;
}[];

/** インサイト */
insights: {
type: string;
description: string;
}[];
}

/**チャプター検証リクエスト

**@constructor:** function Object() { [native code] }

#### ValidateChapterResponse (interface)

チャプター内容 */
content: string;

/** チャプター番号 */
chapterNumber: number;
}

/**チャプター検証レスポンス

**@constructor:** function Object() { [native code] }


---

### chapters.ts {#cnovel-automation-systemsrctypeschaptersts}

**Path:** `C:/novel-automation-system/src/types/chapters.ts`

チャプター情報

**@constructor:** function Object() { [native code] }

#### Chapter (interface)

チャプター情報

**@constructor:** function Object() { [native code] }

#### ChapterMetadata (interface)

チャプターID/
id: string;

/**チャプタータイトル/
title: string;

/**チャプター番号/
chapterNumber: number;

/**チャプター本文/
content: string;

/**単語数/
wordCount?: number;

/**作成日時/
createdAt: Date;

/**最終更新日時/
updatedAt: Date;

/**チャプター要約/
summary?: string;

/**シーン情報/
scenes?: Scene[];

/**分析情報/
analysis?: ChapterAnalysis;

/**メタデータ/
metadata: ChapterMetadata;
}


/**チャプターメタデータ

**@constructor:** function Object() { [native code] }


---

### characters copy.ts {#cnovel-automation-systemsrctypescharacters-copyts}

**Path:** `C:/novel-automation-system/src/types/characters copy.ts`

キャラクターに関連する型定義

**@constructor:** function Object() { [native code] }

#### CharacterType (type)

キャラクターに関連する型定義/

/**キャラクターの種類を表す型MAIN: メインキャラクターSUB: サブキャラクターMOB: モブキャラクター

**@constructor:** function Object() { [native code] }

#### CharacterRole (type)

キャラクターの役割を表す型

**@constructor:** function Object() { [native code] }

#### PersonalityTraits (interface)

性格特性の定義

**@constructor:** function Object() { [native code] }

#### Appearance (interface)

特性のリスト（例: "勇敢", "慎重", "明るい"など） */
traits: string[];

/** 言葉使いや話し方のパターン */
speechPatterns: string[];

/** 特徴的な癖や習慣 */
quirks: string[];

/** 重要視する価値観 */
values: string[];
}

/**キャラクターの外見に関する定義

**@constructor:** function Object() { [native code] }

#### Backstory (interface)

物理的特徴の説明 */
physicalDescription: string;

/** 特徴的な衣装や装飾品 */
clothing: string;

/** 際立った特徴 */
distinguishingFeatures: string[];
}

/**キャラクターの背景設定

**@constructor:** function Object() { [native code] }

#### Relationship (interface)

背景の概要 */
summary: string;

/** 重要な過去の出来事 */
significantEvents: string[];

/** 過去のトラウマや影響を受けた出来事 */
trauma?: string[];

/** 生い立ちに関する情報 */
origin: string;
}

/**キャラクター間の関係性

**@constructor:** function Object() { [native code] }

#### DevelopmentStage (interface)

関係のある相手のキャラクターID */
targetCharacterId: string;

/** 関係の種類（例: "友人", "恋人", "敵対者"など） */
type: string;

/** 関係の強さ（1-10） */
strength: number;

/** 関係の説明 */
description: string;
}

/**キャラクターの成長段階

**@constructor:** function Object() { [native code] }

#### AppearanceHistory (interface)

現在の成長段階 */
current: string;

/** 次の成長段階への条件 */
nextStageConditions: string[];

/** これまでの成長の軌跡 */
history: string[];
}

/**キャラクターの登場履歴

**@constructor:** function Object() { [native code] }

#### Character (interface)

初登場のチャプター番号 */
firstAppearance: number;

/** 登場したチャプターのリスト */
chapters: number[];

/** 各チャプターでの重要度（チャプター番号: 重要度） */
significance: Record<number, number>;
}

/**キャラクター情報の完全な定義

**@constructor:** function Object() { [native code] }

#### CreateCharacterInput (type)

一意のキャラクターID */
id: string;

/** キャラクター名 */
name: string;

/** キャラクターの種類 */
type: CharacterType;

/** キャラクターの役割 */
role: CharacterRole;

/** 性格特性 */
personality: PersonalityTraits;

/** 外見 */
appearance: Appearance;

/** 背景設定 */
backstory: Backstory;

/** 他キャラクターとの関係性 */
relationships: Relationship[];

/** 成長段階 */
developmentStage: DevelopmentStage;

/** 登場履歴 */
appearanceHistory: AppearanceHistory;

/** キャラクター作成日時 */
createdAt: Date;

/** 最終更新日時 */
updatedAt: Date;
}

/**新規キャラクター作成時の入力データ

**@constructor:** function Object() { [native code] }

#### PromotionEvaluation (interface)

キャラクター昇格の評価結果

**@constructor:** function Object() { [native code] }


---

### characters.ts {#cnovel-automation-systemsrctypescharactersts}

**Path:** `C:/novel-automation-system/src/types/characters.ts`

キャラクターに関連する型定義

**@constructor:** function Object() { [native code] }

#### CharacterType (type)

キャラクターに関連する型定義/

/**キャラクターの種類を表す型MAIN: メインキャラクターSUB: サブキャラクターMOB: モブキャラクター

**@constructor:** function Object() { [native code] }

#### CharacterRole (type)

キャラクターの役割を表す型

**@constructor:** function Object() { [native code] }

#### EmotionalState (type)

感情状態を表す型

**@constructor:** function Object() { [native code] }

#### EmotionalStateValues (variable)

感情状態の定数

**@constructor:** function Object() { [native code] }

#### RelationshipType (type)

関係性の種類を表す型

**@constructor:** function Object() { [native code] }

#### PersonalityTraits (interface)

性格特性の定義

**@constructor:** function Object() { [native code] }

#### Appearance (interface)

特性のリスト（例: "勇敢", "慎重", "明るい"など） */
traits: string[];

/** 言葉使いや話し方のパターン */
speechPatterns: string[];

/** 特徴的な癖や習慣 */
quirks: string[];

/** 重要視する価値観 */
values: string[];

/** 動的な性格特性（発展処理で使用） */
[key: string]: any;
}

/**キャラクターの外見に関する定義

**@constructor:** function Object() { [native code] }

#### Backstory (interface)

物理的特徴の説明 */
physicalDescription: string;

/** 特徴的な衣装や装飾品 */
clothing: string;

/** 際立った特徴 */
distinguishingFeatures: string[];
}

/**キャラクターの背景設定

**@constructor:** function Object() { [native code] }

#### Relationship (interface)

背景の概要 */
summary: string;

/** 重要な過去の出来事 */
significantEvents: string[];

/** 過去のトラウマや影響を受けた出来事 */
trauma?: string[];

/** 生い立ちに関する情報 */
origin: string;

/** 詳細な歴史 (昇格時に生成) */
detailedHistory?: string;

/** 動機 (昇格時に生成) */
motivations?: string;

/** 秘密 (昇格時に生成) */
secrets?: string;
}

/**キャラクター間の関係性

**@constructor:** function Object() { [native code] }

#### Appearance (interface)

関係のある相手のキャラクターID */
targetId: string;

/** 関係の種類 */
type: RelationshipType;

/** 関係の強さ（0-1） */
strength: number;

/** 関係の説明 */
description?: string;

/** 最後のインタラクション */
lastInteraction?: Date;

/** 関係の履歴 */
history?: any[];
}

/**登場記録

**@constructor:** function Object() { [native code] }

#### Interaction (interface)

インタラクション記録

**@constructor:** function Object() { [native code] }

#### DevelopmentMilestone (interface)

発展マイルストーン

**@constructor:** function Object() { [native code] }

#### CharacterHistory (interface)

キャラクターの履歴

**@constructor:** function Object() { [native code] }

#### CharacterState (interface)

キャラクターの状態

**@constructor:** function Object() { [native code] }

#### PromotionRecord (interface)

昇格履歴

**@constructor:** function Object() { [native code] }

#### CharacterMetadata (interface)

キャラクターメタデータ

**@constructor:** function Object() { [native code] }

#### Character (interface)

キャラクター情報の完全な定義

**@constructor:** function Object() { [native code] }

#### CharacterData (interface)

一意のキャラクターID */
id: string;

/** キャラクター名 */
name: string;

description: string; // ✅ ここを必ず追加！

/** キャラクターの種類 */
type: CharacterType;

/** キャラクターの役割 */
role?: CharacterRole;

/** 性格特性 */
personality?: PersonalityTraits;

/** 外見 */
appearance?: Appearance;

/** 背景設定 */
backstory?: Backstory;

/** 他キャラクターとの関係性 */
relationships?: Relationship[];

/** キャラクターの状態 */
state: CharacterState;

/** キャラクターの履歴 */
history: CharacterHistory;

/** 昇格履歴 */
promotionHistory?: PromotionRecord[];

/** メタデータ */
metadata: CharacterMetadata;
}

/**キャラクター作成時のデータ

**@constructor:** function Object() { [native code] }

#### CharacterMetrics (interface)

キャラクター評価メトリクス

**@constructor:** function Object() { [native code] }

#### PromotionEvaluation (interface)

キャラクター昇格の評価結果

**@constructor:** function Object() { [native code] }

#### CharacterCluster (interface)

昇格の適格性 */
eligible: boolean;

/** 目標キャラクタータイプ */
targetType: CharacterType | null;

/** 昇格スコア */
score: number;

/** 評価レコメンデーション */
recommendation: string;
}

/**キャラクタークラスター

**@constructor:** function Object() { [native code] }

#### RelationshipTension (interface)

関係性の対立

**@constructor:** function Object() { [native code] }

#### RelationshipAnalysis (interface)

関係性分析

**@constructor:** function Object() { [native code] }

#### DevelopmentImpact (interface)

発展影響

**@constructor:** function Object() { [native code] }

#### CharacterDevelopment (interface)

キャラクター発展

**@constructor:** function Object() { [native code] }

#### DevelopmentPath (interface)

発展経路

**@constructor:** function Object() { [native code] }

#### ChapterEvent (interface)

チャプターイベント

**@constructor:** function Object() { [native code] }

#### TimingFactor (interface)

タイミング要因

**@constructor:** function Object() { [native code] }

#### TimingAnalysis (interface)

タイミング分析

**@constructor:** function Object() { [native code] }

#### TimingRecommendation (interface)

タイミング推奨

**@constructor:** function Object() { [native code] }

#### StoryContext (interface)

ストーリーコンテキスト

**@constructor:** function Object() { [native code] }

#### DevelopmentPathPhase (type)

キャラクター発展経路のフェーズを表す型

**@constructor:** function Object() { [native code] }

#### ArcType (type)

変容アークのタイプを表す型

**@constructor:** function Object() { [native code] }

#### TransformationArc (interface)

変容アーク情報

**@constructor:** function Object() { [native code] }

#### GrowthEvent (interface)

成長イベント情報

**@constructor:** function Object() { [native code] }

#### Milestone (interface)

発展マイルストーン情報

**@constructor:** function Object() { [native code] }


---

### correction.ts {#cnovel-automation-systemsrctypescorrectionts}

**Path:** `C:/novel-automation-system/src/types/correction.ts`

自動修正システムに関連する型定義

**@constructor:** function Object() { [native code] }

#### SeverityLevel (type)

自動修正システムに関連する型定義/

import { Chapter } from './chapters';

/**不整合の深刻度

**@constructor:** function Object() { [native code] }

#### CorrectionType (type)

修正タイプ

**@constructor:** function Object() { [native code] }

#### InconsistencyIssue (interface)

不整合問題テキスト内で検出された一貫性、論理性、表現などの問題を表す

**@constructor:** function Object() { [native code] }

#### ReplaceCorrection (interface)

不整合の種類 */
type: string;

/** 不整合の説明 */
description: string;

/** 不整合の位置 (テキスト内のインデックス) */
position?: number;

/** 不整合部分のテキスト */
target?: string;

/** 修正の提案 */
suggestion?: string;

/** 深刻度 */
severity: SeverityLevel;

/** 関連するキャラクターID (キャラクター問題の場合) */
characterId?: string;

/** 関連するキャラクター名 (キャラクター問題の場合) */
characterName?: string;

/** 関連するイベントID (プロット問題の場合) */
event?: string;
}

/**置換修正テキストの一部を別のテキストに置き換える修正

**@constructor:** function Object() { [native code] }

#### InsertCorrection (interface)

挿入修正指定位置に新しいテキストを挿入する修正

**@constructor:** function Object() { [native code] }

#### DeleteCorrection (interface)

削除修正指定範囲のテキストを削除する修正

**@constructor:** function Object() { [native code] }

#### Correction (type)

修正テキストに対する修正操作

**@constructor:** function Object() { [native code] }

#### CorrectionResult (interface)

修正結果不整合検出と修正適用の結果

**@constructor:** function Object() { [native code] }

#### CorrectionHistoryEntry (interface)

元のチャプター */
originalChapter: Chapter;

/** 修正後のチャプター */
correctedChapter: Chapter;

/** 検出された不整合 */
issues: InconsistencyIssue[];

/** 適用された修正 */
appliedCorrections: Correction[];

/** 却下された修正 */
rejectedCorrections: Correction[];
}

/**修正履歴エントリ

**@constructor:** function Object() { [native code] }

#### CharacterInstance (interface)

タイムスタンプ */
timestamp: Date;

/** 修正リスト */
corrections: {
type: string;
description: string;
}[];
}

/**キャラクターインスタンスチャプター内のキャラクター出現に関する情報

**@constructor:** function Object() { [native code] }

#### PlotEvent (interface)

キャラクターID */
characterId: string;

/** キャラクター名 */
characterName: string;

/** 出現位置 */
position: number;

/** 周辺テキスト */
context: string;

/** 性格描写 */
personality: Record<string, any>;

/** 行動描写 */
behavior: any[];

/** セリフ内容 */
dialogue: string[];

/** 能力描写 */
abilities: string[];
}

/**プロットイベントストーリー内の重要なイベント

**@constructor:** function Object() { [native code] }


---

### editor.ts {#cnovel-automation-systemsrctypeseditorts}

**Path:** `C:/novel-automation-system/src/types/editor.ts`

編集者インターフェースに関連する型定義

**@constructor:** function Object() { [native code] }

#### InterventionType (type)

編集者インターフェースに関連する型定義/

/**介入タイプ

**@constructor:** function Object() { [native code] }

#### InterventionTarget (type)

介入ターゲット

**@constructor:** function Object() { [native code] }

#### InterventionRequest (interface)

編集者介入リクエスト

**@constructor:** function Object() { [native code] }

#### InterventionResponse (interface)

介入タイプ */
type: InterventionType;

/** 介入ターゲット */
target: InterventionTarget;

/** 自然言語コマンド */
command: string;

/** 追加パラメータ */
parameters?: Record<string, unknown>;
}

/**編集者介入レスポンス

**@constructor:** function Object() { [native code] }

#### FeedbackType (type)

成功フラグ */
success: boolean;

/** 実行されたアクション */
actionsTaken: {
type: string;
description: string;
}[];

/** 影響を受けたコンポーネント */
affectedComponents: {
component: string;
impact: string;
}[];

/** 編集者フィードバック */
feedback: {
message: string;
suggestions: string[];
};
}

/**フィードバックタイプ

**@constructor:** function Object() { [native code] }

#### FeedbackRequest (interface)

編集者フィードバックリクエスト

**@constructor:** function Object() { [native code] }

#### FeedbackResponse (interface)

チャプターID */
chapterId: string;

/** フィードバックタイプ */
type: FeedbackType;

/** フィードバック内容 */
content: string;

/** 評価 (1-5) */
rating?: number;

/** 提案 */
suggestions?: string[];
}

/**編集者フィードバックレスポンス

**@constructor:** function Object() { [native code] }

#### Parameter (interface)

確認フラグ */
acknowledged: boolean;

/** アクションアイテム */
actionItems: {
action: string;
priority: 'low' | 'medium' | 'high';
}[];

/** 学習ポイント */
learningPoints: {
description: string;
applicationAreas: string[];
}[];
}

/**パラメータ定義

**@constructor:** function Object() { [native code] }

#### Command (interface)

コマンド定義

**@constructor:** function Object() { [native code] }

#### ParsedCommand (interface)

解析済みコマンド

**@constructor:** function Object() { [native code] }

#### InterpretedCommand (interface)

解釈済みコマンド

**@constructor:** function Object() { [native code] }


---

### generation copy.ts {#cnovel-automation-systemsrctypesgeneration-copyts}

**Path:** `C:/novel-automation-system/src/types/generation copy.ts`

小説生成に関連する型定義

**@constructor:** function Object() { [native code] }

#### SceneType (type)

小説生成に関連する型定義/

import { CorrectionHistoryEntry } from './correction';

/**シーンの種類

**@constructor:** function Object() { [native code] }

#### Scene (interface)

シーン情報

**@constructor:** function Object() { [native code] }

#### CharacterAppearance (interface)

シーンID */
id: string;

/** シーンタイプ */
type: SceneType;

/** シーンタイトル */
title?: string;

/** 開始位置 */
startPosition: number;

/** 終了位置 */
endPosition: number;

/** 登場キャラクター */
characters: string[];

/** シーンの要約 */
summary?: string;

/** シーンの感情基調 */
emotionalTone?: string;

/** テンションレベル (0-1) */
tension?: number;

/** シーンの内容（簡易バージョンとの互換性） */
content?: string;

/** 場所（簡易バージョンとの互換性） */
location?: string;

/** 時間枠（簡易バージョンとの互換性） */
timeframe?: string;
}

/**キャラクター登場情報

**@constructor:** function Object() { [native code] }

#### ThemeOccurrence (interface)

キャラクターID */
characterId: string;

/** キャラクター名 */
characterName: string;

/** 登場シーン */
scenes: string[];

/** セリフ数 */
dialogueCount: number;

/** 重要度 (0-1) */
significance: number;

/** 行動（簡易バージョンとの互換性） */
actions?: string[];

/** 感情（簡易バージョンとの互換性） */
emotions?: string[];
}

/**テーマ出現情報

**@constructor:** function Object() { [native code] }

#### ForeshadowingElement (interface)

テーマID */
themeId: string;

/** テーマ名 */
themeName: string;

/** 関連表現 */
expressions: string[];

/** 強度 (0-1) */
strength: number;

/** テーマ（簡易バージョンとの互換性） */
theme?: string;

/** コンテキスト（簡易バージョンとの互換性） */
contexts?: string[];
}

/**伏線要素

**@constructor:** function Object() { [native code] }

#### QualityMetrics (interface)

伏線ID */
id: string;

/** 伏線の説明 */
description: string;

/** テキスト位置 */
position: number;

/** 伏線のテキスト */
text: string;

/** 予定回収チャプター範囲 */
plannedResolutionChapter?: [number, number];

/** 関連キャラクター */
relatedCharacters?: string[];

/** 要素（簡易バージョンとの互換性） */
element?: string;

/** チャプター（簡易バージョンとの互換性） */
chapter?: number;

/** 解決チャプター（簡易バージョンとの互換性） */
resolutionChapter?: number;

/** 解決済みフラグ（簡易バージョンとの互換性） */
isResolved?: boolean;
}

/**品質メトリクス

**@constructor:** function Object() { [native code] }

#### IssueAndFix (interface)

読みやすさ (0-1) */
readability: number;

/** 一貫性 (0-1) */
consistency: number;

/** 引き込み度 (0-1) */
engagement: number;

/** キャラクター描写 (0-1) */
characterDepiction: number;

/** オリジナリティ (0-1) */
originality: number;

/** 総合スコア (0-1) */
overall: number;

/** 整合性（簡易バージョンとの互換性） */
coherence?: number;

/** キャラクター一貫性（簡易バージョンとの互換性） */
characterConsistency?: number;

/** 詳細データ（拡張版） */
details?: any;
}

/**問題と修正情報

**@constructor:** function Object() { [native code] }

#### ChapterAnalysis (interface)

問題の種類 */
issueType: string;

/** 問題の説明 */
issueDescription: string;

/** 修正内容 */
fixDescription: string;

/** 修正前テキスト */
originalText?: string;

/** 修正後テキスト */
correctedText?: string;
}

/**チャプター分析

**@constructor:** function Object() { [native code] }

#### GenerationResult (interface)

キャラクター登場 */
characterAppearances: CharacterAppearance[];

/** テーマ出現 */
themeOccurrences: ThemeOccurrence[];

/** 伏線要素 */
foreshadowingElements: ForeshadowingElement[];

/** 品質メトリクス */
qualityMetrics: QualityMetrics;

/** 検出された問題 */
detectedIssues?: IssueAndFix[];
}

/**生成結果

**@constructor:** function Object() { [native code] }

#### GenerationContext (interface)

生成されたチャプター */
chapter: Chapter;

/** 生成メトリクス */
metrics: {
/** 生成時間（ミリ秒） */
generationTime: number;

/** 品質スコア */
qualityScore: number;

/** 修正数 */
correctionCount: number;
};

/** 生成に使用されたコンテキスト */
usedContext?: {
shortTermSummary: string;
midTermSummary: string;
activeCharacters: string[];
};
}

/**生成コンテキスト

**@constructor:** function Object() { [native code] }

#### GenerationOptions (interface)

短期記憶（直近のチャプター情報） */
shortTermMemory?: any;

/** 中期記憶（現在のアーク情報） */
midTermMemory?: any;

/** 長期記憶（全体のプロットと世界観） */
longTermMemory?: any;

/** キャラクター状態 */
characterStates?: any[];

/** プロット情報 */
plotPoints?: any[];

/** 伏線状態 */
foreshadowingStatus?: any;

/** テンション設定 */
tension?: number;

/** ペーシング設定 */
pacing?: number;

/** 目標長さ（文字数） */
targetLength?: number;

/** チャプター番号（簡易バージョンとの互換性） */
chapterNumber?: number;

/** ストーリーコンテキスト（簡易バージョンとの互換性） */
storyContext?: string;

/** 世界観設定（簡易バージョンとの互換性） */
worldSettings?: string;

/** 伏線（簡易バージョンとの互換性） */
foreshadowing?: string[];

/** テーマ（簡易バージョンとの互換性） */
theme?: string;

/** トーン（簡易バージョンとの互換性） */
tone?: string;

/** ナラティブスタイル（簡易バージョンとの互換性） */
narrativeStyle?: string;

/** 矛盾（簡易バージョンとの互換性） */
contradictions?: string[];

/** キャラクター（簡易バージョンとの互換性） */
characters?: any[];

/** 表現制約（拡張版との互換性） */
expressionConstraints?: any[];
}

/**生成オプション

**@constructor:** function Object() { [native code] }

#### GenerationRequest (interface)

目標文字数 */
targetLength?: number;

/** 強制生成フラグ */
forcedGeneration?: boolean;

/** 温度パラメータ */
temperature?: number;

/** 上書き設定 */
overrides?: {
/** テンション上書き */
tension?: number;

/** ペース上書き */
pacing?: number;
};
}

/**生成リクエスト

**@constructor:** function Object() { [native code] }

#### GenerateChapterRequest (interface)

ターゲットチャプター番号 */
chapterNumber: number;

/** 目標文字数 */
targetLength?: number;

/** 強制生成フラグ */
forcedGeneration?: boolean;

/** 上書き設定 */
overrides?: {
tension?: number;
pacing?: number;
};
}

/**チャプター生成リクエスト（APIドキュメント互換）

**@constructor:** function Object() { [native code] }

#### GenerateChapterResponse (interface)

目標文字数 */
targetLength?: number;

/** 強制生成フラグ */
forcedGeneration?: boolean;

/** 上書き設定 */
overrides?: {
tension?: number;
pacing?: number;
};
}

/**チャプター生成レスポンス（APIドキュメント互換）

**@constructor:** function Object() { [native code] }

#### ContextQueryParams (interface)

生成されたチャプター */
chapter: Chapter;

/** 生成メトリクス */
metrics: {
generationTime: number;
qualityScore: number;
correctionCount: number;
};
}

/**コンテキスト取得クエリパラメータ（APIドキュメント互換）

**@constructor:** function Object() { [native code] }

#### ContextResponse (interface)

コンテキストレスポンス（APIドキュメント互換）

**@constructor:** function Object() { [native code] }

#### ValidateChapterRequest (interface)

チャプター検証リクエスト（APIドキュメント互換）

**@constructor:** function Object() { [native code] }

#### ValidateChapterResponse (interface)

チャプター検証レスポンス（APIドキュメント互換）

**@constructor:** function Object() { [native code] }


---

### generation.ts {#cnovel-automation-systemsrctypesgenerationts}

**Path:** `C:/novel-automation-system/src/types/generation.ts`

小説生成に関連する型定義

**@constructor:** function Object() { [native code] }

#### SceneType (type)

小説生成に関連する型定義/

import { CorrectionHistoryEntry } from './correction';

/**シーンの種類

**@constructor:** function Object() { [native code] }

#### Scene (interface)

シーン情報

**@constructor:** function Object() { [native code] }

#### CharacterAppearance (interface)

シーンID */
id: string;

/** シーンタイプ */
type: SceneType;

/** シーンタイトル */
title?: string;

/** 開始位置 */
startPosition: number;

/** 終了位置 */
endPosition: number;

/** 登場キャラクター */
characters: string[];

/** シーンの要約 */
summary?: string;

/** シーンの感情基調 */
emotionalTone?: string;

/** テンションレベル (0-1) */
tension?: number;

/** シーンの内容（簡易バージョンとの互換性） */
content?: string;

/** 場所（簡易バージョンとの互換性） */
location?: string;

/** 時間枠（簡易バージョンとの互換性） */
timeframe?: string;
}

/**キャラクター登場情報

**@constructor:** function Object() { [native code] }

#### ThemeOccurrence (interface)

キャラクターID */
characterId: string;

/** キャラクター名 */
characterName: string;

/** 登場シーン */
scenes: string[];

/** セリフ数 */
dialogueCount: number;

/** 重要度 (0-1) */
significance: number;

/** 行動（簡易バージョンとの互換性） */
actions?: string[];

/** 感情（簡易バージョンとの互換性） */
emotions?: string[];
}

/**テーマ出現情報

**@constructor:** function Object() { [native code] }

#### ForeshadowingElement (interface)

テーマID */
themeId: string;

/** テーマ名 */
themeName: string;

/** 関連表現 */
expressions: string[];

/** 強度 (0-1) */
strength: number;

/** テーマ（簡易バージョンとの互換性） */
theme?: string;

/** コンテキスト（簡易バージョンとの互換性） */
contexts?: string[];
}

/**伏線要素

**@constructor:** function Object() { [native code] }

#### QualityMetrics (interface)

伏線ID */
id: string;

/** 伏線の説明 */
description: string;

/** テキスト位置 */
position: number;

/** 伏線のテキスト */
text: string;

/** 予定回収チャプター範囲 */
plannedResolutionChapter?: [number, number];

/** 関連キャラクター */
relatedCharacters?: string[];

/** 要素（簡易バージョンとの互換性） */
element?: string;

/** チャプター（簡易バージョンとの互換性） */
chapter?: number;

/** 解決チャプター（簡易バージョンとの互換性） */
resolutionChapter?: number;

/** 解決済みフラグ（簡易バージョンとの互換性） */
isResolved?: boolean;
}

/**品質メトリクス

**@constructor:** function Object() { [native code] }

#### IssueAndFix (interface)

読みやすさ (0-1) */
readability: number;

/** 一貫性 (0-1) */
consistency: number;

/** 引き込み度 (0-1) */
engagement: number;

/** キャラクター描写 (0-1) */
characterDepiction: number;

/** オリジナリティ (0-1) */
originality: number;

/** 総合スコア (0-1) */
overall: number;

/** 整合性（簡易バージョンとの互換性） */
coherence?: number;

/** キャラクター一貫性（簡易バージョンとの互換性） */
characterConsistency?: number;

/** 詳細データ（拡張版） */
details?: any;
}

/**問題と修正情報

**@constructor:** function Object() { [native code] }

#### ChapterAnalysis (interface)

問題の種類 */
issueType: string;

/** 問題の説明 */
issueDescription: string;

/** 修正内容 */
fixDescription: string;

/** 修正前テキスト */
originalText?: string;

/** 修正後テキスト */
correctedText?: string;
}

/**チャプター分析

**@constructor:** function Object() { [native code] }

#### GenerationResult (interface)

キャラクター登場 */
characterAppearances: CharacterAppearance[];

/** テーマ出現 */
themeOccurrences: ThemeOccurrence[];

/** 伏線要素 */
foreshadowingElements: ForeshadowingElement[];

/** 品質メトリクス */
qualityMetrics: QualityMetrics;

/** 検出された問題 */
detectedIssues?: IssueAndFix[];
}

/**生成結果

**@constructor:** function Object() { [native code] }

#### GenerationContext (interface)

生成されたチャプター */
chapter: Chapter;

/** 生成メトリクス */
metrics: {
/** 生成時間（ミリ秒） */
generationTime: number;

/** 品質スコア */
qualityScore: number;

/** 修正数 */
correctionCount: number;
};

/** 生成に使用されたコンテキスト */
usedContext?: {
shortTermSummary: string;
midTermSummary: string;
activeCharacters: string[];
};
}

/**生成コンテキスト

**@constructor:** function Object() { [native code] }

#### GenerationOptions (interface)

短期記憶（直近のチャプター情報） */
shortTermMemory?: any;

/** 中期記憶（現在のアーク情報） */
midTermMemory?: any;

/** 長期記憶（全体のプロットと世界観） */
longTermMemory?: any;

/** キャラクター状態 */
characterStates?: any[];

/** プロット情報 */
plotPoints?: any[];

/** 伏線状態 */
foreshadowingStatus?: any;

/** テンション設定 */
tension?: number;

/** ペーシング設定 */
pacing?: number;

/** 目標長さ（文字数） */
targetLength?: number;

/** チャプター番号（簡易バージョンとの互換性） */
chapterNumber?: number;

/** ストーリーコンテキスト（簡易バージョンとの互換性） */
storyContext?: string;

/** 世界観設定（簡易バージョンとの互換性） */
worldSettings?: string;

/** 伏線（簡易バージョンとの互換性） */
foreshadowing?: string[];

/** テーマ（簡易バージョンとの互換性） */
theme?: string;

/** トーン（簡易バージョンとの互換性） */
tone?: string;

/** ナラティブスタイル（簡易バージョンとの互換性） */
narrativeStyle?: string;

/** 矛盾（簡易バージョンとの互換性） */
contradictions?: string[];

/** キャラクター（簡易バージョンとの互換性） */
characters?: any[];

/** 表現制約（拡張版との互換性） */
expressionConstraints?: any[];
}

/**生成オプション

**@constructor:** function Object() { [native code] }

#### GenerationRequest (interface)

目標文字数 */
targetLength?: number;

/** 強制生成フラグ */
forcedGeneration?: boolean;

/** 温度パラメータ */
temperature?: number;

/** 上書き設定 */
overrides?: {
/** テンション上書き */
tension?: number;

/** ペース上書き */
pacing?: number;

/** TopK パラメータ */
topK?: number;

/** TopP パラメータ */
topP?: number;
};
}

/**生成リクエスト

**@constructor:** function Object() { [native code] }

#### GenerateChapterRequest (interface)

ターゲットチャプター番号 */
chapterNumber: number;

/** 目標文字数 */
targetLength?: number;

/** 強制生成フラグ */
forcedGeneration?: boolean;

/** 上書き設定 */
overrides?: {
tension?: number;
pacing?: number;
};
}

/**チャプター生成リクエスト（APIドキュメント互換）

**@constructor:** function Object() { [native code] }

#### GenerateChapterResponse (interface)

目標文字数 */
targetLength?: number;

/** 強制生成フラグ */
forcedGeneration?: boolean;

/** 上書き設定 */
overrides?: {
tension?: number;
pacing?: number;
};
}

/**チャプター生成レスポンス（APIドキュメント互換）

**@constructor:** function Object() { [native code] }

#### ContextQueryParams (interface)

生成されたチャプター */
chapter: Chapter;

/** 生成メトリクス */
metrics: {
generationTime: number;
qualityScore: number;
correctionCount: number;
};
}

/**コンテキスト取得クエリパラメータ（APIドキュメント互換）

**@constructor:** function Object() { [native code] }

#### ContextResponse (interface)

コンテキストレスポンス（APIドキュメント互換）

**@constructor:** function Object() { [native code] }

#### ValidateChapterRequest (interface)

チャプター検証リクエスト（APIドキュメント互換）

**@constructor:** function Object() { [native code] }

#### ValidateChapterResponse (interface)

チャプター検証レスポンス（APIドキュメント互換）

**@constructor:** function Object() { [native code] }


---

### generation★.ts {#cnovel-automation-systemsrctypesgenerationts}

**Path:** `C:/novel-automation-system/src/types/generation★.ts`

生成エンジンに関連する型定義

**@constructor:** function Object() { [native code] }

#### GenerationContext (interface)

生成エンジンに関連する型定義/

import { ChapterMemory, ArcSummary, StorySummary } from './memory★';
import { Character } from './characters';

/**生成コンテキスト

**@constructor:** function Object() { [native code] }

#### ChapterMetadata (interface)

チャプター番号 */
chapterNumber: number;

/** 短期記憶（直近のチャプター） */
shortTermMemory: ChapterMemory[];

/** 中期記憶（現在のアーク） */
midTermMemory: ArcSummary;

/** 長期記憶（物語全体） */
longTermMemory: StorySummary;

/** 関連キャラクターの状態 */
characterStates: {
character: Character;
currentState: string;
}[];

/** 伏線の状態 */
foreshadowing: {
active: string[];
resolved: string[];
planned: string[];
};

/** 表現制約 */
expressionConstraints: {
/** 使用済み表現 (避けるべき) */
usedExpressions: string[];

/** 避けるべき表現 */
avoidExpressions: string[];

/** 使用推奨表現 */
recommendedExpressions: string[];
};

/** 視点 */
viewpoint: string;

/** 物語の進行度 (0-100%) */
progressRate: number;

/** 現在のアーク名 */
currentArc: string;

/** 全体のチャプター数 */
totalChapters: number;
}

/**チャプターのメタデータ

**@constructor:** function Object() { [native code] }

#### Scene (interface)

生成日時 */
generatedAt: Date;

/** 単語数 */
wordCount: number;

/** 生成にかかった時間 (ms) */
generationTime: number;

/** 品質スコア (0-100) */
qualityScore?: number;

/** テンションスコア (0-100) */
tensionScore?: number;

/** 生成バージョン */
generationVersion: string;
}

/**シーンの定義

**@constructor:** function Object() { [native code] }

#### Chapter (interface)

シーンの概要 */
summary: string;

/** 登場キャラクター */
characters: string[];

/** シーンの場所 */
location: string;

/** 時間設定 */
timeframe: string;
}

/**生成されたチャプター

**@constructor:** function Object() { [native code] }

#### GenerationOptions (interface)

チャプターID */
id: string;

/** チャプター番号 */
number: number;

/** タイトル */
title: string;

/** 本文 */
content: string;

/** 要約 */
summary: string;

/** シーン */
scenes: Scene[];

/** 登場キャラクター */
characterAppearances: {
characterId: string;
significance: number;
}[];

/** メタデータ */
metadata: ChapterMetadata;

/** 修正履歴 */
corrections?: {
original: string;
corrected: string;
reason: string;
}[];
}

/**生成オプション

**@constructor:** function Object() { [native code] }

#### ValidationResult (interface)

目標長さ (文字数) */
targetLength?: number;

/** 強制生成フラグ */
forcedGeneration?: boolean;

/** 上書き設定 */
overrides?: {
/** テンション上書き (0-100) */
tension?: number;

/** ペース上書き (0-100, 低=遅い, 高=速い) */
pacing?: number;
};
}

/**生成結果の検証結果

**@constructor:** function Object() { [native code] }


---

### memory copy.ts {#cnovel-automation-systemsrctypesmemory-copyts}

**Path:** `C:/novel-automation-system/src/types/memory copy.ts`

メモリータイプ

**@constructor:** function Object() { [native code] }

#### MemoryType (type)

メモリータイプ

**@constructor:** function Object() { [native code] }

#### Memory (interface)

メモリー

**@constructor:** function Object() { [native code] }

#### ChapterMemory (interface)

チャプターメモリー

**@constructor:** function Object() { [native code] }

#### KeyEvent (interface)

キーイベント

**@constructor:** function Object() { [native code] }

#### CharacterState (interface)

キャラクター状態

**@constructor:** function Object() { [native code] }

#### Relationship (interface)

関係性

**@constructor:** function Object() { [native code] }

#### CompressedMemory (interface)

圧縮されたメモリー

**@constructor:** function Object() { [native code] }

#### ArcMemory (interface)

アークメモリー

**@constructor:** function Object() { [native code] }

#### Foreshadowing (interface)

伏線

**@constructor:** function Object() { [native code] }

#### ArcSummary (interface)

アークサマリー

**@constructor:** function Object() { [native code] }

#### WorldSettings (interface)

世界設定

**@constructor:** function Object() { [native code] }

#### Theme (interface)

テーマ

**@constructor:** function Object() { [native code] }

#### CharacterArchetype (interface)

キャラクターアーキタイプ

**@constructor:** function Object() { [native code] }

#### ConsistencyResult (interface)

一貫性結果

**@constructor:** function Object() { [native code] }

#### ConsistencyIssue (interface)

一貫性問題

**@constructor:** function Object() { [native code] }

#### SearchResult (interface)

メモリー検索結果

**@constructor:** function Object() { [native code] }

#### SyncMemoryRequest (interface)

メモリー同期リクエスト

**@constructor:** function Object() { [native code] }

#### SyncMemoryResponse (interface)

メモリー同期レスポンス

**@constructor:** function Object() { [native code] }

#### CompressionAction (interface)

圧縮アクション

**@constructor:** function Object() { [native code] }


---

### memory.ts {#cnovel-automation-systemsrctypesmemoryts}

**Path:** `C:/novel-automation-system/src/types/memory.ts`

メモリータイプ

**@constructor:** function Object() { [native code] }

#### MemoryType (type)

メモリータイプ

**@constructor:** function Object() { [native code] }

#### Memory (interface)

メモリー

**@constructor:** function Object() { [native code] }

#### ChapterMemory (interface)

チャプターメモリー

**@constructor:** function Object() { [native code] }

#### KeyEvent (interface)

キーイベント

**@constructor:** function Object() { [native code] }

#### CharacterState (interface)

キャラクター状態

**@constructor:** function Object() { [native code] }

#### Relationship (interface)

関係性

**@constructor:** function Object() { [native code] }

#### CompressedMemory (interface)

圧縮されたメモリー

**@constructor:** function Object() { [native code] }

#### ArcMemory (interface)

アークメモリー

**@constructor:** function Object() { [native code] }

#### Foreshadowing (interface)

伏線

**@constructor:** function Object() { [native code] }

#### ArcSummary (interface)

アークサマリー

**@constructor:** function Object() { [native code] }

#### WorldSettings (interface)

世界設定

**@constructor:** function Object() { [native code] }

#### Theme (interface)

テーマ

**@constructor:** function Object() { [native code] }

#### CharacterArchetype (interface)

キャラクターアーキタイプ

**@constructor:** function Object() { [native code] }

#### ConsistencyResult (interface)

一貫性結果

**@constructor:** function Object() { [native code] }

#### ConsistencyIssue (interface)

一貫性問題

**@constructor:** function Object() { [native code] }

#### SearchResult (interface)

メモリー検索結果

**@constructor:** function Object() { [native code] }

#### SyncMemoryRequest (interface)

メモリー同期リクエスト

**@constructor:** function Object() { [native code] }

#### SyncMemoryResponse (interface)

メモリー同期レスポンス

**@constructor:** function Object() { [native code] }

#### CompressionAction (interface)

圧縮アクション

**@constructor:** function Object() { [native code] }


---

### memory★.ts {#cnovel-automation-systemsrctypesmemoryts}

**Path:** `C:/novel-automation-system/src/types/memory★.ts`

記憶管理システムに関連する型定義

**@constructor:** function Object() { [native code] }

#### MemoryType (type)

記憶管理システムに関連する型定義/

/**記憶の種類

**@constructor:** function Object() { [native code] }

#### KeyEvent (interface)

チャプターのキーイベント

**@constructor:** function Object() { [native code] }

#### ChapterMemory (interface)

イベントの説明 */
event: string;

/** 感情的なインパクト (1-10) */
emotionalImpact: number;

/** プロット上の重要度 (1-10) */
plotSignificance: number;

/** 関連するキャラクター */
relatedCharacters: string[];
}

/**チャプターの記憶

**@constructor:** function Object() { [native code] }

#### ArcSummary (interface)

チャプター番号 */
chapter: number;

/** チャプターの要約 */
summary: string;

/** 重要なイベント */
keyEvents: KeyEvent[];

/** キャラクターの状態 */
characterStates: {
/** キャラクターID */
characterId: string;

/** 感情状態 */
mood: string;

/** 発展した側面 */
development: string;
}[];

/** 伏線 */
foreshadowing: {
/** 伏線の要素 */
element: string;

/** 潜在的な解決方法 */
potentialResolutions: string[];

/** 緊急度 */
urgency: 'low' | 'mid' | 'high';
}[];

/** 使用された表現 */
expressionUsage: string[];

/** 記憶の作成日時 */
createdAt: Date;
}

/**物語のアークの要約

**@constructor:** function Object() { [native code] }

#### StorySummary (interface)

アークの名前 */
name: string;

/** 開始チャプター */
startChapter: number;

/** 終了チャプター（予測） */
endChapter?: number;

/** 主要テーマ */
themes: string[];

/** 主要な出来事 */
significantEvents: string[];

/** 主要なキャラクター動向 */
characterArcs: {
characterId: string;
progression: string;
}[];

/** 未解決の伏線 */
openForeshadowing: string[];
}

/**物語全体の要約

**@constructor:** function Object() { [native code] }

#### SearchResult (interface)

世界観の設定 */
worldSettings: string;

/** 主要なテーマ */
mainThemes: string[];

/** 主要な筋書き */
mainPlotlines: string[];

/** キャラクターの大きな目標 */
characterObjectives: {
characterId: string;
objective: string;
}[];

/** 物語の方向性 */
storyDirection: string;
}

/**記憶検索結果

**@constructor:** function Object() { [native code] }

#### MemoryHierarchy (interface)

記憶の種類 */
type: MemoryType;

/** 記憶のID または チャプター番号 */
source: string | number;

/** 一致したコンテンツ */
content: string;

/** 関連性スコア (0-100) */
relevance: number;
}

/**記憶の階層構造

**@constructor:** function Object() { [native code] }


---

### validation.ts {#cnovel-automation-systemsrctypesvalidationts}

**Path:** `C:/novel-automation-system/src/types/validation.ts`

検証結果

**@constructor:** function Object() { [native code] }

#### ValidationResult (interface)

検証結果

**@constructor:** function Object() { [native code] }

#### ValidationCheck (interface)

検証チェック

**@constructor:** function Object() { [native code] }

#### ValidationIssue (interface)

バリデーション問題

**@constructor:** function Object() { [native code] }

#### Suggestion (interface)

提案

**@constructor:** function Object() { [native code] }

#### QualityScore (interface)

品質スコア

**@constructor:** function Object() { [native code] }

#### CorrectionCandidate (interface)

修正候補

**@constructor:** function Object() { [native code] }

#### StyleIssue (interface)

スタイル問題

**@constructor:** function Object() { [native code] }

#### IntegrityResult (interface)

インテグリティ結果

**@constructor:** function Object() { [native code] }

#### IntegrityIssue (interface)

インテグリティ問題

**@constructor:** function Object() { [native code] }

#### StyleResult (interface)

スタイル結果

**@constructor:** function Object() { [native code] }

#### ImprovementArea (interface)

改善領域

**@constructor:** function Object() { [native code] }


---

## C:/novel-automation-system/tests {#cnovel-automation-systemtests}

### context-generator.mock.ts {#cnovel-automation-systemtestsmockscontext-generatormockts}

**Path:** `C:/novel-automation-system/tests/#/mocks/context-generator.mock.ts`

ContextGenerator のモック

**@constructor:** function Object() { [native code] }


---

### gemini-client.mock.ts {#cnovel-automation-systemtestsmocksgemini-clientmockts}

**Path:** `C:/novel-automation-system/tests/#/mocks/gemini-client.mock.ts`

GeminiClient のモック

**@constructor:** function Object() { [native code] }


---

### modules.ts {#cnovel-automation-systemtestsmocksmodulests}

**Path:** `C:/novel-automation-system/tests/#/mocks/modules.ts`

モジュールレベルのモック設定Jest.mock() のセットアップを改善するためのヘルパー

**@constructor:** function Object() { [native code] }


---

### simple-engine.test.ts {#cnovel-automation-systemtestssimple-enginetestts}

**Path:** `C:/novel-automation-system/tests/#/simple-engine.test.ts`

GenerationEngine の簡素化したテスト

**@constructor:** function Object() { [native code] }


---

### simple-utils.test.ts {#cnovel-automation-systemtestsunitutilssimple-utilstestts}

**Path:** `C:/novel-automation-system/tests/#/unit/utils/simple-utils.test.ts`

基本的なユーティリティ関数のテストJest環境が正しく動作していることを確認するための最も基本的なテスト

**@constructor:** function Object() { [native code] }


---

### continuous-generation.test.ts {#cnovel-automation-systemtestscontinuouscontinuous-generationtestts}

**Path:** `C:/novel-automation-system/tests/continuous/continuous-generation.test.ts`

継続生成テストこのテストでは長期間にわたる小説の継続生成をシミュレートし、一貫性や品質が維持されることを検証します。

**@constructor:** function Object() { [native code] }


---

### enhanced-storage-test.js {#cnovel-automation-systemtestsintegrationenhanced-storage-testjs}

**Path:** `C:/novel-automation-system/tests/integration/enhanced-storage-test.js`

@fileoverview 拡張ローカルストレージプロバイダーの統合テスト@descriptionこのファイルは拡張ローカルストレージプロバイダーの機能を包括的にテストします。基本的なファイル操作に加えて、拡張機能であるバックアップ、メタデータ取得、ファイルの移動・コピー、ディレクトリリスト取得などをテストします。

**@constructor:** function Object() { [native code] }

#### fs (variable)

@fileoverview 拡張ローカルストレージプロバイダーの統合テスト@descriptionこのファイルは拡張ローカルストレージプロバイダーの機能を包括的にテストします。基本的なファイル操作に加えて、拡張機能であるバックアップ、メタデータ取得、ファイルの移動・コピー、ディレクトリリスト取得などをテストします。

**@constructor:** function Object() { [native code] }


---

### novel-generation.test.ts {#cnovel-automation-systemtestsintegrationnovel-generationtestts}

**Path:** `C:/novel-automation-system/tests/integration/novel-generation.test.ts`

生成されたチャプターを検証する関数

**@constructor:** function Object() { [native code] }

#### validateGeneratedChapter (function)

生成されたチャプターを検証する関数

**@constructor:** function Object() { [native code] }

#### saveChapterToFile (function)

チャプターをファイルに保存する関数

**@constructor:** function Object() { [native code] }


---

### gemini-client.mock.ts {#cnovel-automation-systemtestsmocksgemini-clientmockts}

**Path:** `C:/novel-automation-system/tests/mocks/gemini-client.mock.ts`

GeminiClientのモック実装

**@constructor:** function Object() { [native code] }

#### MockGeminiClient (class)

GeminiClientのモック実装

**@constructor:** function Object() { [native code] }

#### Methods of MockGeminiClient

##### MockGeminiClient.generateText (method)

テキスト生成のモック実装@param prompt 入力プロンプト@returns モック応答

**@constructor:** function Object() { [native code] }


---

### concurrent-requests.test.ts {#cnovel-automation-systemtestsperformanceconcurrent-requeststestts}

**Path:** `C:/novel-automation-system/tests/performance/concurrent-requests.test.ts`

並行リクエスト処理のテスト複数の同時リクエストを処理する能力を検証します

**@constructor:** function Object() { [native code] }


---

