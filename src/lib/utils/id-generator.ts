// src/utils/id-generator.ts

/**
 * ユニークIDを生成
 * @returns 生成されたID
 */
export function generateId(): string {
  return `id-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
* タイプ付きIDを生成
* @param type ID種別のプレフィックス
* @returns 生成されたID
*/
export function generateTypedId(type: string): string {
  return `${type}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
* セッションIDを生成
* @returns 生成されたセッションID
*/
export function generateSessionId(): string {
  return generateTypedId('session');
}

/**
* ドキュメントIDを生成
* @returns 生成されたドキュメントID
*/
export function generateDocumentId(): string {
  return generateTypedId('doc');
}

/**
* エディタIDを生成
* @returns 生成されたエディタID
*/
export function generateEditorId(): string {
  return generateTypedId('editor');
}

/**
* リビジョンIDを生成
* @returns 生成されたリビジョンID
*/
export function generateRevisionId(): string {
  return generateTypedId('rev');
}

/**
* コンフリクトIDを生成
* @returns 生成されたコンフリクトID
*/
export function generateConflictId(): string {
  return generateTypedId('conflict');
}

/**
* チャプターIDを生成
* @returns 生成されたチャプターID
*/
export function generateChapterId(): string {
  return generateTypedId('chapter');
}

/**
* シーンIDを生成
* @returns 生成されたシーンID
*/
export function generateSceneId(): string {
  return generateTypedId('scene');
}

/**
* キャラクターIDを生成
* @returns 生成されたキャラクターID
*/
export function generateCharacterId(): string {
  return generateTypedId('char');
}

/**
* メモリーIDを生成
* @returns 生成されたメモリーID
*/
export function generateMemoryId(): string {
  return generateTypedId('memory');
}

/**
* プロットイベントIDを生成
* @returns 生成されたプロットイベントID
*/
export function generatePlotEventId(): string {
  return generateTypedId('event');
}

/**
* UUIDに似た形式でIDを生成
* (UUID標準ではないため、識別用途のみに使用)
* @returns UUIDに似たID
*/
export function generateUuidLike(): string {
  const template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
  return template.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
  });
}