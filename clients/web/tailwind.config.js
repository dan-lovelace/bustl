module.exports = {
  purge: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    backgroundColor: (theme) => ({
      ...theme("colors"),
      "blue-950": "#0e1b3f",
    }),
    extend: {
      boxShadow: {
        highlight:
          "inset 0 0 5px 5px rgba(255, 255, 0, 0.7), inset 0 0 5px -5px rgba(255, 255, 0, 0.45)",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require("@tailwindcss/typography")],
};
