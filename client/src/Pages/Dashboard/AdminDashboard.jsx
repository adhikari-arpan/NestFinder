import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from "../../Context/AppContext";

import { 
  ShieldAlert, 
  CheckCircle, 
  Trash2, 
  UserMinus, 
  UserCheck, 
  Eye, 
  Flag,
  FileText,
  AlertTriangle,
  Users,
  Building
} from 'lucide-react';

export const AdminDashboard = () => {
  const { 
    listings, 
    updateListingStatus, 
    currentUser 
  } = useContext(AppContext);
  
  const navigate = useNavigate();

  // Redirect if not admin
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/auth');
    }
  }, [currentUser]);

  // Tab views: 'pending' (approvals), 'flagged' (moderation), 'users'
  const [activeTab, setActiveTab] = useState('pending');

  // Stats calculation
  const totalListings = listings.length;
  const verifiedCount = listings.filter(l => l.status === 'verified').length;
  const pendingCount = listings.filter(l => l.status === 'pending').length;
  const flaggedCount = listings.filter(l => l.status === 'flagged').length;

  // Filter queues
  const pendingListings = listings.filter(l => l.status === 'pending');
  const flaggedListings = listings.filter(l => l.status === 'flagged');

  // Simulated Database Users List
  const [mockUsers, setMockUsers] = useState([
    { id: 1, name: "Roshan Gurung", email: "roshan@gmail.com", role: "Tenant", status: "active" },
    { id: 2, name: "Ramesh Shrestha", email: "ramesh@nestfinder.com", role: "Landlord", status: "verified" },
    { id: 3, name: "Hari Bahadur Thapa", email: "haribdr@nestfinder.com", role: "Landlord", status: "pending" },
    { id: 4, name: "Maya Shakya", email: "maya@nestfinder.com", role: "Landlord", status: "verified" },
    { id: 5, name: "Saraswoti Adhikari", email: "saraswoti@nestfinder.com", role: "Landlord", status: "verified" }
  ]);

  const handleUserVerify = (userId) => {
    setMockUsers(prev => 
      prev.map(u => u.id === userId ? { ...u, status: 'verified' } : u)
    );
    alert(`Landlord verification status updated for User ID ${userId}`);
  };

  const handleUserBan = (userId) => {
    setMockUsers(prev => 
      prev.map(u => u.id === userId ? { ...u, status: 'banned' } : u)
    );
    alert(`User ID ${userId} has been suspended.`);
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '3rem 1.5rem 5rem 1.5rem', textAlign: 'left' }}>
      
      {/* Header section */}
      <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldAlert size={28} style={{ color: 'var(--primary)' }} />
          Administrative Moderation Board
        </h1>
        <p style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>Moderate housing listings, manage registered users, and audit platform activity.</p>
      </div>

      {/* Grid Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2.5rem' }} className="admin-stats-grid">
        
        <div className="card text-center" style={{ padding: '1.25rem', borderColor: 'var(--border-color)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>Total Properties</span>
          <strong style={{ display: 'block', fontSize: '1.8rem', color: 'var(--text-main)', marginTop: '0.25rem' }}>{totalListings}</strong>
        </div>

        <div className="card text-center" style={{ padding: '1.25rem', borderColor: 'var(--border-color)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase' }}>Verified Rooms</span>
          <strong style={{ display: 'block', fontSize: '1.8rem', color: 'var(--secondary)', marginTop: '0.25rem' }}>{verifiedCount}</strong>
        </div>

        <div className="card text-center" style={{ padding: '1.25rem', borderColor: 'var(--border-color)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase' }}>Pending Review</span>
          <strong style={{ display: 'block', fontSize: '1.8rem', color: 'var(--accent)', marginTop: '0.25rem' }}>{pendingCount}</strong>
        </div>

        <div className="card text-center" style={{ padding: '1.25rem', borderColor: 'var(--border-color)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--danger)', textTransform: 'uppercase' }}>Flagged / Spam</span>
          <strong style={{ display: 'block', fontSize: '1.8rem', color: 'var(--danger)', marginTop: '0.25rem' }}>{flaggedCount}</strong>
        </div>

      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button 
          onClick={() => setActiveTab('pending')}
          style={{ 
            padding: '0.75rem 0.5rem',
            background: 'none',
            border: 'none',
            fontSize: '0.95rem',
            fontWeight: 700,
            color: activeTab === 'pending' ? 'var(--primary)' : 'var(--text-light)',
            borderBottom: activeTab === 'pending' ? '3px solid var(--primary)' : '3px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
        >
          <CheckCircle size={16} /> Approvals Queue ({pendingListings.length})
        </button>
        
        <button 
          onClick={() => setActiveTab('flagged')}
          style={{ 
            padding: '0.75rem 0.5rem',
            background: 'none',
            border: 'none',
            fontSize: '0.95rem',
            fontWeight: 700,
            color: activeTab === 'flagged' ? 'var(--primary)' : 'var(--text-light)',
            borderBottom: activeTab === 'flagged' ? '3px solid var(--primary)' : '3px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
        >
          <Flag size={16} /> Flagged / Spam ({flaggedListings.length})
        </button>

        <button 
          onClick={() => setActiveTab('users')}
          style={{ 
            padding: '0.75rem 0.5rem',
            background: 'none',
            border: 'none',
            fontSize: '0.95rem',
            fontWeight: 700,
            color: activeTab === 'users' ? 'var(--primary)' : 'var(--text-light)',
            borderBottom: activeTab === 'users' ? '3px solid var(--primary)' : '3px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
        >
          <Users size={16} /> Platform Users ({mockUsers.length})
        </button>
      </div>

      {/* 1. Pending Verification Approvals List */}
      {activeTab === 'pending' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {pendingListings.length === 0 ? (
            <div className="card text-center" style={{ padding: '3rem 1rem', color: 'var(--text-light)' }}>
              <CheckCircle size={40} style={{ color: 'var(--secondary)', marginBottom: '0.5rem' }} />
              <p>All room submissions have been reviewed. Clean queue!</p>
            </div>
          ) : (
            pendingListings.map(item => (
              <div key={item.id} className="card shadow-sm admin-moderation-card" style={{ padding: '1.25rem', borderColor: 'var(--border-color)', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem' }}>
                
                {/* Details side */}
                <div style={{ textAlign: 'left', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <img src={item.images[0]} style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} alt="preview" />
                  <div>
                    <span className="badge badge-accent" style={{ fontSize: '0.65rem' }}>PENDING REVIEW</span>
                    <h3 style={{ fontSize: '1.05rem', margin: '4px 0 2px 0' }}>
                      <Link to={`/room/${item.id}`} style={{ color: 'var(--text-main)' }}>{item.title}</Link>
                    </h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>📍 {item.location} • Rs. {item.price.toLocaleString()} /mo</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginTop: '0.5rem' }}>
                      Landlord: <strong>{item.landlord.name}</strong> ({item.landlord.email})
                    </div>
                  </div>
                </div>

                {/* Actions side */}
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'flex-end' }}>
                  <button 
                    onClick={() => updateListingStatus(item.id, 'verified')}
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'flex', gap: '0.25rem' }}
                  >
                    <CheckCircle size={14} /> Approve listing
                  </button>
                  <button 
                    onClick={() => updateListingStatus(item.id, 'flagged')}
                    className="btn btn-outline btn-sm"
                    style={{ color: 'var(--danger)', borderColor: 'var(--border-color)', display: 'flex', gap: '0.25rem' }}
                  >
                    <AlertTriangle size={14} /> Reject / Flag
                  </button>
                </div>

              </div>
            ))
          )}
        </div>
      )}

      {/* 2. Flagged listings queue */}
      {activeTab === 'flagged' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {flaggedListings.length === 0 ? (
            <div className="card text-center" style={{ padding: '3rem 1rem', color: 'var(--text-light)' }}>
              <Flag size={40} style={{ color: 'var(--secondary)', marginBottom: '0.5rem' }} />
              <p>No listings are currently flagged as spam or fraudulent.</p>
            </div>
          ) : (
            flaggedListings.map(item => (
              <div key={item.id} className="card shadow-sm admin-moderation-card" style={{ padding: '1.25rem', borderColor: 'var(--border-color)', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem' }}>
                
                {/* Details */}
                <div style={{ textAlign: 'left', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--danger-light)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Flag size={20} />
                  </div>
                  <div>
                    <span className="badge badge-danger" style={{ fontSize: '0.65rem' }}>FLAGGED AS SPAM</span>
                    <h3 style={{ fontSize: '1.05rem', margin: '4px 0 2px 0' }}>
                      <Link to={`/room/${item.id}`} style={{ color: 'var(--text-main)' }}>{item.title}</Link>
                    </h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>📍 {item.location} • Owner: {item.landlord.name}</div>
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'flex-end' }}>
                  <button 
                    onClick={() => updateListingStatus(item.id, 'verified')}
                    className="btn btn-outline btn-sm"
                    style={{ borderColor: 'var(--border-color)', display: 'flex', gap: '0.25rem' }}
                  >
                    <CheckCircle size={14} /> Clear Flag (Approve)
                  </button>
                  <button 
                    onClick={() => updateListingStatus(item.id, 'pending')}
                    className="btn btn-primary btn-sm"
                    style={{ backgroundColor: 'var(--danger)', display: 'flex', gap: '0.25rem' }}
                  >
                    <Trash2 size={14} /> Ban & Delete Listing
                  </button>
                </div>

              </div>
            ))
          )}
        </div>
      )}

      {/* 3. Registered Users list */}
      {activeTab === 'users' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden', borderColor: 'var(--border-color)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }} className="poi-table">
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem 1rem' }}>User details</th>
                <th style={{ padding: '0.75rem 1rem' }}>Email ID</th>
                <th style={{ padding: '0.75rem 1rem' }}>Account Type</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockUsers.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{user.name}</td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-light)' }}>{user.email}</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--primary)' }}>{user.role}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    {user.status === 'verified' && <span className="badge badge-secondary">Verified Host</span>}
                    {user.status === 'pending' && <span className="badge badge-accent">Verification Pending</span>}
                    {user.status === 'active' && <span className="badge badge-primary">Active</span>}
                    {user.status === 'banned' && <span className="badge badge-danger">Suspended</span>}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                      {user.role === 'Landlord' && user.status === 'pending' && (
                        <button onClick={() => handleUserVerify(user.id)} className="btn btn-outline btn-sm" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                          <UserCheck size={12} /> Verify
                        </button>
                      )}
                      {user.status !== 'banned' && (
                        <button onClick={() => handleUserBan(user.id)} className="btn btn-outline btn-sm" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--danger)', borderColor: 'var(--border-color)' }}>
                          <UserMinus size={12} /> Suspend
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        @media (max-width: 968px) {
          .admin-stats-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 768px) {
          .admin-stats-grid {
            grid-template-columns: 1fr !important;
          }
          .admin-moderation-card {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
};
