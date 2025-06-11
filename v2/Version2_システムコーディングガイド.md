# 🏗️ 新システム作成テンプレート

> 新しいシステムを追加する際の標準テンプレートです。
> コピペして使用し、Claude Codeが瞬時に理解できる構造を維持してください。

## 📁 新システムディレクトリ作成コマンド

```bash
# 新システム作成（例：recommendation システム）
SYSTEM_NAME="recommendation"
mkdir -p src/lib/${SYSTEM_NAME}/{services,models,utils,__tests__/services}
```

## 📝 テンプレートファイル

### 1. `src/lib/{system}/interfaces.ts`
```typescript
/**
 * @fileoverview {System}システムのインターフェース定義
 * @description {説明を1行で}
 */

import type { SystemContext, OperationResult } from '@/types/system-interfaces';

// ========== Core Interface ==========
export interface I{System}Manager {
  // 主要操作（3-5個の基本メソッド）
  getItem(id: string): Promise<{Type} | null>;
  createItem(data: Create{Type}Data): Promise<{Type}>;
  updateItem(id: string, updates: Partial<{Type}>): Promise<void>;
  deleteItem(id: string): Promise<void>;
  
  // システム固有操作（システムの特殊な責任）
  performSpecialOperation(input: SpecialInput): Promise<SpecialOutput>;
  
  // 統計・分析
  getStatistics(): Promise<{System}Statistics>;
}

// ========== Service Interfaces ==========
export interface I{Feature}Service {
  process(input: ProcessInput): Promise<ProcessOutput>;
  validate(data: any): Promise<ValidationResult>;
}

// ========== Data Models ==========
export interface {Type} {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  // システム固有のプロパティ
}

export interface Create{Type}Data {
  name: string;
  // 作成時に必要なプロパティ
}

export interface {System}Statistics {
  totalItems: number;
  recentActivity: ActivityMetric[];
  // システム固有の統計
}

// ========== Configuration ==========
export interface {System}Config {
  enabled: boolean;
  options: {
    // 設定オプション
  };
}
```

### 2. `src/lib/{system}/{system}.manager.ts`
```typescript
/**
 * @fileoverview {System}Manager - {システムの責任を1行で説明}
 * @description ファサードパターンを使用した統合管理クラス
 */

import { logger } from '@/lib/utils/logger';
import type { I{System}Manager, {Type}, Create{Type}Data } from './interfaces';
import { {Feature}Service } from './services/{feature}.service';

/**
 * {System}システムの統合管理クラス
 * 
 * 責任:
 * - {責任1}
 * - {責任2}
 * - {責任3}
 */
export class {System}Manager implements I{System}Manager {
  private {feature}Service: {Feature}Service;
  
  constructor({feature}Service: {Feature}Service) {
    this.{feature}Service = {feature}Service;
    logger.info('{System}Manager initialized');
  }
  
  /**
   * アイテムを取得
   * @param id アイテムID
   * @returns アイテム情報
   */
  async getItem(id: string): Promise<{Type} | null> {
    try {
      logger.debug('Getting item', { id });
      return await this.{feature}Service.getById(id);
    } catch (error) {
      logger.error('Failed to get item', { id, error });
      throw new {System}Error('Failed to get item', error);
    }
  }
  
  /**
   * アイテムを作成
   * @param data 作成データ
   * @returns 作成されたアイテム
   */
  async createItem(data: Create{Type}Data): Promise<{Type}> {
    try {
      logger.debug('Creating item', { data });
      
      // 1. 入力検証
      await this.validateCreateData(data);
      
      // 2. 作成処理
      const item = await this.{feature}Service.create(data);
      
      // 3. 後処理
      await this.onItemCreated(item);
      
      logger.info('Item created successfully', { id: item.id });
      return item;
      
    } catch (error) {
      logger.error('Failed to create item', { data, error });
      throw new {System}Error('Failed to create item', error);
    }
  }
  
  /**
   * アイテムを更新
   * @param id アイテムID
   * @param updates 更新データ
   */
  async updateItem(id: string, updates: Partial<{Type}>): Promise<void> {
    try {
      logger.debug('Updating item', { id, updates });
      
      // 実装をサービスに委譲
      await this.{feature}Service.update(id, updates);
      
      logger.info('Item updated successfully', { id });
      
    } catch (error) {
      logger.error('Failed to update item', { id, updates, error });
      throw new {System}Error('Failed to update item', error);
    }
  }
  
  /**
   * アイテムを削除
   * @param id アイテムID
   */
  async deleteItem(id: string): Promise<void> {
    try {
      logger.debug('Deleting item', { id });
      
      await this.{feature}Service.delete(id);
      
      logger.info('Item deleted successfully', { id });
      
    } catch (error) {
      logger.error('Failed to delete item', { id, error });
      throw new {System}Error('Failed to delete item', error);
    }
  }
  
  /**
   * システム固有の特別な操作
   * @param input 入力データ
   * @returns 処理結果
   */
  async performSpecialOperation(input: SpecialInput): Promise<SpecialOutput> {
    // システム固有の処理をここに実装
    throw new Error('Not implemented');
  }
  
  /**
   * 統計情報を取得
   * @returns 統計情報
   */
  async getStatistics(): Promise<{System}Statistics> {
    try {
      return await this.{feature}Service.getStatistics();
    } catch (error) {
      logger.error('Failed to get statistics', { error });
      throw new {System}Error('Failed to get statistics', error);
    }
  }
  
  // ========== Private Methods ==========
  
  private async validateCreateData(data: Create{Type}Data): Promise<void> {
    // バリデーションロジック
    if (!data.name || data.name.trim().length === 0) {
      throw new {System}Error('Name is required');
    }
  }
  
  private async onItemCreated(item: {Type}): Promise<void> {
    // 作成後の処理（他システムとの連携など）
    logger.debug('Item created hook', { id: item.id });
  }
}

/**
 * {System}システム専用エラークラス
 */
export class {System}Error extends Error {
  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = '{System}Error';
    this.cause = cause;
  }
}
```

### 3. `src/lib/{system}/services/{feature}.service.ts`
```typescript
/**
 * @fileoverview {Feature}Service - {機能の説明}
 * @description 単一責任の原則に従った個別サービス
 */

import { logger } from '@/lib/utils/logger';
import type { {Type}, Create{Type}Data, I{Feature}Service } from '../interfaces';

/**
 * {Feature}の処理を担当するサービス
 * 
 * 責任: {具体的な責任}
 */
export class {Feature}Service implements I{Feature}Service {
  private storage: Map<string, {Type}> = new Map();
  
  constructor() {
    logger.debug('{Feature}Service initialized');
  }
  
  /**
   * IDでアイテムを取得
   */
  async getById(id: string): Promise<{Type} | null> {
    logger.debug('Getting item by ID', { id });
    return this.storage.get(id) || null;
  }
  
  /**
   * アイテムを作成
   */
  async create(data: Create{Type}Data): Promise<{Type}> {
    logger.debug('Creating item', { data });
    
    const item: {Type} = {
      id: this.generateId(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.storage.set(item.id, item);
    return item;
  }
  
  /**
   * アイテムを更新
   */
  async update(id: string, updates: Partial<{Type}>): Promise<void> {
    logger.debug('Updating item', { id, updates });
    
    const existing = this.storage.get(id);
    if (!existing) {
      throw new Error('Item not found');
    }
    
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date()
    };
    
    this.storage.set(id, updated);
  }
  
  /**
   * アイテムを削除
   */
  async delete(id: string): Promise<void> {
    logger.debug('Deleting item', { id });
    
    if (!this.storage.has(id)) {
      throw new Error('Item not found');
    }
    
    this.storage.delete(id);
  }
  
  /**
   * 統計情報を取得
   */
  async getStatistics(): Promise<{System}Statistics> {
    return {
      totalItems: this.storage.size,
      recentActivity: [], // 実装が必要
    };
  }
  
  /**
   * 処理実行（インターフェース実装）
   */
  async process(input: ProcessInput): Promise<ProcessOutput> {
    // 具体的な処理ロジック
    throw new Error('Not implemented');
  }
  
  /**
   * バリデーション（インターフェース実装）
   */
  async validate(data: any): Promise<ValidationResult> {
    // バリデーションロジック
    return { valid: true, errors: [] };
  }
  
  // ========== Private Methods ==========
  
  private generateId(): string {
    return `{system}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

### 4. `src/lib/{system}/index.ts`
```typescript
/**
 * @fileoverview {System}システムのエクスポート定義
 */

// Manager (主要エクスポート)
export { {System}Manager, {System}Error } from './{system}.manager';

// Interfaces
export type {
  I{System}Manager,
  {Type},
  Create{Type}Data,
  {System}Statistics,
  {System}Config
} from './interfaces';

// Services (必要に応じて)
export { {Feature}Service } from './services/{feature}.service';

// Models
export type { /* モデル型をここに */ } from './models';

// Default export (ファサード)
export { {System}Manager as default } from './{system}.manager';
```

### 5. `src/lib/{system}/__tests__/{system}.manager.test.ts`
```typescript
/**
 * @fileoverview {System}Manager テスト
 */

import { {System}Manager } from '../{system}.manager';
import { {Feature}Service } from '../services/{feature}.service';

describe('{System}Manager', () => {
  let manager: {System}Manager;
  let {feature}Service: {Feature}Service;
  
  beforeEach(() => {
    {feature}Service = new {Feature}Service();
    manager = new {System}Manager({feature}Service);
  });
  
  describe('getItem', () => {
    it('should return item when found', async () => {
      // Given
      const testData = { name: 'Test Item' };
      const createdItem = await manager.createItem(testData);
      
      // When
      const result = await manager.getItem(createdItem.id);
      
      // Then
      expect(result).toBeDefined();
      expect(result?.id).toBe(createdItem.id);
      expect(result?.name).toBe(testData.name);
    });
    
    it('should return null when not found', async () => {
      // Given/When
      const result = await manager.getItem('non-existent-id');
      
      // Then
      expect(result).toBeNull();
    });
  });
  
  describe('createItem', () => {
    it('should create item successfully', async () => {
      // Given
      const testData = { name: 'New Item' };
      
      // When
      const result = await manager.createItem(testData);
      
      // Then
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBe(testData.name);
      expect(result.createdAt).toBeInstanceOf(Date);
    });
    
    it('should throw error for invalid data', async () => {
      // Given
      const invalidData = { name: '' };
      
      // When/Then
      await expect(manager.createItem(invalidData)).rejects.toThrow();
    });
  });
});
```

## 🚀 使用手順

### 1. 新システム作成
```bash
# 1. ディレクトリ作成
SYSTEM_NAME="recommendation"
mkdir -p src/lib/${SYSTEM_NAME}/{services,models,utils,__tests__/services}

# 2. テンプレートファイルをコピーして編集
# 3. SYSTEM_ARCHITECTURE.mdに追加
# 4. src/types/system-interfaces.tsに型定義追加
```

### 2. 置換リスト
- `{System}` → システム名（PascalCase）例: `Recommendation`
- `{system}` → システム名（kebab-case）例: `recommendation`
- `{Type}` → 主要データ型名 例: `RecommendationItem`
- `{Feature}` → 主要機能名 例: `Analysis`
- `{feature}` → 機能名（camelCase）例: `analysis`

### 3. 実装順序
1. インターフェース定義
2. モデル作成
3. サービス実装
4. ファサード実装
5. テスト作成
6. ドキュメント更新

## ✅ 完成チェックリスト
- [ ] 全ファイルが300行以下
- [ ] インターフェースが明確に定義
- [ ] ファサードパターンが正しく実装
- [ ] 単体テストが作成済み
- [ ] SYSTEM_ARCHITECTURE.mdに追加
- [ ] 型定義が`src/types`に配置
- [ ] エラーハンドリングが適切
- [ ] ログ出力が適切
- [ ] JSDocが記述済み

---

> 💡 このテンプレートを使用することで、Claude Codeが瞬時に理解できる統一されたシステム構造を維持できます。