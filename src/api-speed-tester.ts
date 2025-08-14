import axios, { AxiosResponse, AxiosError } from "axios";
import { ApiTestResult, ApiTestConfig } from "./types.js";

/**
 * API 线路速度测试器
 *
 * @example
 * ```typescript
 * const tester = new ApiSpeedTester({
 *   domains: ['api1.example.com', 'api2.example.com'],
 *   testPath: '/test.json',
 *   expectedResponse: { success: true }
 * });
 *
 * const bestRoute = await tester.getBestRoute();
 * ```
 */
export class ApiSpeedTester {
  private readonly config: Required<ApiTestConfig>;

  /**
   * 创建 API 速度测试器实例
   *
   * @param config - 测试配置
   */
  constructor(config: ApiTestConfig) {
    this.config = {
      timeout: 5000,
      concurrent: true,
      headers: { "Content-Type": "application/json" },
      ...config,
    };
  }

  /**
   * 测试单个 API 的响应速度
   *
   * @param domain - API 域名
   * @returns 测试结果
   */
  private async testSingleApi(domain: string): Promise<ApiTestResult> {
    const startTime = Date.now();
    const url = `https://${domain}${this.config.testPath}`;

    try {
      const response: AxiosResponse = await axios.get(url, {
        timeout: this.config.timeout,
        headers: this.config.headers,
        validateStatus: (status: number) => status >= 200 && status < 300,
      });

      const responseTime = Date.now() - startTime;
      const isExpectedResponse = this.validateResponse(
        response.data,
        this.config.expectedResponse,
      );

      return {
        domain,
        responseTime,
        success: isExpectedResponse,
        data: response.data,
        error: isExpectedResponse ? undefined : "响应内容不符合期望",
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      let errorMessage = "未知错误";

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.code === "ECONNABORTED") {
          errorMessage = "请求超时";
        } else if (axiosError.response) {
          errorMessage = `HTTP ${axiosError.response.status}: ${axiosError.response.statusText}`;
        } else if (axiosError.request) {
          errorMessage = "网络连接失败";
        } else {
          errorMessage = axiosError.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      return {
        domain,
        responseTime,
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * 验证响应内容是否符合期望
   *
   * @param actual - 实际响应
   * @param expected - 期望响应
   * @returns 是否匹配
   */
  private validateResponse(actual: any, expected: any): boolean {
    try {
      return JSON.stringify(actual) === JSON.stringify(expected);
    } catch {
      return false;
    }
  }

  /**
   * 并发测试所有 API
   *
   * @returns 所有测试结果
   */
  private async testConcurrent(): Promise<ApiTestResult[]> {
    const promises = this.config.domains.map((domain) =>
      this.testSingleApi(domain),
    );
    return Promise.all(promises);
  }

  /**
   * 串行测试所有 API（按顺序逐个测试）
   *
   * @returns 所有测试结果
   */
  private async testSequential(): Promise<ApiTestResult[]> {
    const results: ApiTestResult[] = [];

    for (const domain of this.config.domains) {
      const result = await this.testSingleApi(domain);
      results.push(result);

      if (result.success) {
        console.log(`✅ 找到可用线路: ${domain} (${result.responseTime}ms)`);
      }
    }

    return results;
  }

  /**
   * 执行 API 速度测试
   *
   * @returns 测试结果，按响应时间排序
   */
  async test(): Promise<ApiTestResult[]> {
    console.log(`🚀 开始测试 ${this.config.domains.length} 个 API 线路...`);
    console.log(`📍 测试路径: ${this.config.testPath}`);
    console.log(`⏱️  超时时间: ${this.config.timeout}ms`);
    console.log(`🔄 测试模式: ${this.config.concurrent ? "并发" : "串行"}`);

    const results = this.config.concurrent
      ? await this.testConcurrent()
      : await this.testSequential();

    // 按响应时间排序，成功的排在前面
    const sortedResults = results.sort((a, b) => {
      if (a.success && !b.success) return -1;
      if (!a.success && b.success) return 1;
      return a.responseTime - b.responseTime;
    });

    this.printResults(sortedResults);
    return sortedResults;
  }

  /**
   * 获取最优线路
   *
   * @returns 最优线路结果，如果没有可用线路则返回 null
   */
  async getBestRoute(): Promise<ApiTestResult | null> {
    const results = await this.test();
    const successResults = results.filter((r) => r.success);

    if (successResults.length === 0) {
      console.log("❌ 没有找到可用的 API 线路");
      return null;
    }

    const bestRoute = successResults[0];
    console.log(
      `🏆 最优线路: ${bestRoute.domain} (${bestRoute.responseTime}ms)`,
    );
    return bestRoute;
  }

  /**
   * 打印测试结果
   *
   * @param results - 测试结果数组
   */
  private printResults(results: ApiTestResult[]): void {
    console.log("\n📊 测试结果:");
    console.log("=".repeat(60));

    results.forEach((result, index) => {
      const status = result.success ? "✅" : "❌";
      const time = result.success ? `${result.responseTime}ms` : "N/A";
      const error = result.error ? ` (${result.error})` : "";

      console.log(`${index + 1}. ${status} ${result.domain} - ${time}${error}`);
    });

    console.log("=".repeat(60));
  }
}
