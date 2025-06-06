/**
 * API経由での小説生成テスト
 */
const http = require('http');

function makeRequest(options, postData) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const data = JSON.parse(body);
                    resolve({ statusCode: res.statusCode, data });
                } catch (e) {
                    resolve({ statusCode: res.statusCode, body });
                }
            });
        });

        req.on('error', reject);
        
        if (postData) {
            req.write(postData);
        }
        req.end();
    });
}

async function testGenerationAPI() {
    console.log('🚀 API経由での小説生成テスト開始\n');

    const testRequest = {
        chapterNumber: 1,
        previousChapterSummary: '',
        worldSettings: {
            genre: '現代ドラマ',
            setting: '現代日本の小さな町',
            tone: 'ほのぼのとした日常系'
        },
        characters: ['佐藤太郎', '田中花子'],
        targetLength: 1500,
        plotGuidance: '新しい職場で働き始めた佐藤太郎が、先輩の田中花子と初めて出会うシーン。お互いの第一印象と、これから始まる日常の予感。',
        theme: '新しい始まり'
    };

    const options = {
        hostname: 'localhost',
        port: 3001,
        path: '/api/generation/chapter',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const postData = JSON.stringify(testRequest);

    try {
        console.log('📝 章生成APIを呼び出し中...');
        console.log(`🎯 目標文字数: ${testRequest.targetLength}文字`);
        console.log(`📚 テーマ: ${testRequest.theme}`);
        console.log(`👥 登場人物: ${testRequest.characters.join(', ')}`);
        console.log(`🌍 設定: ${testRequest.worldSettings.setting}`);

        const startTime = Date.now();
        const response = await makeRequest(options, postData);
        const endTime = Date.now();

        console.log(`\n⏱️  APIレスポンス時間: ${endTime - startTime}ms`);
        console.log(`📊 HTTPステータス: ${response.statusCode}`);

        if (response.statusCode === 200 && response.data) {
            const result = response.data;
            
            console.log('\n✨ 章生成成功！');
            console.log(`📝 生成された章番号: ${result.chapterNumber}`);
            console.log(`📖 タイトル: ${result.title}`);
            console.log(`📊 実際の文字数: ${result.content?.length || 0}文字`);
            
            if (result.content) {
                const preview = result.content.substring(0, 300) + '...';
                console.log('\n📖 生成内容（抜粋）:');
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                console.log(preview);
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            }

            if (result.metadata) {
                console.log('\n📋 メタデータ:');
                console.log(`   - 品質スコア: ${result.metadata.qualityScore || 'N/A'}`);
                console.log(`   - 推定読書時間: ${result.metadata.estimatedReadingTime || 'N/A'}分`);
                console.log(`   - 実際の文字数: ${result.metadata.wordCount || 'N/A'}`);
                if (result.metadata.characters) {
                    console.log(`   - 検出されたキャラクター: ${result.metadata.characters.join(', ')}`);
                }
                if (result.metadata.themes) {
                    console.log(`   - 検出されたテーマ: ${result.metadata.themes.join(', ')}`);
                }
            }

            console.log('\n🎉 小説生成APIテスト完了！');
            console.log('✅ システムが正常に動作しています。');

        } else {
            console.log('\n❌ API呼び出しでエラーが発生:');
            console.log(`ステータス: ${response.statusCode}`);
            if (response.data && response.data.error) {
                console.log(`エラーメッセージ: ${response.data.error}`);
                console.log(`詳細: ${response.data.details || 'なし'}`);
            } else {
                console.log(`レスポンス: ${JSON.stringify(response.data || response.body).substring(0, 500)}`);
            }
        }

    } catch (error) {
        console.error('\n💥 APIテストでエラーが発生:');
        console.error(`エラー: ${error.message}`);
        if (error.code === 'ECONNREFUSED') {
            console.error('💡 開発サーバーが起動していない可能性があります。');
            console.error('   npm run dev を実行してから再試行してください。');
        }
    }
}

// サーバーの起動待ち
async function waitForServer(maxAttempts = 30) {
    console.log('🔍 開発サーバーの起動を確認中...');
    
    for (let i = 0; i < maxAttempts; i++) {
        try {
            const response = await makeRequest({
                hostname: 'localhost',
                port: 3001,
                path: '/',
                method: 'GET'
            });
            
            if (response.statusCode < 500) {
                console.log('✅ 開発サーバーが起動しています\n');
                return true;
            }
        } catch (error) {
            // サーバーがまだ起動していない
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        process.stdout.write('.');
    }
    
    console.log('\n❌ 開発サーバーが起動していません');
    return false;
}

// メイン実行
async function main() {
    console.log('===== 小説生成API テスト =====\n');
    
    const serverReady = await waitForServer();
    if (!serverReady) {
        console.log('💡 次のコマンドで開発サーバーを起動してください:');
        console.log('   npm run dev');
        process.exit(1);
    }
    
    await testGenerationAPI();
}

main().catch(error => {
    console.error('テスト実行エラー:', error);
    process.exit(1);
});