/**
 * CharacterManager診断スクリプト
 * 実行: node scripts/debug-character-manager.js
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

// プロジェクトルートからの相対パスを修正
const PROJECT_ROOT = path.resolve(__dirname, '..');

console.log('🚨 CharacterManager診断スクリプト開始...\n');
console.log(`プロジェクトルート: ${PROJECT_ROOT}\n`);

async function debugCharacterManager() {
  try {
    // STEP 1: ファイル存在確認
    console.log('📁 STEP 1: ファイル存在確認');
    console.log('============================');
    
    const characterPaths = [
      'data/characters/main',
      'data/characters/sub',
      'data/characters/background'
    ];

    const fileInfo = {};
    
    for (const relativePath of characterPaths) {
      const fullPath = path.join(PROJECT_ROOT, relativePath);
      
      try {
        const stats = await fs.stat(fullPath);
        
        if (stats.isDirectory()) {
          const files = await fs.readdir(fullPath);
          const yamlFiles = files.filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
          
          console.log(`✅ ${relativePath}: ${yamlFiles.length}個のYAMLファイル`);
          yamlFiles.forEach(file => console.log(`   - ${file}`));
          
          fileInfo[relativePath] = {
            exists: true,
            files: yamlFiles,
            fullPath
          };
        } else {
          console.log(`❌ ${relativePath}: ディレクトリではありません`);
          fileInfo[relativePath] = { exists: false };
        }
      } catch (error) {
        console.log(`❌ ${relativePath}: アクセスできません - ${error.message}`);
        fileInfo[relativePath] = { exists: false, error: error.message };
      }
    }

    // STEP 2: YAMLファイル内容確認
    console.log('\n📄 STEP 2: YAMLファイル内容確認');
    console.log('================================');
    
    const characters = [];
    
    for (const [dirPath, info] of Object.entries(fileInfo)) {
      if (info.exists && info.files && info.files.length > 0) {
        for (const file of info.files) {
          const filePath = path.join(info.fullPath, file);
          
          try {
            console.log(`\n📖 読み込み中: ${dirPath}/${file}`);
            
            const fileContent = await fs.readFile(filePath, 'utf-8');
            const yamlData = yaml.load(fileContent);
            
            if (yamlData) {
              // 単一キャラクターまたは複数キャラクターに対応
              const charArray = Array.isArray(yamlData) ? yamlData : [yamlData];
              
              for (const charData of charArray) {
                if (charData.name && charData.type) {
                  const character = {
                    id: charData.id || 'auto-generated',
                    name: charData.name,
                    type: charData.type,
                    description: charData.description || '',
                    filePath: `${dirPath}/${file}`
                  };
                  
                  characters.push(character);
                  
                  console.log(`   ✅ ${character.name} (${character.type})`);
                  console.log(`      ID: ${character.id}`);
                  console.log(`      Description: ${character.description.substring(0, 60)}...`);
                } else {
                  console.log(`   ⚠️  不完全なキャラクターデータ: name=${charData.name}, type=${charData.type}`);
                }
              }
            } else {
              console.log(`   ❌ YAMLデータが空またはnull`);
            }
          } catch (error) {
            console.log(`   ❌ ファイル読み込みエラー: ${error.message}`);
          }
        }
      }
    }

    // STEP 3: キャラクター分析
    console.log('\n🔍 STEP 3: キャラクター分析');
    console.log('==========================');
    
    console.log(`総キャラクター数: ${characters.length}`);
    
    const typeCount = {};
    characters.forEach(char => {
      typeCount[char.type] = (typeCount[char.type] || 0) + 1;
    });
    
    console.log('タイプ別集計:');
    Object.entries(typeCount).forEach(([type, count]) => {
      console.log(`  - ${type}: ${count}件`);
    });
    
    console.log('\n全キャラクター一覧:');
    characters.forEach((char, index) => {
      console.log(`${index + 1}. ${char.name} (${char.type}) - ${char.filePath}`);
    });

    // STEP 4: 特定キャラクター確認
    console.log('\n🎯 STEP 4: 佐藤健太の確認');
    console.log('==========================');
    
    const satoCharacter = characters.find(char => char.name === '佐藤健太');
    if (satoCharacter) {
      console.log('✅ 佐藤健太が見つかりました:');
      console.log(`   ID: ${satoCharacter.id}`);
      console.log(`   Type: ${satoCharacter.type}`);
      console.log(`   File: ${satoCharacter.filePath}`);
      console.log(`   Description: ${satoCharacter.description}`);
    } else {
      console.log('❌ 佐藤健太が見つかりません');
      
      // 類似名前の検索
      const similarNames = characters.filter(char => 
        char.name.includes('佐藤') || char.name.includes('健太') || char.name.includes('sato')
      );
      
      if (similarNames.length > 0) {
        console.log('   類似する名前:');
        similarNames.forEach(char => console.log(`   - ${char.name}`));
      }
    }

    // STEP 5: MAINキャラクター確認
    console.log('\n👑 STEP 5: MAINキャラクター確認');
    console.log('===============================');
    
    const mainCharacters = characters.filter(char => char.type === 'MAIN');
    
    if (mainCharacters.length > 0) {
      console.log(`✅ ${mainCharacters.length}件のMAINキャラクター:`);;
      mainCharacters.forEach(char => {
        console.log(`   - ${char.name} (${char.filePath})`);
      });
    } else {
      console.log('❌ MAINキャラクターが見つかりません');
    }

    // STEP 6: 依存関係確認
    console.log('\n📦 STEP 6: 依存関係確認');
    console.log('========================');
    
    try {
      require('js-yaml');
      console.log('✅ js-yaml: インストール済み');
    } catch (error) {
      console.log('❌ js-yaml: インストールされていません');
    }

    // STEP 7: 推奨アクション
    console.log('\n🔧 STEP 7: 推奨アクション');
    console.log('=========================');
    
    if (characters.length === 0) {
      console.log('❌ キャラクターが1件も見つかりません');
      console.log('   1. YAMLファイルの配置を確認してください');
      console.log('   2. YAMLファイルの構文を確認してください');
      console.log('   3. ファイルの読み込み権限を確認してください');
    } else if (!satoCharacter) {
      console.log('⚠️  佐藤健太が見つかりません');
      console.log('   1. character-sato.yamlファイルの内容を確認してください');
      console.log('   2. name フィールドが "佐藤健太" と正確に記述されているか確認してください');
    } else if (mainCharacters.length === 0) {
      console.log('⚠️  MAINキャラクターが見つかりません');
      console.log('   1. type フィールドが "MAIN" と正確に記述されているか確認してください');
    } else {
      console.log('✅ YAMLファイルからのキャラクター読み込みは正常です');
      console.log('   問題はCharacterServiceまたはCharacterManagerの初期化にあります');
      console.log('   1. CharacterServiceのensureInitialized()が正常に実行されているか確認');
      console.log('   2. PromptGeneratorでCharacterManagerが正しく注入されているか確認');
    }

    return {
      totalCharacters: characters.length,
      mainCharacters: mainCharacters.length,
      hasSato: !!satoCharacter,
      characters: characters.map(c => ({ name: c.name, type: c.type, file: c.filePath }))
    };

  } catch (error) {
    console.error('🔥 診断中にエラーが発生:', error);
    console.error('スタックトレース:', error.stack);
    return null;
  }
}

// メイン実行
debugCharacterManager()
  .then(result => {
    if (result) {
      console.log('\n📊 診断結果サマリー');
      console.log('===================');
      console.log(`総キャラクター数: ${result.totalCharacters}`);
      console.log(`MAINキャラクター数: ${result.mainCharacters}`);
      console.log(`佐藤健太の存在: ${result.hasSato ? 'あり' : 'なし'}`);
      console.log('\n🎉 診断完了');
    } else {
      console.log('\n💥 診断失敗');
    }
  })
  .catch(error => {
    console.error('💥 スクリプト実行エラー:', error);
  });