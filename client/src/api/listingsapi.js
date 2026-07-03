// src/api/listingsApi.js
// Data access layer — keeps all Supabase query/shape logic out of AppContext.
// Every function returns data already reshaped to match the exact JS shape

import supabase from '../../db/supabaseClient';

const IMAGE_BUCKET = 'listing-images';

// ------------------------------------------------------------
// Helpers: DB row -> UI shape (mirrors your original mock object)
// ------------------------------------------------------------
function mapListingRow(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    price: row.price,
    type: row.type,
    sharing: row.sharing,
    location: row.location,
    city: row.city,
    latitude: row.latitude,
    longitude: row.longitude,
    images: (row.listing_images || [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((img) => img.url),
    amenities: row.amenities || [],
    landlord: row.profiles
      ? {
          name: row.profiles.name,
          phone: row.profiles.phone,
          email: row.profiles.email,
          verified: row.profiles.is_verified,
        }
      : null,
    nearbyPOIs: (row.listing_pois || []).map((p) => ({
      name: p.name,
      type: p.type,
      distance: p.distance_meters,
    })),
    rating: row.rating ?? 0,
    reviews: (row.reviews || []).map((r) => ({
      author: r.profiles?.name || 'Anonymous',
      rating: r.rating,
      comment: r.comment,
    })),
    status: row.status,
    featured: row.featured,
    views: row.views,
    createdAt: row.created_at,
  };
}

// PostGIS geography(Point) comes back from PostgREST as GeoJSON when selected
// as geojson, or you can just select lat/long separately via a generated
// column. Simplest: store lat/long as plain columns too? -> see note below.

// ------------------------------------------------------------
// Fetch all listings (with images, POIs, landlord, reviews)
// ------------------------------------------------------------
export async function fetchListings() {
  const { data, error } = await supabase
    .from('listings_with_rating')
    .select(`
      *,
      listing_images ( url, sort_order ),
      listing_pois ( name, type, distance_meters ),
      reviews ( rating, comment, profiles ( name ) ),
      profiles!listings_landlord_id_fkey ( name, phone, email, is_verified )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data.map(mapListingRow);
}

export async function fetchListingById(id) {
  const { data, error } = await supabase
    .from('listings_with_rating')
    .select(`
      *,
      listing_images ( url, sort_order ),
      listing_pois ( name, type, distance_meters ),
      reviews ( rating, comment, profiles ( name ) ),
      profiles!listings_landlord_id_fkey ( name, phone, email, is_verified )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return mapListingRow(data);
}

// ------------------------------------------------------------
// Create a listing (used by landlord dashboard "post room" form)
// formData: { title, description, price, type, sharing, location, city,
//             latitude, longitude, amenities: [], images: [File, ...],
//             nearbyPOIs: [{name,type,distance}] }
// ------------------------------------------------------------
export async function createListing(formData, landlordId) {
  // 1. Insert the listing row itself.
  //    lat/long are turned into a PostGIS point via an RPC-free trick:
  //    we send WKT text and cast it in SQL, using `st_point`.
  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .insert({
      landlord_id: landlordId,
      title: formData.title,
      description: formData.description,
      price: Number(formData.price),
      type: formData.type,
      sharing: formData.sharing,
      location: formData.location,
      city: formData.city,
      geom: `SRID=4326;POINT(${formData.longitude} ${formData.latitude})`,
      amenities: formData.amenities || [],
    })
    .select()
    .single();

  if (listingError) throw listingError;

  // 2. Upload images to Storage, then insert URLs into listing_images.
  if (formData.images?.length) {
    const uploadedUrls = await uploadListingImages(listing.id, formData.images);
    const imageRows = uploadedUrls.map((url, i) => ({
      listing_id: listing.id,
      url,
      sort_order: i,
    }));
    const { error: imgError } = await supabase.from('listing_images').insert(imageRows);
    if (imgError) throw imgError;
  }

  // 3. Insert nearby POIs, if provided.
  if (formData.nearbyPOIs?.length) {
    const poiRows = formData.nearbyPOIs.map((p) => ({
      listing_id: listing.id,
      name: p.name,
      type: p.type,
      distance_meters: p.distance,
    }));
    const { error: poiError } = await supabase.from('listing_pois').insert(poiRows);
    if (poiError) throw poiError;
  }

  return fetchListingById(listing.id);
}

export async function uploadListingImages(listingId, files) {
  const urls = [];
  for (const file of files) {
    const path = `${listingId}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path);
    urls.push(data.publicUrl);
  }
  return urls;
}

// ------------------------------------------------------------
// Moderation (admin dashboard)
// ------------------------------------------------------------
export async function updateListingStatus(id, newStatus) {
  const { error } = await supabase.from('listings').update({ status: newStatus }).eq('id', id);
  if (error) throw error;
}

// ------------------------------------------------------------
// Saved listings
// ------------------------------------------------------------
export async function fetchSavedListingIds(userId) {
  const { data, error } = await supabase
    .from('saved_listings')
    .select('listing_id')
    .eq('user_id', userId);
  if (error) throw error;
  return data.map((r) => r.listing_id);
}

export async function toggleSavedListing(userId, listingId, isCurrentlySaved) {
  if (isCurrentlySaved) {
    const { error } = await supabase
      .from('saved_listings')
      .delete()
      .eq('user_id', userId)
      .eq('listing_id', listingId);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('saved_listings')
      .insert({ user_id: userId, listing_id: listingId });
    if (error) throw error;
  }
}

// ------------------------------------------------------------
// Inquiries
// ------------------------------------------------------------
export async function sendInquiry(listingId, details, tenantId = null) {
  const { error } = await supabase.from('inquiries').insert({
    listing_id: listingId,
    tenant_id: tenantId,
    tenant_name: details.name,
    tenant_email: details.email,
    tenant_phone: details.phone,
    message: details.message,
  });
  if (error) throw error;
}

export async function fetchInquiriesForLandlord(landlordId) {
  const { data, error } = await supabase
    .from('inquiries')
    .select('*, listings!inner(landlord_id, title)')
    .eq('listings.landlord_id', landlordId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function replyToInquiry(inquiryId, replyText) {
  const { error } = await supabase
    .from('inquiries')
    .update({ status: 'replied', reply_text: replyText })
    .eq('id', inquiryId);
  if (error) throw error;
}

// ------------------------------------------------------------
// Notifications
// ------------------------------------------------------------
export async function fetchNotifications(userId) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function addNotification(userId, title, message, type = 'info') {
  const { error } = await supabase
    .from('notifications')
    .insert({ user_id: userId, title, message, type });
  if (error) throw error;
}