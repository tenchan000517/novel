/**
 * ビジネス知識統合テスト
 * 生成された小説のビジネス学習ポテンシャルを評価
 */

const fs = require('fs');
const path = require('path');
const { BusinessKnowledgeAnalyzer } = require('./business-knowledge-analysis.js');

// 生成された章のサンプルデータ（先ほどの生成結果）
const generatedChapters = [
    {
        chapterNumber: 1,
        title: "第1章　理想の灯火、現実の冷たさ",
        content: `高橋誠は、分厚い資料の山に囲まれ、息を呑むように深呼吸をした。まだ肌寒い3月の朝、都内の大学の研究室は、彼の熱意とは裏腹に静まり返っている。ビジネスコンテストのプレゼンテーション後、彼はまるで嵐の中に放り出されたような感覚を味わっていた。

「高橋君、君のアイデアは素晴らしい。社会課題への意識も高い。しかし、現実的ではないね」

審査員の冷たい言葉が、まるで氷のように彼の心臓を締め付ける。新卒の早期離職問題を解決するプラットフォームを提案した彼のプレゼンテーションは、理想論だと一蹴されたのだ。

あの日のプレゼンテーションを思い出すと、今でも喉が詰まる。彼は、まるで自分の理想が否定されたような、深い絶望感に苛まれていた。画面に映し出されたスライドは、輝かしい未来を描いていたはずだ。しかし、それは現実の壁に阻まれ、粉々に砕け散った。

彼は、頬に手を当て、熱を確かめた。まるで、熱が冷めきってしまった自分の心臓を冷やしているようだった。

高橋誠は、幼い頃から「社会に貢献したい」という強い思いを持っていた。それは、彼の両親が共働きで忙しい中でも、地域の人々のためにボランティア活動を欠かさなかった姿を見て育ったからだろう。大学では、社会学を専攻し、社会問題について深く学ぶうちに、その思いはさらに強くなった。

新卒の離職問題は、彼の心を強く揺さぶった。優秀な人材が、短期間で会社を辞めてしまう。それは、企業にとっても、本人にとっても大きな損失だ。彼は、この問題を解決したいと強く願った。

プレゼンテーションの失敗は、彼の理想と現実の間の大きな溝を浮き彫りにした。彼は、自分の無力さを痛感した。

「なるほど…」

彼は、机に置かれたノートパソコンの画面をぼんやりと見つめながら、呟いた。メモ魔である彼は、その日のプレゼンテーションの反省点をびっしりと書き込んでいた。改善点、課題、そして、審査員からの厳しいコメント。まるで、自分の弱点を一つ一つ暴き出すような作業だった。

ふと、彼の目に飛び込んできたのは、インターネットで偶然見つけた「中期起業家育成プロジェクト」の募集要項だった。プログラムは、若手起業家を対象とし、ビジネスプランのブラッシュアップから、資金調達、経営ノウハウまで、幅広いサポートを提供するという。

「解の質より、問いの質」

募集要項の中に書かれていた、メンターの言葉が、彼の心を強く揺さぶった。彼は、自分のアイデアが現実的ではなかった理由を、まさにその言葉に集約できると感じた。彼は、問題の本質を深く理解し、それに対する「問い」を的確に設定できていなかったのではないか。

彼は、深く考え込んだ。そして、眼鏡のフレームをそっと指で直した。プロジェクトへの参加は、彼の理想と現実のギャップを埋めるための、最初の一歩になるかもしれない。

数日後、高橋誠は、プロジェクトの説明会に参加した。会場には、熱意に満ちた若者たちが集まっていた。まるで、未来への地図を求めて集まった冒険者たちのようだ。

説明会後、彼は一人、会場の隅で、配布された資料に目を通していた。その時、一人の老紳士が彼に話しかけてきた。

「君、何か困っているのかい？」

その紳士こそ、プロジェクトのメンターの一人である山田哲也だった。山田は、温和な笑顔で彼を見つめ、彼の目には、深い洞察力が宿っていた。

「いえ、特に…」

高橋は、少し緊張しながら答えた。

「君の目には、迷いが見える。それは、悪いことじゃない。むしろ、成長の証だ」

山田は、優しく語りかけた。そして、彼の言葉は、高橋の心を深く揺さぶった。

「君は、社会を変えたいと願っているのだろう？ それは素晴らしい。しかし、理想だけでは、現実は変わらない。大切なのは、現実を直視し、問題の本質を見抜くことだ」

山田は、そう言うと、少しの間を置いて、続けた。

「解の質を上げるためには、まず問いの質を上げなければならない。君は、まだその段階にいる」

高橋は、山田の言葉に深く感銘を受けた。彼は、自分の無力さを痛感していたが、同時に、希望も感じていた。山田との出会いは、彼の理想と現実の間の溝を埋めるための、大きな一歩になるかもしれない。

「もしよければ、一緒にプロジェクトに参加してみないか？ 君の熱意は、素晴らしい。しかし、それだけでは足りない。私と一緒に、その熱意を形にしていこう」

山田は、高橋の目を見つめながら、そう言った。高橋は、深く頷いた。

「はい、ぜひ、お願いします」

彼の心は、希望に満ちていた。彼は、理想を実現するために、現実と向き合い、粘り強く努力することを決意した。彼の冒険は、今、始まったばかりなのだ。`,
        metadata: {
            businessAnalysis: null // 後で設定
        }
    },
    {
        chapterNumber: 6,
        title: "第6章　三人三様の羅針盤",
        content: `高橋誠は、あの日のハッカソン会場の熱気を今でも鮮明に思い出すことができた。無機質なオフィスビルの会議室に、様々な企業や大学から集まった技術者たちが、それぞれ自慢の技術を持ち寄り、徹夜でコードを書く。徹夜明けの疲労感と、新しい技術への期待感が入り混じった独特の空気。そこで、彼は運命的な出会いを果たした。

「すごいですね、佐藤さん。あのA技術、まるで魔法みたいだ」

高橋は、佐藤健太が作り出したデモに目を輝かせながらそう言った。A技術は、まだ黎明期にある技術で、高橋が解決したい社会問題に、革新的なアプローチをもたらす可能性を秘めていた。佐藤は、その技術を駆使して、まるで音楽を奏でるようにコードを操っていた。

「ありがとうございます。まだプロトタイプですが、応用範囲は広いと思います。高橋さんのビジョンと組み合わせれば、面白いことができるかもしれません」

佐藤は、少し照れ臭そうにしながらも、自信に満ちた表情で答えた。彼の目は、技術的な可能性を追究することへの純粋な喜びで輝いていた。

高橋は、佐藤の技術力と、その技術に対する情熱に心を奪われた。彼の理想を具現化するための、かけがえのないピースだと直感した。その場で、高橋は自分の起業への熱い思いを語り始めた。

「実は、私は〇〇問題の解決を目指して起業したいんです。このA技術を使えば、画期的なアプローチができるはずなんです」

高橋の言葉に、佐藤は深く頷いた。

「なるほど。その問題は、技術的に非常にやりがいがありますね。具体的にどのようなサービスを考えているんですか？」

二人は意気投合し、ハッカソンが終わった後も、頻繁に連絡を取り合うようになった。高橋は自分のビジョンを語り、佐藤は技術的な可能性を具体的に説明する。まるでパズルのピースが組み合わさるように、二人の思考は融合していった。

そして、運命の歯車はさらに回り始めた。高橋は、以前からの知り合いで、マーケティングの知識が豊富な鈴木美咲に、協力を仰いだのだ。

「美咲さん、もしよければ、私の起業を手伝ってくれませんか？佐藤さんと一緒に、社会問題を解決するサービスを作りたいんです」

高橋の熱意に、美咲は快く応じた。

「面白そう！どんなサービスなの？ユーザー視点から、一緒に考えてみたいわ」

こうして、高橋誠、佐藤健太、鈴木美咲の3人を中心に、最初のコアチームが形成された。それぞれの分野で高い能力を持つ彼らは、互いの強みを活かし、弱みを補完し合う、理想的なチームに見えた。

最初の議題は、具体的なサービス構想を練ることだった。高橋は、解決したい社会問題を詳細に説明し、理想のサービス像を語った。

「まずは、〇〇問題の現状を分析し、ユーザーが抱える課題を明確にしましょう。そして、A技術を活用して、革新的な解決策を提供したいと考えています」

高橋は、真剣な面持ちでそう言った。彼は、理想と現実のギャップを埋めるために、綿密な計画を立て、着実に実行していくつもりだった。

佐藤は、高橋のビジョンに共感しつつも、技術的な実現可能性と効率性を重視した。

「技術的には、A技術を〇〇という形で活用すれば、非常に効果的だと思います。ただ、現時点では、処理速度やセキュリティ面で課題がありますね。そのあたりも考慮しながら、プロトタイプを開発する必要があります」

彼は、画面にコードを表示しながら、冷静に分析した。彼の目は、技術的な課題と可能性を同時に捉え、最適解を探求していた。

一方、美咲は、ユーザー視点から、サービスの魅力と、マーケティング戦略の重要性を訴えた。

「ユーザーが求めるのは、単なる技術的なソリューションではなく、真に価値のある体験です。ターゲット層を明確にし、彼らのニーズに合わせたサービスを提供する必要があります。そのためには、詳細な市場調査と、効果的なプロモーション戦略が不可欠です」

美咲は、ノートにメモを取りながら、熱心に語った。彼女は、ユーザーの心に響くサービスを作り出すために、徹底的に考え抜き、行動するつもりだった。

最初のサービス構想を練る中で、それぞれの考え方の違いが徐々に表面化し始めた。高橋は、理想を追い求めるあまり、現実的な制約を見落としがちだった。佐藤は、技術的な側面に集中するあまり、ユーザーのニーズやビジネス的な観点を軽視することがあった。美咲は、マーケティング戦略にこだわりすぎて、技術的な実現可能性を軽視することがあった。

ある日、高橋は、佐藤の提案した技術的仕様に対して、理想とのずれを感じ、不満を漏らした。

「佐藤さん、もう少しユーザーにとって使いやすいインターフェースにするべきだと思います。技術的なことは素晴らしいのですが、ユーザーが理解できなければ意味がないんです」

高橋は、眼鏡を直しながら、少し苛立った様子で言った。彼は、理想と現実のギャップに直面し、葛藤していた。

佐藤は、高橋の言葉を聞き、少し顔をしかめた。

「技術的な制約があるんです。使いやすさだけを追求すると、パフォーマンスが低下し、サービスの価値が損なわれる可能性があります。技術的な妥協は避けたいんです」

佐藤は、冷静に反論した。彼は、自分の技術を最大限に活かすために、妥協を許さない姿勢だった。

美咲は、二人のやり取りを見て、仲裁に入った。

「お二人とも、それぞれの意見はよく分かります。でも、ユーザーにとって最高のサービスを提供するためには、技術的な実現可能性と、ユーザーエクスペリエンスの両方を考慮する必要があります。まずは、プロトタイプを作り、ユーザーの反応を見ながら、改善していくのはどうでしょうか？」

美咲は、笑顔で提案した。彼女は、チームのバランスを保ちながら、最適な方法を探求していた。

高橋は、深く考え込み、メモを取り始めた。佐藤は、コードを書く手を止め、美咲の意見に耳を傾けた。三人の間に、微かな緊張感が漂っていた。

それぞれの羅針盤は、まだ同じ方向を指していない。しかし、彼らは、互いの違いを認め、理解し、協力することで、理想の実現に向かって進んでいくはずだ。次の章では、彼らはどのようにして、この最初の壁を乗り越えるのだろうか。`,
        metadata: {
            businessAnalysis: null // 後で設定
        }
    }
];

async function testBusinessKnowledgeAnalysis() {
    console.log('🏢 ビジネス知識統合分析テスト開始\n');

    try {
        const analyzer = new BusinessKnowledgeAnalyzer();

        // 各章のビジネス知識分析
        generatedChapters.forEach(chapter => {
            chapter.metadata.businessAnalysis = analyzer.analyzeBusinessKnowledge(
                chapter.content, 
                chapter.chapterNumber
            );
        });

        // システム全体のビジネス学習ポテンシャル評価
        const systemEvaluation = analyzer.evaluateSystemBusinessPotential(generatedChapters);

        // 詳細レポートの生成
        console.log('\n📄 詳細ビジネス学習ポテンシャル レポート');
        console.log('═'.repeat(80));

        // 現在の強み
        console.log('\n✅ 現在の強み:');
        
        if (systemEvaluation.overallPotential >= 0.6) {
            console.log('   • システムは基本的なビジネス学習要素を含んでいます');
        }
        
        const hasIssueDriver = generatedChapters.some(ch => 
            ch.metadata.businessAnalysis.knowledgePresence.ISSUE_DRIVEN?.score > 0
        );
        if (hasIssueDriver) {
            console.log('   • ISSUE DRIVEN（課題起点思考）の概念が含まれています');
        }

        const hasGrowthElements = generatedChapters.some(ch =>
            ch.metadata.businessAnalysis.characterGrowth > 0.3
        );
        if (hasGrowthElements) {
            console.log('   • キャラクターの成長を通した学習要素があります');
        }

        // 不足している要素
        console.log('\n⚠️ 不足している重要なビジネス知識:');
        
        const missingKnowledge = [];
        const importantKnowledge = [
            'ADLER_PSYCHOLOGY', 'MASLOW_HIERARCHY', 'SEVEN_HABITS', 
            'DRUCKER_MANAGEMENT', 'KOTLER_MARKETING', 'FINANCIAL_STATEMENTS'
        ];
        
        importantKnowledge.forEach(knowledge => {
            const isPresent = generatedChapters.some(ch =>
                ch.metadata.businessAnalysis.knowledgePresence[knowledge]?.score > 0.1
            );
            if (!isPresent) {
                missingKnowledge.push(knowledge);
            }
        });

        missingKnowledge.forEach(knowledge => {
            const knowledgeNames = {
                'ADLER_PSYCHOLOGY': 'アドラー心理学（課題の分離、承認欲求からの脱却）',
                'MASLOW_HIERARCHY': 'マズローの欲求5段階説（動機理論）',
                'SEVEN_HABITS': '7つの習慣（効果的な人格形成）',
                'DRUCKER_MANAGEMENT': 'ドラッカーのマネジメント理論',
                'KOTLER_MARKETING': 'コトラーのマーケティング戦略',
                'FINANCIAL_STATEMENTS': '財務諸表（PL・BS・CF）の理解'
            };
            console.log(`   • ${knowledgeNames[knowledge] || knowledge}`);
        });

        // 具体的な改善提案
        console.log('\n💡 ビジネス学習強化のための具体的提案:');
        
        console.log('\n1. 【段階的ビジネス知識統合】');
        console.log('   • 第1-5章: 基礎的思考法（ISSUE DRIVEN、0秒思考、地頭力）');
        console.log('   • 第6-10章: 人間関係・心理学（アドラー、マズロー、カーネギー）');
        console.log('   • 第11-15章: マネジメント・戦略（ドラッカー、孫氏の兵法）');
        console.log('   • 第16-20章: マーケティング・営業（コトラー、伝え方が9割）');
        console.log('   • 第21-25章: 財務・経営（PL・BS・CF、株式会社の仕組み）');
        console.log('   • 第26-30章: 成功哲学・総合（ナポレオンヒル、7つの習慣）');

        console.log('\n2. 【自然な学習体験設計】');
        console.log('   • 失敗体験→フレームワーク学習→実践→成果のサイクル');
        console.log('   • メンターとの対話によるソクラテス式学習');
        console.log('   • チーム内での議論を通した多角的理解');
        console.log('   • 実際のビジネス場面での知識応用');

        console.log('\n3. 【プロンプト改善案】');
        console.log('   • 各章に特定のビジネスフレームワークを学習目標として設定');
        console.log('   • キャラクターの課題解決プロセスにビジネス理論を組み込み');
        console.log('   • 読者が「なるほど！」と気づける学習ポイントを明示');
        console.log('   • 実践的な応用例を含めた知識の定着促進');

        console.log('\n4. 【キャラクター設計の最適化】');
        console.log('   • 高橋誠: 理論学習→実践適用のメイン学習者');
        console.log('   • 山田哲也: 経験豊富なメンターとして各種フレームワークを指導');
        console.log('   • 佐藤健太: 技術と経営の融合した視点を提供');
        console.log('   • 鈴木美咲: マーケティング・顧客視点の専門家');
        console.log('   • 中村大輔: 対照的なアプローチによる学習機会の創出');

        // 期待される学習効果
        console.log('\n🎯 期待される学習効果:');
        console.log('   • 読者が主人公と共にビジネスフレームワークを体験学習');
        console.log('   • 理論→実践→振り返りのサイクルによる深い理解');
        console.log('   • 失敗と成功を通したリアルなビジネス体験');
        console.log('   • 経営に必要な知識の体系的習得');

        // スコア判定
        console.log('\n📊 総合評価:');
        if (systemEvaluation.overallPotential >= 0.8) {
            console.log('🏆 優秀: ビジネス学習システムとして高いポテンシャルを発揮');
        } else if (systemEvaluation.overallPotential >= 0.6) {
            console.log('🥉 良好: 基本的なビジネス学習要素はあるが、大幅な改善余地あり');
        } else if (systemEvaluation.overallPotential >= 0.4) {
            console.log('🟡 中程度: ビジネス学習要素が不足、強化が必要');
        } else {
            console.log('🔴 要改善: ビジネス学習システムとしての機能が不十分');
        }

        console.log(`\n最終スコア: ${systemEvaluation.overallPotential.toFixed(2)}/1.0`);

        // ファイル出力
        const reportPath = 'test-output/business-analysis-report.md';
        const reportContent = generateBusinessReport(systemEvaluation, generatedChapters);
        fs.writeFileSync(reportPath, reportContent, 'utf8');
        console.log(`\n💾 詳細レポート保存: ${reportPath}`);

        console.log('\n🎉 ビジネス知識統合分析完了！');

    } catch (error) {
        console.error('\n💥 分析でエラーが発生:');
        console.error(`エラー: ${error.message}`);
        console.error(`スタック: ${error.stack?.split('\n').slice(0, 3).join('\n')}`);
        process.exit(1);
    }
}

function generateBusinessReport(systemEvaluation, chapters) {
    let report = `# ビジネス知識統合分析レポート

**生成日時**: ${new Date().toISOString()}
**総合ポテンシャル**: ${systemEvaluation.overallPotential.toFixed(2)}/1.0

## 概要

このレポートは、小説生成システムのビジネス学習ポテンシャルを評価したものです。
特に経営・ビジネス書の知識をキャラクターの成長を通して自然に学べる設計になっているかを分析しました。

## システム評価結果

### 全体スコア
- **知識網羅性**: ${systemEvaluation.knowledgeCoverage.toFixed(2)}/1.0
- **学習進歩性**: ${systemEvaluation.learningProgression.toFixed(2)}/1.0  
- **実践関連性**: ${systemEvaluation.practicalRelevance.toFixed(2)}/1.0
- **自然統合性**: ${systemEvaluation.naturalIntegration.toFixed(2)}/1.0

### 章別分析

`;

    chapters.forEach(chapter => {
        report += `#### ${chapter.title}

**ビジネス価値**: ${chapter.metadata.businessAnalysis.overallBusinessValue.toFixed(2)}/1.0

**検出されたビジネス知識**:
`;
        Object.keys(chapter.metadata.businessAnalysis.knowledgePresence).forEach(knowledge => {
            const presence = chapter.metadata.businessAnalysis.knowledgePresence[knowledge];
            if (presence.score > 0) {
                report += `- ${knowledge}: ${presence.score.toFixed(2)} (${presence.detectedElements.slice(0, 2).join(', ')})\n`;
            }
        });

        report += `
**学習要素**:
- 発見的学習: ${chapter.metadata.businessAnalysis.learningElements.discovery?.score.toFixed(2) || '0.00'}
- 内省的学習: ${chapter.metadata.businessAnalysis.learningElements.reflection?.score.toFixed(2) || '0.00'}
- 応用的学習: ${chapter.metadata.businessAnalysis.learningElements.application?.score.toFixed(2) || '0.00'}
- 成長的学習: ${chapter.metadata.businessAnalysis.learningElements.growth?.score.toFixed(2) || '0.00'}

`;
    });

    report += `## 改善提案

### 1. ビジネス知識の段階的統合
`;
    systemEvaluation.recommendations.forEach((rec, index) => {
        report += `${index + 1}. ${rec}\n`;
    });

    report += `
### 2. 具体的な学習設計改善案

#### フェーズ1（第1-5章）: 思考基盤の構築
- ISSUE DRIVEN思考法の習得
- 0秒思考による判断力向上  
- フェルミ推定による論理的思考力

#### フェーズ2（第6-10章）: 人間関係とチーム形成
- アドラー心理学による自立した思考
- マズローの欲求理論による動機理解
- カーネギーの人間関係術

#### フェーズ3（第11-15章）: 戦略とマネジメント
- 孫氏の兵法による戦略思考
- ドラッカーのマネジメント理論
- 組織運営の実践

#### フェーズ4（第16-20章）: マーケティングと顧客理解
- コトラーのマーケティング戦略
- 顧客視点の重要性
- 伝え方とコミュニケーション

#### フェーズ5（第21-25章）: 財務と経営指標
- PL・BS・CFの理解と活用
- 株式会社の仕組み
- 投資と資金調達

#### フェーズ6（第26-30章）: 成功哲学と総合実践
- ナポレオンヒルの成功哲学
- 7つの習慣による人格形成
- 学んだ知識の総合実践

## 結論

現在のシステムは基本的なビジネス学習要素を含んでいますが、
体系的なビジネス知識の統合という観点では大幅な改善の余地があります。

特に、キャラクターの成長プロセスにビジネスフレームワークを自然に組み込み、
読者が主人公と共に学習体験を得られる設計の強化が重要です。

---

*本レポートは小説生成システムのビジネス学習ポテンシャル分析に基づいて生成されました。*
`;

    return report;
}

// メイン実行
console.log('===== ビジネス知識統合分析テスト =====\n');
testBusinessKnowledgeAnalysis().catch(error => {
    console.error('分析実行エラー:', error);
    process.exit(1);
});