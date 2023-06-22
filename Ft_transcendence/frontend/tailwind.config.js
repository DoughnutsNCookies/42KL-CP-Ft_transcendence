export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        highlight: "rgb(var(--highlight-color))",
        dimshadow: "rgb(var(--dimmer-shadow))",
        shadow: "rgb(var(--shadow-color))",
        accRed: "rgb(var(--accent-red))",
        accCyan: "rgb(var(--accent-cyan))",
        accYellow: "rgb(var(--accent-yellow))",
        accBriYellow: "rgb(var(--accent-bri-yellow))",
        accBlue: "rgb(var(--accent-blue))",
        accGreen: "rgb(var(--accent-green))",
      },
      fontFamily: {
        jbmono: ["JetBrains Mono"],
        bungee: ["Bungee"],
      },
      animation: {
        "pulse-short": "pulse 0.3s ease-in-out 1",
        "left-to-right": "left-to-right 1",
        shine: "shine 3s infinite ease-in-out",
        "h-shake": "h-shake 0.5s",
        marquee: "marquee 15s linear infinite",
        loadingFade: "loadingFade infinite 1s",
        emoteFloat: "floatFade 1 3s linear",
      },
      cursor: {
        default: "url(./assets/cursor/smiley.svg), default",
        pointer: "url(./assets/cursor/pointy.svg), pointer",
        text: "url(./assets/cursor/texty.svg), text",
      },
    },
  },
  plugins: [],
};
