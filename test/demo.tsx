// Demo TSX file with various issues for testing the Ultra Debugger

import React from 'react';

// Undefined variable
console.log(undeclaredVariable);

// Unused variable
let unusedVar: string = "Hello";

// Unreachable code
function MyComponent(): JSX.Element {
  return <div>Done</div>;
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

// Component with issues
interface WelcomeProps {
  name: string;
}

const Welcome: React.FC<WelcomeProps> = (props) => {
  return (
    <div>
      <h1>Hello, {props.name}!</h1>
      <p>This component has some issues</p>
    </div>
  );
};

// Valid React component for comparison
interface GoodComponentProps {
  title: string;
  children?: React.ReactNode;
}

const GoodComponent: React.FC<GoodComponentProps> = ({ title, children }) => {
  return (
    <div>
      <h1>{title}</h1>
      <div>{children}</div>
    </div>
  );
};

export default MyComponent;