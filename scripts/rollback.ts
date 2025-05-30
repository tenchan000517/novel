import { execSync } from 'child_process';
import { logger } from '../src/lib/utils/logger';
import { logError } from '../src/lib/utils/error-handler';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// 環境変数の読み込み
dotenv.config();

/**
 * ロールバック構成インターフェース
 */
interface RollbackConfig {
  /** ターゲット環境 */
  environment: 'production' | 'staging';
  
  /** ロールバック先バージョン */
  version: string;
  
  /** ドライランモード */
  dryRun: boolean;
  
  /** 通知の有効化 */
  notify: boolean;
  
  /** 強制モード */
  force: boolean;
}

/**
 * デプロイメント記録
 */
interface DeploymentRecord {
  version: string;
  timestamp: string;
  deploymentId: string;
  commit: string;
}

/**
 * 指定されたバージョンへのロールバックを実行
 * @param config ロールバック構成
 */
async function rollback(config: RollbackConfig) {
  try {
    logger.info(`Starting rollback to version ${config.version} in ${config.environment} environment`);
    
    if (config.dryRun) {
      logger.info('DRY RUN - No actual changes will be made');
    }
    
    // バージョン履歴の読み込み
    const deployments = loadDeploymentHistory();
    
    // バージョン検証
    const targetDeployment = deployments.find(d => d.version === config.version);
    if (!targetDeployment) {
      // バージョンが見つからない場合は利用可能なバージョンを表示
      const availableVersions = deployments.map(d => d.version).join(', ');
      throw new Error(`Version ${config.version} not found. Available versions: ${availableVersions}`);
    }
    
    logger.info(`Found deployment record: ${JSON.stringify(targetDeployment)}`);
    
    // 最新バージョンかどうかチェック
    const latestDeployment = deployments[0]; // 履歴は新しい順
    if (targetDeployment.version === latestDeployment.version && !config.force) {
      logger.warn(`Version ${config.version} is already the current version. Use --force to rollback anyway.`);
      return;
    }
    
    // 前回のデプロイより古いバージョンへのロールバック確認
    if (new Date(targetDeployment.timestamp) < new Date(latestDeployment.timestamp) && !config.force) {
      const timeDiff = Math.floor((new Date(latestDeployment.timestamp).getTime() - new Date(targetDeployment.timestamp).getTime()) / (1000 * 60 * 60 * 24));
      logger.warn(`Rolling back to a version from ${timeDiff} days ago. This may cause data incompatibility issues.`);
      
      if (!config.dryRun) {
        const answer = await promptConfirmation('Are you sure you want to continue? (y/N): ');
        if (answer.toLowerCase() !== 'y') {
          logger.info('Rollback cancelled by user');
          return;
        }
      }
    }
    
    // ロールバック実行
    if (!config.dryRun) {
      logger.info(`Executing rollback to ${config.version} (${targetDeployment.commit.substring(0, 7)})`);
      
      // 環境変数の設定
      process.env.ROLLBACK_VERSION = config.version;
      process.env.ROLLBACK_COMMIT = targetDeployment.commit;
      
      // Vercelへのデプロイコマンド
      const deployCommand = `
        vercel --prod \
        --token ${process.env.VERCEL_TOKEN} \
        --scope ${process.env.VERCEL_TEAM_OR_USER} \
        --confirm \
        --meta rollbackFrom=${latestDeployment.version} \
        --meta rollbackTo=${config.version} \
        --meta isRollback=true
      `;
      
      // 代替的なアプローチ: 特定のコミットやタグをデプロイ
      const gitCommand = `
        git checkout ${targetDeployment.commit} && \
        npm ci && \
        npm run build && \
        vercel --prod \
        --token ${process.env.VERCEL_TOKEN} \
        --scope ${process.env.VERCEL_TEAM_OR_USER} \
        --confirm
      `;
      
      try {
        execSync(deployCommand, { stdio: 'inherit' });
        
        // ロールバックの記録
        recordRollback({
          timestamp: new Date().toISOString(),
          fromVersion: latestDeployment.version,
          toVersion: config.version,
          reason: 'Manual rollback via script',
          initiatedBy: process.env.USER || 'unknown'
        });
        
        logger.info(`Rollback to version ${config.version} completed successfully`);
        
        // 通知送信
        if (config.notify) {
          sendRollbackNotification(config, latestDeployment.version, true);
        }
      } catch (error: unknown) {
        logError(error, { 
          command: 'deployCommand',
          environment: config.environment,
          version: config.version
        }, 'Deployment command failed');
        
        // 通知送信
        if (config.notify) {
          sendRollbackNotification(config, latestDeployment.version, false);
        }
        
        process.exit(1);
      }
    } else {
      logger.info(`DRY RUN: Would rollback from ${latestDeployment.version} to ${config.version} (${targetDeployment.commit.substring(0, 7)})`);
    }
  } catch (error: unknown) {
    logError(error, { 
      config: {
        environment: config.environment,
        version: config.version,
        dryRun: config.dryRun
      }
    }, 'Rollback failed');
    process.exit(1);
  }
}

/**
 * デプロイメント履歴を読み込み
 * @returns デプロイメント記録の配列
 */
function loadDeploymentHistory(): DeploymentRecord[] {
  try {
    const historyPath = path.join(process.cwd(), 'deployment-history.json');
    
    if (!fs.existsSync(historyPath)) {
      logger.warn('Deployment history file not found');
      return [];
    }
    
    const history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
    return Array.isArray(history) ? history : [];
  } catch (error: unknown) {
    logError(error, {
      action: 'loadDeploymentHistory'
    }, 'Failed to load deployment history');
    return [];
  }
}

/**
 * ロールバックを記録
 * @param rollbackInfo ロールバック情報
 */
function recordRollback(rollbackInfo: any): void {
  try {
    const rollbacksPath = path.join(process.cwd(), 'rollback-history.json');
    
    let history: any[] = [];
    if (fs.existsSync(rollbacksPath)) {
      history = JSON.parse(fs.readFileSync(rollbacksPath, 'utf8'));
    }
    
    history.unshift(rollbackInfo); // 最新を先頭に追加
    
    fs.writeFileSync(rollbacksPath, JSON.stringify(history, null, 2));
    logger.info(`Rollback recorded in history`);
  } catch (error: unknown) {
    logError(error, {
      rollbackInfo
    }, 'Failed to record rollback');
  }
}

/**
 * ユーザー確認を促す
 * @param message 確認メッセージ
 * @returns ユーザー入力
 */
function promptConfirmation(message: string): Promise<string> {
  return new Promise((resolve) => {
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    readline.question(message, (answer: string) => {
      readline.close();
      resolve(answer);
    });
  });
}

/**
 * ロールバック通知を送信
 * @param config ロールバック構成
 * @param fromVersion ロールバック元バージョン
 * @param success 成功フラグ
 */
function sendRollbackNotification(config: RollbackConfig, fromVersion: string, success: boolean): void {
  try {
    // Slack通知
    if (process.env.SLACK_WEBHOOK_URL) {
      const payload = {
        attachments: [
          {
            color: success ? '#36a64f' : '#ff0000',
            title: success 
              ? `✅ Rollback Successful: ${config.environment}`
              : `❌ Rollback Failed: ${config.environment}`,
            text: success
              ? `Successfully rolled back from ${fromVersion} to ${config.version}`
              : `Failed to rollback from ${fromVersion} to ${config.version}`,
            fields: [
              {
                title: 'Environment',
                value: config.environment,
                short: true
              },
              {
                title: 'Version',
                value: config.version,
                short: true
              },
              {
                title: 'Initiated by',
                value: process.env.USER || 'unknown',
                short: true
              },
              {
                title: 'Timestamp',
                value: new Date().toISOString(),
                short: true
              }
            ]
          }
        ]
      };
      
      const { default: axios } = require('axios');
      axios.post(process.env.SLACK_WEBHOOK_URL, payload).catch((error: unknown) => {
        logError(error, {
          notification: 'slack',
          environment: config.environment,
          version: config.version
        }, 'Failed to send Slack notification');
      });
    }
  } catch (error: unknown) {
    logError(error, {
      config: {
        environment: config.environment,
        version: config.version
      },
      fromVersion,
      success
    }, 'Failed to send notification');
  }
}

// コマンドライン引数の解析
const argv = process.argv.slice(2);
const config: RollbackConfig = {
  environment: (argv[0] as 'production' | 'staging') || 'staging',
  version: argv[1],
  dryRun: argv.includes('--dry-run'),
  notify: argv.includes('--notify'),
  force: argv.includes('--force')
};

// バージョン必須チェック
if (!config.version) {
  console.error('Error: Version is required');
  console.log('Usage: ts-node rollback.ts <environment> <version> [--dry-run] [--notify] [--force]');
  console.log('Example: ts-node rollback.ts production v1.2.3');
  process.exit(1);
}

// ロールバック実行
rollback(config);