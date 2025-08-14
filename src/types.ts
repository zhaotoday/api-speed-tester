/**
 * API 测试结果接口
 */
export interface ApiTestResult {
  /** API 域名 */
  domain: string;
  /** 响应时间（毫秒） */
  responseTime: number;
  /** 是否成功 */
  success: boolean;
  /** 响应数据 */
  data?: any;
  /** 错误信息 */
  error?: string;
}

/**
 * API 测试配置接口
 */
export interface ApiTestConfig {
  /** API 域名列表 */
  domains: string[];
  /** 测试路径 */
  testPath: string;
  /** 期望的响应内容 */
  expectedResponse: any;
  /** 超时时间（毫秒），默认 5000ms */
  timeout?: number;
  /** 请求头配置 */
  headers?: Record<string, string>;
}

/**
 * 并发测速结果接口
 */
export interface ConcurrentTestResult {
  /** 最快的成功结果 */
  fastest: ApiTestResult | null;
  /** 所有结果按响应时间排序 */
  allResults: ApiTestResult[];
  /** 完成的结果数量 */
  completedCount: number;
  /** 总数量 */
  totalCount: number;
}
/**
 * API 测试结果接口
 */
export interface ApiTestResult {
  /** API 域名 */
  domain: string;
  /** 响应时间（毫秒） */
  responseTime: number;
  /** 是否成功 */
  success: boolean;
  /** 响应数据 */
  data?: any;
  /** 错误信息 */
  error?: string;
}

/**
 * API 测试结果接口
 */
export interface ApiTestResult {
  /** API 域名 */
  domain: string;
  /** 响应时间（毫秒） */
  responseTime: number;
  /** 是否成功 */
  success: boolean;
  /** 响应数据 */
  data?: any;
  /** 错误信息 */
  error?: string;
}

/**
 * API 测试配置接口
 */
export interface ApiTestConfig {
  /** API 域名列表 */
  domains: string[];
  /** 测试路径 */
  testPath: string;
  /** 期望的响应内容 */
  expectedResponse: any;
  /** 超时时间（毫秒），默认 5000ms */
  timeout?: number;
  /** 并发测试还是串行测试，默认并发 */
  concurrent?: boolean;
  /** 请求头配置 */
  headers?: Record<string, string>;
}