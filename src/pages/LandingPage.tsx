import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
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
    else toast.success("Account created! You can now sign in.");
    setLoading(false);
    if (!error) setMode("login");
  };

  const handleGoogleLogin = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) toast.error("Google sign-in failed");
    if (result.redirected) return;
  };

  const handleAppleLogin = async () => {
    const result = await lovable.auth.signInWithOAuth("apple", {
      redirect_uri: window.location.origin,
    });
    if (result.error) toast.error("Apple sign-in failed");
    if (result.redirected) return;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-border bg-card/80 backdrop-blur-md">
        <div className="container mx-auto flex h-14 sm:h-16 items-center px-4 sm:px-6">
          <img src="/AJ.svg" alt="AJ Studioz" className="h-8 w-8 sm:h-9 sm:w-9" />
          <span className="brand-wordmark text-lg sm:text-xl ml-3">aj studioz</span>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center py-10 sm:py-20 px-4 sm:px-6">
        {mode === "choice" ? (
          <AnimateInView className="text-center max-w-2xl w-full">
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
          <AnimateInView className="w-full max-w-sm">
            <div className="brand-card">
              <h2 className="display-md text-xl sm:text-[1.75rem] text-center mb-6">
                {mode === "login" ? "Welcome Back" : "Create Account"}
              </h2>

              {/* OAuth buttons */}
              <div className="space-y-3 mb-6">
                <button onClick={handleGoogleLogin} className="pill-btn-outline w-full gap-2 text-sm">
                  <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  Continue with Google
                </button>
                <button onClick={handleAppleLogin} className="pill-btn-outline w-full gap-2 text-sm">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                  Continue with Apple
                </button>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">or with email</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@college.edu"
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
                <div className="flex justify-between text-xs">
                  <button
                    onClick={() => { setMode(mode === "login" ? "signup" : "login"); }}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {mode === "login" ? "Create account" : "Already have an account?"}
                  </button>
                  <button
                    onClick={() => { setMode("choice"); setEmail(""); setPassword(""); }}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ← Back
                  </button>
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
