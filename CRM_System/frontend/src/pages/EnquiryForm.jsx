
import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const initialForm = {
  name: '',
  email: '',
  phone: '',
  course_interest: '',
};

export default function EnquiryForm() {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        course_interest: form.course_interest.trim(),
      };

      // Do not send an empty phone number.
      if (form.phone.trim()) {
        payload.phone = form.phone.trim();
      }

      await api.createEnquiry(payload);

      setSuccess(
        'Your enquiry has been submitted successfully. Our counseling team will follow up with you.'
      );
      setForm(initialForm);
    } catch (err) {
      setError(err.message || 'Unable to submit your enquiry.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <p className="eyebrow">STUDENT ENQUIRIES</p>
        <h1>Find your next course</h1>
        <p className="muted">
          Share your details and course interest. Our counseling team
          can help you with the next steps.
        </p>

        {error && (
          <div className="alert error" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="alert success" role="status">
            {success}
          </div>
        )}

        <label htmlFor="name">Full name *</label>
        <input
          id="name"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Enter your full name"
          minLength={2}
          maxLength={100}
          required
        />

        <label htmlFor="email">Email address *</label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
          maxLength={255}
          required
        />

        <label htmlFor="phone">Phone number (optional)</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          value={form.phone}
          onChange={handleChange}
          placeholder="Enter your phone number"
          maxLength={20}
        />

        <label htmlFor="course_interest">Course interest *</label>
        <input
          id="course_interest"
          name="course_interest"
          value={form.course_interest}
          onChange={handleChange}
          placeholder="e.g. Full Stack Development"
          minLength={2}
          maxLength={150}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit enquiry'}
        </button>

        <p className="form-footer">
          Are you a counselor? <Link to="/login">Log in here</Link>
        </p>
      </form>
    </div>
  );
}
