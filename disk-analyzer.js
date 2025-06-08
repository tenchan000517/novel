#!/usr/bin/env node

/**
 * Next.js ディスク容量・ファイルサイズ分析ツール (JavaScript版)
 * 使用方法: node disk-analyzer.js
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

// 色付きコンソール出力
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function colorLog(color, text) {
    console.log(`${colors[color]}${text}${colors.reset}`);
}

// バイト数を人間が読みやすい形式に変換
function formatBytes(bytes) {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let unitIndex = 0;
    let size = bytes;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }
    
    return `${size.toFixed(1)}${units[unitIndex]}`;
}

// ディスク使用量をチェック
async function checkDiskUsage() {
    colorLog('cyan', '\n🔍 ディスク使用量チェック');
    console.log('='.repeat(50));
    
    try {
        const { spawn } = require('child_process');
        
        return new Promise((resolve) => {
            const dfProcess = spawn('df', ['-h', '.'], { stdio: ['pipe', 'pipe', 'pipe'] });
            
            dfProcess.stdout.on('data', (data) => {
                const lines = data.toString().split('\n');
                if (lines[1]) {
                    const parts = lines[1].split(/\s+/);
                    const total = parts[1];
                    const used = parts[2];
                    const available = parts[3];
                    const usePercent = parts[4];
                    
                    console.log(`総容量:     ${total}`);
                    console.log(`使用量:     ${used} (${usePercent})`);
                    console.log(`空き容量:   ${available}`);
                    
                    const percentNum = parseInt(usePercent.replace('%', ''));
                    if (percentNum > 95) {
                        colorLog('red', '🚨 警告: ディスク使用率が95%を超えています！');
                    } else if (percentNum > 90) {
                        colorLog('yellow', '⚠️  注意: ディスク使用率が90%を超えています');
                    } else {
                        colorLog('green', '✅ ディスク容量は正常です');
                    }
                    
                    resolve(percentNum);
                }
            });
            
            dfProcess.stderr.on('data', (data) => {
                console.error(`df エラー: ${data}`);
                resolve(null);
            });
            
            dfProcess.on('close', () => {
                resolve(null);
            });
        });
    } catch (error) {
        colorLog('red', `❌ ディスク使用量取得エラー: ${error.message}`);
        return null;
    }
}

// ディレクトリサイズを再帰的に計算
async function getDirectorySize(dirPath) {
    let totalSize = 0;
    
    try {
        const items = await readdir(dirPath);
        
        for (const item of items) {
            const itemPath = path.join(dirPath, item);
            try {
                const stats = await stat(itemPath);
                
                if (stats.isDirectory()) {
                    // 無視するディレクトリをスキップ
                    if (['.git', 'node_modules', '.next', '__pycache__'].includes(item)) {
                        continue;
                    }
                    totalSize += await getDirectorySize(itemPath);
                } else {
                    totalSize += stats.size;
                }
            } catch (error) {
                // アクセス権限エラーなどをスキップ
                continue;
            }
        }
    } catch (error) {
        // ディレクトリアクセスエラーをスキップ
    }
    
    return totalSize;
}

// 大きなファイルを検索
async function findLargeFiles(directory = '.', minSizeMB = 50, maxResults = 20) {
    colorLog('cyan', `\n📁 大きなファイル検索 (>${minSizeMB}MB)`);
    console.log('='.repeat(50));
    
    const largeFiles = [];
    const minSizeBytes = minSizeMB * 1024 * 1024;
    
    async function searchDirectory(dirPath) {
        try {
            const items = await readdir(dirPath);
            
            for (const item of items) {
                const itemPath = path.join(dirPath, item);
                try {
                    const stats = await stat(itemPath);
                    
                    if (stats.isDirectory()) {
                        // 無視するディレクトリをスキップ
                        if (['.git', '__pycache__', '.next', 'node_modules'].includes(item)) {
                            continue;
                        }
                        await searchDirectory(itemPath);
                    } else if (stats.size >= minSizeBytes) {
                        largeFiles.push({ path: itemPath, size: stats.size });
                    }
                } catch (error) {
                    continue;
                }
            }
        } catch (error) {
            // ディレクトリアクセスエラーをスキップ
        }
    }
    
    await searchDirectory(directory);
    
    // サイズ順にソート
    largeFiles.sort((a, b) => b.size - a.size);
    
    if (largeFiles.length > 0) {
        console.log(`見つかった大きなファイル (上位${Math.min(largeFiles.length, maxResults)}件):`);
        largeFiles.slice(0, maxResults).forEach((file, index) => {
            console.log(`${(index + 1).toString().padStart(2)}. ${formatBytes(file.size).padStart(8)} - ${file.path}`);
        });
    } else {
        console.log(`${minSizeMB}MB以上のファイルは見つかりませんでした`);
    }
    
    return largeFiles;
}

// ディレクトリサイズを分析
async function analyzeDirectorySizes(directory = '.', maxResults = 15) {
    colorLog('cyan', '\n📊 ディレクトリサイズ分析');
    console.log('='.repeat(50));
    
    const dirSizes = new Map();
    
    try {
        const items = await readdir(directory);
        
        for (const item of items) {
            const itemPath = path.join(directory, item);
            try {
                const stats = await stat(itemPath);
                
                if (stats.isDirectory() && !item.startsWith('.')) {
                    console.log(`分析中: ${item}...`);
                    const size = await getDirectorySize(itemPath);
                    dirSizes.set(itemPath, size);
                }
            } catch (error) {
                continue;
            }
        }
        
        // サイズ順にソート
        const sortedDirs = Array.from(dirSizes.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, maxResults);
        
        if (sortedDirs.length > 0) {
            console.log(`\nディレクトリサイズ (上位${sortedDirs.length}件):`);
            sortedDirs.forEach(([dirPath, size], index) => {
                const relativePath = path.relative(directory, dirPath) || '(current directory)';
                console.log(`${(index + 1).toString().padStart(2)}. ${formatBytes(size).padStart(8)} - ${relativePath}`);
            });
        }
        
        return sortedDirs;
    } catch (error) {
        colorLog('red', `❌ ディレクトリ分析エラー: ${error.message}`);
        return [];
    }
}

// Next.js特有の問題をチェック
async function checkNextJSSpecific() {
    colorLog('cyan', '\n⚛️  Next.js特有の問題チェック');
    console.log('='.repeat(50));
    
    const issues = [];
    
    // .next ディレクトリのチェック
    const nextDir = '.next';
    if (fs.existsSync(nextDir)) {
        try {
            const size = await getDirectorySize(nextDir);
            console.log(`.next ディレクトリサイズ: ${formatBytes(size)}`);
            if (size > 500 * 1024 * 1024) { // 500MB
                issues.push(`.next ディレクトリが大きすぎます (${formatBytes(size)})`);
            }
        } catch (error) {
            console.log(`.next ディレクトリサイズ取得エラー: ${error.message}`);
        }
    }
    
    // node_modules のチェック
    const nodeModules = 'node_modules';
    if (fs.existsSync(nodeModules)) {
        try {
            const size = await getDirectorySize(nodeModules);
            console.log(`node_modules サイズ: ${formatBytes(size)}`);
            if (size > 2 * 1024 * 1024 * 1024) { // 2GB
                issues.push(`node_modules が大きすぎます (${formatBytes(size)})`);
            }
        } catch (error) {
            console.log(`node_modules サイズ取得エラー: ${error.message}`);
        }
    }
    
    // キャッシュディレクトリのチェック
    const cacheDirs = [
        'node_modules/.cache',
        '.next/cache',
        'src/.next'
    ];
    
    for (const cacheDir of cacheDirs) {
        if (fs.existsSync(cacheDir)) {
            try {
                const size = await getDirectorySize(cacheDir);
                console.log(`${cacheDir} サイズ: ${formatBytes(size)}`);
                if (size > 100 * 1024 * 1024) { // 100MB
                    issues.push(`${cacheDir} キャッシュが大きいです (${formatBytes(size)})`);
                }
            } catch (error) {
                console.log(`${cacheDir} サイズ取得エラー: ${error.message}`);
            }
        }
    }
    
    // 推奨クリーンアップ
    if (issues.length > 0) {
        colorLog('yellow', '\n⚠️  発見された問題:');
        issues.forEach(issue => {
            console.log(`  • ${issue}`);
        });
        
        colorLog('green', '\n🔧 推奨クリーンアップコマンド:');
        console.log('  rm -rf .next/');
        console.log('  rm -rf node_modules/.cache/');
        if (issues.some(issue => issue.includes('.next'))) {
            console.log('  npm run build  # 再ビルド');
        }
    } else {
        colorLog('green', '✅ Next.js関連の問題は見つかりませんでした');
    }
    
    return issues;
}

// クリーンアップスクリプトを生成
function generateCleanupScript() {
    colorLog('cyan', '\n🧹 クリーンアップスクリプト生成');
    console.log('='.repeat(50));
    
    const cleanupScript = `#!/bin/bash
# 自動生成されたクリーンアップスクリプト

echo "🧹 ディスク容量確保のためのクリーンアップ開始..."

# Next.js関連の一時ファイル削除
echo "Next.js一時ファイルを削除中..."
rm -rf .next/
rm -rf node_modules/.cache/

# システム一時ファイル削除 (Windows)
echo "システム一時ファイルを削除中..."
rm -rf /c/Users/$USER/AppData/Local/Temp/* 2>/dev/null || true

# ログファイル削除
echo "ログファイルを削除中..."
find . -name "*.log" -size +10M -delete 2>/dev/null || true

echo "✅ クリーンアップ完了！"
echo "ディスク容量を確認してください: df -h ."
`;
    
    fs.writeFileSync('cleanup.sh', cleanupScript);
    console.log('cleanup.sh を生成しました');
    console.log('実行方法: chmod +x cleanup.sh && ./cleanup.sh');
}

// メイン実行関数
async function main() {
    colorLog('blue', '🔍 Next.js ディスク容量・ファイルサイズ分析ツール (JavaScript版)');
    console.log('='.repeat(70));
    
    try {
        // ディスク使用量チェック
        const diskUsage = await checkDiskUsage();
        
        // 大きなファイル検索
        const largeFiles = await findLargeFiles(process.cwd(), 50);
        
        // ディレクトリサイズ分析
        const directorySizes = await analyzeDirectorySizes();
        
        // Next.js特有の問題チェック
        const nextjsIssues = await checkNextJSSpecific();
        
        // 総合診断
        colorLog('cyan', '\n🎯 総合診断結果');
        console.log('='.repeat(50));
        
        if (diskUsage && diskUsage > 95) {
            colorLog('red', '🚨 緊急: ディスク容量不足がNext.js起動を阻害している可能性があります');
        } else if (diskUsage && diskUsage > 90) {
            colorLog('yellow', '⚠️  注意: ディスク容量が不足気味です');
        }
        
        if (largeFiles.length > 0) {
            console.log(`📁 ${largeFiles.length}個の大きなファイルが見つかりました`);
        }
        
        if (nextjsIssues.length > 0) {
            console.log(`⚛️  ${nextjsIssues.length}個のNext.js関連問題が見つかりました`);
            generateCleanupScript();
        }
        
        colorLog('green', '\n完了! 詳細な情報は上記を参照してください。');
        
    } catch (error) {
        colorLog('red', `❌ 実行エラー: ${error.message}`);
        process.exit(1);
    }
}

// スクリプト実行
if (require.main === module) {
    main().catch(error => {
        colorLog('red', `❌ 予期しないエラー: ${error.message}`);
        process.exit(1);
    });
}