// src/lib/editor/intervention-system.ts
import { InterpretedCommand, InterventionRequest, InterventionResponse } from '@/types/editor';
import { logError, logWarn } from '@/lib/utils/error-handler';
import { generateId } from '@/lib/utils/id-generator';

/**
 * 介入ハンドラインターフェース
 */
interface InterventionHandler {
  /** ハンドラ名 */
  name: string;
  
  /** サポートするインテント */
  supportedIntents: string[];
  
  /** 介入実行 */
  execute(command: InterpretedCommand, context?: Record<string, any>): Promise<HandlerResponse>;
}

/**
 * ハンドラレスポンス
 */
interface HandlerResponse {
  /** 成功フラグ */
  success: boolean;
  
  /** 実行されたアクション */
  actions: { type: string; description: string }[];
  
  /** 影響を受けたコンポーネント */
  affectedComponents: { component: string; impact: string }[];
  
  /** 応答メッセージ */
  message: string;
  
  /** デバッグ情報 */
  debug?: Record<string, any>;
}

/**
 * 介入記録
 */
interface InterventionRecord {
  /** 介入ID */
  id: string;
  
  /** タイムスタンプ */
  timestamp: Date;
  
  /** 介入リクエスト */
  request: InterventionRequest;
  
  /** 介入レスポンス */
  response: InterventionResponse;
  
  /** 適用コンテキスト */
  context?: Record<string, any>;
}

/**
 * 編集者の介入を処理するシステム
 */
export class InterventionSystem {
  private handlers: Map<string, InterventionHandler> = new Map();
  private interventionHistory: InterventionRecord[] = [];
  
  constructor() {
    // ハンドラーを登録
    this.registerDefaultHandlers();
  }
  
  /**
   * 介入を実行
   * @param request 介入リクエスト
   * @param context コンテキスト情報
   * @returns 介入レスポンス
   */
  async executeIntervention(
    request: InterventionRequest,
    context?: Record<string, any>
  ): Promise<InterventionResponse> {
    try {
      console.log(`Executing intervention: ${request.type} / ${request.target}`);
      
      // コマンドを解釈
      const command = await this.interpretCommand(request.command, request.type, request.parameters);
      
      // 適切なハンドラを取得
      const handler = this.getHandlerForCommand(command);
      
      if (!handler) {
        return this.createErrorResponse(`No handler found for command type: ${command.type}`);
      }
      
      // ハンドラを実行
      const result = await handler.execute(command, context);
      
      // レスポンスを作成
      const response: InterventionResponse = {
        success: result.success,
        actionsTaken: result.actions,
        affectedComponents: result.affectedComponents,
        feedback: {
          message: result.message,
          suggestions: this.generateSuggestions(command, result)
        }
      };
      
      // 履歴に記録
      this.recordIntervention(request, response, context);
      
      return response;
    } catch (error) {
      logError(error as Error, 
        { request, context }, 
        'Error executing intervention'
      );
      
      return this.createErrorResponse((error as Error).message);
    }
  }
  
  /**
   * コマンドをバッチ実行
   * @param commands コマンドの配列
   * @param context コンテキスト情報
   * @returns 実行結果の配列
   */
  async executeBatch(
    commands: InterventionRequest[],
    context?: Record<string, any>
  ): Promise<InterventionResponse[]> {
    const results: InterventionResponse[] = [];
    
    for (const command of commands) {
      const result = await this.executeIntervention(command, context);
      results.push(result);
      
      // 失敗した場合は処理を中断
      if (!result.success) {
        break;
      }
    }
    
    return results;
  }
  
  /**
   * カスタムハンドラを登録
   * @param handler 介入ハンドラ
   */
  registerHandler(handler: InterventionHandler): void {
    this.handlers.set(handler.name, handler);
    console.log(`Registered intervention handler: ${handler.name}`);
  }
  
  /**
   * 介入履歴を取得
   * @param limit 取得数
   * @param types フィルタするタイプ
   * @returns 介入履歴
   */
  getInterventionHistory(limit?: number, types?: string[]): InterventionRecord[] {
    let history = [...this.interventionHistory];
    
    // タイプでフィルタ
    if (types && types.length > 0) {
      history = history.filter(record => types.includes(record.request.type));
    }
    
    // 最新順に並べ替え
    history.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    // 件数制限
    if (limit && limit > 0) {
      history = history.slice(0, limit);
    }
    
    return history;
  }
  
  /**
   * 介入の影響を評価
   * @param recordId 介入記録ID
   * @returns 影響評価
   */
  async evaluateImpact(recordId: string): Promise<any> {
    const record = this.interventionHistory.find(r => r.id === recordId);
    
    if (!record) {
      throw new Error(`Intervention record not found: ${recordId}`);
    }
    
    // 実際の実装では影響を評価するロジックを実装
    return {
      effectiveness: Math.random(), // 0-1のスコア
      sideEffects: [],
      recommendations: []
    };
  }
  
  /**
   * デフォルトハンドラを登録
   */
  private registerDefaultHandlers(): void {
    // キャラクターハンドラ
    this.registerHandler({
      name: 'CHARACTER',
      supportedIntents: ['ADD_CHARACTER', 'MODIFY_CHARACTER', 'REMOVE_CHARACTER'],
      execute: async (command, context) => {
        // 実際の実装ではキャラクター操作の処理を実装
        return {
          success: true,
          actions: [
            { type: command.action, description: `${command.action} operation performed on character` }
          ],
          affectedComponents: [
            { component: 'CHARACTER_MANAGER', impact: 'MODIFIED' }
          ],
          message: `Successfully executed ${command.action} on character`
        };
      }
    });
    
    // プロットハンドラ
    this.registerHandler({
      name: 'PLOT',
      supportedIntents: ['CHANGE_PLOT', 'ADD_EVENT', 'REMOVE_EVENT'],
      execute: async (command, context) => {
        // 実際の実装ではプロット操作の処理を実装
        return {
          success: true,
          actions: [
            { type: command.action, description: `${command.action} operation performed on plot` }
          ],
          affectedComponents: [
            { component: 'PLOT_MANAGER', impact: 'MODIFIED' }
          ],
          message: `Successfully executed ${command.action} on plot`
        };
      }
    });
    
    // メモリハンドラ
    this.registerHandler({
      name: 'MEMORY',
      supportedIntents: ['ADD_MEMORY', 'MODIFY_MEMORY', 'CLEAR_MEMORY'],
      execute: async (command, context) => {
        // 実際の実装ではメモリ操作の処理を実装
        return {
          success: true,
          actions: [
            { type: command.action, description: `${command.action} operation performed on memory` }
          ],
          affectedComponents: [
            { component: 'MEMORY_MANAGER', impact: 'MODIFIED' }
          ],
          message: `Successfully executed ${command.action} on memory`
        };
      }
    });
    
    // 生成ハンドラ
    this.registerHandler({
      name: 'GENERATION',
      supportedIntents: ['GENERATE_CONTENT', 'MODIFY_GENERATION_PARAMS'],
      execute: async (command, context) => {
        // 実際の実装では生成操作の処理を実装
        return {
          success: true,
          actions: [
            { type: command.action, description: `${command.action} operation performed on generation` }
          ],
          affectedComponents: [
            { component: 'GENERATION_MANAGER', impact: 'MODIFIED' }
          ],
          message: `Successfully executed ${command.action} on generation`
        };
      }
    });
    
    // シーンハンドラ
    this.registerHandler({
      name: 'SCENE',
      supportedIntents: ['ADD_SCENE', 'MODIFY_SCENE', 'REMOVE_SCENE'],
      execute: async (command, context) => {
        // 実際の実装ではシーン操作の処理を実装
        return {
          success: true,
          actions: [
            { type: command.action, description: `${command.action} operation performed on scene` }
          ],
          affectedComponents: [
            { component: 'SCENE_MANAGER', impact: 'MODIFIED' }
          ],
          message: `Successfully executed ${command.action} on scene`
        };
      }
    });
    
    // システムハンドラ
    this.registerHandler({
      name: 'SYSTEM',
      supportedIntents: ['CHANGE_SETTINGS', 'EXPORT_DATA', 'IMPORT_DATA'],
      execute: async (command, context) => {
        // 実際の実装ではシステム操作の処理を実装
        return {
          success: true,
          actions: [
            { type: command.action, description: `${command.action} operation performed on system` }
          ],
          affectedComponents: [
            { component: 'SYSTEM_MANAGER', impact: 'MODIFIED' }
          ],
          message: `Successfully executed ${command.action} on system`
        };
      }
    });
  }
  
  /**
   * コマンドを解釈
   * @param command 自然言語コマンド
   * @param type 介入タイプ
   * @param parameters 追加パラメータ
   * @returns 解釈されたコマンド
   */
  private async interpretCommand(
    command: string,
    type: string,
    parameters?: Record<string, unknown>
  ): Promise<InterpretedCommand> {
    // 実際の実装ではNLPを使用してコマンドを解釈
    
    // シンプルな解釈ロジック
    const tokens = command.toLowerCase().split(/\s+/);
    let action = '';
    
    // アクションを推測
    if (tokens.includes('追加') || tokens.includes('作成') || tokens.includes('add')) {
      action = 'ADD';
    } else if (tokens.includes('変更') || tokens.includes('修正') || tokens.includes('modify')) {
      action = 'MODIFY';
    } else if (tokens.includes('削除') || tokens.includes('remove')) {
      action = 'REMOVE';
    } else if (tokens.includes('生成') || tokens.includes('generate')) {
      action = 'GENERATE';
    } else if (tokens.includes('設定') || tokens.includes('set')) {
      action = 'SET';
    } else {
      // デフォルトアクション
      action = 'MODIFY';
    }
    
    // パラメータを抽出 (実際の実装ではより高度な方法で抽出)
    const extractedParams: Record<string, any> = {};
    
    // パラメータとして追加
    if (parameters) {
      Object.assign(extractedParams, parameters);
    }
    
    // 名前抽出の例
    const nameMatch = command.match(/「([^」]+)」|"([^"]+)"|'([^']+)'/);
    if (nameMatch) {
      extractedParams.name = nameMatch[1] || nameMatch[2] || nameMatch[3];
    }
    
    // 数値抽出の例
    const numberMatch = command.match(/(\d+)/);
    if (numberMatch) {
      extractedParams.number = parseInt(numberMatch[1], 10);
    }
    
    return {
      type,
      action,
      parameters: extractedParams,
      confidence: 0.8, // 信頼度
      originalCommand: command
    };
  }
  
  /**
   * コマンドに適したハンドラを取得
   * @param command 解釈されたコマンド
   * @returns 介入ハンドラ
   */
  private getHandlerForCommand(command: InterpretedCommand): InterventionHandler | null {
    // タイプに一致するハンドラを検索
    const handler = this.handlers.get(command.type);
    
    if (handler && handler.supportedIntents.includes(command.action)) {
      return handler;
    }
    
    // 一致するハンドラがない場合
    for (const [, h] of this.handlers.entries()) {
      if (h.supportedIntents.includes(command.action)) {
        return h;
      }
    }
    
    return null;
  }
  
  /**
   * 提案を生成
   * @param command 解釈されたコマンド
   * @param result ハンドラレスポンス
   * @returns 提案の配列
   */
  private generateSuggestions(
    command: InterpretedCommand,
    result: HandlerResponse
  ): string[] {
    const suggestions: string[] = [];
    
    // アクションタイプに基づく提案
    switch (command.action) {
      case 'ADD':
        suggestions.push(`${command.type}の詳細設定を確認してください`);
        break;
        
      case 'MODIFY':
        suggestions.push(`他の${command.type}の要素も確認してください`);
        suggestions.push(`変更の影響を確認するため、関連する章を生成してみてください`);
        break;
        
      case 'REMOVE':
        suggestions.push(`削除した${command.type}の参照がないか確認してください`);
        break;
        
      case 'GENERATE':
        suggestions.push(`生成結果を確認し、必要に応じて調整してください`);
        break;
    }
    
    // 常に提案する一般的な提案
    suggestions.push(`現在のストーリー整合性を確認してください`);
    
    return suggestions;
  }
  
  /**
   * エラーレスポンスを作成
   * @param message エラーメッセージ
   * @returns エラーレスポンス
   */
  private createErrorResponse(message: string): InterventionResponse {
    return {
      success: false,
      actionsTaken: [],
      affectedComponents: [],
      feedback: {
        message: `エラーが発生しました: ${message}`,
        suggestions: ['別のコマンドを試してください', 'より具体的な指示を入力してください']
      }
    };
  }
  
  /**
   * 介入を履歴に記録
   * @param request 介入リクエスト
   * @param response 介入レスポンス
   * @param context コンテキスト
   */
  private recordIntervention(
    request: InterventionRequest,
    response: InterventionResponse,
    context?: Record<string, any>
  ): void {
    const record: InterventionRecord = {
      id: generateId(),
      timestamp: new Date(),
      request,
      response,
      context
    };
    
    this.interventionHistory.push(record);
    
    // 履歴サイズを制限
    if (this.interventionHistory.length > 100) {
      this.interventionHistory = this.interventionHistory.slice(-100);
    }
  }
}