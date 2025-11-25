import React, { useState } from 'react';
import './Contact.css';
 

const Contact = () => {
  const [form, setForm] = useState({ fullName: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState({ loading: false, success: null, error: null });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: null, error: null });
    try {
      const res = await fetch('https://job-site-backend-seven.vercel.app/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Submission failed');
      setStatus({ loading: false, success: data?.message || 'Message sent successfully.', error: null });
      setForm({ fullName: '', email: '', subject: '', message: '' });
    } catch (err) {
      setStatus({ loading: false, success: null, error: err.message || 'Something went wrong.' });
    }
  };

  return (
    <section className="contact-section">
      <div className="contact-container">
        <div className="contact-header">
          <h1 className="contact-title">Get in Touch</h1>
          <p className="contact-subtitle">We’d love to hear from you. Send us a message and our team will respond promptly.</p>
          <div className="contact-accent" />
        </div>

        <div className="contact-grid">
          {/* Left: Contact Form */}
          <div className="contact-card form-card">
            <h2 className="card-title">Contact Form</h2>
            <form className={`contact-form`} onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="subject">Subject</label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="Regarding job posting..."
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows="6"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Write your message here"
                  required
                />
              </div>

              <button className="submit-button" type="submit" disabled={status.loading}>
                {status.loading ? 'Sending...' : 'Submit'}
              </button>

              {status.success && <p className="form-success" role="status">{status.success}</p>}
              {status.error && <p className="form-error" role="alert">{status.error}</p>}
            </form>
          </div>

          {/* Right: Contact Info + Map */}
          <div className="contact-card info-card">
            <h2 className="card-title">Contact Information</h2>
            <ul className="contact-info">
              <li>
                <span className="info-label">Office:</span>
                <span className="info-value">123 Corporate Ave, Suite 600, New York, NY</span>
              </li>
              <li>
                <span className="info-label">Phone:</span>
                <span className="info-value">+1 (555) 123-4567</span>
              </li>
              <li>
                <span className="info-label">Email:</span>
                <span className="info-value">support@careerhub.com</span>
              </li>
              <li>
                <span className="info-label">Hours:</span>
                <span className="info-value">Mon–Fri, 9:00 AM – 6:00 PM</span>
              </li>
            </ul>

            <div className="map-wrapper">
              <iframe
                title="Office Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3021.8677929459555!2d-73.98673728459451!3d40.74844097932719!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259af18b7f6a1%3A0x93a0b2f95c1e2d7!2sNew%20York!5e0!3m2!1sen!2sus!4v1684952840012!5m2!1sen!2sus"
                width="100%"
                height="240"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;