// Demo React/JSX file with various issues for testing the Ultra Debugger

import React from 'react';

// Undefined variable
console.log(undeclaredVariable);

// Unused variable
let unusedVar = "Hello";

// Unreachable code
function MyComponent() {
  return <div>Done</div>;
  console.log("This won't be reached");
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

// Component with issues
function Welcome(props) {
  return (
    <div>
      <h1>Hello, {props.name}!</h1>
      <p>This component has some issues</p>
    </div>
  );
}

// Valid React component for comparison
function GoodComponent({ title, children }) {
  return (
    <div>
      <h1>{title}</h1>
      <div>{children}</div>
    </div>
  );
}

export default MyComponent;