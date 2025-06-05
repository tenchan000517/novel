#!/usr/bin/env node

/**
 * 🕵️ CharacterRepository犯人特定調査スクリプト
 * characterRepositoryの実装と動作を調査
 */

const fs = require('fs');
const path = require('path');

console.log('🕵️ CharacterRepository犯人特定調査開始...');
console.log('=============================================');

// ============================================================================
// STEP 1: characterRepositoryの実装ファイルを探す
// ============================================================================

console.log('\n📁 STEP 1: Repository実装ファイルの検索');
console.log('========================================');

const searchPaths = [
    'src/lib/characters/repositories',
    'src/lib/characters/services',
    'src/lib/characters',
    'src/lib/memory',
    'src/lib'
];

const possibleFiles = [
    'character-repository.ts',
    'character-repository.js', 
    'repository.ts',
    'repository.js',
    'file-repository.ts',
    'yaml-repository.ts'
];

let foundRepositoryFiles = [];

for (const searchPath of searchPaths) {
    const fullPath = path.resolve(searchPath);
    
    try {
        if (fs.existsSync(fullPath)) {
            const files = fs.readdirSync(fullPath);
            
            for (const file of files) {
                if (possibleFiles.includes(file) || 
                    file.includes('repository') || 
                    file.includes('Repository')) {
                    
                    const filePath = path.join(fullPath, file);
                    foundRepositoryFiles.push(filePath);
                    console.log(`📄 発見: ${filePath}`);
                }
            }
        }
    } catch (error) {
        // ディレクトリが存在しない場合はスキップ
    }
}

if (foundRepositoryFiles.length === 0) {
    console.log('❌ Repository実装ファイルが見つかりませんでした');
} else {
    console.log(`✅ ${foundRepositoryFiles.length}個のRepository関連ファイルを発見`);
}

// ============================================================================
// STEP 2: CharacterServiceの初期化箇所を調査
// ============================================================================

console.log('\n🔍 STEP 2: CharacterService初期化箇所の調査');
console.log('=============================================');

const servicePaths = [
    'src/lib/characters/services/character-service.ts',
    'src/lib/characters/manager.ts',
    'src/lib/lifecycle/service-container.ts',
    'src/app',
    'src/lib'
];

function searchInFile(filePath, searchTerms) {
    try {
        if (!fs.existsSync(filePath)) return [];
        
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        const results = [];
        
        lines.forEach((line, index) => {
            for (const term of searchTerms) {
                if (line.includes(term)) {
                    results.push({
                        line: index + 1,
                        content: line.trim(),
                        term
                    });
                }
            }
        });
        
        return results;
    } catch (error) {
        return [];
    }
}

const searchTerms = [
    'new CharacterService',
    'createCharacterService',
    'characterRepository',
    'saveCharacterState',
    'updateCharacter'
];

function searchInDirectory(dirPath, depth = 0) {
    if (depth > 3) return; // 再帰の深さ制限
    
    try {
        if (!fs.existsSync(dirPath)) return;
        
        const items = fs.readdirSync(dirPath);
        
        for (const item of items) {
            const fullPath = path.join(dirPath, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                searchInDirectory(fullPath, depth + 1);
            } else if (item.endsWith('.ts') || item.endsWith('.js')) {
                const matches = searchInFile(fullPath, searchTerms);
                
                if (matches.length > 0) {
                    console.log(`\n📄 ${fullPath}:`);
                    matches.forEach(match => {
                        console.log(`   行${match.line}: ${match.content}`);
                    });
                }
            }
        }
    } catch (error) {
        // エラーは無視
    }
}

console.log('CharacterService関連の初期化箇所を検索中...');
searchInDirectory('src');

// ============================================================================
// STEP 3: YAMLファイル書き込み箇所の特定
// ============================================================================

console.log('\n📝 STEP 3: YAMLファイル書き込み箇所の特定');
console.log('=========================================');

const yamlWriteTerms = [
    'fs.writeFile',
    'fs.writeFileSync', 
    'yaml.dump',
    'yaml.stringify',
    '.yaml',
    '.yml',
    'saveCharacterState',
    'updateCharacter',
    'character-sato.yaml',
    'character-suzuki.yaml',
    'character-takahashi.yaml'
];

console.log('YAMLファイル書き込み関連のコードを検索中...');
searchInDirectory('src');

// ============================================================================
// STEP 4: 疑わしいパターンの検出
// ============================================================================

console.log('\n⚠️  STEP 4: 疑わしいパターンの検出');
console.log('==================================');

// Repository実装ファイルの内容確認
foundRepositoryFiles.forEach(filePath => {
    console.log(`\n🔍 ${filePath} の詳細調査:`);
    
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // YAML関連の処理があるかチェック
        if (content.includes('yaml') || content.includes('.yaml') || content.includes('.yml')) {
            console.log('   ⚠️  YAML関連の処理を発見！');
        }
        
        // ファイル書き込み処理があるかチェック
        if (content.includes('writeFile') || content.includes('fs.write')) {
            console.log('   🚨 ファイル書き込み処理を発見！');
        }
        
        // saveCharacterState実装があるかチェック
        if (content.includes('saveCharacterState')) {
            console.log('   🎯 saveCharacterState実装を発見！');
        }
        
        // 先頭50行を表示
        const lines = content.split('\n').slice(0, 50);
        console.log('   📋 ファイル内容（先頭50行）:');
        lines.forEach((line, index) => {
            if (line.trim()) {
                console.log(`     ${index + 1}: ${line}`);
            }
        });
        
    } catch (error) {
        console.log(`   ❌ ファイル読み込みエラー: ${error.message}`);
    }
});

// ============================================================================
// STEP 5: 推奨される次のアクション
// ============================================================================

console.log('\n📋 STEP 5: 推奨される次のアクション');
console.log('==================================');

console.log('以下の手順で犯人を特定してください:');
console.log('');
console.log('1. 📄 発見されたRepository実装ファイルの詳細確認');
console.log('2. 🔍 saveCharacterState()メソッドの実装内容確認');
console.log('3. 📝 YAMLファイル書き込み処理の特定');
console.log('4. 🕰️  いつupdateCharacterState()が呼ばれたかのログ確認');
console.log('5. 🛠️  characterRepositoryに何が注入されているかの確認');
console.log('');
console.log('🎯 重点調査対象:');
console.log('   - characterRepository.saveCharacterState()の実装');
console.log('   - MemoryManagerとcharacterRepositoryの関係');
console.log('   - 初期化時またはテスト実行時の状態保存処理');

console.log('\n✅ CharacterRepository犯人特定調査完了');