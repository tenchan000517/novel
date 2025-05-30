/**
 * @fileoverview src/app/api/editor/collaboration/route.ts
 * @description 
 * 協調編集機能のためのNextJS API Routeハンドラーを実装したファイル。
 * このAPIは複数ユーザー間でのリアルタイム文書編集を可能にする協調編集システムの
 * バックエンドエンドポイントを提供します。セッションの開始/終了、編集の適用、
 * ドキュメント保存、コンフリクト解決、カーソル位置更新などの機能をサポートします。
 * 
 * @requires next/server
 * @requires @/lib/editor/collaborative-editor
 * @requires @/lib/editor/storage-adapter
 * @requires @/lib/utils/error-handler
 * @requires @/lib/utils/id-generator
 * @requires @/lib/storage
 */

import { NextRequest, NextResponse } from 'next/server';
import { CollaborativeEditor, Document, EditorEdit, Resolution, ResolutionStrategy } from '@/lib/editor/collaborative-editor';
import { EditorStorageAdapter } from '@/lib/editor/storage-adapter';
import { logError } from '@/lib/utils/error-handler';
import { generateId } from '@/lib/utils/id-generator';
import { storageProvider } from '@/lib/storage';

/**
 * ストレージアダプターの初期化
 * CollaborativeEditorに文書の永続化を提供するストレージアダプターのインスタンス
 * 
 * @constant
 * @type {EditorStorageAdapter}
 */
const storageAdapter = new EditorStorageAdapter(storageProvider);

/**
 * 協調エディタの初期化
 * 複数ユーザーによる同時編集機能を提供するエディタのインスタンス
 * 
 * @constant
 * @type {CollaborativeEditor}
 */
const collaborativeEditor = new CollaborativeEditor(storageAdapter);

/**
 * POST handler for collaboration actions
 * 協調編集アクションのためのPOSTメソッドハンドラー
 * 
 * @async
 * @function POST
 * @param {NextRequest} request - Next.jsリクエストオブジェクト
 * @returns {Promise<NextResponse>} JSONレスポンス
 * @throws {Error} リクエスト処理中のエラー
 * 
 * @description
 * 各種協調編集アクション（セッション開始/終了、編集適用、保存、解決策適用など）を
 * 処理するためのハンドラー。リクエストのactionフィールドに基づいて適切なサブハンドラーに
 * ルーティングします。
 * 
 * サポートされるアクション:
 * - START_SESSION: 新しい編集セッションを開始
 * - END_SESSION: 既存のセッションを終了
 * - APPLY_EDIT: 単一の編集を適用
 * - APPLY_EDITS: 複数の編集をバッチで適用
 * - SAVE_DOCUMENT: ドキュメントを保存
 * - APPLY_RESOLUTION: コンフリクト解決を適用
 * - UPDATE_CURSOR: カーソル位置を更新
 * - REVERT_VERSION: 以前のバージョンに戻す
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { action } = data;
    
    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }
    
    switch (action) {
      case 'START_SESSION':
        return handleStartSession(data);
      case 'END_SESSION':
        return handleEndSession(data);
      case 'APPLY_EDIT':
        return handleApplyEdit(data);
      case 'APPLY_EDITS':
        return handleApplyEdits(data);
      case 'SAVE_DOCUMENT':
        return handleSaveDocument(data);
      case 'APPLY_RESOLUTION':
        return handleApplyResolution(data);
      case 'UPDATE_CURSOR':
        return handleUpdateCursor(data);
      case 'REVERT_VERSION':
        return handleRevertVersion(data);
      default:
        return NextResponse.json(
          { error: `Invalid action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    logError(error as Error, {}, 'Collaboration API error');
    
    return NextResponse.json(
      { 
        error: 'Failed to process collaboration request', 
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}

/**
 * GET handler for collaboration status
 * 協調編集状態取得のためのGETメソッドハンドラー
 * 
 * @async
 * @function GET
 * @param {NextRequest} request - Next.jsリクエストオブジェクト
 * @returns {Promise<NextResponse>} JSONレスポンス
 * @throws {Error} リクエスト処理中のエラー
 * 
 * @description
 * セッション情報やドキュメントバージョン情報を取得するためのハンドラー。
 * クエリパラメータに基づいて適切なサブハンドラーにルーティングします。
 * 
 * サポートされるクエリパラメータ:
 * - sessionId: 特定のセッション情報を取得
 * - documentId & versions: ドキュメントのバージョン情報を取得
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const documentId = searchParams.get('documentId');
    
    // Handle version info request
    if (documentId && searchParams.has('versions')) {
      return handleGetVersionInfo(documentId);
    }
    
    // Handle session info request
    if (sessionId) {
      return handleGetSession(sessionId);
    }
    
    return NextResponse.json(
      { error: 'Session ID or Document ID is required' },
      { status: 400 }
    );
  } catch (error) {
    logError(error as Error, {}, 'Collaboration status API error');
    
    return NextResponse.json(
      { 
        error: 'Failed to get collaboration status', 
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}

/**
 * 新しい編集セッションを開始する
 * 
 * @async
 * @function handleStartSession
 * @param {any} data - リクエストデータ（documentIdとeditorIdを含む）
 * @returns {Promise<NextResponse>} セッション情報を含むJSONレスポンス
 * 
 * @description
 * 指定されたドキュメントとエディタIDに対して新しい編集セッションを開始します。
 * ドキュメントが存在しない場合は404エラーを返します。
 */
async function handleStartSession(data: any): Promise<NextResponse> {
  const { documentId, editorId } = data;
  
  if (!documentId || !editorId) {
    return NextResponse.json(
      { error: 'Document ID and Editor ID are required' },
      { status: 400 }
    );
  }
  
  try {
    // Fetch document from storage
    const document = await fetchDocument(documentId);
    
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }
    
    // Start new session
    const session = await collaborativeEditor.startSession(editorId, document);
    
    return NextResponse.json({
      success: true,
      sessionId: session.id,
      document: session.document
    });
  } catch (error) {
    logError(error as Error, { documentId, editorId }, 'Error starting session');
    
    return NextResponse.json(
      { error: 'Failed to start session', details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * セッションを終了する
 * 
 * @async
 * @function handleEndSession
 * @param {any} data - リクエストデータ（sessionIdを含む）
 * @returns {Promise<NextResponse>} 処理結果を含むJSONレスポンス
 * 
 * @description
 * 指定されたセッションを終了し、関連リソースをクリーンアップします。
 * セッションが存在しない場合は404エラーを返します。
 */
async function handleEndSession(data: any): Promise<NextResponse> {
  const { sessionId } = data;
  
  if (!sessionId) {
    return NextResponse.json(
      { error: 'Session ID is required' },
      { status: 400 }
    );
  }
  
  try {
    const result = await collaborativeEditor.endSession(sessionId);
    
    if (!result) {
      return NextResponse.json(
        { error: 'Session not found or already ended' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true
    });
  } catch (error) {
    logError(error as Error, { sessionId }, 'Error ending session');
    
    return NextResponse.json(
      { error: 'Failed to end session', details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * 単一の編集操作を適用する
 * 
 * @async
 * @function handleApplyEdit
 * @param {any} data - リクエストデータ（sessionIdとeditを含む）
 * @returns {Promise<NextResponse>} 処理結果を含むJSONレスポンス
 * 
 * @description
 * 指定されたセッションに対して単一の編集操作を適用します。
 * 編集構造を検証し、コンフリクトがある場合はコンフリクト情報を返します。
 */
async function handleApplyEdit(data: any): Promise<NextResponse> {
  const { sessionId, edit } = data;
  
  if (!sessionId || !edit) {
    return NextResponse.json(
      { error: 'Session ID and edit data are required' },
      { status: 400 }
    );
  }
  
  try {
    // Validate edit structure
    if (!validateEdit(edit)) {
      return NextResponse.json(
        { error: 'Invalid edit structure' },
        { status: 400 }
      );
    }
    
    const result = await collaborativeEditor.applyEdit(sessionId, edit);
    
    if (!result.success) {
      // Check if there are conflicts
      if (result.conflicts && result.conflicts.length > 0) {
        return NextResponse.json({
          success: false,
          conflicts: result.conflicts,
          resolution: result.resolution,
          error: 'Conflicts detected'
        });
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: result.error || 'Failed to apply edit' 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      result
    });
  } catch (error) {
    logError(error as Error, { sessionId, edit }, 'Error applying edit');
    
    return NextResponse.json(
      { error: 'Failed to apply edit', details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * 複数の編集操作をバッチで適用する
 * 
 * @async
 * @function handleApplyEdits
 * @param {any} data - リクエストデータ（sessionIdとedits配列を含む）
 * @returns {Promise<NextResponse>} 処理結果を含むJSONレスポンス
 * 
 * @description
 * 指定されたセッションに対して複数の編集操作をバッチで適用します。
 * 全ての編集構造を検証し、コンフリクトがある場合はコンフリクト情報を返します。
 */
async function handleApplyEdits(data: any): Promise<NextResponse> {
  const { sessionId, edits } = data;
  
  if (!sessionId || !edits || !Array.isArray(edits)) {
    return NextResponse.json(
      { error: 'Session ID and edits array are required' },
      { status: 400 }
    );
  }
  
  try {
    // Validate all edits
    for (const edit of edits) {
      if (!validateEdit(edit)) {
        return NextResponse.json(
          { error: 'Invalid edit structure in batch' },
          { status: 400 }
        );
      }
    }
    
    const result = await collaborativeEditor.applyEdits(sessionId, edits);
    
    if (!result.success) {
      // Check if there are conflicts
      if (result.conflicts && result.conflicts.length > 0) {
        return NextResponse.json({
          success: false,
          conflicts: result.conflicts,
          resolution: result.resolution,
          error: 'Conflicts detected'
        });
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: result.error || 'Failed to apply edits' 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      result
    });
  } catch (error) {
    logError(error as Error, { sessionId, editsCount: edits.length }, 'Error applying edits');
    
    return NextResponse.json(
      { error: 'Failed to apply edits', details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * ドキュメントを保存する
 * 
 * @async
 * @function handleSaveDocument
 * @param {any} data - リクエストデータ（sessionIdを含む）
 * @returns {Promise<NextResponse>} 処理結果と更新されたドキュメントを含むJSONレスポンス
 * 
 * @description
 * 指定されたセッションのドキュメント変更を永続化します。
 * セッションが存在しない場合は404エラーを返します。
 */
async function handleSaveDocument(data: any): Promise<NextResponse> {
  const { sessionId } = data;
  
  if (!sessionId) {
    return NextResponse.json(
      { error: 'Session ID is required' },
      { status: 400 }
    );
  }
  
  try {
    const result = await collaborativeEditor.saveDocument(sessionId);
    
    if (!result) {
      return NextResponse.json(
        { error: 'Session not found or document could not be saved' },
        { status: 404 }
      );
    }
    
    // Get the session info to include the updated document
    const session = collaborativeEditor.getSessionInfo(sessionId);
    
    return NextResponse.json({
      success: true,
      document: session?.document
    });
  } catch (error) {
    logError(error as Error, { sessionId }, 'Error saving document');
    
    return NextResponse.json(
      { error: 'Failed to save document', details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * コンフリクト解決を適用する
 * 
 * @async
 * @function handleApplyResolution
 * @param {any} data - リクエストデータ（sessionIdとstrategies配列を含む）
 * @returns {Promise<NextResponse>} 処理結果と解決後のドキュメントを含むJSONレスポンス
 * 
 * @description
 * 指定されたセッションに対してコンフリクト解決戦略を適用します。
 * 全ての解決戦略を検証し、セッションが存在しない場合は404エラーを返します。
 */
async function handleApplyResolution(data: any): Promise<NextResponse> {
  const { sessionId, strategies } = data;
  
  if (!sessionId || !strategies || !Array.isArray(strategies)) {
    return NextResponse.json(
      { error: 'Session ID and resolution strategies are required' },
      { status: 400 }
    );
  }
  
  try {
    // Validate strategies
    for (const strategy of strategies) {
      if (!validateResolutionStrategy(strategy)) {
        return NextResponse.json(
          { error: 'Invalid resolution strategy' },
          { status: 400 }
        );
      }
    }
    
    // Construct a resolution object
    const session = collaborativeEditor.getSessionInfo(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }
    
    // Apply resolution
    const resolution: Resolution = {
      conflicts: [], // Will be populated by the collaborative editor
      strategies,
      mergedDocument: {
        ...session.document,
        id: session.document.id,
        version: session.document.version,
        updatedAt: new Date()
      }
    };
    
    const result = await collaborativeEditor.applyResolution(sessionId, resolution);
    
    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error || 'Failed to apply resolution' 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      document: result.document
    });
  } catch (error) {
    logError(error as Error, { sessionId }, 'Error applying resolution');
    
    return NextResponse.json(
      { error: 'Failed to apply resolution', details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * カーソル位置を更新する
 * 
 * @async
 * @function handleUpdateCursor
 * @param {any} data - リクエストデータ（sessionId、editorId、position、selectionを含む）
 * @returns {Promise<NextResponse>} 処理結果を含むJSONレスポンス
 * 
 * @description
 * 指定されたセッションのエディタカーソル位置とテキスト選択情報を更新します。
 * この情報は協調編集時に他のエディタに表示されるカーソル位置の更新に使用されます。
 */
async function handleUpdateCursor(data: any): Promise<NextResponse> {
  const { sessionId, editorId, position, selection } = data;
  
  if (!sessionId || !editorId || position === undefined) {
    return NextResponse.json(
      { error: 'Session ID, Editor ID, and position are required' },
      { status: 400 }
    );
  }
  
  try {
    // In a real implementation, this would update the editor's cursor position
    // For now, we'll simulate this by updating the session metadata
    const session = collaborativeEditor.getSessionInfo(sessionId);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }
    
    // Update session metadata with cursor info
    if (!session.metadata) {
      session.metadata = {};
    }
    
    if (!session.metadata.cursors) {
      session.metadata.cursors = {};
    }
    
    session.metadata.cursors[editorId] = {
      position,
      selection,
      updatedAt: new Date()
    };
    
    return NextResponse.json({
      success: true
    });
  } catch (error) {
    logError(error as Error, { sessionId, editorId, position }, 'Error updating cursor');
    
    return NextResponse.json(
      { error: 'Failed to update cursor', details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * 以前のバージョンに戻す
 * 
 * @async
 * @function handleRevertVersion
 * @param {any} data - リクエストデータ（sessionIdとversionを含む）
 * @returns {Promise<NextResponse>} 処理結果と元に戻されたドキュメントを含むJSONレスポンス
 * 
 * @description
 * 指定されたセッションのドキュメントを特定のバージョンに戻します。
 * セッションが存在しない場合は404エラーを返します。
 */
async function handleRevertVersion(data: any): Promise<NextResponse> {
  const { sessionId, version } = data;
  
  if (!sessionId || version === undefined) {
    return NextResponse.json(
      { error: 'Session ID and version are required' },
      { status: 400 }
    );
  }
  
  try {
    const session = collaborativeEditor.getSessionInfo(sessionId);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }
    
    const result = await collaborativeEditor.revertToVersion(session.document.id, version);
    
    if (!result) {
      return NextResponse.json(
        { error: `Failed to revert to version ${version}` },
        { status: 400 }
      );
    }
    
    // Get the updated document
    const document = await collaborativeEditor.getLatestDocument(session.document.id);
    
    return NextResponse.json({
      success: true,
      document
    });
  } catch (error) {
    logError(error as Error, { sessionId, version }, 'Error reverting version');
    
    return NextResponse.json(
      { error: 'Failed to revert version', details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * セッション情報を取得する
 * 
 * @async
 * @function handleGetSession
 * @param {string} sessionId - セッションID
 * @returns {Promise<NextResponse>} セッション情報とアクティブエディタを含むJSONレスポンス
 * 
 * @description
 * 指定されたセッションの詳細情報と、同じドキュメントで作業している他のアクティブな
 * エディタの情報を取得します。セッションが存在しない場合は404エラーを返します。
 */
async function handleGetSession(sessionId: string): Promise<NextResponse> {
  try {
    const session = collaborativeEditor.getSessionInfo(sessionId);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }
    
    // Get active editors for this document
    const activeSessions = collaborativeEditor.getDocumentSessions(session.document.id);
    const activeEditors = activeSessions
      .filter(s => s.id !== sessionId) // Exclude current session
      .map(s => ({
        id: s.editorId,
        name: s.metadata?.editorName || `Editor ${s.editorId.slice(-4)}`,
        status: s.status,
        lastActivity: formatLastActive(s.lastActive),
        cursorPosition: s.metadata?.cursors?.[s.editorId]?.position,
        selection: s.metadata?.cursors?.[s.editorId]?.selection
      }));
    
    return NextResponse.json({
      success: true,
      session,
      activeEditors
    });
  } catch (error) {
    logError(error as Error, { sessionId }, 'Error getting session');
    
    return NextResponse.json(
      { error: 'Failed to get session', details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * バージョン情報を取得する
 * 
 * @async
 * @function handleGetVersionInfo
 * @param {string} documentId - ドキュメントID
 * @returns {Promise<NextResponse>} バージョン情報を含むJSONレスポンス
 * 
 * @description
 * 指定されたドキュメントのバージョン履歴情報を取得します。
 * ドキュメントが存在しない場合は404エラーを返します。
 */
async function handleGetVersionInfo(documentId: string): Promise<NextResponse> {
  try {
    const versionInfo = await collaborativeEditor.getVersionInfo(documentId);
    
    if (!versionInfo) {
      return NextResponse.json(
        { error: 'Document not found or has no version history' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      versionInfo
    });
  } catch (error) {
    logError(error as Error, { documentId }, 'Error getting version info');
    
    return NextResponse.json(
      { error: 'Failed to get version info', details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * ドキュメントを取得する
 * 
 * @async
 * @function fetchDocument
 * @param {string} documentId - ドキュメントID
 * @returns {Promise<Document | null>} ドキュメントオブジェクトまたはnull
 * 
 * @description
 * 指定されたIDのドキュメントを取得します。まず協調エディタから最新バージョンを
 * 取得し、なければストレージから読み込み、それも失敗した場合はデフォルトの
 * 空ドキュメントを作成します。
 */
async function fetchDocument(documentId: string): Promise<Document | null> {
  try {
    // Try to get from collaborative editor
    const existingDoc = await collaborativeEditor.getLatestDocument(documentId);
    
    if (existingDoc) {
      return existingDoc;
    }
    
    // Try to fetch from storage adapter
    const doc = await storageAdapter.loadDocument(documentId);
    
    if (doc) {
      return doc;
    }
    
    // Create default document as fallback
    return {
      id: documentId,
      title: 'New Document',
      content: '',
      version: 1,
      updatedAt: new Date(),
      metadata: {
        created: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Error fetching document:', error);
    return null;
  }
}

/**
 * 編集操作の構造を検証する
 * 
 * @function validateEdit
 * @param {any} edit - 検証する編集操作
 * @returns {boolean} 検証結果（有効な場合はtrue）
 * 
 * @description
 * 編集操作の構造が有効かどうかを検証します。編集タイプと位置が必須で、
 * タイプに応じて必要なフィールド（text、deleteLength、replaceTarget）を
 * 検証します。
 */
function validateEdit(edit: any): boolean {
  if (!edit || typeof edit !== 'object') {
    return false;
  }
  
  // Basic validation
  if (!edit.type || !['INSERT', 'DELETE', 'REPLACE'].includes(edit.type)) {
    return false;
  }
  
  if (edit.position === undefined || typeof edit.position !== 'number') {
    return false;
  }
  
  // Type-specific validation
  if (edit.type === 'INSERT' && typeof edit.text !== 'string') {
    return false;
  }
  
  if (edit.type === 'DELETE' && typeof edit.deleteLength !== 'number') {
    return false;
  }
  
  if (edit.type === 'REPLACE' && 
      (typeof edit.text !== 'string' || typeof edit.replaceTarget !== 'string')) {
    return false;
  }
  
  return true;
}

/**
 * 解決戦略の構造を検証する
 * 
 * @function validateResolutionStrategy
 * @param {any} strategy - 検証する解決戦略
 * @returns {boolean} 検証結果（有効な場合はtrue）
 * 
 * @description
 * コンフリクト解決戦略の構造が有効かどうかを検証します。
 * コンフリクトインデックスと戦略タイプが必須です。
 */
function validateResolutionStrategy(strategy: any): boolean {
  if (!strategy || typeof strategy !== 'object') {
    return false;
  }
  
  if (typeof strategy.conflictIndex !== 'number') {
    return false;
  }
  
  if (!strategy.type || !['TAKE_MINE', 'TAKE_THEIRS', 'MERGE', 'MANUAL'].includes(strategy.type)) {
    return false;
  }
  
  return true;
}

/**
 * 最終アクティブ時間をフォーマットする
 * 
 * @function formatLastActive
 * @param {Date} lastActive - 最終アクティブ時間
 * @returns {string} フォーマットされた文字列（例: "just now", "5m ago", "2h ago", "3d ago"）
 * 
 * @description
 * 最終アクティブ時間を現在時刻との差に基づいて人間が読みやすい形式に
 * フォーマットします。分、時間、日単位での表示に対応します。
 */
function formatLastActive(lastActive: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - lastActive.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  
  if (diffSec < 60) {
    return 'just now';
  }
  
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return `${diffMin}m ago`;
  }
  
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) {
    return `${diffHour}h ago`;
  }
  
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay}d ago`;
}