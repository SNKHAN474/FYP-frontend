import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{js,jsx,ts,tsx}'],
	theme: {
		colors: {
			white: { primary: '#FFF' },
			black: { primary: '#000', faded: '#00000061' },
			cloud: { primary: '#FAFAFA', secondary: '#E9E9E9' },
			blue: { primary: '#0049C6', faded: '#0049C670' },
			green: { primary: '#14BD25', bright: '#00FF00' },
			slate: { primary: '#222222', secondary: '#5A5A5A', border: '#E7E7E7', faded: '#22222215' },
			red: { primary: '#E11D48' },
			yellow: { primary: '#FFD700' },
			orange: { primary: '#FFA500' },
			transparent: 'transparent',
		},
		extend: {
			keyframes: {
				overlayShow: {
					from: { opacity: '0' },
					to: { opacity: '1' },
				},
				contentShow: {
					from: { opacity: '0', transform: 'translate(-50%, -48%) scale(0.96)' },
					to: { opacity: '1', transform: 'translate(-50%, -50%) scale(1)' },
				},
			},
			animation: {
				overlayShow: 'overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1)',
				contentShow: 'contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1)',
			},
			fontFamily: {
				inter: ['Inter', 'sans-serif'],
			},
		},
	},
	plugins: [require('tailwindcss-animate'), require('@headlessui/tailwindcss')],
} satisfies Config;
