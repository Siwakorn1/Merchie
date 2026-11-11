"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  Banknote,
  Coin,
  Document,
  Gavel,
  Magnifier,
  Scales,
  Sceptre,
  ShieldProp,
  Wand,
} from "@/components/mascot/props";
import {
  motion,
  useAnimate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { cn } from "@/lib/utils";

/** Visual styles in the collection. "jelly" is the main look. */
export type MascotStyle =
  "jelly" | "guardian" | "money" | "fantasy" | "rainbow";

/** Which UI accent each look switches the app to. */
export const LOOK_ACCENT: Record<
  MascotStyle,
  "blue" | "red" | "green" | "yellow" | "violet"
> = {
  jelly: "blue",
  guardian: "red",
  money: "green",
  fantasy: "yellow",
  rainbow: "violet",
};

type Look = {
  body: [string, string, string, string]; // radial stops, light center → edge
  lid: [string, string, string, string]; // opaque, so eyelids never show pupils through
  shine: number; // soft top highlight opacity
  brow: string;
  stars?: string[]; // sparkle colors
  /** pastel rainbow body (diagonal stops) instead of the single-hue radial */
  rainbow?: string[];
  /** a little gold crown on top (top tier only) */
  crown?: boolean;
  /** what Merchie holds: [left hand, right hand] */
  hold: [
    "gavel" | "coin" | "wand" | "shield" | "sceptre",
    "document" | "banknote" | "magnifier" | "scales",
  ];
};

const LOOKS: Record<MascotStyle, Look> = {
  rainbow: {
    // Coach only: pastel rainbow gummy with a gold crown
    body: ["#FFFFFF", "#F6EEFF", "#D9C8FF", "#A98BFF"],
    lid: ["#FFFFFF", "#F6EEFF", "#D9C8FF", "#A98BFF"],
    rainbow: ["#FFB3C7", "#FFD39E", "#FFF1A1", "#B8F0C8", "#A9D8FF", "#C9B5FF"],
    crown: true,
    shine: 0.75,
    brow: "#5B2DB8",
    stars: ["#FF9EC4", "#FFD45E", "#7DB7F7", "#B8F0C8", "#FFFFFF"],
    hold: ["sceptre", "scales"],
  },
  jelly: {
    body: ["#F2FAFF", "#B9DDFD", "#6FB3F7", "#3F93EE"],
    lid: ["#F6FBFF", "#BEDFFD", "#7CBBF8", "#4C9BF0"],
    shine: 0.7,
    brow: "#1B6FD8",
    hold: ["gavel", "document"],
  },
  guardian: {
    // red guardian: a shield to protect the shop, a magnifier to inspect listings and reviews
    body: ["#FFF4F4", "#FFC2C6", "#FF7A84", "#E8455A"],
    lid: ["#FFF4F4", "#FFC2C6", "#FF7A84", "#E8455A"],
    shine: 0.7,
    brow: "#A3182F",
    hold: ["shield", "magnifier"],
  },
  money: {
    // "เหนี่ยวทรัพย์": lucky green, holding a banknote and a coin
    body: ["#F0FFF7", "#B4EACD", "#5FCB97", "#2E9F6B"],
    lid: ["#F0FFF7", "#B4EACD", "#5FCB97", "#2E9F6B"],
    shine: 0.7,
    brow: "#0E6B45",
    stars: ["#F5B800", "#FFFFFF"],
    hold: ["coin", "banknote"],
  },
  fantasy: {
    // sunny yellow with sparkles and a star wand
    body: ["#FFFDF2", "#FFF0AE", "#FFD45E", "#F2B300"],
    lid: ["#FFFDF2", "#FFF0AE", "#FFD45E", "#F2B300"],
    shine: 0.75,
    brow: "#9A6400",
    stars: ["#FF9EC4", "#7DB7F7", "#FFFFFF"],
    hold: ["wand", "document"],
  },
};

/** Moods driven by the app. */
export type Mood =
  "delighted" | "happy" | "okay" | "worried" | "sad" | "shocked";
/** Faces also include short-lived reactions to touch. */
type Face = Mood | "joy" | "shy";

type FaceSpec = {
  lid: number; // 0 = open, 1 = closed (top eyelid coverage)
  tilt: number; // eyelid slant in degrees; + = outer corners droop
  smile: boolean; // closed "^^" eyes
  brow: number | null; // brow slant in degrees, null = hidden
  browLift: number; // brow raise in px
  pupil: number; // pupil radius
  bias: [number, number]; // gaze bias (-1..1)
  tear: boolean;
  blush: boolean;
  band: number; // eye-band scale
  body: number; // body scaleY (sad = slightly deflated)
};

const FACES: Record<Face, FaceSpec> = {
  delighted: {
    lid: 0,
    tilt: 0,
    smile: true,
    brow: null,
    browLift: 0,
    pupil: 13,
    bias: [0, -0.2],
    tear: false,
    blush: true,
    band: 1.03,
    body: 1,
  },
  okay: {
    lid: 0.16,
    tilt: 0,
    smile: false,
    brow: null,
    browLift: 0,
    pupil: 12.5,
    bias: [0, 0],
    tear: false,
    blush: false,
    band: 1,
    body: 1,
  },
  happy: {
    lid: 0,
    tilt: 0,
    smile: false,
    brow: null,
    browLift: 0,
    pupil: 13,
    bias: [0, 0],
    tear: false,
    blush: false,
    band: 1,
    body: 1,
  },
  joy: {
    lid: 0,
    tilt: 0,
    smile: true,
    brow: null,
    browLift: 0,
    pupil: 13,
    bias: [0, -0.3],
    tear: false,
    blush: true,
    band: 1.05,
    body: 1,
  },
  worried: {
    lid: 0.34,
    tilt: 12,
    smile: false,
    brow: 14,
    browLift: 0,
    pupil: 12,
    bias: [0, 0],
    tear: false,
    blush: false,
    band: 1,
    body: 1,
  },
  sad: {
    lid: 0.46,
    tilt: 18,
    smile: false,
    brow: 20,
    browLift: 2,
    pupil: 12,
    bias: [0, 0.9],
    tear: true,
    blush: false,
    band: 0.97,
    body: 0.96,
  },
  shocked: {
    lid: 0,
    tilt: 0,
    smile: false,
    brow: 0,
    browLift: -7,
    pupil: 7.5,
    bias: [0, 0],
    tear: false,
    blush: false,
    band: 1.1,
    body: 1.02,
  },
  shy: {
    lid: 0.3,
    tilt: 0,
    smile: false,
    brow: null,
    browLift: 0,
    pupil: 12,
    bias: [-0.9, 0.7],
    tear: false,
    blush: true,
    band: 0.98,
    body: 1,
  },
};

// Geometry (viewBox 240 × 196)
const EX = 124; // eye band center
const EY = 112;
const BW = 108; // band size
const BH = 42;
const PL = EX - 24; // pupil centers
const PR = EX + 24;
const ER = 20; // split eyes: horizontal radius of each eye (vertical = BH / 2)
const LID_H = 64;

const spring = { type: "spring", stiffness: 420, damping: 30 } as const;

export function Mascot({
  mood = "happy",
  variant = "jelly",
  outfit = true,
  eyes = "dot",
  size = 220,
  interactive = true,
  onPoke,
  className,
}: {
  mood?: Mood;
  variant?: MascotStyle;
  /** props in hand (document, gavel, coin…) */
  outfit?: boolean;
  /** plain black dot eyes (default), two white eyes, or the original single band */
  eyes?: "dot" | "split" | "band";
  size?: number;
  interactive?: boolean;
  /** called when Merchie is tapped */
  onPoke?: () => void;
  className?: string;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const id = (k: string) => `m${uid}-${k}`;
  const reduce = useReducedMotion();
  // every look gets the translucent "jelly" treatment (rim light, gloss, wisp)
  const jelly = true;
  const look = LOOKS[variant];
  const props = outfit && size >= 80; // hand-held props are too fiddly at icon sizes

  const [reaction, setReaction] = useState<Face | null>(null);
  const [blink, setBlink] = useState(false);
  const face = FACES[reaction ?? mood];

  // ---------- Gaze (follows pointer, wanders when idle) ----------
  const rootRef = useRef<HTMLDivElement>(null);
  const tx = useMotionValue(0);
  const ty = useMotionValue(0);
  const gx = useSpring(tx, { stiffness: 140, damping: 18 });
  const gy = useSpring(ty, { stiffness: 140, damping: 18 });
  const [bx, by] = face.bias;
  const pupilX = useTransform(gx, (v) => clamp(v + bx, -1, 1) * 9);
  const pupilY = useTransform(gy, (v) => clamp(v + by, -1, 1) * 4.5);
  const bandX = useTransform(gx, (v) => v * 3);
  const bandY = useTransform(gy, (v) => v * 1.5);
  const shineX = useTransform(gx, (v) => v * -3);

  useEffect(() => {
    let last = 0;
    const onMove = (e: PointerEvent) => {
      const el = rootRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      tx.set(clamp((e.clientX - cx) / (window.innerWidth * 0.35), -1, 1));
      ty.set(clamp((e.clientY - cy) / (window.innerHeight * 0.35), -1, 1));
      last = Date.now();
    };
    const wander = setInterval(() => {
      if (Date.now() - last < 2500) return;
      const glance = Math.random() < 0.3;
      tx.set(
        glance
          ? Math.random() < 0.5
            ? -0.8
            : 0.8
          : (Math.random() - 0.5) * 0.6,
      );
      ty.set((Math.random() - 0.5) * 0.4);
    }, 2400);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      clearInterval(wander);
    };
  }, [tx, ty]);

  // ---------- Blinking ----------
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const loop = () => {
      t = setTimeout(
        () => {
          setBlink(true);
          setTimeout(() => setBlink(false), 130);
          if (Math.random() < 0.25) {
            setTimeout(() => setBlink(true), 260);
            setTimeout(() => setBlink(false), 390);
          }
          loop();
        },
        2200 + Math.random() * 3000,
      );
    };
    loop();
    return () => clearTimeout(t);
  }, []);

  // ---------- Touch reactions ----------
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reactTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressed = useRef(false);

  const react = (f: Face | null, ms?: number) => {
    if (reactTimer.current) clearTimeout(reactTimer.current);
    setReaction(f);
    if (ms) reactTimer.current = setTimeout(() => setReaction(null), ms);
  };

  const onPointerDown = () => {
    longPressed.current = false;
    pressTimer.current = setTimeout(() => {
      longPressed.current = true;
      react("shy");
      navigator.vibrate?.(6);
    }, 480);
  };
  const onPointerUp = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
    if (longPressed.current) react("shy", 900);
  };
  const onTap = () => {
    onPoke?.();
    if (longPressed.current) return;
    navigator.vibrate?.(8);
    react("joy", 1000);
    animate(
      scope.current,
      { scaleX: [1, 1.16, 0.94, 1.03, 1], scaleY: [1, 0.84, 1.07, 0.99, 1] },
      { duration: 0.6, ease: "easeOut" },
    );
  };

  const lidCover = blink ? 1 : face.lid;
  const lidY = lidCover * (BH + 6);

  return (
    <motion.div
      ref={rootRef}
      className={cn(
        "chrome relative select-none",
        interactive && "cursor-grab active:cursor-grabbing",
        className,
      )}
      style={{
        width: size,
        height: (size * 196) / 240,
        touchAction: interactive ? "none" : undefined,
      }}
      drag={interactive}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.35}
      dragTransition={{ bounceStiffness: 500, bounceDamping: 18 }}
      onDragStart={() => react("shocked")}
      onDragEnd={() => react("joy", 700)}
      onTap={interactive ? onTap : undefined}
      onPointerDown={interactive ? onPointerDown : undefined}
      onPointerUp={interactive ? onPointerUp : undefined}
      onPointerCancel={interactive ? onPointerUp : undefined}
      role="img"
      aria-label="Merchie"
    >
      {/* ground shadow (doesn't float) */}
      <svg
        viewBox="0 0 240 196"
        className="absolute inset-0 size-full overflow-visible"
        aria-hidden
      >
        <motion.ellipse
          cx={EX}
          cy={186}
          rx={70}
          ry={6}
          fill="#1B6FD8"
          opacity={0.13}
          animate={
            reduce
              ? undefined
              : { scaleX: [1, 0.88, 1], opacity: [0.13, 0.08, 0.13] }
          }
          transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        />
      </svg>

      {/* floating body */}
      <motion.div
        className="absolute inset-0"
        animate={reduce ? undefined : { y: [0, -6, 0] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div
          ref={scope}
          className="size-full"
          style={{ transformOrigin: "50% 92%" }}
        >
          <motion.svg
            viewBox="0 0 240 196"
            className="size-full overflow-visible"
            initial={false}
            animate={{ scaleY: face.body }}
            transition={spring}
            style={{ transformOrigin: "50% 95%" }}
            aria-hidden
          >
            <defs>
              <radialGradient
                id={id("body")}
                gradientUnits="userSpaceOnUse"
                cx="112"
                cy="78"
                r="150"
              >
                {look.body.map((c, i) => (
                  <stop key={i} offset={[0, 0.42, 0.8, 1][i]} stopColor={c} />
                ))}
              </radialGradient>
              {look.rainbow && (
                <>
                  <linearGradient
                    id={id("rainbow")}
                    gradientUnits="userSpaceOnUse"
                    x1="30"
                    y1="20"
                    x2="215"
                    y2="180"
                  >
                    {look.rainbow.map((c, i, a) => (
                      <stop key={i} offset={i / (a.length - 1)} stopColor={c} />
                    ))}
                  </linearGradient>
                  <clipPath id={id("bodyclip")}>
                    <BodyShapes wisp={false} />
                  </clipPath>
                  {/* gummy roundness on top of the stripes: lit center, deeper edge */}
                  <radialGradient
                    id={id("gloss")}
                    gradientUnits="userSpaceOnUse"
                    cx="112"
                    cy="78"
                    r="150"
                  >
                    <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.75" />
                    <stop
                      offset="0.45"
                      stopColor="#FFFFFF"
                      stopOpacity="0.15"
                    />
                    <stop
                      offset="0.85"
                      stopColor="#7A5CE0"
                      stopOpacity="0.08"
                    />
                    <stop offset="1" stopColor="#5B3FC4" stopOpacity="0.3" />
                  </radialGradient>
                </>
              )}
              {/* eyelids must stay opaque even when the body is translucent */}
              <radialGradient
                id={id("lid")}
                gradientUnits="userSpaceOnUse"
                cx="112"
                cy="78"
                r="150"
              >
                {look.lid.map((c, i) => (
                  <stop key={i} offset={[0, 0.42, 0.8, 1][i]} stopColor={c} />
                ))}
              </radialGradient>
              {/* glassy inner rim: the shape's edge, eroded and lit */}
              <filter
                id={id("rim")}
                x="-10%"
                y="-10%"
                width="120%"
                height="120%"
              >
                <feMorphology
                  in="SourceAlpha"
                  operator="erode"
                  radius="2.5"
                  result="inner"
                />
                <feComposite
                  in="SourceAlpha"
                  in2="inner"
                  operator="out"
                  result="edge"
                />
                <feGaussianBlur in="edge" stdDeviation="1" result="edgeSoft" />
                <feFlood floodColor="#FFFFFF" floodOpacity="0.95" />
                <feComposite in2="edgeSoft" operator="in" result="rim" />
                <feMerge>
                  <feMergeNode in="SourceGraphic" />
                  <feMergeNode in="rim" />
                </feMerge>
              </filter>
              <linearGradient id={id("band")} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#FFFFFF" />
                <stop offset="1" stopColor="#E4F1FD" />
              </linearGradient>
              <filter
                id={id("soft")}
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >
                <feGaussianBlur stdDeviation="5" />
              </filter>
              <clipPath id={id("clip")}>
                {eyes !== "band" ? (
                  <>
                    <ellipse cx={PL} cy={EY} rx={ER} ry={BH / 2} />
                    <ellipse cx={PR} cy={EY} rx={ER} ry={BH / 2} />
                  </>
                ) : (
                  <rect
                    x={EX - BW / 2}
                    y={EY - BH / 2}
                    width={BW}
                    height={BH}
                    rx={BH / 2}
                  />
                )}
              </clipPath>
            </defs>

            {look.crown && <RoyalAura uid={id("aura")} reduce={!!reduce} />}

            {/* cloud body: overlapping shapes share one gradient, so no seams */}
            <g
              fill={
                look.rainbow ? `url(#${id("rainbow")})` : `url(#${id("body")})`
              }
              filter={jelly ? `url(#${id("rim")})` : undefined}
              opacity={jelly ? 0.86 : 1}
            >
              <BodyShapes wisp={jelly && !look.crown} />
            </g>
            {look.rainbow && (
              // one gloss layer clipped to the body outline, so overlapping lobes don't double up
              <rect
                x="0"
                y="0"
                width="240"
                height="200"
                fill={`url(#${id("gloss")})`}
                clipPath={`url(#${id("bodyclip")})`}
                opacity={0.9}
              />
            )}

            {jelly && (
              <>
                {/* light pooling at the bottom, like a gummy */}
                <ellipse
                  cx={124}
                  cy={160}
                  rx={72}
                  ry={14}
                  fill="#fff"
                  opacity={0.45}
                  filter={`url(#${id("soft")})`}
                />
                {/* crisp specular highlights */}
                <ellipse
                  cx={86}
                  cy={58}
                  rx={17}
                  ry={7.5}
                  fill="#fff"
                  opacity={0.95}
                  transform="rotate(-28 86 58)"
                />
                <circle cx={106} cy={44} r={3.6} fill="#fff" />
              </>
            )}

            {/* soft top highlight (moves opposite the gaze for depth) */}
            <motion.ellipse
              cx={98}
              cy={52}
              rx={30}
              ry={13}
              fill="#fff"
              opacity={look.shine}
              filter={`url(#${id("soft")})`}
              style={{ x: shineX }}
              transform="rotate(-18 98 52)"
            />

            {/* blush */}
            <motion.g
              initial={false}
              animate={{ opacity: face.blush ? 0.38 : jelly ? 0.2 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ellipse
                cx={66}
                cy={136}
                rx={13}
                ry={6.5}
                fill="#FF8FAB"
                filter={`url(#${id("soft")})`}
              />
              <ellipse
                cx={184}
                cy={128}
                rx={12}
                ry={6}
                fill="#FF8FAB"
                filter={`url(#${id("soft")})`}
              />
            </motion.g>

            {look.stars && <Stars reduce={!!reduce} colors={look.stars} />}
            {look.crown && <Crown uid={id("crown")} />}

            {/* face, tilted like the reference art */}
            <g transform={`rotate(-7 ${EX} ${EY})`}>
              {/* brows */}
              <motion.g
                initial={false}
                animate={{
                  opacity: face.brow === null ? 0 : 1,
                  y: face.browLift,
                }}
                transition={spring}
              >
                <Brow x={PL} angle={-(face.brow ?? 0)} color={look.brow} />
                <Brow x={PR} angle={face.brow ?? 0} color={look.brow} />
              </motion.g>

              <motion.g
                style={{ x: bandX, y: bandY }}
                initial={false}
                animate={{ scale: face.band }}
                transition={spring}
              >
                {eyes === "dot" ? null : eyes === "split" ? (
                  // two eyes, each with its own 3D lip
                  [PL, PR].map((cx) => (
                    <g key={cx}>
                      <ellipse
                        cx={cx}
                        cy={EY + 4}
                        rx={ER}
                        ry={BH / 2}
                        fill="#1B6FD8"
                        opacity={0.22}
                      />
                      <ellipse
                        cx={cx}
                        cy={EY}
                        rx={ER}
                        ry={BH / 2}
                        fill={`url(#${id("band")})`}
                      />
                    </g>
                  ))
                ) : (
                  <>
                    {/* band thickness (3D lip) */}
                    <rect
                      x={EX - BW / 2}
                      y={EY - BH / 2 + 5}
                      width={BW}
                      height={BH}
                      rx={BH / 2}
                      fill="#1B6FD8"
                      opacity={0.22}
                    />
                    <rect
                      x={EX - BW / 2}
                      y={EY - BH / 2}
                      width={BW}
                      height={BH}
                      rx={BH / 2}
                      fill={`url(#${id("band")})`}
                    />
                  </>
                )}

                <g clipPath={`url(#${id("clip")})`}>
                  {/* pupils */}
                  <motion.g
                    style={{ x: pupilX, y: pupilY }}
                    initial={false}
                    animate={{ opacity: face.smile ? 0 : 1 }}
                    transition={{ duration: 0.12 }}
                  >
                    {[PL, PR].map((cx) => (
                      <g key={cx}>
                        {eyes === "dot" ? (
                          <motion.g
                            // no separate eyelid: the dot itself squashes shut, so a blink
                            // never shows a patch in a different color from the body
                            initial={false}
                            animate={{
                              scaleY: Math.max(0.1, 1 - lidCover * 0.92),
                            }}
                            transition={{
                              type: "spring",
                              stiffness: 900,
                              damping: 45,
                            }}
                            style={{
                              transformBox: "fill-box",
                              transformOrigin: "50% 75%",
                            }}
                          >
                            {/* minimal: just a glossy black bean, no white */}
                            <motion.ellipse
                              cx={cx}
                              cy={EY + 2}
                              fill="#0A0A0A"
                              initial={false}
                              animate={{
                                rx: face.pupil * 0.72,
                                ry: face.pupil * 0.95,
                              }}
                              transition={spring}
                            />
                            <motion.circle
                              cx={cx + 2.5}
                              cy={EY - 3.5}
                              fill="#fff"
                              initial={false}
                              animate={{ r: face.pupil > 10 ? 2.8 : 1.8 }}
                              transition={spring}
                            />
                          </motion.g>
                        ) : (
                          <>
                            <motion.circle
                              cx={cx}
                              cy={EY}
                              fill="#0A0A0A"
                              initial={false}
                              animate={{ r: face.pupil }}
                              transition={spring}
                            />
                            <motion.circle
                              cx={cx + 4}
                              cy={EY - 4.5}
                              fill="#fff"
                              initial={false}
                              animate={{ r: face.pupil > 10 ? 3.2 : 2 }}
                              transition={spring}
                            />
                          </>
                        )}
                      </g>
                    ))}
                  </motion.g>

                  {/* closed "^^" eyes */}
                  <motion.g
                    initial={false}
                    animate={{
                      opacity: face.smile ? 1 : 0,
                      y: face.smile ? 0 : 4,
                    }}
                    transition={{ duration: 0.15 }}
                  >
                    {[PL, PR].map((cx) => (
                      <path
                        key={cx}
                        d={`M ${cx - 10} ${EY + 4} Q ${cx} ${EY - 10} ${cx + 10} ${EY + 4}`}
                        fill="none"
                        stroke="#0A0A0A"
                        strokeWidth={5}
                        strokeLinecap="round"
                      />
                    ))}
                  </motion.g>

                  {/* upper lids: blink + mood (dot eyes squash instead) */}
                  {eyes !== "dot" && (
                    <>
                      <Lid
                        x={EX - BW / 2 - 12}
                        y={lidY}
                        angle={-face.tilt}
                        fill={`url(#${id("lid")})`}
                      />
                      <Lid
                        x={EX - 2}
                        y={lidY}
                        angle={face.tilt}
                        fill={`url(#${id("lid")})`}
                      />
                    </>
                  )}
                </g>
              </motion.g>

              {/* tear */}
              <motion.path
                d={`M ${PL - 6} ${EY + 24} q 4 6 0 10 q -4 -4 0 -10 z`}
                fill="#ECF8FD"
                stroke="#7DB7F7"
                strokeWidth={1.5}
                initial={false}
                animate={
                  face.tear && !reduce
                    ? { opacity: [0, 1, 1, 0], y: [0, 2, 12, 16] }
                    : { opacity: face.tear ? 1 : 0, y: 0 }
                }
                transition={
                  face.tear && !reduce
                    ? { duration: 2.4, repeat: Infinity, repeatDelay: 0.6 }
                    : { duration: 0.2 }
                }
              />
            </g>
            {props && (
              // right prop floats beside Merchie (no hands), bobbing gently
              <motion.g
                animate={reduce ? undefined : { y: [0, -3, 0] }}
                transition={{
                  duration: 3.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.8,
                }}
              >
                {look.hold[1] === "document" && <Document uid={id("")} />}
                {look.hold[1] === "banknote" && <Banknote uid={id("")} />}
                {look.hold[1] === "magnifier" && <Magnifier uid={id("")} />}
                {look.hold[1] === "scales" && <Scales uid={id("")} />}
              </motion.g>
            )}
            {props && (
              // left prop floats too, on its own rhythm; jumps up when Merchie is shocked
              <motion.g
                animate={reduce ? undefined : { y: [0, -3, 0] }}
                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <motion.g
                  initial={false}
                  animate={
                    face === FACES.shocked
                      ? { rotate: -30, y: -6 }
                      : { rotate: 0, y: 0 }
                  }
                  transition={spring}
                  style={{
                    transformBox: "fill-box",
                    transformOrigin: "50% 95%",
                  }}
                >
                  {look.hold[0] === "gavel" && <Gavel uid={id("")} />}
                  {look.hold[0] === "coin" && <Coin uid={id("")} />}
                  {look.hold[0] === "wand" && <Wand uid={id("")} />}
                  {look.hold[0] === "shield" && <ShieldProp uid={id("")} />}
                {look.hold[0] === "sceptre" && <Sceptre uid={id("")} />}
                </motion.g>
              </motion.g>
            )}
          </motion.svg>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Lid({
  x,
  y,
  angle,
  fill,
}: {
  x: number;
  y: number;
  angle: number;
  fill: string;
}) {
  return (
    <motion.rect
      x={x}
      y={EY - BH / 2 - LID_H}
      width={BW / 2 + 14}
      height={LID_H}
      fill={fill}
      initial={false}
      animate={{ y, rotate: angle }}
      transition={{ type: "spring", stiffness: 700, damping: 40 }}
      style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}
    />
  );
}

function Brow({
  x,
  angle,
  color,
}: {
  x: number;
  angle: number;
  color: string;
}) {
  return (
    <motion.rect
      x={x - 10}
      y={EY - BH / 2 - 14}
      width={20}
      height={5}
      rx={2.5}
      fill={color}
      opacity={0.75}
      initial={false}
      animate={{ rotate: angle }}
      transition={spring}
      style={{ transformBox: "fill-box", transformOrigin: "center" }}
    />
  );
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

/** A few twinkling sparkles around the cloud (lucky and fantasy looks). */
/** Top-tier glow behind Merchie: a soft rainbow halo and light rays that turn slowly. */
function RoyalAura({ uid, reduce }: { uid: string; reduce: boolean }) {
  const cx = 122;
  const cy = 98;
  const rays = Array.from({ length: 14 }, (_, i) => (i * 360) / 14);
  return (
    <g>
      <defs>
        <radialGradient id={`${uid}-halo`} gradientUnits="userSpaceOnUse" cx={cx} cy={cy} r="135">
          <stop offset="0.35" stopColor="#FFFFFF" stopOpacity="0.85" />
          <stop offset="0.55" stopColor="#FFE6F0" stopOpacity="0.5" />
          <stop offset="0.75" stopColor="#D9CCFF" stopOpacity="0.3" />
          <stop offset="1" stopColor="#D9CCFF" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}-fade`} gradientUnits="userSpaceOnUse" cx={cx} cy={cy} r="150">
          <stop offset="0.3" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#000000" />
        </radialGradient>
        <mask id={`${uid}-m`} maskUnits="userSpaceOnUse" x={cx - 160} y={cy - 160} width="320" height="320">
          <rect x={cx - 160} y={cy - 160} width="320" height="320" fill={`url(#${uid}-fade)`} />
        </mask>
      </defs>
      <circle cx={cx} cy={cy} r="135" fill={`url(#${uid}-halo)`} />
      <g mask={`url(#${uid}-m)`}>
        <motion.g
          animate={reduce ? undefined : { rotate: 360 }}
          transition={{ duration: 48, repeat: Infinity, ease: "linear" }}
          style={{ originX: `${cx}px`, originY: `${cy}px`, transformBox: "view-box" }}
        >
          {rays.map((a, i) => (
            <path
              key={a}
              d={`M ${cx} ${cy} L ${cx - 9} ${cy - 150} L ${cx + 9} ${cy - 150} Z`}
              transform={`rotate(${a} ${cx} ${cy})`}
              fill={["#FFD1E0", "#FFF1B8", "#CFF5DC", "#CFE6FF", "#E2D6FF"][i % 5]}
              opacity={0.55}
            />
          ))}
        </motion.g>
      </g>
    </g>
  );
}

function BodyShapes({ wisp }: { wisp: boolean }) {
  return (
    <>
      <rect x="22" y="92" width="200" height="86" rx="43" />
      <circle cx="70" cy="98" r="44" />
      <circle cx="126" cy="74" r="58" />
      <circle cx="182" cy="104" r="40" />
      {wisp && (
        <>
          {/* little wisp on top */}
          <circle cx="150" cy="22" r="11" />
          <circle cx="138" cy="27" r="8" />
        </>
      )}
    </>
  );
}

/** Gold crown for the top tier: glossy band, three points with pearls, three gems. */
function Crown({ uid }: { uid: string }) {
  const u = (k: string) => `url(#${uid}-${k})`;
  return (
    <g transform="rotate(-10 128 18)">
      <defs>
        <linearGradient id={`${uid}-gold`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFF0B3" />
          <stop offset="0.45" stopColor="#FFC93C" />
          <stop offset="1" stopColor="#D99100" />
        </linearGradient>
        <linearGradient id={`${uid}-band`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFD75E" />
          <stop offset="1" stopColor="#B87800" />
        </linearGradient>
        <radialGradient id={`${uid}-ruby`} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#FFB3C7" />
          <stop offset="1" stopColor="#E0306A" />
        </radialGradient>
        <radialGradient id={`${uid}-sapph`} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#CFE6FF" />
          <stop offset="1" stopColor="#3E7BEA" />
        </radialGradient>
        <radialGradient id={`${uid}-emer`} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#D2FBE2" />
          <stop offset="1" stopColor="#1FA866" />
        </radialGradient>
      </defs>
      {/* shadow on the head */}
      <ellipse cx="128" cy="25" rx="24" ry="4" fill="#5B3FC4" opacity="0.18" />
      {/* points (back thickness, then face) */}
      <path
        d="M106 23 L104 1 L117 12 L128 -4 L139 12 L152 1 L150 23 Z"
        fill="#B87800"
        transform="translate(0.8 1.2)"
      />
      <path
        d="M106 23 L104 1 L117 12 L128 -4 L139 12 L152 1 L150 23 Z"
        fill={u("gold")}
        stroke="#C98A00"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      {/* band */}
      <rect x="104.5" y="17" width="47" height="8" rx="3" fill={u("band")} />
      <rect
        x="106"
        y="18"
        width="44"
        height="1.6"
        rx="0.8"
        fill="#FFF3C4"
        opacity="0.8"
      />
      {/* gems */}
      <ellipse cx="128" cy="21" rx="3.4" ry="2.8" fill={u("ruby")} />
      <circle cx="116" cy="21" r="2.3" fill={u("sapph")} />
      <circle cx="140" cy="21" r="2.3" fill={u("emer")} />
      {/* pearls on the tips */}
      {[
        [104, 1],
        [128, -4],
        [152, 1],
      ].map(([x, y]) => (
        <g key={x}>
          <circle
            cx={x}
            cy={y}
            r="2.8"
            fill="#FFF8E7"
            stroke="#E0B54A"
            strokeWidth="0.6"
          />
          <circle cx={x - 0.9} cy={y - 0.9} r="0.9" fill="#FFFFFF" />
        </g>
      ))}
      {/* sheen */}
      <path d="M110 20 L109 6 L116 13 Z" fill="#FFFFFF" opacity="0.35" />
    </g>
  );
}

function Stars({ reduce, colors }: { reduce: boolean; colors: string[] }) {
  const stars: [number, number, number, number][] = [
    [30, 50, 5, 0],
    [206, 40, 6, 0.6],
    [222, 150, 4, 1.1],
    [16, 140, 4, 1.6],
    [168, 18, 3.5, 0.3],
  ];
  return (
    <g>
      {stars.map(([x, y, r, delay], i) => (
        <motion.path
          key={`${x}-${y}`}
          fill={colors[i % colors.length]}
          stroke={colors[i % colors.length] === "#FFFFFF" ? "#F2B300" : "none"}
          strokeWidth={0.8}
          d={`M ${x} ${y - r} Q ${x} ${y} ${x + r} ${y} Q ${x} ${y} ${x} ${y + r} Q ${x} ${y} ${x - r} ${y} Q ${x} ${y} ${x} ${y - r} Z`}
          animate={
            reduce
              ? undefined
              : { opacity: [0.25, 1, 0.25], scale: [0.8, 1.1, 0.8] }
          }
          transition={{
            duration: 2.2,
            repeat: Infinity,
            delay,
            ease: "easeInOut",
          }}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        />
      ))}
    </g>
  );
}
