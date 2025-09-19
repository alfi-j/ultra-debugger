const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { CallToolRequestSchema, ListToolsRequestSchema } = require("@modelcontextprotocol/sdk/types.js");
const { ESLint } = require("eslint");
const fs = require("fs").promises;

// Create the MCP server
const server = new Server(
  { name: "ultra-debugger", version: "1.0.0" },
  {
    capabilities: {
      tools: {}
    }
  }
);

// Store analysis results
let lastAnalysisResult = null;

// Register the list_tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "analyze_js_file",
        description: "Analyze a JavaScript file for potential issues using ESLint",
        inputSchema: {
          type: "object",
          properties: {
            file_path: {
              type: "string",
              description: "Path to the JavaScript file to analyze"
            }
          },
          required: ["file_path"]
        }
      },
      {
        name: "analyze_multiple_js_files",
        description: "Analyze multiple JavaScript files for potential issues",
        inputSchema: {
          type: "object",
          properties: {
            file_paths: {
              type: "array",
              items: { type: "string" },
              description: "Array of paths to JavaScript files to analyze"
            }
          },
          required: ["file_paths"]
        }
      },
      {
        name: "get_analysis_report",
        description: "Get the detailed report from the last analysis operation",
        inputSchema: {
          type: "object",
          properties: {}
        }
      },
      {
        name: "get_fix_suggestions",
        description: "Get suggestions for fixing issues found in the last analysis operation",
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
      case "analyze_js_file": {
        if (!args.file_path) {
          throw new Error("file_path is required");
        }

        lastAnalysisResult = await analyzeJsFile(args.file_path);
        
        return {
          content: [{
            type: "text",
            text: `Analysis completed for ${args.file_path}. Found ${lastAnalysisResult.errorCount} errors and ${lastAnalysisResult.warningCount} warnings.`
          }]
        };
      }

      case "analyze_multiple_js_files": {
        if (!args.file_paths || !Array.isArray(args.file_paths)) {
          throw new Error("file_paths array is required");
        }

        lastAnalysisResult = await analyzeMultipleJsFiles(args.file_paths);
        
        return {
          content: [{
            type: "text",
            text: `Multi-file analysis completed for ${args.file_paths.length} files. Total errors: ${lastAnalysisResult.totalErrors}, Total warnings: ${lastAnalysisResult.totalWarnings}.`
          }]
        };
      }

      case "get_analysis_report": {
        if (!lastAnalysisResult) {
          return {
            content: [{
              type: "text",
              text: "No analysis operation has been performed yet."
            }]
          };
        }

        return {
          content: [{
            type: "text",
            text: JSON.stringify(lastAnalysisResult, null, 2)
          }]
        };
      }

      case "get_fix_suggestions": {
        if (!lastAnalysisResult) {
          return {
            content: [{
              type: "text",
              text: "No analysis operation has been performed yet."
            }]
          };
        }

        const suggestions = generateFixSuggestions(lastAnalysisResult);
        return {
          content: [{
            type: "text",
            text: JSON.stringify(suggestions, null, 2)
          }]
        };
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

// Analyze a single JavaScript file
async function analyzeJsFile(filePath) {
  try {
    // Check if file exists
    await fs.access(filePath);
    
    // Try to use ESLint for analysis
    let results;
    let errorCount = 0;
    let warningCount = 0;
    
    try {
      const eslint = new ESLint({
        overrideConfig: {
          env: {
            es2022: true,
            node: true,
            browser: true
          },
          rules: {
            "no-undef": "error",
            "no-unused-vars": "warn",
            "no-unreachable": "error",
            "no-debugger": "warn",
            "no-dupe-keys": "error"
          }
        }
      });

      results = await eslint.lintFiles(filePath);
      errorCount = results.reduce((sum, r) => sum + r.errorCount, 0);
      warningCount = results.reduce((sum, r) => sum + r.warningCount, 0);
    } catch (eslintError) {
      // Fallback to basic analysis if ESLint fails
      console.warn("ESLint analysis failed, using basic analysis:", eslintError.message);
      results = await basicJsAnalysis(filePath);
      errorCount = results.reduce((sum, r) => sum + r.errorCount, 0);
      warningCount = results.reduce((sum, r) => sum + r.warningCount, 0);
    }
    
    return {
      filePath,
      errorCount,
      warningCount,
      results,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    throw new Error(`Failed to analyze file ${filePath}: ${error.message}`);
  }
}

// Basic JavaScript analysis as fallback
async function basicJsAnalysis(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  
  const messages = [];
  let errorCount = 0;
  let warningCount = 0;
  
  // Simple pattern matching for common issues
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    // Check for debugger statements
    if (line.includes('debugger;')) {
      messages.push({
        ruleId: "no-debugger",
        severity: 1, // warning
        message: "Unexpected 'debugger' statement.",
        line: index + 1,
        column: line.indexOf('debugger') + 1
      });
      warningCount++;
    }
    
    // Check for unreachable code after return
    if (line.trim().startsWith('return') && index < lines.length - 1) {
      const nextLine = lines[index + 1].trim();
      if (nextLine && !nextLine.startsWith('}')) {
        messages.push({
          ruleId: "no-unreachable",
          severity: 2, // error
          message: "Unreachable code.",
          line: index + 2,
          column: 1
        });
        errorCount++;
      }
    }
  });
  
  return [{
    filePath,
    messages,
    errorCount,
    warningCount
  }];
}

// Analyze multiple JavaScript files
async function analyzeMultipleJsFiles(filePaths) {
  const results = [];
  let totalErrors = 0;
  let totalWarnings = 0;

  for (const filePath of filePaths) {
    try {
      const result = await analyzeJsFile(filePath);
      results.push(result);
      totalErrors += result.errorCount;
      totalWarnings += result.warningCount;
    } catch (error) {
      results.push({
        filePath,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  return {
    files: results,
    totalErrors,
    totalWarnings,
    timestamp: new Date().toISOString()
  };
}

// Generate fix suggestions based on analysis results
function generateFixSuggestions(analysisResult) {
  const suggestions = [];

  if (analysisResult.results) {
    // Single file analysis
    analysisResult.results.forEach(result => {
      if (result.messages) {
        result.messages.forEach(message => {
          suggestions.push({
            filePath: result.filePath,
            line: message.line,
            column: message.column,
            ruleId: message.ruleId,
            severity: message.severity === 1 ? "warning" : "error",
            message: message.message,
            suggestion: getFixSuggestion(message.ruleId, message.message)
          });
        });
      }
    });
  } else if (analysisResult.files) {
    // Multiple file analysis
    analysisResult.files.forEach(file => {
      if (file.results) {
        file.results.forEach(result => {
          if (result.messages) {
            result.messages.forEach(message => {
              suggestions.push({
                filePath: result.filePath,
                line: message.line,
                column: message.column,
                ruleId: message.ruleId,
                severity: message.severity === 1 ? "warning" : "error",
                message: message.message,
                suggestion: getFixSuggestion(message.ruleId, message.message)
              });
            });
          }
        });
      }
    });
  }

  return suggestions;
}

// Get specific fix suggestions based on rule IDs
function getFixSuggestion(ruleId, message) {
  const suggestions = {
    "no-undef": "Declare the variable or check if it exists before using it",
    "no-unused-vars": "Remove the unused variable or use it in your code",
    "no-unreachable": "Remove the unreachable code or restructure your logic",
    "no-debugger": "Remove the debugger statement before deploying to production",
    "no-dupe-keys": "Rename the duplicate object keys to be unique"
  };

  return suggestions[ruleId] || "Review the code and fix according to the error message";
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down Ultra Debugger MCP server...");
  process.exit(0);
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log("Ultra Debugger MCP Server running on stdio");
  console.log("Ready to analyze JavaScript files for potential issues");
}

// Run the server if this file is executed directly
if (require.main === module) {
  runServer().catch(console.error);
}

module.exports = { server, runServer, analyzeJsFile, analyzeMultipleJsFiles };