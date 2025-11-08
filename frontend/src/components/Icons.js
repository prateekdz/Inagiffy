import React from 'react';

const Icon = ({ name }) => {
  switch (name) {
    case 'play':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M5 3v18l15-9L5 3z" fill="#fff" />
        </svg>
      );
    case 'zoom-in':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M11 7v8M7 11h8M21 21l-4.35-4.35" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'zoom-out':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M7 11h8M21 21l-4.35-4.35" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return null;
  }
};

export default Icon;