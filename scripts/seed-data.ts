
/**
 * サンプルデータ作成スクリプト
 * 
 * 開発環境でのテスト用にサンプルデータを生成します
 */

import path from 'path';
import fs from 'fs/promises';
import { StorageProvider } from '../src/lib/storage/types';
import { LocalStorageProvider } from '../src/lib/storage/local-storage';
import { logger } from '../src/lib/utils/logger';
import { parseYaml, stringifyYaml } from '../src/lib/utils/helpers';

/**
 * メインキャラクターのサンプルデータ
 */
const mainCharacters = [
  {
    id: 'char-001',
    name: 'リオン・アルバート',
    type: 'MAIN',
    role: 'PROTAGONIST',
    // 他の詳細情報は既存のYAMLから読み込む
  },
  {
    id: 'char-002',
    name: 'エリア・ノーブルリンド',
    type: 'MAIN',
    role: 'ALLY',
    // 他の詳細情報は既存のYAMLから読み込む
  },
];

/**
 * サブキャラクターのサンプルデータ
 */
const subCharacters = [
  {
    id: 'char-003',
    name: 'マーカス・ワイズマンテル',
    type: 'SUB',
    role: 'MENTOR',
    // 他の詳細情報は既存のYAMLから読み込む
  },
  {
    id: 'char-004',
    name: 'ヴィクター・ダークシャドウ',
    type: 'SUB',
    role: 'ANTAGONIST',
    // 新しく作成するキャラクター
    personality: {
      traits: ['野心的', '知的', '冷酷', '計算高い'],
      speechPatterns: ['丁寧だが威圧的な話し方', '皮肉を多用'],
      quirks: ['常に手袋を着用', '完璧な姿勢を保つ'],
      values: ['力による秩序', '知識は力なり'],
    },
    appearance: {
      physicalDescription: '40代前半の長身痩躯の男性。白髪交じりの黒髪と鋭い灰色の目を持つ。常に上品な装いをしている。',
      clothing: '高級な黒い服と手袋、首元には古代の魔法アミュレットを身につけている。',
      distinguishingFeatures: ['左目の下の細い傷', '常に冷たい表情'],
    },
    backstory: {
      summary: 'かつてバルドラン王国の魔法評議会のメンバーだったが、急進的な考えにより追放された。魔法の衰退は人間の怠慢が原因だと考え、強制的に魔法を取り戻す方法を研究している。',
      significantEvents: [
        '若い頃：マーカスの最も優秀な弟子だった',
        '35歳：魔法評議会で魔法使用の規制緩和を提案するも却下',
        '38歳：禁断の魔法研究により評議会から追放',
        '現在：「闇の商人団」を率いて古代魔法の力を集める',
      ],
      trauma: ['幼少期の魔法事故での家族喪失', '評議会からの屈辱的な追放'],
      origin: 'バルドラン王国北部の没落貴族家系',
    },
    relationships: [
      {
        targetCharacterId: 'char-003',
        type: '元師弟',
        strength: 6,
        description: 'かつての師。彼の保守的なアプローチに失望し対立するに至る。',
      },
      {
        targetCharacterId: 'char-001',
        type: '対立',
        strength: 7,
        description: '彼の才能に目を付け、手下にしようと試みる。拒否されたため敵対関係に。',
      },
    ],
    developmentStage: {
      current: '野望の追求',
      nextStageConditions: ['古代魔法の秘密の発見', '自身の手法への疑問'],
      history: ['優秀な弟子', '革新的研究者', '失意の追放者', '闇の指導者'],
    },
    appearanceHistory: {
      firstAppearance: 5,
      chapters: [5, 10, 15],
      significance: {
        '5': 7,
        '10': 8,
        '15': 10,
      },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/**
 * モブキャラクターのサンプルデータ
 */
const mobCharacters = [
  {
    id: 'char-101',
    name: 'オルガ・スミス',
    type: 'MOB',
    role: 'OTHER',
    personality: {
      traits: ['朗らか', '世話好き', '噂好き'],
      speechPatterns: ['方言混じりの話し方'],
      quirks: ['常に手仕事をしている'],
      values: ['村の平和', '家族の絆'],
    },
    appearance: {
      physicalDescription: '50代の丸々とした体型の女性。灰色の髪を常にお団子にしている。',
      clothing: '質素だが清潔な農村の服装。常に料理用のエプロンを着けている。',
      distinguishFeatures: ['明るい笑顔', '働き者の手'],
    },
    backstory: {
      summary: 'ノーウッド村で代々続く宿屋の女主人。リオンが幼い頃から面倒を見てきた。',
      significantEvents: ['リオンの両親の葬儀を取り仕切った'],
      origin: 'バルドラン王国ノーウッド村',
    },
    relationships: [
      {
        targetCharacterId: 'char-001',
        type: '擬似家族',
        strength: 6,
        description: 'リオンを我が子のように見守ってきた。',
      },
    ],
    developmentStage: {
      current: '変化への適応',
      nextStageConditions: ['村の魔法消失への対応'],
      history: ['村の世話役'],
    },
    appearanceHistory: {
      firstAppearance: 1,
      chapters: [1],
      significance: {
        '1': 3,
      },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'char-102',
    name: 'ジェイク・ミラー',
    type: 'MOB',
    role: 'OTHER',
    personality: {
      traits: ['勤勉', '几帳面', '慎重'],
      speechPatterns: ['簡潔な話し方'],
      quirks: ['常に時間を気にする'],
      values: ['効率', '規律'],
    },
    appearance: {
      physicalDescription: '30代前半の筋肉質な男性。短く刈り込んだ茶色の髪と緑の目を持つ。',
      clothing: '実用的な職人の服装。道具ベルトを常に身につけている。',
      distinguishFeatures: ['腕の火傷の跡', '鋭い観察眼'],
    },
    backstory: {
      summary: 'アカデミー周辺で工房を営む鍛冶職人。魔法の衰退に備えて科学的な道具開発に傾倒している。',
      significantEvents: ['父の工房を引き継いだ', '科学的発明で小さな賞を受賞'],
      origin: 'バルドラン王国王都',
    },
    relationships: [
      {
        targetCharacterId: 'char-001',
        type: '知人',
        strength: 4,
        description: 'リオンの武器や冒険道具を製作する。',
      },
      {
        targetCharacterId: 'char-002',
        type: '協力者',
        strength: 5,
        description: 'エリアの研究装置を一緒に開発している。',
      },
    ],
    developmentStage: {
      current: '技術革新',
      nextStageConditions: ['魔法と科学の融合技術の開発'],
      history: ['伝統的職人', '革新的発明家'],
    },
    appearanceHistory: {
      firstAppearance: 2,
      chapters: [2],
      significance: {
        '2': 4,
      },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/**
 * サンプルチャプター
 */
const sampleChapters = [
  {
    id: 'chapter-001',
    title: '旅立ちの日',
    content: `# 第1章：旅立ちの日

春の柔らかな光が魔法アカデミーの尖塔に降り注ぐ朝、リオン・アルバートは自室の窓から広大な学院の敷地を見渡していた。七年間過ごした部屋は、すでに荷物が片付けられ、がらんとしていた。今日は卒業式。そして、新たな旅の始まりの日でもある。

「思ったより寂しくないな」とリオンは呟いた。黒髪を無意識にかき上げながら、彼は部屋を最後に見回した。

ドアをノックする音が静かに響いた。

「開いてるよ」

ドアが開き、肩までの茶色の髪と知的な瞳を持つ少女、エリア・ノーブルリンドが現れた。いつものように整った服装で、手には厚い本を抱えている。

「まだ準備中？式まであと一時間しかないわよ」エリアは眼鏡を直しながら言った。

「ほとんど終わってる。ただ...最後に一度見ておきたくてさ」

エリアは部屋に入り、窓際に立つリオンの隣に立った。アカデミーの敷地を見下ろす二人の視線の先に、最近増えてきた「枯れた区画」が見えた。かつては魔法エネルギーで満ち溢れ、美しい植物が生い茂っていたエリアが、今は茶色く変色していた。

「また増えてる」リオンが静かに言った。

「ええ。先月よりも12%拡大しているわ。私の計算だと、このペースが続けば、3年以内にアカデミー全体の魔法圏が崩壊する可能性があるの」

リオンはエリアを見た。彼女はいつも冷静に分析するが、彼女の声に僅かな震えがあることに気づいた。魔法の衰退は、彼らにとって単なる研究対象ではなく、人生そのものに関わる問題だった。

「だからこそ、私たちの旅は重要なんだ」リオンは言った。

エリアはうなずいた。「そうね。卒業してからすぐに旅立つのは異例だけど、マーカス教授も承認してくれたわ。彼からのメッセージが届いているわよ」

彼女は小さな魔法スクロールをリオンに手渡した。リオンがそれに触れると、スクロールが淡く光り、マーカス・ワイズマンテルの温かみのある声が響いた。

「リオン、エリア。二人の決断を誇りに思う。古代の知恵を探す旅は危険だが、必要なものだ。卒業式後、私の研究室に来てほしい。君たちに渡すものがある。そして忘れるな、闇は光を求め、光は闇を恐れる。この言葉の意味がいつか理解できるだろう」

メッセージが終わると、スクロールは淡い光を放ち、灰になった。

「相変わらず謎めいているわね」エリアは小さなノートに何かをメモしながら言った。

リオンは微笑んだ。「それがマーカス先生だよ。行こう、エリア。これが最後の卒業式になるかもしれない」

「そんな不吉なこと言わないで」エリアは眉をひそめたが、彼女の目に決意の光が宿っていた。

---

アカデミーの大広間は、卒業生と教授陣、そして家族たちで賑わっていた。しかし例年と比べて明らかに人数が少なく、空気には微かな緊張感が漂っていた。七年前、リオンとエリアが入学した時には、魔法の衰退はまだ一部の研究者の間での噂に過ぎなかった。今では、誰の目にも明らかな現実となっていた。

壇上では、アカデミー長のエルドリッジ・グランドマスターが speech a speech 恐れなく、お前が仕えるべきは光だけなのだ」

リオンの右隣に座っていたエリアが、その詩を小さく口ずさんでいるのが聞こえた。彼女はその詩の元々の意味を研究しており、それが単なる詩ではなく、古代の魔法儀式の一部だという仮説を立てていた。

卒業式は粛々と進み、学生たちが一人ずつ名前を呼ばれ、魔法証書を受け取った。エリアがリオンよりも先に呼ばれた時、彼女は背筋をピンと伸ばして壇上に上がった。エリアが優等生として特別表彰を受けるのを見て、リオンは密かに誇らしく思った。

自分の名前が呼ばれたとき、リオンはゆっくりと壇上に上がった。エルドリッジ長から証書を受け取る際、老賢者は彼の目を見つめ、小さく頷いた。それは何かを知っているような、暗黙の承認のようだった。

儀式が終わり、学生たちが家族と祝福を交わす中、リオンとエリアはひっそりとマーカスの研究室へ向かった。

---

マーカスの研究室は、いつものように古い本と奇妙な魔法器具で溢れていた。空中には小さな光の球体がいくつか浮かび、自然光の代わりに部屋を照らしていた。

「おめでとう、二人とも」

マーカスは大きな木製の机から立ち上がって二人を迎えた。白髪と長いひげを持つ老人は、年齢を感じさせない鋭い青い目で二人を見つめた。

「ありがとうございます、先生」リオンとエリアは同時に答えた。

「座りなさい」マーカスは二つの椅子を示した。「君たちの旅は明日から始まる。準備はできているかね？」

「はい」リオンが答えた。「荷物はほとんど揃えました。エリアの研究資料も含めると少し重いですが」

エリアは少し顔を赤らめ、「必要最小限にしたわ。約束するわ」と言った。

マーカスは温かく笑った。「知識は重くない。それが命を救うこともある」彼は机の引き出しから古い羊皮紙を取り出した。「これは、古代エオリアの地図だ。現代の地図とは多少異なるが、君たちが探している『光の祠』の場所が記されている」

リオンは慎重に地図を広げた。エリアが身を乗り出し、彼の隣で地図を調べた。色あせた羊皮紙には、現在のバルドラン王国とその周辺地域が描かれていたが、境界線や地名は現代のものとは大きく異なっていた。

「ここですね」エリアが地図の東側、現在のシャードの荒野にあたる地域の一点を指さした。「『光の祠』...これが魔法衰退の鍵を握っていると？」

マーカスはゆっくりと頷いた。「そう考えられる理由がある。古代の文献によれば、『光の祠』は魔法の流れを調整する場所だったと言われている。今、魔法の流れが滞っているなら、その源を見つけるべきだろう」

「でも、シャードの荒野は危険だ」リオンが懸念を示した。「大魔法戦争の影響がまだ残っているって聞きます」

「その通り」マーカスは深刻な顔で答えた。「だからこそ、これを持っていくといい」彼は小さな木製の箱を取り出し、リオンに手渡した。

リオンが箱を開けると、中には古い銀の腕輪に酷似した、しかし見たことのない紋様が刻まれた腕輪があった。

「これは...」リオンは驚きの表情を浮かべた。家族の形見である自分の腕輪と非常に似ていたからだ。

「君の腕輪のペアだ」マーカスが説明した。「かつて強力な保護の魔法が込められていた。魔力は弱まっているが、まだ効果はあるはずだ」

リオンは腕輪を手に取り、自分が身につけているものと並べた。二つは確かに対になるようなデザインだった。

「先生、どうしてこれを...？」

マーカスは微笑んだ。「すべての疑問に今答えられるわけではない。答えは君たち自身で見つけるものだ。ただ覚えておきなさい。闇は光を求め、光は闇を恐れる」

エリアはその言葉をノートに書き留めながら、「この言葉の意味、必ず解き明かします」と言った。

マーカスは立ち上がり、二人の肩に手を置いた。彼の目には誇りと心配が混ざった表情があった。「世界は変わりつつある。魔法の衰退は単なる自然現象ではないかもしれん。用心したまえ、そして互いを守り合うのだ」

リオンとエリアは厳粛に頷いた。明日から始まる旅が、彼らの予想以上に危険でかつ重要なものになることを、二人は感じていた。卒業の日の穏やかな夕暮れの中、新たな冒険への期待と不安が入り混じる思いで、彼らはアカデミーの尖塔を見上げた。`,
    metadata: {
      number: 1,
      generatedAt: new Date().toISOString(),
      wordCount: 2100,
      generationTime: 12500,
      qualityScore: 87,
      tensionScore: 65,
      generationVersion: '1.0.0',
    },
  },
];

/**
 * サンプルデータを作成する関数
 */
async function seedData(): Promise<void> {
  try {
    const baseDir = path.resolve(process.cwd(), 'data');
    const storage = new LocalStorageProvider({ baseDir });
    
    // 必要なディレクトリの作成
    await createDirectories(storage);
    
    // 設定ファイルの作成
    await seedConfigFiles(storage);
    
    // キャラクターデータの作成
    await seedCharacters(storage);
    
    // チャプターデータの作成
    await seedChapters(storage);
    
    // 記憶データの作成
    await seedMemoryData(storage);
    
    logger.info('サンプルデータの作成が完了しました');
  } catch (error) {
    logger.error('サンプルデータの作成中にエラーが発生しました', { error });
    process.exit(1);
  }
}

/**
 * 必要なディレクトリを作成する関数
 */
async function createDirectories(storage: StorageProvider): Promise<void> {
  logger.info('ディレクトリを作成中...');
  
  const directories = [
    'config',
    'characters',
    'characters/main',
    'characters/sub-characters',
    'characters/mob-characters',
    'characters/character-pool',
    'chapters',
    'history',
  ];
  
  for (const dir of directories) {
    await storage.createDirectory(dir);
  }
}

/**
 * 設定ファイルを作成する関数
 */
async function seedConfigFiles(storage: StorageProvider): Promise<void> {
  logger.info('設定ファイルを作成中...');
  
  // 世界観設定
  const worldSettingsPath = 'config/world-settings.yaml';
  const worldSettingsExists = await storage.fileExists(worldSettingsPath);
  
  if (!worldSettingsExists) {
    // サンプルの世界観設定をYAMLファイルから読み込む
    const worldSettingsContent = await readSampleYaml('data/config/world-settings.yaml');
    await storage.writeFile(worldSettingsPath, worldSettingsContent);
  }
  
  // プロット設定
  const storyPlotPath = 'config/story-plot.yaml';
  const storyPlotExists = await storage.fileExists(storyPlotPath);
  
  if (!storyPlotExists) {
    // サンプルのプロット設定をYAMLファイルから読み込む
    const storyPlotContent = await readSampleYaml('data/config/story-plot.yaml');
    await storage.writeFile(storyPlotPath, storyPlotContent);
  }
}

/**
 * キャラクターデータを作成する関数
 */
async function seedCharacters(storage: StorageProvider): Promise<void> {
  logger.info('キャラクターデータを作成中...');
  
  // メインキャラクター
  for (const character of mainCharacters) {
    const filePath = `characters/main/${character.id}.yaml`;
    const exists = await storage.fileExists(filePath);
    
    if (!exists) {
      // サンプルのキャラクターデータをYAMLファイルから読み込む
      const characterContent = await readSampleYaml(`data/characters/main/${character.name.split(' ')[0].toLowerCase()}.yaml`);
      await storage.writeFile(filePath, characterContent);
    }
  }
  
  // サブキャラクター
  for (const character of subCharacters) {
    const filePath = `characters/sub-characters/${character.id}.yaml`;
    const exists = await storage.fileExists(filePath);
    
    if (!exists) {
      if (character.id === 'char-003') {
        // サンプルのキャラクターデータをYAMLファイルから読み込む
        const characterContent = await readSampleYaml('data/characters/sub-characters/mentor.yaml');
        await storage.writeFile(filePath, characterContent);
      } else {
        // 新しいキャラクターのデータをYAML形式に変換して保存
        const characterContent = stringifyYaml(character);
        await storage.writeFile(filePath, characterContent);
      }
    }
  }
  
  // モブキャラクター
  for (const character of mobCharacters) {
    const filePath = `characters/mob-characters/${character.id}.yaml`;
    const exists = await storage.fileExists(filePath);
    
    if (!exists) {
      // モブキャラクターのデータをYAML形式に変換して保存
      const characterContent = stringifyYaml(character);
      await storage.writeFile(filePath, characterContent);
    }
  }
}

/**
 * チャプターデータを作成する関数
 */
async function seedChapters(storage: StorageProvider): Promise<void> {
  logger.info('チャプターデータを作成中...');
  
  for (const chapter of sampleChapters) {
    const filePath = `chapters/${chapter.id}.md`;
    const exists = await storage.fileExists(filePath);
    
    if (!exists) {
      // チャプターデータをMarkdown形式で保存
      await storage.writeFile(filePath, chapter.content);
      
      // メタデータを別ファイルとして保存
      const metadataPath = `chapters/${chapter.id}.meta.yaml`;
      const metadataContent = stringifyYaml({
        id: chapter.id,
        title: chapter.title,
        metadata: chapter.metadata,
      });
      
      await storage.writeFile(metadataPath, metadataContent);
    }
  }
}

/**
 * 記憶データを作成する関数
 */
async function seedMemoryData(storage: StorageProvider): Promise<void> {
  logger.info('記憶データを作成中...');
  
  // 短期記憶
  const recentChaptersPath = 'history/recent-chapters.yaml';
  const recentChaptersExists = await storage.fileExists(recentChaptersPath);
  
  if (!recentChaptersExists) {
    // サンプルの短期記憶データをYAMLファイルから読み込む
    const recentChaptersContent = await readSampleYaml('data/history/recent-chapters.yaml');
    await storage.writeFile(recentChaptersPath, recentChaptersContent);
  }
  
  // 中期記憶
  const midTermArcPath = 'history/mid-term-arc.yaml';
  const midTermArcExists = await storage.fileExists(midTermArcPath);
  
  if (!midTermArcExists) {
    // サンプルの中期記憶データをYAMLファイルから読み込む
    const midTermArcContent = await readSampleYaml('data/history/mid-term-arc.yaml');
    await storage.writeFile(midTermArcPath, midTermArcContent);
  }
  
  // 長期記憶
  const longTermSummaryPath = 'history/long-term-summary.yaml';
  const longTermSummaryExists = await storage.fileExists(longTermSummaryPath);
  
  if (!longTermSummaryExists) {
    // サンプルの長期記憶データをYAMLファイルから読み込む
    const longTermSummaryContent = await readSampleYaml('data/history/long-term-summary.yaml');
    await storage.writeFile(longTermSummaryPath, longTermSummaryContent);
  }
}

/**
 * サンプルYAMLファイルを読み込む関数
 */
async function readSampleYaml(filePath: string): Promise<string> {
  try {
    const absolutePath = path.resolve(process.cwd(), filePath);
    return await fs.readFile(absolutePath, 'utf-8');
  } catch (error) {
    logger.error(`サンプルファイルの読み込みに失敗しました: ${filePath}`, { error });
    throw error;
  }
}

// スクリプト実行
seedData();