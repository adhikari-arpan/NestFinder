// src/payment/paymentAPI.js
// Data access layer for payments, screenshot proof uploads, and admin verification

import supabase from "../../db/supabaseClient";

const PAYMENT_STORAGE_BUCKET = "payment-proofs";
const LOCAL_STORAGE_KEY = "nestfinder_payments_cache";

function getLocalPayments() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

function saveLocalPayments(payments) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payments));
  } catch (err) {
    console.error("Failed to save local payments cache:", err);
  }
}

// Convert a file to Base64 data URL for preview/fallback storage
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

// Upload payment proof image to Supabase storage or return base64 fallback
export async function uploadPaymentProofImage(file, userId) {
  if (!file) return null;
  const fileName = `${userId || "guest"}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  try {
    const { error: uploadErr } = await supabase.storage
      .from(PAYMENT_STORAGE_BUCKET)
      .upload(fileName, file);

    if (!uploadErr) {
      const { data } = supabase.storage
        .from(PAYMENT_STORAGE_BUCKET)
        .getPublicUrl(fileName);
      return data.publicUrl;
    }
  } catch (err) {
    console.warn("Storage upload fallback to base64:", err.message);
  }

  // Fallback to base64 data URL if storage bucket doesn't exist yet
  return await fileToBase64(file);
}

// ------------------------------------------------------------
// Submit a payment proof (Tenant / User action)
// ------------------------------------------------------------
export async function submitPaymentProof({
  userId,
  userName,
  userEmail,
  userPhone,
  paymentType = "distance_radius",
  amount,
  targetLocation,
  targetRadius,
  proofFile,
  transactionCode = "",
}) {
  const proofUrl = await uploadPaymentProofImage(proofFile, userId);

  const payload = {
    id: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    user_id: userId || null,
    user_name: userName || "Anonymous Tenant",
    user_email: userEmail || "",
    user_phone: userPhone || "",
    payment_type: paymentType,
    amount: Number(amount),
    target_location: targetLocation || null,
    target_radius: Number(targetRadius || 1000),
    proof_image_url: proofUrl,
    transaction_code: transactionCode,
    status: "pending",
    created_at: new Date().toISOString(),
    approved_at: null,
    admin_notes: null,
  };

  // 1. Save to Supabase `payments` table if table exists
  try {
    const { data, error } = await supabase
      .from("payments")
      .insert({
        user_id: payload.user_id,
        user_name: payload.user_name,
        user_email: payload.user_email,
        user_phone: payload.user_phone,
        payment_type: payload.payment_type,
        amount: payload.amount,
        target_location: payload.target_location,
        target_radius: payload.target_radius,
        proof_image_url: payload.proof_image_url,
        transaction_code: payload.transaction_code,
        status: "pending",
      })
      .select()
      .single();

    if (!error && data) {
      payload.id = data.id;
    }
  } catch (err) {
    console.warn("Supabase payments table query failed, using local cache:", err.message);
  }

  // 2. Also save to local storage cache for instant UI availability
  const currentLocal = getLocalPayments();
  saveLocalPayments([payload, ...currentLocal]);

  // 3. Create Admin Notification
  try {
    const { data: adminUsers } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "admin");

    if (adminUsers?.length) {
      for (const admin of adminUsers) {
        await supabase.from("notifications").insert({
          user_id: admin.id,
          title: "Payment Verification Needed",
          message: `${payload.user_name} submitted payment proof of Rs. ${payload.amount} for ${payload.target_radius >= 1000 ? payload.target_radius/1000 + 'km' : payload.target_radius + 'm'} radius.`,
          type: "admin",
        });
      }
    }
  } catch (err) {
    console.warn("Could not notify admin via DB:", err.message);
  }

  return payload;
}

// ------------------------------------------------------------
// Fetch all payments (Admin dashboard view)
// ------------------------------------------------------------
export async function fetchAllPayments() {
  let dbPayments = [];
  try {
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      dbPayments = data;
    }
  } catch (err) {
    console.warn("Using local payments cache for admin:", err.message);
  }

  const localPayments = getLocalPayments();
  const mergedMap = new Map();

  // Combine DB and local payments prioritizing DB
  [...dbPayments, ...localPayments].forEach((item) => {
    if (!mergedMap.has(item.id)) {
      mergedMap.set(item.id, item);
    }
  });

  return Array.from(mergedMap.values()).sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );
}

// ------------------------------------------------------------
// Update Payment Status (Admin action: approve / reject)
// ------------------------------------------------------------
export async function updatePaymentStatus(paymentId, status, adminNotes = "") {
  const approvedAt = status === "approved" ? new Date().toISOString() : null;

  // 1. Update in DB if available
  try {
    await supabase
      .from("payments")
      .update({
        status,
        admin_notes: adminNotes,
        approved_at: approvedAt,
      })
      .eq("id", paymentId);
  } catch (err) {
    console.warn("Supabase payments status update skipped:", err.message);
  }

  // 2. Update local cache
  const localPayments = getLocalPayments().map((p) =>
    p.id === paymentId
      ? { ...p, status, admin_notes: adminNotes, approved_at: approvedAt }
      : p
  );
  saveLocalPayments(localPayments);

  // 3. Find payment details to send tenant notification & grant access if approved
  const targetPayment = localPayments.find((p) => p.id === paymentId);

  if (targetPayment && targetPayment.user_id) {
    try {
      const isApproved = status === "approved";
      await supabase.from("notifications").insert({
        user_id: targetPayment.user_id,
        title: isApproved ? "Payment Approved! 🎉" : "Payment Proof Rejected",
        message: isApproved
          ? `Your payment of Rs. ${targetPayment.amount} for ${targetPayment.target_radius >= 1000 ? targetPayment.target_radius/1000 + 'km' : targetPayment.target_radius + 'm'} room access was verified and approved!`
          : `Your payment proof was rejected. Reason: ${adminNotes || "Receipt unreadable or invalid."}`,
        type: isApproved ? "payment" : "warning",
      });
    } catch (err) {
      console.warn("Tenant notification insert error:", err.message);
    }
  }

  return targetPayment;
}

// ------------------------------------------------------------
// Fetch User Payment History
// ------------------------------------------------------------
export async function fetchUserPayments(userId) {
  const all = await fetchAllPayments();
  if (!userId) return all;
  return all.filter((p) => p.user_id === userId);
}

// ------------------------------------------------------------
// Fetch active approved payment for specific user (User-specific access gate)
// ------------------------------------------------------------
export async function fetchUserApprovedAccess(userId) {
  if (!userId) return null;

  try {
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "approved")
      .order("approved_at", { ascending: false })
      .limit(1);

    if (!error && data?.length) {
      const payment = data[0];
      const approvedTime = payment.approved_at ? new Date(payment.approved_at).getTime() : new Date(payment.created_at).getTime();
      const paidUntil = approvedTime + 48 * 60 * 60 * 1000;
      if (paidUntil > Date.now()) {
        return {
          userId,
          activeRadius: Number(payment.target_radius),
          location: payment.target_location,
          pricePaid: payment.amount,
          paidUntil,
          paidAt: approvedTime,
        };
      }
    }
  } catch (err) {
    console.warn("Error fetching approved payment from DB:", err.message);
  }

  try {
    const key = `nestfinder_paid_access_${userId}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.paidUntil && parsed.paidUntil > Date.now()) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Error reading local user paid access:", err);
  }

  return null;
}
