import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PatientPortal from './components/PatientPortal';
import AdminEMR from './components/AdminEMR';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<PatientPortal />} />
          <Route path="/admin" element={<AdminEMR />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;