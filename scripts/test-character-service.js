/**
 * CharacterService動作確認スクリプト
 * 実行: node scripts/test-character-service.js
 */

const path = require('path');

// プロジェクトルートを設定
const PROJECT_ROOT = path.resolve(__dirname, '..');
process.chdir(PROJECT_ROOT);

console.log('🔧 CharacterService動作確認開始...\n');
console.log(`プロジェクトルート: ${PROJECT_ROOT}\n`);

async function testCharacterService() {
  try {
    console.log('📦 STEP 1: CharacterServiceモジュールの読み込み');
    console.log('==============================================');
    
    // ES6 importをCommonJSで模擬
    const characterServicePath = path.resolve(PROJECT_ROOT, 'src/lib/characters/services/character-service.ts');
    console.log(`CharacterServiceパス: ${characterServicePath}`);
    
    // TypeScriptファイルの直接実行は困難なので、
    // ビルドされたJavaScriptを使用するか、代替手段を使用
    
    console.log('\n🚨 注意: TypeScriptファイルの直接実行には制限があります');
    console.log('以下の方法で確認してください:\n');
    
    console.log('🔧 方法1: プロジェクトをビルドして確認');
    console.log('----------------------------------------');
    console.log('1. npm run build を実行');
    console.log('2. ビルドされたファイルから動作確認');
    
    console.log('\n🔧 方法2: 最小限のテストファイル作成');
    console.log('---------------------------------------');
    
    // 最小限のCharacterService模擬実装をテスト
    await testCharacterServiceLogic();
    
  } catch (error) {
    console.error('🔥 テスト中にエラー:', error);
    return null;
  }
}

/**
 * CharacterServiceのロジックを模擬してテスト
 */
async function testCharacterServiceLogic() {
  console.log('\n🧪 STEP 2: CharacterServiceロジック模擬テスト');
  console.log('=============================================');
  
  const fs = require('fs').promises;
  const yaml = require('js-yaml');
  
  try {
    // CharacterServiceの処理を模擬
    console.log('🔄 CharacterServiceの処理を模擬実行...');
    
    const characterPaths = [
      'data/characters/main',
      'data/characters/sub',
      'data/characters/background'
    ];
    
    const characterCache = new Map();
    const typeIndex = new Map();
    
    // ファイル読み込み処理を模擬
    for (const dirPath of characterPaths) {
      const fullPath = path.resolve(PROJECT_ROOT, dirPath);
      
      try {
        const files = await fs.readdir(fullPath);
        const yamlFiles = files.filter(file => 
          file.endsWith('.yaml') || file.endsWith('.yml')
        );
        
        console.log(`📁 ${dirPath}: ${yamlFiles.length}個のファイルを処理中...`);
        
        for (const file of yamlFiles) {
          const filePath = path.join(fullPath, file);
          await loadCharacterFile(filePath, characterCache, typeIndex);
        }
      } catch (dirError) {
        console.log(`⚠️  ${dirPath}: ディレクトリアクセスエラー - ${dirError.message}`);
      }
    }
    
    console.log('\n📊 模擬CharacterServiceの結果:');
    console.log(`総キャラクター数: ${characterCache.size}`);
    
    // 全キャラクターリスト
    console.log('\n📝 全キャラクター:');
    Array.from(characterCache.values()).forEach((char, index) => {
      console.log(`${index + 1}. ${char.name} (${char.type}) - ID: ${char.id}`);
    });
    
    // タイプ別確認
    console.log('\n📊 タイプ別確認:');
    for (const [type, ids] of typeIndex.entries()) {
      console.log(`${type}: ${ids.length}件`);
      ids.forEach(id => {
        const char = characterCache.get(id);
        console.log(`  - ${char.name}`);
      });
    }
    
    // getAllActiveCharacters()を模擬
    console.log('\n🎯 getAllActiveCharacters()模擬実行:');
    const activeCharacters = Array.from(characterCache.values())
      .filter(character => character.state?.isActive !== false);
    
    console.log(`アクティブキャラクター数: ${activeCharacters.length}`);
    activeCharacters.forEach(char => {
      console.log(`  - ${char.name} (${char.type})`);
    });
    
    // getCharactersByType()を模擬
    console.log('\n👑 getCharactersByType("MAIN")模擬実行:');
    const mainCharacterIds = typeIndex.get('MAIN') || [];
    const mainCharacters = mainCharacterIds
      .map(id => characterCache.get(id))
      .filter(Boolean);
    
    console.log(`MAINキャラクター数: ${mainCharacters.length}`);
    mainCharacters.forEach(char => {
      console.log(`  - ${char.name}`);
    });
    
    // 問題診断
    console.log('\n🔍 問題診断:');
    if (characterCache.size === 0) {
      console.log('❌ キャラクターが1件も読み込まれていません');
      console.log('   -> ファイル読み込み処理に問題があります');
    } else if (mainCharacters.length === 0) {
      console.log('❌ MAINキャラクターが見つかりません');
      console.log('   -> タイプ判定またはフィルタリングに問題があります');
    } else {
      console.log('✅ 模擬CharacterServiceは正常に動作します');
      console.log('   -> 問題は実際のCharacterServiceの初期化またはPromptGeneratorの依存注入にあります');
    }
    
    return {
      totalCharacters: characterCache.size,
      activeCharacters: activeCharacters.length,
      mainCharacters: mainCharacters.length,
      typeDistribution: Object.fromEntries(
        Array.from(typeIndex.entries()).map(([type, ids]) => [type, ids.length])
      )
    };
    
  } catch (error) {
    console.error('🔥 模擬テスト中にエラー:', error);
    return null;
  }
}

/**
 * キャラクターファイル読み込みを模擬
 */
async function loadCharacterFile(filePath, characterCache, typeIndex) {
  const fs = require('fs').promises;
  const yaml = require('js-yaml');
  
  try {
    console.log(`  📖 読み込み: ${path.basename(filePath)}`);
    
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const yamlData = yaml.load(fileContent);
    
    if (!yamlData) {
      console.log(`    ⚠️  空のYAMLデータ`);
      return;
    }
    
    // 単一キャラクターまたは複数キャラクターに対応
    const characters = Array.isArray(yamlData) ? yamlData : [yamlData];
    
    for (const characterData of characters) {
      const character = normalizeCharacterData(characterData, filePath);
      if (character) {
        characterCache.set(character.id, character);
        
        // タイプ別インデックス構築
        if (!typeIndex.has(character.type)) {
          typeIndex.set(character.type, []);
        }
        typeIndex.get(character.type).push(character.id);
        
        console.log(`    ✅ ${character.name} (${character.type})`);
      }
    }
    
  } catch (error) {
    console.log(`    ❌ ファイル読み込みエラー: ${error.message}`);
  }
}

/**
 * キャラクターデータ正規化を模擬
 */
function normalizeCharacterData(data, filePath) {
  try {
    if (!data.name || !data.type) {
      console.log(`    ⚠️  不完全なデータ: name=${data.name}, type=${data.type}`);
      return null;
    }
    
    // CharacterServiceのnormalizeCharacterDataを模擬
    const character = {
      id: data.id || generateId(),
      name: data.name,
      type: data.type,
      description: data.description || '',
      shortNames: data.shortNames || data.short_names || [],
      nicknames: data.nicknames || {},
      
      // 外見情報
      appearance: data.appearance || {},
      
      // 性格情報
      personality: {
        traits: data.personality?.traits || data.traits || [],
        values: data.personality?.values || data.values || [],
        flaws: data.personality?.flaws || data.flaws || []
      },
      
      // 目標
      goals: data.goals || [],
      
      // 関係性（基本定義のみ）
      relationships: data.relationships || [],
      
      // 状態（初期化）
      state: initializeCharacterState(data.state),
      
      // 履歴（初期化）
      history: initializeHistory(),
      
      // メタデータ
      metadata: {
        createdAt: new Date(),
        lastUpdated: new Date(),
        version: 1,
        tags: data.tags || []
      }
    };
    
    return character;
    
  } catch (error) {
    console.log(`    ❌ データ正規化エラー: ${error.message}`);
    return null;
  }
}

/**
 * ヘルパー関数
 */
function generateId() {
  return 'char-' + Math.random().toString(36).substr(2, 9);
}

function initializeCharacterState(data) {
  return {
    isActive: data?.isActive !== undefined ? data.isActive : true,
    emotionalState: data?.emotionalState || 'NEUTRAL',
    developmentStage: data?.developmentStage || 0,
    lastAppearance: data?.lastAppearance || null,
    development: data?.development || '',
    relationships: data?.relationships || []
  };
}

function initializeHistory() {
  return {
    appearances: [],
    developmentPath: [],
    interactions: [],
  };
}

// メイン実行
testCharacterService()
  .then(result => {
    console.log('\n🎉 CharacterService動作確認完了');
  })
  .catch(error => {
    console.error('💥 スクリプト実行エラー:', error);
  });