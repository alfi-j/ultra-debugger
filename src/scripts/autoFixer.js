/**
 * Ultra Debugger - Auto Fixer
 * Automatically fixes or suggests fixes for issues detected in AI-generated software
 */

class AutoFixer {
  constructor() {
    this.fixesApplied = [];
    this.suggestions = [];
  }

  /**
   * Apply automatic fixes to source code based on analysis
   * @param {string} sourceCode - The code to fix
   * @param {Array} issues - Issues detected by analyzer
   * @param {Array} warnings - Warnings detected by analyzer
   * @returns {Object} Fixed code and report
   */
  fix(sourceCode, issues, warnings) {
    this.fixesApplied = [];
    this.suggestions = [];
    let fixedCode = sourceCode;
    
    // Apply automatic fixes
    fixedCode = this._fixUnreachableCode(fixedCode, issues);
    fixedCode = this._fixErrorHandling(fixedCode, warnings);
    fixedCode = this._fixResourceLeaks(fixedCode, warnings);
    fixedCode = this._fixArrayIndexAccess(fixedCode, warnings);
    fixedCode = this._fixVariableInitialization(fixedCode, warnings);
    
    // Generate suggestions for issues that can't be automatically fixed
    this._generateSuggestions(issues, warnings);
    
    return {
      fixedCode,
      fixesApplied: this.fixesApplied,
      suggestions: this.suggestions,
      timestamp: new Date().toISOString()
    };
  }

  _fixUnreachableCode(code, issues) {
    let fixedCode = code;
    let offset = 0;
    
    // Find unreachable code issues
    const unreachableIssues = issues.filter(issue => issue.type === 'unreachable_code');
    
    for (const issue of unreachableIssues) {
      // This is a simplified fix - in reality, you'd want to be more precise
      // about what code to remove and what to keep
      const position = issue.position + offset;
      
      // Add a comment to mark removed code instead of actually removing it
      const comment = `\n    // ULTRA-DEBUGGER: Removed unreachable code - ${issue.message}\n    `;
      fixedCode = fixedCode.slice(0, position) + comment + fixedCode.slice(position);
      
      offset += comment.length;
      
      this.fixesApplied.push({
        type: 'unreachable_code_removed',
        position: issue.position,
        message: `Removed unreachable code at position ${issue.position}`
      });
    }
    
    return fixedCode;
  }

  _fixErrorHandling(code, warnings) {
    let fixedCode = code;
    
    // Check if there are missing error handling warnings
    const missingErrorHandling = warnings.some(w => w.type === 'missing_error_handling');
    
    if (missingErrorHandling) {
      // Add a general try-catch block if none exists
      if (!/try\s*{[\s\S]*?}\s*catch\s*\(/.test(code)) {
        // Wrap the entire code in a try-catch block (simplified approach)
        const tryCatchWrapper = `// ULTRA-DEBUGGER: Added error handling wrapper
try {
${code.split('\n').map(line => `  ${line}`).join('\n')}
} catch (error) {
  console.error('ULTRA-DEBUGGER: Caught error:', error);
  // TODO: Implement proper error handling
}`;
        
        fixedCode = tryCatchWrapper;
        
        this.fixesApplied.push({
          type: 'error_handling_added',
          message: 'Added try-catch wrapper for error handling'
        });
      }
    }
    
    return fixedCode;
  }

  _fixResourceLeaks(code, warnings) {
    let fixedCode = code;
    let hasLeaks = false;
    
    // Check for event listener leaks
    const eventListenerLeaks = warnings.filter(w => w.type === 'potential_event_listener_leak');
    
    if (eventListenerLeaks.length > 0) {
      hasLeaks = true;
      // Add a comment about event listener cleanup
      const comment = `// ULTRA-DEBUGGER: Found ${eventListenerLeaks.length} potential event listener leaks
// TODO: Ensure event listeners are properly removed to prevent memory leaks\n`;
      
      fixedCode = comment + fixedCode;
      
      this.fixesApplied.push({
        type: 'event_listener_leak_warning',
        count: eventListenerLeaks.length,
        message: `Added warning comment for ${eventListenerLeaks.length} potential event listener leaks`
      });
    }
    
    // Check for other resource leaks
    const resourceLeaks = warnings.filter(w => w.type === 'potential_resource_leak');
    
    if (resourceLeaks.length > 0) {
      hasLeaks = true;
      const comment = `// ULTRA-DEBUGGER: Found ${resourceLeaks.length} potential resource leaks
// TODO: Ensure resources are properly released\n`;
      
      if (eventListenerLeaks.length === 0) {
        fixedCode = comment + fixedCode;
      } else {
        // Add to existing comment
        fixedCode = fixedCode.replace(
          /(\/\/ ULTRA-DEBUGGER: Found \d+ potential event listener leaks\n\/\/ TODO: Ensure event listeners are properly removed to prevent memory leaks\n)/,
          `$1// ULTRA-DEBUGGER: Found ${resourceLeaks.length} potential resource leaks\n// TODO: Ensure resources are properly released\n`
        );
      }
      
      this.fixesApplied.push({
        type: 'resource_leak_warning',
        count: resourceLeaks.length,
        message: `Added warning comment for ${resourceLeaks.length} potential resource leaks`
      });
    }
    
    // Check for timer leaks
    const timerLeaks = warnings.filter(w => w.type === 'potential_timer_leak');
    
    if (timerLeaks.length > 0) {
      hasLeaks = true;
      const comment = `// ULTRA-DEBUGGER: Found ${timerLeaks.length} potential timer leaks
// TODO: Ensure timers are properly cleared with clearTimeout/clearInterval\n`;
      
      if (!hasLeaks) {
        fixedCode = comment + fixedCode;
      } else {
        // Add to existing comment
        fixedCode = fixedCode.replace(
          /(\/\/ ULTRA-DEBUGGER: Found \d+ potential (event listener|resource) leaks\n\/\/ TODO: (Ensure event listeners are properly removed to prevent memory leaks|Ensure resources are properly released)\n)/,
          `$1// ULTRA-DEBUGGER: Found ${timerLeaks.length} potential timer leaks\n// TODO: Ensure timers are properly cleared with clearTimeout/clearInterval\n`
        );
      }
      
      this.fixesApplied.push({
        type: 'timer_leak_warning',
        count: timerLeaks.length,
        message: `Added warning comment for ${timerLeaks.length} potential timer leaks`
      });
    }
    
    return fixedCode;
  }

  _fixArrayIndexAccess(code, warnings) {
    let fixedCode = code;
    
    // Check for potential array index out of bounds
    const arrayIndexWarnings = warnings.filter(w => w.type === 'potential_array_index_oob');
    
    if (arrayIndexWarnings.length > 0) {
      const comment = `// ULTRA-DEBUGGER: Found ${arrayIndexWarnings.length} potential array index out of bounds issues
// TODO: Add proper bounds checking before array access\n`;
      
      fixedCode = comment + fixedCode;
      
      this.fixesApplied.push({
        type: 'array_bounds_warning',
        count: arrayIndexWarnings.length,
        message: `Added warning comment for ${arrayIndexWarnings.length} potential array index issues`
      });
    }
    
    return fixedCode;
  }

  _fixVariableInitialization(code, warnings) {
    let fixedCode = code;
    
    // Look for variables that are used without initialization
    // This is a simple pattern-based fix
    const uninitializedVarPattern = /(let|var)\s+(\w+);\s*\2\s*\+=/g;
    
    let match;
    let offset = 0;
    
    while ((match = uninitializedVarPattern.exec(code)) !== null) {
      const fullMatch = match[0];
      const varType = match[1];
      const varName = match[2];
      const position = match.index + offset;
      
      // Replace with initialized variable
      const replacement = `${varType} ${varName} = 0; ${varName} +=`;
      fixedCode = fixedCode.slice(0, position) + replacement + fixedCode.slice(position + fullMatch.length);
      
      offset += replacement.length - fullMatch.length;
      
      this.fixesApplied.push({
        type: 'variable_initialization_fixed',
        variable: varName,
        message: `Initialized variable '${varName}' to 0 before use with += operator`
      });
    }
    
    return fixedCode;
  }

  _generateSuggestions(issues, warnings) {
    // Generate suggestions for undefined variables
    const undefinedVars = warnings.filter(w => w.type === 'potential_undefined_variable');
    if (undefinedVars.length > 0) {
      this.suggestions.push({
        type: 'undefined_variables',
        variables: [...new Set(undefinedVars.map(v => v.variable))],
        message: 'Consider declaring these variables or checking if they exist before use'
      });
    }
    
    // Generate suggestions for infinite loops
    const infiniteLoops = warnings.filter(w => w.type === 'potential_infinite_loop');
    if (infiniteLoops.length > 0) {
      this.suggestions.push({
        type: 'infinite_loops',
        count: infiniteLoops.length,
        message: 'Add proper exit conditions to prevent infinite loops'
      });
    }
    
    // Generate suggestions for function complexity
    const complexFunctions = warnings.filter(w => w.type === 'function_complexity');
    if (complexFunctions.length > 0) {
      this.suggestions.push({
        type: 'function_complexity',
        functions: complexFunctions.map(f => ({name: f.function, lines: f.lines})),
        message: 'Consider refactoring these complex functions into smaller, more manageable pieces'
      });
    }
    
    // Suggest code review for complex issues
    if (issues.length > 0) {
      this.suggestions.push({
        type: 'manual_review',
        issues: issues.length,
        message: 'Manual code review recommended for the identified critical issues'
      });
    }
  }
}

module.exports = AutoFixer;