/**
 * Ultra Debugger - Code Analyzer
 * Analyzes AI-generated code for potential bugs and issues
 */

class CodeAnalyzer {
  constructor() {
    this.issues = [];
    this.warnings = [];
  }

  /**
   * Analyze source code for common issues
   * @param {string} sourceCode - The code to analyze
   * @param {string} fileName - Name of the file being analyzed
   * @returns {Object} Analysis results
   */
  analyze(sourceCode, fileName) {
    this.issues = [];
    this.warnings = [];
    
    // Check for common AI-generated code issues
    this._checkUndefinedVariables(sourceCode);
    this._checkUnreachableCode(sourceCode);
    this._checkInfiniteLoops(sourceCode);
    this._checkResourceLeaks(sourceCode);
    this._checkErrorHandling(sourceCode);
    this._checkArrayIndexAccess(sourceCode);
    this._checkFunctionComplexity(sourceCode);
    
    return {
      fileName,
      issues: this.issues,
      warnings: this.warnings,
      timestamp: new Date().toISOString()
    };
  }

  _checkUndefinedVariables(code) {
    // Look for potentially undefined variables
    const varPattern = /\b(let|const|var)\s+(\w+)\b/g;
    const usagePattern = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\b/g;
    
    const declarations = new Set();
    const usages = [];
    
    // Find all variable declarations
    let match;
    while ((match = varPattern.exec(code)) !== null) {
      declarations.add(match[2]);
    }
    
    // Find all variable usages
    while ((match = usagePattern.exec(code)) !== null) {
      if (!declarations.has(match[1]) && 
          !['if', 'for', 'while', 'function', 'return', 'console', 'log', 'true', 'false', 'null', 'undefined', 'this', 'typeof', 'instanceof'].includes(match[1])) {
        usages.push({name: match[1], index: match.index});
      }
    }
    
    // Report potential undefined variables
    usages.forEach(usage => {
      this.warnings.push({
        type: 'potential_undefined_variable',
        variable: usage.name,
        position: usage.index,
        message: `Variable '${usage.name}' might be undefined`
      });
    });
  }

  _checkUnreachableCode(code) {
    // Look for code after return/throw statements
    const unreachablePatterns = [
      /return\s*;?\s*\n\s*(.+?)(?=\n\s*[}])/gs,
      /throw\s+.+?;?\s*\n\s*(.+?)(?=\n\s*[}])/gs
    ];
    
    unreachablePatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(code)) !== null) {
        if (match[1].trim()) {
          this.issues.push({
            type: 'unreachable_code',
            code: match[1].substring(0, 50) + '...',
            position: match.index,
            message: 'Unreachable code detected'
          });
        }
      }
    });
  }

  _checkInfiniteLoops(code) {
    // Look for potentially infinite loops
    const loopPatterns = [
      /for\s*\(\s*;\s*;\s*\)/g,  // for(;;)
      /while\s*\(\s*true\s*\)/g  // while(true)
    ];
    
    loopPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(code)) !== null) {
        this.warnings.push({
          type: 'potential_infinite_loop',
          position: match.index,
          message: 'Potentially infinite loop detected'
        });
      }
    });
  }

  _checkResourceLeaks(code) {
    // Look for potential resource leaks
    const eventListenerPattern = /addEventListener\s*\(\s*['"](\w+)['"]\s*,\s*(\w+)\s*\)/g;
    const xhrPattern = /new\s+XMLHttpRequest\s*\(\s*\)/g;
    const intervalPattern = /(setInterval|setTimeout)\s*\(/g;
    
    let match;
    while ((match = eventListenerPattern.exec(code)) !== null) {
      this.warnings.push({
        type: 'potential_event_listener_leak',
        event: match[1],
        handler: match[2],
        position: match.index,
        message: `Event listener '${match[1]}' may cause memory leaks if not properly removed`
      });
    }
    
    while ((match = xhrPattern.exec(code)) !== null) {
      this.warnings.push({
        type: 'potential_resource_leak',
        resource: 'XMLHttpRequest',
        position: match.index,
        message: 'XMLHttpRequest may cause resource leaks if not properly handled'
      });
    }
    
    while ((match = intervalPattern.exec(code)) !== null) {
      this.warnings.push({
        type: 'potential_timer_leak',
        timer: match[1],
        position: match.index,
        message: `${match[1]} may cause resource leaks if not properly cleared`
      });
    }
  }

  _checkErrorHandling(code) {
    // Look for functions without error handling
    const asyncPatterns = [
      /fetch\s*\(/g,
      /new\s+Promise\s*\(/g,
      /\basync\b/g
    ];
    
    let hasAsync = false;
    for (const pattern of asyncPatterns) {
      if (pattern.test(code)) {
        hasAsync = true;
        break;
      }
    }
    
    const hasCatch = /catch\s*\(/g.test(code);
    const hasTryCatch = /try\s*{[\s\S]*?}\s*catch\s*\(/g.test(code);
    
    if (hasAsync && !hasCatch && !hasTryCatch) {
      this.warnings.push({
        type: 'missing_error_handling',
        message: 'Asynchronous code detected without error handling'
      });
    }
  }

  _checkArrayIndexAccess(code) {
    // Look for potential array index out of bounds
    const arrayAccessPattern = /(\w+)\[(.+?)\]/g;
    
    let match;
    while ((match = arrayAccessPattern.exec(code)) !== null) {
      const arrayName = match[1];
      const index = match[2];
      
      // Check if accessing with a variable that might be out of bounds
      if (!/^\d+$/.test(index)) {
        this.warnings.push({
          type: 'potential_array_index_oob',
          array: arrayName,
          index: index,
          position: match.index,
          message: `Potential array index out of bounds for ${arrayName}[${index}]`
        });
      }
    }
  }

  _checkFunctionComplexity(code) {
    // Check for overly complex functions
    const functionPattern = /function\s+(\w+)\s*\([^)]*\)\s*{([^}]+)}/g;
    
    let match;
    while ((match = functionPattern.exec(code)) !== null) {
      const functionName = match[1];
      const functionBody = match[2];
      
      // Count lines in function body
      const lineCount = functionBody.split('\n').length;
      
      if (lineCount > 50) {
        this.warnings.push({
          type: 'function_complexity',
          function: functionName,
          lines: lineCount,
          position: match.index,
          message: `Function ${functionName} is overly complex with ${lineCount} lines`
        });
      }
    }
  }
}

module.exports = CodeAnalyzer;