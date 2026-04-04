import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimateInView from "@/components/AnimateInView";
import { Lightbulb, Package, FileText, Plus, X, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

type Tab = "ideas" | "problems" | "inventory";

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

  const fetchIdeas = async () => {
    const { data } = await supabase
      .from("ideas")
      .select("*, profiles!ideas_author_id_fkey(display_name)")
      .order("created_at", { ascending: false });
    if (data) setIdeas(data as unknown as Idea[]);
  };

  const fetchInventory = async () => {
    const { data } = await supabase.from("inventory").select("*").order("name");
    if (data) setInventory(data);
  };

  useEffect(() => {
    fetchIdeas();
    fetchInventory();
  }, []);

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
      fetchIdeas();
    }
    setLoading(false);
  };

  const handlePreBook = async (item: InventoryItem) => {
    if (!user || item.available_count <= 0) return;
    const { error } = await supabase.from("bookings").insert({
      item_id: item.id,
      user_id: user.id,
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Pre-booked ${item.name}!`);
      fetchInventory();
    }
  };

  const statusClass = (s: string) =>
    s === "Review" ? "status-chip status-chip-review" :
    s === "Approved" ? "status-chip status-chip-approved" :
    "status-chip status-chip-invested";

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "ideas", label: "Idea Hub", icon: <Lightbulb className="h-4 w-4" /> },
    { key: "problems", label: "Problems", icon: <FileText className="h-4 w-4" /> },
    { key: "inventory", label: "Inventory", icon: <Package className="h-4 w-4" /> },
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
                <h1 className="display-lg text-2xl sm:text-[2.5rem]">Idea Hub</h1>
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
            <h1 className="display-lg text-2xl sm:text-[2.5rem] mb-2">Problem Statements</h1>
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
            <div className="flex items-center gap-3 mb-2">
              <ShoppingCart className="h-6 w-6 sm:h-7 sm:w-7" />
              <h1 className="display-lg text-2xl sm:text-[2.5rem]">Component Inventory</h1>
            </div>
            <p className="text-muted-foreground text-sm sm:text-base mb-6 sm:mb-8">Pre-book hardware for your projects</p>
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {inventory.map((item, i) => (
                <AnimateInView key={item.id} delay={i * 60}>
                  <div className="project-card-surface p-4 sm:p-5 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <h3 className="font-serif text-xs sm:text-sm leading-snug flex-1">{item.name}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground whitespace-nowrap">{item.category}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs sm:text-sm mb-4 mt-auto">
                      <span className={item.available_count > 0 ? "text-foreground" : "text-destructive"}>
                        {item.available_count > 0 ? `${item.available_count} / ${item.total_count} Available` : "Booked Out"}
                      </span>
                    </div>
                    <button
                      onClick={() => handlePreBook(item)}
                      disabled={item.available_count <= 0}
                      className={`pill-btn text-xs ${item.available_count <= 0 ? "opacity-40 cursor-not-allowed" : ""}`}
                    >
                      {item.available_count > 0 ? "Pre-book" : "Unavailable"}
                    </button>
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
      </main>

      <Footer />
    </div>
  );
};

export default StudentDashboard;
