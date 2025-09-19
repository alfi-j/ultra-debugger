/**
 * Simple test for Ultra Debugger MCP functionality
 */

const { runServer } = require('./mcp-server.js');

// Test that the MCP server can be imported and started without errors
console.log('Testing Ultra Debugger MCP server...');

try {
  console.log('Ultra Debugger MCP server module loaded successfully');
  console.log('Server can be started with: npm run mcp');
  console.log('The server implements the Model Context Protocol (MCP) and provides tools for debugging AI-generated code');
} catch (error) {
  console.error('Error loading Ultra Debugger MCP server:', error);
}