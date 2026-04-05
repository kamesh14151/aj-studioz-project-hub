import { useAuth } from "@/context/AuthContext";
import LandingPage from "./LandingPage";
import StudentDashboard from "./StudentDashboard";
import AdminDashboard from "./AdminDashboard";

const Index = () => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <img src="https://www.sonatech.ac.in/images/logo.png" alt="Sona College" className="h-14 w-14 mx-auto mb-4 animate-pulse object-contain" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <LandingPage />;
  if (isAdmin) return <AdminDashboard />;
  return <StudentDashboard />;
};

export default Index;
