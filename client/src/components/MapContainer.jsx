import React, { useEffect, useRef, useContext } from 'react';
import { AppContext } from "../Context/AppContext";
import L from 'leaflet';

export const MapContainer = ({
  listings = [],
  activeListingId = null,
  highlightListingId = null,
  onMarkerClick = null,
  currentCenter = null,
  previewRadius = null,
  selectable = false,
  onLocationSelect = null,
  selectedLocation = null,
  selectionRadius = null,
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);
  const clickCircleGroupRef = useRef(null);
  const selectionGroupRef = useRef(null);

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

    // CHANGED: Force standard, detailed OpenStreetMap tiles for all themes (improves visibility)
    const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const tileAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

    L.tileLayer(tileUrl, {
      attribution: tileAttribution,
      maxZoom: 19
    }).addTo(mapInstanceRef.current);

    // Create Layer Groups for markers and radii
    markersGroupRef.current = L.layerGroup().addTo(mapInstanceRef.current);
    clickCircleGroupRef.current = L.layerGroup().addTo(mapInstanceRef.current);
    selectionGroupRef.current = L.layerGroup().addTo(mapInstanceRef.current);

    // CHANGED: Invalidate size after layout completes (fixes grey area / misaligned tiles rendering bug)
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 250);

    // CHANGED: Add event listener for container resizing
    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    window.addEventListener('resize', handleResize);

    // Clean up map on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // Run once on mount

  // CHANGED: Invalidate size when listings or active selection changes to trigger tile updates
  useEffect(() => {
    if (mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current.invalidateSize();
      }, 150);
    }
  }, [listings, activeListingId]);

  // React to Center Changes
  useEffect(() => {
    if (mapInstanceRef.current && currentCenter) {
      mapInstanceRef.current.setView(currentCenter, 15, { animate: true });
    }
  }, [currentCenter]);

  // Let the user click anywhere on the map to pick a custom center point
  useEffect(() => {
    if (!mapInstanceRef.current || !selectable) return;

    const map = mapInstanceRef.current;
    const handleMapClick = (e) => {
      if (onLocationSelect) {
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      }
    };

    map.on('click', handleMapClick);
    map.getContainer().style.cursor = 'crosshair';

    return () => {
      map.off('click', handleMapClick);
      map.getContainer().style.cursor = '';
    };
  }, [selectable, onLocationSelect]);

  // Render the pin + radius circle for the currently selected location
  useEffect(() => {
    if (!mapInstanceRef.current || !selectionGroupRef.current) return;

    selectionGroupRef.current.clearLayers();
    if (!selectedLocation) return;

    const { lat, lng } = selectedLocation;

    const pinIcon = L.divIcon({
      className: 'custom-div-icon',
      html: '<div class="map-marker-pin selected"></div>',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40]
    });
    L.marker([lat, lng], { icon: pinIcon }).addTo(selectionGroupRef.current);

    if (selectionRadius) {
      const dangerColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--danger').trim() || '#ef4444';

      L.circle([lat, lng], {
        radius: selectionRadius,
        color: dangerColor,
        fillColor: dangerColor,
        fillOpacity: 0.1,
        weight: 1.5,
        dashArray: '6, 6'
      }).addTo(selectionGroupRef.current);
    }
  }, [selectedLocation, selectionRadius]);

  // Update Markers when Listings or Active / Highlighted ID changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current || !clickCircleGroupRef.current) return;

    // Clear existing markers & circles
    markersGroupRef.current.clearLayers();

    // Render Room Markers
    listings.forEach(listing => {
      const isActive = listing.id === activeListingId || listing.id === highlightListingId;

      // Custom HTML Pin to bypass bundler image errors
      const markerHtml = `
        <div class="map-marker-pin ${isActive ? 'active' : ''}">
          <div class="rotate-45 flex items-center justify-center w-full h-full text-[0.65rem] text-white font-extrabold font-sans">
            Rs.${Math.round(listing.price / 1000)}k
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
      const imageUrl = (listing.images && listing.images.length > 0) ? listing.images[0] : '/placeholder-room.png';
      const popupContent = `
        <div class="w-50 flex flex-col gap-1.5 p-1">
          <img src="${imageUrl}" class="w-full h-22.5 object-cover rounded-sm)" />
          <div class="font-bold text-[0.85rem] overflow-hidden text-ellipsis whitespace-nowrap text-(--text-main) mt-0.5">
            ${listing.title}
          </div>
          <div class="text-[0.75rem] text-(--text-muted) flex items-center gap-0.5">
            📍 ${listing.location}
          </div>
          <div class="flex justify-between items-center text-[0.8rem] mt-1 border-t border-(--border-color) pt-1">
            <strong class="text-(--primary)">Rs. ${listing.price.toLocaleString('en-IN')}/mo</strong>
            <a href="/room/${listing.id}" class="popup-link text-(--secondary) font-bold no-underline">Details &rarr;</a>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      // Handle events (single merged click handler: selection callback + radius circle)
      marker.on('click', () => {
        if (onMarkerClick) {
          onMarkerClick(listing.id);
        }

        // Draw a radius circle centered on the clicked marker
        if (clickCircleGroupRef.current) {
          clickCircleGroupRef.current.clearLayers(); // remove previous click's circle

          if (previewRadius) {
            const primaryColor = getComputedStyle(document.documentElement)
              .getPropertyValue('--primary').trim() || '#6366f1';

            L.circle([listing.latitude, listing.longitude], {
              radius: previewRadius, // meters
              color: primaryColor,
              fillColor: primaryColor,
              fillOpacity: 0.12,
              weight: 1.5
            }).addTo(clickCircleGroupRef.current);
          }
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
  }, [listings, activeListingId, highlightListingId, previewRadius]);

  // CSS injection for popups inside Leaflet Map
  return (
    <div className="relative size-full">
      <div ref={mapRef} className="z-1 size-full" />
      <style>{`
        .popup-link:hover {
          text-decoration: underline !important;
        }
      `}</style>
    </div>
  );
};