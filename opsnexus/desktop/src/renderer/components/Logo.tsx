// Inline SVG logo component - original OpsNexus design
export default function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer hexagon shield */}
      <path
        d="M32 4L56 17V47L32 60L8 47V17L32 4Z"
        stroke="#00c8f0"
        strokeWidth="1.5"
        fill="rgba(0,200,240,0.04)"
      />
      {/* Inner hexagon */}
      <path
        d="M32 14L48 23V41L32 50L16 41V23L32 14Z"
        stroke="rgba(0,200,240,0.4)"
        strokeWidth="1"
        fill="rgba(0,200,240,0.03)"
      />
      {/* Central node */}
      <circle cx="32" cy="32" r="4" fill="#00c8f0" opacity="0.9" />
      {/* Connection lines from center to corners */}
      <line x1="32" y1="28" x2="32" y2="18" stroke="#00c8f0" strokeWidth="1" opacity="0.6" />
      <line x1="35.5" y1="30" x2="44" y2="25" stroke="#00c8f0" strokeWidth="1" opacity="0.6" />
      <line x1="35.5" y1="34" x2="44" y2="39" stroke="#00c8f0" strokeWidth="1" opacity="0.6" />
      <line x1="32" y1="36" x2="32" y2="46" stroke="#00c8f0" strokeWidth="1" opacity="0.6" />
      <line x1="28.5" y1="34" x2="20" y2="39" stroke="#00c8f0" strokeWidth="1" opacity="0.6" />
      <line x1="28.5" y1="30" x2="20" y2="25" stroke="#00c8f0" strokeWidth="1" opacity="0.6" />
      {/* Outer nodes */}
      <circle cx="32" cy="17" r="2.2" fill="#00e882" opacity="0.8" />
      <circle cx="45" cy="24.5" r="2.2" fill="#00c8f0" opacity="0.7" />
      <circle cx="45" cy="39.5" r="2.2" fill="#00c8f0" opacity="0.7" />
      <circle cx="32" cy="47" r="2.2" fill="#00e882" opacity="0.8" />
      <circle cx="19" cy="39.5" r="2.2" fill="#00c8f0" opacity="0.7" />
      <circle cx="19" cy="24.5" r="2.2" fill="#00c8f0" opacity="0.7" />
    </svg>
  )
}
