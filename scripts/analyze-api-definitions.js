#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class SimpleAICallsAnalyzer {
  constructor() {
    // AI呼び出しパターン（厳選）
    this.aiCallPatterns = [
      /(\w+\.)?(?:generateText|generateContent|generateResponse|chat|complete)\s*\(/g,
      /(\w+\.)?generate(?:Chapter|Story|Character|Dialogue|Plot|Scene)\s*\(/g,
      /(?:gemini|openai|anthropic|claude|gpt)\.\w+\s*\(/g,
      /(?:geminiClient|aiService|llmService)\.\w+\s*\(/g,
      /\.(?:generateText|generateContent|createCompletion|createChatCompletion)\s*\(/g
    ];

    // プロンプト抽出パターン（簡易版）
    this.promptPatterns = [
      /prompt\s*[:=]\s*[`"']([^`"']{30,})[`"']/gs,
      /content\s*[:=]\s*[`"']([^`"']{30,})[`"']/gs,
      /message\s*[:=]\s*[`"']([^`"']{30,})[`"']/gs,
      /`([^`]{50,})`/gs
    ];
  }

  // ディレクトリ走査（シンプル版）
  getAllFiles(dirPath, fileList = []) {
    try {
      const files = fs.readdirSync(dirPath);
      
      files.forEach(file => {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          if (!this.shouldSkipDirectory(file)) {
            this.getAllFiles(filePath, fileList);
          }
        } else if (this.shouldIncludeFile(file)) {
          fileList.push(filePath);
        }
      });
    } catch (error) {
      console.warn(`⚠️  ディレクトリ読み込みエラー: ${dirPath}`);
    }
    
    return fileList;
  }

  shouldSkipDirectory(dirName) {
    return ['node_modules', '.git', 'dist', 'build', '.next'].includes(dirName) || dirName.startsWith('.');
  }

  shouldIncludeFile(fileName) {
    return (fileName.endsWith('.ts') || fileName.endsWith('.js') || fileName.endsWith('.tsx') || fileName.endsWith('.jsx')) 
      && !fileName.includes('copy') 
      && !fileName.includes('.min.')
      && !fileName.includes('.d.ts');
  }

  // AI呼び出し抽出（シンプル版）
  extractAICallsFromFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      const calls = [];

      this.aiCallPatterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const lineNumber = this.getLineNumber(content, match.index);
          const lineContent = lines[lineNumber - 1]?.trim() || '';
          
          const call = {
            file: filePath.replace(process.cwd() + path.sep, ''),
            line: lineNumber,
            method: this.extractMethodName(match[0]),
            code: lineContent,
            prompt: this.extractPromptFromContext(content, match.index),
            expectedOutput: this.extractExpectedOutput(content, match.index),
            hash: this.generateHash(filePath, lineNumber, lineContent)
          };

          calls.push(call);
        }
        pattern.lastIndex = 0;
      });

      return calls;
    } catch (error) {
      console.warn(`⚠️  ファイル処理エラー: ${filePath}`);
      return [];
    }
  }

  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  extractMethodName(matchText) {
    const match = matchText.match(/(\w+)\s*\(/);
    return match ? match[1] : 'unknown';
  }

  // プロンプト抽出（シンプル版）
  extractPromptFromContext(content, matchIndex) {
    const contextStart = Math.max(0, matchIndex - 1000);
    const contextEnd = Math.min(content.length, matchIndex + 500);
    const context = content.substring(contextStart, contextEnd);

    for (const pattern of this.promptPatterns) {
      pattern.lastIndex = 0;
      const match = pattern.exec(context);
      if (match && match[1]) {
        const promptText = match[1].trim();
        return {
          text: this.truncateText(promptText, 200),
          fullLength: promptText.length,
          type: this.guessPromptType(promptText)
        };
      }
    }

    return { text: '不明', fullLength: 0, type: 'unknown' };
  }

  // 出力推定（シンプル版）
  extractExpectedOutput(content, matchIndex) {
    const contextStart = Math.max(0, matchIndex - 200);
    const contextEnd = Math.min(content.length, matchIndex + 1000);
    const context = content.substring(contextStart, contextEnd);

    // インターフェース検出
    const interfaceMatch = context.match(/interface\s+(\w+(?:Response|Result|Chapter|Story|Character))/i);
    if (interfaceMatch) {
      return { type: 'interface', name: interfaceMatch[1] };
    }

    // 型注釈検出
    const typeMatch = context.match(/:\s*(?:Promise<([^>]+)>|([A-Z]\w+))/);
    if (typeMatch) {
      return { type: 'type', name: typeMatch[1] || typeMatch[2] };
    }

    // JSON検出
    if (/JSON\.parse|\.json\(\)/.test(context)) {
      return { type: 'json', name: 'JSON' };
    }

    // 小説要素検出
    const novelMatch = context.match(/(chapter|story|character|dialogue|plot)/i);
    if (novelMatch) {
      return { type: 'novel', name: novelMatch[1] };
    }

    return { type: 'unknown', name: '不明' };
  }

  truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  guessPromptType(text) {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('chapter') || lowerText.includes('章')) return '章生成';
    if (lowerText.includes('character') || lowerText.includes('キャラクター')) return 'キャラクター生成';
    if (lowerText.includes('story') || lowerText.includes('物語')) return 'ストーリー生成';
    if (lowerText.includes('dialogue') || lowerText.includes('会話')) return '会話生成';
    if (lowerText.includes('analyze') || lowerText.includes('分析')) return '分析';
    if (lowerText.includes('generate') || lowerText.includes('生成')) return '生成';
    
    return '汎用';
  }

  generateHash(filePath, lineNumber, content) {
    return crypto.createHash('md5')
      .update(`${filePath}:${lineNumber}:${content}`)
      .digest('hex')
      .substring(0, 8);
  }

  // 重複分析（シンプル版）
  findDuplicates(calls) {
    const hashGroups = {};
    const promptGroups = {};

    calls.forEach(call => {
      // 完全重複
      if (!hashGroups[call.hash]) {
        hashGroups[call.hash] = [];
      }
      hashGroups[call.hash].push(call);

      // プロンプト類似性
      if (call.prompt.text !== '不明') {
        const promptKey = this.normalizePrompt(call.prompt.text);
        if (!promptGroups[promptKey]) {
          promptGroups[promptKey] = [];
        }
        promptGroups[promptKey].push(call);
      }
    });

    return {
      exactDuplicates: Object.values(hashGroups).filter(group => group.length > 1),
      promptSimilar: Object.values(promptGroups).filter(group => group.length > 1)
    };
  }

  normalizePrompt(text) {
    return text.toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[`"']/g, '')
      .substring(0, 100);
  }

  // 統計生成（シンプル版）
  generateStats(calls, duplicates) {
    const methodCounts = {};
    const typeCounts = {};
    const fileCounts = {};

    calls.forEach(call => {
      methodCounts[call.method] = (methodCounts[call.method] || 0) + 1;
      typeCounts[call.prompt.type] = (typeCounts[call.prompt.type] || 0) + 1;
      fileCounts[call.file] = (fileCounts[call.file] || 0) + 1;
    });

    return {
      total: calls.length,
      uniqueFiles: Object.keys(fileCounts).length,
      duplicateGroups: duplicates.exactDuplicates.length,
      promptSimilarGroups: duplicates.promptSimilar.length,
      topMethods: Object.entries(methodCounts).sort(([,a], [,b]) => b - a).slice(0, 5),
      topTypes: Object.entries(typeCounts).sort(([,a], [,b]) => b - a).slice(0, 5),
      busyFiles: Object.entries(fileCounts).sort(([,a], [,b]) => b - a).slice(0, 10)
    };
  }

  // メイン実行
  async analyzeProject(projectPath = './src') {
    console.log('🔍 AI呼び出し分析開始...');
    
    const files = this.getAllFiles(projectPath);
    console.log(`📁 ${files.length} ファイルを検査中...`);

    let allCalls = [];
    
    files.forEach((file, index) => {
      if (index % 20 === 0) {
        console.log(`📋 進捗: ${index}/${files.length}`);
      }
      
      const calls = this.extractAICallsFromFile(file);
      allCalls = allCalls.concat(calls);
    });

    console.log(`🎯 ${allCalls.length} 個のAI呼び出しを検出`);

    const duplicates = this.findDuplicates(allCalls);
    const stats = this.generateStats(allCalls, duplicates);

    // 結果整理
    const result = {
      summary: {
        timestamp: new Date().toISOString(),
        totalCalls: stats.total,
        uniqueFiles: stats.uniqueFiles,
        duplicateGroups: stats.duplicateGroups,
        promptSimilarGroups: stats.promptSimilarGroups
      },
      calls: allCalls.map(call => ({
        file: call.file,
        line: call.line,
        method: call.method,
        promptType: call.prompt.type,
        promptText: call.prompt.text,
        promptLength: call.prompt.fullLength,
        expectedOutput: call.expectedOutput.name,
        outputType: call.expectedOutput.type
      })),
      duplicates: {
        exact: duplicates.exactDuplicates.map(group => ({
          count: group.length,
          locations: group.map(call => `${call.file}:${call.line}`)
        })),
        promptSimilar: duplicates.promptSimilar.map(group => ({
          count: group.length,
          promptPreview: group[0].prompt.text.substring(0, 50) + '...',
          locations: group.map(call => `${call.file}:${call.line}`)
        }))
      },
      statistics: {
        topMethods: stats.topMethods,
        topPromptTypes: stats.topTypes,
        busyFiles: stats.busyFiles
      }
    };

    // 保存
    const outputFile = `ai-calls-simple-${Date.now()}.json`;
    fs.writeFileSync(outputFile, JSON.stringify(result, null, 2));

    // 表示
    this.displayResults(result, outputFile);

    return result;
  }

  // 結果表示
  displayResults(result, outputFile) {
    console.log('\n🎉 分析完了!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    console.log(`📊 サマリー:`);
    console.log(`   • 総AI呼び出し数: ${result.summary.totalCalls}`);
    console.log(`   • 対象ファイル数: ${result.summary.uniqueFiles}`);
    console.log(`   • 完全重複グループ: ${result.summary.duplicateGroups}`);
    console.log(`   • プロンプト類似グループ: ${result.summary.promptSimilarGroups}`);

    console.log(`\n🏆 最頻出メソッド:`);
    result.statistics.topMethods.forEach(([method, count], i) => {
      console.log(`   ${i+1}. ${method}: ${count}回`);
    });

    console.log(`\n📝 プロンプトタイプ分布:`);
    result.statistics.topPromptTypes.forEach(([type, count], i) => {
      console.log(`   ${i+1}. ${type}: ${count}回`);
    });

    if (result.duplicates.exact.length > 0) {
      console.log(`\n⚠️  完全重複コード:`);
      result.duplicates.exact.slice(0, 3).forEach((dup, i) => {
        console.log(`   ${i+1}. ${dup.count}箇所で重複:`);
        dup.locations.forEach(loc => console.log(`      - ${loc}`));
      });
    }

    if (result.duplicates.promptSimilar.length > 0) {
      console.log(`\n🔄 類似プロンプト:`);
      result.duplicates.promptSimilar.slice(0, 3).forEach((sim, i) => {
        console.log(`   ${i+1}. ${sim.count}箇所で類似: "${sim.promptPreview}"`);
        sim.locations.forEach(loc => console.log(`      - ${loc}`));
      });
    }

    console.log(`\n📁 AI呼び出し頻度が高いファイル:`);
    result.statistics.busyFiles.slice(0, 5).forEach(([file, count], i) => {
      console.log(`   ${i+1}. ${file}: ${count}回`);
    });

    console.log(`\n💾 詳細結果: ${outputFile}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // テーブル形式でも表示
    console.log('📋 AI呼び出し一覧（最初の10件）:');
    console.log('ファイル:行番号 | メソッド | プロンプトタイプ | 期待出力 | プロンプト抜粋');
    console.log('─'.repeat(100));
    
    result.calls.slice(0, 10).forEach(call => {
      const location = `${call.file}:${call.line}`.padEnd(25);
      const method = call.method.padEnd(15);
      const promptType = call.promptType.padEnd(12);
      const output = call.expectedOutput.padEnd(12);
      const prompt = call.promptText.substring(0, 30) + (call.promptText.length > 30 ? '...' : '');
      
      console.log(`${location} | ${method} | ${promptType} | ${output} | ${prompt}`);
    });

    if (result.calls.length > 10) {
      console.log(`... 他 ${result.calls.length - 10} 件\n`);
    }
  }
}

// CLI実行
if (require.main === module) {
  const analyzer = new SimpleAICallsAnalyzer();
  const projectPath = process.argv[2] || './src';
  
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
🔍 Simple AI Calls Analyzer

使用方法:
  node ${path.basename(__filename)} [プロジェクトパス]

例:
  node ${path.basename(__filename)} ./src
  node ${path.basename(__filename)} ../my-project

出力情報:
  • ファイル名と行番号
  • 呼び出しメソッド名
  • プロンプトの内容（抜粋）
  • 期待される出力タイプ
  • 重複箇所の検出

特徴:
  ✅ シンプルで読みやすい結果
  ✅ 重複検出
  ✅ 要点に絞った分析
  ✅ コンパクトなJSON出力
`);
    process.exit(0);
  }
  
  analyzer.analyzeProject(projectPath)
    .then(() => {
      console.log('✅ 分析完了!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ エラー:', error.message);
      process.exit(1);
    });
}

module.exports = SimpleAICallsAnalyzer;