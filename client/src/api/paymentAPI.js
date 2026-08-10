// src/api/paymentAPI.js
// Data access layer for payments, screenshot proof uploads, and admin verification

import supabase from "../../db/supabaseClient";

const PAYMENT_STORAGE_BUCKET = "payment-proofs";
const LOCAL_STORAGE_KEY = "nestfinder_payments_cache";

function getLocalPayments() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
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

  // The `payments` row is the single source of truth admins read from —
  // it must actually persist before we tell the tenant it succeeded or
  // notify admins there's something to review. Previously a failed insert
  // (e.g. an RLS rejection) was swallowed silently, so the tenant saw a
  // success screen and the admin got a notification pointing at a payment
  // that only ever existed in the tenant's own browser's localStorage.
  const { data, error } = await supabase
    .from("payments")
    .insert({
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
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(
      error?.message ||
        "Could not save your payment submission. Please try again.",
    );
  }

  // Read-through cache for this tenant's own device (e.g. PaymentHistory) —
  // safe to store now since `data` is the actual persisted DB row.
  const currentLocal = getLocalPayments();
  saveLocalPayments([data, ...currentLocal]);

  // Notify admins only now that the row is durably saved, so every
  // notification has a matching entry on the payment verification page.
  try {
    const { data: adminUsers } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "admin");

    if (adminUsers?.length) {
      const message =
        data.payment_type === "landlord_listing"
          ? `${data.user_name} submitted a listing fee payment of Rs. ${data.amount}.`
          : `${data.user_name} submitted payment proof of Rs. ${data.amount} for ${data.target_radius >= 1000 ? data.target_radius / 1000 + "km" : data.target_radius + "m"} radius.`;
      for (const admin of adminUsers) {
        await supabase.from("notifications").insert({
          user_id: admin.id,
          title: "Payment Verification Needed",
          message,
          type: "admin",
        });
      }
    }
  } catch (err) {
    console.warn("Could not notify admin via DB:", err.message);
  }

  return data;
}

// ------------------------------------------------------------
// Fetch all payments (Admin dashboard view)
// ------------------------------------------------------------
export async function fetchAllPayments() {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message || "Could not load payments.");
  }

  return data || [];
}

// ------------------------------------------------------------
// Update Payment Status (Admin action: approve / reject)
// ------------------------------------------------------------
export async function updatePaymentStatus(paymentId, status, adminNotes = "") {
  const approvedAt = status === "approved" ? new Date().toISOString() : null;

  // .select().single() returns the updated row so the caller (admin
  // dashboard) gets the real target_location/target_radius/user_id to grant
  // access with, instead of relying on the admin's own (almost always
  // empty, since admins don't submit payments) local cache to look it up.
  const { data, error } = await supabase
    .from("payments")
    .update({
      status,
      admin_notes: adminNotes,
      approved_at: approvedAt,
    })
    .eq("id", paymentId)
    .select()
    .single();

  if (error || !data) {
    throw new Error(
      error?.message || "Could not update this payment. Please try again.",
    );
  }

  const localPayments = getLocalPayments().map((p) =>
    p.id === paymentId ? data : p,
  );
  saveLocalPayments(localPayments);

  if (data.user_id) {
    try {
      const isApproved = status === "approved";
      const isListingFee = data.payment_type === "landlord_listing";
      const message = isApproved
        ? isListingFee
          ? `Your listing fee of Rs. ${data.amount} was verified — your listing is now live!`
          : `Your payment of Rs. ${data.amount} for ${data.target_radius >= 1000 ? data.target_radius / 1000 + "km" : data.target_radius + "m"} room access was verified and approved! Access unlocked for 48 hours.`
        : `Your payment proof was rejected. Reason: ${adminNotes || "Receipt unreadable or invalid."}`;
      await supabase.from("notifications").insert({
        user_id: data.user_id,
        title: isApproved ? "Payment Approved! 🎉" : "Payment Proof Rejected",
        message,
        type: isApproved ? "payment" : "warning",
      });
    } catch (err) {
      console.warn("Tenant notification insert error:", err.message);
    }
  }

  return data;
}

// ------------------------------------------------------------
// Fetch User Payment History
// ------------------------------------------------------------
export async function fetchUserPayments(userId) {
  if (!userId) return [];

  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message || "Could not load your payment history.");
  }

  return data || [];
}

// ------------------------------------------------------------
// Fetch the current user's most recent pending payment of a given type, if
// any — used to block resubmission while an earlier proof is still under
// admin review (submitting again would create a second competing request).
// ------------------------------------------------------------
export async function fetchPendingPayment(userId, paymentType) {
  if (!userId) return null;

  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("user_id", userId)
    .eq("payment_type", paymentType)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    console.warn("Error checking for a pending payment:", error.message);
    return null;
  }

  return data?.[0] || null;
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
