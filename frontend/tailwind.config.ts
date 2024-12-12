import type { Config } from "tailwindcss";

const config: Config = {
	darkMode: ["class"],
	content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
				success: 'hsl(var(--success))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
				error: {
  				DEFAULT: 'hsl(var(--error))',
  				foreground: 'hsl(var(--error-foreground))'
  			},
				skeleton: {
  				DEFAULT: 'hsl(var(--skeleton))',
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
			keyframes: {
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
				"loading-dot": {
					"0%, 100%": {
						opacity: "1",
						background: "hsl(var(--foreground))",
						transform: "scale(1)"
					},
					"50%": {
						opacity: "0.1",
					}
				},
				"loading-icon": {
					"0%, 100%": {
						opacity: "1",
						color: "hsl(var(--foreground))",
						transform: "scale(1)"
					},
					"50%": {
						opacity: "0.1",
					}
				}
      },
      animation: {
        "caret-blink": "caret-blink 1.25s ease-out infinite",
				"loading-dot": "loading-dot 3s ease-in-out infinite",
				"loading-icon": "loading-icon 3s ease-in-out infinite"
      },
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
			maxHeight: {
				"xxl": '104rem'
			},
			maxWidth: {
				"xxl": '104rem'
			},
			backdropBlur: {
				rm: "1px"
			},
			animationDelay: {
				450: "450ms",
				600: "600ms",
			},
			transitionDelay: {
				450: "450ms",
				600: "600ms",
			}
  	}
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require("tailwindcss-animate")],
};
export default config;
