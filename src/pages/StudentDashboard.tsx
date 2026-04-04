import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useData, type Idea } from "@/context/DataContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimateInView from "@/components/AnimateInView";
import { Lightbulb, Package, FileText, Plus, X, ShoppingCart } from "lucide-react";

type Tab = "ideas" | "problems" | "inventory";

const problemStatements = [
  { id: 1, title: "Waste Segregation Automation", dept: "ECE", description: "Design a sensor-based system for automated waste classification in campus bins." },
  { id: 2, title: "Smart Irrigation for Campus Garden", dept: "EEE", description: "Develop a moisture-sensing automated irrigation system for the botanical garden." },
  { id: 3, title: "Library Seat Availability Tracker", dept: "CSE", description: "Build an IoT system to display real-time seating availability in the library." },
  { id: 4, title: "Emergency SOS Beacon", dept: "ECE", description: "Create a wearable panic button that alerts campus security with GPS coordinates." },
];

const StudentDashboard = () => {
  const { userName } = useAuth();
  const { ideas, addIdea, inventory, preBook } = useData();
  const [tab, setTab] = useState<Tab>("ideas");
  const [showNewIdea, setShowNewIdea] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const handleSubmitIdea = () => {
    if (newTitle.trim() && newDesc.trim()) {
      addIdea({ title: newTitle.trim(), description: newDesc.trim(), author: userName });
      setNewTitle("");
      setNewDesc("");
      setShowNewIdea(false);
    }
  };

  const statusClass = (s: Idea["status"]) =>
    s === "Review" ? "status-chip status-chip-review" :
    s === "Approved" ? "status-chip status-chip-approved" :
    "status-chip status-chip-invested";

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "ideas", label: "Idea Hub", icon: <Lightbulb className="h-4 w-4" /> },
    { key: "problems", label: "Problem Statements", icon: <FileText className="h-4 w-4" /> },
    { key: "inventory", label: "Inventory", icon: <Package className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar title="Student Portal">
        <div className="flex gap-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
                tab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.icon}
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>
      </Navbar>

      <main className="flex-1 container mx-auto px-6 py-10">
        {tab === "ideas" && (
          <AnimateInView>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="display-lg">Idea Hub</h1>
                <p className="text-muted-foreground mt-1">Share your project ideas with the community</p>
              </div>
              <button onClick={() => setShowNewIdea(true)} className="pill-btn gap-2">
                <Plus className="h-4 w-4" /> New Idea
              </button>
            </div>

            {showNewIdea && (
              <div className="brand-card mb-8 relative">
                <button onClick={() => setShowNewIdea(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
                <h3 className="font-serif text-lg mb-4">Submit Your Idea</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Project title"
                    className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                  <textarea
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Describe your idea..."
                    rows={3}
                    className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                  <button onClick={handleSubmitIdea} className="pill-btn" disabled={!newTitle.trim() || !newDesc.trim()}>
                    Submit
                  </button>
                </div>
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {ideas.map((idea, i) => (
                <AnimateInView key={idea.id} delay={i * 80}>
                  <div className="brand-card h-full flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-serif text-base leading-snug flex-1 mr-2">{idea.title}</h3>
                      <span className={statusClass(idea.status)}>{idea.status}</span>
                    </div>
                    <p className="text-sm text-muted-foreground flex-1 mb-4">{idea.description}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{idea.author}</span>
                      <span>{idea.createdAt}</span>
                    </div>
                  </div>
                </AnimateInView>
              ))}
            </div>
          </AnimateInView>
        )}

        {tab === "problems" && (
          <AnimateInView>
            <h1 className="display-lg mb-2">Problem Statements</h1>
            <p className="text-muted-foreground mb-8">Official institutional challenges for your projects</p>
            <div className="space-y-4">
              {problemStatements.map((ps, i) => (
                <AnimateInView key={ps.id} delay={i * 100}>
                  <div className="brand-card flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 font-serif font-bold text-sm">
                      {ps.id}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-serif text-base">{ps.title}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{ps.dept}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{ps.description}</p>
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
              <ShoppingCart className="h-7 w-7" />
              <h1 className="display-lg">Component Inventory</h1>
            </div>
            <p className="text-muted-foreground mb-8">Pre-book hardware for your projects</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {inventory.map((item, i) => (
                <AnimateInView key={item.id} delay={i * 60}>
                  <div className="project-card-surface p-5 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-serif text-sm leading-snug flex-1 mr-2">{item.name}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{item.category}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm mb-4 mt-auto">
                      <span className={item.available > 0 ? "text-foreground" : "text-destructive"}>
                        {item.available > 0 ? `${item.available} / ${item.total} Available` : "Booked Out"}
                      </span>
                    </div>
                    <button
                      onClick={() => preBook(item.id, userName)}
                      disabled={item.available <= 0}
                      className={`pill-btn text-xs ${item.available <= 0 ? "opacity-40 cursor-not-allowed" : ""}`}
                    >
                      {item.available > 0 ? "Pre-book" : "Unavailable"}
                    </button>
                  </div>
                </AnimateInView>
              ))}
            </div>
          </AnimateInView>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default StudentDashboard;
