import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  FlaticonCategories,
  FlaticonEdit,
  FlaticonPlus,
  FlaticonTag,
  FlaticonTasks,
  FlaticonTrash,
} from "@/components/icons/FlaticonIcons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";
import type { Category } from "@/lib/types";

export const Route = createFileRoute("/categorias")({
  head: () => ({
    meta: [
      { title: "Categorias · Zenith" },
      {
        name: "description",
        content: "Gerenciamento de categorias para organização de tarefas e metas.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <CategoriasPage />
    </AppShell>
  ),
});

const PRESET_COLORS = [
  "#38BDF8", // Cyan
  "#818CF8", // Indigo
  "#A855F7", // Purple
  "#F43F5E", // Rose
  "#F59E0B", // Amber
  "#10B981", // Emerald
  "#06B6D4", // Sky
  "#64748B", // Slate
];

export function CategoriasPage() {
  const { categories, tasks, goals, addCategory, editCategory, removeCategory } = useStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);

  const openNew = () => {
    setEditingCat(null);
    setName("");
    setColor(PRESET_COLORS[0]);
    setModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCat(cat);
    setName(cat.name);
    setColor(cat.color);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingCat) {
      editCategory(editingCat.id, name.trim(), color);
    } else {
      addCategory(name.trim(), color);
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Classificação
            </span>
          </div>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground">
            Categorias
          </h1>
          <p className="text-sm text-muted-foreground">
            Personalize as categorias da sua rotina para segmentar tarefas, metas e análises.
          </p>
        </div>

        <Button onClick={openNew} className="gap-2 bg-primary text-primary-foreground">
          <FlaticonPlus size={16} /> Nova Categoria
        </Button>
      </div>

      {/* Grid de Categorias */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => {
          const linkedTasksCount = tasks.filter((t) => t.categoryId === cat.id).length;
          const linkedGoalsCount = goals.filter((g) => g.categoryId === cat.id).length;

          return (
            <div
              key={cat.id}
              className="glass-card flex flex-col justify-between p-5 transition-all hover:shadow-lift"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="size-4 rounded-full shadow-sm"
                      style={{ backgroundColor: cat.color }}
                    />
                    <h2 className="font-display text-lg font-bold text-foreground">{cat.name}</h2>
                  </div>

                  {cat.isDefault && (
                    <span className="rounded-md bg-secondary/80 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                      Padrão
                    </span>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <FlaticonTasks size={13} /> {linkedTasksCount} tarefa(s)
                  </span>
                  <span>·</span>
                  <span>{linkedGoalsCount} meta(s)</span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-border/40 flex items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEdit(cat)}
                  className="h-8 text-xs gap-1 hover:bg-secondary"
                >
                  <FlaticonEdit size={13} /> Editar
                </Button>
                {!cat.isDefault && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCategory(cat.id)}
                    className="h-8 text-xs gap-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <FlaticonTrash size={13} /> Excluir
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Adicionar/Editar Categoria */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="glass-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">
              {editingCat ? "Editar Categoria" : "Nova Categoria"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label
                htmlFor="cat-name"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Nome da Categoria *
              </Label>
              <Input
                id="cat-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex.: Projetos, Saúde, Estudos..."
                className="bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Cor de Identificação
              </Label>
              <div className="flex flex-wrap gap-2 pt-1">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`size-8 rounded-full transition-transform ${
                      color === c
                        ? "scale-125 ring-2 ring-primary ring-offset-2 ring-offset-background"
                        : "hover:scale-110"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-primary text-primary-foreground">
                {editingCat ? "Salvar Alterações" : "Criar Categoria"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
