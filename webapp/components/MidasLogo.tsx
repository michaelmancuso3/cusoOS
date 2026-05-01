/**
 * Midas Industrial Services mark — gold hexagon with stylized "M" inside.
 * Wraps in optional Jarvis-style concentric rings that rotate.
 */

export function MidasLogo({
  size = 32,
  rings = false,
  className = "",
}: {
  size?: number;
  rings?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {rings && (
        <>
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 animate-spin-slow"
            style={{ width: size * 1.8, height: size * 1.8, left: -size * 0.4, top: -size * 0.4 }}
          >
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="var(--color-arc)"
              strokeWidth="0.4"
              strokeDasharray="2 8"
              opacity="0.5"
            />
          </svg>
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 animate-spin-rev"
            style={{ width: size * 2.2, height: size * 2.2, left: -size * 0.6, top: -size * 0.6 }}
          >
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="var(--color-arc)"
              strokeWidth="0.3"
              strokeDasharray="1 4"
              opacity="0.3"
            />
            <circle
              cx="50"
              cy="4"
              r="1.2"
              fill="var(--color-arc)"
            />
          </svg>
        </>
      )}
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className="relative"
        aria-label="Midas Industrial Services"
      >
        {/* Hexagon outline */}
        <path
          d="M50 8 L86 29 L86 71 L50 92 L14 71 L14 29 Z"
          fill="none"
          stroke="var(--color-bat)"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Stylized M */}
        <path
          d="M 30 72 L 30 32 L 50 60 L 70 32 L 70 72"
          fill="none"
          stroke="var(--color-bat)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
