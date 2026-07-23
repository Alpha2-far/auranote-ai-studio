interface LogoProps {
  size?: number;
  className?: string;
  /** Rend le fond squircle sombre (icône d'app) ou seulement le monogramme. */
  withBackground?: boolean;
}

/**
 * Logo AuraNote — source de vérité unique (remplace les 4 copies divergentes de l'ancienne app).
 */
export function Logo({ size = 32, className, withBackground = true }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      className={className}
      role="img"
      aria-label="AuraNote"
    >
      {withBackground && <rect width="512" height="512" rx="115" fill="#0D0F12" />}
      <circle
        cx="256"
        cy="256"
        r="165"
        fill="none"
        stroke="#E2B872"
        strokeWidth="6"
        strokeDasharray="10 14"
        opacity="0.35"
      />
      <path
        d="M 160 360 L 256 140 L 352 360 M 195 280 H 317 C 385 280 420 210 370 148 C 318 82 194 82 142 148 C 92 210 127 280 195 280"
        fill="none"
        stroke={withBackground ? '#F4EFE6' : 'currentColor'}
        strokeWidth="22"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="362" cy="152" r="15" fill="#E2B872" />
    </svg>
  );
}
