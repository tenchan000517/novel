const fs = require('fs').promises;
const path = require('path');

console.log('🎬 記憶階層動的データフロー追跡調査');
console.log('=====================================');

async function traceRuntimeFlow() {
    try {
        console.log('\n🔍 STEP 1: システム初期化状況の確認');
        console.log('=========================================');
        
        // CharacterManagerとMemoryManagerの初期化チェック
        await checkInitializationStatus();
        
        console.log('\n📊 STEP 2: 現在のメモリ状態分析');
        console.log('===================================');
        
        // 各記憶階層の現在状態をチェック
        await analyzeCurrentMemoryState();
        
        console.log('\n🔄 STEP 3: データフロー動作確認');
        console.log('=================================');
        
        // 実際のデータフローをテスト
        await testDataFlow();
        
        console.log('\n🎯 STEP 4: 問題箇所の特定');
        console.log('=============================');
        
        // 不足している部分を特定
        await identifyMissingComponents();
        
        console.log('\n✅ 動的データフロー追跡調査完了');
        
    } catch (error) {
        console.error('❌ 調査中にエラーが発生:', error.message);
    }
}

async function checkInitializationStatus() {
    const initFiles = [
        'src/lib/lifecycle/service-container.ts',
        'src/app/api/generation/chapter/route.ts',
        'src/lib/character/character-manager.ts'
    ];
    
    for (const file of initFiles) {
        try {
            const content = await fs.readFile(file, 'utf8');
            
            // MemoryManager初期化パターンを検索
            const memoryManagerInits = content.match(/new MemoryManager\([^)]*\)/g);
            const characterManagerInits = content.match(/new CharacterManager\([^)]*\)/g);
            const memoryManagerRefs = content.match(/memoryManager\./g);
            
            console.log(`📁 ${file}:`);
            if (memoryManagerInits) {
                console.log(`   MemoryManager初期化: ${memoryManagerInits.length}個`);
                memoryManagerInits.forEach((init, i) => {
                    console.log(`     ${i+1}. ${init.substring(0, 60)}...`);
                });
            }
            if (characterManagerInits) {
                console.log(`   CharacterManager初期化: ${characterManagerInits.length}個`);
            }
            if (memoryManagerRefs) {
                console.log(`   MemoryManager参照: ${memoryManagerRefs.length}箇所`);
            }
            
        } catch (error) {
            console.log(`❌ ${file}: ファイルが見つかりません`);
        }
    }
}

async function analyzeCurrentMemoryState() {
    const memoryPaths = [
        'data/short-term-memory',
        'data/mid-term-memory', 
        'data/long-term-memory'
    ];
    
    for (const memoryPath of memoryPaths) {
        try {
            const files = await fs.readdir(memoryPath);
            console.log(`\n📂 ${memoryPath}:`);
            console.log(`   ファイル数: ${files.length}個`);
            
            let totalCharacterData = 0;
            let recentFiles = 0;
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            
            for (const file of files.slice(0, 5)) { // 最初の5ファイルのみチェック
                const filePath = path.join(memoryPath, file);
                const stats = await fs.stat(filePath);
                
                if (stats.mtime > oneDayAgo) recentFiles++;
                
                try {
                    const content = await fs.readFile(filePath, 'utf8');
                    console.log(`   📄 ${file}:`);
                    console.log(`      サイズ: ${(stats.size / 1024).toFixed(1)}KB`);
                    console.log(`      更新: ${stats.mtime.toISOString().split('T')[0]}`);
                    
                    // キャラクターデータの存在確認
                    const characterMatches = content.match(/character|Character/gi);
                    if (characterMatches) {
                        totalCharacterData += characterMatches.length;
                        console.log(`      キャラクター関連: ${characterMatches.length}箇所`);
                    }
                    
                    // JSONデータの構造確認
                    if (file.endsWith('.json')) {
                        try {
                            const data = JSON.parse(content);
                            const keys = Object.keys(data);
                            console.log(`      JSON構造: ${keys.length}個のキー`);
                            if (keys.length > 0) {
                                console.log(`      主要キー: ${keys.slice(0, 3).join(', ')}...`);
                            }
                        } catch (e) {
                            console.log(`      ⚠️ JSON解析エラー`);
                        }
                    }
                } catch (readError) {
                    console.log(`   ❌ ${file}: 読み込みエラー`);
                }
            }
            
            console.log(`   📊 総計: キャラクターデータ${totalCharacterData}箇所, 最近更新${recentFiles}ファイル`);
            
        } catch (error) {
            console.log(`❌ ${memoryPath}: アクセスできません (${error.message})`);
        }
    }
}

async function testDataFlow() {
    console.log('\n🧪 データフローテストを開始...');
    
    // CharacterManagerの実際の動作をテスト
    try {
        // service-container.tsの内容確認
        const serviceContainer = await fs.readFile('src/lib/lifecycle/service-container.ts', 'utf8');
        
        // MemoryManagerとCharacterManagerの連携部分を抽出
        const memoryManagerPattern = /const memoryManager = new MemoryManager\([^;]+;/g;
        const characterManagerPattern = /characterManager[^;]+;/g;
        const initializePattern = /await.*\.initialize\(\)/g;
        
        const memoryInits = serviceContainer.match(memoryManagerPattern);
        const characterInits = serviceContainer.match(characterManagerPattern);
        const initializes = serviceContainer.match(initializePattern);
        
        console.log('📋 service-container.ts の分析:');
        if (memoryInits) {
            console.log(`   MemoryManager初期化: ${memoryInits.length}箇所`);
            memoryInits.forEach((init, i) => {
                console.log(`     ${i+1}. ${init.replace(/\s+/g, ' ')}`);
            });
        }
        
        if (characterInits) {
            console.log(`   CharacterManager参照: ${characterInits.length}箇所`);
        } else {
            console.log('   ⚠️ CharacterManagerの参照が見つからない');
        }
        
        if (initializes) {
            console.log(`   初期化処理: ${initializes.length}箇所`);
        }
        
        // CharacterManagerでのMemoryManager使用確認
        const characterManager = await fs.readFile('src/lib/character/character-manager.ts', 'utf8');
        
        const memoryManagerUsage = characterManager.match(/this\.memoryManager|memoryManager\./g);
        const memoryManagerInjection = characterManager.match(/memoryManager\?:\s*MemoryManager/g);
        
        console.log('\n📋 character-manager.ts の分析:');
        if (memoryManagerUsage) {
            console.log(`   MemoryManager使用: ${memoryManagerUsage.length}箇所`);
        } else {
            console.log('   ❌ MemoryManagerの使用が見つからない');
        }
        
        if (memoryManagerInjection) {
            console.log(`   MemoryManager注入: ${memoryManagerInjection.length}箇所`);
        }
        
    } catch (error) {
        console.log(`❌ データフローテスト失敗: ${error.message}`);
    }
}

async function identifyMissingComponents() {
    console.log('\n🔍 不足コンポーネントの特定...');
    
    const components = [
        {
            name: 'SHORT_TERM記憶層データ',
            path: 'data/short-term-memory',
            required: true
        },
        {
            name: 'CharacterManager-MemoryManager連携',
            path: 'src/lib/character/character-manager.ts',
            pattern: /memoryManager.*inject|this\.memoryManager/
        },
        {
            name: '章処理時のキャラクターデータフロー',
            path: 'src/lib/generation/context-generator.ts',
            pattern: /processChapter.*character|character.*processChapter/
        },
        {
            name: 'MemoryManager章処理実装',
            path: 'src/lib/memory/core/memory-manager.ts',
            pattern: /async processChapter|addChapter/
        }
    ];
    
    for (const component of components) {
        try {
            if (component.path.startsWith('data/')) {
                // ディレクトリの存在確認
                const files = await fs.readdir(component.path);
                if (files.length > 0) {
                    console.log(`✅ ${component.name}: 存在 (${files.length}ファイル)`);
                } else {
                    console.log(`⚠️ ${component.name}: ディレクトリは存在するがファイルなし`);
                }
            } else {
                // ファイル内容のパターン確認
                const content = await fs.readFile(component.path, 'utf8');
                if (component.pattern && content.match(component.pattern)) {
                    const matches = content.match(component.pattern);
                    console.log(`✅ ${component.name}: 実装済み (${matches.length}箇所)`);
                } else if (component.pattern) {
                    console.log(`❌ ${component.name}: 実装されていない`);
                } else {
                    console.log(`✅ ${component.name}: ファイル存在`);
                }
            }
        } catch (error) {
            console.log(`❌ ${component.name}: 確認できません (${error.message})`);
        }
    }
    
    // 総合判定
    console.log('\n📊 総合判定:');
    console.log('==============');
    
    try {
        const shortTermExists = await fs.readdir('data/short-term-memory').then(files => files.length > 0).catch(() => false);
        const midTermExists = await fs.readdir('data/mid-term-memory').then(files => files.length > 0).catch(() => false);
        const longTermExists = await fs.readdir('data/long-term-memory').then(files => files.length > 0).catch(() => false);
        
        console.log('記憶階層状況:');
        console.log(`  SHORT_TERM: ${shortTermExists ? '✅' : '❌'}`);
        console.log(`  MID_TERM: ${midTermExists ? '✅' : '❌'}`);
        console.log(`  LONG_TERM: ${longTermExists ? '✅' : '❌'}`);
        
        // システムの健全性チェック
        const healthScore = (shortTermExists ? 1 : 0) + (midTermExists ? 1 : 0) + (longTermExists ? 1 : 0);
        
        console.log(`\n🎯 システム健全性: ${healthScore}/3 (${(healthScore/3*100).toFixed(1)}%)`);
        
        if (healthScore < 3) {
            console.log('\n🔧 推奨修正アクション:');
            
            if (!shortTermExists) {
                console.log('1. SHORT_TERM記憶層の初期化を実行');
                console.log('   → MemoryManagerのshortTermMemory.initialize()を確認');
            }
            
            console.log('2. CharacterManagerからMemoryManagerへのデータフロー確立');
            console.log('3. 章処理時のキャラクターデータ保存を有効化');
            console.log('4. 記憶階層間のデータ同期メカニズムの確認');
        } else {
            console.log('\n🎉 記憶階層システムは基本的に動作している可能性があります');
            console.log('   CharacterManagerとの連携状況を詳しく確認してください');
        }
        
    } catch (error) {
        console.log(`判定エラー: ${error.message}`);
    }
}

// 実行
traceRuntimeFlow();