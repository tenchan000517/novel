// src/app/api/generation/chapter/debug/chapter-generation/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';
import { withTimeout } from '@/lib/utils/promise-utils';
import { AnalysisCoordinator } from '@/lib/analysis/coordinators/analysis-coordinator';
import { GeminiAdapter } from '@/lib/analysis/adapters/gemini-adapter';
import { memoryManager } from '@/lib/memory/manager';
import { storageProvider } from '@/lib/storage';
import { GeminiClient } from '@/lib/generation/gemini-client';
import { ContentAnalysisManager } from '@/lib/analysis/content-analysis-manager';
import { PreGenerationPipeline } from '@/lib/analysis/pipelines/pre-generation-pipeline';
import { PostGenerationPipeline } from '@/lib/analysis/pipelines/post-generation-pipeline';
import { OptimizationCoordinator } from '@/lib/analysis/coordinators/optimization-coordinator';

interface DebugResponse {
    success: boolean;
    step: string;
    duration: number;
    result?: any;
    error?: string;
    details?: any;
}

interface DebugStepResult {
    stepName: string;
    success: boolean;
    duration: number;
    result?: any;
    error?: string;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        
        const {
            action = 'full_flow',
            chapterNumber = 3,
            timeout = 30000,
            enableParallel = false
        } = body;

        logger.info('Debug API called', { action, chapterNumber, timeout, enableParallel });

        switch (action) {
            case 'test_gemini_connection':
                return await testGeminiConnection(timeout);
            
            case 'test_individual_analysis':
                return await testIndividualAnalysis(chapterNumber, timeout);
            
            case 'test_analysis_coordinator':
                return await testAnalysisCoordinator(chapterNumber, timeout, enableParallel);
            
            case 'test_pre_generation_pipeline':
                return await testPreGenerationPipeline(chapterNumber, timeout);
            
            case 'full_flow':
                return await testFullFlow(chapterNumber, timeout);
            
            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        logger.error('Debug API error', {
            error: error instanceof Error ? error.message : String(error)
        });
        
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    // ブラウザで直接テストできるようにGETメソッドも提供
    return NextResponse.json({
        message: 'Chapter Generation Debug API',
        usage: {
            method: 'POST',
            actions: [
                'test_gemini_connection',
                'test_individual_analysis',
                'test_analysis_coordinator',
                'test_pre_generation_pipeline',
                'full_flow'
            ],
            parameters: {
                action: 'string (required)',
                chapterNumber: 'number (default: 3)',
                timeout: 'number (default: 30000)',
                enableParallel: 'boolean (default: false)'
            },
            examples: [
                {
                    action: 'test_gemini_connection',
                    description: 'Test basic Gemini API connectivity'
                },
                {
                    action: 'test_individual_analysis',
                    description: 'Test each analysis service individually'
                },
                {
                    action: 'test_analysis_coordinator',
                    enableParallel: true,
                    description: 'Test AnalysisCoordinator with parallel processing'
                }
            ]
        }
    });
}

/**
 * Gemini接続テスト
 */
async function testGeminiConnection(timeout: number) {
    const steps: DebugStepResult[] = [];
    
    try {
        // Step 1: GeminiClient初期化
        const step1Start = Date.now();
        try {
            const geminiClient = new GeminiClient();
            await withTimeout(
                geminiClient.validateApiKey(),
                timeout,
                'Gemini API Key validation'
            );
            
            steps.push({
                stepName: 'gemini_client_init',
                success: true,
                duration: Date.now() - step1Start,
                result: 'API key valid'
            });
        } catch (error) {
            steps.push({
                stepName: 'gemini_client_init',
                success: false,
                duration: Date.now() - step1Start,
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }

        // Step 2: 簡単なテキスト生成
        const step2Start = Date.now();
        try {
            const geminiClient = new GeminiClient();
            const result = await withTimeout(
                geminiClient.generateText('Hello, this is a test. Please respond with "OK".', {
                    purpose: 'analysis',
                    targetLength: 50,
                    temperature: 0.1
                }),
                timeout,
                'Simple text generation test'
            );
            
            steps.push({
                stepName: 'simple_generation_test',
                success: true,
                duration: Date.now() - step2Start,
                result: result.substring(0, 100) + (result.length > 100 ? '...' : '')
            });
        } catch (error) {
            steps.push({
                stepName: 'simple_generation_test',
                success: false,
                duration: Date.now() - step2Start,
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }

        return NextResponse.json({
            success: true,
            step: 'gemini_connection_test',
            steps,
            totalDuration: steps.reduce((sum, step) => sum + step.duration, 0)
        });

    } catch (error) {
        return NextResponse.json({
            success: false,
            step: 'gemini_connection_test',
            steps,
            error: error instanceof Error ? error.message : String(error)
        });
    }
}

/**
 * 個別分析テスト
 */
async function testIndividualAnalysis(chapterNumber: number, timeout: number) {
    const steps: DebugStepResult[] = [];
    
    // テスト用のサンプルコンテンツ
    const sampleContent = `第${chapterNumber - 1}章のサンプルテキストです。主人公は困難に直面しながらも、仲間と協力して問題を解決しようとしています。この章では新しいキャラクターも登場し、物語に深みが加わりました。`;
    
    const sampleContext = {
        chapterNumber: chapterNumber - 1,
        characters: [],
        tension: 0.5,
        pacing: 0.5,
        genre: 'general'
    };

    try {
        // 共通の初期化
        const geminiClient = new GeminiClient();
        const geminiAdapter = new GeminiAdapter(geminiClient);
        
        // 1. ChapterAnalysis単体テスト
        await testSingleAnalysis(
            steps,
            'chapter_analysis',
            timeout,
            async () => {
                const { ChapterAnalysisService } = require('@/lib/analysis/services/chapter/chapter-analysis-service');
                const service = new ChapterAnalysisService(geminiAdapter);
                
                if (typeof service.analyzeForIntegration === 'function') {
                    return await service.analyzeForIntegration(sampleContent, chapterNumber - 1, sampleContext, true);
                } else if (typeof service.analyzeChapter === 'function') {
                    return await service.analyzeChapter(sampleContent, chapterNumber - 1, sampleContext);
                } else {
                    throw new Error('No suitable analysis method found');
                }
            }
        );

        // 2. ThemeAnalysis単体テスト
        await testSingleAnalysis(
            steps,
            'theme_analysis',
            timeout,
            async () => {
                const { ThemeAnalysisService } = require('@/lib/analysis/services/theme/theme-analysis-service');
                const service = new ThemeAnalysisService(geminiAdapter, memoryManager, storageProvider);
                return await service.analyzeThemeResonance(sampleContent, ['成長', '友情']);
            }
        );

        // 3. StyleAnalysis単体テスト
        await testSingleAnalysis(
            steps,
            'style_analysis',
            timeout,
            async () => {
                const { StyleAnalysisService } = require('@/lib/analysis/services/style/style-analysis-service');
                const service = new StyleAnalysisService(geminiAdapter, storageProvider);
                await service.initialize();
                return await service.analyzeStyle(sampleContent);
            }
        );

        // 4. CharacterAnalysis単体テスト
        await testSingleAnalysis(
            steps,
            'character_analysis',
            timeout,
            async () => {
                const { CharacterAnalysisService } = require('@/lib/analysis/services/character/character-analysis-service');
                const service = new CharacterAnalysisService(geminiAdapter);
                return await service.analyzeCharacter(sampleContent, chapterNumber - 1, sampleContext);
            }
        );

        // 5. ReaderExperience単体テスト
        await testSingleAnalysis(
            steps,
            'reader_experience_analysis',
            timeout,
            async () => {
                const { ReaderExperienceAnalyzer } = require('@/lib/analysis/services/reader/reader-experience-analysis-service');
                const service = new ReaderExperienceAnalyzer(geminiClient);
                
                const mockChapter = {
                    id: `chapter-${chapterNumber - 1}`,
                    chapterNumber: chapterNumber - 1,
                    title: `第${chapterNumber - 1}章`,
                    content: sampleContent,
                    scenes: [],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    metadata: { wordCount: sampleContent.length }
                };
                
                return await service.analyzeReaderExperience(mockChapter, []);
            }
        );

        return NextResponse.json({
            success: true,
            step: 'individual_analysis_test',
            steps,
            summary: {
                total: steps.length,
                successful: steps.filter(s => s.success).length,
                failed: steps.filter(s => !s.success).length,
                totalDuration: steps.reduce((sum, step) => sum + step.duration, 0)
            }
        });

    } catch (error) {
        return NextResponse.json({
            success: false,
            step: 'individual_analysis_test',
            steps,
            error: error instanceof Error ? error.message : String(error)
        });
    }
}

/**
 * AnalysisCoordinatorテスト
 */
async function testAnalysisCoordinator(
    chapterNumber: number, 
    timeout: number, 
    enableParallel: boolean
) {
    const steps: DebugStepResult[] = [];
    
    const sampleContent = `第${chapterNumber - 1}章のサンプルテキストです。主人公は困難に直面しながらも、仲間と協力して問題を解決しようとしています。`;
    
    const sampleContext = {
        chapterNumber: chapterNumber - 1,
        characters: [],
        tension: 0.5,
        pacing: 0.5,
        genre: 'general'
    };

    try {
        // AnalysisCoordinator初期化
        const step1Start = Date.now();
        try {
            const geminiClient = new GeminiClient();
            const geminiAdapter = new GeminiAdapter(geminiClient);
            
            const analysisCoordinator = new AnalysisCoordinator(
                geminiAdapter,
                memoryManager,
                storageProvider,
                {
                    enableParallelProcessing: enableParallel,
                    enableDetailedLogging: true,
                    enableCache: false // デバッグではキャッシュを無効化
                }
            );

            steps.push({
                stepName: 'analysis_coordinator_init',
                success: true,
                duration: Date.now() - step1Start,
                result: `Parallel: ${enableParallel}`
            });

            // 分析実行
            const analysisStart = Date.now();
            const analysisResult = await withTimeout(
                analysisCoordinator.analyzeChapter(sampleContent, chapterNumber - 1, sampleContext),
                timeout,
                'AnalysisCoordinator.analyzeChapter'
            );

            steps.push({
                stepName: 'comprehensive_analysis',
                success: true,
                duration: Date.now() - analysisStart,
                result: {
                    servicesUsed: analysisResult.analysisMetadata.servicesUsed,
                    processingTime: analysisResult.analysisMetadata.processingTime,
                    cacheHitRate: analysisResult.analysisMetadata.cacheHitRate
                }
            });

            return NextResponse.json({
                success: true,
                step: 'analysis_coordinator_test',
                steps,
                analysisResult: {
                    servicesUsed: analysisResult.analysisMetadata.servicesUsed,
                    suggestionsCount: analysisResult.integratedSuggestions.length,
                    qualityScore: analysisResult.qualityMetrics.overall
                }
            });

        } catch (error) {
            steps.push({
                stepName: 'analysis_coordinator_execution',
                success: false,
                duration: Date.now() - step1Start,
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }

    } catch (error) {
        return NextResponse.json({
            success: false,
            step: 'analysis_coordinator_test',
            steps,
            error: error instanceof Error ? error.message : String(error)
        });
    }
}

/**
 * PreGenerationPipelineテスト
 */
async function testPreGenerationPipeline(chapterNumber: number, timeout: number) {
    const steps: DebugStepResult[] = [];
    
    const sampleContent = `第${chapterNumber - 1}章のサンプルテキストです。主人公は困難に直面しながらも、仲間と協力して問題を解決しようとしています。`;

    try {
        // パイプライン初期化
        const step1Start = Date.now();
        try {
            const geminiClient = new GeminiClient();
            const geminiAdapter = new GeminiAdapter(geminiClient);
            
            const analysisCoordinator = new AnalysisCoordinator(
                geminiAdapter,
                memoryManager,
                storageProvider,
                { enableCache: false }
            );
            
            const optimizationCoordinator = new OptimizationCoordinator(
                geminiAdapter,
                null
            );
            
            const preGenerationPipeline = new PreGenerationPipeline(
                analysisCoordinator,
                optimizationCoordinator
            );

            steps.push({
                stepName: 'pipeline_init',
                success: true,
                duration: Date.now() - step1Start,
                result: 'Pipeline initialized'
            });

            // パイプライン実行
            const pipelineStart = Date.now();
            const pipelineResult = await withTimeout(
                preGenerationPipeline.execute(chapterNumber, sampleContent),
                timeout,
                'PreGenerationPipeline.execute'
            );

            steps.push({
                stepName: 'pipeline_execution',
                success: true,
                duration: Date.now() - pipelineStart,
                result: {
                    improvementSuggestionsCount: pipelineResult.improvementSuggestions.length,
                    themeEnhancementsCount: pipelineResult.themeEnhancements.length,
                    hasStyleGuidance: !!pipelineResult.styleGuidance,
                    hasLiteraryInspirations: !!pipelineResult.literaryInspirations
                }
            });

            return NextResponse.json({
                success: true,
                step: 'pre_generation_pipeline_test',
                steps,
                pipelineResult: {
                    improvementSuggestionsCount: pipelineResult.improvementSuggestions.length,
                    themeEnhancementsCount: pipelineResult.themeEnhancements.length,
                    hasStyleGuidance: !!pipelineResult.styleGuidance
                }
            });

        } catch (error) {
            steps.push({
                stepName: 'pipeline_execution',
                success: false,
                duration: Date.now() - step1Start,
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }

    } catch (error) {
        return NextResponse.json({
            success: false,
            step: 'pre_generation_pipeline_test',
            steps,
            error: error instanceof Error ? error.message : String(error)
        });
    }
}

/**
 * フルフローテスト
 */
async function testFullFlow(chapterNumber: number, timeout: number) {
    const steps: DebugStepResult[] = [];
    
    try {
        // 1. Gemini接続テスト
        await testStepWithTimeout(
            steps,
            'gemini_connection',
            timeout / 6,
            async () => {
                const geminiClient = new GeminiClient();
                await geminiClient.validateApiKey();
                return 'Connection OK';
            }
        );

        // 2. ContentAnalysisManager初期化
        await testStepWithTimeout(
            steps,
            'content_analysis_manager_init',
            timeout / 6,
            async () => {
                const geminiClient = new GeminiClient();
                const geminiAdapter = new GeminiAdapter(geminiClient);
                const analysisCoordinator = new AnalysisCoordinator(geminiAdapter, memoryManager, storageProvider);
                const optimizationCoordinator = new OptimizationCoordinator(geminiAdapter, null);
                const preGenerationPipeline = new PreGenerationPipeline(analysisCoordinator, optimizationCoordinator);
                const postGenerationPipeline = new PostGenerationPipeline(analysisCoordinator, optimizationCoordinator);
                
                const contentAnalysisManager = new ContentAnalysisManager(
                    preGenerationPipeline,
                    postGenerationPipeline
                );
                
                return 'ContentAnalysisManager initialized';
            }
        );

        // 3. 前章コンテンツ準備
        const sampleContent = `第${chapterNumber - 1}章のサンプルテキストです。`;
        
        // 4. prepareChapterGeneration実行
        await testStepWithTimeout(
            steps,
            'prepare_chapter_generation',
            timeout / 2,
            async () => {
                const geminiClient = new GeminiClient();
                const geminiAdapter = new GeminiAdapter(geminiClient);
                const analysisCoordinator = new AnalysisCoordinator(geminiAdapter, memoryManager, storageProvider);
                const optimizationCoordinator = new OptimizationCoordinator(geminiAdapter, null);
                const preGenerationPipeline = new PreGenerationPipeline(analysisCoordinator, optimizationCoordinator);
                const postGenerationPipeline = new PostGenerationPipeline(analysisCoordinator, optimizationCoordinator);
                
                const contentAnalysisManager = new ContentAnalysisManager(
                    preGenerationPipeline,
                    postGenerationPipeline
                );
                
                const result = await contentAnalysisManager.prepareChapterGeneration(chapterNumber, sampleContent);
                
                return {
                    success: result.success,
                    enhancementsCount: result.enhancements.improvementSuggestions.length,
                    processingTime: result.processingTime
                };
            }
        );

        return NextResponse.json({
            success: true,
            step: 'full_flow_test',
            steps,
            summary: {
                total: steps.length,
                successful: steps.filter(s => s.success).length,
                failed: steps.filter(s => !s.success).length,
                totalDuration: steps.reduce((sum, step) => sum + step.duration, 0)
            }
        });

    } catch (error) {
        return NextResponse.json({
            success: false,
            step: 'full_flow_test',
            steps,
            error: error instanceof Error ? error.message : String(error)
        });
    }
}

/**
 * 単一分析テストヘルパー
 */
async function testSingleAnalysis(
    steps: DebugStepResult[],
    stepName: string,
    timeout: number,
    analysisFunction: () => Promise<any>
) {
    const start = Date.now();
    try {
        const result = await withTimeout(
            analysisFunction(),
            timeout,
            `${stepName} analysis`
        );
        
        steps.push({
            stepName,
            success: true,
            duration: Date.now() - start,
            result: typeof result === 'object' ? Object.keys(result) : result
        });
    } catch (error) {
        steps.push({
            stepName,
            success: false,
            duration: Date.now() - start,
            error: error instanceof Error ? error.message : String(error)
        });
    }
}

/**
 * タイムアウト付きステップテストヘルパー
 */
async function testStepWithTimeout(
    steps: DebugStepResult[],
    stepName: string,
    timeout: number,
    stepFunction: () => Promise<any>
) {
    const start = Date.now();
    try {
        const result = await withTimeout(
            stepFunction(),
            timeout,
            stepName
        );
        
        steps.push({
            stepName,
            success: true,
            duration: Date.now() - start,
            result
        });
    } catch (error) {
        steps.push({
            stepName,
            success: false,
            duration: Date.now() - start,
            error: error instanceof Error ? error.message : String(error)
        });
        throw error;
    }
}