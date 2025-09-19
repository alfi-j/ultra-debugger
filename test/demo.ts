// Demo TypeScript file with various issues for testing the Ultra Debugger

// Undefined variable
console.log(undeclaredVariable);

// Unused variable
let unusedVar: string = "Hello";

// Unreachable code
function example(): string {
  return "done";
  console.log("This won't be reached");
}

// Explicit any type
function processData(data: any): any {
  return data;
}

// Debugger statement
function debugFunction() {
  debugger;
  return "debug";
}

// Duplicate keys in object
const obj = {
  key: "value1",
  key: "value2" // Duplicate key
};

// Valid TypeScript code for comparison
interface Person {
  name: string;
  age: number;
}

function greet(person: Person): string {
  return `Hello, ${person.name}! You are ${person.age} years old.`;
}

const john: Person = {
  name: "John",
  age: 30
};

greet(john);