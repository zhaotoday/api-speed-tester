import { ApiSpeedTester } from "./api-speed-tester.js";
import { ApiTestConfig } from "./types.js";

/**
 * 使用示例
 */
async function runExample() {
  console.log("🎯 API 线路速度测试示例\n");

  // 示例配置 1：测试 JSON API
  const config1: ApiTestConfig = {
    domains: ["jsonplaceholder.typicode.com", "httpbin.org", "api.github.com"],
    testPath: "/users/1",
    expectedResponse: {
      id: 1,
      name: "Leanne Graham",
      username: "Bret",
      email: "Sincere@april.biz",
    },
    timeout: 3000,
    concurrent: true,
  };

  console.log("📋 测试配置 1: JSONPlaceholder API");
  const tester1 = new ApiSpeedTester(config1);

  try {
    const bestRoute1 = await tester1.getBestRoute();
    if (bestRoute1) {
      console.log(
        `\n🎯 推荐使用: https://${bestRoute1.domain}${config1.testPath}`,
      );
    }
  } catch (error) {
    console.error("❌ 测试失败:", error);
  }

  console.log("\n" + "=".repeat(80) + "\n");

  // 示例配置 2：测试简单健康检查
  const config2: ApiTestConfig = {
    domains: ["httpbin.org", "jsonplaceholder.typicode.com"],
    testPath: "/status/200",
    expectedResponse: {},
    timeout: 2000,
    concurrent: false, // 串行测试
  };

  console.log("📋 测试配置 2: 健康检查 API (串行测试)");
  const tester2 = new ApiSpeedTester(config2);

  try {
    const results = await tester2.test();
    const successCount = results.filter((r) => r.success).length;
    console.log(
      `\n📈 成功率: ${successCount}/${results.length} (${Math.round((successCount / results.length) * 100)}%)`,
    );
  } catch (error) {
    console.error("❌ 测试失败:", error);
  }

  console.log("\n" + "=".repeat(80) + "\n");

  // 示例配置 3：自定义期望响应
  const config3: ApiTestConfig = {
    domains: ["httpbin.org"],
    testPath: "/json",
    expectedResponse: {
      slideshow: {
        author: "Yours Truly",
        date: "date of publication",
        slides: [
          {
            title: "Wake up to WonderWidgets!",
            type: "all",
          },
          {
            items: [
              "Why <em>WonderWidgets</em> are great",
              "Who <em>buys</em> WonderWidgets",
            ],
            title: "Overview",
            type: "all",
          },
        ],
        title: "Sample Slide Show",
      },
    },
    timeout: 5000,
    headers: {
      "User-Agent": "API-Speed-Tester/1.0",
      Accept: "application/json",
    },
  };

  console.log("📋 测试配置 3: 自定义响应验证");
  const tester3 = new ApiSpeedTester(config3);

  try {
    const bestRoute3 = await tester3.getBestRoute();
    if (bestRoute3) {
      console.log(
        `\n🎯 推荐使用: https://${bestRoute3.domain}${config3.testPath}`,
      );
      console.log(
        `📊 响应数据预览:`,
        JSON.stringify(bestRoute3.data, null, 2).substring(0, 200) + "...",
      );
    }
  } catch (error) {
    console.error("❌ 测试失败:", error);
  }
}

// 运行示例
if (
  typeof process !== "undefined" &&
  import.meta.url === `file://${process.argv[1]}`
) {
  runExample().catch(console.error);
}

export { runExample };
