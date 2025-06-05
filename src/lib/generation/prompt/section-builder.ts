/**
 * @fileoverview プロンプトのセクション構築クラス
 * @description プロンプトの各セクションを構築するクラス
 */

import { logger } from '@/lib/utils/logger';
import { PromptFormatter } from './prompt-formatter';
import { TemplateManager } from './template-manager';
import { GenerationContext } from '@/types/generation';
import { LearningJourneySystem } from '@/lib/learning-journey';
import {
    LearningStage,
    EmotionalArcDesign,
    CatharticExperience,
    EmpatheticPoint
} from '@/lib/learning-journey';

/**
 * プロンプトのセクション構築クラス
 * プロンプト内の各セクションを構築するロジックを担当
 */
export class SectionBuilder {
    /**
     * コンストラクタ
     * @param {PromptFormatter} formatter フォーマッター
     * @param {TemplateManager} templateManager テンプレート管理
     */
    constructor(
        private formatter: PromptFormatter,
        private templateManager: TemplateManager,
        private learningJourneySystem?: LearningJourneySystem
    ) { }

    /**
     * キャラクターの心理状態セクションを構築
     * @param {any} context 生成コンテキスト
     * @returns {string} 構築されたセクション
     */
    public buildCharacterPsychologySection(context: any): string {
        if (!context.characterPsychology) {
            return '';
        }

        let psychologySection = "\n## キャラクターの心理状態\n";

        try {
            for (const [characterId, psychologyData] of Object.entries(context.characterPsychology)) {
                // 型アサーションを使って型を明示
                const psychology = psychologyData as any;

                // キャラクター名を取得
                const character = context.characters?.find((c: any) => c.id === characterId);
                if (!character) continue;

                psychologySection += `【${character.name}】の心理:\n`;
                if (psychology.currentDesires && psychology.currentDesires.length > 0) {
                    psychologySection += `- 現在の欲求: ${psychology.currentDesires.join('、')}\n`;
                }

                if (psychology.currentFears && psychology.currentFears.length > 0) {
                    psychologySection += `- 現在の恐れ: ${psychology.currentFears.join('、')}\n`;
                }

                // 内的葛藤（あれば）
                if (psychology.internalConflicts && psychology.internalConflicts.length > 0) {
                    psychologySection += `- 内的葛藤: ${psychology.internalConflicts.join('、')}\n`;
                }

                // 感情状態
                if (psychology.emotionalState) {
                    // まず変数に代入してから操作を行う
                    const entriesArray = Object.entries(psychology.emotionalState) as [string, number][];
                    const emotions = entriesArray
                        .sort((a, b) => b[1] - a[1]) // 強度の高い順にソート
                        .slice(0, 3); // 上位3つまで

                    if (emotions.length > 0) {
                        psychologySection += "- 感情状態: ";
                        psychologySection += emotions.map(([emotion, intensity]) =>
                            `${emotion}(${Math.round(intensity * 10)}/10)`
                        ).join('、');
                        psychologySection += '\n';
                    }
                }

                // 他キャラへの感情（あれば）
                const attitudes = psychology.relationshipAttitudes;
                if (attitudes && Object.keys(attitudes).length > 0) {
                    psychologySection += "- 他者への感情:\n";

                    for (const [targetId, attitudeData] of Object.entries(attitudes)) {
                        // 型アサーションを使って型を明示
                        const attitude = attitudeData as any;

                        const targetChar = context.characters?.find((c: any) => c.id === targetId);
                        if (!targetChar) continue;

                        psychologySection += `  • ${targetChar.name}への${attitude.attitude} (強度:${Math.round(attitude.intensity * 10)}/10)${attitude.isDynamic ? `、変化中: ${attitude.recentChange}` : ''}\n`;
                    }
                }

                psychologySection += "\n";
            }

            return psychologySection;
        } catch (error) {
            logger.error('Error building character psychology section', { error });
            return '';
        }
    }

    /**
     * キャラクター成長情報セクションを構築
     * @param {any} context 生成コンテキスト
     * @param {string} genre ジャンル
     * @returns {string} 構築されたセクション
     */
    public buildCharacterGrowthSection(context: any, genre: string): string {
        if (!context.characterGrowthInfo) {
            return '';
        }

        try {
            let growthSection = "\n## キャラクターの成長とスキル情報\n";
            const growthInfo = context.characterGrowthInfo;

            // メインキャラクターの成長情報
            if (growthInfo.mainCharacters && growthInfo.mainCharacters.length > 0) {
                growthSection += "### 主要キャラクターの成長情報\n";

                for (const character of growthInfo.mainCharacters) {
                    growthSection += `【${character.name}】\n`;

                    // 成長フェーズがある場合
                    if (character.growthPhase) {
                        growthSection += `現在の成長フェーズ: ${character.growthPhase}\n`;
                    }

                    // スキル情報
                    if (character.skills && character.skills.length > 0) {
                        growthSection += "習得スキル:\n";
                        character.skills.forEach((skill: { name: string; level: number }) => {
                            growthSection += `- ${skill.name} (Lv.${skill.level})\n`;
                        });
                    }

                    // パラメータ情報
                    if (character.parameters && character.parameters.length > 0) {
                        // 上位5つのパラメータのみ表示（型を明示的に指定）
                        const topParameters = [...character.parameters]
                            .sort((a: { value: number }, b: { value: number }) => b.value - a.value)
                            .slice(0, 5);

                        growthSection += "特性パラメータ:\n";
                        topParameters.forEach((param: { name: string; value: number }) => {
                            growthSection += `- ${param.name}: ${param.value}/100\n`;
                        });
                    }

                    growthSection += "\n";
                }
            }

            // サポートキャラクターの成長情報（簡略化）
            if (growthInfo.supportingCharacters && growthInfo.supportingCharacters.length > 0) {
                growthSection += "### サポートキャラクターの特徴\n";

                for (const character of growthInfo.supportingCharacters) {
                    growthSection += `【${character.name}】\n`;

                    // トップスキルとパラメータのみ表示（簡略化）
                    if (character.skills && character.skills.length > 0) {
                        const topSkills = character.skills.slice(0, 2);
                        if (topSkills.length > 0) {
                            growthSection += `得意: ${topSkills.map((s: any) => s.name).join('、')}\n`;
                        }
                    }

                    growthSection += "\n";
                }
            }

            // ビジネスジャンル向けの成長表現の最適化
            if (genre === 'business') {
                const businessGrowthGuidance = this.templateManager.getBusinessSpecificSection('growthGuidance');
                if (businessGrowthGuidance) {
                    growthSection += businessGrowthGuidance + "\n";
                }
            }

            // 成長ガイダンス
            growthSection += "### 成長描写のガイダンス\n";
            growthSection += "- キャラクターの成長段階と習得スキルを考慮した描写をしてください\n";
            growthSection += "- スキルを使用するシーンでは、そのスキルの熟練度に応じた描写をしてください\n";
            growthSection += "- キャラクターの特性パラメータが高い能力は自然に発揮され、低い能力は苦手として描写してください\n";
            growthSection += "- 成長中のキャラクターには、新しい能力の獲得や既存能力の向上を示すシーンを含めてください\n";

            return growthSection;
        } catch (error) {
            logger.error('Error building character growth section', { error });
            return '';
        }
    }

    /**
     * 感情アークセクションを構築
     * @param {any} context 生成コンテキスト
     * @param {string} genre ジャンル
     * @returns {string} 構築されたセクション
     */
    public buildEmotionalArcSection(context: any, genre: string): string {
        if (!context.emotionalArc) {
            return '';
        }

        try {
            let emotionalArcSection = "\n## 感情アークの設計\n";

            emotionalArcSection += `推奨トーン: ${context.emotionalArc.recommendedTone}\n\n`;

            emotionalArcSection += "章内での感情の流れ:\n";

            // 冒頭
            emotionalArcSection += "- 冒頭部:\n";
            context.emotionalArc.emotionalJourney.opening.forEach((item: any) => {
                emotionalArcSection += `  • ${item.dimension}: ${item.level}/10\n`;
            });

            // 展開
            emotionalArcSection += "- 展開部:\n";
            context.emotionalArc.emotionalJourney.development.forEach((item: any) => {
                emotionalArcSection += `  • ${item.dimension}: ${item.level}/10\n`;
            });

            // 結末
            emotionalArcSection += "- 結末部:\n";
            context.emotionalArc.emotionalJourney.conclusion.forEach((item: any) => {
                emotionalArcSection += `  • ${item.dimension}: ${item.level}/10\n`;
            });

            if (context.emotionalArc.reason) {
                emotionalArcSection += `\n設計理由: ${context.emotionalArc.reason}\n`;
            }

            // ビジネスジャンルの場合の特別指示
            if (genre === 'business') {
                const businessEmotionalGuidance = this.templateManager.getBusinessSpecificSection('emotionalArcGuidance');
                if (businessEmotionalGuidance) {
                    emotionalArcSection += businessEmotionalGuidance + "\n";
                }
            }

            return emotionalArcSection;
        } catch (error) {
            logger.error('Error building emotional arc section', { error });
            return '';
        }
    }

    /**
     * 文体ガイダンスセクションを構築
     * @param {any} context 生成コンテキスト
     * @param {string} genre ジャンル
     * @returns {string} 構築されたセクション
     */
    public buildStyleGuidanceSection(context: any, genre: string): string {
        // styleGuidanceがある場合
        if (context.styleGuidance) {
            try {
                const styleGuidance = context.styleGuidance;
                let styleSection = "\n## 文体ガイダンス\n";

                // 一般的なガイダンス
                if (styleGuidance.general && styleGuidance.general.length > 0) {
                    styleGuidance.general.forEach((guidance: string) => {
                        styleSection += `- ${guidance}\n`;
                    });
                }

                // 文構造のガイダンス
                if (styleGuidance.sentenceStructure && styleGuidance.sentenceStructure.length > 0) {
                    styleSection += "\n文の構造:\n";
                    styleGuidance.sentenceStructure.forEach((guidance: string) => {
                        styleSection += `- ${guidance}\n`;
                    });
                }

                // 語彙のガイダンス
                if (styleGuidance.vocabulary && styleGuidance.vocabulary.length > 0) {
                    styleSection += "\n語彙の使用:\n";
                    styleGuidance.vocabulary.forEach((guidance: string) => {
                        styleSection += `- ${guidance}\n`;
                    });
                }

                // リズムのガイダンス
                if (styleGuidance.rhythm && styleGuidance.rhythm.length > 0) {
                    styleSection += "\n文のリズム:\n";
                    styleGuidance.rhythm.forEach((guidance: string) => {
                        styleSection += `- ${guidance}\n`;
                    });
                }

                // ビジネスジャンルの場合の特別指示
                if (genre === 'business') {
                    const businessStyleGuidance = this.templateManager.getBusinessSpecificSection('styleGuidance');
                    if (businessStyleGuidance) {
                        styleSection += businessStyleGuidance + "\n";
                    }
                }

                // 主語多様性に関する特別強調セクションを追加
                let hasSubjectDiversityGuidance = false;
                // 文構造ガイダンスで主語多様性に関する指示があるか確認
                if (styleGuidance.sentenceStructure) {
                    for (const guidance of styleGuidance.sentenceStructure) {
                        if (guidance.includes('主語') || guidance.includes('キャラクター名') ||
                            guidance.includes('代名詞')) {
                            hasSubjectDiversityGuidance = true;
                            break;
                        }
                    }
                }

                // 具体例があれば追加
                if (styleGuidance.examples && styleGuidance.examples.length > 0) {
                    styleSection += "\n### 文体改善の具体例:\n";
                    styleGuidance.examples.forEach((example: any) => {
                        styleSection += "❌ 避けるべき表現:\n";
                        styleSection += `${example.before}\n\n`;
                        styleSection += "✅ 推奨される表現:\n";
                        styleSection += `${example.after}\n\n`;
                    });
                }

                // 主語多様性の特別強調（既存のガイダンスに含まれていない場合）
                if (!hasSubjectDiversityGuidance) {
                    styleSection += "\n### 主語の多様性（重要）\n";
                    styleSection += "- 同じキャラクター名を連続して主語に使うのを避けてください\n";
                    styleSection += "- 代名詞（「彼」「彼女」「その人」など）を適切に使ってください\n";
                    styleSection += "- 文脈から明らかな場合は主語を省略してください（日本語の特性を活かす）\n";
                    styleSection += "- 複数の文を接続詞や接続助詞で結んで一文にすることで、主語の繰り返しを減らしてください\n";

                    // 具体例が含まれていない場合はデフォルトの例を追加
                    if (!styleGuidance.examples || styleGuidance.examples.length === 0) {
                        styleSection += "\n### 主語多様性の具体例:\n";
                        styleSection += "❌ 避けるべき表現:\n";
                        styleSection += "太郎は部屋に入った。太郎は窓を開けた。太郎は深呼吸をした。\n\n";
                        styleSection += "✅ 推奨される表現:\n";
                        styleSection += "太郎は部屋に入り、窓を開けた。そして、深呼吸をした。\n\n";

                        styleSection += "❌ 避けるべき表現:\n";
                        styleSection += "花子は本を取り出した。花子はページをめくった。花子は内容に夢中になった。\n\n";
                        styleSection += "✅ 推奨される表現:\n";
                        styleSection += "花子は本を取り出してページをめくった。その内容に、彼女はすぐに夢中になった。\n\n";
                    }
                }

                return styleSection;
            } catch (error) {
                logger.error('Error building style guidance section', { error });
            }
        }

        // styleGuidanceがない場合でも、最低限の主語多様性ガイダンスを追加
        let basicStyleSection = "\n## 文体ガイダンス（主語の多様性）\n";
        basicStyleSection += "- 同じキャラクター名を連続して主語に使うのを避けてください\n";
        basicStyleSection += "- 代名詞や主語の省略を活用して、文体の自然さを保ってください\n";
        basicStyleSection += "- 複数の文を接続詞で結合するなど、文構造に変化をつけてください\n";

        basicStyleSection += "\n### 具体例:\n";
        basicStyleSection += "❌ 避けるべき表現:\n";
        basicStyleSection += "ルナは、周囲を見回しながら、不安を押し殺した。ルナは、通路の先に、かすかな光を見た。ルナは、一歩、また一歩と、光に向かって歩き出した。\n\n";
        basicStyleSection += "✅ 推奨される表現:\n";
        basicStyleSection += "ルナは周囲を見回しながら、不安を押し殺した。通路の先にかすかな光が目に入る。一歩、また一歩と、光に向かって歩き出した。\n\n";

        return basicStyleSection;
    }

    /**
     * 表現多様化セクションを構築
     * @param {any} context 生成コンテキスト
     * @param {string} genre ジャンル
     * @returns {string} 構築されたセクション
     */
    public buildExpressionAlternativesSection(context: any, genre: string): string {
        if (!context.alternativeExpressions || Object.keys(context.alternativeExpressions).length === 0) {
            return '';
        }

        try {
            const alternativeExpressions = context.alternativeExpressions;
            let expressionSection = "\n## 表現の多様化\n";
            expressionSection += "以下の表現パターンを避け、代替表現を使用してください：\n\n";

            for (const category in alternativeExpressions) {
                if (alternativeExpressions[category] && alternativeExpressions[category].length > 0) {
                    expressionSection += `### ${this.formatter.formatCategoryName(category)}\n`;

                    alternativeExpressions[category].forEach((item: any) => {
                        expressionSection += `- 「${item.original}」を避け、代わりに：\n`;
                        item.alternatives.slice(0, 3).forEach((alt: string) => {
                            expressionSection += `  • 「${alt}」\n`;
                        });
                    });

                    expressionSection += "\n";
                }
            }

            // ビジネスジャンル特有の表現を追加
            if (genre === 'business') {
                const businessExpressionGuidance = this.templateManager.getBusinessSpecificSection('expressionGuidance');
                if (businessExpressionGuidance) {
                    expressionSection += businessExpressionGuidance + "\n";
                }
            }

            return expressionSection;
        } catch (error) {
            logger.error('Error building expression alternatives section', { error });
            return '';
        }
    }

    /**
     * 読者体験向上セクションを構築
     * @param {any} context 生成コンテキスト
     * @param {string} genre ジャンル
     * @returns {string} 構築されたセクション
     */
    public buildReaderExperienceSection(context: any, genre: string): string {
        if (!context.improvementSuggestions || !context.improvementSuggestions.length) {
            return '';
        }

        try {
            let improvementSection = "\n## 読者体験向上のためのポイント\n";

            context.improvementSuggestions.forEach((suggestion: string) => {
                improvementSection += `- ${suggestion}\n`;
            });

            // ビジネスジャンル向けの特別な読者体験ポイント
            if (genre === 'business') {
                const businessReaderGuidance = this.templateManager.getBusinessSpecificSection('readerGuidance');
                if (businessReaderGuidance) {
                    improvementSection += businessReaderGuidance + "\n";
                }
            }

            return improvementSection;
        } catch (error) {
            logger.error('Error building reader experience section', { error });
            return '';
        }
    }

    /**
     * 文学的インスピレーションセクションを構築
     * @param {any} context 生成コンテキスト
     * @param {string} genre ジャンル
     * @returns {string} 構築されたセクション
     */
    public buildLiteraryInspirationSection(context: any, genre: string): string {
        if (!context.literaryInspirations) {
            return '';
        }

        try {
            const literaryInspirations = context.literaryInspirations;
            let literarySection = "\n## 文学的手法のインスピレーション\n";
            literarySection += "以下の文学的手法を適切に取り入れることで、小説の質を高めてください：\n\n";

            // プロット展開手法
            if (literaryInspirations.plotTechniques && literaryInspirations.plotTechniques.length > 0) {
                literarySection += "### プロット展開手法\n";
                literaryInspirations.plotTechniques.forEach((technique: any) => {
                    literarySection += `#### ${technique.technique}\n`;
                    literarySection += `${technique.description}\n`;
                    literarySection += `例（${technique.reference}）: ${technique.example}\n\n`;
                });
            }

            // キャラクター描写手法
            if (literaryInspirations.characterTechniques && literaryInspirations.characterTechniques.length > 0) {
                literarySection += "### キャラクター描写手法\n";
                literaryInspirations.characterTechniques.forEach((technique: any) => {
                    literarySection += `#### ${technique.technique}\n`;
                    literarySection += `${technique.description}\n`;
                    literarySection += `例（${technique.reference}）: ${technique.example}\n\n`;
                });
            }

            // 雰囲気構築手法
            if (literaryInspirations.atmosphereTechniques && literaryInspirations.atmosphereTechniques.length > 0) {
                literarySection += "### 雰囲気構築手法\n";
                literaryInspirations.atmosphereTechniques.forEach((technique: any) => {
                    literarySection += `#### ${technique.technique}\n`;
                    literarySection += `${technique.description}\n`;
                    literarySection += `例（${technique.reference}）: ${technique.example}\n\n`;
                });
            }

            // ビジネスジャンルの場合、ビジネス物語特有の手法を追加
            if (genre === 'business') {
                literarySection += "### ビジネス物語特有の手法\n";

                literarySection += "#### 専門知識の自然な導入\n";
                literarySection += "ビジネスや業界の専門知識を物語の自然な流れの中で導入する技法。説明的にならず、ストーリーと融合させる。\n";
                literarySection += "例（「リーン・スタートアップ」）: チームが顧客フィードバックに基づいて製品を急速に修正する過程で、MVPの概念が自然に示される。\n\n";

                literarySection += "#### 現実とビジョンの対比\n";
                literarySection += "起業家の描く理想の未来と現実の厳しさを対比させることで緊張感を生み出す技法。\n";
                literarySection += "例（「スティーブ・ジョブズ」）: ジョブズが完璧なユーザー体験を思い描く一方で、技術的制約との戦いが描かれる。\n\n";

                literarySection += "#### 複数視点からの意思決定\n";
                literarySection += "同じビジネス判断を異なる立場（CEO、エンジニア、マーケター、投資家など）から描写し、複雑さを表現する技法。\n";
                literarySection += "例（「ハードシング」）: 重要な戦略決定について、各部門長の異なる懸念と視点が交錯する様子が描かれる。\n\n";
            }

            return literarySection;
        } catch (error) {
            logger.error('Error building literary inspiration section', { error });
            return '';
        }
    }

    /**
     * テーマ強化セクションを構築
     * @param {any} context 生成コンテキスト
     * @param {string} genre ジャンル
     * @returns {string} 構築されたセクション
     */
    public buildThemeEnhancementSection(context: any, genre: string): string {
        if (!context.themeEnhancements || !context.themeEnhancements.length) {
            return '';
        }

        try {
            const themeEnhancements = context.themeEnhancements;
            let themeSection = "\n## テーマ表現の深化\n";
            themeSection += "以下のテーマをより効果的に表現してください：\n\n";

            themeEnhancements.forEach((enhancement: any) => {
                themeSection += `### ${enhancement.theme}\n`;
                themeSection += `${enhancement.suggestion}\n\n`;

                themeSection += "推奨アプローチ:\n";
                if (enhancement.approaches && enhancement.approaches.length > 0) {
                    enhancement.approaches.forEach((approach: string) => {
                        themeSection += `- ${approach}\n`;
                    });
                }

                themeSection += "\n";
            });

            // ビジネスジャンル向けの特別なテーマ強化
            if (genre === 'business') {
                const businessThemeGuidance = this.templateManager.getBusinessSpecificSection('themeGuidance');
                if (businessThemeGuidance) {
                    themeSection += businessThemeGuidance + "\n";
                }
            }

            return themeSection;
        } catch (error) {
            logger.error('Error building theme enhancement section', { error });
            return '';
        }
    }

    /**
     * テンション構築セクションを構築
     * @param {any} context 生成コンテキスト
     * @param {string} genre ジャンル
     * @returns {string} 構築されたセクション
     */
    public buildTensionGuidanceSection(context: any, genre: string): string {
        if (!context.tensionRecommendation) {
            return '';
        }

        try {
            const tensionRecommendation = context.tensionRecommendation;
            let dynamicTensionSection = "\n## テンション構築の詳細ガイダンス\n";

            // テンション方向に応じたアドバイス
            switch (tensionRecommendation.direction) {
                case "increase":
                    dynamicTensionSection += "このチャプターでは **テンションを上昇させる** ことを重視してください。\n";
                    break;
                case "decrease":
                    dynamicTensionSection += "このチャプターでは **テンションをやや下げる** ことで緩急をつけてください。\n";
                    break;
                case "maintain":
                    dynamicTensionSection += "このチャプターでは **テンションを維持する** ことで一定の緊張感を保ってください。\n";
                    break;
                case "establish":
                    dynamicTensionSection += "このチャプターでは **テンションの基調を確立** してください。\n";
                    break;
            }

            if (tensionRecommendation.reason) {
                dynamicTensionSection += `理由: ${tensionRecommendation.reason}\n\n`;
            }

            // ペーシングに関する詳細なアドバイス
            if (context.pacingRecommendation) {
                dynamicTensionSection += "## ペーシングの調整\n";
                dynamicTensionSection += `${context.pacingRecommendation.description}\n`;
            }

            // テンション構築のための具体的なテクニック提案
            dynamicTensionSection += "\n## テンション構築テクニック\n";

            // ビジネスジャンルでのテンション構築
            if (genre === 'business') {
                dynamicTensionSection += "### ビジネス物語でのテンション構築\n";

                // テンションレベルに応じたビジネス特化のテクニックを提案
                const tension = tensionRecommendation.recommendedTension;
                if (tension >= 0.8) {
                    dynamicTensionSection += "- ビジネス上の危機（資金切れ、大型顧客の喪失、重要な人材の離脱など）を導入してください\n";
                    dynamicTensionSection += "- 競合の予期せぬ動きが与える脅威を描写してください\n";
                    dynamicTensionSection += "- 厳しい期限や投資家からのプレッシャーを強調してください\n";
                    dynamicTensionSection += "- チーム内の重大な対立や意見相違を先鋭化させてください\n";
                } else if (tension >= 0.6) {
                    dynamicTensionSection += "- 製品開発上の予期せぬ技術的障害を導入してください\n";
                    dynamicTensionSection += "- 市場の反応が期待と異なる状況を描写してください\n";
                    dynamicTensionSection += "- 事業拡大に伴う組織的課題や文化の変化を表現してください\n";
                    dynamicTensionSection += "- 異なるステークホルダー間の利害対立を示してください\n";
                } else if (tension >= 0.4) {
                    dynamicTensionSection += "- 競合調査や市場分析から得られる微妙な警告信号を織り込んでください\n";
                    dynamicTensionSection += "- チーム内の小さな対立や意見相違を描写してください\n";
                    dynamicTensionSection += "- 新しいビジネスチャンスと既存リソースの制約の間の葛藤を表現してください\n";
                    dynamicTensionSection += "- 意思決定の背後にあるリスクと不確実性を示唆してください\n";
                } else {
                    dynamicTensionSection += "- チームビルディングや組織文化の構築プロセスに重点を置いてください\n";
                    dynamicTensionSection += "- 戦略的思考や長期ビジョンの探索を通じて知的興味を維持してください\n";
                    dynamicTensionSection += "- 顧客や市場との関係構築の機微を描写してください\n";
                    dynamicTensionSection += "- キャラクターの個人的成長とビジネス上の成長の関連を示してください\n";
                }
            } else {
                // 通常のテンション構築テクニック
                const tension = tensionRecommendation.recommendedTension;
                if (tension >= 0.8) {
                    dynamicTensionSection += "- 対立や葛藤を先鋭化させてください\n";
                    dynamicTensionSection += "- 時間制限や切迫感を明示してください\n";
                    dynamicTensionSection += "- 短い文とストレートな表現を使って緊迫感を演出してください\n";
                } else if (tension >= 0.6) {
                    dynamicTensionSection += "- 状況の複雑化や障害の導入を心がけてください\n";
                    dynamicTensionSection += "- 未解決の問題や不確実性を強調してください\n";
                    dynamicTensionSection += "- 緊張と緩和のリズムを作りながら全体的なテンションを維持してください\n";
                } else if (tension >= 0.4) {
                    dynamicTensionSection += "- 伏線や謎を巧みに配置してください\n";
                    dynamicTensionSection += "- キャラクターの内的葛藤や関係性の微妙な変化を描いてください\n";
                    dynamicTensionSection += "- 平穏な中にも今後の変化を予感させる要素を含めてください\n";
                } else {
                    dynamicTensionSection += "- 詳細な描写と情景構築に重点を置いてください\n";
                    dynamicTensionSection += "- キャラクターや世界観の掘り下げを優先してください\n";
                    dynamicTensionSection += "- 穏やかながらも読者の共感や好奇心を引く要素を含めてください\n";
                }
            }

            return dynamicTensionSection;
        } catch (error) {
            logger.error('Error building tension guidance section', { error });
            return '';
        }
    }

    /**
     * ビジネス特有セクションを構築
     * @param {string} genre ジャンル
     * @returns {string} 構築されたセクション
     */
    public buildBusinessSpecificSection(genre: string): string {
        if (genre !== 'business') {
            return '';
        }

        try {
            const businessGuidance = this.templateManager.getBusinessSpecificSection('businessGuidance') || '';
            return businessGuidance ? `\n${businessGuidance}` : '';
        } catch (error) {
            logger.error('Error building business specific section', { error });
            return '';
        }
    }

    /**
     * 重点的に描写すべきキャラクターを決定
     * @param {GenerationContext} context 生成コンテキスト
     * @returns {string[]} 重点的に描写すべきキャラクター名の配列
     */
    public determineFocusCharacters(context: GenerationContext): string[] {
        const focusCharacters: string[] = [];

        // すでに指定されている場合はそれを使用
        if ((context as any).focusCharacters && Array.isArray((context as any).focusCharacters)) {
            return (context as any).focusCharacters.map((c: any) => typeof c === 'string' ? c : c.name);
        }

        // キャラクター情報から重点キャラクターを抽出
        if (context.characters && Array.isArray(context.characters)) {
            // メインキャラクター優先
            const mainCharacters = context.characters
                .filter(c => c.type === 'MAIN' || (c.significance && c.significance >= 0.8))
                .map(c => c.name);

            // サブキャラクターからも重要なものを選択
            const subCharacters = context.characters
                .filter(c => ((c.type === 'SUB' || (c.significance && c.significance >= 0.6)) &&
                    !mainCharacters.includes(c.name)))
                .map(c => c.name);

            // 物語状態に応じてバランスを調整
            if ((context as any).narrativeState && (context as any).narrativeState.state === 'BATTLE') {
                // 戦闘状態では主要キャラクターに集中
                return mainCharacters.slice(0, 3);
            } else if ((context as any).narrativeState && (context as any).narrativeState.state === 'INTRODUCTION') {
                // 導入部では新キャラクターを含める
                const newCharacters = context.characters
                    .filter(c => (c as any).firstAppearance === context.chapterNumber)
                    .map(c => c.name);

                return [...newCharacters, ...mainCharacters].slice(0, 4);
            }

            // 通常は主要2名+サブ1名程度
            return [...mainCharacters.slice(0, 2), ...subCharacters.slice(0, 1)];
        }

        return focusCharacters;
    }

    /**
     * 学習旅程セクションを構築
     * @param {any} context 生成コンテキスト
     * @param {string} genre ジャンル
     * @returns {string} 構築されたセクション
     */
    public buildLearningJourneySection(context: any, genre: string): string {
        if (!context.learningJourney) {
            return '';
        }

        try {
            const learningJourney = context.learningJourney;
            let learningSection = "\n## 学びの物語ガイダンス\n";

            // 概念と学習段階を表示
            learningSection += `・概念: ${learningJourney.mainConcept}\n`;
            learningSection += `・学習段階: ${this.formatLearningStage(learningJourney.learningStage)}\n\n`;

            // 体現化プランがある場合
            if (learningJourney.embodimentPlan) {
                const plan = learningJourney.embodimentPlan;
                learningSection += "### 体現化ガイド\n";
                learningSection += `・表現方法: ${plan.expressionMethods.join('、')}\n`;
                learningSection += `・重要要素: ${plan.keyElements.join('、')}\n`;
                if (plan.dialogueSuggestions && plan.dialogueSuggestions.length > 0) {
                    learningSection += `・対話例: ${this.selectRandomItems(plan.dialogueSuggestions, 2).join('、')}\n`;
                }
                learningSection += "\n";
            }

            // 感情アークがある場合
            if (learningJourney.emotionalArc) {
                const arc = learningJourney.emotionalArc;
                learningSection += "### 感情アーク\n";
                learningSection += `・トーン: ${arc.recommendedTone}\n`;
                learningSection += `・感情変化: 始まり（${this.formatEmotionalDimensions(arc.emotionalJourney.opening)}）→ `;
                learningSection += `展開（${this.formatEmotionalDimensions(arc.emotionalJourney.development)}）→ `;
                learningSection += `結末（${this.formatEmotionalDimensions(arc.emotionalJourney.conclusion)}）\n\n`;
            }

            // カタルシス体験がある場合
            if (learningJourney.catharticExperience) {
                const exp = learningJourney.catharticExperience;
                learningSection += "### カタルシス体験\n";
                learningSection += `・タイプ: ${this.formatCatharticType(exp.type)}\n`;
                learningSection += `・トリガー: ${exp.trigger}\n`;
                learningSection += `・ピーク瞬間: ${exp.peakMoment}\n\n`;
            }

            // 共感ポイントがある場合
            if (learningJourney.empatheticPoints && learningJourney.empatheticPoints.length > 0) {
                learningSection += "### 共感ポイント\n";
                for (const point of learningJourney.empatheticPoints) {
                    learningSection += `・${point.description}（強度: ${Math.round(point.intensity * 10)}/10）\n`;
                }
                learningSection += "\n";
            }

            // シーン推奨がある場合
            if (learningJourney.sceneRecommendations && learningJourney.sceneRecommendations.length > 0) {
                learningSection += "### シーン推奨\n";
                for (const rec of learningJourney.sceneRecommendations) {
                    learningSection += `・${rec.description}（${rec.reason}）\n`;
                }
                learningSection += "\n";
            }

            // 学びの物語の執筆ガイドライン
            learningSection += `
## 重要な執筆ガイドライン
1. **変容と成長**: キャラクターの内面変化を通して読者に共感体験を提供する
2. **体験的学習**: 概念を説明するのではなく、キャラクターの体験を通して読者が自然と学べるようにする
3. **感情の旅**: 指定された感情アークに沿って読者を感情的な旅に連れていく
4. **共感ポイント**: 指定された共感ポイントを効果的に描写し、読者の感情移入を促す
5. **カタルシス**: 学びと感情が統合された瞬間を印象的に描く
6. **自然な対話**: 教科書的な説明ではなく、自然な対話と内面描写で概念を表現する
7. **具体的な場面**: 抽象的な概念を具体的なビジネスシーンで表現する
`;

            return learningSection;
        } catch (error) {
            logger.error('Error building learning journey section', { error });
            return '';
        }
    }

    /**
     * ランダムにアイテムを選択する
     * @private
     * @param {any[]} array 配列
     * @param {number} count 選択数
     * @returns {any[]} 選択されたアイテム
     */
    private selectRandomItems(array: any[], count: number): any[] {
        if (!array || array.length <= count) return array || [];
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    /**
     * 感情次元の配列を文字列にフォーマットする
     * @private
     * @param {Array<{dimension: string, level: number}>} dimensions 感情次元の配列
     * @returns {string} フォーマットされた文字列
     */
    private formatEmotionalDimensions(dimensions: Array<{ dimension: string, level: number }>): string {
        return dimensions
            .map(d => `${d.dimension}(${d.level})`)
            .join('、');
    }

    /**
     * カタルシスタイプをフォーマットする
     * @private
     * @param {string} type カタルシスタイプ
     * @returns {string} フォーマットされた文字列
     */
    private formatCatharticType(type: string): string {
        const typeMapping: Record<string, string> = {
            'emotional': '感情的カタルシス',
            'intellectual': '知的カタルシス',
            'moral': '道徳的カタルシス',
            'transformative': '変容的カタルシス'
        };

        return typeMapping[type] || type;
    }

    /**
     * 学習段階を日本語表記でフォーマットする
     * @private
     * @param {LearningStage} stage 学習段階
     * @returns {string} 日本語表記
     */
    private formatLearningStage(stage: LearningStage): string {
        const stageMapping: Record<string, string> = {
            'MISCONCEPTION': '誤解段階',
            'EXPLORATION': '探索段階',
            'CONFLICT': '葛藤段階',
            'INSIGHT': '気づき段階',
            'APPLICATION': '応用段階',
            'INTEGRATION': '統合段階'
        };

        return stageMapping[stage] || stage;
    }

    /**
     * 章の目的とプロット要素を取得
     * @param {GenerationContext} context 生成コンテキスト
     * @returns {object} 章の目的と達成すべきプロット要素
     */
    public getChapterPurposeAndPlotPoints(context: GenerationContext): { purpose: string, plotPoints: string } {
        // 章タイプに基づく目的の設定
        const chapterType = (context as any).chapterType || 'STANDARD';

        // 章タイプごとの目的マップ
        const purposeMap: Record<string, string> = {
            'OPENING': '物語の世界とキャラクターを紹介し、読者の興味を引く最初の葛藤を導入する',
            'ACTION': '活発な行動とドラマチックな展開によって物語を前進させる',
            'REVELATION': '重要な真実や秘密を明らかにし、キャラクターや物語の方向性に影響を与える',
            'INTROSPECTION': 'キャラクターの内面的な成長や変化を探求する',
            'CLOSING': '物語の主要な葛藤を解決し、キャラクターの旅を締めくくる',
            'NEW_ARC': '新しい物語の方向性を確立し、新たな課題や目標を導入する',
            'ARC_RESOLUTION': '現在のストーリーアークを締めくくり、次のアークへの橋渡しをする',
            'BUSINESS_CHALLENGE': 'ビジネス上の課題に直面し、解決策を模索する',
            'PRODUCT_DEVELOPMENT': '製品やサービスの開発プロセスを描写する',
            'TEAM_BUILDING': 'チーム構築とリーダーシップの成長に焦点を当てる',
            'MARKET_ENTRY': '市場参入とマーケティング戦略の実行を描く',
            'STANDARD': '物語を着実に前進させ、キャラクターの課題や葛藤を深める'
        };

        // プロット要素の取得
        let plotPoints = '';

        // コンテキストにplotPointsがある場合はそれを使用
        if (context.plotPoints && context.plotPoints.length > 0) {
            plotPoints = context.plotPoints.join('\n- ');
        } else {
            // 状態に基づいてプロット要素を生成
            const narrativeState = (context as any).narrativeState;
            let defaultPoints = [
                'キャラクターが新たな問題や障害に直面する',
                '以前に導入された葛藤が深まるか進展する',
                '少なくとも1つの重要な決断や行動が行われる'
            ];

            // 状態に応じた追加プロット要素
            if (narrativeState && narrativeState.state) {
                switch (narrativeState.state) {
                    case 'BATTLE':
                        defaultPoints.push('戦闘または対立の進展または解決');
                        break;
                    case 'REVELATION':
                        defaultPoints.push('新たな情報や秘密の開示');
                        break;
                    case 'JOURNEY':
                        defaultPoints.push('物理的または心理的な旅の進展');
                        break;
                    case 'INVESTIGATION':
                        defaultPoints.push('調査の進展または新たな発見');
                        break;
                    case 'DILEMMA':
                        defaultPoints.push('葛藤における選択または決断');
                        break;
                    case 'TRAINING':
                        defaultPoints.push('訓練または成長の展開');
                        break;
                }
            }

            plotPoints = defaultPoints.join('\n- ');
        }

        return {
            purpose: purposeMap[chapterType] || purposeMap['STANDARD'],
            plotPoints: `- ${plotPoints}`
        };
    }
}