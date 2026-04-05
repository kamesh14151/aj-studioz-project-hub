import { useAuth } from "@/context/AuthContext";
import { LogOut, Menu, X, ChevronDown, Settings } from "lucide-react";
import { useState } from "react";

interface NavbarProps {
  title?: string;
  children?: React.ReactNode;
}

const Navbar = ({ title, children }: NavbarProps) => {
  const { profile, user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <img src="https://www.sonatech.ac.in/images/logo.png" alt="Sona College" className="h-8 w-8 sm:h-9 sm:w-9 object-contain" />
          {title && <span className="font-serif text-sm sm:text-lg">{title}</span>}
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-3">
          {children}
          {profile && (
            <div className="relative ml-4">
              <button
                onClick={() => setProfileMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 hover:bg-muted/60 transition-colors"
              >
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="h-7 w-7 rounded-full object-cover" />
                ) : (
                  <div className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold">
                    {(profile.display_name || user?.email || "U").slice(0, 1).toUpperCase()}
                  </div>
                )}
                <span className="text-sm text-muted-foreground max-w-[140px] truncate">
                  {profile.display_name || user?.email}
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-lg border border-border bg-card shadow-lg p-3 z-50">
                  <div className="pb-3 border-b border-border">
                    <p className="text-sm font-medium">{profile.display_name || "Student"}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  <div className="py-3 space-y-1 text-xs text-muted-foreground">
                    <p>Department: {profile.department || "Not set"}</p>
                    <p>Role: {profile.role}</p>
                  </div>
                  <div className="pt-2 border-t border-border flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Settings className="h-3.5 w-3.5" /> Profile
                    </span>
                    <button onClick={signOut} className="pill-btn-outline text-xs gap-1.5 px-3 py-1.5">
                      <LogOut className="h-3.5 w-3.5" /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 py-3 space-y-3">
          <div className="flex flex-wrap gap-2">{children}</div>
          {profile && (
            <div className="pt-2 border-t border-border space-y-2">
              <div className="flex items-center gap-2">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="h-6 w-6 rounded-full object-cover" />
                ) : (
                  <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-semibold">
                    {(profile.display_name || user?.email || "U").slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-sm">{profile.display_name || "Student"}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Department: {profile.department || "Not set"}</span>
                <span className="capitalize">{profile.role}</span>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button onClick={signOut} className="pill-btn-outline text-xs gap-1.5 px-3 py-1.5">
                  <LogOut className="h-3.5 w-3.5" /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
