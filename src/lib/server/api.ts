/**
 * Roteador e Controlador da API REST no Servidor Zenith.
 * Processa requisições de Autenticação, Persistência e Gestão Administrativa (com conformidade LGPD).
 */
import { getDbPool, initDb, memoryStore, query, withTransaction } from "./database";
import {
  loginUser,
  logoutUser,
  registerUser,
  validateSession,
  type SafeUser,
} from "./auth";
import type { AppData, Category, Goal, GoalTarget, SubTask, Task } from "../types";

/**
 * Extrai o token de autenticação dos Headers da requisição (Bearer ou Cookie)
 */
export function extractToken(request: Request): string | null {
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }

  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split(";").map((c) => {
        const [k, ...v] = c.trim().split("=");
        return [k, v.join("=")];
      })
    );
    if (cookies["zenith_token"]) {
      return cookies["zenith_token"];
    }
  }

  return null;
}

/**
 * Resposta JSON padronizada
 */
export function jsonResponse(data: any, status = 200, headers: HeadersInit = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...headers,
    },
  });
}

/**
 * Carrega todos os dados (Tarefas, Metas, Categorias) pertencentes exclusivamente ao usuário logado
 */
export async function fetchUserData(userId: string): Promise<AppData> {
  const hasPg = !!getDbPool();

  if (!hasPg) {
    const userCategories = memoryStore.categories.filter((c) => c.user_id === userId);
    const userGoals = memoryStore.goals.filter((g) => g.user_id === userId);
    const userGoalIds = userGoals.map((g) => g.id);
    const userTargets = memoryStore.goal_targets.filter((t) => userGoalIds.includes(t.goal_id));
    const userTasks = memoryStore.tasks.filter((t) => t.user_id === userId);
    const userTaskIds = userTasks.map((t) => t.id);
    const userSubtasks = memoryStore.subtasks.filter((st) => userTaskIds.includes(st.task_id));

    return {
      categories: userCategories.map((c) => ({
        id: c.id,
        name: c.name,
        color: c.color,
        isDefault: c.is_default === 1,
        createdAt: c.created_at,
      })),
      goals: userGoals.map((g) => ({
        id: g.id,
        title: g.title,
        description: g.description || "",
        horizon: (g.horizon || "medio") as any,
        categoryId: g.category_id || "pessoal",
        targetDate: g.target_date,
        targets: userTargets
          .filter((t) => t.goal_id === g.id)
          .map((t) => ({
            id: t.id,
            title: t.title,
            type: t.type as any,
            startValue: t.start_value,
            currentValue: t.current_value,
            targetValue: t.target_value,
            unit: t.unit || undefined,
            completed: t.completed === 1,
            createdAt: t.created_at,
          })),
        createdAt: g.created_at,
        deletedAt: g.deleted_at,
      })),
      tasks: userTasks.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description || "",
        dueDate: t.due_date,
        priority: (t.priority || "media") as any,
        categoryId: t.category_id || "pessoal",
        status: (t.status || "pending") as any,
        done: t.done === 1,
        recurrence: {
          frequency: (t.recurrence_frequency || "none") as any,
          interval: t.recurrence_interval || 1,
          daysOfWeek: t.recurrence_days_of_week
            ? t.recurrence_days_of_week.split(",").map(Number).filter((n) => !isNaN(n))
            : undefined,
        },
        subtasks: userSubtasks
          .filter((st) => st.task_id === t.id)
          .map((st) => ({
            id: st.id,
            title: st.title,
            done: st.done === 1,
            createdAt: st.created_at,
          })),
        goalId: t.goal_id,
        createdAt: t.created_at,
        completedAt: t.completed_at,
        deletedAt: t.deleted_at,
      })),
    };
  }

  // 1. Categorias do usuário
  const categoriesRows = await query<{
    id: string;
    name: string;
    color: string;
    is_default: number;
    created_at: string;
  }>(
    `SELECT id, name, color, is_default, created_at 
     FROM categories 
     WHERE user_id = $1 
     ORDER BY created_at ASC`,
    [userId]
  );

  const categories: Category[] = categoriesRows.map((r) => ({
    id: r.id,
    name: r.name,
    color: r.color,
    isDefault: Number(r.is_default) === 1,
    createdAt: r.created_at,
  }));

  // 2. Metas do usuário
  const goalsRows = await query<{
    id: string;
    title: string;
    description: string | null;
    horizon: string;
    category_id: string | null;
    target_date: string | null;
    created_at: string;
    deleted_at: string | null;
  }>(
    `SELECT id, title, description, horizon, category_id, target_date, created_at, deleted_at 
     FROM goals 
     WHERE user_id = $1 
     ORDER BY created_at DESC`,
    [userId]
  );

  // Alvos de metas
  const goalIds = goalsRows.map((g) => g.id);
  let targetRows: {
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
  }[] = [];

  if (goalIds.length > 0) {
    targetRows = await query(
      `SELECT id, goal_id, title, type, start_value, current_value, target_value, unit, completed, created_at 
       FROM goal_targets 
       WHERE goal_id = ANY($1::text[]) 
       ORDER BY created_at ASC`,
      [goalIds]
    );
  }

  const targetsByGoal = new Map<string, GoalTarget[]>();
  for (const tr of targetRows) {
    const list = targetsByGoal.get(tr.goal_id) || [];
    list.push({
      id: tr.id,
      title: tr.title,
      type: tr.type as any,
      startValue: Number(tr.start_value) || 0,
      currentValue: Number(tr.current_value) || 0,
      targetValue: Number(tr.target_value) || 0,
      unit: tr.unit || undefined,
      completed: Number(tr.completed) === 1,
      createdAt: tr.created_at,
    });
    targetsByGoal.set(tr.goal_id, list);
  }

  const goals: Goal[] = goalsRows.map((g) => ({
    id: g.id,
    title: g.title,
    description: g.description || "",
    horizon: (g.horizon || "medio") as any,
    categoryId: g.category_id || "pessoal",
    targetDate: g.target_date,
    targets: targetsByGoal.get(g.id) || [],
    createdAt: g.created_at,
    deletedAt: g.deleted_at,
  }));

  // 3. Tarefas do usuário
  const tasksRows = await query<{
    id: string;
    title: string;
    description: string | null;
    due_date: string | null;
    priority: string;
    category_id: string | null;
    status: string;
    done: number;
    recurrence_frequency: string | null;
    recurrence_interval: number | null;
    recurrence_days_of_week: string | null;
    goal_id: string | null;
    created_at: string;
    completed_at: string | null;
    deleted_at: string | null;
  }>(
    `SELECT id, title, description, due_date, priority, category_id, status, done,
            recurrence_frequency, recurrence_interval, recurrence_days_of_week, goal_id,
            created_at, completed_at, deleted_at 
     FROM tasks 
     WHERE user_id = $1 
     ORDER BY created_at DESC`,
    [userId]
  );

  const taskIds = tasksRows.map((t) => t.id);
  let subtaskRows: {
    id: string;
    task_id: string;
    title: string;
    done: number;
    created_at: string;
  }[] = [];

  if (taskIds.length > 0) {
    subtaskRows = await query(
      `SELECT id, task_id, title, done, created_at 
       FROM subtasks 
       WHERE task_id = ANY($1::text[]) 
       ORDER BY created_at ASC`,
      [taskIds]
    );
  }

  const subtasksByTask = new Map<string, SubTask[]>();
  for (const st of subtaskRows) {
    const list = subtasksByTask.get(st.task_id) || [];
    list.push({
      id: st.id,
      title: st.title,
      done: Number(st.done) === 1,
      createdAt: st.created_at,
    });
    subtasksByTask.set(st.task_id, list);
  }

  const tasks: Task[] = tasksRows.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description || "",
    dueDate: t.due_date,
    priority: (t.priority || "media") as any,
    categoryId: t.category_id || "pessoal",
    status: (t.status || "pending") as any,
    done: Number(t.done) === 1,
    recurrence: {
      frequency: (t.recurrence_frequency || "none") as any,
      interval: t.recurrence_interval || 1,
      daysOfWeek: t.recurrence_days_of_week
        ? t.recurrence_days_of_week.split(",").map(Number).filter((n) => !isNaN(n))
        : undefined,
    },
    subtasks: subtasksByTask.get(t.id) || [],
    goalId: t.goal_id,
    createdAt: t.created_at,
    completedAt: t.completed_at,
    deletedAt: t.deleted_at,
  }));

  return {
    categories,
    goals,
    tasks,
  };
}

/**
 * Salva e sincroniza de forma atômica o conjunto de dados do usuário no PostgreSQL
 */
export async function syncUserData(userId: string, data: AppData): Promise<void> {
  const hasPg = !!getDbPool();

  if (!hasPg) {
    // Modo local / em memória
    for (const cat of data.categories || []) {
      const idx = memoryStore.categories.findIndex((c) => c.id === cat.id);
      const row = {
        id: cat.id,
        user_id: userId,
        name: cat.name,
        color: cat.color,
        is_default: cat.isDefault ? 1 : 0,
        created_at: cat.createdAt || new Date().toISOString(),
      };
      if (idx >= 0) memoryStore.categories[idx] = row;
      else memoryStore.categories.push(row);
    }

    for (const goal of data.goals || []) {
      const gIdx = memoryStore.goals.findIndex((g) => g.id === goal.id);
      const gRow = {
        id: goal.id,
        user_id: userId,
        title: goal.title,
        description: goal.description || "",
        horizon: goal.horizon,
        category_id: goal.categoryId,
        target_date: goal.targetDate || null,
        created_at: goal.createdAt || new Date().toISOString(),
        deleted_at: goal.deletedAt || null,
      };
      if (gIdx >= 0) memoryStore.goals[gIdx] = gRow;
      else memoryStore.goals.push(gRow);

      for (const target of goal.targets || []) {
        const tIdx = memoryStore.goal_targets.findIndex((t) => t.id === target.id);
        const tRow = {
          id: target.id,
          goal_id: goal.id,
          title: target.title,
          type: target.type,
          start_value: target.startValue || 0,
          current_value: target.currentValue || 0,
          target_value: target.targetValue,
          unit: target.unit || null,
          completed: target.completed ? 1 : 0,
          created_at: target.createdAt || new Date().toISOString(),
        };
        if (tIdx >= 0) memoryStore.goal_targets[tIdx] = tRow;
        else memoryStore.goal_targets.push(tRow);
      }
    }

    for (const task of data.tasks || []) {
      const tIdx = memoryStore.tasks.findIndex((t) => t.id === task.id);
      const tRow = {
        id: task.id,
        user_id: userId,
        title: task.title,
        description: task.description || "",
        due_date: task.dueDate || null,
        priority: task.priority,
        category_id: task.categoryId,
        status: task.status,
        done: task.done ? 1 : 0,
        recurrence_frequency: task.recurrence?.frequency || "none",
        recurrence_interval: task.recurrence?.interval || 1,
        recurrence_days_of_week: task.recurrence?.daysOfWeek?.join(",") || null,
        goal_id: task.goalId || null,
        created_at: task.createdAt || new Date().toISOString(),
        completed_at: task.completedAt || null,
        deleted_at: task.deletedAt || null,
      };
      if (tIdx >= 0) memoryStore.tasks[tIdx] = tRow;
      else memoryStore.tasks.push(tRow);

      for (const st of task.subtasks || []) {
        const stIdx = memoryStore.subtasks.findIndex((s) => s.id === st.id);
        const stRow = {
          id: st.id,
          task_id: task.id,
          title: st.title,
          done: st.done ? 1 : 0,
          created_at: st.createdAt || new Date().toISOString(),
        };
        if (stIdx >= 0) memoryStore.subtasks[stIdx] = stRow;
        else memoryStore.subtasks.push(stRow);
      }
    }
    return;
  }

  // Modo PostgreSQL em produção
  await withTransaction(async (client) => {
    // 1. Sincroniza Categorias
    for (const cat of data.categories || []) {
      await client.query(
        `INSERT INTO categories (id, user_id, name, color, is_default, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           color = EXCLUDED.color,
           is_default = EXCLUDED.is_default`,
        [cat.id, userId, cat.name, cat.color, cat.isDefault ? 1 : 0, cat.createdAt || new Date().toISOString()]
      );
    }

    // 2. Sincroniza Metas e seus Alvos
    for (const goal of data.goals || []) {
      await client.query(
        `INSERT INTO goals (id, user_id, title, description, horizon, category_id, target_date, created_at, deleted_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title,
           description = EXCLUDED.description,
           horizon = EXCLUDED.horizon,
           category_id = EXCLUDED.category_id,
           target_date = EXCLUDED.target_date,
           deleted_at = EXCLUDED.deleted_at`,
        [
          goal.id,
          userId,
          goal.title,
          goal.description || "",
          goal.horizon,
          goal.categoryId,
          goal.targetDate || null,
          goal.createdAt || new Date().toISOString(),
          goal.deletedAt || null,
        ]
      );

      // Sincroniza alvos da meta
      for (const target of goal.targets || []) {
        await client.query(
          `INSERT INTO goal_targets (id, goal_id, title, type, start_value, current_value, target_value, unit, completed, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (id) DO UPDATE SET
             title = EXCLUDED.title,
             type = EXCLUDED.type,
             start_value = EXCLUDED.start_value,
             current_value = EXCLUDED.current_value,
             target_value = EXCLUDED.target_value,
             unit = EXCLUDED.unit,
             completed = EXCLUDED.completed`,
          [
            target.id,
            goal.id,
            target.title,
            target.type,
            target.startValue || 0,
            target.currentValue || 0,
            target.targetValue,
            target.unit || null,
            target.completed ? 1 : 0,
            target.createdAt || new Date().toISOString(),
          ]
        );
      }
    }

    // 3. Sincroniza Tarefas e suas Subtarefas
    for (const task of data.tasks || []) {
      const daysOfWeekStr = task.recurrence?.daysOfWeek?.join(",") || null;
      await client.query(
        `INSERT INTO tasks (
           id, user_id, title, description, due_date, priority, category_id, status, done,
           recurrence_frequency, recurrence_interval, recurrence_days_of_week, goal_id,
           created_at, completed_at, deleted_at
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title,
           description = EXCLUDED.description,
           due_date = EXCLUDED.due_date,
           priority = EXCLUDED.priority,
           category_id = EXCLUDED.category_id,
           status = EXCLUDED.status,
           done = EXCLUDED.done,
           recurrence_frequency = EXCLUDED.recurrence_frequency,
           recurrence_interval = EXCLUDED.recurrence_interval,
           recurrence_days_of_week = EXCLUDED.recurrence_days_of_week,
           goal_id = EXCLUDED.goal_id,
           completed_at = EXCLUDED.completed_at,
           deleted_at = EXCLUDED.deleted_at`,
        [
          task.id,
          userId,
          task.title,
          task.description || "",
          task.dueDate || null,
          task.priority,
          task.categoryId,
          task.status,
          task.done ? 1 : 0,
          task.recurrence?.frequency || "none",
          task.recurrence?.interval || 1,
          daysOfWeekStr,
          task.goalId || null,
          task.createdAt || new Date().toISOString(),
          task.completedAt || null,
          task.deletedAt || null,
        ]
      );

      // Sincroniza subtarefas
      for (const st of task.subtasks || []) {
        await client.query(
          `INSERT INTO subtasks (id, task_id, title, done, created_at)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (id) DO UPDATE SET
             title = EXCLUDED.title,
             done = EXCLUDED.done`,
          [st.id, task.id, st.title, st.done ? 1 : 0, st.createdAt || new Date().toISOString()]
        );
      }
    }
  });
}

/**
 * Manipulador principal de requisições /api/*
 */
export async function handleApiRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  // Garante inicialização das tabelas no banco de dados
  await initDb();

  try {
    // ---------------- AUTH: REGISTER ----------------
    if (path === "/api/auth/register" && method === "POST") {
      const body = await request.json();
      const result = await registerUser(body);
      return jsonResponse(
        { ok: true, user: result.user, token: result.token },
        201,
        {
          "Set-Cookie": `zenith_token=${result.token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`,
        }
      );
    }

    // ---------------- AUTH: LOGIN ----------------
    if (path === "/api/auth/login" && method === "POST") {
      const body = await request.json();
      const result = await loginUser(body);
      return jsonResponse(
        { ok: true, user: result.user, token: result.token },
        200,
        {
          "Set-Cookie": `zenith_token=${result.token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`,
        }
      );
    }

    // ---------------- AUTH: ME ----------------
    if (path === "/api/auth/me" && method === "GET") {
      const token = extractToken(request);
      const user = await validateSession(token);
      if (!user) {
        return jsonResponse({ ok: false, error: "Sessão inválida ou expirada." }, 401);
      }
      return jsonResponse({ ok: true, user });
    }

    // ---------------- AUTH: LOGOUT ----------------
    if (path === "/api/auth/logout" && method === "POST") {
      const token = extractToken(request);
      if (token) {
        await logoutUser(token);
      }
      return jsonResponse(
        { ok: true },
        200,
        {
          "Set-Cookie": `zenith_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
        }
      );
    }

    // ---------------- VERIFICAÇÃO DE SESSÃO ----------------
    const token = extractToken(request);
    const user = await validateSession(token);

    if (!user) {
      return jsonResponse(
        { ok: false, error: "Acesso não autorizado. Faça login para continuar." },
        401
      );
    }

    // ---------------- DATA: FETCH ALL (ISOLAMENTO POR USUÁRIO) ----------------
    if (path === "/api/data" && method === "GET") {
      const data = await fetchUserData(user.id);
      return jsonResponse({ ok: true, data });
    }

    // ---------------- DATA: SYNC ALL ----------------
    if ((path === "/api/data" || path === "/api/sync") && method === "POST") {
      const body = (await request.json()) as AppData;
      await syncUserData(user.id, body);
      return jsonResponse({ ok: true, message: "Dados sincronizados com sucesso." });
    }

    // ---------------- USER: UPDATE AVATAR ----------------
    if (path === "/api/user/avatar" && method === "POST") {
      const body = await request.json();
      const avatarUrl = body.avatarUrl || null;
      const hasPg = !!getDbPool();

      if (hasPg) {
        await query(`UPDATE users SET avatar_url = $1 WHERE id = $2`, [avatarUrl, user.id]);
      } else {
        const u = memoryStore.users.find((x) => x.id === user.id);
        if (u) {
          u.avatar_url = avatarUrl;
        }
      }

      return jsonResponse({ ok: true, avatarUrl });
    }

    // ---------------- ADMIN: GESTÃO DE USUÁRIOS E SISTEMA (LGPD COMPLIANT) ----------------
    // O administrador NÃO tem acesso ao conteúdo individual das tarefas de outros usuários
    if (path === "/api/admin/users" && method === "GET") {
      if (user.role !== "admin") {
        return jsonResponse({ ok: false, error: "Acesso restrito ao administrador do sistema." }, 403);
      }

      const hasPg = !!getDbPool();
      let usersList: Array<{
        id: string;
        name: string;
        login: string;
        role: string;
        status: string;
        avatarUrl?: string | null;
        createdAt: string;
        tasksCount: number;
        goalsCount: number;
      }> = [];

      if (hasPg) {
        const rows = await query<{
          id: string;
          name: string;
          login: string;
          role: string;
          status: string;
          avatar_url: string | null;
          created_at: string;
          tasks_count: string | number;
          goals_count: string | number;
        }>(`
          SELECT 
            u.id, 
            u.name, 
            u.login, 
            COALESCE(u.role, 'user') as role, 
            COALESCE(u.status, 'active') as status, 
            u.avatar_url,
            u.created_at,
            (SELECT COUNT(*) FROM tasks t WHERE t.user_id = u.id AND t.deleted_at IS NULL) as tasks_count,
            (SELECT COUNT(*) FROM goals g WHERE g.user_id = u.id AND g.deleted_at IS NULL) as goals_count
          FROM users u
          ORDER BY u.created_at ASC
        `);

        usersList = rows.map((r) => ({
          id: r.id,
          name: r.name,
          login: r.login,
          role: r.role,
          status: r.status,
          avatarUrl: r.avatar_url || null,
          createdAt: r.created_at,
          tasksCount: Number(r.tasks_count || 0),
          goalsCount: Number(r.goals_count || 0),
        }));
      } else {
        usersList = memoryStore.users.map((u) => ({
          id: u.id,
          name: u.name,
          login: u.login,
          role: u.role,
          status: u.status,
          avatarUrl: u.avatar_url || null,
          createdAt: u.created_at,
          tasksCount: memoryStore.tasks.filter((t) => t.user_id === u.id && !t.deleted_at).length,
          goalsCount: memoryStore.goals.filter((g) => g.user_id === u.id && !g.deleted_at).length,
        }));
      }

      return jsonResponse({ ok: true, users: usersList });
    }

    // ---------------- ADMIN: ATIVAR / DESATIVAR USUÁRIO ----------------
    if (path === "/api/admin/users/toggle-status" && method === "POST") {
      if (user.role !== "admin") {
        return jsonResponse({ ok: false, error: "Acesso restrito ao administrador do sistema." }, 403);
      }

      const body = await request.json();
      const targetUserId = body.userId;
      const nextStatus = body.status === "inactive" ? "inactive" : "active";

      if (targetUserId === user.id) {
        return jsonResponse({ ok: false, error: "Você não pode desativar seu próprio usuário administrador." }, 400);
      }

      const hasPg = !!getDbPool();
      if (hasPg) {
        await query(`UPDATE users SET status = $1 WHERE id = $2`, [nextStatus, targetUserId]);
        if (nextStatus === "inactive") {
          // Invalida sessões ativas do usuário desativado
          await query(`DELETE FROM sessions WHERE user_id = $1`, [targetUserId]);
        }
      } else {
        const u = memoryStore.users.find((x) => x.id === targetUserId);
        if (u) {
          u.status = nextStatus;
          if (nextStatus === "inactive") {
            memoryStore.sessions = memoryStore.sessions.filter((s) => s.user_id !== targetUserId);
          }
        }
      }

      return jsonResponse({ ok: true, status: nextStatus });
    }

    // ---------------- ADMIN: ESTATÍSTICAS DO SISTEMA ----------------
    if (path === "/api/admin/stats" && method === "GET") {
      if (user.role !== "admin") {
        return jsonResponse({ ok: false, error: "Acesso restrito ao administrador do sistema." }, 403);
      }

      const hasPg = !!getDbPool();
      let totalUsers = 0;
      let activeUsers = 0;
      let totalTasks = 0;
      let totalGoals = 0;

      if (hasPg) {
        const uRows = await query<{ total: string | number; active: string | number }>(`
          SELECT 
            COUNT(*) as total, 
            COUNT(*) FILTER (WHERE status = 'active' OR status IS NULL) as active 
          FROM users
        `);
        const tRows = await query<{ total: string | number }>(`SELECT COUNT(*) as total FROM tasks`);
        const gRows = await query<{ total: string | number }>(`SELECT COUNT(*) as total FROM goals`);

        totalUsers = Number(uRows[0]?.total || 0);
        activeUsers = Number(uRows[0]?.active || 0);
        totalTasks = Number(tRows[0]?.total || 0);
        totalGoals = Number(gRows[0]?.total || 0);
      } else {
        totalUsers = memoryStore.users.length;
        activeUsers = memoryStore.users.filter((u) => u.status === "active").length;
        totalTasks = memoryStore.tasks.length;
        totalGoals = memoryStore.goals.length;
      }

      return jsonResponse({
        ok: true,
        stats: {
          totalUsers,
          activeUsers,
          totalTasks,
          totalGoals,
          dbMode: hasPg ? "PostgreSQL (Easypanel / Hostinger)" : "Desenvolvimento Local (Armazenamento em Memória)",
          lgpdCompliant: true,
        },
      });
    }

    return jsonResponse({ ok: false, error: "Endpoint não encontrado" }, 404);
  } catch (err: any) {
    console.error(`Erro na rota API [${method} ${path}]:`, err);
    return jsonResponse(
      { ok: false, error: err.message || "Erro interno do servidor." },
      400
    );
  }
}
