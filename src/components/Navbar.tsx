import { useAuth } from "@/context/AuthContext";
import { LogOut } from "lucide-react";

interface NavbarProps {
  title?: string;
  children?: React.ReactNode;
}

const Navbar = ({ title, children }: NavbarProps) => {
  const { role, userName, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <img src="/AJ.svg" alt="AJ Studioz" className="h-9 w-9" />
          {title && <span className="display-md text-lg font-serif">{title}</span>}
        </div>
        <div className="flex items-center gap-3">
          {children}
          {role && (
            <div className="flex items-center gap-3 ml-4">
              <span className="text-sm text-muted-foreground">{userName}</span>
              <button onClick={logout} className="pill-btn-outline text-xs gap-1.5 px-3 py-1.5">
                <LogOut className="h-3.5 w-3.5" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
