import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    const username = localStorage.getItem('username');
    if (!username) {
      setError('No username found. Please log in again.');
      setLoading(false);
      return;
    }
    fetch(`${process.env.REACT_APP_API_URL}/trips?username=${encodeURIComponent(username)}`)
      .then(res => res.json())
      .then(data => {
        setTrips(data.trips || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load trips');
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this trip? You will lose all your awesome trip details!')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/trips/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTrips(trips => trips.filter(t => t._id !== id));
      } else {
        alert('Failed to delete trip');
      }
    } catch {
      alert('Failed to delete trip');
    } finally {
      setDeletingId(null);
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
        }}>Dashboard</h1>
        {/* Error message under header removed as requested */}
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
            onClick={() => navigate('/login')}
            style={{
              padding: '8px 20px', fontSize: '1rem', borderRadius: 6, border: '1px solid #d32f2f', background: '#fff', color: '#d32f2f', cursor: 'pointer', fontWeight: 600, boxShadow: '0 1px 2px rgba(0,0,0,0.03)', transition: 'background 0.2s, color 0.2s', marginRight: 18, height: 38, display: 'flex', alignItems: 'center',
            }}
            onMouseOver={e => { e.target.style.background = '#d32f2f'; e.target.style.color = '#fff'; }}
            onMouseOut={e => { e.target.style.background = '#fff'; e.target.style.color = '#d32f2f'; }}
          >Logout</button>
          <div style={{ position: 'absolute', left: 'calc(50% - 210px)', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}>
            <span style={{ fontSize: '0.85rem', color: '#333', fontWeight: 400, whiteSpace: 'nowrap' }}>Create New Trip Here</span>
          </div>
          <button
            onClick={() => navigate('/create-trip')}
            style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', padding: '8px 18px', fontSize: '1rem', borderRadius: 6, border: '1px solid #388e3c', background: '#fff', color: '#388e3c', cursor: 'pointer', fontWeight: 600, boxShadow: '0 1px 2px rgba(0,0,0,0.03)', transition: 'background 0.2s, color 0.2s', height: 38, display: 'flex', alignItems: 'center', margin: 0, zIndex: 2 }}
            onMouseOver={e => { e.target.style.background = '#388e3c'; e.target.style.color = '#fff'; }}
            onMouseOut={e => { e.target.style.background = '#fff'; e.target.style.color = '#388e3c'; }}
          >Create Trip&nbsp;<span style={{fontWeight:800}}>+</span></button>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', minWidth: 0 }}>
            <span style={{ fontSize: '0.85rem', color: '#333', marginRight: 8, whiteSpace: 'nowrap' }}>Need Help?</span>
            <button
              onClick={() => navigate('/help-information')}
              style={{ padding: '8px 14px', fontSize: '1rem', borderRadius: 6, border: '1px solid #1976d2', background: '#fff', color: '#1976d2', cursor: 'pointer', fontWeight: 600, boxShadow: '0 1px 2px rgba(0,0,0,0.03)', transition: 'background 0.2s, color 0.2s', height: 38, display: 'flex', alignItems: 'center' }}
              onMouseOver={e => { e.target.style.background = '#1976d2'; e.target.style.color = '#fff'; }}
              onMouseOut={e => { e.target.style.background = '#fff'; e.target.style.color = '#1976d2'; }}
            >Help & Information</button>
          </div>
        </nav>

        {/* Main content row: trip list left, instructions right */}
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 30 }}>
          {/* Trip List (left) */}
          <div style={{ flex: 1, minWidth: 0, marginRight: 32 }}>
            {loading ? (
              <div style={{ textAlign: 'center', marginTop: 40 }}>Loading trips...</div>
            ) : error ? (
              <div style={{ color: '#fff', textAlign: 'center', marginTop: 40 }}>{error}</div>
            ) : trips.length === 0 ? (
              <div style={{ color: '#fff', textAlign: 'center', marginTop: 40 }}>No trips to display yet. Create your first trip now!</div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
                gap: '28px 32px',
                alignItems: 'start',
                justifyItems: 'start',
                marginTop: 0,
                marginLeft: 0
              }}>
                {trips.map(trip => (
                  <div
                    key={trip._id}
                    style={{
                      background: '#fff',
                      border: '1.5px solid #bfc7d1',
                      borderRadius: 14,
                      boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
                      padding: '22px 22px 18px 22px',
                      minHeight: 210,
                      minWidth: 0,
                      width: '100%',
                      maxWidth: 340,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      position: 'relative',
                      transition: 'box-shadow 0.2s, border 0.2s',
                    }}
                    onMouseEnter={() => setHoveredCard(trip._id)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div style={{ fontWeight: 800, fontSize: '1.22rem', marginBottom: 8, color: '#111', letterSpacing: 0.2 }}>{trip.tripName}</div>
                    <div style={{ fontSize: '1.04rem', marginBottom: 4, color: '#333' }}><b>Destination:</b> {trip.destination}</div>
                    <div style={{ fontSize: '1.01rem', marginBottom: 4, color: '#444' }}><b>Dates:</b> {formatDateUTC(trip.startDate)} - {formatDateUTC(trip.endDate)}</div>
                    <div style={{ fontSize: '1.01rem', marginBottom: 10, color: '#444' }}><b>Travelers:</b> {trip.travelers}</div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 'auto', width: '100%' }}>
                      <button
                        type="button"
                        style={{ background: '#27ae60', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', minWidth: 0, transition: 'background 0.2s, color 0.2s' }}
                        onClick={() => navigate(`/view-trip/${trip._id}`)}
                        onMouseOver={e => { e.target.style.background = '#219150'; e.target.style.color = '#fff'; }}
                        onMouseOut={e => { e.target.style.background = '#27ae60'; e.target.style.color = '#fff'; }}
                      >View</button>
                      <button
                        type="button"
                        style={{ background: '#ffe066', color: '#222', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', minWidth: 0, transition: 'background 0.2s, color 0.2s' }}
                        onClick={() => navigate(`/edit-trip/${trip._id}`)}
                        onMouseOver={e => { e.target.style.background = '#ffd700'; e.target.style.color = '#111'; }}
                        onMouseOut={e => { e.target.style.background = '#ffe066'; e.target.style.color = '#222'; }}
                      >Edit</button>
                    </div>
                    {/* Small delete button, top right, only on hover */}
                    {hoveredCard === trip._id && (
                      <button
                        type="button"
                        style={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                          background: '#e74c3c',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 5,
                          padding: '3px 8px',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          minWidth: 0,
                          opacity: deletingId === trip._id ? 0.6 : 1,
                          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                          zIndex: 2,
                          transition: 'background 0.2s',
                        }}
                        onClick={() => handleDelete(trip._id)}
                        disabled={deletingId === trip._id}
                        onMouseOver={e => { e.target.style.background = '#c0392b'; }}
                        onMouseOut={e => { e.target.style.background = '#e74c3c'; }}
                      >{deletingId === trip._id ? 'Deleting...' : 'Delete'}</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Instructions container right-aligned under nav bar */}
          <div style={{ marginTop: 0, background: '#f8fafc', border: '1px solid #e0e7ef', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: '18px 18px 14px 18px', minWidth: 220, maxWidth: 260, color: '#222', fontSize: '1.05rem', lineHeight: 1.7, alignSelf: 'flex-start' }}>
            <div style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: 8, textAlign: 'center' }}>To Get Started:</div>
            <div style={{ marginBottom: 8, textAlign: 'left', fontSize: '0.93rem' }}>Click <b>"Create Trip"</b> to start creating a new trip plan. You will be able to:</div>
            <ol style={{ margin: 0, paddingLeft: 22, textAlign: 'left', fontSize: '0.93rem' }}>
              <li>Fill in initial trip details such as trip name, location, dates, and number of travelers</li>
              <li>Plan your day to day itinerary</li>
              <li>View your trip's cost breakdown summary</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper to format date as MM/DD/YYYY in UTC
function formatDateUTC(dateStr) {
  const d = new Date(dateStr);
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const yyyy = d.getUTCFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

export default Dashboard;
