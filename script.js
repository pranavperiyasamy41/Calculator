// Calculator functionality
let display = document.getElementById('display');
let currentInput = '';
let expression = '';
let lastWasOperator = false;
let justCalculated = false;

// Theme management
function toggleTheme() {
    const body = document.body;
    const themeIcon = document.querySelector('.theme-icon');
    const currentTheme = body.getAttribute('data-theme');
    
    if (currentTheme === 'dark') {
        body.removeAttribute('data-theme');
        themeIcon.textContent = '🌙';
        localStorage.setItem('calculator-theme', 'light');
    } else {
        body.setAttribute('data-theme', 'dark');
        themeIcon.textContent = '☀️';
        localStorage.setItem('calculator-theme', 'dark');
    }
    
    // Add theme transition effect
    body.style.transition = 'all 0.3s ease';
}

// Load saved theme on page load
function loadTheme() {
    const savedTheme = localStorage.getItem('calculator-theme');
    const themeIcon = document.querySelector('.theme-icon');
    
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        themeIcon.textContent = '☀️';
    } else {
        themeIcon.textContent = '🌙';
    }
}

// Function to append values to display
function appendToDisplay(value) {
    const display = document.getElementById('display');
    
    // If just calculated and entering a number, start fresh
    if (justCalculated && !isOperator(value)) {
        expression = '';
        display.value = '';
        justCalculated = false;
    }
    
    // Handle operators
    if (isOperator(value)) {
        // If last character was an operator, replace it
        if (lastWasOperator) {
            expression = expression.slice(0, -1);
            display.value = display.value.slice(0, -1);
        }
        
        // If starting with operator and no expression, add 0
        if (expression === '' && display.value === '') {
            expression = '0';
            display.value = '0';
        }
        
        // Convert operator for display
        let displayOperator = value;
        if (value === '*') displayOperator = '×';
        if (value === '/') displayOperator = '÷';
        if (value === '-') displayOperator = '−';
        
        expression += value;
        display.value += displayOperator;
        lastWasOperator = true;
        justCalculated = false;
        return;
    }
    
    // Handle decimal point
    if (value === '.') {
        // Find the last number in the expression
        const parts = expression.split(/[+\-*/]/);
        const lastNumber = parts[parts.length - 1];
        
        // Don't add decimal if current number already has one
        if (lastNumber.includes('.')) {
            return;
        }
        
        // If no current number, add 0.
        if (lastWasOperator || expression === '' || display.value === '0') {
            expression += '0.';
            display.value = (display.value === '0' ? '' : display.value) + '0.';
        } else {
            expression += '.';
            display.value += '.';
        }
        lastWasOperator = false;
        justCalculated = false;
        return;
    }
    
    // Handle numbers
    // If display shows "0" and we're adding a number (not after operator), replace the 0
    if (display.value === '0' && !lastWasOperator) {
        expression = value;
        display.value = value;
    } else {
        expression += value;
        display.value += value;
    }
    lastWasOperator = false;
    justCalculated = false;
}

// Function to check if value is an operator
function isOperator(value) {
    return ['+', '-', '*', '/'].includes(value);
}

// Function to handle operators (simplified)
function handleOperator(nextOperator) {
    // This function is now handled in appendToDisplay
    // Keeping for compatibility
}

// Function to perform calculations
function performCalculation(expression) {
    try {
        // Replace display operators with JS operators for calculation
        let calcExpression = expression
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/−/g, '-');
        
        // Use Function constructor for safe evaluation
        const result = Function('"use strict"; return (' + calcExpression + ')')();
        
        // Check for invalid results
        if (!isFinite(result)) {
            throw new Error('Invalid calculation');
        }
        
        // Round to avoid floating point errors
        return Math.round(result * 100000000) / 100000000;
    } catch (error) {
        throw new Error('Invalid expression');
    }
}

// Function to calculate result
function calculate() {
    const display = document.getElementById('display');
    
    if (expression === '' || expression === '0') {
        return;
    }
    
    // Remove trailing operator if present
    let calcExpression = expression;
    if (lastWasOperator) {
        calcExpression = expression.slice(0, -1);
    }
    
    try {
        const result = performCalculation(calcExpression);
        
        // Update display with result
        display.value = String(result);
        expression = String(result);
        lastWasOperator = false;
        justCalculated = true;
        
        // Add animation effect
        display.style.transform = 'scale(1.05)';
        setTimeout(() => {
            display.style.transform = 'scale(1)';
        }, 150);
        
    } catch (error) {
        showError(error.message);
    }
}

// Function to clear display
function clearDisplay() {
    display.value = '0';
    expression = '';
    lastWasOperator = false;
    justCalculated = false;
    
    // Remove error styling if present
    display.classList.remove('display-error');
    
    // Add clear animation
    display.style.opacity = '0.5';
    setTimeout(() => {
        display.style.opacity = '1';
    }, 100);
}

// Function to delete last character
function deleteLast() {
    if (display.value.length > 0) {
        // Remove last character from both display and expression
        const lastChar = display.value.slice(-1);
        
        display.value = display.value.slice(0, -1);
        
        // Update expression - convert display operators back to calculation operators
        if (lastChar === '×') {
            expression = expression.slice(0, -1); // Remove *
        } else if (lastChar === '÷') {
            expression = expression.slice(0, -1); // Remove /
        } else if (lastChar === '−') {
            expression = expression.slice(0, -1); // Remove -
        } else {
            expression = expression.slice(0, -1);
        }
        
        // Update flags
        lastWasOperator = expression.length > 0 && isOperator(expression.slice(-1));
        justCalculated = false;
        
        // If display becomes empty, set to 0
        if (display.value === '') {
            display.value = '0';
            expression = '';
            lastWasOperator = false;
        }
    }
}

// Function to show error
function showError(message) {
    display.value = message;
    display.classList.add('display-error');
    
    // Remove error styling after 2 seconds
    setTimeout(() => {
        display.classList.remove('display-error');
        clearDisplay();
    }, 2000);
}

// Keyboard support
document.addEventListener('keydown', function(event) {
    const key = event.key;
    
    // Prevent default behavior for calculator keys
    if ('0123456789+-*/.=Enter'.includes(key) || key === 'Backspace' || key === 'Escape') {
        event.preventDefault();
    }
    
    // Handle number keys
    if ('0123456789.'.includes(key)) {
        appendToDisplay(key);
    }
    
    // Handle operator keys
    if ('+-*/'.includes(key)) {
        appendToDisplay(key);
    }
    
    // Handle equals/enter key
    if (key === '=' || key === 'Enter') {
        calculate();
    }
    
    // Handle clear key (Escape)
    if (key === 'Escape') {
        clearDisplay();
    }
    
    // Handle backspace
    if (key === 'Backspace') {
        deleteLast();
    }
});

// Add button click animation
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function() {
        // Add click effect
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = '';
        }, 100);
    });
    
    // Add mouse enter/leave effects
    button.addEventListener('mouseenter', function() {
        this.style.transition = 'all 0.2s ease';
    });
});

// Initialize display
document.addEventListener('DOMContentLoaded', function() {
    // Load theme first
    loadTheme();
    
    clearDisplay();
    display.value = '0';
    
    // Add loading animation
    const calculator = document.querySelector('.calculator');
    calculator.style.opacity = '0';
    calculator.style.transform = 'translateY(50px)';
    
    setTimeout(() => {
        calculator.style.transition = 'all 0.8s ease';
        calculator.style.opacity = '1';
        calculator.style.transform = 'translateY(0)';
    }, 100);
});

// Add visual feedback for button presses
function addButtonFeedback() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('mousedown', function() {
            this.style.boxShadow = 'inset 3px 3px 10px rgba(0, 0, 0, 0.2)';
        });
        
        button.addEventListener('mouseup', function() {
            this.style.boxShadow = '';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.boxShadow = '';
            this.style.transform = '';
        });
    });
}

// Initialize button feedback
document.addEventListener('DOMContentLoaded', addButtonFeedback);

// Function to format large numbers
function formatNumber(num) {
    if (Math.abs(num) > 999999999) {
        return num.toExponential(6);
    }
    return num.toString();
}

// Add sound effects (optional - commented out for assignment)
/*
function playSound(type) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = type === 'click' ? 800 : 1000;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}
*/