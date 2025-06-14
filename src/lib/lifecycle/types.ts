/**
 * @fileoverview Service Container��n���
 * @description
 * ����������n�h�X��Y�_�n���
 * P5-2��: ������������
 */

/**
 * ƣ��d	
 * NDp${iHkU��
 */
export enum InitializationTier {
    /** ��������d�����������I	 */
    INFRASTRUCTURE = 1,
    /** �����dա�뷹��������I	 */
    STORAGE = 2,
    /** �䷹��d��극��I	 */
    FOUNDATION = 3,
    /** ����ӹd�����AI �餢��I	 */
    CORE = 4,
    /** ա���d�������鹤	 */
    FACADE = 5,
}

/**
 * ��ӹ�������է��
 * ����������L��YyMY����ƣ
 */
export interface ServiceMetadata {
    /** �X��ӹnM */
    dependencies: string[];
    /** ƣ� */
    initializationTier: InitializationTier | number;
}

/**
 * ��j��ӹ���է��
 */
export interface InitializableService {
    /** ��� */
    initialize?(): Promise<void>;
    /** �� */
    initialized?: boolean;
}

/**
 * ��ӹ{2�1
 */
export interface ServiceRegistration {
    /** ��ӹ */
    name: string;
    /** ա���p */
    factory: () => any | Promise<any>;
    /** �յ��� */
    lifecycle: 'SINGLETON' | 'TRANSIENT';
    /** ���� */
    metadata?: ServiceMetadata;
}

/**
 * P�
 */
export interface InitializationResult {
    /** ��� */
    success: boolean;
    /** ��ӹ */
    serviceName: string;
    /** ����1 */
    error?: Error;
    /** B����	 */
    duration?: number;
}

/**
 * �X��<P�
 */
export interface DependencyValidationResult {
    /** <��� */
    valid: boolean;
    /** ���XL�U�_4nѹ */
    circularDependencies?: string[][];
    /** *�zn�X�� */
    unresolvedDependencies?: string[];
    /** � */
    initializationOrder?: string[];
}

/**
 * ��ӹ���ʤ��է��
 */
export interface IServiceContainer {
    /** ��ӹ{2 */
    register(name: string, factory: () => any | Promise<any>, lifecycle?: 'SINGLETON' | 'TRANSIENT'): void;
    /** ��ӹ�z */
    resolve<T>(name: string): Promise<T>;
    /** �����L */
    initializeInfrastructure(): Promise<void>;
    initializeStorage(): Promise<void>;
    initializeMemorySystem(): Promise<void>;
    initializeCoreServices(): Promise<void>;
    initializeFacades(): Promise<void>;
    /** {2��ӹ �֗ */
    getRegisteredServices(): string[];
    /** ��ӹ�K�� */
    getServiceStatus(name: string): { registered: boolean; instantiated: boolean };
}