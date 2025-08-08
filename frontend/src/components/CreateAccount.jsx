import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CreateAccount() {
  const [form, setForm] = useState({ username: '', password: '', confirmPassword: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
          const res = await fetch(`${process.env.REACT_APP_API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed');
      } else {
        setMessage('Account Created Successfully');
        setTimeout(() => navigate('/login'), 1000);
      }
    } catch (err) {
      setError('Server error');
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '80px auto 40px auto', padding: '48px 80px', border: '1px solid #ccc', borderRadius: 14, background: '#fff', position: 'relative', boxShadow: '0 2px 16px rgba(0,0,0,0.09)' }}>
      <button
        onClick={() => navigate('/login')}
        style={{
          position: 'absolute',
          top: 18,
          left: 18,
          padding: '4px 12px',
          fontSize: '0.95rem',
          borderRadius: 6,
          border: '1.5px solid #1976d2',
          background: '#fff',
          color: '#1976d2',
          cursor: 'pointer',
          fontWeight: 600,
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          transition: 'background 0.2s, color 0.2s',
          zIndex: 10
        }}
        onMouseOver={e => {
          e.target.style.background = '#1976d2';
          e.target.style.color = '#fff';
        }}
        onMouseOut={e => {
          e.target.style.background = '#fff';
          e.target.style.color = '#1976d2';
        }}
      >
        Back to Login
      </button>
      <div style={{ position: 'relative', marginBottom: 32 }}>
        <h2 style={{ textAlign: 'center', margin: 0, fontSize: '2.2rem', fontWeight: 700, paddingTop: 12 }}>Create Account</h2>
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
          style={{ width: 350, maxWidth: '100%', marginBottom: 14, padding: '9px 10px', fontSize: '1rem', borderRadius: 6, border: '1px solid #bbb', textAlign: 'center' }}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          style={{ width: 350, maxWidth: '100%', marginBottom: 14, padding: '9px 10px', fontSize: '1rem', borderRadius: 6, border: '1px solid #bbb', textAlign: 'center' }}
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChange={handleChange}
          required
          style={{ width: 350, maxWidth: '100%', marginBottom: 14, padding: '9px 10px', fontSize: '1rem', borderRadius: 6, border: '1px solid #bbb', textAlign: 'center' }}
        />
        <button type="submit" style={{ width: 240, maxWidth: '100%', padding: '8px 0', marginBottom: 7, fontSize: '1.05rem', borderRadius: 6, background: '#3b82f6', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 500, letterSpacing: 0.2 }}>Create Account</button>
        <div style={{ fontSize: '0.75em', color: '#888', textAlign: 'center', marginBottom: 2, lineHeight: 1.2 }}>
          <div>Username must be at least 5 characters long</div>
          <div>Password must be at least 8 characters long</div>
        </div>
      </form>
      {message && <div style={{ color: 'green', textAlign: 'center', marginTop: 8 }}>{message}</div>}
      {error && <div style={{ color: 'red', textAlign: 'center', marginTop: 8 }}>{error}</div>}
      <div style={{
        marginTop: "2rem",
        background: "#f5f7fa",
        borderRadius: "8px",
        padding: "0.5rem 1.5rem 1.2rem 1.5rem",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        color: "#222",
        fontSize: "1rem",
        maxWidth: 340,
        marginLeft: 'auto',
        marginRight: 'auto',
        textAlign: 'left'
      }}>
        <h3 style={{marginBottom: "0.5rem", textAlign: 'center'}}>Why TripCraft?</h3>
        <p style={{marginBottom: "1rem", textAlign: 'center'}}>
          Organize trips, plan your itinerary, track costs, and never forget an adventure! TripCraft is perfect if you want to:
        </p>
        <ul style={{paddingLeft: "1.2em", marginBottom: 0, textAlign: 'left'}}>
          <li>Save multiple trip plans in one place</li>
          <li>Track costs and split expenses</li>
          <li>Share your trip plans with friends</li>
          <li>Access from your browser on any device</li>
        </ul>
      </div>
    </div>
  );
}

export default CreateAccount;
