// src/app/api/generation/chapter/debug/skill/route.ts
import { NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';
import { storageProvider } from '@/lib/storage';

export async function GET() {
  try {
    logger.info('Starting skill system direct debug');
    
    // スキルシステムは直接使わず、ファイルシステムを直接チェック
    const fileResults: Record<string, string> = {};
    const possiblePaths = [
      'definitions.json',
      'skills/definitions.json',
      'data/skills/definitions.json',
      'data\\skills\\definitions.json',
      './data/skills/definitions.json'
    ];
    
    for (const path of possiblePaths) {
      try {
        const exists = await storageProvider.fileExists(path);
        fileResults[path] = exists ? 'Exists' : 'Not found';
        
        if (exists) {
          // 内容を確認
          const content = await storageProvider.readFile(path);
          try {
            const parsed = JSON.parse(content);
            fileResults[`${path} (content)`] = `Contains ${parsed.length} items`;
            
            // 特定のスキルがこのファイルに含まれているか確認
            const criticalSkills = [
              'skill-a-technology-development',
              'skill-prototype-creation',
              'skill-persona-creation',
              'skill-market-research'
            ];
            
            for (const skillId of criticalSkills) {
              const found = parsed.some((item: any) => item.id === skillId);
              fileResults[`${path} contains ${skillId}`] = found ? 'Yes' : 'No';
            }
          } catch (parseError) {
            fileResults[`${path} (content)`] = `Invalid JSON: ${parseError instanceof Error ? parseError.message : String(parseError)}`;
          }
        }
      } catch (error) {
        fileResults[path] = `Error: ${error instanceof Error ? error.message : String(error)}`;
      }
    }
    
    // ディレクトリ構造を確認
    let dirStructure: Record<string, any> = {};
    try {
      // ベースディレクトリ確認
      const baseExists = await storageProvider.directoryExists('');
      dirStructure['base'] = baseExists;
      
      // data ディレクトリ確認
      const dataExists = await storageProvider.directoryExists('data');
      dirStructure['data'] = dataExists;
      
      // skills ディレクトリ確認
      const skillsExists = await storageProvider.directoryExists('skills');
      dirStructure['skills'] = skillsExists;
      
      // data/skills ディレクトリ確認
      const dataSkillsExists = await storageProvider.directoryExists('data/skills');
      dirStructure['data/skills'] = dataSkillsExists;
      
      // data ディレクトリ内のファイル一覧
      if (dataExists) {
        try {
          const dataFiles = await storageProvider.listFiles('data');
          dirStructure['data_files'] = dataFiles;
        } catch (error) {
          dirStructure['data_files_error'] = `${error instanceof Error ? error.message : String(error)}`;
        }
      }
      
      // data/skills ディレクトリ内のファイル一覧
      if (dataSkillsExists) {
        try {
          const skillFiles = await storageProvider.listFiles('data/skills');
          dirStructure['data_skills_files'] = skillFiles;
        } catch (error) {
          dirStructure['data_skills_files_error'] = `${error instanceof Error ? error.message : String(error)}`;
        }
      }
    } catch (error) {
      dirStructure['error'] = `${error instanceof Error ? error.message : String(error)}`;
    }
    
    // 結果をログに出力
    logger.info('Skill system direct debug results', {
      fileSystemCheck: fileResults,
      directoryStructure: dirStructure
    });
    
    // レスポンスを返す
    return NextResponse.json({
      success: true,
      fileSystemCheck: fileResults,
      directoryStructure: dirStructure
    });
  } catch (error) {
    logger.error('Skill system direct debug error', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}