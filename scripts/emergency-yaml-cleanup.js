#!/usr/bin/env node

/**
 * 🚨 緊急YAML汚染除去スクリプト
 * 犯人によって汚染されたYAMLファイルからstateセクションを除去し、
 * 静的データのみに戻すスクリプト
 */

const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');

console.log('🚨 緊急YAML汚染除去開始');
console.log('======================');
console.log('犯人: 削除されたcharacter-repository.ts');
console.log('被害: YAMLファイルに動的データが混入');
console.log('対策: stateセクションを除去し静的データに戻す');
console.log('');

const charactersDir = path.join(__dirname, '../data/characters');
const mainCharactersDir = path.join(charactersDir, 'main');
const subCharactersDir = path.join(charactersDir, 'sub');

// 処理統計
let processedFiles = 0;
let cleanedFiles = 0;
let errors = [];
let backupCreated = [];

// ============================================================================
// バックアップ作成
// ============================================================================

function createBackup(filePath) {
    const backupPath = filePath + '.backup.' + Date.now();
    try {
        fs.copyFileSync(filePath, backupPath);
        backupCreated.push(backupPath);
        console.log(`📋 バックアップ作成: ${path.basename(backupPath)}`);
        return true;
    } catch (error) {
        console.log(`❌ バックアップ失敗: ${filePath} - ${error.message}`);
        return false;
    }
}

// ============================================================================
// YAML汚染除去処理
// ============================================================================

function cleanYamlFile(filePath) {
    try {
        console.log(`\n🔧 処理中: ${path.basename(filePath)}`);
        
        // ファイル存在確認
        if (!fs.existsSync(filePath)) {
            console.log(`❌ ファイルが見つかりません: ${filePath}`);
            return false;
        }
        
        // バックアップ作成
        if (!createBackup(filePath)) {
            return false;
        }
        
        // YAMLファイル読み込み
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const yamlData = yaml.load(fileContent);
        
        if (!yamlData) {
            console.log(`⚠️  空のYAMLファイル: ${filePath}`);
            return false;
        }
        
        // 汚染チェック
        const hasState = yamlData.state && typeof yamlData.state === 'object';
        
        if (!hasState) {
            console.log(`✅ 汚染なし: ${path.basename(filePath)}`);
            return false;
        }
        
        console.log(`🚨 汚染検出: ${path.basename(filePath)}`);
        console.log(`   - state.isActive: ${yamlData.state.isActive}`);
        console.log(`   - state.emotionalState: ${yamlData.state.emotionalState}`);
        console.log(`   - state.developmentStage: ${yamlData.state.developmentStage}`);
        
        // 🧹 汚染除去: stateセクションを削除
        const cleanedData = { ...yamlData };
        delete cleanedData.state;
        
        // 静的データの確認と保持
        const staticFields = [
            'id', 'name', 'type', 'description', 'shortNames', 'nicknames',
            'appearance', 'personality', 'goals', 'relationships', 'tags',
            'traits', 'values', 'flaws'
        ];
        
        console.log(`   🧹 stateセクション除去`);
        console.log(`   📋 保持される静的フィールド: ${Object.keys(cleanedData).join(', ')}`);
        
        // クリーンなYAMLに変換
        const cleanYaml = yaml.dump(cleanedData, {
            indent: 2,
            lineWidth: -1,
            noRefs: true,
            quotingType: '"',
            forceQuotes: false
        });
        
        // ファイルに書き戻し
        fs.writeFileSync(filePath, cleanYaml, 'utf8');
        
        console.log(`✅ 汚染除去完了: ${path.basename(filePath)}`);
        return true;
        
    } catch (error) {
        const errorMsg = `ファイル処理エラー: ${filePath} - ${error.message}`;
        console.log(`❌ ${errorMsg}`);
        errors.push(errorMsg);
        return false;
    }
}

// ============================================================================
// メイン処理
// ============================================================================

function processDirectory(dirPath, dirName) {
    console.log(`\n📁 ${dirName}ディレクトリの処理`);
    console.log('================================');
    
    if (!fs.existsSync(dirPath)) {
        console.log(`❌ ディレクトリが見つかりません: ${dirPath}`);
        return;
    }
    
    const files = fs.readdirSync(dirPath);
    const yamlFiles = files.filter(file => 
        file.endsWith('.yaml') || file.endsWith('.yml')
    );
    
    console.log(`📄 ${yamlFiles.length}個のYAMLファイルを発見`);
    
    yamlFiles.forEach(file => {
        const filePath = path.join(dirPath, file);
        processedFiles++;
        
        if (cleanYamlFile(filePath)) {
            cleanedFiles++;
        }
    });
}

// ============================================================================
// CharacterService初期化修正の提案
// ============================================================================

function generateCharacterServicePatch() {
    console.log(`\n🔧 CharacterService初期化修正の提案`);
    console.log('=====================================');
    
    const patchCode = `
// character-service.ts の initializeCharacterState() メソッドに追加

private initializeCharacterState(data?: Partial<CharacterState>): CharacterState {
  return {
    // 🚨 緊急修正: MAINキャラクターを強制的にアクティブ化
    isActive: data?.isActive !== undefined ? data.isActive : true, // デフォルトtrue
    emotionalState: data?.emotionalState || 'NEUTRAL',
    developmentStage: data?.developmentStage || 0,
    lastAppearance: data?.lastAppearance || null,
    development: data?.development || '',
    relationships: data?.relationships || []
  };
}

// さらに getAllActiveCharacters() メソッドで安全装置を追加
async getAllActiveCharacters(): Promise<Character[]> {
  await this.ensureInitialized();

  const activeCharacters = Array.from(this.characterCache.values())
    .filter(character => {
      // 🚨 緊急修正: MAINキャラクターは常にアクティブ
      if (character.type === 'MAIN') {
        return true;
      }
      return character.state?.isActive !== false;
    });

  logger.debug(\`Retrieved \${activeCharacters.length} active characters from cache\`);
  return activeCharacters;
}`;
    
    console.log('以下のコードをcharacter-service.tsに適用してください:');
    console.log(patchCode);
}

// ============================================================================
// 実行
// ============================================================================

try {
    // MAINキャラクターの処理
    processDirectory(mainCharactersDir, 'MAIN');
    
    // SUBキャラクターの処理
    processDirectory(subCharactersDir, 'SUB');
    
    // 処理結果サマリー
    console.log(`\n📊 処理結果サマリー`);
    console.log('==================');
    console.log(`📄 処理ファイル数: ${processedFiles}`);
    console.log(`🧹 汚染除去ファイル数: ${cleanedFiles}`);
    console.log(`💾 作成バックアップ数: ${backupCreated.length}`);
    console.log(`❌ エラー数: ${errors.length}`);
    
    if (errors.length > 0) {
        console.log(`\n❌ エラー詳細:`);
        errors.forEach(error => console.log(`   ${error}`));
    }
    
    if (backupCreated.length > 0) {
        console.log(`\n💾 作成されたバックアップ:`);
        backupCreated.forEach(backup => console.log(`   ${backup}`));
    }
    
    // CharacterService修正提案
    generateCharacterServicePatch();
    
    console.log(`\n✅ YAML汚染除去完了`);
    console.log('次のステップ:');
    console.log('1. 上記のCharacterService修正を適用');
    console.log('2. システムの再起動');
    console.log('3. プロンプト生成のテスト実行');
    
} catch (error) {
    console.log(`\n🚨 重大エラー: ${error.message}`);
    console.log('処理を中止します。');
    process.exit(1);
}