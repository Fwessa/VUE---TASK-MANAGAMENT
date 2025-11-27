import { ref, onMounted } from "vue";
import { getTasks } from "@/api/tasks.js";
import { populateTasks } from "@/utils/populateTasks.js";
import { addTask } from "@/services/addTask.js";
import { editTask } from "@/services/editTask.js";
import { deleteTask } from "@/services/deleteTask.js";

export function useTaskManager() {
  // STATE
  const pendingTasks = ref([]);
  const inProgressTasks = ref([]);
  const completedTasks = ref([]);
  const cancelledTasks = ref([]);

  const isLoading = ref(false);
  const error = ref(null);

  // ADD / EDIT FORMS
  const showAddForm = ref(false);
  const showEditForm = ref(false);

  const newTask = ref({
    taskName: "",
    description: "",
    status: "pending",
    dueDate: "",
  });

  const editingTask = ref(null);

  // ALERT STATE
  const showAlert = ref(false);
  const alertMessage = ref("");
  const alertSeverity = ref("info");

  // COLUMN META (just config)
  const columns = [
    { id: "pending", header: "Pending Tasks", bgColor: "lightyellow" },
    { id: "inProgress", header: "In Progress", bgColor: "lightblue" },
    { id: "completed", header: "Completed Tasks", bgColor: "lightgreen" },
    { id: "cancelled", header: "Cancelled", bgColor: "lightcoral" },
  ];

  // HELPER: safely update lists without breaking draggable
  function setTaskLists(populated) {
    pendingTasks.value.splice(
      0,
      pendingTasks.value.length,
      ...(populated.pending || [])
    );
    inProgressTasks.value.splice(
      0,
      inProgressTasks.value.length,
      ...(populated.inProgress || [])
    );
    completedTasks.value.splice(
      0,
      completedTasks.value.length,
      ...(populated.completed || [])
    );
    cancelledTasks.value.splice(
      0,
      cancelledTasks.value.length,
      ...(populated.cancelled || [])
    );
  }

  // FETCH TASKS
  async function loadTasks() {
    try {
      isLoading.value = true;
      error.value = null;

      const res = await getTasks();
      const populated = populateTasks(res.data);

      setTaskLists(populated);
    } catch (err) {
      console.error("loadTasks error:", err);
      error.value = "Failed to load tasks.";
    } finally {
      isLoading.value = false;
    }
  }

  function getTasksByStatus(status) {
    switch (status) {
      case "pending":
        return pendingTasks.value;
      case "inProgress":
        return inProgressTasks.value;
      case "completed":
        return completedTasks.value;
      case "cancelled":
        return cancelledTasks.value;
      default:
        return [];
    }
  }

  function triggerAlert(message, severity = "info") {
    alertMessage.value = message;
    alertSeverity.value = severity;
    showAlert.value = true;
  }

  // SORTING
  function sortTasks() {
    const allTasks = [
      ...pendingTasks.value,
      ...inProgressTasks.value,
      ...completedTasks.value,
      ...cancelledTasks.value,
    ];

    const populated = populateTasks(allTasks);
    setTaskLists(populated);

    triggerAlert("Sorting completed", "info");
  }

  // ADD
  function openAddTask() {
    newTask.value = {
      taskName: "",
      description: "",
      status: "pending",
      dueDate: "",
    };
    showAddForm.value = true;
  }

  function cancelAddTask() {
    showAddForm.value = false;
  }

  async function handleAddSubmit(taskData) {
    try {
      await addTask(taskData);
      showAddForm.value = false;
      await loadTasks();
    } catch (err) {
      console.error("Add error:", err);
      alert("Failed to add task.");
    }
  }

  // EDIT
  function openEditTask(task) {
    editingTask.value = { ...task };
    showEditForm.value = true;
  }

  function cancelEditTask() {
    showEditForm.value = false;
    editingTask.value = null;
  }

  async function handleEditSubmit(taskData) {
    try {
      await editTask(taskData.id, taskData);
      showEditForm.value = false;
      editingTask.value = null;
      await loadTasks();
    } catch (err) {
      console.error("Edit error:", err);
      alert("Failed to update task.");
    }
  }

  // DELETE
  async function handleDelete(task) {
    try {
      await deleteTask(task.id);
      await loadTasks();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete task.");
    }
  }

  // DRAG STATUS UPDATE
  async function updateTaskStatus(task, newStatus) {
    try {
      if (task.status === newStatus) return;

      const updatedTask = { ...task, status: newStatus };
      task.status = newStatus; // keep local object in sync
      await editTask(task.id, updatedTask);
    } catch (err) {
      console.error("[updateTaskStatus] ERROR:", err);
      alert("Failed to update task status.");
      await loadTasks();
    }
  }

  function onDrop(newStatus, event) {
    const task = event?.added?.element || event?.moved?.element;
    if (!task) return;
    updateTaskStatus(task, newStatus);
  }

  onMounted(loadTasks);

  return {
    // state
    pendingTasks,
    inProgressTasks,
    completedTasks,
    cancelledTasks,
    isLoading,
    error,

    showAddForm,
    showEditForm,
    newTask,
    editingTask,

    showAlert,
    alertMessage,
    alertSeverity,

    columns,

    // helpers
    getTasksByStatus,
    sortTasks,
    openAddTask,
    cancelAddTask,
    handleAddSubmit,
    openEditTask,
    cancelEditTask,
    handleEditSubmit,
    handleDelete,
    onDrop,
  };
}
