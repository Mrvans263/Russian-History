// components/MuseumExploration.js
import React from 'react';
import './MuseumExploration.css';

const MuseumExploration = () => {
  return (
    <div className="museum-exploration">
      <div className="museums-header">
        <h2>Explore History Through Moscow's Museums</h2>
        <p>Connect your learning with real historical sites and artifacts</p>
      </div>
      
      <div className="museum-iframe-container">
        <iframe 
          src="/museums.html" 
          title="Museums of Moscow"
          className="museum-iframe"
        />
      </div>
    </div>
  );
};

export default MuseumExploration;