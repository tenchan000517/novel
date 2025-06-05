const fs = require('fs').promises;
const path = require('path');

console.log('🔍 Storage Provider & 真の初期化システム調査');
console.log('=============================================');

async function investigateStorageProviderSystem() {
    console.log('\n📊 STEP 1: storageProvider実装の詳細調査');
    console.log('=========================================');
    
    await investigateStorageProvider();
    
    console.log('\n🔍 STEP 2: MemoryManagerの実際のinitialize()動作');
    console.log('===============================================');
    
    await investigateMemoryManagerInitialize();
    
    console.log('\n📂 STEP 3: データディレクトリがどこで作成されているか');
    console.log('==================================================');
    
    await investigateDirectoryCreation();
    
    console.log('\n🎯 STEP 4: 真の初期化システムの特定');
    console.log('=================================');
    
    await identifyTrueInitializationSystem();
    
    console.log('\n✅ Storage Provider & 真の初期化システム調査完了');
}

async function investigateStorageProvider() {
    const storagePaths = [
        'src/lib/storage/index.ts',
        'src/lib/storage/storage.ts', 
        'src/lib/storage/provider.ts',
        'src/lib/storage/storage-provider.ts'
    ];
    
    console.log('🔍 storageProvider関連ファイルの検索:');
    
    for (const storagePath of storagePaths) {
        try {
            const content = await fs.readFile(storagePath, 'utf8');
            console.log(`\n✅ ${storagePath} 発見:`);
            
            // ファイルサイズと基本情報
            const stats = await fs.stat(storagePath);
            const lines = content.split('\n').length;
            console.log(`   📊 ${(stats.size / 1024).toFixed(1)}KB, ${lines}行`);
            
            // ディレクトリ作成関連のコード検索
            const dirOps = content.match(/mkdir|mkdirSync|ensureDir|createDir/gi);
            if (dirOps) {
                console.log(`   📁 ディレクトリ操作: ${dirOps.length}箇所`);
                dirOps.slice(0, 5).forEach((op, i) => {
                    console.log(`      ${i+1}. ${op}`);
                });
            } else {
                console.log(`   ❌ ディレクトリ操作なし`);
            }
            
            // ファイル操作関連のコード検索
            const fileOps = content.match(/writeFile|readFile|createFile/gi);
            if (fileOps) {
                console.log(`   📄 ファイル操作: ${fileOps.length}箇所`);
            }
            
            // 初期化関連メソッド
            const initMethods = content.match(/initialize|init|setup/gi);
            if (initMethods) {
                console.log(`   🚀 初期化関連: ${initMethods.length}箇所`);
            }
            
            // memory関連のパス
            const memoryPaths = content.match(/memory|data\//gi);
            if (memoryPaths) {
                console.log(`   🧠 記憶層関連: ${memoryPaths.length}箇所`);
            }
            
            // クラスやエクスポートの確認
            const exports = content.match(/export\s+(class|const|function)\s+\w+/g);
            if (exports) {
                console.log(`   📦 エクスポート: ${exports.length}個`);
                exports.slice(0, 3).forEach(exp => {
                    console.log(`      ${exp}`);
                });
            }
            
        } catch (error) {
            console.log(`❌ ${storagePath}: ファイル未発見`);
        }
    }
    
    // storageProviderの使用箇所を検索
    console.log('\n📦 storageProviderの使用箇所検索:');
    await searchStorageProviderUsage();
}

async function searchStorageProviderUsage() {
    async function searchInDirectory(dir) {
        try {
            const items = await fs.readdir(dir, { withFileTypes: true });
            
            for (const item of items) {
                const fullPath = path.join(dir, item.name);
                
                if (item.isDirectory() && 
                    !item.name.startsWith('.') && 
                    !item.name.includes('node_modules') &&
                    !item.name.includes('dist')) {
                    await searchInDirectory(fullPath);
                } else if (item.isFile() && (item.name.endsWith('.ts') || item.name.endsWith('.js'))) {
                    try {
                        const content = await fs.readFile(fullPath, 'utf8');
                        if (content.includes('storageProvider')) {
                            const matches = content.match(/storageProvider\.\w+/g);
                            if (matches && matches.length > 0) {
                                console.log(`   📄 ${fullPath}:`);
                                const uniqueMatches = [...new Set(matches)];
                                uniqueMatches.slice(0, 5).forEach(match => {
                                    console.log(`      ${match}`);
                                });
                            }
                        }
                    } catch (readError) {
                        // スキップ
                    }
                }
            }
        } catch (error) {
            // スキップ
        }
    }
    
    await searchInDirectory('src');
}

async function investigateMemoryManagerInitialize() {
    try {
        const memoryManagerPath = 'src/lib/memory/core/memory-manager.ts';
        const content = await fs.readFile(memoryManagerPath, 'utf8');
        
        console.log('🔍 MemoryManager.initialize()の詳細分析:');
        
        // initialize()メソッドの完全な実装を抽出
        const initMethodMatch = content.match(/async\s+initialize\s*\([^{]*\)\s*\{[^}]*(?:\{[^}]*\}[^}]*)*\}/s);
        if (initMethodMatch) {
            console.log('\n📋 initialize()メソッドの完全実装:');
            console.log('----------------------------------------');
            const method = initMethodMatch[0];
            console.log(method);
            
            // 初期化シーケンスの抽出
            const initCalls = method.match(/await\s+[^;]+;/g);
            if (initCalls) {
                console.log('\n🔄 初期化シーケンス:');
                initCalls.forEach((call, i) => {
                    console.log(`   ${i+1}. ${call.trim()}`);
                });
            }
        }
        
        // ディレクトリ関連のメソッドを検索
        const dirMethods = content.match(/\w+\s*\([^)]*\)\s*[^{]*\{[^}]*(?:mkdir|ensureDir|createDir)[^}]*\}/gs);
        if (dirMethods) {
            console.log('\n📁 ディレクトリ関連メソッド:');
            dirMethods.forEach((method, i) => {
                console.log(`   ${i+1}. ${method.substring(0, 100)}...`);
            });
        }
        
        // 記憶層の初期化呼び出し
        const memoryInitCalls = content.match(/(shortTermMemory|midTermMemory|longTermMemory)\.initialize/g);
        if (memoryInitCalls) {
            console.log('\n🧠 記憶層初期化呼び出し:');
            memoryInitCalls.forEach(call => {
                console.log(`   ${call}`);
            });
        }
        
    } catch (error) {
        console.log(`❌ MemoryManager.initialize()調査エラー: ${error.message}`);
    }
}

async function investigateDirectoryCreation() {
    console.log('🔍 データディレクトリの作成履歴調査:');
    
    // 既存ディレクトリの作成時期を詳しく確認
    const dataDirs = ['data/mid-term-memory', 'data/long-term-memory'];
    
    for (const dir of dataDirs) {
        try {
            const stats = await fs.stat(dir);
            console.log(`\n📂 ${dir}:`);
            console.log(`   作成日時: ${stats.birthtime.toISOString()}`);
            console.log(`   変更日時: ${stats.mtime.toISOString()}`);
            console.log(`   アクセス日時: ${stats.atime.toISOString()}`);
            
            // サブディレクトリの確認
            const subItems = await fs.readdir(dir, { withFileTypes: true });
            console.log(`   サブアイテム: ${subItems.length}個`);
            
            for (const item of subItems.slice(0, 3)) {
                const subPath = path.join(dir, item.name);
                try {
                    const subStats = await fs.stat(subPath);
                    const type = item.isDirectory() ? '📁' : '📄';
                    console.log(`     ${type} ${item.name}: ${subStats.birthtime.toISOString().split('T')[0]}`);
                } catch (subError) {
                    console.log(`     ❌ ${item.name}: アクセス不可`);
                }
            }
            
        } catch (error) {
            console.log(`❌ ${dir}: 調査不可 - ${error.message}`);
        }
    }
    
    // スクリプトや初期化コードの検索
    console.log('\n🔍 初期化スクリプトの検索:');
    const scriptDirs = ['scripts', 'src/scripts', 'tools', 'setup'];
    
    for (const scriptDir of scriptDirs) {
        try {
            const files = await fs.readdir(scriptDir);
            const initFiles = files.filter(file => 
                file.includes('init') || 
                file.includes('setup') || 
                file.includes('create') ||
                file.includes('memory')
            );
            
            if (initFiles.length > 0) {
                console.log(`📁 ${scriptDir}/ の初期化関連ファイル:`);
                initFiles.forEach(file => {
                    console.log(`   📄 ${file}`);
                });
            }
        } catch (error) {
            // ディレクトリが存在しない場合はスキップ
        }
    }
}

async function identifyTrueInitializationSystem() {
    console.log('🎯 真の初期化システムの特定:');
    
    // package.jsonのスクリプトを確認
    try {
        const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
        if (packageJson.scripts) {
            console.log('\n📦 package.json スクリプト:');
            const relevantScripts = Object.entries(packageJson.scripts).filter(([key, value]) =>
                key.includes('init') || key.includes('setup') || value.includes('memory') || value.includes('init')
            );
            
            if (relevantScripts.length > 0) {
                relevantScripts.forEach(([key, value]) => {
                    console.log(`   ${key}: ${value}`);
                });
            } else {
                console.log('   ❌ 初期化関連スクリプトなし');
            }
        }
    } catch (error) {
        console.log('❌ package.json確認エラー');
    }
    
    // データベース初期化やマイグレーション関連の検索
    console.log('\n🔍 マイグレーション・初期化システムの検索:');
    const migrationPaths = [
        'src/lib/migrations',
        'data/migrations', 
        'src/db',
        'src/setup'
    ];
    
    for (const migPath of migrationPaths) {
        try {
            const files = await fs.readdir(migPath);
            console.log(`📁 ${migPath}/: ${files.length}ファイル`);
            files.slice(0, 5).forEach(file => {
                console.log(`   📄 ${file}`);
            });
        } catch (error) {
            console.log(`❌ ${migPath}: 存在しない`);
        }
    }
    
    // 最終的な推論
    console.log('\n🎯 推論結果:');
    console.log('==============');
    console.log('1. 記憶層のディレクトリ・ファイル操作は記憶層クラス自体で行われていない');
    console.log('2. storageProviderまたは外部システムが担当している可能性');
    console.log('3. mid-term, long-termは手動作成またはツールで作成された可能性');
    console.log('4. SHORT_TERMだけが初期化されていない = 実装不足');
    
    console.log('\n🔧 解決方針:');
    console.log('==============');
    console.log('A. storageProviderの実装を確認し、SHORT_TERM対応を追加');
    console.log('B. MemoryManagerで直接ディレクトリ作成を実装');
    console.log('C. 既存の初期化システムにSHORT_TERM追加');
}

// 実行
investigateStorageProviderSystem();