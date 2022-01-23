const colors = {
  blue: "rgba(37, 99, 235)",
  currentColor: "currentColor",
  white: "rgba(255, 255, 255",
};

const sizes = {
  md: {
    svgClassName: "animate-spin -ml-1 mr-3 h-5 w-5 text-white",
  },
  lg: {
    svgClassName: "animate-spin h-14 w-14 text-white",
  },
};

export default function Spinner({ color = "blue", size = "md" }) {
  const s = sizes[size];
  const c = colors[color];

  return (
    <div className="pl-2">
      <svg
        className={s.svgClassName}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill={c}
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>
  );
}
