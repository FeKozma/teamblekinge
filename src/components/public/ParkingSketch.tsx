/**
 * A deliberately schematic sketch of the parking rule at the club house:
 * green areas are fine, red ones are not. NOT a map — the old site's real
 * parking map should replace it once the club sends it over.
 */
const GREEN = "#2F6B3B";
const RED = "#B3261E";

export function ParkingSketch({
  street,
  place,
  className = "",
}: {
  /** The club house's street address, "Tennvägen 11 A"; the road is named without the number. */
  street: string;
  /** What the house is called, "Klubblokalen". */
  place: string;
  className?: string;
}) {
  const road = street.replace(/\s+\d.*$/, "");
  return (
    <svg
      viewBox="0 0 480 320"
      role="img"
      aria-label="Schematisk skiss av klubblokalens parkering: parkera på de gröna ytorna, undvik de röda framför entrén och i infarten. Skissen är inte skalenlig."
      className={`block h-auto w-full ${className}`}
    >
      <defs>
        <pattern id="pk-ok" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
          <rect width="10" height="10" fill={GREEN} fillOpacity="0.16" />
          <path d="M0 0V10" stroke={GREEN} strokeWidth="3" strokeOpacity="0.45" />
        </pattern>
        <pattern id="pk-no" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
          <rect width="10" height="10" fill={RED} fillOpacity="0.14" />
          <path d="M0 0V10" stroke={RED} strokeWidth="3" strokeOpacity="0.45" />
        </pattern>
      </defs>

      <rect width="480" height="320" rx="12" fill="#EFEBE7" />

      {/* Road */}
      <rect y="256" width="480" height="64" fill="#3A3435" />
      <path d="M150 292H480" stroke="#fff" strokeWidth="3" strokeDasharray="16 12" opacity="0.6" />
      <text x="16" y="297" fill="#fff" fontSize="16" fontWeight="800">
        {road}
      </text>

      {/* Lot and driveway */}
      <rect x="20" y="126" width="440" height="72" rx="6" fill="#D9D3CD" />
      <rect x="196" y="196" width="60" height="62" fill="#D9D3CD" />

      {/* Club house */}
      <rect x="272" y="20" width="188" height="92" rx="6" fill="#221E1F" />
      <text x="366" y="60" textAnchor="middle" fill="#fff" fontSize="17" fontWeight="800">
        {place}
      </text>
      <text x="366" y="82" textAnchor="middle" fill="#EE8915" fontSize="13" fontWeight="800">
        {street}
      </text>
      <rect x="300" y="108" width="30" height="8" rx="2" fill="#EE8915" />

      {/* Fine to park */}
      <g stroke={GREEN} strokeWidth="2.5">
        <rect x="20" y="126" width="160" height="72" rx="6" fill="url(#pk-ok)" />
        <rect x="20" y="20" width="120" height="92" rx="6" fill="url(#pk-ok)" />
      </g>
      {/* Keep clear */}
      <g stroke={RED} strokeWidth="2.5">
        <rect x="272" y="126" width="188" height="40" rx="6" fill="url(#pk-no)" />
        <rect x="196" y="198" width="60" height="58" rx="4" fill="url(#pk-no)" />
      </g>

      {/* Cars on the green */}
      <g fill="#fff" stroke="#221E1F" strokeWidth="2">
        <rect x="36" y="140" width="26" height="44" rx="6" />
        <rect x="76" y="140" width="26" height="44" rx="6" />
        <rect x="40" y="38" width="26" height="44" rx="6" />
      </g>

      {/* Zone markers */}
      <g>
        <circle cx="152" cy="162" r="14" fill={GREEN} />
        <path d="M145 162l5 5 9-10" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="112" cy="58" r="14" fill={GREEN} />
        <path d="M105 58l5 5 9-10" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="432" cy="146" r="13" fill={RED} />
        <path d="M427 141l10 10M437 141l-10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        <circle cx="226" cy="228" r="13" fill={RED} />
        <path d="M221 223l10 10M231 223l-10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      </g>

      {/* The walk from the car to the door */}
      <path
        className="march"
        d="M104 162 C 170 150, 230 150, 262 140 S 300 126, 315 118"
        fill="none"
        stroke="#221E1F"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="1 11"
      />
      <g className="pin-bob">
        <path d="M315 112c0 0-11-11-11-19a11 11 0 0 1 22 0c0 8-11 19-11 19z" fill="#EE8915" stroke="#221E1F" strokeWidth="2" />
        <circle cx="315" cy="93" r="4" fill="#221E1F" />
      </g>

      {/* Disclaimer tag */}
      <g transform="rotate(-3 398 278)">
        <rect x="326" y="264" width="144" height="28" rx="4" fill="#EE8915" />
        <text x="398" y="283" textAnchor="middle" fill="#221E1F" fontSize="12" fontWeight="800" letterSpacing="0.5">
          SCHEMATISK SKISS
        </text>
      </g>
    </svg>
  );
}
