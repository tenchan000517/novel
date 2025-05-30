
// src/lib/monitoring/alert-manager.ts
import { logger } from '../utils/logger';
import { MetricsCollector } from './metrics-collector';
import axios from 'axios';
import { logError } from '@/lib/utils/error-handler';

/**
 * アラートの重要度
 */
export type AlertSeverity = 'info' | 'warning' | 'critical';

/**
 * アラートルール定義
 */
interface AlertRule {
  // アラート名
  name: string;
  
  // アラート条件（trueの場合にアラート発生）
  condition: () => boolean;
  
  // アラートメッセージ
  message: string;
  
  // アラート重要度
  severity: AlertSeverity;
  
  // クールダウン（分）：同じアラートが再発行されない期間
  cooldown: number;
}

/**
 * アラート通知先設定
 */
interface AlertDestination {
  // 通知先タイプ
  type: 'slack' | 'email' | 'webhook';
  
  // 通知先設定
  config: Record<string, any>;
  
  // 重要度フィルター（指定された重要度以上のみ通知）
  minSeverity: AlertSeverity;
}

/**
 * アラート管理システム
 * システムの異常を検知し、通知を管理するクラス
 */
export class AlertManager {
  // 発生したアラートの履歴（名前→タイムスタンプ）
  private alerts: Map<string, number> = new Map();
  
  // アラートルール
  private rules: AlertRule[] = [];
  
  // 通知先
  private destinations: AlertDestination[] = [];
  
  // メトリクスコレクター
  private metricsCollector: MetricsCollector;
  
  // チェック間隔（ミリ秒）
  private checkInterval: number = 60000; // デフォルト: 1分
  
  // タイマーID
  private timerID?: NodeJS.Timeout;
  
  constructor() {
    this.metricsCollector = MetricsCollector.getInstance();
    this.setupDefaultRules();
    this.setupDefaultDestinations();
    
    logger.info('Alert manager initialized');
  }
  
  /**
   * デフォルトのアラートルールを設定
   */
  private setupDefaultRules() {
    this.rules = [
      // 高エラー率アラート
      {
        name: 'high_error_rate',
        condition: () => {
          const errorRate = this.calculateErrorRate();
          return errorRate > 0.1; // 10% エラー率
        },
        message: 'High error rate detected in chapter generation',
        severity: 'critical',
        cooldown: 5,
      },
      
      // 遅い生成時間アラート
      {
        name: 'slow_generation',
        condition: () => {
          const avgTime = this.getAverageGenerationTime();
          return avgTime > 30; // 30秒以上
        },
        message: 'Chapter generation is taking too long',
        severity: 'warning',
        cooldown: 10,
      },
      
      // 高メモリ使用量アラート
      {
        name: 'high_memory_usage',
        condition: () => {
          const memoryUsage = process.memoryUsage().heapUsed;
          const threshold = parseInt(process.env.MAX_MEMORY_BYTES || '1073741824', 10); // 1GB
          return memoryUsage > threshold;
        },
        message: 'High memory usage detected',
        severity: 'warning',
        cooldown: 15,
      },
      
      // 待機ジョブ過多アラート
      {
        name: 'high_pending_jobs',
        condition: () => {
          const pendingJobs = this.metricsCollector.getMetricValue('active_generations');
          return pendingJobs !== null && pendingJobs > 5;
        },
        message: 'High number of pending generation jobs',
        severity: 'warning',
        cooldown: 5,
      },
      
      // APIエラー率アラート
      {
        name: 'api_error_spike',
        condition: () => {
          const apiErrors = this.metricsCollector.getMetricValue('api_errors_total');
          const apiRequests = this.metricsCollector.getMetricValue('api_requests_total');
          
          if (apiErrors === null || apiRequests === null || apiRequests === 0) {
            return false;
          }
          
          return (apiErrors / apiRequests) > 0.05; // 5% エラー率
        },
        message: 'API error rate spike detected',
        severity: 'warning',
        cooldown: 5,
      }
    ];
  }
  
  /**
   * デフォルトの通知先を設定
   */
  private setupDefaultDestinations() {
    // Slack Webhookが設定されている場合
    if (process.env.SLACK_WEBHOOK_URL) {
      this.destinations.push({
        type: 'slack',
        config: {
          webhookUrl: process.env.SLACK_WEBHOOK_URL,
          channel: process.env.SLACK_CHANNEL || '#alerts',
        },
        minSeverity: 'warning',
      });
    }
    
    // メール設定がある場合
    if (process.env.ALERT_EMAIL) {
      this.destinations.push({
        type: 'email',
        config: {
          to: process.env.ALERT_EMAIL,
          from: process.env.ALERT_EMAIL_FROM || 'alerts@autonovel.app',
        },
        minSeverity: 'critical',
      });
    }
    
    // 常にログに記録
    this.destinations.push({
      type: 'webhook',
      config: {
        url: 'log://',
      },
      minSeverity: 'info',
    });
  }
  
  /**
   * アラートルールを追加
   * @param rule アラートルール
   */
  addRule(rule: AlertRule): void {
    this.rules.push(rule);
    logger.info(`Alert rule added: ${rule.name}`);
  }
  
  /**
   * アラート通知先を追加
   * @param destination 通知先設定
   */
  addDestination(destination: AlertDestination): void {
    this.destinations.push(destination);
    logger.info(`Alert destination added: ${destination.type}`);
  }
  
  /**
   * アラートチェックを開始
   * @param interval チェック間隔（ミリ秒）
   */
  start(interval: number = this.checkInterval): void {
    if (this.timerID) {
      this.stop();
    }
    
    this.checkInterval = interval;
    this.timerID = setInterval(() => this.checkAlerts(), interval);
    logger.info(`Alert manager started with interval: ${interval}ms`);
  }
  
  /**
   * アラートチェックを停止
   */
  stop(): void {
    if (this.timerID) {
      clearInterval(this.timerID);
      this.timerID = undefined;
      logger.info('Alert manager stopped');
    }
  }
  
  /**
   * すべてのアラートルールをチェック
   */
  async checkAlerts(): Promise<void> {
    logger.debug('Checking alert rules');
    
    for (const rule of this.rules) {
      try {
        if (rule.condition()) {
          const lastAlert = this.alerts.get(rule.name) || 0;
          const now = Date.now();
          
          // クールダウン期間を超えている場合のみアラート発行
          if (now - lastAlert > rule.cooldown * 60 * 1000) {
            await this.sendAlert(rule);
            this.alerts.set(rule.name, now);
          } else {
            logger.debug(`Alert ${rule.name} in cooldown period`);
          }
        }
      } catch (error: unknown) {
        logError(error, {}, "Error checking alert rule ${rule.name}:");
      }
    }
  }
  
  /**
   * アラートを送信
   * @param rule 発生したアラートルール
   */
  private async sendAlert(rule: AlertRule): Promise<void> {
    logger.error(`ALERT [${rule.severity}] ${rule.name}: ${rule.message}`);
    
    // 該当する重要度の通知先にアラートを送信
    const alertTimestamp = new Date().toISOString();
    const severityValues = { 'info': 1, 'warning': 2, 'critical': 3 };
    const alertSeverityValue = severityValues[rule.severity];
    
    for (const destination of this.destinations) {
      try {
        const destSeverityValue = severityValues[destination.minSeverity];
        
        // 通知先の最小重要度を満たす場合のみ送信
        if (alertSeverityValue >= destSeverityValue) {
          switch (destination.type) {
            case 'slack':
              await this.sendToSlack(rule, destination.config, alertTimestamp);
              break;
            case 'email':
              await this.sendToEmail(rule, destination.config, alertTimestamp);
              break;
            case 'webhook':
              await this.sendToWebhook(rule, destination.config, alertTimestamp);
              break;
          }
        }
      } catch (error: unknown) {
        logError(error, {}, "Error sending alert to ${destination.type}:");
      }
    }
  }
  
  /**
   * Slackにアラートを送信
   */
  private async sendToSlack(rule: AlertRule, config: Record<string, any>, timestamp: string): Promise<void> {
    // Slackメッセージの色を重要度に基づいて設定
    const colorMap: Record<AlertSeverity, string> = {
      'info': '#2196F3',
      'warning': '#FFC107',
      'critical': '#F44336'
    };
    
    const payload = {
      channel: config.channel,
      attachments: [
        {
          fallback: `Alert: ${rule.message}`,
          color: colorMap[rule.severity],
          title: `Alert: ${rule.name}`,
          text: rule.message,
          fields: [
            {
              title: 'Severity',
              value: rule.severity.toUpperCase(),
              short: true
            },
            {
              title: 'Time',
              value: timestamp,
              short: true
            }
          ],
          footer: 'Auto Novel System',
          footer_icon: 'https://platform.slack-edge.com/img/default_application_icon.png',
          ts: Math.floor(Date.now() / 1000)
        }
      ]
    };
    
    try {
      await axios.post(config.webhookUrl, payload);
      logger.info(`Alert sent to Slack: ${rule.name}`);
    } catch (error: unknown) {
      logError(error, {}, "Error sending alert to Slack:");
      throw error;
    }
  }
  
  /**
   * メールでアラートを送信
   */
  private async sendToEmail(rule: AlertRule, config: Record<string, any>, timestamp: string): Promise<void> {
    // メール送信はシステムに応じて実装
    // この例では実装を省略し、ログに記録のみ
    logger.info(`Would send email alert to ${config.to}: ${rule.name} - ${rule.message}`);
  }
  
  /**
   * Webhookにアラートを送信
   */
  private async sendToWebhook(rule: AlertRule, config: Record<string, any>, timestamp: string): Promise<void> {
    // ログ専用の特殊URLの場合はスキップ（既にログは記録済み）
    if (config.url === 'log://') {
      return;
    }
    
    const payload = {
      name: rule.name,
      message: rule.message,
      severity: rule.severity,
      timestamp,
      source: 'auto-novel-system'
    };
    
    try {
      await axios.post(config.url, payload);
      logger.info(`Alert sent to webhook: ${rule.name}`);
    } catch (error: unknown) {
      logError(error, {}, "Error sending alert to webhook:");
      throw error;
    }
  }
  
  /**
   * エラー率の計算
   */
  private calculateErrorRate(): number {
    const failures = this.metricsCollector.getMetricValue('chapter_generation_failure_total');
    const successes = this.metricsCollector.getMetricValue('chapter_generation_success_total');
    
    if (failures === null || successes === null) {
      return 0;
    }
    
    const total = failures + successes;
    if (total === 0) {
      return 0;
    }
    
    return failures / total;
  }
  
  /**
   * 平均生成時間の取得
   */
  private getAverageGenerationTime(): number {
    // 実際の実装ではPrometheusクエリまたはメトリクス履歴から計算する
    // 簡略化のため、ここではメトリクス値を直接使用
    const avgTime = this.metricsCollector.getMetricValue('chapter_generation_duration_seconds_sum') || 0;
    const count = this.metricsCollector.getMetricValue('chapter_generation_duration_seconds_count') || 1;
    
    return avgTime / count;
  }
  
  /**
   * アラート履歴を取得
   */
  getAlertHistory(): Record<string, Date> {
    const history: Record<string, Date> = {};
    
    this.alerts.forEach((timestamp, name) => {
      history[name] = new Date(timestamp);
    });
    
    return history;
  }
  
  /**
   * アラートルールのリストを取得
   */
  getRules(): AlertRule[] {
    return [...this.rules];
  }
}

// シングルトンインスタンスを提供
let alertManagerInstance: AlertManager | null = null;

export function getAlertManager(): AlertManager {
  if (!alertManagerInstance) {
    alertManagerInstance = new AlertManager();
  }
  return alertManagerInstance;
}