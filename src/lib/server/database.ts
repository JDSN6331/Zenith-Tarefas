/**
 * Camada de Acesso e Persistência no Banco de Dados (PostgreSQL com fallback em memória para dev local).
 * Gerencia pool de conexões, inicialização e migrações automáticas de schema.
 */
import pg from "pg";

const { Pool } = pg;

export interface DbConfig {
  type: "postgres" | "local_memory";
  connectionString?: string;
}

let pool: pg.Pool | null = null;
let isInitialized = false;

// Armazenamento local de fallback para testes offline / sem PostgreSQL local
interface MemoryDb {
  users: Array<{
    id: string;
    name: string;
    login: string;
    password_hash: string;
    role: string;
    status: string;
    avatar_url?: string | null;
    theme_mode?: string;
    theme_palette?: string;
    task_filters?: string;
    created_at: string;
  }>;
  sessions: Array<{
    token: string;
    user_id: string;
    expires_at: string;
    created_at: string;
  }>;
  categories: Array<{
    id: string;
    user_id: string;
    name: string;
    color: string;
    is_default: number;
    created_at: string;
  }>;
  goals: Array<{
    id: string;
    user_id: string;
    title: string;
    description: string;
    horizon: string;
    category_id: string | null;
    target_date: string | null;
    created_at: string;
    deleted_at: string | null;
  }>;
  goal_targets: Array<{
    id: string;
    goal_id: string;
    title: string;
    type: string;
    start_value: number;
    current_value: number;
    target_value: number;
    unit: string | null;
    completed: number;
    created_at: string;
  }>;
  tasks: Array<{
    id: string;
    user_id: string;
    title: string;
    description: string;
    due_date: string | null;
    priority: string;
    category_id: string;
    status: string;
    done: number;
    recurrence_frequency: string;
    recurrence_interval: number;
    recurrence_days_of_week: string | null;
    recurrence_next_status: string;
    goal_id: string | null;
    created_at: string;
    completed_at: string | null;
    deleted_at: string | null;
  }>;
  subtasks: Array<{
    id: string;
    task_id: string;
    title: string;
    done: number;
    created_at: string;
  }>;
}

export const memoryStore: MemoryDb = {
  users: [],
  sessions: [],
  categories: [],
  goals: [],
  goal_targets: [],
  tasks: [],
  subtasks: [],
};

export function getDatabaseConfig(): DbConfig {
  const url = process.env["DATABASE_URL"] || process.env["POSTGRES_URL"];
  if (url && (url.startsWith("postgres://") || url.startsWith("postgresql://"))) {
    return {
      type: "postgres",
      connectionString: url,
    };
  }
  return {
    type: "local_memory",
  };
}

export function getDbPool(): pg.Pool | null {
  if (pool) return pool;

  const config = getDatabaseConfig();
  if (config.type === "postgres" && config.connectionString) {
    const isSslDisabled = config.connectionString.includes("sslmode=disable");
    pool = new Pool({
      connectionString: config.connectionString,
      ssl: isSslDisabled ? false : { rejectUnauthorized: false },
      max: 15,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pool.on("error", (err) => {
      console.error("Erro inesperado no Pool do PostgreSQL Zenith:", err);
    });

    return pool;
  }

  return null;
}

export function isPostgresActive(): boolean {
  return !!getDbPool();
}

/**
 * Executa uma consulta no banco de dados com segurança
 */
export async function query<T = any>(text: string, params: any[] = []): Promise<T[]> {
  const p = getDbPool();
  if (!p) {
    throw new Error(
      "Nenhuma conexão PostgreSQL ativa. Modo local em uso."
    );
  }
  const client = await p.connect();
  try {
    const res = await client.query(text, params);
    return res.rows as T[];
  } finally {
    client.release();
  }
}

/**
 * Executa uma transação no banco de dados
 */
export async function withTransaction<T>(
  callback: (client: pg.PoolClient) => Promise<T>
): Promise<T> {
  const p = getDbPool();
  if (!p) {
    throw new Error("Nenhuma conexão PostgreSQL ativa para transação.");
  }
  const client = await p.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

/**
 * Inicialização e migração do esquema do banco de dados
 */
export async function initDb(): Promise<void> {
  if (isInitialized) return;

  const p = getDbPool();
  if (!p) {
    console.log("ℹ️ Servidor rodando em modo de Desenvolvimento Local (Armazenamento Local Ativo).");
    isInitialized = true;
    return;
  }

  try {
    console.log("🔄 Inicializando tabelas e migrações no PostgreSQL...");

    // 1. Tabela de Usuários (com role de admin e status)
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        login TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        status TEXT DEFAULT 'active',
        task_filters TEXT DEFAULT '{}',
        created_at TEXT NOT NULL
      );
    `);

    // 2. Tabela de Sessões
    await query(`
      CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);

    // 3. Tabela de Categorias
    await query(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        name TEXT NOT NULL,
        color TEXT NOT NULL,
        is_default INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
      );
    `);

    // 4. Tabela de Metas
    await query(`
      CREATE TABLE IF NOT EXISTS goals (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        title TEXT NOT NULL,
        description TEXT,
        horizon TEXT NOT NULL,
        category_id TEXT,
        target_date TEXT,
        created_at TEXT NOT NULL,
        deleted_at TEXT
      );
    `);

    // 5. Tabela de Alvos das Metas
    await query(`
      CREATE TABLE IF NOT EXISTS goal_targets (
        id TEXT PRIMARY KEY,
        goal_id TEXT NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        type TEXT NOT NULL,
        start_value REAL DEFAULT 0,
        current_value REAL DEFAULT 0,
        target_value REAL NOT NULL,
        unit TEXT,
        completed INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
      );
    `);

    // 6. Tabela de Tarefas
    await query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        title TEXT NOT NULL,
        description TEXT,
        due_date TEXT,
        priority TEXT NOT NULL,
        category_id TEXT,
        status TEXT NOT NULL,
        done INTEGER DEFAULT 0,
        recurrence_frequency TEXT DEFAULT 'none',
        recurrence_interval INTEGER DEFAULT 1,
        recurrence_days_of_week TEXT,
        recurrence_next_status TEXT DEFAULT 'pending',
        goal_id TEXT REFERENCES goals(id) ON DELETE SET NULL,
        created_at TEXT NOT NULL,
        completed_at TEXT,
        deleted_at TEXT
      );
    `);

    // 7. Tabela de Subtarefas
    await query(`
      CREATE TABLE IF NOT EXISTS subtasks (
        id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        done INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        position INTEGER DEFAULT 0
      );
    `);

    // Migrações preventivas para bases existentes
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';`);
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';`);
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;`);
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS theme_mode TEXT DEFAULT 'dark';`);
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS theme_palette TEXT DEFAULT 'escuro';`);
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS task_filters TEXT DEFAULT '{}';`);
    await query(`ALTER TABLE categories ADD COLUMN IF NOT EXISTS user_id TEXT;`);
    await query(`ALTER TABLE goals ADD COLUMN IF NOT EXISTS user_id TEXT;`);
    await query(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS user_id TEXT;`);
    await query(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS recurrence_interval INTEGER DEFAULT 1;`);
    await query(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS recurrence_days_of_week TEXT;`);
    await query(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS recurrence_next_status TEXT DEFAULT 'pending';`);
    await query(`ALTER TABLE subtasks ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;`);

    // Índices para performance
    await query(`CREATE INDEX IF NOT EXISTS idx_users_login ON users(login);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_subtasks_task_id ON subtasks(task_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_goal_targets_goal_id ON goal_targets(goal_id);`);

    isInitialized = true;
    console.log("✅ Banco de dados PostgreSQL Zenith pronto e sincronizado!");
  } catch (err) {
    console.error("❌ Falha na inicialização do PostgreSQL Zenith:", err);
  }
}
