import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { AppContext } from "../Context/AppContext";
import { RoomCard } from '../components/RoomCard';
import { MapContainer } from '../components/MapContainer';
import { Search, SlidersHorizontal, RefreshCw, X } from 'lucide-react';

export const SearchMap = () => {
  const { listings } = useContext(AppContext);
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedSharing, setSelectedSharing] = useState('all');
  const [maxBudget, setMaxBudget] = useState(40000);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [sortBy, setSortBy] = useState('recent');
  const [activeListingId, setActiveListingId] = useState(null);
  const [highlightListingId, setHighlightListingId] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  const [poiFilter, setPoiFilter] = useState('');

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
      const matchedListing = listings.find(l =>
        l.nearbyPOIs.some(poi => poi.name.toLowerCase().includes(poiParam.toLowerCase()))
      );
      if (matchedListing) {
        setMapCenter([matchedListing.latitude, matchedListing.longitude]);
        setActiveListingId(matchedListing.id);
      }
    }
  }, [location.search]);

  const allAmenitiesList = ["WiFi", "Hot Water", "Parking", "Furnished", "Kitchen", "Balcony", "Backup Electricity"];

  const handleAmenityChange = (amenity) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const resetFilters = () => {
    setSearchQuery(''); setSelectedType('all'); setSelectedSharing('all');
    setMaxBudget(40000); setSelectedAmenities([]); setPoiFilter('');
    setSortBy('recent'); setActiveListingId(null);
    setHighlightListingId(null); setMapCenter(null);
  };

  const filteredListings = listings.filter(item => {
    if (item.status !== 'verified') return false;
    const matchesQuery =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || item.type === selectedType;
    const matchesSharing = selectedSharing === 'all' || item.sharing === selectedSharing;
    const matchesBudget = item.price <= maxBudget;
    const matchesAmenities = selectedAmenities.every(a => item.amenities.includes(a));
    const matchesPOI = !poiFilter || item.nearbyPOIs.some(poi =>
      poi.name.toLowerCase().includes(poiFilter.toLowerCase())
    );
    return matchesQuery && matchesType && matchesSharing && matchesBudget && matchesAmenities && matchesPOI;
  });

  const sortedListings = [...filteredListings].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'popular') return b.views - a.views;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const handleMarkerClick = (listingId) => {
    setActiveListingId(listingId);
    const element = document.getElementById(`room-card-${listingId}`);
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  return (
    // search-map-layout: flex, height calc(100vh - 70px), overflow hidden
    // on mobile: flex-col, height auto
    <div className="flex overflow-hidden h-[calc(100vh-70px)] max-md:flex-col max-md:h-auto animate-fade-in">

      {/* Left Sidebar */}
      {/* search-sidebar: w-40%, h-full, overflow-y-auto, border-right, bg-sidebar, flex col */}
      {/* mobile: w-full, h-500px, border-bottom instead */}
      <div className="w-[40%] h-full overflow-y-auto border-r border-[var(--border-color)] bg-[var(--bg-sidebar)] flex flex-col max-md:w-full max-md:h-[500px] max-md:border-r-0 max-md:border-b max-md:border-b-[var(--border-color)]">

        {/* Filters Top Section */}
        <div className="p-5 border-b border-[var(--border-color)] flex flex-col gap-4">

          {/* Header */}
          <div className="flex justify-between items-center">
            <h2 className="text-[1.25rem] flex items-center gap-2">
              <SlidersHorizontal size={18} className="text-[var(--primary)]" />
              Filter Listings
            </h2>
            <button onClick={resetFilters} className="btn btn-ghost btn-sm flex items-center gap-1 px-2 py-1">
              <RefreshCw size={12} /> Reset
            </button>
          </div>

          {/* Search Box */}
          <div className="form-group mb-0">
            <div className="relative flex items-center">
              <Search size={18} className="absolute left-2.5 text-[var(--text-light)]" />
              <input
                type="text"
                placeholder="Search area, neighborhood, colleges..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input w-full pl-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 bg-transparent border-none text-[var(--text-light)] cursor-pointer"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Type & Sharing selects */}
          <div className="grid grid-cols-2 gap-3">
            <div className="form-group mb-0">
              <label className="form-label text-[0.7rem]">Room Type</label>
              <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="form-input py-2">
                <option value="all">All Types</option>
                <option value="Room">Single Room</option>
                <option value="Flat">Full Flat</option>
              </select>
            </div>
            <div className="form-group mb-0">
              <label className="form-label text-[0.7rem]">Sharing Type</label>
              <select value={selectedSharing} onChange={(e) => setSelectedSharing(e.target.value)} className="form-input py-2">
                <option value="all">All Sharing</option>
                <option value="Single">Single Bed</option>
                <option value="Shared">Shared Room</option>
                <option value="Private">Private Flat</option>
              </select>
            </div>
          </div>

          {/* Budget Slider */}
          <div className="form-group mb-0">
            <div className="flex justify-between items-center">
              <label className="form-label text-[0.7rem]">Max Budget</label>
              <strong className="text-[0.85rem] text-[var(--primary)]">Rs. {maxBudget.toLocaleString('en-IN')}</strong>
            </div>
            <input
              type="range" min="2000" max="40000" step="1000"
              value={maxBudget}
              onChange={(e) => setMaxBudget(Number(e.target.value))}
              className="w-full cursor-pointer accent-[var(--primary)]"
            />
          </div>

          {/* Active POI filter pill */}
          {poiFilter && (
            <div className="inline-flex items-center gap-1 bg-[var(--primary-light)] px-2 py-1 rounded-[var(--radius-sm)] w-fit text-[0.8rem] text-[var(--primary)]">
              <span>College: <strong>{poiFilter}</strong></span>
              <button onClick={() => setPoiFilter('')} className="bg-transparent border-none text-[var(--primary)] cursor-pointer flex">
                <X size={12} />
              </button>
            </div>
          )}

          {/* Amenities */}
          <div className="text-left">
            <label className="form-label text-[0.7rem] block mb-2">Amenities Required</label>
            <div className="flex flex-wrap gap-2">
              {allAmenitiesList.map((amenity, i) => {
                const isChecked = selectedAmenities.includes(amenity);
                return (
                  <button
                    key={i}
                    onClick={() => handleAmenityChange(amenity)}
                    className="btn btn-outline px-2.5 py-1.5 text-[0.75rem] rounded-[var(--radius-sm)] transition-colors"
                    style={{
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

        {/* Results Counter & Sort */}
        <div className="px-5 py-3 border-b border-[var(--border-color)] bg-[var(--bg-app)] flex justify-between items-center">
          <span className="text-[0.85rem] text-[var(--text-light)]">
            Showing <strong>{sortedListings.length}</strong> rooms in Kathmandu
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="p-1 border-none bg-transparent text-[0.8rem] text-[var(--text-muted)] font-semibold cursor-pointer"
          >
            <option value="recent">Newest Listings</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>

        {/* Room Cards List */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          {sortedListings.length === 0 ? (
            <div className="text-center py-12 px-4 text-[var(--text-light)]">
              <p className="text-[1.1rem] mb-2">No rooms matched your criteria.</p>
              <button onClick={resetFilters} className="btn btn-outline btn-sm">Clear Filters</button>
            </div>
          ) : (
            sortedListings.map(listing => (
              <div
                key={listing.id}
                id={`room-card-${listing.id}`}
                onMouseEnter={() => setHighlightListingId(listing.id)}
                onMouseLeave={() => setHighlightListingId(null)}
                className="rounded-[var(--radius-lg)] transition-[border-color,box-shadow] duration-[var(--transition-fast)]"
                style={{
                  border: activeListingId === listing.id ? '2px solid var(--primary)' : '2px solid transparent',
                  boxShadow: activeListingId === listing.id ? 'var(--shadow-md)' : 'none'
                }}
              >
                <RoomCard room={listing} />
              </div>
            ))
          )}
        </div>

      </div>

      {/* Right Map */}
      {/* map-viewport: w-60%, h-full, relative — mobile: w-full, h-400px */}
      <div className="w-[60%] h-full relative max-md:w-full max-md:h-[400px]">
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