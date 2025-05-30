// src/lib/editor/command-registry.ts
import { Command } from '@/types/editor';

/**
 * 利用可能なコマンドを管理するレジストリ
 */
export class CommandRegistry {
  private commands: Command[] = [];
  
  constructor() {
    this.registerDefaultCommands();
  }
  
  /**
   * デフォルトコマンドの登録
   */
  private registerDefaultCommands(): void {
    this.commands = [
      // キャラクター追加コマンド
      {
        type: 'CHARACTER',
        action: 'ADD',
        intent: 'ADD_CHARACTER',
        parameters: [
          { name: 'name', type: 'string', required: true },
          { name: 'type', type: 'string', required: false, defaultValue: 'MOB' },
          { name: 'description', type: 'string', required: false },
          { name: 'role', type: 'string', required: false }
        ]
      },
      
      // キャラクター修正コマンド
      {
        type: 'CHARACTER',
        action: 'MODIFY',
        intent: 'MODIFY_CHARACTER',
        parameters: [
          { name: 'characterName', type: 'string', required: true },
          { name: 'trait', type: 'string', required: false },
          { name: 'appearance', type: 'string', required: false },
          { name: 'role', type: 'string', required: false }
        ]
      },
      
      // プロット変更コマンド
      {
        type: 'PLOT',
        action: 'CHANGE',
        intent: 'CHANGE_PLOT',
        parameters: [
          { name: 'chapterNumber', type: 'number', required: false },
          { name: 'description', type: 'string', required: true }
        ]
      },
      
      // シーン修正コマンド
      {
        type: 'SCENE',
        action: 'MODIFY',
        intent: 'MODIFY_SCENE',
        parameters: [
          { name: 'location', type: 'string', required: false },
          { name: 'time', type: 'string', required: false },
          { name: 'description', type: 'string', required: false }
        ]
      },
      
      // その他の多数のコマンド...
    ];
  }
  
  /**
   * 新しいコマンドを登録
   */
  registerCommand(command: Command): void {
    this.commands.push(command);
  }
  
  /**
   * インテントに一致するコマンドを検索
   */
  findCommand(intent: string): Command | null {
    return this.commands.find(command => command.intent === intent) || null;
  }
  
  /**
   * 登録されているすべてのコマンドを取得
   */
  getAllCommands(): Command[] {
    return [...this.commands];
  }
}