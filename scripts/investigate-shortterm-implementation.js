const fs = require('fs').promises;

console.log('🔍 SHORT_TERM記憶層実装詳細調査');
console.log('=====================================');

async function investigateShortTermImplementation() {
    console.log('\n📊 STEP 1: SHORT_TERM記憶層実装内容の詳細確認');
    console.log('==============================================');
    
    const shortTermFiles = [
        'src/lib/memory/short-term/short-term-memory.ts',
        'src/lib/memory/short-term/immediate-context.ts'
    ];
    
    for (const file of shortTermFiles) {
        await analyzeShortTermFile(file);
    }
    
    console.log('\n📊 STEP 2: 他記憶層との実装比較');
    console.log('==============================');
    
    await compareWithOtherMemoryLayers();
    
    console.log('\n🔧 STEP 3: 修正が必要な箇所の特定');
    console.log('===============================');
    
    await identifyRequiredFixes();
    
    console.log('\n✅ SHORT_TERM記憶層実装詳細調査完了');
}

async function analyzeShortTermFile(filePath) {
    try {
        const content = await fs.readFile(filePath, 'utf8');
        console.log(`\n📄 ${filePath}:`);
        console.log('='.repeat(60));
        
        // ファイルサイズと基本情報
        const stats = await fs.stat(filePath);
        const lines = content.split('\n').length;
        console.log(`📊 基本情報: ${(stats.size / 1024).toFixed(1)}KB, ${lines}行`);
        
        // initialize()メソッドの詳細分析
        const initMethods = content.match(/async\s+initialize\s*\([^{]*\)\s*\{[^}]*\}/gs);
        if (initMethods) {
            console.log(`\n🚀 initialize()メソッド: ${initMethods.length}個`);
            initMethods.forEach((method, i) => {
                console.log(`\n--- initialize()メソッド ${i+1} ---`);
                console.log(method.replace(/\s+/g, ' ').substring(0, 300) + '...');
                
                // ディレクトリ作成関連のコードをチェック
                if (method.includes('mkdir') || method.includes('ensureDir')) {
                    console.log('   ✅ ディレクトリ作成コードあり');
                } else {
                    console.log('   ❌ ディレクトリ作成コードなし');
                }
            });
        } else {
            console.log('❌ initialize()メソッドが見つかりません');
        }
        
        // データパス関連の分析
        const dataPathPattern = /['"`]data\/[^'"`]+['"`]/g;
        const dataPaths = content.match(dataPathPattern);
        if (dataPaths) {
            console.log(`\n📁 データパス: ${dataPaths.length}箇所`);
            [...new Set(dataPaths)].forEach(path => {
                console.log(`   ${path}`);
            });
        } else {
            console.log('\n📁 データパス: なし');
        }
        
        // ファイル操作関連の分析
        const fileOperations = [
            { name: 'ディレクトリ作成', pattern: /mkdir|mkdirSync|ensureDir/gi },
            { name: 'ファイル書き込み', pattern: /writeFile|writeFileSync/gi },
            { name: 'ファイル読み込み', pattern: /readFile|readFileSync/gi },
            { name: 'パス操作', pattern: /path\.join|path\.resolve/gi }
        ];
        
        console.log('\n📄 ファイル操作分析:');
        fileOperations.forEach(op => {
            const matches = content.match(op.pattern);
            console.log(`   ${op.name}: ${matches ? matches.length : 0}箇所`);
            if (matches && matches.length > 0) {
                matches.slice(0, 3).forEach(match => {
                    console.log(`      - ${match}`);
                });
            }
        });
        
        // クラス定義と主要メソッドの確認
        const classMatch = content.match(/class\s+(\w+)/);
        const methods = content.match(/async\s+\w+\s*\(/g);
        if (classMatch) {
            console.log(`\n🏗️ クラス名: ${classMatch[1]}`);
        }
        if (methods) {
            console.log(`📋 非同期メソッド数: ${methods.length}個`);
        }
        
        // エラーハンドリングの分析
        const errorHandling = content.match(/try\s*\{[^}]+\}\s*catch\s*\([^}]+\}/gs);
        if (errorHandling) {
            console.log(`\n🛡️ エラーハンドリング: ${errorHandling.length}箇所`);
        }
        
        // 依存関係の確認
        const imports = content.match(/import\s+.*from\s+['"][^'"]+['"]/g);
        if (imports) {
            console.log(`\n📦 インポート: ${imports.length}個`);
            const memoryRelated = imports.filter(imp => imp.includes('memory') || imp.includes('storage'));
            if (memoryRelated.length > 0) {
                console.log('   記憶層関連インポート:');
                memoryRelated.forEach(imp => {
                    console.log(`      ${imp}`);
                });
            }
        }
        
    } catch (error) {
        console.log(`❌ ${filePath}: 分析エラー - ${error.message}`);
    }
}

async function compareWithOtherMemoryLayers() {
    const memoryLayers = [
        { name: 'SHORT_TERM', path: 'src/lib/memory/short-term/short-term-memory.ts' },
        { name: 'MID_TERM', path: 'src/lib/memory/mid-term/mid-term-memory.ts' },
        { name: 'LONG_TERM', path: 'src/lib/memory/long-term/long-term-memory.ts' }
    ];
    
    const comparison = {};
    
    for (const layer of memoryLayers) {
        try {
            const content = await fs.readFile(layer.path, 'utf8');
            
            comparison[layer.name] = {
                exists: true,
                size: (await fs.stat(layer.path)).size,
                dirOps: (content.match(/mkdir|ensureDir|fs\.mkdir/gi) || []).length,
                fileOps: (content.match(/writeFile|createFile|fs\.writeFile/gi) || []).length,
                initMethods: (content.match(/async\s+initialize/gi) || []).length,
                dataPaths: (content.match(/data\//g) || []).length,
                errorHandling: (content.match(/try\s*\{[^}]+\}\s*catch/gs) || []).length
            };
        } catch (error) {
            comparison[layer.name] = {
                exists: false,
                error: error.message
            };
        }
    }
    
    // 比較結果の表示
    console.log('\n📊 記憶層実装比較表:');
    console.log('=====================================');
    console.log('項目                 SHORT_TERM  MID_TERM   LONG_TERM');
    console.log('-------------------------------------');
    
    const metrics = ['size', 'dirOps', 'fileOps', 'initMethods', 'dataPaths', 'errorHandling'];
    metrics.forEach(metric => {
        const short = comparison.SHORT_TERM[metric] || 0;
        const mid = comparison.MID_TERM[metric] || 0;
        const long = comparison.LONG_TERM[metric] || 0;
        
        let label = metric;
        if (metric === 'size') label = 'ファイルサイズ(B)';
        else if (metric === 'dirOps') label = 'ディレクトリ操作';
        else if (metric === 'fileOps') label = 'ファイル操作';
        else if (metric === 'initMethods') label = '初期化メソッド';
        else if (metric === 'dataPaths') label = 'データパス参照';
        else if (metric === 'errorHandling') label = 'エラーハンドリング';
        
        console.log(`${label.padEnd(20)} ${String(short).padStart(10)}  ${String(mid).padStart(9)}  ${String(long).padStart(9)}`);
    });
    
    // 問題点の特定
    console.log('\n🔍 比較分析結果:');
    if (comparison.SHORT_TERM.dirOps === 0 && (comparison.MID_TERM.dirOps > 0 || comparison.LONG_TERM.dirOps > 0)) {
        console.log('❌ SHORT_TERMのみディレクトリ操作が実装されていない');
    }
    if (comparison.SHORT_TERM.fileOps === 0 && (comparison.MID_TERM.fileOps > 0 || comparison.LONG_TERM.fileOps > 0)) {
        console.log('❌ SHORT_TERMのみファイル操作が実装されていない');
    }
    if (comparison.SHORT_TERM.size < comparison.MID_TERM.size * 0.5) {
        console.log('⚠️ SHORT_TERMの実装が他と比べて薄い可能性');
    }
}

async function identifyRequiredFixes() {
    console.log('🔧 修正が必要な箇所の特定と修正案提案');
    
    // 1. SHORT_TERM記憶層のinitialize()メソッド確認
    try {
        const shortTermContent = await fs.readFile('src/lib/memory/short-term/short-term-memory.ts', 'utf8');
        
        console.log('\n1️⃣ SHORT_TERM記憶層initialize()の修正が必要');
        console.log('   現在の実装にディレクトリ作成処理がない');
        
        // MID_TERMやLONG_TERMの実装を参考に修正案を提案
        console.log('\n📋 修正案:');
        console.log('```typescript');
        console.log('async initialize(): Promise<void> {');
        console.log('  // ディレクトリ作成処理を追加');
        console.log('  await this.ensureDataDirectories();');
        console.log('  ');
        console.log('  // 既存の初期化処理');
        console.log('  // ...existing code...');
        console.log('}');
        console.log('');
        console.log('private async ensureDataDirectories(): Promise<void> {');
        console.log('  const dirs = [');
        console.log('    "data/short-term-memory",');
        console.log('    "data/short-term-memory/cache",');
        console.log('    "data/short-term-memory/states"');
        console.log('  ];');
        console.log('  ');
        console.log('  for (const dir of dirs) {');
        console.log('    await fs.mkdir(dir, { recursive: true });');
        console.log('  }');
        console.log('}');
        console.log('```');
        
    } catch (error) {
        console.log('❌ SHORT_TERM記憶層ファイルの確認に失敗');
    }
    
    // 2. MemoryManagerでの統合初期化確認
    console.log('\n2️⃣ MemoryManagerでの統合的なディレクトリ作成');
    console.log('   各記憶層の初期化前に、全ディレクトリを作成');
    
    console.log('\n📋 MemoryManager修正案:');
    console.log('```typescript');
    console.log('async initialize(): Promise<void> {');
    console.log('  // 全記憶層のディレクトリを事前作成');
    console.log('  await this.ensureAllMemoryDirectories();');
    console.log('  ');
    console.log('  // 各記憶層の初期化');
    console.log('  await this.shortTermMemory.initialize();');
    console.log('  await this.midTermMemory.initialize();');
    console.log('  await this.longTermMemory.initialize();');
    console.log('}');
    console.log('```');
    
    // 3. CharacterManagerとの連携強化
    console.log('\n3️⃣ CharacterManagerとMemoryManagerの連携強化');
    console.log('   現在: 1箇所のみの使用 → より積極的な活用が必要');
    
    console.log('\n📋 CharacterManager強化案:');
    console.log('```typescript');
    console.log('// キャラクター状態変更時にMemoryManagerに保存');
    console.log('async updateCharacterState(characterId: string, state: CharacterState) {');
    console.log('  // 既存の更新処理');
    console.log('  // ...');
    console.log('  ');
    console.log('  // MemoryManagerに状態を保存');
    console.log('  if (this.memoryManager) {');
    console.log('    await this.memoryManager.shortTerm.saveCharacterState(characterId, state);');
    console.log('  }');
    console.log('}');
    console.log('```');
    
    // 優先順位の提示
    console.log('\n🎯 修正優先順位:');
    console.log('================');
    console.log('1. 🔥 高優先度: SHORT_TERM記憶層のディレクトリ作成実装');
    console.log('2. 🔧 中優先度: MemoryManagerの統合的ディレクトリ管理');
    console.log('3. 🚀 低優先度: CharacterManagerとの連携強化');
    
    console.log('\n💡 推奨実行順序:');
    console.log('1. まずSHORT_TERM記憶層の修正');
    console.log('2. 修正後のテスト実行');
    console.log('3. 正常動作確認後に連携強化');
}

// 実行
investigateShortTermImplementation();