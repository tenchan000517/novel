const fs = require('fs').promises;

console.log('🔍 ShortTermMemory.initialize()実行失敗原因調査');
console.log('===============================================');

async function analyzeInitializeExecution() {
    console.log('\n📊 STEP 1: ShortTermMemory.initialize()の実装詳細確認');
    console.log('==================================================');
    
    await analyzeShortTermInitializeMethod();
    
    console.log('\n🔍 STEP 2: immediate-context.tsのcreateDirectory実行条件');
    console.log('======================================================');
    
    await analyzeCreateDirectoryConditions();
    
    console.log('\n🚀 STEP 3: 実際の実行ログとエラー確認');
    console.log('====================================');
    
    await checkExecutionLogs();
    
    console.log('\n🔧 STEP 4: 手動実行テストで問題特定');
    console.log('==================================');
    
    await performManualExecutionTest();
    
    console.log('\n✅ ShortTermMemory.initialize()実行失敗原因調査完了');
}

async function analyzeShortTermInitializeMethod() {
    try {
        const shortTermPath = 'src/lib/memory/short-term/short-term-memory.ts';
        const content = await fs.readFile(shortTermPath, 'utf8');
        
        console.log('📄 ShortTermMemory.initialize()の完全実装:');
        console.log('==========================================');
        
        // initialize()メソッドの完全な実装を抽出
        const initMethodMatch = content.match(/async\s+initialize\s*\([^{]*\)\s*\{[^}]*(?:\{[^}]*\}[^}]*)*\}/s);
        if (initMethodMatch) {
            const initMethod = initMethodMatch[0];
            console.log(initMethod);
            
            // 実装内容の分析
            console.log('\n📋 実装内容分析:');
            console.log('================');
            
            // 各コンポーネントの初期化を確認
            const componentInits = initMethod.match(/\w+\.initialize\(\)/g);
            if (componentInits) {
                console.log(`✅ コンポーネント初期化: ${componentInits.length}箇所`);
                componentInits.forEach((init, i) => {
                    console.log(`   ${i+1}. ${init}`);
                });
            } else {
                console.log('❌ コンポーネント初期化なし');
            }
            
            // ディレクトリ作成関連の処理を確認
            const dirCreation = initMethod.match(/createDirectory|mkdir|ensureDir/gi);
            if (dirCreation) {
                console.log(`✅ ディレクトリ作成処理: ${dirCreation.length}箇所`);
            } else {
                console.log('❌ ディレクトリ作成処理なし → 問題の可能性');
            }
            
            // エラーハンドリングを確認
            const errorHandling = initMethod.match(/try|catch|throw/gi);
            if (errorHandling) {
                console.log(`🛡️ エラーハンドリング: ${errorHandling.length}箇所`);
            } else {
                console.log('⚠️ エラーハンドリングなし → エラーが隠蔽される可能性');
            }
            
        } else {
            console.log('❌ initialize()メソッドの実装が抽出できませんでした');
        }
        
        // ShortTermMemoryのコンストラクタも確認
        const constructorMatch = content.match(/constructor\s*\([^{]*\)\s*\{[^}]*\}/s);
        if (constructorMatch) {
            console.log('\n🏗️ コンストラクタ:');
            console.log('==============');
            console.log(constructorMatch[0]);
        }
        
        // コンポーネントのプロパティ定義を確認
        const componentProps = content.match(/private\s+\w+:\s*\w+/g);
        if (componentProps) {
            console.log('\n📦 コンポーネントプロパティ:');
            componentProps.forEach(prop => {
                console.log(`   ${prop}`);
            });
        }
        
    } catch (error) {
        console.log(`❌ ShortTermMemory分析エラー: ${error.message}`);
    }
}

async function analyzeCreateDirectoryConditions() {
    try {
        const immediatePath = 'src/lib/memory/short-term/immediate-context.ts';
        const content = await fs.readFile(immediatePath, 'utf8');
        
        console.log('📄 immediate-context.ts createDirectory分析:');
        console.log('===========================================');
        
        // createDirectoryの呼び出しコンテキストを詳しく分析
        const createDirContext = content.match(/[^{]*storageProvider\.createDirectory[^}]+\}/gs);
        if (createDirContext) {
            console.log('📋 createDirectory呼び出しの完全コンテキスト:');
            createDirContext.forEach((context, i) => {
                console.log(`\n--- コンテキスト ${i+1} ---`);
                console.log(context);
                
                // 条件分岐があるかチェック
                if (context.includes('if ') || context.includes('?') || context.includes('&&')) {
                    console.log('⚠️ 条件分岐あり → 実行されない可能性');
                } else {
                    console.log('✅ 無条件実行');
                }
            });
        }
        
        // initialize()メソッドの有無とcreateDirectoryとの関係
        const initMethods = content.match(/async\s+\w*[Ii]nit\w*\s*\([^{]*\)\s*\{[^}]*\}/gs);
        if (initMethods) {
            console.log('\n🚀 immediate-context.ts の初期化メソッド:');
            initMethods.forEach((method, i) => {
                const methodName = method.match(/async\s+(\w*[Ii]nit\w*)/);
                console.log(`\n--- メソッド ${i+1}: ${methodName ? methodName[1] : '不明'} ---`);
                console.log(method);
                
                if (method.includes('createDirectory')) {
                    console.log('✅ このメソッド内でcreateDirectory呼び出し');
                } else {
                    console.log('❌ このメソッド内でcreateDirectory呼び出しなし');
                }
            });
        } else {
            console.log('❌ immediate-context.ts に初期化メソッドなし');
            console.log('   → ShortTermMemory.initialize()から呼び出されない可能性');
        }
        
        // データパスの定義を確認
        const dataPathDefinitions = content.match(/directory\s*=\s*['"`][^'"`]+['"`]/g);
        if (dataPathDefinitions) {
            console.log('\n📁 ディレクトリパス定義:');
            dataPathDefinitions.forEach(def => {
                console.log(`   ${def}`);
            });
        }
        
    } catch (error) {
        console.log(`❌ immediate-context.ts分析エラー: ${error.message}`);
    }
}

async function checkExecutionLogs() {
    console.log('🔍 実行ログとエラーの確認:');
    
    // ログファイルの検索
    const logDirs = ['logs', 'log', 'data/logs', 'tmp/logs'];
    let logsFound = false;
    
    for (const logDir of logDirs) {
        try {
            const files = await fs.readdir(logDir);
            if (files.length > 0) {
                console.log(`\n📂 ${logDir}/ ログファイル:`);
                logsFound = true;
                
                for (const file of files.slice(0, 5)) {
                    const filePath = `${logDir}/${file}`;
                    const stats = await fs.stat(filePath);
                    console.log(`   📄 ${file} (${(stats.size / 1024).toFixed(1)}KB, ${stats.mtime.toISOString().split('T')[0]})`);
                    
                    // ファイルが小さければ内容を確認
                    if (stats.size < 10000) {
                        try {
                            const logContent = await fs.readFile(filePath, 'utf8');
                            const memoryErrors = logContent.match(/memory|Memory|SHORT_TERM|initialize|error|Error/gi);
                            if (memoryErrors && memoryErrors.length > 0) {
                                console.log(`     🚨 記憶層関連ログ: ${memoryErrors.length}箇所`);
                            }
                        } catch (readError) {
                            // ログファイル読み込みエラーはスキップ
                        }
                    }
                }
            }
        } catch (error) {
            // ディレクトリが存在しない場合はスキップ
        }
    }
    
    if (!logsFound) {
        console.log('❌ ログファイルが見つかりませんでした');
        console.log('   → コンソール出力を確認する必要があります');
    }
    
    // package.jsonでログ設定を確認
    try {
        const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
        if (packageJson.scripts) {
            const devScript = packageJson.scripts.dev || packageJson.scripts.start;
            if (devScript) {
                console.log(`\n🚀 開発サーバー起動コマンド: ${devScript}`);
                console.log('   → このコマンド実行時のコンソール出力を確認してください');
            }
        }
    } catch (error) {
        // package.json確認エラーはスキップ
    }
}

async function performManualExecutionTest() {
    console.log('🧪 手動実行テストの提案:');
    
    console.log('\n📋 テスト手順:');
    console.log('=============');
    console.log('1. 以下のテストスクリプトを作成');
    console.log('2. MemoryManagerの初期化を直接実行');
    console.log('3. エラーメッセージを確認');
    
    console.log('\n💻 テストスクリプト例:');
    console.log('```javascript');
    console.log('// test-memory-init.js');
    console.log('const { MemoryManager } = require("./src/lib/memory/core/memory-manager");');
    console.log('');
    console.log('async function testMemoryInit() {');
    console.log('  try {');
    console.log('    console.log("MemoryManager初期化開始...");');
    console.log('    const config = {}; // 設定を適切に設定');
    console.log('    const memoryManager = new MemoryManager(config);');
    console.log('    ');
    console.log('    console.log("initialize()実行...");');
    console.log('    await memoryManager.initialize();');
    console.log('    ');
    console.log('    console.log("✅ 初期化成功");');
    console.log('  } catch (error) {');
    console.log('    console.error("❌ 初期化エラー:", error);');
    console.log('    console.error("スタックトレース:", error.stack);');
    console.log('  }');
    console.log('}');
    console.log('');
    console.log('testMemoryInit();');
    console.log('```');
    
    console.log('\n🎯 問題特定のポイント:');
    console.log('=====================');
    console.log('1. ShortTermMemory.initialize()が実際に呼ばれるか');
    console.log('2. immediate-context.tsのcreateDirectoryが実行されるか');
    console.log('3. storageProvider.createDirectoryでエラーが発生するか');
    console.log('4. ディレクトリパスが正しく解決されるか');
    
    console.log('\n🔧 デバッグ用ログ追加案:');
    console.log('=======================');
    console.log('ShortTermMemory.initialize()に以下を追加:');
    console.log('```typescript');
    console.log('async initialize(): Promise<void> {');
    console.log('  console.log("🚀 ShortTermMemory.initialize() 開始");');
    console.log('  try {');
    console.log('    // 既存の初期化処理');
    console.log('    await this.immediateContext.initialize();');
    console.log('    console.log("✅ ShortTermMemory.initialize() 完了");');
    console.log('  } catch (error) {');
    console.log('    console.error("❌ ShortTermMemory.initialize() エラー:", error);');
    console.log('    throw error;');
    console.log('  }');
    console.log('}');
    console.log('```');
    
    console.log('\n💡 次のアクション:');
    console.log('================');
    console.log('1. 上記のテストスクリプトを実行');
    console.log('2. ShortTermMemory.initialize()にログを追加');
    console.log('3. システムを再起動して動作確認');
    console.log('4. エラーメッセージから問題箇所を特定');
}

// 実行
analyzeInitializeExecution();