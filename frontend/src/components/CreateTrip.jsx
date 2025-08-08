import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
function CreateTrip() {

  // State for placeholders
  const [tripNamePlaceholder, setTripNamePlaceholder] = useState('Summer Adventure');
  const [destinationPlaceholder, setDestinationPlaceholder] = useState('Paris, France');

  // State for form fields
  const [form, setForm] = useState({
    tripName: '',
    destination: '',
    startDate: '',
    endDate: '',
    travelers: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const username = localStorage.getItem('username');
      const res = await fetch(`${process.env.REACT_APP_API_URL}/trips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripName: form.tripName,
          destination: form.destination,
          startDate: form.startDate,
          endDate: form.endDate,
          travelers: Number(form.travelers),
          username // include username in request
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create trip');
      } else {
        setSuccess('Trip created successfully!');
        // Store trip id and full trip object in localStorage for itinerary/cost summary page
        if (data.trip && data.trip._id) {
          localStorage.setItem('selectedTripId', data.trip._id);
          localStorage.setItem('selectedTripObj', JSON.stringify(data.trip));
        }
        setTimeout(() => navigate('/itinerary'), 1200);
      }
    } catch (err) {
      setError('Server error');
    }
  };

  return (
    <div style={{ width: '100%', padding: 0, margin: 0, boxSizing: 'border-box' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={{
          fontSize: '2.8rem',
          fontWeight: 800,
          margin: '56px 0 4px 0', // Move header down
          letterSpacing: '-1px',
          textAlign: 'center',
          color: '#fff',
        }}>Create Trip</h1>
        <nav style={{
          maxWidth: 1200,
          margin: '0 auto 2px auto',
          background: '#f5f7fa',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          padding: '0 18px',
          height: 56,
          minHeight: 56,
          boxSizing: 'border-box',
          position: 'relative',
          marginTop: 24, // Move nav bar down
        }}>
          <button
            onClick={() => window.location.href = '/dashboard'}
            style={{
              padding: '8px 18px',
              fontSize: '1rem',
              borderRadius: 6,
              border: '1px solid #1976d2',
              background: '#fff',
              color: '#1976d2',
              cursor: 'pointer',
              fontWeight: 600,
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              transition: 'background 0.2s, color 0.2s',
              marginRight: 12,
              height: 38,
              display: 'flex',
              alignItems: 'center',
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
            <span style={{ fontSize: '1.2em', marginRight: 7, fontWeight: 700 }}>&larr;</span> Back to Dashboard
          </button>
          <div style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none', // so button remains clickable
            height: '100%',
          }}>
            <span style={{ fontSize: '0.97rem', color: '#444', background: 'transparent', pointerEvents: 'auto' }}>
              Fill out the form below to get started. Don't forget to give your trip an awesome name!
            </span>
          </div>
        </nav>

        {/* Trip Creation Form */}
        <form onSubmit={handleSubmit} style={{
          maxWidth: 480,
          margin: '36px auto 0 auto',
          background: '#fff',
          borderRadius: 10,
          boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
          padding: '32px 28px 24px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 22,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
            <label htmlFor="tripName" style={{ fontWeight: 600, marginBottom: 2 }}>Trip Name</label>
            <input
              id="tripName"
              name="tripName"
              type="text"
              required
              value={form.tripName}
              onChange={handleChange}
              placeholder={tripNamePlaceholder}
              onFocus={() => setTripNamePlaceholder('')}
              onBlur={e => setTripNamePlaceholder(e.target.value ? '' : 'Summer Adventure')}
              style={{
                width: 260,
                padding: '9px 12px',
                borderRadius: 6,
                border: '1px solid #bfc7d1',
                fontSize: '1rem',
                outline: 'none',
                display: 'block',
                textAlign: 'center',
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
            <label htmlFor="destination" style={{ fontWeight: 600, marginBottom: 2 }}>Destination</label>
            <input
              id="destination"
              name="destination"
              type="text"
              required
              value={form.destination}
              onChange={handleChange}
              placeholder={destinationPlaceholder}
              onFocus={() => setDestinationPlaceholder('')}
              onBlur={e => setDestinationPlaceholder(e.target.value ? '' : 'Paris, France')}
              style={{
                width: 260,
                padding: '9px 12px',
                borderRadius: 6,
                border: '1px solid #bfc7d1',
                fontSize: '1rem',
                outline: 'none',
                display: 'block',
                textAlign: 'center',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
              <label htmlFor="startDate" style={{ fontWeight: 600, marginBottom: 2 }}>Start Date</label>
              <input
                id="startDate"
                name="startDate"
                type="date"
                required
                value={form.startDate}
                onChange={handleChange}
                style={{
                  width: 150,
                  padding: '9px 8px',
                  borderRadius: 6,
                  border: '1px solid #bfc7d1',
                  fontSize: '1rem',
                  outline: 'none',
                  display: 'block',
                  textAlign: 'center',
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
              <label htmlFor="endDate" style={{ fontWeight: 600, marginBottom: 2 }}>End Date</label>
              <input
                id="endDate"
                name="endDate"
                type="date"
                required
                value={form.endDate}
                onChange={handleChange}
                style={{
                  width: 150,
                  padding: '9px 8px',
                  borderRadius: 6,
                  border: '1px solid #bfc7d1',
                  fontSize: '1rem',
                  outline: 'none',
                  display: 'block',
                  textAlign: 'center',
                }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
            <label htmlFor="travelers" style={{ fontWeight: 600, marginBottom: 2 }}>Number of Travelers</label>
            <input
              id="travelers"
              name="travelers"
              type="number"
              min="1"
              required
              value={form.travelers}
              onChange={handleChange}
              style={{
                width: 80,
                padding: '9px 8px',
                borderRadius: 6,
                border: '1px solid #bfc7d1',
                fontSize: '1rem',
                outline: 'none',
                textAlign: 'center',
                display: 'block',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 10 }}>
            <button
              type="button"
              style={{
                minWidth: 140,
                padding: '9px 0',
                background: '#e74c3c',
                color: '#fff',
                fontWeight: 700,
                fontSize: '1.05rem',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                transition: 'background 0.2s',
              }}
              onClick={() => {
                setForm({ tripName: '', destination: '', startDate: '', endDate: '', travelers: '' });
                setError('');
                setSuccess('');
                navigate('/dashboard');
              }}
            >Cancel</button>
            <button type="submit" style={{
              minWidth: 140,
              padding: '9px 0',
              background: '#27ae60',
              color: '#fff',
              fontWeight: 700,
              fontSize: '1.05rem',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              transition: 'background 0.2s',
            }}>Create + Save</button>
          </div>
          {/* Show messages below the buttons */}
          {error && <div style={{ color: 'red', textAlign: 'center', marginTop: 10 }}>{error}</div>}
          {success && <div style={{ color: 'green', textAlign: 'center', marginTop: 10 }}>{success}</div>}
        </form>
      </div>
    </div>
  );
}

export default CreateTrip;
