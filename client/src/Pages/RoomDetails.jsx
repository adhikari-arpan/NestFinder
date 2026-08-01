import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AppContext } from "../Context/AppContext";
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
  Share2,
  Calendar,
  Eye,
  Star,
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

  const room = listings.find(l => l.id === id);

  const [activeImage, setActiveImage] = useState('');
  const [inquirySent, setInquirySent] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    message: 'Hello, I am interested in this listing. Please let me know when I can visit it.'
  });

  // currentUser often isn't ready on the very first render (it loads async via session restore in AppContext), so fill in any fields
  // that are still blank once it becomes available — without overwriting anything the tenant may have already typed.
  useEffect(() => {
    if (currentUser) {
      setContactForm((prev) => ({
        ...prev,
        name: prev.name || currentUser.name || '',
        email: prev.email || currentUser.email || '',
        phone: prev.phone || currentUser.phone || '',
      }));
    }
  }, [currentUser]);

  useEffect(() => {
    if (room?.images?.length > 0) {
      setActiveImage(room.images[0]);
    }
    setInquirySent(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [id, room?.images?.[0]]);

  if (!room) {
    return (
      <div className="container px-4 py-20 text-center">
        <h2>Listing Not Found</h2>
        <p className="my-4 mb-8">The room listing you are trying to view does not exist or has been removed.</p>
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
    if (!contactForm.phone) { alert("Please provide a phone number."); return; }
    sendInquiry(room.id, contactForm);
    setInquirySent(true);
  };

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

  const sectionHeadingClass = "text-[1.2rem] border-b border-[var(--border-color)] pb-2";

  return (
    <div className="animate-fade-in container px-6 pt-8 pb-20 text-left">
      {/* Nav Row */}
      <div className="mb-6 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="btn btn-outline btn-sm flex items-center gap-1">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => { navigator.clipboard.writeText(window.location.href); alert("Listing link copied to clipboard!"); }}
            className="btn btn-outline btn-sm flex items-center gap-1"
          >
            <Share2 size={16} /> Share
          </button>
          <button
            onClick={() => toggleSaveListing(room.id)}
            className={`btn btn-outline btn-sm flex items-center gap-1 ${isSaved ? 'border-(--danger) text-(--danger)' : 'border-(--border-color)'}`}
          >
            <Heart size={16} style={{ fill: isSaved ? 'var(--danger)' : 'none' }} />
            {isSaved ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.4fr_0.8fr]">

        {/* Left Column */}
        <div className="flex flex-col gap-8">

          {/* Gallery */}
          <div className="flex flex-col gap-3">
            <div className="relative h-100 w-full overflow-hidden rounded-lg) border border-(--border-color)">
              <img src={activeImage} alt="Active listing" className="size-full object-cover" />
              {room.featured && (
                <span className="badge badge-accent absolute top-3.75 left-3.75 z-5 px-3 py-1.5 text-[0.8rem]">
                  Popular Choice
                </span>
              )}
            </div>
            {room.images && room.images.length > 1 && (
              <div className="flex gap-3">
                {room.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(img)}
                    className={`h-15 w-20 cursor-pointer overflow-hidden rounded-sm) border p-0 ${activeImage === img ? 'border-2 border-(--primary)' : 'border border-(--border-color)'
                      }`}
                  >
                    <img src={img} alt={`thumbnail ${index}`} className="size-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Heading Info */}
          <div>
            <div className="mb-2 flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="badge badge-primary mb-2">{room.sharing} Sharing • {room.type}</span>
                <h1 className="m-0 text-[1.8rem] font-extrabold">{room.title}</h1>
              </div>
              <div className="text-right">
                <span className="block text-[1.8rem] font-extrabold text-(--primary)">
                  Rs. {room.price.toLocaleString('en-IN')}
                </span>
                <span className="text-[0.85rem] text-(--text-muted)">per month (utilities negotiable)</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 border-y border-(--border-color) py-3 text-[0.9rem] text-(--text-light)">
              <div className="flex items-center gap-1">
                <MapPin size={16} className="text-(--primary)" />
                <span>{room.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye size={16} />
                <span>{room.views} views</span>
              </div>
              <div className="flex items-center gap-1">
                <Star size={16} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                <span>{room.rating} ({room.reviews.length} reviews)</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={16} />
                <span>Listed {new Date(room.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-3">
            <h3 className={sectionHeadingClass}>Description</h3>
            <p className="text-[0.98rem] leading-[1.7] text-(--text-muted)">{room.description}</p>
          </div>

          {/* Amenities */}
          <div className="flex flex-col gap-3">
            <h3 className={sectionHeadingClass}>Facilities Available</h3>
            <div className="mt-2 grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
              {room.amenities.map((amenity, i) => (
                <div key={i} className="flex items-center gap-2 text-[0.95rem]">
                  <CheckCircle2 size={18} className="text-(--secondary)" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Nearby POIs Table
          <div className="flex flex-col gap-3">
            <h3 className={sectionHeadingClass}>Nearby Points of Interest (Walk Distance)</h3>
            <div className="card overflow-hidden border border-(--border-color) p-0">
              <table className="poi-table w-full border-collapse text-[0.9rem]">
                <thead>
                  <tr className="border-b border-(--border-color) bg-(--bg-app) text-left">
                    <th className="px-4 py-3">POI Name</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3 text-right">Distance</th>
                  </tr>
                </thead>
                <tbody>
                  {room.nearbyPOIs.map((poi, idx) => (
                    <tr key={idx} className={idx !== room.nearbyPOIs.length - 1 ? 'border-b border-(--border-color)' : ''}>
                      <td className="px-4 py-3 font-semibold">{poi.name}</td>
                      <td className="px-4 py-3 text-(--text-light)">
                        {poi.type === 'College' ? '🎓 College' : poi.type === 'Hospital' ? '🏥 Hospital' : poi.type === 'Market' ? '🛍️ Market' : '🚌 Transit stop'}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-(--primary)">{poi.distance} meters</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div> */}

        </div>

        {/* Right Sidebar */}
        <div className="flex flex-col gap-8">

          {/* Landlord Card */}
          <div className="card flex flex-col gap-5 border border-(--border-color) p-6 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="flex size-12.5 items-center justify-center rounded-full bg-(--primary-light) text-[1.2rem] font-bold text-(--primary)">
                {room.landlord?.name?.charAt(0) || '?'}
              </div>
              <div className="text-left">
                <h3 className="flex items-center gap-1 text-[1.05rem]">
                  {room.landlord?.name || 'Unknown Landlord'}
                  {room.landlord?.verified && (
                    <CheckCircle2 size={16} style={{ color: 'var(--secondary)', fill: 'var(--secondary-light)' }} title="Verified Landlord" />
                  )}
                </h3>
                <span className="text-[0.8rem] text-(--text-light)">Nest Landlord Profile</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 border-y border-(--border-color) py-3 text-[0.88rem]">
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-(--primary)" />
                <span><strong>Phone:</strong> {room.landlord?.phone || 'Not available'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-(--primary)" />
                <span><strong>Email:</strong> {room.landlord?.email || 'Not available'}</span>
              </div>
            </div>

            {inquirySent ? (
              <div className="badge badge-secondary flex flex-col gap-1 rounded-md) p-3 text-[0.85rem] normal-case">
                <strong className="block">✓ Inquiry Delivered!</strong>
                The landlord has been notified and will contact you back.
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="flex flex-col gap-3 text-left">
                <div className="flex gap-2">
                  <div className="form-group mb-0 flex-1">
                    <label className="form-label text-[0.65rem]">Name</label>
                    <input type="text" name="name" value={contactForm.name} onChange={handleInputChange} required className="form-input px-2.5 py-1.5 text-[0.85rem]" />
                  </div>
                  <div className="form-group mb-0 flex-1">
                    <label className="form-label text-[0.65rem]">Email</label>
                    <input type="email" name="email" value={contactForm.email} onChange={handleInputChange} required className="form-input px-2.5 py-1.5 text-[0.85rem]" />
                  </div>
                </div>
                <div className="form-group mb-0">
                  <label className="form-label text-[0.65rem]">Phone Number (Required)</label>
                  <input type="tel" name="phone" value={contactForm.phone} onChange={handleInputChange} required placeholder="98XXXXXXXX" className="form-input px-2.5 py-1.5 text-[0.85rem]" />
                </div>
                <div className="form-group mb-0">
                  <label className="form-label text-[0.65rem]">Message</label>
                  <textarea name="message" value={contactForm.message} onChange={handleInputChange} rows={3} className="form-input resize-y px-2.5 py-1.5 text-[0.85rem]" />
                </div>
                <button type="submit" className="btn btn-primary btn-sm mt-1 flex w-full justify-center gap-1">
                  <Send size={14} /> Send Message
                </button>
              </form>
            )}
          </div>

          {/* Mini Map */}
          <div className="card h-70 overflow-hidden border border-(--border-color) p-0">
            <div className="flex h-8.75 items-center justify-between border-b border-(--border-color) bg-(--bg-app) px-4 text-[0.8rem] font-bold">
              <span>📍 Location POI Radius Map</span>
              <span className="badge badge-primary text-[0.65rem]">OSM Leaflet</span>
            </div>
            <div className="h-61.25">
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

      {/* Similar Rooms */}
      {similarRooms.length > 0 && (
        <section className="mt-16 border-t border-(--border-color) pt-12">
          <div className="mb-8 flex items-center gap-2 text-left">
            <Sparkles size={20} style={{ color: 'var(--accent)', fill: 'var(--accent)' }} />
            <h2 className="text-[1.6rem]">Similar Rooms & Flats in {room.city}</h2>
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
      `}</style>
    </div>
  );
};