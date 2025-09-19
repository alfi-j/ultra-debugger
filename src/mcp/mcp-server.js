const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { CallToolRequestSchema, ListToolsRequestSchema, ReadFileRequestSchema } = require("@modelcontextprotocol/sdk/types.js");
const DebugController = require("../middleware/debugController.js");
const z = require("zod");

// Create the MCP server
const server = new Server(
  { name: "ultra-debugger", version: "1.0.0" },
  {
    capabilities: {
      tools: {},
      resources: {}
    }
  }
);

// Initialize the debug controller
const debugController = new DebugController({ saveReport: false, saveFixedCode: false });

// Store debug results
let lastDebugResult = null;

// Register the list_tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "debug_file",
        description: "Debug an AI-generated JavaScript file for potential issues",
        inputSchema: {
          type: "object",
          properties: {
            file_path: {
              type: "string",
              description: "Path to the JavaScript file to debug"
            }
          },
          required: ["file_path"]
        }
      },
      {
        name: "debug_multiple_files",
        description: "Debug multiple AI-generated JavaScript files for potential issues",
        inputSchema: {
          type: "object",
          properties: {
            file_paths: {
              type: "array",
              items: { type: "string" },
              description: "Array of paths to JavaScript files to debug"
            }
          },
          required: ["file_paths"]
        }
      },
      {
        name: "get_last_debug_report",
        description: "Get the detailed report from the last debug operation",
        inputSchema: {
          type: "object",
          properties: {}
        }
      },
      {
        name: "get_fix_suggestions",
        description: "Get suggestions for fixing issues found in the last debug operation",
        inputSchema: {
          type: "object",
          properties: {}
        }
      }
    ]
  };
});

// Register the call_tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "debug_file": {
        if (!args.file_path) {
          throw new Error("file_path is required");
        }

        lastDebugResult = await debugController.debug(args.file_path);
        
        return {
          content: [{
            type: "text",
            text: `Debug completed for ${args.file_path}. Found ${lastDebugResult.summary.totalIssues} issues and ${lastDebugResult.summary.totalWarnings} warnings. Code health: ${lastDebugResult.summary.codeHealth}%`
          }]
        };
      }

      case "debug_multiple_files": {
        if (!args.file_paths || !Array.isArray(args.file_paths)) {
          throw new Error("file_paths array is required");
        }

        lastDebugResult = await debugController.debugMultiple(args.file_paths);
        
        return {
          content: [{
            type: "text",
            text: `Multi-file debug completed for ${args.file_paths.length} files. Successful: ${lastDebugResult.summary.successful}, Failed: ${lastDebugResult.summary.failed}. Overall code health: ${lastDebugResult.summary.codeHealth}%`
          }]
        };
      }

      case "get_last_debug_report": {
        if (!lastDebugResult) {
          return {
            content: [{
              type: "text",
              text: "No debug operation has been performed yet."
            }]
          };
        }

        return {
          content: [{
            type: "text",
            text: JSON.stringify(lastDebugResult, null, 2)
          }]
        };
      }

      case "get_fix_suggestions": {
        if (!lastDebugResult) {
          return {
            content: [{
              type: "text",
              text: "No debug operation has been performed yet."
            }]
          };
        }

        if (lastDebugResult.fixResults && lastDebugResult.fixResults.suggestions) {
          return {
            content: [{
              type: "text",
              text: JSON.stringify(lastDebugResult.fixResults.suggestions, null, 2)
            }]
          };
        } else if (lastDebugResult.files) {
          // Multi-file result
          const allSuggestions = lastDebugResult.files
            .filter(file => file.fixResults && file.fixResults.suggestions)
            .flatMap(file => file.fixResults.suggestions.map(s => ({ file: file.fileName, ...s })));
          
          return {
            content: [{
              type: "text",
              text: JSON.stringify(allSuggestions, null, 2)
            }]
          };
        } else {
          return {
            content: [{
              type: "text",
              text: "No suggestions available."
            }]
          };
        }
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: `Error executing tool ${name}: ${error.message}`
      }],
      isError: true
    };
  }
});

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down MCP server...");
  process.exit(0);
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log("Ultra Debugger MCP Server running on stdio");
}

// Run the server if this file is executed directly
if (require.main === module) {
  runServer().catch(console.error);
}

module.exports = { server, runServer };