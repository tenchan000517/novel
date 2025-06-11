/**
 * Service Container - Core Implementation
 * 
 * サービスコンテナのメイン実装
 * Version 2.0要件: 依存性注入・ライフサイクル管理・ヘルス監視
 */

import type {
  IServiceContainer,
  ServiceFactory,
  ServiceRegistration,
  ServiceInstance,
  ServiceRegistrationOptions,
  HealthStatus,
  ServiceHealthStatus,
  EventHandler,
  DependencyValidationResult,
  ServiceInfo,
  ResolutionRecord,
  ServiceError
} from './interfaces';

// 修正: enumは値として使用するため import type を使わない
import {
  ServiceLifecycle,
  LifecycleState,
  HealthState,
  ContainerEvent,
  ServiceErrorType,
  ErrorSeverity
} from './interfaces';

import type {
  ServiceContainerConfig,
  PerformanceMetrics,
  ResolutionCache,
  // LogLevel
} from './types';

// 修正: LogLevel enumも値として使用するため import type を使わない
import { LogLevel } from './types';

import type { OperationResult, SystemId } from '@/types/common';
import { logger } from '@/core/infrastructure/logger';

export class ServiceContainer implements IServiceContainer {
  public readonly systemId: SystemId = 'service-container';

  private config: ServiceContainerConfig;
  private services: Map<string, ServiceRegistration> = new Map();
  private instances: Map<string, ServiceInstance> = new Map();
  private eventHandlers: Map<ContainerEvent, Set<EventHandler>> = new Map();
  private resolutionHistory: ResolutionRecord[] = [];
  private performanceMetrics: PerformanceMetrics;
  private resolutionCache: ResolutionCache;
  
  private isInitialized = false;
  private isShuttingDown = false;
  private resolutionDepth = 0;

  constructor(config?: Partial<ServiceContainerConfig>) {
    logger.setSystemId(this.systemId);

    this.config = {
      enableHealthMonitoring: true,
      enableDependencyValidation: true,
      enableLifecycleManagement: true,
      enableErrorRecovery: true,
      maxResolutionDepth: 50,
      defaultResolutionTimeout: 30000,
      healthCheckInterval: 60000,
      errorRetentionPeriod: 86400000,
      performanceMonitoring: true,
      debugMode: false,
      logLevel: LogLevel.INFO, // 修正: enum値を使用
      ...config
    };

    this.performanceMetrics = this.initializePerformanceMetrics();
    this.resolutionCache = this.initializeResolutionCache();
    this.initializeEventHandlers();

    logger.info('Service Container initialized', { config: this.config });
  }

  // ============================================================================
  // サービス登録
  // ============================================================================

  register<T>(token: string, factory: ServiceFactory<T>, options?: ServiceRegistrationOptions): void {
    try {
      this.validateToken(token);
      this.validateFactory(factory);

      if (this.services.has(token)) {
        throw new Error(`Service already registered: ${token}`);
      }

      const registration: ServiceRegistration = {
        token,
        factory: factory as ServiceFactory<any>,
        lifecycle: options?.lifecycle || ServiceLifecycle.SINGLETON, // 修正: optionsからlifecycleを取得
        dependencies: options?.dependencies || [],
        options: {
          lazy: true,
          priority: 0,
          metadata: {},
          tags: [],
          ...options
        },
        metadata: {
          name: token,
          description: options?.metadata?.description,
          version: options?.metadata?.version,
          author: options?.metadata?.author,
          tags: options?.tags || [],
          registeredAt: new Date(),
          lastModified: new Date(),
          customData: options?.metadata || {}
        }
      };

      this.services.set(token, registration);
      this.emit(ContainerEvent.SERVICE_REGISTERED, { token, registration });
      
      logger.info('Service registered successfully', { token, lifecycle: registration.lifecycle });

    } catch (error) {
      this.handleError({
        id: `registration-${Date.now()}`,
        type: ServiceErrorType.REGISTRATION,
        code: 'REGISTRATION_FAILED',
        message: error instanceof Error ? error.message : 'Unknown registration error',
        service: token,
        timestamp: new Date(),
        context: { token, options },
        severity: ErrorSeverity.HIGH
      });
      throw error;
    }
  }

  registerSingleton<T>(token: string, factory: ServiceFactory<T>, options?: ServiceRegistrationOptions): void {
    this.register(token, factory, { ...options, lifecycle: ServiceLifecycle.SINGLETON });
  }

  registerTransient<T>(token: string, factory: ServiceFactory<T>, options?: ServiceRegistrationOptions): void {
    this.register(token, factory, { ...options, lifecycle: ServiceLifecycle.TRANSIENT });
  }

  // ============================================================================
  // サービス解決
  // ============================================================================

  async get<T>(token: string): Promise<T> {
    const startTime = Date.now();
    
    try {
      this.validateToken(token);
      this.checkInitialized();
      this.checkResolutionDepth();

      this.resolutionDepth++;

      const registration = this.services.get(token);
      if (!registration) {
        throw new Error(`Service not registered: ${token}`);
      }

      if (registration.lifecycle === ServiceLifecycle.SINGLETON) {
        const cachedInstance = this.instances.get(token);
        if (cachedInstance) {
          this.updateAccessMetrics(token);
          return cachedInstance.instance as T;
        }
      }

      await this.resolveDependencies(registration);
      const instance = await this.createInstance<T>(registration);
      
      if (registration.lifecycle === ServiceLifecycle.SINGLETON) {
        this.cacheInstance(token, instance, registration);
      }

      this.recordResolution(token, startTime, true);
      this.emit(ContainerEvent.SERVICE_RESOLVED, { token, instance });

      return instance;

    } catch (error) {
      this.recordResolution(token, startTime, false, error instanceof Error ? error : new Error('Unknown error'));
      throw error;
    } finally {
      this.resolutionDepth--;
    }
  }

  getSync<T>(token: string): T {
    const instance = this.instances.get(token);
    if (!instance) {
      throw new Error(`Service not available synchronously: ${token}`);
    }
    
    this.updateAccessMetrics(token);
    return instance.instance as T;
  }

  async tryGet<T>(token: string): Promise<T | null> {
    try {
      return await this.get<T>(token);
    } catch {
      return null;
    }
  }

  tryGetSync<T>(token: string): T | null {
    try {
      return this.getSync<T>(token);
    } catch {
      return null;
    }
  }

  // ============================================================================
  // サービス管理
  // ============================================================================

  has(token: string): boolean {
    return this.services.has(token);
  }

  unregister(token: string): void {
    try {
      if (!this.services.has(token)) {
        logger.warn('Attempted to unregister non-existent service', { token });
        return;
      }

      if (this.instances.has(token)) {
        this.dispose(token);
      }

      this.services.delete(token);
      this.emit(ContainerEvent.SERVICE_UNREGISTERED, { token });
      
      logger.info('Service unregistered successfully', { token });

    } catch (error) {
      throw error;
    }
  }

  async dispose(token: string): Promise<void> {
    try {
      const instance = this.instances.get(token);
      if (!instance) {
        return;
      }

      const registration = this.services.get(token);
      if (registration?.options.dispose) {
        await registration.options.dispose(instance.instance);
      }

      this.instances.delete(token);
      this.emit(ContainerEvent.SERVICE_DISPOSED, { token });
      
      logger.info('Service disposed successfully', { token });

    } catch (error) {
      throw error;
    }
  }

  // ============================================================================
  // ライフサイクル管理
  // ============================================================================

  async initialize(): Promise<OperationResult<void>> {
    const startTime = Date.now();
    
    try {
      if (this.isInitialized) {
        return {
          success: true,
          data: undefined,
          metadata: {
            operationId: `initialize-${Date.now()}`,
            timestamp: new Date().toISOString(),
            processingTime: Date.now() - startTime,
            systemId: this.systemId
          }
        };
      }

      logger.info('Initializing Service Container');

      if (this.config.enableDependencyValidation) {
        const validationResult = this.validateDependencies();
        if (!validationResult.success) {
          throw new Error(`Dependency validation failed: ${validationResult.error?.message}`);
        }
      }

      this.isInitialized = true;
      this.emit(ContainerEvent.CONTAINER_INITIALIZED, {});

      const processingTime = Date.now() - startTime;
      logger.info('Service Container initialized successfully', { processingTime });

      return {
        success: true,
        data: undefined,
        metadata: {
          operationId: `initialize-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime,
          systemId: this.systemId
        }
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      logger.error('Failed to initialize Service Container', { error, processingTime });

      return {
        success: false,
        error: {
          code: 'INITIALIZATION_FAILED',
          message: error instanceof Error ? error.message : 'Unknown initialization error',
          details: error
        },
        metadata: {
          operationId: `initialize-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime,
          systemId: this.systemId
        }
      };
    }
  }

  async shutdown(): Promise<OperationResult<void>> {
    const startTime = Date.now();
    
    try {
      if (this.isShuttingDown) {
        return {
          success: true,
          data: undefined,
          metadata: {
            operationId: `shutdown-${Date.now()}`,
            timestamp: new Date().toISOString(),
            processingTime: Date.now() - startTime,
            systemId: this.systemId
          }
        };
      }

      this.isShuttingDown = true;
      logger.info('Shutting down Service Container');

      for (const token of this.instances.keys()) {
        await this.dispose(token);
      }

      this.clearCache();
      this.isInitialized = false;
      this.emit(ContainerEvent.CONTAINER_SHUTDOWN, {});

      const processingTime = Date.now() - startTime;
      logger.info('Service Container shutdown completed', { processingTime });

      return {
        success: true,
        data: undefined,
        metadata: {
          operationId: `shutdown-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime,
          systemId: this.systemId
        }
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      logger.error('Failed to shutdown Service Container', { error, processingTime });

      return {
        success: false,
        error: {
          code: 'SHUTDOWN_FAILED',
          message: error instanceof Error ? error.message : 'Unknown shutdown error',
          details: error
        },
        metadata: {
          operationId: `shutdown-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime,
          systemId: this.systemId
        }
      };
    } finally {
      this.isShuttingDown = false;
    }
  }

  async restart(): Promise<OperationResult<void>> {
    const shutdownResult = await this.shutdown();
    if (!shutdownResult.success) {
      return shutdownResult;
    }
    return await this.initialize();
  }

  // ============================================================================
  // ヘルス監視
  // ============================================================================

  async getHealth(): Promise<OperationResult<HealthStatus>> {
    try {
      const health: HealthStatus = {
        overall: HealthState.HEALTHY,
        services: new Map(),
        systemMetrics: {
          registeredServices: this.services.size,
          activeServices: this.instances.size,
          totalResolutions: this.performanceMetrics.containerMetrics.totalResolutions,
          successfulResolutions: this.performanceMetrics.containerMetrics.successfulResolutions,
          failedResolutions: this.performanceMetrics.containerMetrics.failedResolutions,
          averageResolutionTime: this.performanceMetrics.containerMetrics.averageResolutionTime,
          memoryUsage: this.performanceMetrics.containerMetrics.memoryUsage,
          uptime: Date.now()
        },
        timestamp: new Date(),
        issues: [],
        recommendations: []
      };

      return {
        success: true,
        data: health,
        metadata: {
          operationId: `health-check-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime: 0,
          systemId: this.systemId
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'HEALTH_CHECK_FAILED',
          message: error instanceof Error ? error.message : 'Unknown health check error',
          details: error
        },
        metadata: {
          operationId: `health-check-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime: 0,
          systemId: this.systemId
        }
      };
    }
  }

  async getServiceHealth(token: string): Promise<OperationResult<ServiceHealthStatus>> {
    try {
      const instance = this.instances.get(token);
      
      const health: ServiceHealthStatus = {
        token,
        state: instance ? HealthState.HEALTHY : HealthState.UNKNOWN,
        lastCheck: new Date(),
        responseTime: 0,
        errorCount: 0,
        uptime: instance ? Date.now() - instance.createdAt.getTime() : 0,
        metrics: {
          instances: instance ? 1 : 0,
          resolutions: instance ? instance.accessCount : 0,
          errors: 0,
          averageResponseTime: 0,
          memoryUsage: 0,
          cpuUsage: 0
        },
        issues: []
      };

      return {
        success: true,
        data: health,
        metadata: {
          operationId: `service-health-check-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime: 0,
          systemId: this.systemId
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SERVICE_HEALTH_CHECK_FAILED',
          message: error instanceof Error ? error.message : 'Unknown service health check error',
          details: error
        },
        metadata: {
          operationId: `service-health-check-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime: 0,
          systemId: this.systemId
        }
      };
    }
  }

  // 修正: checkHealth メソッドを追加（ApplicationLifecycleManager用）
  async checkHealth(): Promise<{ status: any; totalServices: number; healthyServices: number }> {
    const healthResult = await this.getHealth();
    
    if (healthResult.success && healthResult.data) {
      const health = healthResult.data;
      return {
        status: health.overall,
        totalServices: health.systemMetrics.registeredServices,
        healthyServices: health.systemMetrics.activeServices
      };
    }
    
    throw new Error('Health check failed');
  }

  // ============================================================================
  // イベント管理
  // ============================================================================

  addEventListener(event: ContainerEvent, handler: EventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
  }

  removeEventListener(event: ContainerEvent, handler: EventHandler): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  // ============================================================================
  // 依存性分析
  // ============================================================================

  getDependencies(token: string): string[] {
    const registration = this.services.get(token);
    return registration?.dependencies || [];
  }

  getDependents(token: string): string[] {
    const dependents: string[] = [];
    for (const [serviceToken, registration] of this.services) {
      if (registration.dependencies.includes(token)) {
        dependents.push(serviceToken);
      }
    }
    return dependents;
  }

  validateDependencies(): OperationResult<DependencyValidationResult> {
    try {
      const missingDependencies: string[] = [];
      
      for (const [token, registration] of this.services) {
        for (const dependency of registration.dependencies) {
          if (!this.services.has(dependency)) {
            missingDependencies.push(dependency);
          }
        }
      }

      const result: DependencyValidationResult = {
        valid: missingDependencies.length === 0,
        issues: missingDependencies.map(dep => ({
          type: 'missing' as const,
          severity: 'high' as const,
          services: [dep],
          message: `Missing dependency: ${dep}`,
          suggestion: `Register service: ${dep}`
        })),
        warnings: [],
        circularDependencies: [],
        missingDependencies
      };

      return {
        success: true,
        data: result,
        metadata: {
          operationId: `validate-dependencies-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime: 0,
          systemId: this.systemId
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'DEPENDENCY_VALIDATION_FAILED',
          message: error instanceof Error ? error.message : 'Unknown dependency validation error',
          details: error
        },
        metadata: {
          operationId: `validate-dependencies-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime: 0,
          systemId: this.systemId
        }
      };
    }
  }

  // ============================================================================
  // デバッグ・診断
  // ============================================================================

  getRegisteredServices(): ServiceInfo[] {
    const serviceInfos: ServiceInfo[] = [];
    
    for (const [token, registration] of this.services) {
      const instance = this.instances.get(token);
      const serviceInfo: ServiceInfo = {
        token,
        lifecycle: registration.lifecycle,
        state: instance?.state || {
          current: LifecycleState.NOT_CREATED,
          history: [],
          lastTransition: new Date(),
          errors: []
        },
        dependencies: registration.dependencies,
        dependents: this.getDependents(token),
        metadata: registration.metadata,
        instance: instance?.instance,
        statistics: {
          createdAt: instance?.createdAt || new Date(),
          lastAccessed: instance?.lastAccessed || new Date(),
          accessCount: instance?.accessCount || 0,
          errorCount: 0,
          averageResponseTime: 0,
          totalResponseTime: 0,
          peakMemoryUsage: 0,
          currentMemoryUsage: 0
        }
      };
      serviceInfos.push(serviceInfo);
    }

    return serviceInfos;
  }

  getResolutionHistory(): ResolutionRecord[] {
    return [...this.resolutionHistory];
  }

  clearCache(): void {
    this.resolutionCache.entries.clear();
    this.resolutionCache.hitCount = 0;
    this.resolutionCache.missCount = 0;
    logger.info('Resolution cache cleared');
  }

  // ============================================================================
  // プライベートヘルパーメソッド
  // ============================================================================

  private validateToken(token: string): void {
    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      throw new Error('Invalid service token');
    }
  }

  private validateFactory<T>(factory: ServiceFactory<T>): void {
    if (!factory || typeof factory !== 'function') {
      throw new Error('Invalid service factory');
    }
  }

  private checkInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('Service container not initialized');
    }
  }

  private checkResolutionDepth(): void {
    if (this.resolutionDepth >= this.config.maxResolutionDepth) {
      throw new Error(`Maximum resolution depth exceeded: ${this.config.maxResolutionDepth}`);
    }
  }

  private async resolveDependencies(registration: ServiceRegistration): Promise<void> {
    for (const dependency of registration.dependencies) {
      await this.get(dependency);
    }
  }

  private async createInstance<T>(registration: ServiceRegistration): Promise<T> {
    try {
      const instance = await registration.factory(this);
      return instance;
    } catch (error) {
      throw new Error(`Failed to create instance for ${registration.token}: ${error}`);
    }
  }

  private cacheInstance<T>(token: string, instance: T, registration: ServiceRegistration): void {
    const serviceInstance: ServiceInstance = {
      token,
      instance,
      lifecycle: registration.lifecycle,
      state: {
        current: LifecycleState.READY,
        history: [],
        lastTransition: new Date(),
        errors: []
      },
      dependencies: registration.dependencies,
      dependents: this.getDependents(token),
      createdAt: new Date(),
      lastAccessed: new Date(),
      accessCount: 1,
      metadata: registration.metadata
    };

    this.instances.set(token, serviceInstance);
  }

  private updateAccessMetrics(token: string): void {
    const instance = this.instances.get(token);
    if (instance) {
      instance.lastAccessed = new Date();
      instance.accessCount++;
    }
  }

  private recordResolution(token: string, startTime: number, success: boolean, error?: Error): void {
    const record: ResolutionRecord = {
      token,
      timestamp: new Date(),
      success,
      duration: Date.now() - startTime,
      error,
      stackTrace: error?.stack
    };

    this.resolutionHistory.push(record);

    if (this.resolutionHistory.length > 1000) {
      this.resolutionHistory = this.resolutionHistory.slice(-500);
    }

    this.performanceMetrics.containerMetrics.totalResolutions++;
    if (success) {
      this.performanceMetrics.containerMetrics.successfulResolutions++;
    } else {
      this.performanceMetrics.containerMetrics.failedResolutions++;
    }

    const avgTime = this.performanceMetrics.containerMetrics.averageResolutionTime;
    const totalResolutions = this.performanceMetrics.containerMetrics.totalResolutions;
    this.performanceMetrics.containerMetrics.averageResolutionTime = 
      (avgTime * (totalResolutions - 1) + record.duration) / totalResolutions;
  }

  private emit(event: ContainerEvent, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const eventData = {
        type: event,
        timestamp: new Date(),
        data,
        source: this.systemId
      };

      for (const handler of handlers) {
        try {
          handler(eventData);
        } catch (error) {
          logger.warn('Event handler error', { event, error });
        }
      }
    }
  }

  private handleError(error: ServiceError): void {
    logger.error('Service container error', error);
  }

  private initializePerformanceMetrics(): PerformanceMetrics {
    return {
      containerMetrics: {
        totalResolutions: 0,
        successfulResolutions: 0,
        failedResolutions: 0,
        averageResolutionTime: 0,
        peakResolutionTime: 0,
        resolutionThroughput: 0,
        memoryUsage: {
          used: 0,
          total: 0,
          peak: 0,
          collections: 0
        },
        cacheHitRate: 0,
        concurrentResolutions: 0
      },
      serviceMetrics: new Map(),
      dependencyMetrics: {
        totalDependencies: 0,
        resolvedDependencies: 0,
        circularDependencies: 0,
        missingDependencies: 0,
        resolutionDepth: 0,
        graphComplexity: 0,
        cacheEfficiency: 0
      },
      healthMetrics: {
        totalChecks: 0,
        successfulChecks: 0,
        failedChecks: 0,
        averageCheckTime: 0,
        healthTrends: [],
        alertsGenerated: 0,
        falsePositives: 0
      },
      errorMetrics: {
        totalErrors: 0,
        errorsByType: new Map(),
        errorsByService: new Map(),
        averageErrorResolution: 0,
        errorRecoveryRate: 0,
        criticalErrors: 0
      },
      lastUpdated: new Date()
    };
  }

  private initializeResolutionCache(): ResolutionCache {
    return {
      enabled: true,
      maxSize: 1000,
      ttl: 300000,
      hitCount: 0,
      missCount: 0,
      entries: new Map(),
      statistics: {
        hitRate: 0,
        missRate: 0,
        evictionCount: 0,
        totalSize: 0,
        averageAccessTime: 0,
        hotKeys: []
      }
    };
  }

  private initializeEventHandlers(): void {
    for (const event of Object.values(ContainerEvent)) {
      this.eventHandlers.set(event, new Set());
    }
  }
}