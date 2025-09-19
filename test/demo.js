// Demo file with various JavaScript issues for testing the Ultra Debugger

// Undefined variable
console.log(undeclaredVariable);

// Unused variable
let unusedVar = 42;

// Unreachable code
function example() {
  return "done";
  console.log("This won't be reached");
}

// Constant condition
if (true) {
  console.log("This condition is always true");
}

// Duplicate keys in object
const obj = {
  key: "value1",
  key: "value2" // Duplicate key
};

// Extra semicolon
const x = 5;;

// Debugger statement
function debugFunction() {
  debugger;
  return "debug";
}

// Duplicate function arguments
function dupArgs(a, b, a) { // 'a' is duplicated
  return a + b;
}

// Empty block
if (true) {
  // Empty block
}

// Invalid regular expression
const regex = new RegExp('['); // Unmatched bracket

// Sparse array
const sparseArray = [1, , , 4]; // Holes in array

// Unsafe negation
if (!x instanceof Array) { // Should be !(x instanceof Array)
  console.log("Unsafe negation");
}

// Valid code for comparison
function validFunction(name) {
  return `Hello, ${name}!`;
}

validFunction("World");