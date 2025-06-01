/**
 * Novel Generation Integration Script
 * 
 * This script generates a complete novel by sequentially calling the API endpoint
 * to create 12 chapters and saves all logs by type.
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

// Get starting chapter from command line args
const getStartingChapter = async () => {
  const args = process.argv.slice(2);
  if (args.length === 0) return 1; // Default to chapter 1
  
  if (args[0].toLowerCase() === 'resume') {
    // Auto-detect last generated chapter
    return await detectLastChapter();
  }
  
  const parsedChapter = parseInt(args[0], 10);
  if (isNaN(parsedChapter) || parsedChapter < 1) {
    console.error('Invalid chapter number. Using chapter 1.');
    return 1;
  }
  
  return parsedChapter;
};

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

// Configure axios with longer timeouts and keep-alive
const axiosInstance = axios.create({
  timeout: 3000000, // 5 minutes timeout for chapter generation
  httpAgent: new http.Agent({ keepAlive: true }),
  httpsAgent: new https.Agent({ keepAlive: true }),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Simple log level enum
const LogLevel = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error'
};

// Simple logger implementation
const logger = {
  debug: function(message, metadata) {
    console.debug(`[DEBUG] ${message}`);
    saveLog(LogLevel.DEBUG, message, metadata);
  },
  
  info: function(message, metadata) {
    console.info(`[INFO] ${message}`);
    saveLog(LogLevel.INFO, message, metadata);
  },
  
  warn: function(message, metadata) {
    console.warn(`[WARN] ${message}`);
    saveLog(LogLevel.WARN, message, metadata);
  },
  
  error: function(message, metadata) {
    console.error(`[ERROR] ${message}`);
    saveLog(LogLevel.ERROR, message, metadata);
  }
};

/**
 * Save log to file by log level
 */
function saveLog(level, message, metadata) {
  try {
    const timestamp = new Date().toISOString();
    const metadataStr = metadata ? `\n${JSON.stringify(metadata, null, 2)}` : '';
    const logEntry = `[${timestamp}] ${message}${metadataStr}\n\n`;
    
    // Ensure directory exists
    const logDir = path.join(OUTPUT_DIR, level);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    fs.appendFileSync(path.join(logDir, `${level}.log`), logEntry);
  } catch (err) {
    console.error(`Error saving ${level} log:`, err);
  }
}

/**
 * Creates the directory structure for log storage
 */
const createLogDirectories = () => {
  // Main output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  // Subdirectories for each log type
  const logTypes = Object.values(LogLevel);
  logTypes.forEach(type => {
    const typeDir = path.join(OUTPUT_DIR, type);
    if (!fs.existsSync(typeDir)) {
      fs.mkdirSync(typeDir, { recursive: true });
    }
  });
  
  console.log(`Output directories created at ${OUTPUT_DIR}`);
};

/**
 * Detects the last generated chapter by checking the API
 */
const detectLastChapter = async () => {
  try {
    logger.info('Detecting last generated chapter from API...');
    
    const response = await axiosInstance.get(API_BASE_URL);
    if (!response.data.success) {
      logger.warn('Failed to detect last chapter, defaulting to chapter 1');
      return 1;
    }
    
    const lastChapter = response.data.data.chapters.latestChapterNumber || 0;
    
    if (lastChapter >= TOTAL_CHAPTERS) {
      logger.info('All chapters already generated. Will restart from chapter 1.');
      return 1;
    }
    
    const nextChapter = lastChapter + 1;
    logger.info(`Detected last chapter: ${lastChapter}, resuming from chapter ${nextChapter}`);
    return nextChapter;
    
  } catch (error) {
    logger.error('Error detecting last chapter', {
      error: error instanceof Error ? error.message : String(error)
    });
    return 1; // Default to chapter 1 if detection fails
  }
};

/**
 * Creates a delay between API calls
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retry a function with exponential backoff
 */
const retry = async (fn, retries = 3, delayMs = 1000, backoff = 2) => {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) {
      throw error;
    }
    
    logger.warn(`Retrying after error: ${error.message}`, {
      retriesLeft: retries - 1,
      delayMs: delayMs
    });
    
    await delay(delayMs);
    return retry(fn, retries - 1, delayMs * backoff, backoff);
  }
};

/**
 * Calls the chapter generation API endpoint
 */
const generateChapter = async (chapterNumber, requestData) => {
  logger.info(`Calling API to generate chapter ${chapterNumber}`, { requestData });
  
  try {
    // Wrap the actual API call with retry logic
    const response = await retry(
      () => axiosInstance.post(
        `${API_BASE_URL}?chapterNumber=${chapterNumber}`,
        requestData
      ),
      API_RETRY_COUNT,
      API_RETRY_DELAY
    );
    
    if (!response.data.success || !response.data.data?.chapter) {
      throw new Error(response.data.error?.message || 'Failed to generate chapter');
    }
    
    logger.info(`API successfully generated chapter ${chapterNumber}`, {
      title: response.data.data.chapter.title,
      qualityScore: response.data.data.metrics.qualityScore,
      generationTime: `${response.data.data.metrics.generationTime / 1000} seconds`,
      plotConsistency: response.data.data.plotInfo?.mode || 'Unknown'
    });
    
    return response.data.data.chapter;
  } catch (error) {
    if (error.isAxiosError) {
      const responseData = error.response?.data ? 
        (typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data)) : 
        'No response data';
        
      logger.error(`API error while generating chapter ${chapterNumber}`, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: responseData,
        url: error.config?.url,
        method: error.config?.method
      });
    } else {
      logger.error(`Error generating chapter ${chapterNumber}`, {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
    }
    throw error;
  }
};

/**
 * Checks the API status and retrieves system information
 */
const checkApiStatus = async () => {
  try {
    logger.info(`Testing API endpoint: ${API_BASE_URL}`);
    
    const response = await retry(
      () => axiosInstance.get(API_BASE_URL), 
      API_RETRY_COUNT, 
      API_RETRY_DELAY
    );
    
    if (!response.data.success) {
      logger.error('API status check failed', { 
        error: response.data.error,
        data: response.data
      });
      return false;
    }
    
    const statusData = response.data.data;
    
    logger.info('API status check successful', {
      apiKeyValid: statusData.generation.apiKeyValid,
      model: statusData.generation.model,
      latestChapter: statusData.chapters.latestChapterNumber,
      memoryInitialized: statusData.memory.initialized,
      parametersLoaded: statusData.parameters.initialized
    });
    
    return true;
  } catch (error) {
    logger.error('Failed to connect to API', {
      error: error instanceof Error ? error.message : String(error),
      url: API_BASE_URL,
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    return false;
  }
};

/**
 * Gets previously generated chapters from the API
 */
const getPreviousChapters = async (startChapter) => {
  if (startChapter <= 1) return [];
  
  try {
    logger.info(`Retrieving previously generated chapters (1 to ${startChapter - 1})...`);
    
    const response = await axiosInstance.get(API_BASE_URL);
    if (!response.data.success) {
      logger.warn('Failed to retrieve previous chapters');
      return [];
    }
    
    const chaptersList = response.data.data.chapters.chaptersList || [];
    const chapters = [];
    
    // For each chapter in the list, get the full chapter data
    for (const chapterInfo of chaptersList) {
      if (chapterInfo.number < startChapter) {
        try {
          const chapterResponse = await axiosInstance.get(`${API_BASE_URL}/${chapterInfo.number}`);
          if (chapterResponse.data.success && chapterResponse.data.data?.chapter) {
            chapters.push(chapterResponse.data.data.chapter);
          }
        } catch (error) {
          logger.warn(`Failed to retrieve chapter ${chapterInfo.number}`);
        }
      }
    }
    
    logger.info(`Retrieved ${chapters.length} previous chapters`);
    return chapters;
    
  } catch (error) {
    logger.error('Error retrieving previous chapters', {
      error: error instanceof Error ? error.message : String(error)
    });
    return [];
  }
};

/**
 * Saves a summary of the generated novel
 */
const saveNovelSummary = (chapters) => {
  try {
    // Create a summary of the novel
    const summary = {
      title: "Generated Novel",
      totalChapters: chapters.length,
      generatedAt: new Date().toISOString(),
      totalWordCount: chapters.reduce((sum, chapter) => sum + chapter.wordCount, 0),
      averageQualityScore: chapters.reduce((sum, chapter) => sum + (chapter.metadata.qualityScore || 0), 0) / chapters.length,
      chapters: chapters.map(chapter => ({
        number: chapter.chapterNumber,
        title: chapter.title,
        wordCount: chapter.wordCount,
        qualityScore: chapter.metadata.qualityScore,
        summary: chapter.summary,
        scenes: chapter.scenes?.length || 0,
        createdAt: chapter.createdAt
      }))
    };
    
    // Save the summary to file
    fs.writeFileSync(NOVEL_SUMMARY_FILE, JSON.stringify(summary, null, 2));
    logger.info('Novel summary saved', { path: NOVEL_SUMMARY_FILE });
    
    return summary;
  } catch (error) {
    logger.error('Error saving novel summary', {
      error: error instanceof Error ? error.message : String(error)
    });
    return null;
  }
};

/**
 * Generates a novel by calling the API endpoint for each chapter
 */
const generateNovel = async () => {
  // Get starting chapter
  const startChapter = await getStartingChapter();
  
  const startTime = Date.now();
  logger.info('Starting novel generation process', { 
    apiUrl: API_BASE_URL,
    startingChapter: startChapter,
    totalChapters: TOTAL_CHAPTERS,
    delayBetweenChapters: `${DELAY_BETWEEN_CHAPTERS / 1000} seconds`
  });
  
  // Create directory structure
  createLogDirectories();
  
  // Fetch previously generated chapters if starting from the middle
  const generatedChapters = await getPreviousChapters(startChapter);
  
  try {
    // Check API status first (with retries)
    let apiReady = false;
    for (let i = 0; i < API_RETRY_COUNT; i++) {
      logger.info(`API status check attempt ${i + 1}/${API_RETRY_COUNT}`);
      apiReady = await checkApiStatus();
      if (apiReady) break;
      
      if (i < API_RETRY_COUNT - 1) {
        const waitTime = API_RETRY_DELAY * (i + 1);
        logger.info(`Waiting ${waitTime/1000} seconds before next API status check`);
        await delay(waitTime);
      }
    }
    
    if (!apiReady) {
      logger.error('API is not ready after multiple retries. Aborting novel generation.');
      return;
    }
    
    // Generate chapters sequentially, starting from the specified chapter
    for (let i = startChapter; i <= TOTAL_CHAPTERS; i++) {
      const isLastChapter = i === TOTAL_CHAPTERS;
      const chapterStartTime = Date.now();
      
      logger.info(`Starting generation of chapter ${i}${isLastChapter ? ' (final chapter)' : ''}`, {
        progress: `${i}/${TOTAL_CHAPTERS}`
      });
      
      // Prepare request data
      const requestData = {
        targetLength: 8000,
        forcedGeneration: false,
        overrides: {}
      };
      
      // Special settings for the final chapter
      if (isLastChapter) {
        requestData.overrides = {
          tension: 0.9,  // High tension for climax
          pacing: 0.8    // Fast pacing for conclusion
        };
        requestData.notes = "This is the final chapter. Please ensure the story reaches a satisfying conclusion.";
      }
      
      try {
        // Call the API to generate the chapter
        const chapter = await generateChapter(i, requestData);
        
        // Add to generated chapters list
        generatedChapters.push(chapter);
        
        const chapterGenerationTime = (Date.now() - chapterStartTime) / 1000;
        
        logger.info(`Successfully completed chapter ${i}`, {
          title: chapter.title,
          wordCount: chapter.wordCount,
          generationTime: `${chapterGenerationTime.toFixed(1)} seconds`
        });
        
        // Save progress after each chapter
        saveNovelSummary(generatedChapters);
        
      } catch (error) {
        logger.error(`Failed to generate chapter ${i}`, {
          error: error instanceof Error ? error.message : String(error)
        });
        
        // Continue with next chapter despite failure
        logger.info(`Continuing with next chapter despite failure on chapter ${i}`);
      }
      
      // Delay before generating the next chapter (except after the last one)
      if (i < TOTAL_CHAPTERS) {
        logger.info(`Waiting ${DELAY_BETWEEN_CHAPTERS / 1000} seconds before generating next chapter`);
        await delay(DELAY_BETWEEN_CHAPTERS);
      }
    }
    
    // Final novel summary
    const summary = saveNovelSummary(generatedChapters);
    
    const totalGenerationTime = (Date.now() - startTime) / 1000 / 60; // minutes
    
    logger.info('Novel generation completed successfully', {
      totalChapters: generatedChapters.length,
      totalWordCount: summary?.totalWordCount || 'unknown',
      averageQualityScore: summary?.averageQualityScore || 'unknown',
      totalGenerationTime: `${totalGenerationTime.toFixed(1)} minutes`
    });
    
  } catch (error) {
    logger.error('Fatal error during novel generation process', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
  }
};

// Execute the novel generation
generateNovel().catch(error => {
  console.error('Unhandled error in novel generation script:', error);
  process.exit(1);
});