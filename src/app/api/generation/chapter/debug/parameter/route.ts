// src/app/api/generation/chapter/debug/parameter-files/route.ts
import { NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';
import { storageProvider } from '@/lib/storage';

export async function GET() {
  try {
    logger.info('Starting direct parameter files debug');
    
    // キャラクターID一覧（手動指定）
    const characterIds = [
      'character-sato', 
      'character-suzuki', 
      'character-takahashi',
      'character-yamada'
    ];
    
    // パラメータファイルの検索
    const fileResults: Record<string, any> = {};
    const potentialParameterFiles: string[] = [];
    
    // 各キャラクターのパラメータファイルを探索
    for (const charId of characterIds) {
      const possiblePaths = [
        `${charId}.json`,
        `data/${charId}.json`,
        `data/character-${charId}.json`,
        `parameters/${charId}.json`,
        `data/parameters/${charId}.json`,
        `character-parameters/${charId}.json`,
        `data/character-parameters/${charId}.json`
      ];
      
      fileResults[charId] = {};
      
      for (const path of possiblePaths) {
        try {
          const exists = await storageProvider.fileExists(path);
          fileResults[charId][path] = exists ? 'Exists' : 'Not found';
          
          if (exists) {
            potentialParameterFiles.push(path);
            // 内容をチェック
            try {
              const content = await storageProvider.readFile(path);
              const parsed = JSON.parse(content);
              fileResults[charId][`${path} (content)`] = `Contains ${parsed.length} parameters`;
              
              // パラメータの一部を表示
              if (Array.isArray(parsed) && parsed.length > 0) {
                const sampleParams = parsed.slice(0, 3).map((p: any) => 
                  `${p.id || 'unknown'}: ${p.value !== undefined ? p.value : 'no value'}`
                ).join(', ');
                fileResults[charId][`${path} (sample)`] = sampleParams;
              }
            } catch (parseError) {
              fileResults[charId][`${path} (content)`] = `Error: ${parseError instanceof Error ? parseError.message : String(parseError)}`;
            }
          }
        } catch (error) {
          fileResults[charId][path] = `Error: ${error instanceof Error ? error.message : String(error)}`;
        }
      }
    }
    
    // キャラクターファイル自体の確認
    const characterFiles: Record<string, any> = {};
    for (const charId of characterIds) {
      const possibleCharPaths = [
        `characters/main/${charId}.yaml`,
        `data/characters/main/${charId}.yaml`
      ];
      
      characterFiles[charId] = {};
      
      for (const path of possibleCharPaths) {
        try {
          const exists = await storageProvider.fileExists(path);
          characterFiles[charId][path] = exists ? 'Exists' : 'Not found';
          
          if (exists) {
            try {
              // 内容を一部表示（YAMLなので単純にpreviewとして表示）
              const content = await storageProvider.readFile(path);
              characterFiles[charId][`${path} (preview)`] = content.substring(0, 200) + '...';
            } catch (readError) {
              characterFiles[charId][`${path} (error)`] = `${readError instanceof Error ? readError.message : String(readError)}`;
            }
          }
        } catch (error) {
          characterFiles[charId][path] = `Error: ${error instanceof Error ? error.message : String(error)}`;
        }
      }
    }
    
    // ディレクトリ構造の確認
    const dirStructure: Record<string, any> = {};
    const checkDirs = [
      'parameters',
      'data/parameters',
      'character-parameters',
      'data/character-parameters',
      'characters/main',
      'data/characters/main'
    ];
    
    for (const dir of checkDirs) {
      try {
        const exists = await storageProvider.directoryExists(dir);
        dirStructure[dir] = exists;
        
        if (exists) {
          try {
            const files = await storageProvider.listFiles(dir);
            dirStructure[`${dir}_files`] = files;
          } catch (error) {
            dirStructure[`${dir}_files_error`] = `${error instanceof Error ? error.message : String(error)}`;
          }
        }
      } catch (error) {
        dirStructure[`${dir}_error`] = `${error instanceof Error ? error.message : String(error)}`;
      }
    }
    
    // 結果をログに出力
    logger.info('Parameter files debug results', {
      fileResults,
      characterFiles,
      directoryStructure: dirStructure,
      potentialParameterFiles
    });
    
    // レスポンスを返す
    return NextResponse.json({
      success: true,
      fileResults,
      characterFiles,
      directoryStructure: dirStructure,
      potentialParameterFiles
    });
  } catch (error) {
    logger.error('Parameter files debug error', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}