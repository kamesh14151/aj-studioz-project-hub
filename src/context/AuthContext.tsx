import { createContext, useContext, useState, ReactNode } from "react";

type Role = "student" | "admin" | null;

interface AuthContextType {
  role: Role;
  userName: string;
  login: (role: Role, name: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  role: null,
  userName: "",
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<Role>(null);
  const [userName, setUserName] = useState("");

  const login = (r: Role, name: string) => {
    setRole(r);
    setUserName(name);
  };

  const logout = () => {
    setRole(null);
    setUserName("");
  };

  return (
    <AuthContext.Provider value={{ role, userName, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
