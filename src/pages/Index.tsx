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
          <img src="/AJ.svg" alt="AJ Studioz" className="h-12 w-12 mx-auto mb-4 animate-pulse" />
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
