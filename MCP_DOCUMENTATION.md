# Ultra Debugger MCP Documentation

The Ultra Debugger now supports the Model Context Protocol (MCP), which allows it to integrate with AI assistants and development tools that support this protocol.

## What is MCP?

The Model Context Protocol (MCP) is an open protocol that enables secure communication between AI assistants and external tools. It allows AI systems to access and interact with various tools and resources in a standardized way.

## Ultra Debugger MCP Tools

The Ultra Debugger MCP server exposes four tools that can be used by AI assistants:

### 1. debug_file

Debugs a single JavaScript file for potential issues.

**Parameters:**
- `file_path` (string, required): Path to the JavaScript file to debug

**Returns:**
- Summary of the debug operation including number of issues found, warnings, and code health score

### 2. debug_multiple_files

Debugs multiple JavaScript files for potential issues.

**Parameters:**
- `file_paths` (array of strings, required): Array of paths to JavaScript files to debug

**Returns:**
- Summary of the multi-file debug operation including successful/failed files and overall code health

### 3. get_last_debug_report

Retrieves the detailed report from the last debug operation.

**Parameters:**
- None

**Returns:**
- Full JSON report with detailed analysis results

### 4. get_fix_suggestions

Retrieves suggestions for fixing issues found in the last debug operation.

**Parameters:**
- None

**Returns:**
- JSON array of suggestions for fixing the identified issues

## Running the Ultra Debugger as an MCP Server

To run the Ultra Debugger as an MCP server:

```bash
npm run mcp
```

This will start the MCP server on stdio, which can be connected to by any MCP-compatible client.

## Example Usage with MCP Clients

The Ultra Debugger MCP server can be used with any MCP-compatible client or AI assistant. The server will:

1. Accept tool list requests
2. Process debugging requests for JavaScript files
3. Return structured results that can be interpreted by the AI assistant
4. Maintain state to allow retrieval of detailed reports and suggestions

## Integration with AI Assistants

AI assistants that support MCP can use the Ultra Debugger to:

1. Automatically debug code that they've generated
2. Analyze existing codebases for potential issues
3. Get suggestions for improving code quality
4. Provide detailed feedback to users about code health

## Security Considerations

The Ultra Debugger MCP server:

1. Only processes files that exist on the local filesystem
2. Does not execute arbitrary code from MCP clients
3. Runs code in a sandboxed environment when performing runtime analysis
4. Does not modify files on disk unless explicitly configured to do so
5. Only exposes debugging functionality, not general file system access

## Extending MCP Functionality

The MCP implementation can be extended by:

1. Adding new tools in `src/mcp/mcp-server.js`
2. Enhancing the debug controller with new capabilities
3. Adding new analysis modules that can be exposed as tools
4. Improving the structured output for better AI interpretation