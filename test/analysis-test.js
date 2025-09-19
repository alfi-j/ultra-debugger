const { analyzeFile } = require('../src/mcp/ultra-debugger-mcp.js');
const fs = require('fs').promises;

// Test the analysis functionality with different file types
async function testAnalysis() {
  try {
    console.log('Testing Ultra Debugger analysis functionality...');
    
    // Test JavaScript file
    console.log('\n--- Testing JavaScript file ---');
    const jsResult = await analyzeFile('./test/demo.js');
    console.log('JavaScript analysis completed successfully!');
    console.log(`Found ${jsResult.errorCount} errors and ${jsResult.warningCount} warnings`);
    
    // Test TypeScript file
    console.log('\n--- Testing TypeScript file ---');
    const tsResult = await analyzeFile('./test/demo.ts');
    console.log('TypeScript analysis completed successfully!');
    console.log(`Found ${tsResult.errorCount} errors and ${tsResult.warningCount} warnings`);
    
    // Test React/JSX file
    console.log('\n--- Testing React/JSX file ---');
    const jsxResult = await analyzeFile('./test/demo.jsx');
    console.log('React/JSX analysis completed successfully!');
    console.log(`Found ${jsxResult.errorCount} errors and ${jsxResult.warningCount} warnings`);
    
    // Test TypeScript with React file
    console.log('\n--- Testing TypeScript with React (TSX) file ---');
    const tsxResult = await analyzeFile('./test/demo.tsx');
    console.log('TypeScript with React analysis completed successfully!');
    console.log(`Found ${tsxResult.errorCount} errors and ${tsxResult.warningCount} warnings`);
    
    // Show a few of the issues found in each file
    const results = [
      { name: 'JavaScript', result: jsResult },
      { name: 'TypeScript', result: tsResult },
      { name: 'React/JSX', result: jsxResult },
      { name: 'TypeScript+React', result: tsxResult }
    ];
    
    results.forEach(({ name, result }) => {
      if (result.results && result.results.length > 0) {
        const messages = result.results[0].messages || [];
        console.log(`\n${name} - First 3 issues found:`);
        messages.slice(0, 3).forEach((msg, index) => {
          console.log(`${index + 1}. ${msg.ruleId || 'N/A'}: ${msg.message} (line ${msg.line})`);
        });
      }
    });
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testAnalysis();