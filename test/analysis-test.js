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
    
    // Test enhanced TypeScript file
    console.log('\n--- Testing enhanced TypeScript file ---');
    const enhancedTsResult = await analyzeFile('./test/demo-enhanced.ts');
    console.log('Enhanced TypeScript analysis completed successfully!');
    console.log(`Found ${enhancedTsResult.errorCount} errors and ${enhancedTsResult.warningCount} warnings`);
    
    // Test enhanced TSX file
    console.log('\n--- Testing enhanced TSX file ---');
    const enhancedTsxResult = await analyzeFile('./test/demo-enhanced.tsx');
    console.log('Enhanced TSX analysis completed successfully!');
    console.log(`Found ${enhancedTsxResult.errorCount} errors and ${enhancedTsxResult.warningCount} warnings`);
    
    // Show fix suggestions for enhanced files
    console.log('\n--- Fix Suggestions ---');
    const enhancedResults = [
      { name: 'Enhanced TypeScript', result: enhancedTsResult },
      { name: 'Enhanced TSX', result: enhancedTsxResult }
    ];
    
    enhancedResults.forEach(({ name, result }) => {
      console.log(`\n${name} Fix Suggestions:`);
      if (result.results && result.results.length > 0) {
        const messages = result.results[0].messages || [];
        messages.slice(0, 5).forEach((msg, index) => {
          const suggestion = getFixSuggestion(msg.ruleId, msg.message, result.filePath);
          console.log(`${index + 1}. ${msg.ruleId || 'N/A'}: ${msg.message}`);
          console.log(`   Suggestion: ${suggestion}`);
        });
      }
    });
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Copy of the suggestion function for testing
function getFixSuggestion(ruleId, message, filePath) {
  // Determine file type for context-aware suggestions
  const extension = require('path').extname(filePath).toLowerCase();
  const isTypeScript = extension === '.ts' || extension === '.tsx';
  const isReact = extension === '.jsx' || extension === '.tsx';
  
  // Generic suggestions
  const genericSuggestions = {
    "no-undef": "Declare the variable or check if it exists before using it",
    "no-unused-vars": "Remove the unused variable or use it in your code",
    "no-unreachable": "Remove the unreachable code or restructure your logic",
    "no-debugger": "Remove the debugger statement before deploying to production",
    "no-dupe-keys": "Rename the duplicate object keys to be unique"
  };
  
  // TypeScript-specific suggestions
  const typescriptSuggestions = {
    "@typescript-eslint/no-unused-vars": "Remove the unused variable or use it in your code. For intentionally unused variables, prefix with an underscore (_variableName)",
    "@typescript-eslint/no-explicit-any": "Specify a more specific type instead of 'any'. Consider using 'unknown' for safer typing, or define an interface/type for the expected structure",
    "@typescript-eslint/no-inferrable-types": "Remove the type annotation as it can be inferred from the assigned value",
    "@typescript-eslint/prefer-as-const": "Use 'as const' instead of explicit type annotation for literal types",
    "@typescript-eslint/no-empty-interface": "Remove the empty interface or extend another interface",
    "@typescript-eslint/no-non-null-assertion": "Avoid using the non-null assertion operator (!). Instead, check for null/undefined explicitly",
    "@typescript-eslint/array-type": "Use the generic syntax Array<T> instead of T[] for consistency, or vice versa",
    "@typescript-eslint/consistent-type-assertions": "Use 'as Type' instead of '<Type>' for type assertions to avoid conflicts with JSX syntax"
  };
  
  // React-specific suggestions
  const reactSuggestions = {
    "react/jsx-key": "Add a unique 'key' prop to each element in the list. The key should be a stable identifier, not an array index",
    "react/no-children-prop": "Pass children as nested JSX elements instead of using the 'children' prop",
    "react/react-in-jsx-scope": "Import React or configure the new JSX transform in your build system",
    "react/prop-types": "Use TypeScript interfaces or the PropTypes package to define prop types",
    "react/jsx-no-duplicate-props": "Remove duplicate props. Prop names are case-insensitive",
    "react/jsx-no-undef": "Make sure the component is imported or defined before using it in JSX",
    "react/no-danger": "Avoid using 'dangerouslySetInnerHTML' when possible. If needed, sanitize the HTML input",
    "react/no-deprecated": "Replace deprecated React APIs with their modern alternatives",
    "react/no-direct-mutation-state": "Use 'setState()' to update component state instead of mutating 'this.state' directly",
    "react/no-find-dom-node": "Use 'refs' or 'ReactDOM.findDOMNode()' alternatives",
    "react/no-is-mounted": "Check component lifecycle or use hooks instead of 'isMounted()'",
    "react/no-render-return-value": "Do not depend on the return value of 'ReactDOM.render()'",
    "react/no-string-refs": "Use callback refs or 'createRef()' instead of string refs",
    "react/no-unescaped-entities": "Escape special characters like '>', '<', '}', '\"' in JSX text or use expressions",
    "react/no-unknown-property": "Use the correct DOM property name. For example, use 'className' instead of 'class'",
    "react/require-render-return": "Ensure 'render()' method returns a value",
    "react/self-closing-comp": "Use self-closing syntax for components without children"
  };
  
  // Context-aware suggestions
  if (isTypeScript && typescriptSuggestions[ruleId]) {
    return typescriptSuggestions[ruleId];
  }
  
  if (isReact && reactSuggestions[ruleId]) {
    return reactSuggestions[ruleId];
  }
  
  // Return generic suggestion if no specific one found
  return genericSuggestions[ruleId] || "Review the code and fix according to the error message";
}

testAnalysis();