const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { CallToolRequestSchema, ListToolsRequestSchema } = require("@modelcontextprotocol/sdk/types.js");
const { ESLint } = require("eslint");
const fs = require("fs").promises;
const path = require("path");
const chokidar = require("chokidar");

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
let liveWatchers = new Map(); // Store active file watchers for live analysis

// Register the list_tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "analyze_file",
        description: "Analyze a JavaScript/TypeScript/JSX/TSX file for potential issues using ESLint and other tools",
        inputSchema: {
          type: "object",
          properties: {
            file_path: {
              type: "string",
              description: "Path to the JavaScript/TypeScript/JSX/TSX file to analyze"
            }
          },
          required: ["file_path"]
        }
      },
      {
        name: "analyze_multiple_files",
        description: "Analyze multiple JavaScript/TypeScript/JSX/TSX files for potential issues",
        inputSchema: {
          type: "object",
          properties: {
            file_paths: {
              type: "array",
              items: { type: "string" },
              description: "Array of paths to JavaScript/TypeScript/JSX/TSX files to analyze"
            }
          },
          required: ["file_paths"]
        }
      },
      {
        name: "watch_file",
        description: "Start live analysis of a file or directory, providing real-time feedback on code changes",
        inputSchema: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description: "Path to the file or directory to watch"
            },
            watch_id: {
              type: "string",
              description: "Unique identifier for this watch session"
            }
          },
          required: ["path", "watch_id"]
        }
      },
      {
        name: "unwatch_file",
        description: "Stop live analysis of a previously watched file or directory",
        inputSchema: {
          type: "object",
          properties: {
            watch_id: {
              type: "string",
              description: "Unique identifier for the watch session to stop"
            }
          },
          required: ["watch_id"]
        }
      },
      {
        name: "list_watch_sessions",
        description: "List all active watch sessions",
        inputSchema: {
          type: "object",
          properties: {}
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
      case "analyze_file": {
        if (!args.file_path) {
          throw new Error("file_path is required");
        }

        lastAnalysisResult = await analyzeFile(args.file_path);
        
        return {
          content: [{
            type: "text",
            text: `Analysis completed for ${args.file_path}. Found ${lastAnalysisResult.errorCount} errors and ${lastAnalysisResult.warningCount} warnings.`
          }]
        };
      }

      case "analyze_multiple_files": {
        if (!args.file_paths || !Array.isArray(args.file_paths)) {
          throw new Error("file_paths array is required");
        }

        lastAnalysisResult = await analyzeMultipleFiles(args.file_paths);
        
        return {
          content: [{
            type: "text",
            text: `Multi-file analysis completed for ${args.file_paths.length} files. Total errors: ${lastAnalysisResult.totalErrors}, Total warnings: ${lastAnalysisResult.totalWarnings}.`
          }]
        };
      }

      case "watch_file": {
        if (!args.path) {
          throw new Error("path is required");
        }
        
        if (!args.watch_id) {
          throw new Error("watch_id is required");
        }
        
        // Check if path exists
        try {
          await fs.access(args.path);
        } catch (error) {
          throw new Error(`Path does not exist: ${args.path}`);
        }
        
        // Stop any existing watcher with the same ID
        if (liveWatchers.has(args.watch_id)) {
          liveWatchers.get(args.watch_id).close();
        }
        
        // Create a new watcher
        const watcher = chokidar.watch(args.path, {
          persistent: true,
          ignoreInitial: true,
          depth: 5 // Limit recursion depth
        });
        
        // Store the watcher
        liveWatchers.set(args.watch_id, watcher);
        
        // Set up event handlers
        watcher
          .on('add', (filePath) => {
            console.log(`[LIVE] File ${filePath} has been added`);
            // Analyze new files
            analyzeAndReport(filePath);
          })
          .on('change', (filePath) => {
            console.log(`[LIVE] File ${filePath} has been changed`);
            // Re-analyze changed files
            analyzeAndReport(filePath);
          })
          .on('unlink', (filePath) => {
            console.log(`[LIVE] File ${filePath} has been removed`);
          })
          .on('error', (error) => {
            console.error(`[LIVE] Watcher error for ${args.watch_id}:`, error);
          });
        
        return {
          content: [{
            type: "text",
            text: `Started live analysis for ${args.path} with watch ID: ${args.watch_id}`
          }]
        };
      }

      case "unwatch_file": {
        if (!args.watch_id) {
          throw new Error("watch_id is required");
        }
        
        if (liveWatchers.has(args.watch_id)) {
          liveWatchers.get(args.watch_id).close();
          liveWatchers.delete(args.watch_id);
          return {
            content: [{
              type: "text",
              text: `Stopped live analysis for watch ID: ${args.watch_id}`
            }]
          };
        } else {
          throw new Error(`No active watch session found with ID: ${args.watch_id}`);
        }
      }

      case "list_watch_sessions": {
        const sessions = Array.from(liveWatchers.keys());
        return {
          content: [{
            type: "text",
            text: `Active watch sessions: ${sessions.length}\n${sessions.map(id => `- ${id}`).join('\n')}`
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

// Analyze a single file (JavaScript/TypeScript/JSX/TSX)
async function analyzeFile(filePath) {
  try {
    // Check if file exists
    await fs.access(filePath);
    
    // Determine file type
    const extension = path.extname(filePath).toLowerCase();
    const isTypeScript = extension === '.ts' || extension === '.tsx';
    const isReact = extension === '.jsx' || extension === '.tsx';
    
    // Try to use ESLint for analysis
    let results;
    let errorCount = 0;
    let warningCount = 0;
    
    try {
      // Configure ESLint based on file type
      const eslintConfig = {
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
      };
      
      // Add TypeScript support if needed
      if (isTypeScript) {
        eslintConfig.overrideConfig.parser = "@typescript-eslint/parser";
        eslintConfig.overrideConfig.plugins = ["@typescript-eslint"];
        eslintConfig.overrideConfig.extends = ["plugin:@typescript-eslint/recommended"];
        // Add TypeScript-specific rules
        eslintConfig.overrideConfig.rules = {
          ...eslintConfig.overrideConfig.rules,
          "@typescript-eslint/no-unused-vars": "warn",
          "@typescript-eslint/no-explicit-any": "warn"
        };
      }
      
      // Add React/JSX support if needed
      if (isReact) {
        if (!eslintConfig.overrideConfig.plugins) {
          eslintConfig.overrideConfig.plugins = [];
        }
        eslintConfig.overrideConfig.plugins.push("react");
        eslintConfig.overrideConfig.settings = {
          react: {
            version: "detect"
          }
        };
        // Add React-specific rules
        eslintConfig.overrideConfig.rules = {
          ...eslintConfig.overrideConfig.rules,
          "react/react-in-jsx-scope": "off", // Not needed in React 17+
          "react/prop-types": "off" // We're using TypeScript instead
        };
      }
      
      const eslint = new ESLint(eslintConfig);
      results = await eslint.lintFiles(filePath);
      errorCount = results.reduce((sum, r) => sum + r.errorCount, 0);
      warningCount = results.reduce((sum, r) => sum + r.warningCount, 0);
    } catch (eslintError) {
      // Fallback to basic analysis if ESLint fails
      console.warn("ESLint analysis failed, using basic analysis:", eslintError.message);
      results = await basicAnalysis(filePath);
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

// Analyze file and report results (for live analysis)
async function analyzeAndReport(filePath) {
  try {
    // Only analyze supported file types
    const extension = path.extname(filePath).toLowerCase();
    const supportedExtensions = ['.js', '.jsx', '.ts', '.tsx'];
    
    if (!supportedExtensions.includes(extension)) {
      return;
    }
    
    const result = await analyzeFile(filePath);
    
    // Report only if there are issues
    if (result.errorCount > 0 || result.warningCount > 0) {
      console.log(`[LIVE ANALYSIS] ${filePath}: ${result.errorCount} errors, ${result.warningCount} warnings`);
      
      // Show first few issues
      if (result.results && result.results.length > 0) {
        const messages = result.results[0].messages || [];
        messages.slice(0, 3).forEach(msg => {
          const severity = msg.severity === 1 ? "WARN" : "ERROR";
          console.log(`  ${severity} ${msg.ruleId || 'N/A'}: ${msg.message} (line ${msg.line})`);
        });
        
        if (messages.length > 3) {
          console.log(`  ... and ${messages.length - 3} more issues`);
        }
      }
    } else {
      console.log(`[LIVE ANALYSIS] ${filePath}: No issues found`);
    }
  } catch (error) {
    console.error(`[LIVE ANALYSIS] Error analyzing ${filePath}:`, error.message);
  }
}

// Basic analysis as fallback
async function basicAnalysis(filePath) {
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
    
    // Check for common TypeScript/React patterns
    const extension = path.extname(filePath).toLowerCase();
    if (extension === '.ts' || extension === '.tsx') {
      // Check for explicit any usage
      if (line.includes(': any')) {
        messages.push({
          ruleId: "@typescript-eslint/no-explicit-any",
          severity: 1, // warning
          message: "Unexpected any. Specify a different type.",
          line: index + 1,
          column: line.indexOf(': any') + 1
        });
        warningCount++;
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

// Analyze multiple files
async function analyzeMultipleFiles(filePaths) {
  const results = [];
  let totalErrors = 0;
  let totalWarnings = 0;

  for (const filePath of filePaths) {
    try {
      const result = await analyzeFile(filePath);
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
    "no-dupe-keys": "Rename the duplicate object keys to be unique",
    "@typescript-eslint/no-unused-vars": "Remove the unused variable or use it in your code, or prefix with an underscore",
    "@typescript-eslint/no-explicit-any": "Specify a more specific type instead of 'any'",
    "react/react-in-jsx-scope": "Import React or use the new JSX transform",
    "react/prop-types": "Use TypeScript interfaces for prop typing instead"
  };

  return suggestions[ruleId] || "Review the code and fix according to the error message";
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down Ultra Debugger MCP server...");
  // Close all active watchers
  for (const [id, watcher] of liveWatchers) {
    watcher.close();
  }
  liveWatchers.clear();
  process.exit(0);
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log("Ultra Debugger MCP Server running on stdio");
  console.log("Ready to analyze JavaScript/TypeScript/JSX/TSX files for potential issues");
  console.log("Supports live analysis with file watching capabilities");
}

// Run the server if this file is executed directly
if (require.main === module) {
  runServer().catch(console.error);
}

module.exports = { server, runServer, analyzeFile, analyzeMultipleFiles };