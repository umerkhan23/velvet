import React, { useState } from 'react'
import emailjs from '@emailjs/browser'
import { EMAILJS, rsvp } from '../data'

emailjs.init({ publicKey: EMAILJS.publicKey })

export default function RSVP() {
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [attending, setAttending] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setSending(true)
    const form = e.currentTarget
    const templateParams = {
      subject: rsvp.subject,
      title: rsvp.title,
      message: rsvp.message,
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      attending: form.attending.value,
      guest_count: form.guest_count?.value?.trim() || '—',
      guest_names: form.guest_names?.value?.trim() || '—',
      from_name: form.name.value.trim(),
      reply_to: form.email.value.trim(),
    }
    try {
      await emailjs.send(EMAILJS.serviceId, EMAILJS.templateId, templateParams)
      setSent(true)
    } catch (err) {
      console.error('EmailJS RSVP error:', err)
      const detail = err?.text || err?.message || (typeof err === 'string' ? err : '')
      setError(
        detail
          ? `Could not send RSVP: ${detail}`
          : 'Could not send your RSVP. Please try again in a moment.',
      )
    } finally {
      setSending(false)
    }
  }

  const coming = attending === 'Joyfully accept'

  return (
    <section className="section rsvp-section reveal">
      <div className="rsvp-title-row">
        <h2 className="script sec-title">RSVP</h2>
      </div>
      {sent ? (
        <p className="serif rsvp-thanks">Thank you! Your response has been received.</p>
      ) : (
        <form className="rsvp" onSubmit={submit}>
          <label>
            Your Name *
            <input name="name" required placeholder="Your full name" autoComplete="name" />
          </label>
          <label>
            Email *
            <input name="email" required type="email" placeholder="you@example.com" autoComplete="email" />
          </label>
          <label>
            Will you be attending? *
            <select
              name="attending"
              required
              value={attending}
              onChange={(e) => setAttending(e.target.value)}
            >
              <option value="" disabled>
                Select
              </option>
              <option>Joyfully accept</option>
              <option>Regretfully decline</option>
            </select>
          </label>
          {coming && (
            <>
              <label>
                Number of people attending *
                <input name="guest_count" required type="number" min="1" max="20" placeholder="e.g. 2" />
              </label>
              <label>
                Names of people attending *
                <textarea
                  name="guest_names"
                  required
                  rows="3"
                  placeholder="Full names of everyone attending"
                />
              </label>
            </>
          )}
          {error && <p className="rsvp-error">{error}</p>}
          <button className="send-btn" type="submit" disabled={sending}>
            {sending ? 'Sending…' : 'Send RSVP'}
          </button>
        </form>
      )}
    </section>
  )
}
