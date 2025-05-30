
// // src/lib/monitoring/log-aggregator.ts
// import winston from 'winston';
// import { ElasticsearchTransport } from 'winston-elasticsearch';
// import { logError } from '@/lib/utils/error-handler';


// /**
//  * 構造化ロギングシステムを作成
//  * 開発環境とプロダクション環境向けに最適化
//  * @returns 設定済みのロガーインスタンス
//  */
// export const createLogger = () => {
//   // 基本トランスポートの設定
//   const transports: winston.transport[] = [
//     // 常にコンソール出力を有効化
//     new winston.transports.Console({
//       format: winston.format.combine(
//         winston.format.timestamp(),
//         winston.format.colorize(),
//         winston.format.printf(({ level, message, timestamp, ...meta }) => {
//           const metaStr = Object.keys(meta).length 
//             ? `\n${JSON.stringify(meta, null, 2)}`
//             : '';
//           return `${timestamp} [${level}]: ${message}${metaStr}`;
//         })
//       ),
//       level: process.env.LOG_LEVEL || 'info',
//     }),
//   ];
  
//   // 開発環境以外ではファイルロギングも追加
//   if (process.env.NODE_ENV !== 'development') {
//     transports.push(
//       new winston.transports.File({
//         filename: 'logs/error.log',
//         level: 'error',
//         format: winston.format.combine(
//           winston.format.timestamp(),
//           winston.format.json()
//         ),
//         maxsize: 10 * 1024 * 1024, // 10MB
//         maxFiles: 10,
//       }),
//       new winston.transports.File({
//         filename: 'logs/combined.log',
//         format: winston.format.combine(
//           winston.format.timestamp(),
//           winston.format.json()
//         ),
//         maxsize: 10 * 1024 * 1024, // 10MB
//         maxFiles: 10,
//       })
//     );
//   }
  
//   // Elasticsearchが設定されている場合はElasticsearchトランスポートを追加
//   if (process.env.ELASTICSEARCH_URL) {
//     transports.push(
//       new ElasticsearchTransport({
//         level: 'info',
//         clientOpts: { node: process.env.ELASTICSEARCH_URL },
//         indexPrefix: process.env.ELASTICSEARCH_INDEX_PREFIX || 'auto-novel-logs',
//         indexSuffixPattern: 'YYYY.MM.DD',
//         messageType: 'log',
//         apm: {
//           active: process.env.ELASTIC_APM_ACTIVE === 'true',
//           serviceName: process.env.ELASTIC_APM_SERVICE_NAME || 'auto-novel-system',
//         },
//       })
//     );
//   }
  
//   // ロガーの作成
//   const logger = winston.createLogger({
//     level: process.env.LOG_LEVEL || 'info',
//     format: winston.format.combine(
//       winston.format.timestamp(),
//       winston.format.errors({ stack: true }),
//       winston.format.metadata(),
//       winston.format.json()
//     ),
//     defaultMeta: { service: 'auto-novel-system' },
//     transports,
//     exitOnError: false,
//   });
  
//   // ノードプロセスの未捕捉例外とプロミス拒否をログに記録
//   logger.exceptions.handle(
//     new winston.transports.File({ filename: 'logs/exceptions.log' })
//   );
  
//   // Node.js 15以降の場合
//   if (typeof logger.rejections?.handle === 'function') {
//     logger.rejections.handle(
//       new winston.transports.File({ filename: 'logs/rejections.log' })
//     );
//   }
  
//   return logger;
// };

// /**
//  * ログストリームを取得
//  * @param options ログストリームオプション
//  * @returns 指定範囲のログストリーム
//  */
// export const getLogStream = (options: {
//   level?: string;
//   start?: Date;
//   end?: Date;
//   limit?: number;
// }) => {
//   const { level = 'info', start, end, limit = 100 } = options;
  
//   // ファイルからログを読み取る実装
//   // 実際の実装ではElasticsearchから取得する方がより適切
  
//   // この実装はシンプルな例として提供
//   return {
//     async *getLogs() {
//       try {
//         const fs = require('fs');
//         const readline = require('readline');
        
//         const logFile = level === 'error' ? 'logs/error.log' : 'logs/combined.log';
        
//         if (!fs.existsSync(logFile)) {
//           yield [];
//           return;
//         }
        
//         const fileStream = fs.createReadStream(logFile);
//         const rl = readline.createInterface({
//           input: fileStream,
//           crlfDelay: Infinity
//         });
        
//         const logs = [];
//         let count = 0;
        
//         for await (const line of rl) {
//           if (count >= limit) break;
          
//           try {
//             const log = JSON.parse(line);
            
//             // 日付フィルター
//             if (start && new Date(log.timestamp) < start) continue;
//             if (end && new Date(log.timestamp) > end) continue;
            
//             // レベルフィルター（combined.logの場合）
//             if (logFile === 'logs/combined.log') {
//               const logLevelValue = winston.config.npm.levels[log.level] || 0;
//               const targetLevelValue = winston.config.npm.levels[level] || 0;
              
//               if (logLevelValue < targetLevelValue) continue;
//             }
            
//             logs.push(log);
//             count++;
//           } catch (e) {
//             // パース失敗は無視
//           }
//         }
        
//         yield logs;
//       } catch (error: unknown) {
//         console.error('Error reading logs:', error);
//         yield [];
//       }
//     }
//   };
// };

// // 集約ログAPIを設定
// export const createLogApi = (app: any) => {
//   app.get('/api/logs', async (req: any, res: any) => {
//     try {
//       const { level, start, end, limit } = req.query;
      
//       const options = {
//         level: level || 'info',
//         start: start ? new Date(start) : undefined,
//         end: end ? new Date(end) : undefined,
//         limit: limit ? parseInt(limit, 10) : 100
//       };
      
//       const logStream = getLogStream(options);
      
//       for await (const logs of logStream.getLogs()) {
//         return res.json({ logs });
//       }
//     } catch (error: unknown) {
//       console.error('Error serving logs:', error);
//       res.status(500).json({ error: 'Failed to retrieve logs' });
//     }
//   });
// };