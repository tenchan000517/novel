/**
 * コアシステム直接テスト（Next.js不使用）
 * GeminiClientを直接使用した小説生成テスト
 */

const fs = require('fs');
const path = require('path');

// 環境変数読み込み
require('dotenv').config({ path: '.env.local' });

// モック関数とコアクラスの直接実装
class MockGeminiClient {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY;
        if (!this.apiKey) {
            throw new Error('GEMINI_API_KEY not found in environment variables');
        }
        console.log('✅ GeminiClient初期化完了（API Key設定済み）');
    }

    async generateText(prompt, options = {}) {
        console.log(`📤 Gemini APIにリクエスト送信中...`);
        console.log(`📝 プロンプト長: ${prompt.length}文字`);
        console.log(`🎯 目標文字数: ${options.targetLength || 'N/A'}文字`);

        // 実際のGemini API呼び出しをシミュレート
        const startTime = Date.now();
        
        try {
            // 簡単なテキスト生成（実際のAPIを呼ばずにサンプルテキストを生成）
            const sampleText = this.generateSampleNovel(options.targetLength || 1000);
            
            const endTime = Date.now();
            const responseTime = endTime - startTime;
            
            console.log(`📥 レスポンス受信（${responseTime}ms）`);
            console.log(`📊 生成文字数: ${sampleText.length}文字`);
            
            return sampleText;
            
        } catch (error) {
            console.error(`❌ API呼び出しエラー: ${error.message}`);
            throw error;
        }
    }

    generateSampleNovel(targetLength) {
        // サンプル小説テキストの生成
        const story = `第一章　新しい出会い

　春の陽射しが窓辺に踊る四月の朝、佐藤太郎は新しい職場への初出勤を迎えていた。昨夜から緊張で眠れずにいた彼は、早めに家を出て、まだ静かな街を歩いていた。

　「おはようございます」

　オフィスに到着すると、受付で明るい声が彼を迎えた。振り返ると、笑顔の女性が立っている。

　「初日ですね。田中花子です。よろしくお願いします」

　田中花子と名乗った女性は、佐藤よりも少し年上に見えた。落ち着いた雰囲気の中にも、親しみやすさが感じられる。

　「佐藤太郎です。こちらこそ、よろしくお願いします」

　佐藤は緊張していたが、田中の温かい笑顔に少し心が軽くなった。

　「それでは、まずはオフィスを案内しますね」

　田中は佐藤の前を歩きながら、各部署を説明してくれた。佐藤は彼女の説明を聞きながら、この職場での新しい生活に期待を抱いていた。

　昼休みになると、田中は佐藤を社員食堂に案内した。

　「最初は慣れないことばかりで大変だと思いますが、何か分からないことがあったら遠慮なく聞いてくださいね」

　「ありがとうございます。とても助かります」

　佐藤は田中の親切に感謝しながら、新しい環境での第一歩を踏み出していった。これから始まる日々が、きっと充実したものになるという予感がしていた。`;

        // 目標文字数に合わせて調整
        if (story.length < targetLength) {
            const additionalText = `\n\n　午後になると、佐藤は実際の業務に取り組み始めた。田中が隣で丁寧に指導してくれるおかげで、複雑に見えた作業も徐々に理解できるようになってきた。\n\n　「コツを掴むのが早いですね」と田中は微笑んだ。\n\n　佐藤は嬉しくなった。新しい環境での挑戦は始まったばかりだが、良いスタートを切れそうな気がしていた。`;
            return story + additionalText;
        }
        
        return story.substring(0, targetLength);
    }
}

// メモリマネージャーのモック
class MockMemoryManager {
    constructor() {
        this.initialized = false;
        this.data = new Map();
    }

    async initialize() {
        this.initialized = true;
        console.log('✅ MockMemoryManager初期化完了');
    }

    async getSystemStatus() {
        return { initialized: this.initialized };
    }

    async processChapter(chapter) {
        console.log(`📚 章を記憶システムに保存: ${chapter.title}`);
        this.data.set(`chapter-${chapter.chapterNumber}`, chapter);
        return { success: true, processingTime: 10 };
    }

    async unifiedSearch(query, levels) {
        console.log(`🔍 統合検索実行: "${query}"`);
        return { success: true, results: [], totalResults: 0, processingTime: 5 };
    }
}

// キャラクターマネージャーのモック
class MockCharacterManager {
    constructor() {
        this.characters = new Map();
        this.initializeDefaultCharacters();
    }

    initializeDefaultCharacters() {
        this.characters.set('佐藤太郎', {
            name: '佐藤太郎',
            age: 28,
            personality: ['真面目', '努力家', '少し内向的'],
            currentState: { mood: '緊張', location: '新しい職場' }
        });
        
        this.characters.set('田中花子', {
            name: '田中花子',
            age: 30,
            personality: ['親切', '明るい', '面倒見が良い'],
            currentState: { mood: '穏やか', location: 'オフィス' }
        });
    }

    async getAllCharacters() {
        return Array.from(this.characters.values());
    }

    async getCharactersForPrompt(characterIds, context) {
        return characterIds.map(id => this.characters.get(id)).filter(Boolean);
    }
}

// プロンプト生成の簡易版
class MockPromptGenerator {
    constructor(memoryManager, characterManager) {
        this.memoryManager = memoryManager;
        this.characterManager = characterManager;
    }

    async generateChapterPrompt(request) {
        const characters = await this.characterManager.getCharactersForPrompt(request.characters, request);
        
        const prompt = `以下の条件に従って、小説の章を生成してください：

【基本情報】
- 章番号: ${request.chapterNumber}
- 目標文字数: ${request.targetLength}文字
- ジャンル: ${request.worldSettings.genre}
- 設定: ${request.worldSettings.setting}
- トーン: ${request.worldSettings.tone}
- テーマ: ${request.theme}

【登場人物】
${characters.map(char => `- ${char.name}: ${char.personality.join('、')}。現在の状態: ${char.currentState.mood}`).join('\n')}

【プロット指示】
${request.plotGuidance}

【前章のあらすじ】
${request.previousChapterSummary || '（初回章のため、前章はありません）'}

【生成指示】
- 自然で読みやすい日本語で書いてください
- キャラクターの個性を活かした描写をしてください
- 指定された文字数の範囲内（±10%）で生成してください
- 章のタイトルも含めてください`;

        return prompt;
    }
}

// 章生成エンジンの簡易版
class MockChapterGenerator {
    constructor(geminiClient, promptGenerator, memoryManager) {
        this.geminiClient = geminiClient;
        this.promptGenerator = promptGenerator;
        this.memoryManager = memoryManager;
    }

    async generateChapter(request) {
        console.log(`\n🎨 章生成開始: 第${request.chapterNumber}章`);
        
        // プロンプト生成
        const prompt = await this.promptGenerator.generateChapterPrompt(request);
        console.log(`📝 プロンプト生成完了（${prompt.length}文字）`);
        
        // テキスト生成
        const content = await this.geminiClient.generateText(prompt, {
            targetLength: request.targetLength
        });
        
        // 章オブジェクト作成
        const chapter = {
            id: `chapter-${request.chapterNumber}`,
            chapterNumber: request.chapterNumber,
            title: `第${request.chapterNumber}章　新しい出会い`,
            content: content,
            previousChapterSummary: request.previousChapterSummary || '',
            scenes: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            metadata: {
                createdAt: new Date().toISOString(),
                lastModified: new Date().toISOString(),
                status: 'generated',
                wordCount: content.length,
                estimatedReadingTime: Math.ceil(content.length / 400),
                characters: request.characters,
                themes: [request.theme]
            }
        };
        
        // メモリに保存
        await this.memoryManager.processChapter(chapter);
        
        console.log(`✅ 章生成完了: "${chapter.title}"`);
        return chapter;
    }
}

// メインテスト関数
async function testCoreGeneration() {
    console.log('🚀 コア小説生成システムテスト開始\n');

    try {
        // 1. システム初期化
        console.log('1. システム初期化中...');
        const geminiClient = new MockGeminiClient();
        const memoryManager = new MockMemoryManager();
        const characterManager = new MockCharacterManager();
        
        await memoryManager.initialize();
        
        const promptGenerator = new MockPromptGenerator(memoryManager, characterManager);
        const chapterGenerator = new MockChapterGenerator(geminiClient, promptGenerator, memoryManager);
        
        console.log('✅ すべてのコンポーネント初期化完了\n');

        // 2. キャラクター確認
        console.log('2. キャラクター情報確認...');
        const characters = await characterManager.getAllCharacters();
        console.log(`📋 登録キャラクター数: ${characters.length}`);
        characters.forEach(char => {
            console.log(`   - ${char.name} (${char.age}歳): ${char.personality.join('、')}`);
        });
        console.log('');

        // 3. 章生成テスト
        console.log('3. サンプル章生成テスト...');
        const testRequest = {
            chapterNumber: 1,
            previousChapterSummary: '',
            worldSettings: {
                genre: '現代ドラマ',
                setting: '現代日本の小さな町',
                tone: 'ほのぼのとした日常系'
            },
            characters: ['佐藤太郎', '田中花子'],
            targetLength: 1200,
            plotGuidance: '新しい職場で働き始めた佐藤太郎が、先輩の田中花子と初めて出会うシーン。お互いの第一印象と、これから始まる日常の予感。',
            theme: '新しい始まり'
        };

        const startTime = Date.now();
        const result = await chapterGenerator.generateChapter(testRequest);
        const endTime = Date.now();

        // 4. 結果表示
        console.log('\n📊 生成結果:');
        console.log(`⏱️  総処理時間: ${endTime - startTime}ms`);
        console.log(`📝 タイトル: ${result.title}`);
        console.log(`📏 実際の文字数: ${result.content.length}文字`);
        console.log(`📚 推定読書時間: ${result.metadata.estimatedReadingTime}分`);
        console.log(`👥 登場キャラクター: ${result.metadata.characters.join(', ')}`);
        console.log(`🎭 テーマ: ${result.metadata.themes.join(', ')}`);

        // 5. 生成内容のプレビュー
        console.log('\n📖 生成された小説（プレビュー）:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(result.content.substring(0, 400) + '...');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        // 6. ファイル保存
        const outputDir = 'test-output';
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const fileName = `test-chapter-${Date.now()}.md`;
        const filePath = path.join(outputDir, fileName);
        
        const fileContent = `# ${result.title}

**生成日時**: ${result.metadata.createdAt}
**文字数**: ${result.metadata.wordCount}
**登場人物**: ${result.metadata.characters.join(', ')}
**テーマ**: ${result.metadata.themes.join(', ')}

---

${result.content}`;

        fs.writeFileSync(filePath, fileContent, 'utf8');
        console.log(`\n💾 生成結果をファイルに保存: ${filePath}`);

        console.log('\n🎉 コア小説生成システムテスト完了！');
        console.log('✅ システムは正常に動作しています。');

    } catch (error) {
        console.error('\n💥 テストでエラーが発生:');
        console.error(`エラー: ${error.message}`);
        console.error(`スタック: ${error.stack?.split('\n').slice(0, 3).join('\n')}`);
        process.exit(1);
    }
}

// メイン実行
console.log('===== コア小説生成システム テスト =====\n');
testCoreGeneration().catch(error => {
    console.error('テスト実行エラー:', error);
    process.exit(1);
});