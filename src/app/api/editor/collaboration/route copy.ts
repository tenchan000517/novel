// src/app/api/editor/collaboration/route.ts
import { NextResponse } from 'next/server';
import { CollaborativeEditor } from '@/lib/editor/collaborative-editor';

const collaborativeEditor = new CollaborativeEditor();

export async function POST(request: Request) {
  try {
    const { action, sessionId, documentId, editorId, edit } = await request.json();
    
    switch (action) {
      case 'START_SESSION':
        // ドキュメント情報を取得（実際の実装ではデータベースから取得）
        const document = {
          id: documentId,
          title: 'Document Title',
          content: 'Document content...',
          version: 1,
          updatedAt: new Date(),
          metadata: {}
        };
        
        const session = await collaborativeEditor.startSession(editorId, document);
        
        return NextResponse.json({
          success: true,
          sessionId: session.id,
          document: session.document
        });
        
      case 'END_SESSION':
        const endResult = await collaborativeEditor.endSession(sessionId);
        
        return NextResponse.json({
          success: endResult
        });
        
      case 'APPLY_EDIT':
        const editResult = await collaborativeEditor.applyEdit(sessionId, edit);
        
        return NextResponse.json({
          success: true,
          result: editResult
        });
        
      case 'SAVE_DOCUMENT':
        const saveResult = await collaborativeEditor.saveDocument(sessionId);
        
        return NextResponse.json({
          success: saveResult
        });
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Collaboration API error:', error);
    
    return NextResponse.json(
      { error: 'Failed to process collaboration request', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }
    
    const session = collaborativeEditor.getSessionInfo(sessionId);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }
    
    // TODO: ここで他のアクティブなエディターやドキュメントの最新状態などを取得
    
    return NextResponse.json({
      success: true,
      session,
      activeEditors: [
        // ダミーデータ
        {
          id: 'editor-1',
          name: '佐藤編集者',
          status: 'ACTIVE',
          lastActivity: '1分前'
        }
      ]
    });
    
  } catch (error) {
    console.error('Collaboration status API error:', error);
    
    return NextResponse.json(
      { error: 'Failed to get collaboration status', details: (error as Error).message },
      { status: 500 }
    );
  }
}