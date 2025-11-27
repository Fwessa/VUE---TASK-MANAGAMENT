// SORT BY DUE DATE
function sortByDueDate(list) {
  return [...list].sort((a, b) => {
    const aDate = new Date(a.dueDate);
    const bDate = new Date(b.dueDate);
    return aDate - bDate;
  });
}

export function populateTasks(tasks) {
  const result = {
    pending: [],
    inProgress: [],
    completed: [],
    cancelled: [],
  };

  tasks.forEach((task) => {
    const rawStatus = task.status || "";
    const status = rawStatus.toLowerCase();

    if (status === "pending") {
      result.pending.push(task);
    } else if (status === "inprogress" || status === "in-progress") {
      result.inProgress.push(task);
    } else if (status === "completed") {
      result.completed.push(task);
    } else if (status === "cancelled" || status === "canceled") {
      result.cancelled.push(task);
    } else {
      result.pending.push(task); // fallback
    }
  });

  // 🔥🔥🔥 SORT THEM BEFORE RETURNING
  result.pending = sortByDueDate(result.pending);
  result.inProgress = sortByDueDate(result.inProgress);
  result.completed = sortByDueDate(result.completed);
  result.cancelled = sortByDueDate(result.cancelled);

  return result;
}
