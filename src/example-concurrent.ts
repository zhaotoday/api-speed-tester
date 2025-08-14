import { ApiSpeedTester } from './api-speed-tester.js';

/**
 * 示例：并发测速，最快结果立即返回，其他线路继续测试
 */
async function exampleConcurrentTesting() {
  const tester = new ApiSpeedTester({
    domains: [
      'jsonplaceholder.typicode.com',
      'httpbin.org',
      'api.github.com',
      'reqres.in'
    ],
    testPath: '/users/1',
    expectedResponse: { id: 1 }, // 简化的期望响应
    timeout: 5000
  });

  console.log('=== 并发测速示例 ===\n');

  // 使用新的并发测试方法
  const { fastest, allResults } = await tester.getBestRouteWithContinuousTesting();

  if (fastest) {
    console.log(`\n🎯 立即可用的最快线路: ${fastest.domain}`);
    console.log(`⚡ 响应时间: ${fastest.responseTime}ms`);
    console.log('✅ 可以立即开始使用此线路进行后续请求\n');
    
    // 这里可以立即开始使用最快的线路
    console.log('🚀 开始使用最快线路处理业务请求...\n');
  } else {
    console.log('❌ 没有找到可用的线路\n');
  }

  // 等待所有测试完成，获取完整排序结果
  console.log('⏳ 等待所有线路测试完成...\n');
  const sortedResults = await allResults;

  console.log('📊 最终完整测速结果（按响应时间排序）:');
  sortedResults.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    const time = result.success ? `${result.responseTime}ms` : 'Failed';
    console.log(`${index + 1}. ${status} ${result.domain} - ${time}`);
  });

  return sortedResults;
}

/**
 * 示例：使用回调函数的并发测试
 */
async function exampleWithCallback() {
  const tester = new ApiSpeedTester({
    domains: [
      'jsonplaceholder.typicode.com',
      'httpbin.org',
      'api.github.com'
    ],
    testPath: '/users',
    expectedResponse: [], // 期望数组响应
    timeout: 3000
  });

  console.log('\n=== 带回调的并发测速示例 ===\n');

  // 使用带回调的测试方法
  const result = await tester.testConcurrentWithFastest((fastestResult) => {
    console.log(`🔥 检测到最快线路: ${fastestResult.domain} (${fastestResult.responseTime}ms)`);
    console.log('💡 可以在这里立即开始使用此线路...\n');
  });

  console.log(`📈 测试完成统计:`);
  console.log(`- 最快线路: ${result.fastest?.domain || '无'}`);
  console.log(`- 完成数量: ${result.completedCount}/${result.totalCount}`);
  console.log(`- 成功线路: ${result.allResults.filter(r => r.success).length} 个`);

  return result.allResults;
}

// 运行示例
if (import.meta.url === `file://${process.argv[1]}`) {
  exampleConcurrentTesting()
    .then(() => exampleWithCallback())
    .catch(console.error);
}

export { exampleConcurrentTesting, exampleWithCallback };