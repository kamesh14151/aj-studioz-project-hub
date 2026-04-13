import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimateInView from "@/components/AnimateInView";
import { Lightbulb, Package, FileText, Plus, X, ShoppingCart, CreditCard, Loader2, Minus, History, Trash2, MessageCircle, Send } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";

type Tab = "ideas" | "problems" | "inventory" | "orders";

interface Idea {
  id: string;
  title: string;
  description: string;
  author_id: string;
  status: string;
  created_at: string;
  profiles?: { display_name: string | null } | null;
}

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  total_count: number;
  available_count: number;
  image_url: string | null;
}

interface CartItem {
  item: InventoryItem;
  quantity: number;
}

interface BookingHistoryItem {
  id: string;
  item_id: string;
  user_id: string;
  quantity: number;
  status: string;
  payment_status?: string;
  payment_reference?: string | null;
  invoice_number?: string | null;
  order_group_id?: string | null;
  delivery_status?: string | null;
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  delivery_address?: string | null;
  delivery_city?: string | null;
  delivery_state?: string | null;
  delivery_pincode?: string | null;
  created_at: string;
  inventory?: {
    name: string;
    category: string;
    image_url: string | null;
  } | null;
}

interface OrderGroup {
  key: string;
  invoiceNumber: string;
  createdAt: string;
  paymentReference: string;
  deliveryStatus: string;
  status: string;
  items: Array<{ name: string; quantity: number }>;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
}

interface ProblemStatement {
  id: number;
  title: string;
  dept: string;
  ministry: string;
  description: string;
  videoKey: string;
  videoEmbedUrl: string;
}

interface VideoComment {
  id: string;
  video_key: string;
  user_id: string;
  comment_text: string;
  created_at: string;
  profiles?: { display_name: string | null } | null;
}

const problemStatements: ProblemStatement[] = [
  {
    id: 1,
    title: "Waste Segregation Automation",
    dept: "ECE",
    ministry: "Ministry of Housing and Urban Affairs",
    description: "Design a sensor-based system for automated waste classification in campus bins.",
    videoKey: "waste-segregation-automation",
    videoEmbedUrl: "https://www.youtube.com/embed/8hQG7QlcLBk",
  },
  {
    id: 2,
    title: "Smart Irrigation for Campus Garden",
    dept: "EEE",
    ministry: "Ministry of Jal Shakti",
    description: "Develop a moisture-sensing automated irrigation system for the botanical garden.",
    videoKey: "smart-irrigation-campus-garden",
    videoEmbedUrl: "https://www.youtube.com/embed/mzJj5-lubeM",
  },
  {
    id: 3,
    title: "Library Seat Availability Tracker",
    dept: "CSE",
    ministry: "Ministry of Education",
    description: "Build an IoT system to display real-time seating availability in the library.",
    videoKey: "library-seat-availability-tracker",
    videoEmbedUrl: "https://www.youtube.com/embed/9No-FiEInLA",
  },
  {
    id: 4,
    title: "Emergency SOS Beacon",
    dept: "ECE",
    ministry: "Ministry of Home Affairs",
    description: "Create a wearable panic button that alerts campus security with GPS coordinates.",
    videoKey: "emergency-sos-beacon",
    videoEmbedUrl: "https://www.youtube.com/embed/v6I5Bq8Y0K8",
  },
];

const StudentDashboard = () => {
  const { user, profile } = useAuth();
  const [tab, setTab] = useState<Tab>("ideas");
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [showNewIdea, setShowNewIdea] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [editingIdeaId, setEditingIdeaId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [savingIdeaEdit, setSavingIdeaEdit] = useState(false);
  const [deletingIdeaId, setDeletingIdeaId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartProcessing, setCartProcessing] = useState(false);
  const [orderHistory, setOrderHistory] = useState<BookingHistoryItem[]>([]);
  const [videoComments, setVideoComments] = useState<Record<string, VideoComment[]>>({});
  const [videoCommentDrafts, setVideoCommentDrafts] = useState<Record<string, string>>({});
  const [postingVideoKey, setPostingVideoKey] = useState<string | null>(null);
  const [checkoutDetails, setCheckoutDetails] = useState({
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    city: "Salem",
    state: "Tamil Nadu",
    pincode: "636005",
  });

  const fetchIdeas = async () => {
    const { data: ideasData, error: ideasError } = await supabase
      .from("ideas")
      .select("*")
      .order("created_at", { ascending: false });
    if (ideasError) {
      toast.error(ideasError.message);
      return;
    }
    if (!ideasData) {
      setIdeas([]);
      return;
    }

    const authorIds = [...new Set(ideasData.map((idea) => idea.author_id))];
    if (authorIds.length === 0) {
      setIdeas(ideasData as Idea[]);
      return;
    }

    const { data: profilesData } = await supabase
      .from("profiles")
      .select("user_id, display_name")
      .in("user_id", authorIds);

    const profileMap = new Map((profilesData ?? []).map((profile) => [profile.user_id, profile.display_name]));

    setIdeas(
      ideasData.map((idea) => ({
        ...idea,
        profiles: { display_name: profileMap.get(idea.author_id) ?? null },
      })) as Idea[]
    );
  };

  const fetchInventory = async () => {
    const { data } = await supabase.from("inventory").select("*").order("name");
    if (data) setInventory(data as InventoryItem[]);
  };

  const fetchOrderHistory = async () => {
    if (!user) return;

    const { data: bookingData, error: bookingError } = await supabase
      .from("bookings" as any)
      .select("*")
      .eq("user_id", user.id)
      .eq("payment_status", "paid")
      .order("created_at", { ascending: false });

    if (bookingError) {
      toast.error(bookingError.message);
      return;
    }

    const typedBookings = (bookingData ?? []) as any[];

    if (typedBookings.length === 0) {
      setOrderHistory([]);
      return;
    }

    const itemIds = [...new Set(typedBookings.map((booking) => booking.item_id))];
    const { data: inventoryData } = await supabase
      .from("inventory")
      .select("id, name, category, image_url")
      .in("id", itemIds);

    const inventoryMap = new Map((inventoryData ?? []).map((item) => [item.id, item]));

    setOrderHistory(
      typedBookings.map((booking) => ({
        ...booking,
        inventory: inventoryMap.get(booking.item_id) ?? null,
      })) as BookingHistoryItem[]
    );
  };

  const fetchVideoComments = async () => {
    const { data: commentsData, error: commentsError } = await supabase
      .from("video_comments" as any)
      .select("id, video_key, user_id, comment_text, created_at")
      .order("created_at", { ascending: true });

    if (commentsError) {
      toast.error(commentsError.message);
      return;
    }

    const comments = (commentsData ?? []) as VideoComment[];
    const userIds = [...new Set(comments.map((comment) => comment.user_id))];

    let profileMap = new Map<string, string | null>();
    if (userIds.length > 0) {
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", userIds);
      profileMap = new Map((profilesData ?? []).map((profile) => [profile.user_id, profile.display_name]));
    }

    const grouped = comments.reduce((acc, comment) => {
      const entry: VideoComment = {
        ...comment,
        profiles: { display_name: profileMap.get(comment.user_id) ?? null },
      };
      if (!acc[comment.video_key]) acc[comment.video_key] = [];
      acc[comment.video_key].push(entry);
      return acc;
    }, {} as Record<string, VideoComment[]>);

    setVideoComments(grouped);
  };

  useEffect(() => {
    if (!profile && !user) return;
    setCheckoutDetails((prev) => ({
      ...prev,
      contactName: prev.contactName || profile?.display_name || "",
      contactEmail: prev.contactEmail || user?.email || "",
    }));
  }, [profile?.display_name, user?.email]);

  useEffect(() => {
    fetchIdeas();
    fetchInventory();
    fetchOrderHistory();
    fetchVideoComments();

    // Real-time subscriptions
    const ideasChannel = supabase
      .channel("ideas-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "ideas" }, () => fetchIdeas())
      .subscribe();

    const inventoryChannel = supabase
      .channel("inventory-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "inventory" }, () => fetchInventory())
      .subscribe();

    const bookingsChannel = supabase
      .channel("student-bookings-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => fetchOrderHistory())
      .subscribe();

    const commentsChannel = supabase
      .channel("video-comments-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "video_comments" }, () => fetchVideoComments())
      .subscribe();

    return () => {
      supabase.removeChannel(ideasChannel);
      supabase.removeChannel(inventoryChannel);
      supabase.removeChannel(bookingsChannel);
      supabase.removeChannel(commentsChannel);
    };
  }, [user?.id]);

  const invoiceFromGroup = (groupId: string) =>
    `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${groupId.slice(0, 8).toUpperCase()}`;

  const upsertPaidStatusFromCallback = async () => {
    if (!user) return;
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    const orderGroupId = params.get("order_group_id");
    const paymentReference =
      params.get("payment_id") ||
      params.get("transaction_id") ||
      params.get("checkout_id") ||
      "dodo";
    if (!payment || !orderGroupId) return;

    if (payment === "success") {
      const { error } = await supabase
        .from("bookings" as any)
        .update({ payment_status: "paid", payment_reference: paymentReference })
        .eq("user_id", user.id)
        .eq("order_group_id", orderGroupId);
      if (!error) toast.success("Payment successful. Order saved.");
    }

    if (payment === "cancelled") {
      await supabase
        .from("bookings" as any)
        .update({ payment_status: "cancelled" })
        .eq("user_id", user.id)
        .eq("order_group_id", orderGroupId);
      toast.info("Payment cancelled.");
    }

    const url = new URL(window.location.href);
    url.searchParams.delete("payment");
    url.searchParams.delete("order_group_id");
    url.searchParams.delete("payment_id");
    url.searchParams.delete("transaction_id");
    url.searchParams.delete("checkout_id");
    window.history.replaceState({}, "", url.toString());
    fetchOrderHistory();
  };

  useEffect(() => {
    upsertPaidStatusFromCallback();
  }, [user?.id]);

  const validateCheckoutDetails = () => {
    if (!checkoutDetails.contactName.trim()) return "Contact name is required";
    if (!checkoutDetails.contactEmail.trim()) return "Email is required";
    if (!checkoutDetails.contactPhone.trim()) return "Phone number is required";
    if (!checkoutDetails.address.trim()) return "Delivery address is required";
    if (!checkoutDetails.city.trim()) return "City is required";
    if (!checkoutDetails.state.trim()) return "State is required";
    if (!checkoutDetails.pincode.trim()) return "Pincode is required";
    return null;
  };

  const getAvailableAfterCart = (item: InventoryItem) => {
    const inCart = cart.find((entry) => entry.item.id === item.id)?.quantity ?? 0;
    return Math.max(item.available_count - inCart, 0);
  };

  const addToCart = (item: InventoryItem) => {
    const availableNow = getAvailableAfterCart(item);
    if (availableNow <= 0) {
      toast.error("No more available quantity for this component.");
      return;
    }

    setCart((prev) => {
      const existing = prev.find((entry) => entry.item.id === item.id);
      if (existing) {
        return prev.map((entry) =>
          entry.item.id === item.id ? { ...entry, quantity: entry.quantity + 1 } : entry
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const decrementCartItem = (itemId: string) => {
    setCart((prev) =>
      prev
        .map((entry) => (entry.item.id === itemId ? { ...entry, quantity: entry.quantity - 1 } : entry))
        .filter((entry) => entry.quantity > 0)
    );
  };

  const clearCart = () => setCart([]);

  const startCheckout = async (cartEntries: CartItem[]) => {
    if (!user || cartEntries.length === 0) return null;

    const validationError = validateCheckoutDetails();
    if (validationError) throw new Error(validationError);

    const orderGroupId = crypto.randomUUID();
    const invoiceNumber = invoiceFromGroup(orderGroupId);
    const totalQty = cartEntries.reduce((sum, entry) => sum + entry.quantity, 0);
    const itemSummary = cartEntries.map((entry) => `${entry.item.name} x${entry.quantity}`).join(", ");

    const bookingRows = cartEntries.map((entry) => ({
      item_id: entry.item.id,
      user_id: user.id,
      quantity: entry.quantity,
      status: "active",
      payment_status: "pending",
      invoice_number: invoiceNumber,
      order_group_id: orderGroupId,
      contact_name: checkoutDetails.contactName.trim(),
      contact_email: checkoutDetails.contactEmail.trim(),
      contact_phone: checkoutDetails.contactPhone.trim(),
      delivery_address: checkoutDetails.address.trim(),
      delivery_city: checkoutDetails.city.trim(),
      delivery_state: checkoutDetails.state.trim(),
      delivery_pincode: checkoutDetails.pincode.trim(),
    }));

    const { error: bookingError } = await supabase.from("bookings" as any).insert(bookingRows as any);
    if (bookingError) throw new Error(bookingError.message || "Unable to create pending order");

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        itemName: itemSummary,
        quantity: totalQty,
        successUrl: `${window.location.origin}/?payment=success&order_group_id=${orderGroupId}`,
        cancelUrl: `${window.location.origin}/?payment=cancelled&order_group_id=${orderGroupId}`,
        customer: {
          email: checkoutDetails.contactEmail.trim(),
          name: checkoutDetails.contactName.trim(),
        },
      }),
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.url) {
      await supabase
        .from("bookings" as any)
        .delete()
        .eq("user_id", user.id)
        .eq("order_group_id", orderGroupId);
      throw new Error(payload?.error || payload?.message || `Checkout failed with status ${response.status}`);
    }

    return payload.url as string;
  };

  const checkoutCart = async () => {
    if (!user || cart.length === 0) return;
    setCartProcessing(true);

    try {
      const checkoutUrl = await startCheckout(cart);
      if (!checkoutUrl) throw new Error("Unable to initialize checkout");

      clearCart();
      window.location.assign(checkoutUrl);
    } catch (err: any) {
      toast.error(err?.message || "Unable to process cart checkout.");
    } finally {
      setCartProcessing(false);
    }
  };

  const handleSubmitIdea = async () => {
    if (!newTitle.trim() || !newDesc.trim() || !user) return;
    setLoading(true);
    const { error } = await supabase.from("ideas").insert({
      title: newTitle.trim(),
      description: newDesc.trim(),
      author_id: user.id,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Idea submitted!");
      setNewTitle("");
      setNewDesc("");
      setShowNewIdea(false);
    }
    setLoading(false);
  };

  const startEditingIdea = (idea: Idea) => {
    setEditingIdeaId(idea.id);
    setEditTitle(idea.title);
    setEditDesc(idea.description);
  };

  const cancelEditingIdea = () => {
    setEditingIdeaId(null);
    setEditTitle("");
    setEditDesc("");
  };

  const handleSaveIdeaEdit = async () => {
    if (!user || !editingIdeaId || !editTitle.trim() || !editDesc.trim()) return;
    setSavingIdeaEdit(true);

    const { data, error } = await supabase
      .from("ideas")
      .update({
        title: editTitle.trim(),
        description: editDesc.trim(),
      })
      .eq("id", editingIdeaId)
      .eq("author_id", user.id)
      .select("id, title, description")
      .maybeSingle();

    if (error) {
      toast.error(error.message);
    } else if (!data) {
      toast.error("Unable to update this idea.");
    } else {
      setIdeas((prev) =>
        prev.map((idea) =>
          idea.id === editingIdeaId
            ? { ...idea, title: data.title, description: data.description }
            : idea
        )
      );
      toast.success("Idea updated!");
      cancelEditingIdea();
      fetchIdeas();
    }

    setSavingIdeaEdit(false);
  };

  const handleDeleteIdea = async (ideaId: string) => {
    if (!user) return;
    const shouldDelete = window.confirm("Delete this idea permanently?");
    if (!shouldDelete) return;

    setDeletingIdeaId(ideaId);
    const { error } = await supabase
      .from("ideas")
      .delete()
      .eq("id", ideaId)
      .eq("author_id", user.id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Idea deleted.");
      if (editingIdeaId === ideaId) {
        cancelEditingIdea();
      }
      fetchIdeas();
    }

    setDeletingIdeaId(null);
  };

  const handlePreBook = async (item: InventoryItem) => {
    if (!user || item.available_count <= 0) return;
    setBookingId(item.id);

    // Then redirect to Dodo Payments checkout
    try {
      const checkoutUrl = await startCheckout([{ item, quantity: 1 }]);
      if (!checkoutUrl) throw new Error("Unable to initialize checkout");

      // Use same-tab redirect to avoid popup blocking issues.
      window.location.assign(checkoutUrl);
    } catch (err: any) {
      toast.error(err?.message || `Unable to open payment checkout for ${item.name}.`);
    }

    setBookingId(null);
  };

  const handlePostVideoComment = async (videoKey: string) => {
    if (!user) {
      toast.error("Please sign in to comment.");
      return;
    }

    const message = (videoCommentDrafts[videoKey] || "").trim();
    if (!message) return;

    setPostingVideoKey(videoKey);
    const { error } = await supabase.from("video_comments" as any).insert({
      video_key: videoKey,
      user_id: user.id,
      comment_text: message,
    } as any);

    if (error) {
      toast.error(error.message);
    } else {
      setVideoCommentDrafts((prev) => ({ ...prev, [videoKey]: "" }));
      fetchVideoComments();
    }
    setPostingVideoKey(null);
  };

  const statusClass = (s: string) =>
    s === "Review" ? "status-chip status-chip-review" :
    s === "Approved" ? "status-chip status-chip-approved" :
    "status-chip status-chip-invested";

  const groupedOrders: OrderGroup[] = orderHistory.reduce((acc, entry) => {
    const key = entry.order_group_id || entry.id;
    const existing = acc.find((group) => group.key === key);
    const itemName = entry.inventory?.name || "Component";

    if (!existing) {
      acc.push({
        key,
        invoiceNumber: entry.invoice_number || `INV-${new Date(entry.created_at).toISOString().slice(0, 10).replace(/-/g, "")}-${key.slice(0, 8).toUpperCase()}`,
        createdAt: entry.created_at,
        paymentReference: entry.payment_reference || "dodo",
        deliveryStatus: entry.delivery_status || "pending",
        status: entry.payment_status || entry.status,
        items: [{ name: itemName, quantity: entry.quantity }],
        contactName: entry.contact_name || "-",
        contactEmail: entry.contact_email || "-",
        contactPhone: entry.contact_phone || "-",
        address: `${entry.delivery_address || "-"}, ${entry.delivery_city || "-"}, ${entry.delivery_state || "-"} - ${entry.delivery_pincode || "-"}`,
      });
      return acc;
    }

    const existingItem = existing.items.find((item) => item.name === itemName);
    if (existingItem) existingItem.quantity += entry.quantity;
    else existing.items.push({ name: itemName, quantity: entry.quantity });

    return acc;
  }, [] as OrderGroup[]);

  const formatDeliveryStatus = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

  const downloadInvoicePdf = (order: OrderGroup) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("AJ Studioz Invoice", 14, 18);

    doc.setFontSize(11);
    doc.text(`Invoice Number: ${order.invoiceNumber}`, 14, 30);
    doc.text(`Order Group: ${order.key}`, 14, 37);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`, 14, 44);
    doc.text(`Payment Ref: ${order.paymentReference}`, 14, 51);
    doc.text(`Payment Status: ${order.status}`, 14, 58);
    doc.text(`Delivery Status: ${formatDeliveryStatus(order.deliveryStatus)}`, 14, 65);

    doc.text("Bill To:", 14, 76);
    doc.text(order.contactName, 14, 83);
    doc.text(order.contactEmail, 14, 90);
    doc.text(order.contactPhone, 14, 97);
    doc.text(order.address, 14, 104, { maxWidth: 180 });

    autoTable(doc, {
      startY: 116,
      head: [["Item", "Quantity"]],
      body: order.items.map((item) => [item.name, String(item.quantity)]),
      styles: { fontSize: 10 },
    });

    const totalQty = order.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = totalQty * 5;
    const tableBottom = (doc as any).lastAutoTable?.finalY || 130;
    doc.text(`Total Quantity: ${totalQty}`, 14, tableBottom + 12);
    doc.text(`Total Amount: INR ${totalAmount}`, 14, tableBottom + 19);

    doc.save(`${order.invoiceNumber}.pdf`);
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "ideas", label: "Idea Hub", icon: <Lightbulb className="h-4 w-4" /> },
    { key: "problems", label: "Problems", icon: <FileText className="h-4 w-4" /> },
    { key: "inventory", label: "Inventory", icon: <Package className="h-4 w-4" /> },
    { key: "orders", label: "Orders", icon: <History className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar title="Student Portal">
        <div className="flex gap-1 flex-wrap">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm transition-all ${
                tab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </Navbar>

      <main className="flex-1 container mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {tab === "ideas" && (
          <AnimateInView>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
              <div>
                <h1 className="display-lg">Idea Hub</h1>
                <p className="text-muted-foreground text-sm sm:text-base mt-1">Share your project ideas</p>
              </div>
              <button onClick={() => setShowNewIdea(true)} className="pill-btn gap-2 self-start">
                <Plus className="h-4 w-4" /> New Idea
              </button>
            </div>

            {showNewIdea && (
              <div className="brand-card mb-6 sm:mb-8 relative">
                <button onClick={() => setShowNewIdea(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
                <h3 className="font-serif text-lg mb-4">Submit Your Idea</h3>
                <div className="space-y-3">
                  <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Project title"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
                  <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Describe your idea..." rows={3}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring resize-none" />
                  <button onClick={handleSubmitIdea} className="pill-btn" disabled={loading || !newTitle.trim() || !newDesc.trim()}>
                    {loading ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {ideas.map((idea, i) => (
                <AnimateInView key={idea.id} delay={i * 80}>
                  <div className="brand-card h-full flex flex-col">
                    <div className="flex items-start justify-between mb-3 gap-2">
                      {editingIdeaId === idea.id ? (
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                        />
                      ) : (
                        <h3 className="font-serif text-sm sm:text-base leading-snug flex-1">{idea.title}</h3>
                      )}
                      <span className={statusClass(idea.status)}>{idea.status}</span>
                    </div>
                    {editingIdeaId === idea.id ? (
                      <textarea
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        rows={3}
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none mb-4"
                      />
                    ) : (
                      <p className="text-xs sm:text-sm text-muted-foreground flex-1 mb-4">{idea.description}</p>
                    )}
                    {idea.author_id === user?.id && (
                      <div className="flex items-center gap-2 mb-4">
                        {editingIdeaId === idea.id ? (
                          <>
                            <button
                              onClick={handleSaveIdeaEdit}
                              disabled={savingIdeaEdit || !editTitle.trim() || !editDesc.trim()}
                              className="pill-btn text-xs px-3 py-1.5"
                            >
                              {savingIdeaEdit ? "Saving..." : "Save"}
                            </button>
                            <button
                              onClick={cancelEditingIdea}
                              disabled={savingIdeaEdit}
                              className="pill-btn-outline text-xs px-3 py-1.5"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEditingIdea(idea)} className="pill-btn-outline text-xs px-3 py-1.5">
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteIdea(idea.id)}
                              disabled={deletingIdeaId === idea.id}
                              className="pill-btn-outline text-xs px-3 py-1.5 border-destructive/60 text-destructive hover:bg-destructive/10"
                            >
                              {deletingIdeaId === idea.id ? "Deleting..." : "Delete"}
                            </button>
                          </>
                        )}
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{idea.profiles?.display_name ?? "Unknown"}</span>
                      <span>{new Date(idea.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </AnimateInView>
              ))}
              {ideas.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  <Lightbulb className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p>No ideas yet. Be the first to submit one!</p>
                </div>
              )}
            </div>
          </AnimateInView>
        )}

        {tab === "problems" && (
          <AnimateInView>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6 sm:mb-8">
              <div>
                <h1 className="display-lg mb-2">Problem Statements</h1>
                <p className="text-muted-foreground text-sm sm:text-base">Official institutional challenges with ministry and description</p>
              </div>
              <a
                href="/problem-statements/problem-statement-title.pdf"
                target="_blank"
                rel="noreferrer"
                className="pill-btn-outline text-xs sm:text-sm px-3 py-2 self-start"
              >
                View Problem Statement PDF
              </a>
            </div>

            <div className="brand-card mb-6 sm:mb-8 p-3 sm:p-4">
              <div className="flex items-center justify-between gap-3 mb-3">
                <h3 className="font-serif text-sm sm:text-base">Complete Official Institutional Challenges (Full Document)</h3>
                <a
                  href="/problem-statements/problem-statement-title.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="pill-btn-outline text-xs px-3 py-1.5"
                >
                  Open Full PDF
                </a>
              </div>
              <iframe
                src="/problem-statements/problem-statement-title.pdf"
                title="Official Institutional Challenges"
                className="w-full h-[420px] sm:h-[520px] rounded-xl border border-border"
              />
            </div>

            <div className="space-y-3 sm:space-y-4">
              {problemStatements.map((ps, i) => (
                <AnimateInView key={ps.id} delay={i * 100}>
                  <div className="brand-card flex flex-col gap-4">
                    <div className="aspect-video w-full rounded-xl overflow-hidden border border-border bg-muted">
                      <iframe
                        src={ps.videoEmbedUrl}
                        title={`${ps.title} video`}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>

                    <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 font-serif font-bold text-xs sm:text-sm">
                      {ps.id}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-serif text-sm sm:text-base">{ps.title}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{ps.dept}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">Ministry: {ps.ministry}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">{ps.description}</p>
                    </div>
                    </div>

                    <div className="rounded-xl border border-border p-3 sm:p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <MessageCircle className="h-4 w-4" />
                        <h4 className="font-medium text-sm sm:text-base">Discussion Community</h4>
                      </div>

                      <div className="space-y-2 max-h-44 overflow-y-auto pr-1 mb-3">
                        {(videoComments[ps.videoKey] ?? []).map((comment) => (
                          <div key={comment.id} className="rounded-lg bg-secondary/50 px-3 py-2">
                            <p className="text-xs font-medium">{comment.profiles?.display_name ?? "Student"}</p>
                            <p className="text-xs sm:text-sm">{comment.comment_text}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">{new Date(comment.created_at).toLocaleString()}</p>
                          </div>
                        ))}
                        {(videoComments[ps.videoKey] ?? []).length === 0 && (
                          <p className="text-xs text-muted-foreground">No comments yet. Start the discussion.</p>
                        )}
                      </div>

                      <div className="flex items-start gap-2">
                        <textarea
                          rows={2}
                          value={videoCommentDrafts[ps.videoKey] ?? ""}
                          onChange={(e) =>
                            setVideoCommentDrafts((prev) => ({
                              ...prev,
                              [ps.videoKey]: e.target.value,
                            }))
                          }
                          placeholder="Add your comment for this video..."
                          className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
                        />
                        <button
                          onClick={() => handlePostVideoComment(ps.videoKey)}
                          disabled={postingVideoKey === ps.videoKey || !(videoCommentDrafts[ps.videoKey] || "").trim()}
                          className="pill-btn text-xs px-3 py-2 gap-1.5"
                        >
                          <Send className="h-3.5 w-3.5" />
                          {postingVideoKey === ps.videoKey ? "Posting..." : "Post"}
                        </button>
                      </div>
                    </div>
                  </div>
                </AnimateInView>
              ))}
            </div>
          </AnimateInView>
        )}

        {tab === "inventory" && (
          <AnimateInView>
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex items-center gap-3">
                <ShoppingCart className="h-6 w-6 sm:h-7 sm:w-7" />
                <h1 className="display-lg">Component Inventory</h1>
              </div>
              <div className="brand-card p-3 sm:p-4 min-w-[220px]">
                <p className="text-xs text-muted-foreground mb-1">Cart</p>
                <p className="font-semibold text-sm mb-2">
                  {cart.reduce((sum, entry) => sum + entry.quantity, 0)} item(s) · ₹{cart.reduce((sum, entry) => sum + entry.quantity, 0) * 5}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={checkoutCart}
                    disabled={cart.length === 0 || cartProcessing}
                    className="pill-btn text-xs px-3 py-1.5"
                  >
                    {cartProcessing ? "Processing..." : "Checkout Cart"}
                  </button>
                  <button
                    onClick={clearCart}
                    disabled={cart.length === 0 || cartProcessing}
                    className="pill-btn-outline text-xs px-3 py-1.5"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
            <p className="text-muted-foreground text-sm sm:text-base mb-6 sm:mb-8">Pre-book hardware for your projects</p>

            <div className="brand-card p-4 sm:p-5 mb-6 space-y-3">
              <h3 className="font-serif text-base sm:text-lg">Delivery Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input value={checkoutDetails.contactName} onChange={(e) => setCheckoutDetails((prev) => ({ ...prev, contactName: e.target.value }))}
                  placeholder="Full name" className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
                <input value={checkoutDetails.contactEmail} onChange={(e) => setCheckoutDetails((prev) => ({ ...prev, contactEmail: e.target.value }))}
                  placeholder="Email" className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
                <input value={checkoutDetails.contactPhone} onChange={(e) => setCheckoutDetails((prev) => ({ ...prev, contactPhone: e.target.value }))}
                  placeholder="Phone" className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
                <input value={checkoutDetails.pincode} onChange={(e) => setCheckoutDetails((prev) => ({ ...prev, pincode: e.target.value }))}
                  placeholder="Pincode" className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
                <input value={checkoutDetails.city} onChange={(e) => setCheckoutDetails((prev) => ({ ...prev, city: e.target.value }))}
                  placeholder="City" className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
                <input value={checkoutDetails.state} onChange={(e) => setCheckoutDetails((prev) => ({ ...prev, state: e.target.value }))}
                  placeholder="State" className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <textarea value={checkoutDetails.address} onChange={(e) => setCheckoutDetails((prev) => ({ ...prev, address: e.target.value }))}
                placeholder="Full delivery address" rows={2}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none" />
            </div>
            <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {inventory.map((item, i) => (
                <AnimateInView key={item.id} delay={i * 60}>
                  <div className="rounded-[28px] border-2 border-[#c9c3b8] bg-[#d8d2c8] p-3 sm:p-4 overflow-hidden h-full flex flex-col">
                    {item.image_url && (
                      <div className="aspect-[16/10] bg-muted overflow-hidden rounded-[20px]">
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
                      </div>
                    )}
                    <div className="pt-3 px-1 flex flex-col flex-1">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-serif text-[1.05rem] leading-snug flex-1 line-clamp-1 text-[#2f2a24]">{item.name}</h3>
                        <span className="inline-flex rounded-full bg-white/70 px-2.5 py-1 text-[11px] text-[#44403c] whitespace-nowrap">{item.category}</span>
                      </div>
                      <div className="flex items-center justify-between text-[12px] mb-3 mt-auto">
                        <span className="text-[#5f5950]">Total: {item.total_count}</span>
                        <span className={item.available_count > 0 ? "text-[#2f2a24] font-semibold" : "text-destructive font-semibold"}>
                          {getAvailableAfterCart(item) > 0 ? `${getAvailableAfterCart(item)} left` : "Booked out"}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => addToCart(item)}
                          disabled={getAvailableAfterCart(item) <= 0}
                          className={`inline-flex h-8 items-center justify-center rounded-md border border-border bg-card px-3 text-[11px] font-semibold uppercase tracking-wide transition-all hover:opacity-90 active:scale-[0.98] gap-1.5 w-full ${getAvailableAfterCart(item) <= 0 ? "opacity-40 cursor-not-allowed" : ""}`}
                        >
                          + Cart
                        </button>
                        <button
                          onClick={() => handlePreBook(item)}
                          disabled={item.available_count <= 0 || bookingId === item.id}
                          className={`inline-flex h-8 items-center justify-center rounded-md border border-border bg-foreground px-3 text-[11px] font-semibold uppercase tracking-wide text-background transition-all hover:opacity-90 active:scale-[0.98] gap-1.5 w-full ${item.available_count <= 0 ? "opacity-40 cursor-not-allowed" : ""}`}
                        >
                          {bookingId === item.id ? (
                            <><Loader2 className="h-3 w-3 animate-spin" /> Processing...</>
                          ) : item.available_count > 0 ? (
                            <><CreditCard className="h-3 w-3" /> Buy Now</>
                          ) : (
                            "Unavailable"
                          )}
                        </button>
                      </div>

                      {cart.find((entry) => entry.item.id === item.id) && (
                        <div className="flex items-center justify-between mt-2 text-[11px] border border-border rounded-md px-2 py-1">
                          <span>In cart</span>
                          <div className="flex items-center gap-1">
                            <button onClick={() => decrementCartItem(item.id)} className="p-0.5 rounded hover:bg-muted">
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="min-w-5 text-center">{cart.find((entry) => entry.item.id === item.id)?.quantity}</span>
                            <button onClick={() => addToCart(item)} className="p-0.5 rounded hover:bg-muted">
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </AnimateInView>
              ))}
              {inventory.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  <Package className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p>No inventory items available yet.</p>
                </div>
              )}
            </div>
          </AnimateInView>
        )}

        {tab === "orders" && (
          <AnimateInView>
            <div className="flex items-center gap-3 mb-2">
              <History className="h-6 w-6 sm:h-7 sm:w-7" />
              <h1 className="display-lg">Order History</h1>
            </div>
            <p className="text-muted-foreground text-sm sm:text-base mb-6 sm:mb-8">Your booking and pre-order records</p>

            <div className="space-y-3 sm:space-y-4">
              {groupedOrders.map((order, i) => (
                <AnimateInView key={order.key} delay={i * 50}>
                  <div className="brand-card p-4 sm:p-5 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-serif text-sm sm:text-base">Invoice: {order.invoiceNumber}</p>
                      <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</p>
                      <p className="text-xs mt-1">{order.items.map((item) => `${item.name} x${item.quantity}`).join(", ")}</p>
                      <p className="text-xs text-muted-foreground mt-1">{order.contactName} · {order.contactPhone}</p>
                      <p className="text-xs text-muted-foreground">{order.contactEmail}</p>
                      <p className="text-xs text-muted-foreground">{order.address}</p>
                    </div>
                    <div className="text-right space-y-2">
                      <span className="status-chip">{formatDeliveryStatus(order.deliveryStatus)}</span>
                      <p className="text-[11px] text-muted-foreground">Payment: {order.status}</p>
                      <button onClick={() => downloadInvoicePdf(order)} className="pill-btn-outline text-xs px-3 py-1.5">Download PDF</button>
                    </div>
                  </div>
                </AnimateInView>
              ))}

              {groupedOrders.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <History className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p>No paid orders yet. Orders appear here after successful payment.</p>
                </div>
              )}
            </div>
          </AnimateInView>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default StudentDashboard;
