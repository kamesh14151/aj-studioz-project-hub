import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimateInView from "@/components/AnimateInView";
import { Lightbulb, Package, FileText, Plus, X, ShoppingCart, CreditCard, Loader2, Minus, History, Trash2 } from "lucide-react";
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
  created_at: string;
  inventory?: {
    name: string;
    category: string;
    image_url: string | null;
  } | null;
}

const problemStatements = [
  { id: 1, title: "Waste Segregation Automation", dept: "ECE", description: "Design a sensor-based system for automated waste classification in campus bins." },
  { id: 2, title: "Smart Irrigation for Campus Garden", dept: "EEE", description: "Develop a moisture-sensing automated irrigation system for the botanical garden." },
  { id: 3, title: "Library Seat Availability Tracker", dept: "CSE", description: "Build an IoT system to display real-time seating availability in the library." },
  { id: 4, title: "Emergency SOS Beacon", dept: "ECE", description: "Create a wearable panic button that alerts campus security with GPS coordinates." },
];

const StudentDashboard = () => {
  const { user, profile } = useAuth();
  const [tab, setTab] = useState<Tab>("ideas");
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [showNewIdea, setShowNewIdea] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartProcessing, setCartProcessing] = useState(false);
  const [orderHistory, setOrderHistory] = useState<BookingHistoryItem[]>([]);

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
      .from("bookings")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (bookingError) {
      toast.error(bookingError.message);
      return;
    }

    if (!bookingData || bookingData.length === 0) {
      setOrderHistory([]);
      return;
    }

    const itemIds = [...new Set(bookingData.map((booking) => booking.item_id))];
    const { data: inventoryData } = await supabase
      .from("inventory")
      .select("id, name, category, image_url")
      .in("id", itemIds);

    const inventoryMap = new Map((inventoryData ?? []).map((item) => [item.id, item]));

    setOrderHistory(
      bookingData.map((booking) => ({
        ...booking,
        inventory: inventoryMap.get(booking.item_id) ?? null,
      })) as BookingHistoryItem[]
    );
  };

  useEffect(() => {
    fetchIdeas();
    fetchInventory();
    fetchOrderHistory();

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

    return () => {
      supabase.removeChannel(ideasChannel);
      supabase.removeChannel(inventoryChannel);
      supabase.removeChannel(bookingsChannel);
    };
  }, [user?.id]);

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

  const checkoutCart = async () => {
    if (!user || cart.length === 0) return;
    setCartProcessing(true);

    try {
      const totalQty = cart.reduce((sum, entry) => sum + entry.quantity, 0);
      const itemSummary = cart.map((entry) => `${entry.item.name} x${entry.quantity}`).join(", ");

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemName: itemSummary,
          quantity: totalQty,
          successUrl: `${window.location.origin}/?payment=success`,
          cancelUrl: `${window.location.origin}/?payment=cancelled`,
          customer: {
            email: user.email,
            name: profile?.display_name || user.email?.split("@")[0] || "Student",
          },
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error || payload?.message || `Checkout failed with status ${response.status}`);
      }
      if (!payload?.url) throw new Error("Checkout URL was not returned by the server");

      const bookingRows = cart.map((entry) => ({
        item_id: entry.item.id,
        user_id: user.id,
        quantity: entry.quantity,
      }));

      const { error: bookingError } = await supabase.from("bookings").insert(bookingRows);
      if (bookingError) {
        throw new Error(bookingError.message || "Unable to create booking records");
      }

      clearCart();
      window.location.assign(payload.url);
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

  const handlePreBook = async (item: InventoryItem) => {
    if (!user || item.available_count <= 0) return;
    setBookingId(item.id);

    // Then redirect to Dodo Payments checkout
    try {
      const body = {
        itemName: item.name,
        quantity: 1,
        successUrl: `${window.location.origin}/?payment=success`,
        cancelUrl: `${window.location.origin}/?payment=cancelled`,
        customer: {
          email: user.email,
          name: profile?.display_name || user.email?.split("@")[0] || "Student",
        },
      };

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error || payload?.message || `Checkout failed with status ${response.status}`);
      }

      if (!payload?.url) throw new Error("Checkout URL was not returned by the server");

      // Create booking only after checkout URL is successfully created.
      const { error: bookingError } = await supabase.from("bookings").insert({
        item_id: item.id,
        user_id: user.id,
      });

      if (bookingError) {
        throw new Error(bookingError.message || "Unable to create booking record");
      }

      // Use same-tab redirect to avoid popup blocking issues.
      window.location.assign(payload.url);
    } catch (err: any) {
      toast.error(err?.message || `Unable to open payment checkout for ${item.name}.`);
    }

    setBookingId(null);
  };

  const statusClass = (s: string) =>
    s === "Review" ? "status-chip status-chip-review" :
    s === "Approved" ? "status-chip status-chip-approved" :
    "status-chip status-chip-invested";

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
                      <h3 className="font-serif text-sm sm:text-base leading-snug flex-1">{idea.title}</h3>
                      <span className={statusClass(idea.status)}>{idea.status}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground flex-1 mb-4">{idea.description}</p>
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
            <h1 className="display-lg mb-2">Problem Statements</h1>
            <p className="text-muted-foreground text-sm sm:text-base mb-6 sm:mb-8">Official institutional challenges</p>
            <div className="space-y-3 sm:space-y-4">
              {problemStatements.map((ps, i) => (
                <AnimateInView key={ps.id} delay={i * 100}>
                  <div className="brand-card flex items-start gap-3 sm:gap-4">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 font-serif font-bold text-xs sm:text-sm">
                      {ps.id}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-serif text-sm sm:text-base">{ps.title}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{ps.dept}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground">{ps.description}</p>
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
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {inventory.map((item, i) => (
                <AnimateInView key={item.id} delay={i * 60}>
                  <div className="project-card-surface p-0 overflow-hidden h-full flex flex-col">
                    {item.image_url && (
                      <div className="aspect-[16/10] bg-muted overflow-hidden">
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
                      </div>
                    )}
                    <div className="p-3 sm:p-4 flex flex-col flex-1">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-serif text-sm leading-snug flex-1">{item.name}</h3>
                        <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-secondary text-muted-foreground whitespace-nowrap">{item.category}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-3 mt-auto">
                        <span>Total: {item.total_count}</span>
                        <span className={item.available_count > 0 ? "text-foreground font-medium" : "text-destructive font-medium"}>
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
              {orderHistory.map((order, i) => (
                <AnimateInView key={order.id} delay={i * 50}>
                  <div className="brand-card p-4 sm:p-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      {order.inventory?.image_url && (
                        <img src={order.inventory.image_url} alt={order.inventory.name} className="h-12 w-16 rounded-md object-cover border border-border" />
                      )}
                      <div className="min-w-0">
                        <p className="font-serif text-sm sm:text-base truncate">{order.inventory?.name ?? "Component"}</p>
                        <p className="text-xs text-muted-foreground">Qty: {order.quantity} · {new Date(order.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <span className="status-chip">{order.status}</span>
                  </div>
                </AnimateInView>
              ))}

              {orderHistory.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <History className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p>No orders yet. Add components to cart and checkout.</p>
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
