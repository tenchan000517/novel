/**
 * P1-1統合基盤テストスクリプト
 * 
 * キャラクターサービス統合基盤の動作確認
 */

const { CharacterService } = require('./src/lib/characters/services/character-service');

async function testP11Integration() {
  console.log('🚀 P1-1統合基盤テスト開始...\n');

  try {
    // 1. CharacterServiceのインスタンス化
    console.log('1. CharacterServiceのインスタンス化...');
    const characterService = new CharacterService();
    console.log('✅ CharacterService作成完了\n');

    // 2. 基本キャラクター取得テスト
    console.log('2. 基本キャラクター取得テスト...');
    const characters = await characterService.getAllActiveCharacters();
    console.log(`✅ ${characters.length}個のキャラクターを取得`);
    
    if (characters.length > 0) {
      const testCharacter = characters[0];
      console.log(`テスト対象: ${testCharacter.name} (${testCharacter.id})\n`);

      // 3. 統合データ生成テスト
      console.log('3. 統合キャラクターデータ生成テスト...');
      
      const generationContext = {
        chapterNumber: 1,
        purpose: 'ANALYSIS',
        storyContext: {
          currentArc: 'テストアーク',
          theme: 'テストテーマ',
          tone: 'serious',
          pacing: 'moderate'
        },
        focusLevel: 'PRIMARY',
        detailLevel: 'COMPREHENSIVE',
        relatedCharacters: [],
        analysisRequests: []
      };

      try {
        const unifiedData = await characterService.getUnifiedCharacterForPrompt(
          testCharacter.id,
          generationContext
        );
        
        console.log('✅ 統合データ生成成功!');
        console.log(`データポイント数: ${unifiedData.metadata.statistics.dataPoints}`);
        console.log(`処理時間: ${unifiedData.metadata.statistics.processingTime}ms`);
        console.log(`品質スコア: 完全性=${unifiedData.metadata.quality.completeness}, 一貫性=${unifiedData.metadata.quality.consistency}\n`);

        // 4. 記憶階層統合テスト
        console.log('4. 記憶階層統合データ取得テスト...');
        
        try {
          const hierarchicalData = await characterService.getCharacterWithMemoryHierarchy(testCharacter.id);
          
          console.log('✅ 記憶階層統合成功!');
          console.log(`整合性スコア: ${hierarchicalData.consistency.score}`);
          console.log(`不整合項目: ${hierarchicalData.consistency.inconsistencies.length}個`);
          console.log(`統合品質: ${hierarchicalData.consistency.integrationQuality}\n`);

        } catch (error) {
          console.log('⚠️ 記憶階層統合はフォールバックモードで動作');
          console.log(`理由: ${error.message}\n`);
        }

        // 5. データ構造検証
        console.log('5. データ構造検証...');
        
        const dataStructureValid = validateUnifiedDataStructure(unifiedData);
        console.log(`✅ データ構造検証: ${dataStructureValid ? '成功' : '失敗'}\n`);

        // 6. 統計情報表示
        console.log('6. 統合統計情報:');
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`キャラクター名: ${unifiedData.character.name}`);
        console.log(`データソース: ${Object.values(unifiedData.metadata.sources).join(', ')}`);
        console.log(`処理時間: ${unifiedData.metadata.statistics.processingTime}ms`);
        console.log(`データポイント: ${unifiedData.metadata.statistics.dataPoints}個`);
        console.log(`品質メトリクス:`);
        console.log(`  - 完全性: ${(unifiedData.metadata.quality.completeness * 100).toFixed(1)}%`);
        console.log(`  - 一貫性: ${(unifiedData.metadata.quality.consistency * 100).toFixed(1)}%`);
        console.log(`  - 信頼性: ${(unifiedData.metadata.quality.reliability * 100).toFixed(1)}%`);
        console.log(`  - 新鮮度: ${(unifiedData.metadata.quality.freshness * 100).toFixed(1)}%`);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

      } catch (error) {
        console.error('❌ 統合データ生成エラー:', error.message);
      }

    } else {
      console.log('⚠️ テスト用キャラクターが見つかりません');
    }

    console.log('🎉 P1-1統合基盤テスト完了!');

  } catch (error) {
    console.error('❌ テスト実行エラー:', error.message);
    console.error(error.stack);
  }
}

/**
 * 統合データ構造の検証
 */
function validateUnifiedDataStructure(unifiedData) {
  try {
    // 必須プロパティの存在確認
    const requiredProperties = [
      'character', 'evolution', 'psychology', 'relationships', 
      'parameters', 'skills', 'detection', 'metadata'
    ];

    for (const prop of requiredProperties) {
      if (!unifiedData[prop]) {
        console.log(`❌ 必須プロパティが不足: ${prop}`);
        return false;
      }
    }

    // メタデータの構造確認
    const metadata = unifiedData.metadata;
    if (!metadata.sources || !metadata.quality || !metadata.statistics) {
      console.log('❌ メタデータ構造が不正');
      return false;
    }

    console.log('✅ データ構造検証通過');
    return true;

  } catch (error) {
    console.log(`❌ データ構造検証エラー: ${error.message}`);
    return false;
  }
}

// テスト実行
if (require.main === module) {
  testP11Integration();
}

module.exports = { testP11Integration };