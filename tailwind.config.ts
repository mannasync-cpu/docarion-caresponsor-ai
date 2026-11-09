import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        docarion: {
          emerald: '#10B981',
          dark: '#061E13',
          crimson: '#EF4444',
          navy: '#0B1426',
        },
        paypal: {
          blue: '#003087',
          sky: '#0070BA',
          gold: '#FFC439',
        },
      },
    },
  },
  plugins: [],
};

export default config;
