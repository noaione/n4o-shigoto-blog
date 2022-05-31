const colors = require("tailwindcss/colors");

module.exports = {
    content: [
        "./pages/**/*.{ts,tsx,js,jsx}",
        "./components/**/*.{js,ts,tsx,jsx}",
        "./layouts/**/*.{js,ts,tsx,jsx}",
        "./lib/**/*.{js,ts,tsx,jsx}",
        "./public/**/*.{js,ts,tsx,jsx}",
        "./styles/**/*.{js,ts,tsx,jsx}",
        "./data/**/*.{md,mdx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                gray: colors.neutral,
            },
        },
    },
    plugins: [require("@tailwindcss/typography")],
};
