import {ApiSpeedTester} from "./api-speed-tester.js";

/**
 * API 速度测试示例
 */
async function runExample() {
  console.log("🎯 API 线路速度测试示例\n");

  // 最快结果立即返回，其他线路继续测试
  await speedTestExample();
}

/**
 * 最快结果立即返回，其他线路继续测试
 */
async function speedTestExample() {
  console.log("📋 API 速度测试 - 最快结果立即返回");
  
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

  // 使用测试方法 - 最快结果立即返回
  const { fastest, allResults } = await tester.getBestRoute();

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

// 运行示例
if (import.meta.url === `file://${process.argv[1]}`) {
  runExample().catch(console.error);
}

export { runExample, speedTestExample };