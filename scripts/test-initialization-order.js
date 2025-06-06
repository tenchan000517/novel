/**
 * P5-2実装確認スクリプト
 * システムマネージャーの初期化順序と依存関係の検証
 */

const path = require('path');
const { ServiceContainer } = require('../src/lib/lifecycle/service-container');

// TypeScriptランタイムの設定
require('ts-node').register({
    project: path.join(__dirname, '../tsconfig.json'),
    transpileOnly: true
});

async function testInitializationOrder() {
    console.log('=== P5-2: System Manager Initialization Order Test ===\n');

    const container = new ServiceContainer();

    try {
        // 依存関係の検証
        console.log('1. Validating dependencies...');
        const validation = container.validateDependencies();
        
        console.log('\n📋 Dependency Validation Result:');
        console.log(`   Valid: ${validation.valid}`);
        
        if (validation.circularDependencies?.length > 0) {
            console.log('   ⚠️ Circular Dependencies:');
            validation.circularDependencies.forEach(cycle => {
                console.log(`      ${cycle.join(' -> ')}`);
            });
        }
        
        if (validation.unresolvedDependencies?.length > 0) {
            console.log('   ⚠️ Unresolved Dependencies:');
            validation.unresolvedDependencies.forEach(dep => {
                console.log(`      ${dep}`);
            });
        }
        
        if (validation.initializationOrder?.length > 0) {
            console.log('   ✅ Initialization Order:');
            validation.initializationOrder.forEach((service, index) => {
                console.log(`      ${index + 1}. ${service}`);
            });
        }

        // 初期化の実行
        console.log('\n2. Executing initialization...\n');
        const results = await container.initializeAll();
        
        console.log('\n📊 Initialization Results:');
        results.forEach(result => {
            const status = result.success ? '✅' : '❌';
            const duration = result.duration ? `${result.duration}ms` : 'N/A';
            console.log(`   ${status} ${result.serviceName} (${duration})`);
            if (!result.success && result.error) {
                console.log(`      Error: ${result.error.message}`);
            }
        });

        // サービス状態の確認
        console.log('\n3. Service Status:');
        const services = container.getRegisteredServices();
        services.forEach(service => {
            const status = container.getServiceStatus(service);
            console.log(`   ${service}: Registered=${status.registered}, Instantiated=${status.instantiated}`);
        });

        console.log('\n✨ P5-2 Implementation Test Completed Successfully!');

    } catch (error) {
        console.error('\n❌ Test Failed:', error.message);
        process.exit(1);
    }
}

// 実行
testInitializationOrder().catch(console.error);