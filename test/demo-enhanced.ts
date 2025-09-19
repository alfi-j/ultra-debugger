// Enhanced TypeScript demo with more TypeScript-specific issues

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

// Inferrable types
let inferredString: string = "This type can be inferred";
let inferredNumber: number = 42;

// Prefer as const
let literal = { x: 10, y: 20 } as { x: number; y: number };

// Empty interface
interface EmptyInterface {}

// Non-null assertion
function processElement(element: HTMLElement | null) {
  const width = element!.offsetWidth; // Dangerous non-null assertion
  return width;
}

// Array type consistency
let arrayOfStrings: string[] = ["a", "b", "c"];
let arrayOfNumbers: Array<number> = [1, 2, 3];

// Type assertion style
let element = <HTMLElement>document.getElementById("test");
let sameElement = document.getElementById("test") as HTMLElement;

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