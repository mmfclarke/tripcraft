import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function ViewTrip() {
  const [showShareMsg, setShowShareMsg] = useState(false);
  const [showSafetyMsg, setShowSafetyMsg] = useState(false);
  const [showPhrasesMsg, setShowPhrasesMsg] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`http://localhost:5000/trips/${id}`)
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
  }, [id]);

  // Helper to format date as MM/DD/YYYY
  function formatDateMDY(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return (
      String(d.getUTCMonth() + 1).padStart(2, '0') + '/' +
      String(d.getUTCDate()).padStart(2, '0') + '/' +
      d.getUTCFullYear()
    );
  }

  // Calculate cost summary
  function getCostSummary(trip) {
    if (!trip || !Array.isArray(trip.itinerary)) return { total: 0, perTraveler: 0 };
    let total = 0;
    trip.itinerary.forEach(day => {
      if (Array.isArray(day.activities)) {
        day.activities.forEach(act => {
          const cost = parseFloat(act.cost);
          if (!isNaN(cost)) total += cost;
        });
      }
    });
    const travelers = parseInt(trip.travelers) || 1;
    return { total, perTraveler: total / travelers };
  }

  const costSummary = getCostSummary(trip);

  return (
    <div style={{ width: '100%', padding: 0, margin: 0, boxSizing: 'border-box', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={{
          fontSize: '2.8rem',
          fontWeight: 800,
          margin: '56px 0 4px 0', // Move header down
          letterSpacing: '-1px',
          textAlign: 'center',
          color: '#fff',
        }}>View Trip</h1>
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
          <div style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            height: '100%',
          }}>
            <span style={{ fontSize: '0.97rem', color: '#444', background: 'transparent', pointerEvents: 'auto' }}>
              View your trip details below.
            </span>
          </div>
        </nav>
        {/* Flex row: left = Local Safety Tips, right = main content/share */}
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', width: '100%', marginTop: 18, gap: 32 }}>
          {/* Left: Utility Feature Boxes */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 220, maxWidth: 260, gap: 18 }}>
            {/* Local Safety Tips Box */}
            <div
              style={{
                background: '#fff',
                border: '2px solid #ffe066',
                borderRadius: 10,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                padding: '18px 18px 18px 18px',
                color: '#111',
                fontSize: '1.05rem',
                lineHeight: 1.7,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: 220,
                maxWidth: 260,
              }}
              onMouseLeave={() => setShowSafetyMsg(false)}
            >
              <div style={{ fontWeight: 700, fontSize: '1.08rem', marginBottom: 10, textAlign: 'center' }}>
                Local Safety & Etiquette Tips
              </div>
              <div style={{ marginBottom: 14, textAlign: 'center', fontSize: '0.93rem' }}>
                Get helpful advice for your destination, including safety, local customs, and etiquette!
              </div>
              <button
                style={{
                  background: '#ffe066',
                  color: '#111',
                  fontWeight: 700,
                  fontSize: '1rem',
                  border: '2px solid #ffe066',
                  borderRadius: 6,
                  padding: '9px 0',
                  width: '100%',
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                  transition: 'border 0.2s',
                }}
                onMouseEnter={e => {
                  e.target.style.background = '#fffbe7';
                  e.target.style.border = '2px solid #ffd700';
                }}
                onMouseLeave={e => {
                  e.target.style.background = '#ffe066';
                  e.target.style.border = '2px solid #ffe066';
                }}
                onClick={() => setShowSafetyMsg(true)}
              >
                Local Safety Tips
              </button>
              {showSafetyMsg && (
                <div style={{ color: 'green', marginTop: 10, fontWeight: 600, fontSize: '1.01rem', textAlign: 'center' }}>
                  Feature Coming Soon!
                </div>
              )}
            </div>
            {/* Common Translation Phrase Box */}
            <div
              style={{
                background: '#fff',
                border: '2px solid #90caf9',
                borderRadius: 10,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                padding: '16px 14px 16px 14px',
                color: '#111',
                fontSize: '1.05rem',
                lineHeight: 1.7,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: 220,
                maxWidth: 260,
              }}
              onMouseLeave={() => setShowPhrasesMsg(false)}
            >
              <div style={{ fontWeight: 700, fontSize: '1.08rem', marginBottom: 8, textAlign: 'center', color: '#000000ff' }}>
                Common Phrase Translations
              </div>
              <div style={{ marginBottom: 10, textAlign: 'center', fontSize: '0.93rem', color: '#333' }}>
                Get helpful phrases for your trip. Choose a language/country and phrase type!
              </div>
              <form style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontWeight: 600, fontSize: '0.97rem', marginBottom: 2, color: '#000000ff', textAlign: 'left', width: '100%' }}>
                  Language or Country
                </label>
                <input
                  type="text"
                  placeholder='"Spanish" or "Mexico"'
                  style={{
                    width: '90%',
                    alignSelf: 'center',
                    padding: '6px 8px',
                    borderRadius: 5,
                    border: '1px solid #b0bec5',
                    fontSize: '0.8rem',
                    marginBottom: 2,
                  }}
                />
                <label style={{ fontWeight: 600, fontSize: '0.97rem', marginBottom: 2, color: '#000000ff', textAlign: 'left', width: '100%' }}>
                  Phrase Type
                </label>
                <input
                  type="text"
                  placeholder="greeting, food, etc."
                  style={{
                    width: '90%',
                    alignSelf: 'center',
                    padding: '6px 8px',
                    borderRadius: 5,
                    border: '1px solid #b0bec5',
                    fontSize: '0.8rem',
                  }}
                />
                <button
                  type="button"
                  style={{
                    marginTop: 6,
                    background: '#1976d2',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.98rem',
                    border: 'none',
                    borderRadius: 5,
                    padding: '7px 0',
                    width: '100%',
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(25, 118, 210, 0.08)',
                    transition: 'background 0.2s, color 0.2s',
                  }}
                  onMouseOver={e => { e.target.style.background = '#1251a3'; }}
                  onMouseOut={e => { e.target.style.background = '#1976d2'; }}
                  onClick={() => setShowPhrasesMsg(true)}
                >
                  Get Phrases
                </button>
                {showPhrasesMsg && (
                  <div style={{ color: 'green', marginTop: 10, fontWeight: 600, fontSize: '1.01rem', textAlign: 'center' }}>
                    Feature Coming Soon!
                  </div>
                )}
              </form>
            </div>
          </div>
          {/* Right: main content and share/export */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', width: '100%' }}>
            <div style={{ maxWidth: 900, width: '100%' }}>
              <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', padding: '8px 28px 16px 28px', display: 'flex', flexDirection: 'row', gap: 32, alignItems: 'flex-start', position: 'relative', margin: '0' }}>
                {loading ? (
                  <div style={{ textAlign: 'center', fontSize: '1.2rem' }}>Loading trip...</div>
                ) : error ? (
                  <div style={{ textAlign: 'center', color: 'red', fontSize: '1.2rem' }}>{error}</div>
                ) : trip ? (
                  <>
                    {/* Left: Trip Details and Cost Summary */}
                    <div style={{ flex: '0 0 320px', maxWidth: 320, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div style={{ color: '#111', marginBottom: 0, paddingBottom: 0, padding: '2px 18px 1px 18px', textAlign: 'left' }}>
                        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#111', marginBottom: 6 }}>Trip Details</h2>
                        <div><b>Name:</b> {trip.tripName}</div>
                        <div><b>Destination:</b> {trip.destination}</div>
                        <div><b>Dates:</b> {formatDateMDY(trip.startDate)} - {formatDateMDY(trip.endDate)}</div>
                        <div><b>Travelers:</b> {trip.travelers}</div>
                      </div>
                      <div style={{ color: '#111', marginBottom: 0, paddingBottom: 0, padding: '8px 18px 12px 18px', textAlign: 'left' }}>
                        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#111', marginBottom: 6 }}>Cost Summary</h2>
                        <div><b>Total Cost:</b> ${costSummary.total.toFixed(2)}</div>
                        <div><b>Cost Per Traveler:</b> ${costSummary.perTraveler.toFixed(2)}</div>
                      </div>
                    </div>
                    {/* Right: Itinerary */}
                    <div style={{ flex: 1, minWidth: 0, color: '#111' }}>
                      <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#111', marginTop: 0, marginBottom: 6 }}>Itinerary</h2>
                      {Array.isArray(trip.itinerary) && trip.itinerary.length > 0 ? (
                        trip.itinerary.map((day, i) => {
                          // Calculate date for this day
                          let dayDate = '';
                          if (trip.startDate) {
                            const [year, month, dayNum] = trip.startDate.split('T')[0].split('-').map(Number);
                            const dateForDay = new Date(Date.UTC(year, month - 1, dayNum + i));
                            dayDate = dateForDay.toLocaleDateString(undefined, {
                              year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
                            });
                          }
                          return (
                            <div key={i} style={{
                              marginBottom: 14,
                              background: '#fff',
                              border: '2px solid #111',
                              borderRadius: 10,
                              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                              padding: '18px 18px 12px 18px',
                              minWidth: 0,
                              width: '100%',
                              maxWidth: 350,
                              marginLeft: 'auto',
                              marginRight: 'auto',
                            }}>
                              <div style={{ fontWeight: 800, marginBottom: 4, fontSize: '1.18rem', color: '#111' }}>
                                Day {i + 1}{dayDate ? ` (${dayDate})` : ''}
                              </div>
                              {Array.isArray(day.activities) && day.activities.length > 0 ? (
                                day.activities.map((act, j) => (
                                  <div key={j} style={{ marginBottom: 12, paddingLeft: 8, borderLeft: '2px solid #e0e7ef', color: '#111', textAlign: 'left' }}>
                                    <div style={{ fontWeight: 600, fontSize: '1.07rem', color: '#111' }}>{act.activity || <span style={{color:'#888'}}>No activity name</span>}{act.startTime ? ` - ${act.startTime}` : ''}</div>
                                    <div style={{ color: '#111', fontWeight: 500 }}>Cost: {act.cost ? `$${parseFloat(act.cost).toFixed(2)}` : 'N/A'}</div>
                                    <div style={{ color: '#111' }}>Notes: {act.notes ? act.notes : <span style={{color:'#aaa'}}>None</span>}</div>
                                  </div>
                                ))
                              ) : (
                                <div style={{ color: '#888', fontSize: '0.98rem', marginLeft: 8 }}>No activities for this day.</div>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div style={{ color: '#888', fontSize: '0.98rem' }}>No itinerary available.</div>
                      )}
                    </div>
                  </>
                ) : null}
              </div>
              {/* Bottom share message and button container, right aligned under main content */}
              <div
                style={{
                  width: '100%',
                  background: 'none',
                  boxShadow: 'none',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  padding: '0',
                  margin: '18px 0 0 0',
                  position: 'static',
                  borderRadius: 0,
                  maxWidth: 900,
                  marginBottom: 36,
                }}
                onMouseLeave={() => setShowShareMsg(false)}
              >
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%', padding: '0 28px', maxWidth: 900, gap: 10, justifyContent: 'flex-end' }}>
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.97rem', marginBottom: 0, textAlign: 'left', whiteSpace: 'nowrap' }}>
                    Want to share this trip plan with friends?
                  </div>
                  <button
                    style={{
                      background: '#27ae60', // Green
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '0.93rem',
                      border: 'none',
                      borderRadius: 5,
                      padding: '6px 14px',
                      cursor: 'pointer',
                      boxShadow: '0 1px 4px rgba(39, 174, 96, 0.08)',
                      transition: 'background 0.2s, color 0.2s',
                      outline: 'none',
                      letterSpacing: '0.01em',
                      marginBottom: showShareMsg ? 6 : 0,
                    }}
                    onMouseOver={e => {
                      e.target.style.background = '#219150';
                    }}
                    onMouseOut={e => {
                      e.target.style.background = '#27ae60';
                    }}
                    onClick={() => setShowShareMsg(true)}
                  >
                    Export + Share
                  </button>
                  {showShareMsg && (
                    <div style={{ color: '#27ae60', fontWeight: 600, fontSize: '1.05rem', marginTop: 0, marginLeft: 12 }}>
                      Feature coming soon...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewTrip;
