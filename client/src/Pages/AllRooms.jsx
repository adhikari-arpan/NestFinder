import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../Context/AppContext';
import { RoomCard } from '../components/RoomCard';
import { ArrowLeft } from 'lucide-react';

export const AllRooms = () => {
  const { listings } = useContext(AppContext);
  const navigate = useNavigate();

  const verifiedRooms = listings.filter(l => l.status === 'verified');

  return (
    <div className="container animate-fade-in" style={{ padding: '2.5rem 1.5rem 5rem' }}>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-outline btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.25rem' }}
        >
          <ArrowLeft size={16} /> Back
        </button>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>
          All Available Rooms
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Showing {verifiedRooms.length} verified listings across Kathmandu valley
        </p>
      </div>

      {/* Rooms Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '1.5rem'
      }}>
        {verifiedRooms.length === 0 ? (
          <p style={{ color: 'var(--text-light)' }}>No rooms available right now.</p>
        ) : (
          verifiedRooms.map(room => (
            <RoomCard key={room.id} room={room} />
          ))
        )}
      </div>
    </div>
  );
};