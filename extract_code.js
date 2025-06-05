const fs = require('fs');
const path = require('path');

// Keywords to search for
const KEYWORDS = [
  "簡易",
  "本番",
  "同様",
  "追加",
  "このフェーズ",
  "実際の実装",
  "ダミー",
  "モックデータ",
  "主人公の",
  "美咲の",
  "主人公と",
  "魔法システムに",
  "鈴木美咲の",
  "その他の",
  "正義感が強い",
  "より高度な",
  "他のメソッド",
  "この例では"
];

// Output directory
const OUTPUT_DIR = './extracted_code';
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Track seen code blocks to avoid duplicates
const seenCodeBlocks = new Set();
const seenTypes = new Set();
const duplicatedTypes = [];
const incompleteImplementations = [];
const filesWithoutMatches = [];
const directoryStructure = new Set(['src']);

// Recursively get all TypeScript/JavaScript files
function getAllFiles(dir) {
  let files = [];
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      directoryStructure.add(fullPath);
      files = files.concat(getAllFiles(fullPath));
    } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Find the start of a function or class declaration containing the matched line
function findDeclarationStart(lines, lineIndex) {
  // Patterns to detect function/class/interface declarations
  const declarationPatterns = [
    /^\s*(export\s+)?(async\s+)?function\s+\w+/,
    /^\s*(export\s+)?(abstract\s+)?class\s+\w+/,
    /^\s*(export\s+)?interface\s+\w+/,
    /^\s*(export\s+)?type\s+\w+/,
    /^\s*(export\s+)?enum\s+\w+/,
    /^\s*(private|protected|public|static)?\s*(async\s+)?\w+\s*\(/,
    /^\s*(const|let|var)\s+\w+\s*=\s*(async\s*)?\(/,
    /^\s*\w+\s*:\s*(async\s*)?\(/
  ];
  
  // First look for a comment block right above the matched line
  // This helps identify commented functions that contain our keywords
  let inCommentBlock = false;
  for (let i = lineIndex; i >= 0; i--) {
    const line = lines[i].trim();
    
    // Check if we're in a multi-line comment
    if (line.startsWith('*/')) {
      inCommentBlock = true;
      continue;
    }
    if (inCommentBlock && line.startsWith('/*')) {
      inCommentBlock = false;
      // Found the start of a comment block, now look for the function/class after it
      for (let j = i; j < lines.length; j++) {
        for (const pattern of declarationPatterns) {
          if (pattern.test(lines[j].trim())) {
            return i; // Return the comment start line
          }
        }
        // Don't look too far ahead
        if (j - i > 10) break;
      }
    }
    
    // Check if line itself is a declaration
    for (const pattern of declarationPatterns) {
      if (pattern.test(line)) {
        // Found a declaration, look for comment blocks before it
        let commentStart = i;
        for (let j = i - 1; j >= 0; j--) {
          const prevLine = lines[j].trim();
          if (prevLine === '' || prevLine.startsWith('//') || prevLine.startsWith('/*') || prevLine.startsWith('*')) {
            commentStart = j;
          } else {
            break;
          }
        }
        return commentStart;
      }
    }
    
    // Don't look back too far
    if (lineIndex - i > 50) break;
  }
  
  // If no declaration is found, return a reasonable context
  return Math.max(0, lineIndex - 15);
}

// Find the end of a code block (function/class)
function findDeclarationEnd(lines, startLine) {
  let braceCount = 0;
  let foundOpenBrace = false;
  
  // Look for opening braces from the start line
  for (let i = startLine; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip comments and string content when counting braces
    let inString = false;
    let inLineComment = false;
    let inBlockComment = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      const nextChar = line[j + 1] || '';
      
      // Handle string content
      if ((char === '"' || char === "'" || char === '`') && !inLineComment && !inBlockComment) {
        if (j > 0 && line[j-1] === '\\') continue; // Skip escaped quotes
        inString = !inString;
        continue;
      }
      if (inString) continue;
      
      // Handle comments
      if (char === '/' && nextChar === '/' && !inBlockComment && !inLineComment) {
        inLineComment = true;
        continue;
      }
      if (char === '/' && nextChar === '*' && !inLineComment && !inBlockComment) {
        inBlockComment = true;
        j++; // Skip next character
        continue;
      }
      if (char === '*' && nextChar === '/' && inBlockComment) {
        inBlockComment = false;
        j++; // Skip next character
        continue;
      }
      
      // Count braces outside strings and comments
      if (!inString && !inLineComment && !inBlockComment) {
        if (char === '{') {
          braceCount++;
          foundOpenBrace = true;
        } else if (char === '}') {
          braceCount--;
          
          // If braces balance out, we found the end
          if (foundOpenBrace && braceCount <= 0) {
            return i;
          }
        }
      }
    }
    
    // Reset line comment flag at the end of line
    inLineComment = false;
    
    // If we've been looking too long, return what we have
    if (i - startLine > 1000) {
      return i;
    }
  }
  
  // If we didn't find a matching end brace, return a reasonable chunk
  return Math.min(lines.length - 1, startLine + 100);
}

// Extract a complete function/class/type containing a keyword
function extractCodeBlock(content, filePath) {
  const blocks = [];
  const lines = content.split('\n');
  
  let skipToLine = -1;
  for (let i = 0; i < lines.length; i++) {
    // Skip processing if we're in a previously extracted block
    if (i < skipToLine) continue;
    
    // Check if this line contains any of our keywords
    let containsKeyword = false;
    for (const keyword of KEYWORDS) {
      if (lines[i].includes(keyword)) {
        containsKeyword = true;
        break;
      }
    }
    
    if (containsKeyword) {
      // Find the function/class start and end
      const startLine = findDeclarationStart(lines, i);
      const endLine = findDeclarationEnd(lines, startLine);
      
      // Extract the complete code block
      const codeBlock = lines.slice(startLine, endLine + 1).join('\n');
      
      // Create a hash to avoid duplicates
      const blockHash = Buffer.from(codeBlock).toString('base64');
      
      if (!seenCodeBlocks.has(blockHash)) {
        blocks.push(codeBlock);
        seenCodeBlocks.add(blockHash);
      }
      
      // Skip to the end of this block
      skipToLine = endLine + 1;
    }
  }
  
  // If we didn't find any matches, record this file
  if (blocks.length === 0) {
    filesWithoutMatches.push(filePath);
  }
  
  return blocks;
}

// Extract all type definitions
function extractAllTypes(content) {
  const types = [];
  const lines = content.split('\n');
  
  let skipToLine = -1;
  for (let i = 0; i < lines.length; i++) {
    // Skip processing if we're in a previously extracted block
    if (i < skipToLine) continue;
    
    const line = lines[i].trim();
    
    // Look for type/interface/enum declarations
    if (line.startsWith('type ') || line.startsWith('interface ') || line.startsWith('enum ') ||
        line.startsWith('export type ') || line.startsWith('export interface ') || line.startsWith('export enum ')) {
      
      // Extract the name
      let match;
      if (line.includes('interface')) {
        match = line.match(/\s*(?:export\s+)?interface\s+(\w+)/);
      } else if (line.includes('type')) {
        match = line.match(/\s*(?:export\s+)?type\s+(\w+)/);
      } else if (line.includes('enum')) {
        match = line.match(/\s*(?:export\s+)?enum\s+(\w+)/);
      }
      
      const typeName = match ? match[1] : null;
      
      // Find the start and end of the type definition
      const startLine = i;
      const endLine = findDeclarationEnd(lines, startLine);
      
      // Extract the complete type definition
      const typeCode = lines.slice(startLine, endLine + 1).join('\n');
      
      // Check for duplicates by name
      if (typeName) {
        if (seenTypes.has(typeName)) {
          duplicatedTypes.push({
            name: typeName,
            code: typeCode
          });
        } else {
          seenTypes.add(typeName);
          types.push(typeCode);
        }
      } else {
        types.push(typeCode);
      }
      
      // Skip to the end of this type definition
      skipToLine = endLine + 1;
    }
  }
  
  return types;
}

// Detect incomplete implementations
function detectIncomplete(content, filePath) {
  const incompleteMarkers = [
    /\/\/\s*TODO/i,
    /\/\/\s*FIXME/i,
    /\/\*\s*TODO/i,
    /シンプルな実装/,
    /簡易(的な)?実装/,
    /このフェーズでは/,
    /実際の実装では/,
    /将来的に/,
    /後で実装/,
    /後で追加/
  ];
  
  const lines = content.split('\n');
  const incomplete = [];
  
  for (let i = 0; i < lines.length; i++) {
    for (const marker of incompleteMarkers) {
      if (marker.test(lines[i])) {
        // Get context around the marker
        const startLine = Math.max(0, i - 2);
        const endLine = Math.min(lines.length - 1, i + 2);
        const context = lines.slice(startLine, endLine + 1).join('\n');
        
        incomplete.push({
          file: filePath,
          line: i + 1,
          context
        });
        
        break; // Only record once per line
      }
    }
  }
  
  if (incomplete.length > 0) {
    incompleteImplementations.push({
      file: filePath,
      items: incomplete
    });
  }
  
  return incomplete;
}

// Generate directory tree
function generateDirectoryTree() {
  let tree = '# Directory Structure\n\n```\n';
  
  // Create normalized paths and sort
  const dirs = Array.from(directoryStructure)
    .map(dir => dir.replace(/\\/g, '/'))
    .sort();
  
  // Create a hierarchical structure
  const hierarchy = {};
  for (const dir of dirs) {
    if (dir === 'src') {
      hierarchy['src'] = {};
      continue;
    }
    
    // Get path relative to src
    const relativePath = dir.replace(/^src[\/]?/, '');
    if (!relativePath) continue;
    
    // Build path components
    const components = relativePath.split('/');
    
    // Create nested structure
    let current = hierarchy['src'];
    for (const component of components) {
      if (!current[component]) {
        current[component] = {};
      }
      current = current[component];
    }
  }
  
  // Function to print the hierarchy
  function printHierarchy(obj, prefix = '') {
    const keys = Object.keys(obj).sort();
    
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const isLast = i === keys.length - 1;
      
      tree += `${prefix}${isLast ? '└── ' : '├── '}${key}\n`;
      
      // Print subdirectories
      if (Object.keys(obj[key]).length > 0) {
        printHierarchy(obj[key], `${prefix}${isLast ? '    ' : '│   '}`);
      }
    }
  }
  
  // Start with src directory
  tree += 'src\n';
  printHierarchy(hierarchy['src']);
  tree += '```\n';
  
  return tree;
}

// Generate summary of incomplete features
function generateSummary() {
  let summary = '# Project Analysis Summary\n\n';
  
  // Statistics
  summary += '## Statistics\n\n';
  summary += `- Extracted code blocks: ${seenCodeBlocks.size}\n`;
  summary += `- Type definitions: ${seenTypes.size}\n`;
  summary += `- Duplicated types: ${duplicatedTypes.length}\n`;
  summary += `- Files with incomplete implementations: ${incompleteImplementations.length}\n`;
  summary += `- Files without matches: ${filesWithoutMatches.length}\n\n`;
  
  // Incomplete implementations
  if (incompleteImplementations.length > 0) {
    summary += '## Incomplete Implementations\n\n';
    
    for (const fileData of incompleteImplementations) {
      summary += `### ${fileData.file}\n\n`;
      
      for (const item of fileData.items) {
        summary += `- Line ${item.line}:\n\n`;
        summary += '```typescript\n';
        summary += item.context;
        summary += '\n```\n\n';
      }
    }
  }
  
  // Duplicated types
  if (duplicatedTypes.length > 0) {
    summary += '## Duplicated Types\n\n';
    
    for (const type of duplicatedTypes) {
      summary += `### ${type.name}\n\n`;
      summary += '```typescript\n';
      summary += type.code;
      summary += '\n```\n\n';
    }
  }
  
  return summary;
}

// Process a file
function processFile(filePath) {
  try {
    console.log(`Processing ${filePath}`);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extract code blocks containing keywords
    const codeBlocks = extractCodeBlock(content, filePath);
    
    // Extract all type definitions
    const types = extractAllTypes(content);
    
    // Detect incomplete implementations
    detectIncomplete(content, filePath);
    
    return {
      codeBlocks,
      types
    };
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return { codeBlocks: [], types: [] };
  }
}

// Write results to a file
function writeResults(dir, codeBlocks, types) {
  // Create a safe filename from the directory
  const safeDir = dir.replace(/[\/\\:*?"<>|]/g, '_');
  const outputPath = path.join(OUTPUT_DIR, `${safeDir}.md`);
  
  let content = `# ${dir}\n\n`;
  
  // Add code blocks section
  if (codeBlocks.length > 0) {
    content += '## Functions and Methods\n\n';
    content += '```typescript\n';
    content += codeBlocks.join('\n\n// ----------------------------------------\n\n');
    content += '\n```\n\n';
  }
  
  // Add types section
  if (types.length > 0) {
    content += '## Type Definitions\n\n';
    content += '```typescript\n';
    content += types.join('\n\n// ----------------------------------------\n\n');
    content += '\n```\n\n';
  }
  
  // Create directory if it doesn't exist
  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, content);
}

// Main function
function main() {
  console.log('Starting extraction process...');
  
  // Get all files
  const files = getAllFiles('src');
  console.log(`Found ${files.length} files to process`);
  
  // Process files and organize by directory
  const dirResults = {};
  
  for (const filePath of files) {
    const dir = path.dirname(filePath);
    
    // Initialize directory results if needed
    if (!dirResults[dir]) {
      dirResults[dir] = {
        codeBlocks: [],
        types: []
      };
    }
    
    // Process the file
    const result = processFile(filePath);
    
    // Add results to the directory
    dirResults[dir].codeBlocks.push(...result.codeBlocks);
    dirResults[dir].types.push(...result.types);
  }
  
  // Write results for each directory
  for (const [dir, results] of Object.entries(dirResults)) {
    if (results.codeBlocks.length > 0 || results.types.length > 0) {
      writeResults(dir, results.codeBlocks, results.types);
    }
  }
  
  // Generate and write directory tree
  const treeContent = generateDirectoryTree();
  fs.writeFileSync(path.join(OUTPUT_DIR, 'directory_structure.md'), treeContent);
  
  // Generate and write summary
  const summaryContent = generateSummary();
  fs.writeFileSync(path.join(OUTPUT_DIR, 'summary.md'), summaryContent);
  
  console.log(`Extraction complete. Results saved to ${OUTPUT_DIR}`);
}

// Run the script
main();

//  node extract_code.js