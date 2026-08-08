import { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { AppContext } from "../../Context/AppContext";
import * as kycApi from '../../api/kycApi';
import whiteLogo from '../../assets/White_NestFinderLogo.png';
import darkLogo from '../../assets/Dark_NestFinderLogo.png';
import { MapContainer as LeafletMap, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import ImageUploader from '../../components/ImageUploader';
import { DashboardHeader } from '../../components/DashboardHeader';
import { KycStatusBanner } from '../../components/KycStatusBanner';
import { LoadingScreen } from '../../components/LoadingScreen';
import { getListingFee, formatNPR, PAYMENT_TYPES } from '../../utils/paymentUtils';
import { Trash2, ArrowLeft, ArrowRight, Wallet } from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

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
} from 'lucide-react';

export const LandlordDashboard = () => {
  const {
    listings,
    inquiries,
    replyToInquiry,
    createListing,
    updateListing,
    deleteListing,
    currentUser,
    authLoading,
    refreshCurrentUser,
    theme
  } = useContext(AppContext);
  const logo = theme === 'dark' ? darkLogo : whiteLogo;

  const [myKyc, setMyKyc] = useState(null);
  const [gateNotice, setGateNotice] = useState(false);

  // Pick up any kyc_status/is_verified change an admin made since this landlord's session last loaded the profile (e.g. approved/rejected
  // while they were away) — currentUser is otherwise only fetched once at login/session-restore and never auto-refreshes.
  useEffect(() => {
    if (currentUser?.role === 'landlord') {
      refreshCurrentUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'landlord') return;
    kycApi.fetchMyKYC(currentUser.id).then(setMyKyc).catch((err) => {
      console.error('Failed to load KYC record:', err.message);
    });
  }, [currentUser]);

  const location = useLocation();
  const navigate = useNavigate();

  // Redirect if not landlord or admin — wait for the initial session check
  // to finish first, otherwise this fires on every reload before
  // currentUser has had a chance to load and bounces straight to /auth.
  useEffect(() => {
    if (authLoading) return;
    if (!currentUser || (currentUser.role !== 'landlord' && currentUser.role !== 'admin')) {
      navigate('/auth');
    }
  }, [currentUser, authLoading]);

  // Tab views: 'listings' or 'inquiries'
  const [activeTab, setActiveTab] = useState('listings');

  // Post Listing Form Modal toggle
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyInquiryId, setReplyInquiryId] = useState(null);

  // Submission States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Delete states
  const [listingToDelete, setListingToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Edit Related States
  const [confirmedListing, setConfirmedListing] = useState(null);
  const [confirmedAction, setConfirmedAction] = useState('created'); // 'created' | 'updated'
  const [editingListing, setEditingListing] = useState(null);

  // Check URL query parameters to open modal by default
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('action') === 'post') {
      if (currentUser?.role === 'landlord' && !currentUser.is_verified) {
        setGateNotice(true);
      } else {
        setIsPostModalOpen(true);
      }
      navigate('/dashboard/landlord', { replace: true });
    }
  }, [location.search, currentUser]);

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
  const [formImages, setFormImages] = useState([]);
  const [formAmenities, setFormAmenities] = useState([]);

  // Posting fee charged for new listings only — 2% of monthly rent, clamped Rs.100-600
  const listingFee = getListingFee(formPrice);

  // Find listings belonging to logged-in Landlord
  const landlordListings = listings.filter(l =>
    l.landlord?.email?.toLowerCase() === currentUser?.email?.toLowerCase()
  );

  // Find inquiries sent to this Landlord's listings
  const landlordInquiries = inquiries.filter(inq =>
    landlordListings.some(l => l.id === inq.listing_id)
  );

  const toggleFormAmenity = (item) => {
    setFormAmenities(prev =>
      prev.includes(item) ? prev.filter(a => a !== item) : [...prev, item]
    );
  };

  const resetForm = () => {
    setFormTitle('');
    setFormDesc('');
    setFormPrice('');
    setFormType('Room');
    setFormSharing('Single');
    setFormImages([]);
    setFormAmenities([]);
  };

  // Location fields (formLocation/formCity/formLat/formLng) are not reset
  // here — they're always kept in sync with the landlord's verified KYC
  // address by the effect below, for as long as the modal is open.
  const openCreateModal = () => {
    if (currentUser?.role === 'landlord' && !currentUser.is_verified) {
      setGateNotice(true);
      return;
    }
    setEditingListing(null);
    resetForm();
    setSubmitError('');
    setIsPostModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingListing(item);
    setFormTitle(item.title);
    setFormDesc(item.description);
    setFormPrice(String(item.price));
    setFormType(item.type);
    setFormSharing(item.sharing);
    setFormImages(item.images || []);
    setFormAmenities(item.amenities || []);
    setSubmitError('');
    setIsPostModalOpen(true);
  };

  // Posting location is locked to the landlord's verified KYC address —
  // re-applied every time the modal opens so it can't drift from what an
  // edited listing previously stored.
  useEffect(() => {
    if (isPostModalOpen && myKyc) {
      setFormLat(String(myKyc.latitude));
      setFormLng(String(myKyc.longitude));
      setFormLocation(`${myKyc.tole}, ${myKyc.municipality}`);
      setFormCity(myKyc.district);
    }
  }, [isPostModalOpen, myKyc]);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!formTitle || !formDesc || !formPrice || !formLocation) {
      alert("Please fill in all required fields.");
      return;
    }
    if (!formLat || !formLng) {
      alert("Please pin the location on the map.");
      return;
    }
    if (formImages.length === 0) {
      alert("Please add at least one photo.");
      return;
    }

    const payload = {
      title: formTitle,
      description: formDesc,
      price: Number(formPrice),
      type: formType,
      sharing: formSharing,
      location: formLocation,
      city: formCity,
      latitude: Number(formLat) || 27.6850,
      longitude: Number(formLng) || 85.3200,
      images: formImages,
      amenities: formAmenities
    };

    const wasEditing = !!editingListing;
    setIsSubmitting(true);
    try {
      const result = wasEditing
        ? await updateListing(editingListing.id, payload)
        : await createListing(payload);

      if (!result.success) {
        setSubmitError(result.message);
        return;
      }

      resetForm();
      setIsPostModalOpen(false);
      setEditingListing(null);

      if (wasEditing) {
        setConfirmedListing(result.listing);
        setConfirmedAction('updated');
      } else {
        // New listings require the posting fee to be paid before going live —
        // send the landlord straight to the existing /payment flow instead of
        // the plain confirmation modal.
        const params = new URLSearchParams({
          type: PAYMENT_TYPES.LANDLORD_LISTING,
          amount: String(listingFee),
          name: result.listing.title,
        });
        navigate(`/payment?${params.toString()}`);
      }
    } catch (err) {
      console.error('Unexpected error saving listing:', err);
      setSubmitError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Deletion Handling
  const handleConfirmDelete = async () => {
    if (!listingToDelete) return;
    setIsDeleting(true);
    setDeleteError('');
    try {
      const result = await deleteListing(listingToDelete.id);
      if (!result.success) {
        setDeleteError(result.message);
        return;
      }
      setListingToDelete(null);
    } catch (err) {
      console.error('Unexpected error deleting listing:', err);
      setDeleteError('Something went wrong. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    replyToInquiry(replyInquiryId, replyText);
    setReplyText('');
    setReplyInquiryId(null);
  };

  // Still resolving the session on first load — show the loader rather than
  // flashing the redirect-guard effect above into a trip to /auth.
  if (authLoading) return <LoadingScreen />;

  return (
    <div className="animate-fade-in dashboard-container"> 

      {!isPostModalOpen && (
        <>
      {/* ── Welcome Banner: landlord greeting + Add Room CTA ── */}
      <DashboardHeader style={{
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
          <img src={logo} alt="NestFinder" style={{ height: '70px', width: 'auto' }} />
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>
              Welcome, {currentUser?.name}
            </h1>
            <p style={{ color: 'var(--text-light)', fontSize: '0.95rem', marginTop: '0.3rem', marginBottom: 0 }}>
              Manage your listings and connect with prospective tenants.
            </p>
          </div>
        </div>
      </DashboardHeader>

      {currentUser?.role === 'landlord' && (
        <KycStatusBanner kycStatus={currentUser.kyc_status} rejectionReason={myKyc?.rejection_reason} />
      )}

      {gateNotice && (
        <div style={{
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between',
          gap: '0.75rem', border: '1px solid var(--danger, #dc2626)', backgroundColor: 'rgba(220,38,38,0.08)',
          borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem', marginBottom: '1.5rem', fontSize: '0.88rem'
        }}>
          <span>Complete KYC verification to post listings.</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link to="/kyc" className="btn btn-primary btn-sm">Complete KYC</Link>
            <button onClick={() => setGateNotice(false)} className="btn btn-outline btn-sm">Dismiss</button>
          </div>
        </div>
      )}
        </>
      )}

      {/* Tabs selectors: Rooms vs Inquiries */}
      {!isPostModalOpen && (
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
      )}

      {/* 1. Listings Table view */}
      {activeTab === 'listings' && !isPostModalOpen && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {landlordListings.length === 0 ? (
            <div className="card text-center" style={{ padding: '4rem 1rem' }}>
              <Building size={48} style={{ color: 'var(--text-light)', marginBottom: '1rem' }} />
              <h3>No Listings Yet</h3>
              <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem 0' }}>Submit your first room details and get matched with tenant search lists.</p>
              <button onClick={openCreateModal} className="btn btn-primary btn-sm">Add Room Listing</button>
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
                    <th style={{ padding: '1rem' }}>Actions</th>
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
                      {/* Edit and Delete button */}
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => openEditModal(item)}
                            className="btn btn-outline btn-sm"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                          >
                            <FileText size={14} /> Edit
                          </button>
                          <button
                            onClick={() => setListingToDelete(item)}
                            className="btn btn-outline btn-sm"
                            style={{ color: 'var(--danger, #dc2626)', borderColor: 'var(--danger, #dc2626)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
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
      {activeTab === 'inquiries' && !isPostModalOpen && (
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
                      <strong style={{ fontSize: '1rem' }}>{inq.tenant_name}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', display: 'block' }}>
                        📞 {inq.tenant_phone} • ✉ {inq.tenant_email}
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                        Property ID: {inq.listing_id}
                      </span>
                      <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                        {new Date(inq.created_at).toLocaleString()}
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
                      <span style={{ fontStyle: 'italic' }}>"{inq.reply_text}"</span>
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
        <div style={{ paddingBottom: '2.5rem' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>

            {/* Page Header */}
            <button
              onClick={() => { setIsPostModalOpen(false); setEditingListing(null); }}
              className="btn btn-outline btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem' }}
            >
              <ArrowLeft size={16} /> Back to Dashboard
            </button>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <h2 style={{ fontSize: '1.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Plus style={{ color: 'var(--primary)' }} size={24} /> {editingListing ? 'Edit Room / Flat Listing' : 'Add Room / Flat Listing'}
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                  {editingListing
                    ? 'Update the details below — changes save immediately.'
                    : 'Provide specifications. Newly listed rentals start as pending for admin checks.'}
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handlePostSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

              <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

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
                      placeholder="Rs xxxxx"
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

                {/* Image URL */}
                <div className="form-group">
                  <label className="form-label">Room Photos *</label>
                  <ImageUploader files={formImages} onChange={setFormImages} />
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
              </div>

              {/* Posting Location — locked to the landlord's verified KYC address */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
                  <MapPin size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                  Posting Location
                </label>
                {myKyc ? (
                  <>
                    <p style={{ fontSize: '0.9rem', margin: '0 0 0.75rem 0' }}>
                      {formLocation}, {formCity}
                    </p>
                    <div style={{ height: '220px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                      <LeafletMap
                        center={[Number(formLat), Number(formLng)]}
                        zoom={14}
                        style={{ height: '100%', width: '100%' }}
                        dragging={false}
                        scrollWheelZoom={false}
                        doubleClickZoom={false}
                        zoomControl={false}
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; OpenStreetMap contributors'
                        />
                        <Marker position={[Number(formLat), Number(formLng)]} />
                      </LeafletMap>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginTop: '0.75rem', marginBottom: 0 }}>
                      This is set from your verified KYC address and can't be edited here. To post from a different location, <Link to="/kyc" style={{ color: 'var(--primary)', fontWeight: 600 }}>update your KYC verification</Link> — this will require re-approval before you can post again.
                    </p>
                  </>
                ) : (
                  <p style={{ fontSize: '0.85rem', color: 'var(--danger, #dc2626)' }}>
                    No verified KYC address on file.
                  </p>
                )}
              </div>

              {/* Listing Fee — charged only when posting a brand-new listing */}
              {!editingListing && (
                <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Wallet size={20} style={{ color: 'var(--primary)' }} />
                      <div>
                        <p style={{ fontWeight: 700, margin: 0 }}>Listing Fee</p>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-light)', margin: '0.2rem 0 0' }}>
                          2% of monthly rent · min Rs. 100 · max Rs. 600
                        </p>
                      </div>
                    </div>
                    <strong style={{ fontSize: '1.4rem', color: 'var(--primary)' }}>{formatNPR(listingFee)}</strong>
                  </div>
                  <Link
                    to="/about/payment"
                    style={{
                      fontStyle: 'italic',
                      textDecoration: 'underline',
                      fontSize: '0.8rem',
                      color: 'var(--primary)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      width: 'fit-content'
                    }}
                  >
                    Learn more about pricing <ArrowRight size={10} />
                  </Link>
                </div>
              )}

              {/* Actions submit */}
              {submitError && (
                <p style={{ color: 'var(--danger, #dc2626)', fontSize: '0.85rem', textAlign: 'right' }}>
                  {submitError}
                </p>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" onClick={() => { setIsPostModalOpen(false); setEditingListing(null); }} className="btn btn-outline btn-sm" disabled={isSubmitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={isSubmitting}>
                  {isSubmitting
                    ? 'Saving…'
                    : editingListing
                      ? 'Save Changes'
                      : `Proceed to Payment (${formatNPR(listingFee)})`}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* =======================================
    CONFIRMATION MODAL — shown after a successful submit
    ======================================= */}
      {confirmedListing && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 2100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          backgroundColor: 'rgba(0,0,0,0.5)'
        }}>
          <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '2.5rem 2rem', textAlign: 'center' }}>
            <CheckCircle size={52} style={{ color: 'var(--secondary, #16a34a)', marginBottom: '1rem' }} />
            <h2 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>
              {confirmedAction === 'updated' ? 'Listing Updated!' : 'Listing Submitted!'}
            </h2>
            <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              {confirmedAction === 'updated' ? (
                <>"{confirmedListing.title}" has been updated successfully.</>
              ) : (
                <>"{confirmedListing.title}" has been posted and is <strong>pending admin review</strong>. You'll get a notification once it's verified and live for tenants to see.</>
              )}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <button
                onClick={() => setConfirmedListing(null)}
                className="btn btn-outline btn-sm"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setConfirmedListing(null);
                  setActiveTab('listings');
                }}
                className="btn btn-primary btn-sm"
              >
                View My Properties
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =======================================
          DELETE CONFIRMATION MODAL
          ======================================= */}
      {listingToDelete && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 2100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          backgroundColor: 'rgba(0,0,0,0.5)'
        }}>
          <div className="card" style={{ maxWidth: '420px', width: '100%', padding: '2rem', textAlign: 'center' }}>
            <AlertTriangle size={44} style={{ color: 'var(--danger, #dc2626)', marginBottom: '1rem' }} />
            <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Delete this listing?</h2>
            <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              "{listingToDelete.title}" and all its photos, inquiries, and reviews will be permanently removed. This can't be undone.
            </p>
            {deleteError && (
              <p style={{ color: 'var(--danger, #dc2626)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {deleteError}
              </p>
            )}
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <button
                onClick={() => { setListingToDelete(null); setDeleteError(''); }}
                className="btn btn-outline btn-sm"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="btn btn-primary btn-sm"
                style={{ backgroundColor: 'var(--danger, #dc2626)', borderColor: 'var(--danger, #dc2626)' }}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting…' : 'Delete Listing'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .listing-table tr:hover {
          background-color: var(--primary-light);
        }
        .landlord-add-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.45) !important;
          filter: brightness(1.1);
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