// src/api/kycApi.js
// Data access layer for the KYC verification feature. Follows the same
// conventions as listingsapi.js: supabase.from(...), throw raw error,
// return plain data shapes.

import supabase from '../../db/supabaseClient';

const KYC_BUCKET = 'kyc-documents';
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_SIZE_MB = 5;

export function validateKycFile(file) {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return 'Only JPG, PNG, or PDF files are supported.';
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return `"${file.name}" is over ${MAX_SIZE_MB}MB.`;
  }
  return null;
}

function extensionFor(file) {
  const fromName = file.name.split('.').pop();
  if (fromName) return fromName.toLowerCase();
  return file.type === 'application/pdf' ? 'pdf' : 'jpg';
}

// Uploads one KYC document to the private bucket at "{userId}/{fieldName}.{ext}",
// overwriting any previous file for that field (resubmission case).
export async function uploadKycFile(userId, file, fieldName) {
  const validationError = validateKycFile(file);
  if (validationError) throw new Error(validationError);

  const path = `${userId}/${fieldName}.${extensionFor(file)}`;
  const { error } = await supabase.storage
    .from(KYC_BUCKET)
    .upload(path, file, { upsert: true });
  if (error) throw error;
  return path;
}

// formData: { first_name, last_name, province, district, municipality, tole,
//             phone, latitude, longitude, document_type, document_number,
//             utility_bill_type }
// files: { document_front, document_back?, utility_bill, selfie? } -> File
export async function submitKYC(userId, userEmail, formData, files) {
  const uploaded = {};
  for (const [fieldName, file] of Object.entries(files)) {
    if (!file) continue;
    uploaded[fieldName] = await uploadKycFile(userId, file, fieldName);
  }

  const row = {
    user_id: userId,
    first_name: formData.first_name,
    last_name: formData.last_name,
    province: formData.province,
    district: formData.district,
    municipality: formData.municipality,
    tole: formData.tole,
    email: userEmail,
    phone: formData.phone,
    latitude: formData.latitude,
    longitude: formData.longitude,
    document_type: formData.document_type,
    document_number: formData.document_number,
    utility_bill_type: formData.utility_bill_type,
    status: 'pending',
    rejection_reason: null,
    reviewed_by: null,
    reviewed_at: null,
  };

  if (uploaded.document_front) row.document_front_url = uploaded.document_front;
  if (uploaded.document_back) row.document_back_url = uploaded.document_back;
  if (uploaded.utility_bill) row.utility_bill_url = uploaded.utility_bill;
  if (uploaded.selfie) row.selfie_url = uploaded.selfie;

  const { data, error } = await supabase
    .from('kyc_verifications')
    .upsert(row, { onConflict: 'user_id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function fetchMyKYC(userId) {
  const { data, error } = await supabase
    .from('kyc_verifications')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

const SIGNED_URL_TTL_SECONDS = 300;

async function signPath(path) {
  if (!path) return null;
  const { data, error } = await supabase.storage
    .from(KYC_BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
  if (error) throw error;
  return data.signedUrl;
}

// Admin detail view: fetch a landlord's KYC row plus signed URLs for
// each uploaded document.
export async function fetchKYCByUserId(userId) {
  const { data, error } = await supabase
    .from('kyc_verifications')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const [document_front_signed_url, document_back_signed_url, utility_bill_signed_url, selfie_signed_url] =
    await Promise.all([
      signPath(data.document_front_url),
      signPath(data.document_back_url),
      signPath(data.utility_bill_url),
      signPath(data.selfie_url),
    ]);

  return {
    ...data,
    document_front_signed_url,
    document_back_signed_url,
    utility_bill_signed_url,
    selfie_signed_url,
  };
}

// decision: 'approved' | 'rejected'
export async function reviewKYC(kycId, decision, reason, adminId) {
  const { error } = await supabase
    .from('kyc_verifications')
    .update({
      status: decision,
      rejection_reason: decision === 'rejected' ? reason : null,
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', kycId);
  if (error) throw error;
}
