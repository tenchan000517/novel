#!/usr/bin/env node

/**
 * 🔬 記憶階層実データ内容調査スクリプト
 * 各記憶階層に実際に保存されているキャラクターデータを調査
 */

const fs = require('fs');
const path = require('path');

console.log('🔬 記憶階層実データ内容調査');
console.log('===========================');

// ============================================================================
// STEP 1: 各記憶階層のデータファイル発見・調査
// ============================================================================

console.log('\n📊 STEP 1: 記憶階層データファイルの発見');
console.log('=======================================');

const memoryDataPaths = [
    // 短期記憶関連
    { 
        layer: 'SHORT_TERM',
        paths: [
            'data/memory/short-term',
            'data/short-term-memory',
            'short-term-memory',
            'memory/short-term'
        ]
    },
    // 中期記憶関連
    {
        layer: 'MID_TERM', 
        paths: [
            'data/memory/mid-term',
            'data/mid-term-memory',
            'mid-term-memory',
            'memory/mid-term'
        ]
    },
    // 長期記憶関連
    {
        layer: 'LONG_TERM',
        paths: [
            'data/memory/long-term',
            'data/long-term-memory', 
            'long-term-memory',
            'memory/long-term'
        ]
    }
];

function findMemoryDataFiles() {
    const foundFiles = [];

    memoryDataPaths.forEach(layerConfig => {
        layerConfig.paths.forEach(searchPath => {
            if (fs.existsSync(searchPath)) {
                try {
                    const stat = fs.statSync(searchPath);
                    if (stat.isDirectory()) {
                        const files = scanDirectoryForData(searchPath);
                        files.forEach(file => {
                            foundFiles.push({
                                layer: layerConfig.layer,
                                file: file,
                                basePath: searchPath
                            });
                        });
                    }
                } catch (error) {
                    console.log(`⚠️ ${searchPath}のアクセスエラー: ${error.message}`);
                }
            }
        });
    });

    return foundFiles;
}

function scanDirectoryForData(dirPath, depth = 0) {
    const files = [];
    
    if (depth > 3) return files; // 深さ制限
    
    try {
        const items = fs.readdirSync(dirPath);
        
        items.forEach(item => {
            const fullPath = path.join(dirPath, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                files.push(...scanDirectoryForData(fullPath, depth + 1));
            } else if (item.endsWith('.json') || item.endsWith('.yaml') || item.endsWith('.yml')) {
                files.push(fullPath);
            }
        });
    } catch (error) {
        // エラーは無視
    }
    
    return files;
}

const memoryFiles = findMemoryDataFiles();

console.log(`📄 ${memoryFiles.length}個のメモリデータファイルを発見:`);

const layerGroups = memoryFiles.reduce((acc, file) => {
    if (!acc[file.layer]) acc[file.layer] = [];
    acc[file.layer].push(file);
    return acc;
}, {});

Object.entries(layerGroups).forEach(([layer, files]) => {
    console.log(`\n💾 ${layer}: ${files.length}個のファイル`);
    files.forEach(file => {
        console.log(`   📁 ${file.file}`);
    });
});

// ============================================================================
// STEP 2: 各ファイルのキャラクターデータ内容分析
// ============================================================================

console.log('\n🔍 STEP 2: キャラクターデータ内容の詳細分析');
console.log('==========================================');

function analyzeCharacterDataInFiles() {
    const analysisResults = [];

    memoryFiles.forEach(fileInfo => {
        try {
            console.log(`\n🔬 分析中: ${path.basename(fileInfo.file)}`);
            
            const content = fs.readFileSync(fileInfo.file, 'utf8');
            let data;
            
            if (fileInfo.file.endsWith('.json')) {
                data = JSON.parse(content);
            } else {
                // YAML の簡易パース（js-yamlが利用可能な場合のみ）
                try {
                    const yaml = require('js-yaml');
                    data = yaml.load(content);
                } catch (yamlError) {
                    console.log(`   ⚠️ YAML解析スキップ（js-yamlが必要）`);
                    return;
                }
            }

            const characterAnalysis = analyzeDataForCharacters(data, fileInfo);
            
            if (characterAnalysis.hasCharacterData) {
                analysisResults.push(characterAnalysis);
            }
            
        } catch (error) {
            console.log(`   ❌ 分析エラー: ${error.message}`);
        }
    });

    return analysisResults;
}

function analyzeDataForCharacters(data, fileInfo) {
    const analysis = {
        file: fileInfo.file,
        layer: fileInfo.layer,
        hasCharacterData: false,
        characterCount: 0,
        dataStructure: {},
        characterExamples: [],
        dataTypes: new Set()
    };

    function scanForCharacters(obj, path = '') {
        if (!obj || typeof obj !== 'object') return;

        Object.entries(obj).forEach(([key, value]) => {
            const currentPath = path ? `${path}.${key}` : key;
            
            // キャラクター関連データの検出
            if (key.toLowerCase().includes('character') || 
                key.toLowerCase().includes('sato') ||
                key.toLowerCase().includes('suzuki') ||
                key.toLowerCase().includes('takahashi') ||
                key.toLowerCase().includes('nakamura') ||
                key.toLowerCase().includes('yamada')) {
                
                analysis.hasCharacterData = true;
                analysis.characterCount++;
                
                if (analysis.characterExamples.length < 3) {
                    analysis.characterExamples.push({
                        path: currentPath,
                        sample: JSON.stringify(value, null, 2).substring(0, 200) + '...'
                    });
                }
            }

            // データ型の記録
            if (value !== null) {
                analysis.dataTypes.add(typeof value);
                if (Array.isArray(value)) {
                    analysis.dataTypes.add('array');
                }
            }

            // 再帰的スキャン
            if (typeof value === 'object' && value !== null) {
                scanForCharacters(value, currentPath);
            }
        });
    }

    // データ構造の分析
    if (Array.isArray(data)) {
        analysis.dataStructure.type = 'array';
        analysis.dataStructure.length = data.length;
        if (data.length > 0) {
            scanForCharacters(data[0], '[0]');
        }
    } else if (typeof data === 'object' && data !== null) {
        analysis.dataStructure.type = 'object';
        analysis.dataStructure.topLevelKeys = Object.keys(data);
        scanForCharacters(data);
    }

    analysis.dataTypes = Array.from(analysis.dataTypes);
    
    return analysis;
}

const characterDataAnalysis = analyzeCharacterDataInFiles();

console.log(`\n📊 キャラクターデータを含むファイル: ${characterDataAnalysis.length}個`);

characterDataAnalysis.forEach(analysis => {
    console.log(`\n📄 ${path.basename(analysis.file)} [${analysis.layer}]:`);
    console.log(`   キャラクター関連エントリ: ${analysis.characterCount}個`);
    console.log(`   データ構造: ${analysis.dataStructure.type}`);
    console.log(`   データ型: ${analysis.dataTypes.join(', ')}`);
    
    if (analysis.dataStructure.topLevelKeys) {
        console.log(`   トップレベルキー: ${analysis.dataStructure.topLevelKeys.slice(0, 5).join(', ')}`);
    }
    
    if (analysis.characterExamples.length > 0) {
        console.log('   キャラクターデータ例:');
        analysis.characterExamples.forEach(example => {
            console.log(`     ${example.path}:`);
            console.log(`       ${example.sample}`);
        });
    }
});

// ============================================================================
// STEP 3: データの更新頻度・永続化パターン分析
// ============================================================================

console.log('\n📈 STEP 3: データ更新頻度・永続化パターン分析');
console.log('============================================');

function analyzeDataPersistencePatterns() {
    const patterns = [];

    characterDataAnalysis.forEach(analysis => {
        try {
            const stat = fs.statSync(analysis.file);
            const modifiedTime = stat.mtime;
            const createdTime = stat.birthtime || stat.ctime;
            const fileSize = stat.size;
            
            patterns.push({
                file: path.basename(analysis.file),
                layer: analysis.layer,
                lastModified: modifiedTime.toISOString(),
                created: createdTime.toISOString(),
                sizeBytes: fileSize,
                characterCount: analysis.characterCount,
                ageInDays: Math.floor((Date.now() - modifiedTime.getTime()) / (1000 * 60 * 60 * 24))
            });
        } catch (error) {
            console.log(`⚠️ ${analysis.file}の統計取得エラー: ${error.message}`);
        }
    });

    return patterns;
}

const persistencePatterns = analyzeDataPersistencePatterns();

console.log('ファイル更新パターン分析:');
persistencePatterns
    .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
    .forEach(pattern => {
        console.log(`\n📁 ${pattern.file} [${pattern.layer}]:`);
        console.log(`   最終更新: ${pattern.lastModified} (${pattern.ageInDays}日前)`);
        console.log(`   ファイルサイズ: ${pattern.sizeBytes} bytes`);
        console.log(`   キャラクター数: ${pattern.characterCount}`);
    });

// ============================================================================
// STEP 4: 記憶階層間のデータ重複・整合性チェック
// ============================================================================

console.log('\n🔄 STEP 4: 記憶階層間のデータ重複・整合性チェック');
console.log('=============================================');

function checkDataConsistencyAcrossLayers() {
    const characterDataByLayer = {};
    
    // 各層のキャラクターデータを収集
    characterDataAnalysis.forEach(analysis => {
        if (!characterDataByLayer[analysis.layer]) {
            characterDataByLayer[analysis.layer] = [];
        }
        
        characterDataByLayer[analysis.layer].push({
            file: analysis.file,
            characterCount: analysis.characterCount,
            examples: analysis.characterExamples
        });
    });

    const consistencyReport = {
        layersWithData: Object.keys(characterDataByLayer),
        totalCharacterEntries: 0,
        potentialDuplicates: [],
        missingLayers: []
    };

    // 各層の特徴分析
    Object.entries(characterDataByLayer).forEach(([layer, data]) => {
        const totalEntries = data.reduce((sum, file) => sum + file.characterCount, 0);
        consistencyReport.totalCharacterEntries += totalEntries;
        
        console.log(`\n📊 ${layer}層:`);
        console.log(`   ファイル数: ${data.length}`);
        console.log(`   総キャラクターエントリ: ${totalEntries}`);
        
        data.forEach(fileData => {
            console.log(`     📄 ${path.basename(fileData.file)}: ${fileData.characterCount}エントリ`);
        });
    });

    // 期待される記憶階層の確認
    const expectedLayers = ['SHORT_TERM', 'MID_TERM', 'LONG_TERM'];
    const missingLayers = expectedLayers.filter(layer => !characterDataByLayer[layer]);
    
    if (missingLayers.length > 0) {
        console.log(`\n⚠️ データが見つからない記憶階層: ${missingLayers.join(', ')}`);
        consistencyReport.missingLayers = missingLayers;
    }

    return consistencyReport;
}

const consistencyReport = checkDataConsistencyAcrossLayers();

// ============================================================================
// STEP 5: 総合評価と推奨事項
// ============================================================================

console.log('\n📋 STEP 5: 総合評価と推奨事項');
console.log('=============================');

console.log('\n🎯 調査結果サマリー:');
console.log(`💾 発見されたメモリファイル: ${memoryFiles.length}個`);
console.log(`🎭 キャラクターデータを含むファイル: ${characterDataAnalysis.length}個`);
console.log(`📊 データを持つ記憶階層: ${consistencyReport.layersWithData.join(', ')}`);
console.log(`📈 総キャラクターエントリ数: ${consistencyReport.totalCharacterEntries}`);

console.log('\n🔍 設計上の問題点:');
if (consistencyReport.missingLayers.length > 0) {
    console.log(`❌ データが不足している記憶階層: ${consistencyReport.missingLayers.join(', ')}`);
}

if (characterDataAnalysis.length === 0) {
    console.log('❌ 記憶階層にキャラクターデータが全く保存されていない');
    console.log('   → CharacterManagerが記憶階層と連携していない可能性');
}

if (characterDataAnalysis.length > 0) {
    const recentFiles = persistencePatterns.filter(p => p.ageInDays < 7);
    console.log(`✅ 最近更新されたファイル: ${recentFiles.length}個`);
    
    if (recentFiles.length === 0) {
        console.log('⚠️ 全てのメモリファイルが1週間以上更新されていない');
        console.log('   → 記憶システムが動作していない可能性');
    }
}

console.log('\n🛠️ 次に実行すべき調査:');
console.log('1. CharacterManagerが実際にMemoryManagerと連携しているかの確認');
console.log('2. 章処理時にキャラクターデータが各記憶階層に流れているかの確認');
console.log('3. 記憶階層システムが正常に初期化・動作しているかの確認');
console.log('4. YAMLファイルと記憶階層の役割分担が正しく設計されているかの確認');

console.log('\n✅ 記憶階層実データ内容調査完了');