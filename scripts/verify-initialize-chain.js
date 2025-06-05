const fs = require('fs').promises;

console.log('🔍 初期化チェーン断絶問題の確認と修正');
console.log('===================================');

async function verifyInitializeChain() {
    console.log('\n📊 STEP 1: ShortTermMemory.initialize()の実際の実装確認');
    console.log('==================================================');
    
    await verifyShortTermInitialize();
    
    console.log('\n🔍 STEP 2: immediate-context.tsのcreateDirectory呼び出しタイミング確認');
    console.log('============================================================');
    
    await verifyCreateDirectoryTiming();
    
    console.log('\n🔧 STEP 3: 他記憶層の成功パターン確認');
    console.log('===================================');
    
    await analyzeSuccessfulMemoryLayers();
    
    console.log('\n🚀 STEP 4: 実際の修正コード生成');
    console.log('==============================');
    
    await generateFixCode();
    
    console.log('\n✅ 初期化チェーン断絶問題の確認と修正完了');
}

async function verifyShortTermInitialize() {
    try {
        const shortTermPath = 'src/lib/memory/short-term/short-term-memory.ts';
        const content = await fs.readFile(shortTermPath, 'utf8');
        
        console.log('📄 ShortTermMemory.initialize()の実際の確認:');
        
        // より広範囲でinitialize()メソッドを検索
        const allMethods = content.match(/async\s+\w+\s*\([^{]*\)\s*\{[^}]*\}/gs);
        if (allMethods) {
            console.log(`\n📋 全非同期メソッド: ${allMethods.length}個`);
            
            let initializeFound = false;
            allMethods.forEach((method, i) => {
                const methodNameMatch = method.match(/async\s+(\w+)\s*\(/);
                const methodName = methodNameMatch ? methodNameMatch[1] : '不明';
                
                if (methodName.toLowerCase().includes('init')) {
                    console.log(`\n✅ 初期化関連メソッド発見: ${methodName}()`);
                    console.log('----------------------------------');
                    console.log(method);
                    initializeFound = true;
                } else {
                    console.log(`   ${i+1}. ${methodName}()`);
                }
            });
            
            if (!initializeFound) {
                console.log('\n❌ initialize()メソッドが存在しません！');
                console.log('   → これが問題の根本原因です');
            }
        }
        
        // シンプルなinitialize検索も実行
        const simpleInit = content.includes('initialize(') || content.includes('initialize :');
        console.log(`\n🔍 シンプル検索結果: initialize存在 = ${simpleInit}`);
        
        if (simpleInit) {
            // initialize周辺のコードを抽出
            const lines = content.split('\n');
            lines.forEach((line, i) => {
                if (line.includes('initialize')) {
                    console.log(`\n📄 ${i+1}行目: ${line.trim()}`);
                    // 前後の行も表示
                    if (i > 0) console.log(`${i}行目: ${lines[i-1].trim()}`);
                    if (i < lines.length - 1) console.log(`${i+2}行目: ${lines[i+1].trim()}`);
                }
            });
        }
        
        // クラス実装全体の構造確認
        const classStructure = content.match(/export\s+class\s+ShortTermMemory[^{]*\{([^}]+\{[^}]*\}[^}]*)*\}/s);
        if (classStructure) {
            console.log('\n🏗️ ShortTermMemoryクラス構造:');
            console.log('============================');
            const structure = classStructure[0];
            
            // メソッド定義を抽出
            const methodDefs = structure.match(/\s+(async\s+)?\w+\s*\([^)]*\)\s*[:{]/g);
            if (methodDefs) {
                console.log('メソッド一覧:');
                methodDefs.forEach(def => {
                    console.log(`   ${def.trim()}`);
                });
            }
        }
        
    } catch (error) {
        console.log(`❌ ShortTermMemory確認エラー: ${error.message}`);
    }
}

async function verifyCreateDirectoryTiming() {
    try {
        const immediatePath = 'src/lib/memory/short-term/immediate-context.ts';
        const content = await fs.readFile(immediatePath, 'utf8');
        
        console.log('📄 immediate-context.ts のcreateDirectory呼び出しタイミング:');
        
        // createDirectoryが含まれるメソッド全体を抽出
        const methods = content.match(/async\s+\w+\s*\([^{]*\)\s*\{[^}]*storageProvider\.createDirectory[^}]*\}/gs);
        if (methods) {
            console.log(`\n✅ createDirectoryを含むメソッド: ${methods.length}個`);
            methods.forEach((method, i) => {
                console.log(`\n--- メソッド ${i+1} ---`);
                console.log(method);
                
                const methodNameMatch = method.match(/async\s+(\w+)\s*\(/);
                const methodName = methodNameMatch ? methodNameMatch[1] : '不明';
                console.log(`メソッド名: ${methodName}()`);
            });
        } else {
            console.log('❌ createDirectoryを含むメソッドが見つかりません');
        }
        
        // createDirectoryの完全コンテキストを再確認
        const lines = content.split('\n');
        let createDirLineIndex = -1;
        
        lines.forEach((line, i) => {
            if (line.includes('storageProvider.createDirectory')) {
                createDirLineIndex = i;
                console.log(`\n📍 createDirectory発見: ${i+1}行目`);
                console.log(`現在行: ${line.trim()}`);
                
                // 前後10行を表示
                const start = Math.max(0, i - 5);
                const end = Math.min(lines.length - 1, i + 5);
                
                console.log('\n📋 周辺コンテキスト:');
                for (let j = start; j <= end; j++) {
                    const marker = j === i ? '>>> ' : '    ';
                    console.log(`${marker}${j+1}: ${lines[j].trim()}`);
                }
            }
        });
        
        if (createDirLineIndex === -1) {
            console.log('❌ createDirectoryが見つかりませんでした');
        }
        
        // このファイルのpublicメソッドを確認
        const publicMethods = content.match(/public\s+async\s+\w+|async\s+\w+(?=\s*\([^)]*\)\s*[:{])/g);
        if (publicMethods) {
            console.log('\n📋 パブリックメソッド:');
            publicMethods.forEach(method => {
                console.log(`   ${method}`);
            });
        }
        
    } catch (error) {
        console.log(`❌ immediate-context.ts確認エラー: ${error.message}`);
    }
}

async function analyzeSuccessfulMemoryLayers() {
    console.log('🔍 成功している記憶層の初期化パターン分析:');
    
    // mid-term, long-termがどうやってディレクトリを作成しているか確認
    const memoryLayers = [
        { name: 'MID_TERM', path: 'src/lib/memory/mid-term/mid-term-memory.ts' },
        { name: 'LONG_TERM', path: 'src/lib/memory/long-term/long-term-memory.ts' }
    ];
    
    for (const layer of memoryLayers) {
        try {
            const content = await fs.readFile(layer.path, 'utf8');
            console.log(`\n📄 ${layer.name} (${layer.path}):`);
            
            // initialize()メソッドの確認
            const hasInitialize = content.includes('initialize(');
            console.log(`   initialize()メソッド: ${hasInitialize ? '存在' : '不存在'}`);
            
            if (hasInitialize) {
                const initMethods = content.match(/async\s+initialize\s*\([^{]*\)\s*\{[^}]*\}/gs);
                if (initMethods) {
                    console.log('   initialize()実装:');
                    initMethods.forEach(method => {
                        console.log(`     ${method.replace(/\s+/g, ' ').substring(0, 100)}...`);
                    });
                }
            }
            
            // createDirectoryの使用
            const hasCreateDir = content.includes('createDirectory');
            console.log(`   createDirectory使用: ${hasCreateDir ? 'あり' : 'なし'}`);
            
            if (hasCreateDir) {
                const createDirCalls = content.match(/storageProvider\.createDirectory[^;]+;/g);
                if (createDirCalls) {
                    console.log('   createDirectory呼び出し:');
                    createDirCalls.forEach(call => {
                        console.log(`     ${call}`);
                    });
                }
            }
            
            // ファイル操作パターンの確認
            const fileOps = content.match(/storageProvider\.\w+/g);
            if (fileOps) {
                const uniqueOps = [...new Set(fileOps)];
                console.log(`   storageProvider操作: ${uniqueOps.join(', ')}`);
            }
            
        } catch (error) {
            console.log(`   ❌ ${layer.name}分析エラー: ${error.message}`);
        }
    }
    
    // データディレクトリが実際に存在することの再確認
    console.log('\n📂 実際のディレクトリ存在確認:');
    const dataDirs = ['data/mid-term-memory', 'data/long-term-memory'];
    
    for (const dir of dataDirs) {
        try {
            const stats = await fs.stat(dir);
            console.log(`   ✅ ${dir}: 存在 (作成: ${stats.birthtime.toISOString().split('T')[0]})`);
        } catch (error) {
            console.log(`   ❌ ${dir}: 存在しない`);
        }
    }
}

async function generateFixCode() {
    console.log('🔧 修正コードの生成:');
    
    console.log('\n📋 修正方針:');
    console.log('============');
    console.log('1. ShortTermMemoryクラスにinitialize()メソッドを追加');
    console.log('2. immediate-context.tsにprivate初期化メソッドを追加');
    console.log('3. createDirectoryを確実に呼び出すチェーンを構築');
    
    console.log('\n💻 修正コード1: ShortTermMemory.initialize()追加');
    console.log('===============================================');
    console.log('```typescript');
    console.log('// src/lib/memory/short-term/short-term-memory.ts に追加');
    console.log('');
    console.log('async initialize(): Promise<void> {');
    console.log('  if (this.initialized) {');
    console.log('    return;');
    console.log('  }');
    console.log('');
    console.log('  try {');
    console.log('    console.log("🚀 ShortTermMemory初期化開始");');
    console.log('    ');
    console.log('    // ディレクトリ作成');
    console.log('    await this.ensureDirectories();');
    console.log('    ');
    console.log('    // 各コンポーネント初期化');
    console.log('    await this.immediateContext.initialize();');
    console.log('    await this.generationCache.initialize();');
    console.log('    await this.processingBuffers.initialize();');
    console.log('    await this.temporaryAnalysis.initialize();');
    console.log('    ');
    console.log('    this.initialized = true;');
    console.log('    console.log("✅ ShortTermMemory初期化完了");');
    console.log('  } catch (error) {');
    console.log('    console.error("❌ ShortTermMemory初期化エラー:", error);');
    console.log('    throw error;');
    console.log('  }');
    console.log('}');
    console.log('');
    console.log('private async ensureDirectories(): Promise<void> {');
    console.log('  const { storageProvider } = await import("@/lib/storage");');
    console.log('  ');
    console.log('  const directories = [');
    console.log('    "data/short-term-memory",');
    console.log('    "data/short-term-memory/cache",');
    console.log('    "data/short-term-memory/context",');
    console.log('    "data/short-term-memory/buffers",');
    console.log('    "data/short-term-memory/analysis"');
    console.log('  ];');
    console.log('  ');
    console.log('  for (const dir of directories) {');
    console.log('    await storageProvider.createDirectory(dir);');
    console.log('    console.log(`📁 ディレクトリ作成: ${dir}`);');
    console.log('  }');
    console.log('}');
    console.log('```');
    
    console.log('\n💻 修正コード2: immediate-context.ts初期化メソッド追加');
    console.log('===============================================');
    console.log('```typescript');
    console.log('// src/lib/memory/short-term/immediate-context.ts に追加');
    console.log('');
    console.log('async initialize(): Promise<void> {');
    console.log('  try {');
    console.log('    console.log("🚀 ImmediateContext初期化開始");');
    console.log('    ');
    console.log('    // ディレクトリ確保');
    console.log('    const directory = "data/short-term-memory/context";');
    console.log('    await storageProvider.createDirectory(directory);');
    console.log('    ');
    console.log('    // 初期データファイル作成');
    console.log('    await this.ensureInitialFiles();');
    console.log('    ');
    console.log('    console.log("✅ ImmediateContext初期化完了");');
    console.log('  } catch (error) {');
    console.log('    console.error("❌ ImmediateContext初期化エラー:", error);');
    console.log('    throw error;');
    console.log('  }');
    console.log('}');
    console.log('');
    console.log('private async ensureInitialFiles(): Promise<void> {');
    console.log('  const initialData = {');
    console.log('    characterStates: {},');
    console.log('    activeCharacters: [],');
    console.log('    recentEvents: [],');
    console.log('    metadata: {');
    console.log('      initialized: new Date().toISOString(),');
    console.log('      version: "1.0.0"');
    console.log('    }');
    console.log('  };');
    console.log('  ');
    console.log('  const filePath = "data/short-term-memory/context/immediate-context.json";');
    console.log('  const exists = await storageProvider.fileExists(filePath);');
    console.log('  ');
    console.log('  if (!exists) {');
    console.log('    await storageProvider.writeFile(filePath, JSON.stringify(initialData, null, 2));');
    console.log('    console.log(`📄 初期ファイル作成: ${filePath}`);');
    console.log('  }');
    console.log('}');
    console.log('```');
    
    console.log('\n🎯 実行手順:');
    console.log('============');
    console.log('1. 上記コードをそれぞれのファイルに追加');
    console.log('2. TypeScriptコンパイルエラーがないか確認');
    console.log('3. 開発サーバーを再起動');
    console.log('4. MemoryManager初期化をテスト実行');
    console.log('5. data/short-term-memory/ ディレクトリが作成されることを確認');
}

// 実行
verifyInitializeChain();