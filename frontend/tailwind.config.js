/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // Concept B: Restricted blue usage, focusing on whites/grays
        brand: {
          DEFAULT: '#003DA5', // Used very sparingly (CTAs, active states)
          light: '#F0F4FA',   // Very light tint for active backgrounds
        },
        surface: {
          DEFAULT: '#FFFFFF', // Pure white for cards/modals
          muted: '#F4F4F5',   // Very light warm gray for main app background (zinc-100)
          border: '#E4E4E7',  // zinc-200
        },
        text: {
          main: '#09090B',    // zinc-950
          muted: '#71717A',   // zinc-500
          light: '#A1A1AA',   // zinc-400
        },
        semantic: {
          success: '#10B981', // emerald-500
          successLight: '#D1FAE5',
          warning: '#F59E0B', // amber-500
          warningLight: '#FEF3C7',
          error: '#EF4444',   // rose-500
          errorLight: '#FFE4E6',
        }
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'stripe': '0 10px 40px -10px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.02)',
        'floating': '0 20px 60px -15px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}
