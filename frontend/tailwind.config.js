// tailwind.config.js
module.exports = {
    // 1. Tell Tailwind where to look for class names:
    content: [
      './app/**/*.{js,ts,jsx,tsx}',   // App Router
      './pages/**/*.{js,ts,jsx,tsx}', // Pages Router
      './components/**/*.{js,ts,jsx,tsx}',
    ],
    // 2. Extend your design tokens here:
    theme: {
      extend: {
        colors: {
          brand: {
            light: '#4F46E5',
            DEFAULT: '#4338CA',
            dark: '#3730A3',
          },
        },
        fontFamily: {
          sans: ['Inter', 'system-ui', 'sans-serif'],
        },
      },
    },
    plugins: [],
  }
  