import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { AppContext } from "../Context/AppContext";
import { RoomCard } from '../components/RoomCard';
import { MapContainer } from '../components/MapContainer';
import { Search, SlidersHorizontal, RefreshCw, X, MapPin } from 'lucide-react';

export const SearchMap = () => {
  const { listings } = useContext(AppContext);
  const location = useLocation();

  // Search/Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedSharing, setSelectedSharing] = useState('all');
  const [maxBudget, setMaxBudget] = useState(40000);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [sortBy, setSortBy] = useState('recent');
  
  // Interactive Map states
  const [activeListingId, setActiveListingId] = useState(null);
  const [highlightListingId, setHighlightListingId] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);

  // College POI filter
  const [poiFilter, setPoiFilter] = useState('');

  // Check URL query parameters on mount & update filters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const locParam = params.get('location');
    const typeParam = params.get('type');
    const budgetParam = params.get('budget');
    const poiParam = params.get('poi');

    if (locParam) setSearchQuery(locParam);
    if (typeParam && typeParam !== 'any') setSelectedType(typeParam);
    if (budgetParam && budgetParam !== 'any') setMaxBudget(Number(budgetParam));
    
    if (poiParam) {
      setPoiFilter(poiParam);
      // Center map on listing coordinates that are near this POI
      const matchedListing = listings.find(l => 
        l.nearbyPOIs.some(poi => poi.name.toLowerCase().includes(poiParam.toLowerCase()))
      );
      if (matchedListing) {
        setMapCenter([matchedListing.latitude, matchedListing.longitude]);
        setActiveListingId(matchedListing.id);
      }
    }
  }, [location.search]);

  // List of all amenities to display in filters
  const allAmenitiesList = ["WiFi", "Hot Water", "Parking", "Furnished", "Kitchen", "Balcony", "Backup Electricity"];

  // Toggle Amenity Selection
  const handleAmenityChange = (amenity) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  // Reset Filters
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedSharing('all');
    setMaxBudget(40000);
    setSelectedAmenities([]);
    setPoiFilter('');
    setSortBy('recent');
    setActiveListingId(null);
    setHighlightListingId(null);
    setMapCenter(null);
  };

  // Filter listings
  const filteredListings = listings.filter(item => {
    // Only display verified or pending active listings (in dashboard we show pending, in public we only show verified)
    if (item.status !== 'verified') return false;

    // Search Query match (title, location, description)
    const matchesQuery = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    // Type match
    const matchesType = selectedType === 'all' || item.type === selectedType;

    // Sharing match
    const matchesSharing = selectedSharing === 'all' || item.sharing === selectedSharing;

    // Budget match
    const matchesBudget = item.price <= maxBudget;

    // Amenities match
    const matchesAmenities = selectedAmenities.every(amenity => 
      item.amenities.includes(amenity)
    );

    // POI Match
    const matchesPOI = !poiFilter || item.nearbyPOIs.some(poi => 
      poi.name.toLowerCase().includes(poiFilter.toLowerCase())
    );

    return matchesQuery && matchesType && matchesSharing && matchesBudget && matchesAmenities && matchesPOI;
  });

  // Sort filtered listings
  const sortedListings = [...filteredListings].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'popular') return b.views - a.views;
    // 'recent' by default
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const handleMarkerClick = (listingId) => {
    setActiveListingId(listingId);
    // Find the elements in the scroll view and scroll to it if possible
    const element = document.getElementById(`room-card-${listingId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  return (
    <div className="search-map-layout animate-fade-in">
      
      {/* 1. Left Search Filter and Results Panel */}
      <div className="search-sidebar">
        
        {/* Filters Top Section */}
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <SlidersHorizontal size={18} style={{ color: 'var(--primary)' }} />
              Filter Listings
            </h2>
            <button onClick={resetFilters} className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem' }}>
              <RefreshCw size={12} /> Reset
            </button>
          </div>

          {/* Search Box */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={18} style={{ position: 'absolute', left: '10px', color: 'var(--text-light)' }} />
              <input 
                type="text" 
                placeholder="Search area, neighborhood, colleges..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ width: '100%', paddingLeft: '2.5rem' }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer' }}>
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Type and Sharing Filter Selectors */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.7rem' }}>Room Type</label>
              <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="form-input" style={{ padding: '0.5rem' }}>
                <option value="all">All Types</option>
                <option value="Room">Single Room</option>
                <option value="Flat">Full Flat</option>
              </select>
            </div>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.7rem' }}>Sharing Type</label>
              <select value={selectedSharing} onChange={(e) => setSelectedSharing(e.target.value)} className="form-input" style={{ padding: '0.5rem' }}>
                <option value="all">All Sharing</option>
                <option value="Single">Single Bed</option>
                <option value="Shared">Shared Room</option>
                <option value="Private">Private Flat</option>
              </select>
            </div>
          </div>

          {/* Budget Slider */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" style={{ fontSize: '0.7rem' }}>Max Budget</label>
              <strong style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>Rs. {maxBudget.toLocaleString('en-IN')}</strong>
            </div>
            <input 
              type="range" 
              min="2000" 
              max="40000" 
              step="1000"
              value={maxBudget}
              onChange={(e) => setMaxBudget(Number(e.target.value))}
              style={{ accentColor: 'var(--primary)', cursor: 'pointer' }}
            />
          </div>

          {/* College Quick Indicator if active */}
          {poiFilter && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', backgroundColor: 'var(--primary-light)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)', width: 'fit-content', fontSize: '0.8rem', color: 'var(--primary)' }}>
              <span>College: <strong>{poiFilter}</strong></span>
              <button onClick={() => setPoiFilter('')} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex' }}><X size={12} /></button>
            </div>
          )}

          {/* Amenities Accordion / Expandable checkboxes */}
          <div style={{ textAlign: 'left' }}>
            <label className="form-label" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem' }}>Amenities Required</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {allAmenitiesList.map((amenity, i) => {
                const isChecked = selectedAmenities.includes(amenity);
                return (
                  <button 
                    key={i} 
                    onClick={() => handleAmenityChange(amenity)}
                    className="btn btn-outline"
                    style={{ 
                      padding: '0.35rem 0.6rem', 
                      fontSize: '0.75rem', 
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: isChecked ? 'var(--primary)' : 'var(--bg-app)',
                      borderColor: isChecked ? 'var(--primary)' : 'var(--border-color)',
                      color: isChecked ? 'white' : 'var(--text-muted)'
                    }}
                  >
                    {isChecked ? '✓ ' : ''}{amenity}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Results Counter and Sorter */}
        <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
            Showing <strong>{sortedListings.length}</strong> rooms in Kathmandu
          </span>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: '0.25rem', border: 'none', background: 'none', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, cursor: 'pointer' }}>
            <option value="recent">Newest Listings</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>

        {/* Room Card List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }} className="search-results-list">
          {sortedListings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-light)' }}>
              <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No rooms matched your criteria.</p>
              <button onClick={resetFilters} className="btn btn-outline btn-sm">Clear Filters</button>
            </div>
          ) : (
            sortedListings.map(listing => (
              <div 
                key={listing.id} 
                id={`room-card-${listing.id}`}
                onMouseEnter={() => setHighlightListingId(listing.id)}
                onMouseLeave={() => setHighlightListingId(null)}
                style={{ 
                  borderRadius: 'var(--radius-lg)',
                  border: activeListingId === listing.id ? '2px solid var(--primary)' : '2px solid transparent',
                  transition: 'border-color var(--transition-fast)',
                  boxShadow: activeListingId === listing.id ? 'var(--shadow-md)' : 'none'
                }}
              >
                <RoomCard room={listing} />
              </div>
            ))
          )}
        </div>

      </div>

      {/* 2. Right Interactive Map */}
      <div className="map-viewport">
        <MapContainer 
          listings={sortedListings} 
          activeListingId={activeListingId} 
          highlightListingId={highlightListingId}
          onMarkerClick={handleMarkerClick}
          currentCenter={mapCenter}
        />
      </div>

    </div>
  );
};
