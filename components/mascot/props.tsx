/**
 * Merchie's floating props, drawn like glossy 3D app icons rather than flat clip art:
 * every object has a lit gradient body, a darker rim/side for thickness, a specular
 * highlight, and one or two real-world details (clip, wax seal, reeded edge, wood grain).
 * Each prop owns its gradients; `uid` keeps ids unique per Mascot instance.
 */
type P = { uid: string };

const g = (uid: string, k: string) => `${uid}-p-${k}`;
const u = (uid: string, k: string) => `url(#${g(uid, k)})`;

/** Clipboard with a legal document: blue board, steel clip, ruled text, wax seal. */
export function Document({ uid }: P) {
  return (
    <g transform="rotate(12 206 136)">
      <defs>
        <linearGradient id={g(uid, "board")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5AA6F5" />
          <stop offset="1" stopColor="#1B6FD8" />
        </linearGradient>
        <linearGradient id={g(uid, "paper")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#EAF3FE" />
        </linearGradient>
        <linearGradient id={g(uid, "clip")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F4F7FB" />
          <stop offset="0.5" stopColor="#B9C4D3" />
          <stop offset="1" stopColor="#8592A6" />
        </linearGradient>
        <radialGradient id={g(uid, "seal")} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#FF8A8A" />
          <stop offset="1" stopColor="#D63A3A" />
        </radialGradient>
      </defs>
      {/* board thickness, then face */}
      <rect x="187.5" y="110.5" width="40" height="50" rx="6" fill="#134F9E" />
      <rect
        x="186"
        y="108"
        width="40"
        height="50"
        rx="6"
        fill={u(uid, "board")}
      />
      <rect
        x="186"
        y="108"
        width="40"
        height="50"
        rx="6"
        fill="none"
        stroke="#FFFFFF"
        strokeOpacity="0.35"
      />
      {/* paper */}
      <path
        d="M190 115 h26 l6 6 v32 a2 2 0 0 1 -2 2 h-30 a2 2 0 0 1 -2 -2 v-36 a2 2 0 0 1 2 -2z"
        fill={u(uid, "paper")}
      />
      <path d="M216 115 v4 a2 2 0 0 0 2 2 h4z" fill="#C9DDF6" />
      <rect x="192.5" y="124" width="14" height="2.6" rx="1.3" fill="#1B6FD8" />
      <rect x="192.5" y="129.5" width="24" height="2" rx="1" fill="#B8D3F3" />
      <rect x="192.5" y="134" width="21" height="2" rx="1" fill="#B8D3F3" />
      <rect x="192.5" y="138.5" width="16" height="2" rx="1" fill="#B8D3F3" />
      {/* signature */}
      <path
        d="M193 149 q3 -5 5 0 t5 -1 q2 -2 4 1"
        fill="none"
        stroke="#7A8AA3"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      {/* wax seal with ribbon tails */}
      <path d="M213 150 l-2.5 8 3 -1.6 1.8 2.8 1 -8z" fill="#B42C2C" />
      <path d="M218 150 l2.5 8 -3 -1.6 -1.8 2.8 -1 -8z" fill="#B42C2C" />
      <circle cx="215.5" cy="148" r="5.6" fill={u(uid, "seal")} />
      <circle
        cx="215.5"
        cy="148"
        r="3.4"
        fill="none"
        stroke="#FFD0D0"
        strokeOpacity="0.7"
        strokeWidth="0.9"
      />
      <circle cx="213.7" cy="146.2" r="1.3" fill="#FFFFFF" opacity="0.7" />
      {/* steel clip */}
      <rect
        x="198"
        y="104"
        width="16"
        height="9"
        rx="3"
        fill={u(uid, "clip")}
        stroke="#6E7A8E"
        strokeWidth="0.8"
      />
      <rect
        x="202.5"
        y="101"
        width="7"
        height="5"
        rx="2.5"
        fill="none"
        stroke="#8592A6"
        strokeWidth="1.6"
      />
      <rect
        x="199.5"
        y="105"
        width="13"
        height="1.6"
        rx="0.8"
        fill="#FFFFFF"
        opacity="0.8"
      />
      {/* sheen across the board */}
      <path d="M186 116 q0 -8 8 -8 h8 l-16 18z" fill="#FFFFFF" opacity="0.18" />
    </g>
  );
}

/** Walnut judge's gavel with brass bands. */
export function Gavel({ uid }: P) {
  return (
    <g transform="rotate(-24 30 140)">
      <defs>
        <linearGradient id={g(uid, "wood")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#C98656" />
          <stop offset="0.45" stopColor="#9A5A30" />
          <stop offset="1" stopColor="#6A3818" />
        </linearGradient>
        <linearGradient id={g(uid, "handle")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7A4320" />
          <stop offset="0.4" stopColor="#C2814F" />
          <stop offset="1" stopColor="#6A3818" />
        </linearGradient>
        <linearGradient id={g(uid, "brass")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFE9A3" />
          <stop offset="0.5" stopColor="#E0A92E" />
          <stop offset="1" stopColor="#A5701A" />
        </linearGradient>
        <linearGradient id={g(uid, "cap")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#B87444" />
          <stop offset="1" stopColor="#7E451F" />
        </linearGradient>
      </defs>
      {/* handle with a rounded knob */}
      <rect
        x="26.5"
        y="104"
        width="7"
        height="40"
        rx="3.5"
        fill={u(uid, "handle")}
      />
      <circle cx="30" cy="145" r="4.6" fill="#7A4320" />
      {/* head: a cylinder lying sideways */}
      <rect x="11" y="88" width="38" height="20" rx="4" fill={u(uid, "wood")} />
      <ellipse cx="11.5" cy="98" rx="3.6" ry="10" fill={u(uid, "cap")} />
      <ellipse cx="48.5" cy="98" rx="3.6" ry="10" fill={u(uid, "cap")} />
      <ellipse
        cx="48.5"
        cy="98"
        rx="2.2"
        ry="7"
        fill="none"
        stroke="#5C2E12"
        strokeOpacity="0.5"
      />
      {/* brass bands */}
      <rect x="16" y="88" width="4.5" height="20" fill={u(uid, "brass")} />
      <rect x="39.5" y="88" width="4.5" height="20" fill={u(uid, "brass")} />
      {/* grain + specular */}
      <path
        d="M23 94 q8 -1.5 14 0"
        fill="none"
        stroke="#5C2E12"
        strokeOpacity="0.35"
        strokeWidth="0.8"
      />
      <path
        d="M23 102 q7 1.5 14 0"
        fill="none"
        stroke="#5C2E12"
        strokeOpacity="0.3"
        strokeWidth="0.8"
      />
      <rect
        x="13"
        y="90.5"
        width="34"
        height="3"
        rx="1.5"
        fill="#FFFFFF"
        opacity="0.32"
      />
    </g>
  );
}

/** Two fanned banknotes: guilloche border, watermark oval, denomination. */
export function Banknote({ uid }: P) {
  return (
    <g transform="rotate(14 206 136)">
      <defs>
        <linearGradient id={g(uid, "note")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7FE0AE" />
          <stop offset="0.55" stopColor="#3DBE84" />
          <stop offset="1" stopColor="#23935F" />
        </linearGradient>
        <linearGradient id={g(uid, "note2")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5CCB95" />
          <stop offset="1" stopColor="#1E7D50" />
        </linearGradient>
        <radialGradient id={g(uid, "mark")} cx="0.4" cy="0.35" r="0.8">
          <stop offset="0" stopColor="#F4FFF9" />
          <stop offset="1" stopColor="#BFEFD5" />
        </radialGradient>
      </defs>
      {/* back note */}
      <g transform="rotate(-10 207 132)">
        <rect
          x="183"
          y="114"
          width="48"
          height="28"
          rx="4"
          fill={u(uid, "note2")}
        />
      </g>
      {/* front note, gently curled */}
      <path
        d="M182 120 q24 -4 48 0 v26 q-24 -4 -48 0z"
        fill="#1A7A4C"
        transform="translate(1 1.5)"
      />
      <path d="M182 120 q24 -4 48 0 v26 q-24 -4 -48 0z" fill={u(uid, "note")} />
      <path
        d="M185.5 122.5 q20.5 -3.4 41 0 v21 q-20.5 -3.4 -41 0z"
        fill="none"
        stroke="#E6FFF2"
        strokeOpacity="0.75"
        strokeWidth="0.9"
      />
      {/* guilloche wave */}
      <path
        d="M187 140 q2.5 -3 5 0 t5 0 t5 0 t5 0 t5 0 t5 0 t5 0 t3 0"
        fill="none"
        stroke="#E6FFF2"
        strokeOpacity="0.45"
        strokeWidth="0.8"
      />
      {/* watermark + baht */}
      <ellipse cx="217" cy="131" rx="7" ry="8" fill={u(uid, "mark")} />
      <text
        x="217"
        y="135"
        textAnchor="middle"
        fontSize="10.5"
        fontWeight="800"
        fill="#1E8C5A"
        fontFamily="var(--font-round), sans-serif"
      >
        ฿
      </text>
      <text
        x="189"
        y="131"
        fontSize="7"
        fontWeight="800"
        fill="#F4FFF9"
        fontFamily="var(--font-round), sans-serif"
      >
        1000
      </text>
      <path
        d="M182 120 q24 -4 48 0 v4 q-24 -4 -48 0z"
        fill="#FFFFFF"
        opacity="0.22"
      />
    </g>
  );
}

/** Thick gold coin: visible reeded edge, raised rim, embossed baht. */
export function Coin({ uid }: P) {
  return (
    <g>
      <defs>
        <radialGradient id={g(uid, "gold")} cx="0.35" cy="0.3" r="0.85">
          <stop offset="0" stopColor="#FFF2B0" />
          <stop offset="0.45" stopColor="#FFCB2E" />
          <stop offset="1" stopColor="#E09A00" />
        </radialGradient>
        <linearGradient id={g(uid, "edge")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#B57600" />
          <stop offset="0.5" stopColor="#E8A800" />
          <stop offset="1" stopColor="#9C6400" />
        </linearGradient>
      </defs>
      {/* edge (thickness) with reeding */}
      <ellipse cx="29.5" cy="108.5" rx="16" ry="16" fill={u(uid, "edge")} />
      {Array.from({ length: 9 }, (_, i) => {
        const a = (Math.PI / 10) * (i + 0.5) + Math.PI * 0.05;
        const x = 29.5 + Math.cos(a) * 15.6;
        const y = 108.5 + Math.sin(a) * 15.6;
        return (
          <circle key={i} cx={x} cy={y} r="0.7" fill="#7A4D00" opacity="0.55" />
        );
      })}
      {/* face */}
      <circle cx="28" cy="106" r="15.5" fill={u(uid, "gold")} />
      <circle
        cx="28"
        cy="106"
        r="12"
        fill="none"
        stroke="#C98A00"
        strokeWidth="1.2"
      />
      <circle
        cx="28"
        cy="106"
        r="11"
        fill="none"
        stroke="#FFF2B0"
        strokeOpacity="0.8"
        strokeWidth="0.8"
      />
      {/* embossed baht: shadow, then lit glyph */}
      <text
        x="28.6"
        y="111.6"
        textAnchor="middle"
        fontSize="14"
        fontWeight="800"
        fill="#A86F00"
        fontFamily="var(--font-round), sans-serif"
      >
        ฿
      </text>
      <text
        x="28"
        y="111"
        textAnchor="middle"
        fontSize="14"
        fontWeight="800"
        fill="#FFE27A"
        fontFamily="var(--font-round), sans-serif"
      >
        ฿
      </text>
      {/* specular + sparkle */}
      <path
        d="M17 100 a12 12 0 0 1 9 -8"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity="0.8"
      />
      <path
        d="M43 92 q0 4 4 4 q-4 0 -4 4 q0 -4 -4 -4 q4 0 4 -4z"
        fill="#FFFFFF"
      />
    </g>
  );
}

/** Star wand: beveled star, lacquered stick, gold ferrule, trailing sparkles. */
export function Wand({ uid }: P) {
  const star = (cx: number, cy: number, r: number) => {
    const pts = Array.from({ length: 10 }, (_, i) => {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const rr = i % 2 ? r * 0.46 : r;
      return `${(cx + Math.cos(a) * rr).toFixed(2)},${(cy + Math.sin(a) * rr).toFixed(2)}`;
    });
    return `M${pts.join(" L")}Z`;
  };
  return (
    <g transform="rotate(-20 30 140)">
      <defs>
        <linearGradient id={g(uid, "star")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFF3A6" />
          <stop offset="0.5" stopColor="#FFD23F" />
          <stop offset="1" stopColor="#F2A600" />
        </linearGradient>
        <linearGradient id={g(uid, "stick")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#E86FA0" />
          <stop offset="0.45" stopColor="#FFB3D2" />
          <stop offset="1" stopColor="#D9578C" />
        </linearGradient>
        <linearGradient id={g(uid, "ferrule")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#C98A00" />
          <stop offset="0.5" stopColor="#FFE58A" />
          <stop offset="1" stopColor="#B57600" />
        </linearGradient>
      </defs>
      <rect
        x="27"
        y="100"
        width="6"
        height="44"
        rx="3"
        fill={u(uid, "stick")}
      />
      <rect
        x="26"
        y="99"
        width="8"
        height="5"
        rx="1.5"
        fill={u(uid, "ferrule")}
      />
      {/* star: dark rim offset for depth, face, inner bevel, shine */}
      <path
        d={star(31, 87.5, 16)}
        fill="#C98500"
        strokeLinejoin="round"
        stroke="#C98500"
        strokeWidth="2"
      />
      <path
        d={star(30, 86, 16)}
        fill={u(uid, "star")}
        stroke="#F2B300"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d={star(30, 86.5, 8)} fill="#FFF7C9" opacity="0.55" />
      <circle cx="25" cy="80" r="2" fill="#FFFFFF" opacity="0.9" />
      {/* sparkles */}
      <path
        d="M50 76 q0 3.5 3.5 3.5 q-3.5 0 -3.5 3.5 q0 -3.5 -3.5 -3.5 q3.5 0 3.5 -3.5z"
        fill="#FF9EC4"
      />
      <path
        d="M12 72 q0 2.5 2.5 2.5 q-2.5 0 -2.5 2.5 q0 -2.5 -2.5 -2.5 q2.5 0 2.5 -2.5z"
        fill="#7DB7F7"
      />
    </g>
  );
}

/** Heater shield: gold rim, glossy red field, raised check, rivets. */
export function ShieldProp({ uid }: P) {
  const outline =
    "M28 84 l18 6.5 v13 c0 12.5 -7.8 20 -18 24.5 c-10.2 -4.5 -18 -12 -18 -24.5 v-13 z";
  const inner =
    "M28 89.5 l13 4.7 v9.6 c0 9.4 -5.6 15 -13 18.6 c-7.4 -3.6 -13 -9.2 -13 -18.6 v-9.6 z";
  return (
    <g>
      <defs>
        <linearGradient id={g(uid, "rim")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFE9A3" />
          <stop offset="0.5" stopColor="#E0A92E" />
          <stop offset="1" stopColor="#A5701A" />
        </linearGradient>
        <linearGradient id={g(uid, "field")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FF6B7A" />
          <stop offset="1" stopColor="#C81E3A" />
        </linearGradient>
      </defs>
      <path d={outline} fill="#8A5A10" transform="translate(1.2 1.6)" />
      <path d={outline} fill={u(uid, "rim")} />
      <path d={inner} fill={u(uid, "field")} />
      {/* raised check: shadow, then white */}
      <path
        d="M21.5 106 l5 5 9.5 -10.5"
        fill="none"
        stroke="#7A1022"
        strokeOpacity="0.45"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(0.8 1.2)"
      />
      <path
        d="M21.5 106 l5 5 9.5 -10.5"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* rivets */}
      {[
        [15.5, 95],
        [40.5, 95],
      ].map(([x, y]) => (
        <circle
          key={x}
          cx={x}
          cy={y}
          r="1.3"
          fill="#FFF4C8"
          stroke="#A5701A"
          strokeWidth="0.5"
        />
      ))}
      {/* sheen */}
      <path
        d="M15 95 v8 c0 5 1.5 8.5 4 11.5 l9 -24.8 z"
        fill="#FFFFFF"
        opacity="0.2"
      />
    </g>
  );
}

/** Magnifier: chrome ring, tinted glass with reflections, leather handle. */
export function Magnifier({ uid }: P) {
  return (
    <g transform="rotate(-18 206 136)">
      <defs>
        <linearGradient id={g(uid, "chrome")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="0.35" stopColor="#C9D2DE" />
          <stop offset="0.7" stopColor="#8592A6" />
          <stop offset="1" stopColor="#D9E0EA" />
        </linearGradient>
        <radialGradient id={g(uid, "glass")} cx="0.35" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="0.6" stopColor="#DDEEFF" stopOpacity="0.65" />
          <stop offset="1" stopColor="#A9CFF5" stopOpacity="0.7" />
        </radialGradient>
        <linearGradient id={g(uid, "grip")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#5E0C1B" />
          <stop offset="0.45" stopColor="#B4243E" />
          <stop offset="1" stopColor="#5E0C1B" />
        </linearGradient>
      </defs>
      {/* handle: ferrule + leather grip with stitch rings */}
      <rect
        x="202.5"
        y="133"
        width="7"
        height="6"
        rx="1.5"
        fill={u(uid, "chrome")}
      />
      <rect
        x="202"
        y="138"
        width="8"
        height="19"
        rx="4"
        fill={u(uid, "grip")}
      />
      <rect x="202" y="143" width="8" height="1" fill="#3E0812" opacity="0.5" />
      <rect x="202" y="149" width="8" height="1" fill="#3E0812" opacity="0.5" />
      {/* lens */}
      <circle
        cx="206"
        cy="121"
        r="14.5"
        fill="#6E7A8E"
        transform="translate(0.8 1.2)"
      />
      <circle cx="206" cy="121" r="14.5" fill={u(uid, "chrome")} />
      <circle cx="206" cy="121" r="11" fill={u(uid, "glass")} />
      <circle
        cx="206"
        cy="121"
        r="11"
        fill="none"
        stroke="#6E7A8E"
        strokeOpacity="0.5"
        strokeWidth="0.8"
      />
      {/* what it's inspecting: a line of listing text, magnified */}
      <rect
        x="199"
        y="121"
        width="11"
        height="2.4"
        rx="1.2"
        fill="#C81E3A"
        opacity="0.55"
      />
      <rect
        x="199"
        y="126"
        width="7"
        height="2"
        rx="1"
        fill="#7A8AA3"
        opacity="0.45"
      />
      {/* reflections */}
      <path
        d="M198.5 116 a9 9 0 0 1 8 -5"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <circle cx="212.5" cy="127" r="1.4" fill="#FFFFFF" opacity="0.85" />
    </g>
  );
}

/** Rainbow Royal: gold sceptre topped with a faceted rainbow crystal in a crown cup, glowing. */
export function Sceptre({ uid }: P) {
  return (
    <g transform="rotate(-18 30 140)">
      <defs>
        <linearGradient id={g(uid, "sgold")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#B87800" />
          <stop offset="0.4" stopColor="#FFE58A" />
          <stop offset="1" stopColor="#C98A00" />
        </linearGradient>
        <linearGradient id={g(uid, "crystal")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFB3C7" />
          <stop offset="0.3" stopColor="#FFF1A1" />
          <stop offset="0.55" stopColor="#B8F0C8" />
          <stop offset="0.8" stopColor="#A9D8FF" />
          <stop offset="1" stopColor="#C9B5FF" />
        </linearGradient>
        <radialGradient id={g(uid, "glow")} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="0.5" stopColor="#E9DDFF" stopOpacity="0.7" />
          <stop offset="1" stopColor="#E9DDFF" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* halo */}
      <circle cx="30" cy="74" r="25" fill={u(uid, "glow")} />
      {/* staff with jeweled rings and a knob */}
      <rect x="27" y="92" width="6" height="52" rx="3" fill={u(uid, "sgold")} />
      {[104, 119, 133].map((y) => (
        <rect key={y} x="25.5" y={y} width="9" height="3.4" rx="1.7" fill={u(uid, "sgold")} stroke="#A86F00" strokeWidth="0.5" />
      ))}
      <circle cx="30" cy="120.7" r="1.5" fill="#E0306A" />
      <circle cx="30" cy="147" r="4.5" fill={u(uid, "sgold")} stroke="#A86F00" strokeWidth="0.6" />
      {/* crown cup holding the gem */}
      <path d="M19 86 L21 93 L39 93 L41 86 L36 89 L30 84 L24 89 Z" fill={u(uid, "sgold")} stroke="#A86F00" strokeWidth="0.7" strokeLinejoin="round" />
      {/* faceted crystal: rim offset for depth, face, facets, shine */}
      <path d="M22 64 L38 64 L44 72 L30 90 L16 72 Z" fill="#8E6FE0" transform="translate(0.8 1.2)" />
      <path d="M22 64 L38 64 L44 72 L30 90 L16 72 Z" fill={u(uid, "crystal")} stroke="#FFFFFF" strokeWidth="0.9" strokeLinejoin="round" />
      <path d="M16 72 L44 72 M22 64 L26 72 L30 64 L34 72 L38 64 M26 72 L30 90 L34 72" fill="none" stroke="#FFFFFF" strokeOpacity="0.75" strokeWidth="0.7" />
      <path d="M22 64 L26 72 L16 72 Z" fill="#FFFFFF" opacity="0.55" />
      {/* sparkles around the gem */}
      <path d="M47 60 q0 3.5 3.5 3.5 q-3.5 0 -3.5 3.5 q0 -3.5 -3.5 -3.5 q3.5 0 3.5 -3.5z" fill="#FFFFFF" />
      <path d="M12 58 q0 2.5 2.5 2.5 q-2.5 0 -2.5 2.5 q0 -2.5 -2.5 -2.5 q2.5 0 2.5 -2.5z" fill="#FFD45E" />
    </g>
  );
}

/** Rainbow Royal: golden scales of justice, gem finial, a little off balance for life. */
export function Scales({ uid }: P) {
  return (
    <g transform="rotate(6 208 134) translate(208 134) scale(1.2) translate(-208 -134)">
      <defs>
        <linearGradient id={g(uid, "scgold")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFF0B3" />
          <stop offset="0.5" stopColor="#FFC93C" />
          <stop offset="1" stopColor="#C98A00" />
        </linearGradient>
        <linearGradient id={g(uid, "pole")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#B87800" />
          <stop offset="0.45" stopColor="#FFE58A" />
          <stop offset="1" stopColor="#B87800" />
        </linearGradient>
        <radialGradient id={g(uid, "gem")} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#E7DBFF" />
          <stop offset="1" stopColor="#7A4FE0" />
        </radialGradient>
      </defs>
      {/* base */}
      <ellipse cx="208" cy="159" rx="13" ry="3.6" fill="#A86F00" />
      <path d="M197 158 q11 -7 22 0 z" fill={u(uid, "scgold")} />
      <circle cx="208" cy="155.5" r="1.6" fill="#E0306A" />
      {/* pillar */}
      <rect x="205.6" y="112" width="4.8" height="44" rx="2.4" fill={u(uid, "pole")} />
      {/* beam, tilted a touch */}
      <g transform="rotate(-6 208 115)">
        <rect x="186" y="113" width="44" height="4" rx="2" fill={u(uid, "scgold")} stroke="#A86F00" strokeWidth="0.5" />
        {/* chains */}
        <path d="M188 117 L182 136 M188 117 L194 136" stroke="#C98A00" strokeWidth="1.1" />
        <path d="M228 117 L222 136 M228 117 L234 136" stroke="#C98A00" strokeWidth="1.1" />
      </g>
      {/* pans (left hangs lower: the beam tips) */}
      <g transform="translate(0 2.3)">
        <path d="M180 135 q8 10 16 0 z" fill={u(uid, "scgold")} stroke="#A86F00" strokeWidth="0.6" />
        <rect x="181" y="134.3" width="14" height="1.6" rx="0.8" fill="#FFF3C4" />
      </g>
      <g transform="translate(0 -2.3)">
        <path d="M220 135 q8 10 16 0 z" fill={u(uid, "scgold")} stroke="#A86F00" strokeWidth="0.6" />
        <rect x="221" y="134.3" width="14" height="1.6" rx="0.8" fill="#FFF3C4" />
      </g>
      {/* finial gem */}
      <circle cx="208" cy="109" r="5" fill={u(uid, "gem")} stroke="#FFE58A" strokeWidth="1.4" />
      <circle cx="206.5" cy="107.5" r="1.4" fill="#FFFFFF" opacity="0.9" />
    </g>
  );
}
