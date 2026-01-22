# Modern Calculator

A sleek, modern calculator built with HTML, CSS, and vanilla JavaScript. Features a beautiful glassmorphism design with smooth animations and a fully functional dark mode toggle.

## Features

- **Basic Operations**: Addition, subtraction, multiplication, division
- **Decimal Support**: Seamless decimal number handling
- **Percentage Calculation**: Quick percentage calculations
- **Sign Toggle**: Change positive/negative with one tap
- **Backspace**: Delete last entered digit
- **Keyboard Support**: Full keyboard navigation support
- **Dark Mode**: Toggle between light and dark themes (persists via localStorage)
- **Responsive Design**: Works on desktop and mobile devices
- **Smooth Animations**: Ripple effects on button clicks
- **Error Handling**: Graceful handling of division by zero

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| 0-9 | Enter numbers |
| + - * / | Operators |
| Enter or = | Calculate result |
| . | Decimal point |
| % | Percentage |
| Escape or C | Clear all |
| Backspace | Delete last digit |

## Getting Started

1. Clone the repository:
```bash
git clone <your-repo-url>
```

2. Open `index.html` in your browser:
```bash
open index.html
```

Or use a local development server:
```bash
npx serve .
```

## Project Structure

```
calculator/
├── index.html      # Main HTML structure
├── styles.css      # All styling including dark mode
├── script.js       # Calculator and dark mode logic
└── README.md       # This file
```

## Branches

- `main` - Production branch
- `feature/dark-mode-toggle` - Dark mode feature implementation
- `feature/calculation-history` - Calculation history feature (in development)

## License

MIT License
