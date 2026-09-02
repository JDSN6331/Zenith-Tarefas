/**
 * Sistema de Autenticação e Gestão de Sessões do Zenith.
 * Suporta Primeiro Usuário como Administrador (Admin) e regras LGPD.
 */
import crypto from "node:crypto";
import { getDbPool, memoryStore, query, withTransaction } from "./database";
import { DEFAULT_CATEGORIES } from "../types";

export interface SafeUser {
  id: string;
  name: string;
  login: string;
  role: "admin" | "user";
  status: "active" | "inactive";
  avatarUrl?: string | null;
  createdAt: string;
}

export interface AuthResult {
  user: SafeUser;
  token: string;
}

/**
 * Gera hash seguro para senha utilizando salt aleatório e Scrypt
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

/**
 * Verifica se a senha fornecida corresponde ao hash armazenado
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, key] = storedHash.split(":");
    if (!salt || !key) return false;
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(Buffer.from(key, "hex"), derivedKey);
  } catch {
    return false;
  }
}

/**
 * Cria token de sessão seguro com validade de 30 dias
 */
export async function createSession(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const createdAt = new Date().toISOString();

  const hasPg = !!getDbPool();
  if (hasPg) {
    await query(
      `INSERT INTO sessions (token, user_id, expires_at, created_at) VALUES ($1, $2, $3, $4)`,
      [token, userId, expiresAt, createdAt]
    );
  } else {
    memoryStore.sessions.push({ token, user_id: userId, expires_at: expiresAt, created_at: createdAt });
  }

  return token;
}

/**
 * Valida token de sessão e retorna o usuário ativo
 */
export async function validateSession(token: string | null | undefined): Promise<SafeUser | null> {
  if (!token) return null;

  try {
    const now = new Date().toISOString();
    const hasPg = !!getDbPool();

    if (hasPg) {
      const rows = await query<{
        id: string;
        name: string;
        login: string;
        role: string;
        status: string;
        avatar_url: string | null;
        created_at: string;
        expires_at: string;
      }>(
        `SELECT u.id, u.name, u.login, COALESCE(u.role, 'user') as role, COALESCE(u.status, 'active') as status, u.avatar_url, u.created_at, s.expires_at
         FROM sessions s
         JOIN users u ON s.user_id = u.id
         WHERE s.token = $1 AND s.expires_at > $2`,
        [token, now]
      );

      if (rows.length === 0) return null;

      const row = rows[0];
      return {
        id: row.id,
        name: row.name,
        login: row.login,
        role: (row.role || "user") as "admin" | "user",
        status: (row.status || "active") as "active" | "inactive",
        avatarUrl: row.avatar_url || null,
        createdAt: row.created_at,
      };
    } else {
      const session = memoryStore.sessions.find((s) => s.token === token && s.expires_at > now);
      if (!session) return null;
      const user = memoryStore.users.find((u) => u.id === session.user_id);
      if (!user) return null;
      return {
        id: user.id,
        name: user.name,
        login: user.login,
        role: (user.role || "user") as "admin" | "user",
        status: (user.status || "active") as "active" | "inactive",
        avatarUrl: user.avatar_url || null,
        createdAt: user.created_at,
      };
    }
  } catch (err) {
    console.error("Erro ao validar sessão:", err);
    return null;
  }
}

/**
 * Registra novo usuário e inicializa dados padrão.
 * O PRIMEIRO USUÁRIO CADASTRADO NO SISTEMA TORNA-SE ADMINISTRADOR AUTOMATICAMENTE.
 */
export async function registerUser(params: {
  name: string;
  login: string;
  password: string;
}): Promise<AuthResult> {
  const name = params.name?.trim();
  const login = params.login?.trim().toLowerCase();
  const password = params.password;

  if (!name || name.length < 2) {
    throw new Error("O nome deve ter pelo menos 2 caracteres.");
  }
  if (!login || login.length < 3) {
    throw new Error("O login deve ter pelo menos 3 caracteres.");
  }
  if (!password || password.length < 6) {
    throw new Error("A senha deve conter no mínimo 6 caracteres.");
  }

  const hasPg = !!getDbPool();
  let isFirstUser = false;

  if (hasPg) {
    // 1. Verifica se já existe o login
    const existing = await query(`SELECT id FROM users WHERE login = $1`, [login]);
    if (existing.length > 0) {
      throw new Error("Este login/e-mail já está cadastrado no sistema.");
    }

    // 2. Verifica se é o primeiro usuário do sistema
    const countRows = await query<{ count: string | number }>(`SELECT count(*) as count FROM users`);
    const totalUsers = Number(countRows[0]?.count || 0);
    isFirstUser = totalUsers === 0;
  } else {
    if (memoryStore.users.some((u) => u.login === login)) {
      throw new Error("Este login/e-mail já está cadastrado no sistema.");
    }
    isFirstUser = memoryStore.users.length === 0;
  }

  const userId = crypto.randomUUID();
  const passwordHash = hashPassword(password);
  const now = new Date().toISOString();
  const role: "admin" | "user" = isFirstUser ? "admin" : "user";
  const status: "active" | "inactive" = "active";

  if (hasPg) {
    await withTransaction(async (client) => {
      // Cria o usuário
      await client.query(
        `INSERT INTO users (id, name, login, password_hash, role, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [userId, name, login, passwordHash, role, status, now]
      );

      // Cria as categorias padrão isoladas para este usuário
      for (const cat of DEFAULT_CATEGORIES) {
        const catId = `${cat.id}-${userId.slice(0, 6)}`;
        await client.query(
          `INSERT INTO categories (id, user_id, name, color, is_default, created_at)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (id) DO NOTHING`,
          [catId, userId, cat.name, cat.color, 1, now]
        );
      }
    });
  } else {
    memoryStore.users.push({
      id: userId,
      name,
      login,
      password_hash: passwordHash,
      role,
      status,
      created_at: now,
    });
    for (const cat of DEFAULT_CATEGORIES) {
      memoryStore.categories.push({
        id: `${cat.id}-${userId.slice(0, 6)}`,
        user_id: userId,
        name: cat.name,
        color: cat.color,
        is_default: 1,
        created_at: now,
      });
    }
  }

  const token = await createSession(userId);

  return {
    user: {
      id: userId,
      name,
      login,
      role,
      status,
      createdAt: now,
    },
    token,
  };
}

/**
 * Autentica usuário existente e gera nova sessão
 */
export async function loginUser(params: {
  login: string;
  password: string;
}): Promise<AuthResult> {
  const login = params.login?.trim().toLowerCase();
  const password = params.password;

  if (!login || !password) {
    throw new Error("Informe o login e a senha.");
  }

  const hasPg = !!getDbPool();
  let userRecord: {
    id: string;
    name: string;
    login: string;
    password_hash: string;
    role: string;
    status: string;
    avatar_url?: string | null;
    created_at: string;
  } | undefined;

  if (hasPg) {
    const rows = await query<{
      id: string;
      name: string;
      login: string;
      password_hash: string;
      role: string;
      status: string;
      avatar_url: string | null;
      created_at: string;
    }>(
      `SELECT id, name, login, password_hash, COALESCE(role, 'user') as role, COALESCE(status, 'active') as status, avatar_url, created_at 
       FROM users WHERE login = $1`,
      [login]
    );
    userRecord = rows[0];
  } else {
    userRecord = memoryStore.users.find((u) => u.login === login);
  }

  if (!userRecord) {
    throw new Error("Usuário ou senha inválidos.");
  }

  if (userRecord.status === "inactive") {
    throw new Error("Esta conta está desativada. Entre em contato com o administrador.");
  }

  const isMatch = verifyPassword(password, userRecord.password_hash);
  if (!isMatch) {
    throw new Error("Usuário ou senha inválidos.");
  }

  const token = await createSession(userRecord.id);

  return {
    user: {
      id: userRecord.id,
      name: userRecord.name,
      login: userRecord.login,
      role: (userRecord.role || "user") as "admin" | "user",
      status: (userRecord.status || "active") as "active" | "inactive",
      avatarUrl: userRecord.avatar_url || null,
      createdAt: userRecord.created_at,
    },
    token,
  };
}

/**
 * Encerra a sessão atual
 */
export async function logoutUser(token: string): Promise<void> {
  if (!token) return;
  const hasPg = !!getDbPool();
  if (hasPg) {
    await query(`DELETE FROM sessions WHERE token = $1`, [token]);
  } else {
    memoryStore.sessions = memoryStore.sessions.filter((s) => s.token !== token);
  }
}
