// import { useState, useEffect } from 'react';
// import { Character, CharacterType, CharacterRole } from '@/types/characters';

// export const useCharacters = () => {
//   const [characters, setCharacters] = useState<Character[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
  
//   useEffect(() => {
//     // モックデータ取得（実際の実装ではAPIリクエストを行う）
//     const fetchCharacters = async () => {
//       setIsLoading(true);
      
//       try {
//         // APIリクエストをシミュレーション
//         await new Promise(resolve => setTimeout(resolve, 1000));
        
//         // モックデータ
//         const mockCharacters: Character[] = [
//           {
//             id: 'char-1',
//             name: '高橋勇気',
//             description: '主人公。17歳の高校生で、隠された力を持つ。',
//             type: 'MAIN',
//             role: 'PROTAGONIST',
//             personality: {
//               traits: ['勇敢', '正義感', '行動力がある'],
//               speechPatterns: ['くだけた口調', '熱血的な表現'],
//               quirks: ['口癖：「よし、やるぞ！」'],
//               values: ['友情', '正義']
//             },
//             appearance: {
//               physicalDescription: '身長175cm、黒髪、鋭い目つき',
//               clothing: '学生服、または普段着',
//               distinguishingFeatures: ['左手首の古傷']
//             },
//             backstory: {
//               summary: '幼い頃に事故で両親を失い、祖父母に育てられた。',
//               significantEvents: ['親友の危機で初めて力に目覚めた'],
//               origin: '中央区の住宅街'
//             },
//             state: {
//               isActive: true,
//               emotionalState: 'DETERMINED',
//               developmentStage: 3,
//               lastAppearance: 42
//             },
//             history: {
//               appearances: [],
//               interactions: [],
//               developmentPath: []
//             },
//             metadata: {
//               createdAt: new Date(),
//               lastUpdated: new Date()
//             }
//           },
//           {
//             id: 'char-2',
//             name: '鈴木美咲',
//             description: '主人公のクラスメイト。秘密を知っている。',
//             type: 'SUB',
//             role: 'ALLY',
//             personality: {
//               traits: ['聡明', '思いやりがある', '好奇心旺盛'],
//               speechPatterns: ['丁寧な口調', '質問形式'],
//               quirks: ['考え事をするとメガネを直す'],
//               values: ['知識', '真実']
//             },
//             appearance: {
//               physicalDescription: '身長160cm、茶髪ロングヘア、メガネ',
//               clothing: '制服や清楚な服装',
//               distinguishingFeatures: ['青いリボン']
//             },
//             backstory: {
//               summary: '科学者の父を持ち、小さい頃から科学に興味がある。',
//               significantEvents: ['主人公の力を偶然目撃した'],
//               origin: '中央区の高級住宅街'
//             },
//             state: {
//               isActive: true,
//               emotionalState: 'CONCERNED',
//               developmentStage: 2,
//               lastAppearance: 40
//             },
//             history: {
//               appearances: [],
//               interactions: [],
//               developmentPath: []
//             },
//             metadata: {
//               createdAt: new Date(),
//               lastUpdated: new Date()
//             }
//           },
//           {
//             id: 'char-3',
//             name: '佐藤隆',
//             description: 'かつての友人で、現在は敵対している。',
//             type: 'SUB',
//             role: 'ANTAGONIST',
//             personality: {
//               traits: ['冷静', '計算高い', '野心的'],
//               speechPatterns: ['皮肉まじり', '冷たい口調'],
//               quirks: ['左手で前髪をかき上げる'],
//               values: ['力', '支配']
//             },
//             appearance: {
//               physicalDescription: '身長180cm、銀髪、鋭い目つき',
//               clothing: '黒いコート、高級な服',
//               distinguishingFeatures: ['右目の下の傷']
//             },
//             backstory: {
//               summary: '裕福な家庭に育ったが、両親の期待に応えるプレッシャーで性格が歪んだ。',
//               significantEvents: ['主人公との決別'],
//               origin: '東区の高級マンション'
//             },
//             state: {
//               isActive: true,
//               emotionalState: 'ANGRY',
//               developmentStage: 3,
//               lastAppearance: 42
//             },
//             history: {
//               appearances: [],
//               interactions: [],
//               developmentPath: []
//             },
//             metadata: {
//               createdAt: new Date(),
//               lastUpdated: new Date()
//             }
//           },
//           {
//             id: 'char-4',
//             name: '山田先生',
//             description: '主人公たちの担任教師。実は特殊な組織の一員。',
//             type: 'SUB',
//             role: 'MENTOR',
//             personality: {
//               traits: ['厳格', '洞察力がある', '優しさを隠している'],
//               speechPatterns: ['短い文', '比喩表現'],
//               quirks: ['チョークを回す'],
//               values: ['規律', '成長']
//             },
//             appearance: {
//               physicalDescription: '40代、短髪、眼鏡',
//               clothing: 'スーツ、白衣',
//               distinguishingFeatures: ['いつも持ち歩く古い懐中時計']
//             },
//             backstory: {
//               summary: '元特殊部隊員で、現在は潜伏任務中。',
//               significantEvents: ['主人公の素質を見抜いた'],
//               origin: '不明（偽装している）'
//             },
//             state: {
//               isActive: true,
//               emotionalState: 'NEUTRAL',
//               developmentStage: 2,
//               lastAppearance: 39
//             },
//             history: {
//               appearances: [],
//               interactions: [],
//               developmentPath: []
//             },
//             metadata: {
//               createdAt: new Date(),
//               lastUpdated: new Date()
//             }
//           },
//           {
//             id: 'char-5',
//             name: '田中店主',
//             description: '主人公の家の近くのラーメン店主。',
//             type: 'MOB',
//             role: 'OTHER',
//             personality: {
//               traits: ['陽気', '話好き'],
//               speechPatterns: ['方言交じり'],
//               quirks: ['大きな笑い声'],
//               values: ['家族', '伝統']
//             },
//             appearance: {
//               physicalDescription: '50代、ぽっちゃり体型、笑顔が特徴',
//               clothing: '白いラーメン店の制服と帽子',
//               distinguishingFeatures: ['腕の火傷跡']
//             },
//             backstory: {
//               summary: '20年間同じ場所でラーメン店を営んでいる。地域の人気者。',
//               significantEvents: [],
//               origin: '西区商店街'
//             },
//             state: {
//               isActive: true,
//               emotionalState: 'HAPPY',
//               developmentStage: 1,
//               lastAppearance: 36
//             },
//             history: {
//               appearances: [],
//               interactions: [],
//               developmentPath: []
//             },
//             metadata: {
//               createdAt: new Date(),
//               lastUpdated: new Date()
//             }
//           }
//         ];
        
//         setCharacters(mockCharacters);
//       } catch (error) {
//         console.error('Failed to fetch characters:', error);
//       } finally {
//         setIsLoading(false);
//       }
//     };
    
//     fetchCharacters();
//   }, []);
  
//   return { characters, isLoading };
// };