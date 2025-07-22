import React from 'react';
import { useNavigate } from 'react-router-dom';

function HelpInformation() {
  const navigate = useNavigate();
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
        }}>Help & Information</h1>
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
        <div style={{ maxWidth: 700, margin: '16px auto 0 auto', background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', padding: '32px 28px 24px 28px', fontSize: '1.15rem', color: '#222', lineHeight: 1.7, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1.4rem', marginBottom: 12 }}>How to Use TripCraft</h2>
          <ol style={{ paddingLeft: 32, marginLeft: 16, textAlign: 'left', width: '100%', maxWidth: 520, marginTop: 0, marginBottom: 0 }}>
            <li>View your trip plans all in one place on your dashboard.</li>
            <li>Click "Create Trip" to start planning a new adventure.</li>
            <li>Fill in your trip details and save.</li>
            <li>Plan your itinerary by adding activities for each day.</li>
            <li>Assist your planning using our activity suggestions feature.</li>
            <li>View your cost summary to manage your budget.</li>
            <li>Edit your trip details or itinerary at any time.</li>
            <li>Share your trip plans using the share or export feature.</li>
          </ol>
          <h2 style={{ fontWeight: 700, fontSize: '1.3rem', margin: '28px 0 12px 0' }}>Frequently Asked Questions (FAQ)</h2>
          <div style={{ width: '100%', maxWidth: 520, margin: '0 auto', textAlign: 'left' }}>
            <div style={{ marginBottom: 18 }}>
              <strong>Q: How do I edit a trip after creating it?</strong>
              <div style={{ marginLeft: 16 }}>A: Go to your dashboard, find your trip, and click the "Edit" button to update trip details or itinerary.</div>
            </div>
            <div style={{ marginBottom: 18 }}>
              <strong>Q: Can I share my trip plans with others?</strong>
              <div style={{ marginLeft: 16 }}>A: Yes! Use the share or export feature to send your trip details to friends or family.</div>
            </div>
            <div style={{ marginBottom: 18 }}>
              <strong>Q: What if I forget to save my itinerary?</strong>
              <div style={{ marginLeft: 16 }}>A: Make sure to click the "Save Itinerary" button after making changes. Unsaved changes will not be kept if you leave the page.</div>
            </div>
            <div style={{ marginBottom: 18 }}>
              <strong>Q: How do I use the activity suggestions feature?</strong>
              <div style={{ marginLeft: 16 }}>A: When planning your itinerary, look for the activity suggestions section to get ideas for each day of your trip.</div>
            </div>
            <div style={{ marginBottom: 0 }}>
              <strong>Q: Who can I contact for technical support?</strong>
              <div style={{ marginLeft: 16 }}>A: Please email our support team at <a href="mailto:clarkem5@oregonstate.edu" style={{ color: '#1976d2', textDecoration: 'underline' }}>clarkem5@oregonstate.edu</a> for assistance.</div>
            </div>
          </div>
          <div style={{ height: 32 }}></div>
          <h2 style={{ fontWeight: 700, fontSize: '1.4rem', margin: '24px 0 12px 0' }}>Need More Help?</h2>
          <p>If you have questions or need support, please contact our team at <a href="mailto:clarkem5@oregonstate.edu" style={{ color: '#1976d2', textDecoration: 'underline' }}>clarkem5@oregonstate.edu</a>.</p>
        </div>
      </div>
    </div>
  );
}

export default HelpInformation;
