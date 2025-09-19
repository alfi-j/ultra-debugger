# Ultra Debugger MCP Server

This is the Model Context Protocol (MCP) server for the Ultra Debugger tool.

## Prerequisites

- Node.js version 18 or higher

## Installation

```bash
npm install
```

## Running the Server

```bash
npm start
```

Or directly with Node.js:

```bash
node src/mcp/ultra-debugger-mcp.js
```

## MCP Endpoints

The server provides the following MCP endpoints:

1. `/mcp/initialize` - Initialize the MCP connection
2. `/mcp/tools/list` - List available debugging tools
3. `/mcp/tools/call` - Execute a specific debugging tool

## Available Tools

1. `debug_code` - Debug a piece of code and provide insights
2. `analyze_performance` - Analyze code performance and suggest improvements

## Configuration

The server configuration can be found in:
- [mcp.config.json](mcp.config.json) - MCP specific configuration
- [manifest.json](manifest.json) - Server manifest file

## Troubleshooting

If you encounter the error `failed to initialize MCP client for ultra-debugger: transport error: context deadline exceeded`, try the following:

1. Make sure the server is running properly with `npm start`
2. Check that you're using Node.js version 18 or higher
3. Verify that the port (default 3000) is not blocked by firewall
4. Ensure that all required files are present in the project directory
5. Check that the server responds to the initialization endpoint: `curl http://localhost:3000/mcp/initialize`

## Example Usage

After starting the server, you can test it with curl:

```bash
# Initialize the MCP connection
curl http://localhost:3000/mcp/initialize

# List available tools
curl http://localhost:3000/mcp/tools/list

# Call a tool
curl -X POST http://localhost:3000/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{"name": "debug_code", "arguments": {"code": "console.log(\"Hello World\");", "language": "javascript"}}'
```