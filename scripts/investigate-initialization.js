const fs = require('fs').promises;
const path = require('path');

console.log('🔍 システム初期化根本原因調査');
console.log('===============================');

async function investigateInitialization() {
    console.log('\n📊 STEP 1: 正しいCharacterManager分析');
    console.log('=====================================');
    
    await analyzeMainCharacterManager();
    
    console.log('\n🔍 STEP 2: MemoryManager初期化プロセス調査');
    console.log('==========================================');
    
    await analyzeMemoryManagerInitialization();
    
    console.log('\n⚙️ STEP 3: サービスコンテナ初期化順序確認');
    console.log('===========================================');
    
    await analyzeServiceContainerInitialization();
    
    console.log('\n🔄 STEP 4: 実際の起動プロセス追跡');
    console.log('==================================');
    
    await traceActualStartupProcess();
    
    console.log('\n🎯 STEP 5: SHORT_TERM記憶層問題の根本原因特定');
    console.log('===============================================');
    
    await identifyShortTermIssueRoot();
    
    console.log('\n✅ システム初期化根本原因調査完了');
}

async function analyzeMainCharacterManager() {
    const managerPath = 'src/lib/characters/manager.ts';
    
    try {
        const content = await fs.readFile(managerPath, 'utf8');
        console.log(`📄 ${managerPath} の詳細分析:`);
        
        // コンストラクタの分析
        const constructorMatch = content.match(/constructor\s*\([^}]+\)/s);
        if (constructorMatch) {
            console.log('🏗️ コンストラクタ:');
            const constructor = constructorMatch[0].replace(/\s+/g, ' ').substring(0, 200);
            console.log(`   ${constructor}...`);
            
            // memoryManagerパラメータの確認
            if (constructor.includes('memoryManager')) {
                console.log('   ✅ memoryManagerパラメータあり');
                
                // オプショナルか必須かを確認
                if (constructor.includes('memoryManager?:') || constructor.includes('memoryManager?: ')) {
                    console.log('   📋 memoryManagerはオプショナル');
                } else if (constructor.includes('memoryManager:')) {
                    console.log('   📋 memoryManagerは必須');
                }
            }
        }
        
        // MemoryManager使用箇所の分析
        const memoryUsagePattern = /this\.memoryManager\.[a-zA-Z]+/g;
        const memoryUsages = content.match(memoryUsagePattern);
        if (memoryUsages) {
            console.log(`📊 MemoryManager使用箇所: ${memoryUsages.length}箇所`);
            
            // ユニークなメソッド呼び出しを抽出
            const uniqueUsages = [...new Set(memoryUsages)].slice(0, 5);
            console.log('   主要な使用パターン:');
            uniqueUsages.forEach(usage => {
                console.log(`     ${usage}`);
            });
        }
        
        // 初期化関連メソッドの確認
        const initMethods = content.match(/async\s+initialize\s*\([^}]+\}/s);
        if (initMethods) {
            console.log('🚀 初期化メソッド発見:');
            const initMethod = initMethods[0].replace(/\s+/g, ' ').substring(0, 150);
            console.log(`   ${initMethod}...`);
        }
        
        // エラーハンドリングの確認
        const errorHandling = content.match(/try\s*\{[^}]+catch\s*\([^}]+\}/gs);
        if (errorHandling) {
            console.log(`🛡️ エラーハンドリング: ${errorHandling.length}箇所`);
        }
        
    } catch (error) {
        console.log(`❌ CharacterManager分析エラー: ${error.message}`);
    }
}

async function analyzeMemoryManagerInitialization() {
    const memoryManagerPath = 'src/lib/memory/core/memory-manager.ts';
    
    try {
        const content = await fs.readFile(memoryManagerPath, 'utf8');
        console.log(`📄 ${memoryManagerPath} の初期化分析:`);
        
        // 初期化メソッドの詳細分析
        const initMethodMatch = content.match(/async\s+initialize\s*\([^}]+\{[^}]+\}/s);
        if (initMethodMatch) {
            console.log('🚀 initialize()メソッド:');
            const initMethod = initMethodMatch[0].replace(/\s+/g, ' ');
            console.log(`   ${initMethod.substring(0, 300)}...`);
        }
        
        // SHORT_TERM記憶層初期化の確認
        const shortTermInit = content.match(/shortTermMemory.*initialize|ShortTermMemory.*initialize/gi);
        if (shortTermInit) {
            console.log(`📊 SHORT_TERM初期化コード: ${shortTermInit.length}箇所`);
            shortTermInit.forEach((code, i) => {
                console.log(`   ${i+1}. ${code}`);
            });
        } else {
            console.log('❌ SHORT_TERM初期化コードが見つからない');
        }
        
        // ディレクトリ作成関連のコード検索
        const dirCreation = content.match(/mkdir|mkdirSync|ensureDir|createDir/gi);
        if (dirCreation) {
            console.log(`📁 ディレクトリ作成コード: ${dirCreation.length}箇所`);
            dirCreation.forEach((code, i) => {
                console.log(`   ${i+1}. ${code}`);
            });
        } else {
            console.log('⚠️ ディレクトリ作成コードが見つからない');
        }
        
        // データファイル初期化関連のコード
        const fileInit = content.match(/writeFile|writeFileSync|\.json|data.*init/gi);
        if (fileInit) {
            console.log(`📄 ファイル初期化関連: ${fileInit.length}箇所`);
        }
        
        // エラーハンドリングでのログ出力
        const errorLogs = content.match(/console\.error|logger\.error|throw new Error/gi);
        if (errorLogs) {
            console.log(`🚨 エラーログ出力: ${errorLogs.length}箇所`);
        }
        
    } catch (error) {
        console.log(`❌ MemoryManager分析エラー: ${error.message}`);
    }
}

async function analyzeServiceContainerInitialization() {
    const serviceContainerPath = 'src/lib/lifecycle/service-container.ts';
    
    try {
        const content = await fs.readFile(serviceContainerPath, 'utf8');
        console.log(`📄 ${serviceContainerPath} の初期化順序分析:`);
        
        // 初期化順序の抽出
        const initSequence = content.match(/const\s+\w+\s*=\s*new\s+\w+|await\s+\w+\.initialize/g);
        if (initSequence) {
            console.log('🔄 初期化シーケンス:');
            initSequence.forEach((step, i) => {
                console.log(`   ${i+1}. ${step}`);
            });
        }
        
        // MemoryManagerとCharacterManagerの初期化関係
        const memoryManagerInit = content.match(/memoryManager.*=.*new.*MemoryManager[^;]+;/);
        const characterManagerInit = content.match(/characterManager.*=.*new.*CharacterManager[^;]+;|characterManager.*=.*createCharacterManager[^;]+;/);
        
        if (memoryManagerInit) {
            console.log('📊 MemoryManager初期化:');
            console.log(`   ${memoryManagerInit[0]}`);
        }
        
        if (characterManagerInit) {
            console.log('📊 CharacterManager初期化:');
            console.log(`   ${characterManagerInit[0]}`);
        }
        
        // 依存関係の確認
        const dependencyPattern = /new\s+CharacterManager\s*\([^)]*memoryManager[^)]*\)/;
        const dependency = content.match(dependencyPattern);
        if (dependency) {
            console.log('🔗 依存関係注入:');
            console.log(`   ${dependency[0]}`);
        } else {
            console.log('⚠️ CharacterManagerにMemoryManagerが注入されていない可能性');
        }
        
        // エラーハンドリング
        const tryBlocks = content.match(/try\s*\{[^}]+\}\s*catch\s*\([^}]+\}/gs);
        if (tryBlocks) {
            console.log(`🛡️ エラーハンドリングブロック: ${tryBlocks.length}個`);
        }
        
    } catch (error) {
        console.log(`❌ ServiceContainer分析エラー: ${error.message}`);
    }
}

async function traceActualStartupProcess() {
    console.log('🔍 実際の起動プロセスを追跡中...');
    
    // APIルートの初期化確認
    const apiRoute = 'src/app/api/generation/chapter/route.ts';
    
    try {
        const content = await fs.readFile(apiRoute, 'utf8');
        
        // getMemoryManager関数の分析
        const getMemoryManagerMatch = content.match(/async function getMemoryManager\(\)[^}]+\{[^}]+\}/s);
        if (getMemoryManagerMatch) {
            console.log('🎯 getMemoryManager()関数:');
            const func = getMemoryManagerMatch[0].replace(/\s+/g, ' ');
            console.log(`   ${func.substring(0, 200)}...`);
        }
        
        // 実際の初期化呼び出し
        const initCalls = content.match(/\.initialize\(\)|getMemoryManager\(\)/g);
        if (initCalls) {
            console.log(`📞 初期化呼び出し: ${initCalls.length}箇所`);
        }
        
        // エラーキャッチの確認
        const errorCatches = content.match(/catch\s*\([^)]+\)\s*\{[^}]+\}/gs);
        if (errorCatches) {
            console.log(`🚨 エラーキャッチ: ${errorCatches.length}箇所`);
            
            // エラーログの内容を確認
            errorCatches.slice(0, 2).forEach((catchBlock, i) => {
                const logMatch = catchBlock.match(/console\.error|logger\.error|\.error\(/);
                if (logMatch) {
                    console.log(`   エラーログ${i+1}: あり`);
                }
            });
        }
        
    } catch (error) {
        console.log(`❌ APIルート分析エラー: ${error.message}`);
    }
}

async function identifyShortTermIssueRoot() {
    console.log('🎯 SHORT_TERM記憶層問題の根本原因を特定中...');
    
    // SHORT_TERM記憶層実装ファイルの確認
    const shortTermFiles = [
        'src/lib/memory/short-term/short-term-memory.ts',
        'src/lib/memory/short-term/immediate-context.ts',
        'src/lib/memory/core/memory-manager.ts'
    ];
    
    const issues = [];
    
    for (const file of shortTermFiles) {
        try {
            const content = await fs.readFile(file, 'utf8');
            console.log(`📄 ${file}:`);
            
            // ディレクトリ作成関連のチェック
            const dirOps = content.match(/mkdir|ensureDir|fs\.mkdir|path\.join.*data/gi);
            if (dirOps) {
                console.log(`   ✅ ディレクトリ操作: ${dirOps.length}箇所`);
            } else {
                console.log(`   ❌ ディレクトリ操作なし`);
                issues.push(`${file}: ディレクトリ作成コードなし`);
            }
            
            // ファイル作成関連のチェック
            const fileOps = content.match(/writeFile|createFile|\.json.*write/gi);
            if (fileOps) {
                console.log(`   ✅ ファイル操作: ${fileOps.length}箇所`);
            } else {
                console.log(`   ❌ ファイル操作なし`);
                issues.push(`${file}: ファイル作成コードなし`);
            }
            
            // 初期化メソッドのチェック
            const initMethod = content.match(/async\s+initialize|initialize\s*\(/gi);
            if (initMethod) {
                console.log(`   ✅ 初期化メソッド: ${initMethod.length}箇所`);
            } else {
                console.log(`   ❌ 初期化メソッドなし`);
                issues.push(`${file}: 初期化メソッドなし`);
            }
            
        } catch (error) {
            console.log(`   ❌ ファイルアクセス不可: ${error.message}`);
            issues.push(`${file}: ファイルが存在しない`);
        }
    }
    
    // 根本原因の特定
    console.log('\n🔍 根本原因分析:');
    console.log('================');
    
    if (issues.length > 0) {
        console.log('❌ 発見された問題:');
        issues.forEach((issue, i) => {
            console.log(`   ${i+1}. ${issue}`);
        });
    }
    
    // データディレクトリの状況確認
    console.log('\n📁 データディレクトリ構造の確認:');
    try {
        const dataDir = await fs.readdir('data', { withFileTypes: true });
        const memoryDirs = dataDir.filter(item => 
            item.isDirectory() && item.name.includes('memory')
        );
        
        console.log('既存の記憶層ディレクトリ:');
        memoryDirs.forEach(dir => {
            console.log(`   📂 ${dir.name}/`);
        });
        
        if (!memoryDirs.some(dir => dir.name === 'short-term-memory')) {
            console.log('🎯 根本原因特定: SHORT_TERM記憶層ディレクトリが初期化時に作成されていない');
            
            // 他の記憶層の作成時期を確認
            for (const dir of memoryDirs) {
                const dirPath = path.join('data', dir.name);
                const stats = await fs.stat(dirPath);
                console.log(`   ${dir.name}: 作成日 ${stats.birthtime.toISOString().split('T')[0]}`);
            }
        }
        
    } catch (error) {
        console.log(`❌ データディレクトリアクセスエラー: ${error.message}`);
    }
    
    // 推奨修正方針の提示
    console.log('\n🔧 推奨修正方針:');
    console.log('================');
    console.log('1. MemoryManagerのinitialize()メソッドでのディレクトリ作成確認');
    console.log('2. SHORT_TERM記憶層クラスの初期化処理確認');
    console.log('3. サービスコンテナでの初期化順序確認');
    console.log('4. エラーログの確認（初期化失敗の詳細）');
}

// 実行
investigateInitialization();