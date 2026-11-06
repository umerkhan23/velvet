import React, { useEffect, useRef, useState } from 'react'
import {
  IMG, Slot, HeroFallback, RoseBorderFallback, Sparkle,
} from './Art'
import { invite, countdown, location } from '../data'

/* AI video: blooms drop from the top-right stem once on invitation entry */
function FlowerFallVideo({ active }) {
  const ref = useRef(null)
  const [ready, setReady] = useState(false)
  const started = useRef(false)

  useEffect(() => {
    if (!active || started.current) return
    const v = ref.current
    if (!v) return
    started.current = true
    const show = () => setReady(true)
    try {
      v.currentTime = 0
      if (typeof v.requestVideoFrameCallback === 'function') {
        v.requestVideoFrameCallback(() => show())
      } else {
        v.addEventListener('playing', show, { once: true })
      }
      v.play().then(show).catch(() => setReady(false))
      setTimeout(show, 120)
    } catch {
      setReady(false)
    }
  }, [active])

  return (
    <video
      ref={ref}
      className={`hero-fall-clip${ready ? ' is-ready' : ''}`}
      src={IMG.heroFall}
      poster={IMG.hero}
      playsInline
      muted
      preload="auto"
      aria-hidden="true"
    />
  )
}

/* ---------------- Hero ---------------- */
export function Hero({ play }) {
  return (
    <section className={`hero ${play ? 'play' : ''}`}>
      <div className="hero-art">
        <Slot src={IMG.hero} className="fill cover" fallback={<HeroFallback />} />
        <FlowerFallVideo active={play} />
      </div>
      <div className="hero-text">
        <p className="script hero-lead t1">{invite.lead}</p>
        <p className="serif hero-for t2">{invite.forThe}</p>
        <p className="script hero-event t3">{invite.event}</p>
        <p className="serif hero-of t4">{invite.of}</p>
        <h1 className="script hero-name t5">{invite.bride}</h1>
        <p className="script hero-amp t6">&amp;</p>
        <h1 className="script hero-name t7">{invite.groom}</h1>
      </div>
    </section>
  )
}

/* ---------------- Invitation card below hero video ---------------- */
export function Invitation() {
  return (
    <section className="invite">
      <div className="invite-card reveal">
        <Slot src={IMG.inviteCard} className="fill cover invite-card-art" fallback={<RoseBorderFallback />} />
        <div className="invite-seam" aria-hidden="true" />
        <div className="invite-copy">
          <p className="serif inv-copy-text">
            {invite.cardIntro}{' '}
            <span className="inv-pair">{invite.names}</span>.{' '}
            {invite.cardClose}
          </p>
        </div>
      </div>
    </section>
  )
}

/* ---------------- Countdown ---------------- */
function useCountdown(iso) {
  const target = new Date(iso).getTime()
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const d = Math.max(0, target - now)
  return [Math.floor(d / 86400000), Math.floor(d / 3600000) % 24, Math.floor(d / 60000) % 60, Math.floor(d / 1000) % 60]
}

export function Countdown() {
  const v = useCountdown(countdown.targetISO)
  return (
    <section className="section countdown reveal">
      <h2 className="script sec-title">{countdown.title}</h2>
      <div className="cd-row">
        {v.map((n, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="cd-colon">:</span>}
            <div className="cd-cell">
              <span className="cd-num">{String(n).padStart(2, '0')}</span>
              <span className="cd-lbl">{countdown.labels[i]}</span>
            </div>
          </React.Fragment>
        ))}
      </div>
    </section>
  )
}

/* ---------------- Location / Venue ---------------- */
export function Location() {
  return (
    <section className="section location">
      <Sparkle style={{ left: '14%', top: '90px', animationDelay: '0s' }} />
      <Sparkle style={{ right: '12%', top: '70px', animationDelay: '1.1s' }} />
      <Sparkle style={{ left: '8%', top: '230px', animationDelay: '0.6s' }} />
      <Sparkle style={{ right: '9%', top: '260px', animationDelay: '1.7s' }} />
      <div className="reveal venue-copy">
        <h2 className="script sec-title">{location.label}</h2>
        <p className="serif venue-name">{location.name}</p>
        <a className="serif loc-line link" href={location.mapsUrl} target="_blank" rel="noreferrer">
          {location.address}
        </a>
      </div>
      <div className="venue-map reveal">
        <a className="maps-open" href={location.mapsUrl} target="_blank" rel="noreferrer">
          Open in Maps
          <span aria-hidden="true">↗</span>
        </a>
        <iframe
          className="maps-frame"
          title={`${location.name} map`}
          src={location.mapsEmbed}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
    </section>
  )
}
