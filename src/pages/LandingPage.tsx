import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AnimateInView from "@/components/AnimateInView";
import Footer from "@/components/Footer";
import { GraduationCap, Shield, Mail } from "lucide-react";
import { toast } from "sonner";

const LandingPage = () => {
  const [mode, setMode] = useState<"choice" | "login" | "signup">("choice");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async () => {
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) toast.error(error.message);
    setLoading(false);
  };

  const handleEmailSignup = async () => {
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) toast.error(error.message);
    else toast.success("Account created! Check your email to verify.");
    setLoading(false);
    if (!error) setMode("login");
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) toast.error("Google sign-in failed");
  };

  const handleMicrosoftLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "azure",
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) toast.error("Microsoft sign-in failed");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <nav className="border-b border-border bg-card/80 backdrop-blur-md">
        <div className="container mx-auto flex h-14 sm:h-16 items-center px-4 sm:px-6 gap-3">
          <img src="https://www.sonatech.ac.in/images/logo.png" alt="Sona College" className="h-9 w-9 sm:h-10 sm:w-10 object-contain" />
          <div className="flex flex-col">
            <span className="font-serif text-sm sm:text-base font-bold leading-tight">Sona College of Technology</span>
            <span className="text-[10px] sm:text-xs text-muted-foreground leading-tight">An Autonomous Institution</span>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center py-10 sm:py-20 px-4 sm:px-6">
        {mode === "choice" ? (
          <AnimateInView className="text-center max-w-2xl w-full">
            <img src="https://www.sonatech.ac.in/images/logo.png" alt="Sona College" className="h-20 w-20 sm:h-24 sm:w-24 mx-auto mb-6 object-contain" />
            <h1 className="display-xl text-3xl sm:text-4xl md:text-[3.75rem] mb-4">Project Portal</h1>
            <p className="text-muted-foreground text-base sm:text-lg mb-8 sm:mb-12 max-w-md mx-auto">
              Empowering student innovation through structured project management and institutional backing.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-lg mx-auto mb-8">
              <button onClick={() => setMode("login")} className="brand-card flex flex-col items-center gap-3 sm:gap-4 cursor-pointer group">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <GraduationCap className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                <div>
                  <h3 className="font-serif text-base sm:text-lg mb-1">Sign In</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">Access your dashboard</p>
                </div>
              </button>
              <button onClick={() => setMode("signup")} className="brand-card flex flex-col items-center gap-3 sm:gap-4 cursor-pointer group">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Shield className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                <div>
                  <h3 className="font-serif text-base sm:text-lg mb-1">Create Account</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">Join the project portal</p>
                </div>
              </button>
            </div>
          </AnimateInView>
        ) : (
          <AnimateInView className="w-full max-w-4xl">
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
              <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 -left-12 h-56 w-56 rounded-full bg-secondary/70 blur-3xl" />

              <div className="grid md:grid-cols-[1.05fr_0.95fr]">
                <div className="relative z-10 p-6 sm:p-8 md:p-10 bg-secondary/50">
                  <div className="flex items-center gap-3 mb-6">
                    <img src="https://www.sonatech.ac.in/images/logo.png" alt="Sona College" className="h-10 w-10 object-contain" />
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Sona Project Portal</p>
                      <h2 className="display-md text-2xl sm:text-[2rem]">
                        {mode === "login" ? "Welcome Back" : "Create Account"}
                      </h2>
                    </div>
                  </div>

                  <p className="body text-muted-foreground mb-6">
                    {mode === "login"
                      ? "Pick up where you left off. Track milestones, approvals, and submissions in one space."
                      : "Join the portal to pitch, build, and launch campus-led innovation with full support."}
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-8">
                    <div className="project-card-surface rounded-xl p-4">
                      <p className="text-xs text-muted-foreground">Active Projects</p>
                      <p className="text-xl font-semibold">240+</p>
                    </div>
                    <div className="project-card-surface rounded-xl p-4">
                      <p className="text-xs text-muted-foreground">Mentors</p>
                      <p className="text-xl font-semibold">120+</p>
                    </div>
                    <div className="project-card-surface rounded-xl p-4">
                      <p className="text-xs text-muted-foreground">Approval SLAs</p>
                      <p className="text-xl font-semibold">48 hrs</p>
                    </div>
                    <div className="project-card-surface rounded-xl p-4">
                      <p className="text-xs text-muted-foreground">Funding Tracks</p>
                      <p className="text-xl font-semibold">6+</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="rounded-full border border-border px-3 py-1">Secure approvals</span>
                    <span className="rounded-full border border-border px-3 py-1">Team workspaces</span>
                    <span className="rounded-full border border-border px-3 py-1">Milestone tracking</span>
                  </div>
                </div>

                <div className="relative z-10 p-6 sm:p-8 md:p-10">
                  <div className="grid sm:grid-cols-2 gap-3 mb-6">
                    <button onClick={handleGoogleLogin} className="pill-btn-outline w-full gap-2 text-sm">
                      <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                      Google
                    </button>
                    <button onClick={handleMicrosoftLogin} className="pill-btn-outline w-full gap-2 text-sm">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="2" y="2" width="9" height="9" />
                        <rect x="13" y="2" width="9" height="9" />
                        <rect x="2" y="13" width="9" height="9" />
                        <rect x="13" y="13" width="9" height="9" />
                      </svg>
                      Microsoft
                    </button>
                  </div>

                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground">or sign in with email</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@sonatech.ac.in"
                        className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Password</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (mode === "login" ? handleEmailLogin() : handleEmailSignup())}
                        placeholder="••••••••"
                        className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow"
                      />
                    </div>
                    <button
                      onClick={mode === "login" ? handleEmailLogin : handleEmailSignup}
                      className="pill-btn w-full gap-2"
                      disabled={loading || !email.trim() || !password.trim()}
                    >
                      <Mail className="h-4 w-4" />
                      {loading ? "Loading..." : mode === "login" ? "Sign In" : "Create Account"}
                    </button>
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                      <button
                        onClick={() => setMode(mode === "login" ? "signup" : "login")}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {mode === "login" ? "Create account" : "Already have an account?"}
                      </button>
                      <button
                        onClick={() => { setMode("choice"); setEmail(""); setPassword(""); }}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Back to options
                      </button>
                    </div>
                  </div>
                </div>
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
