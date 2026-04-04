import { useState } from "react";
import { useData, type Idea } from "@/context/DataContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimateInView from "@/components/AnimateInView";
import { ClipboardCheck, TrendingUp, ChevronDown } from "lucide-react";

type AdminTab = "evaluate" | "invest";

const AdminDashboard = () => {
  const { ideas, updateIdeaStatus } = useData();
  const [tab, setTab] = useState<AdminTab>("evaluate");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const statusClass = (s: Idea["status"]) =>
    s === "Review" ? "status-chip status-chip-review" :
    s === "Approved" ? "status-chip status-chip-approved" :
    "status-chip status-chip-invested";

  const statuses: Idea["status"][] = ["Review", "Approved", "Invested"];

  const investedIdeas = ideas.filter((i) => i.status === "Invested");
  const reviewCount = ideas.filter((i) => i.status === "Review").length;
  const approvedCount = ideas.filter((i) => i.status === "Approved").length;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar title="Admin Portal">
        <div className="flex gap-1">
          {([
            { key: "evaluate" as AdminTab, label: "Evaluation Center", icon: <ClipboardCheck className="h-4 w-4" /> },
            { key: "invest" as AdminTab, label: "Investments", icon: <TrendingUp className="h-4 w-4" /> },
          ]).map((t) => (
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
        {tab === "evaluate" && (
          <AnimateInView>
            <h1 className="display-lg mb-2">Evaluation Center</h1>
            <p className="text-muted-foreground mb-6">Review and manage all submitted project ideas</p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: "In Review", count: reviewCount, cls: "status-chip-review" },
                { label: "Approved", count: approvedCount, cls: "status-chip-approved" },
                { label: "Invested", count: investedIdeas.length, cls: "status-chip-invested" },
              ].map((s) => (
                <div key={s.label} className="brand-card text-center">
                  <div className={`status-chip ${s.cls} mx-auto mb-2`}>{s.label}</div>
                  <p className="display-md">{s.count}</p>
                </div>
              ))}
            </div>

            <div className="border border-border rounded-lg overflow-hidden">
              <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-secondary text-sm font-medium text-muted-foreground">
                <div className="col-span-4">Project</div>
                <div className="col-span-3">Author</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-3">Status</div>
              </div>
              {ideas.map((idea, i) => (
                <AnimateInView key={idea.id} delay={i * 50}>
                  <div className="grid grid-cols-12 gap-4 px-5 py-4 border-t border-border items-center hover:bg-muted/50 transition-colors">
                    <div className="col-span-4">
                      <h4 className="font-serif text-sm">{idea.title}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{idea.description}</p>
                    </div>
                    <div className="col-span-3 text-sm">{idea.author}</div>
                    <div className="col-span-2 text-sm text-muted-foreground">{idea.createdAt}</div>
                    <div className="col-span-3 relative">
                      <button
                        onClick={() => setOpenDropdown(openDropdown === idea.id ? null : idea.id)}
                        className={`${statusClass(idea.status)} cursor-pointer gap-1`}
                      >
                        {idea.status}
                        <ChevronDown className="h-3 w-3" />
                      </button>
                      {openDropdown === idea.id && (
                        <div className="absolute top-full mt-1 left-0 bg-card border border-border rounded-lg shadow-lg z-10 py-1 min-w-[120px]">
                          {statuses.map((s) => (
                            <button
                              key={s}
                              onClick={() => { updateIdeaStatus(idea.id, s); setOpenDropdown(null); }}
                              className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted transition-colors"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </AnimateInView>
              ))}
            </div>
          </AnimateInView>
        )}

        {tab === "invest" && (
          <AnimateInView>
            <h1 className="display-lg mb-2">Investment Portfolio</h1>
            <p className="text-muted-foreground mb-8">
              Projects selected for institutional backing and resource allocation
            </p>

            {investedIdeas.length === 0 ? (
              <div className="brand-card text-center py-12">
                <TrendingUp className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No projects have been marked for investment yet.</p>
                <p className="text-sm text-muted-foreground mt-1">Use the Evaluation Center to mark projects as "Invested".</p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                {investedIdeas.map((idea, i) => (
                  <AnimateInView key={idea.id} delay={i * 100}>
                    <div className="brand-card border-2">
                      <div className="flex items-start justify-between mb-3">
                        <span className={statusClass(idea.status)}>{idea.status}</span>
                        <span className="text-xs text-muted-foreground">{idea.createdAt}</span>
                      </div>
                      <h3 className="font-serif text-lg mb-2">{idea.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{idea.description}</p>
                      <p className="text-sm font-medium">Submitted by {idea.author}</p>
                    </div>
                  </AnimateInView>
                ))}
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
