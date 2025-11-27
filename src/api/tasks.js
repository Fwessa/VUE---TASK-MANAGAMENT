import api from "@/api/axios.js";

export async function getTasks() {
  return api.get("/tasks");
}

export async function createTask(task) {
  return api.post("/tasks", task);
}

export async function updateTask(id, task) {
  return api.put(`/tasks/${id}`, task);
}

export async function deleteTask(id) {
  return api.delete(`/tasks/${id}`);
}
