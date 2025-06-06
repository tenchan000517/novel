/**
 * 高度な小説生成システムのテスト（修正されたプロット使用）
 * プロット設定の意図とシステムのポテンシャルを評価
 */

const fs = require('fs');
const path = require('path');

// 環境変数読み込み
require('dotenv').config({ path: '.env.local' });

// 実際のGemini APIを使用した高度なテスト
class AdvancedGeminiClient {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY;
        if (!this.apiKey) {
            throw new Error('GEMINI_API_KEY not found in environment variables');
        }
        console.log('✅ Real GeminiClient initialized with API key');
    }

    async generateText(prompt, options = {}) {
        console.log(`📤 Sending request to Gemini API...`);
        console.log(`📝 Prompt length: ${prompt.length} characters`);
        console.log(`🎯 Target length: ${options.targetLength || 'N/A'} characters`);

        const startTime = Date.now();
        
        try {
            const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent';
            
            const requestBody = {
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.8,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: Math.ceil((options.targetLength || 2000) * 1.5), // 日本語を考慮
                    stopSequences: []
                },
                safetySettings: [
                    {
                        category: "HARM_CATEGORY_HARASSMENT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_HATE_SPEECH", 
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    }
                ]
            };

            const response = await fetch(`${url}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
                throw new Error('Invalid response structure from Gemini API');
            }

            const generatedText = data.candidates[0].content.parts[0].text;
            const endTime = Date.now();
            const responseTime = endTime - startTime;
            
            console.log(`📥 Response received (${responseTime}ms)`);
            console.log(`📊 Generated characters: ${generatedText.length}`);
            
            return generatedText;
            
        } catch (error) {
            console.error(`❌ API call error: ${error.message}`);
            throw error;
        }
    }
}

// プロット意図評価のための高度な分析
class PlotIntentAnalyzer {
    constructor() {
        this.plotIntents = {
            phase1: {
                theme: "理想と現実の狭間",
                expectedElements: ["理想", "現実", "ギャップ", "挫折", "起業", "ビジネスコンテスト"],
                characterDynamics: ["高橋誠の理想主義", "山田哲也のメンター役"]
            },
            phase2: {
                theme: "基盤構築と協働",
                expectedElements: ["チーム形成", "佐藤健太", "鈴木美咲", "技術", "マーケティング"],
                characterDynamics: ["3人のコアチーム", "役割分担", "協働"]
            }
        };
    }

    analyzeGeneratedContent(content, chapterNumber) {
        console.log(`\n🔍 プロット意図分析（第${chapterNumber}章）`);
        
        const phase = chapterNumber <= 5 ? 'phase1' : 'phase2';
        const intent = this.plotIntents[phase];
        
        const analysis = {
            themeAlignment: this.checkThemeAlignment(content, intent.theme),
            elementPresence: this.checkExpectedElements(content, intent.expectedElements),
            characterDynamics: this.checkCharacterDynamics(content, intent.characterDynamics),
            overallScore: 0
        };

        analysis.overallScore = (
            analysis.themeAlignment.score + 
            analysis.elementPresence.score + 
            analysis.characterDynamics.score
        ) / 3;

        console.log(`📊 テーマ整合性: ${analysis.themeAlignment.score.toFixed(2)} (${analysis.themeAlignment.details})`);
        console.log(`📊 要素含有率: ${analysis.elementPresence.score.toFixed(2)} (${analysis.elementPresence.found}/${analysis.elementPresence.total})`);
        console.log(`📊 キャラクター関係: ${analysis.characterDynamics.score.toFixed(2)}`);
        console.log(`📊 総合スコア: ${analysis.overallScore.toFixed(2)}/1.0`);

        return analysis;
    }

    checkThemeAlignment(content, theme) {
        const themeKeywords = {
            "理想と現実の狭間": ["理想", "現実", "ギャップ", "差", "困難", "壁", "挫折", "悩み"],
            "基盤構築と協働": ["チーム", "仲間", "協力", "分担", "役割", "連携", "基盤", "構築"]
        };

        const keywords = themeKeywords[theme] || [];
        const found = keywords.filter(keyword => content.includes(keyword));
        const score = found.length / keywords.length;

        return {
            score,
            details: `${found.length}/${keywords.length}個のテーマキーワードを検出`,
            foundKeywords: found
        };
    }

    checkExpectedElements(content, elements) {
        const found = elements.filter(element => {
            return content.includes(element) || 
                   content.includes(element.replace(/[ァ-ヴ]/g, ''));
        });

        return {
            score: found.length / elements.length,
            found: found.length,
            total: elements.length,
            foundElements: found
        };
    }

    checkCharacterDynamics(content, dynamics) {
        let score = 0;
        const total = dynamics.length;

        dynamics.forEach(dynamic => {
            if (dynamic.includes('高橋誠') && content.includes('高橋') || content.includes('誠')) {
                score += 0.5;
            }
            if (dynamic.includes('山田哲也') && content.includes('山田')) {
                score += 0.5;
            }
            if (dynamic.includes('佐藤健太') && content.includes('佐藤')) {
                score += 0.5;
            }
            if (dynamic.includes('鈴木美咲') && content.includes('鈴木')) {
                score += 0.5;
            }
        });

        return {
            score: Math.min(score / total, 1.0)
        };
    }
}

// プロンプト品質分析
class PromptQualityAnalyzer {
    analyzePrompt(prompt) {
        console.log(`\n🔬 プロンプト品質分析`);
        
        const analysis = {
            structure: this.analyzeStructure(prompt),
            context: this.analyzeContextRichness(prompt),
            specificity: this.analyzeSpecificity(prompt),
            creativity: this.analyzeCreativityElements(prompt)
        };

        const overallScore = Object.values(analysis).reduce((sum, item) => sum + item.score, 0) / 4;
        
        console.log(`📊 構造品質: ${analysis.structure.score.toFixed(2)}`);
        console.log(`📊 文脈豊富さ: ${analysis.context.score.toFixed(2)}`);
        console.log(`📊 具体性: ${analysis.specificity.score.toFixed(2)}`);
        console.log(`📊 創造性要素: ${analysis.creativity.score.toFixed(2)}`);
        console.log(`📊 総合プロンプト品質: ${overallScore.toFixed(2)}/1.0`);

        return { ...analysis, overallScore };
    }

    analyzeStructure(prompt) {
        const structureElements = [
            '【基本情報】', '【登場人物】', '【プロット指示】', 
            '【前章のあらすじ】', '【生成指示】', '章番号', '文字数'
        ];
        
        const found = structureElements.filter(element => prompt.includes(element));
        return {
            score: found.length / structureElements.length,
            foundElements: found
        };
    }

    analyzeContextRichness(prompt) {
        const contextElements = [
            'キャラクター', '背景', '設定', '世界観', '雰囲気', 
            'テーマ', '感情', '関係性', '動機', '目標'
        ];
        
        const found = contextElements.filter(element => prompt.includes(element));
        return {
            score: found.length / contextElements.length,
            foundElements: found
        };
    }

    analyzeSpecificity(prompt) {
        let score = 0;
        
        // 数値的な指示の有無
        if (/\d+文字/.test(prompt)) score += 0.25;
        if (/第\d+章/.test(prompt)) score += 0.25;
        
        // 具体的な人名
        if (/高橋|佐藤|鈴木|山田|中村/.test(prompt)) score += 0.25;
        
        // 具体的な行動や場面
        if (prompt.length > 1000) score += 0.25;
        
        return { score };
    }

    analyzeCreativityElements(prompt) {
        const creativityElements = [
            '感情', '心理', '内面', '葛藤', '成長', '変化', 
            '発見', '気づき', '体験', '学び'
        ];
        
        const found = creativityElements.filter(element => prompt.includes(element));
        return {
            score: found.length / creativityElements.length,
            foundElements: found
        };
    }
}

// 高度な章生成エンジン
class AdvancedChapterGenerator {
    constructor(geminiClient, memoryManager, characterManager, plotManager) {
        this.geminiClient = geminiClient;
        this.memoryManager = memoryManager;
        this.characterManager = characterManager;
        this.plotManager = plotManager;
        this.plotAnalyzer = new PlotIntentAnalyzer();
        this.promptAnalyzer = new PromptQualityAnalyzer();
    }

    async generateAdvancedChapter(request) {
        console.log(`\n🎨 高度な章生成開始: 第${request.chapterNumber}章`);
        
        // 1. プロンプト生成
        const prompt = await this.generateEnhancedPrompt(request);
        
        // 2. プロンプト品質分析
        const promptAnalysis = this.promptAnalyzer.analyzePrompt(prompt);
        
        // 3. テキスト生成
        const content = await this.geminiClient.generateText(prompt, {
            targetLength: request.targetLength
        });
        
        // 4. 生成内容のプロット意図分析
        const plotAnalysis = this.plotAnalyzer.analyzeGeneratedContent(content, request.chapterNumber);
        
        // 5. 章オブジェクト作成
        const chapter = {
            id: `chapter-${request.chapterNumber}`,
            chapterNumber: request.chapterNumber,
            title: this.extractTitle(content) || `第${request.chapterNumber}章`,
            content: content,
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
                themes: [request.theme],
                promptAnalysis,
                plotAnalysis,
                systemPotential: this.calculateSystemPotential(promptAnalysis, plotAnalysis)
            }
        };
        
        console.log(`✅ 高度な章生成完了: \"${chapter.title}\"`);
        console.log(`🎯 システムポテンシャル: ${chapter.metadata.systemPotential.toFixed(2)}/1.0`);
        
        return chapter;
    }

    async generateEnhancedPrompt(request) {
        // キャラクター情報の取得
        const characters = await this.getCharacterDetails(request.characters);
        
        // プロット情報の取得
        const plotInfo = await this.getPlotContext(request.chapterNumber);
        
        // 世界設定の取得
        const worldSettings = request.worldSettings;
        
        // 前章のコンテキスト
        const previousContext = request.previousChapterSummary || '物語の始まり';

        const enhancedPrompt = `以下の詳細な条件に従って、高品質な小説の章を生成してください：

【基本情報】
- 章番号: 第${request.chapterNumber}章
- 目標文字数: ${request.targetLength}文字（±10%）
- ジャンル: ${worldSettings.genre}
- 設定: ${worldSettings.setting}
- 雰囲気: ${worldSettings.tone}
- 中心テーマ: ${request.theme}

【登場人物詳細】
${characters.map(char => `
**${char.name}**（${char.type}）
- 性格: ${char.personality.traits.join('、')}
- 話し方: ${char.personality.speechPatterns.join('、')}
- 癖: ${char.personality.quirks.join('、')}
- 価値観: ${char.personality.values.join('、')}
- 現在の欲求: ${char.psychology?.currentDesires?.slice(0, 2).join('、') || '成長への願望'}
- 現在の不安: ${char.psychology?.currentFears?.slice(0, 2).join('、') || '失敗への恐れ'}
- 内的葛藤: ${char.psychology?.internalConflicts?.slice(0, 1).join('、') || '理想と現実の間での揺れ'}
`).join('')}

【プロット指示】
${plotInfo.guidance || request.plotGuidance}

【物語フェーズ】
${plotInfo.phase || 'キャラクター成長フェーズ'}

【前章からの流れ】
${previousContext}

【詳細な生成指示】
1. **文体と雰囲気**
   - 自然で読みやすい現代日本語を使用
   - ${worldSettings.tone}な雰囲気を維持
   - 登場人物の年齢層（大学生〜若手社会人）に適した言葉遣い

2. **キャラクター描写**
   - 各キャラクターの個性を具体的な行動や発言で表現
   - 内面の葛藤や感情の変化を繊細に描写
   - キャラクター間の関係性の発展を意識

3. **物語展開**
   - ${request.theme}というテーマを自然に織り込む
   - 現実的で共感しやすい状況設定
   - 読者が「次が読みたい」と思える展開

4. **構成要素**
   - 印象的な章タイトルを含める
   - 具体的な場面描写（視覚的イメージが浮かぶ）
   - 登場人物の心理描写（内なる声や思考）
   - 自然な対話（リアルな会話のやり取り）

5. **品質要件**
   - 指定文字数の±10%以内
   - 誤字脱字なし
   - 論理的で一貫した展開
   - 感情的に訴求力のある内容

この章で達成すべき物語上の目標：
${request.storyGoal || 'キャラクターの成長と物語の前進'}

生成してください。`;

        return enhancedPrompt;
    }

    async getCharacterDetails(characterNames) {
        // 実際のキャラクターデータを読み込み
        const characters = [];
        for (const name of characterNames) {
            try {
                const characterId = this.getCharacterIdFromName(name);
                const filePath = `/mnt/c/novel-automation-system/data/characters/definitions/${characterId}.yaml`;
                
                if (fs.existsSync(filePath)) {
                    const yaml = require('js-yaml');
                    const characterData = yaml.load(fs.readFileSync(filePath, 'utf8'));
                    characters.push(characterData);
                } else {
                    // フォールバック：基本的なキャラクター情報
                    characters.push(this.getDefaultCharacterInfo(name));
                }
            } catch (error) {
                console.warn(`Character data not found for: ${name}, using default`);
                characters.push(this.getDefaultCharacterInfo(name));
            }
        }
        return characters;
    }

    getCharacterIdFromName(name) {
        const nameMapping = {
            '高橋誠': 'character-takahashi',
            '佐藤健太': 'character-sato', 
            '鈴木美咲': 'character-suzuki',
            '山田哲也': 'character-yamada',
            '中村大輔': 'character-nakamura'
        };
        return nameMapping[name] || 'character-unknown';
    }

    getDefaultCharacterInfo(name) {
        const defaults = {
            '高橋誠': {
                name: '高橋誠',
                type: 'MAIN',
                personality: {
                    traits: ['真面目', '誠実', '理想主義'],
                    speechPatterns: ['丁寧な話し方', '論理的'],
                    quirks: ['考え込むとメモを取る'],
                    values: ['社会課題の解決', '誠実さ']
                },
                psychology: {
                    currentDesires: ['起業の成功', '社会貢献'],
                    currentFears: ['失敗への不安', '期待に応えられないこと'],
                    internalConflicts: ['理想と現実のギャップ']
                }
            }
        };
        return defaults[name] || defaults['高橋誠'];
    }

    async getPlotContext(chapterNumber) {
        // プロット設定から該当する章の情報を取得
        try {
            const yaml = require('js-yaml');
            const concretePlotPath = '/mnt/c/novel-automation-system/data/config/story-plot/concrete-plot.yaml';
            
            if (fs.existsSync(concretePlotPath)) {
                const plotData = yaml.load(fs.readFileSync(concretePlotPath, 'utf8'));
                const relevantSection = plotData.find(section => 
                    chapterNumber >= section.chapterRange[0] && 
                    chapterNumber <= section.chapterRange[1]
                );
                
                if (relevantSection) {
                    return {
                        phase: relevantSection.title,
                        guidance: relevantSection.summary,
                        storyArc: relevantSection.storyArc,
                        keyEvents: relevantSection.keyEvents
                    };
                }
            }
        } catch (error) {
            console.warn('Could not load plot context:', error.message);
        }
        
        return {
            phase: 'Character Development Phase',
            guidance: 'Focus on character growth and relationship building'
        };
    }

    extractTitle(content) {
        // 生成されたコンテンツからタイトルを抽出
        const titleMatch = content.match(/^([^\\n]+)/);
        if (titleMatch) {
            let title = titleMatch[1].trim();
            // "第X章" パターンを探す
            const chapterMatch = title.match(/第[0-9０-９]+章[^\\n]*/);
            if (chapterMatch) {
                return chapterMatch[0];
            }
            return title;
        }
        return null;
    }

    calculateSystemPotential(promptAnalysis, plotAnalysis) {
        // プロンプト品質とプロット意図の実現度からシステムポテンシャルを計算
        return (promptAnalysis.overallScore * 0.4 + plotAnalysis.overallScore * 0.6);
    }
}

// メインテスト実行
async function testAdvancedGeneration() {
    console.log('🚀 高度な小説生成システムテスト開始（修正プロット使用）\n');

    try {
        // 1. システム初期化
        console.log('1. システム初期化中...');
        const geminiClient = new AdvancedGeminiClient();
        
        // モックのメモリマネージャーとキャラクターマネージャー
        const memoryManager = { processChapter: async () => ({ success: true }) };
        const characterManager = { getAllCharacters: async () => [] };
        const plotManager = {};
        
        const chapterGenerator = new AdvancedChapterGenerator(
            geminiClient, memoryManager, characterManager, plotManager
        );
        
        console.log('✅ すべてのコンポーネント初期化完了\n');

        // 2. 第1章生成テスト（起業への一歩フェーズ）
        console.log('2. 第1章生成テスト（起業への一歩フェーズ）...');
        const chapter1Request = {
            chapterNumber: 1,
            previousChapterSummary: '',
            worldSettings: {
                genre: 'ビジネス・成長物語',
                setting: '現代日本のスタートアップシーン',
                tone: 'リアリスティックで希望に満ちた'
            },
            characters: ['高橋誠', '山田哲也'],
            targetLength: 2000,
            plotGuidance: 'ビジネスコンテストで惨敗した高橋誠が、起業家育成プロジェクトの説明会でメンター山田哲也と出会い、「解の質より問いの質」という言葉に衝撃を受ける。理想と現実のギャップに直面しながらも、起業への第一歩を踏み出す決意を固める。',
            theme: '理想と現実の狭間',
            storyGoal: '主人公の理想と現実のギャップを示し、成長への第一歩を踏み出す'
        };

        const chapter1 = await chapterGenerator.generateAdvancedChapter(chapter1Request);

        // 3. 第6章生成テスト（チーム形成フェーズ）
        console.log('\n3. 第6章生成テスト（チーム形成フェーズ）...');
        const chapter6Request = {
            chapterNumber: 6,
            previousChapterSummary: '高橋誠は起業家育成プロジェクトを通じて自分の視野の狭さに気づき、実際のビジネス現場を体験。多様なバックグラウンドの参加者との交流で成長の必要性を自覚した。',
            worldSettings: {
                genre: 'ビジネス・成長物語',
                setting: '現代日本のスタートアップシーン', 
                tone: 'リアリスティックで希望に満ちた'
            },
            characters: ['高橋誠', '佐藤健太', '鈴木美咲'],
            targetLength: 2000,
            plotGuidance: 'プロジェクトの技術ハッカソンで、AI技術に精通したエンジニアの佐藤健太と出会う。二人は意気投合し、さらにマーケティングの知識が豊富な鈴木美咲も加わって最初のコアチームが形成される。しかし、それぞれの考え方の違いも表面化し始める。',
            theme: '基盤構築と協働',
            storyGoal: 'コアメンバー3人のチームが形成され、共通のビジョンを持ちながらも考え方の違いが明確になる'
        };

        const chapter6 = await chapterGenerator.generateAdvancedChapter(chapter6Request);

        // 4. 結果分析と出力
        console.log('\n📊 テスト結果分析:');
        
        const chapters = [chapter1, chapter6];
        let totalSystemPotential = 0;

        chapters.forEach((chapter, index) => {
            console.log(`\n--- 第${chapter.chapterNumber}章分析結果 ---`);
            console.log(`📝 タイトル: ${chapter.title}`);
            console.log(`📏 文字数: ${chapter.content.length}文字`);
            console.log(`🎯 システムポテンシャル: ${chapter.metadata.systemPotential.toFixed(2)}/1.0`);
            console.log(`📊 プロンプト品質: ${chapter.metadata.promptAnalysis.overallScore.toFixed(2)}/1.0`);
            console.log(`📊 プロット意図実現: ${chapter.metadata.plotAnalysis.overallScore.toFixed(2)}/1.0`);
            
            totalSystemPotential += chapter.metadata.systemPotential;
        });

        const averageSystemPotential = totalSystemPotential / chapters.length;
        
        console.log(`\n🏆 総合評価:`);
        console.log(`📊 平均システムポテンシャル: ${averageSystemPotential.toFixed(2)}/1.0`);
        
        if (averageSystemPotential >= 0.8) {
            console.log(`✅ 優秀: システムは高いポテンシャルを発揮しています`);
        } else if (averageSystemPotential >= 0.6) {
            console.log(`🟡 良好: システムは適切に機能していますが改善の余地があります`);
        } else {
            console.log(`🔴 要改善: システムのポテンシャルが十分に発揮されていません`);
        }

        // 5. ファイル保存
        const outputDir = 'test-output/advanced';
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        chapters.forEach(chapter => {
            const fileName = `advanced-test-chapter-${chapter.chapterNumber}-${Date.now()}.md`;
            const filePath = path.join(outputDir, fileName);
            
            const fileContent = `# ${chapter.title}

**生成日時**: ${chapter.metadata.createdAt}
**文字数**: ${chapter.metadata.wordCount}
**登場人物**: ${chapter.metadata.characters.join(', ')}
**テーマ**: ${chapter.metadata.themes.join(', ')}
**システムポテンシャル**: ${chapter.metadata.systemPotential.toFixed(2)}/1.0

## 品質分析
- **プロンプト品質**: ${chapter.metadata.promptAnalysis.overallScore.toFixed(2)}/1.0
- **プロット意図実現**: ${chapter.metadata.plotAnalysis.overallScore.toFixed(2)}/1.0

---

${chapter.content}

---

## 詳細分析レポート

### プロンプト品質分析
- 構造品質: ${chapter.metadata.promptAnalysis.structure.score.toFixed(2)}
- 文脈豊富さ: ${chapter.metadata.promptAnalysis.context.score.toFixed(2)}
- 具体性: ${chapter.metadata.promptAnalysis.specificity.score.toFixed(2)}
- 創造性要素: ${chapter.metadata.promptAnalysis.creativity.score.toFixed(2)}

### プロット意図分析
- テーマ整合性: ${chapter.metadata.plotAnalysis.themeAlignment.score.toFixed(2)}
- 要素含有率: ${chapter.metadata.plotAnalysis.elementPresence.score.toFixed(2)}
- キャラクター関係: ${chapter.metadata.plotAnalysis.characterDynamics.score.toFixed(2)}
`;
            
            fs.writeFileSync(filePath, fileContent, 'utf8');
            console.log(`💾 第${chapter.chapterNumber}章保存: ${filePath}`);
        });

        console.log('\n🎉 高度な小説生成システムテスト完了！');
        console.log('✅ プロット設定の意図とシステムのポテンシャルを評価しました。');

    } catch (error) {
        console.error('\n💥 テストでエラーが発生:');
        console.error(`エラー: ${error.message}`);
        console.error(`スタック: ${error.stack?.split('\n').slice(0, 3).join('\n')}`);
        process.exit(1);
    }
}

// メイン実行
console.log('===== 高度な小説生成システム分析テスト =====\n');
testAdvancedGeneration().catch(error => {
    console.error('テスト実行エラー:', error);
    process.exit(1);
});