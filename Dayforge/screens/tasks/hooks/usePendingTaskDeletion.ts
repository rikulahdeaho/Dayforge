import { useEffect, useRef, useState } from 'react';

export function usePendingTaskDeletion(removeTask: (taskId: string) => void) {
  const [pendingTaskDeletion, setPendingTaskDeletion] = useState<{ id: string; title: string } | null>(null);
  const pendingTaskDeletionRef = useRef<{ id: string; title: string } | null>(null);
  const pendingTaskDeletionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPendingDeletionTimeout = () => {
    if (pendingTaskDeletionTimeoutRef.current) {
      clearTimeout(pendingTaskDeletionTimeoutRef.current);
      pendingTaskDeletionTimeoutRef.current = null;
    }
  };

  const commitTaskDeletion = (taskId: string) => {
    removeTask(taskId);
    clearPendingDeletionTimeout();

    if (pendingTaskDeletionRef.current?.id === taskId) {
      pendingTaskDeletionRef.current = null;
      setPendingTaskDeletion(null);
    }
  };

  const queueTaskDeletion = (taskId: string, title: string) => {
    const previousDeletion = pendingTaskDeletionRef.current;
    if (previousDeletion) {
      commitTaskDeletion(previousDeletion.id);
    }

    const nextDeletion = { id: taskId, title };
    pendingTaskDeletionRef.current = nextDeletion;
    setPendingTaskDeletion(nextDeletion);
    clearPendingDeletionTimeout();
    pendingTaskDeletionTimeoutRef.current = setTimeout(() => {
      commitTaskDeletion(taskId);
    }, 4500);
  };

  const undoTaskDeletion = () => {
    clearPendingDeletionTimeout();
    pendingTaskDeletionRef.current = null;
    setPendingTaskDeletion(null);
  };

  useEffect(() => clearPendingDeletionTimeout, []);

  return {
    pendingTaskDeletion,
    queueTaskDeletion,
    undoTaskDeletion,
  };
}
