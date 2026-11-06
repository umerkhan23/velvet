import React, { useEffect, useRef, useState } from 'react'

/**
 * closed     → open-base.jpg (golden embroidery envelope)
 * cinematic  → reverse light → top flap half-open + mouth gold light
 * exit → done
 */
const FRONT = '/images/open-base.jpg'
const FLAP_OPEN = '/images/open-top-flap-light.jpg'
const CINEMATIC = '/videos/envelope-light-reverse.mp4?v=half-light'

export default function Intro({ onOpen, onReveal, onDone }) {
  const [stage, setStage] = useState('closed')
  const [cineReady, setCineReady] = useState(false)
  const cineRef = useRef(null)
  const started = useRef(false)
  const revealed = useRef(false)
  const lastTap = useRef(0)

  useEffect(() => {
    if (stage !== 'exit') return
    const t = setTimeout(() => setStage('done'), 650)
    return () => clearTimeout(t)
  }, [stage])

  useEffect(() => {
    if (stage === 'done') onDone?.()
  }, [stage, onDone])

  // Warm the video on mount so the first tap can play inside the user-gesture window
  useEffect(() => {
    const v = cineRef.current
    if (!v) return
    v.muted = true
    v.defaultMuted = true
    v.playsInline = true
    v.setAttribute('muted', '')
    v.setAttribute('playsinline', '')
    v.setAttribute('webkit-playsinline', '')
    try {
      v.load()
    } catch {
      /* ignore */
    }
  }, [])

  if (stage === 'done') return null

  const finish = () => {
    if (revealed.current) return
    revealed.current = true
    onReveal?.()
    setStage('exit')
  }

  const showCine = () => setCineReady(true)

  const beginOpen = async (e) => {
    // Deduplicate click + touch + pointer on flaky mobile Chrome
    const now = Date.now()
    if (now - lastTap.current < 450) return
    lastTap.current = now

    e?.preventDefault?.()
    e?.stopPropagation?.()

    if (stage !== 'closed' || started.current) return
    started.current = true
    onOpen?.()

    const v = cineRef.current
    if (!v) {
      finish()
      return
    }

    // Keep attributes inside the gesture (required on some Android Chrome builds)
    v.muted = true
    v.defaultMuted = true
    v.playsInline = true
    v.setAttribute('muted', '')
    v.setAttribute('playsinline', '')
    v.setAttribute('webkit-playsinline', '')

    setStage('cinematic')

    try {
      if (v.readyState < 2) {
        await Promise.race([
          new Promise((resolve) => {
            const done = () => resolve()
            v.addEventListener('loadeddata', done, { once: true })
            v.addEventListener('canplay', done, { once: true })
          }),
          new Promise((resolve) => setTimeout(resolve, 1200)),
        ])
      }
      try {
        v.currentTime = 0
      } catch {
        /* some WebViews throw if seeking too early */
      }

      if (typeof v.requestVideoFrameCallback === 'function') {
        v.requestVideoFrameCallback(() => showCine())
      } else {
        v.addEventListener('playing', showCine, { once: true })
        v.addEventListener('loadeddata', showCine, { once: true })
      }

      const playAttempt = v.play()
      if (playAttempt && typeof playAttempt.then === 'function') {
        await playAttempt
      }
      showCine()
      // Safety: if `ended` never fires on a broken decoder, still continue
      window.setTimeout(() => {
        if (!revealed.current && (v.ended || v.paused)) finish()
      }, 12000)
    } catch {
      // Video blocked / unsupported — still run the open-flap still animation
      showCine()
      setCineReady(false)
      window.setTimeout(finish, 700)
    }
  }

  const onKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      beginOpen(e)
    }
  }

  return (
    <div
      className={`intro st-${stage}`}
      role="button"
      tabIndex={0}
      aria-label="Tap anywhere to open"
      onClick={beginOpen}
      onPointerUp={beginOpen}
      onTouchEnd={beginOpen}
      onKeyDown={onKey}
    >
      <div className="intro-stage">
        <div className="env-full">
          <img className="env-front-img" src={FRONT} alt="" draggable="false" />
        </div>

        <div className="seal-hotspot" aria-hidden="true" />

        {/* reverse light + top flap open (golden embroidery envelope) */}
        <video
          ref={cineRef}
          className={`cine-clip${cineReady ? ' is-ready' : ''}`}
          src={CINEMATIC}
          poster={FRONT}
          playsInline
          muted
          preload="auto"
          onEnded={() => setTimeout(finish, 120)}
          onError={() => setTimeout(finish, 400)}
        />

        <img
          className={`open-still${stage === 'exit' ? ' is-on' : ''}`}
          src={FLAP_OPEN}
          alt=""
          draggable="false"
        />
      </div>
    </div>
  )
}
