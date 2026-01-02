import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                steam: {
                    bg: {
                        main: '#1b2838',
                        card: '#16202d',
                        header: '#171a21',
                        gradient: {
                            from: '#1b2838',
                            to: '#2a475e',
                        },
                    },
                    border: '#2a475e',
                    text: {
                        primary: '#c7d5e0',
                        secondary: '#8f98a0',
                        light: '#ffffff',
                    },
                    accent: {
                        blue: '#1a9fff',
                        green: '#a4d007',
                        yellow: '#ffdf00',
                    },
                    price: {
                        discount: '#a4d007',
                        original: '#8f98a0',
                    },
                    review: {
                        positive: '#66c0f4',
                        mixed: '#b4b63e',
                        negative: '#c35c2c',
                    },
                },
            },
            fontFamily: {
                sans: ['Inter', 'Arial', 'sans-serif'],
            },
        },
    },
    plugins: [],
};

export default config;
