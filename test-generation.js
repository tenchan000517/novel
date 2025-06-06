/**
 * 小説生成システムのテストスクリプト
 * 統合システムの動作確認とサンプル章の生成
 */

const path = require('path');

// TypeScriptランタイムの設定
require('ts-node').register({
    project: path.join(__dirname, 'tsconfig.json'),
    transpileOnly: true
});

async function testNovelGeneration() {
    console.log('🚀 小説生成システムテスト開始\n');

    try {
        // 1. Service Container の初期化テスト
        console.log('1. Service Container初期化テスト...');
        const { ServiceContainer } = require('./src/lib/lifecycle/service-container');
        const container = new ServiceContainer();

        // 依存関係の検証
        console.log('   - 依存関係検証中...');
        const validation = container.validateDependencies();
        
        if (validation.valid) {
            console.log('   ✅ 依存関係検証成功');
            console.log(`   📋 初期化順序: ${validation.initializationOrder?.join(' → ')}`);
        } else {
            console.log('   ❌ 依存関係検証失敗');
            console.log('   🔍 循環依存:', validation.circularDependencies);
            console.log('   🔍 未解決依存:', validation.unresolvedDependencies);
            return;
        }

        // システム初期化
        console.log('\n2. システム全体初期化...');
        const startTime = Date.now();
        
        await container.initializeInfrastructure();
        console.log('   ✅ インフラストラクチャ初期化完了');
        
        await container.initializeStorage();
        console.log('   ✅ ストレージ初期化完了');
        
        await container.initializeMemorySystem();
        console.log('   ✅ メモリシステム初期化完了');
        
        await container.initializeCoreServices();
        console.log('   ✅ コアサービス初期化完了');
        
        await container.initializeFacades();
        console.log('   ✅ ファサード初期化完了');
        
        const initTime = Date.now() - startTime;
        console.log(`   ⏱️  総初期化時間: ${initTime}ms`);

        // 3. 個別サービステスト
        console.log('\n3. 個別サービステスト...');
        
        // Memory Manager テスト
        const memoryManager = await container.resolve('memoryManager');
        const memoryStatus = await memoryManager.getSystemStatus();
        console.log(`   📊 MemoryManager: ${memoryStatus.initialized ? '✅' : '❌'} 初期化済み`);

        // Character Manager テスト
        const characterManager = await container.resolve('characterManager');
        const characters = await characterManager.getAllCharacters();
        console.log(`   👥 CharacterManager: ${characters.length}人のキャラクターを管理中`);

        // Plot Manager テスト
        const plotManager = await container.resolve('plotManager');
        console.log('   📖 PlotManager: ✅ 利用可能');

        // Generation Engine テスト
        const generationEngine = await container.resolve('novelGenerationEngine');
        console.log('   🎨 NovelGenerationEngine: ✅ 利用可能');

        // 4. サンプル章生成テスト
        console.log('\n4. サンプル章生成テスト...');
        
        const testRequest = {
            chapterNumber: 1,
            previousChapterSummary: '',
            worldSettings: {
                genre: '現代ドラマ',
                setting: '現代日本',
                tone: 'リアリスティック'
            },
            characters: ['佐藤', '田中'],
            targetLength: 2000, // 短めのテスト用
            plotGuidance: '物語の始まり。主人公の佐藤が新しい環境で田中と出会うシーン。',
            theme: '成長'
        };

        console.log('   📝 章生成開始...');
        console.log(`   🎯 目標文字数: ${testRequest.targetLength}文字`);
        console.log(`   📚 テーマ: ${testRequest.theme}`);
        console.log(`   👥 登場人物: ${testRequest.characters.join(', ')}`);

        const genStartTime = Date.now();
        
        try {
            const result = await generationEngine.generateChapter(testRequest);
            const genTime = Date.now() - genStartTime;
            
            console.log('\n✨ 章生成成功！');
            console.log(`⏱️  生成時間: ${genTime}ms`);
            console.log(`📊 実際の文字数: ${result.content.length}文字`);
            console.log(`📝 タイトル: ${result.title}`);
            
            // 生成内容の抜粋表示
            const preview = result.content.substring(0, 200) + '...';
            console.log('\n📖 生成内容（抜粋）:');
            console.log('---');
            console.log(preview);
            console.log('---');

            // メタデータ表示
            if (result.metadata) {
                console.log('\n📋 メタデータ:');
                console.log(`   - 品質スコア: ${result.metadata.qualityScore || 'N/A'}`);
                console.log(`   - 推定読書時間: ${result.metadata.estimatedReadingTime || 'N/A'}分`);
                console.log(`   - 登場キャラクター: ${result.metadata.characters?.join(', ') || 'N/A'}`);
            }

            console.log('\n🎉 小説生成システムテスト完了！');
            console.log('✅ すべてのコンポーネントが正常に動作しています。');

        } catch (genError) {
            console.log('\n❌ 章生成でエラーが発生:');
            console.log(`   エラー: ${genError.message}`);
            console.log(`   詳細: ${genError.stack?.split('\n')[0] || '詳細不明'}`);
            
            // エラーでもシステムの状態は確認
            console.log('\n📊 システム状態確認:');
            const services = container.getRegisteredServices();
            for (const service of services) {
                const status = container.getServiceStatus(service);
                console.log(`   ${service}: ${status.registered ? '✅' : '❌'} 登録済み, ${status.instantiated ? '✅' : '❌'} インスタンス化`);
            }
        }

    } catch (error) {
        console.error('\n💥 システムテストでエラーが発生:');
        console.error(`エラー: ${error.message}`);
        console.error(`スタック: ${error.stack?.split('\n').slice(0, 3).join('\n')}`);
        process.exit(1);
    }
}

// メイン実行
console.log('===== 小説自動生成システム テスト =====\n');
testNovelGeneration().catch(error => {
    console.error('テスト実行エラー:', error);
    process.exit(1);
});