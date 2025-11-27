import { createTask } from "@/api/tasks.js";

const TITLE_LIMIT = 75;
const DESCRIPTION_LIMIT = 250;

export function addTask(task) {
  if (!task.taskName || task.taskName.trim() === "") {
    throw new Error("Task name is required.");
  }

  if (task.taskName.length > TITLE_LIMIT) {
    throw new Error(`Task title cannot exceed ${TITLE_LIMIT} characters.`);
  }

  if (task.description && task.description.length > DESCRIPTION_LIMIT) {
    throw new Error(`Description cannot exceed ${DESCRIPTION_LIMIT} characters.`);
  }

  if (!task.dueDate) {
    throw new Error("Due date is required.");
  }

  return createTask(task);
}
