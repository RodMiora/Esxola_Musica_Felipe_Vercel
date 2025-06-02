/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      animation: {
        'equalizerBar1': 'equalizerBar1 0.8s ease-in-out infinite',
        'equalizerBar2': 'equalizerBar2 1s ease-in-out infinite',
        'equalizerBar3': 'equalizerBar3 1.2s ease-in-out infinite',
      },
      keyframes: {
        equalizerBar1: {
          '0%, 100%': { height: '6px', backgroundColor: '#FF5722' },
          '50%': { height: '10px', backgroundColor: '#FF8A65' },
        },
        equalizerBar2: {
          '0%, 100%': { height: '10px', backgroundColor: '#FF8A65' },
          '50%': { height: '5px', backgroundColor: '#FF5722' },
        },
        equalizerBar3: {
          '0%, 100%': { height: '8px', backgroundColor: '#FF5722' },
          '33%': { height: '12px', backgroundColor: '#FF8A65' },
          '66%': { height: '6px', backgroundColor: '#E64A19' },
        },
      },
    },
  },
  plugins: [],
}