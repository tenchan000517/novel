const fs = require('fs').promises;
const path = require('path');

class TypeDefinitionsSummaryScanner {
  constructor() {
    this.basePath = 'C:\\novel-automation-system\\src';
    this.summary = {
      overview: {
        totalTypeFiles: 0,
        totalTypes: 0,
        totalInterfaces: 0,
        totalEnums: 0,
        systemCount: 0
      },
      systems: {},
      duplications: {
        exactDuplicates: [],
        crossSystemDuplicates: [],
        similarNames: []
      },
      problems: [],
      opportunities: [],
      recommendations: []
    };
    
    // 除外パターン
    this.excludePatterns = [
      /copy/i, /backup/i, /temp/i, /test/i, /spec/i, /\.bak/, /\.old/, /node_modules/
    ];
  }

  async scanAndSummarize() {
    console.log('🔍 Starting Type Definitions Summary Scan...');
    
    try {
      const typeFiles = await this.findTypeFiles(this.basePath);
      console.log(`📁 Found ${typeFiles.length} type definition files`);
      
      await this.analyzeTypeFiles(typeFiles);
      await this.findDuplications();
      await this.identifyProblems();
      await this.generateRecommendations();
      
      return this.generateSummaryReport();
    } catch (error) {
      console.error('❌ Error during scan:', error);
      throw error;
    }
  }

  async findTypeFiles(dirPath) {
    const typeFiles = [];
    
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        if (entry.isDirectory() && !this.shouldExcludeFile(fullPath)) {
          const subFiles = await this.findTypeFiles(fullPath);
          typeFiles.push(...subFiles);
        } else if (entry.isFile() && this.isTypeFile(entry.name) && !this.shouldExcludeFile(fullPath)) {
          typeFiles.push(fullPath);
        }
      }
    } catch (error) {
      // ディレクトリアクセスエラーは無視
    }
    
    return typeFiles;
  }

  isTypeFile(filename) {
    return filename.endsWith('.ts') && (
      filename.includes('types') ||
      filename.includes('interface') ||
      filename === 'index.ts'
    );
  }

  shouldExcludeFile(filePath) {
    return this.excludePatterns.some(pattern => pattern.test(filePath));
  }

  async analyzeTypeFiles(typeFiles) {
    console.log('📊 Analyzing type files...');
    
    this.summary.overview.totalTypeFiles = typeFiles.length;
    
    for (const filePath of typeFiles) {
      try {
        const content = await fs.readFile(filePath, 'utf8');
        const relativePath = path.relative(this.basePath, filePath);
        const systemName = this.extractSystemName(relativePath);
        
        if (!this.summary.systems[systemName]) {
          this.summary.systems[systemName] = {
            files: 0,
            interfaces: [],
            types: [],
            enums: [],
            totalDefinitions: 0
          };
        }
        
        const analysis = this.quickAnalyzeFile(content);
        this.summary.systems[systemName].files++;
        this.summary.systems[systemName].interfaces.push(...analysis.interfaces);
        this.summary.systems[systemName].types.push(...analysis.types);
        this.summary.systems[systemName].enums.push(...analysis.enums);
        this.summary.systems[systemName].totalDefinitions += analysis.totalDefinitions;
        
        this.summary.overview.totalInterfaces += analysis.interfaces.length;
        this.summary.overview.totalTypes += analysis.types.length;
        this.summary.overview.totalEnums += analysis.enums.length;
        
      } catch (error) {
        console.log(`⚠️ Could not analyze ${filePath}`);
      }
    }
    
    this.summary.overview.systemCount = Object.keys(this.summary.systems).length;
    console.log(`✅ Analyzed ${this.summary.overview.systemCount} systems`);
  }

  extractSystemName(relativePath) {
    const pathParts = relativePath.split(path.sep);
    if (pathParts.length >= 2 && pathParts[0] === 'lib') {
      return pathParts[1];
    }
    return 'unknown';
  }

  quickAnalyzeFile(content) {
    // 軽量な分析（型名のみ抽出）
    const interfaces = this.extractTypeNames(content, /interface\s+(\w+)/g);
    const types = this.extractTypeNames(content, /type\s+(\w+)/g);
    const enums = this.extractTypeNames(content, /enum\s+(\w+)/g);
    
    return {
      interfaces,
      types,
      enums,
      totalDefinitions: interfaces.length + types.length + enums.length
    };
  }

  extractTypeNames(content, regex) {
    const names = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
      names.push(match[1]);
    }
    return names;
  }

  async findDuplications() {
    console.log('🔍 Finding duplications...');
    
    const allTypes = new Map(); // typeName -> [{ system, type }]
    
    // 全ての型名を収集
    for (const [systemName, systemData] of Object.entries(this.summary.systems)) {
      const allSystemTypes = [
        ...systemData.interfaces.map(name => ({ name, type: 'interface', system: systemName })),
        ...systemData.types.map(name => ({ name, type: 'type', system: systemName })),
        ...systemData.enums.map(name => ({ name, type: 'enum', system: systemName }))
      ];
      
      for (const typeInfo of allSystemTypes) {
        if (!allTypes.has(typeInfo.name)) {
          allTypes.set(typeInfo.name, []);
        }
        allTypes.get(typeInfo.name).push(typeInfo);
      }
    }
    
    // 重複を特定
    for (const [typeName, occurrences] of allTypes) {
      if (occurrences.length > 1) {
        // 同一システム内の重複
        const systemGroups = this.groupBy(occurrences, 'system');
        for (const [system, types] of Object.entries(systemGroups)) {
          if (types.length > 1) {
            this.summary.duplications.exactDuplicates.push({
              typeName,
              system,
              count: types.length,
              types: types.map(t => t.type)
            });
          }
        }
        
        // クロスシステム重複
        const uniqueSystems = [...new Set(occurrences.map(o => o.system))];
        if (uniqueSystems.length > 1) {
          this.summary.duplications.crossSystemDuplicates.push({
            typeName,
            systems: uniqueSystems,
            totalCount: occurrences.length
          });
        }
      }
    }
    
    // 類似名を特定
    const typeNames = Array.from(allTypes.keys());
    for (let i = 0; i < typeNames.length; i++) {
      for (let j = i + 1; j < typeNames.length; j++) {
        if (this.areSimilarNames(typeNames[i], typeNames[j])) {
          this.summary.duplications.similarNames.push({
            name1: typeNames[i],
            name2: typeNames[j],
            similarity: this.calculateSimilarity(typeNames[i], typeNames[j])
          });
        }
      }
    }
    
    console.log(`🔍 Found ${this.summary.duplications.exactDuplicates.length} exact duplicates`);
    console.log(`🔍 Found ${this.summary.duplications.crossSystemDuplicates.length} cross-system duplicates`);
    console.log(`🔍 Found ${this.summary.duplications.similarNames.length} similar names`);
  }

  groupBy(array, key) {
    return array.reduce((groups, item) => {
      const group = item[key];
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(item);
      return groups;
    }, {});
  }

  areSimilarNames(name1, name2) {
    const similarity = this.calculateSimilarity(name1, name2);
    return similarity > 0.8 && similarity < 1.0;
  }

  calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  async identifyProblems() {
    console.log('🚨 Identifying problems...');
    
    // 重複問題
    if (this.summary.duplications.exactDuplicates.length > 0) {
      this.summary.problems.push({
        type: 'EXACT_DUPLICATES',
        severity: 'HIGH',
        count: this.summary.duplications.exactDuplicates.length,
        description: 'Same type names defined multiple times within systems'
      });
    }
    
    if (this.summary.duplications.crossSystemDuplicates.length > 0) {
      this.summary.problems.push({
        type: 'CROSS_SYSTEM_DUPLICATES',
        severity: 'MEDIUM',
        count: this.summary.duplications.crossSystemDuplicates.length,
        description: 'Same type names used across different systems'
      });
    }
    
    // システムサイズの不均衡
    const systemSizes = Object.values(this.summary.systems).map(s => s.totalDefinitions);
    const maxSize = Math.max(...systemSizes);
    const minSize = Math.min(...systemSizes);
    
    if (maxSize > minSize * 3) {
      this.summary.problems.push({
        type: 'SYSTEM_SIZE_IMBALANCE',
        severity: 'MEDIUM',
        description: `Large variation in system type counts (${minSize} - ${maxSize})`
      });
    }
    
    console.log(`🚨 Identified ${this.summary.problems.length} problems`);
  }

  async generateRecommendations() {
    console.log('💡 Generating recommendations...');
    
    if (this.summary.duplications.exactDuplicates.length > 0) {
      this.summary.recommendations.push({
        priority: 'HIGH',
        action: 'ELIMINATE_EXACT_DUPLICATES',
        description: 'Remove duplicate type definitions within systems',
        impact: 'Reduced complexity, improved maintainability'
      });
    }
    
    if (this.summary.duplications.crossSystemDuplicates.length > 0) {
      this.summary.recommendations.push({
        priority: 'MEDIUM',
        action: 'CREATE_SHARED_TYPES',
        description: 'Create shared type library for cross-system types',
        impact: 'Improved consistency, reduced duplication'
      });
    }
    
    if (this.summary.duplications.similarNames.length > 0) {
      this.summary.recommendations.push({
        priority: 'LOW',
        action: 'STANDARDIZE_NAMING',
        description: 'Review and standardize similar type names',
        impact: 'Improved clarity, reduced confusion'
      });
    }
    
    // 大きなシステムの分割提案
    const largeSystems = Object.entries(this.summary.systems)
      .filter(([_, data]) => data.totalDefinitions > 50)
      .map(([name, data]) => ({ name, count: data.totalDefinitions }));
    
    if (largeSystems.length > 0) {
      this.summary.recommendations.push({
        priority: 'MEDIUM',
        action: 'CONSIDER_SYSTEM_DECOMPOSITION',
        description: `Large systems detected: ${largeSystems.map(s => `${s.name}(${s.count})`).join(', ')}`,
        impact: 'Better modularity, easier maintenance'
      });
    }
    
    console.log(`💡 Generated ${this.summary.recommendations.length} recommendations`);
  }

  generateSummaryReport() {
    const report = {
      timestamp: new Date().toISOString(),
      
      // 📊 システム概要
      overview: {
        ...this.summary.overview,
        systemList: Object.keys(this.summary.systems),
        averageTypesPerSystem: Math.round(this.summary.overview.totalTypes / this.summary.overview.systemCount)
      },
      
      // 🔍 重複分析結果
      duplicationSummary: {
        exactDuplicatesCount: this.summary.duplications.exactDuplicates.length,
        crossSystemDuplicatesCount: this.summary.duplications.crossSystemDuplicates.length,
        similarNamesCount: this.summary.duplications.similarNames.length,
        totalDuplicationIssues: this.summary.duplications.exactDuplicates.length + 
                              this.summary.duplications.crossSystemDuplicates.length
      },
      
      // 🏆 トップ重複項目（最大10個）
      topDuplications: {
        exactDuplicates: this.summary.duplications.exactDuplicates.slice(0, 10),
        crossSystemDuplicates: this.summary.duplications.crossSystemDuplicates.slice(0, 10),
        similarNames: this.summary.duplications.similarNames.slice(0, 10)
      },
      
      // 📈 システム別統計
      systemStats: Object.entries(this.summary.systems).map(([name, data]) => ({
        system: name,
        files: data.files,
        interfaces: data.interfaces.length,
        types: data.types.length,
        enums: data.enums.length,
        total: data.totalDefinitions
      })).sort((a, b) => b.total - a.total),
      
      // 🚨 問題サマリー
      problemsSummary: {
        totalProblems: this.summary.problems.length,
        highSeverity: this.summary.problems.filter(p => p.severity === 'HIGH').length,
        mediumSeverity: this.summary.problems.filter(p => p.severity === 'MEDIUM').length,
        problems: this.summary.problems
      },
      
      // 💡 推奨アクション
      recommendations: this.summary.recommendations,
      
      // 🎯 優先度別アクション
      actionPlan: {
        immediate: this.summary.recommendations.filter(r => r.priority === 'HIGH'),
        shortTerm: this.summary.recommendations.filter(r => r.priority === 'MEDIUM'),
        longTerm: this.summary.recommendations.filter(r => r.priority === 'LOW')
      }
    };
    
    return report;
  }

  displaySummary(report) {
    console.log('\n' + '='.repeat(80));
    console.log('📊 TYPE DEFINITIONS SUMMARY REPORT');
    console.log('='.repeat(80));
    
    console.log('\n🔢 OVERVIEW:');
    console.log(`  📁 Type Files: ${report.overview.totalTypeFiles}`);
    console.log(`  🏗️ Systems: ${report.overview.systemCount}`);
    console.log(`  📝 Total Interfaces: ${report.overview.totalInterfaces}`);
    console.log(`  🔧 Total Types: ${report.overview.totalTypes}`);
    console.log(`  📋 Total Enums: ${report.overview.totalEnums}`);
    console.log(`  📊 Average Types/System: ${report.overview.averageTypesPerSystem}`);
    
    console.log('\n🚨 DUPLICATION ISSUES:');
    console.log(`  🔴 Exact Duplicates: ${report.duplicationSummary.exactDuplicatesCount}`);
    console.log(`  🟡 Cross-System Duplicates: ${report.duplicationSummary.crossSystemDuplicatesCount}`);
    console.log(`  🟠 Similar Names: ${report.duplicationSummary.similarNamesCount}`);
    console.log(`  ⚠️ Total Issues: ${report.duplicationSummary.totalDuplicationIssues}`);
    
    if (report.topDuplications.exactDuplicates.length > 0) {
      console.log('\n🔴 TOP EXACT DUPLICATES:');
      report.topDuplications.exactDuplicates.slice(0, 5).forEach(dup => {
        console.log(`  • ${dup.typeName} (${dup.system}, count: ${dup.count})`);
      });
    }
    
    if (report.topDuplications.crossSystemDuplicates.length > 0) {
      console.log('\n🟡 TOP CROSS-SYSTEM DUPLICATES:');
      report.topDuplications.crossSystemDuplicates.slice(0, 5).forEach(dup => {
        console.log(`  • ${dup.typeName} (systems: ${dup.systems.join(', ')})`);
      });
    }
    
    console.log('\n📈 SYSTEMS BY SIZE:');
    report.systemStats.slice(0, 8).forEach(stat => {
      console.log(`  ${stat.system}: ${stat.total} types (${stat.interfaces}i + ${stat.types}t + ${stat.enums}e)`);
    });
    
    console.log('\n💡 IMMEDIATE ACTIONS REQUIRED:');
    if (report.actionPlan.immediate.length > 0) {
      report.actionPlan.immediate.forEach(action => {
        console.log(`  🔥 ${action.action}: ${action.description}`);
      });
    } else {
      console.log('  ✅ No immediate actions required');
    }
    
    console.log('\n🎯 RECOMMENDATIONS:');
    if (report.actionPlan.shortTerm.length > 0) {
      report.actionPlan.shortTerm.forEach(action => {
        console.log(`  📋 ${action.action}: ${action.description}`);
      });
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('📁 Full report saved to: type-definitions-summary.json');
    console.log('='.repeat(80));
  }
}

// 実行用の関数
async function scanTypeDefinitionsSummary() {
  const scanner = new TypeDefinitionsSummaryScanner();
  
  try {
    console.log('🚀 Starting Type Definitions Summary Scan...');
    const report = await scanner.scanAndSummarize();
    
    // コンソールにサマリー表示
    scanner.displaySummary(report);
    
    // 軽量レポートをファイルに保存
    await require('fs').promises.writeFile(
      'type-definitions-summary.json', 
      JSON.stringify(report, null, 2), 
      'utf8'
    );
    
    return report;
    
  } catch (error) {
    console.error('❌ Scan failed:', error);
    throw error;
  }
}

// Export for use
module.exports = {
  TypeDefinitionsSummaryScanner,
  scanTypeDefinitionsSummary
};

// 直接実行する場合
if (require.main === module) {
  scanTypeDefinitionsSummary()
    .then(report => {
      console.log('\n🎉 Type Definitions Summary Scan Successfully Completed!');
      console.log(`📊 Found ${report.duplicationSummary.totalDuplicationIssues} duplication issues to fix`);
      console.log(`💡 Generated ${report.recommendations.length} recommendations`);
    })
    .catch(error => {
      console.error('💥 Fatal error during scan:', error);
      process.exit(1);
    });
}