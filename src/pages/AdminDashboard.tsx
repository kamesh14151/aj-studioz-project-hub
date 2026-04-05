import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimateInView from "@/components/AnimateInView";
import { ClipboardCheck, TrendingUp, ChevronDown, Plus, X } from "lucide-react";
import { toast } from "sonner";

type AdminTab = "evaluate" | "invest" | "inventory";

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

const AdminDashboard = () => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [tab, setTab] = useState<AdminTab>("evaluate");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("");
  const [newItemTotal, setNewItemTotal] = useState("");
  const [newItemImage, setNewItemImage] = useState("");

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

  useEffect(() => {
    fetchIdeas();
    fetchInventory();

    // Real-time subscriptions
    const ideasChannel = supabase
      .channel("admin-ideas-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "ideas" }, () => fetchIdeas())
      .subscribe();

    const inventoryChannel = supabase
      .channel("admin-inventory-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "inventory" }, () => fetchInventory())
      .subscribe();

    const bookingsChannel = supabase
      .channel("admin-bookings-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => fetchInventory())
      .subscribe();

    return () => {
      supabase.removeChannel(ideasChannel);
      supabase.removeChannel(inventoryChannel);
      supabase.removeChannel(bookingsChannel);
    };
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("ideas").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else setOpenDropdown(null);
  };

  const addInventoryItem = async () => {
    if (!newItemName.trim() || !newItemCategory.trim() || !newItemTotal) return;
    const total = parseInt(newItemTotal);
    const { error } = await supabase.from("inventory").insert({
      name: newItemName.trim(),
      category: newItemCategory.trim(),
      total_count: total,
      available_count: total,
      image_url: newItemImage.trim() || null,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Item added!");
      setNewItemName(""); setNewItemCategory(""); setNewItemTotal(""); setNewItemImage("");
      setShowAddItem(false);
    }
  };

  const statusClass = (s: string) =>
    s === "Review" ? "status-chip status-chip-review" :
    s === "Approved" ? "status-chip status-chip-approved" :
    "status-chip status-chip-invested";

  const statuses = ["Review", "Approved", "Invested"];
  const investedIdeas = ideas.filter((i) => i.status === "Invested");
  const reviewCount = ideas.filter((i) => i.status === "Review").length;
  const approvedCount = ideas.filter((i) => i.status === "Approved").length;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar title="Admin Portal">
        <div className="flex gap-1 flex-wrap">
          {([
            { key: "evaluate" as AdminTab, label: "Evaluation", icon: <ClipboardCheck className="h-4 w-4" /> },
            { key: "invest" as AdminTab, label: "Investments", icon: <TrendingUp className="h-4 w-4" /> },
            { key: "inventory" as AdminTab, label: "Inventory", icon: <Plus className="h-4 w-4" /> },
          ]).map((t) => (
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
        {tab === "evaluate" && (
          <AnimateInView>
            <h1 className="display-lg mb-2">Evaluation Center</h1>
            <p className="text-muted-foreground text-sm sm:text-base mb-6">Review all submitted project ideas</p>

            <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
              {[
                { label: "In Review", count: reviewCount, cls: "status-chip-review" },
                { label: "Approved", count: approvedCount, cls: "status-chip-approved" },
                { label: "Invested", count: investedIdeas.length, cls: "status-chip-invested" },
              ].map((s) => (
                <div key={s.label} className="brand-card text-center py-4 sm:py-6">
                  <div className={`status-chip ${s.cls} mx-auto mb-2`}>{s.label}</div>
                  <p className="display-md text-xl sm:text-[1.75rem]">{s.count}</p>
                </div>
              ))}
            </div>

            <div className="hidden sm:block border border-border rounded-lg overflow-hidden">
              <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-secondary text-sm font-medium text-muted-foreground">
                <div className="col-span-4">Project</div>
                <div className="col-span-3">Author</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-3">Status</div>
              </div>
              {ideas.map((idea) => (
                <div key={idea.id} className="grid grid-cols-12 gap-4 px-5 py-4 border-t border-border items-center hover:bg-muted/50 transition-colors">
                  <div className="col-span-4">
                    <h4 className="font-serif text-sm">{idea.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{idea.description}</p>
                  </div>
                  <div className="col-span-3 text-sm">{idea.profiles?.display_name ?? "Unknown"}</div>
                  <div className="col-span-2 text-sm text-muted-foreground">{new Date(idea.created_at).toLocaleDateString()}</div>
                  <div className="col-span-3 relative">
                    <button onClick={() => setOpenDropdown(openDropdown === idea.id ? null : idea.id)}
                      className={`${statusClass(idea.status)} cursor-pointer gap-1`}>
                      {idea.status} <ChevronDown className="h-3 w-3" />
                    </button>
                    {openDropdown === idea.id && (
                      <div className="absolute top-full mt-1 left-0 bg-card border border-border rounded-lg shadow-lg z-10 py-1 min-w-[120px]">
                        {statuses.map((s) => (
                          <button key={s} onClick={() => updateStatus(idea.id, s)}
                            className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted transition-colors">{s}</button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="sm:hidden space-y-3">
              {ideas.map((idea) => (
                <div key={idea.id} className="brand-card">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-serif text-sm flex-1">{idea.title}</h4>
                    <div className="relative">
                      <button onClick={() => setOpenDropdown(openDropdown === idea.id ? null : idea.id)}
                        className={`${statusClass(idea.status)} cursor-pointer gap-1 text-[10px]`}>
                        {idea.status} <ChevronDown className="h-3 w-3" />
                      </button>
                      {openDropdown === idea.id && (
                        <div className="absolute top-full mt-1 right-0 bg-card border border-border rounded-lg shadow-lg z-10 py-1 min-w-[100px]">
                          {statuses.map((s) => (
                            <button key={s} onClick={() => updateStatus(idea.id, s)}
                              className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted transition-colors">{s}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{idea.description}</p>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{idea.profiles?.display_name ?? "Unknown"}</span>
                    <span>{new Date(idea.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>

            {ideas.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <ClipboardCheck className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p>No ideas submitted yet.</p>
              </div>
            )}
          </AnimateInView>
        )}

        {tab === "invest" && (
          <AnimateInView>
            <h1 className="display-lg mb-2">Investment Portfolio</h1>
            <p className="text-muted-foreground text-sm sm:text-base mb-6 sm:mb-8">Projects selected for institutional backing</p>
            {investedIdeas.length === 0 ? (
              <div className="brand-card text-center py-12">
                <TrendingUp className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No projects marked for investment yet.</p>
                <p className="text-sm text-muted-foreground mt-1">Use the Evaluation Center to mark projects as "Invested".</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2">
                {investedIdeas.map((idea, i) => (
                  <AnimateInView key={idea.id} delay={i * 100}>
                    <div className="brand-card border-2">
                      <div className="flex items-start justify-between mb-3">
                        <span className={statusClass(idea.status)}>{idea.status}</span>
                        <span className="text-xs text-muted-foreground">{new Date(idea.created_at).toLocaleDateString()}</span>
                      </div>
                      <h3 className="font-serif text-base sm:text-lg mb-2">{idea.title}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-3">{idea.description}</p>
                      <p className="text-xs sm:text-sm font-medium">Submitted by {idea.profiles?.display_name ?? "Unknown"}</p>
                    </div>
                  </AnimateInView>
                ))}
              </div>
            )}
          </AnimateInView>
        )}

        {tab === "inventory" && (
          <AnimateInView>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
              <div>
                <h1 className="display-lg">Manage Inventory</h1>
                <p className="text-muted-foreground text-sm sm:text-base mt-1">Add and manage college components</p>
              </div>
              <button onClick={() => setShowAddItem(true)} className="pill-btn gap-2 self-start">
                <Plus className="h-4 w-4" /> Add Item
              </button>
            </div>

            {showAddItem && (
              <div className="brand-card mb-6 relative">
                <button onClick={() => setShowAddItem(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
                <h3 className="font-serif text-lg mb-4">Add Inventory Item</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input type="text" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="Item name"
                    className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
                  <input type="text" value={newItemCategory} onChange={(e) => setNewItemCategory(e.target.value)} placeholder="Category"
                    className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
                  <input type="number" value={newItemTotal} onChange={(e) => setNewItemTotal(e.target.value)} placeholder="Quantity"
                    className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
                  <input type="url" value={newItemImage} onChange={(e) => setNewItemImage(e.target.value)} placeholder="Image URL (optional)"
                    className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <button onClick={addInventoryItem} className="pill-btn mt-3"
                  disabled={!newItemName.trim() || !newItemCategory.trim() || !newItemTotal}>
                  Add Item
                </button>
              </div>
            )}

            <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {inventory.map((item, i) => (
                <AnimateInView key={item.id} delay={i * 60}>
                  <div className="brand-card p-0 overflow-hidden">
                    {item.image_url && (
                      <div className="aspect-[4/3] bg-muted overflow-hidden">
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="p-4 sm:p-5">
                      <div className="flex items-start justify-between mb-2 gap-2">
                        <h3 className="font-serif text-sm sm:text-base flex-1">{item.name}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground whitespace-nowrap">{item.category}</span>
                      </div>
                      <div className="text-xs sm:text-sm mt-2">
                        <span className={item.available_count > 0 ? "text-foreground font-medium" : "text-destructive font-medium"}>
                          {item.available_count} / {item.total_count} Available
                        </span>
                      </div>
                    </div>
                  </div>
                </AnimateInView>
              ))}
            </div>

            {inventory.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p>No inventory items yet. Add your first one above.</p>
              </div>
            )}
          </AnimateInView>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
