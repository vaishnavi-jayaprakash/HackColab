import { useCallback, useEffect, useState } from "react";
import * as taskApi from "../services/task.api.js";

export function useTasks(hackathonId) {
  const [tasks, setTasks] = useState([]);
  const [columns, setColumns] = useState([]);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [taskList, columnList, memberList] = await Promise.all([
        taskApi.getTasks(hackathonId),
        Promise.resolve(taskApi.getTaskColumns()),
        taskApi.getTeamMembers(hackathonId),
      ]);
      setTasks(taskList);
      setColumns(columnList);
      setMembers(memberList);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [hackathonId]);

  useEffect(() => {
    load();
  }, [load]);

  const moveTask = useCallback(
    async (taskId, toColumn) => {
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, column: toColumn } : t)));
      try {
        await taskApi.moveTask(taskId, toColumn);
      } catch (err) {
        setError(err);
        load();
      }
    },
    [load]
  );

  const tasksByColumn = useCallback(
    (columnId) => tasks.filter((t) => t.column === columnId),
    [tasks]
  );

  return { tasks, columns, members, isLoading, error, moveTask, tasksByColumn, reload: load };
}
