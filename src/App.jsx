import React, { useCallback, useEffect, useRef, useState } from 'react'
import Intro from './components/Intro'
import { MusicIcon } from './components/Art'
import { Hero, Invitation, Countdown, Location } from './components/Sections'
import ScratchHeart from './components/ScratchHeart'
import RSVP from './components/RSVP'

const MUSIC_SRC = '/song.mp3'

function useReveal(active) {
  useEffect(() => {
    if (!active) return
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && (e.target.classList.add('in'), io.unobserve(e.target))),
      { threshold: 0.15 }
    )
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [active])
}

export default function App() {
  const [done, setDone] = useState(false)
  const [play, setPlay] = useState(false)
  const [playing, setPlaying] = useState(false)
  const audio = useRef(null)

  useReveal(done)
  useEffect(() => {
    const html = document.documentElement
    const body = document.body
    if (!done) {
      html.style.overflow = 'hidden'
      body.style.overflow = 'hidden'
      html.style.touchAction = 'none'
      return
    }
    html.style.overflow = ''
    body.style.overflow = ''
    html.style.touchAction = ''
    body.style.touchAction = 'pan-y'
    html.style.height = ''
    body.style.height = ''
  }, [done])

  const onOpen = useCallback(() => {
    const a = audio.current
    if (!a) return
    a.volume = 0.55
    a.play().then(() => setPlaying(true)).catch(() => {})
  }, [])

  // light has spread ~halfway — invitation appears under the bloom
  const onReveal = useCallback(() => {
    setDone(true)
    setPlay(true)
  }, [])

  const onDone = useCallback(() => {}, [])

  const toggle = () => {
    const a = audio.current
    if (!a) return
    if (a.paused) a.play().then(() => setPlaying(true)).catch(() => {})
    else {
      a.pause()
      setPlaying(false)
    }
  }

  return (
    <div className="page">
      <audio ref={audio} src={MUSIC_SRC} loop preload="auto" playsInline />
      <Intro onOpen={onOpen} onReveal={onReveal} onDone={onDone} />
      {done && (
        <button className="music-btn" onClick={toggle} aria-label={playing ? 'Pause music' : 'Play music'}>
          <MusicIcon playing={playing} />
        </button>
      )}
      <main className={`paper${done ? ' paper-in' : ' paper-wait'}`}>
        <Hero play={play} />
        <Invitation />
        <ScratchHeart />
        <Countdown />
        <Location />
        <RSVP />
      </main>
    </div>
  )
}
