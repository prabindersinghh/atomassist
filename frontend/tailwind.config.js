module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#FFC107',
        dark: '#0B0F19',
        background: '#111827',
        success: '#22C55E',
        danger: '#EF4444',
      },
      borderRadius: {
        lg: '16px',
      },
      spacing: {
        grid: '8px',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
