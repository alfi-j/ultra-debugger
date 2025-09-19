// Enhanced TSX demo with more React-specific issues

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

// Component without keys in list
function ListComponent({ items }: { items: string[] }) {
  return (
    <ul>
      {items.map((item, index) => (
        <li>{item}</li> // Missing key prop
      ))}
    </ul>
  );
}

// Component using children prop instead of nesting
function ComponentWithChildren() {
  return (
    <ListComponent items={["a", "b", "c"]} children={<div>Extra content</div>} />
  );
}

// Duplicate props
function DuplicatePropsComponent() {
  return <div className="first" className="second">Content</div>;
}

// Unknown property
function UnknownPropertyComponent() {
  return <div class="my-class">Content</div>; // Should be className
}

// Unescaped entities
function UnescapedEntitiesComponent() {
  return <div>Price: $<span>100</span></div>; // Special character not escaped
}

// Self-closing component
function SelfClosingComponent() {
  return <div></div>; // Should be self-closing
}

// Valid React component for comparison
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