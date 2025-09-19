/**
 * Ultra Debugger - Debug Controller
 * Middleware that controls and orchestrates the entire debugging process
 */

const CodeAnalyzer = require('../scripts/codeAnalyzer.js');
const RuntimeDebugger = require('../scripts/runtimeDebugger.js');
const AutoFixer = require('../scripts/autoFixer.js');
const fs = require('fs').promises;
const path = require('path');

class DebugController {
  constructor(options = {}) {
    this.analyzer = new CodeAnalyzer();
    this.runtimeDebugger = new RuntimeDebugger();
    this.autoFixer = new AutoFixer();
    this.debugReport = {};
    this.options = {
      saveReport: options.saveReport !== false,
      saveFixedCode: options.saveFixedCode !== false,
      outputDir: options.outputDir || '.',
      ...options
    };
  }

  /**
   * Main method to debug AI-generated software
   * @param {string} filePath - Path to the file to debug
   * @returns {Object} Complete debug report
   */
  async debug(filePath) {
    try {
      console.log(`ULTRA-DEBUGGER: Starting debug process for ${filePath}`);
      
      // Read the source code
      const sourceCode = await fs.readFile(filePath, 'utf8');
      const fileName = path.basename(filePath);
      
      // Step 1: Static code analysis
      console.log('ULTRA-DEBUGGER: Running static code analysis...');
      const analysis = this.analyzer.analyze(sourceCode, fileName);
      
      // Step 2: Runtime debugging
      console.log('ULTRA-DEBUGGER: Running runtime debugging...');
      const runtimeResults = await this.runtimeDebugger.debug(sourceCode, fileName);
      
      // Step 3: Apply automatic fixes
      console.log('ULTRA-DEBUGGER: Applying automatic fixes...');
      const fixResults = this.autoFixer.fix(
        sourceCode, 
        analysis.issues, 
        analysis.warnings
      );
      
      // Compile the complete debug report
      this.debugReport = {
        fileName,
        filePath,
        analysis,
        runtimeResults,
        fixResults,
        summary: this._generateSummary(analysis, runtimeResults, fixResults),
        timestamp: new Date().toISOString()
      };
      
      // Save results if requested
      if (this.options.saveReport) {
        await this.saveReport(path.join(this.options.outputDir, 'debug-report.json'));
      }
      
      if (this.options.saveFixedCode) {
        await this.saveFixedCode(path.join(this.options.outputDir, 'fixed-code.js'));
      }
      
      console.log('ULTRA-DEBUGGER: Debug process completed successfully');
      return this.debugReport;
      
    } catch (error) {
      console.error('ULTRA-DEBUGGER: Error during debug process:', error);
      throw error;
    }
  }

  /**
   * Debug multiple files
   * @param {Array} filePaths - Array of file paths to debug
   * @returns {Object} Combined debug report
   */
  async debugMultiple(filePaths) {
    const results = [];
    
    console.log(`ULTRA-DEBUGGER: Starting debug process for ${filePaths.length} files`);
    
    for (const filePath of filePaths) {
      try {
        const result = await this.debug(filePath);
        results.push(result);
      } catch (error) {
        results.push({
          filePath,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    const multiFileReport = {
      files: results,
      summary: this._generateMultiFileSummary(results),
      timestamp: new Date().toISOString()
    };
    
    // Save multi-file report if requested
    if (this.options.saveReport) {
      await fs.writeFile(
        path.join(this.options.outputDir, 'multi-file-debug-report.json'), 
        JSON.stringify(multiFileReport, null, 2), 
        'utf8'
      );
      console.log(`ULTRA-DEBUGGER: Multi-file report saved to ${path.join(this.options.outputDir, 'multi-file-debug-report.json')}`);
    }
    
    return multiFileReport;
  }

  /**
   * Save the debug report to a file
   * @param {string} outputPath - Path where to save the report
   */
  async saveReport(outputPath) {
    if (!this.debugReport) {
      throw new Error('No debug report available. Run debug() first.');
    }
    
    const reportJson = JSON.stringify(this.debugReport, null, 2);
    await fs.writeFile(outputPath, reportJson, 'utf8');
    console.log(`ULTRA-DEBUGGER: Report saved to ${outputPath}`);
  }

  /**
   * Save the fixed code to a file
   * @param {string} outputPath - Path where to save the fixed code
   */
  async saveFixedCode(outputPath) {
    if (!this.debugReport || !this.debugReport.fixResults) {
      throw new Error('No fixed code available. Run debug() first.');
    }
    
    await fs.writeFile(outputPath, this.debugReport.fixResults.fixedCode, 'utf8');
    console.log(`ULTRA-DEBUGGER: Fixed code saved to ${outputPath}`);
  }

  _generateSummary(analysis, runtimeResults, fixResults) {
    return {
      totalIssues: analysis.issues.length,
      totalWarnings: analysis.warnings.length,
      executionErrors: runtimeResults.executionErrors.length,
      fixesApplied: fixResults.fixesApplied.length,
      suggestions: fixResults.suggestions.length,
      codeHealth: this._calculateCodeHealth(analysis, runtimeResults),
      details: {
        issuesByType: this._groupByType(analysis.issues),
        warningsByType: this._groupByType(analysis.warnings),
        fixesByType: this._groupByType(fixResults.fixesApplied)
      }
    };
  }

  _generateMultiFileSummary(results) {
    const successful = results.filter(r => !r.error);
    const failed = results.filter(r => r.error);
    
    // Aggregate statistics
    const totalIssues = successful.reduce((sum, r) => sum + r.analysis.issues.length, 0);
    const totalWarnings = successful.reduce((sum, r) => sum + r.analysis.warnings.length, 0);
    const totalExecutionErrors = successful.reduce((sum, r) => sum + r.runtimeResults.executionErrors.length, 0);
    const totalFixes = successful.reduce((sum, r) => sum + r.fixResults.fixesApplied.length, 0);
    
    return {
      totalFiles: results.length,
      successful: successful.length,
      failed: failed.length,
      totalIssues,
      totalWarnings,
      totalExecutionErrors,
      totalFixes,
      codeHealth: successful.length > 0 ? 
        Math.round(successful.reduce((sum, r) => sum + r.summary.codeHealth, 0) / successful.length) : 0
    };
  }

  _calculateCodeHealth(analysis, runtimeResults) {
    // More sophisticated heuristic to calculate code health
    const issuesScore = Math.max(0, 100 - analysis.issues.length * 10);
    const warningsScore = Math.max(0, 100 - analysis.warnings.length * 5);
    const executionScore = Math.max(0, 100 - runtimeResults.executionErrors.length * 20);
    
    return Math.round((issuesScore + warningsScore + executionScore) / 3);
  }
  
  _groupByType(items) {
    const grouped = {};
    items.forEach(item => {
      const type = item.type || 'unknown';
      if (!grouped[type]) {
        grouped[type] = 0;
      }
      grouped[type]++;
    });
    return grouped;
  }
}

// CLI interface
if (require.main === module) {
  const controller = new DebugController();
  
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.log('Usage: node debugController.js <file_path> [output_report_path] [output_fixed_code_path]');
    process.exit(1);
  }
  
  const filePath = args[0];
  const reportPath = args[1] || './debug-report.json';
  const fixedCodePath = args[2] || './fixed-code.js';
  
  controller.debug(filePath)
    .then(async () => {
      await controller.saveReport(reportPath);
      await controller.saveFixedCode(fixedCodePath);
      console.log('ULTRA-DEBUGGER: All tasks completed successfully');
    })
    .catch(error => {
      console.error('ULTRA-DEBUGGER: Error:', error);
      process.exit(1);
    });
}

module.exports = DebugController;