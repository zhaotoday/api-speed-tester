# api-speed-tester

[![npm version](https://badge.fury.io/js/api-speed-tester.svg)](https://badge.fury.io/js/api-speed-tester)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

一个用于测试多个 API 域名响应速度的 TypeScript 工具，帮助选择最快的 API 线路。

## ✨ 特性

- 🚀 **并发测试**: 同时测试多个 API，最快结果立即返回
- ⚡ **即时响应**: 最快成功的 API 立即可用，其他继续测试
- ⏱️ **响应时间测量**: 精确测量每个 API 的响应时间
- ✅ **内容验证**: 验证响应内容是否符合期望
- ⏰ **超时控制**: 可配置超时时间，避免长时间等待
- 📊 **结果排序**: 自动按响应时间和成功状态排序
- 📝 **详细日志**: 提供清晰的测试过程和结果展示
- 🔧 **TypeScript**: 完整的类型支持和 TSDoc 注释
- 📦 **零配置**: 开箱即用，无需复杂配置
- 🌐 **基于 Axios**: 使用成熟的 HTTP 客户端库

## 📦 安装

```bash
npm install api-speed-tester
```

或使用其他包管理器：

```bash
# 使用 yarn
yarn add api-speed-tester

# 使用 pnpm
pnpm add api-speed-tester
```

## 🚀 快速开始

### 基本用法

```typescript
import { ApiSpeedTester } from 'api-speed-tester';

const tester = new ApiSpeedTester({
  domains: [
    'api1.example.com',
    'api2.example.com',
    'api3.example.com'
  ],
  testPath: '/health',
  expectedResponse: { status: 'ok' },
  timeout: 5000
});

// 获取最优线路
const bestRoute = await tester.getBestRoute();
if (bestRoute) {
  console.log(`最优线路: ${bestRoute.domain} (${bestRoute.responseTime}ms)`);
}
```

### 并发测速 - 最快结果立即返回

```typescript
import { ApiSpeedTester } from 'api-speed-tester';

const tester = new ApiSpeedTester({
  domains: ['api1.example.com', 'api2.example.com', 'api3.example.com'],
  testPath: '/api/test',
  expectedResponse: { success: true }
});

// 最快线路成功后立即返回，其他线路继续测试
const { fastest, allResults } = await tester.getBestRouteWithContinuousTesting();

if (fastest) {
  console.log(`⚡ 最快线路: ${fastest.domain} (${fastest.responseTime}ms)`);
  // 立即开始使用最快线路处理业务请求
  startUsingFastestRoute(fastest.domain);
}

// 等待所有测试完成，获取完整排序结果
const sortedResults = await allResults;
console.log('📊 所有结果按响应时间排序:', sortedResults);
```

### 使用回调函数的并发测试

```typescript
// 使用回调函数在最快结果出现时立即处理
const result = await tester.testConcurrentWithFastest((fastestResult) => {
  console.log(`检测到最快线路: ${fastestResult.domain}`);
  // 在这里可以立即开始使用此线路
  handleFastestRoute(fastestResult);
});

console.log(`完成统计: ${result.completedCount}/${result.totalCount}`);
console.log('所有结果:', result.allResults);
```

### 使用便捷函数

```typescript
import { createApiTester } from 'api-speed-tester';

const tester = createApiTester({
  domains: ['cdn1.example.com', 'cdn2.example.com'],
  testPath: '/api/test.json',
  expectedResponse: { success: true }
});

const bestRoute = await tester.getBestRoute();
```

### 高级配置

```typescript
import { ApiSpeedTester, ApiTestConfig } from 'api-speed-tester';

const config: ApiTestConfig = {
  domains: ['api1.example.com', 'api2.example.com'],
  testPath: '/api/v1/status',
  expectedResponse: { 
    status: 'healthy',
    version: '1.0.0'
  },
  timeout: 3000,
  headers: {
    'Authorization': 'Bearer your-token',
    'User-Agent': 'MyApp/1.0',
    'Accept': 'application/json'
  }
};

const tester = new ApiSpeedTester(config);

// 获取所有测试结果
const results = await tester.test();
console.log('所有测试结果:', results);

// 获取最优线路
const bestRoute = await tester.getBestRoute();
```

## 📋 API 文档

### ApiTestConfig

配置接口，用于定义测试参数。

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `domains` | `string[]` | ✅ | - | API 域名列表 |
| `testPath` | `string` | ✅ | - | 测试路径（如 `/health`） |
| `expectedResponse` | `any` | ✅ | - | 期望的响应内容 |
| `timeout` | `number` | ❌ | `5000` | 超时时间（毫秒） |
| `headers` | `Record<string, string>` | ❌ | `{}` | 自定义请求头 |

### ApiTestResult

测试结果接口，包含每个 API 的测试信息。

| 字段 | 类型 | 说明 |
|------|------|------|
| `domain` | `string` | API 域名 |
| `responseTime` | `number` | 响应时间（毫秒） |
| `success` | `boolean` | 是否测试成功 |
| `data` | `any` | 响应数据（成功时） |
| `error` | `string` | 错误信息（失败时） |

### ConcurrentTestResult

并发测试结果接口，包含最快结果和完整统计信息。

| 字段 | 类型 | 说明 |
|------|------|------|
| `fastest` | `ApiTestResult \| null` | 最快的成功结果 |
| `allResults` | `ApiTestResult[]` | 所有结果按响应时间排序 |
| `completedCount` | `number` | 完成的测试数量 |
| `totalCount` | `number` | 总测试数量 |

### ApiSpeedTester 类

#### 构造函数

```typescript
constructor(config: ApiTestConfig)
```

创建 API 速度测试器实例。

#### 方法

##### `test(): Promise<ApiTestResult[]>`

执行 API 速度测试，返回所有测试结果（按响应时间排序）。

```typescript
const results = await tester.test();
results.forEach(result => {
  console.log(`${result.domain}: ${result.responseTime}ms`);
});
```

##### `getBestRoute(): Promise<ApiTestResult | null>`

获取最优线路，返回响应最快且内容正确的 API 结果。

```typescript
const bestRoute = await tester.getBestRoute();
if (bestRoute) {
  console.log(`推荐使用: https://${bestRoute.domain}`);
} else {
  console.log('没有找到可用的 API 线路');
}
```

##### `getBestRouteWithContinuousTesting(): Promise<{ fastest: ApiTestResult | null, allResults: Promise<ApiTestResult[]> }>`

并发测试所有线路，最快成功的线路立即返回，其他线路继续测试。返回最快结果和所有结果的 Promise。

```typescript
const { fastest, allResults } = await tester.getBestRouteWithContinuousTesting();

if (fastest) {
  console.log(`⚡ 最快线路: ${fastest.domain} (${fastest.responseTime}ms)`);
  // 立即开始使用最快线路
  startUsingRoute(fastest.domain);
}

// 等待所有测试完成
const sortedResults = await allResults;
console.log('完整测试结果:', sortedResults);
```

##### `testConcurrentWithFastest(onFastestResult?: (result: ApiTestResult) => void): Promise<ConcurrentTestResult>`

并发测试所有 API，支持回调函数在最快结果出现时立即处理。

```typescript
const result = await tester.testConcurrentWithFastest((fastestResult) => {
  console.log(`检测到最快线路: ${fastestResult.domain}`);
  // 立即处理最快结果
  handleFastestRoute(fastestResult);
});

console.log(`测试统计: ${result.completedCount}/${result.totalCount}`);
console.log('最快线路:', result.fastest);
console.log('所有结果:', result.allResults);
```

### 便捷函数

#### `createApiTester(config: ApiTestConfig): ApiSpeedTester`

创建 API 速度测试器的便捷函数。

```typescript
import { createApiTester } from '@codebuddy/api-speed-tester';

const tester = createApiTester({
  domains: ['api1.com', 'api2.com'],
  testPath: '/ping',
  expectedResponse: { pong: true }
});
```

## 🎯 使用场景

### CDN 选择

```typescript
const cdnTester = new ApiSpeedTester({
  domains: [
    'cdn1.example.com',
    'cdn2.example.com',
    'cdn3.example.com'
  ],
  testPath: '/static/test.json',
  expectedResponse: { version: '1.0' },
  timeout: 3000
});

const fastestCdn = await cdnTester.getBestRoute();
```

### API 负载均衡

```typescript
const apiTester = new ApiSpeedTester({
  domains: [
    'api-us.example.com',
    'api-eu.example.com',
    'api-asia.example.com'
  ],
  testPath: '/api/v1/ping',
  expectedResponse: { status: 'ok' }
});

const bestApi = await apiTester.getBestRoute();
```

### 服务健康检查

```typescript
const healthTester = new ApiSpeedTester({
  domains: [
    'service1.internal',
    'service2.internal',
    'service3.internal'
  ],
  testPath: '/health',
  expectedResponse: { healthy: true },
  timeout: 2000
});

const results = await healthTester.test();
const healthyServices = results.filter(r => r.success);
console.log(`健康服务数量: ${healthyServices.length}/${results.length}`);
```

### 网络质量监控

```typescript
const networkTester = new ApiSpeedTester({
  domains: [
    'ping.example.com',
    'test.example.com'
  ],
  testPath: '/ping',
  expectedResponse: { timestamp: expect.any(Number) },
  timeout: 5000
});

// 定期监控
setInterval(async () => {
  const results = await networkTester.test();
  const avgResponseTime = results
    .filter(r => r.success)
    .reduce((sum, r) => sum + r.responseTime, 0) / results.length;
  
  console.log(`平均响应时间: ${avgResponseTime.toFixed(2)}ms`);
}, 60000); // 每分钟检查一次
```

## 🔧 开发

### 克隆项目

```bash
git clone https://github.com/codebuddy/api-speed-tester.git
cd api-speed-tester
```

### 安装依赖

```bash
npm install
```

### 开发命令

```bash
# 开发模式运行
npm run dev

# 构建项目
npm run build

# 运行示例
npm run example

# 清理构建文件
npm run clean
```

### 项目结构

```
api-speed-tester/
├── src/
│   ├── api-speed-tester.ts  # 主要测试器类
│   ├── types.ts             # 类型定义
│   ├── index.ts             # 入口文件
│   └── example.ts           # 使用示例
├── dist/                    # 构建输出
├── package.json
├── tsconfig.json
├── README.md
└── LICENSE
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启 Pull Request

## 📄 许可证

本项目基于 [MIT License](LICENSE) 开源。

## 🙏 致谢

- [Axios](https://axios-http.com/) - 优秀的 HTTP 客户端库
- [TypeScript](https://www.typescriptlang.org/) - 强类型的 JavaScript 超集

## 📞 支持

如果你觉得这个项目有用，请给它一个 ⭐️！

如有问题或建议，请：
- 提交 [Issue](https://github.com/codebuddy/api-speed-tester/issues)
- 发送邮件至 codebuddy@example.com