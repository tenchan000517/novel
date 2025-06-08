#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 AI小説生成システム - 高度診断ツール');
console.log('==========================================\n');

const diagnostics = {
    errors: [],
    warnings: [],
    info: [],
    passed: []
};

function log(type, message) {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = {
        error: '❌',
        warning: '⚠️ ',
        info: 'ℹ️ ',
        success: '✅'
    };
    
    console.log(`${prefix[type]} [${timestamp}] ${message}`);
    diagnostics[type === 'error' ? 'errors' : type === 'warning' ? 'warnings' : type === 'info' ? 'info' : 'passed'].push(message);
}

function checkFile(filePath, description) {
    if (fs.existsSync(filePath)) {
        log('success', `${description}: ${filePath}`);
        return true;
    } else {
        log('error', `${description}が見つかりません: ${filePath}`);
        return false;
    }
}

function analyzePackageJson() {
    console.log('\n📦 package.json 分析');
    console.log('===================');
    
    if (!checkFile('package.json', 'package.json')) return;
    
    try {
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        
        // 重要な依存関係をチェック
        const requiredDeps = ['next', 'react', 'react-dom'];
        const requiredDevDeps = ['typescript', '@types/node', '@types/react'];
        
        requiredDeps.forEach(dep => {
            if (pkg.dependencies && pkg.dependencies[dep]) {
                log('success', `依存関係OK: ${dep}@${pkg.dependencies[dep]}`);
            } else {
                log('error', `重要な依存関係が不足: ${dep}`);
            }
        });
        
        requiredDevDeps.forEach(dep => {
            if (pkg.devDependencies && pkg.devDependencies[dep]) {
                log('success', `開発依存関係OK: ${dep}@${pkg.devDependencies[dep]}`);
            } else {
                log('warning', `開発依存関係が不足: ${dep}`);
            }
        });
        
        // スクリプトをチェック
        if (pkg.scripts && pkg.scripts.dev) {
            log('success', `dev スクリプト: ${pkg.scripts.dev}`);
        } else {
            log('error', 'dev スクリプトが定義されていません');
        }
        
    } catch (error) {
        log('error', `package.json の解析に失敗: ${error.message}`);
    }
}

function analyzeNextConfig() {
    console.log('\n⚙️  Next.js 設定分析');
    console.log('====================');
    
    const configFiles = ['next.config.js', 'next.config.mjs', 'next.config.ts'];
    let found = false;
    
    configFiles.forEach(file => {
        if (fs.existsSync(file)) {
            log('success', `Next.js設定ファイル: ${file}`);
            found = true;
            
            try {
                const content = fs.readFileSync(file, 'utf8');
                if (content.includes('experimental')) {
                    log('info', 'experimental 設定が含まれています');
                }
                if (content.includes('serverComponentsExternalPackages')) {
                    log('info', 'serverComponentsExternalPackages 設定があります');
                }
            } catch (error) {
                log('warning', `設定ファイルの読み取りに失敗: ${error.message}`);
            }
        }
    });
    
    if (!found) {
        log('warning', 'Next.js設定ファイルが見つかりません（オプション）');
    }
}

function analyzeTypeScriptConfig() {
    console.log('\n📝 TypeScript 設定分析');
    console.log('=======================');
    
    if (!checkFile('tsconfig.json', 'TypeScript設定')) return;
    
    try {
        const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
        
        // パスエイリアス確認
        if (tsconfig.compilerOptions && tsconfig.compilerOptions.paths) {
            log('success', 'パスエイリアス設定あり');
            Object.entries(tsconfig.compilerOptions.paths).forEach(([alias, paths]) => {
                log('info', `  ${alias} -> ${paths.join(', ')}`);
            });
        } else {
            log('warning', 'パスエイリアス設定がありません');
        }
        
        // 基本設定確認
        const important = ['strict', 'jsx', 'moduleResolution'];
        important.forEach(option => {
            if (tsconfig.compilerOptions && tsconfig.compilerOptions[option]) {
                log('success', `${option}: ${tsconfig.compilerOptions[option]}`);
            }
        });
        
    } catch (error) {
        log('error', `tsconfig.json の解析に失敗: ${error.message}`);
    }
}

function analyzeProjectStructure() {
    console.log('\n📁 プロジェクト構造分析');
    console.log('========================');
    
    // App Router 構造をチェック
    const appRouterFiles = [
        'src/app/layout.tsx',
        'src/app/page.tsx',
        'src/app/globals.css'
    ];
    
    let appRouterComplete = true;
    appRouterFiles.forEach(file => {
        if (!checkFile(file, 'App Router必須ファイル')) {
            appRouterComplete = false;
        }
    });
    
    if (appRouterComplete) {
        log('success', 'App Router構造は完全です');
    } else {
        log('error', 'App Router構造に不備があります');
    }
    
    // コンポーネント構造をチェック
    const componentDirs = ['src/components', 'src/lib', 'src/types'];
    componentDirs.forEach(dir => {
        if (fs.existsSync(dir)) {
            const files = fs.readdirSync(dir, { recursive: true });
            const tsFiles = files.filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));
            log('success', `${dir}: ${tsFiles.length}個のTypeScriptファイル`);
        } else {
            log('warning', `ディレクトリが見つかりません: ${dir}`);
        }
    });
}

function analyzeImports() {
    console.log('\n🔗 インポート分析');
    console.log('=================');
    
    const filesToCheck = [
        'src/app/layout.tsx',
        'src/app/page.tsx'
    ];
    
    filesToCheck.forEach(file => {
        if (fs.existsSync(file)) {
            try {
                const content = fs.readFileSync(file, 'utf8');
                const imports = content.match(/import.*from\s+['"`]([^'"`]+)['"`]/g) || [];
                
                log('info', `${file}: ${imports.length}個のインポート`);
                
                imports.forEach(imp => {
                    const match = imp.match(/from\s+['"`]([^'"`]+)['"`]/);
                    if (match) {
                        const module = match[1];
                        
                        // 相対パスかエイリアスパスをチェック
                        if (module.startsWith('@/')) {
                            const actualPath = module.replace('@/', 'src/');
                            const extensions = ['.ts', '.tsx', '.js', '.jsx'];
                            let found = false;
                            
                            for (const ext of extensions) {
                                if (fs.existsSync(actualPath + ext) || fs.existsSync(actualPath + '/index' + ext)) {
                                    found = true;
                                    break;
                                }
                            }
                            
                            if (!found && !fs.existsSync(actualPath)) {
                                log('error', `インポートエラー: ${module} (${actualPath}) が見つかりません`);
                            }
                        }
                    }
                });
            } catch (error) {
                log('error', `ファイル分析失敗: ${file} - ${error.message}`);
            }
        }
    });
}

function checkEnvironment() {
    console.log('\n🌍 環境変数分析');
    console.log('================');
    
    const envFiles = ['.env', '.env.local', '.env.development'];
    envFiles.forEach(file => {
        if (fs.existsSync(file)) {
            log('success', `環境変数ファイル: ${file}`);
        }
    });
    
    // 重要な環境変数をチェック
    const importantVars = ['GEMINI_API_KEY', 'REDIS_HOST', 'NODE_ENV'];
    importantVars.forEach(varName => {
        if (process.env[varName]) {
            log('success', `環境変数設定済み: ${varName}`);
        } else {
            log('warning', `環境変数未設定: ${varName}`);
        }
    });
}

function runQuickTypeCheck() {
    console.log('\n🔍 高速型チェック');
    console.log('==================');
    
    try {
        execSync('npx tsc --noEmit --skipLibCheck', { 
            stdio: 'pipe',
            timeout: 30000
        });
        log('success', 'TypeScript型チェック: エラーなし');
    } catch (error) {
        log('error', 'TypeScript型エラーが検出されました');
        
        // エラーの詳細を表示（最初の5行のみ）
        const errorLines = error.stdout.toString().split('\n').slice(0, 5);
        errorLines.forEach(line => {
            if (line.trim()) {
                console.log(`   ${line}`);
            }
        });
    }
}

function generateReport() {
    console.log('\n📊 診断レポート');
    console.log('================');
    
    console.log(`✅ 成功: ${diagnostics.passed.length}`);
    console.log(`⚠️  警告: ${diagnostics.warnings.length}`);
    console.log(`❌ エラー: ${diagnostics.errors.length}`);
    console.log(`ℹ️  情報: ${diagnostics.info.length}`);
    
    if (diagnostics.errors.length > 0) {
        console.log('\n🚨 重要なエラー:');
        diagnostics.errors.slice(0, 5).forEach(error => {
            console.log(`   • ${error}`);
        });
    }
    
    if (diagnostics.warnings.length > 0) {
        console.log('\n⚠️  警告事項:');
        diagnostics.warnings.slice(0, 3).forEach(warning => {
            console.log(`   • ${warning}`);
        });
    }
    
    console.log('\n🎯 推奨アクション:');
    if (diagnostics.errors.length > 0) {
        console.log('   1. 上記のエラーを修正してください');
        console.log('   2. npm install で依存関係を確認');
        console.log('   3. 不足ファイルを作成');
    } else {
        console.log('   1. npm run dev でサーバーを起動');
        console.log('   2. http://localhost:3000 でアクセス');
        console.log('   3. ブラウザの開発者ツールでエラー確認');
    }
}

// メイン実行
function main() {
    try {
        analyzePackageJson();
        analyzeNextConfig();
        analyzeTypeScriptConfig();
        analyzeProjectStructure();
        analyzeImports();
        checkEnvironment();
        runQuickTypeCheck();
        generateReport();
    } catch (error) {
        console.error('診断中に予期しないエラーが発生しました:', error.message);
    }
}

main();