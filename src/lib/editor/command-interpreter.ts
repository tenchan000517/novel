// src/lib/editor/command-interpreter.ts
import { InterpretedCommand, ParsedCommand, Command, Parameter } from '@/types/editor';
import { ContextHistory } from './context-history';
import { logError } from '@/lib/utils/error-handler';

/**
 * 自然言語コマンドを解釈するクラス
 */
export class CommandInterpreter {
  private supportedCommands: Command[] = [];
  private contextHistory: ContextHistory;
  
  constructor() {
    this.contextHistory = new ContextHistory();
    this.initializeCommands();
  }
  
  /**
   * コマンドを解釈
   * @param text 自然言語コマンド
   * @returns 解釈されたコマンドと信頼度
   */
  async interpretCommand(text: string): Promise<InterpretedCommand> {
    try {
      console.log(`Interpreting command: "${text}"`);
      
      // コンテキストを取得
      const context = this.contextHistory.getContext();
      
      // コマンドを解析
      const parsed = await this.parseCommand(text);
      
      // 解析結果からインテントを特定
      const intent = await this.identifyIntent(parsed, context);
      
      // パラメータを抽出
      const parameters = await this.extractParameters(parsed, intent, context);
      
      // 解釈結果を作成
      const interpretedCommand: InterpretedCommand = {
        type: intent.type,
        action: intent.action,
        parameters,
        confidence: parsed.confidence,
        originalCommand: text
      };
      
      // コンテキストを更新
      this.updateContext(interpretedCommand);
      
      console.log(`Interpreted as: ${intent.type}/${intent.action} (confidence: ${parsed.confidence.toFixed(2)})`);
      
      return interpretedCommand;
    } catch (error) {
      logError(error as Error, { text }, 'Error interpreting command');
      
      // エラー時は低信頼度のデフォルト解釈を返す
      return {
        type: 'SYSTEM',
        action: 'UNKNOWN',
        parameters: {},
        confidence: 0.1,
        originalCommand: text
      };
    }
  }
  
  /**
   * サポートされているコマンドを追加
   * @param command コマンド定義
   */
  addCommand(command: Command): void {
    this.supportedCommands.push(command);
  }
  
  /**
   * サポートされているコマンドを取得
   * @returns コマンド一覧
   */
  getSupportedCommands(): Command[] {
    return this.supportedCommands;
  }
  
  /**
   * コマンドを検索
   * @param type コマンドタイプ
   * @param action アクション
   * @returns コマンド定義
   */
  findCommand(type: string, action: string): Command | undefined {
    return this.supportedCommands.find(cmd => 
      cmd.type === type && cmd.action === action
    );
  }
  
  /**
   * コマンドの初期化
   */
  private initializeCommands(): void {
    // キャラクター関連コマンド
    this.addCommand({
      type: 'CHARACTER',
      action: 'ADD',
      intent: 'ADD_CHARACTER',
      parameters: [
        { name: 'name', type: 'string', required: true },
        { name: 'type', type: 'string', required: false, defaultValue: 'MOB' },
        { name: 'role', type: 'string', required: false },
        { name: 'description', type: 'string', required: false }
      ]
    });
    
    this.addCommand({
      type: 'CHARACTER',
      action: 'MODIFY',
      intent: 'MODIFY_CHARACTER',
      parameters: [
        { name: 'name', type: 'string', required: true },
        { name: 'trait', type: 'string', required: false },
        { name: 'value', type: 'string', required: false },
        { name: 'description', type: 'string', required: false }
      ]
    });
    
    this.addCommand({
      type: 'CHARACTER',
      action: 'REMOVE',
      intent: 'REMOVE_CHARACTER',
      parameters: [
        { name: 'name', type: 'string', required: true }
      ]
    });
    
    // プロット関連コマンド
    this.addCommand({
      type: 'PLOT',
      action: 'CHANGE',
      intent: 'CHANGE_PLOT',
      parameters: [
        { name: 'chapterNumber', type: 'number', required: false },
        { name: 'description', type: 'string', required: true }
      ]
    });
    
    this.addCommand({
      type: 'PLOT',
      action: 'ADD_EVENT',
      intent: 'ADD_EVENT',
      parameters: [
        { name: 'description', type: 'string', required: true },
        { name: 'characters', type: 'string[]', required: false },
        { name: 'chapterNumber', type: 'number', required: false }
      ]
    });
    
    // シーン関連コマンド
    this.addCommand({
      type: 'SCENE',
      action: 'MODIFY',
      intent: 'MODIFY_SCENE',
      parameters: [
        { name: 'chapterNumber', type: 'number', required: false },
        { name: 'sceneNumber', type: 'number', required: false },
        { name: 'location', type: 'string', required: false },
        { name: 'time', type: 'string', required: false },
        { name: 'description', type: 'string', required: false }
      ]
    });
    
    // メモリ関連コマンド
    this.addCommand({
      type: 'MEMORY',
      action: 'ADD',
      intent: 'ADD_MEMORY',
      parameters: [
        { name: 'type', type: 'string', required: true },
        { name: 'content', type: 'string', required: true },
        { name: 'priority', type: 'number', required: false, defaultValue: 0.5 }
      ]
    });
    
    this.addCommand({
      type: 'MEMORY',
      action: 'CLEAR',
      intent: 'CLEAR_MEMORY',
      parameters: [
        { name: 'type', type: 'string', required: true }
      ]
    });
    
    // 生成関連コマンド
    this.addCommand({
      type: 'GENERATION',
      action: 'GENERATE',
      intent: 'GENERATE_CONTENT',
      parameters: [
        { name: 'chapterNumber', type: 'number', required: true },
        { name: 'length', type: 'number', required: false },
        { name: 'focus', type: 'string', required: false }
      ]
    });
    
    this.addCommand({
      type: 'GENERATION',
      action: 'MODIFY_PARAMS',
      intent: 'MODIFY_GENERATION_PARAMS',
      parameters: [
        { name: 'parameter', type: 'string', required: true },
        { name: 'value', type: 'any', required: true }
      ]
    });
    
    // システム関連コマンド
    this.addCommand({
      type: 'SYSTEM',
      action: 'CHANGE_SETTINGS',
      intent: 'CHANGE_SETTINGS',
      parameters: [
        { name: 'setting', type: 'string', required: true },
        { name: 'value', type: 'any', required: true }
      ]
    });
  }
  
  /**
   * コマンドを解析
   * @param text 自然言語コマンド
   * @returns 解析結果
   */
  private async parseCommand(text: string): Promise<ParsedCommand> {
    // テキストの前処理
    const normalized = text.toLowerCase().trim();
    
    // トークン化
    const tokens = normalized.split(/\s+/).filter(Boolean);
    
    // エンティティ抽出 (簡易版)
    const entities: Record<string, any> = {};
    
    // 名前の抽出
    const nameMatch = text.match(/「([^」]+)」|"([^"]+)"|『([^』]+)』/);
    if (nameMatch) {
      entities.name = nameMatch[1] || nameMatch[2] || nameMatch[3];
    }
    
    // 章番号の抽出
    const chapterMatch = text.match(/第(\d+)章|チャプター(\d+)/);
    if (chapterMatch) {
      entities.chapterNumber = parseInt(chapterMatch[1] || chapterMatch[2], 10);
    }
    
    // 数値の抽出
    const numberMatch = text.match(/(\d+)/);
    if (numberMatch) {
      entities.number = parseInt(numberMatch[1], 10);
    }
    
    // 簡易な解析結果を返す
    return {
      text: normalized,
      tokens,
      entities,
      confidence: 0.8 // 仮の信頼度
    };
  }
  
  /**
   * インテントを特定
   * @param parsed 解析結果
   * @param context コンテキスト
   * @returns 特定されたインテント
   */
  private async identifyIntent(
    parsed: ParsedCommand,
    context: any
  ): Promise<{ type: string; action: string }> {
    const { tokens } = parsed;
    
    // キーワードに基づくマッピング
    const typeKeywords = {
      'character': ['キャラクター', 'キャラ', '人物', 'character'],
      'plot': ['プロット', 'ストーリー', '展開', '筋書き', 'plot', 'story'],
      'scene': ['シーン', '場面', '舞台', 'scene'],
      'memory': ['メモリー', '記憶', 'memory'],
      'generation': ['生成', '作成', 'generate', 'creation'],
      'system': ['システム', '設定', 'system', 'settings']
    };
    
    const actionKeywords = {
      'add': ['追加', '作成', '登場', 'add', 'create', 'insert'],
      'modify': ['変更', '修正', '編集', 'modify', 'edit', 'update', 'change'],
      'remove': ['削除', '除去', 'remove', 'delete'],
      'generate': ['生成', 'generate'],
      'clear': ['クリア', 'リセット', 'clear', 'reset']
    };
    
    // マッチングスコアを計算
    const typeScores: Record<string, number> = {};
    const actionScores: Record<string, number> = {};
    
    // タイプスコアの計算
    for (const [type, keywords] of Object.entries(typeKeywords)) {
      typeScores[type] = tokens.filter(token => keywords.includes(token)).length;
    }
    
    // アクションスコアの計算
    for (const [action, keywords] of Object.entries(actionKeywords)) {
      actionScores[action] = tokens.filter(token => keywords.includes(token)).length;
    }
    
    // 最高スコアを取得
    let bestType = Object.entries(typeScores).sort((a, b) => b[1] - a[1])[0][0];
    let bestAction = Object.entries(actionScores).sort((a, b) => b[1] - a[1])[0][0];
    
    // スコアが0の場合はコンテキストから推測
    if (typeScores[bestType] === 0 && context && context.lastType) {
      bestType = context.lastType;
    }
    
    if (actionScores[bestAction] === 0) {
      // デフォルトはmodify
      bestAction = 'modify';
    }
    
    // 命名規則の調整（IDENTIFIERへの変換）
    const typeMap: Record<string, string> = {
      'character': 'CHARACTER',
      'plot': 'PLOT',
      'scene': 'SCENE',
      'memory': 'MEMORY',
      'generation': 'GENERATION',
      'system': 'SYSTEM'
    };
    
    const actionMap: Record<string, string> = {
      'add': 'ADD',
      'modify': 'MODIFY',
      'remove': 'REMOVE',
      'generate': 'GENERATE',
      'clear': 'CLEAR'
    };
    
    return {
      type: typeMap[bestType] || 'SYSTEM',
      action: actionMap[bestAction] || 'MODIFY'
    };
  }
  
  /**
   * パラメータを抽出
   * @param parsed 解析結果
   * @param intent 特定されたインテント
   * @param context コンテキスト
   * @returns 抽出されたパラメータ
   */
  private async extractParameters(
    parsed: ParsedCommand,
    intent: { type: string; action: string },
    context: any
  ): Promise<Record<string, any>> {
    // コマンド定義を取得
    const command = this.findCommand(intent.type, intent.action);
    
    if (!command) {
      return {};
    }
    
    const parameters: Record<string, any> = {};
    
    // エンティティからパラメータを抽出
    for (const param of command.parameters) {
      if (param.name in parsed.entities) {
        parameters[param.name] = parsed.entities[param.name];
      } else if (param.required && param.defaultValue !== undefined) {
        parameters[param.name] = param.defaultValue;
      }
    }
    
    // 特殊なパラメータ抽出ルール
    if (intent.type === 'CHARACTER') {
      // キャラクター名の抽出
      if ('name' in parsed.entities) {
        parameters.name = parsed.entities.name;
      } else {
        const nameMatch = parsed.text.match(/「([^」]+)」|"([^"]+)"|『([^』]+)』/);
        if (nameMatch) {
          parameters.name = nameMatch[1] || nameMatch[2] || nameMatch[3];
        }
      }
      
      // キャラクタータイプの判定
      if (parsed.text.includes('メイン')) {
        parameters.type = 'MAIN';
      } else if (parsed.text.includes('サブ')) {
        parameters.type = 'SUB';
      } else if (parsed.text.includes('モブ')) {
        parameters.type = 'MOB';
      }
      
      // キャラクター役割の判定
      if (parsed.text.includes('主人公')) {
        parameters.role = 'PROTAGONIST';
      } else if (parsed.text.includes('敵') || parsed.text.includes('悪役')) {
        parameters.role = 'ANTAGONIST';
      } else if (parsed.text.includes('味方')) {
        parameters.role = 'ALLY';
      } else if (parsed.text.includes('指導') || parsed.text.includes('教師')) {
        parameters.role = 'MENTOR';
      } else if (parsed.text.includes('ライバル')) {
        parameters.role = 'RIVAL';
      }
    }
    
    if (intent.type === 'PLOT') {
      // 章番号の抽出
      if ('chapterNumber' in parsed.entities) {
        parameters.chapterNumber = parsed.entities.chapterNumber;
      } else {
        const chapterMatch = parsed.text.match(/第(\d+)章|チャプター(\d+)/);
        if (chapterMatch) {
          parameters.chapterNumber = parseInt(chapterMatch[1] || chapterMatch[2], 10);
        }
      }
      
      // 説明の抽出
      if (!parameters.description) {
        // 名前抽出で使った正規表現を説明抽出にも利用
        const descMatch = parsed.text.match(/「([^」]+)」|"([^"]+)"|『([^』]+)』/);
        if (descMatch) {
          parameters.description = descMatch[1] || descMatch[2] || descMatch[3];
        } else {
          // コマンドの主要部分をそのまま説明として使用
          const mainPart = parsed.text.replace(/第(\d+)章|チャプター(\d+)/, '').trim();
          parameters.description = mainPart;
        }
      }
    }
    
    // コンテキストからのパラメータ補完
    if (context && context.lastParameters) {
      for (const param of command.parameters) {
        if (!(param.name in parameters) && param.name in context.lastParameters) {
          parameters[param.name] = context.lastParameters[param.name];
        }
      }
    }
    
    return parameters;
  }
  
  /**
   * コンテキストを更新
   * @param command 解釈されたコマンド
   */
  private updateContext(command: InterpretedCommand): void {
    this.contextHistory.updateContext({
      lastType: command.type,
      lastAction: command.action,
      lastParameters: command.parameters,
      tags: [command.type.toLowerCase(), command.action.toLowerCase()]
    });
  }
}