/**
 * JSDoc Extractor with Module Grouping - Fixed for Windows
 * 
 * This script recursively extracts JSDoc comments from JavaScript/TypeScript files
 * and organizes them into separate documentation files by module.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  fileExtensions: ['.ts', '.tsx', '.js', '.jsx'],
  outputDir: './documentation',
  // Tags that we want to highlight in the documentation
  importantTags: [
    'fileoverview', 'description', 'role', 'dependencies', 'api-endpoints', 
    'flow', 'used-by', 'depends-on', 'lifecycle', 'call-flow', 'error-handling',
    'async', 'function', 'param', 'returns', 'throws', 'example', 'class', 
    'constructor', 'private', 'protected', 'public', 'requires'
  ],
  // Files and directories to skip
  skipPatterns: {
    fileNames: ['jest.config.js', 'jsdoc-extractor.js'],
    filePatterns: ['copy', '★', '.test.', '.spec.'],
    directories: ['tests', 'test', 'node_modules', '.git', '.next', 'dist', 'build'],
    subdirectories: ['#']
  },
  // Module grouping configuration
  moduleGroups: [
    { name: 'app-api', pathPattern: 'src/app/api' },
    { name: 'app-main', pathPattern: 'src/app', exclude: ['api'] },
    { name: 'components-admin', pathPattern: 'src/components/admin' },
    { name: 'components-public', pathPattern: 'src/components/public' },
    { name: 'components-ui', pathPattern: 'src/components/ui' },
    { name: 'components-shared', pathPattern: 'src/components/shared' },
    { name: 'config', pathPattern: 'src/config' },
    { name: 'hooks', pathPattern: 'src/hooks' },
    { name: 'lib-analysis', pathPattern: 'src/lib/analysis' },
    { name: 'lib-api', pathPattern: 'src/lib/api' },
    { name: 'lib-cache', pathPattern: 'src/lib/cache' },
    { name: 'lib-characters', pathPattern: 'src/lib/characters' },
    { name: 'lib-correction', pathPattern: 'src/lib/correction' },
    { name: 'lib-deployment', pathPattern: 'src/lib/deployment' },
    { name: 'lib-editor', pathPattern: 'src/lib/editor' },
    { name: 'lib-foreshadowing', pathPattern: 'src/lib/foreshadowing' },
    { name: 'lib-generation', pathPattern: 'src/lib/generation' },
    { name: 'lib-memory', pathPattern: 'src/lib/memory' },
    { name: 'lib-monitoring', pathPattern: 'src/lib/monitoring' },
    { name: 'lib-storage', pathPattern: 'src/lib/storage' },
    { name: 'lib-utils', pathPattern: 'src/lib/utils' },
    { name: 'lib-validation', pathPattern: 'src/lib/validation' },
    { name: 'types', pathPattern: 'src/types' }
  ]
};

/**
 * Normalizes a file path to use forward slashes
 */
function normalizePath(filePath) {
  return filePath.replace(/\\/g, '/');
}

/**
 * Check if a file path belongs to a specific module group
 */
function belongsToModuleGroup(filePath, moduleGroup) {
  const normalizedPath = normalizePath(filePath);
  const pathPattern = moduleGroup.pathPattern;
  
  // First check if path contains the module pattern
  if (!normalizedPath.includes(pathPattern)) {
    return false;
  }
  
  // Check exclusions
  if (moduleGroup.exclude) {
    for (const excluded of moduleGroup.exclude) {
      const excludedPattern = `${pathPattern}/${excluded}`;
      if (normalizedPath.includes(excludedPattern)) {
        return false;
      }
    }
  }
  
  return true;
}

/**
 * Recursively finds all files in a directory
 */
function findAllFiles(dir, moduleGroup = null) {
  const results = [];
  
  try {
    // Normalize directory path for consistent handling
    const normalizedDir = normalizePath(dir);
    
    // Skip directories based on config
    const dirName = path.basename(normalizedDir);
    if (config.skipPatterns.directories.includes(dirName)) {
      console.log(`Skipping directory: ${normalizedDir}`);
      return results;
    }
    
    // Check if directory exists before attempting to read
    if (!fs.existsSync(normalizedDir)) {
      console.error(`Directory not found: ${normalizedDir}`);
      return results;
    }
    
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
      // Skip subdirectories with specified names
      if (config.skipPatterns.subdirectories.includes(item.name)) {
        console.log(`Skipping subdirectory: ${item.name}`);
        continue;
      }
      
      // Use path.join for proper path construction
      const fullPath = path.join(dir, item.name);
      
      if (item.isDirectory()) {
        results.push(...findAllFiles(fullPath, moduleGroup));
      } else {
        // Skip files by name pattern
        const shouldSkip = 
          config.skipPatterns.fileNames.includes(item.name) ||
          config.skipPatterns.filePatterns.some(pattern => item.name.includes(pattern));
        
        if (shouldSkip) {
          //console.log(`Skipping file: ${fullPath}`);
          continue;
        }
        
        // Only include files with specified extensions
        if (config.fileExtensions.includes(path.extname(item.name).toLowerCase())) {
          results.push(fullPath);
        }
      }
    }
  } catch (err) {
    console.error(`Error scanning directory ${dir}: ${err.message}`);
  }
  
  return results;
}

/**
 * Filters files based on module group
 */
function filterFilesByModule(files, moduleGroup) {
  return files.filter(file => belongsToModuleGroup(file, moduleGroup));
}

/**
 * Extracts JSDoc comments from a file along with their associated code elements
 */
function extractJSDocFromFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const items = [];
    
    // Normalize file path for consistent display
    const normalizedPath = normalizePath(filePath);
    
    // Extract file-level JSDoc
    const fileJsdocMatch = content.match(/\/\*\*\s*([\s\S]*?)\s*\*\/\s*(?!.*?(function|class|interface|const|let|var|type|enum))/);
    if (fileJsdocMatch) {
      items.push({
        type: 'file',
        name: path.basename(filePath),
        jsdoc: cleanJSDoc(fileJsdocMatch[1]),
        filePath: normalizedPath
      });
    }
    
    // Extract various declarations with JSDoc
    const declarationRegex = /\/\*\*\s*([\s\S]*?)\s*\*\/\s*(?:export\s+)?(?:default\s+)?(?:async\s+)?(?:function\s+([a-zA-Z0-9_$]+)|class\s+([a-zA-Z0-9_$]+)|interface\s+([a-zA-Z0-9_$]+)|type\s+([a-zA-Z0-9_$]+)|enum\s+([a-zA-Z0-9_$]+)|(?:const|let|var)\s+([a-zA-Z0-9_$]+))/g;
    
    let match;
    while ((match = declarationRegex.exec(content)) !== null) {
      const [, jsdoc, funcName, className, interfaceName, typeName, enumName, varName] = match;
      
      const name = funcName || className || interfaceName || typeName || enumName || varName;
      if (!name) continue;
      
      let type = 'unknown';
      if (funcName) type = 'function';
      else if (className) type = 'class';
      else if (interfaceName) type = 'interface';
      else if (typeName) type = 'type';
      else if (enumName) type = 'enum';
      else if (varName) {
        // Check if it might be a React component
        const nextContent = content.substring(match.index + match[0].length, match.index + match[0].length + 100);
        if (nextContent.includes('React.FC') || nextContent.includes('FunctionComponent')) {
          type = 'component';
        } else {
          type = 'variable';
        }
      }
      
      items.push({
        type,
        name,
        jsdoc: cleanJSDoc(jsdoc),
        filePath: normalizedPath
      });
      
      // If it's a class, also extract its methods
      if (className) {
        const classStart = match.index + match[0].length;
        const classBody = extractClassBody(content, classStart);
        
        if (classBody) {
          const methodItems = extractMethodsFromClass(classBody, className, normalizedPath);
          items.push(...methodItems);
        }
      }
    }
    
    return items;
  } catch (err) {
    console.error(`Error processing file ${filePath}: ${err.message}`);
    return [];
  }
}

/**
 * Extracts the class body from a position in the content
 */
function extractClassBody(content, startPos) {
  let braceCount = 0;
  let classBody = '';
  let started = false;
  
  for (let i = startPos; i < content.length; i++) {
    const char = content[i];
    
    if (char === '{') {
      braceCount++;
      started = true;
    } else if (char === '}') {
      braceCount--;
    }
    
    if (started) {
      classBody += char;
    }
    
    if (started && braceCount === 0) {
      return classBody;
    }
  }
  
  return null;
}

/**
 * Extracts methods with JSDoc from a class body
 */
function extractMethodsFromClass(classBody, className, filePath) {
  const methods = [];
  const methodRegex = /\/\*\*\s*([\s\S]*?)\s*\*\/\s*(?:private\s+|protected\s+|public\s+)?(?:static\s+)?(?:readonly\s+)?(?:async\s+)?(?:get\s+|set\s+)?([a-zA-Z0-9_$]+)\s*\(/g;
  
  let match;
  while ((match = methodRegex.exec(classBody)) !== null) {
    const [, jsdoc, methodName] = match;
    
    methods.push({
      type: 'method',
      name: `${className}.${methodName}`,
      jsdoc: cleanJSDoc(jsdoc),
      filePath,
      className
    });
  }
  
  return methods;
}

/**
 * Cleans JSDoc comment by removing comment markers and normalizing whitespace
 */
function cleanJSDoc(jsdoc) {
  return jsdoc
    .replace(/^\s*\*\s?/gm, '')
    .trim();
}

/**
 * Parses a JSDoc comment to extract structured information
 */
function parseJSDoc(jsdoc) {
  const result = {
    description: '',
    tags: {}
  };
  
  // Split by lines
  const lines = jsdoc.split('\n');
  let currentTag = null;
  let currentContent = [];
  
  for (const line of lines) {
    const tagMatch = line.match(/^@(\w+)(?:\s+(.*))?$/);
    
    if (tagMatch) {
      // Save previous tag if exists
      if (currentTag) {
        result.tags[currentTag] = currentContent.join(' ').trim();
      } else if (currentContent.length > 0) {
        result.description = currentContent.join('\n').trim();
      }
      
      currentTag = tagMatch[1];
      currentContent = tagMatch[2] ? [tagMatch[2]] : [];
    } else if (currentTag) {
      currentContent.push(line.trim());
    } else {
      currentContent.push(line.trim());
    }
  }
  
  // Save final tag or description
  if (currentTag) {
    result.tags[currentTag] = currentContent.join(' ').trim();
  } else if (currentContent.length > 0) {
    result.description = currentContent.join('\n').trim();
  }
  
  return result;
}

/**
 * Groups items by their file
 */
function groupItemsByFile(items) {
  const groups = {};
  
  for (const item of items) {
    if (!groups[item.filePath]) {
      groups[item.filePath] = [];
    }
    
    groups[item.filePath].push(item);
  }
  
  return groups;
}

/**
 * Generates documentation from extracted JSDoc items
 */
function generateDocumentation(items, moduleGroupName) {
  let doc = `# ${getFormattedName(moduleGroupName)} Documentation\n\n`;
  
  // Add introduction
  doc += '## Introduction\n\n';
  doc += `This documentation covers the \`${moduleGroupName}\` module of the Novel Automation System. ` +
         'It is automatically generated from JSDoc comments in the source code.\n\n';
  
  // Build table of contents
  doc += '## Table of Contents\n\n';
  
  // Group by file for the table of contents
  const fileGroups = groupItemsByFile(items);
  for (const file of Object.keys(fileGroups).sort()) {
    const fileSlug = getSlug(`${file}`);
    // Display just the filename, not the full path
    const displayName = path.basename(file);
    doc += `- [${displayName}](#${fileSlug})\n`;
  }
  
  doc += '\n';
  
  // Process each file
  for (const file of Object.keys(fileGroups).sort()) {
    const fileItems = fileGroups[file];
    const fileSlug = getSlug(file);
    const fileName = path.basename(file);
    
    doc += `## ${fileName} {#${fileSlug}}\n\n`;
    doc += `**Path:** \`${file}\`\n\n`;
    
    // Find file-level documentation
    const fileDoc = fileItems.find(item => item.type === 'file');
    
    if (fileDoc) {
      const parsedJSDoc = parseJSDoc(fileDoc.jsdoc);
      
      if (parsedJSDoc.description) {
        doc += `${parsedJSDoc.description}\n\n`;
      }
      
      // Add important tags
      for (const tag of config.importantTags) {
        if (parsedJSDoc.tags[tag]) {
          doc += `**@${tag}:** ${parsedJSDoc.tags[tag]}\n\n`;
        }
      }
    }
    
    // Process classes and their methods
    const classes = fileItems.filter(item => item.type === 'class');
    const methods = fileItems.filter(item => item.type === 'method');
    const otherItems = fileItems.filter(item => 
      item.type !== 'class' && item.type !== 'method' && item.type !== 'file'
    );
    
    // Group methods by class
    const methodsByClass = {};
    for (const method of methods) {
      const className = method.className;
      if (!methodsByClass[className]) {
        methodsByClass[className] = [];
      }
      methodsByClass[className].push(method);
    }
    
    // Document classes with their methods
    for (const classItem of classes) {
      doc += generateItemDoc(classItem);
      
      const classMethods = methodsByClass[classItem.name] || [];
      if (classMethods.length > 0) {
        doc += `### Methods of ${classItem.name}\n\n`;
        
        for (const method of classMethods) {
          doc += generateItemDoc(method, 4);
        }
      }
    }
    
    // Document other items (functions, interfaces, etc.)
    for (const item of otherItems) {
      doc += generateItemDoc(item);
    }
    
    doc += '\n---\n\n';
  }
  
  return doc;
}

/**
 * Generates documentation for a single JSDoc item
 */
function generateItemDoc(item, headingLevel = 3) {
  const heading = '#'.repeat(headingLevel);
  let doc = `${heading} ${item.name} (${item.type})\n\n`;
  
  const parsedJSDoc = parseJSDoc(item.jsdoc);
  
  if (parsedJSDoc.description) {
    doc += `${parsedJSDoc.description}\n\n`;
  }
  
  // Add important tags
  for (const tag of config.importantTags) {
    if (parsedJSDoc.tags[tag]) {
      doc += `**@${tag}:** ${parsedJSDoc.tags[tag]}\n\n`;
    }
  }
  
  // Special handling for parameters, returns, throws
  if (parsedJSDoc.tags.param || parsedJSDoc.tags.params) {
    doc += `**Parameters:**\n\n`;
    const paramTags = parsedJSDoc.tags.param ? [parsedJSDoc.tags.param] : [];
    if (parsedJSDoc.tags.params) {
      paramTags.push(parsedJSDoc.tags.params);
    }
    
    for (const paramTag of paramTags) {
      doc += `- ${paramTag}\n`;
    }
    doc += '\n';
  }
  
  if (parsedJSDoc.tags.returns || parsedJSDoc.tags.return) {
    doc += `**Returns:** ${parsedJSDoc.tags.returns || parsedJSDoc.tags.return}\n\n`;
  }
  
  if (parsedJSDoc.tags.throws || parsedJSDoc.tags.throw) {
    doc += `**Throws:** ${parsedJSDoc.tags.throws || parsedJSDoc.tags.throw}\n\n`;
  }
  
  return doc;
}

/**
 * Generates a slug for anchor links
 */
function getSlug(str) {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Format module name for display
 */
function getFormattedName(moduleName) {
  return moduleName
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

/**
 * Creates the output directory if it doesn't exist
 */
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

/**
 * Processes a single module group
 */
function processModuleGroup(rootDir, allFiles, moduleGroup) {
  console.log(`Processing module group: ${moduleGroup.name} (${moduleGroup.pathPattern})`);
  
  // Filter files for this module group
  const moduleFiles = filterFilesByModule(allFiles, moduleGroup);
  console.log(`Found ${moduleFiles.length} files for module ${moduleGroup.name}`);
  
  if (moduleFiles.length === 0) {
    return {
      moduleGroup: moduleGroup.name,
      filesProcessed: 0,
      itemsExtracted: 0
    };
  }
  
  // Extract JSDoc from all files
  let moduleItems = [];
  for (const file of moduleFiles) {
    const items = extractJSDocFromFile(file);
    moduleItems = moduleItems.concat(items);
  }
  
  console.log(`Extracted ${moduleItems.length} JSDoc items for module ${moduleGroup.name}`);
  
  if (moduleItems.length === 0) {
    return {
      moduleGroup: moduleGroup.name,
      filesProcessed: moduleFiles.length,
      itemsExtracted: 0
    };
  }
  
  // Generate documentation
  const documentation = generateDocumentation(moduleItems, moduleGroup.name);
  
  // Save to file
  ensureDirectoryExists(config.outputDir);
  const outputPath = path.join(config.outputDir, `${moduleGroup.name}.md`);
  fs.writeFileSync(outputPath, documentation);
  
  console.log(`Documentation for ${moduleGroup.name} generated at ${outputPath}`);
  
  return {
    moduleGroup: moduleGroup.name,
    filesProcessed: moduleFiles.length,
    itemsExtracted: moduleItems.length,
    outputPath
  };
}

/**
 * Main function to run the script
 */
function main() {
  // Get directory from command line or use current directory
  let rootDir = process.argv[2] || '.';
  
  // Make sure we're working with an absolute path
  if (!path.isAbsolute(rootDir)) {
    rootDir = path.resolve(rootDir);
  }
  
  console.log(`Scanning directory: ${rootDir}`);
  
  // Verify directory exists
  if (!fs.existsSync(rootDir)) {
    console.error(`ERROR: Directory does not exist: ${rootDir}`);
    console.log('Please provide a valid directory path');
    return {
      error: 'Directory not found'
    };
  }
  
  // First, find all files recursively
  console.log("Finding all valid files (this may take a moment)...");
  const allFiles = findAllFiles(rootDir);
  console.log(`Found ${allFiles.length} total files`);
  
  // Create output directory
  ensureDirectoryExists(config.outputDir);
  
  // Process each module group
  const results = [];
  for (const moduleGroup of config.moduleGroups) {
    const result = processModuleGroup(rootDir, allFiles, moduleGroup);
    results.push(result);
  }
  
  // Generate index file
  generateIndexFile(results);
  
  console.log('Documentation generation complete!');
  
  // Summary
  const totalFiles = results.reduce((sum, r) => sum + r.filesProcessed, 0);
  const totalItems = results.reduce((sum, r) => sum + (r.itemsExtracted || 0), 0);
  
  return {
    moduleGroups: results.length,
    totalFilesProcessed: totalFiles,
    totalItemsExtracted: totalItems,
    outputDir: config.outputDir
  };
}

/**
 * Generates an index file with links to all module documentation
 */
function generateIndexFile(results) {
  let indexContent = '# Novel Automation System Documentation\n\n';
  
  indexContent += '## Module Documentation\n\n';
  indexContent += 'Click on a module to view its detailed documentation:\n\n';
  
  for (const result of results) {
    if (result.itemsExtracted > 0) {
      const formattedName = getFormattedName(result.moduleGroup);
      indexContent += `- [${formattedName}](./${result.moduleGroup}.md) (${result.itemsExtracted} documented items)\n`;
    }
  }
  
  // Add generation timestamp
  indexContent += '\n\n---\n\n';
  indexContent += `Documentation generated on ${new Date().toLocaleString()}\n`;
  
  // Write the index file
  const indexPath = path.join(config.outputDir, 'index.md');
  fs.writeFileSync(indexPath, indexContent);
  console.log(`Index file generated at ${indexPath}`);
}

// If running directly (not imported)
if (require.main === module) {
  main();
}

// Export functions for testing or custom usage
module.exports = {
  findAllFiles,
  extractJSDocFromFile,
  parseJSDoc,
  generateDocumentation,
  main
};