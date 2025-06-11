/**
 * Version 2.0 - メトリクス収集サービス
 * 
 * システム全体のメトリクス収集と監視
 */

export interface SystemMetrics {
  timestamp: string;
  memory: number;
  cpu: number;
  activeConnections: number;
  requestsPerSecond: number;
  errorRate: number;
}

export class MetricsCollector {
  private metrics: SystemMetrics[] = [];

  collect(): SystemMetrics {
    const metric: SystemMetrics = {
      timestamp: new Date().toISOString(),
      memory: process.memoryUsage().heapUsed / 1024 / 1024, // MB
      cpu: 0, // TODO: implement CPU monitoring
      activeConnections: 0, // TODO: implement connection monitoring
      requestsPerSecond: 0, // TODO: implement request rate monitoring
      errorRate: 0 // TODO: implement error rate monitoring
    };

    this.metrics.push(metric);
    
    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    return metric;
  }

  getMetrics(since?: string): SystemMetrics[] {
    if (!since) {
      return [...this.metrics];
    }

    const sinceTime = new Date(since);
    return this.metrics.filter(m => new Date(m.timestamp) >= sinceTime);
  }

  getLatest(): SystemMetrics | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null;
  }
}