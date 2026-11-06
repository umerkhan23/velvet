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

  useEffect(() => {
    if (stage !== 'exit') return
    const t = setTimeout(() => setStage('done'), 650)
    return () => clearTimeout(t)
  }, [stage])

  useEffect(() => {
    if (stage === 'done') onDone?.()
  }, [stage, onDone])

  if (stage === 'done') return null

  const finish = () => {
    if (revealed.current) return
    revealed.current = true
    onReveal?.()
    setStage('exit')
  }

  const beginOpen = async () => {
    if (stage !== 'closed' || started.current) return
    started.current = true
    onOpen?.()

    const v = cineRef.current
    if (!v) {
      finish()
      return
    }
    try {
      v.currentTime = 0
      setStage('cinematic')
      const show = () => setCineReady(true)
      if (typeof v.requestVideoFrameCallback === 'function') {
        v.requestVideoFrameCallback(() => show())
      } else {
        v.addEventListener('playing', show, { once: true })
      }
      await v.play()
      setTimeout(show, 80)
    } catch {
      setCineReady(false)
      finish()
    }
  }

  return (
    <div
      className={`intro st-${stage}`}
      onClick={beginOpen}
      role="button"
      aria-label="Tap the seal to open"
    >
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
      />

      <img
        className={`open-still${stage === 'exit' ? ' is-on' : ''}`}
        src={FLAP_OPEN}
        alt=""
        draggable="false"
      />
    </div>
  )
}
