import { updateTask } from "@/api/tasks.js";

const TITLE_LIMIT = 75;
const DESCRIPTION_LIMIT = 250;

export function editTask(id, taskData) {
  if (!id) throw new Error("Task ID is required to edit a task.");

  if (!taskData.taskName || taskData.taskName.trim() === "") {
    throw new Error("Task name is required.");
  }

  if (taskData.taskName.length > TITLE_LIMIT) {
    throw new Error(`Task title cannot exceed ${TITLE_LIMIT} characters.`);
  }

  if (taskData.description && taskData.description.length > DESCRIPTION_LIMIT) {
    throw new Error(`Description cannot exceed ${DESCRIPTION_LIMIT} characters.`);
  }

  if (!taskData.dueDate) {
    throw new Error("Due date is required.");
  }

  return updateTask(id, taskData);
}
