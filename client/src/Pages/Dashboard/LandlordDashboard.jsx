import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppContext} from "../../Context/AppContext";
import { 
  Building, 
  MessageSquare, 
  Plus, 
  Eye, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Send, 
  MapPin, 
  FileText,
  Trash2,
  X
} from 'lucide-react';

export const LandlordDashboard = () => {
  const { 
    listings, 
    inquiries, 
    replyToInquiry, 
    createListing, 
    currentUser 
  } = useContext(AppContext);
  
  const location = useLocation();
  const navigate = useNavigate();

  // Redirect if not landlord or admin
  useEffect(() => {
    if (!currentUser || (currentUser.role !== 'landlord' && currentUser.role !== 'admin')) {
      navigate('/auth');
    }
  }, [currentUser]);

  // Tab views: 'listings' or 'inquiries'
  const [activeTab, setActiveTab] = useState('listings');
  
  // Post Listing Form Modal toggle
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyInquiryId, setReplyInquiryId] = useState(null);

  // Check URL query parameters to open modal by default
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('action') === 'post') {
      setIsPostModalOpen(true);
      // Clean query parameter after opening
      navigate('/dashboard/landlord', { replace: true });
    }
  }, [location.search]);

  // Form states for new Listing
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formType, setFormType] = useState('Room');
  const [formSharing, setFormSharing] = useState('Single');
  const [formLocation, setFormLocation] = useState('');
  const [formCity, setFormCity] = useState('Kathmandu');
  const [formLat, setFormLat] = useState('27.6850');
  const [formLng, setFormLng] = useState('85.3200');
  const [formImage, setFormImage] = useState('');
  const [formAmenities, setFormAmenities] = useState([]);

  // Find listings belonging to logged-in Landlord
  const landlordListings = listings.filter(l => 
    l.landlord.email.toLowerCase() === currentUser?.email.toLowerCase()
  );

  // Find inquiries sent to this Landlord's listings
  const landlordInquiries = inquiries.filter(inq => 
    landlordListings.some(l => l.id === inq.listingId)
  );

  const toggleFormAmenity = (item) => {
    setFormAmenities(prev => 
      prev.includes(item) ? prev.filter(a => a !== item) : [...prev, item]
    );
  };

  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (!formTitle || !formDesc || !formPrice || !formLocation) {
      alert("Please fill in all required fields.");
      return;
    }

    createListing({
      title: formTitle,
      description: formDesc,
      price: Number(formPrice),
      type: formType,
      sharing: formSharing,
      location: formLocation,
      city: formCity,
      latitude: Number(formLat) || 27.6850,
      longitude: Number(formLng) || 85.3200,
      images: formImage ? [formImage] : [],
      amenities: formAmenities
    });

    // Reset Form
    setFormTitle('');
    setFormDesc('');
    setFormPrice('');
    setFormLocation('');
    setFormAmenities([]);
    setFormImage('');
    setIsPostModalOpen(false);
  };

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    replyToInquiry(replyInquiryId, replyText);
    setReplyText('');
    setReplyInquiryId(null);
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '3rem 1.5rem 5rem 1.5rem', textAlign: 'left' }}>
      
      {/* ── Welcome Banner: landlord greeting + Add Room CTA ── */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        flexWrap: 'wrap', 
        gap: '1.5rem', 
        borderBottom: '1px solid var(--border-color)', 
        paddingBottom: '1.75rem', 
        marginBottom: '2rem' 
      }}>
        {/* Left: Avatar + Welcome text */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.1rem' }}>
          <img src={currentUser?.avatar} alt="avatar" style={{ width: '62px', height: '62px', borderRadius: '50%', border: '3px solid var(--primary)', objectFit: 'cover', boxShadow: '0 0 0 4px var(--primary-light)' }} />
          <div>
            {/* Small welcome line */}
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '0.2rem' }}>
              Welcome back, <strong style={{ color: 'var(--primary)' }}>{currentUser?.name}</strong> 👋
            </p>
            {/* Large landlord hub title */}
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, lineHeight: 1.15 }}>
              Your Landlord Hub
            </h1>
            <p style={{ color: 'var(--text-light)', fontSize: '0.82rem', marginTop: '0.2rem' }}>
              Manage listings, respond to inquiries, and grow your portfolio.
            </p>
          </div>
        </div>

        {/* Right: Eye-catching Add Room Listing button */}
        <button 
          onClick={() => setIsPostModalOpen(true)} 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            background: 'linear-gradient(135deg, var(--primary) 0%, #7c3aed 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius-full)',
            padding: '0.85rem 1.75rem',
            fontSize: '0.95rem',
            fontWeight: 700,
            fontFamily: 'var(--font-sans)',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(99, 102, 241, 0.45)',
            transition: 'all 0.25s ease',
            position: 'relative',
            overflow: 'hidden',
            animation: 'hero-btn-pulse 3s ease-in-out infinite',  /* reuse hero pulse from global CSS */
            whiteSpace: 'nowrap',
            alignSelf: 'center',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px) scale(1.04)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(99,102,241,0.65)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(99, 102, 241, 0.45)'; }}
        >
          <Plus size={20} />
          <span>Add Room Listing</span>
        </button>
      </div>

      {/* Tabs selectors: Rooms vs Inquiries */}
      <div style={{ display: 'flex', gap: '1.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem' }}>
        <button 
          onClick={() => setActiveTab('listings')}
          className="tab-select-btn"
          style={{ 
            padding: '0.75rem 0.5rem',
            background: 'none',
            border: 'none',
            fontSize: '0.95rem',
            fontWeight: 700,
            color: activeTab === 'listings' ? 'var(--primary)' : 'var(--text-light)',
            borderBottom: activeTab === 'listings' ? '3px solid var(--primary)' : '3px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
        >
          <Building size={16} /> My Properties ({landlordListings.length})
        </button>
        <button 
          onClick={() => setActiveTab('inquiries')}
          className="tab-select-btn"
          style={{ 
            padding: '0.75rem 0.5rem',
            background: 'none',
            border: 'none',
            fontSize: '0.95rem',
            fontWeight: 700,
            color: activeTab === 'inquiries' ? 'var(--primary)' : 'var(--text-light)',
            borderBottom: activeTab === 'inquiries' ? '3px solid var(--primary)' : '3px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
        >
          <MessageSquare size={16} /> Tenant Inquiries ({landlordInquiries.length})
        </button>
      </div>

      {/* 1. Listings Table view */}
      {activeTab === 'listings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {landlordListings.length === 0 ? (
            <div className="card text-center" style={{ padding: '4rem 1rem' }}>
              <Building size={48} style={{ color: 'var(--text-light)', marginBottom: '1rem' }} />
              <h3>No Listings Yet</h3>
              <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem 0' }}>Submit your first room details and get matched with student search lists.</p>
              <button onClick={() => setIsPostModalOpen(true)} className="btn btn-primary btn-sm">Post Room Form</button>
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden', borderColor: 'var(--border-color)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }} className="listing-table">
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                    <th style={{ padding: '1rem' }}>Preview Details</th>
                    <th style={{ padding: '1rem' }}>Pricing</th>
                    <th style={{ padding: '1rem' }}>Views</th>
                    <th style={{ padding: '1rem' }}>Verification Status</th>
                  </tr>
                </thead>
                <tbody>
                  {landlordListings.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <img src={item.images[0]} style={{ width: '60px', height: '45px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} alt="room" />
                        <div>
                          <strong style={{ display: 'block', fontSize: '0.95rem' }}>{item.title}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>📍 {item.location}</span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--primary)' }}>
                        Rs. {item.price.toLocaleString('en-IN')}/mo
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--text-light)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Eye size={14} /> {item.views} views
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {item.status === 'verified' && (
                          <span className="badge badge-secondary" style={{ display: 'inline-flex', gap: '0.25rem', alignItems: 'center' }}>
                            <CheckCircle size={12} /> Active & Verified
                          </span>
                        )}
                        {item.status === 'pending' && (
                          <span className="badge badge-accent" style={{ display: 'inline-flex', gap: '0.25rem', alignItems: 'center' }}>
                            <Clock size={12} /> Pending Moderation
                          </span>
                        )}
                        {item.status === 'flagged' && (
                          <span className="badge badge-danger" style={{ display: 'inline-flex', gap: '0.25rem', alignItems: 'center' }}>
                            <AlertTriangle size={12} /> Flagged / In Review
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 2. Inquiries message inbox */}
      {activeTab === 'inquiries' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {landlordInquiries.length === 0 ? (
            <div className="card text-center" style={{ padding: '4rem 1rem' }}>
              <MessageSquare size={48} style={{ color: 'var(--text-light)', marginBottom: '1rem' }} />
              <h3>No Inquiries Yet</h3>
              <p style={{ color: 'var(--text-muted)' }}>Tenants who view your listing will fill in a contact form and their messages will display here.</p>
            </div>
          ) : (
            landlordInquiries.map(inq => {
              const matchedRoom = listings.find(l => l.id === inq.listingId);
              return (
                <div key={inq.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: inq.status === 'unread' ? '4px solid var(--primary)' : '1px solid var(--border-color)' }}>
                  
                  {/* Inquiry Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ textAlign: 'left' }}>
                      <strong style={{ fontSize: '1rem' }}>{inq.tenantName}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', display: 'block' }}>
                        📞 {inq.tenantPhone} • ✉ {inq.tenantEmail}
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                        Property ID: {inq.listingId}
                      </span>
                      <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                        {new Date(inq.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Room Preview details */}
                  <div style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)' }}>
                    Inquiry on: <strong>{matchedRoom?.title}</strong> (Rs. {matchedRoom?.price.toLocaleString()}/mo)
                  </div>

                  {/* Message body */}
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontStyle: 'italic', padding: '0.5rem 0', borderLeft: '2px solid var(--border-color)', paddingLeft: '1rem' }}>
                    "{inq.message}"
                  </div>

                  {/* Reply trigger controls */}
                  {inq.status === 'replied' ? (
                    <div style={{ padding: '0.75rem', backgroundColor: 'var(--secondary-light)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                      <strong style={{ color: 'var(--secondary)', display: 'block' }}>✓ You Replied:</strong>
                      <span style={{ fontStyle: 'italic' }}>"{inq.replyText}"</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {replyInquiryId === inq.id ? (
                        <form onSubmit={handleReplySubmit} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                          <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
                            <textarea 
                              placeholder="Write your email/SMS reply here..." 
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              rows={2} 
                              required
                              className="form-input" 
                              style={{ width: '100%', fontSize: '0.85rem' }} 
                            />
                          </div>
                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <button type="submit" className="btn btn-secondary btn-sm" style={{ display: 'flex', gap: '0.25rem' }}>
                              <Send size={14} /> Send
                            </button>
                            <button type="button" onClick={() => setReplyInquiryId(null)} className="btn btn-outline btn-sm">
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <button onClick={() => setReplyInquiryId(inq.id)} className="btn btn-outline btn-sm" style={{ width: 'fit-content', display: 'flex', gap: '0.25rem' }}>
                          <MessageSquare size={14} /> Reply Inquiry
                        </button>
                      )}
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>
      )}

      {/* =======================================
          POST PROPERTY MODAL / OVERLAY FORM
          ======================================= */}
      {isPostModalOpen && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', 
          zIndex: 2000, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div className="card shadow-xl animate-fade-in" style={{ 
            width: '100%', 
            maxWidth: '650px', 
            maxHeight: '90vh', 
            overflowY: 'auto', 
            padding: '2rem',
            position: 'relative'
          }}>
            
            {/* Modal Close Trigger */}
            <button 
              onClick={() => setIsPostModalOpen(false)}
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer' }}
            >
              <X size={22} />
            </button>

            {/* Modal Header */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus style={{ color: 'var(--primary)' }} size={22} /> Add Room / Flat Listing
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-light)' }}>Provide specifications. Newly listed rentals start as pending for admin checks.</p>
            </div>

            {/* Form */}
            <form onSubmit={handlePostSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Title */}
              <div className="form-group">
                <label className="form-label">Listing Title *</label>
                <input 
                  type="text" 
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Spacious Single Room near Tribhuvan University" 
                  required 
                  className="form-input" 
                />
              </div>

              {/* Price & Types */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }} className="form-row-three">
                <div className="form-group">
                  <label className="form-label">Monthly Rent (Rs) *</label>
                  <input 
                    type="number" 
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="8500" 
                    required 
                    className="form-input" 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Housing Type *</label>
                  <select value={formType} onChange={(e) => setFormType(e.target.value)} className="form-input">
                    <option value="Room">Single Room</option>
                    <option value="Flat">Full Flat</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Sharing Type *</label>
                  <select value={formSharing} onChange={(e) => setFormSharing(e.target.value)} className="form-input">
                    <option value="Single">Single Room</option>
                    <option value="Shared">Shared Room</option>
                    <option value="Private">Private flat</option>
                  </select>
                </div>
              </div>

              {/* Location details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '0.75rem' }} className="form-row-two">
                <div className="form-group">
                  <label className="form-label">Specific Address *</label>
                  <input 
                    type="text" 
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="Kumaripati, Lalitpur (behind United Academy)" 
                    required 
                    className="form-input" 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <select value={formCity} onChange={(e) => setFormCity(e.target.value)} className="form-input">
                    <option value="Kathmandu">Kathmandu</option>
                    <option value="Lalitpur">Lalitpur</option>
                    <option value="Bhaktapur">Bhaktapur</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label">Detailed Description *</label>
                <textarea 
                  value={formDesc} 
                  onChange={(e) => setFormDesc(e.target.value)}
                  rows={3} 
                  placeholder="Describe your flat layout, water frequency, backup electricity inverter details, guidelines etc."
                  required 
                  className="form-input" 
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Map Coordinates Mock simulation inputs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Latitude coordinate *</label>
                  <input type="text" value={formLat} onChange={(e) => setFormLat(e.target.value)} className="form-input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Longitude coordinate *</label>
                  <input type="text" value={formLng} onChange={(e) => setFormLng(e.target.value)} className="form-input" required />
                </div>
              </div>

              {/* Image URL */}
              <div className="form-group">
                <label className="form-label">Thumbnail Image URL</label>
                <input 
                  type="url" 
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..." 
                  className="form-input" 
                />
              </div>

              {/* Amenities checkboxes */}
              <div className="form-group" style={{ textAlign: 'left' }}>
                <label className="form-label">Amenities Included</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
                  {["WiFi", "Hot Water", "Parking", "Furnished", "Kitchen", "Balcony", "Backup Electricity"].map((item, idx) => {
                    const isSelected = formAmenities.includes(item);
                    return (
                      <button 
                        key={idx} 
                        type="button"
                        onClick={() => toggleFormAmenity(item)}
                        className="btn btn-outline"
                        style={{ 
                          padding: '0.35rem 0.6rem', 
                          fontSize: '0.75rem', 
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: isSelected ? 'var(--primary)' : 'transparent',
                          borderColor: isSelected ? 'var(--primary)' : 'var(--border-color)',
                          color: isSelected ? 'white' : 'var(--text-muted)'
                        }}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Actions submit */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsPostModalOpen(false)} className="btn btn-outline btn-sm">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Publish Listing</button>
              </div>

            </form>
          </div>
        </div>
      )}

      <style>{`
        .listing-table tr:hover, .poi-table tr:hover {
          background-color: var(--primary-light);
        }
        @media (max-width: 768px) {
          .form-row-three {
            grid-template-columns: 1fr !important;
          }
          .form-row-two {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
