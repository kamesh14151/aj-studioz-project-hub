import { useAuth } from "@/context/AuthContext";
import { LogOut, Menu, X, Settings } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface NavbarProps {
  title?: string;
  children?: React.ReactNode;
}

const Navbar = ({ title, children }: NavbarProps) => {
  const { profile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 border-b border-primary/30 bg-primary text-primary-foreground shadow-lg">
      <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <img src="https://www.sonatech.ac.in/images/logo.png" alt="Sona College" className="h-8 w-8 sm:h-9 sm:w-9 object-contain" />
          {title && <span className="font-serif text-sm sm:text-lg tracking-wide">{title}</span>}
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-3">
          {children}
          {profile && (
            <div className="flex items-center gap-3 ml-4">
              {profile.avatar_url && (
                <img src={profile.avatar_url} alt="" className="h-7 w-7 rounded-full object-cover" />
              )}
              <span className="text-sm text-primary-foreground/85">{profile.display_name}</span>
              <button onClick={() => navigate("/profile")} className="p-2 rounded-full hover:bg-primary-foreground/10 transition-colors" title="Profile Settings">
                <Settings className="h-4 w-4 text-primary-foreground/80" />
              </button>
              <button onClick={signOut} className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground hover:opacity-90 transition-opacity">
                <LogOut className="h-3.5 w-3.5" /> Logout
              </button>
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
        <div className="md:hidden border-t border-primary-foreground/20 bg-primary px-4 py-3 space-y-3">
          <div className="flex flex-wrap gap-2">{children}</div>
          {profile && (
            <div className="flex items-center justify-between pt-2 border-t border-primary-foreground/20">
              <div className="flex items-center gap-2">
                {profile.avatar_url && <img src={profile.avatar_url} alt="" className="h-6 w-6 rounded-full object-cover" />}
                <span className="text-sm">{profile.display_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { navigate("/profile"); setMobileMenuOpen(false); }} className="p-2 rounded-full hover:bg-primary-foreground/10 transition-colors">
                  <Settings className="h-4 w-4" />
                </button>
                <button onClick={signOut} className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground hover:opacity-90 transition-opacity">
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
