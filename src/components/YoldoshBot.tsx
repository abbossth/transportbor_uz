export type BotState = "idle" | "listening" | "thinking" | "speaking";

type Props = { state?: BotState; className?: string; wave?: boolean };

/**
 * "Yo‘ldosh" — TransportBor maskoti: g‘ildirakli, qo‘lida posilka ushlagan do‘stona robot.
 * Holatlar (idle / listening / thinking / speaking) faqat CSS orqali jonlantiriladi.
 */
export function YoldoshBot({ state = "idle", className = "", wave = true }: Props) {
  return (
    <svg viewBox="0 0 140 170" className={`yoldosh-bot ${className}`} data-state={state} data-wave={wave} aria-hidden role="presentation">
      <defs>
        <linearGradient id="yb-shell" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#dfe7ee" />
        </linearGradient>
        <radialGradient id="yb-eye" cx="0.5" cy="0.4" r="0.6">
          <stop offset="0" stopColor="#a7f3d0" />
          <stop offset="1" stopColor="#12b76a" />
        </radialGradient>
        <linearGradient id="yb-visor" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#13213a" />
          <stop offset="1" stopColor="#0b1220" />
        </linearGradient>
      </defs>

      {/* Tinglash halqalari */}
      <g className="yb-rings" fill="none" stroke="#12b76a">
        <circle cx="70" cy="58" r="44" strokeWidth="2" />
        <circle cx="70" cy="58" r="44" strokeWidth="2" />
      </g>

      {/* Soya */}
      <ellipse cx="70" cy="163" rx="34" ry="4.5" fill="#0b1220" opacity="0.18" className="yb-shadow" />

      <g className="yb-float">
        {/* G‘ildiraklar */}
        <g className="yb-wheel" style={{ transformOrigin: "50px 150px" }}>
          <circle cx="50" cy="150" r="11" fill="#0b1220" />
          <circle cx="50" cy="150" r="4" fill="#12b76a" />
          <rect x="49" y="140" width="2" height="6" rx="1" fill="#22304a" />
        </g>
        <g className="yb-wheel" style={{ transformOrigin: "90px 150px" }}>
          <circle cx="90" cy="150" r="11" fill="#0b1220" />
          <circle cx="90" cy="150" r="4" fill="#12b76a" />
          <rect x="89" y="140" width="2" height="6" rx="1" fill="#22304a" />
        </g>
        <rect x="44" y="136" width="52" height="8" rx="4" fill="#c9d4de" />

        {/* Chap qo‘l (silkitadi) */}
        <g className="yb-arm-wave" style={{ transformOrigin: "40px 102px" }}>
          <rect x="18" y="80" width="14" height="30" rx="7" fill="url(#yb-shell)" stroke="#c9d4de" transform="rotate(25 40 102)" />
          <circle cx="20" cy="80" r="7" fill="#12b76a" transform="rotate(25 40 102)" />
        </g>

        {/* Tana */}
        <rect x="36" y="92" width="68" height="48" rx="20" fill="url(#yb-shell)" stroke="#c9d4de" />
        <circle cx="70" cy="114" r="12" fill="#12b76a" />
        {/* Ko‘krakdagi yuk mashinasi belgisi */}
        <path d="M63.5 110 h7 v7 h-7 z M70.5 112.5 h3 l2.5 2.5 v2 h-5.5 z" fill="#ffffff" />
        <circle cx="66" cy="118.5" r="1.6" fill="#ffffff" />
        <circle cx="73.5" cy="118.5" r="1.6" fill="#ffffff" />

        {/* O‘ng qo‘l + posilka */}
        <rect x="100" y="100" width="13" height="24" rx="6.5" fill="url(#yb-shell)" stroke="#c9d4de" />
        <g className="yb-box">
          <rect x="98" y="112" width="30" height="24" rx="4" fill="#d9a86c" />
          <rect x="98" y="112" width="30" height="7" rx="3" fill="#c48f52" />
          <rect x="111" y="112" width="4" height="24" fill="#f3dcb6" />
        </g>

        {/* Bo‘yin */}
        <rect x="60" y="84" width="20" height="10" rx="4" fill="#c9d4de" />

        {/* Antenna */}
        <line x1="70" y1="20" x2="70" y2="8" stroke="#c9d4de" strokeWidth="3" strokeLinecap="round" />
        <circle cx="70" cy="7" r="5" fill="#12b76a" className="yb-antenna" />

        {/* Bosh */}
        <rect x="26" y="18" width="88" height="68" rx="30" fill="url(#yb-shell)" stroke="#c9d4de" />
        <circle cx="24" cy="54" r="7" fill="#12b76a" />
        <circle cx="116" cy="54" r="7" fill="#12b76a" />
        {/* Visor */}
        <rect x="36" y="31" width="68" height="42" rx="19" fill="url(#yb-visor)" />
        <rect x="42" y="34" width="26" height="5" rx="2.5" fill="#ffffff" opacity="0.12" />

        {/* Ko‘zlar */}
        <g className="yb-eyes">
          <ellipse cx="56" cy="51" rx="6.5" ry="8" fill="url(#yb-eye)" className="yb-eye" />
          <ellipse cx="84" cy="51" rx="6.5" ry="8" fill="url(#yb-eye)" className="yb-eye" />
        </g>
        {/* Og‘iz */}
        <path d="M62 63 q8 6 16 0" fill="none" stroke="#4ade94" strokeWidth="3" strokeLinecap="round" className="yb-mouth" />
        {/* Gapirish to‘lqini */}
        <g className="yb-talk" fill="#4ade94">
          <rect x="60" y="60" width="3" height="8" rx="1.5" />
          <rect x="65" y="58" width="3" height="12" rx="1.5" />
          <rect x="70" y="60" width="3" height="8" rx="1.5" />
          <rect x="75" y="58" width="3" height="12" rx="1.5" />
        </g>
      </g>
    </svg>
  );
}
