import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import {
  FlaticonCalendar,
  FlaticonGoals,
  FlaticonRestore,
  FlaticonTasks,
  FlaticonTrash,
} from "@/components/icons/FlaticonIcons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useStore } from "@/lib/store";
import { formatDate } from "@/lib/utils-domain";

export const Route = createFileRoute("/lixeira")({
  head: () => ({
    meta: [
      { title: "Lixeira · Zenith" },
      {
        name: "description",
        content: "Lixeira com opção de restauração e exclusão permanente de tarefas e metas.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <LixeiraPage />
    </AppShell>
  ),
});

export function LixeiraPage() {
  const {
    trashTasks,
    trashGoals,
    trashCount,
    restoreTask,
    restoreGoal,
    permanentDeleteTask,
    permanentDeleteGoal,
    emptyTrash,
  } = useStore();

  const [confirmEmptyOpen, setConfirmEmptyOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-destructive">
              Lixeira
            </span>
          </div>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground">
            Itens Excluídos
          </h1>
          <p className="text-sm text-muted-foreground">
            {trashCount > 0
              ? `${trashCount} item(ns) na lixeira. Você pode restaurar ou excluir permanentemente.`
              : "A lixeira está vazia."}
          </p>
        </div>

        {trashCount > 0 && (
          <Button variant="destructive" onClick={() => setConfirmEmptyOpen(true)} className="gap-2">
            <FlaticonTrash size={16} /> Esvaziar Lixeira
          </Button>
        )}
      </div>

      {trashCount === 0 ? (
        <EmptyState
          icon={FlaticonTrash}
          title="Lixeira Vazia"
          hint="Nenhum item foi excluído recentemente."
        />
      ) : (
        <div className="space-y-6">
          {/* Tarefas na Lixeira */}
          {trashTasks.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                <FlaticonTasks size={16} className="text-primary" />
                <h2>Tarefas ({trashTasks.length})</h2>
              </div>

              <ul className="space-y-2.5">
                {trashTasks.map((task) => (
                  <li
                    key={task.id}
                    className="glass-card flex items-center justify-between gap-3 p-4 opacity-85 hover:opacity-100 transition-opacity"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground truncate">{task.title}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>Excluído em: {formatDate(task.deletedAt)}</span>
                        {task.dueDate && <span>· Vencimento: {formatDate(task.dueDate)}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => restoreTask(task.id)}
                        className="gap-1 text-xs"
                      >
                        <FlaticonRestore size={13} /> Restaurar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => permanentDeleteTask(task.id)}
                        className="text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        Excluir
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Metas na Lixeira */}
          {trashGoals.length > 0 && (
            <section className="space-y-3 pt-2">
              <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                <FlaticonGoals size={16} className="text-info" />
                <h2>Metas ({trashGoals.length})</h2>
              </div>

              <ul className="space-y-2.5">
                {trashGoals.map((goal) => (
                  <li
                    key={goal.id}
                    className="glass-card flex items-center justify-between gap-3 p-4 opacity-85 hover:opacity-100 transition-opacity"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground truncate">{goal.title}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>Excluído em: {formatDate(goal.deletedAt)}</span>
                        {goal.targetDate && <span>· Alvo: {formatDate(goal.targetDate)}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => restoreGoal(goal.id)}
                        className="gap-1 text-xs"
                      >
                        <FlaticonRestore size={13} /> Restaurar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => permanentDeleteGoal(goal.id)}
                        className="text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        Excluir
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      {/* Modal de Confirmação para Esvaziar Lixeira */}
      <Dialog open={confirmEmptyOpen} onOpenChange={setConfirmEmptyOpen}>
        <DialogContent className="glass-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold text-destructive">
              Esvaziar Lixeira?
            </DialogTitle>
            <DialogDescription className="pt-2 text-sm text-muted-foreground">
              Esta ação removerá definitivamente todas as {trashCount} tarefas e metas da lixeira.
              Esta operação não poderá ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-3">
            <Button variant="ghost" onClick={() => setConfirmEmptyOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                emptyTrash();
                setConfirmEmptyOpen(false);
              }}
            >
              Sim, esvaziar permanentemente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
