const fs = require('fs').promises;

console.log('🔍 SHORT_TERM記憶層初期化失敗原因調査');
console.log('======================================');

async function debugShortTermInitialization() {
    console.log('\n📊 STEP 1: storageProvider実装の詳細確認');
    console.log('=========================================');
    
    await analyzeStorageProviderImplementation();
    
    console.log('\n🔍 STEP 2: SHORT_TERM記憶層のcreateDirectory呼び出し確認');
    console.log('========================================================');
    
    await analyzeShortTermDirectoryCreation();
    
    console.log('\n🚀 STEP 3: 初期化シーケンスのエラー追跡');
    console.log('======================================');
    
    await traceInitializationErrors();
    
    console.log('\n🔧 STEP 4: 修復方法の特定');
    console.log('==========================');
    
    await identifyFixMethod();
    
    console.log('\n✅ SHORT_TERM記憶層初期化失敗原因調査完了');
}

async function analyzeStorageProviderImplementation() {
    try {
        const storageIndexPath = 'src/lib/storage/index.ts';
        const content = await fs.readFile(storageIndexPath, 'utf8');
        
        console.log('📄 storageProvider実装分析:');
        
        // createDirectoryメソッドの実装を抽出
        const createDirMatch = content.match(/createDirectory[^}]+\}/s);
        if (createDirMatch) {
            console.log('\n🔧 createDirectory実装:');
            console.log('---------------------------');
            console.log(createDirMatch[0]);
        }
        
        // ディレクトリ作成関連のメソッドを全て抽出
        const dirMethods = content.match(/(createDirectory|ensureDir|mkdir)[^}]+\}/gs);
        if (dirMethods) {
            console.log(`\n📁 ディレクトリ関連メソッド: ${dirMethods.length}個`);
            dirMethods.forEach((method, i) => {
                console.log(`\n--- メソッド ${i+1} ---`);
                console.log(method.substring(0, 200) + '...');
            });
        }
        
        // エラーハンドリングの確認
        const errorHandling = content.match(/try\s*\{[^}]+\}\s*catch[^}]+\}/gs);
        if (errorHandling) {
            console.log(`\n🛡️ エラーハンドリング: ${errorHandling.length}箇所`);
        }
        
        // ファイルシステム操作の実装確認
        const fsOps = content.match(/fs\.|require.*fs|import.*fs/g);
        if (fsOps) {
            console.log(`\n💾 ファイルシステム操作: ${fsOps.length}箇所`);
            [...new Set(fsOps)].forEach(op => {
                console.log(`   ${op}`);
            });
        }
        
    } catch (error) {
        console.log(`❌ storageProvider分析エラー: ${error.message}`);
    }
}

async function analyzeShortTermDirectoryCreation() {
    const shortTermFiles = [
        'src/lib/memory/short-term/immediate-context.ts',
        'src/lib/memory/short-term/generation-cache.ts',
        'src/lib/memory/short-term/processing-buffers.ts',
        'src/lib/memory/short-term/temporary-analysis.ts'
    ];
    
    console.log('🔍 SHORT_TERM記憶層のディレクトリ作成コード分析:');
    
    for (const file of shortTermFiles) {
        try {
            const content = await fs.readFile(file, 'utf8');
            console.log(`\n📄 ${file}:`);
            
            // createDirectoryの呼び出し箇所を詳細分析
            const createDirCalls = content.match(/storageProvider\.createDirectory[^;]+;/g);
            if (createDirCalls) {
                console.log(`   ✅ createDirectory呼び出し: ${createDirCalls.length}箇所`);
                createDirCalls.forEach((call, i) => {
                    console.log(`     ${i+1}. ${call}`);
                });
                
                // 呼び出しのコンテキストを確認
                const contextMatches = content.match(/[^{]*storageProvider\.createDirectory[^}]+\}/gs);
                if (contextMatches) {
                    console.log('   📋 呼び出しコンテキスト:');
                    contextMatches.forEach((context, i) => {
                        console.log(`     --- コンテキスト ${i+1} ---`);
                        console.log(`     ${context.replace(/\s+/g, ' ').substring(0, 150)}...`);
                    });
                }
            } else {
                console.log('   ❌ createDirectory呼び出しなし');
            }
            
            // 初期化メソッドの確認
            const initMethods = content.match(/async\s+\w*[Ii]nit\w*\s*\([^{]*\)\s*\{[^}]*\}/gs);
            if (initMethods) {
                console.log(`   🚀 初期化メソッド: ${initMethods.length}個`);
                initMethods.forEach((method, i) => {
                    const methodName = method.match(/async\s+(\w*[Ii]nit\w*)/);
                    console.log(`     ${i+1}. ${methodName ? methodName[1] : '不明'}()`);
                    
                    // 初期化メソッド内でのcreateDirectory呼び出し確認
                    if (method.includes('createDirectory')) {
                        console.log('       ✅ 初期化メソッド内でcreateDirectory呼び出しあり');
                    } else {
                        console.log('       ❌ 初期化メソッド内でcreateDirectory呼び出しなし');
                    }
                });
            }
            
            // データパスの定義確認
            const dataPaths = content.match(/['"`]data\/[^'"`]+['"`]/g);
            if (dataPaths) {
                console.log(`   📁 データパス定義: ${dataPaths.length}箇所`);
                [...new Set(dataPaths)].forEach(path => {
                    console.log(`     ${path}`);
                });
            }
            
        } catch (error) {
            console.log(`   ❌ ${file}: 分析エラー - ${error.message}`);
        }
    }
}

async function traceInitializationErrors() {
    console.log('🔍 初期化エラーの追跡:');
    
    // MemoryManagerのinitialize()で実際にSHORT_TERM初期化が呼ばれているか確認
    try {
        const memoryManagerPath = 'src/lib/memory/core/memory-manager.ts';
        const content = await fs.readFile(memoryManagerPath, 'utf8');
        
        // ShortTermMemoryの初期化呼び出しを詳しく確認
        const shortTermInitMatch = content.match(/shortTermMemory\.initialize[^;]*;/);
        if (shortTermInitMatch) {
            console.log('\n✅ MemoryManagerでSHORT_TERM初期化呼び出し確認:');
            console.log(`   ${shortTermInitMatch[0]}`);
        }
        
        // エラーハンドリングの確認
        const initMethodMatch = content.match(/async\s+initialize\s*\([^{]*\)\s*\{[^}]*(?:\{[^}]*\}[^}]*)*\}/s);
        if (initMethodMatch) {
            const initMethod = initMethodMatch[0];
            
            // try-catchブロックの確認
            const hasTryCatch = initMethod.includes('try') && initMethod.includes('catch');
            console.log(`\n🛡️ 初期化エラーハンドリング: ${hasTryCatch ? '実装済み' : '未実装'}`);
            
            if (hasTryCatch) {
                const catchBlocks = initMethod.match(/catch\s*\([^)]+\)\s*\{[^}]+\}/gs);
                if (catchBlocks) {
                    console.log('   エラーハンドリング詳細:');
                    catchBlocks.forEach((catchBlock, i) => {
                        console.log(`     Catch ${i+1}: ${catchBlock.replace(/\s+/g, ' ').substring(0, 100)}...`);
                    });
                }
            } else {
                console.log('   ⚠️ エラーが隠蔽されている可能性があります');
            }
        }
        
    } catch (error) {
        console.log(`❌ MemoryManager初期化エラー追跡失敗: ${error.message}`);
    }
    
    // SHORT_TERMクラス定義の確認
    try {
        const shortTermPath = 'src/lib/memory/short-term/short-term-memory.ts';
        const content = await fs.readFile(shortTermPath, 'utf8');
        
        // ShortTermMemoryクラスの定義確認
        const classMatch = content.match(/class\s+ShortTermMemory[^{]*\{/);
        if (classMatch) {
            console.log('\n📄 ShortTermMemoryクラス定義:');
            console.log(`   ${classMatch[0]}`);
        }
        
        // 初期化メソッドの有無を再確認
        const hasInitMethod = content.includes('initialize(');
        console.log(`\n🚀 ShortTermMemory.initialize()メソッド: ${hasInitMethod ? '存在' : '不存在'}`);
        
        if (!hasInitMethod) {
            console.log('   ❌ これが問題の根本原因です！');
            console.log('   MemoryManagerがshortTermMemory.initialize()を呼び出すが、メソッドが存在しない');
        }
        
    } catch (error) {
        console.log(`❌ ShortTermMemory分析エラー: ${error.message}`);
    }
}

async function identifyFixMethod() {
    console.log('🔧 修復方法の特定:');
    
    // 他の記憶層のinitialize()実装を参考にする
    const memoryLayers = [
        { name: 'MID_TERM', path: 'src/lib/memory/mid-term/mid-term-memory.ts' },
        { name: 'LONG_TERM', path: 'src/lib/memory/long-term/long-term-memory.ts' }
    ];
    
    for (const layer of memoryLayers) {
        try {
            const content = await fs.readFile(layer.path, 'utf8');
            
            // initialize()メソッドの実装を確認
            const initMethodMatch = content.match(/async\s+initialize\s*\([^{]*\)\s*\{[^}]*\}/s);
            if (initMethodMatch) {
                console.log(`\n📋 ${layer.name}のinitialize()実装:`);
                console.log('-----------------------------------');
                const method = initMethodMatch[0].replace(/\s+/g, ' ');
                console.log(method.substring(0, 200) + '...');
                
                // ディレクトリ作成処理があるかチェック
                if (method.includes('createDirectory') || method.includes('mkdir')) {
                    console.log('   ✅ ディレクトリ作成処理あり');
                } else {
                    console.log('   ❌ ディレクトリ作成処理なし');
                }
            } else {
                console.log(`\n❌ ${layer.name}: initialize()メソッドなし`);
            }
            
        } catch (error) {
            console.log(`❌ ${layer.name}分析エラー: ${error.message}`);
        }
    }
    
    // 修復方針の提示
    console.log('\n🎯 修復方針:');
    console.log('==============');
    
    console.log('1. 🔥 緊急修正: ShortTermMemoryクラスにinitialize()メソッドを追加');
    console.log('```typescript');
    console.log('class ShortTermMemory {');
    console.log('  async initialize(): Promise<void> {');
    console.log('    // ディレクトリ作成');
    console.log('    await storageProvider.createDirectory("data/short-term-memory");');
    console.log('    // 初期データファイル作成');
    console.log('    // ...other initialization...');
    console.log('  }');
    console.log('}');
    console.log('```');
    
    console.log('\n2. 🔧 根本修正: immediate-context.tsのcreateDirectoryを確実に実行');
    console.log('   - immediate-context.tsの初期化タイミングを確認');
    console.log('   - createDirectory呼び出しが条件分岐でスキップされていないか確認');
    
    console.log('\n3. 🛡️ エラーハンドリング強化: 初期化失敗を検出可能にする');
    console.log('   - MemoryManagerのinitialize()でエラーログを有効化');
    console.log('   - 各記憶層の初期化状況を個別にチェック');
    
    console.log('\n💡 推奨実行順序:');
    console.log('1. ShortTermMemoryクラスにinitialize()メソッド追加');
    console.log('2. システム再起動してディレクトリ作成確認');
    console.log('3. 問題が解決しない場合はimmediate-context.ts調査');
}

// 実行
debugShortTermInitialization();