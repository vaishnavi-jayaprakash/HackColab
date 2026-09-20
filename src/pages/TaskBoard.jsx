import { useMemo, useState } from "react";
import PageLayout from "../components/layout/PageLayout.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Loading from "../components/common/Loading.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import TaskColumn from "../features/tasks/components/TaskColumn.jsx";
import TaskModal from "../features/tasks/components/TaskModal.jsx";
import { useTasks } from "../hooks/useTasks.js";
import { useDebounce } from "../hooks/useDebounce.js";
import { createTask } from "../services/task.api.js";
import "./TaskBoard.css";

export default function TaskBoard() {
  const { tasks, columns, isLoading, error, moveTask, tasksByColumn, reload } = useTasks("neurahack-2026");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const debouncedSearch = useDebounce(search, 250);

  const filteredByColumn = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    const map = {};
    for (const col of columns) {
      const list = tasksByColumn(col.id);
      map[col.id] = q ? list.filter((t) => t.title.toLowerCase().includes(q)) : list;
    }
    return map;
  }, [columns, tasksByColumn, debouncedSearch]);

  return (
    <PageLayout
      navbarContent={
        <div>
          <h1 className="page-title">Task Board — NeuraHack 2026</h1>
          <p className="page-subtitle">{tasks.length} tasks · sorted by priority</p>
        </div>
      }
    >
      <div className="page">
        <div className="board-toolbar">
          <div className="board-search">
            <Input placeholder="Search tasks…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Button onClick={() => setIsModalOpen(true)}>+ New Task</Button>
        </div>

        {isLoading && <Loading label="Loading tasks…" />}
        {error && !isLoading && <ErrorState onRetry={reload} />}

        {!isLoading && !error && (
          <div className="board-columns">
            {columns.map((col) => (
              <TaskColumn
                key={col.id}
                column={col}
                tasks={filteredByColumn[col.id] || []}
                onDropTask={moveTask}
                onOpenTask={() => {}}
              />
            ))}
          </div>
        )}
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={async (payload) => {
          await createTask(payload);
          await reload();
        }}
      />
    </PageLayout>
  );
}
