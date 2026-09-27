import { createClient } from "@/lib/supabase/client";

const DM_PREFIX = "dm:";

function mapMessage(row) {
  return {
    id: row.id,
    bookingId: row.booking_id,
    senderId: row.sender_id,
    recipientId: row.recipient_id,
    body: row.body || "",
    read: !!row.read,
    createdAt: row.created_at,
  };
}

// ponytail: [] on error / no session so /messages shows its empty state while schema.sql is unapplied.
// Threads = one per booking the user is part of + one per direct-message partner. key identifies the thread.
export async function listThreads() {
  try {
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth?.user?.id;
    if (!uid) return [];

    const { data: bookings, error } = await supabase
      .from("bookings")
      .select(
        "id, customer_id, professional_id, service_title, date, professionals(name, image_url), customer:profiles(full_name, avatar_url)"
      )
      .or(`customer_id.eq.${uid},professional_id.eq.${uid}`)
      .order("created_at", { ascending: false });
    if (error) throw error;

    const ids = (bookings || []).map((b) => b.id);
    let bookingMessages = [];
    if (ids.length) {
      const { data, error: msgError } = await supabase
        .from("messages")
        .select("id, booking_id, sender_id, recipient_id, body, read, created_at")
        .in("booking_id", ids)
        .order("created_at", { ascending: true });
      if (msgError) throw msgError;
      bookingMessages = data || [];
    }

    const byBooking = new Map();
    for (const m of bookingMessages) {
      const list = byBooking.get(m.booking_id) || [];
      list.push(m);
      byBooking.set(m.booking_id, list);
    }

    const bookingThreads = (bookings || []).map((b) => {
      const isCustomer = b.customer_id === uid;
      const pro = b.professionals || {};
      const cust = b.customer || {};
      const thread = byBooking.get(b.id) || [];
      const last = thread[thread.length - 1] || null;
      return {
        key: b.id,
        bookingId: b.id,
        serviceTitle: b.service_title || "Service",
        date: b.date || "",
        otherId: isCustomer ? b.professional_id : b.customer_id,
        otherName: isCustomer ? pro.name || "Professional" : cust.full_name || "Customer",
        otherAvatar: isCustomer ? pro.image_url || "" : cust.avatar_url || "",
        lastMessage: last?.body || "",
        lastAt: last?.created_at || null,
        unread: thread.filter((m) => m.recipient_id === uid && !m.read).length,
      };
    });

    // Direct messages (no booking) — grouped by the other participant.
    const { data: dmRows } = await supabase
      .from("messages")
      .select("id, booking_id, sender_id, recipient_id, body, read, created_at")
      .is("booking_id", null)
      .or(`sender_id.eq.${uid},recipient_id.eq.${uid}`)
      .order("created_at", { ascending: true });

    const dmByUser = new Map();
    for (const m of dmRows || []) {
      const other = m.sender_id === uid ? m.recipient_id : m.sender_id;
      const list = dmByUser.get(other) || [];
      list.push(m);
      dmByUser.set(other, list);
    }

    const dmOtherIds = [...dmByUser.keys()];
    const proById = new Map();
    if (dmOtherIds.length) {
      const { data: pros } = await supabase
        .from("professionals")
        .select("id, name, image_url")
        .in("id", dmOtherIds);
      for (const p of pros || []) proById.set(p.id, p);
    }

    const dmThreads = dmOtherIds.map((other) => {
      const thread = dmByUser.get(other) || [];
      const last = thread[thread.length - 1] || null;
      const pro = proById.get(other);
      return {
        key: `${DM_PREFIX}${other}`,
        bookingId: null,
        serviceTitle: "Direct message",
        date: "",
        otherId: other,
        otherName: pro?.name || "Customer",
        otherAvatar: pro?.image_url || "",
        lastMessage: last?.body || "",
        lastAt: last?.created_at || null,
        unread: thread.filter((m) => m.recipient_id === uid && !m.read).length,
      };
    });

    return [...bookingThreads, ...dmThreads].sort(
      (a, b) => new Date(b.lastAt || 0) - new Date(a.lastAt || 0)
    );
  } catch {
    return [];
  }
}

// Display name/avatar for a direct-message partner (professionals are public-read; others fall back).
export async function getDmPeer(userId) {
  if (!userId) return null;
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("professionals")
      .select("id, name, image_url")
      .eq("id", userId)
      .maybeSingle();
    return { id: userId, name: data?.name || "Customer", avatar: data?.image_url || "" };
  } catch {
    return { id: userId, name: "Customer", avatar: "" };
  }
}

// ponytail: [] on error so the thread pane degrades to empty instead of crashing.
// threadKey is a booking id or "dm:<otherUserId>".
export async function listMessages(threadKey) {
  if (!threadKey) return [];
  try {
    const supabase = createClient();

    if (String(threadKey).startsWith(DM_PREFIX)) {
      const other = String(threadKey).slice(DM_PREFIX.length);
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth?.user?.id;
      if (!uid) return [];
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .is("booking_id", null)
        .or(
          `and(sender_id.eq.${uid},recipient_id.eq.${other}),and(sender_id.eq.${other},recipient_id.eq.${uid})`
        )
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data || []).map(mapMessage);
    }

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("booking_id", threadKey)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data || []).map(mapMessage);
  } catch {
    return [];
  }
}

export async function sendMessage({ bookingId, recipientId, body }) {
  const text = (body || "").trim();
  if (!recipientId) throw new Error("Missing message recipient.");
  if (!text) throw new Error("Message cannot be empty.");

  const supabase = createClient();
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth?.user) throw new Error("Please sign in to send messages.");

  const { data, error } = await supabase
    .from("messages")
    .insert({
      booking_id: bookingId || null,
      sender_id: auth.user.id,
      recipient_id: recipientId,
      body: text,
    })
    .select()
    .single();
  if (error) {
    const msg = /booking_id/.test(error.message || "")
      ? "Direct messages aren't enabled yet (database update pending)."
      : error.message || "Unable to send message.";
    throw new Error(msg);
  }
  return mapMessage(data);
}

// ponytail: best-effort read receipt — false instead of throwing so the thread never crashes.
// threadKey is a booking id or "dm:<otherUserId>".
export async function markThreadRead(threadKey) {
  if (!threadKey) return false;
  try {
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth?.user?.id;
    if (!uid) return false;

    if (String(threadKey).startsWith(DM_PREFIX)) {
      const other = String(threadKey).slice(DM_PREFIX.length);
      const { error } = await supabase
        .from("messages")
        .update({ read: true })
        .is("booking_id", null)
        .eq("sender_id", other)
        .eq("recipient_id", uid)
        .eq("read", false);
      if (error) throw error;
      return true;
    }

    const { error } = await supabase
      .from("messages")
      .update({ read: true })
      .eq("booking_id", threadKey)
      .eq("recipient_id", uid)
      .eq("read", false);
    if (error) throw error;
    return true;
  } catch {
    return false;
  }
}
