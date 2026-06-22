import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AppContext} from "../Context/AppContext";
import { MapContainer } from '../components/MapContainer';
import { RoomCard } from '../components/RoomCard';
import { 
  MapPin, 
  Heart, 
  Send, 
  Phone, 
  Mail, 
  CheckCircle2, 
  ArrowLeft, 
  Users, 
  Building, 
  Share2,
  Calendar,
  Eye,
  Star,
  Layers,
  Sparkles
} from 'lucide-react';

export const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    listings, 
    savedListings, 
    toggleSaveListing, 
    sendInquiry, 
    currentUser,
    calculateRecommendationScore
  } = useContext(AppContext);

  const room = listings.find(l => l.id === Number(id));
  
  const [activeImage, setActiveImage] = useState('');
  const [inquirySent, setInquirySent] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: currentUser ? currentUser.name : '',
    email: currentUser ? currentUser.email : '',
    phone: '',
    message: 'Hello, I am interested in this listing. Please let me know when I can visit it.'
  });

  // Set first image as default active image on load
  useEffect(() => {
    if (room && room.images && room.images.length > 0) {
      setActiveImage(room.images[0]);
    }
    // Reset enquiry form status
    setInquirySent(false);
    
    // Scroll window to top on mount
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [room, id]);

  if (!room) {
    return (
      <div className="container" style={{ padding: '5rem 1rem', textAlign: 'center' }}>
        <h2>Listing Not Found</h2>
        <p style={{ margin: '1rem 0 2rem 0' }}>The room listing you are trying to view does not exist or has been removed.</p>
        <Link to="/search" className="btn btn-primary">Back to Search</Link>
      </div>
    );
  }

  const isSaved = savedListings.includes(room.id);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({ ...prev, [name]: value }));
  };

  const handleInquirySubmit = (e) => {
    e.preventDefault();
    if (!contactForm.phone) {
      alert("Please provide a phone number.");
      return;
    }
    sendInquiry(room.id, contactForm);
    setInquirySent(true);
  };

  // Find similar rooms (same city or within +/- 5000 Rs range)
  const similarRooms = listings
    .filter(l => l.id !== room.id && l.status === 'verified')
    .map(l => ({
      ...l,
      similarityScore: calculateRecommendationScore(l, {
        budget: room.price,
        preferredCity: room.city,
        sharing: room.sharing,
        roomType: room.type,
        essentialAmenities: []
      })
    }))
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, 3);

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1.5rem 5rem 1.5rem', textAlign: 'left' }}>
      
      {/* Navigation & Actions Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <button onClick={() => navigate(-1)} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert("Listing link copied to clipboard!");
            }}
            className="btn btn-outline btn-sm" 
            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          >
            <Share2 size={16} />
            <span>Share</span>
          </button>
          <button 
            onClick={() => toggleSaveListing(room.id)}
            className="btn btn-outline btn-sm" 
            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', borderColor: isSaved ? 'var(--danger)' : 'var(--border-color)', color: isSaved ? 'var(--danger)' : 'inherit' }}
          >
            <Heart size={16} style={{ fill: isSaved ? 'var(--danger)' : 'none' }} />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Details (3/5), Right Map & Landlord Sidebar (2/5) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.8fr', gap: '2.5rem' }} className="details-grid">
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Gallery Widget */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ width: '100%', height: '400px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-color)', position: 'relative' }}>
              <img 
                src={activeImage} 
                alt="Active listing"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {room.featured && (
                <span className="badge badge-accent" style={{ position: 'absolute', top: '15px', left: '15px', zIndex: 5, padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                  Popular Choice
                </span>
              )}
            </div>

            {/* Thumbnail Strip */}
            {room.images && room.images.length > 1 && (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {room.images.map((img, index) => (
                  <button 
                    key={index} 
                    onClick={() => setActiveImage(img)}
                    style={{ 
                      width: '80px', 
                      height: '60px', 
                      borderRadius: 'var(--radius-sm)', 
                      overflow: 'hidden', 
                      border: activeImage === img ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    <img src={img} alt={`thumbnail ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Heading Info */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.5rem' }}>
              <div>
                <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>{room.sharing} Sharing • {room.type}</span>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>{room.title}</h1>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)', display: 'block' }}>
                  Rs. {room.price.toLocaleString('en-IN')}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>per month (utilities negotiable)</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.9rem', color: 'var(--text-light)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '0.75rem 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <MapPin size={16} style={{ color: 'var(--primary)' }} />
                <span>{room.location}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Eye size={16} />
                <span>{room.views} views</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Star size={16} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                <span>{room.rating} ({room.reviews.length} reviews)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Calendar size={16} />
                <span>Listed {new Date(room.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Description</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.98rem', lineHeight: '1.7' }}>
              {room.description}
            </p>
          </div>

          {/* Amenities checklist */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Facilities Available</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
              {room.amenities.map((amenity, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
                  <CheckCircle2 size={18} style={{ color: 'var(--secondary)' }} />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Nearby POIs Proximity List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Nearby Points of Interest (Walk Distance)</h3>
            <div className="card" style={{ padding: 0, overflow: 'hidden', borderColor: 'var(--border-color)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }} className="poi-table">
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>POI Name</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Category</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Distance</th>
                  </tr>
                </thead>
                <tbody>
                  {room.nearbyPOIs.map((poi, idx) => (
                    <tr key={idx} style={{ borderBottom: idx === room.nearbyPOIs.length - 1 ? 'none' : '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{poi.name}</td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-light)' }}>
                        {poi.type === 'College' ? '🎓 College' : poi.type === 'Hospital' ? '🏥 Hospital' : poi.type === 'Market' ? '🛍️ Market' : '🚌 Transit stop'}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 700, color: 'var(--primary)' }}>
                        {poi.distance} meters
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column (Sidebar) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Landlord Contact Card */}
          <div className="card shadow-lg" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', borderColor: 'var(--border-color)', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.2rem' }}>
                {room.landlord.name.charAt(0)}
              </div>
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  {room.landlord.name}
                  {room.landlord.verified && <CheckCircle2 size={16} style={{ color: 'var(--secondary)', fill: 'var(--secondary-light)' }} title="Verified Landlord" />}
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Nest Landlord Profile</span>
              </div>
            </div>

            {/* Quick Contact buttons if authorized (or standard phone text) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '0.75rem 0', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={14} style={{ color: 'var(--primary)' }} />
                <span><strong>Phone:</strong> {room.landlord.phone}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={14} style={{ color: 'var(--primary)' }} />
                <span><strong>Email:</strong> {room.landlord.email}</span>
              </div>
            </div>

            {/* Message Inquire form */}
            {inquirySent ? (
              <div className="badge badge-secondary" style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', textTransform: 'none' }}>
                <strong style={{ display: 'block' }}>✓ Inquiry Delivered!</strong>
                The landlord has been notified and will contact you back.
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'left' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
                    <label className="form-label" style={{ fontSize: '0.65rem' }}>Name</label>
                    <input type="text" name="name" value={contactForm.name} onChange={handleInputChange} required className="form-input" style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
                    <label className="form-label" style={{ fontSize: '0.65rem' }}>Email</label>
                    <input type="email" name="email" value={contactForm.email} onChange={handleInputChange} required className="form-input" style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }} />
                  </div>
                </div>
                
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.65rem' }}>Phone Number (Required)</label>
                  <input type="tel" name="phone" value={contactForm.phone} onChange={handleInputChange} required placeholder="98XXXXXXXX" className="form-input" style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }} />
                </div>
                
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.65rem' }}>Message</label>
                  <textarea name="message" value={contactForm.message} onChange={handleInputChange} rows={3} className="form-input" style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem', resize: 'vertical' }} />
                </div>

                <button type="submit" className="btn btn-primary btn-sm" style={{ width: '100%', marginTop: '0.25rem', display: 'flex', gap: '0.25rem' }}>
                  <Send size={14} /> Send Message
                </button>
              </form>
            )}
          </div>

          {/* Interactive Mini-Map showing POIs in radius */}
          <div className="card" style={{ padding: 0, overflow: 'hidden', height: '280px', borderColor: 'var(--border-color)' }}>
            <div style={{ height: '35px', padding: '0 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', fontSize: '0.8rem', fontWeight: 700 }}>
              <span>📍 Location POI Radius Map</span>
              <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>OSM Leaflet</span>
            </div>
            <div style={{ height: '245px' }}>
              <MapContainer 
                listings={[room]} 
                activeListingId={room.id}
                showPOIRadius={true}
                currentCenter={[room.latitude, room.longitude]}
              />
            </div>
          </div>

        </div>

      </div>

      {/* Similar Listings Carousel / Grid */}
      {similarRooms.length > 0 && (
        <section style={{ marginTop: '4rem', borderTop: '1px solid var(--border-color)', paddingTop: '3rem' }}>
          <div style={{ textAlign: 'left', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={20} style={{ color: 'var(--accent)', fill: 'var(--accent)' }} />
            <h2 style={{ fontSize: '1.6rem' }}>Similar Rooms & Flats in {room.city}</h2>
          </div>
          <div className="grid-cols-3">
            {similarRooms.map(item => (
              <RoomCard key={item.id} room={item} score={item.similarityScore} />
            ))}
          </div>
        </section>
      )}

      <style>{`
        .poi-table tr:hover {
          background-color: var(--primary-light);
        }
        @media (max-width: 968px) {
          .details-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
