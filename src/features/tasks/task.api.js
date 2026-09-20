// Re-exports the shared task service so feature-local imports
// (e.g. from features/tasks/components) can use a relative path
// without duplicating the request logic in services/task.api.js.
export * from "../../services/task.api.js";
