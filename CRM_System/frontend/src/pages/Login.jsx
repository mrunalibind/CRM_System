
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await api.login(form);
      const token = result.token || result.data?.token;

      if (!token) {
        throw new Error('Login succeeded but no token was returned. Check the API response.');
      }

      localStorage.setItem('crm_token', token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <p className="eyebrow">CRM PORTAL</p>
        <h1>Welcome back</h1>
        <p className="muted">Log in to manage your enquiries.</p>

        {error && <div className="alert error">{error}</div>}

        <label htmlFor="email">Email address</label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Your password"
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Log in'}
        </button>

        <p className="form-footer">
          New counselor? <Link to="/register">Create an account</Link>
        </p>

        <p className="form-footer">
          Want to submit an enquiry? <Link to="/enquiry">Enquiry form</Link>
        </p>
      </form>
    </div>
  );
}
