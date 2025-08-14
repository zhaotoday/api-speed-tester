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
 * const { fastest, allResults } = await tester.getBestRouteWithContinuousTesting();
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
   * 获取最优线路 - 最快成功后立即返回，其他线路继续测试
   *
   * @returns Promise<{ fastest: ApiTestResult | null, allResults: Promise<ApiTestResult[]> }>
   */
  async getBestRoute(): Promise<{
    fastest: ApiTestResult | null;
    allResults: Promise<ApiTestResult[]>;
  }> {
    console.log(`🚀 开始测试 ${this.config.domains.length} 个 API 线路...`);
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