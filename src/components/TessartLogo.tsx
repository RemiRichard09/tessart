/**
 * Tessart wordmark + red arrow mark. Sizes with the current font-size,
 * so pass a text-size class; `tone` picks the wordmark color.
 */
export default function TessartLogo({
  className = "",
  tone = "light",
}: {
  className?: string;
  tone?: "light" | "dark";
}) {
  return (
    <span
      className={`inline-flex items-start gap-[0.14em] leading-none font-bold tracking-tight ${
        tone === "light" ? "text-white" : "text-[#1b3a5c]"
      } ${className}`}
    >
      <span>Tessart</span>
      <svg
        viewBox="0 0 100 100"
        className="mt-[0.04em] h-[0.58em] w-auto shrink-0"
        aria-hidden
      >
        <path fill="#C8202D" d="M8 40 L34 26 V100 H8 Z" />
        <path
          fill="#C8202D"
          d="M42 14 H74 V2 L100 26 L74 50 V38 H68 V100 H42 Z"
        />
      </svg>
    </span>
  );
}
