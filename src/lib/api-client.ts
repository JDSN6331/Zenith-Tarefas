/**
 * Cliente HTTP para comunicação do Frontend com a API do Zenith.
 */
import type { AppData } from "./types";

const TOKEN_KEY = "zenith.auth.token";

export interface UserProfile {
  id: string;
  name: string;
  login: string;
  role: "admin" | "user";
  status: "active" | "inactive";
  avatarUrl?: string | null;
  createdAt: string;
}

export interface AdminUserItem {
  id: string;
  name: string;
  login: string;
  role: "admin" | "user";
  status: "active" | "inactive";
  avatarUrl?: string | null;
  createdAt: string;
  tasksCount: number;
  goalsCount: number;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalTasks: number;
  totalGoals: number;
  dbMode: string;
  lgpdCompliant: boolean;
}

export interface AuthResponse {
  ok: boolean;
  user?: UserProfile;
  token?: string;
  error?: string;
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) {
    window.localStorage.setItem(TOKEN_KEY, token);
  } else {
    window.localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ ok: boolean; data?: T; error?: string; user?: UserProfile; token?: string; users?: AdminUserItem[]; stats?: AdminStats }> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(endpoint, {
      ...options,
      headers,
    });

    const body = await res.json().catch(() => ({ ok: false, error: "Resposta inválida" }));

    if (!res.ok || !body.ok) {
      return {
        ok: false,
        error: body.error || `Erro HTTP ${res.status}`,
      };
    }

    return body;
  } catch (err: any) {
    return {
      ok: false,
      error: err.message || "Não foi possível conectar ao servidor.",
    };
  }
}

export const apiClient = {
  async register(params: { name: string; login: string; password: string }) {
    const res = await request<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(params),
    });
    if (res.ok && res.token) {
      setStoredToken(res.token);
    }
    return res;
  },

  async login(params: { login: string; password: string }) {
    const res = await request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(params),
    });
    if (res.ok && res.token) {
      setStoredToken(res.token);
    }
    return res;
  },

  async me(): Promise<UserProfile | null> {
    const res = await request<{ ok: boolean; user: UserProfile }>("/api/auth/me", {
      method: "GET",
    });
    if (res.ok && res.user) {
      return res.user;
    }
    return null;
  },

  async logout(): Promise<void> {
    await request("/api/auth/logout", { method: "POST" });
    setStoredToken(null);
  },

  async fetchData(): Promise<AppData | null> {
    const res = await request<{ ok: boolean; data: AppData }>("/api/data", {
      method: "GET",
    });
    if (res.ok && res.data) {
      return res.data;
    }
    return null;
  },

  async syncData(data: AppData): Promise<boolean> {
    const res = await request("/api/sync", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res.ok;
  },

  async updateAvatar(avatarUrl: string | null): Promise<boolean> {
    const res = await request("/api/user/avatar", {
      method: "POST",
      body: JSON.stringify({ avatarUrl }),
    });
    return res.ok;
  },

  // Métodos Administrativos (LGPD Compliant)
  async getAdminUsers(): Promise<AdminUserItem[]> {
    const res = await request<{ ok: boolean; users: AdminUserItem[] }>("/api/admin/users", {
      method: "GET",
    });
    return res.users || [];
  },

  async toggleUserStatus(userId: string, status: "active" | "inactive"): Promise<boolean> {
    const res = await request("/api/admin/users/toggle-status", {
      method: "POST",
      body: JSON.stringify({ userId, status }),
    });
    return res.ok;
  },

  async getAdminStats(): Promise<AdminStats | null> {
    const res = await request<{ ok: boolean; stats: AdminStats }>("/api/admin/stats", {
      method: "GET",
    });
    return res.stats || null;
  },
};
