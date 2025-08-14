import axios, { AxiosResponse, AxiosError } from "axios";
import { ApiTestResult, ApiTestConfig, ConcurrentTestResult } from "./types.js";

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
      headers: { "Content-Type": "application/json" },
      ...config,
    } as Required<ApiTestConfig>;
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
   * 并发测试所有 API - 最快成功后立即返回，其他继续测试
   *
   * @param onFastestResult - 最快结果回调函数
   * @returns 所有测试结果按响应时间排序
   */
  async testConcurrentWithFastest(
    onFastestResult?: (result: ApiTestResult) => void
  ): Promise<ConcurrentTestResult> {
    const results: ApiTestResult[] = [];
    let fastest: ApiTestResult | null = null;
    let fastestReturned = false;

    // 创建所有测试 Promise
    const promises = this.config.domains.map(async (domain) => {
      const result = await this.testSingleApi(domain);
      results.push(result);

      // 如果是第一个成功的结果且还没有返回最快结果
      if (result.success && !fastest) {
        fastest = result;
        if (onFastestResult && !fastestReturned) {
          fastestReturned = true;
          onFastestResult(result);
        }
      }

      return result;
    });

    // 等待所有测试完成
    await Promise.allSettled(promises);

    // 按响应时间排序，成功的排在前面
    results.sort((a, b) => {
      if (a.success && !b.success) return -1;
      if (!a.success && b.success) return 1;
      return a.responseTime - b.responseTime;
    });

    return {
      fastest,
      allResults: results,
      completedCount: results.length,
      totalCount: this.config.domains.length
    };
  }

  /**
   * 并发测试所有 API（原有方法保持兼容性）
   *
   * @returns 所有测试结果
   */
  private async testConcurrent(): Promise<ApiTestResult[]> {
    const result = await this.testConcurrentWithFastest();
    return result.allResults;
  }

  /**
   * 执行 API 速度测试
   *
   * @returns 测试结果，按响应时间排序
   */
  async test(): Promise<ApiTestResult[]> {
    console.log(`🚀 开始并发测试 ${this.config.domains.length} 个 API 线路...`);
    console.log(`📍 测试路径: ${this.config.testPath}`);
    console.log(`⏱️  超时时间: ${this.config.timeout}ms`);

    const results = await this.testConcurrent();

    // 按响应时间排序，成功的排在前面
    results.sort((a, b) => {
      if (a.success && !b.success) return -1;
      if (!a.success && b.success) return 1;
      return a.responseTime - b.responseTime;
    });

    this.printResults(results);
    return results;
  }

  /**
   * 获取最优线路 - 最快成功后立即返回，其他线路继续测试
   *
   * @returns Promise<{ fastest: ApiTestResult | null, allResults: Promise<ApiTestResult[]> }>
   */
  async getBestRouteWithContinuousTesting(): Promise<{
    fastest: ApiTestResult | null;
    allResults: Promise<ApiTestResult[]>;
  }> {
    console.log(`🚀 开始并发测试 ${this.config.domains.length} 个 API 线路...`);
    console.log(`📍 测试路径: ${this.config.testPath}`);
    console.log(`⏱️  超时时间: ${this.config.timeout}ms`);

    const results: ApiTestResult[] = [];
    let fastest: ApiTestResult | null = null;
    let fastestResolved = false;

    // 创建一个 Promise 来跟踪最快结果
    let resolveFastest: (result: ApiTestResult | null) => void;
    const fastestPromise = new Promise<ApiTestResult | null>((resolve) => {
      resolveFastest = resolve;
    });

    // 创建所有测试 Promise
    const testPromises = this.config.domains.map(async (domain) => {
      const result = await this.testSingleApi(domain);
      results.push(result);

      // 如果是第一个成功的结果
      if (result.success && !fastest && !fastestResolved) {
        fastest = result;
        fastestResolved = true;
        console.log(`⚡ 最快线路: ${result.domain} (${result.responseTime}ms)`);
        resolveFastest(result);
      }

      return result;
    });

    // 等待所有测试完成的 Promise
    const allResultsPromise = Promise.allSettled(testPromises).then(() => {
      // 如果没有成功的结果，解析最快结果为 null
      if (!fastestResolved) {
        resolveFastest(null);
      }

      // 按响应时间排序
      results.sort((a, b) => {
        if (a.success && !b.success) return -1;
        if (!a.success && b.success) return 1;
        return a.responseTime - b.responseTime;
      });

      this.printResults(results);
      return results;
    });

    // 返回最快结果和所有结果的 Promise
    return {
      fastest: await fastestPromise,
      allResults: allResultsPromise
    };
  }

  /**
   * 获取最优线路（原有方法保持兼容性）
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
