import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { apiFetch } from "../utils/api";

interface User {
  id: string;
  email: string | null;
  name: string | null;
  profile_image: string | null;
  created_at: string;
  visit_records_count: number;
  wishlist_count: number;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  loading: boolean;
  loginWithKakao: () => Promise<void>;
  logout: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      console.log("[Auth] Fetching current user from /me...");
      const data = await apiFetch("/me");
      console.log("[Auth] User fetched successfully:", data);
      setUser(data);
      setIsLoggedIn(true);
    } catch (error: any) {
      // For any error (401, network error, etc.), treat user as not logged in
      console.log("[Auth] Failed to fetch user:", error.message, "Status:", error.status);
      setUser(null);
      setIsLoggedIn(false);
    }
  };

  const loginWithKakao = async () => {
    try {
      const data = await apiFetch("/auth/kakao/login");
      if (data.authorize_url) {
        window.location.href = data.authorize_url;
      }
    } catch (error) {
      console.error("Failed to initiate Kakao login:", error);
    }
  };

  const logout = async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
      setIsLoggedIn(false);
      setUser(null);
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      console.log("[Auth] Checking authentication on mount...");
      setLoading(true);
      await fetchCurrentUser();
      setLoading(false);
      console.log("[Auth] Auth check complete. isLoggedIn:", isLoggedIn);
    };
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        loading,
        loginWithKakao,
        logout,
        fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
