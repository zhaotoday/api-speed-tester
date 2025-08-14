import { ApiSpeedTester } from "./api-speed-tester.js";
import { ApiTestConfig } from "./types.js";

/**
 * API 速度测试示例
 */
async function runExample() {
  console.log("🎯 API 线路速度测试示例\n");

  // 示例 1：基本测试 - 获取最快线路
  await basicExample();
  
  console.log("\n" + "=".repeat(80) + "\n");
  
  // 示例 2：最快结果立即返回，其他线路继续测试
  await fastestFirstExample();
  
  console.log("\n" + "=".repeat(80) + "\n");
  
  // 示例 3：使用回调函数的测试
  await callbackExample();
}

/**
 * 示例 1：基本测试 - 获取最快线路
 */
async function basicExample() {
  console.log("📋 示例 1: 基本测试 - 获取最快线路");
  
  const config: ApiTestConfig = {
    domains: [
      "jsonplaceholder.typicode.com", 
      "httpbin.org", 
      "api.github.com"
    ],
    testPath: "/users/1",
    expectedResponse: {
      id: 1,
      name: "Leanne Graham",
      username: "Bret",
      email: "Sincere@april.biz",
    },
    timeout: 3000,
  };
  
  const tester = new ApiSpeedTester(config);

  try {
    // 获取最优线路（等待所有测试完成后返回最快的）
    const bestRoute = await tester.getBestRoute();
    
    if (bestRoute) {
      console.log(`\n🏆 最优线路: ${bestRoute.domain}`);
      console.log(`⏱️ 响应时间: ${bestRoute.responseTime}ms`);
      console.log(`🔗 完整地址: https://${bestRoute.domain}${config.testPath}`);
    }
  } catch (error) {
    console.error("❌ 测试失败:", error);
  }
}

/**
 * 示例 2：最快结果立即返回，其他线路继续测试
 */
async function fastestFirstExample() {
  console.log("📋 示例 2: 最快结果立即返回，其他线路继续测试");
  
  const tester = new ApiSpeedTester({
    domains: [
      "jsonplaceholder.typicode.com",
      "httpbin.org",
      "api.github.com",
      "reqres.in"
    ],
    testPath: "/users/1",
    expectedResponse: { id: 1 }, // 简化的期望响应
    timeout: 5000
  });

  // 使用新的测试方法 - 最快结果立即返回
  const { fastest, allResults } = await tester.getBestRouteWithContinuousTesting();

  if (fastest) {
    console.log(`\n⚡ 立即可用的最快线路: ${fastest.domain}`);
    console.log(`⏱️ 响应时间: ${fastest.responseTime}ms`);
    console.log("✅ 可以立即开始使用此线路进行后续请求");
    
    // 这里可以立即开始使用最快的线路
    console.log("🚀 开始使用最快线路处理业务请求...");
  } else {
    console.log("❌ 没有找到可用的线路");
  }

  // 等待所有测试完成，获取完整排序结果
  console.log("\n⏳ 等待所有线路测试完成...");
  const sortedResults = await allResults;

  console.log("\n📊 最终完整测速结果（按响应时间排序）:");
  sortedResults.forEach((result, index) => {
    const status = result.success ? "✅" : "❌";
    const time = result.success ? `${result.responseTime}ms` : "失败";
    console.log(`${index + 1}. ${status} ${result.domain} - ${time}`);
  });
}

/**
 * 示例 3：使用回调函数的测试
 */
async function callbackExample() {
  console.log("📋 示例 3: 使用回调函数的测试");
  
  const tester = new ApiSpeedTester({
    domains: [
      "jsonplaceholder.typicode.com",
      "httpbin.org",
      "api.github.com"
    ],
    testPath: "/users",
    expectedResponse: [], // 期望数组响应
    timeout: 3000
  });

  // 使用带回调的测试方法
  const result = await tester.testConcurrentWithFastest((fastestResult) => {
    console.log(`\n🔥 检测到最快线路: ${fastestResult.domain} (${fastestResult.responseTime}ms)`);
    console.log("💡 可以在这里立即开始使用此线路...");
    
    // 在回调中处理最快结果
    // handleFastestRoute(fastestResult.domain);
  });

  console.log("\n📈 测试完成统计:");
  console.log(`- 最快线路: ${result.fastest?.domain || "无"}`);
  console.log(`- 完成数量: ${result.completedCount}/${result.totalCount}`);
  console.log(`- 成功线路: ${result.allResults.filter(r => r.success).length} 个`);
}

// 运行示例
if (import.meta.url === `file://${process.argv[1]}`) {
  runExample().catch(console.error);
}

export { runExample, basicExample, fastestFirstExample, callbackExample };