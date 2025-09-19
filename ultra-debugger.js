#!/usr/bin/env node

/**
 * Ultra Debugger CLI Entry Point
 */

const DebugController = require('./src/middleware/debugController.js');
const fs = require('fs');

// Check if the script is being run directly
if (require.main === module) {
  const args = process.argv.slice(2);
  
  // Display help if requested or no arguments provided
  if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
    console.log(`
Ultra Debugger - Automated debugging tool for AI-generated software

Usage:
  node ultra-debugger.js <file_path> [options]
  
Options:
  -h, --help              Display this help message
  -o, --output <dir>      Output directory for reports and fixed code (default: current directory)
  -r, --report <name>     Report filename (default: debug-report.json)
  -f, --fixed <name>     Fixed code filename (default: fixed-code.js)
  -m, --multiple          Debug multiple files (provide multiple file paths)
  --no-report             Don't save the debug report
  --no-fixed              Don't save the fixed code

Examples:
  node ultra-debugger.js app.js
  node ultra-debugger.js buggy-code.js -o ./results
  node ultra-debugger.js file1.js file2.js file3.js -m
  node ultra-debugger.js app.js --no-fixed
    `);
    process.exit(0);
  }
  
  // Parse arguments
  const options = {
    outputDir: '.',
    reportName: 'debug-report.json',
    fixedName: 'fixed-code.js',
    multiple: false,
    saveReport: true,
    saveFixedCode: true
  };
  
  const filePaths = [];
  let i = 0;
  
  while (i < args.length) {
    const arg = args[i];
    
    if (arg === '-o' || arg === '--output') {
      options.outputDir = args[i + 1];
      i += 2;
    } else if (arg === '-r' || arg === '--report') {
      options.reportName = args[i + 1];
      i += 2;
    } else if (arg === '-f' || arg === '--fixed') {
      options.fixedName = args[i + 1];
      i += 2;
    } else if (arg === '-m' || arg === '--multiple') {
      options.multiple = true;
      i += 1;
    } else if (arg === '--no-report') {
      options.saveReport = false;
      i += 1;
    } else if (arg === '--no-fixed') {
      options.saveFixedCode = false;
      i += 1;
    } else if (!arg.startsWith('-')) {
      filePaths.push(arg);
      i += 1;
    } else {
      console.error(`Unknown option: ${arg}`);
      process.exit(1);
    }
  }
  
  // Validate file paths
  if (filePaths.length === 0) {
    console.error('Error: No file path provided');
    process.exit(1);
  }
  
  // Check if files exist
  for (const filePath of filePaths) {
    if (!fs.existsSync(filePath)) {
      console.error(`Error: File not found - ${filePath}`);
      process.exit(1);
    }
  }
  
  // Ensure output directory exists
  if (options.outputDir !== '.' && !fs.existsSync(options.outputDir)) {
    fs.mkdirSync(options.outputDir, { recursive: true });
  }
  
  // Construct full output paths
  const reportPath = `${options.outputDir}/${options.reportName}`;
  const fixedCodePath = `${options.outputDir}/${options.fixedName}`;
  
  // Create controller with options
  const controller = new DebugController({
    saveReport: options.saveReport,
    saveFixedCode: options.saveFixedCode,
    outputDir: options.outputDir
  });
  
  // Run debugging
  if (options.multiple || filePaths.length > 1) {
    console.log(`Debugging ${filePaths.length} files...`);
    controller.debugMultiple(filePaths)
      .then((results) => {
        console.log('Multi-file debugging completed successfully!');
        if (options.saveReport) {
          console.log(`Report saved to ${options.outputDir}/multi-file-debug-report.json`);
        }
      })
      .catch(error => {
        console.error('Debugging failed:', error);
        process.exit(1);
      });
  } else {
    console.log(`Debugging ${filePaths[0]}...`);
    controller.debug(filePaths[0])
      .then(() => {
        console.log('Debugging completed successfully!');
        if (options.saveReport) {
          console.log(`Report saved to ${reportPath}`);
        }
        if (options.saveFixedCode) {
          console.log(`Fixed code saved to ${fixedCodePath}`);
        }
      })
      .catch(error => {
        console.error('Debugging failed:', error);
        process.exit(1);
      });
  }
}

module.exports = require('./src/middleware/debugController.js');