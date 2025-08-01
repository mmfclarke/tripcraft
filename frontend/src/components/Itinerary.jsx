import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Itinerary() {
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
  const navigate = useNavigate();
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [trip, setTrip] = useState(null);
  const [selectedDay, setSelectedDay] = useState(1);
  const [itinerary, setItinerary] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Top-level hover state for activity cards
  const [hoveredActivityIdx, setHoveredActivityIdx] = useState(null);

  useEffect(() => {
    const tripId = localStorage.getItem('selectedTripId');
    if (!tripId) {
      setError('No trip selected. Please create or select a trip first.');
      setLoading(false);
      return;
    }
    fetch(`http://localhost:5000/trips/${tripId}`)
      .then(res => res.json())
      .then(data => {
        if (data.trip) {
          setTrip(data.trip);
          // Initialize itinerary state from trip or create empty days
          if (data.trip.itinerary && Array.isArray(data.trip.itinerary)) {
            setItinerary(data.trip.itinerary.length > 0 ? data.trip.itinerary : []);
          } else {
            setItinerary([]);
          }
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

  let dayOptions = ['Day 1'];
  let numDays = 1;
  if (trip && trip.startDate && trip.endDate) {
    const msPerDay = 1000 * 60 * 60 * 24;
    const tripStart = new Date(trip.startDate);
    const tripEnd = new Date(trip.endDate);
    const startMs = Date.UTC(tripStart.getFullYear(), tripStart.getMonth(), tripStart.getDate());
    const endMs = Date.UTC(tripEnd.getFullYear(), tripEnd.getMonth(), tripEnd.getDate());
    numDays = Math.max(1, Math.floor((endMs - startMs) / msPerDay) + 1);
    dayOptions = Array.from({ length: numDays }, (_, i) => `Day ${i + 1}`);
  }
  // Ensure itinerary has an entry for each day
  useEffect(() => {
    if (numDays > 0 && itinerary.length !== numDays) {
      setItinerary(prev => {
        const arr = Array.from({ length: numDays }, (_, i) => prev[i] ? prev[i] : { activities: [] });
        return arr;
      });
    }

  }, [numDays, itinerary.length]);
  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: 60, fontSize: '1.2rem' }}>Loading trip...</div>;
  }
  if (error) {
    return <div style={{ textAlign: 'center', marginTop: 60, color: 'red', fontSize: '1.2rem' }}>{error}</div>;
  }

  // Calculate the date for the selected day
  let selectedDateStr = '';
  if (trip && trip.startDate) {
    const [year, month, day] = trip.startDate.split('T')[0].split('-').map(Number);
    const dateForDay = new Date(Date.UTC(year, month - 1, day + (selectedDay - 1)));
    selectedDateStr = dateForDay.toLocaleDateString(undefined, {
      year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
    });
  }

  // Handlers for activities
  const handleActivityChange = (idx, field, value) => {
    setItinerary(prev => {
      const copy = prev.map(day => ({
        activities: Array.isArray(day.activities)
          ? day.activities.map(a => ({ ...a }))
          : []
      }));
      if (!copy[selectedDay - 1]) copy[selectedDay - 1] = { activities: [] };
      if (!Array.isArray(copy[selectedDay - 1].activities)) copy[selectedDay - 1].activities = [];
      if (!copy[selectedDay - 1].activities[idx]) copy[selectedDay - 1].activities[idx] = { activity: '', startTime: '', cost: '', notes: '' };
      // Map 'time' field to 'startTime' for consistency
      if (field === 'time') {
        copy[selectedDay - 1].activities[idx]['startTime'] = value;
      } else {
        copy[selectedDay - 1].activities[idx][field] = value;
      }
      return copy;
    });
  };
  const handleAddActivity = () => {
    setItinerary(prev => {
      const copy = prev.map(day => ({
        activities: Array.isArray(day.activities)
          ? day.activities.map(a => ({ ...a }))
          : []
      }));
      // Ensure the day exists
      while (copy.length < selectedDay) {
        copy.push({ activities: [] });
      }
      if (!copy[selectedDay - 1]) copy[selectedDay - 1] = { activities: [] };
      if (!Array.isArray(copy[selectedDay - 1].activities)) copy[selectedDay - 1].activities = [];
      copy[selectedDay - 1].activities.push({ activity: '', startTime: '', cost: '', notes: '' });
      return copy;
    });
  };
  const handleRemoveActivity = (idx) => {
    setItinerary(prev => {
      const copy = prev.map(day => ({ activities: Array.isArray(day.activities) ? day.activities.map(a => ({ ...a })) : [] }));
      if (!copy[selectedDay - 1] || !Array.isArray(copy[selectedDay - 1].activities)) return copy;
      copy[selectedDay - 1].activities.splice(idx, 1);
      return copy;
    });
  };

  // Save itinerary to backend
  const saveItinerary = async (onSuccessNavigateTo = null) => {
    if (!trip || !Array.isArray(itinerary) || itinerary.length === 0) {
      setSaveError('Trip or itinerary not loaded. Cannot save.');
      return;
    }
    setSaving(true);
    setSaveError('');
    setSaveSuccess('');
    try {
      // Preserve original day label if present, fallback to Day N
      const fixedItinerary = itinerary.map((day, i) => ({
        day: day.day ? day.day : `Day ${i + 1}`,
        activities: Array.isArray(day.activities)
          ? day.activities.map(a => ({
              startTime: a.startTime || '',
              activity: a.activity || '',
              cost: a.cost === '' || a.cost === null || isNaN(Number(a.cost)) ? null : Number(a.cost),
              notes: a.notes || ''
            }))
          : []
      }));
      if (fixedItinerary.length === 0) {
        setSaveError('No itinerary data to save.');
        setSaving(false);
        return;
      }
      // Debug log outgoing request
      console.log('Saving itinerary to backend:', JSON.stringify({ itinerary: fixedItinerary }, null, 2));
      const res = await fetch(`http://localhost:5000/trips/${trip._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itinerary: fixedItinerary })
      });
      let data = null;
      try {
        data = await res.json();
      } catch (e) {
        setSaveError('Server error: Invalid response');
        setSaving(false);
        return;
      }
      if (!res.ok || (data && data.error)) {
        setSaveError((data && data.error ? data.error : 'Failed to save itinerary') + (data && data.details ? `: ${data.details}` : ''));
      } else {
        // Reload trip from backend to ensure UI is up-to-date, then show success message and route after delay
        fetch(`http://localhost:5000/trips/${trip._id}`)
          .then(res2 => res2.json())
          .then(data2 => {
            if (data2.trip) {
              setTrip(data2.trip);
              setItinerary(data2.trip.itinerary);
              setSaveError('');
              setSaveSuccess('Itinerary saved successfully!');
              // Update localStorage with the latest trip object (including updated itinerary)
              localStorage.setItem('selectedTripObj', JSON.stringify(data2.trip));
              if (onSuccessNavigateTo) {
                setTimeout(() => navigate(onSuccessNavigateTo), 1000);
              }
            } else {
              setSaveError('Trip not found after save.');
            }
          })
          .catch(() => setSaveError('Failed to reload trip after save.'));
      }
    } catch (err) {
      setSaveError('Server error');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    await saveItinerary('/dashboard');
  };

  const handleSaveAndCostSummary = async () => {
    await saveItinerary('/cost-summary');
  };

  return (
    <div style={{ width: '100%', padding: 0, margin: 0, boxSizing: 'border-box', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', flex: 1, width: '100%' }}>
        <h1 style={{
          fontSize: '2.8rem',
          fontWeight: 800,
          margin: '56px 0 4px 0', // Move header down
          letterSpacing: '-1px',
          textAlign: 'center',
          color: '#fff',
        }}>Itinerary</h1>
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
              Start planning your trip itinerary here!
            </span>
          </div>
        </nav>
        {/* Flex row: left inspiration, center planning, right steps */}
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginTop: 18,
          gap: 32,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', minWidth: 200, maxWidth: 220, width: '100%' }}>
            {/* Trip Details Box */}
            <div style={{
              marginTop: 24,
              background: '#f8fafc',
              border: '1px solid #e0e7ef',
              borderRadius: 10,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              padding: '18px 18px 14px 18px',
              color: '#222',
              fontSize: '1.05rem',
              lineHeight: 1.7,
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              minWidth: 220,
              maxWidth: 250,
            }}>
              <div style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: 8 }}>Trip Details</div>
              <div style={{ marginBottom: 6 }}><b>Name:</b> {trip?.tripName || ''}</div>
              <div style={{ marginBottom: 6 }}><b>Destination:</b> {trip?.destination || ''}</div>
              <div><b>Dates:</b></div>
              <div style={{ marginLeft: 0, marginTop: 2, marginBottom: 0, textAlign: 'left', width: '100%' }}>
                {formatDateMDY(trip?.startDate)} - {formatDateMDY(trip?.endDate)}
              </div>
            </div>
            {/* Inspiration/Suggestion Box */}
            <div
              style={{
                marginTop: 18,
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
                minWidth: 205,
                maxWidth: 215,
              }}
              onMouseLeave={() => setShowComingSoon(false)}
            >
              <div style={{ fontWeight: 700, fontSize: '1.08rem', marginBottom: 10, textAlign: 'center' }}>
                Need inspiration?
              </div>
              <div style={{ marginBottom: 14, textAlign: 'center', fontSize: '0.93rem' }}>
                Click the button below for activity suggestions!
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
                onClick={() => setShowComingSoon(true)}
              >Get Suggestions</button>
              {showComingSoon && (
                <div style={{ color: 'green', marginTop: 10, fontWeight: 600, fontSize: '1.01rem', textAlign: 'center' }}>
                  Feature Coming Soon!
                </div>
              )}
            </div>
          </div>
          {/* Center: Planning container (day dropdown) */}
          <div style={{
            marginTop: 24,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minWidth: 0,
          }}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              <label htmlFor="day-select" style={{ fontWeight: 600, fontSize: '1.08rem', marginRight: 10, color: '#fff' }}>
                Select Day:
              </label>
              <select
                id="day-select"
                value={selectedDay}
                onChange={e => setSelectedDay(Number(e.target.value))}
                style={{
                  fontSize: '1.08rem',
                  padding: '7px 16px',
                  borderRadius: 6,
                  border: '1px solid #bfc7d1',
                  marginLeft: 4,
                  marginBottom: 0,
                  minWidth: 120,
                  textAlign: 'center',
                  fontWeight: 500,
                  background: '#fff',
                  color: '#222',
                  outline: 'none',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                }}
              >
                {dayOptions.map((label, idx) => (
                  <option key={label} value={idx + 1}>{label}</option>
                ))}
              </select>
            </div>
            {/* Show the date for the selected day below the dropdown */}
            {selectedDateStr && (
              <div style={{ marginTop: 10, fontSize: '1.08rem', color: '#fff', fontWeight: 600 }}>
                {selectedDateStr}
              </div>
            )}
            {/* Activities for selected day */}
            <div style={{ marginTop: 18, width: '100%', maxWidth: 480 }}>
              {(itinerary[selectedDay - 1]?.activities || []).map((act, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    background: '#f8fafc',
                    border: '1px solid #bfc7d1',
                    borderRadius: 10,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                    padding: '18px 18px 12px 18px',
                    marginBottom: 18,
                    width: '100%',
                    maxWidth: 420,
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    position: 'relative'
                  }}
                  onMouseEnter={() => setHoveredActivityIdx(idx)}
                  onMouseLeave={() => setHoveredActivityIdx(null)}
                >
                  {hoveredActivityIdx === idx && (
                    <button
                      type="button"
                      style={{ position: 'absolute', top: 10, right: 10, background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 5, padding: '6px 16px', cursor: 'pointer', fontWeight: 700, fontSize: '1rem' }}
                      onClick={() => handleRemoveActivity(idx)}
                      title="Delete Activity"
                    >Delete</button>
                  )}
                  <input
                    style={{ width: '100%', marginBottom: 10, padding: '8px 10px', borderRadius: 6, border: '1px solid #bfc7d1', fontSize: '1rem' }}
                    value={act.activity}
                    placeholder="Activity"
                    onChange={e => handleActivityChange(idx, 'activity', e.target.value)}
                  />
                  <input
                    style={{ width: '100%', marginBottom: 10, padding: '8px 10px', borderRadius: 6, border: '1px solid #bfc7d1', fontSize: '1rem' }}
                    value={act.startTime}
                    placeholder="Start Time"
                    onChange={e => handleActivityChange(idx, 'startTime', e.target.value)}
                  />
                  <input
                    style={{ width: '100%', marginBottom: 10, padding: '8px 10px', borderRadius: 6, border: '1px solid #bfc7d1', fontSize: '1rem' }}
                    value={act.cost}
                    placeholder="Cost"
                    type="number"
                    min="0"
                    onChange={e => handleActivityChange(idx, 'cost', e.target.value)}
                  />
                  <textarea
                    style={{ width: '100%', marginBottom: 10, padding: '8px 10px', borderRadius: 6, border: '1px solid #bfc7d1', fontSize: '1rem', minHeight: 48, resize: 'vertical' }}
                    value={act.notes}
                    placeholder="Notes"
                    onChange={e => handleActivityChange(idx, 'notes', e.target.value)}
                  />
                </div>
              ))}
              <button
                type="button"
                style={{ display: 'block', margin: '0 auto', background: '#fff', color: '#111', border: '2px solid #111', borderRadius: 6, padding: '10px 28px', fontWeight: 700, cursor: 'pointer', fontSize: '1.08rem', transition: 'background 0.2s, color 0.2s, border 0.2s' }}
                onClick={handleAddActivity}
                onMouseOver={e => {
                  e.target.style.background = '#111';
                  e.target.style.color = '#fff';
                  e.target.style.border = '2px solid #111';
                }}
                onMouseOut={e => {
                  e.target.style.background = '#fff';
                  e.target.style.color = '#111';
                  e.target.style.border = '2px solid #111';
                }}
              >Add Activity</button>
            {/* Add more vertical space below Add Activity button */}
            <div style={{ height: 32 }} />
            </div>
            {/* Save button and error */}
            <div style={{ marginTop: 18, width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 28, width: '100%', justifyContent: 'center', marginBottom: 6 }}>
                <button
                  type="button"
                  style={{ background: '#ff9800', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 32px', fontWeight: 700, fontSize: '1.08rem', cursor: 'pointer', transition: 'background 0.2s, color 0.2s', marginRight: 0, whiteSpace: 'nowrap', minWidth: 120 }}
                  onClick={() => trip && navigate(`/edit-trip/${trip._id}`)}
                  disabled={!trip}
                  onMouseOver={e => {
                    e.target.style.background = '#fb8c00';
                    e.target.style.color = '#fff';
                  }}
                  onMouseOut={e => {
                    e.target.style.background = '#ff9800';
                    e.target.style.color = '#fff';
                  }}
                >&larr; Back</button>
                <button
                  type="button"
                  style={{ background: '#27ae60', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 32px', fontWeight: 700, fontSize: '1.08rem', cursor: 'pointer', transition: 'background 0.2s, color 0.2s' }}
                  onClick={handleSave}
                  disabled={saving || !trip || !Array.isArray(itinerary) || itinerary.length === 0}
                  onMouseOver={e => {
                    e.target.style.background = '#219150';
                    e.target.style.color = '#fff';
                  }}
                  onMouseOut={e => {
                    e.target.style.background = '#27ae60';
                    e.target.style.color = '#fff';
                  }}
                >{saving ? 'Saving...' : 'Save Details'}</button>
                <button
                  type="button"
                  style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 32px', fontWeight: 700, fontSize: '1.08rem', cursor: 'pointer', transition: 'background 0.2s, color 0.2s' }}
                  onClick={handleSaveAndCostSummary}
                  disabled={saving || !trip || !Array.isArray(itinerary) || itinerary.length === 0}
                  onMouseOver={e => {
                    e.target.style.background = '#145ea8';
                    e.target.style.color = '#fff';
                  }}
                  onMouseOut={e => {
                    e.target.style.background = '#1976d2';
                    e.target.style.color = '#fff';
                  }}
                >{saving ? 'Saving...' : 'View Cost Summary'}</button>
              </div>
              {saveSuccess && (
                <div style={{ color: 'green', marginTop: 4, fontWeight: 600 }}>{saveSuccess}</div>
              )}
              {saveError && saveError.trim() !== '' && (
                <div style={{ color: 'red', marginTop: 4 }}>{saveError}</div>
              )}
            </div>
          </div>
          {/* Right: Steps block */}
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
            <div style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: 8, textAlign: 'center' }}>Start your itinerary:</div>
            <ol style={{ margin: 0, paddingLeft: 20, textAlign: 'left', fontSize: '0.93rem' }}>
              <li style={{ marginBottom: 6 }}>Select the day you wish to edit from the dropdown</li>
              <li style={{ marginBottom: 6 }}>Add activities with time slots, costs, and notes</li>
              <li>Select a new day and repeat to craft your adventure</li>
            </ol>
          </div>
        </div>
      </div>
      {/* Bottom buffer to prevent content from touching the bottom of the page */}
      <div style={{ height: 48 }} />
    </div>
  );
}

export default Itinerary;
