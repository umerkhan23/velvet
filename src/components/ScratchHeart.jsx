import React, { useEffect, useRef, useState } from 'react'
import { Icon } from './Art'
import { saveTheDate } from '../data'

const HEART =
  'M150 268 C150 268 22 190 12 104 C4 40 52 8 96 12 C124 15 142 34 150 52 C158 34 176 15 204 12 C248 8 296 40 288 104 C278 190 150 268 150 268 Z'
const W = 300
const H = 280
const HEART_CLIP =
  'M0.5 0.957 C0.5 0.957 0.073 0.679 0.04 0.371 C0.013 0.143 0.173 0.029 0.32 0.043 C0.413 0.054 0.473 0.121 0.5 0.186 C0.527 0.121 0.587 0.054 0.68 0.043 C0.827 0.029 0.987 0.143 0.96 0.371 C0.927 0.679 0.5 0.957 0.5 0.957 Z'
const heartPath = typeof Path2D !== 'undefined' ? new Path2D(HEART) : null
/** Reveal when about 25% of the cover remains (75% scratched). */
const REVEAL_REMAINING = 0.25

function ScratchPetals({ active }) {
  const petals = React.useMemo(
    () =>
      Array.from({ length: 20 }, (_, id) => ({
        id,
        left: 4 + ((id * 41) % 92),
        delay: (id % 8) * 0.1,
        dur: 2.2 + (id % 5) * 0.4,
        size: 11 + (id % 6) * 3,
        rot: (id * 53) % 360,
        kind: id % 3,
        drift: (id % 2 ? 1 : -1) * (12 + (id % 5) * 6),
      })),
    []
  )
  if (!active) return null
  return (
    <div className="scratch-petals" aria-hidden="true">
      {petals.map((p) => (
        <span
          key={p.id}
          className={`scratch-petal kind-${p.kind}`}
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 1.25,
            '--rot': `${p.rot}deg`,
            '--drift': `${p.drift}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
          }}
        />
      ))}
    </div>
  )
}

export default function ScratchHeart() {
  const canvasRef = useRef(null)
  const drawing = useRef(false)
  const last = useRef(null)
  const revealedRef = useRef(false)
  const [revealed, setRevealed] = useState(false)
  const [scratching, setScratching] = useState(false)
  const [petalsOn, setPetalsOn] = useState(false)
  const [confetti, setConfetti] = useState([])

  // paint the glittery burgundy heart
  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    c.width = W * dpr
    c.height = H * dpr
    const ctx = c.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const p = new Path2D(HEART)
    const g = ctx.createRadialGradient(110, 90, 10, 150, 140, 190)
    g.addColorStop(0, '#c45a68')
    g.addColorStop(0.35, '#9a3a48')
    g.addColorStop(0.75, '#7a2230')
    g.addColorStop(1, '#5c1824')
    ctx.fillStyle = g
    ctx.fill(p)
    // glitter
    ctx.save()
    ctx.clip(p)
    for (let i = 0; i < 1600; i++) {
      const x = Math.random() * W
      const y = Math.random() * H
      const a = Math.random()
      ctx.fillStyle =
        a > 0.6
          ? `rgba(255,245,248,${0.35 + Math.random() * 0.5})`
          : `rgba(60,18,28,${Math.random() * 0.35})`
      ctx.fillRect(x, y, Math.random() * 1.6 + 0.4, Math.random() * 1.6 + 0.4)
    }
    // glossy highlight
    const hl = ctx.createRadialGradient(95, 70, 2, 95, 70, 70)
    hl.addColorStop(0, 'rgba(255,255,255,0.55)')
    hl.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = hl
    ctx.fillRect(0, 0, W, H)
    ctx.restore()
  }, [])

  useEffect(() => {
    if (!revealed) return
    setPetalsOn(true)
    const t = setTimeout(() => setPetalsOn(false), 3200)
    return () => clearTimeout(t)
  }, [revealed])

  const pos = (e) => {
    const r = canvasRef.current.getBoundingClientRect()
    return {
      x: ((e.clientX - r.left) / r.width) * W,
      y: ((e.clientY - r.top) / r.height) * H,
    }
  }

  const inHeart = (pt) => {
    const c = canvasRef.current
    if (!c || !heartPath) return true
    return c.getContext('2d').isPointInPath(heartPath, pt.x, pt.y)
  }

  const scratch = (pt) => {
    const ctx = canvasRef.current.getContext('2d')
    ctx.globalCompositeOperation = 'destination-out'
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = 38
    ctx.beginPath()
    const from = last.current || pt
    ctx.moveTo(from.x, from.y)
    ctx.lineTo(pt.x, pt.y)
    ctx.stroke()
    last.current = pt
  }

  const checkProgress = () => {
    if (revealedRef.current) return
    const c = canvasRef.current
    const ctx = c.getContext('2d', { willReadFrequently: true })
    const { data, width, height } = ctx.getImageData(0, 0, c.width, c.height)

    const path = new Path2D(HEART)
    const dpr = c.width / W
    let filled = 0
    let total = 0
    const step = 4
    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const lx = x / dpr
        const ly = y / dpr
        if (!ctx.isPointInPath(path, lx, ly)) continue
        total++
        const a = data[(y * width + x) * 4 + 3]
        if (a > 20) filled++
      }
    }
    if (total > 0 && filled / total <= REVEAL_REMAINING) reveal()
  }

  const reveal = () => {
    if (revealedRef.current) return
    revealedRef.current = true
    drawing.current = false
    setRevealed(true)
    setScratching(false)
    unlockScroll()
    const colors = ['#7a2230', '#9a3a48', '#c9a15e', '#b08a84', '#d8c7a6']
    setConfetti(
      Array.from({ length: 70 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 3 + Math.random() * 6,
        delay: Math.random() * 0.8,
        dur: 2.4 + Math.random() * 2,
        drift: (Math.random() - 0.5) * 80,
        color: colors[i % colors.length],
      }))
    )
  }

  const scrollLock = useRef({ y: 0, active: false })

  const lockScroll = () => {
    if (scrollLock.current.active) return
    scrollLock.current.active = true
    scrollLock.current.y = window.scrollY || window.pageYOffset || 0
    const html = document.documentElement
    const body = document.body
    html.classList.add('scratch-lock')
    body.classList.add('scratch-lock')
    body.style.top = `-${scrollLock.current.y}px`
  }

  const unlockScroll = () => {
    if (!scrollLock.current.active) return
    scrollLock.current.active = false
    const html = document.documentElement
    const body = document.body
    html.classList.remove('scratch-lock')
    body.classList.remove('scratch-lock')
    body.style.top = ''
    window.scrollTo(0, scrollLock.current.y)
  }

  useEffect(() => {
    const blockTouchMove = (e) => {
      if (!drawing.current) return
      e.preventDefault()
    }
    // iOS still scrolls unless touchmove is canceled with passive:false
    document.addEventListener('touchmove', blockTouchMove, { passive: false })
    return () => {
      document.removeEventListener('touchmove', blockTouchMove)
      unlockScroll()
    }
  }, [])

  const release = (e) => {
    const el = e?.currentTarget
    if (el && e?.pointerId != null) {
      try {
        if (el.hasPointerCapture?.(e.pointerId)) el.releasePointerCapture(e.pointerId)
      } catch {
        /* already released */
      }
    }
  }

  const down = (e) => {
    if (revealedRef.current) return
    const pt = pos(e)
    if (!inHeart(pt)) return
    drawing.current = true
    last.current = null
    setScratching(true)
    setPetalsOn(true)
    lockScroll()
    e.currentTarget.classList.add('is-scratching')
    e.preventDefault()
    e.currentTarget.setPointerCapture?.(e.pointerId)
    scratch(pt)
  }
  const move = (e) => {
    if (!drawing.current || revealedRef.current) return
    e.preventDefault()
    scratch(pos(e))
    checkProgress()
  }
  const up = (e) => {
    release(e)
    e?.currentTarget?.classList?.remove('is-scratching')
    unlockScroll()
    if (!drawing.current) return
    drawing.current = false
    last.current = null
    if (!revealedRef.current) {
      setScratching(false)
      setPetalsOn(false)
    }
    checkProgress()
  }

  return (
    <section className="section scratch-section reveal">
      <svg width="0" height="0" className="scratch-clip-defs" aria-hidden="true" focusable="false">
        <defs>
          <clipPath id="scratch-heart-clip" clipPathUnits="objectBoundingBox">
            <path d={HEART_CLIP} />
          </clipPath>
        </defs>
      </svg>
      <div className="confetti-layer" aria-hidden="true">
        {confetti.map((c) => (
          <span
            key={c.id}
            className="confetti"
            style={{
              left: `${c.left}%`,
              width: c.size,
              height: c.size,
              background: c.color,
              animationDelay: `${c.delay}s`,
              animationDuration: `${c.dur}s`,
              '--drift': `${c.drift}px`,
            }}
          />
        ))}
      </div>

      <ScratchPetals active={petalsOn || scratching} />

      <h2 className="script-title swap-title">
        <span className={revealed ? 'out' : ''}>{saveTheDate.scratchTitle}</span>
        <span className={revealed ? '' : 'out'}>{saveTheDate.revealedTitle}</span>
      </h2>
      <div className="mini-heart">
        <Icon.heart width="9" height="9" />
      </div>

      <div className={`scratch-box${revealed ? ' is-revealed' : ''}`}>
        <svg viewBox={`0 0 ${W} ${H}`} className="heart-under" aria-hidden="true">
          <path d={HEART} fill="#faf8f2" stroke="#d6d2c6" strokeWidth="1.5" />
          <text x="150" y="98" textAnchor="middle" dominantBaseline="middle" className="std-label">
            {saveTheDate.label}
          </text>
          <text x="150" y="142" textAnchor="middle" dominantBaseline="middle" className="std-date">
            {saveTheDate.dateText}
          </text>
          <text x="150" y="174" textAnchor="middle" dominantBaseline="middle" className="std-small">
            {saveTheDate.day}
          </text>
          <text x="150" y="202" textAnchor="middle" dominantBaseline="middle" className="std-small">
            {saveTheDate.time}
          </text>
        </svg>
        <canvas
          ref={canvasRef}
          className={`scratch-canvas${revealed ? ' gone' : ''}`}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
        />
      </div>
    </section>
  )
}
