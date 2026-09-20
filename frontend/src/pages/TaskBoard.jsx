import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout.jsx";
import Button from "../components/ui/Button.jsx";
import Loading from "../components/common/Loading.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import TaskColumn from "../features/tasks/components/TaskColumn.jsx";
import TaskModal from "../features/tasks/components/TaskModal.jsx";
import { useTasks } from "../hooks/useTasks.js";
import { createTask, updateTask, deleteTask } from "../services/task.api.js";
import { useAuth } from "../hooks/useAuth.js";
import { getTeam } from "../services/team.api.js";
import { resolveWorkspace } from "../services/workspace.js";
import "./TaskBoard.css";

export default function TaskBoard() {
  const { hackathonId } = useParams();
  const { user } = useAuth();
  const { tasks, columns, members, isLoading, error, moveTask, tasksByColumn, reload } = useTasks(hackathonId);
  const [isLead, setIsLead] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTask, setActiveTask] = useState(null);

  useEffect(() => {
    resolveWorkspace({ hackathonId })
      .then(({ teamId }) => getTeam(teamId))
      .then((team) => setIsLead(team?.leadId === user?.id))
      .catch(() => setIsLead(false));
  }, [hackathonId, user?.id]);

  const openCreate = () => {
    setActiveTask(null);
    setModalOpen(true);
  };

  const openEdit = (task) => {
    setActiveTask(task);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setActiveTask(null);
  };

  const handleSave = async (payload) => {
    if (activeTask?.id) {
      await updateTask(activeTask.id, payload);
    } else {
      const created = await createTask(payload, hackathonId);
      if (payload.column && payload.column !== "backlog") {
        await updateTask(created.id, { column: payload.column });
      }
    }
    await reload();
  };

  const handleDelete = async (taskId) => {
    await deleteTask(taskId);
    await reload();
  };

  return (
    <PageLayout
      navbarContent={
        <div>
          <h1 className="page-title">Task Board</h1>
          <p className="page-subtitle">{tasks.length} tasks for this hackathon team</p>
        </div>
      }
    >
      <div className="page">
        <div className="board-toolbar">
          <div />
          <Button onClick={openCreate}>+ New Task</Button>
        </div>

        {isLoading && <Loading label="Loading tasks…" />}
        {error && !isLoading && (
          <ErrorState message={error.message || "Failed to load tasks"} onRetry={reload} />
        )}

        {!isLoading && !error && (
          <div className="board-columns">
            {columns.map((col) => (
              <TaskColumn
                key={col.id}
                column={col}
                tasks={tasksByColumn(col.id)}
                onDropTask={moveTask}
                onOpenTask={openEdit}
              />
            ))}
          </div>
        )}
      </div>

      <TaskModal
        isOpen={modalOpen}
        onClose={closeModal}
        task={activeTask}
        members={members}
        canAssign={isLead}
        onSave={handleSave}
        onDelete={activeTask ? handleDelete : undefined}
      />
    </PageLayout>
  );
}
