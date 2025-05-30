// import { logger } from '@/lib/utils/logger';
// import { GeminiClient } from '@/lib/generation/gemini-client';
// import { apiThrottler } from '@/lib/utils/api-throttle';

// /**
//  * テーマ共鳴分析結果を表す型
//  */
// export interface ThemeResonanceAnalysis {
//     /** 各テーマの分析情報 */
//     themes: {
//         [themeName: string]: {
//             /** 明示的な言及箇所 */
//             explicitMentions: string[];
//             /** 暗示的な表現箇所 */
//             implicitExpressions: string[];
//             /** 表現強度 (1-10) */
//             strength: number;
//             /** 表現方法 */
//             expressionMethods: string[];
//             /** 関連するテーマ */
//             relatedThemes: string[];
//             /** その他の表現（任意） */
//             expressions?: string[];
//         };
//     };
//     /** 全体的な一貫性 (1-10) */
//     overallCoherence: number;
//     /** 支配的なテーマ */
//     dominantTheme: string;
//     /** テーマ間の緊張関係 */
//     themeTensions: {
//         [themeCombo: string]: number; // 1-10
//     };
// }

// /**
//  * 軽視されているテーマを表す型
//  */
// export interface NeglectedTheme {
//     /** テーマ名 */
//     name: string;
//     /** 現在の強度 */
//     strength: number;
//     /** 現在の表現方法 */
//     currentExpressions: string[];
// }

// /**
//  * テーマ強化提案を表す型
//  */
// export interface ThemeEnhancement {
//     /** テーマ名 */
//     theme: string;
//     /** 強化提案 */
//     suggestion: string;
//     /** アプローチ方法 */
//     approaches: string[];
// }

// /**
//  * @class ThemeResonanceAnalyzer
//  * @description テーマの表現と共鳴を分析し、深化方法を提案するクラス
//  */
// export class ThemeResonanceAnalyzer {

//     /**
//      * @constructor
//      * @param geminiClient - Gemini APIクライアント
//      */
//     constructor(private geminiClient: GeminiClient) {
//         logger.info('ThemeResonanceAnalyzer initialized');
//     }

//     /**
//    * レスポンスからマークダウン記法を除去する関数
//    * @private
//    * @param response API からのレスポンス
//    * @returns マークダウン記法を除去したテキスト
//    */
//     private stripMarkdown(response: string): string {
//         // マークダウンコードブロックを削除
//         const jsonPattern = /```(?:json)?\n([\s\S]*?)```/;
//         const match = response.match(jsonPattern);

//         if (match && match[1]) {
//             return match[1].trim(); // マークダウン記法を除去したJSONを返す
//         }

//         // マークダウン記法が見つからない場合は元のレスポンスをそのまま返す
//         return response;
//     }

//     /**
//      * テーマ共鳴分析を実行
//      * @param content 分析対象のテキスト
//      * @param themes テーマの配列
//      * @returns テーマ共鳴分析結果
//      */
//     async analyzeThemeResonance(content: string, themes: string[]): Promise<ThemeResonanceAnalysis> {
//         try {
//             logger.info('Analyzing theme resonance', { themesCount: themes.length });

//             // テーマが空の場合はデフォルトテーマを使用
//             const effectiveThemes = themes.length > 0 ? themes : ['成長', '変化', '挑戦'];

//             // 分析用プロンプト
//             const prompt = `
// 以下の小説本文を分析し、指定されたテーマがどのように表現されているか評価してください：

// 本文：${content.substring(0, 6000)}

// テーマ：${effectiveThemes.map(t => `- ${t}`).join('\n')}

// 各テーマについて：
// 1. 明示的な言及（最大3つの具体的な箇所）
// 2. 暗示的な表現（象徴、メタファーなど。最大3つ）
// 3. 表現強度（1-10のスケール）
// 4. 表現方法（対話、内面描写、行動など。最大3つ）
// 5. 他のテーマとの関連性

// また、全体的なテーマの一貫性（1-10）、最も支配的なテーマ、テーマ間の緊張関係についても評価してください。

// JSONフォーマットで結果を返してください：
// {
//   "themes": {
//     "テーマ1": {
//       "explicitMentions": ["言及1", "言及2", "言及3"],
//       "implicitExpressions": ["表現1", "表現2", "表現3"],
//       "strength": 数値,
//       "expressionMethods": ["方法1", "方法2", "方法3"],
//       "relatedThemes": ["関連テーマ1", "関連テーマ2"]
//     },
//     "テーマ2": { ... }
//   },
//   "overallCoherence": 数値,
//   "dominantTheme": "最も支配的なテーマ",
//   "themeTensions": {
//     "テーマ1とテーマ2": 数値
//   }
// }`;

//             // APIスロットリングを利用してリクエスト
//             const response = await apiThrottler.throttledRequest(() =>
//                 this.geminiClient.generateText(prompt, {
//                     temperature: 0.3,
//                     purpose: 'analysis',
//                     responseFormat: 'json'
//                 })
//             );

//             try {
//                 // JSONパース
//                 const cleanedResponse = this.stripMarkdown(response);
//                 const analysis = JSON.parse(cleanedResponse) as ThemeResonanceAnalysis;
//                 logger.info('Theme resonance analysis completed', {
//                     themesAnalyzed: Object.keys(analysis.themes).length,
//                     dominantTheme: analysis.dominantTheme,
//                     overallCoherence: analysis.overallCoherence
//                 });
//                 return this.validateAnalysis(analysis, effectiveThemes);
//             } catch (parseError) {
//                 logger.error('Failed to parse theme analysis response', {
//                     error: parseError instanceof Error ? parseError.message : String(parseError),
//                     response: response.substring(0, 500)
//                 });
//                 return this.createFallbackAnalysis(effectiveThemes);
//             }
//         } catch (error) {
//             logger.error('Theme resonance analysis failed', {
//                 error: error instanceof Error ? error.message : String(error),
//                 themesCount: themes.length
//             });
//             return this.createFallbackAnalysis(themes);
//         }
//     }

//     /**
//      * テーマ強化提案を生成
//      * @param analysis テーマ共鳴分析結果
//      * @param chapterNumber 章番号
//      * @returns テーマ強化提案の配列
//      */
//     async suggestThemeEnhancements(analysis: ThemeResonanceAnalysis, chapterNumber: number): Promise<ThemeEnhancement[]> {
//         try {
//             logger.info('Generating theme enhancement suggestions', { chapterNumber });

//             // 軽視されているテーマを特定
//             const neglectedThemes = this.identifyNeglectedThemes(analysis);

//             if (neglectedThemes.length === 0) {
//                 logger.info('No neglected themes found, generating general enhancements');
//                 // すべてのテーマが十分に表現されている場合は支配的テーマの強化提案
//                 const dominantTheme = analysis.dominantTheme;
//                 if (dominantTheme && analysis.themes[dominantTheme]) {
//                     const approaches = await this.generateThemeApproaches(dominantTheme);
//                     return [{
//                         theme: dominantTheme,
//                         suggestion: `支配的テーマ「${dominantTheme}」をさらに発展させ、より深い洞察を提供してください`,
//                         approaches
//                     }];
//                 }

//                 // 支配的テーマが特定できない場合は最初のテーマを使用
//                 const firstTheme = Object.keys(analysis.themes)[0];
//                 if (firstTheme) {
//                     const approaches = await this.generateThemeApproaches(firstTheme);
//                     return [{
//                         theme: firstTheme,
//                         suggestion: `テーマ「${firstTheme}」のさらなる探求で物語に深みを与えてください`,
//                         approaches
//                     }];
//                 }

//                 return []; // テーマがない場合は空配列
//             }

//             // テーマ強化提案を生成（最大3つ）
//             return await Promise.all(
//                 neglectedThemes.slice(0, 3).map(async theme => ({
//                     theme: theme.name,
//                     suggestion: `テーマ「${theme.name}」をより強調してください（現在の強度: ${theme.strength}/10）`,
//                     approaches: await this.generateThemeApproaches(theme.name)
//                 }))
//             );
//         } catch (error) {
//             logger.error('Theme enhancement suggestion generation failed', {
//                 error: error instanceof Error ? error.message : String(error),
//                 chapterNumber
//             });

//             // エラー時はシンプルな提案を返す
//             return [{
//                 theme: "テーマの深化",
//                 suggestion: "物語のテーマをより明確に表現し、各要素との関連性を強めてください",
//                 approaches: [
//                     "キャラクターの内面的葛藤を通じてテーマを反映させる",
//                     "象徴やメタファーを使ってテーマを暗示的に表現する",
//                     "対照的な状況を通じてテーマの多面性を示す"
//                 ]
//             }];
//         }
//     }

//     /**
//      * 分析結果を検証して必要に応じて補完する
//      * @private
//      * @param analysis 解析結果
//      * @param originalThemes 元のテーマ配列
//      * @returns 検証済み解析結果
//      */
//     private validateAnalysis(analysis: ThemeResonanceAnalysis, originalThemes: string[]): ThemeResonanceAnalysis {
//         // テーマが無い場合は作成
//         if (!analysis.themes) {
//             analysis.themes = {};
//         }

//         // 指定された全テーマが含まれているか確認し、足りないものを補完
//         originalThemes.forEach(theme => {
//             if (!analysis.themes[theme]) {
//                 analysis.themes[theme] = {
//                     explicitMentions: [],
//                     implicitExpressions: [],
//                     strength: 5, // デフォルト値
//                     expressionMethods: [],
//                     relatedThemes: []
//                 };
//             }
//         });

//         // 全体的な一貫性が無い場合はデフォルト値を設定
//         if (typeof analysis.overallCoherence !== 'number' || isNaN(analysis.overallCoherence)) {
//             analysis.overallCoherence = 7;
//         }

//         // 支配的テーマが無い場合は設定
//         if (!analysis.dominantTheme) {
//             // 強度が最も高いテーマを特定
//             let maxStrength = 0;
//             let dominantTheme = '';

//             for (const [theme, info] of Object.entries(analysis.themes)) {
//                 if (info.strength > maxStrength) {
//                     maxStrength = info.strength;
//                     dominantTheme = theme;
//                 }
//             }

//             analysis.dominantTheme = dominantTheme || originalThemes[0] || '成長';
//         }

//         // テーマ間の緊張関係が無い場合は空オブジェクトを設定
//         if (!analysis.themeTensions) {
//             analysis.themeTensions = {};
//         }

//         return analysis;
//     }

//     /**
//      * 軽視されているテーマを特定
//      * @private
//      * @param analysis テーマ共鳴分析結果
//      * @returns 軽視されているテーマの配列
//      */
//     private identifyNeglectedThemes(analysis: ThemeResonanceAnalysis): NeglectedTheme[] {
//         try {
//             const neglectedThemes: NeglectedTheme[] = [];

//             // 各テーマの表現強度を評価
//             Object.entries(analysis.themes).forEach(([themeName, themeInfo]) => {
//                 // 強度が6未満のテーマを軽視されていると判断
//                 if (themeInfo.strength < 6) {
//                     neglectedThemes.push({
//                         name: themeName,
//                         strength: themeInfo.strength,
//                         currentExpressions: [
//                             ...themeInfo.explicitMentions,
//                             ...themeInfo.implicitExpressions
//                         ]
//                     });
//                 }
//             });

//             // 強度の低い順にソート
//             return neglectedThemes.sort((a, b) => a.strength - b.strength);
//         } catch (error) {
//             logger.error('Failed to identify neglected themes', {
//                 error: error instanceof Error ? error.message : String(error)
//             });
//             return [];
//         }
//     }

//     /**
//      * テーマ表現アプローチの生成
//      * @private
//      * @param themeName テーマ名
//      * @returns テーマ表現アプローチの配列
//      */
//     private async generateThemeApproaches(themeName: string): Promise<string[]> {
//         try {
//             logger.debug(`Generating theme approaches for '${themeName}'`);

//             const prompt = `
// 以下のテーマを小説で効果的に表現するための具体的アプローチを5つ提案してください：

// テーマ: ${themeName}

// 各アプローチは異なる表現方法を用い、50-80文字程度の具体的な説明を含めてください。
// 会話、内面描写、シンボリズム、行動、背景設定など、多様な表現技法を考慮してください。

// JSON形式で回答してください：
// ["アプローチ1", "アプローチ2", "アプローチ3", "アプローチ4", "アプローチ5"]`;

//             // APIスロットリングを利用してリクエスト
//             const response = await apiThrottler.throttledRequest(() =>
//                 this.geminiClient.generateText(prompt, {
//                     temperature: 0.6,
//                     responseFormat: 'json'
//                 })
//             );

//             try {
//                 // JSONパース
//                 const cleanedResponse = this.stripMarkdown(response);
//                 const approaches = JSON.parse(cleanedResponse);

//                 if (Array.isArray(approaches)) {
//                     return approaches.filter(approach => approach && typeof approach === 'string').slice(0, 5);
//                 } else {
//                     throw new Error('Response is not an array');
//                 }
//             } catch (parseError) {
//                 logger.warn(`Failed to parse theme approaches for '${themeName}'`, {
//                     error: parseError instanceof Error ? parseError.message : String(parseError),
//                     response: response.substring(0, 300)
//                 });

//                 // パース失敗時はテキストから行を抽出する
//                 return this.extractApproachesFromText(response, themeName);
//             }
//         } catch (error) {
//             logger.error(`Failed to generate theme approaches for '${themeName}'`, {
//                 error: error instanceof Error ? error.message : String(error)
//             });

//             // エラー時はデフォルトアプローチを返す
//             return this.getDefaultApproaches(themeName);
//         }
//     }

//     /**
//      * テキストからアプローチを抽出する（パース失敗時のフォールバック）
//      * @private
//      * @param text レスポンステキスト
//      * @param themeName テーマ名
//      * @returns 抽出したアプローチの配列
//      */
//     private extractApproachesFromText(text: string, themeName: string): string[] {
//         try {
//             // 行に分割
//             const lines = text.split('\n');

//             // 有用そうな行を抽出
//             const approaches = lines
//                 .map(line => line.trim())
//                 .filter(line =>
//                     line.length > 20 &&
//                     !line.startsWith('```') &&
//                     !line.startsWith('テーマ:') &&
//                     !line.startsWith('JSON') &&
//                     !line.startsWith('[') &&
//                     !line.startsWith(']')
//                 )
//                 .map(line => line.replace(/^[0-9\-\*•]+\.\s*/, ''))  // 行頭の番号・記号を削除
//                 .slice(0, 5);  // 最大5つまで

//             return approaches.length > 0 ? approaches : this.getDefaultApproaches(themeName);
//         } catch (error) {
//             logger.error('Failed to extract approaches from text', {
//                 error: error instanceof Error ? error.message : String(error)
//             });
//             return this.getDefaultApproaches(themeName);
//         }
//     }

//     /**
//      * デフォルトのテーマアプローチを取得
//      * @private
//      * @param themeName テーマ名
//      * @returns デフォルトアプローチの配列
//      */
//     private getDefaultApproaches(themeName: string): string[] {
//         return [
//             `キャラクターの内面的葛藤を通じて「${themeName}」を探求する`,
//             `対照的な状況や人物を通じて「${themeName}」の多面性を示す`,
//             `物語の転換点で「${themeName}」に関連する重要な決断を組み込む`,
//             `象徴やメタファーを使って「${themeName}」を暗示的に表現する`,
//             `会話や議論を通じて「${themeName}」に関する異なる視点を提示する`
//         ];
//     }

//     /**
//      * フォールバック用の最小限の分析結果を作成
//      * @private
//      * @param themes テーマの配列
//      * @returns 最小限のテーマ共鳴分析結果
//      */
//     private createFallbackAnalysis(themes: string[]): ThemeResonanceAnalysis {
//         const effectiveThemes = themes.length > 0 ? themes : ['成長', '変化', '挑戦'];

//         // テーマごとのエントリを作成
//         const themeEntries = effectiveThemes.map(theme => [
//             theme,
//             {
//                 explicitMentions: [],
//                 implicitExpressions: [],
//                 strength: 5,
//                 expressionMethods: ['対話', '描写', '行動'],
//                 relatedThemes: effectiveThemes.filter(t => t !== theme)
//             }
//         ]);

//         return {
//             themes: Object.fromEntries(themeEntries),
//             overallCoherence: 7,
//             dominantTheme: effectiveThemes[0],
//             themeTensions: {}
//         };
//     }

//     /**
//      * テーマと物語要素の関連性を分析する
//      * @param theme テーマ
//      * @param elementType 物語要素タイプ（'character', 'setting', 'conflict' など）
//      * @param context 物語要素の文脈情報
//      * @returns 関連性分析（0-10）と強化提案
//      */
//     async analyzeThemeElementResonance(
//         theme: string,
//         elementType: string,
//         context: string
//     ): Promise<{ relevance: number, suggestions: string[] }> {
//         try {
//             logger.info(`Analyzing theme-element resonance: ${theme} -> ${elementType}`);

//             const prompt = `
// テーマと物語要素の関連性分析

// テーマ: ${theme}
// 物語要素: ${elementType}
// 文脈: ${context}

// 以下の項目について分析してください：
// 1. このテーマとこの物語要素の関連性（0-10のスケール）
// 2. この物語要素を通じてテーマをより強く表現するための具体的な提案（3つ）

// JSONフォーマットで結果を返してください：
// {
//   "relevance": 数値,
//   "suggestions": ["提案1", "提案2", "提案3"]
// }`;

//             // APIスロットリングを利用してリクエスト
//             const response = await apiThrottler.throttledRequest(() =>
//                 this.geminiClient.generateText(prompt, {
//                     temperature: 0.4,
//                     purpose: 'analysis',
//                     responseFormat: 'json'
//                 })
//             );

//             try {
//                 // JSONパース
//                 const cleanedResponse = this.stripMarkdown(response);
//                 const result = JSON.parse(cleanedResponse);
//                 return {
//                     relevance: typeof result.relevance === 'number' ? result.relevance : 5,
//                     suggestions: Array.isArray(result.suggestions) ? result.suggestions : []
//                 };
//             } catch (parseError) {
//                 logger.warn('Failed to parse theme-element resonance', {
//                     error: parseError instanceof Error ? parseError.message : String(parseError),
//                     response: response.substring(0, 300)
//                 });

//                 // パース失敗時はデフォルト値を返す
//                 return {
//                     relevance: 5,
//                     suggestions: [
//                         `${elementType}を通じて「${theme}」をより明確に表現する`,
//                         `${elementType}に「${theme}」に関連する特性や挑戦を追加する`,
//                         `${elementType}と「${theme}」の矛盾や緊張関係を探る`
//                     ]
//                 };
//             }
//         } catch (error) {
//             logger.error('Theme-element resonance analysis failed', {
//                 error: error instanceof Error ? error.message : String(error),
//                 theme,
//                 elementType
//             });

//             // エラー時はデフォルト値を返す
//             return {
//                 relevance: 5,
//                 suggestions: [
//                     `${elementType}を通じて「${theme}」をより明確に表現してください`,
//                     `${elementType}に「${theme}」に関連する要素を取り入れてください`,
//                     `${elementType}の発展において「${theme}」を意識してください`
//                 ]
//             };
//         }
//     }

//     /**
//      * テーマの発展曲線を生成する
//      * @param theme テーマ
//      * @param chapterCount 章の総数
//      * @returns 章ごとのテーマ強度と表現方法の推奨
//      */
//     generateThemeDevelopmentCurve(
//         theme: string,
//         chapterCount: number
//     ): Array<{ chapter: number, strength: number, expressionMethod: string }> {
//         try {
//             logger.info(`Generating theme development curve for '${theme}'`, {
//                 chapterCount
//             });

//             const curve: Array<{ chapter: number, strength: number, expressionMethod: string }> = [];

//             // 表現方法の選択肢
//             const expressionMethods = [
//                 '象徴的な暗示',
//                 'キャラクターの内面描写',
//                 '対話を通じた表現',
//                 '状況設定による強調',
//                 '直接的な言及',
//                 '対比的な要素の使用',
//                 'キャラクターの行動を通じた表現',
//                 '環境描写を通じた暗示',
//                 'エピソードの中心テーマとして',
//                 '複数キャラクターの視点から'
//             ];

//             // 基本的な曲線パターン（起承転結）
//             // 序盤: 緩やかな導入
//             // 中盤前半: 発展
//             // 中盤後半: 複雑化・対立
//             // 終盤: 統合・解決
//             for (let i = 1; i <= chapterCount; i++) {
//                 const progress = i / chapterCount;
//                 let strength: number;

//                 if (progress < 0.2) {
//                     // 序盤: 緩やかな導入 (3-5)
//                     strength = 3 + (progress / 0.2) * 2;
//                 } else if (progress < 0.4) {
//                     // 中盤前半: 発展 (5-7)
//                     strength = 5 + ((progress - 0.2) / 0.2) * 2;
//                 } else if (progress < 0.7) {
//                     // 中盤後半: 複雑化・対立 (7-9)
//                     strength = 7 + ((progress - 0.4) / 0.3) * 2;
//                 } else {
//                     // 終盤: 統合・解決 (9-10→8)
//                     if (progress < 0.9) {
//                         strength = 9 + ((progress - 0.7) / 0.2) * 1;
//                     } else {
//                         // 最後はやや下がる（余韻）
//                         strength = 10 - ((progress - 0.9) / 0.1) * 2;
//                     }
//                 }

//                 // ランダム要素を追加して変化をつける
//                 const randomVariation = (Math.random() * 0.6) - 0.3; // -0.3〜+0.3
//                 strength = Math.min(10, Math.max(1, strength + randomVariation));

//                 // 表現方法をランダムに選択（ただし、強度に応じて適切なものを）
//                 let methodIndex: number;

//                 if (strength < 5) {
//                     // 低強度: より暗示的な方法
//                     methodIndex = Math.floor(Math.random() * 4);
//                 } else if (strength < 8) {
//                     // 中強度: 中間的な方法
//                     methodIndex = Math.floor(Math.random() * 4) + 3;
//                 } else {
//                     // 高強度: より直接的な方法
//                     methodIndex = Math.floor(Math.random() * 4) + 6;
//                 }

//                 curve.push({
//                     chapter: i,
//                     strength: Math.round(strength * 10) / 10, // 小数点第一位まで
//                     expressionMethod: expressionMethods[methodIndex]
//                 });
//             }

//             return curve;
//         } catch (error) {
//             logger.error(`Failed to generate theme development curve for '${theme}'`, {
//                 error: error instanceof Error ? error.message : String(error),
//                 chapterCount
//             });

//             // エラー時は簡易的な曲線を返す
//             const simpleCurve: Array<{ chapter: number, strength: number, expressionMethod: string }> = [];

//             for (let i = 1; i <= chapterCount; i++) {
//                 const progress = i / chapterCount;
//                 const strength = Math.min(10, Math.max(1, Math.round(progress * 10)));

//                 simpleCurve.push({
//                     chapter: i,
//                     strength: strength,
//                     expressionMethod: '基本的な表現'
//                 });
//             }

//             return simpleCurve;
//         }
//     }

//     /**
//      * 章内でのテーマの表現度合いを可視化する
//      * @param content 章の内容
//      * @param theme テーマ
//      * @returns 可視化情報
//      */
//     async visualizeThemePresence(
//         content: string,
//         theme: string
//     ): Promise<{
//         presenceMap: Array<{ position: number, strength: number }>,
//         highPoints: Array<{ position: number, excerpt: string }>,
//         overallScore: number
//     }> {
//         try {
//             logger.info(`Visualizing theme presence for '${theme}'`);

//             // 章を10個のセグメントに分割
//             const segmentLength = Math.ceil(content.length / 10);
//             const segments: string[] = [];

//             for (let i = 0; i < 10; i++) {
//                 const start = i * segmentLength;
//                 const end = Math.min(start + segmentLength, content.length);
//                 segments.push(content.substring(start, end));
//             }

//             // 各セグメントでのテーマ存在度を検出
//             const presenceMap: Array<{ position: number, strength: number }> = [];
//             const keywordMatches: Array<{ index: number, context: string }> = [];

//             // テーマに関連するキーワードのパターン（正規表現）
//             const themePattern = new RegExp(`${theme}|${this.getRelatedKeywords(theme).join('|')}`, 'gi');

//             // 各セグメントを分析
//             segments.forEach((segment, index) => {
//                 // 単純なキーワードマッチング
//                 const matches = segment.match(themePattern) || [];
//                 const matchCount = matches.length;

//                 // キーワードの出現頻度に基づく強度計算
//                 const baseStrength = Math.min(10, matchCount * 2);

//                 // 各マッチの文脈を記録
//                 for (const match of matches) {
//                     const matchIndex = segment.indexOf(match);
//                     if (matchIndex >= 0) {
//                         const start = Math.max(0, matchIndex - 20);
//                         const end = Math.min(segment.length, matchIndex + match.length + 20);
//                         const context = segment.substring(start, end);

//                         keywordMatches.push({
//                             index: index * segmentLength + matchIndex,
//                             context
//                         });
//                     }
//                 }

//                 // セグメントの結果を記録
//                 presenceMap.push({
//                     position: (index + 0.5) / 10, // セグメントの中央位置（0-1）
//                     strength: baseStrength || 1 // 最低1の強度
//                 });
//             });

//             // 最も強い表現箇所を特定（上位3つまで）
//             const highPoints = keywordMatches
//                 .sort((a, b) => b.context.length - a.context.length)
//                 .slice(0, 3)
//                 .map(match => ({
//                     position: match.index / content.length, // 相対位置（0-1）
//                     excerpt: match.context
//                 }));

//             // 全体スコアを計算（単純な平均）
//             const overallScore = presenceMap.reduce((sum, item) => sum + item.strength, 0) / presenceMap.length;

//             return {
//                 presenceMap,
//                 highPoints,
//                 overallScore
//             };
//         } catch (error) {
//             logger.error(`Failed to visualize theme presence for '${theme}'`, {
//                 error: error instanceof Error ? error.message : String(error)
//             });

//             // エラー時はダミーデータを返す
//             return {
//                 presenceMap: [
//                     { position: 0.05, strength: 2 },
//                     { position: 0.15, strength: 3 },
//                     { position: 0.25, strength: 4 },
//                     { position: 0.35, strength: 5 },
//                     { position: 0.45, strength: 6 },
//                     { position: 0.55, strength: 6 },
//                     { position: 0.65, strength: 7 },
//                     { position: 0.75, strength: 8 },
//                     { position: 0.85, strength: 7 },
//                     { position: 0.95, strength: 5 }
//                 ],
//                 highPoints: [],
//                 overallScore: 5
//             };
//         }
//     }

//     /**
//      * テーマに関連するキーワードを取得
//      * @private
//      * @param theme テーマ
//      * @returns 関連キーワードの配列
//      */
//     private getRelatedKeywords(theme: string): string[] {
//         // テーマ別の関連キーワードマップ
//         const keywordMap: { [theme: string]: string[] } = {
//             '成長': ['成熟', '発展', '進化', '変化', '学び', '成長する', '変わる', '経験'],
//             '愛': ['愛情', '恋', '愛する', '慈しむ', '情愛', '思いやり', '絆', '心'],
//             '正義': ['公正', '正義感', '正しさ', '公平', '倫理', '道徳', '善', '悪'],
//             '自由': ['解放', '自由意志', '独立', '選択', '束縛', '制約', '権利'],
//             '希望': ['願い', '夢', '期待', '未来', '光', '希望的', '明るい', '可能性'],
//             '運命': ['定め', '宿命', '必然', '偶然', '巡り合わせ', '予言', '予定'],
//             '喪失': ['失う', '別れ', '死', '消失', '悲しみ', '悲嘆', '虚無', '孤独'],
//             '復讐': ['仇', '報復', '恨み', '恨み', '恩讐', '恨む', '復讐心', '恨みを晴らす'],
//             '孤独': ['孤立', '一人', '疎外', '孤独感', '寂しさ', '隔絶', '距離'],
//             '友情': ['友達', '友', '絆', '信頼', '仲間', '友愛', '友情関係', '連帯'],
//             '戦い': ['戦う', '闘争', '戦争', '対立', '抗争', '葛藤', '抵抗', '競争'],
//             '人間性': ['人間らしさ', '人間味', '人間的', '人間らしい', '人間関係', '人間的な', '人間として'],
//             '変化': ['変わる', '変容', '変遷', '変革', '変動', '変質', '転換', '異なる'],
//             '挑戦': ['挑む', '困難', '試練', '苦難', '試す', '立ち向かう', '乗り越える', '克服']
//         };

//         // テーマが直接マップにある場合
//         if (keywordMap[theme]) {
//             return keywordMap[theme];
//         }

//         // 部分一致するテーマを探す
//         for (const [key, keywords] of Object.entries(keywordMap)) {
//             if (theme.includes(key) || key.includes(theme)) {
//                 return keywords;
//             }
//         }

//         // デフォルトの関連キーワード
//         return [
//             theme + 'する',
//             theme + 'な',
//             theme + 'の',
//             theme + '的',
//             theme + 'さ'
//         ];
//     }
// }