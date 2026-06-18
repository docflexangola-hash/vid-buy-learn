export function Logo({ className = "h-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 40" className={className} aria-label="Ondjango Capital">
      <rect width="40" height="40" rx="8" fill="#C9A84C" />
      <text
        x="20"
        y="27"
        textAnchor="middle"
        fill="#3D2B1A"
        fontFamily="Hanken Grotesk, sans-serif"
        fontSize="20"
        fontWeight="800"
      >
        OC
      </text>
      <text
        x="50"
        y="22"
        fill="#3D2B1A"
        fontFamily="Hanken Grotesk, sans-serif"
        fontSize="14"
        fontWeight="700"
        letterSpacing="1"
      >
        ONDJANGO
      </text>
      <text
        x="50"
        y="34"
        fill="#C9A84C"
        fontFamily="Hanken Grotesk, sans-serif"
        fontSize="9"
        fontWeight="600"
        letterSpacing="2"
      >
        CAPITAL
      </text>
    </svg>
  );
}
