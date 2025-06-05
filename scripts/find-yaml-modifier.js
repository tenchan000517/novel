/**
 * YAMLファイル変更犯人特定スクリプト
 * 実行: node scripts/find-yaml-modifier.js
 */

const fs = require('fs').promises;
const path = require('path');

console.log('🕵️ YAMLファイル変更犯人特定開始...\n');

async function detectYamlModifier() {
  try {
    // STEP 1: ファイルの変更時刻を確認
    console.log('📅 STEP 1: ファイル変更時刻の確認');
    console.log('================================');
    
    const yamlFiles = [
      'data/characters/main/character-sato.yaml',
      'data/characters/main/character-suzuki.yaml',
      'data/characters/main/character-takahashi.yaml',
      'data/characters/sub/character-nakamura.yaml',
      'data/characters/sub/character-yamada.yaml'
    ];

    const fileStats = [];
    
    for (const filePath of yamlFiles) {
      try {
        const stats = await fs.stat(filePath);
        fileStats.push({
          file: filePath,
          mtime: stats.mtime,
          size: stats.size
        });
        
        console.log(`📄 ${path.basename(filePath)}`);
        console.log(`   最終更新: ${stats.mtime.toLocaleString()}`);
        console.log(`   サイズ: ${stats.size} bytes`);
        console.log('');
      } catch (error) {
        console.log(`❌ ${filePath}: ${error.message}`);
      }
    }

    // STEP 2: ファイル内容からstate部分を抽出
    console.log('🔍 STEP 2: 各ファイルのstate設定確認');
    console.log('======================================');
    
    for (const filePath of yamlFiles) {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        
        console.log(`📖 ${path.basename(filePath)}:`);
        
        // state: セクションを抽出
        const stateMatch = content.match(/^state:\s*\n((?:  .*\n)*)/m);
        
        if (stateMatch) {
          console.log('   🔴 state設定が見つかりました:');
          console.log(stateMatch[0].split('\n').map(line => `   ${line}`).join('\n'));
          
          // isActiveの値を特定
          const isActiveMatch = content.match(/isActive:\s*(\w+)/);
          if (isActiveMatch) {
            const isActiveValue = isActiveMatch[1];
            console.log(`   🎯 isActive: ${isActiveValue}`);
            
            if (isActiveValue === 'false') {
              console.log('   ⚠️  このファイルが非アクティブに設定されています！');
            }
          }
        } else {
          console.log('   ✅ state設定なし（正常）');
        }
        console.log('');
        
      } catch (error) {
        console.log(`   ❌ 読み込みエラー: ${error.message}\n`);
      }
    }

    // STEP 3: 初期ファイルとの比較（Gitがある場合）
    console.log('📊 STEP 3: Git履歴の確認（可能な場合）');
    console.log('========================================');
    
    const { exec } = require('child_process');
    const util = require('util');
    const execAsync = util.promisify(exec);
    
    try {
      // Gitリポジトリかどうか確認
      await execAsync('git rev-parse --git-dir');
      console.log('✅ Gitリポジトリが検出されました');
      
      // 各ファイルの変更履歴を確認
      for (const filePath of yamlFiles.slice(0, 2)) { // 最初の2つだけ確認
        try {
          console.log(`\n📈 ${path.basename(filePath)}の変更履歴:`);
          
          const { stdout } = await execAsync(`git log --oneline -3 "${filePath}"`);
          if (stdout.trim()) {
            console.log(stdout.trim().split('\n').map(line => `   ${line}`).join('\n'));
          } else {
            console.log('   変更履歴なし（新規ファイルまたは未追跡）');
          }
          
          // 最新の変更内容を確認
          try {
            const { stdout: diffOutput } = await execAsync(`git show HEAD:"${filePath}" 2>/dev/null || echo "ファイルが見つかりません"`);
            if (diffOutput.includes('state:')) {
              console.log('   🔴 Git履歴にもstate設定が含まれています');
            }
          } catch (diffError) {
            console.log('   📝 変更差分の取得に失敗');
          }
          
        } catch (logError) {
          console.log(`   ⚠️  履歴取得エラー: ${logError.message}`);
        }
      }
      
    } catch (gitError) {
      console.log('⚠️  Gitリポジトリではないか、Git操作に失敗しました');
    }

    // STEP 4: 犯人候補の特定
    console.log('\n🎯 STEP 4: 犯人候補の特定');
    console.log('==========================');
    
    console.log('📋 YAMLファイルに書き込む可能性のあるコード箇所:');
    console.log('');
    
    const suspectMethods = [
      {
        file: 'src/lib/characters/services/character-service.ts',
        methods: [
          'updateCharacter()',
          'updateCharacterState()', 
          'recordAppearance()',
          'recordInteraction()',
          'processCharacterDevelopment()'
        ]
      },
      {
        file: 'src/lib/characters/manager.ts',
        methods: [
          'updateCharacter()',
          'processCharacterDevelopment()'
        ]
      },
      {
        file: 'src/lib/lifecycle/service-container.ts',
        methods: [
          'loadCharacterData()',
          'createFallbackCharacters()'
        ]
      }
    ];

    suspectMethods.forEach(suspect => {
      console.log(`🔍 ${suspect.file}:`);
      suspect.methods.forEach(method => {
        console.log(`   - ${method}`);
      });
      console.log('');
    });

    // STEP 5: 推定される問題と対策
    console.log('💡 STEP 5: 推定される問題と対策');
    console.log('==============================');
    
    const hasStateInYaml = fileStats.some(async (fileStat) => {
      const content = await fs.readFile(fileStat.file, 'utf-8');
      return content.includes('state:');
    });

    console.log('📝 推定される問題:');
    console.log('1. CharacterServiceまたはCharacterManagerが何らかの処理で');
    console.log('   YAMLファイルに動的データ（state）を書き戻している');
    console.log('');
    console.log('2. characterRepositoryが実際にはYAMLファイルに保存している');
    console.log('   （本来はMemoryManagerまたは別のストレージに保存すべき）');
    console.log('');
    console.log('3. 初期設定時またはテスト実行時に意図せず状態が保存された');
    
    console.log('\n🔧 次に確認すべきこと:');
    console.log('1. characterRepositoryの実装を確認');
    console.log('2. CharacterServiceの save系メソッドの動作を確認');
    console.log('3. 本来の動的データ保存先（MemoryManager）の設計を確認');

    return {
      filesWithState: yamlFiles.filter(async (file) => {
        const content = await fs.readFile(file, 'utf-8');
        return content.includes('state:');
      }),
      modificationTimes: fileStats
    };

  } catch (error) {
    console.error('🔥 犯人特定中にエラー:', error);
    return null;
  }
}

// 実行
detectYamlModifier()
  .then(result => {
    console.log('\n🎉 犯人特定調査完了');
  })
  .catch(error => {
    console.error('💥 調査エラー:', error);
  });