import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import ViewTrip from './components/ViewTrip';
import Login from './components/Login.jsx';
import CreateAccount from './components/CreateAccount.jsx';
import Dashboard from './components/Dashboard.jsx';
import CreateTrip from './components/CreateTrip.jsx';
import Itinerary from './components/Itinerary.jsx';
import EditTrip from './components/EditTrip.jsx';
import HelpInformation from './components/HelpInformation.jsx';

function App() {
  return (
    <BrowserRouter>
      <div
        className="App"
        style={{
          minHeight: '100vh',
          backgroundImage: 'url("/background.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Blurred overlay */}
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 0,
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            pointerEvents: 'none',
          }}
        />
        <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 1 }}>
          <div style={{ fontWeight: 'bold', fontSize: '2.5rem', letterSpacing: '2px', color: '#fff', textShadow: '0 2px 8px #2228' }}>TripCraft</div>
          <div style={{ fontSize: '1rem', color: '#fff', marginTop: 2, marginLeft: 2, textShadow: '0 1px 6px #2228' }}>Plan your perfect trip!</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/create-account" element={<CreateAccount />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/create-trip" element={<CreateTrip />} />
            <Route path="/itinerary" element={<Itinerary />} />
            <Route path="/edit-trip/:id" element={<EditTrip />} />
            <Route path="/view-trip/:id" element={<ViewTrip />} />
            <Route path="/cost-summary" element={React.createElement(require('./components/CostSummary.jsx').default)} />
            <Route path="/help-information" element={<HelpInformation />} />
            <Route path="/" element={<Login />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
