# Ultra Debugger

A robust Model Context Protocol (MCP) debugger specifically designed for JavaScript code. This tool leverages industry-standard tools like ESLint and custom analysis techniques to provide comprehensive analysis and debugging capabilities for AI-generated JavaScript code.

## Key Features

- **MCP Integration**: Works with AI assistants that support the Model Context Protocol
- **ESLint Powered**: Uses ESLint with recommended rules for accurate JavaScript analysis
- **Real-time Analysis**: Identifies syntax errors, potential bugs, and code quality issues
- **Fix Suggestions**: Provides actionable suggestions for resolving identified issues
- **Multi-file Support**: Analyze single files or entire projects at once
- **Fallback Analysis**: Uses custom analysis when ESLint is not available

## How It Works

The Ultra Debugger analyzes JavaScript code using two approaches:

1. **Primary Analysis**: Uses ESLint with a comprehensive set of rules to detect:
   - Syntax errors
   - Potential bugs
   - Code quality issues
   - Best practices violations

2. **Fallback Analysis**: When ESLint is not available, uses custom pattern matching to detect:
   - Debugger statements
   - Unreachable code
   - Common coding issues

## MCP Tools

When running as an MCP server, the Ultra Debugger exposes the following tools:

1. **analyze_js_file** - Analyze a single JavaScript file
   - Parameters: `file_path` (string)

2. **analyze_multiple_js_files** - Analyze multiple JavaScript files
   - Parameters: `file_paths` (array of strings)

3. **get_analysis_report** - Get the detailed report from the last analysis operation
   - No parameters

4. **get_fix_suggestions** - Get suggestions for fixing issues found in the last analysis
   - No parameters

## Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to the project directory
cd ultra-debugger

# Install dependencies
npm install
```

## Usage

### As an MCP Server

```bash
# Run as an MCP server
npm start
```

This starts the Ultra Debugger as an MCP server that can be integrated with AI assistants like Claude.

### Programmatic Usage

```javascript
const { analyzeJsFile, analyzeMultipleJsFiles } = require('./src/mcp/ultra-debugger-mcp.js');

// Analyze a single file
analyzeJsFile('path/to/your/file.js')
  .then(result => {
    console.log('Analysis result:', result);
  })
  .catch(error => {
    console.error('Analysis failed:', error);
  });

// Analyze multiple files
analyzeMultipleJsFiles(['file1.js', 'file2.js', 'file3.js'])
  .then(results => {
    console.log('Multi-file analysis results:', results);
  })
  .catch(error => {
    console.error('Analysis failed:', error);
  });
```

## Supported JavaScript Features

The Ultra Debugger supports modern JavaScript features including:

- ES6+ syntax (arrow functions, destructuring, modules, etc.)
- Node.js and browser environments
- Modern ECMAScript features

## Rules and Detection

The Ultra Debugger detects common JavaScript issues including:

- **Critical Errors**: Undefined variables, unreachable code, duplicate keys
- **Potential Bugs**: Unsafe operations, invalid regular expressions, improper comparisons
- **Code Quality Issues**: Unused variables, extra semicolons, unnecessary casts
- **Best Practices**: Proper error handling, safe control flow, valid syntax

## Integration with AI Assistants

AI assistants that support the Model Context Protocol can use the Ultra Debugger to:

1. Automatically analyze JavaScript code they generate
2. Identify and fix syntax errors and potential bugs
3. Provide code quality improvements
4. Offer specific suggestions for resolving issues

## Limitations

- Only works with JavaScript files (.js)
- Does not execute code (static analysis only)
- Does not support other languages (TypeScript, JSX, etc.)
- Limited rules when falling back from ESLint

## Future Improvements

- TypeScript support
- JSX/TSX support
- Integration with additional linting tools
- Automated code fixing capabilities
- Web-based dashboard for analysis results