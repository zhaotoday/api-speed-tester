/**
 * API 线路速度测试工具
 * 
 * @packageDocumentation
 */

import { ApiSpeedTester } from './api-speed-tester.js';
import type { ApiTestResult, ApiTestConfig } from './types.js';

export { ApiSpeedTester } from './api-speed-tester.js';
export type { ApiTestResult, ApiTestConfig } from './types.js';

/**
 * 创建 API 速度测试器的便捷函数
 * 
 * @param config - 测试配置
 * @returns API 速度测试器实例
 * 
 * @example
 * ```typescript
 * import { createApiTester } from 'api-speed-tester';
 * 
 * const tester = createApiTester({
 *   domains: ['api1.example.com', 'api2.example.com'],
 *   testPath: '/health',
 *   expectedResponse: { status: 'ok' }
 * });
 * 
 * const { fastest, allResults } = await tester.getBestRoute();
 * ```
 */
export function createApiTester(config: ApiTestConfig): ApiSpeedTester {
  return new ApiSpeedTester(config);
}