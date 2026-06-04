'use client'

import { useState } from 'react'
import type { DayAvailability } from './types'
import AvailabilityCalendar from './components/AvailabilityCalendar'
import EnquiryForm from './components/EnquiryForm'
import './training-room.css'

interface Props {
  availability: Record<string, DayAvailability>
}

export default function TrainingRoomClient({ availability }: Props) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  return (
    <div className="tr-root">
      {/* Nav */}
      <nav className="tr-nav">
        <div className="tr-container tr-nav-inner">
          <a href="https://digitaltempo.nz" className="tr-logo">
            Digital <span>Tempo</span>
          </a>
          <a href="https://digitaltempo.nz" className="tr-back-link">← Back to Digital Tempo</a>
        </div>
      </nav>

      {/* Hero */}
      <section className="tr-hero">
        <div className="tr-container">
          <span className="tr-badge">Available Now</span>
          <h1 className="tr-h1">
            A <span className="accent-purple">workshop space</span> built for{' '}
            <span className="accent-cyan">doing</span>
          </h1>
          <p className="tr-hero-p">
            A dedicated ~90m² training room at Mahitahi Colab Māpua. Modern, flexible, and set up for
            hands-on workshops — not lecture halls.
          </p>
          <div className="tr-stats">
            <div className="tr-stat">
              <div className="tr-stat-number">~90m²</div>
              <div className="tr-stat-label">Dedicated space</div>
            </div>
            <div className="tr-stat">
              <div className="tr-stat-number">20+</div>
              <div className="tr-stat-label">Seated capacity</div>
            </div>
            <div className="tr-stat">
              <div className="tr-stat-number">Māpua</div>
              <div className="tr-stat-label">Nelson / Tasman</div>
            </div>
          </div>
        </div>
      </section>

      {/* Room photo */}
      <section className="tr-room-photo">
        <div className="tr-container">
          <div className="tr-photo-wrap">
            <img
              src="/training-room.jpg"
              alt="The training room at Mahitahi Colab Māpua — flexible tables, large displays, polished concrete floors"
              className="tr-photo"
            />
            <div className="tr-photo-caption">
              Mahitahi Colab Māpua — flexible layout, dual displays, natural light
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="tr-pricing" id="pricing">
        <div className="tr-container">
          <h2>Simple Pricing</h2>
          <p className="tr-subtitle">All prices + GST. Everything you need is included.</p>
          <div className="tr-pricing-grid" style={{ maxWidth: '1000px' }}>
            <div className="tr-card">
              <span className="tr-card-badge badge-cyan">Half Day</span>
              <h3>Morning or Afternoon</h3>
              <p className="tr-tagline">Up to 4 hours. Perfect for focused sessions.</p>
              <p className="tr-price">$295 <span className="tr-unit">+ GST</span></p>
              <p className="tr-price-note">Any 4-hour block, 8am–5pm</p>
              <ul className="tr-features-list">
                <li>WiFi &amp; power throughout</li>
                <li>Large display / screen</li>
                <li>Whiteboards &amp; markers</li>
                <li>Flexible table layouts</li>
                <li>Kitchen &amp; tea/coffee access</li>
                <li>Free parking on-site</li>
              </ul>
              <button className="cta cta-cyan" onClick={() => document.getElementById('calendar')?.scrollIntoView({ behavior: 'smooth' })}>
                Check Availability
              </button>
            </div>

            <div className="tr-card tr-card-popular">
              <span className="tr-card-badge badge-purple">Full Day</span>
              <h3>All-Day Session</h3>
              <p className="tr-tagline">Up to 8 hours. Room to breathe.</p>
              <p className="tr-price">$595 <span className="tr-unit">+ GST</span></p>
              <p className="tr-price-note">8am – 5pm, full use of the space</p>
              <ul className="tr-features-list">
                <li>Everything in half-day</li>
                <li>Setup time from 7:30am</li>
                <li>Pack-down until 5:30pm</li>
                <li>Multiple layout changes OK</li>
                <li>Breakout area access</li>
                <li>Co-working space for attendees</li>
              </ul>
              <button className="cta cta-purple" onClick={() => document.getElementById('calendar')?.scrollIntoView({ behavior: 'smooth' })}>
                Check Availability
              </button>
            </div>

            <div className="tr-card">
              <span className="tr-card-badge badge-cyan">Hourly</span>
              <h3>Pay by the Hour</h3>
              <p className="tr-tagline">Flexible start time, minimum 1 hour.</p>
              <p className="tr-price">$100 <span className="tr-unit">/ hr + GST</span></p>
              <p className="tr-price-note">Tell us your preferred start time</p>
              <ul className="tr-features-list">
                <li>WiFi &amp; power throughout</li>
                <li>Large display / screen</li>
                <li>Whiteboards &amp; markers</li>
                <li>Flexible table layouts</li>
                <li>Kitchen &amp; tea/coffee access</li>
                <li>Free parking on-site</li>
              </ul>
              <button className="cta cta-cyan" onClick={() => document.getElementById('calendar')?.scrollIntoView({ behavior: 'smooth' })}>
                Check Availability
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Multi-day banner */}
      <div className="tr-container">
        <div className="tr-multiday">
          <h4>📅 Multi-Day or Recurring Bookings?</h4>
          <p>
            2+ consecutive days at $450/day + GST. Regular weekly/monthly bookings — let&apos;s talk about
            a rate that works.{' '}
            <a href="mailto:hello@digitaltempo.nz?subject=Multi-Day%20Booking%20Enquiry">
              Get in touch →
            </a>
          </p>
        </div>
      </div>

      {/* Calendar */}
      <section className="tr-calendar-section" id="calendar">
        <div className="tr-container">
          <h2>Check Availability</h2>
          <p className="tr-subtitle">Click a date to make an enquiry. We&apos;ll confirm within 1 business day.</p>
          <AvailabilityCalendar
            availability={availability}
            onDateSelect={setSelectedDate}
          />
        </div>
      </section>

      {/* What's Included */}
      <section className="tr-features-section">
        <div className="tr-container">
          <h2>What&apos;s Included</h2>
          <div className="tr-features-grid">
            {[
              { icon: '📶', title: 'Fast WiFi', desc: 'Reliable business-grade internet. Enough bandwidth for a room full of laptops.' },
              { icon: '🖥️', title: 'AV & Display', desc: 'Large screen for presentations, video calls, and demos. HDMI + wireless casting.' },
              { icon: '🧲', title: 'Whiteboards', desc: 'Wall-mounted whiteboards with markers and erasers. Post-it note friendly surfaces.' },
              { icon: '🪑', title: 'Flexible Layout', desc: 'Tables and chairs that move. Boardroom, classroom, U-shape, workshop pods — your call.' },
              { icon: '☕', title: 'Kitchen Access', desc: 'Full kitchen with tea, coffee, and fridge. Catering coordination available on request.' },
              { icon: '🅿️', title: 'Free Parking', desc: 'Plenty of parking on-site. No meters, no stress.' },
            ].map((f) => (
              <div key={f.title} className="tr-feature-item">
                <div className="tr-icon">{f.icon}</div>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Perfect For */}
      <section className="tr-ideal-section">
        <div className="tr-container">
          <h2>Perfect For</h2>
          <div className="tr-ideal-grid">
            {[
              { icon: '🎯', title: 'Team Training Days', desc: 'Upskill your team away from the office' },
              { icon: '🧠', title: 'Strategy & Planning', desc: 'Board days, offsites, and quarterly planning' },
              { icon: '🛠️', title: 'Hands-On Workshops', desc: 'Interactive sessions with breakout activities' },
              { icon: '🤝', title: 'Client Presentations', desc: 'Impress with a professional space' },
              { icon: '🎓', title: 'Independent Trainers', desc: 'Run your courses in a purpose-built room' },
              { icon: '🏘️', title: 'Community Groups', desc: 'Workshops, meetups, and working sessions' },
            ].map((item) => (
              <div key={item.title} className="tr-ideal-item">
                <div className="tr-icon">{item.icon}</div>
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="tr-location-section">
        <div className="tr-container">
          <div className="tr-location-info">
            <h2>Location</h2>
            <p className="tr-address">Mahitahi Colab, Stafford Drive, Māpua</p>
            <p>
              Part of the Mahitahi Colab co-working space in Māpua, Nelson/Tasman. The training room is
              a dedicated separate space — your session won&apos;t be interrupted, and you won&apos;t
              interrupt anyone else.
            </p>
          </div>
        </div>
      </section>

      {/* CTA footer */}
      <section className="tr-cta-footer">
        <div className="tr-container">
          <h2>Book the room</h2>
          <p>Pick a date above or get in touch directly — no complicated forms.</p>
          <div className="tr-contact-links">
            <a href="mailto:hello@digitaltempo.nz?subject=Training%20Room%20Enquiry">
              hello@digitaltempo.nz
            </a>
            <a href="tel:+64215671191">021 567 119</a>
          </div>
        </div>
      </section>

      <footer className="tr-footer">
        <div className="tr-container">
          <p>
            © 2026 Digital Tempo Ltd&nbsp;·&nbsp;
            <a href="https://digitaltempo.nz">digitaltempo.nz</a>
            &nbsp;·&nbsp;All prices NZD + GST
          </p>
        </div>
      </footer>

      {/* Enquiry form modal */}
      {selectedDate && (
        <EnquiryForm
          selectedDate={selectedDate}
          availability={availability}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  )
}
