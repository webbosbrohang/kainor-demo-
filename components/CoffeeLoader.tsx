import React from 'react';

export const CoffeeLoader: React.FC = () => {
  return (
    <div className="loader">
      <div className="cup">
        <div className="cup-handle"></div>
        <div className="smoke one"></div>
        <div className="smoke two"></div>
        <div className="smoke three"></div>
      </div>
      <div className="load">Loading...</div>
    </div>
  );
};