import { useAuth } from "@/context/AuthContext";
import LandingPage from "./LandingPage";
import StudentDashboard from "./StudentDashboard";
import AdminDashboard from "./AdminDashboard";

const Index = () => {
  const { role } = useAuth();

  if (role === "student") return <StudentDashboard />;
  if (role === "admin") return <AdminDashboard />;
  return <LandingPage />;
};

export default Index;
