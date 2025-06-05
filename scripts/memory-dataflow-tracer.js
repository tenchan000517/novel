#!/usr/bin/env node

/**
 * 🔍 記憶階層データフロー追跡調査スクリプト
 * 現在のMemoryManagerとCharacterManagerの連携状況を詳細調査
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 記憶階層データフロー追跡調査');
console.log('================================');

// ============================================================================
// STEP 1: MemoryManagerの初期化と連携箇所の調査
// ============================================================================

console.log('\n📊 STEP 1: MemoryManager初期化箇所の調査');
console.log('==========================================');

const memorySystemPaths = [
    'src/lib/memory',
    'src/lib/characters/manager.ts',
    'src/lib/characters/services',
    'src/lib/lifecycle',
    'src/app'
];

function analyzeMemoryInitialization() {
    console.log('MemoryManager初期化パターンを検索中...');
    
    const initPatterns = [
        'new MemoryManager',
        'createMemoryManager',
        'getMemoryManager',
        'memoryManager.initialize',
        'MemoryManager.getInstance'
    ];

    const results = [];

    function searchInFile(filePath, patterns) {
        try {
            if (!fs.existsSync(filePath)) return [];
            
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n');
            const matches = [];
            
            lines.forEach((line, index) => {
                patterns.forEach(pattern => {
                    if (line.includes(pattern)) {
                        matches.push({
                            line: index + 1,
                            content: line.trim(),
                            pattern
                        });
                    }
                });
            });
            
            return matches;
        } catch (error) {
            return [];
        }
    }

    function searchInDirectory(dirPath, depth = 0) {
        if (depth > 3) return;
        
        try {
            if (!fs.existsSync(dirPath)) return;
            
            const items = fs.readdirSync(dirPath);
            
            for (const item of items) {
                const fullPath = path.join(dirPath, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    searchInDirectory(fullPath, depth + 1);
                } else if (item.endsWith('.ts') || item.endsWith('.js')) {
                    const matches = searchInFile(fullPath, initPatterns);
                    
                    if (matches.length > 0) {
                        results.push({
                            file: fullPath,
                            matches: matches
                        });
                    }
                }
            }
        } catch (error) {
            // エラーは無視
        }
    }

    // 各パスを検索
    memorySystemPaths.forEach(searchPath => {
        if (fs.existsSync(searchPath)) {
            const stat = fs.statSync(searchPath);
            if (stat.isDirectory()) {
                searchInDirectory(searchPath);
            } else {
                const matches = searchInFile(searchPath, initPatterns);
                if (matches.length > 0) {
                    results.push({
                        file: searchPath,
                        matches: matches
                    });
                }
            }
        }
    });

    return results;
}

const initResults = analyzeMemoryInitialization();

console.log(`📄 ${initResults.length}個のファイルでMemoryManager初期化を発見:`);
initResults.forEach(result => {
    console.log(`\n📁 ${result.file}:`);
    result.matches.forEach(match => {
        console.log(`   行${match.line}: ${match.content}`);
    });
});

// ============================================================================
// STEP 2: CharacterManagerとMemoryManagerの連携パターン調査
// ============================================================================

console.log('\n🔗 STEP 2: CharacterManager-MemoryManager連携調査');
console.log('=================================================');

function analyzeCharacterMemoryIntegration() {
    const integrationPatterns = [
        'characterManager',
        'memoryManager',
        'shortTermMemory',
        'midTermMemory', 
        'longTermMemory',
        'characterDatabase',
        'characterEvolution',
        'processChapter'
    ];

    const characterManagerPath = 'src/lib/characters/manager.ts';
    
    if (!fs.existsSync(characterManagerPath)) {
        console.log('❌ CharacterManager.tsが見つかりません');
        return null;
    }

    try {
        const content = fs.readFileSync(characterManagerPath, 'utf8');
        const lines = content.split('\n');
        
        const integrationPoints = [];
        
        lines.forEach((line, index) => {
            integrationPatterns.forEach(pattern => {
                if (line.toLowerCase().includes(pattern.toLowerCase())) {
                    integrationPoints.push({
                        line: index + 1,
                        content: line.trim(),
                        pattern,
                        type: classifyIntegrationType(line, pattern)
                    });
                }
            });
        });

        return integrationPoints;
    } catch (error) {
        console.log(`❌ CharacterManagerの読み込みエラー: ${error.message}`);
        return null;
    }
}

function classifyIntegrationType(line, pattern) {
    if (line.includes('constructor') || line.includes('private') || line.includes('readonly')) {
        return 'INJECTION';
    }
    if (line.includes('await') || line.includes('async')) {
        return 'ASYNC_CALL';
    }
    if (line.includes('=') && line.includes('new')) {
        return 'CREATION';
    }
    if (line.includes('.')) {
        return 'METHOD_CALL';
    }
    return 'REFERENCE';
}

const integrationResults = analyzeCharacterMemoryIntegration();

if (integrationResults) {
    console.log(`📋 CharacterManagerで${integrationResults.length}個の連携ポイントを発見:`);
    
    const groupedResults = integrationResults.reduce((acc, result) => {
        if (!acc[result.type]) acc[result.type] = [];
        acc[result.type].push(result);
        return acc;
    }, {});

    Object.entries(groupedResults).forEach(([type, results]) => {
        console.log(`\n🔧 ${type}:`);
        results.forEach(result => {
            console.log(`   行${result.line}: ${result.content}`);
        });
    });
} else {
    console.log('❌ CharacterManagerの連携分析に失敗しました');
}

// ============================================================================
// STEP 3: 記憶階層の実際のデータ構造調査
// ============================================================================

console.log('\n💾 STEP 3: 記憶階層データ構造の調査');
console.log('===================================');

function analyzeMemoryLayerStructure() {
    const memoryLayers = [
        {
            name: 'ShortTermMemory',
            paths: [
                'src/lib/memory/short-term/short-term-memory.ts',
                'src/lib/memory/short-term/immediate-context.ts'
            ]
        },
        {
            name: 'MidTermMemory', 
            paths: [
                'src/lib/memory/mid-term/mid-term-memory.ts',
                'src/lib/memory/mid-term/character-evolution.ts'
            ]
        },
        {
            name: 'LongTermMemory',
            paths: [
                'src/lib/memory/long-term/long-term-memory.ts',
                'src/lib/memory/long-term/character-database.ts'
            ]
        }
    ];

    const analysisResults = [];

    memoryLayers.forEach(layer => {
        layer.paths.forEach(layerPath => {
            if (fs.existsSync(layerPath)) {
                try {
                    const content = fs.readFileSync(layerPath, 'utf8');
                    
                    // キャラクター関連メソッドの検索
                    const characterMethods = extractCharacterMethods(content);
                    
                    // データ構造の分析
                    const dataStructures = extractDataStructures(content);
                    
                    analysisResults.push({
                        layer: layer.name,
                        file: layerPath,
                        characterMethods,
                        dataStructures,
                        hasCharacterSupport: characterMethods.length > 0
                    });
                    
                } catch (error) {
                    console.log(`⚠️ ${layerPath}の読み込みエラー: ${error.message}`);
                }
            } else {
                console.log(`❌ ${layerPath}が見つかりません`);
            }
        });
    });

    return analysisResults;
}

function extractCharacterMethods(content) {
    const methods = [];
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
        if ((line.includes('character') || line.includes('Character')) && 
            (line.includes('async') || line.includes('function') || line.includes(': '))) {
            methods.push({
                line: index + 1,
                content: line.trim()
            });
        }
    });
    
    return methods;
}

function extractDataStructures(content) {
    const structures = [];
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
        if ((line.includes('interface') || line.includes('type') || line.includes('class')) &&
            (line.includes('Character') || line.includes('character'))) {
            structures.push({
                line: index + 1,
                content: line.trim()
            });
        }
    });
    
    return structures;
}

const memoryStructureResults = analyzeMemoryLayerStructure();

console.log('記憶階層のキャラクター対応状況:');
memoryStructureResults.forEach(result => {
    console.log(`\n📊 ${result.layer} (${path.basename(result.file)}):`);
    console.log(`   キャラクター対応: ${result.hasCharacterSupport ? '✅' : '❌'}`);
    console.log(`   キャラクター関連メソッド: ${result.characterMethods.length}個`);
    console.log(`   データ構造: ${result.dataStructures.length}個`);
    
    if (result.characterMethods.length > 0) {
        console.log('   主要メソッド:');
        result.characterMethods.slice(0, 3).forEach(method => {
            console.log(`     行${method.line}: ${method.content}`);
        });
    }
});

// ============================================================================
// STEP 4: 章処理時のキャラクターデータフロー追跡
// ============================================================================

console.log('\n📖 STEP 4: 章処理でのキャラクターデータフロー');
console.log('==========================================');

function analyzeChapterProcessingFlow() {
    const chapterProcessingFiles = [
        'src/lib/generation/context-generator.ts',
        'src/lib/memory/core/memory-manager.ts',
        'src/lib/lifecycle',
        'src/app'
    ];

    const dataflowResults = [];

    chapterProcessingFiles.forEach(filePath => {
        if (fs.existsSync(filePath)) {
            if (fs.statSync(filePath).isDirectory()) {
                // ディレクトリの場合、中のファイルを検索
                searchChapterProcessingInDir(filePath, dataflowResults);
            } else {
                // ファイルの場合、直接分析
                analyzeChapterProcessingFile(filePath, dataflowResults);
            }
        }
    });

    return dataflowResults;
}

function searchChapterProcessingInDir(dirPath, results) {
    try {
        const items = fs.readdirSync(dirPath);
        items.forEach(item => {
            const fullPath = path.join(dirPath, item);
            if (fs.statSync(fullPath).isFile() && 
                (item.endsWith('.ts') || item.endsWith('.js'))) {
                analyzeChapterProcessingFile(fullPath, results);
            }
        });
    } catch (error) {
        // エラーは無視
    }
}

function analyzeChapterProcessingFile(filePath, results) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        
        const chapterFlowPatterns = [
            'processChapter',
            'addChapter', 
            'updateCharacterState',
            'recordAppearance',
            'characterEvolution',
            'memoryManager.process'
        ];

        const matches = [];
        
        lines.forEach((line, index) => {
            chapterFlowPatterns.forEach(pattern => {
                if (line.includes(pattern)) {
                    matches.push({
                        line: index + 1,
                        content: line.trim(),
                        pattern
                    });
                }
            });
        });

        if (matches.length > 0) {
            results.push({
                file: filePath,
                matches
            });
        }
    } catch (error) {
        // エラーは無視
    }
}

const chapterFlowResults = analyzeChapterProcessingFlow();

console.log(`📄 ${chapterFlowResults.length}個のファイルで章処理フローを発見:`);
chapterFlowResults.forEach(result => {
    console.log(`\n📁 ${result.file}:`);
    result.matches.forEach(match => {
        console.log(`   行${match.line}: ${match.content}`);
    });
});

// ============================================================================
// STEP 5: 総合分析と推奨事項
// ============================================================================

console.log('\n📋 STEP 5: 総合分析結果');
console.log('========================');

console.log('\n🎯 判明した現在の設計状況:');
console.log(`✅ MemoryManager初期化箇所: ${initResults.length}個`);
console.log(`🔗 CharacterManager連携ポイント: ${integrationResults ? integrationResults.length : 0}個`);
console.log(`💾 記憶階層のキャラクター対応: ${memoryStructureResults.filter(r => r.hasCharacterSupport).length}/${memoryStructureResults.length}層`);
console.log(`📖 章処理フロー実装: ${chapterFlowResults.length}個のファイル`);

console.log('\n🔍 次に詳細調査すべき項目:');
console.log('1. MemoryManagerの実際の初期化タイミング');
console.log('2. CharacterManagerがMemoryManagerと実際に連携しているか');
console.log('3. 章処理時のキャラクターデータの流れ方');
console.log('4. 各記憶階層でのキャラクターデータ永続化方式');

console.log('\n✅ 記憶階層データフロー追跡調査完了');