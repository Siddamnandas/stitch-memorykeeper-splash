import React from 'react';
import { useState, useEffect, useContext, useCallback, useMemo, useRef } from 'react';

import { useNavigate } from 'react-router-dom';

const MemoryMatchup = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to MemoryMatchup1
    navigate('/memory-matchup-1');
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Redirecting to Memory Match-Up game...</p>
    </div>
  );
};

export default MemoryMatchup;