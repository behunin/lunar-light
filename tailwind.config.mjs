/** @type {import('tailwindcss').Config} */
const generateColorClass = (variable) => {
	return ({ opacityValue }) =>
		opacityValue
			? `rgba(var(--${variable}), ${opacityValue})`
			: `rgb(var(--${variable}))`
}

const textColor = {
	primary: generateColorClass('text-primary'),
	secondary: generateColorClass('text-secondary'),
	tertiary: generateColorClass('text-tertiary'),
}

const backgroundColor = {
	primary: generateColorClass('bg-primary'),
	secondary: generateColorClass('bg-secondary'),
	tertiary: generateColorClass('bg-tertiary'),
}

export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	darkMode: 'class',
	theme: {
		extend: {
			textColor,
			backgroundColor,
		},
	},
	plugins: [],
}
