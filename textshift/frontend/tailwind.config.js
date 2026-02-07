/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		keyframes: {
  			'accordion-down': {
  				from: { height: '0' },
  				to: { height: 'var(--radix-accordion-content-height)' }
  			},
  			'accordion-up': {
  				from: { height: 'var(--radix-accordion-content-height)' },
  				to: { height: '0' }
  			},
  			'fade-in-up': {
  				'0%': { opacity: '0', transform: 'translateY(20px)' },
  				'100%': { opacity: '1', transform: 'translateY(0)' }
  			},
  			'slide-in-left': {
  				'0%': { opacity: '0', transform: 'translateX(-100px)' },
  				'100%': { opacity: '1', transform: 'translateX(0)' }
  			},
  			'float-slow': {
  				'0%, 100%': { transform: 'translateY(0px) translateX(0px)' },
  				'33%': { transform: 'translateY(-20px) translateX(10px)' },
  				'66%': { transform: 'translateY(10px) translateX(-5px)' }
  			},
  			'float-medium': {
  				'0%, 100%': { transform: 'translateY(0px) translateX(0px)' },
  				'50%': { transform: 'translateY(-15px) translateX(-10px)' }
  			},
  			'gradient-drift-1': {
  				'0%, 100%': { transform: 'translate(0, 0) scale(1)' },
  				'33%': { transform: 'translate(100px, 50px) scale(1.2)' },
  				'66%': { transform: 'translate(50px, 100px) scale(0.9)' }
  			},
  			'gradient-drift-2': {
  				'0%, 100%': { transform: 'translate(0, 0) scale(1)' },
  				'33%': { transform: 'translate(-80px, 80px) scale(0.9)' },
  				'66%': { transform: 'translate(-40px, 40px) scale(1.1)' }
  			},
  			'gradient-drift-3': {
  				'0%, 100%': { transform: 'translate(0, 0) scale(1)' },
  				'33%': { transform: 'translate(60px, -60px) scale(1.1)' },
  				'66%': { transform: 'translate(-30px, 30px) scale(0.95)' }
  			},
  			'bounce-arrow': {
  				'0%, 100%': { transform: 'translateY(0)' },
  				'50%': { transform: 'translateY(10px)' }
  			},
  			'typewriter': {
  				'0%, 33%': { content: '"AI Detection."' },
  				'34%, 66%': { content: '"Humanizer."' },
  				'67%, 100%': { content: '"Plagiarism Check."' }
  			},
  			'blink': {
  				'0%, 100%': { opacity: '1' },
  				'50%': { opacity: '0' }
  			},
  			'hero-scale-in': {
  				'0%': { opacity: '0', transform: 'scale(0.9)' },
  				'100%': { opacity: '1', transform: 'scale(1)' }
  			},
  			'fade-in': {
  				'0%': { opacity: '0' },
  				'100%': { opacity: '1' }
  			},
  			'slide-in-right': {
  				'0%': { transform: 'translateX(100%)' },
  				'100%': { transform: 'translateX(0)' }
  			},
  			'scale-in': {
  				'0%': { opacity: '0', transform: 'scale(0.95)' },
  				'100%': { opacity: '1', transform: 'scale(1)' }
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
  			'slide-in-left': 'slide-in-left 0.4s ease-out forwards',
  			'float-slow': 'float-slow 20s ease-in-out infinite',
  			'float-medium': 'float-medium 15s ease-in-out infinite',
  			'gradient-drift-1': 'gradient-drift-1 20s ease-in-out infinite',
  			'gradient-drift-2': 'gradient-drift-2 25s ease-in-out infinite',
  			'gradient-drift-3': 'gradient-drift-3 18s ease-in-out infinite',
  			'bounce-arrow': 'bounce-arrow 2s ease-in-out infinite',
  			'blink': 'blink 1s step-end infinite',
  			'hero-scale-in': 'hero-scale-in 0.8s cubic-bezier(0.25, 0.1, 0.25, 1) forwards',
  			'fade-in': 'fade-in 0.3s ease-out forwards',
  			'slide-in-right': 'slide-in-right 0.3s cubic-bezier(0.25, 0.1, 0.25, 1) forwards',
  			'scale-in': 'scale-in 0.3s ease-out forwards'
  		}
  	}
  },
  plugins: [import("tailwindcss-animate")],
}

