import React from 'react';
import { useNavigate } from 'react-router-dom';

function CostSummary() {
  const navigate = useNavigate();
  const [trip, setTrip] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    // Try to get the full trip object from localStorage first
    const tripObjStr = localStorage.getItem('selectedTripObj');
    if (tripObjStr) {
      try {
        const tripObj = JSON.parse(tripObjStr);
        setTrip(tripObj);
        setLoading(false);
        return;
      } catch (e) {
        // If parsing fails, fallback to fetch
      }
    }
    const tripId = localStorage.getItem('selectedTripId');
    if (!tripId) {
      setError('No trip selected.');
      setLoading(false);
      return;
    }
    fetch(`http://localhost:5000/trips/${tripId}`)
      .then(res => res.json())
      .then(data => {
        if (data.trip) {
          setTrip(data.trip);
        } else {
          setError('Trip not found.');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load trip.');
        setLoading(false);
      });
  }, []);

  // Helper functions
  function getDayDate(startDate, dayIdx) {
    if (!startDate) return '';
    const [year, month, day] = startDate.split('T')[0].split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day + dayIdx));
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
  }
  function getNumDays(startDate, endDate) {
    if (!startDate || !endDate) return 1;
    const d1 = new Date(startDate);
    const d2 = new Date(endDate);
    return Math.max(1, Math.floor((Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate()) - Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate())) / (1000*60*60*24)) + 1);
  }
  // Format date as MM/DD/YYYY (UTC)
  function formatDateMDY(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return (
      String(d.getUTCMonth() + 1).padStart(2, '0') + '/' +
      String(d.getUTCDate()).padStart(2, '0') + '/' +
      d.getUTCFullYear()
    );
  }

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: 60, fontSize: '1.2rem' }}>Loading trip...</div>;
  }
  if (error) {
    return <div style={{ textAlign: 'center', marginTop: 60, color: 'red', fontSize: '1.2rem' }}>{error}</div>;
  }

  if (!trip) {
    return <div style={{ textAlign: 'center', marginTop: 60, fontSize: '1.2rem' }}>Loading trip...</div>;
  }

  // Only calculate cost breakdown if trip is loaded
  const numDays = getNumDays(trip.startDate, trip.endDate);
  let itinerary = Array.isArray(trip.itinerary) ? trip.itinerary : [];
  // Defensive: If itinerary is missing or too short, fill with empty days
  if (itinerary.length < numDays) {
    itinerary = [
      ...itinerary,
      ...Array.from({ length: numDays - itinerary.length }, (_, i) => ({ day: `Day ${itinerary.length + i + 1}`, activities: [] }))
    ];
  }
  const travelers = Number(trip.travelers) || 1;
  const dayCosts = Array.from({ length: numDays }, (_, i) => {
    const dayActs = Array.isArray(itinerary[i]?.activities) ? itinerary[i].activities : [];
    return dayActs.reduce((acc, act) => acc + (Number(act.cost) || 0), 0);
  });
  const totalCost = dayCosts.reduce((a, b) => a + b, 0);
  const costPerTraveler = travelers > 0 ? totalCost / travelers : totalCost;
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
        }}>Cost Summary</h1>
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
            onClick={() => navigate('/dashboard')}
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
        </nav>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}>
          {/* Left: Trip info block */}
          <div style={{
            marginTop: 24,
            background: '#f8fafc',
            border: '1px solid #e0e7ef',
            borderRadius: 10,
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            padding: '18px 18px 14px 18px',
            minWidth: 300,
            maxWidth: 340,
            color: '#222',
            fontSize: '1.05rem',
            lineHeight: 1.7,
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}>
            <div style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: 8 }}>Trip Details</div>
            <div style={{ marginBottom: 6 }}><b>Name:</b> {trip?.tripName || ''}</div>
            <div style={{ marginBottom: 6 }}><b>Destination:</b> {trip?.destination || ''}</div>
            <div><b>Dates:</b></div>
            <div style={{ marginLeft: 0, marginTop: 2, marginBottom: 0, textAlign: 'left', width: '100%' }}>
              {formatDateMDY(trip?.startDate)} - {formatDateMDY(trip?.endDate)}
            </div>
          </div>
          {/* Center: Main cost summary content will go here */}
          <div style={{ marginTop: 24, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0 }}>
            {/* Cost Breakdown */}
            <div style={{ width: '100%', maxWidth: 420, background: '#fff', border: '1px solid #e0e7ef', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: '22px 24px 18px 24px', marginBottom: 18 }}>
              <div style={{ fontWeight: 700, fontSize: '1.18rem', marginBottom: 12, textAlign: 'center' }}>Cost Breakdown</div>
              {dayCosts.map((amt, i) => (
                <div key={i} style={{ marginBottom: 7, fontSize: '1.05rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Day {i + 1} ({getDayDate(trip.startDate, i)}):</span>
                  <span style={{ fontWeight: 600 }}>$ {amt.toFixed(2)}</span>
                </div>
              ))}
              <hr style={{ margin: '18px 0 10px 0', border: 0, borderTop: '1px solid #e0e7ef' }} />
              <div style={{ fontWeight: 700, fontSize: '1.09rem', marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
                <span>Total Cost:</span>
                <span>$ {totalCost.toFixed(2)}</span>
              </div>
              {travelers > 1 && (
                <>
                  <div style={{ fontWeight: 600, fontSize: '1.05rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Cost Per Traveler:</span>
                    <span>$ {costPerTraveler.toFixed(2)}</span>
                  </div>
                  <div style={{ fontSize: '0.97rem', color: '#444', marginTop: 6, textAlign: 'right' }}>
                    (based on {travelers} travelers)
                  </div>
                </>
              )}
              {/* Back button moved below container */}
            </div>
            <div style={{ marginTop: 10, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0 }}>
              {/* Centered Back button below cost breakdown */}
              <button
                type="button"
                style={{
                  marginTop: 10,
                  width: 150,
                  display: 'block',
                  background: '#ff9800',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '10px 0',
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  cursor: 'pointer',
                  transition: 'background 0.2s, color 0.2s',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }}
                onClick={() => navigate('/itinerary')}
                onMouseOver={e => {
                  e.target.style.background = '#fb8c00';
                  e.target.style.color = '#fff';
                }}
                onMouseOut={e => {
                  e.target.style.background = '#ff9800';
                  e.target.style.color = '#fff';
                }}
              >
                &larr; Back
              </button>
            </div>
          </div>
          {/* Right: Explanation/info block (matching itinerary steps block) */}
          <div style={{
            marginTop: 24,
            background: '#f8fafc',
            border: '1px solid #e0e7ef',
            borderRadius: 10,
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            padding: '18px 18px 14px 18px',
            minWidth: 200,
            maxWidth: 220,
            color: '#222',
            fontSize: '1.05rem',
            lineHeight: 1.7,
          }}>
            <div style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: 8, textAlign: 'center' }}>Explanation</div>
            <div style={{ textAlign: 'left', fontSize: '0.93rem' }}>
              Your cost summary is calculated from the activities and expenses you entered in your itinerary, along with the number of travelers for your trip. Costs are broken down by day for easy review. See your total trip cost and how much each person owes!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CostSummary;
