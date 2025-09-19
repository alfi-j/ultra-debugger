/**
 * Simple test script for the Ultra Debugger MCP server
 * This script demonstrates how to communicate with the MCP server
 */

const { Client } = require("@modelcontextprotocol/sdk/client/index.js");
const { StdioClientTransport } = require("@modelcontextprotocol/sdk/client/stdio.js");

async function testMCP() {
  try {
    // Create a client transport that will communicate with our MCP server
    const transport = new StdioClientTransport({
      command: "node",
      args: ["src/mcp/mcp-server.js"]
    });

    // Create the client
    const client = new Client({
      name: "mcp-test-client",
      version: "1.0.0"
    });

    // Connect to the server
    await client.connect(transport);
    console.log("Connected to Ultra Debugger MCP server");

    // List available tools
    const tools = await client.request("tools/list", {});
    console.log("Available tools:", tools);

    // Test with our example file
    console.log("\n--- Testing debug_file tool ---");
    const debugResult = await client.request("tools/call", {
      name: "debug_file",
      arguments: {
        file_path: "test/example.js"
      }
    });
    console.log("Debug result:", debugResult);

    // Get the detailed report
    console.log("\n--- Testing get_last_debug_report tool ---");
    const reportResult = await client.request("tools/call", {
      name: "get_last_debug_report",
      arguments: {}
    });
    console.log("Debug report (first 500 chars):", reportResult.content[0].text.substring(0, 500) + "...");

    // Get fix suggestions
    console.log("\n--- Testing get_fix_suggestions tool ---");
    const suggestionsResult = await client.request("tools/call", {
      name: "get_fix_suggestions",
      arguments: {}
    });
    console.log("Fix suggestions:", suggestionsResult.content[0].text);

    // Disconnect
    await client.disconnect();
    console.log("\nDisconnected from MCP server");
  } catch (error) {
    console.error("Error testing MCP:", error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testMCP();
}

module.exports = { testMCP };