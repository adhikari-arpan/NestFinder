import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppContext } from "../../Context/AppContext";
import logo from '../../assests/NestFinder Logo.png';
import { 
  Building, 
  MessageSquare, 
  Plus, 
  Eye, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Send, 
  Trash2,
  X
} from 'lucide-react';

export const LandlordDashboard = () => {
  const { 
    listings, 
    inquiries, 
    replyToInquiry, 
    createListing, 
    currentUser,
    logoutUser
  } = useContext(AppContext);
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser || (currentUser.role !== 'landlord' && currentUser.role !== 'admin')) {
      navigate('/auth');
    }
  }, [currentUser]);

  const [activeTab, setActiveTab] = useState('listings');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyInquiryId, setReplyInquiryId] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('action') === 'post') {
      setIsPostModalOpen(true);
      navigate('/dashboard/landlord', { replace: true });
    }
  }, [location.search]);

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

  const landlordListings = listings.filter(l =>
    l.landlord.email.toLowerCase() === currentUser?.email.toLowerCase()
  );

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
    setFormTitle(''); setFormDesc(''); setFormPrice('');
    setFormLocation(''); setFormAmenities([]); setFormImage('');
    setIsPostModalOpen(false);
  };

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    replyToInquiry(replyInquiryId, replyText);
    setReplyText('');
    setReplyInquiryId(null);
  };

  const tabClass = (tab) =>
    `flex items-center gap-1.5 px-0.5 py-3 text-[0.95rem] font-bold border-b-[3px] bg-transparent border-x-0 border-t-0 cursor-pointer transition-colors ${
      activeTab === tab
        ? 'text-[var(--primary)] border-b-[var(--primary)]'
        : 'text-[var(--text-light)] border-b-transparent'
    }`;

  return (
    <div className="container animate-fade-in px-6 pt-12 pb-20 text-left">

      {/* Welcome Banner */}
      
      <div className="flex justify-between items-start flex-wrap gap-6 border-b border-[var(--border-color)] pb-7 mb-8">
        {/* Left: Avatar + Welcome */}
        <img src={logo} alt="NestFinder" style={{ height: '70px', width: 'auto' }} />
        <div className="flex items-center gap-4">
          <img
            src={currentUser?.avatar}
            alt="avatar"
            className="w-[62px] h-[62px] rounded-full object-cover border-[3px] border-[var(--primary)] shadow-[0_0_0_4px_var(--primary-light)]"
          />
          <div>
            <h1 className="text-[1.6rem] font-extrabold">Welcome, {currentUser?.name}</h1>
            <p className="text-[var(--text-light)] text-[0.85rem]">
              Landlord Hub: Moderate active tenant requests, reply to inquiries, and list properties.
            </p>
          </div>
        </div>

        {/* Temporary Logout button */}
      <button
        style={{ padding: '10px 20px', fontSize: '16px', fontWeight: '600', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        onClick={logoutUser}
      >
        Logout
      </button>

        {/* Add Room CTA */}
        <button
          onClick={() => setIsPostModalOpen(true)}
          className="landlord-add-btn flex items-center gap-1.5 text-white font-bold border-none px-6 py-3.5 rounded-[var(--radius-md)] cursor-pointer transition-all duration-[0.25s] shadow-[0_4px_15px_rgba(99,102,241,0.35)]"
          style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' }}
        >
          <Plus size={18} /> Add Room Listing
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-[var(--border-color)] mb-8">
        <button onClick={() => setActiveTab('listings')} className={tabClass('listings')}>
          <Building size={16} /> My Properties ({landlordListings.length})
        </button>
        <button onClick={() => setActiveTab('inquiries')} className={tabClass('inquiries')}>
          <MessageSquare size={16} /> Tenant Inquiries ({landlordInquiries.length})
        </button>
      </div>

      {/* 1. Listings Tab */}
      {activeTab === 'listings' && (
        <div className="flex flex-col gap-4">
          {landlordListings.length === 0 ? (
            <div className="card text-center p-16">
              <Building size={48} className="text-[var(--text-light)] mb-4 mx-auto" />
              <h3>No Listings Yet</h3>
              <p className="text-[var(--text-muted)] my-2 mb-6">
                Submit your first room details and get matched with student search lists.
              </p>
              <button onClick={() => setIsPostModalOpen(true)} className="btn btn-primary btn-sm">
                Post Room Form
              </button>
            </div>
          ) : (
            <div className="card p-0 overflow-hidden border border-[var(--border-color)]">
              <table className="w-full border-collapse text-[0.9rem] listing-table">
                <thead>
                  <tr className="bg-[var(--bg-app)] border-b border-[var(--border-color)] text-left">
                    <th className="p-4">Preview Details</th>
                    <th className="p-4">Pricing</th>
                    <th className="p-4">Views</th>
                    <th className="p-4">Verification Status</th>
                  </tr>
                </thead>
                <tbody>
                  {landlordListings.map(item => (
                    <tr key={item.id} className="border-b border-[var(--border-color)]">
                      <td className="p-4 flex gap-4 items-center">
                        <img
                          src={item.images[0]}
                          className="w-[60px] h-[45px] object-cover rounded-[var(--radius-sm)]"
                          alt="room"
                        />
                        <div>
                          <strong className="block text-[0.95rem]">{item.title}</strong>
                          <span className="text-[0.75rem] text-[var(--text-light)]">📍 {item.location}</span>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-[var(--primary)]">
                        Rs. {item.price.toLocaleString('en-IN')}/mo
                      </td>
                      <td className="p-4 text-[var(--text-light)]">
                        <div className="flex items-center gap-1">
                          <Eye size={14} /> {item.views} views
                        </div>
                      </td>
                      <td className="p-4">
                        {item.status === 'verified' && (
                          <span className="badge badge-secondary inline-flex gap-1 items-center">
                            <CheckCircle size={12} /> Active & Verified
                          </span>
                        )}
                        {item.status === 'pending' && (
                          <span className="badge badge-accent inline-flex gap-1 items-center">
                            <Clock size={12} /> Pending Moderation
                          </span>
                        )}
                        {item.status === 'flagged' && (
                          <span className="badge badge-danger inline-flex gap-1 items-center">
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

      {/* 2. Inquiries Tab */}
      {activeTab === 'inquiries' && (
        <div className="flex flex-col gap-4">
          {landlordInquiries.length === 0 ? (
            <div className="card text-center p-16">
              <MessageSquare size={48} className="text-[var(--text-light)] mb-4 mx-auto" />
              <h3>No Inquiries Yet</h3>
              <p className="text-[var(--text-muted)]">
                Tenants who view your listing will fill in a contact form and their messages will display here.
              </p>
            </div>
          ) : (
            landlordInquiries.map(inq => {
              const matchedRoom = listings.find(l => l.id === inq.listingId);
              return (
                <div
                  key={inq.id}
                  className="card flex flex-col gap-4"
                  style={{ borderLeft: inq.status === 'unread' ? '4px solid var(--primary)' : '1px solid var(--border-color)' }}
                >
                  {/* Inquiry Header */}
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div className="text-left">
                      <strong className="text-[1rem]">{inq.tenantName}</strong>
                      <span className="text-[0.75rem] text-[var(--text-light)] block">
                        📞 {inq.tenantPhone} • ✉ {inq.tenantEmail}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="badge badge-primary text-[0.7rem]">
                        Property ID: {inq.listingId}
                      </span>
                      <span className="block text-[0.65rem] text-[var(--text-light)] mt-1">
                        {new Date(inq.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Room Preview */}
                  <div className="text-[0.8rem] px-3 py-2 bg-[var(--bg-app)] rounded-[var(--radius-sm)] text-[var(--text-muted)]">
                    Inquiry on: <strong>{matchedRoom?.title}</strong> (Rs. {matchedRoom?.price.toLocaleString()}/mo)
                  </div>

                  {/* Message Body */}
                  <div className="text-[0.9rem] text-[var(--text-main)] italic py-2 pl-4 border-l-2 border-[var(--border-color)]">
                    "{inq.message}"
                  </div>

                  {/* Reply Controls */}
                  {inq.status === 'replied' ? (
                    <div className="p-3 bg-[var(--secondary-light)] rounded-[var(--radius-md)] text-[0.85rem]">
                      <strong className="text-[var(--secondary)] block">✓ You Replied:</strong>
                      <span className="italic">"{inq.replyText}"</span>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {replyInquiryId === inq.id ? (
                        <form onSubmit={handleReplySubmit} className="flex gap-2 items-end">
                          <div className="form-group mb-0 flex-1">
                            <textarea
                              placeholder="Write your email/SMS reply here..."
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              rows={2}
                              required
                              className="form-input w-full text-[0.85rem]"
                            />
                          </div>
                          <div className="flex gap-1">
                            <button type="submit" className="btn btn-secondary btn-sm flex gap-1">
                              <Send size={14} /> Send
                            </button>
                            <button type="button" onClick={() => setReplyInquiryId(null)} className="btn btn-outline btn-sm">
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <button
                          onClick={() => setReplyInquiryId(inq.id)}
                          className="btn btn-outline btn-sm w-fit flex gap-1"
                        >
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

      {/* Post Property Modal */}
      {isPostModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center p-4">
          <div className="card shadow-xl animate-fade-in w-full max-w-[650px] max-h-[90vh] overflow-y-auto p-8 relative">

            {/* Close Button */}
            <button
              onClick={() => setIsPostModalOpen(false)}
              className="absolute top-[15px] right-[15px] bg-transparent border-none text-[var(--text-light)] cursor-pointer"
            >
              <X size={22} />
            </button>

            {/* Modal Header */}
            <div className="mb-6">
              <h2 className="text-[1.35rem] flex items-center gap-2">
                <Plus size={22} className="text-[var(--primary)]" /> Add Room / Flat Listing
              </h2>
              <p className="text-[0.82rem] text-[var(--text-light)]">
                Provide specifications. Newly listed rentals start as pending for admin checks.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handlePostSubmit} className="flex flex-col gap-5">

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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 form-row-three">
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

              {/* Location */}
              <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] gap-3 form-row-two">
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
                  className="form-input resize-y"
                />
              </div>

              {/* Coordinates */}
              <div className="grid grid-cols-2 gap-3">
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

              {/* Amenities */}
              <div className="form-group text-left">
                <label className="form-label">Amenities Included</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {["WiFi", "Hot Water", "Parking", "Furnished", "Kitchen", "Balcony", "Backup Electricity"].map((item, idx) => {
                    const isSelected = formAmenities.includes(item);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => toggleFormAmenity(item)}
                        className="btn btn-outline px-2.5 py-1.5 text-[0.75rem] rounded-[var(--radius-sm)] transition-colors"
                        style={{
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

              {/* Submit Actions */}
              <div className="flex justify-end gap-2 border-t border-[var(--border-color)] pt-5 mt-2">
                <button type="button" onClick={() => setIsPostModalOpen(false)} className="btn btn-outline btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Publish Listing
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      <style>{`
        .listing-table tr:hover, .poi-table tr:hover {
          background-color: var(--primary-light);
        }
        .landlord-add-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.45) !important;
          filter: brightness(1.1);
        }
      `}</style>
    </div>
  );
};