# Ultra Debugger

![Ultra Debugger Logo](ultra-debugger.png)

A robust Model Context Protocol (MCP) debugger for JavaScript, TypeScript, JSX, and TSX files. This tool leverages industry-standard tools like ESLint, TypeScript ESLint, and React ESLint plugins to provide comprehensive analysis and debugging capabilities for AI-generated code.

## Key Features

- **MCP Integration**: Works with AI assistants that support the Model Context Protocol
- **Multi-language Support**: Analyzes JavaScript, TypeScript, JSX, and TSX files
- **ESLint Powered**: Uses ESLint with recommended rules for accurate code analysis
- **TypeScript Support**: Leverages @typescript-eslint for TypeScript-specific rules
- **React Support**: Uses eslint-plugin-react for JSX/React-specific rules
- **Real-time Analysis**: Identifies syntax errors, potential bugs, and code quality issues
- **Enhanced Fix Suggestions**: Provides detailed, context-aware suggestions for resolving issues
- **Multi-file Support**: Analyze single files or entire projects at once
- **Live Analysis**: Real-time monitoring of code changes with instant feedback
- **Fallback Analysis**: Uses custom analysis when ESLint is not available

## How It Works

The Ultra Debugger analyzes code using multiple approaches:

1. **JavaScript Analysis**: Uses ESLint with a comprehensive set of rules to detect:
   - Syntax errors
   - Potential bugs
   - Code quality issues
   - Best practices violations

2. **TypeScript Analysis**: Uses @typescript-eslint to detect TypeScript-specific issues:
   - Type errors
   - Unused variables
   - Explicit any usage
   - Other TypeScript best practices

3. **React/JSX Analysis**: Uses eslint-plugin-react to detect React-specific issues:
   - Component structure problems
   - Prop validation issues
   - React best practices

4. **Live Analysis**: Uses file system watchers to monitor code changes in real-time:
   - Instant feedback on code modifications
   - Automatic re-analysis when files change
   - Continuous monitoring of project directories

5. **Enhanced Fix Suggestions**: Provides context-aware, detailed suggestions:
   - Generic JavaScript fixes
   - TypeScript-specific recommendations
   - React/JSX best practices
   - Framework-specific guidance

6. **Fallback Analysis**: When ESLint is not available, uses custom pattern matching to detect:
   - Debugger statements
   - Unreachable code
   - Common coding issues

## MCP Configuration

To use this tool with mcp.so or other MCP registries, you need a proper configuration file. The tool expects an `mcp.config.json` file with the following format:

```json
{
  "mcpServers": {
    "ultra-debugger": {
      "command": "node",
      "args": ["src/mcp/ultra-debugger-mcp.js"],
      "env": {}
    }
  }
}
```

This configuration file is included in the repository as `mcp.config.json`.

## MCP Tools

When running as an MCP server, the Ultra Debugger exposes the following tools:

1. **analyze_file** - Analyze a JavaScript/TypeScript/JSX/TSX file
   - Parameters: `file_path` (string)

2. **analyze_multiple_files** - Analyze multiple files
   - Parameters: `file_paths` (array of strings)

3. **watch_file** - Start live analysis of a file or directory
   - Parameters: 
     - `path` (string): Path to the file or directory to watch
     - `watch_id` (string): Unique identifier for this watch session

4. **unwatch_file** - Stop live analysis of a previously watched file or directory
   - Parameters: `watch_id` (string): Unique identifier for the watch session to stop

5. **list_watch_sessions** - List all active watch sessions
   - No parameters

6. **get_analysis_report** - Get the detailed report from the last analysis operation
   - No parameters

7. **get_fix_suggestions** - Get suggestions for fixing issues found in the last analysis
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
const { analyzeFile, analyzeMultipleFiles } = require('./src/mcp/ultra-debugger-mcp.js');

// Analyze a single file
analyzeFile('path/to/your/file.tsx')
  .then(result => {
    console.log('Analysis result:', result);
  })
  .catch(error => {
    console.error('Analysis failed:', error);
  });

// Analyze multiple files
analyzeMultipleFiles(['app.js', 'component.tsx', 'utils.jsx'])
  .then(results => {
    console.log('Multi-file analysis results:', results);
  })
  .catch(error => {
    console.error('Analysis failed:', error);
  });
```

## Supported File Types

The Ultra Debugger supports modern web development file types including:

- **JavaScript** (.js)
- **TypeScript** (.ts)
- **React JSX** (.jsx)
- **TypeScript with React** (.tsx)

## Rules and Detection

The Ultra Debugger detects common issues including:

### JavaScript/TypeScript Rules:
- **Critical Errors**: Undefined variables, unreachable code, duplicate keys
- **Potential Bugs**: Unsafe operations, invalid regular expressions, improper comparisons
- **Code Quality Issues**: Unused variables, extra semicolons, unnecessary casts
- **Best Practices**: Proper error handling, safe control flow, valid syntax

### TypeScript-Specific Rules:
- **Type Safety**: Explicit any usage, unused variables
- **TypeScript Best Practices**: Proper typing, interface usage
- **Advanced Type Checking**: Non-null assertions, inferrable types, consistent array types

### React/JSX-Specific Rules:
- **Component Structure**: Proper component definitions
- **Props Handling**: Prop validation, proper prop usage
- **JSX Best Practices**: Key props, self-closing tags, unescaped entities

## Enhanced Fix Suggestions

The Ultra Debugger provides detailed, context-aware fix suggestions for all detected issues:

### Generic JavaScript Fixes:
- Undefined variables
- Unused variables
- Unreachable code
- Debugger statements
- Duplicate object keys

### TypeScript-Specific Suggestions:
- **no-explicit-any**: "Specify a more specific type instead of 'any'. Consider using 'unknown' for safer typing, or define an interface/type for the expected structure"
- **no-inferrable-types**: "Remove the type annotation as it can be inferred from the assigned value"
- **prefer-as-const**: "Use 'as const' instead of explicit type annotation for literal types"
- **no-empty-interface**: "Remove the empty interface or extend another interface"
- **no-non-null-assertion**: "Avoid using the non-null assertion operator (!). Instead, check for null/undefined explicitly"
- **array-type**: "Use the generic syntax Array<T> instead of T[] for consistency, or vice versa"
- **consistent-type-assertions**: "Use 'as Type' instead of '<Type>' for type assertions to avoid conflicts with JSX syntax"

### React/JSX-Specific Suggestions:
- **jsx-key**: "Add a unique 'key' prop to each element in the list. The key should be a stable identifier, not an array index"
- **no-children-prop**: "Pass children as nested JSX elements instead of using the 'children' prop"
- **jsx-no-duplicate-props**: "Remove duplicate props. Prop names are case-insensitive"
- **no-unknown-property**: "Use the correct DOM property name. For example, use 'className' instead of 'class'"
- **no-unescaped-entities**: "Escape special characters like '>', '<', '}', '\"' in JSX text or use expressions"
- **self-closing-comp**: "Use self-closing syntax for components without children"

## Live Analysis

The Ultra Debugger supports real-time code analysis through file watching:

1. **File Watching**: Monitor individual files or entire directories for changes
2. **Instant Feedback**: Get immediate analysis results when code is modified
3. **Continuous Monitoring**: Keep watching files until explicitly stopped
4. **Multiple Sessions**: Run multiple watch sessions simultaneously with unique IDs

To use live analysis with MCP tools:
1. Call `watch_file` with a path and unique watch ID
2. View live analysis output in the server console
3. Call `unwatch_file` with the watch ID to stop monitoring
4. Use `list_watch_sessions` to see active watch sessions

## Integration with AI Assistants

AI assistants that support the Model Context Protocol can use the Ultra Debugger to:

1. Automatically analyze code they generate (JavaScript, TypeScript, React)
2. Identify and fix syntax errors and potential bugs
3. Provide code quality improvements
4. Offer specific suggestions for resolving issues
5. Monitor code changes in real-time for continuous feedback
6. Provide detailed, context-aware fix recommendations

## Project Icon

This project includes a custom icon ([ultra-debugger.png](ultra-debugger.png)) that can be used as:
- GitHub repository icon
- MCP tool identity
- Application logo

## Limitations

- Does not execute code (static analysis only)
- Limited rules when falling back from ESLint
- Requires proper file extensions to detect file type
- Live analysis reports to console, not directly through MCP

## Future Improvements

- Automated code fixing capabilities
- Web-based dashboard for analysis results
- Integration with more linting tools
- Support for additional frameworks (Vue, Angular, etc.)
- Enhanced live analysis reporting through MCP
- Machine learning-based suggestion improvements