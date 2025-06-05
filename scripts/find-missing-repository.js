#!/usr/bin/env node

/**
 * 🕵️ 消失したcharacter-repositoryの痕跡調査
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🕵️ 消失したcharacter-repositoryの痕跡調査');
console.log('================================================');

// ============================================================================
// STEP 1: Gitログでrepository関連の変更を調査
// ============================================================================

console.log('\n📊 STEP 1: Git履歴での削除痕跡調査');
console.log('===================================');

try {
    // character-repositoryに関連するコミットを検索
    console.log('character-repository関連のコミットを検索中...');
    
    const gitLog = execSync('git log --oneline --grep="repository" --grep="character-repository" --grep="Repository" -i', 
        { encoding: 'utf8', cwd: process.cwd() });
    
    if (gitLog.trim()) {
        console.log('📋 Repository関連のコミット:');
        console.log(gitLog);
    } else {
        console.log('❌ Repository関連のコミットが見つかりませんでした');
    }
    
    // ファイル削除に関するコミットを検索
    console.log('\nファイル削除関連のコミットを検索中...');
    const deleteLog = execSync('git log --oneline --grep="delete" --grep="remove" --grep="削除" -i', 
        { encoding: 'utf8', cwd: process.cwd() });
    
    if (deleteLog.trim()) {
        console.log('📋 削除関連のコミット:');
        console.log(deleteLog);
    }

} catch (error) {
    console.log('❌ Git履歴の取得でエラー:', error.message);
}

// ============================================================================
// STEP 2: 削除されたファイルの痕跡をGitで調査
// ============================================================================

console.log('\n🗃️ STEP 2: 削除されたリポジトリファイルの痕跡');
console.log('=============================================');

try {
    // 削除されたcharacter-repositoryファイルを検索
    const deletedFiles = execSync('git log --diff-filter=D --summary | grep "character-repository"', 
        { encoding: 'utf8', cwd: process.cwd() });
    
    if (deletedFiles.trim()) {
        console.log('🗑️ 削除されたcharacter-repositoryファイル:');
        console.log(deletedFiles);
    } else {
        console.log('❓ character-repositoryファイルの削除記録なし');
    }
    
    // repositories ディレクトリに関する変更
    const repoChanges = execSync('git log --oneline -- "*repositories*" 2>/dev/null || echo "No repository changes found"', 
        { encoding: 'utf8', cwd: process.cwd() });
    
    console.log('\n📁 repositoriesディレクトリの変更履歴:');
    console.log(repoChanges);

} catch (error) {
    console.log('❌ 削除ファイルの調査でエラー:', error.message);
}

// ============================================================================
// STEP 3: 現在のコードベースで参照箇所を確認
// ============================================================================

console.log('\n🔍 STEP 3: character-repository参照箇所の詳細調査');
console.log('================================================');

const searchResults = [];

function searchForRepository(dir, depth = 0) {
    if (depth > 3) return;
    
    try {
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
            const fullPath = path.join(dir, item);
            
            try {
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory() && !item.includes('node_modules') && !item.includes('.git')) {
                    searchForRepository(fullPath, depth + 1);
                } else if (item.endsWith('.ts') || item.endsWith('.js')) {
                    const content = fs.readFileSync(fullPath, 'utf8');
                    
                    // character-repository参照を検索
                    if (content.includes('character-repository') || 
                        content.includes('characterRepository') ||
                        content.includes('saveCharacterState')) {
                        
                        const lines = content.split('\n');
                        const matches = [];
                        
                        lines.forEach((line, index) => {
                            if (line.includes('character-repository') || 
                                line.includes('saveCharacterState') ||
                                line.includes('updateCharacterProperty')) {
                                matches.push({
                                    line: index + 1,
                                    content: line.trim()
                                });
                            }
                        });
                        
                        if (matches.length > 0) {
                            searchResults.push({
                                file: fullPath,
                                matches: matches
                            });
                        }
                    }
                }
            } catch (error) {
                // ファイルアクセスエラーは無視
            }
        }
    } catch (error) {
        // ディレクトリアクセスエラーは無視
    }
}

searchForRepository('src');

// 結果を表示
searchResults.forEach(result => {
    console.log(`\n📄 ${result.file}:`);
    result.matches.forEach(match => {
        if (match.content.includes('import') && match.content.includes('character-repository')) {
            console.log(`   🚨 行${match.line}: ${match.content} ← 存在しないファイルをインポート！`);
        } else if (match.content.includes('saveCharacterState')) {
            console.log(`   ⚠️  行${match.line}: ${match.content} ← YAML書き込み処理！`);
        } else {
            console.log(`   📝 行${match.line}: ${match.content}`);
        }
    });
});

// ============================================================================
// STEP 4: 具体的な犯人の特定
// ============================================================================

console.log('\n🎯 STEP 4: 犯人特定の結論');
console.log('=========================');

console.log('📋 判明した事実:');
console.log('1. 多数のファイルが存在しないcharacter-repositoryをインポートしている');
console.log('2. saveCharacterState()でYAMLファイルに書き戻す処理が含まれていた');
console.log('3. 現在のcharacter-service.tsではcharacterRepository = null');
console.log('4. しかしYAMLファイルには過去に書き込まれたstateデータが残存');
console.log('');

console.log('🚨 推定される犯人:');
console.log('- 過去に存在したcharacter-repositoryの実装');
console.log('- その実装がYAMLファイルに直接状態を書き戻していた');
console.log('- 何らかの処理でMAINキャラクターをisActive: falseに設定');
console.log('- repository実装は削除されたが、YAMLファイルの汚染状態は残存');

console.log('\n🛠️ 緊急対応が必要:');
console.log('1. YAMLファイルからstateセクションを削除');
console.log('2. CharacterServiceの初期化ロジックでMAINキャラをisActive: trueに');
console.log('3. 静的データと動的データの完全分離');

console.log('\n✅ 消失repository犯人特定調査完了');