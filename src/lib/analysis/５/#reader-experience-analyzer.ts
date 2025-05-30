// /**
//  * @fileoverview 読者体験分析クラス
//  * @description
//  * 章の読者体験を分析し、読者の興味維持、感情移入、理解度などを評価するとともに
//  * 改善提案を生成するクラス。さまざまな読者層向けの最適化と感情分析も提供。
//  */

// import { GeminiClient } from '@/lib/generation/gemini-client';
// import { logger } from '@/lib/utils/logger';
// import { apiThrottler } from '@/lib/utils/api-throttle';
// import { Chapter } from '@/types/chapters';
// import { JsonParser } from '@/lib/utils/json-parser';
// import {
//   ReaderExperienceAnalysis,
//   ReadabilityMetrics,
//   ReaderEngagementGraph,
//   EmotionalImpactAnalysis,
//   ReaderChallengePoint,
//   EmotionalOptimizationSuggestion,
//   Scene
// } from '@/types/generation';

// /**
//  * @class ReaderExperienceAnalyzer
//  * @description 章の読者体験を分析し、改善提案を生成するクラス
//  */
// export class ReaderExperienceAnalyzer {
//   private analysisCache: Map<string, any> = new Map();
//   private readabilityCache: Map<string, ReadabilityMetrics> = new Map();
//   private genreExpectationsCache: Map<string, string[]> = new Map();
  
//   /**
//    * @constructor
//    * @param geminiClient - Gemini APIクライアント
//    * @param cacheResults - 結果をキャッシュするかどうか
//    */
//   constructor(
//     private geminiClient: GeminiClient,
//     private cacheResults: boolean = true
//   ) {
//     logger.info('ReaderExperienceAnalyzer initialized');
//   }

//   /**
//    * 章の読者体験を分析する
//    * @param chapter - 分析する章
//    * @param previousChapters - 直前の章（コンテキスト用）
//    * @returns 読者体験分析結果
//    */
//   async analyzeReaderExperience(
//     chapter: Chapter,
//     previousChapters: Chapter[] = []
//   ): Promise<ReaderExperienceAnalysis> {
//     try {
//       logger.info(`Analyzing reader experience for chapter ${chapter.chapterNumber}`);
      
//       // キャッシュキーを生成
//       const cacheKey = `reader_exp_${chapter.chapterNumber}_${this.generateCacheHash(chapter.content)}`;
      
//       // キャッシュから結果を取得
//       if (this.cacheResults && this.analysisCache.has(cacheKey)) {
//         logger.debug('Reader experience analysis loaded from cache');
//         return this.analysisCache.get(cacheKey);
//       }
      
//       // 直前の章の内容を抽出（最大2章分）
//       const recentContent = previousChapters
//         .slice(-2)
//         .map(c => c.content)
//         .join('\n\n[章の区切り]\n\n');

//       // 分析用プロンプトの構築
//       const prompt = this.buildReaderExperiencePrompt(chapter, recentContent);

//       // API呼び出し（スロットリング対応）
//       const response = await apiThrottler.throttledRequest(() =>
//         this.geminiClient.generateText(prompt, {
//           temperature: 0.3,
//           purpose: 'analysis',
//           responseFormat: 'json'
//         })
//       );

//       // デフォルト分析レスポンス
//       const defaultAnalysis: ReaderExperienceAnalysis = {
//         interestRetention: 7,
//         empathy: 7,
//         clarity: 7,
//         unexpectedness: 7,
//         anticipation: 7,
//         overallScore: 7,
//         weakPoints: [],
//         strengths: ['十分な読者体験の提供']
//       };

//       // JsonParserを使用して安全にパース
//       const parsedResponse = JsonParser.parseFromAIResponse(response, defaultAnalysis);
      
//       // レスポンスの検証と正規化
//       const validatedResponse = this.validateAnalysisResponse(parsedResponse);
      
//       // キャッシュに結果を保存
//       if (this.cacheResults) {
//         this.analysisCache.set(cacheKey, validatedResponse);
//       }

//       logger.info('Reader experience analysis completed', {
//         chapterNumber: chapter.chapterNumber,
//         overallScore: validatedResponse.overallScore
//       });

//       return validatedResponse;
//     } catch (error) {
//       logger.error('Reader experience analysis failed', {
//         error: error instanceof Error ? error.message : String(error),
//         chapterNumber: chapter.chapterNumber
//       });
//       return this.createDefaultAnalysis();
//     }
//   }

//   /**
//    * 体験改善提案を生成する
//    * @param analysis - 読者体験分析結果
//    * @returns 改善提案の配列
//    */
//   generateExperienceImprovements(analysis: ReaderExperienceAnalysis): string[] {
//     try {
//       logger.info('Generating experience improvements based on analysis');
//       const improvements: string[] = [];

//       // 各評価項目に基づく改善提案
//       if (analysis.interestRetention < 7) {
//         improvements.push(`読者の興味を維持するために${this.getInterestSuggestion(analysis.interestRetention)}`);
//       }

//       if (analysis.empathy < 7) {
//         improvements.push(`感情移入しやすくするために${this.getEmpathySuggestion(analysis.empathy)}`);
//       }

//       if (analysis.clarity < 7) {
//         improvements.push(`物語の理解度を高めるために${this.getClaritySuggestion(analysis.clarity)}`);
//       }

//       if (analysis.unexpectedness < 5) {
//         improvements.push(`展開の意外性を高めるために${this.getUnexpectednessSuggestion(analysis.unexpectedness)}`);
//       }

//       if (analysis.anticipation < 7) {
//         improvements.push(`続きへの期待を高めるために${this.getAnticipationSuggestion(analysis.anticipation)}`);
//       }

//       // 分析による具体的な改善点
//       if (analysis.weakPoints && analysis.weakPoints.length > 0) {
//         analysis.weakPoints.forEach(point => {
//           if (point.suggestion) {
//             improvements.push(point.suggestion);
//           }
//         });
//       }

//       logger.info(`Generated ${improvements.length} improvement suggestions`);
//       return improvements;
//     } catch (error) {
//       logger.error('Failed to generate experience improvements', {
//         error: error instanceof Error ? error.message : String(error)
//       });
//       return [
//         '読者の興味を維持するため、より具体的で感情的な描写を心がけてください',
//         'キャラクターの内面描写を充実させて、感情移入しやすくしてください',
//         '物語の流れをより明確にし、読者が混乱しないよう情報を整理してください'
//       ];
//     }
//   }

//   /**
//    * ジャンルに基づいた読者体験の期待を分析する
//    * @param genre - 小説のジャンル
//    * @param chapterNumber - 章番号
//    * @param totalChapters - 総章数
//    * @returns ジャンル固有の読者体験改善提案
//    */
//   getGenreSpecificReaderExpectations(
//     genre: string,
//     chapterNumber: number,
//     totalChapters: number = 20
//   ): string[] {
//     try {
//       // キャッシュキーを生成
//       const cacheKey = `genre_exp_${genre}_${chapterNumber}_${totalChapters}`;
      
//       // キャッシュから結果を取得
//       if (this.cacheResults && this.genreExpectationsCache.has(cacheKey)) {
//         return this.genreExpectationsCache.get(cacheKey) || [];
//       }
      
//       const progress = chapterNumber / totalChapters;
//       const expectations: string[] = [];

//       // ジャンル共通の期待
//       if (progress < 0.2) {
//         expectations.push('導入部では読者の好奇心を刺激するミステリーや謎を提示してください');
//       } else if (progress > 0.8) {
//         expectations.push('終盤では伏線の回収と感情的なクライマックスを提供してください');
//       }

//       // ジャンル固有の期待
//       switch (genre.toLowerCase()) {
//         case 'fantasy':
//           expectations.push('ファンタジー読者は世界観の一貫性と魔法システムの論理性に期待しています');
//           if (progress < 0.3) {
//             expectations.push('ファンタジー序盤では、魅力的な世界構築と読者を惹きつける冒険要素を入れてください');
//           } else if (progress > 0.7) {
//             expectations.push('ファンタジー終盤では、壮大なクライマックスと感情的な満足感を与えてください');
//           }
//           break;

//         case 'mystery':
//           expectations.push('ミステリー読者は論理的整合性と手がかりの公平な提示を期待しています');
//           if (progress < 0.4) {
//             expectations.push('ミステリー序盤では、複数の怪しい人物と信頼できない情報を提示してください');
//           } else if (progress > 0.6) {
//             expectations.push('ミステリー終盤では、知的に納得できる解決と意外性のバランスを保ってください');
//           }
//           break;

//         case 'romance':
//           expectations.push('ロマンス読者は感情の深さと関係性の発展に期待しています');
//           if (progress < 0.4) {
//             expectations.push('ロマンス序盤では、強い初期の引力と障害の設定を明確にしてください');
//           } else if (progress > 0.6) {
//             expectations.push('ロマンス終盤では、困難を乗り越えた後の感情的な充足と成長を描いてください');
//           }
//           break;

//         case 'thriller':
//           expectations.push('スリラー読者は緊張感の維持とリスクの感覚に期待しています');
//           if (progress < 0.3) {
//             expectations.push('スリラー序盤では、危険の兆候と主人公の弱点を示してください');
//           } else if (progress > 0.7) {
//             expectations.push('スリラー終盤では、高い緊張状態から解放への劇的な転換を提供してください');
//           }
//           break;
          
//         case 'science_fiction':
//           expectations.push('SF読者は科学的概念の創造的な探求と人間性への影響に期待しています');
//           if (progress < 0.3) {
//             expectations.push('SF序盤では、未来技術や科学的概念の革新的な提示と世界構築を重視してください');
//           } else if (progress > 0.7) {
//             expectations.push('SF終盤では、技術と人間性の関係について深い洞察を提供してください');
//           }
//           break;
          
//         case 'historical':
//           expectations.push('歴史小説の読者は時代の正確さと没入感のある描写に期待しています');
//           if (progress < 0.3) {
//             expectations.push('歴史小説序盤では、時代設定の豊かで正確な描写で読者を没入させてください');
//           } else if (progress > 0.7) {
//             expectations.push('歴史小説終盤では、個人的な物語と歴史的文脈の意味深い統合を目指してください');
//           }
//           break;
          
//         case 'horror':
//           expectations.push('ホラー読者は恐怖の段階的な構築と心理的な不安に期待しています');
//           if (progress < 0.3) {
//             expectations.push('ホラー序盤では、不穏な雰囲気と不安の種を巧みに配置してください');
//           } else if (progress > 0.7) {
//             expectations.push('ホラー終盤では、恐怖の正体を明らかにしつつも余韻を残す結末を提供してください');
//           }
//           break;
          
//         case 'adventure':
//           expectations.push('冒険小説の読者は興奮と発見の連続するペースに期待しています');
//           if (progress < 0.3) {
//             expectations.push('冒険序盤では、主人公の日常からの明確な離脱と冒険への誘いを描いてください');
//           } else if (progress > 0.7) {
//             expectations.push('冒険終盤では、最終的な挑戦と主人公の成長による勝利を描いてください');
//           }
//           break;
          
//         case 'literary':
//           expectations.push('文芸小説の読者は深い内省と複雑な人間描写に期待しています');
//           if (progress < 0.3) {
//             expectations.push('文芸小説序盤では、内的葛藤と社会的文脈を緻密に構築してください');
//           } else if (progress > 0.7) {
//             expectations.push('文芸小説終盤では、明確な解決よりも意味のある洞察と変化を提供してください');
//           }
//           break;
          
//         case 'business':
//           expectations.push('ビジネス小説の読者は現実的な課題と戦略的思考プロセスに期待しています');
//           if (progress < 0.3) {
//             expectations.push('ビジネス小説序盤では、主人公の専門性と直面する業界課題を明確に示してください');
//           } else if (progress > 0.7) {
//             expectations.push('ビジネス小説終盤では、戦略の成功または失敗から得られる実用的な教訓を提供してください');
//           }
//           break;
//       }
      
//       // キャッシュに結果を保存
//       if (this.cacheResults) {
//         this.genreExpectationsCache.set(cacheKey, expectations);
//       }

//       return expectations;
//     } catch (error) {
//       logger.error('Failed to get genre specific expectations', {
//         error: error instanceof Error ? error.message : String(error),
//         genre
//       });
//       return ['ジャンルに関わらず、強い感情的体験と没入感を提供してください'];
//     }
//   }

//   /**
//    * 読者体験に基づくシーン改善提案を生成する
//    * @param chapter 分析対象の章
//    * @param analysis 読者体験分析結果
//    * @returns シーンごとの改善提案
//    */
//   generateSceneImprovements(
//     chapter: Chapter,
//     analysis: ReaderExperienceAnalysis
//   ): {[sceneId: string]: string[]} {
//     try {
//       logger.info(`Generating scene improvements for chapter ${chapter.chapterNumber}`);
//       const sceneImprovements: {[sceneId: string]: string[]} = {};
      
//       // 章にシーン情報がない場合は全体の改善提案のみを返す
//       if (!chapter.scenes || chapter.scenes.length === 0) {
//         sceneImprovements['overall'] = this.generateExperienceImprovements(analysis);
//         return sceneImprovements;
//       }
      
//       // 弱点に基づいて各シーンに改善提案を割り当て
//       chapter.scenes.forEach(scene => {
//         const suggestions: string[] = [];
        
//         // シーンタイプに基づく提案
//         switch (scene.type.toUpperCase()) {
//           case 'INTRODUCTION':
//             if (analysis.interestRetention < 7) {
//               suggestions.push('導入シーンでより強いフックを作り、読者の注目を集めてください');
//             }
//             break;
            
//           case 'DEVELOPMENT':
//             if (analysis.empathy < 7) {
//               suggestions.push('展開シーンでキャラクターの内面描写を増やし、感情移入を促進してください');
//             }
//             break;
            
//           case 'CLIMAX':
//             if (analysis.unexpectedness < 6) {
//               suggestions.push('クライマックスシーンに予想外の展開や転換を追加してください');
//             }
//             break;
            
//           case 'RESOLUTION':
//             if (analysis.anticipation < 7) {
//               suggestions.push('解決シーンと次章へのつながりを強化し、続きへの期待を高めてください');
//             }
//             break;
//         }
        
//         // シーンの位置に基づく提案
//         const sceneIndex = chapter.scenes!.indexOf(scene);
//         const totalScenes = chapter.scenes!.length;
//         const scenePosition = sceneIndex / totalScenes;
        
//         if (scenePosition < 0.3 && analysis.clarity < 7) {
//           suggestions.push('章の前半のシーンで状況説明をより明確にしてください');
//         } else if (scenePosition > 0.7 && analysis.anticipation < 7) {
//           suggestions.push('章の後半のシーンで次章への期待を高める要素を追加してください');
//         }
        
//         // シーンごとの改善提案を保存
//         sceneImprovements[scene.id] = suggestions;
//       });
      
//       logger.debug('Scene improvements generated', {
//         chapterNumber: chapter.chapterNumber,
//         scenesCount: chapter.scenes.length
//       });
      
//       return sceneImprovements;
//     } catch (error) {
//       logger.error('Failed to generate scene improvements', {
//         error: error instanceof Error ? error.message : String(error),
//         chapterNumber: chapter.chapterNumber
//       });
      
//       const fallback: {[sceneId: string]: string[]} = {};
//       fallback['overall'] = this.generateExperienceImprovements(analysis);
//       return fallback;
//     }
//   }

//   /**
//    * 異なるタイプの読者を想定した体験分析を行う
//    * @param chapter 分析する章
//    * @param readerType 読者タイプ ('casual', 'critical', 'genre', 'emotional')
//    * @returns 特定の読者タイプに基づく推奨事項
//    */
//   analyzeForSpecificReaderType(chapter: Chapter, readerType: string): string[] {
//     try {
//       logger.info(`Analyzing chapter for reader type: ${readerType}`);
//       const recommendations: string[] = [];
      
//       // キャッシュキーを生成
//       const cacheKey = `reader_type_${readerType}_${chapter.chapterNumber}_${this.generateCacheHash(chapter.content)}`;
      
//       // キャッシュから結果を取得
//       if (this.cacheResults && this.analysisCache.has(cacheKey)) {
//         return this.analysisCache.get(cacheKey);
//       }
      
//       switch (readerType.toLowerCase()) {
//         case 'casual':
//           // カジュアルな読者（エンターテイメント重視）
//           recommendations.push('各章を独立したエピソードとしても楽しめるよう、明確な導入と解決を持たせてください');
//           recommendations.push('長い説明や複雑な設定よりも、アクションやダイナミックな展開を優先してください');
//           recommendations.push('主要なキャラクターを定期的に登場させ、読者が物語を追いやすくしてください');
//           recommendations.push('長い段落よりも短く読みやすい段落を使用し、視覚的な読みやすさを確保してください');
//           recommendations.push('読者が物語を中断しても戻りやすいよう、各シーンの開始時に短いコンテキスト再確認を入れてください');
//           break;
          
//         case 'critical':
//           // 批評的な読者（深さと一貫性重視）
//           recommendations.push('テーマと象徴を一貫して発展させ、深い解釈の層を提供してください');
//           recommendations.push('キャラクターの決断と行動に明確な動機と心理的リアリズムを持たせてください');
//           recommendations.push('世界設定の細部における論理的整合性を確保してください');
//           recommendations.push('表面的な説明を避け、示唆と暗示を通じて読者の知的参加を促してください');
//           recommendations.push('適切な文学的手法とスタイルの一貫性を維持してください');
//           break;
          
//         case 'genre':
//           // ジャンルに精通した読者
//           recommendations.push('ジャンルの慣習を意識しながらも、新鮮な視点やツイストを取り入れてください');
//           recommendations.push('類似作品からの差別化ポイントを明確にしてください');
//           recommendations.push('ジャンルの核心的な満足感を提供しつつ、期待を上回る要素を盛り込んでください');
//           recommendations.push('ジャンルに特有のモチーフや構造を巧みに取り入れつつも革新してください');
//           recommendations.push('ジャンルのトロープを意識的に反転または再解釈する瞬間を設けてください');
//           break;
          
//         case 'emotional':
//           // 感情的な没入を求める読者
//           recommendations.push('キャラクターの感情体験を読者が共有できるよう、感覚的な描写を強化してください');
//           recommendations.push('感情的クライマックスと静かな瞬間のリズムを意識してください');
//           recommendations.push('読者の共感を呼ぶ普遍的な感情と体験を中心に置いてください');
//           recommendations.push('環境描写を通じて感情的な雰囲気を強化してください');
//           recommendations.push('キャラクターの非言語的コミュニケーション（表情、姿勢、しぐさ）を通じて感情を伝えてください');
//           break;
          
//         case 'analytical':
//           // 分析的な読者
//           recommendations.push('物語の構造と論理的一貫性を重視し、穴のない展開を提供してください');
//           recommendations.push('細部に注意を払い、伏線と回収を緻密に計画してください');
//           recommendations.push('キャラクターの動機と行動の因果関係を明確に示してください');
//           recommendations.push('世界設定のルールと限界を一貫して適用してください');
//           recommendations.push('物語の複雑な側面を分析する喜びを読者に提供してください');
//           break;
          
//         case 'escapist':
//           // 現実逃避を求める読者
//           recommendations.push('没入感のある世界を詳細に描き、読者が現実を忘れられる体験を提供してください');
//           recommendations.push('感情的な充足感と願望実現の要素を取り入れてください');
//           recommendations.push('現実的な問題よりもファンタジー的な解決や喜びを提供してください');
//           recommendations.push('読者を別の世界や時代に完全に没入させる感覚的な描写を重視してください');
//           recommendations.push('ページをめくる楽しさを維持するペースの良い展開を心がけてください');
//           break;
          
//         default:
//           recommendations.push('幅広い読者に訴える、バランスの取れた物語体験を提供してください');
//           recommendations.push('明確な物語展開と感情的な深みのバランスを取ってください');
//           recommendations.push('アクションと内省のリズムを適切に組み合わせてください');
//           recommendations.push('多様な読者層が自分なりの解釈で楽しめる余地を残してください');
//       }
      
//       // キャッシュに結果を保存
//       if (this.cacheResults) {
//         this.analysisCache.set(cacheKey, recommendations);
//       }
      
//       return recommendations;
//     } catch (error) {
//       logger.error('Failed to analyze for specific reader type', {
//         error: error instanceof Error ? error.message : String(error),
//         readerType,
//         chapterNumber: chapter.chapterNumber
//       });
//       return ['様々な読者層に配慮した、バランスの取れた物語を心がけてください'];
//     }
//   }

//   /**
//    * 読者エンゲージメントグラフを生成する
//    * @param chapters 分析対象の章
//    * @returns 読者エンゲージメントグラフ
//    */
//   async generateReaderEngagementGraph(chapters: Chapter[]): Promise<ReaderEngagementGraph> {
//     try {
//       logger.info(`Generating reader engagement graph for ${chapters.length} chapters`);
      
//       // キャッシュキーを生成
//       const chapterNumbers = chapters.map(c => c.chapterNumber).join('_');
//       const cacheKey = `engagement_graph_${chapterNumbers}`;
      
//       // キャッシュから結果を取得
//       if (this.cacheResults && this.analysisCache.has(cacheKey)) {
//         logger.debug('Reader engagement graph loaded from cache');
//         return this.analysisCache.get(cacheKey);
//       }
      
//       // 各章のエンゲージメントスコアを計算
//       const chapterScores: {[chapter: number]: number} = {};
//       const engagementCurve: {[position: number]: number} = {};
      
//       // 各章を分析し、エンゲージメントスコアを計算
//       for (const chapter of chapters) {
//         // 読者体験分析を取得または生成
//         let analysis: ReaderExperienceAnalysis;
//         const analysisKey = `reader_exp_${chapter.chapterNumber}_${this.generateCacheHash(chapter.content)}`;
        
//         if (this.cacheResults && this.analysisCache.has(analysisKey)) {
//           analysis = this.analysisCache.get(analysisKey);
//         } else {
//           // 前の章を取得（可能な場合）
//           const prevChapters = chapters
//             .filter(c => c.chapterNumber < chapter.chapterNumber)
//             .sort((a, b) => b.chapterNumber - a.chapterNumber)
//             .slice(0, 2);
          
//           analysis = await this.analyzeReaderExperience(chapter, prevChapters);
//         }
        
//         // エンゲージメントスコアを計算（各要素に重み付け）
//         const engagementScore = this.calculateEngagementScore(analysis);
//         chapterScores[chapter.chapterNumber] = engagementScore;
        
//         // 相対位置（0-1）でのエンゲージメント曲線を生成
//         const position = (chapter.chapterNumber - 1) / Math.max(chapters.length - 1, 1);
//         engagementCurve[position] = engagementScore / 10; // 0-1に正規化
//       }
      
//       // ピークポイントと低ポイントの検出
//       const peakPoints: number[] = [];
//       const lowPoints: number[] = [];
      
//       const chapterNumbers = Object.keys(chapterScores).map(Number).sort((a, b) => a - b);
//       for (let i = 1; i < chapterNumbers.length - 1; i++) {
//         const current = chapterNumbers[i];
//         const prev = chapterNumbers[i - 1];
//         const next = chapterNumbers[i + 1];
        
//         if (chapterScores[current] > chapterScores[prev] && chapterScores[current] > chapterScores[next]) {
//           peakPoints.push(current);
//         } else if (chapterScores[current] < chapterScores[prev] && chapterScores[current] < chapterScores[next]) {
//           lowPoints.push(current);
//         }
//       }
      
//       // 理想的なピーク位置を計算（通常は0.7-0.8付近が良い）
//       const recommendedPeakPosition = this.calculateRecommendedPeakPosition(engagementCurve);
      
//       // 全体的なバランススコアを計算
//       const balanceScore = this.calculateEngagementBalanceScore(engagementCurve, recommendedPeakPosition);
      
//       const result: ReaderEngagementGraph = {
//         chapterScores,
//         engagementCurve,
//         peakPoints,
//         lowPoints,
//         recommendedPeakPosition,
//         balanceScore
//       };
      
//       // キャッシュに結果を保存
//       if (this.cacheResults) {
//         this.analysisCache.set(cacheKey, result);
//       }
      
//       logger.debug('Reader engagement graph generated', {
//         chaptersAnalyzed: chapters.length,
//         peakPointsCount: peakPoints.length,
//         lowPointsCount: lowPoints.length,
//         balanceScore
//       });
      
//       return result;
//     } catch (error) {
//       logger.error('Failed to generate reader engagement graph', {
//         error: error instanceof Error ? error.message : String(error),
//         chaptersCount: chapters.length
//       });
      
//       // エラー時はデフォルト値を返す
//       return {
//         chapterScores: { 1: 7 },
//         engagementCurve: { 0: 0.5, 0.5: 0.7, 1: 0.8 },
//         peakPoints: [],
//         lowPoints: [],
//         recommendedPeakPosition: 0.75,
//         balanceScore: 0.5
//       };
//     }
//   }

//   /**
//    * 章の感情的影響を分析する
//    * @param chapter 分析対象の章
//    * @returns 感情的影響分析
//    */
//   async analyzeEmotionalImpact(chapter: Chapter): Promise<EmotionalImpactAnalysis> {
//     try {
//       logger.info(`Analyzing emotional impact for chapter ${chapter.chapterNumber}`);
      
//       // キャッシュキーを生成
//       const cacheKey = `emotional_impact_${chapter.chapterNumber}_${this.generateCacheHash(chapter.content)}`;
      
//       // キャッシュから結果を取得
//       if (this.cacheResults && this.analysisCache.has(cacheKey)) {
//         logger.debug('Emotional impact analysis loaded from cache');
//         return this.analysisCache.get(cacheKey);
//       }
      
//       // 感情分析プロンプトを構築
//       const prompt = this.buildEmotionalImpactPrompt(chapter);
      
//       // API呼び出し（スロットリング対応）
//       const response = await apiThrottler.throttledRequest(() =>
//         this.geminiClient.generateText(prompt, {
//           temperature: 0.3,
//           purpose: 'analysis',
//           responseFormat: 'json'
//         })
//       );
      
//       // デフォルト感情分析の設定
//       const defaultAnalysis: EmotionalImpactAnalysis = {
//         primaryEmotions: [
//           { emotion: '緊張', strength: 0.7 },
//           { emotion: '期待', strength: 0.6 }
//         ],
//         emotionalShifts: [],
//         emotionalArc: { 0: '平静', 0.5: '緊張', 1: '解放' },
//         memorableEmotionalMoments: [],
//         overallEmotionalImpact: 7
//       };
      
//       // JsonParserを使用して安全にパース
//       const parsedResponse = JsonParser.parseFromAIResponse(response, defaultAnalysis);
      
//       // レスポンスの検証と正規化
//       const validatedResponse = this.validateEmotionalImpactAnalysis(parsedResponse);
      
//       // キャッシュに結果を保存
//       if (this.cacheResults) {
//         this.analysisCache.set(cacheKey, validatedResponse);
//       }
      
//       logger.info('Emotional impact analysis completed', {
//         chapterNumber: chapter.chapterNumber,
//         primaryEmotionsCount: validatedResponse.primaryEmotions.length,
//         shiftsCount: validatedResponse.emotionalShifts.length,
//         overallImpact: validatedResponse.overallEmotionalImpact
//       });
      
//       return validatedResponse;
//     } catch (error) {
//       logger.error('Failed to analyze emotional impact', {
//         error: error instanceof Error ? error.message : String(error),
//         chapterNumber: chapter.chapterNumber
//       });
      
//       // エラー時はデフォルト値を返す
//       return {
//         primaryEmotions: [
//           { emotion: '緊張', strength: 0.7 },
//           { emotion: '期待', strength: 0.6 }
//         ],
//         emotionalShifts: [],
//         emotionalArc: { 0: '平静', 0.5: '緊張', 1: '解放' },
//         memorableEmotionalMoments: [],
//         overallEmotionalImpact: 7
//       };
//     }
//   }

//   /**
//    * テキストの読みやすさ指標を分析する
//    * @param content テキストコンテンツ
//    * @returns 読みやすさ指標
//    */
//   analyzeReadabilityMetrics(content: string): ReadabilityMetrics {
//     try {
//       logger.info('Analyzing readability metrics');
      
//       // キャッシュキーを生成
//       const cacheKey = `readability_${this.generateCacheHash(content)}`;
      
//       // キャッシュから結果を取得
//       if (this.cacheResults && this.readabilityCache.has(cacheKey)) {
//         logger.debug('Readability metrics loaded from cache');
//         return this.readabilityCache.get(cacheKey)!;
//       }
      
//       // 文章を分割
//       const sentences = this.splitSentences(content);
//       const paragraphs = content.split(/\n+/).filter(p => p.trim().length > 0);
      
//       // 単語数をカウント
//       const wordCount = this.countWords(content);
      
//       // 各指標を計算
//       const averageSentenceLength = sentences.length > 0 ? wordCount / sentences.length : 0;
//       const averageParagraphLength = paragraphs.length > 0 ? wordCount / paragraphs.length : 0;
      
//       // 複雑な単語の割合（4音節以上と簡易的に定義）
//       const complexWords = this.countComplexWords(content);
//       const complexWordPercentage = wordCount > 0 ? complexWords / wordCount : 0;
      
//       // 受動態の割合（近似値）
//       const passiveVoiceCount = this.countPassiveVoice(content);
//       const passiveVoicePercentage = sentences.length > 0 ? passiveVoiceCount / sentences.length : 0;
      
//       // フレッシュ・キンケイド・グレードレベル（英語向けの指標を日本語向けに調整）
//       const fleschKincaidScore = 100 - (10 * averageSentenceLength * 0.4) - (complexWordPercentage * 100 * 0.35);
      
//       // 読解レベルを決定
//       let readabilityLevel: 'SIMPLE' | 'STANDARD' | 'COMPLEX' | 'ACADEMIC' = 'STANDARD';
      
//       if (fleschKincaidScore >= 80) {
//         readabilityLevel = 'SIMPLE';
//       } else if (fleschKincaidScore >= 60) {
//         readabilityLevel = 'STANDARD';
//       } else if (fleschKincaidScore >= 30) {
//         readabilityLevel = 'COMPLEX';
//       } else {
//         readabilityLevel = 'ACADEMIC';
//       }
      
//       // 読書時間を推定（単語数 ÷ 平均読書速度）
//       const readingTimeMinutes = wordCount / 300; // 平均的な読書速度は1分あたり約300語
      
//       const readabilityMetrics: ReadabilityMetrics = {
//         fleschKincaidScore,
//         averageSentenceLength,
//         averageParagraphLength,
//         complexWordPercentage,
//         passiveVoicePercentage,
//         readabilityLevel,
//         readingTimeMinutes
//       };
      
//       // キャッシュに結果を保存
//       if (this.cacheResults) {
//         this.readabilityCache.set(cacheKey, readabilityMetrics);
//       }
      
//       logger.debug('Readability metrics calculated', {
//         fleschKincaidScore,
//         readabilityLevel,
//         readingTimeMinutes
//       });
      
//       return readabilityMetrics;
//     } catch (error) {
//       logger.error('Failed to analyze readability metrics', {
//         error: error instanceof Error ? error.message : String(error)
//       });
      
//       // エラー時はデフォルト値を返す
//       return {
//         fleschKincaidScore: 70,
//         averageSentenceLength: 15,
//         averageParagraphLength: 5,
//         complexWordPercentage: 0.2,
//         passiveVoicePercentage: 0.1,
//         readabilityLevel: 'STANDARD',
//         readingTimeMinutes: 5
//       };
//     }
//   }

//   /**
//    * 章の潜在的な読者のチャレンジポイントを特定する
//    * @param chapter 分析対象の章
//    * @returns 読者のチャレンジポイント
//    */
//   async identifyPotentialReaderChallenge(chapter: Chapter): Promise<ReaderChallengePoint[]> {
//     try {
//       logger.info(`Identifying potential reader challenges for chapter ${chapter.chapterNumber}`);
      
//       // キャッシュキーを生成
//       const cacheKey = `reader_challenges_${chapter.chapterNumber}_${this.generateCacheHash(chapter.content)}`;
      
//       // キャッシュから結果を取得
//       if (this.cacheResults && this.analysisCache.has(cacheKey)) {
//         logger.debug('Reader challenges loaded from cache');
//         return this.analysisCache.get(cacheKey);
//       }
      
//       // 読みやすさ指標を分析
//       const readabilityMetrics = this.analyzeReadabilityMetrics(chapter.content);
      
//       // 読者体験分析を実行（もしまだ行われていなければ）
//       const experienceKey = `reader_exp_${chapter.chapterNumber}_${this.generateCacheHash(chapter.content)}`;
//       let experienceAnalysis: ReaderExperienceAnalysis;
      
//       if (this.cacheResults && this.analysisCache.has(experienceKey)) {
//         experienceAnalysis = this.analysisCache.get(experienceKey);
//       } else {
//         experienceAnalysis = await this.analyzeReaderExperience(chapter, []);
//       }
      
//       // 潜在的な課題ポイントを特定
//       const challengePoints: ReaderChallengePoint[] = [];
      
//       // 複雑さに関する課題
//       if (readabilityMetrics.complexWordPercentage > 0.3 || readabilityMetrics.averageSentenceLength > 25) {
//         challengePoints.push({
//           position: 0.2, // おおよその位置
//           challengeType: 'COMPLEXITY',
//           description: '文章の複雑さが読者の理解を妨げる可能性があります',
//           suggestion: '長い文を分割し、より簡潔な表現を使用することを検討してください',
//           severity: readabilityMetrics.complexWordPercentage > 0.4 ? 'HIGH' : 'MEDIUM'
//         });
//       }
      
//       // 混乱に関する課題
//       if (experienceAnalysis.clarity < 6) {
//         challengePoints.push({
//           position: 0.5, // おおよその位置
//           challengeType: 'CONFUSION',
//           description: '物語の流れや状況説明が不明確で読者が混乱する可能性があります',
//           suggestion: '重要な情報を明確に提示し、必要に応じて読者のリマインダーを提供してください',
//           severity: experienceAnalysis.clarity < 4 ? 'HIGH' : 'MEDIUM'
//         });
//       }
      
//       // 興味の喪失に関する課題
//       if (experienceAnalysis.interestRetention < 6) {
//         challengePoints.push({
//           position: 0.7, // おおよその位置
//           challengeType: 'DISENGAGEMENT',
//           description: '読者の興味を維持するのに十分な緊張感や展開がない可能性があります',
//           suggestion: '予想外の展開、新たな情報、または感情的な瞬間を追加して興味を維持してください',
//           severity: experienceAnalysis.interestRetention < 4 ? 'HIGH' : 'MEDIUM'
//         });
//       }
      
//       // キャラクターとの断絶に関する課題
//       if (experienceAnalysis.empathy < 6) {
//         challengePoints.push({
//           position: 0.4, // おおよその位置
//           challengeType: 'DISCONNECT',
//           description: '読者がキャラクターに感情移入しにくい可能性があります',
//           suggestion: 'キャラクターの内面的な反応や動機をより明確に示し、共感できる瞬間を作ってください',
//           severity: experienceAnalysis.empathy < 4 ? 'HIGH' : 'MEDIUM'
//         });
//       }
      
//       // コンテンツ固有の課題を特定（AIを使用）
//       if (challengePoints.length < 3) {
//         const specificChallenges = await this.identifyContentSpecificChallenges(chapter);
//         challengePoints.push(...specificChallenges);
//       }
      
//       // 重要度でソート
//       const sortedChallenges = challengePoints.sort((a, b) => {
//         const severityWeight = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
//         return severityWeight[b.severity] - severityWeight[a.severity];
//       });
      
//       // キャッシュに結果を保存
//       if (this.cacheResults) {
//         this.analysisCache.set(cacheKey, sortedChallenges);
//       }
      
//       logger.debug('Reader challenges identified', {
//         chapterNumber: chapter.chapterNumber,
//         challengesCount: sortedChallenges.length
//       });
      
//       return sortedChallenges;
//     } catch (error) {
//       logger.error('Failed to identify reader challenges', {
//         error: error instanceof Error ? error.message : String(error),
//         chapterNumber: chapter.chapterNumber
//       });
      
//       // エラー時はデフォルト値を返す
//       return [{
//         position: 0.5,
//         challengeType: 'COMPLEXITY',
//         description: 'テキストの複雑さが読者の理解を妨げる可能性があります',
//         suggestion: 'より簡潔で明確な文章表現を使用してください',
//         severity: 'MEDIUM'
//       }];
//     }
//   }

//   /**
//    * 特定の感情に対して章を最適化する提案を生成する
//    * @param chapter 分析対象の章
//    * @param targetEmotion 目標とする感情
//    * @returns 感情最適化提案
//    */
//   async optimizeForTargetEmotion(
//     chapter: Chapter, 
//     targetEmotion: string
//   ): Promise<EmotionalOptimizationSuggestion[]> {
//     try {
//       logger.info(`Optimizing chapter ${chapter.chapterNumber} for emotion: ${targetEmotion}`);
      
//       // キャッシュキーを生成
//       const cacheKey = `emotion_opt_${targetEmotion}_${chapter.chapterNumber}_${this.generateCacheHash(chapter.content)}`;
      
//       // キャッシュから結果を取得
//       if (this.cacheResults && this.analysisCache.has(cacheKey)) {
//         logger.debug('Emotion optimization suggestions loaded from cache');
//         return this.analysisCache.get(cacheKey);
//       }
      
//       // 感情分析を取得または実行
//       const emotionKey = `emotional_impact_${chapter.chapterNumber}_${this.generateCacheHash(chapter.content)}`;
//       let emotionalImpact: EmotionalImpactAnalysis;
      
//       if (this.cacheResults && this.analysisCache.has(emotionKey)) {
//         emotionalImpact = this.analysisCache.get(emotionKey);
//       } else {
//         emotionalImpact = await this.analyzeEmotionalImpact(chapter);
//       }
      
//       // 現在の主要感情を特定
//       const currentEmotions = emotionalImpact.primaryEmotions.map(e => e.emotion);
      
//       // 目標感情に合わせた最適化のプロンプトを構築
//       const prompt = this.buildEmotionOptimizationPrompt(chapter, targetEmotion, currentEmotions);
      
//       // API呼び出し（スロットリング対応）
//       const response = await apiThrottler.throttledRequest(() =>
//         this.geminiClient.generateText(prompt, {
//           temperature: 0.4,
//           purpose: 'analysis',
//           responseFormat: 'json'
//         })
//       );
      
//       // デフォルト提案の設定
//       const defaultSuggestions: EmotionalOptimizationSuggestion[] = [{
//         section: '全体',
//         currentEmotion: currentEmotions[0] || '中立',
//         targetEmotion: targetEmotion,
//         optimizationStrategy: `${targetEmotion}を引き出すような描写や展開を追加してください`,
//         confidenceScore: 0.7
//       }];
      
//       // JsonParserを使用して安全にパース
//       const parsedResponse = JsonParser.parseFromAIResponse(response, defaultSuggestions);
      
//       // レスポンスの検証と正規化
//       const validatedSuggestions = this.validateEmotionOptimizationSuggestions(parsedResponse, targetEmotion);
      
//       // キャッシュに結果を保存
//       if (this.cacheResults) {
//         this.analysisCache.set(cacheKey, validatedSuggestions);
//       }
      
//       logger.debug('Emotion optimization suggestions generated', {
//         chapterNumber: chapter.chapterNumber,
//         targetEmotion,
//         suggestionsCount: validatedSuggestions.length
//       });
      
//       return validatedSuggestions;
//     } catch (error) {
//       logger.error('Failed to optimize for target emotion', {
//         error: error instanceof Error ? error.message : String(error),
//         chapterNumber: chapter.chapterNumber,
//         targetEmotion
//       });
      
//       // エラー時はデフォルト値を返す
//       return [{
//         section: '全体',
//         currentEmotion: '中立',
//         targetEmotion: targetEmotion,
//         optimizationStrategy: `${targetEmotion}を引き出すような描写や展開を追加してください`,
//         confidenceScore: 0.7
//       }];
//     }
//   }

//   /**
//    * 読者体験分析のプロンプトを構築する
//    * @private
//    * @param chapter 分析対象の章
//    * @param recentContent 最近の章のコンテンツ
//    * @returns プロンプト
//    */
//   private buildReaderExperiencePrompt(chapter: Chapter, recentContent: string): string {
//     // 分析用プロンプトの構築
//     return `
// 以下の小説の章を「読者の視点」から分析してください。

// 前章：${recentContent.substring(0, 2000)}

// 現章：${chapter.content.substring(0, 4000)}

// 以下を評価（1-10）：
// 1. 興味維持：読者の注意をどの程度引きつけ続けるか
// 2. 感情移入：キャラクターへの共感度
// 3. 理解度：物語の流れや出来事の理解しやすさ
// 4. 予想外度：展開の意外性
// 5. 続きへの期待：次章を読みたいという欲求の強さ

// 読者体験を低下させる可能性のある部分を具体的に指摘し、改善案も提供してください。
// また、特に効果的で読者に良い印象を与える強みも挙げてください。

// JSONフォーマットで結果を返してください：
// {
//   "interestRetention": 数値,
//   "empathy": 数値,
//   "clarity": 数値,
//   "unexpectedness": 数値,
//   "anticipation": 数値,
//   "overallScore": 数値,
//   "weakPoints": [
//     {"point": "問題点の説明", "suggestion": "改善提案"}
//   ],
//   "strengths": ["強み1", "強み2"]
// }`;
//   }

//   /**
//    * 感情的影響分析のプロンプトを構築する
//    * @private
//    * @param chapter 分析対象の章
//    * @returns プロンプト
//    */
//   private buildEmotionalImpactPrompt(chapter: Chapter): string {
//     return `
// 以下の小説の章を「感情的影響」の観点から分析してください。読者がどのような感情体験をするか、感情の流れや変化を詳細に評価してください。

// 章内容：${chapter.content.substring(0, 4000)}

// 以下の点を分析してください：
// 1. 主要な感情：章全体を通じて喚起される主要な感情とその強さ
// 2. 感情の変化：章の中での感情の変化や転換点
// 3. 感情の弧：章の最初から最後までの感情の変化の軌跡
// 4. 印象的な感情的瞬間：特に強い感情を喚起する場面や瞬間
// 5. 全体的な感情的影響の強さ（1-10）

// JSONフォーマットで結果を返してください：
// {
//   "primaryEmotions": [
//     {"emotion": "感情名", "strength": 0から1の強さ}
//   ],
//   "emotionalShifts": [
//     {"position": 0から1の位置, "fromEmotion": "元の感情", "toEmotion": "新しい感情", "intensity": 0から1の強度}
//   ],
//   "emotionalArc": {
//     "0": "最初の感情",
//     "0.25": "1/4地点の感情",
//     "0.5": "中間地点の感情",
//     "0.75": "3/4地点の感情",
//     "1": "最終的な感情"
//   },
//   "memorableEmotionalMoments": [
//     {"position": 0から1の位置, "description": "場面の簡潔な説明", "emotion": "感情", "intensity": 0から1の強度}
//   ],
//   "overallEmotionalImpact": 1から10の評価
// }`;
//   }

//   /**
//    * 感情最適化のプロンプトを構築する
//    * @private
//    * @param chapter 分析対象の章
//    * @param targetEmotion 目標とする感情
//    * @param currentEmotions 現在の感情
//    * @returns プロンプト
//    */
//   private buildEmotionOptimizationPrompt(
//     chapter: Chapter, 
//     targetEmotion: string, 
//     currentEmotions: string[]
//   ): string {
//     return `
// 以下の小説の章を「${targetEmotion}」という感情をより強く引き出すように最適化する提案をお願いします。
// 現在の章では主に「${currentEmotions.join('」「')}」という感情が強く出ています。

// 章内容：${chapter.content.substring(0, 4000)}

// 章の異なるセクション（導入、展開、クライマックスなど）ごとに、「${targetEmotion}」をより強く引き出すための具体的な提案を行ってください。
// 各セクションについて、現在の感情状態と、目標の感情状態への変換戦略を示してください。

// JSONフォーマットで結果を返してください：
// [
//   {
//     "section": "セクション名または位置の説明",
//     "currentEmotion": "現在の主要感情",
//     "targetEmotion": "${targetEmotion}",
//     "optimizationStrategy": "変換戦略の具体的な説明",
//     "textSuggestion": "具体的なテキスト例（オプショナル）",
//     "confidenceScore": 0から1の自信度
//   }
// ]

// 最も効果的だと思われる最適化から順に並べてください。`;
//   }

//   /**
//    * コンテンツ固有の読者課題を特定する
//    * @private
//    * @param chapter 分析対象の章
//    * @returns 読者のチャレンジポイント
//    */
//   private async identifyContentSpecificChallenges(chapter: Chapter): Promise<ReaderChallengePoint[]> {
//     try {
//       // コンテンツからセクションを抽出
//       const content = chapter.content;
//       const contentLength = content.length;
      
//       // セクション分割（簡易版）
//       const sections = [
//         { start: 0, end: Math.floor(contentLength * 0.33) },
//         { start: Math.floor(contentLength * 0.33), end: Math.floor(contentLength * 0.66) },
//         { start: Math.floor(contentLength * 0.66), end: contentLength }
//       ];
      
//       const challengePoints: ReaderChallengePoint[] = [];
      
//       // シンプルなヒューリスティックルールに基づいて潜在的な課題を特定
      
//       // 1. 前半部分が過度に説明的か確認
//       const firstSection = content.substring(sections[0].start, sections[0].end);
//       const dialogRatio = this.calculateDialogRatio(firstSection);
      
//       if (dialogRatio < 0.1 && firstSection.length > 1000) {
//         challengePoints.push({
//           position: 0.15,
//           challengeType: 'DISENGAGEMENT',
//           description: '序盤に説明が多く、対話や行動が少ないため読者が退屈する可能性があります',
//           suggestion: '序盤に対話や行動を増やし、説明文を減らすか分散させることを検討してください',
//           severity: 'MEDIUM'
//         });
//       }
      
//       // 2. 中盤の展開速度を確認
//       const middleSection = content.substring(sections[1].start, sections[1].end);
//       const sentenceCount = this.splitSentences(middleSection).length;
//       const avgSentenceLength = middleSection.length / Math.max(1, sentenceCount);
      
//       if (avgSentenceLength > 50 && sentenceCount > 10) {
//         challengePoints.push({
//           position: 0.5,
//           challengeType: 'COMPLEXITY',
//           description: '中盤の文章が長く複雑で、読者が物語の流れを追いにくくなっている可能性があります',
//           suggestion: '中盤の長い文章を分割し、要点を明確にしてください',
//           severity: 'MEDIUM'
//         });
//       }
      
//       // 3. 終盤のクロージャーを確認
//       const lastSection = content.substring(sections[2].start, sections[2].end);
//       const lastParagraphs = lastSection.split(/\n+/).filter(p => p.trim().length > 0);
//       const lastParagraph = lastParagraphs[lastParagraphs.length - 1] || '';
      
//       if (lastParagraph.length < 50 || !this.hasStrongClosing(lastParagraph)) {
//         challengePoints.push({
//           position: 0.9,
//           challengeType: 'DISCONNECT',
//           description: '章の終わり方が弱く、読者の次章への期待や満足感が得られない可能性があります',
//           suggestion: '章の終わりをより印象的にし、次章への興味を引く要素を追加してください',
//           severity: 'MEDIUM'
//         });
//       }
      
//       return challengePoints;
//     } catch (error) {
//       logger.error('Failed to identify content specific challenges', {
//         error: error instanceof Error ? error.message : String(error),
//         chapterNumber: chapter.chapterNumber
//       });
//       return [];
//     }
//   }

//   /**
//    * テキストの会話の割合を計算する
//    * @private
//    * @param text テキスト
//    * @returns 会話の割合（0-1）
//    */
//   private calculateDialogRatio(text: string): number {
//     // 会話は「」で囲まれた部分とカウント（簡易的な実装）
//     const dialogMatches = text.match(/「[^」]*」/g);
//     const dialogLength = dialogMatches ? dialogMatches.join('').length : 0;
    
//     return text.length > 0 ? dialogLength / text.length : 0;
//   }

//   /**
//    * 強い結びがあるかを確認する
//    * @private
//    * @param paragraph 段落
//    * @returns 強い結びがあるかどうか
//    */
//   private hasStrongClosing(paragraph: string): boolean {
//     // 強い終わり方の特徴を検出（簡易的な実装）
//     const strongEndingPatterns = [
//       /[！？]$/,  // 感嘆符や疑問符で終わる
//       /決意/,     // 決意を示す言葉
//       /次.*だろう/,  // 次への言及
//       /続く/,     // 続きを示唆
//       /変わる/,   // 変化を示唆
//     ];
    
//     return strongEndingPatterns.some(pattern => pattern.test(paragraph));
//   }

//   /**
//    * 文章を文に分割する
//    * @private
//    * @param text テキスト
//    * @returns 文の配列
//    */
//   private splitSentences(text: string): string[] {
//     // 文末記号で分割（。や！？など）
//     return text.split(/[。！？]/g).filter(s => s.trim().length > 0);
//   }

//   /**
//    * 単語数をカウント
//    * @private
//    * @param text テキスト
//    * @returns 単語数
//    */
//   private countWords(text: string): number {
//     // 日本語の場合は文字数をベースに概算（簡易的な実装）
//     // 漢字1文字を1単語、かな2文字を1単語と概算
//     const charactersWithoutSpaces = text.replace(/\s+/g, '');
//     const kanjiCount = (charactersWithoutSpaces.match(/[\u4e00-\u9faf]/g) || []).length;
//     const kanaCount = (charactersWithoutSpaces.match(/[\u3040-\u309f\u30a0-\u30ff]/g) || []).length;
    
//     return kanjiCount + Math.ceil(kanaCount / 2);
//   }

//   /**
//    * 複雑な単語をカウント
//    * @private
//    * @param text テキスト
//    * @returns 複雑な単語数
//    */
//   private countComplexWords(text: string): number {
//     // 日本語の場合は漢字の連続を複雑な単語と見なす（簡易的な実装）
//     const kanjiGroups = text.match(/[\u4e00-\u9faf]{3,}/g) || [];
//     return kanjiGroups.length;
//   }

//   /**
//    * 受動態表現をカウント
//    * @private
//    * @param text テキスト
//    * @returns 受動態表現の数
//    */
//   private countPassiveVoice(text: string): number {
//     // 日本語の受動態表現を検出（簡易的な実装）
//     const passivePatterns = [
//       /れる/g,
//       /られる/g,
//       /される/g,
//       /れた/g,
//       /られた/g,
//       /された/g
//     ];
    
//     let count = 0;
//     passivePatterns.forEach(pattern => {
//       const matches = text.match(pattern);
//       if (matches) {
//         count += matches.length;
//       }
//     });
    
//     return count;
//   }

//   /**
//    * エンゲージメントスコアを計算する
//    * @private
//    * @param analysis 読者体験分析結果
//    * @returns エンゲージメントスコア（0-10）
//    */
//   private calculateEngagementScore(analysis: ReaderExperienceAnalysis): number {
//     // 各要素に重み付けをして計算
//     const weights = {
//       interestRetention: 0.35,
//       empathy: 0.25,
//       clarity: 0.15,
//       unexpectedness: 0.1,
//       anticipation: 0.15
//     };
    
//     let score = 0;
//     let totalWeight = 0;
    
//     for (const [key, weight] of Object.entries(weights) as [keyof typeof weights, number][]) {
//       if (typeof analysis[key] === 'number') {
//         score += analysis[key] * weight;
//         totalWeight += weight;
//       }
//     }
    
//     // 0-10の範囲に正規化
//     return totalWeight > 0 ? score / totalWeight : 5;
//   }

//   /**
//    * 理想的なピーク位置を計算する
//    * @private
//    * @param engagementCurve エンゲージメント曲線
//    * @returns 推奨ピーク位置（0-1）
//    */
//   private calculateRecommendedPeakPosition(engagementCurve: {[position: number]: number}): number {
//     // 物語ジャンルにより理想的なピーク位置が異なる
//     // このシンプルな実装では0.75を返す（物語の3/4地点でピークを迎えるのが一般的）
//     return 0.75;
//   }

//   /**
//    * エンゲージメントバランススコアを計算する
//    * @private
//    * @param engagementCurve エンゲージメント曲線
//    * @param recommendedPeakPosition 推奨ピーク位置
//    * @returns バランススコア（0-1）
//    */
//   private calculateEngagementBalanceScore(
//     engagementCurve: {[position: number]: number}, 
//     recommendedPeakPosition: number
//   ): number {
//     try {
//       // エンゲージメント曲線の評価基準：
//       // 1. 全体的な上昇傾向
//       // 2. 推奨位置付近でのピーク
//       // 3. 適度な変動（単調すぎず、変動しすぎない）
      
//       const positions = Object.keys(engagementCurve).map(Number).sort((a, b) => a - b);
//       const values = positions.map(pos => engagementCurve[pos]);
      
//       if (positions.length < 2) {
//         return 0.5; // デフォルト値
//       }
      
//       // 上昇傾向の評価
//       let riseTrend = 0;
//       for (let i = 1; i < positions.length; i++) {
//         const diff = values[i] - values[i - 1];
//         riseTrend += diff;
//       }
//       const normalizedRiseTrend = Math.min(1, Math.max(0, (riseTrend / (positions.length - 1) + 0.2) * 2));
      
//       // ピーク位置の評価
//       const peakPosition = positions[values.indexOf(Math.max(...values))];
//       const peakPositionScore = 1 - Math.min(1, Math.abs(peakPosition - recommendedPeakPosition) * 2);
      
//       // 変動の評価
//       const variations = [];
//       for (let i = 1; i < positions.length; i++) {
//         variations.push(Math.abs(values[i] - values[i - 1]));
//       }
//       const avgVariation = variations.reduce((sum, val) => sum + val, 0) / variations.length;
//       const variationScore = Math.min(1, Math.max(0, 1 - Math.abs(avgVariation - 0.15) * 5));
      
//       // 総合スコア（重み付け）
//       const totalScore = (normalizedRiseTrend * 0.4) + (peakPositionScore * 0.4) + (variationScore * 0.2);
      
//       return Math.min(1, Math.max(0, totalScore));
//     } catch (error) {
//       logger.error('Failed to calculate engagement balance score', {
//         error: error instanceof Error ? error.message : String(error)
//       });
//       return 0.5; // エラー時はデフォルト値
//     }
//   }

//   /**
//    * 分析レスポンスを検証する
//    * @private
//    * @param response 分析レスポンス
//    * @returns 検証済み分析レスポンス
//    */
//   private validateAnalysisResponse(response: any): ReaderExperienceAnalysis {
//     // レスポンスの検証と正規化
//     const validatedResponse: ReaderExperienceAnalysis = {
//       interestRetention: this.normalizeScore(response.interestRetention),
//       empathy: this.normalizeScore(response.empathy),
//       clarity: this.normalizeScore(response.clarity),
//       unexpectedness: this.normalizeScore(response.unexpectedness),
//       anticipation: this.normalizeScore(response.anticipation),
//       overallScore: this.normalizeScore(response.overallScore || this.calculateOverallScore(response)),
//       weakPoints: Array.isArray(response.weakPoints) ? response.weakPoints : [],
//       strengths: Array.isArray(response.strengths) ? response.strengths : []
//     };
    
//     return validatedResponse;
//   }

//   /**
//    * 感情分析結果を検証する
//    * @private
//    * @param analysis 感情分析結果
//    * @returns 検証済み感情分析結果
//    */
//   private validateEmotionalImpactAnalysis(analysis: EmotionalImpactAnalysis): EmotionalImpactAnalysis {
//     // 主要感情の検証
//     let primaryEmotions = analysis.primaryEmotions || [];
//     if (!Array.isArray(primaryEmotions) || primaryEmotions.length === 0) {
//       primaryEmotions = [{ emotion: '中立', strength: 0.5 }];
//     }
    
//     // 各感情の強度を0-1の範囲に正規化
//     primaryEmotions = primaryEmotions.map(emotion => ({
//       emotion: emotion.emotion,
//       strength: Math.min(1, Math.max(0, emotion.strength))
//     }));
    
//     // 感情シフトの検証
//     let emotionalShifts = analysis.emotionalShifts || [];
//     if (!Array.isArray(emotionalShifts)) {
//       emotionalShifts = [];
//     }
    
//     // 感情アークの検証
//     let emotionalArc = analysis.emotionalArc || {};
//     if (Object.keys(emotionalArc).length === 0) {
//       emotionalArc = { 0: '開始感情', 0.5: '中間感情', 1: '終了感情' };
//     }
    
//     // 印象的な感情的瞬間の検証
//     let memorableEmotionalMoments = analysis.memorableEmotionalMoments || [];
//     if (!Array.isArray(memorableEmotionalMoments)) {
//       memorableEmotionalMoments = [];
//     }
    
//     // 全体的な感情的影響の検証
//     let overallEmotionalImpact = analysis.overallEmotionalImpact;
//     if (typeof overallEmotionalImpact !== 'number' || overallEmotionalImpact < 1 || overallEmotionalImpact > 10) {
//       overallEmotionalImpact = 7;
//     }
    
//     return {
//       primaryEmotions,
//       emotionalShifts,
//       emotionalArc,
//       memorableEmotionalMoments,
//       overallEmotionalImpact
//     };
//   }

//   /**
//    * 感情最適化提案を検証する
//    * @private
//    * @param suggestions 感情最適化提案
//    * @param targetEmotion 目標とする感情
//    * @returns 検証済み感情最適化提案
//    */
//   private validateEmotionOptimizationSuggestions(
//     suggestions: EmotionalOptimizationSuggestion[],
//     targetEmotion: string
//   ): EmotionalOptimizationSuggestion[] {
//     if (!Array.isArray(suggestions) || suggestions.length === 0) {
//       return [{
//         section: '全体',
//         currentEmotion: '中立',
//         targetEmotion: targetEmotion,
//         optimizationStrategy: `${targetEmotion}を引き出すような描写や展開を追加してください`,
//         confidenceScore: 0.7
//       }];
//     }
    
//     // 各提案を検証
//     return suggestions.filter(suggestion => {
//       // 必須フィールドが存在するか確認
//       return suggestion && 
//              typeof suggestion.section === 'string' &&
//              typeof suggestion.currentEmotion === 'string' &&
//              typeof suggestion.targetEmotion === 'string' &&
//              typeof suggestion.optimizationStrategy === 'string';
//     }).map(suggestion => {
//       // フィールドの正規化
//       return {
//         section: suggestion.section,
//         currentEmotion: suggestion.currentEmotion,
//         targetEmotion: suggestion.targetEmotion || targetEmotion,
//         optimizationStrategy: suggestion.optimizationStrategy,
//         textSuggestion: suggestion.textSuggestion,
//         confidenceScore: typeof suggestion.confidenceScore === 'number' ?
//           Math.min(1, Math.max(0, suggestion.confidenceScore)) : 0.7
//       };
//     });
//   }

//   /**
//    * スコアを正規化する (1-10の範囲に収める)
//    * @private
//    */
//   private normalizeScore(score: any): number {
//     if (typeof score !== 'number' || isNaN(score)) {
//       return 7; // デフォルト値
//     }
//     return Math.max(1, Math.min(10, Math.round(score)));
//   }

//   /**
//    * 総合スコアを計算する
//    * @private
//    */
//   private calculateOverallScore(scores: any): number {
//     try {
//       // 各要素のスコアに重み付けして平均を計算
//       const weights = {
//         interestRetention: 0.25,
//         empathy: 0.25,
//         clarity: 0.2,
//         unexpectedness: 0.15,
//         anticipation: 0.15
//       };
      
//       let totalWeight = 0;
//       let weightedSum = 0;
      
//       for (const [key, weight] of Object.entries(weights)) {
//         if (typeof scores[key] === 'number' && !isNaN(scores[key])) {
//           weightedSum += scores[key] * weight;
//           totalWeight += weight;
//         }
//       }
      
//       return totalWeight > 0 ? weightedSum / totalWeight : 7;
//     } catch (error) {
//       logger.error('Failed to calculate overall score', {
//         error: error instanceof Error ? error.message : String(error)
//       });
//       return 7; // デフォルト値
//     }
//   }

//   /**
//    * デフォルトの分析結果を作成する
//    * @private
//    */
//   private createDefaultAnalysis(): ReaderExperienceAnalysis {
//     return {
//       interestRetention: 7,
//       empathy: 7,
//       clarity: 7,
//       unexpectedness: 7,
//       anticipation: 7,
//       overallScore: 7,
//       weakPoints: [],
//       strengths: ['十分な読者体験の提供']
//     };
//   }

//   /**
//    * 興味維持のための提案を取得する
//    * @private
//    */
//   private getInterestSuggestion(score: number): string {
//     if (score <= 3) {
//       return 'より強い葛藤や謎を導入し、章ごとにミニクライマックスを設けてください';
//     } else if (score <= 5) {
//       return '細部の描写や会話に読者を引き込む要素を取り入れ、ペースに変化をつけてください';
//     } else {
//       return '現在の流れを維持しながら、章の終わりに次を読みたくなるフックを加えてください';
//     }
//   }

//   /**
//    * 感情移入のための提案を取得する
//    * @private
//    */
//   private getEmpathySuggestion(score: number): string {
//     if (score <= 3) {
//       return 'キャラクターの内面描写を大幅に増やし、感情と動機を明確に示してください';
//     } else if (score <= 5) {
//       return 'キャラクターの感情的反応をより具体的に描写し、読者が共感できる普遍的感情を盛り込んでください';
//     } else {
//       return 'キャラクターの脆弱性や内的葛藤をさらに掘り下げてください';
//     }
//   }

//   /**
//    * 理解度向上のための提案を取得する
//    * @private
//    */
//   private getClaritySuggestion(score: number): string {
//     if (score <= 3) {
//       return '物語の流れを整理し、重要な情報を繰り返すなど理解しやすい構造にしてください';
//     } else if (score <= 5) {
//       return '複雑な展開の前後に読者が整理できる瞬間を設け、因果関係をより明確にしてください';
//     } else {
//       return '重要な要素や情報に焦点を当て、余計な複雑さを排除してください';
//     }
//   }

//   /**
//    * 意外性向上のための提案を取得する
//    * @private
//    */
//   private getUnexpectednessSuggestion(score: number): string {
//     if (score <= 3) {
//       return '読者の予想を覆す展開や意外な発見を取り入れてください';
//     } else if (score <= 5) {
//       return 'キャラクターに予想外の行動や決断をさせ、物語に新鮮さを加えてください';
//     } else {
//       return '小さな意外性と伏線の回収を随所に配置して読者の注意を引き付けてください';
//     }
//   }

//   /**
//    * 続きへの期待感向上のための提案を取得する
//    * @private
//    */
//   private getAnticipationSuggestion(score: number): string {
//     if (score <= 3) {
//       return 'クリフハンガーや未解決の謎を導入し、次章への強い期待感を作ってください';
//     } else if (score <= 5) {
//       return '章の終わりに新たな疑問や展開の可能性を示唆し、続きを読みたくなる要素を加えてください';
//     } else {
//       return '物語の進行に伴って発生する新たな問題や課題をより明確に提示してください';
//     }
//   }

//   /**
//    * キャッシュのためのハッシュを生成する
//    * @private
//    * @param content コンテンツ
//    * @returns ハッシュ文字列
//    */
//   private generateCacheHash(content: string): string {
//     // 簡易的なハッシュ関数
//     let hash = 0;
//     if (content.length === 0) return hash.toString();
    
//     // コンテンツの一部のみを使用してハッシュを計算
//     const sample = content.length > 1000 ? 
//       content.substring(0, 300) + content.substring(content.length - 300) : 
//       content;
    
//     for (let i = 0; i < sample.length; i++) {
//       const char = sample.charCodeAt(i);
//       hash = ((hash << 5) - hash) + char;
//       hash = hash & hash; // 32bit整数に変換
//     }
    
//     return hash.toString();
//   }

//   /**
//    * キャッシュをクリアする
//    */
//   public clearCache(): void {
//     logger.debug('Clearing analysis cache');
//     this.analysisCache.clear();
//     this.readabilityCache.clear();
//     this.genreExpectationsCache.clear();
//   }
// }