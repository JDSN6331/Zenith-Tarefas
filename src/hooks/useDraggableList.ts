import { useState, useCallback, useRef, useEffect } from "react";

export interface UseDraggableListOptions<T> {
  items: T[];
  onReorder: (newItems: T[]) => void;
}

export function useDraggableList<T>({ items, onReorder }: UseDraggableListOptions<T>) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [targetIndex, setTargetIndex] = useState<number | null>(null);

  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const touchDragIndexRef = useRef<number | null>(null);
  const targetIndexRef = useRef<number | null>(null);

  const moveItem = useCallback(
    (from: number, to: number) => {
      if (
        from === to ||
        from < 0 ||
        to < 0 ||
        from >= itemsRef.current.length ||
        to >= itemsRef.current.length
      ) {
        return;
      }
      const updated = [...itemsRef.current];
      const removed = updated.splice(from, 1)[0];
      if (removed !== undefined) {
        updated.splice(to, 0, removed);
        onReorder(updated);
      }
    },
    [onReorder]
  );

  const moveUp = useCallback(
    (index: number) => {
      if (index > 0) moveItem(index, index - 1);
    },
    [moveItem]
  );

  const moveDown = useCallback(
    (index: number) => {
      if (index < itemsRef.current.length - 1) moveItem(index, index + 1);
    },
    [moveItem]
  );

  // Drag & drop handlers para desktop (HTML5)
  const handleDragStart = useCallback((index: number, e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
    try {
      // Tenta definir o elemento pai (li) como imagem de arrasto para experiência visual completa
      const li = (e.currentTarget as HTMLElement).closest("li");
      if (li && e.dataTransfer.setDragImage) {
        e.dataTransfer.setDragImage(li, 24, 20);
      }
    } catch {
      // Fallback padrão do navegador
    }
    setDraggedIndex(index);
    setTargetIndex(index);
  }, []);

  const handleDragOver = useCallback((index: number, e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setTargetIndex(index);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setTargetIndex(null);
  }, []);

  const handleDrop = useCallback(
    (dropIndex: number, e: React.DragEvent) => {
      e.preventDefault();
      if (draggedIndex !== null && draggedIndex !== dropIndex) {
        moveItem(draggedIndex, dropIndex);
      }
      setDraggedIndex(null);
      setTargetIndex(null);
    },
    [draggedIndex, moveItem]
  );

  // Handlers para dispositivos móveis (Touch)
  const handleTouchStart = useCallback((index: number) => {
    touchDragIndexRef.current = index;
    targetIndexRef.current = index;
    setDraggedIndex(index);
    setTargetIndex(index);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchDragIndexRef.current === null) return;
    const touch = e.touches[0];
    if (!touch) return;

    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const dropItem = el?.closest("[data-subtask-index]");
    if (dropItem) {
      const idxAttr = dropItem.getAttribute("data-subtask-index");
      if (idxAttr !== null) {
        const idx = Number(idxAttr);
        if (!isNaN(idx) && idx !== targetIndexRef.current) {
          targetIndexRef.current = idx;
          setTargetIndex(idx);
        }
      }
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    const from = touchDragIndexRef.current;
    const to = targetIndexRef.current;
    if (from !== null && to !== null && from !== to) {
      moveItem(from, to);
    }
    touchDragIndexRef.current = null;
    targetIndexRef.current = null;
    setDraggedIndex(null);
    setTargetIndex(null);
  }, [moveItem]);

  return {
    draggedIndex,
    targetIndex,
    moveItem,
    moveUp,
    moveDown,
    getItemProps: (index: number) => ({
      "data-subtask-index": index,
      onDragOver: (e: React.DragEvent) => handleDragOver(index, e),
      onDrop: (e: React.DragEvent) => handleDrop(index, e),
    }),
    getHandleProps: (index: number) => ({
      draggable: true,
      onDragStart: (e: React.DragEvent) => handleDragStart(index, e),
      onDragEnd: handleDragEnd,
      onTouchStart: () => handleTouchStart(index),
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchEnd,
    }),
  };
}
