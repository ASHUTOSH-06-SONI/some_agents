import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './home.jsx';
import SubmitRequest from './submit_request.jsx';
import TrackRequest from './track_request.jsx';
import Dashboard from './dashboard.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/submit" element={<SubmitRequest />} />
        <Route path="/track" element={<TrackRequest />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
