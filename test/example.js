/**
 * Example AI-generated code with issues for testing the ultra-debugger
 */

function calculateSum(numbers) {
    let sum;
    
    // Potential undefined variable usage
    if (numbers.length > undefinedVariable) {
        console.log("Processing numbers");
    }
    
    for (let i = 0; i < numbers.length; i++) {
        sum += numbers[i]; // sum is not initialized
    }
    
    return sum;
}

function processData(data) {
    // Potential infinite loop
    for (;;;) {
        // Some processing
        if (data.length > 0) {
            break;
        }
    }
    
    // Unreachable code
    return "done";
    console.log("This won't be executed");
    
    // Another unreachable code block
    if (false) {
        console.log("This is never executed");
    }
}

function fetchUserData() {
    // Missing error handling
    fetch('/api/user')
        .then(response => response.json())
        .then(data => {
            console.log(data);
        });
    
    // Potential resource leak
    const eventHandler = function() {
        console.log('Event triggered');
    };
    
    document.addEventListener('click', eventHandler);
    
    // No cleanup of event listener
}

// Function with no return statement but expected to return something
function getUserStatus() {
    const user = {
        name: "AI Generated User",
        active: true
    };
    
    if (user.active) {
        // Missing return statement
        "active";
    }
    // Implicitly returns undefined
}

// Main execution
console.log(calculateSum([1, 2, 3, 4, 5]));
processData([1, 2, 3]);
fetchUserData();
console.log(getUserStatus());