/**
 * Camada de Acesso ao Banco de Dados da Aplicação Aura.
 * Suporta:
 * - SQLite localmente (data/aura.db)
 * - PostgreSQL em produção (Hostinger VPS / Easypanel via DATABASE_URL)
 */

export interface DbConfig {
  type: "sqlite" | "postgres";
  connectionString?: string;
}

export function getDatabaseConfig(): DbConfig {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (url && url.startsWith("postgres")) {
    return {
      type: "postgres",
      connectionString: url,
    };
  }
  return {
    type: "sqlite",
    connectionString: process.env.SQLITE_PATH || "./data/aura.db",
  };
}

/**
 * Esquema SQL para SQLite e PostgreSQL
 */
export const DB_SCHEMA_SQL = `
-- Tabela de Categorias
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  is_default INTEGER DEFAULT 0,
  created_at TEXT NOT NULL
);

-- Tabela de Metas
CREATE TABLE IF NOT EXISTS goals (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  horizon TEXT NOT NULL,
  category_id TEXT REFERENCES categories(id),
  target_date TEXT,
  created_at TEXT NOT NULL,
  deleted_at TEXT
);

-- Tabela de Alvos das Metas (ClickUp Style)
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

-- Tabela de Tarefas
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  due_date TEXT,
  priority TEXT NOT NULL,
  category_id TEXT REFERENCES categories(id),
  status TEXT NOT NULL,
  done INTEGER DEFAULT 0,
  recurrence_frequency TEXT DEFAULT 'none',
  goal_id TEXT REFERENCES goals(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL,
  completed_at TEXT,
  deleted_at TEXT
);

-- Tabela de Subtarefas
CREATE TABLE IF NOT EXISTS subtasks (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  done INTEGER DEFAULT 0,
  created_at TEXT NOT NULL
);
`;
