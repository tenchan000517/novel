import { logger } from '@/lib/utils/logger';
import { storageProvider } from '@/lib/storage';
import { 
  BusinessConcept, 
  LearningStage, 
  LearningRecord,
  TransformationalElement
} from '@/types/concepts';
import { ThemeResonanceAnalyzer } from '@/lib/plot/theme-resonance-analyzer';

/**
 * @class BusinessConceptLibrary
 * @description ビジネス概念のデータベースと体験的学習パターンを管理するクラス
 */
export class BusinessConceptLibrary {
  private concepts: Map<string, BusinessConcept> = new Map();
  private initialized: boolean = false;
  private themeResonanceAnalyzer?: ThemeResonanceAnalyzer;

  /**
   * コンストラクタ
   * @param themeResonanceAnalyzer テーマ共鳴分析システム（オプション）
   */
  constructor(themeResonanceAnalyzer?: ThemeResonanceAnalyzer) {
    this.themeResonanceAnalyzer = themeResonanceAnalyzer;
    logger.info('BusinessConceptLibrary initialized');
  }

  /**
   * ライブラリを初期化し、概念データをロード
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      const exists = await storageProvider.fileExists('concepts/business-concepts.json');
      
      if (exists) {
        // 既存のデータをロード
        const content = await storageProvider.readFile('concepts/business-concepts.json');
        const conceptsArray = JSON.parse(content) as BusinessConcept[];
        
        for (const concept of conceptsArray) {
          this.concepts.set(concept.id, concept);
        }
        
        logger.info(`Loaded ${conceptsArray.length} business concepts from storage`);
      } else {
        // 初期データを生成
        await this.generateInitialConceptsData();
        logger.info('Generated initial business concepts data');
      }
      
      // テーマ共鳴分析システムがあれば、概念をテーマとして登録
      if (this.themeResonanceAnalyzer) {
        this.registerConceptsAsThemes();
      }
      
      this.initialized = true;
      logger.info('BusinessConceptLibrary initialization complete');
    } catch (error) {
      logger.error('Failed to initialize BusinessConceptLibrary', {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * 初期概念データを生成
   * @private
   */
  private async generateInitialConceptsData(): Promise<void> {
    // ISSUE DRIVEN概念の定義
    const issueDrivenConcept: BusinessConcept = {
      id: 'concept-issue-driven',
      name: 'ISSUE DRIVEN',
      description: '顧客の課題を起点にソリューションを考えるアプローチ。製品起点ではなく顧客課題起点で考えることで、真に価値のあるソリューションを生み出す思考法。',
      category: 'ビジネス思考',
      misconceptions: [
        '「ISSUE = 問題」という誤解。ISSUEは課題であり、必ずしも問題とは限らない。',
        '顧客の言う通りにすればよいという誤解。顧客が表明する要望の背後にある本質的課題を掘り下げる必要がある。',
        '技術力や提案力より重要という誤解。課題理解と解決策の質は両方重要である。'
      ],
      examples: [
        '営業チームが「販売数を増やしたい」という要望に対し、なぜそれが必要かを掘り下げて「新規顧客獲得コストの削減」という真の課題を発見し、解決策を提案した事例',
        'ECサイトの「カート離脱率を下げたい」という課題に対し、ユーザー行動分析から「決済プロセスの複雑さ」という真因を特定し改善した事例'
      ],
      relatedConcepts: ['顧客中心設計', '共感マップ', 'ジョブ理論'],
      transformationalElements: [
        {
          description: '製品中心から顧客中心への視点転換',
          fromStage: LearningStage.MISCONCEPTION,
          toStage: LearningStage.EXPLORATION,
          catalysts: ['顧客との直接対話', '失敗体験', '共感ワークショップ']
        },
        {
          description: '表面的な要望と本質的課題の区別',
          fromStage: LearningStage.EXPLORATION,
          toStage: LearningStage.CONFLICT,
          catalysts: ['「なぜ」の5回繰り返し', '顧客観察', 'ペルソナ分析']
        },
        {
          description: '課題定義と解決策のバランス理解',
          fromStage: LearningStage.CONFLICT,
          toStage: LearningStage.INSIGHT,
          catalysts: ['成功事例分析', 'メンターからのフィードバック', '複数の視点からの検証']
        },
        {
          description: '実践でのISSUE DRIVENアプローチの適用',
          fromStage: LearningStage.INSIGHT,
          toStage: LearningStage.APPLICATION,
          catalysts: ['実際のプロジェクトでの試行', '継続的な検証と修正', 'チーム全体での取り組み']
        },
        {
          description: '日常的な思考プロセスへの統合',
          fromStage: LearningStage.APPLICATION,
          toStage: LearningStage.INTEGRATION,
          catalysts: ['他者への教育', '多様な状況での応用', 'プロセスの体系化']
        }
      ]
    };

    // 顧客中心設計概念の定義
    const customerCentricDesignConcept: BusinessConcept = {
      id: 'concept-customer-centric-design',
      name: '顧客中心設計',
      description: '顧客のニーズ、目標、課題、行動パターンを中心に置き、製品やサービスをデザインするアプローチ。顧客体験の質を最優先する考え方。',
      category: 'ビジネス思考',
      misconceptions: [
        '「顧客の言うことすべてに従う」という誤解。顧客洞察に基づく判断が重要。',
        '「デザイン部門だけの仕事」という誤解。組織全体で取り組むべき哲学である。',
        '「コストがかかりすぎる」という誤解。長期的には顧客満足度と競争力向上につながる投資である。'
      ],
      examples: [
        'Appleが製品デザインにおけるユーザー体験を最優先し、技術的制約よりも使いやすさを重視した事例',
        'Amazonが「カスタマーオブセッション」の価値観に基づき、短期的な利益よりも顧客満足を優先した事業展開'
      ],
      relatedConcepts: ['ISSUE DRIVEN', 'ユーザーエクスペリエンス', 'デザイン思考'],
      transformationalElements: [
        {
          description: '自社視点から顧客視点への転換',
          fromStage: LearningStage.MISCONCEPTION,
          toStage: LearningStage.EXPLORATION,
          catalysts: ['顧客インタビュー参加', 'ユーザーテスト観察', '競合分析']
        },
        {
          description: '顧客理解の深化と共感能力の開発',
          fromStage: LearningStage.EXPLORATION,
          toStage: LearningStage.CONFLICT,
          catalysts: ['フィールドリサーチ', '顧客旅行マップ作成', 'ペルソナワークショップ']
        },
        {
          description: '組織の価値観と顧客中心主義の統合',
          fromStage: LearningStage.CONFLICT,
          toStage: LearningStage.INSIGHT,
          catalysts: ['成功事例研究', 'リーダーシップの転換', '組織文化の再評価']
        },
        {
          description: '実践的な顧客中心プロセスの採用',
          fromStage: LearningStage.INSIGHT,
          toStage: LearningStage.APPLICATION,
          catalysts: ['プロトタイピングと検証サイクル', 'チーム横断的協働', '継続的なフィードバックシステム']
        },
        {
          description: '顧客中心文化の組織全体への浸透',
          fromStage: LearningStage.APPLICATION,
          toStage: LearningStage.INTEGRATION,
          catalysts: ['評価基準の変更', '顧客中心KPIの導入', '採用・研修プロセスの見直し']
        }
      ]
    };

    // データドリブン意思決定概念の定義
    const dataDriverDecisionConcept: BusinessConcept = {
      id: 'concept-data-driven-decision',
      name: 'データドリブン意思決定',
      description: '感覚や経験則ではなく、客観的なデータ分析に基づいて意思決定を行うアプローチ。仮説と検証のサイクルを通じて継続的に改善を図る方法論。',
      category: 'ビジネス思考',
      misconceptions: [
        '「データさえあれば自動的に良い判断ができる」という誤解。データ解釈と文脈理解が重要。',
        '「定性的情報は不要」という誤解。定量・定性両方のデータが必要である。',
        '「完璧なデータが必要」という誤解。不完全でも意思決定に役立つデータ活用が重要。'
      ],
      examples: [
        'Netflixがユーザー視聴データを分析し、コンテンツ制作決定に活用している事例',
        'Amazonが購買データに基づいて商品推奨システムを最適化し、顧客体験と売上を向上させた事例'
      ],
      relatedConcepts: ['PDCA', 'A/Bテスト', 'ビジネスインテリジェンス'],
      transformationalElements: [
        {
          description: '直感依存から証拠重視への転換',
          fromStage: LearningStage.MISCONCEPTION,
          toStage: LearningStage.EXPLORATION,
          catalysts: ['失敗体験の分析', 'データ価値の実例', '競合の成功事例']
        },
        {
          description: 'データ収集と分析スキルの獲得',
          fromStage: LearningStage.EXPLORATION,
          toStage: LearningStage.CONFLICT,
          catalysts: ['データリテラシー研修', '分析ツールの習得', '基本統計の学習']
        },
        {
          description: 'データと経験のバランスへの理解',
          fromStage: LearningStage.CONFLICT,
          toStage: LearningStage.INSIGHT,
          catalysts: ['複合的判断事例の検証', 'エキスパートとの対話', '意思決定プロセスの振り返り']
        },
        {
          description: '体系的なデータ活用プロセスの実践',
          fromStage: LearningStage.INSIGHT,
          toStage: LearningStage.APPLICATION,
          catalysts: ['仮説検証サイクルの運用', 'ダッシュボード構築', 'チーム内データ共有']
        },
        {
          description: 'データ文化の組織への定着と進化',
          fromStage: LearningStage.APPLICATION,
          toStage: LearningStage.INTEGRATION,
          catalysts: ['データ戦略の策定', '組織全体のデータリテラシー向上', '継続的な改善フレームワーク']
        }
      ]
    };

    // 概念をマップに追加
    this.concepts.set(issueDrivenConcept.id, issueDrivenConcept);
    this.concepts.set(customerCentricDesignConcept.id, customerCentricDesignConcept);
    this.concepts.set(dataDriverDecisionConcept.id, dataDriverDecisionConcept);

    // ファイルに保存
    await this.saveConceptsData();
  }

  /**
   * 概念をテーマとして登録
   * @private
   */
  private registerConceptsAsThemes(): void {
    if (!this.themeResonanceAnalyzer) return;
    
    // ThemeResonanceAnalyzerにregisterThemeメソッドがあると想定
    logger.info('Registering business concepts as themes for resonance analysis');
    // 実装例（実際のAPIに合わせて調整）：
    // for (const concept of this.concepts.values()) {
    //   this.themeResonanceAnalyzer.registerTheme(concept.name);
    // }
  }

  /**
   * 概念の詳細を取得
   * @param conceptName 概念名またはID
   * @returns 概念詳細またはnull
   */
  async getConceptDetails(conceptName: string): Promise<BusinessConcept | null> {
    await this.ensureInitialized();
    
    // 正規化された名前で検索
    const normalizedName = conceptName.toLowerCase().trim();
    
    // IDでの直接検索
    for (const concept of this.concepts.values()) {
      if (concept.id.toLowerCase() === normalizedName) {
        return concept;
      }
    }
    
    // 名前での検索
    for (const concept of this.concepts.values()) {
      if (concept.name.toLowerCase() === normalizedName) {
        return concept;
      }
    }
    
    // 部分一致での検索
    for (const concept of this.concepts.values()) {
      if (concept.name.toLowerCase().includes(normalizedName) || 
          normalizedName.includes(concept.name.toLowerCase())) {
        return concept;
      }
    }
    
    logger.warn(`Concept not found: ${conceptName}`);
    return null;
  }

  /**
   * 篇のテーマに関連する概念を取得
   * @param sectionTheme 篇テーマ
   * @returns 関連概念のリスト
   */
  async getConceptsForSection(sectionTheme: string): Promise<BusinessConcept[]> {
    await this.ensureInitialized();
    
    const keywords = this.extractKeywords(sectionTheme);
    const relatedConcepts: BusinessConcept[] = [];
    
    // キーワードに基づいて関連概念を検索
    for (const concept of this.concepts.values()) {
      // テーマとの直接的な関連をチェック
      if (concept.name.toLowerCase().includes(sectionTheme.toLowerCase()) || 
          sectionTheme.toLowerCase().includes(concept.name.toLowerCase())) {
        relatedConcepts.push(concept);
        continue;
      }
      
      // キーワードとの部分一致をチェック
      const matchesKeyword = keywords.some(keyword => 
        concept.name.toLowerCase().includes(keyword) || 
        concept.description.toLowerCase().includes(keyword) ||
        concept.category.toLowerCase().includes(keyword)
      );
      
      if (matchesKeyword) {
        relatedConcepts.push(concept);
      }
    }
    
    return relatedConcepts;
  }

  /**
   * 変容ステージに応じた変容要素を取得
   * @param conceptName 概念名
   * @param currentStage 現在のステージ
   * @param targetStage 目標ステージ
   * @returns 変容要素のリスト
   */
  async getTransformationalElements(
    conceptName: string,
    currentStage: LearningStage,
    targetStage: LearningStage
  ): Promise<TransformationalElement[]> {
    await this.ensureInitialized();
    
    const concept = await this.getConceptDetails(conceptName);
    
    if (!concept) {
      logger.warn(`Cannot get transformational elements: concept not found: ${conceptName}`);
      return this.getGeneralTransformationalElements(currentStage, targetStage);
    }
    
    // 概念の学習段階から適切な要素を取得
    const elements = concept.transformationalElements.filter(element => 
      element.fromStage === currentStage && element.toStage === targetStage
    );
    
    if (elements.length === 0) {
      // 特定の段階遷移の要素がない場合、より一般的な要素を提供
      logger.debug(`No specific transformational elements found for ${conceptName} from ${currentStage} to ${targetStage}. Using general elements.`);
      return this.getGeneralTransformationalElements(currentStage, targetStage);
    }
    
    return elements;
  }

  /**
   * すべての概念を取得
   * @returns 概念のリスト
   */
  async getAllConcepts(): Promise<BusinessConcept[]> {
    await this.ensureInitialized();
    return Array.from(this.concepts.values());
  }

  /**
   * 特定の概念情報を更新
   * @param conceptName 概念名
   * @param learningRecord 学習記録（段階、章番号、洞察、例）
   * @returns 更新成功の真偽値
   */
  async updateConceptWithLearningRecord(
    conceptName: string,
    learningRecord: LearningRecord
  ): Promise<boolean> {
    await this.ensureInitialized();
    
    const concept = await this.getConceptDetails(conceptName);
    
    if (!concept) {
      logger.warn(`Cannot update concept: concept not found: ${conceptName}`);
      return false;
    }
    
    // 学習記録を追加
    if (!concept.learningJourney) {
      concept.learningJourney = [];
    }
    
    concept.learningJourney.push(learningRecord);
    
    // 章番号順にソート
    concept.learningJourney.sort((a, b) => a.chapterNumber - b.chapterNumber);
    
    // 重複を除去（同じ章と段階の組み合わせ）
    const uniqueRecords: LearningRecord[] = [];
    const seen = new Set<string>();
    
    for (const record of concept.learningJourney) {
      const key = `${record.chapterNumber}-${record.stage}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueRecords.push(record);
      }
    }
    
    concept.learningJourney = uniqueRecords;
    
    // 更新した概念を保存
    this.concepts.set(concept.id, concept);
    await this.saveConceptsData();
    
    logger.info(`Updated concept ${conceptName} with learning record at stage ${learningRecord.stage} in chapter ${learningRecord.chapterNumber}`);
    return true;
  }

  /**
   * 概念情報をファイルに保存
   * @private
   */
  private async saveConceptsData(): Promise<void> {
    try {
      // ディレクトリの存在確認
      const dirExists = await storageProvider.directoryExists('concepts');
      if (!dirExists) {
        await storageProvider.createDirectory('concepts');
      }
      
      // 概念データを配列に変換
      const conceptsArray = Array.from(this.concepts.values());
      
      // ファイルに保存
      await storageProvider.writeFile(
        'concepts/business-concepts.json',
        JSON.stringify(conceptsArray, null, 2)
      );
      
      logger.debug(`Saved ${conceptsArray.length} business concepts to storage`);
    } catch (error) {
      logger.error('Failed to save business concepts data', {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * 初期化済みであることを確認
   * @private
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  /**
   * テーマからキーワードを抽出
   * @private
   * @param theme テーマ
   * @returns キーワードのリスト
   */
  private extractKeywords(theme: string): string[] {
    const words = theme.toLowerCase().split(/\s+|,|;|\.|\(|\)|、|。|（|）/);
    
    // ストップワード（除外する一般的な単語）
    const stopWords = new Set(['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'of', 'about', 'に', 'は', 'を', 'が', 'と', 'で', 'の', 'から', 'より', 'による']);
    
    // キーワードとして有効な単語のみを抽出
    return words
      .filter(word => word.length > 1 && !stopWords.has(word))
      .map(word => word.trim());
  }

  /**
   * 一般的な変容要素を取得
   * @private
   * @param currentStage 現在のステージ
   * @param targetStage 目標ステージ
   * @returns 変容要素のリスト
   */
  private getGeneralTransformationalElements(
    currentStage: LearningStage,
    targetStage: LearningStage
  ): TransformationalElement[] {
    // 段階遷移パターンのキーを生成
    const transitionKey = `${currentStage}-${targetStage}`;
    
    // 一般的な変容要素のマップ
    const generalElements: Record<string, TransformationalElement> = {
      // 誤解→探索
      [`${LearningStage.MISCONCEPTION}-${LearningStage.EXPLORATION}`]: {
        description: '固定観念の打破と新しい視点の探求',
        fromStage: LearningStage.MISCONCEPTION,
        toStage: LearningStage.EXPLORATION,
        catalysts: ['新たな情報との出会い', '疑問の発生', '既存の考え方の限界の体験']
      },
      
      // 探索→葛藤
      [`${LearningStage.EXPLORATION}-${LearningStage.CONFLICT}`]: {
        description: '異なる視点の衝突と内的葛藤の経験',
        fromStage: LearningStage.EXPLORATION,
        toStage: LearningStage.CONFLICT,
        catalysts: ['矛盾する情報の認識', '選択の必要性', '複数の視点の比較']
      },
      
      // 葛藤→洞察
      [`${LearningStage.CONFLICT}-${LearningStage.INSIGHT}`]: {
        description: '統合的理解への breakthrough と新たな視座の獲得',
        fromStage: LearningStage.CONFLICT,
        toStage: LearningStage.INSIGHT,
        catalysts: ['深い思索', '対話と共有', '実験と検証', '瞑想的内省']
      },
      
      // 洞察→応用
      [`${LearningStage.INSIGHT}-${LearningStage.APPLICATION}`]: {
        description: '理解から実践への移行と実際的スキルの獲得',
        fromStage: LearningStage.INSIGHT,
        toStage: LearningStage.APPLICATION,
        catalysts: ['実践機会', 'フィードバックループ', '継続的な試行錯誤']
      },
      
      // 応用→統合
      [`${LearningStage.APPLICATION}-${LearningStage.INTEGRATION}`]: {
        description: '意識的実践から無意識的習熟への昇華',
        fromStage: LearningStage.APPLICATION,
        toStage: LearningStage.INTEGRATION,
        catalysts: ['継続的な実践', '他者への教授', '多様な状況での応用', '体系化']
      }
    };
    
    // 該当する変容要素を取得
    const element = generalElements[transitionKey];
    
    if (element) {
      return [element];
    }
    
    // 直接的な遷移パターンがない場合はデフォルト要素を返す
    return [{
      description: '理解と実践を通じた段階的成長',
      fromStage: currentStage,
      toStage: targetStage,
      catalysts: ['新しい情報', '実践体験', '内省と対話', 'フィードバック']
    }];
  }
}

// シングルトンインスタンスをエクスポート
export const businessConceptLibrary = new BusinessConceptLibrary();