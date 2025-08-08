import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function ViewTrip() {
  // Phrase translation state
  const [language, setLanguage] = useState('');
  const [phraseType, setPhraseType] = useState('');
  const [phrases, setPhrases] = useState([]);
  const [phrasesLoading, setPhrasesLoading] = useState(false);
  const [phrasesError, setPhrasesError] = useState('');

  // Handler for Get Phrases button
  const handleGetPhrases = async (e) => {
    e.preventDefault();
    setPhrasesError('');
    setPhrases([]);
    if (!language.trim() || !phraseType.trim()) {
      setPhrasesError('Please fill in both fields');
      return;
    }
    setPhrasesLoading(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/phrases/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          languageOrCountry: language.trim(),
          phraseType: phraseType.trim()
        })
      });
      const data = await response.json();
      if (data.success) {
        setPhrases(data.phrases);
      } else {
        setPhrasesError(data.error || 'Failed to get phrases');
      }
    } catch (err) {
      setPhrasesError('Failed to connect to translation service');
    } finally {
      setPhrasesLoading(false);
    }
  };
  // Helper to format safety tips into sections and bullet points
  function formatSafetyTips(tips) {
    if (!tips) return [];
    // Split into sections by headers (lines ending with colon)
    const sectionRegex = /([\w\s'"&]+:)/g;
    let matches = [];
    let result;
    while ((result = sectionRegex.exec(tips)) !== null) {
      // Only treat as header if not just a fragment (e.g., not 'existing Conditions:')
      if (result[1].trim().split(' ').length > 1 || /^[A-Z]/.test(result[1].trim())) {
        matches.push({ header: result[1].trim(), index: result.index });
      }
    }
    // Helper to merge lines split by hyphens (e.g., 'First-' + 'Aid Kit:')
    function mergeHyphenLines(arr) {
      let merged = [];
      let i = 0;
      while (i < arr.length) {
        let current = arr[i];
        // If current ends with hyphen and next starts with lowercase or continues the word
        if (i < arr.length - 1 && /-$/.test(current) && /^[a-z]/.test(arr[i + 1])) {
          merged.push((current + arr[i + 1]).replace(/-\s*/, ''));
          i += 2;
        } else {
          merged.push(current);
          i++;
        }
      }
      return merged;
    }
    // Remove lines that are just a colon, asterisk, or single-word section header, and strip leading colon from tips
    function cleanTipsArr(arr) {
      return arr
        .map(t => t.trim())
        // Remove lines that are just punctuation, asterisk, or short fragment (with or without leading punctuation)
        .filter(t => {
          if (!t || t === ':' || t === '•' || t === '-' || t === '*') return false;
          // Remove lines like "'t:", "s:", "ce:", etc. (with or without leading punctuation)
          if (/^[^\w\d]*[a-zA-Z]{1,3}:$/.test(t)) return false;
          // Remove lines that are just a single word (with or without punctuation)
          if (/^[^\w\d]*[a-zA-Z]+['"]?:?$/.test(t)) return false;
          return true;
        })
        // Strip leading punctuation and short fragment prefixes from start of tip lines
        .map(t => t.replace(/^[^\w\d]*[a-zA-Z]{1,3}:(\s*)/, ''))
        .map(t => t.startsWith(':') ? t.slice(1).trim() : t);
    }
    let sections = [];
    if (matches.length > 0) {
      for (let i = 0; i < matches.length; i++) {
        const start = matches[i].index + matches[i].header.length;
        const end = (i + 1 < matches.length) ? matches[i + 1].index : tips.length;
        const content = tips.slice(start, end).trim();
        // Split content into tips by period, semicolon, or newline
        let tipsArr = content.split(/[.;\n]/);
        tipsArr = mergeHyphenLines(tipsArr);
        tipsArr = cleanTipsArr(tipsArr);
        // Remove leading bullets from tips
        const cleanedTipsArr = tipsArr.map(tip => tip.startsWith('•') ? tip.slice(1).trim() : tip);
        sections.push({ header: matches[i].header, tips: cleanedTipsArr });
      }
    } else {
      // No headers found, fallback to splitting by period/semicolon/newline
      let tipsArr = tips.split(/[.;\n]/);
      tipsArr = mergeHyphenLines(tipsArr);
      tipsArr = cleanTipsArr(tipsArr);
      const cleanedTipsArr = tipsArr.map(tip => tip.startsWith('•') ? tip.slice(1).trim() : tip);
      sections.push({ header: '', tips: cleanedTipsArr });
    }
    return sections;
  }
  const [showShareMsg, setShowShareMsg] = useState(false);
  // Export trip states
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  // Export handler function
  const handleExportTrip = async () => {
    if (!trip?._id) {
      setExportError('No trip data available for export');
      return;
    }

    setIsExporting(true);
    setExportError('');
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/trips/${trip._id}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        let errorData = null;
        try {
          errorData = await response.json();
        } catch {}
        throw new Error((errorData && errorData.error) || 'Export failed');
      }

      // Create blob from response and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${trip.tripName || 'trip'}_export.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setShowShareMsg(true);
      setTimeout(() => setShowShareMsg(false), 3000);
    } catch (error) {
      console.error('Export error:', error);
      setExportError(error.message);
      setTimeout(() => setExportError(''), 5000);
    } finally {
      setIsExporting(false);
    }
  };
  // Safety tips integration
  const [safetyTips, setSafetyTips] = useState(null);
  const [safetyLoading, setSafetyLoading] = useState(false);
  const [safetyError, setSafetyError] = useState('');
  // Fetch safety tips from backend microservice
  const fetchSafetyTips = async () => {
    if (!trip || !trip._id) {
      return;
    }
    setSafetyLoading(true);
    setSafetyError('');
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/trips/${trip._id}/safety-tips`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setSafetyTips(data.safetyTips);
      } else {
        setSafetyError(data.error || 'Failed to fetch safety tips');
      }
    } catch (error) {
      console.error('Error fetching safety tips:', error);
      setSafetyError('Network error - please try again');
    } finally {
      setSafetyLoading(false);
    }
  };
  const navigate = useNavigate();
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    fetch(`${apiUrl}/trips/${id}`)
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
                onClick={fetchSafetyTips}
              >
                {safetyLoading ? 'Generating Tips...' : 'Local Safety Tips'}
              </button>
              {safetyError && (
                <div style={{ color: 'red', marginTop: 10, fontWeight: 600, fontSize: '0.9rem', textAlign: 'center' }}>
                  {safetyError}
                </div>
              )}
            {/* Safety Tips Results Section */}
            {safetyTips && (
              <div style={{
                background: '#fff',
                border: '2px solid #4caf50',
                borderRadius: 10,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                padding: '16px',
                marginTop: 18,
                maxWidth: 260,
              }}>
                <div style={{ fontWeight: 700, fontSize: '1.08rem', marginBottom: 12, textAlign: 'center', color: '#4caf50' }}>
                  Safety Tips for {trip?.destination}
                </div>
                <div style={{
                  fontSize: '0.85rem',
                  lineHeight: 1.5,
                  color: '#333',
                  maxHeight: 300,
                  overflowY: 'auto',
                  textAlign: 'left',
                }}>
                  {formatSafetyTips(safetyTips.tips).map((section, idx) => (
                    <div key={idx} style={{ marginBottom: 14 }}>
                      {section.header && <div style={{ fontWeight: 700, marginBottom: 6 }}>{section.header}</div>}
                      <ul style={{ paddingLeft: 18, margin: 0 }}>
                        {section.tips.map((tip, i) => (
                          <li key={i} style={{ marginBottom: 4 }}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setSafetyTips(null)}
                  style={{
                    marginTop: 12,
                    background: '#f5f5f5',
                    border: '1px solid #ddd',
                    borderRadius: 5,
                    padding: '6px 12px',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    width: '100%'
                  }}
                >
                  Hide Tips
                </button>
              </div>
            )}
            </div>
            {/* Phrase Translation Box */}
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
            >
              <div style={{ fontWeight: 700, fontSize: '1.08rem', marginBottom: 8, textAlign: 'center', color: '#000000ff' }}>
                Common Phrase Translations
              </div>
              <div style={{ marginBottom: 10, textAlign: 'center', fontSize: '0.93rem', color: '#333' }}>
                Get helpful phrases for your trip. Choose a language/country and phrase type!
              </div>
              <form style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }} onSubmit={handleGetPhrases}>
                <label style={{ fontWeight: 600, fontSize: '0.97rem', marginBottom: 2, color: '#000000ff', textAlign: 'left', width: '100%' }}>
                  Language or Country
                </label>
                <input
                  type="text"
                  placeholder='"Spanish" or "Mexico"'
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
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
                  value={phraseType}
                  onChange={e => setPhraseType(e.target.value)}
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
                  type="submit"
                  disabled={phrasesLoading}
                  style={{
                    marginTop: 6,
                    background: phrasesLoading ? '#ccc' : '#1976d2',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.98rem',
                    border: 'none',
                    borderRadius: 5,
                    padding: '7px 0',
                    width: '100%',
                    cursor: phrasesLoading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 1px 2px rgba(25, 118, 210, 0.08)',
                    transition: 'background 0.2s, color 0.2s',
                  }}
                  onMouseOver={e => { if (!phrasesLoading) e.target.style.background = '#1251a3'; }}
                  onMouseOut={e => { if (!phrasesLoading) e.target.style.background = '#1976d2'; }}
                >
                  {phrasesLoading ? 'Getting Phrases...' : 'Get Phrases'}
                </button>
                {phrasesError && (
                  <div style={{ color: 'red', marginTop: 10, fontWeight: 600, fontSize: '0.9rem', textAlign: 'center' }}>
                    {phrasesError}
                  </div>
                )}
                {phrases.length > 0 && (
                  <div style={{
                    marginTop: 10,
                    maxHeight: '200px',
                    overflowY: 'auto',
                    border: '1px solid #e0e0e0',
                    borderRadius: 5,
                    padding: 8
                  }}>
                    {phrases.map((phrase, index) => (
                      <div key={index} style={{
                        marginBottom: 8,
                        padding: 6,
                        background: '#f5f5f5',
                        borderRadius: 4,
                        fontSize: '0.85rem'
                      }}>
                        <div style={{ fontWeight: 600, color: '#333' }}>{phrase.english}</div>
                        <div style={{ color: '#1976d2', fontStyle: 'italic' }}>{phrase.translation}</div>
                      </div>
                    ))}
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
                      background: isExporting ? '#95a5a6' : '#27ae60',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '0.93rem',
                      border: 'none',
                      borderRadius: 5,
                      padding: '6px 14px',
                      cursor: isExporting ? 'not-allowed' : 'pointer',
                      boxShadow: '0 1px 4px rgba(39, 174, 96, 0.08)',
                      transition: 'background 0.2s, color 0.2s',
                      outline: 'none',
                      letterSpacing: '0.01em',
                      marginBottom: showShareMsg || exportError ? 6 : 0,
                    }}
                    onMouseOver={e => {
                      if (!isExporting) {
                        e.target.style.background = '#219150';
                      }
                    }}
                    onMouseOut={e => {
                      if (!isExporting) {
                        e.target.style.background = '#27ae60';
                      }
                    }}
                    onClick={handleExportTrip}
                    disabled={isExporting}
                  >
                    {isExporting ? 'Exporting...' : 'Export + Share'}
                  </button>
                  {showShareMsg && !exportError && (
                    <div style={{ color: '#27ae60', fontWeight: 600, fontSize: '1.05rem', marginTop: 0, marginLeft: 12 }}>
                      Trip exported successfully!
                    </div>
                  )}
                  {exportError && (
                    <div style={{ color: '#e74c3c', fontWeight: 600, fontSize: '1.05rem', marginTop: 0, marginLeft: 12 }}>
                      Export failed: {exportError}
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
