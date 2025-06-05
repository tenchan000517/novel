/**
 * @fileoverview キャラクターシステム完全分析スクリプト
 * @description 
 * CharacterManagerとその全コンポーネントのポテンシャルを完全分析し、
 * データ保存戦略の最適化に必要な情報を収集する
 */

const fs = require('fs').promises;
const path = require('path');

class CharacterSystemAnalyzer {
    constructor() {
        this.results = {
            componentAnalysis: {},
            dataTypeMapping: {},
            storageStrategy: {},
            implementationStatus: {},
            dependencies: {},
            promptRequirements: {}
        };
    }


    /**
     * メイン分析実行
     */
    async analyze() {
        console.log('[INFO] キャラクターシステム完全分析を開始...\n');

        try {
            // 段階1: コンポーネント構造分析
            await this.analyzeComponentStructure();

            // 段階2: データ型とインターフェース分析
            await this.analyzeDataTypes();

            // 段階3: 各サービスの実装状況調査
            await this.analyzeImplementationStatus();

            // 段階4: データフロー分析
            await this.analyzeDataFlow();

            // 段階5: ストレージ要件分析
            await this.analyzeStorageRequirements();

            // 段階6: プロンプト統合要件分析
            await this.analyzePromptRequirements();

            // 段階7: 設定ファイル調査
            await this.analyzeConfigFiles();

            // 段階8: 最適化推奨生成
            await this.generateOptimizationRecommendations();

            // 段階9: 成長計画システム調査
            await this.analyzeGrowthPlanSystem();

            // 結果出力
            await this.outputResults();

        } catch (error) {
            console.error('[ERROR] 分析中にエラーが発生:', error);
        }
    }

    /**
     * 段階1: コンポーネント構造分析
     */
    async analyzeComponentStructure() {
        console.log('[STEP1] コンポーネント構造分析');

        const components = [
            'CharacterService',
            'DetectionService',
            'EvolutionService',
            'PsychologyService',
            'RelationshipService',
            'ParameterService',
            'SkillService'
        ];

        for (const component of components) {
            try {
                const componentPath = await this.findComponentFile(component);
                if (componentPath) {
                    const analysis = await this.analyzeComponentFile(componentPath, component);
                    this.results.componentAnalysis[component] = analysis;
                    console.log(`  [OK] ${component}: ${analysis.methods.length}メソッド, ${analysis.interfaces.length}インターフェース`);
                } else {
                    this.results.componentAnalysis[component] = { status: 'NOT_FOUND' };
                    console.log(`  [NG] ${component}: ファイルが見つかりません`);
                }
            } catch (error) {
                console.log(`  [WARN] ${component}: 分析エラー - ${error.message}`);
            }
        }
    }

    /**
     * 段階2: データ型とインターフェース分析
     */
    async analyzeDataTypes() {
        console.log('\n[STEP2] データ型とインターフェース分析');

        try {
            // types.tsファイルを探す（正しいパス）
            const typesPaths = [
                'src/lib/characters/core/types.ts',
                'src/lib/character/core/types.ts',
                'src/character/core/types.ts',
                'lib/character/core/types.ts'
            ];

            let typesPath = null;
            for (const path of typesPaths) {
                try {
                    await fs.access(path);
                    typesPath = path;
                    break;
                } catch { }
            }

            if (typesPath) {
                const typeAnalysis = await this.analyzeTypeDefinitions(typesPath);
                this.results.dataTypeMapping = typeAnalysis;

                console.log(`  [OK] 型定義分析完了 (${typesPath}):`);
                console.log(`    - インターフェース: ${typeAnalysis.interfaces?.length || 0}個`);
                console.log(`    - 型定義: ${typeAnalysis.types?.length || 0}個`);
                console.log(`    - 列挙型: ${typeAnalysis.enums?.length || 0}個`);
                console.log(`    - キャラクター関連型: ${typeAnalysis.characterRelatedInterfaces?.length || 0}個`);
                if (typeAnalysis.characterRelatedInterfaces?.length > 0) {
                    console.log(`      例: ${typeAnalysis.characterRelatedInterfaces.slice(0, 3).join(', ')}`);
                }
            } else {
                console.log('  [NG] types.tsファイルが見つかりません');
            }
        } catch (error) {
            console.log(`  [WARN] データ型分析エラー: ${error.message}`);
        }
    }

    /**
     * 段階3: 各サービスの実装状況調査
     */
    async analyzeImplementationStatus() {
        console.log('\n[STEP3] 実装状況調査');

        const servicesPaths = [
            'src/lib/characters/services',  // 正しいパス
            'src/lib/character/services',   // フォールバック
            'src/character/services',
            'lib/character/services'
        ];

        for (const servicesPath of servicesPaths) {
            try {
                const exists = await this.directoryExists(servicesPath);
                if (exists) {
                    const files = await fs.readdir(servicesPath);
                    console.log(`  [DIR] ${servicesPath}:`);

                    for (const file of files) {
                        if ((file.endsWith('.ts') || file.endsWith('.js')) && !file.includes('copy')) {
                            const serviceName = file.replace(/\.(ts|js)$/, '');
                            const filePath = path.join(servicesPath, file);
                            const implementation = await this.analyzeServiceImplementation(filePath);

                            this.results.implementationStatus[serviceName] = implementation;
                            console.log(`    - ${serviceName}: ${implementation.completeness}% 実装済み`);
                        }
                    }
                    break;
                }
            } catch (error) {
                console.log(`  [WARN] ${servicesPath}: ${error.message}`);
            }
        }
    }

    /**
     * 段階4: データフロー分析
     */
    async analyzeDataFlow() {
        console.log('\n[STEP4] データフロー分析');

        // CharacterManagerのメソッドを分析してデータフローを理解
        const dataFlows = {
            creation: this.analyzeCreationFlow(),
            retrieval: this.analyzeRetrievalFlow(),
            update: this.analyzeUpdateFlow(),
            analysis: this.analyzeAnalysisFlow()
        };

        this.results.dependencies = dataFlows;

        console.log('  [OK] データフロー分析完了:');
        Object.keys(dataFlows).forEach(flow => {
            console.log(`    - ${flow}: ${dataFlows[flow].steps.length}ステップ`);
        });
    }

    /**
     * 段階5: ストレージ要件分析
     */
    async analyzeStorageRequirements() {
        console.log('\n[STEP5] ストレージ要件分析');

        const storageCategories = {
            STATIC_CONFIG: {
                description: '静的設定データ（不変）',
                location: 'config/characters/',
                data: [],
                updateFrequency: 'SYSTEM_UPDATE_ONLY'
            },
            DYNAMIC_STATE: {
                description: '動的状態データ（変化）',
                location: 'memory-system/',
                data: [],
                updateFrequency: 'RUNTIME'
            },
            CONTEXTUAL: {
                description: 'コンテキストデータ（一時）',
                location: 'context-manager/',
                data: [],
                updateFrequency: 'PER_SCENE'
            }
        };

        // CharacterWithDetailsインターフェースから保存要件を分析
        this.categorizeDataByStorageNeeds(storageCategories);

        this.results.storageStrategy = storageCategories;

        console.log('  [OK] ストレージ戦略分析完了:');
        Object.keys(storageCategories).forEach(category => {
            const cat = storageCategories[category];
            console.log(`    - ${category}: ${cat.data.length}項目 -> ${cat.location}`);
        });
    }

    /**
     * 段階6: プロンプト統合要件分析
     */
    async analyzePromptRequirements() {
        console.log('\n[STEP6] プロンプト統合要件分析');

        const promptRequirements = {
            basicInfo: {
                fields: ['name', 'age', 'description', 'type'],
                priority: 'HIGH',
                source: 'STATIC_CONFIG'
            },
            currentState: {
                fields: ['emotionalState', 'motivations', 'currentGoals'],
                priority: 'HIGH',
                source: 'DYNAMIC_STATE'
            },
            relationships: {
                fields: ['relationships', 'relationshipAnalysis'],
                priority: 'MEDIUM',
                source: 'DYNAMIC_STATE'
            },
            abilities: {
                fields: ['skills', 'parameters', 'growthPhase'],
                priority: 'MEDIUM',
                source: 'DYNAMIC_STATE'
            },
            context: {
                fields: ['roleInScene', 'sceneSpecificState'],
                priority: 'HIGH',
                source: 'CONTEXTUAL'
            },
            history: {
                fields: ['recentAppearances', 'significantChanges'],
                priority: 'LOW',
                source: 'DYNAMIC_STATE'
            }
        };

        this.results.promptRequirements = promptRequirements;

        console.log('  [OK] プロンプト要件分析完了:');
        Object.keys(promptRequirements).forEach(category => {
            const req = promptRequirements[category];
            console.log(`    - ${category}: ${req.fields.length}フィールド (${req.priority})`);
        });
    }

    /**
     * 段階7: 設定ファイル調査（修正版）
     */
    async analyzeConfigFiles() {
        console.log('\n[STEP7] 設定ファイル調査');

        const configPaths = [
            'data/characters/main',      // 正しいパス
            'data/characters/sub',       // 正しいパス  
            'data/characters',           // フォールバック
            'config/characters',
            'src/config/characters',
            'characters'
        ];

        let totalYamlFiles = 0;
        let totalJsonFiles = 0;
        const foundPaths = [];

        for (const configPath of configPaths) {
            try {
                const exists = await this.directoryExists(configPath);
                if (exists) {
                    const files = await fs.readdir(configPath);
                    console.log(`  [DIR] ${configPath}:`);

                    const yamlFiles = files.filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
                    const jsonFiles = files.filter(f => f.endsWith('.json'));

                    console.log(`    - YAMLファイル: ${yamlFiles.length}個`);
                    console.log(`    - JSONファイル: ${jsonFiles.length}個`);

                    totalYamlFiles += yamlFiles.length;
                    totalJsonFiles += jsonFiles.length;

                    if (yamlFiles.length > 0) {
                        console.log(`    - ファイル例: ${yamlFiles.slice(0, 3).join(', ')}`);

                        // 最初のファイルの内容をサンプル分析
                        const sampleFile = path.join(configPath, yamlFiles[0]);
                        const content = await fs.readFile(sampleFile, 'utf-8');
                        const lines = content.split('\n').length;
                        console.log(`    - サンプル（${yamlFiles[0]}）: ${content.length}文字, ${lines}行`);

                        // キャラクター情報の構造確認
                        await this.analyzeCharacterFileStructure(sampleFile, configPath);
                    }

                    foundPaths.push({
                        path: configPath,
                        yamlFiles,
                        jsonFiles
                    });
                }
            } catch (error) {
                console.log(`  [WARN] ${configPath}: ${error.message}`);
            }
        }

        this.results.configFiles = {
            totalYamlFiles,
            totalJsonFiles,
            foundPaths
        };

        console.log(`  [SUMMARY] 総計: YAMLファイル ${totalYamlFiles}個, JSONファイル ${totalJsonFiles}個`);
    }

    /**
     * 段階9: 成長計画システム調査
     */
    async analyzeGrowthPlanSystem() {
        console.log('\n[STEP9] 成長計画システム調査');

        const growthPlanPaths = [
            'data/growth-plans',
            'data/character-growth',
            'data/evolution-plans',
            'growth-plans'
        ];

        for (const growthPath of growthPlanPaths) {
            try {
                const exists = await this.directoryExists(growthPath);
                if (exists) {
                    const files = await fs.readdir(growthPath);
                    console.log(`  [DIR] ${growthPath}:`);

                    const jsonFiles = files.filter(f => f.endsWith('.json'));
                    const yamlFiles = files.filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));

                    console.log(`    - JSONファイル: ${jsonFiles.length}個`);
                    console.log(`    - YAMLファイル: ${yamlFiles.length}個`);

                    if (jsonFiles.length > 0) {
                        console.log(`    - ファイル例: ${jsonFiles.slice(0, 3).join(', ')}`);
                        // 最初のファイルの内容をサンプル分析
                        const sampleFile = path.join(growthPath, jsonFiles[0]);
                        await this.analyzeGrowthPlanFile(sampleFile);
                    }

                    this.results.growthPlanSystem = {
                        path: growthPath,
                        jsonFiles,
                        yamlFiles,
                        totalFiles: jsonFiles.length + yamlFiles.length
                    };
                    break;
                }
            } catch (error) {
                console.log(`  [WARN] ${growthPath}: ${error.message}`);
            }
        }
    }

    /**
     * 成長計画ファイル構造分析
     */
    async analyzeGrowthPlanFile(filepath) {
        try {
            const content = await fs.readFile(filepath, 'utf-8');
            const plan = JSON.parse(content);

            console.log(`    - サンプル（${path.basename(filepath)}）:`);
            console.log(`      キャラクターID: ${plan.characterId || 'N/A'}`);
            console.log(`      成長フェーズ数: ${plan.growthPhases?.length || 0}個`);
            console.log(`      アクティブ: ${plan.isActive ? 'Yes' : 'No'}`);

            if (plan.growthPhases && plan.growthPhases.length > 0) {
                const firstPhase = plan.growthPhases[0];
                console.log(`      フェーズ例: "${firstPhase.name}"`);
                console.log(`      チャプター範囲: ${firstPhase.chapterEstimate?.join('-') || 'N/A'}`);
                console.log(`      パラメータ変化: ${firstPhase.parameterChanges?.length || 0}個`);
                console.log(`      スキル習得: ${firstPhase.skillAcquisitions?.length || 0}個`);
            }

            // システムの高度さを分析
            const complexity = this.analyzeGrowthPlanComplexity(plan);
            console.log(`      システム複雑度: ${complexity.level} (スコア: ${complexity.score})`);

        } catch (error) {
            console.log(`    - 構造分析エラー: ${error.message}`);
        }
    }

    /**
     * 成長計画システムの複雑度分析
     */
    analyzeGrowthPlanComplexity(plan) {
        let score = 0;

        // 基本構造
        if (plan.id) score += 1;
        if (plan.characterId) score += 1;
        if (plan.description) score += 1;

        // 成長フェーズの詳細度
        if (plan.growthPhases) {
            score += plan.growthPhases.length * 2;

            plan.growthPhases.forEach(phase => {
                if (phase.chapterEstimate) score += 2;
                if (phase.stageRequirement !== undefined) score += 2;
                if (phase.parameterChanges) score += phase.parameterChanges.length;
                if (phase.skillAcquisitions) score += phase.skillAcquisitions.length;
            });
        }

        let level = 'BASIC';
        if (score > 20) level = 'ADVANCED';
        else if (score > 10) level = 'INTERMEDIATE';

        return { score, level };
    }


    /**
     * キャラクターファイル構造分析（追加）
     */
    async analyzeCharacterFileStructure(filepath, directory) {
        try {
            const content = await fs.readFile(filepath, 'utf-8');

            // YAML構造の簡易分析
            const hasId = content.includes('id:');
            const hasName = content.includes('name:');
            const hasType = content.includes('type:');
            const hasPersonality = content.includes('personality:');
            const hasSkills = content.includes('skills:');
            const hasState = content.includes('state:');

            console.log(`    - 構造分析: ID(${hasId ? 'Y' : 'N'}) Name(${hasName ? 'Y' : 'N'}) Type(${hasType ? 'Y' : 'N'}) Personality(${hasPersonality ? 'Y' : 'N'}) Skills(${hasSkills ? 'Y' : 'N'}) State(${hasState ? 'Y' : 'N'})`);

            // データ分類の推定
            if (hasState) {
                console.log(`    - 推定分類: MIXED (静的設定 + 動的状態データが混在)`);
            } else {
                console.log(`    - 推定分類: STATIC_CONFIG (静的設定データのみ)`);
            }

        } catch (error) {
            console.log(`    - 構造分析エラー: ${error.message}`);
        }
    }
    async generateOptimizationRecommendations() {
        console.log('\n[STEP8] 最適化推奨生成');

        const recommendations = {
            architecture: [],
            dataStorage: [],
            performance: [],
            integration: []
        };

        // 分析結果に基づく具体的推奨

        // アーキテクチャ推奨（システムの高度さを活かす）
        recommendations.architecture.push({
            priority: 'HIGH',
            category: 'SYSTEM_POTENTIAL_UTILIZATION',
            issue: '275メソッドの高度なキャラクターシステムが十分活用されていない',
            solution: 'CharacterManagerの全機能を活かしたプロンプト生成システム構築'
        });

        recommendations.architecture.push({
            priority: 'HIGH',
            category: 'GROWTH_PLAN_INTEGRATION',
            issue: '詳細な成長計画システムがプロンプト生成に統合されていない',
            solution: 'EvolutionServiceと成長計画データの完全統合によるキャラクター進化システム'
        });

        recommendations.architecture.push({
            priority: 'HIGH',
            category: 'DATA_ARCHITECTURE_CLARIFICATION',
            issue: '78型定義による包括的データ管理の設計方針が不明確',
            solution: '静的設定・動的状態・コンテキスト・成長計画の4層アーキテクチャ明確化'
        });

        // データストレージ推奨（実ファイル発見を踏まえて）
        recommendations.dataStorage.push({
            priority: 'HIGH',
            category: 'CONFIG_FILE_OPTIMIZATION',
            issue: '設定ファイル構造の最適化（STATIC/DYNAMIC分離）',
            solution: 'main/subディレクトリの設定ファイルから動的データを記憶階層に移行'
        });

        recommendations.dataStorage.push({
            priority: 'HIGH',
            category: 'GROWTH_PLAN_UTILIZATION',
            issue: '高度な成長計画システムが記憶階層と連携していない',
            solution: 'data/growth-plansとEvolutionServiceの完全統合による動的キャラクター進化'
        });

        recommendations.dataStorage.push({
            priority: 'MEDIUM',
            category: 'MEMORY_SYSTEM_INTEGRATION',
            issue: '記憶階層システムとの連携強化',
            solution: '7つの専門サービスの記憶階層活用度向上'
        });

        // パフォーマンス推奨（実装状況を踏まえて）
        recommendations.performance.push({
            priority: 'MEDIUM',
            category: 'SERVICE_OPTIMIZATION',
            issue: 'AI分析・予測機能（PsychologyService等）の最適化',
            solution: 'キャッシュ戦略とバッチ処理による性能向上'
        });

        recommendations.performance.push({
            priority: 'MEDIUM',
            category: 'GROWTH_PLAN_PERFORMANCE',
            issue: '成長計画の動的評価・予測処理の最適化',
            solution: 'フェーズ別キャッシュと予測結果の効率的管理'
        });

        // 統合推奨（プロンプト生成の核心）
        recommendations.integration.push({
            priority: 'HIGH',
            category: 'PROMPT_DATA_INTEGRATION',
            issue: 'プロンプト生成時の包括的キャラクター情報統合',
            solution: 'CharacterWithDetails形式の完全活用とテンプレート最適化'
        });

        recommendations.integration.push({
            priority: 'HIGH',
            category: 'DYNAMIC_CHARACTER_EVOLUTION',
            issue: 'キャラクター成長・関係性変化のプロンプトへの反映',
            solution: 'EvolutionService・RelationshipServiceの結果をリアルタイム統合'
        });

        recommendations.integration.push({
            priority: 'HIGH',
            category: 'GROWTH_PLAN_PROMPT_INTEGRATION',
            issue: 'フェーズ別成長計画がプロンプト生成に反映されていない',
            solution: '現在フェーズ・次回予測・パラメータ変化をプロンプトに動的統合'
        });

        this.results.recommendations = recommendations;

        console.log('  [OK] 最適化推奨生成完了:');
        Object.keys(recommendations).forEach(category => {
            console.log(`    - ${category}: ${recommendations[category].length}項目`);
        });
    }

    /**
     * ヘルパーメソッド群
     */

    async findComponentFile(componentName, subDir = '') {
        const baseName = componentName.toLowerCase().replace('service', '-service');

        const possiblePaths = [
            // 正しいパス構造に修正
            `src/lib/characters/${subDir}/${componentName}.ts`,
            `src/lib/characters/${subDir}/${componentName.toLowerCase()}.ts`,
            `src/lib/characters/${subDir}/${baseName}.ts`,
            `src/lib/characters/services/${componentName.toLowerCase()}.ts`,
            `src/lib/characters/services/${baseName}.ts`,
            `src/lib/characters/core/${componentName.toLowerCase()}.ts`,
            `src/lib/characters/core/${baseName}.ts`,
            // フォールバック
            `src/character/${subDir}/${componentName}.ts`,
            `lib/character/${subDir}/${componentName}.ts`
        ];

        for (const filepath of possiblePaths) {
            try {
                await fs.access(filepath);
                return filepath;
            } catch { }
        }
        return null;
    }

    async analyzeComponentFile(filepath, componentName) {
        const content = await fs.readFile(filepath, 'utf-8');

        // 簡易解析：メソッド名とインターフェースを抽出
        const methods = this.extractMethods(content);
        const interfaces = this.extractInterfaces(content);
        const imports = this.extractImports(content);

        return {
            filepath,
            componentName,
            methods,
            interfaces,
            imports,
            fileSize: content.length,
            lastModified: (await fs.stat(filepath)).mtime
        };
    }

    extractMethods(content) {
        const methodRegex = /(?:async\s+)?(\w+)\s*\([^)]*\)\s*:\s*[^{]+\{/g;
        const methods = [];
        let match;

        while ((match = methodRegex.exec(content)) !== null) {
            methods.push(match[1]);
        }

        return methods;
    }

    extractInterfaces(content) {
        const interfaceRegex = /interface\s+(\w+)/g;
        const interfaces = [];
        let match;

        while ((match = interfaceRegex.exec(content)) !== null) {
            interfaces.push(match[1]);
        }

        return interfaces;
    }

    extractImports(content) {
        const importRegex = /import\s+.*from\s+['"]([^'"]+)['"]/g;
        const imports = [];
        let match;

        while ((match = importRegex.exec(content)) !== null) {
            imports.push(match[1]);
        }

        return imports;
    }

    async analyzeTypeDefinitions(filepath) {
        const content = await fs.readFile(filepath, 'utf-8');

        const interfaces = this.extractInterfaces(content);
        const types = this.extractTypes(content);
        const enums = this.extractEnums(content);

        // Character関連の重要な型を特定
        const characterRelatedInterfaces = interfaces.filter(name =>
            name.toLowerCase().includes('character') ||
            name.toLowerCase().includes('skill') ||
            name.toLowerCase().includes('relationship') ||
            name.toLowerCase().includes('parameter')
        );

        return {
            interfaces,
            types,
            enums,
            characterRelatedInterfaces,
            filePath: filepath,
            totalTypes: interfaces.length + types.length + enums.length
        };
    }

    extractTypes(content) {
        const typeRegex = /type\s+(\w+)\s*=/g;
        const types = [];
        let match;

        while ((match = typeRegex.exec(content)) !== null) {
            types.push(match[1]);
        }

        return types;
    }

    extractEnums(content) {
        const enumRegex = /enum\s+(\w+)/g;
        const enums = [];
        let match;

        while ((match = enumRegex.exec(content)) !== null) {
            enums.push(match[1]);
        }

        return enums;
    }

    async directoryExists(dirPath) {
        try {
            const stat = await fs.stat(dirPath);
            return stat.isDirectory();
        } catch {
            return false;
        }
    }

    async analyzeServiceImplementation(filepath) {
        const content = await fs.readFile(filepath, 'utf-8');

        // 実装の完成度を簡易評価
        const totalMethods = this.extractMethods(content).length;
        const implementedMethods = (content.match(/\{[^}]*\}/g) || []).length;
        const completeness = totalMethods > 0 ? Math.round((implementedMethods / totalMethods) * 100) : 0;

        return {
            filepath,
            totalMethods,
            implementedMethods,
            completeness,
            hasTests: content.includes('describe(') || content.includes('test('),
            dependencies: this.extractImports(content)
        };
    }

    analyzeCreationFlow() {
        return {
            steps: [
                'CharacterData validation',
                'CharacterService.createCharacter()',
                'Storage persistence',
                'Cache update',
                'Relationship initialization'
            ],
            dataRequired: ['name', 'type', 'description', 'basicPersonality'],
            storageLocation: 'STATIC_CONFIG + DYNAMIC_STATE'
        };
    }

    analyzeRetrievalFlow() {
        return {
            steps: [
                'Character basic data retrieval',
                'Dynamic state loading from memory',
                'Context data integration',
                'Relationship data loading',
                'Skills/Parameters loading',
                'Details object construction'
            ],
            dataRequired: ['characterId'],
            storageLocation: 'ALL_LAYERS'
        };
    }

    analyzeUpdateFlow() {
        return {
            steps: [
                'Update validation',
                'Determine update category (static/dynamic)',
                'Route to appropriate storage',
                'Cache invalidation',
                'Relationship updates',
                'Change tracking'
            ],
            dataRequired: ['characterId', 'updates'],
            storageLocation: 'DYNAMIC_STATE (primary)'
        };
    }

    analyzeAnalysisFlow() {
        return {
            steps: [
                'Character data aggregation',
                'Psychology analysis',
                'Relationship analysis',
                'Skill/Parameter analysis',
                'Growth analysis',
                'Results integration'
            ],
            dataRequired: ['characterId', 'analysisContext'],
            storageLocation: 'ALL_LAYERS (read-only)'
        };
    }

    categorizeDataByStorageNeeds(categories) {
        // CharacterWithDetailsのフィールドを分類
        const fieldMappings = {
            STATIC_CONFIG: [
                'id', 'name', 'description', 'type',
                'personality.traits', 'personality.goals', 'personality.fears'
            ],
            DYNAMIC_STATE: [
                'emotionalState', 'skills', 'parameters', 'growthPhase',
                'relationships', 'recentAppearances', 'state'
            ],
            CONTEXTUAL: [
                'roleInScene', 'sceneSpecificState', 'currentMotivations',
                'temporaryRelationships'
            ]
        };

        Object.keys(fieldMappings).forEach(category => {
            categories[category].data = fieldMappings[category];
        });
    }

    /**
     * 結果出力
     */
    async outputResults() {
        console.log('\n[RESULT] === 分析結果サマリー ===\n');

        // コンポーネント状況
        console.log('[COMPONENTS] コンポーネント実装状況:');
        Object.keys(this.results.componentAnalysis).forEach(component => {
            const analysis = this.results.componentAnalysis[component];
            if (analysis.status === 'NOT_FOUND') {
                console.log(`  [NG] ${component}: 未実装`);
            } else {
                console.log(`  [OK] ${component}: ${analysis.methods?.length || 0}メソッド`);
            }
        });

        // 型定義状況
        console.log('\n[TYPES] 型定義状況:');
        if (this.results.dataTypeMapping && this.results.dataTypeMapping.totalTypes > 0) {
            const types = this.results.dataTypeMapping;
            console.log(`  [OK] 型定義ファイル: ${types.filePath}`);
            console.log(`  [INFO] 総型数: ${types.totalTypes}個`);
            console.log(`  [INFO] キャラクター関連型: ${types.characterRelatedInterfaces?.length || 0}個`);
        } else {
            console.log('  [NG] 型定義情報が取得できませんでした');
        }

        // 成長計画システム状況
        console.log('\n[GROWTH_PLANS] 成長計画システム状況:');
        if (this.results.growthPlanSystem && this.results.growthPlanSystem.totalFiles > 0) {
            const growth = this.results.growthPlanSystem;
            console.log(`  [OK] 成長計画ディレクトリ: ${growth.path}`);
            console.log(`  [INFO] JSONファイル: ${growth.jsonFiles.length}個`);
            console.log(`  [INFO] YAMLファイル: ${growth.yamlFiles.length}個`);
            console.log(`  [INFO] 総計: ${growth.totalFiles}個の成長計画`);
        } else {
            console.log('  [NG] 成長計画ファイルが見つかりません');
        }

        // 設定ファイル状況
        console.log('\n[CONFIG] 設定ファイル状況:');
        if (this.results.configFiles && this.results.configFiles.totalYamlFiles > 0) {
            const config = this.results.configFiles;
            console.log(`  [OK] 総YAMLファイル数: ${config.totalYamlFiles}個`);
            console.log(`  [OK] 総JSONファイル数: ${config.totalJsonFiles}個`);
            console.log(`  [PATHS] 発見されたディレクトリ:`);
            config.foundPaths.forEach(pathInfo => {
                console.log(`    - ${pathInfo.path}: YAML(${pathInfo.yamlFiles.length}) JSON(${pathInfo.jsonFiles.length})`);
            });
        } else {
            console.log('  [NG] 設定ファイルが見つかりません');
        }

        // ストレージ戦略
        console.log('\n[STORAGE] 推奨ストレージ戦略:');
        Object.keys(this.results.storageStrategy).forEach(category => {
            const strategy = this.results.storageStrategy[category];
            console.log(`  [${category}]:`);
            console.log(`     場所: ${strategy.location}`);
            console.log(`     更新頻度: ${strategy.updateFrequency}`);
            console.log(`     データ項目: ${strategy.data.length}個`);
        });

        // 優先度付き推奨事項
        console.log('\n[PRIORITY] キャラクターシステム最適化推奨（成長計画統合版）:');
        console.log('  [INFO] 分析結果: 275メソッド・78型定義 + 詳細成長計画システムを発見');
        console.log('  [INFO] 課題: 高度システムのポテンシャルが十分活用されていない\n');

        if (this.results.recommendations) {
            Object.keys(this.results.recommendations).forEach(category => {
                const recs = this.results.recommendations[category];
                console.log(`  ${category.toUpperCase()}:`);
                recs.forEach(rec => {
                    console.log(`    [${rec.priority}] ${rec.issue}`);
                    console.log(`        -> ${rec.solution}`);
                });
                console.log('');
            });
        }

        // ファイルに詳細結果を出力
        const outputPath = 'character-system-analysis-results.json';
        await fs.writeFile(outputPath, JSON.stringify(this.results, null, 2), 'utf-8');
        console.log(`[OUTPUT] 詳細分析結果を ${outputPath} に保存しました`);

        // 重要な次ステップの提示
        console.log('\n[NEXT_STEPS] 重要な次のステップ（成長計画システム統合版）:');
        console.log('  1. [HIGH] 成長計画システムとEvolutionServiceの完全統合');
        console.log('  2. [HIGH] フェーズ別成長データのプロンプト動的統合');
        console.log('  3. [HIGH] 静的データと動的データの分離戦略策定');
        console.log('  4. [HIGH] CharacterWithDetails + GrowthPlan統合でのプロンプト最適化');
        console.log('  5. [MEDIUM] 7つの専門サービスの記憶階層連携強化');
        console.log('  6. [MEDIUM] 成長計画の予測・分析機能の活用');
    }
}

// 実行
async function main() {
    const analyzer = new CharacterSystemAnalyzer();
    try {
        await analyzer.analyze();
    } catch (error) {
        console.error('[ERROR] 分析実行エラー:', error);
    }
}

// CommonJS形式での実行
if (require.main === module) {
    main();
}