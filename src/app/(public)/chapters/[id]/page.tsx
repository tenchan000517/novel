// src/app/(public)/chapters/[id]/page.tsx
import { ChapterViewer } from '@/components/public/chapter-viewer';
import { ChapterNavigation } from '@/components/public/chapter-navigation';
import { CommentSection } from '@/components/public/comment-section';
import { SocialShare } from '@/components/public/social-share';
import { Chapter } from '@/types/chapters';

// このコードは実際のAPIコールを模擬したものです

async function getChapter(id: string): Promise<Chapter> {
    return {
        id, // ← metadataに入れちゃダメ！ここに直接
        title: '遥かなる旅路の始まり',
        chapterNumber: 10,
        createdAt: new Date('2025-04-30'),
        updatedAt: new Date('2025-04-30'),
        content: `
# 第10章: 遥かなる旅路の始まり

朝日が山の稜線から昇り始めた頃、遥人は既に目を覚ましていた。昨晩の出来事が夢ではなかったことを確かめるように、彼は自分の手のひらを見つめた。かすかに残る傷跡が現実を物語っていた。

「起きてるんだね」

静かな声に振り向くと、美咲が小さな焚き火の傍らで朝食の準備をしていた。彼女の表情は昨日よりも柔らかくなっていたが、それでも警戒心は完全には解けていないようだった。

「ああ、少し考え事をしていた」

遥人は立ち上がり、背伸びをしながら周囲を見回した。彼らが一夜を過ごした場所は小さな森の中の開けた空間で、頭上では木々の葉がそよ風に揺れていた。

「今日から本格的な旅が始まるんだな」

美咲はうなずき、手元の地図を広げた。
「昨日話したように、まずは北にある古都ミレニアを目指すわ。そこで『鍵』についての手がかりが見つかるはず」

「鍵」——その言葉を聞くだけで、遥人の左手にある不思議な紋章がうずくような感覚があった。二週間前、彼の人生は平凡な高校生のものだった。それが今では、何者かに追われ、理解できない力を宿し、見知らぬ少女と共に未知の旅に出ようとしている。

「本当に俺についてくる必要があるのか？危険かもしれないぞ」

美咲は小さく笑った。その笑顔には、遥人が知らない何かが隠されているようだった。
「私の方こそ、あなたに同じことを聞きたいくらいよ。この旅の本当の危険を理解してる？」

答える前に、遠くから声が聞こえてきた。
「おーい！待たせたな！」

陽気な声と共に現れたのは、昨日の夜に彼らを助けてくれた男、黒井陽介だった。彼は大きなバックパックを背負い、右手には地元で買ったという食料を持っていた。

「準備はいいか？長い旅になるぞ！」

彼の明るさは、緊張していた遥人と美咲に安心感を与えた。陽介は旅慣れた冒険家で、山や森の知識も豊富だという。彼がいることで、少なくとも道中の困難はいくらか減るはずだった。

「ところで」陽介は二人を見ながら真面目な表情になった。「昨日の連中、アレは普通じゃなかった。黒い制服に身を包み、普通の武器では傷つかない。何かを探していると言っていたが...」

「それが『鍵』ね」美咲が静かに言った。「彼らは『結社』の一員よ。世界の秘密を探る古い組織。でも、その目的は決して善いものじゃない」

遥人は自分の左手を無意識に握りしめた。「そして、彼らが探しているものが、俺の中にあるってことか」

美咲と陽介が交換する視線には、まだ遥人に話していない何かがあるようだった。しかし今は、それを問いただす時間はない。

「さあ、出発しよう」陽介が彼らの緊張を解くように明るく言った。「ミレニアまでは三日の道のりだ。その間に、お互いのことをもっと知れる時間はたっぷりあるさ」

朝日が完全に昇り、新しい一日が始まろうとしていた。遥人は深呼吸し、未知の旅路への最初の一歩を踏み出した。彼の人生は、もう二度と同じではないだろう。

その時、遥人は気づいていなかった。彼の選択が、世界の運命を変えることになるとは。
    `,
        summary: '主人公が謎の少女と出会い、彼女の正体に疑問を抱く。遠くの街へと向かう旅路が始まる。',
        scenes: [
            {
                id: '1',
                type: 'INTRODUCTION',
                title: '朝の出発',
                startPosition: 0,
                endPosition: 500,
                characters: ['遥人', '美咲'],
                summary: '遥人と美咲が朝の準備をする場面',
                emotionalTone: '期待と不安',
                tension: 0.3,
            },
            {
                id: '2',
                type: 'DEVELOPMENT',
                title: '陽介の合流',
                startPosition: 501,
                endPosition: 1000,
                characters: ['遥人', '美咲', '陽介'],
                summary: '冒険家の陽介が合流する場面',
                emotionalTone: '安堵',
                tension: 0.4,
            },
            {
                id: '3',
                type: 'RESOLUTION',
                title: '旅立ち',
                startPosition: 1001,
                endPosition: 1500,
                characters: ['遥人', '美咲', '陽介'],
                summary: '三人が旅に出る決意をする場面',
                emotionalTone: '決意',
                tension: 0.5,
            }
        ],
        analysis: {
            characterAppearances: [
                {
                    characterId: '1',
                    characterName: '風間 遥人',
                    scenes: ['1', '2', '3'],
                    dialogueCount: 3,
                    significance: 0.8,
                },
                {
                    characterId: '2',
                    characterName: '鈴木 美咲',
                    scenes: ['1', '2', '3'],
                    dialogueCount: 3,
                    significance: 0.7,
                },
                {
                    characterId: '3',
                    characterName: '黒井 陽介',
                    scenes: ['2', '3'],
                    dialogueCount: 2,
                    significance: 0.5,
                }
            ],
            themeOccurrences: [
                {
                    themeId: '1',
                    themeName: '運命との対峙',
                    expressions: ['彼の選択が、世界の運命を変えることになる'],
                    strength: 0.6,
                },
                {
                    themeId: '2',
                    themeName: '未知への旅立ち',
                    expressions: ['未知の旅路への最初の一歩'],
                    strength: 0.8,
                }
            ],
            foreshadowingElements: [
                {
                    id: '1',
                    description: '美咲の秘密',
                    position: 250,
                    text: '警戒心は完全には解けていないようだった',
                    relatedCharacters: ['美咲'],
                },
                {
                    id: '2',
                    description: '遥人の紋章の力',
                    position: 500,
                    text: '遥人の左手にある不思議な紋章がうずくような感覚があった',
                    relatedCharacters: ['遥人'],
                }
            ],
            qualityMetrics: {
                readability: 0.85,
                consistency: 0.9,
                engagement: 0.8,
                characterDepiction: 0.85,
                originality: 0.75,
                overall: 0.83,
            }
        },
        metadata: {
            pov: '主人公',
            location: '森の中',
            timeframe: '朝',
            emotionalTone: '決意',
            keywords: ['旅立ち', '運命'],
            qualityScore: 0.83
        }
    };
}

async function getRelatedChapters(id: string) {
    // モックデータ
    return {
        previous: id !== '1' ? { id: (parseInt(id) - 1).toString(), number: parseInt(id) - 1, title: '森の奥に潜む影' } : null,
        next: { id: (parseInt(id) + 1).toString(), number: parseInt(id) + 1, title: '古都ミレニアの秘密' }
    };
}

export default async function ChapterPage({ params }: { params: { id: string } }) {
    const chapter = await getChapter(params.id);
    const relatedChapters = await getRelatedChapters(params.id);

    return (
        <div className="max-w-4xl mx-auto">
            <ChapterViewer chapter={chapter} />
            <ChapterNavigation
                previousChapter={relatedChapters.previous}
                nextChapter={relatedChapters.next}
            />
            <SocialShare chapter={chapter} />
            <CommentSection chapterId={params.id} />
        </div>
    );
}