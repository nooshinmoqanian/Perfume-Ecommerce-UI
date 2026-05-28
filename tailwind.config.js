/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        glass: "0 8px 30px rgba(31, 18, 66, 0.16)",
      },
    },
  },
  plugins: [],
};
