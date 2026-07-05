import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../Context/AppContext';
import { RoomCard } from '../components/RoomCard';
import { ArrowLeft, Sparkles, Home } from 'lucide-react';

export const AllRooms = () => {
  const { listings, listingsLoading, calculateRecommendationScore, tenantPreferences } = useContext(AppContext);
  const navigate = useNavigate();

  // Development only — remove before final submission
const verifiedRooms = listings  // shows pending + verified + flagged

  // const verifiedRooms = listings
  //   .filter(l => l.status === 'verified')
  //   .map(l => ({
  //     ...l,
  //     matchScore: calculateRecommendationScore(l, tenantPreferences)
  //   }))
  //   .sort((a, b) => b.matchScore - a.matchScore);

  return (
    <div className="container animate-fade-in" style={{ padding: '2.5rem 1.5rem 5rem' }}>

      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-outline btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem' }}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.4rem' }}>
              All Available Rooms
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              {listingsLoading
                ? 'Loading listings...'
                : `Showing ${verifiedRooms.length} verified listings across Kathmandu valley`}
            </p>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sparkles size={13} style={{ color: 'var(--accent)' }} />
            Sorted by AI Match Score
          </span>
        </div>
      </div>

      {/* Loading state */}
      {listingsLoading ? (
        <div className="card text-center" style={{ padding: '5rem 2rem' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            border: '3px solid var(--primary-light)',
            borderTopColor: 'var(--primary)',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: 'var(--text-muted)' }}>Fetching rooms from database...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>

      ) : verifiedRooms.length === 0 ? (
        /* Empty state */
        <div className="card text-center" style={{ padding: '5rem 2rem' }}>
          <Home size={48} style={{ color: 'var(--text-light)', margin: '0 auto 1rem' }} />
          <h3 style={{ marginBottom: '0.5rem' }}>No Rooms Available</h3>
          <p style={{ color: 'var(--text-muted)' }}>No verified listings right now. Check back soon.</p>
        </div>

      ) : (
        /* Rooms Grid */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.75rem'
        }}>
          {verifiedRooms.map(room => (
            <div key={room.id} style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute', top: '12px', right: '12px', zIndex: 10,
                backgroundColor: 'rgba(99,102,241,0.95)',
                backdropFilter: 'blur(4px)',
                color: 'white', padding: '0.25rem 0.6rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: '0.25rem',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <Sparkles size={10} style={{ fill: 'white' }} />
                {room.matchScore}% Match
              </div>
              <RoomCard room={room} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};