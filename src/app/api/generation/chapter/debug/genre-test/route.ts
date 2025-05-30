// src/app/api/generation/chapter/debug/genre-test/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { WorldSettingsManager } from '@/lib/plot/world-settings-manager';
import { plotManager } from '@/lib/plot';
import { storageProvider } from '@/lib/storage';

interface GenreTestResult {
  timestamp: string;
  tests: {
    storageProvider: {
      success: boolean;
      fileExists: boolean;
      fileContent?: string;
      error?: string;
    };
    worldSettingsManager: {
      success: boolean;
      initialized: boolean;
      hasWorldSettings: boolean;
      worldSettingsContent?: any;
      genre?: string;
      error?: string;
    };
    plotManager: {
      success: boolean;
      genre?: string;
      error?: string;
    };
    directFileRead: {
      success: boolean;
      content?: string;
      parsedContent?: any;
      genre?: string;
      error?: string;
    };
  };
}

export async function GET(request: NextRequest) {
  const result: GenreTestResult = {
    timestamp: new Date().toISOString(),
    tests: {
      storageProvider: { success: false, fileExists: false },
      worldSettingsManager: { success: false, initialized: false, hasWorldSettings: false },
      plotManager: { success: false },
      directFileRead: { success: false }
    }
  };

  console.log('🧪 Starting Genre Test Suite');
  console.log('================================');

  // 1. ストレージプロバイダー直接テスト
  console.log('📁 Testing StorageProvider...');
  try {
    const filePath = 'config/world-settings.yaml';
    console.log(`   Checking file: ${filePath}`);
    
    const fileExists = await storageProvider.fileExists(filePath);
    result.tests.storageProvider.fileExists = fileExists;
    
    if (fileExists) {
      const content = await storageProvider.readFile(filePath);
      result.tests.storageProvider.fileContent = content.substring(0, 200); // 最初の200文字
      result.tests.storageProvider.success = true;
      console.log('   ✅ StorageProvider: File exists and readable');
      console.log(`   📄 Content preview: ${content.substring(0, 100)}...`);
    } else {
      console.log(`   ❌ StorageProvider: File not found at ${filePath}`);
      
      // 代替パスも試してみる
      const altPath = 'data/config/world-settings.yaml';
      console.log(`   🔍 Trying alternative path: ${altPath}`);
      const altExists = await storageProvider.fileExists(altPath);
      console.log(`   Alternative path exists: ${altExists}`);
    }
  } catch (error) {
    result.tests.storageProvider.error = error instanceof Error ? error.message : String(error);
    console.log('   ❌ StorageProvider error:', error);
  }

  // 2. WorldSettingsManager直接テスト  
  console.log('🌍 Testing WorldSettingsManager...');
  try {
    const worldSettingsManager = new WorldSettingsManager();
    console.log('   Initializing WorldSettingsManager...');
    await worldSettingsManager.initialize();
    
    result.tests.worldSettingsManager.initialized = true;
    console.log('   ✅ WorldSettingsManager initialized');
    
    const worldSettings = await worldSettingsManager.getWorldSettings();
    result.tests.worldSettingsManager.hasWorldSettings = !!worldSettings;
    result.tests.worldSettingsManager.worldSettingsContent = worldSettings;
    
    console.log('   📋 World settings loaded:', !!worldSettings);
    if (worldSettings) {
      console.log('   📋 World settings keys:', Object.keys(worldSettings));
    }
    
    const genre = await worldSettingsManager.getGenre();
    result.tests.worldSettingsManager.genre = genre;
    result.tests.worldSettingsManager.success = true;
    
    console.log('   🎭 Genre from WorldSettingsManager:', genre);
  } catch (error) {
    result.tests.worldSettingsManager.error = error instanceof Error ? error.message : String(error);
    console.log('   ❌ WorldSettingsManager error:', error);
  }

  // 3. PlotManager経由テスト
  console.log('📊 Testing PlotManager...');
  try {
    console.log('   Getting genre from PlotManager...');
    const genre = await plotManager.getGenre();
    result.tests.plotManager.genre = genre;
    result.tests.plotManager.success = true;
    
    console.log('   🎭 Genre from PlotManager:', genre);
  } catch (error) {
    result.tests.plotManager.error = error instanceof Error ? error.message : String(error);
    console.log('   ❌ PlotManager error:', error);
  }

  // 4. 直接ファイル読み込みテスト
  console.log('📖 Testing Direct File Read...');
  try {
    const fs = require('fs').promises;
    const path = require('path');
    
    // 複数のパスを試す
    const possiblePaths = [
      path.join(process.cwd(), 'data', 'config', 'world-settings.yaml'),
      path.join(process.cwd(), 'config', 'world-settings.yaml'),
      path.join(process.cwd(), 'src', 'data', 'config', 'world-settings.yaml')
    ];
    
    let content = null;
    let successPath = null;
    
    for (const filePath of possiblePaths) {
      console.log(`   🔍 Trying: ${filePath}`);
      try {
        content = await fs.readFile(filePath, 'utf8');
        successPath = filePath;
        console.log(`   ✅ Found file at: ${filePath}`);
        break;
      } catch (err) {
        console.log(`   ❌ Not found: ${filePath}`);
      }
    }
    
    if (content && successPath) {
      result.tests.directFileRead.content = content.substring(0, 200);
      
      // YAMLパース（簡易）
      try {
        // 簡易YAML解析（genreの行のみ抽出）
        const lines = content.split('\n');
        const genreLine = lines.find(line => line.trim().startsWith('genre:'));
        const genre = genreLine ? genreLine.split(':')[1].trim().replace(/['"#]/g, '').split(' ')[0] : null;
        
        result.tests.directFileRead.parsedContent = { genre };
        result.tests.directFileRead.genre = genre;
        result.tests.directFileRead.success = true;
        
        console.log('   🎭 Parsed genre:', genre);
        console.log('   📄 File preview:', content.substring(0, 150));
      } catch (parseError) {
        console.log('   ⚠️  Parse error:', parseError);
        result.tests.directFileRead.success = true; // ファイルは読めた
      }
    } else {
      result.tests.directFileRead.error = 'File not found in any expected location';
    }
  } catch (error) {
    result.tests.directFileRead.error = error instanceof Error ? error.message : String(error);
    console.log('   ❌ Direct file read error:', error);
  }

  // 結果サマリー
  console.log('================================');
  console.log('📊 TEST RESULTS SUMMARY:');
  console.log(`📁 StorageProvider: ${result.tests.storageProvider.success ? '✅' : '❌'}`);
  console.log(`🌍 WorldSettingsManager: ${result.tests.worldSettingsManager.success ? '✅' : '❌'}`);
  console.log(`📊 PlotManager: ${result.tests.plotManager.success ? '✅' : '❌'}`);
  console.log(`📖 Direct File Read: ${result.tests.directFileRead.success ? '✅' : '❌'}`);
  console.log('================================');

  return NextResponse.json(result, { status: 200 });
}