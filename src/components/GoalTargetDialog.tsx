import { useEffect, useState } from "react";
import {
  FlaticonCheck,
  FlaticonClock,
  FlaticonDollar,
  FlaticonHash,
  FlaticonPercent,
  FlaticonSubtasks,
  FlaticonTarget,
} from "./icons/FlaticonIcons";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/lib/store";
import { TARGET_TYPE_LABEL, type Goal, type GoalTarget, type GoalTargetType } from "@/lib/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: Goal | null;
  target?: GoalTarget | null;
}

export function GoalTargetDialog({ open, onOpenChange, goal, target }: Props) {
  const { addGoalTarget, updateGoalTarget } = useStore();

  const [title, setTitle] = useState("");
  const [type, setType] = useState<GoalTargetType>("number");
  const [startValue, setStartValue] = useState(0);
  const [currentValue, setCurrentValue] = useState(0);
  const [targetValue, setTargetValue] = useState(100);
  const [unit, setUnit] = useState("");
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (target) {
      setTitle(target.title);
      setType(target.type);
      setStartValue(target.startValue || 0);
      setCurrentValue(target.currentValue || 0);
      setTargetValue(target.targetValue || 100);
      setUnit(target.unit || "");
      setCompleted(target.completed || false);
    } else {
      setTitle("");
      setType("number");
      setStartValue(0);
      setCurrentValue(0);
      setTargetValue(10);
      setUnit("");
      setCompleted(false);
    }
  }, [open, target]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal || !title.trim()) return;

    const isBool = type === "boolean";
    const finalStart = isBool ? 0 : Number(startValue);
    const finalCurrent = isBool ? (completed ? 1 : 0) : Number(currentValue);
    const finalTarget = isBool ? 1 : Number(targetValue);
    const finalCompleted = isBool ? completed : Number(currentValue) >= Number(targetValue);

    if (target) {
      updateGoalTarget(goal.id, target.id, {
        title: title.trim(),
        type,
        startValue: finalStart,
        currentValue: finalCurrent,
        targetValue: finalTarget,
        unit: isBool ? "" : unit.trim(),
        completed: finalCompleted,
      });
    } else {
      addGoalTarget(goal.id, {
        title: title.trim(),
        type,
        startValue: finalStart,
        currentValue: finalCurrent,
        targetValue: finalTarget,
        unit: isBool ? "" : unit.trim(),
        completed: finalCompleted,
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card w-[calc(100vw-2rem)] max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-bold">
            {target ? "Editar Alvo de Medição" : "Novo Alvo de Medição"}
          </DialogTitle>
          {goal && (
            <p className="text-xs text-muted-foreground">
              Meta: <span className="font-semibold text-foreground">{goal.title}</span>
            </p>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Título do Alvo */}
          <div className="space-y-1.5">
            <Label
              htmlFor="target-title"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Nome do Alvo *
            </Label>
            <Input
              id="target-title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex.: Quilômetros percorridos, Valor poupado..."
              className="bg-background/50"
            />
          </div>

          {/* Tipo de Medição */}
          <div className="space-y-1.5">
            <Label
              htmlFor="target-type"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Tipo de Medição
            </Label>
            <Select value={type} onValueChange={(v) => setType(v as GoalTargetType)}>
              <SelectTrigger id="target-type" className="bg-background/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="number">
                  <div className="flex items-center gap-2">
                    <FlaticonHash size={14} /> Numérico (contagem simples)
                  </div>
                </SelectItem>
                <SelectItem value="currency">
                  <div className="flex items-center gap-2">
                    <FlaticonDollar size={14} /> Monetário (R$)
                  </div>
                </SelectItem>
                <SelectItem value="percent">
                  <div className="flex items-center gap-2">
                    <FlaticonPercent size={14} /> Percentual (%)
                  </div>
                </SelectItem>
                <SelectItem value="boolean">
                  <div className="flex items-center gap-2">
                    <FlaticonCheck size={14} /> Sim / Não (Conquista única)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Campos condicionais baseados no tipo */}
          {type === "boolean" ? (
            <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 rounded-xl bg-secondary/50 p-3.5 sm:p-4 border border-border/40">
              <div>
                <p className="text-sm font-semibold text-foreground">Status do Alvo</p>
                <p className="text-xs text-muted-foreground">
                  Marque quando a conquista for atingida
                </p>
              </div>
              <Button
                type="button"
                variant={completed ? "default" : "outline"}
                onClick={() => setCompleted((v) => !v)}
                className={`gap-2 min-w-[125px] font-semibold transition-all ${
                  completed
                    ? "bg-success text-success-foreground hover:bg-success/90 border-transparent shadow-sm"
                    : "border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {completed ? (
                  <>
                    <FlaticonCheck size={16} />
                    <span>Concluído</span>
                  </>
                ) : (
                  <>
                    <FlaticonClock size={16} />
                    <span>Pendente</span>
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="curr-val"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    Valor Atual
                  </Label>
                  <Input
                    id="curr-val"
                    type="number"
                    step="any"
                    required
                    value={currentValue}
                    onChange={(e) => setCurrentValue(Number(e.target.value))}
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="target-val"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    Valor Alvo
                  </Label>
                  <Input
                    id="target-val"
                    type="number"
                    step="any"
                    required
                    value={targetValue}
                    onChange={(e) => setTargetValue(Number(e.target.value))}
                    className="bg-background/50"
                  />
                </div>
              </div>

              {type === "number" && (
                <div className="space-y-1.5">
                  <Label
                    htmlFor="target-unit"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    Unidade de Medida (Opcional)
                  </Label>
                  <Input
                    id="target-unit"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="Ex.: km, livros, horas, capítulos..."
                    className="bg-background/50"
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter className="pt-3">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground">
              {target ? "Salvar Alvo" : "Adicionar Alvo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
