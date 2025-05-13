import React from 'react';

const Navbar: React.FC = () => {
  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        background: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        zIndex: 1000,
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: '24px',
        fontWeight: 600,
        fontSize: '1.25rem',
        letterSpacing: '1px',
        transition: 'left 0.3s, width 0.3s',
      }}
      className="navbar-fixed"
    >
      99notes
      <style>{`
        @media (min-width: 768px) {
          .navbar-fixed {
            left: 280px !important;
            width: calc(100% - 280px) !important;
          }
        }
        @media (max-width: 767px) {
          .navbar-fixed {
            left: 0 !important;
            width: 100% !important;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
