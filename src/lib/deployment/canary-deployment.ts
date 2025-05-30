
// src/lib/deployment/canary-deployment.ts
import { logger } from '../utils/logger';
import { logError } from '@/lib/utils/error-handler';


/**
 * カナリアデプロイメント設定
 */
interface CanaryConfig {
  /** カナリア有効フラグ */
  enabled: boolean;
  
  /** カナリア割合（%） */
  percentage: number;
  
  /** カナリアバージョン */
  version: string;
  
  /** ターゲットグループ（オプション） */
  targetGroups?: {
    /** グループ名 */
    name: string;
    
    /** セレクター条件 */
    selector: (req: any) => boolean;
    
    /** 割り当て率（%） */
    allocation: number;
  }[];
  
  /** モニタリング設定 */
  monitoring?: {
    /** メトリクス収集間隔（ms） */
    metricInterval: number;
    
    /** 自動ロールバックしきい値 */
    autoRollbackThreshold: number;
    
    /** 自動昇格しきい値 */
    autoPromoteThreshold: number;
  };
}

/**
 * カナリアデプロイメント管理クラス
 * トラフィックの段階的なルーティングと自動監視を提供
 */
export class CanaryDeployment {
  /** 設定 */
  private config: CanaryConfig;
  
  /** カナリアメトリクス */
  private metrics: {
    requests: { stable: number; canary: number };
    errors: { stable: number; canary: number };
    latency: { stable: number[]; canary: number[] };
  };
  
  /** モニタリングタイマーID */
  private monitoringTimer?: NodeJS.Timeout;
  
  /**
   * カナリアデプロイメント管理を初期化
   */
  constructor() {
    this.config = this.loadConfig();
    
    this.metrics = {
      requests: { stable: 0, canary: 0 },
      errors: { stable: 0, canary: 0 },
      latency: { stable: [], canary: [] },
    };
    
    if (this.config.enabled) {
      logger.info(`Canary deployment enabled: ${this.config.percentage}% traffic to version ${this.config.version}`);
      
      // モニタリング設定がある場合は開始
      if (this.config.monitoring) {
        this.startMonitoring();
      }
    } else {
      logger.info('Canary deployment is disabled');
    }
  }
  
  /**
   * 環境変数から設定を読み込み
   * @returns カナリア設定
   */
  private loadConfig(): CanaryConfig {
    return {
      enabled: process.env.CANARY_ENABLED === 'true',
      percentage: parseInt(process.env.CANARY_PERCENTAGE || '0', 10),
      version: process.env.CANARY_VERSION || '',
      targetGroups: process.env.CANARY_TARGET_GROUPS 
        ? JSON.parse(process.env.CANARY_TARGET_GROUPS)
        : undefined,
      monitoring: process.env.CANARY_MONITORING_ENABLED === 'true'
        ? {
            metricInterval: parseInt(process.env.CANARY_METRIC_INTERVAL || '60000', 10),
            autoRollbackThreshold: parseFloat(process.env.CANARY_AUTO_ROLLBACK_THRESHOLD || '0.05'),
            autoPromoteThreshold: parseFloat(process.env.CANARY_AUTO_PROMOTE_THRESHOLD || '0.01'),
          }
        : undefined
    };
  }
  
  /**
   * リクエストをカナリアにルーティングすべきか判定
   * @param req HTTPリクエスト
   * @returns カナリーにルーティングすべきかのフラグ
   */
  shouldUseCanary(req?: any): boolean {
    if (!this.config.enabled || this.config.percentage <= 0) {
      return false;
    }
    
    // ターゲットグループによるルーティング
    if (req && this.config.targetGroups && this.config.targetGroups.length > 0) {
      for (const group of this.config.targetGroups) {
        if (group.selector(req)) {
          // グループセレクターにマッチした場合、グループの割り当て率に基づいて判定
          return Math.random() * 100 < group.allocation;
        }
      }
    }
    
    // 標準的なランダム割り当て
    return Math.random() * 100 < this.config.percentage;
  }
  
  /**
   * 現在のバージョンを取得
   * @param req HTTPリクエスト（オプション）
   * @returns 適用されるバージョン
   */
  getVersion(req?: any): string {
    return this.shouldUseCanary(req) ? this.config.version : 'production';
  }
  
  /**
   * カナリールーティングミドルウェア
   * @returns Expressミドルウェア
   */
  middleware() {
    return (req: any, res: any, next: any) => {
      const isCanary = this.shouldUseCanary(req);
      const version = isCanary ? this.config.version : 'production';
      
      // リクエストカウント更新
      if (isCanary) {
        this.metrics.requests.canary++;
      } else {
        this.metrics.requests.stable++;
      }
      
      // レスポンスタイミング計測用
      const startTime = Date.now();
      
      // レスポンスヘッダー設定
      res.setHeader('X-Version', version);
      if (isCanary) {
        res.setHeader('X-Canary-Version', this.config.version);
        req.canaryVersion = this.config.version;
        logger.debug(`Request routed to canary version ${this.config.version}`);
      }
      
      // レスポンス完了時の処理
      const originalEnd = res.end;
      res.end = function(...args: any[]) {
        // レイテンシー計測
        const duration = Date.now() - startTime;
        
        // メトリクス更新
        if (isCanary) {
          this.metrics.latency.canary.push(duration);
          
          // エラーステータスの場合
          if (res.statusCode >= 400) {
            this.metrics.errors.canary++;
          }
        } else {
          this.metrics.latency.stable.push(duration);
          
          // エラーステータスの場合
          if (res.statusCode >= 400) {
            this.metrics.errors.stable++;
          }
        }
        
        // 元のレスポンス終了処理を実行
        return originalEnd.apply(this, args);
      };
      
      next();
    };
  }
  
  /**
   * カナリー評価モニタリングを開始
   */
  private startMonitoring() {
    if (!this.config.monitoring) return;
    
    this.monitoringTimer = setInterval(() => {
      this.evaluateCanary();
    }, this.config.monitoring.metricInterval);
    
    logger.info(`Canary monitoring started with interval ${this.config.monitoring.metricInterval}ms`);
  }
  
  /**
   * カナリーを評価し、必要に応じて自動アクションを実行
   */
  private evaluateCanary() {
    if (!this.config.monitoring || !this.config.enabled) return;
    
    try {
      const stableErrorRate = this.calculateErrorRate('stable');
      const canaryErrorRate = this.calculateErrorRate('canary');
      
      const stableLatency = this.calculateAverageLatency('stable');
      const canaryLatency = this.calculateAverageLatency('canary');
      
      logger.info('Canary evaluation:', {
        stable: {
          requests: this.metrics.requests.stable,
          errorRate: stableErrorRate,
          latency: stableLatency
        },
        canary: {
          requests: this.metrics.requests.canary,
          errorRate: canaryErrorRate,
          latency: canaryLatency
        }
      });
      
      // エラー率の差分が自動ロールバックしきい値を超える場合
      if (canaryErrorRate - stableErrorRate > this.config.monitoring.autoRollbackThreshold) {
        this.triggerRollback(canaryErrorRate, stableErrorRate);
        return;
      }
      
      // レイテンシーが著しく悪化している場合（50%以上の増加）
      if (canaryLatency > stableLatency * 1.5) {
        this.triggerRollback(canaryLatency, stableLatency, 'latency');
        return;
      }
      
      // 十分なリクエスト数かつエラー率が十分に低い場合、自動昇格を検討
      const minRequests = 100; // 最低リクエスト数の閾値
      if (
        this.metrics.requests.canary > minRequests &&
        canaryErrorRate <= this.config.monitoring.autoPromoteThreshold &&
        canaryErrorRate <= stableErrorRate
      ) {
        this.considerPromotion();
      }
    } catch (error: unknown) {
      logError(error, {}, "Error evaluating canary:");
    }
  }
  
  /**
   * エラー率を計算
   * @param version バージョン（'stable' または 'canary'）
   * @returns エラー率
   */
  private calculateErrorRate(version: 'stable' | 'canary'): number {
    const requests = this.metrics.requests[version];
    const errors = this.metrics.errors[version];
    
    if (requests === 0) return 0;
    return errors / requests;
  }
  
  /**
   * 平均レイテンシーを計算
   * @param version バージョン（'stable' または 'canary'）
   * @returns 平均レイテンシー
   */
  private calculateAverageLatency(version: 'stable' | 'canary'): number {
    const latencyArray = this.metrics.latency[version];
    
    if (latencyArray.length === 0) return 0;
    
    const sum = latencyArray.reduce((acc, val) => acc + val, 0);
    return sum / latencyArray.length;
  }
  
  /**
   * 自動ロールバックを開始
   * @param canaryMetric カナリーメトリック値
   * @param stableMetric 安定版メトリック値
   * @param metricType メトリックタイプ
   */
  private triggerRollback(canaryMetric: number, stableMetric: number, metricType: string = 'error_rate') {
    logger.warn(`Triggering automatic rollback due to high ${metricType}`, {
      canary: canaryMetric,
      stable: stableMetric,
      difference: canaryMetric - stableMetric
    });
    
    // 本番ではロールバックAPIを呼び出し
    // または管理者に通知
    
    // カナリーを無効化
    this.config.enabled = false;
    this.config.percentage = 0;
    
    // モニタリング停止
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
      this.monitoringTimer = undefined;
    }
    
    // 通知送信
    this.sendNotification({
      title: '🔴 Automatic Canary Rollback',
      message: `Canary version ${this.config.version} has been automatically rolled back due to high ${metricType}`,
      data: {
        version: this.config.version,
        metricType,
        canaryValue: canaryMetric,
        stableValue: stableMetric,
        timestamp: new Date().toISOString()
      }
    });
  }
  
  /**
   * カナリー昇格を検討
   */
  private considerPromotion() {
    logger.info(`Considering promotion of canary version ${this.config.version}`);
    
    // 実際のシステムでは、ここで自動昇格のロジックまたは通知を実装
    
    // 通知送信
    this.sendNotification({
      title: '🟢 Canary Promotion Candidate',
      message: `Canary version ${this.config.version} is performing well and is a candidate for promotion`,
      data: {
        version: this.config.version,
        metrics: {
          requests: this.metrics.requests.canary,
          errorRate: this.calculateErrorRate('canary'),
          latency: this.calculateAverageLatency('canary')
        },
        timestamp: new Date().toISOString()
      }
    });
  }
  
  /**
   * 通知送信
   * @param notification 通知内容
   */
  private sendNotification(notification: any) {
    try {
      // ログに記録
      logger.info(`Canary notification: ${notification.title}`, notification);
      
      // Slack通知（設定されている場合）
      if (process.env.SLACK_WEBHOOK_URL) {
        const { default: axios } = require('axios');
        
        const payload = {
          attachments: [
            {
              color: notification.title.includes('Rollback') ? 'danger' : 'good',
              title: notification.title,
              text: notification.message,
              fields: Object.entries(notification.data).map(([k, v]) => ({
                title: k,
                value: String(v),
                short: true
              })),
              footer: 'Auto Novel System - Canary Deployment',
              ts: Math.floor(Date.now() / 1000)
            }
          ]
        };
        
        axios.post(process.env.SLACK_WEBHOOK_URL, payload).catch((error: any) => {
          logError(error, {}, "Failed to send Slack notification:");
        });
      }
    } catch (error: unknown) {
      logError(error, {}, "Error sending notification:");
    }
  }
  
  /**
   * カナリーの設定を更新
   * @param newConfig 新しい設定
   */
  updateConfig(newConfig: Partial<CanaryConfig>): void {
    const oldConfig = { ...this.config };
    
    // 設定更新
    this.config = {
      ...this.config,
      ...newConfig
    };
    
    // モニタリング状態の更新
    if (this.config.enabled && this.config.monitoring && !this.monitoringTimer) {
      this.startMonitoring();
    } else if (!this.config.enabled && this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
      this.monitoringTimer = undefined;
    }
    
    logger.info('Canary configuration updated', {
      old: oldConfig,
      new: this.config
    });
  }
  
  /**
   * 現在のカナリー設定を取得
   * @returns カナリー設定
   */
  getConfig(): CanaryConfig {
    return { ...this.config };
  }
  
  /**
   * カナリー統計を取得
   * @returns カナリー統計
   */
  getStats() {
    return {
      config: this.getConfig(),
      metrics: {
        requests: { ...this.metrics.requests },
        errorRates: {
          stable: this.calculateErrorRate('stable'),
          canary: this.calculateErrorRate('canary')
        },
        latency: {
          stable: this.calculateAverageLatency('stable'),
          canary: this.calculateAverageLatency('canary')
        }
      }
    };
  }
  
  /**
   * カナリー統計をリセット
   */
  resetStats(): void {
    this.metrics = {
      requests: { stable: 0, canary: 0 },
      errors: { stable: 0, canary: 0 },
      latency: { stable: [], canary: [] },
    };
    
    logger.info('Canary statistics reset');
  }
}

// シングルトンインスタンスをエクスポート
let canaryInstance: CanaryDeployment | null = null;

export function getCanaryDeployment(): CanaryDeployment {
  if (!canaryInstance) {
    canaryInstance = new CanaryDeployment();
  }
  return canaryInstance;
}