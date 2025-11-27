// SORT BY DUE DATE
function sortByDueDate(list) {
  return [...list].sort((a, b) => {
    const aDate = new Date(a.dueDate);
    const bDate = new Date(b.dueDate);
    return aDate - bDate;
  });
}

// SEPARATE TASK PER COLUMN
export function populateTasks(allTasks) {
  return {
    pending: sortByDueDate(allTasks.filter(t => t.status === "pending")),
    inProgress: sortByDueDate(allTasks.filter(t => t.status === "in progress")),
    completed: sortByDueDate(allTasks.filter(t => t.status === "completed")),
    cancelled: sortByDueDate(allTasks.filter(t => t.status === "cancelled")),
  };
}
