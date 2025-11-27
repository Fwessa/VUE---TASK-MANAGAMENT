import { deleteTask as apiDeleteTask } from "@/api/tasks.js";

export function deleteTask(id) {
  if (!id) throw new Error("Task ID is required to delete a task");
  return apiDeleteTask(id);
}
