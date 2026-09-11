/**
 * Contexto de Autenticação React do Zenith.
 * Gerencia ciclo de vida da sessão, login, cadastro e logout do usuário.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  apiClient,
  getStoredToken,
  setStoredToken,
  type TaskFilterPreferences,
  type UserProfile,
} from "./api-client";

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (params: { login: string; password: string }) => Promise<{ ok: boolean; error?: string }>;
  register: (params: {
    name: string;
    login: string;
    password: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateAvatar: (avatarUrl: string | null) => Promise<boolean>;
  updateUserPreferences: (prefs: {
    themeMode?: "light" | "dark";
    themePalette?: any;
    taskFilters?: TaskFilterPreferences;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Valida a sessão ao carregar a aplicação
  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      const token = getStoredToken();
      if (!token) {
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const profile = await apiClient.me();
        if (isMounted) {
          if (profile) {
            setUser(profile);
          } else {
            setUser(null);
            setStoredToken(null);
          }
        }
      } catch {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    checkSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (params: { login: string; password: string }) => {
    setIsLoading(true);
    try {
      const res = await apiClient.login(params);
      if (res.ok && res.user) {
        setUser(res.user);
        return { ok: true };
      }
      return { ok: false, error: res.error || "Falha ao realizar login." };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(
    async (params: { name: string; login: string; password: string }) => {
      setIsLoading(true);
      try {
        const res = await apiClient.register(params);
        if (res.ok && res.user) {
          setUser(res.user);
          return { ok: true };
        }
        return { ok: false, error: res.error || "Falha ao criar conta." };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await apiClient.logout();
    } catch {
      setStoredToken(null);
    } finally {
      setUser(null);
    }
  }, []);

  const updateAvatar = useCallback(async (avatarUrl: string | null) => {
    const ok = await apiClient.updateAvatar(avatarUrl);
    if (ok) {
      setUser((prev) => (prev ? { ...prev, avatarUrl } : null));
    }
    return ok;
  }, []);

  const updateUserPreferences = useCallback(
    async (prefs: {
      themeMode?: "light" | "dark";
      themePalette?: any;
      taskFilters?: TaskFilterPreferences;
    }) => {
      setUser((prev) => (prev ? { ...prev, ...prefs } : null));
      try {
        await apiClient.updatePreferences(prefs);
      } catch (err) {
        console.error("Erro ao sincronizar preferências do usuário:", err);
      }
    },
    []
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateAvatar,
        updateUserPreferences,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve ser utilizado dentro de <AuthProvider>");
  }
  return ctx;
}
