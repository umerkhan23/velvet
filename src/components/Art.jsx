// Artwork. Every piece is an image "slot": if /public/images/<file> exists it is used,
// otherwise a hand-drawn SVG stand-in is shown. See AI_IMAGE_PROMPTS.md for prompts.
import React, { useState } from 'react'

export const IMG = {
  damask: '/images/envelope-damask.jpg',
  left: '/images/envelope-left.jpg?v=natural65b',
  right: '/images/envelope-right.jpg?v=natural65b',
  satin: '/images/envelope-satin.jpg?v=natural65b',
  bottom: '/images/envelope-bottom.jpg?v=natural65b',
  glowLeaves: '/images/envelope-glow-leaves.png',
  envelopeInside: '/images/envelope-inside.jpg',
  seal: '/images/seal-sf.png',
  hero: '/images/hero-arch.jpg?v=arch-full',
  heroFall: '/videos/hero-flower-fall.mp4?v=clean',
  roseBorder: '/images/rose-border.jpg?v=blend',
  invitePanel: '/images/invite-panel.jpg?v=blend',
  inviteCard: '/images/invite-card.jpg?v=ui2',
  scratchCard: '/images/scratch-card-bg.jpg?v=1',
  burgundyHeart: '/images/burgundy-heart.png?v=1',
  roseMarker: '/images/rose-marker.png',
  venue: '/images/venue.jpg',
  paper: '/images/paper.jpg',
}

export function Slot({ src, fallback, className = '', alt = '' }) {
  const [ok, setOk] = useState(true)
  if (!ok) return fallback
  return <img className={className} src={src} alt={alt} onError={() => setOk(false)} draggable="false" />
}

/* =================== painted rose =================== */
const PAL = {
  red: ['#5e0f1c', '#8e1b2b', '#b8394a'],
  pink: ['#c46a7a', '#e2a1ab', '#f4cfd2'],
  blush: ['#d9a49a', '#f0c9bf', '#fbe7e1'],
  cream: ['#d8bfa4', '#efe0cc', '#fbf4ea'],
}
let rid = 0
export function Rose({ x = 0, y = 0, r = 20, tone = 'red', rot = 0 }) {
  const [d, m, l] = PAL[tone]
  const id = `rg${tone}`
  const petals = []
  for (let i = 0; i < 7; i++) {
    const a = rot + i * (360 / 7)
    petals.push(
      <path key={i} d={`M0 0 C${r * 0.5} ${-r * 0.2} ${r * 1.05} ${-r * 0.45} ${r * 0.95} 0 C${r * 1.05} ${r * 0.45} ${r * 0.5} ${r * 0.2} 0 0 Z`} transform={`rotate(${a})`} fill={`url(#${id}o)`} stroke={d} strokeWidth={r * 0.025} strokeOpacity="0.5" />
    )
  }
  const inner = []
  for (let i = 0; i < 5; i++) {
    const a = rot + 20 + i * 72
    inner.push(
      <path key={i} d={`M0 0 C${r * 0.35} ${-r * 0.15} ${r * 0.7} ${-r * 0.3} ${r * 0.62} 0 C${r * 0.7} ${r * 0.3} ${r * 0.35} ${r * 0.15} 0 0 Z`} transform={`rotate(${a})`} fill={`url(#${id}i)`} />
    )
  }
  return (
    <g transform={`translate(${x} ${y})`}>
      <defs>
        <radialGradient id={`${id}o`} cx="10%" cy="50%" r="90%">
          <stop offset="0" stopColor={d} />
          <stop offset="0.55" stopColor={m} />
          <stop offset="1" stopColor={l} />
        </radialGradient>
        <radialGradient id={`${id}i`} cx="0%" cy="50%" r="100%">
          <stop offset="0" stopColor={d} />
          <stop offset="1" stopColor={m} />
        </radialGradient>
      </defs>
      {petals}
      {inner}
      <circle r={r * 0.28} fill={d} />
      <path d={`M${-r * 0.2} 0 a${r * 0.2} ${r * 0.2} 0 1 1 ${r * 0.3} ${r * 0.12} a${r * 0.12} ${r * 0.12} 0 1 1 ${-r * 0.16} ${-r * 0.14}`} fill="none" stroke={m} strokeWidth={r * 0.06} />
    </g>
  )
}
function Leaf({ x, y, s = 1, r = 0, c = '#6d7a52' }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <path d="M0 0 C6 -8 18 -9 26 0 C18 9 6 8 0 0 Z" fill={c} />
      <path d="M1 0 L24 0" stroke="#4d5838" strokeWidth="0.6" />
    </g>
  )
}
function seeded(seed) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}
export function RoseCluster({ x, y, s = 1, seed = 1, flip = false }) {
  const rnd = seeded(seed * 9973)
  const leaves = Array.from({ length: 16 }, () => ({ x: (rnd() - 0.5) * 150, y: (rnd() - 0.5) * 90, r: rnd() * 360, s: 0.8 + rnd() * 0.7, c: rnd() > 0.5 ? '#6d7a52' : '#8a9467' }))
  const tones = ['red', 'pink', 'blush', 'red', 'cream', 'pink', 'red']
  const roses = Array.from({ length: 7 }, (_, i) => ({ x: (rnd() - 0.5) * 120, y: (rnd() - 0.5) * 64, r: 14 + rnd() * 14, tone: tones[i], rot: rnd() * 60 }))
  roses.sort((a, b) => a.r - b.r)
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      {leaves.map((l, i) => <Leaf key={i} {...l} />)}
      {roses.map((r, i) => <Rose key={i} {...r} />)}
      {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={(rnd() - 0.5) * 150} cy={(rnd() - 0.5) * 90} r={1.6 + rnd() * 2} fill="#f6e3d8" opacity="0.9" />)}
    </g>
  )
}

/* =================== envelope =================== */
export function DamaskFallback() {
  return (
    <svg className="fill" aria-hidden="true">
      <defs>
        <pattern id="damask" width="120" height="150" patternUnits="userSpaceOnUse">
          <g fill="none" strokeLinecap="round">
            {[['#2c070b', 1.2, 1.2], ['#7a2a32', -0.8, -0.8], ['#4e1218', 0, 0]].map(([c, dx, dy], k) => (
              <g key={k} stroke={c} strokeWidth="1.6" transform={`translate(${dx} ${dy})`} opacity={k === 1 ? 0.55 : 1}>
                <circle cx="60" cy="60" r="14" />
                <path d="M60 46 C50 52 50 68 60 74 C70 68 70 52 60 46 M46 60 C52 50 68 50 74 60 C68 70 52 70 46 60" />
                <path d="M60 30 C40 34 30 50 34 66 M60 30 C80 34 90 50 86 66 M34 66 C40 84 52 92 60 92 C68 92 80 84 86 66" />
                <path d="M60 92 C58 104 52 112 44 116 M60 92 C62 104 68 112 76 116 M44 116 c-10 0 -16 -8 -12 -16 M76 116 c10 0 16 -8 12 -16" />
                <path d="M0 0 C10 10 10 24 0 30 M120 0 C110 10 110 24 120 30 M0 150 C10 140 10 126 0 120 M120 150 C110 140 110 126 120 120" />
                <path d="M20 128 c6 -10 18 -10 20 0 M100 128 c-6 -10 -18 -10 -20 0" />
              </g>
            ))}
          </g>
        </pattern>
        <radialGradient id="velvet" cx="50%" cy="45%" r="75%">
          <stop offset="0" stopColor="#5a1a20" />
          <stop offset="0.7" stopColor="#3f0e13" />
          <stop offset="1" stopColor="#2a080c" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#velvet)" />
      <rect width="100%" height="100%" fill="url(#damask)" opacity="0.85" />
    </svg>
  )
}

function GoldBranch({ x, y, s = 1, r = 0, seed = 1 }) {
  // curving stem with rounded leaves and two side twigs
  const rnd = seeded(seed * 7919)
  const leaf = (lx, ly, ang, size, k) => (
    <path key={k} d={`M0 0 C${size * 0.4} ${-size * 0.45} ${size * 0.9} ${-size * 0.35} ${size} 0 C${size * 0.9} ${size * 0.35} ${size * 0.4} ${size * 0.45} 0 0 Z`} transform={`translate(${lx} ${ly}) rotate(${ang})`} />
  )
  const leaves = []
  const stem = (t) => ({ x: Math.sin(t * 2.2) * 14, y: -t * 150 })
  for (let i = 1; i <= 10; i++) {
    const t = i / 10
    const p = stem(t)
    const size = 22 - i * 1.3
    leaves.push(leaf(p.x, p.y, -150 + rnd() * 30, size, 'l' + i))
    leaves.push(leaf(p.x, p.y, -30 - rnd() * 30, size, 'r' + i))
  }
  const twig = (t0, dir, k) => {
    const p = stem(t0)
    const out = []
    for (let j = 1; j <= 4; j++) {
      const tx = p.x + dir * j * 11
      const ty = p.y - j * 9
      out.push(leaf(tx, ty, dir > 0 ? -60 + rnd() * 30 : -120 - rnd() * 30, 14 - j, k + j))
      out.push(leaf(tx, ty, dir > 0 ? 10 + rnd() * 20 : 170 - rnd() * 20, 12 - j, k + 'b' + j))
    }
    return (
      <g key={k}>
        <path d={`M${p.x} ${p.y} q${dir * 22} -12 ${dir * 46} -38`} fill="none" stroke="#f2b863" strokeWidth="1.4" />
        {out}
      </g>
    )
  }
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <path d="M0 0 C10 -40 -12 -90 6 -150" fill="none" stroke="#f2b863" strokeWidth="2" />
      <g fill="url(#leafGold)">
        {leaves}
        {twig(0.35, 1, 'ta')}
        {twig(0.6, -1, 'tb')}
      </g>
    </g>
  )
}
export function GlowLeavesFallback() {
  const branches = [
    { x: 40, y: 360, r: 25, s: 1.1, seed: 1 }, { x: 18, y: 300, r: -10, s: 0.8, seed: 2 },
    { x: 360, y: 360, r: -25, s: 1.1, seed: 3 }, { x: 382, y: 300, r: 10, s: 0.8, seed: 4 },
    { x: 90, y: 860, r: 20, s: 1.25, seed: 5 }, { x: 30, y: 800, r: -5, s: 1, seed: 6 },
    { x: 310, y: 860, r: -20, s: 1.25, seed: 7 }, { x: 370, y: 800, r: 5, s: 1, seed: 8 },
  ]
  return (
    <svg className="fill" viewBox="0 0 400 860" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id="leafGold" cx="40%" cy="40%" r="80%">
          <stop offset="0" stopColor="#ffe3a3" />
          <stop offset="0.6" stopColor="#f0a94d" />
          <stop offset="1" stopColor="#b4642a" />
        </radialGradient>
        <radialGradient id="warm" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#ff9d4a" stopOpacity="0.45" />
          <stop offset="1" stopColor="#ff9d4a" stopOpacity="0" />
        </radialGradient>
        <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <ellipse cx="40" cy="260" rx="120" ry="150" fill="url(#warm)" />
      <ellipse cx="360" cy="260" rx="120" ry="150" fill="url(#warm)" />
      <ellipse cx="60" cy="760" rx="140" ry="150" fill="url(#warm)" />
      <ellipse cx="340" cy="760" rx="140" ry="150" fill="url(#warm)" />
      <g filter="url(#glow)">{branches.map((p, i) => <GoldBranch key={i} {...p} />)}</g>
    </svg>
  )
}

export function SealFallback({ text = 'G&Z' }) {
  const pts = []
  for (let i = 0; i <= 60; i++) {
    const a = (i / 60) * Math.PI * 2
    const r = 50 + Math.sin(i * 1.05) * 3.5 + Math.cos(i * 2.3) * 1.5
    pts.push(`${(60 + Math.cos(a) * r).toFixed(1)},${(60 + Math.sin(a) * r).toFixed(1)}`)
  }
  return (
    <svg viewBox="0 0 120 120" className="seal-svg" aria-hidden="true">
      <defs>
        <radialGradient id="sealG" cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor="#fdeee6" />
          <stop offset="0.55" stopColor="#f0cfc2" />
          <stop offset="1" stopColor="#cf9e8f" />
        </radialGradient>
        <filter id="sealSh" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#1a0306" floodOpacity="0.6" />
        </filter>
      </defs>
      <polygon points={pts.join(' ')} fill="url(#sealG)" filter="url(#sealSh)" />
      <circle cx="60" cy="60" r="37" fill="none" stroke="#c99485" strokeWidth="3" opacity="0.6" />
      <circle cx="60" cy="60" r="34" fill="#f3d6cb" />
      <circle cx="61" cy="61" r="34" fill="none" stroke="#fff6f1" strokeWidth="1.2" opacity="0.8" />
      <text x="60" y="71" textAnchor="middle" className="seal-mono">{text}</text>
    </svg>
  )
}

/* =================== hero painting =================== */
function Swans({ x, y, s = 1, reflect = true }) {
  const swan = (flip) => (
    <g transform={flip ? 'scale(-1 1)' : ''}>
      <path d="M2 -6 C8 -30 22 -46 14 -58 C10 -64 2 -62 2 -56 C2 -50 10 -48 10 -40 C8 -26 -6 -16 -10 -6 C-30 -4 -46 -10 -54 -2 C-50 8 -20 12 2 6 Z" fill="#fbf6ef" stroke="#c9b9a6" strokeWidth="0.8" />
      <path d="M2 -56 L-4 -54 L2 -51" fill="#c8823e" />
      <path d="M-44 -4 C-34 -12 -22 -12 -12 -6" fill="none" stroke="#d8cbb8" strokeWidth="1" />
    </g>
  )
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g transform="translate(-4 0)">{swan(true)}</g>
      <g transform="translate(4 0)">{swan(false)}</g>
      {reflect && (
        <g transform="translate(0 12) scale(1 -0.8)" opacity="0.35">
          <g transform="translate(-4 0)">{swan(true)}</g>
          <g transform="translate(4 0)">{swan(false)}</g>
        </g>
      )}
    </g>
  )
}
export function HeroFallback() {
  return (
    <svg className="fill" viewBox="0 0 400 860" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6e6d6" />
          <stop offset="0.55" stopColor="#f1dccb" />
          <stop offset="1" stopColor="#e7cdb6" />
        </linearGradient>
        <linearGradient id="stone" x1="0" x2="1">
          <stop offset="0" stopColor="#d9bfa2" />
          <stop offset="0.5" stopColor="#efdcc6" />
          <stop offset="1" stopColor="#cdb090" />
        </linearGradient>
        <linearGradient id="lake" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e9d8c4" />
          <stop offset="1" stopColor="#cdb59c" />
        </linearGradient>
        <radialGradient id="glowC" cx="50%" cy="40%" r="50%">
          <stop offset="0" stopColor="#fff8ef" stopOpacity="0.9" />
          <stop offset="1" stopColor="#fff8ef" stopOpacity="0" />
        </radialGradient>
        <filter id="paint"><feGaussianBlur stdDeviation="1.1" /></filter>
        <filter id="soft"><feGaussianBlur stdDeviation="5" /></filter>
      </defs>
      <rect width="400" height="860" fill="url(#sky)" />
      {/* distant trees + lake */}
      <g filter="url(#soft)" opacity="0.7">
        <ellipse cx="80" cy="560" rx="90" ry="40" fill="#cdbb98" />
        <ellipse cx="320" cy="555" rx="100" ry="44" fill="#cdbb98" />
        <ellipse cx="200" cy="575" rx="80" ry="22" fill="#d8c7a8" />
      </g>
      <rect x="0" y="585" width="400" height="275" fill="url(#lake)" />
      <g stroke="#f7ecdf" strokeWidth="1.2" opacity="0.6">
        <path d="M60 640 h60 M250 650 h80 M120 700 h70 M220 720 h90 M40 760 h50" />
      </g>
      <rect width="400" height="860" fill="url(#glowC)" />
      {/* arch architecture */}
      <g filter="url(#paint)">
        <path d="M0 0 H400 V600 H350 V250 C350 120 290 60 200 40 C110 60 50 120 50 250 V600 H0 Z" fill="url(#stone)" />
        <path d="M66 600 V255 C66 135 120 80 200 62 C280 80 334 135 334 255 V600" fill="none" stroke="#c3a382" strokeWidth="3" />
        <path d="M20 600 V30 M380 600 V30" stroke="#c9ab8b" strokeWidth="6" />
        <rect x="8" y="590" width="58" height="16" fill="#d9c0a3" />
        <rect x="334" y="590" width="58" height="16" fill="#d9c0a3" />
        <path d="M0 0 H400 V22 H0 Z" fill="#cbb08f" />
      </g>
      {/* climbing roses over arch */}
      <g opacity="0.9">
        <RoseCluster x={70} y={110} s={0.55} seed={3} />
        <RoseCluster x={330} y={110} s={0.55} seed={4} flip />
        <RoseCluster x={200} y={30} s={0.5} seed={5} />
        <RoseCluster x={40} y={300} s={0.45} seed={6} />
        <RoseCluster x={360} y={300} s={0.45} seed={7} flip />
      </g>
      <Swans x={200} y={700} s={1.2} />
      <RoseCluster x={40} y={800} s={1.25} seed={11} />
      <RoseCluster x={360} y={800} s={1.25} seed={12} flip />
      <RoseCluster x={10} y={690} s={0.8} seed={13} />
      <RoseCluster x={395} y={690} s={0.8} seed={14} flip />
    </svg>
  )
}

export function RoseBorderFallback() {
  return (
    <svg className="fill" viewBox="0 0 400 300" preserveAspectRatio="xMidYMin slice" aria-hidden="true">
      <defs>
        <linearGradient id="fadeB" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ead3c3" />
          <stop offset="1" stopColor="#f1ddd3" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="400" height="200" fill="url(#fadeB)" />
      <Swans x={200} y={110} s={0.9} />
      <RoseCluster x={40} y={60} s={1.1} seed={21} />
      <RoseCluster x={360} y={60} s={1.1} seed={22} flip />
      <RoseCluster x={20} y={170} s={0.75} seed={23} />
      <RoseCluster x={385} y={170} s={0.75} seed={24} flip />
    </svg>
  )
}

export function RoseMarkerFallback() {
  return (
    <svg viewBox="-30 -30 60 60" className="marker-svg" aria-hidden="true">
      <Rose r={24} tone="red" />
    </svg>
  )
}

export function VenueFallback() {
  const win = []
  for (let c = 0; c < 9; c++) {
    win.push(<rect key={'u' + c} x={40 + c * 30} y={70} width="12" height="18" fill="#6e5a43" />)
    win.push(<path key={'a' + c} d={`M${36 + c * 30} 160 v-26 a10 10 0 0 1 20 0 v26`} fill="#5c4836" />)
  }
  return (
    <svg className="fill" viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="vsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f2e3cf" />
          <stop offset="1" stopColor="#e3cdb0" />
        </linearGradient>
        <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#dcc19c" />
          <stop offset="1" stopColor="#c9a983" />
        </linearGradient>
        <linearGradient id="fadeTop2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f1ddd3" />
          <stop offset="0.25" stopColor="#f1ddd3" stopOpacity="0" />
        </linearGradient>
        <filter id="vpaint"><feGaussianBlur stdDeviation="0.6" /></filter>
      </defs>
      <rect width="400" height="260" fill="url(#vsky)" />
      <g filter="url(#vpaint)">
        <path d="M20 60 L170 40 L340 56 L340 190 L20 190 Z" fill="url(#wall)" />
        <path d="M14 62 L170 36 L346 54 L340 44 L170 26 L20 50 Z" fill="#9c5b3e" />
        {win}
        <rect x="150" y="96" width="60" height="12" fill="#7a5a3c" />
        <text x="180" y="105" textAnchor="middle" className="venue-sign">BRICK</text>
        <path d="M300 200 C290 140 300 80 310 50 C320 80 330 140 320 200 Z" fill="#4f5a3b" />
        <path d="M330 200 C322 150 330 100 338 76 C346 100 352 150 344 200 Z" fill="#5d6845" />
        <ellipse cx="60" cy="200" rx="60" ry="22" fill="#7d8559" />
        <ellipse cx="230" cy="205" rx="80" ry="18" fill="#8a9063" />
        <rect x="0" y="200" width="400" height="60" fill="#cdb38f" />
      </g>
      <rect width="400" height="260" fill="#8b6a45" opacity="0.12" />
      <rect width="400" height="260" fill="url(#fadeTop2)" />
    </svg>
  )
}

export function Flourish({ flip }) {
  return (
    <svg viewBox="0 0 60 20" className={`flourish ${flip ? 'flip' : ''}`} aria-hidden="true">
      <path d="M58 10 C46 10 40 4 32 6 C26 8 28 14 22 14 C16 14 14 8 8 10 C4 11 2 13 1 10" fill="none" stroke="#c9a15e" strokeWidth="1" />
      <circle cx="30" cy="10" r="1.6" fill="#c9a15e" />
    </svg>
  )
}

export function Sparkle({ style }) {
  return (
    <svg viewBox="0 0 20 20" className="sparkle" style={style} aria-hidden="true">
      <path d="M10 0 C11 7 13 9 20 10 C13 11 11 13 10 20 C9 13 7 11 0 10 C7 9 9 7 10 0 Z" fill="#d8b46a" />
    </svg>
  )
}

export function MusicIcon({ playing }) {
  return playing ? (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
  ) : (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
  )
}

export const Icon = {
  heart: ({ width = 12, height = 12, className = '' }) => (
    <svg
      viewBox="0 0 12 12"
      width={width}
      height={height}
      className={className}
      aria-hidden="true"
    >
      <path
        d="M6 10.4 C6 10.4 1.2 7.4 0.8 4.2 C0.5 1.8 2.4 0.5 4.1 0.7 C5.1 0.8 5.7 1.5 6 2.2 C6.3 1.5 6.9 0.8 7.9 0.7 C9.6 0.5 11.5 1.8 11.2 4.2 C10.8 7.4 6 10.4 6 10.4 Z"
        fill="currentColor"
      />
    </svg>
  ),
  mail: ({ width = 18, height = 18, className = '' }) => (
    <svg
      viewBox="0 0 24 24"
      width={width}
      height={height}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 7 9-7" />
    </svg>
  ),
}
