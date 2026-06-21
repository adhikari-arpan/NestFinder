import React, { useEffect, useRef, useContext } from 'react';
import { AppContext } from "../Context/AppContext";
import L from 'leaflet';

export const MapContainer = ({ listings = [], activeListingId = null, highlightListingId = null, onMarkerClick = null, showPOIRadius = false, currentCenter = null }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);
  const circlesGroupRef = useRef(null);
  const { theme } = useContext(AppContext);

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current) return;

    // Kathmandu/Lalitpur coordinates center
    const center = currentCenter || [27.685, 85.320]; 
    const zoom = currentCenter ? 15 : 13;

    // Initialize Map Instance
    mapInstanceRef.current = L.map(mapRef.current, {
      center: center,
      zoom: zoom,
      zoomControl: true
    });

    // Add Tile Layer
    // Standard OSM Tile
    const tileUrl = theme === 'dark' 
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' 
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      
    const tileAttribution = theme === 'dark'
      ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

    L.tileLayer(tileUrl, {
      attribution: tileAttribution,
      maxZoom: 19
    }).addTo(mapInstanceRef.current);

    // Create Layer Groups for markers and radii
    markersGroupRef.current = L.layerGroup().addTo(mapInstanceRef.current);
    circlesGroupRef.current = L.layerGroup().addTo(mapInstanceRef.current);

    // Clean up map on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // Run once on mount

  // React to Theme Changes (Swap tiles)
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Remove old layers
    mapInstanceRef.current.eachLayer(layer => {
      if (layer instanceof L.TileLayer) {
        mapInstanceRef.current.removeLayer(layer);
      }
    });

    const tileUrl = theme === 'dark' 
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' 
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const tileAttribution = theme === 'dark'
      ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

    L.tileLayer(tileUrl, {
      attribution: tileAttribution,
      maxZoom: 19
    }).addTo(mapInstanceRef.current);
  }, [theme]);

  // React to Center Changes
  useEffect(() => {
    if (mapInstanceRef.current && currentCenter) {
      mapInstanceRef.current.setView(currentCenter, 15, { animate: true });
    }
  }, [currentCenter]);

  // Update Markers when Listings or Active / Highlighted ID changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current || !circlesGroupRef.current) return;

    // Clear existing markers & circles
    markersGroupRef.current.clearLayers();
    circlesGroupRef.current.clearLayers();

    // Render Room Markers
    listings.forEach(listing => {
      const isActive = listing.id === activeListingId || listing.id === highlightListingId;
      
      // Custom HTML Pin to bypass bundler image errors
      const markerHtml = `
        <div class="map-marker-pin ${isActive ? 'active' : ''}">
          <div style="transform: rotate(45deg); display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; font-size: 0.65rem; color: white; font-weight: 800; font-family: var(--font-sans)">
            Rs.${Math.round(listing.price/1000)}k
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: markerHtml,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
      });

      const marker = L.marker([listing.latitude, listing.longitude], { icon: customIcon });

      // Create Sleek Popup Card
      const popupContent = `
        <div style="width: 200px; display: flex; flex-direction: column; gap: 6px; padding: 4px;">
          <img src="${listing.images[0]}" style="width: 100%; height: 90px; object-fit: cover; border-radius: var(--radius-sm);" />
          <div style="font-weight: 700; font-size: 0.85rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--text-main); margin-top: 2px;">
            ${listing.title}
          </div>
          <div style="font-size: 0.75rem; color: var(--text-muted); display: flex; align-items: center; gap: 2px;">
            📍 ${listing.location}
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; margin-top: 4px; border-top: 1px solid var(--border-color); padding-top: 4px;">
            <strong style="color: var(--primary);">Rs. ${listing.price.toLocaleString('en-IN')}/mo</strong>
            <a href="/room/${listing.id}" class="popup-link" style="color: var(--secondary); font-weight: 700; text-decoration: none;">Details &rarr;</a>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      // Handle events
      marker.on('click', () => {
        if (onMarkerClick) {
          onMarkerClick(listing.id);
        }
      });

      marker.addTo(markersGroupRef.current);

      // If active/highlighted, open popup and pan map
      if (isActive && listing.id === activeListingId) {
        setTimeout(() => {
          marker.openPopup();
          // Pan map to active marker
          mapInstanceRef.current.setView([listing.latitude, listing.longitude], 15, { animate: true });
        }, 100);
      }
    });

    // Draw Circles for nearby POIs if in detailed view mode
    if (showPOIRadius && activeListingId) {
      const activeListing = listings.find(l => l.id === activeListingId);
      if (activeListing) {
        const centerCoords = [activeListing.latitude, activeListing.longitude];

        // Draw 1km radius (College boundary)
        L.circle(centerCoords, {
          radius: 1000,
          color: 'rgba(99, 102, 241, 0.4)',
          fillColor: 'rgba(99, 102, 241, 0.1)',
          fillOpacity: 0.3,
          weight: 1.5,
          dashArray: '5, 5'
        }).bindTooltip("1.0 km radius (Colleges Proximity)", { permanent: false, direction: 'top' })
          .addTo(circlesGroupRef.current);

        // Draw 500m radius (Bus stops/markets)
        L.circle(centerCoords, {
          radius: 500,
          color: 'rgba(16, 185, 129, 0.4)',
          fillColor: 'rgba(16, 185, 129, 0.05)',
          fillOpacity: 0.3,
          weight: 1
        }).bindTooltip("500m Walk radius", { permanent: false, direction: 'bottom' })
          .addTo(circlesGroupRef.current);

        // Add small POI Markers (Colleges, Hospitals)
        activeListing.nearbyPOIs.forEach(poi => {
          let poiColor = '#ef4444'; // Hospital red
          let poiEmoji = '🏥';
          
          if (poi.type === 'College') {
            poiColor = '#f59e0b'; // College orange
            poiEmoji = '🎓';
          } else if (poi.type === 'Market') {
            poiColor = '#10b981'; // Market green
            poiEmoji = '🛍️';
          } else if (poi.type === 'Bus Stop') {
            poiColor = '#6366f1'; // Bus stop blue
            poiEmoji = '🚌';
          }

          // Calculate approximate coordinate offsets for rendering on map based on distance
          // In a real app we fetch their real coords. Here we simulate near center.
          const angle = Math.random() * Math.PI * 2;
          const latOffset = (poi.distance / 111000) * Math.sin(angle);
          const lngOffset = (poi.distance / (111000 * Math.cos(activeListing.latitude * Math.PI / 180))) * Math.cos(angle);
          const poiLat = activeListing.latitude + latOffset;
          const poiLng = activeListing.longitude + lngOffset;

          const poiHtml = `
            <div style="background-color: white; border: 2px solid ${poiColor}; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-md); font-size: 0.8rem;">
              ${poiEmoji}
            </div>
          `;

          const poiIcon = L.divIcon({
            className: 'custom-div-icon',
            html: poiHtml,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
            popupAnchor: [0, -14]
          });

          L.marker([poiLat, poiLng], { icon: poiIcon })
            .bindPopup(`<strong style="color: ${poiColor}">${poi.type}:</strong> ${poi.name} (${poi.distance}m away)`)
            .addTo(circlesGroupRef.current);
        });
      }
    }
  }, [listings, activeListingId, highlightListingId, showPOIRadius]);

  // CSS injection for popups inside Leaflet Map
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />
      <style>{`
        .popup-link:hover {
          text-decoration: underline !important;
        }
      `}</style>
    </div>
  );
};
