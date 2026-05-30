// Original OpsNexus logo — connected-node hexagon
export default function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M28 4L50 16V40L28 52L6 40V16L28 4Z"
            stroke="#00c4e8" strokeWidth="1.4" fill="rgba(0,196,232,0.05)" />
      <path d="M28 14L43 22.5V39.5L28 48L13 39.5V22.5L28 14Z"
            stroke="rgba(0,196,232,0.3)" strokeWidth="0.9" fill="rgba(0,196,232,0.02)" />
      <circle cx="28" cy="28" r="4" fill="#00c4e8" />
      <circle cx="28" cy="28" r="7" stroke="rgba(0,196,232,0.3)" strokeWidth="0.8" fill="none" />
      {/* spokes */}
      <line x1="28" y1="24" x2="28" y2="16"  stroke="#00c4e8" strokeWidth="1" opacity=".55"/>
      <line x1="31" y1="26" x2="39" y2="21.5" stroke="#00c4e8" strokeWidth="1" opacity=".55"/>
      <line x1="31" y1="30" x2="39" y2="34.5" stroke="#00c4e8" strokeWidth="1" opacity=".55"/>
      <line x1="28" y1="32" x2="28" y2="40"  stroke="#00c4e8" strokeWidth="1" opacity=".55"/>
      <line x1="25" y1="30" x2="17" y2="34.5" stroke="#00c4e8" strokeWidth="1" opacity=".55"/>
      <line x1="25" y1="26" x2="17" y2="21.5" stroke="#00c4e8" strokeWidth="1" opacity=".55"/>
      {/* outer nodes */}
      <circle cx="28" cy="15" r="2" fill="#00d97a" opacity=".85"/>
      <circle cx="40" cy="22" r="2" fill="#00c4e8" opacity=".75"/>
      <circle cx="40" cy="35" r="2" fill="#00c4e8" opacity=".75"/>
      <circle cx="28" cy="41" r="2" fill="#00d97a" opacity=".85"/>
      <circle cx="16" cy="35" r="2" fill="#00c4e8" opacity=".75"/>
      <circle cx="16" cy="22" r="2" fill="#00c4e8" opacity=".75"/>
    </svg>
  )
}
