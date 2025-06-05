const fs = require('fs').promises;
const path = require('path');

console.log('🔍 CharacterManager ファイル位置調査');
console.log('=====================================');

async function findCharacterManager() {
    console.log('\n📁 プロジェクト構造の確認:');
    
    // まず基本的なディレクトリ構造を確認
    await exploreDirectory('.', 0, 4);
    
    console.log('\n🔍 CharacterManager関連ファイルの検索:');
    await searchCharacterManagerFiles();
}

async function exploreDirectory(dirPath, currentDepth, maxDepth) {
    if (currentDepth > maxDepth) return;
    
    try {
        const items = await fs.readdir(dirPath, { withFileTypes: true });
        const indent = '  '.repeat(currentDepth);
        
        if (currentDepth === 0) {
            console.log(`${indent}📂 ${dirPath}/`);
        }
        
        for (const item of items) {
            const fullPath = path.join(dirPath, item.name);
            
            if (item.isDirectory() && !item.name.startsWith('.') && 
                !item.name.includes('node_modules') && !item.name.includes('dist')) {
                console.log(`${indent}  📁 ${item.name}/`);
                if (currentDepth < maxDepth) {
                    await exploreDirectory(fullPath, currentDepth + 1, maxDepth);
                }
            } else if (item.isFile() && 
                      (item.name.includes('character') || item.name.includes('Character')) && 
                      (item.name.includes('manager') || item.name.includes('Manager'))) {
                console.log(`${indent}  📄 ${item.name} ⭐`);
            }
        }
    } catch (error) {
        console.log(`${indent}  ❌ アクセスエラー: ${dirPath}`);
    }
}

async function searchCharacterManagerFiles() {
    const foundFiles = [];
    
    async function searchInDirectory(dir, currentPath = '') {
        try {
            const items = await fs.readdir(dir, { withFileTypes: true });
            
            for (const item of items) {
                const fullPath = path.join(dir, item.name);
                const relativePath = path.join(currentPath, item.name);
                
                if (item.isDirectory() && 
                    !item.name.startsWith('.') && 
                    !item.name.includes('node_modules') &&
                    !item.name.includes('dist')) {
                    await searchInDirectory(fullPath, relativePath);
                } else if (item.isFile()) {
                    const fileName = item.name.toLowerCase();
                    
                    // ファイル名でのマッチング
                    if ((fileName.includes('character') && fileName.includes('manager')) || 
                        fileName === 'character-manager.ts' ||
                        fileName === 'charactermanager.ts') {
                        foundFiles.push(fullPath);
                        console.log(`✅ ファイル名で発見: ${fullPath}`);
                    }
                    
                    // ファイル内容でCharacterManagerクラスを検索
                    if (item.name.endsWith('.ts') || item.name.endsWith('.js')) {
                        try {
                            const content = await fs.readFile(fullPath, 'utf8');
                            if (content.includes('class CharacterManager') || 
                                content.includes('export class CharacterManager') ||
                                content.includes('interface ICharacterManager') ||
                                content.includes('createCharacterManager')) {
                                if (!foundFiles.includes(fullPath)) {
                                    foundFiles.push(fullPath);
                                    console.log(`✅ クラス定義で発見: ${fullPath}`);
                                }
                            }
                        } catch (readError) {
                            // ファイル読み込みエラーはスキップ
                        }
                    }
                }
            }
        } catch (error) {
            // ディレクトリアクセスエラーはスキップ
        }
    }
    
    await searchInDirectory('.');
    
    if (foundFiles.length === 0) {
        console.log('❌ CharacterManagerファイルが見つかりませんでした');
        console.log('\n🔍 CharacterManager関連の参照を検索中...');
        await searchCharacterManagerReferences();
    } else {
        console.log(`\n📊 ${foundFiles.length}個のCharacterManagerファイルを発見`);
        
        // 各ファイルの内容を詳しく分析
        for (const file of foundFiles) {
            await analyzeCharacterManagerFile(file);
        }
    }
    
    // インポート文も検索
    console.log('\n📦 インポート文の検索:');
    await searchImportStatements();
}

async function searchCharacterManagerReferences() {
    const refFiles = [];
    
    async function searchReferences(dir) {
        try {
            const items = await fs.readdir(dir, { withFileTypes: true });
            
            for (const item of items) {
                const fullPath = path.join(dir, item.name);
                
                if (item.isDirectory() && 
                    !item.name.startsWith('.') && 
                    !item.name.includes('node_modules') &&
                    !item.name.includes('dist')) {
                    await searchReferences(fullPath);
                } else if (item.isFile() && (item.name.endsWith('.ts') || item.name.endsWith('.js'))) {
                    try {
                        const content = await fs.readFile(fullPath, 'utf8');
                        const characterManagerRefs = content.match(/CharacterManager|characterManager/g);
                        if (characterManagerRefs && characterManagerRefs.length > 2) {
                            refFiles.push({
                                file: fullPath,
                                refs: characterManagerRefs.length
                            });
                        }
                    } catch (readError) {
                        // スキップ
                    }
                }
            }
        } catch (error) {
            // スキップ
        }
    }
    
    await searchReferences('.');
    
    if (refFiles.length > 0) {
        console.log('\n📋 CharacterManager参照が多いファイル:');
        refFiles.sort((a, b) => b.refs - a.refs);
        refFiles.slice(0, 10).forEach(item => {
            console.log(`   ${item.file}: ${item.refs}回参照`);
        });
    }
}

async function searchImportStatements() {
    const importFiles = [];
    
    async function searchImports(dir) {
        try {
            const items = await fs.readdir(dir, { withFileTypes: true });
            
            for (const item of items) {
                const fullPath = path.join(dir, item.name);
                
                if (item.isDirectory() && 
                    !item.name.startsWith('.') && 
                    !item.name.includes('node_modules') &&
                    !item.name.includes('dist')) {
                    await searchImports(fullPath);
                } else if (item.isFile() && (item.name.endsWith('.ts') || item.name.endsWith('.js'))) {
                    try {
                        const content = await fs.readFile(fullPath, 'utf8');
                        const importMatches = content.match(/import.*CharacterManager.*from.*['"']([^'"']+)['"']/g);
                        if (importMatches) {
                            importFiles.push({
                                file: fullPath,
                                imports: importMatches
                            });
                        }
                    } catch (readError) {
                        // スキップ
                    }
                }
            }
        } catch (error) {
            // スキップ
        }
    }
    
    await searchImports('.');
    
    if (importFiles.length > 0) {
        console.log('\n📦 CharacterManagerのインポート文:');
        importFiles.forEach(item => {
            console.log(`   📄 ${item.file}:`);
            item.imports.forEach(imp => {
                console.log(`      ${imp}`);
            });
        });
    }
}

async function analyzeCharacterManagerFile(filePath) {
    try {
        const content = await fs.readFile(filePath, 'utf8');
        console.log(`\n📄 ${filePath} の詳細分析:`);
        
        // MemoryManager関連の参照をチェック
        const memoryManagerRefs = content.match(/MemoryManager|memoryManager/g);
        const memoryManagerImports = content.match(/import.*MemoryManager/g);
        
        if (memoryManagerRefs) {
            console.log(`   MemoryManager参照: ${memoryManagerRefs.length}箇所`);
        } else {
            console.log(`   ❌ MemoryManager参照なし`);
        }
        
        if (memoryManagerImports) {
            console.log(`   MemoryManagerインポート: ${memoryManagerImports.length}箇所`);
            memoryManagerImports.forEach(imp => {
                console.log(`      ${imp}`);
            });
        }
        
        // クラス定義の確認
        const classMatch = content.match(/export class CharacterManager/);
        const interfaceMatch = content.match(/interface.*CharacterManager/);
        const functionMatch = content.match(/createCharacterManager|getCharacterManager/g);
        
        if (classMatch) {
            console.log(`   ✅ CharacterManagerクラス定義あり`);
        }
        if (interfaceMatch) {
            console.log(`   ✅ CharacterManagerインターフェース定義あり`);
        }
        if (functionMatch) {
            console.log(`   ✅ CharacterManager関数: ${functionMatch.length}個`);
        }
        
        // コンストラクタの確認
        const constructorMatch = content.match(/constructor\([^)]*memoryManager[^)]*\)/);
        if (constructorMatch) {
            console.log(`   ✅ memoryManagerパラメータ付きコンストラクタ`);
        }
        
        // ファイルサイズと行数
        const stats = await fs.stat(filePath);
        const lines = content.split('\n').length;
        console.log(`   サイズ: ${(stats.size / 1024).toFixed(1)}KB, ${lines}行`);
        
        // 最終更新日
        console.log(`   最終更新: ${stats.mtime.toISOString().split('T')[0]}`);
        
    } catch (error) {
        console.log(`   ❌ 分析エラー: ${error.message}`);
    }
}

// 実行
findCharacterManager();