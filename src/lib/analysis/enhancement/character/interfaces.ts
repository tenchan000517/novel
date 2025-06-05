// src\lib\analysis\enhancement\character\interfaces.ts
/**
 * @fileoverview キャラクター深化システムのコアインターフェース
 * @description
 * キャラクター深化サービスが実装すべきインターフェース定義と関連する型定義を提供します。
 */

import { Character, CharacterPsychology } from '@/lib/characters/core/types';

/**
 * キャラクター深化推奨の型定義
 */
export interface DepthRecommendation {
    type: 'consistency' | 'arc' | 'motivation' | 'relationship' | 'contrast' | 'genre'; // 推奨タイプ
    title: string;       // 推奨タイトル
    description: string; // 詳細説明
    implementation: string; // 実装方法のヒント
    priority: number;    // 優先度 (0-1)
}

/**
 * キャラクターアーク推奨の型定義
 */
export interface CharacterArcRecommendation {
    title: string;       // 推奨タイトル
    description: string; // 詳細説明
    suggestion: string;  // 具体的な提案
    arcPhase: string;    // アークフェーズ
    importance: number;  // 重要度 (0-1)
}

/**
 * 一貫性分析結果の型定義
 */
export interface ConsistencyAnalysis {
    overallConsistency: number; // 全体的な一貫性スコア (0-1)
    issues: Array<{            // 問題点
        aspect: string;        // 問題のある側面
        description: string;   // 問題の説明
    }>;
    strengths: Array<{         // 強み
        aspect: string;        // 強みのある側面
        description: string;   // 強みの説明
    }>;
    recommendations: Array<{   // 推奨事項
        title: string;         // 推奨タイトル
        description: string;   // 詳細説明
        implementation: string; // 実装方法
        severity: string;      // 重要度 ('high', 'medium', 'low')
    }>;
}

/**
 * 動機強化推奨の型定義
 */
export interface MotivationEnhancement {
    title: string;       // 推奨タイトル
    description: string; // 詳細説明
    implementation: string; // 実装方法
    priority: number;    // 優先度 (0-1)
}

/**
 * 関係性ダイナミクス推奨の型定義
 */
export interface RelationshipDynamicRecommendation {
    title: string;       // 推奨タイトル
    description: string; // 詳細説明
    implementation: string; // 実装方法
    priority: number;    // 優先度 (0-1)
    targetCharacterId: string | null; // 対象キャラクターID
}

/**
 * コントラスト推奨の型定義
 */
export interface ContrastRecommendation {
    title: string;       // 推奨タイトル
    description: string; // 詳細説明
    implementation: string; // 実装方法
    priority: number;    // 優先度 (0-1)
}

/**
 * 深化プロンプトの型定義
 */
export interface CharacterDepthPrompt {
    characterId: string;      // キャラクターID
    characterName: string;    // キャラクター名
    focusAreas: string;       // 焦点を当てるべき領域
    implementationSuggestions: string; // 実装提案
    psychologicalInsight: string; // 心理的洞察
}

/**
 * キャラクター深化サービスのインターフェース
 */
export interface ICharacterDepthService {
    /**
     * キャラクター深化推奨の生成
     * キャラクターの心理分析に基づく深化推奨を生成します
     * 
     * @param character キャラクター
     * @param psychology キャラクター心理情報
     * @param chapterNumber 章番号（コンテキスト用）
     * @returns 深化推奨の配列
     */
    generateDepthRecommendations(
        character: Character, 
        psychology: CharacterPsychology, 
        chapterNumber: number
    ): Promise<DepthRecommendation[]>;
    
    /**
     * キャラクターの一貫性分析
     * 心理プロファイルや履歴に基づいて一貫性を評価します
     * 
     * @param character キャラクター
     * @param psychology 心理情報
     * @param chapterNumber 現在の章番号
     * @returns 一貫性分析結果
     */
    analyzeCharacterConsistency(
        character: Character, 
        psychology: CharacterPsychology,
        chapterNumber: number
    ): Promise<ConsistencyAnalysis>;
    
    /**
     * キャラクターの動機付け強化推奨
     * キャラクターの動機の深化と説得力向上を図る
     * 
     * @param character キャラクター
     * @param psychology 心理情報
     * @returns 動機強化推奨
     */
    enhanceCharacterMotivations(
        character: Character, 
        psychology: CharacterPsychology
    ): Promise<MotivationEnhancement[]>;
    
    /**
     * キャラクターアークの最適化推奨
     * 現在のストーリー位置でのキャラクター成長を最適化
     * 
     * @param character キャラクター
     * @param psychology 心理情報
     * @param chapterNumber 章番号
     * @returns アーク最適化推奨
     */
    optimizeCharacterArcs(
        character: Character, 
        psychology: CharacterPsychology,
        chapterNumber: number
    ): Promise<CharacterArcRecommendation[]>;
    
    /**
     * 関係性ダイナミクス推奨の生成
     * キャラクター間の関係性を深化・最適化する推奨
     * 
     * @param character キャラクター
     * @param chapterNumber 章番号
     * @returns 関係性推奨
     */
    suggestRelationshipDynamics(
        character: Character,
        chapterNumber: number
    ): Promise<RelationshipDynamicRecommendation[]>;
    
    /**
     * コントラスト推奨の生成
     * キャラクターの独自性を際立たせる推奨
     * 
     * @param character キャラクター
     * @param chapterNumber 章番号
     * @returns コントラスト推奨
     */
    generateContrastRecommendations(
        character: Character,
        chapterNumber: number
    ): Promise<ContrastRecommendation[]>;
    
    /**
     * 複数キャラクターの深化推奨生成
     * 同一章に登場する複数キャラクターの深化推奨
     * 
     * @param characters キャラクター配列
     * @param chapterNumber 章番号
     * @param limit 最大推奨数
     * @returns キャラクターIDごとの深化推奨
     */
    generateMultipleCharacterRecommendations(
        characters: Character[],
        chapterNumber: number,
        limit?: number
    ): Promise<{[characterId: string]: DepthRecommendation[]}>;
    
    /**
     * ジャンルに基づくキャラクター特性推奨
     * ジャンルの期待に沿ったキャラクター特性推奨
     * 
     * @param character キャラクター
     * @param genre ジャンル
     * @returns 深化推奨
     */
    suggestGenreBasedTraits(
        character: Character,
        genre: string
    ): Promise<DepthRecommendation[]>;
    
    /**
     * チャプター生成用の深化プロンプト生成
     * 生成コンテキストに組み込むためのプロンプトを作成
     * 
     * @param characterId キャラクターID
     * @param chapterNumber 章番号
     * @returns 深化プロンプト
     */
    generateDepthPromptForChapter(
        characterId: string,
        chapterNumber: number
    ): Promise<CharacterDepthPrompt | null>;
    
    /**
     * 章番号に最適なキャラクター深化対象の推奨
     * 現在の章に最も深化が必要なキャラクターを推奨
     * 
     * @param chapterNumber 章番号
     * @param characterCount 推奨するキャラクター数
     * @returns 推奨キャラクターID配列
     */
    recommendFocusCharactersForChapter(
        chapterNumber: number,
        characterCount?: number
    ): Promise<string[]>;
}