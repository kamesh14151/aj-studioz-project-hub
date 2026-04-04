import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import AnimateInView from "@/components/AnimateInView";
import Footer from "@/components/Footer";
import { GraduationCap, Shield } from "lucide-react";

const LandingPage = () => {
  const { login } = useAuth();
  const [mode, setMode] = useState<"choice" | "student" | "admin">("choice");
  const [name, setName] = useState("");

  const handleLogin = (role: "student" | "admin") => {
    if (name.trim()) login(role, name.trim());
  };

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-border bg-card/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center px-6">
          <img src="/AJ.svg" alt="AJ Studioz" className="h-9 w-9" />
          <span className="brand-wordmark text-xl ml-3">aj studioz</span>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center py-20 px-6">
        {mode === "choice" ? (
          <AnimateInView className="text-center max-w-2xl">
            <h1 className="display-xl mb-4">Project Portal</h1>
            <p className="text-muted-foreground text-lg mb-12 max-w-md mx-auto">
              Empowering student innovation through structured project management and institutional backing.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-lg mx-auto">
              <button onClick={() => setMode("student")} className="brand-card flex flex-col items-center gap-4 cursor-pointer group">
                <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <GraduationCap className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="font-serif text-lg mb-1">Student</h3>
                  <p className="text-sm text-muted-foreground">Submit ideas & book components</p>
                </div>
              </button>
              <button onClick={() => setMode("admin")} className="brand-card flex flex-col items-center gap-4 cursor-pointer group">
                <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Shield className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="font-serif text-lg mb-1">Admin</h3>
                  <p className="text-sm text-muted-foreground">Evaluate & invest in projects</p>
                </div>
              </button>
            </div>
          </AnimateInView>
        ) : (
          <AnimateInView className="w-full max-w-sm">
            <div className="brand-card">
              <h2 className="display-md text-center mb-6">
                {mode === "student" ? "Student Login" : "Admin Login"}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Your Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin(mode)}
                    placeholder={mode === "student" ? "e.g. Arjun M." : "e.g. Dr. Sharma"}
                    className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow"
                    autoFocus
                  />
                </div>
                <button onClick={() => handleLogin(mode)} className="pill-btn w-full" disabled={!name.trim()}>
                  Continue as {mode === "student" ? "Student" : "Admin"}
                </button>
                <button onClick={() => { setMode("choice"); setName(""); }} className="text-sm text-muted-foreground hover:text-foreground transition-colors w-full text-center">
                  ← Back
                </button>
              </div>
            </div>
          </AnimateInView>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;
