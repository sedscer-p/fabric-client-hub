export function Logo({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Rounded square navy background */}
      <rect x="2" y="2" width="96" height="96" rx="20" fill="#1A2B3C"/>

      {/* Gold serif 'F' - Playfair Display style */}
      <text
        x="50"
        y="70"
        fontFamily="Playfair Display, Georgia, serif"
        fontSize="56"
        fontWeight="700"
        textAnchor="middle"
        fill="#C5A059"
        style={{ letterSpacing: '-2px' }}
      >
        F
      </text>

      {/* Gold thread weaving through the F */}
      <path
        d="M 20 45 Q 30 45, 35 48 L 45 53 Q 50 55, 55 53 L 65 48 Q 72 45, 78 50 Q 82 54, 80 62 Q 78 70, 70 75"
        stroke="#C5A059"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
