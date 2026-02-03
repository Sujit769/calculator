class Calculator {
    constructor() {
        this.displayResult = document.getElementById('result');
        this.displayExpression = document.getElementById('expression');
        this.historyList = document.getElementById('history-list');
        this.historyToggle = document.getElementById('history-toggle');
        this.historyClearButton = document.getElementById('history-clear');
        this.currentValue = '0';
        this.previousValue = '';
        this.operator = null;
        this.waitingForOperand = false;
        this.lastResult = null;
        this.history = this.loadHistory();

        this.init();
    }

    init() {
        // Add click handlers to all buttons
        document.querySelectorAll('.key').forEach(key => {
            key.addEventListener('click', (e) => this.handleClick(e));
            key.addEventListener('click', (e) => this.createRipple(e));
        });

        if (this.historyToggle) {
            this.historyToggle.addEventListener('click', (e) => {
                if (e.target.classList.contains('history-clear')) return;
                this.toggleHistory();
            });
        }

        if (this.historyClearButton) {
            this.historyClearButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.clearHistory();
            });
        }

        this.renderHistory();

        // Keyboard support
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    createRipple(e) {
        const button = e.currentTarget;
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        ripple.classList.add('ripple');

        button.appendChild(ripple);
        setTimeout(() => ripple.remove(), 500);
    }

    handleClick(e) {
        const key = e.currentTarget;
        const action = key.dataset.action;
        const value = key.dataset.value;

        if (value !== undefined) {
            this.inputDigit(value);
        } else if (action) {
            this.handleAction(action);
        }
    }

    handleAction(action) {
        switch (action) {
            case 'clear':
                this.clear();
                break;
            case 'toggle-sign':
                this.toggleSign();
                break;
            case 'percent':
                this.percent();
                break;
            case 'add':
                this.setOperator('+');
                break;
            case 'subtract':
                this.setOperator('-');
                break;
            case 'multiply':
                this.setOperator('×');
                break;
            case 'divide':
                this.setOperator('÷');
                break;
            case 'equals':
                this.calculate();
                break;
            case 'decimal':
                this.inputDecimal();
                break;
        }
    }

    handleKeyboard(e) {
        const key = e.key;

        if (/[0-9]/.test(key)) {
            e.preventDefault();
            this.inputDigit(key);
        } else if (key === '.') {
            e.preventDefault();
            this.inputDecimal();
        } else if (key === '+') {
            e.preventDefault();
            this.setOperator('+');
        } else if (key === '-') {
            e.preventDefault();
            this.setOperator('-');
        } else if (key === '*') {
            e.preventDefault();
            this.setOperator('×');
        } else if (key === '/') {
            e.preventDefault();
            this.setOperator('÷');
        } else if (key === 'Enter' || key === '=') {
            e.preventDefault();
            this.calculate();
        } else if (key === 'Escape' || key === 'c' || key === 'C') {
            e.preventDefault();
            this.clear();
        } else if (key === 'Backspace') {
            e.preventDefault();
            this.backspace();
        } else if (key === '%') {
            e.preventDefault();
            this.percent();
        }
    }

    inputDigit(digit) {
        if (this.waitingForOperand) {
            this.currentValue = digit;
            this.waitingForOperand = false;
        } else {
            this.currentValue = this.currentValue === '0' ? digit : this.currentValue + digit;
        }

        // Limit input length
        if (this.currentValue.replace(/[-.]/g, '').length > 12) {
            this.currentValue = this.currentValue.slice(0, -1);
        }

        this.updateDisplay();
    }

    inputDecimal() {
        if (this.waitingForOperand) {
            this.currentValue = '0.';
            this.waitingForOperand = false;
        } else if (!this.currentValue.includes('.')) {
            this.currentValue += '.';
        }
        this.updateDisplay();
    }

    setOperator(nextOperator) {
        const inputValue = parseFloat(this.currentValue);

        if (this.operator && !this.waitingForOperand) {
            this.calculate(false);
        } else {
            this.previousValue = this.currentValue;
        }

        // Remove active class from all operators
        document.querySelectorAll('.key.operator').forEach(op => op.classList.remove('active'));

        // Add active class to current operator
        const operatorButton = document.querySelector(`[data-action="${this.getActionFromOperator(nextOperator)}"]`);
        if (operatorButton) {
            operatorButton.classList.add('active');
        }

        this.operator = nextOperator;
        this.waitingForOperand = true;
        this.updateExpression();
    }

    getActionFromOperator(op) {
        const map = { '+': 'add', '-': 'subtract', '×': 'multiply', '÷': 'divide' };
        return map[op];
    }

    calculate(clearOperator = true) {
        if (!this.operator) return;

        const prev = parseFloat(this.previousValue);
        const current = parseFloat(this.currentValue);
        let result;

        switch (this.operator) {
            case '+':
                result = prev + current;
                break;
            case '-':
                result = prev - current;
                break;
            case '×':
                result = prev * current;
                break;
            case '÷':
                if (current === 0) {
                    this.showError('Error');
                    return;
                }
                result = prev / current;
                break;
            default:
                return;
        }

        // Format result
        result = this.formatResult(result);

        if (clearOperator) {
            const expression = `${this.formatNumber(prev)} ${this.operator} ${this.formatNumber(current)} =`;
            this.displayExpression.textContent = `${this.formatNumber(prev)} ${this.operator} ${this.formatNumber(current)} =`;
            this.operator = null;
            this.previousValue = '';

            // Remove active class from operators
            document.querySelectorAll('.key.operator').forEach(op => op.classList.remove('active'));

            this.addToHistory(expression, result);
        }

        this.currentValue = result.toString();
        this.waitingForOperand = true;
        this.lastResult = result;
        this.updateDisplay();
    }

    formatResult(num) {
        if (!isFinite(num)) {
            return 'Error';
        }

        // Handle very large or very small numbers
        if (Math.abs(num) > 999999999999 || (Math.abs(num) < 0.000001 && num !== 0)) {
            return num.toExponential(6);
        }

        // Round to avoid floating point errors
        const rounded = Math.round(num * 1000000000000) / 1000000000000;

        // Convert to string and limit decimal places
        let result = rounded.toString();
        if (result.includes('.') && result.split('.')[1].length > 10) {
            result = rounded.toFixed(10).replace(/\.?0+$/, '');
        }

        return result;
    }

    formatNumber(num) {
        const n = parseFloat(num);
        if (Math.abs(n) > 999999999999) {
            return n.toExponential(4);
        }
        return num;
    }

    clear() {
        this.currentValue = '0';
        this.previousValue = '';
        this.operator = null;
        this.waitingForOperand = false;
        this.displayExpression.textContent = '';
        this.displayResult.classList.remove('error', 'shrink');

        // Remove active class from operators
        document.querySelectorAll('.key.operator').forEach(op => op.classList.remove('active'));

        this.updateDisplay();
    }

    toggleSign() {
        if (this.currentValue !== '0') {
            this.currentValue = this.currentValue.startsWith('-')
                ? this.currentValue.slice(1)
                : '-' + this.currentValue;
            this.updateDisplay();
        }
    }

    percent() {
        const current = parseFloat(this.currentValue);
        this.currentValue = (current / 100).toString();
        this.updateDisplay();
    }

    backspace() {
        if (this.waitingForOperand) return;

        if (this.currentValue.length > 1) {
            this.currentValue = this.currentValue.slice(0, -1);
            if (this.currentValue === '-') {
                this.currentValue = '0';
            }
        } else {
            this.currentValue = '0';
        }
        this.updateDisplay();
    }

    showError(message) {
        this.displayResult.textContent = message;
        this.displayResult.classList.add('error');
        this.currentValue = '0';
        this.previousValue = '';
        this.operator = null;
        this.waitingForOperand = false;

        // Remove active class from operators
        document.querySelectorAll('.key.operator').forEach(op => op.classList.remove('active'));

        setTimeout(() => {
            this.displayResult.classList.remove('error');
        }, 1500);
    }

    updateDisplay() {
        // Add commas for thousands
        let displayValue = this.currentValue;

        if (displayValue !== 'Error' && !displayValue.includes('e')) {
            const parts = displayValue.split('.');
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            displayValue = parts.join('.');
        }

        this.displayResult.textContent = displayValue;

        // Shrink font for long numbers
        if (displayValue.length > 10) {
            this.displayResult.classList.add('shrink');
        } else {
            this.displayResult.classList.remove('shrink');
        }
    }

    updateExpression() {
        this.displayExpression.textContent = `${this.formatNumber(this.previousValue)} ${this.operator}`;
    }

    loadHistory() {
        try {
            const raw = localStorage.getItem('calcHistory');
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            return [];
        }
    }

    saveHistory() {
        localStorage.setItem('calcHistory', JSON.stringify(this.history));
    }

    addToHistory(expression, result) {
        if (!this.historyList) return;

        const entry = {
            expression,
            result: this.formatNumber(result)
        };

        this.history.unshift(entry);

        if (this.history.length > 20) {
            this.history = this.history.slice(0, 20);
        }

        this.saveHistory();
        this.renderHistory();
    }

    clearHistory() {
        this.history = [];
        this.saveHistory();
        this.renderHistory();
    }

    toggleHistory() {
        if (!this.historyToggle) return;
        this.historyToggle.classList.toggle('expanded');
    }

    renderHistory() {
        if (!this.historyList) return;

        this.historyList.innerHTML = '';

        if (this.history.length === 0) {
            const emptyItem = document.createElement('li');
            emptyItem.className = 'history-empty';
            emptyItem.textContent = 'No history yet';
            this.historyList.appendChild(emptyItem);
            return;
        }

        this.history.forEach(entry => {
            const item = document.createElement('li');
            item.className = 'history-item';

            const expression = document.createElement('div');
            expression.className = 'history-expression';
            expression.textContent = entry.expression;

            const result = document.createElement('div');
            result.textContent = entry.result;

            item.appendChild(expression);
            item.appendChild(result);
            this.historyList.appendChild(item);
        });
    }
}

// Initialize calculator when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new Calculator();
});

// Dark Mode Toggle Feature
class DarkModeToggle {
    constructor() {
        this.isDarkMode = localStorage.getItem('darkMode') === 'true';
        this.init();
    }

    init() {
        // Apply saved preference
        if (this.isDarkMode) {
            document.body.classList.add('dark-mode');
        }

        // Create toggle button
        this.createToggleButton();
    }

    createToggleButton() {
        const button = document.createElement('button');
        button.id = 'dark-mode-toggle';
        button.innerHTML = this.isDarkMode ? '☀️' : '🌙';
        button.title = 'Toggle Dark Mode';
        button.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: none;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            cursor: pointer;
            font-size: 20px;
            transition: transform 0.3s ease;
            z-index: 1000;
        `;

        button.addEventListener('click', () => this.toggle());
        button.addEventListener('mouseenter', () => button.style.transform = 'scale(1.1)');
        button.addEventListener('mouseleave', () => button.style.transform = 'scale(1)');

        document.body.appendChild(button);
    }

    toggle() {
        this.isDarkMode = !this.isDarkMode;
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', this.isDarkMode);

        const button = document.getElementById('dark-mode-toggle');
        button.innerHTML = this.isDarkMode ? '☀️' : '🌙';
    }
}

// Initialize dark mode toggle
document.addEventListener('DOMContentLoaded', () => {
    new DarkModeToggle();
});
