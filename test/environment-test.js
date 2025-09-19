const { analyzeEnvironment } = require('../src/mcp/ultra-debugger-mcp.js');

// Test the environment analysis functionality
async function testEnvironmentAnalysis() {
  try {
    console.log('Testing Ultra Debugger environment analysis functionality...');
    
    // Test all environment checks
    console.log('\n--- Testing all environment checks ---');
    const allIssues = await analyzeEnvironment("all");
    console.log(`Found ${allIssues.length} potential environment issues`);
    allIssues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });
    
    // Test memory check
    console.log('\n--- Testing memory check ---');
    const memoryIssues = await analyzeEnvironment("memory");
    console.log(`Found ${memoryIssues.length} memory-related issues`);
    memoryIssues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });
    
    // Test CPU check
    console.log('\n--- Testing CPU check ---');
    const cpuIssues = await analyzeEnvironment("cpu");
    console.log(`Found ${cpuIssues.length} CPU-related issues`);
    cpuIssues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });
    
    console.log('\nEnvironment analysis test completed successfully!');
  } catch (error) {
    console.error('Environment analysis test failed:', error.message);
  }
}

// Run the test
testEnvironmentAnalysis();