// TailwindCSS Configuration
// Ensuring we attach to the window object or existing tailwind instance
window.tailwind = window.tailwind || {};

window.tailwind.config = {
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                primary: "#005C9C", // Hyper Blue
                secondary: "#4A99D1", // Major Blue
                poolhouse: "#8BA1B0", // Poolhouse
                tidewater: "#CFE0E0", // Tidewater
                "background-light": "#F2F4F1", // Extra White
                "background-dark": "#0F172A",
            },
            fontFamily: {
                sans: ["Inter", "sans-serif"],
                display: ["Outfit", "sans-serif"],
            },
            borderRadius: {
                DEFAULT: "12px",
            },
        },
    },
};
