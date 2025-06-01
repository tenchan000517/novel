/**
 * Novel Generation Integration Script - Unified Memory System Compatible
 * 
 * This script generates a complete novel by sequentially calling the unified memory system
 * API endpoint to create chapters with enhanced error tracking and system monitoring.
 * 
 * Compatible with the new unified memory hierarchy system (MemoryManager + UnifiedAccessAPI).
 * 
 * Place this file in the tests/integration directory.
 * 
 * Usage: 
 *   node generate-novel.js             # Start from chapter 1
 *   node generate-novel.js 5           # Resume from chapter 5
 *   node generate-novel.js resume      # Auto-detect last chapter and resume
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const http = require('http');
const https = require('https');

// Configuration
const API_HOST = 'localhost';
const API_PORT = 3000;
const API_BASE_PATH = '/api/generation/chapter';
const API_BASE_URL = `http://${API_HOST}:${API_PORT}${API_BASE_PATH}`;
const TOTAL_CHAPTERS = 12;
const DELAY_BETWEEN_CHAPTERS = 120000; // 2 minutes to avoid API rate limits
const API_RETRY_COUNT = 3;
const API_RETRY_DELAY = 20000; // 20 seconds between retries
const OUTPUT_DIR = path.join(__dirname, 'output');
const NOVEL_SUMMARY_FILE = path.join(OUTPUT_DIR, 'novel_summary.json');
const SYSTEM_METRICS_FILE = path.join(OUTPUT_DIR, 'system_metrics.json');

// Configure axios with longer timeouts and keep-alive
const axiosInstance = axios.create({
  timeout: 600000, // 10 minutes timeout for unified memory system processing
  httpAgent: new http.Agent({ keepAlive: true }),
  httpsAgent: new https.Agent({ keepAlive: true }),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Error categories for detailed tracking
const ErrorCategory = {
  NETWORK: 'network',
  API_CONFIG: 'api_config',
  SYSTEM_INIT: 'system_init',
  MEMORY_SYSTEM: 'memory_system',
  GENERATION: 'generation',
  VALIDATION: 'validation',
  FILE_IO: 'file_io',
  UNKNOWN: 'unknown'
};

// Processing stages for error/warning tracking
const ProcessingStage = {
  API_CONNECTION: 'api_connection',
  SYSTEM_STATUS: 'system_status',
  MEMORY_INITIALIZATION: 'memory_initialization',
  CHAPTER_GENERATION: 'chapter_generation',
  MEMORY_PROCESSING: 'memory_processing',
  VALIDATION: 'validation',
  FILE_SAVING: 'file_saving',
  PROGRESS_TRACKING: 'progress_tracking'
};

// Log levels
const LogLevel = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error'
};

// Enhanced logger with stage and category tracking
const logger = {
  debug: function(message, metadata, stage, category) {
    const fullMessage = stage ? `[${stage.toUpperCase()}] ${message}` : message;
    console.debug(`[DEBUG] ${fullMessage}`);
    saveLog(LogLevel.DEBUG, fullMessage, { ...metadata, stage, category });
  },
  
  info: function(message, metadata, stage, category) {
    const fullMessage = stage ? `[${stage.toUpperCase()}] ${message}` : message;
    console.info(`[INFO] ${fullMessage}`);
    saveLog(LogLevel.INFO, fullMessage, { ...metadata, stage, category });
  },
  
  warn: function(message, metadata, stage, category) {
    const fullMessage = stage ? `[${stage.toUpperCase()}] ${message}` : message;
    console.warn(`[WARN] ${fullMessage}`);
    saveLog(LogLevel.WARN, fullMessage, { ...metadata, stage, category });
  },
  
  error: function(message, metadata, stage, category) {
    const fullMessage = stage ? `[${stage.toUpperCase()}] ${message}` : message;
    console.error(`[ERROR] ${fullMessage}`);
    saveLog(LogLevel.ERROR, fullMessage, { ...metadata, stage, category });
  }
};

/**
 * Enhanced log saving with stage and category information
 */
function saveLog(level, message, metadata) {
  try {
    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      level,
      message,
      stage: metadata?.stage || 'unknown',
      category: metadata?.category || 'unknown',
      metadata: metadata || {}
    };
    
    // Ensure directory exists
    const logDir = path.join(OUTPUT_DIR, level);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    // Save structured log
    fs.appendFileSync(
      path.join(logDir, `${level}.log`), 
      JSON.stringify(logData, null, 2) + '\n'
    );
  } catch (err) {
    console.error(`Error saving ${level} log:`, err);
  }
}

/**
 * Enhanced error categorization
 */
function categorizeError(error, stage) {
  if (error.isAxiosError) {
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return ErrorCategory.NETWORK;
    }
    if (error.response?.status === 401 || error.response?.status === 403) {
      return ErrorCategory.API_CONFIG;
    }
    if (error.response?.status >= 500) {
      return ErrorCategory.SYSTEM_INIT;
    }
  }
  
  if (stage === ProcessingStage.MEMORY_INITIALIZATION || stage === ProcessingStage.MEMORY_PROCESSING) {
    return ErrorCategory.MEMORY_SYSTEM;
  }
  
  if (stage === ProcessingStage.CHAPTER_GENERATION) {
    return ErrorCategory.GENERATION;
  }
  
  if (stage === ProcessingStage.VALIDATION) {
    return ErrorCategory.VALIDATION;
  }
  
  if (stage === ProcessingStage.FILE_SAVING) {
    return ErrorCategory.FILE_IO;
  }
  
  return ErrorCategory.UNKNOWN;
}

/**
 * Get starting chapter from command line args
 */
const getStartingChapter = async () => {
  const args = process.argv.slice(2);
  if (args.length === 0) return 1;
  
  if (args[0].toLowerCase() === 'resume') {
    return await detectLastChapter();
  }
  
  const parsedChapter = parseInt(args[0], 10);
  if (isNaN(parsedChapter) || parsedChapter < 1) {
    logger.error('Invalid chapter number. Using chapter 1.', {}, ProcessingStage.API_CONNECTION, ErrorCategory.API_CONFIG);
    return 1;
  }
  
  return parsedChapter;
};

/**
 * Creates the directory structure for log storage
 */
const createLogDirectories = () => {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  const logTypes = Object.values(LogLevel);
  logTypes.forEach(type => {
    const typeDir = path.join(OUTPUT_DIR, type);
    if (!fs.existsSync(typeDir)) {
      fs.mkdirSync(typeDir, { recursive: true });
    }
  });
  
  logger.info('Output directories created', { outputDir: OUTPUT_DIR }, ProcessingStage.FILE_SAVING);
};

/**
 * Enhanced last chapter detection with unified memory system support
 */
const detectLastChapter = async () => {
  try {
    logger.info('Detecting last generated chapter from unified memory system API...', 
      {}, ProcessingStage.SYSTEM_STATUS);
    
    const response = await axiosInstance.get(API_BASE_URL);
    if (!response.data.success) {
      logger.warn('Failed to detect last chapter, defaulting to chapter 1', 
        { error: response.data.error }, ProcessingStage.SYSTEM_STATUS, ErrorCategory.API_CONFIG);
      return 1;
    }
    
    const systemData = response.data.data;
    const lastChapter = systemData.chapters?.latestChapterNumber || 0;
    
    // Log unified memory system status
    logger.info('Unified memory system status retrieved', {
      memorySystemInitialized: systemData.unifiedMemorySystem?.initialized,
      systemHealth: systemData.unifiedMemorySystem?.systemHealth,
      lastChapter: lastChapter,
      totalChapters: systemData.chapters?.totalChapters
    }, ProcessingStage.SYSTEM_STATUS);
    
    if (lastChapter >= TOTAL_CHAPTERS) {
      logger.info('All chapters already generated. Will restart from chapter 1.', 
        {}, ProcessingStage.SYSTEM_STATUS);
      return 1;
    }
    
    const nextChapter = lastChapter + 1;
    logger.info(`Detected last chapter: ${lastChapter}, resuming from chapter ${nextChapter}`, 
      {}, ProcessingStage.SYSTEM_STATUS);
    return nextChapter;
    
  } catch (error) {
    const category = categorizeError(error, ProcessingStage.SYSTEM_STATUS);
    logger.error('Error detecting last chapter', {
      error: error instanceof Error ? error.message : String(error),
      category
    }, ProcessingStage.SYSTEM_STATUS, category);
    return 1;
  }
};

/**
 * Creates a delay between API calls
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Enhanced retry with error categorization
 */
const retry = async (fn, retries = 3, delayMs = 1000, backoff = 2, stage = ProcessingStage.API_CONNECTION) => {
  try {
    return await fn();
  } catch (error) {
    const category = categorizeError(error, stage);
    
    if (retries <= 0) {
      logger.error('Retry limit exceeded', {
        error: error.message,
        category,
        stage
      }, stage, category);
      throw error;
    }
    
    logger.warn(`Retrying after error: ${error.message}`, {
      retriesLeft: retries - 1,
      delayMs: delayMs,
      category,
      stage
    }, stage, category);
    
    await delay(delayMs);
    return retry(fn, retries - 1, delayMs * backoff, backoff, stage);
  }
};

/**
 * Enhanced chapter generation with unified memory system metrics
 */
const generateChapter = async (chapterNumber, requestData) => {
  logger.info(`Calling unified memory system API to generate chapter ${chapterNumber}`, 
    { requestData }, ProcessingStage.CHAPTER_GENERATION);
  
  try {
    const response = await retry(
      () => axiosInstance.post(
        `${API_BASE_URL}?chapterNumber=${chapterNumber}`,
        requestData
      ),
      API_RETRY_COUNT,
      API_RETRY_DELAY,
      2,
      ProcessingStage.CHAPTER_GENERATION
    );
    
    if (!response.data.success || !response.data.data?.chapter) {
      const errorDetails = response.data.error || { message: 'Failed to generate chapter' };
      throw new Error(errorDetails.message || 'Unknown generation error');
    }
    
    const responseData = response.data.data;
    const chapter = responseData.chapter;
    const metrics = responseData.metrics;
    const memoryMetrics = responseData.memoryProcessingMetrics;
    
    // Enhanced logging with unified memory system metrics
    logger.info(`Unified memory system successfully generated chapter ${chapterNumber}`, {
      title: chapter.title,
      qualityScore: metrics.qualityScore,
      generationTime: `${metrics.generationTime / 1000} seconds`,
      memoryProcessingTime: memoryMetrics ? `${memoryMetrics.processingTime / 1000} seconds` : 'unknown',
      totalOperationTime: memoryMetrics ? `${memoryMetrics.totalOperationTime / 1000} seconds` : 'unknown',
      systemOptimizationApplied: memoryMetrics?.systemOptimizationApplied || false,
      contentLength: chapter.content?.length || 0,
      plotConsistency: chapter.metadata?.plotConsistency || 'unknown'
    }, ProcessingStage.CHAPTER_GENERATION);
    
    // Log unified memory system processing details if available
    if (chapter.metadata?.unifiedMemorySystemProcessing) {
      const memoryProcessing = chapter.metadata.unifiedMemorySystemProcessing;
      logger.info(`Unified memory system processing completed for chapter ${chapterNumber}`, {
        processingSuccess: memoryProcessing.success,
        affectedComponents: memoryProcessing.affectedComponents?.length || 0,
        operationType: memoryProcessing.operationType,
        warningCount: memoryProcessing.warningCount || 0,
        errorCount: memoryProcessing.errorCount || 0,
        systemHealth: memoryProcessing.systemHealth
      }, ProcessingStage.MEMORY_PROCESSING);
      
      // Log warnings if any
      if (memoryProcessing.warningCount > 0) {
        logger.warn(`Memory processing completed with ${memoryProcessing.warningCount} warnings`, 
          { chapterNumber }, ProcessingStage.MEMORY_PROCESSING, ErrorCategory.MEMORY_SYSTEM);
      }
      
      // Log errors if any
      if (memoryProcessing.errorCount > 0) {
        logger.error(`Memory processing completed with ${memoryProcessing.errorCount} errors`, 
          { chapterNumber }, ProcessingStage.MEMORY_PROCESSING, ErrorCategory.MEMORY_SYSTEM);
      }
    }
    
    // Save system metrics for this chapter
    await saveSystemMetrics(chapterNumber, {
      generation: metrics,
      memoryProcessing: memoryMetrics,
      unifiedMemorySystem: chapter.metadata?.unifiedMemorySystemProcessing
    });
    
    return chapter;
    
  } catch (error) {
    const category = categorizeError(error, ProcessingStage.CHAPTER_GENERATION);
    
    if (error.isAxiosError) {
      const responseData = error.response?.data ? 
        (typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data)) : 
        'No response data';
        
      logger.error(`API error while generating chapter ${chapterNumber}`, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: responseData,
        url: error.config?.url,
        method: error.config?.method,
        category
      }, ProcessingStage.CHAPTER_GENERATION, category);
    } else {
      logger.error(`Error generating chapter ${chapterNumber}`, {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack trace',
        category
      }, ProcessingStage.CHAPTER_GENERATION, category);
    }
    throw error;
  }
};

/**
 * Enhanced API status check with unified memory system diagnostics
 */
const checkApiStatus = async () => {
  try {
    logger.info(`Testing unified memory system API endpoint: ${API_BASE_URL}`, 
      {}, ProcessingStage.API_CONNECTION);
    
    const response = await retry(
      () => axiosInstance.get(API_BASE_URL), 
      API_RETRY_COUNT, 
      API_RETRY_DELAY,
      2,
      ProcessingStage.API_CONNECTION
    );
    
    if (!response.data.success) {
      logger.error('Unified memory system API status check failed', { 
        error: response.data.error,
        data: response.data
      }, ProcessingStage.API_CONNECTION, ErrorCategory.API_CONFIG);
      return false;
    }
    
    const statusData = response.data.data;
    
    // Enhanced status logging with unified memory system details
    logger.info('Unified memory system API status check successful', {
      apiKeyValid: statusData.generation?.apiKeyValid,
      model: statusData.generation?.model,
      latestChapter: statusData.chapters?.latestChapterNumber,
      totalChapters: statusData.chapters?.totalChapters,
      parametersInitialized: statusData.parameters?.initialized,
      currentPreset: statusData.parameters?.currentPreset,
      availablePresets: statusData.parameters?.availablePresets?.length || 0
    }, ProcessingStage.SYSTEM_STATUS);
    
    // Log unified memory system status
    if (statusData.unifiedMemorySystem) {
      const memorySystem = statusData.unifiedMemorySystem;
      logger.info('Unified memory system status', {
        initialized: memorySystem.initialized,
        systemHealth: memorySystem.systemHealth,
        lastUpdateTime: memorySystem.lastUpdateTime,
        shortTermDataCount: memorySystem.memoryLayers?.shortTerm?.dataCount || 0,
        midTermDataCount: memorySystem.memoryLayers?.midTerm?.dataCount || 0,
        longTermDataCount: memorySystem.memoryLayers?.longTerm?.dataCount || 0,
        cacheHitRatio: memorySystem.cacheStatistics?.hitRatio || 0,
        unifiedSearchWorking: memorySystem.unifiedSearchTest?.success || false,
        issueCount: memorySystem.issues?.length || 0,
        recommendationCount: memorySystem.recommendations?.length || 0
      }, ProcessingStage.MEMORY_INITIALIZATION);
      
      // Log memory system issues if any
      if (memorySystem.issues && memorySystem.issues.length > 0) {
        logger.warn(`Unified memory system has ${memorySystem.issues.length} issues`, {
          issues: memorySystem.issues.slice(0, 3) // Log first 3 issues
        }, ProcessingStage.MEMORY_INITIALIZATION, ErrorCategory.MEMORY_SYSTEM);
      }
      
      // Log memory system health warnings
      if (memorySystem.systemHealth === 'DEGRADED') {
        logger.warn('Unified memory system health is degraded', {
          systemHealth: memorySystem.systemHealth
        }, ProcessingStage.MEMORY_INITIALIZATION, ErrorCategory.MEMORY_SYSTEM);
      } else if (memorySystem.systemHealth === 'CRITICAL') {
        logger.error('Unified memory system health is critical', {
          systemHealth: memorySystem.systemHealth
        }, ProcessingStage.MEMORY_INITIALIZATION, ErrorCategory.MEMORY_SYSTEM);
      }
      
      // Log integration systems status
      if (memorySystem.integrationSystems) {
        const systems = memorySystem.integrationSystems;
        logger.info('Integration systems status', {
          duplicateResolverOperational: systems.duplicateResolver?.operational || false,
          cacheCoordinatorOperational: systems.cacheCoordinator?.operational || false,
          unifiedAccessAPIOperational: systems.unifiedAccessAPI?.operational || false,
          dataIntegrationProcessorOperational: systems.dataIntegrationProcessor?.operational || false
        }, ProcessingStage.MEMORY_INITIALIZATION);
      }
    }
    
    return true;
  } catch (error) {
    const category = categorizeError(error, ProcessingStage.API_CONNECTION);
    logger.error('Failed to connect to unified memory system API', {
      error: error instanceof Error ? error.message : String(error),
      url: API_BASE_URL,
      stack: error instanceof Error ? error.stack : 'No stack trace',
      category
    }, ProcessingStage.API_CONNECTION, category);
    return false;
  }
};

/**
 * Save system metrics for analysis
 */
const saveSystemMetrics = async (chapterNumber, metrics) => {
  try {
    const timestamp = new Date().toISOString();
    const metricsEntry = {
      chapterNumber,
      timestamp,
      ...metrics
    };
    
    let existingMetrics = [];
    if (fs.existsSync(SYSTEM_METRICS_FILE)) {
      try {
        const content = fs.readFileSync(SYSTEM_METRICS_FILE, 'utf8');
        existingMetrics = JSON.parse(content);
      } catch (parseError) {
        logger.warn('Failed to parse existing metrics file, creating new one', 
          { parseError }, ProcessingStage.FILE_SAVING, ErrorCategory.FILE_IO);
        existingMetrics = [];
      }
    }
    
    existingMetrics.push(metricsEntry);
    fs.writeFileSync(SYSTEM_METRICS_FILE, JSON.stringify(existingMetrics, null, 2));
    
    logger.debug('System metrics saved', { chapterNumber }, ProcessingStage.FILE_SAVING);
    
  } catch (error) {
    logger.warn('Failed to save system metrics', {
      error: error instanceof Error ? error.message : String(error),
      chapterNumber
    }, ProcessingStage.FILE_SAVING, ErrorCategory.FILE_IO);
    // Don't throw - this shouldn't stop the generation process
  }
};

/**
 * Enhanced novel summary with unified memory system metrics
 */
const saveNovelSummary = (chapters) => {
  try {
    const summary = {
      title: "Generated Novel - Unified Memory System",
      totalChapters: chapters.length,
      generatedAt: new Date().toISOString(),
      totalWordCount: chapters.reduce((sum, chapter) => sum + (chapter.wordCount || 0), 0),
      averageQualityScore: chapters.length > 0 ? 
        chapters.reduce((sum, chapter) => sum + (chapter.metadata?.qualityScore || 0), 0) / chapters.length : 0,
      
      // Enhanced metrics for unified memory system
      unifiedMemorySystemMetrics: {
        averageMemoryProcessingTime: chapters.length > 0 ? 
          chapters.reduce((sum, chapter) => {
            const processing = chapter.metadata?.unifiedMemorySystemProcessing;
            return sum + (processing?.processingTime || 0);
          }, 0) / chapters.length : 0,
        
        totalMemoryProcessingTime: chapters.reduce((sum, chapter) => {
          const processing = chapter.metadata?.unifiedMemorySystemProcessing;
          return sum + (processing?.processingTime || 0);
        }, 0),
        
        successfulMemoryProcessing: chapters.filter(chapter => 
          chapter.metadata?.unifiedMemorySystemProcessing?.success).length,
        
        totalWarnings: chapters.reduce((sum, chapter) => {
          const processing = chapter.metadata?.unifiedMemorySystemProcessing;
          return sum + (processing?.warningCount || 0);
        }, 0),
        
        totalErrors: chapters.reduce((sum, chapter) => {
          const processing = chapter.metadata?.unifiedMemorySystemProcessing;
          return sum + (processing?.errorCount || 0);
        }, 0),
        
        systemOptimizationsApplied: chapters.filter(chapter => 
          chapter.metadata?.memoryProcessingMetrics?.systemOptimizationApplied).length
      },
      
      chapters: chapters.map(chapter => ({
        number: chapter.chapterNumber,
        title: chapter.title,
        wordCount: chapter.wordCount,
        qualityScore: chapter.metadata?.qualityScore,
        summary: chapter.summary,
        scenes: chapter.scenes?.length || 0,
        createdAt: chapter.createdAt,
        
        // Unified memory system specific metrics
        unifiedMemoryProcessing: {
          success: chapter.metadata?.unifiedMemorySystemProcessing?.success || false,
          processingTime: chapter.metadata?.unifiedMemorySystemProcessing?.processingTime || 0,
          affectedComponents: chapter.metadata?.unifiedMemorySystemProcessing?.affectedComponents?.length || 0,
          systemHealth: chapter.metadata?.unifiedMemorySystemProcessing?.systemHealth || 'unknown'
        },
        
        plotConsistency: chapter.metadata?.plotConsistency || {}
      }))
    };
    
    fs.writeFileSync(NOVEL_SUMMARY_FILE, JSON.stringify(summary, null, 2));
    logger.info('Enhanced novel summary saved with unified memory system metrics', { 
      path: NOVEL_SUMMARY_FILE,
      totalChapters: summary.totalChapters,
      averageQualityScore: summary.averageQualityScore.toFixed(3),
      successfulMemoryProcessing: summary.unifiedMemorySystemMetrics.successfulMemoryProcessing,
      totalWarnings: summary.unifiedMemorySystemMetrics.totalWarnings,
      totalErrors: summary.unifiedMemorySystemMetrics.totalErrors
    }, ProcessingStage.PROGRESS_TRACKING);
    
    return summary;
  } catch (error) {
    logger.error('Error saving novel summary', {
      error: error instanceof Error ? error.message : String(error)
    }, ProcessingStage.FILE_SAVING, ErrorCategory.FILE_IO);
    return null;
  }
};

/**
 * Main novel generation function with enhanced unified memory system support
 */
const generateNovel = async () => {
  const startChapter = await getStartingChapter();
  const startTime = Date.now();
  
  logger.info('Starting novel generation with unified memory system', { 
    apiUrl: API_BASE_URL,
    startingChapter: startChapter,
    totalChapters: TOTAL_CHAPTERS,
    delayBetweenChapters: `${DELAY_BETWEEN_CHAPTERS / 1000} seconds`
  }, ProcessingStage.API_CONNECTION);
  
  createLogDirectories();
  
  const generatedChapters = [];
  
  try {
    // Enhanced API readiness check
    let apiReady = false;
    for (let i = 0; i < API_RETRY_COUNT; i++) {
      logger.info(`Unified memory system API status check attempt ${i + 1}/${API_RETRY_COUNT}`, 
        {}, ProcessingStage.API_CONNECTION);
      apiReady = await checkApiStatus();
      if (apiReady) break;
      
      if (i < API_RETRY_COUNT - 1) {
        const waitTime = API_RETRY_DELAY * (i + 1);
        logger.info(`Waiting ${waitTime/1000} seconds before next API status check`, 
          {}, ProcessingStage.API_CONNECTION);
        await delay(waitTime);
      }
    }
    
    if (!apiReady) {
      logger.error('Unified memory system API is not ready after multiple retries. Aborting novel generation.', 
        {}, ProcessingStage.API_CONNECTION, ErrorCategory.SYSTEM_INIT);
      return;
    }
    
    // Generate chapters sequentially
    for (let i = startChapter; i <= TOTAL_CHAPTERS; i++) {
      const isLastChapter = i === TOTAL_CHAPTERS;
      const chapterStartTime = Date.now();
      
      logger.info(`Starting generation of chapter ${i}${isLastChapter ? ' (final chapter)' : ''}`, {
        progress: `${i}/${TOTAL_CHAPTERS}`,
        previousChapters: generatedChapters.length
      }, ProcessingStage.CHAPTER_GENERATION);
      
      // Enhanced request data with unified memory system considerations
      const requestData = {
        targetLength: 8000,
        forcedGeneration: false,
        overrides: {}
      };
      
      // Special settings for the final chapter
      if (isLastChapter) {
        requestData.overrides = {
          tension: 0.9,
          pacing: 0.8
        };
        requestData.notes = "This is the final chapter. Please ensure the story reaches a satisfying conclusion.";
        
        logger.info('Applying final chapter settings', {
          tension: 0.9,
          pacing: 0.8
        }, ProcessingStage.CHAPTER_GENERATION);
      }
      
      try {
        // Call the unified memory system API
        const chapter = await generateChapter(i, requestData);
        
        generatedChapters.push(chapter);
        
        const chapterGenerationTime = (Date.now() - chapterStartTime) / 1000;
        
        logger.info(`Successfully completed chapter ${i}`, {
          title: chapter.title,
          wordCount: chapter.wordCount,
          generationTime: `${chapterGenerationTime.toFixed(1)} seconds`,
          qualityScore: chapter.metadata?.qualityScore || 'unknown',
          memoryProcessingSuccess: chapter.metadata?.unifiedMemorySystemProcessing?.success || 'unknown'
        }, ProcessingStage.CHAPTER_GENERATION);
        
        // Save progress after each chapter
        saveNovelSummary(generatedChapters);
        
      } catch (error) {
        const category = categorizeError(error, ProcessingStage.CHAPTER_GENERATION);
        logger.error(`Failed to generate chapter ${i}`, {
          error: error instanceof Error ? error.message : String(error),
          category,
          chapterGenerationTime: (Date.now() - chapterStartTime) / 1000
        }, ProcessingStage.CHAPTER_GENERATION, category);
        
        // Continue with next chapter despite failure (non-blocking approach)
        logger.info(`Continuing with next chapter despite failure on chapter ${i}`, 
          {}, ProcessingStage.CHAPTER_GENERATION);
      }
      
      // Delay before generating the next chapter (except after the last one)
      if (i < TOTAL_CHAPTERS) {
        logger.info(`Waiting ${DELAY_BETWEEN_CHAPTERS / 1000} seconds before generating next chapter`, 
          {}, ProcessingStage.CHAPTER_GENERATION);
        await delay(DELAY_BETWEEN_CHAPTERS);
      }
    }
    
    // Final novel summary with enhanced metrics
    const summary = saveNovelSummary(generatedChapters);
    
    const totalGenerationTime = (Date.now() - startTime) / 1000 / 60; // minutes
    
    logger.info('Novel generation completed successfully with unified memory system', {
      totalChapters: generatedChapters.length,
      totalWordCount: summary?.totalWordCount || 'unknown',
      averageQualityScore: summary?.averageQualityScore || 'unknown',
      totalGenerationTime: `${totalGenerationTime.toFixed(1)} minutes`,
      successfulMemoryProcessing: summary?.unifiedMemorySystemMetrics?.successfulMemoryProcessing || 0,
      totalMemoryWarnings: summary?.unifiedMemorySystemMetrics?.totalWarnings || 0,
      totalMemoryErrors: summary?.unifiedMemorySystemMetrics?.totalErrors || 0,
      systemOptimizationsApplied: summary?.unifiedMemorySystemMetrics?.systemOptimizationsApplied || 0
    }, ProcessingStage.PROGRESS_TRACKING);
    
  } catch (error) {
    const category = categorizeError(error, ProcessingStage.PROGRESS_TRACKING);
    logger.error('Fatal error during novel generation process', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      category,
      generatedChapters: generatedChapters.length
    }, ProcessingStage.PROGRESS_TRACKING, category);
  }
};

// Execute the novel generation
generateNovel().catch(error => {
  console.error('Unhandled error in unified memory system novel generation script:', error);
  process.exit(1);
});