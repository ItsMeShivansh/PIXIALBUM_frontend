import React, { useState } from 'react';
import './ContactUs.css';

function ContactUs({ goBack }) {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    // Here you would send the form data to your backend or email service
    setSubmitted(true);
  };

  return (
    <div className="contact-us-page">
      <button className="contact-back-btn" onClick={goBack}>
        <i className="fa-solid fa-arrow-left"></i> Back
      </button>
      <h2>Contact Us</h2>
      <div className="contact-info">
        <p>Email: <a href="mailto:support@digialbum.com">support@digialbum.com</a></p>
        <p>Phone: +91-8200536421</p>
        {/* <p>Address: 123, Main Street, City, Country</p> */}
      </div>
      <form className="contact-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Your Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="subject"
          placeholder="Subject"
          value={form.subject}
          onChange={handleChange}
        />
        <textarea
          name="message"
          placeholder="Your Message"
          value={form.message}
          onChange={handleChange}
          required
        />
        <button type="submit">Send Message</button>
        {submitted && <div className="contact-success">Thank you! We'll get back to you soon.</div>}
      </form>
      <div className="contact-socials">
        <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer">
          <i className="fa-brands fa-instagram"></i>
        </a>
        <a href="https://facebook.com/" target="_blank" rel="noopener noreferrer">
          <i className="fa-brands fa-facebook"></i>
        </a>
      </div>
    </div>
  );
}

export default ContactUs;