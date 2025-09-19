# Ultra Debugger

![Ultra Debugger Logo](ultra-debugger.ico)

A Model Context Protocol (MCP) debugger for JavaScript, TypeScript, JSX, and TSX files. Uses ESLint and related tools to find and fix code issues.

## Features

- **MCP Integration**: Works with AI assistants that support MCP
- **Multi-language Support**: JavaScript, TypeScript, JSX, and TSX
- **Real-time Analysis**: Instant feedback on code changes
- **Fix Suggestions**: Detailed recommendations for resolving issues

## How It Works

Analyzes code using:
1. ESLint for JavaScript issues
2. @typescript-eslint for TypeScript-specific problems
3. eslint-plugin-react for React/JSX best practices
4. Live file watching for real-time feedback

## Installation

```bash
git clone <repository-url>
cd ultra-debugger
npm install
```

## Usage

### As an MCP Server

```bash
npm start
```

### Programmatic Usage

```javascript
const { analyzeFile } = require('./src/mcp/ultra-debugger-mcp.js');

analyzeFile('path/to/your/file.tsx')
  .then(result => console.log(result))
  .catch(error => console.error(error));
```

## Supported File Types

- JavaScript (.js)
- TypeScript (.ts)
- React JSX (.jsx)
- TypeScript with React (.tsx)

## Integration with AI Assistants

AI assistants with MCP support can use Ultra Debugger to:
1. Analyze generated code
2. Find syntax errors and bugs
3. Get code quality improvements
4. Monitor code changes in real-time
5. Receive detailed fix recommendations

## Project Icon

This project includes a custom icon ([ultra-debugger.png](ultra-debugger.png)) for use as:
- GitHub repository icon
- MCP tool identity
- Application logo