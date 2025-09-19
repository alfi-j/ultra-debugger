const fs = require('fs').promises;
const path = require('path');

// Test the live analysis feature by creating and modifying a file
async function testLiveAnalysis() {
  const testDir = './test/live';
  const testFile = path.join(testDir, 'live-test.js');
  
  try {
    // Create test directory if it doesn't exist
    try {
      await fs.access(testDir);
    } catch {
      await fs.mkdir(testDir, { recursive: true });
    }
    
    console.log('Creating file for live analysis test...');
    
    // Create a file with some issues
    const initialContent = `
// Test file for live analysis
console.log(undeclaredVariable);

function testFunction() {
  return "done";
  console.log("Unreachable code");
}

debugger;

const obj = {
  key1: "value1",
  key1: "value2" // Duplicate key
};
`;
    
    await fs.writeFile(testFile, initialContent);
    console.log('File created. Waiting 2 seconds...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Modify the file
    console.log('Modifying file...');
    const modifiedContent = `
// Test file for live analysis (modified)
console.log(undeclaredVariable);

function testFunction() {
  return "done";
  console.log("Unreachable code");
}

debugger;

const obj = {
  key1: "value1",
  key1: "value2" // Duplicate key
};

// Add a new issue
let unusedVar = "not used";
`;
    
    await fs.writeFile(testFile, modifiedContent);
    console.log('File modified. Waiting 2 seconds...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Add another modification
    console.log('Adding another modification...');
    const finalContent = `
// Test file for live analysis (final)
console.log(undeclaredVariable);

function testFunction() {
  return "done";
  console.log("Unreachable code");
}

debugger;

const obj = {
  key1: "value1",
  key1: "value2" // Duplicate key
};

// Add a new issue
let unusedVar = "not used";

// Another unused variable
let anotherUnused = 42;
`;
    
    await fs.writeFile(testFile, finalContent);
    console.log('Final modification made. Waiting 2 seconds...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Clean up
    console.log('Cleaning up test file...');
    await fs.unlink(testFile);
    console.log('Test completed!');
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testLiveAnalysis();