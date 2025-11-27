<!-- 
 
Task Manager View

the task manager view handles all the input and presentation for the task management system
here can be found the centralize application for the



-->

<script setup>
import { ref, onMounted } from "vue";
import Button from "primevue/button";
import "primeicons/primeicons.css";
import Panel from "primevue/panel";
import draggable from "vuedraggable";
import TaskCard from "@/components/contents/TaskCard.vue";
import InputCard from "@/components/contents/InputCard.vue";

// API / UTIL / SERVICES
import { getTasks } from "@/api/tasks.js";
import { populateTasks } from "@/utils/populateTasks.js";
import { addTask } from "@/services/addTask.js";
import { editTask } from "@/services/editTask.js";
import { deleteTask } from "@/services/deleteTask.js";
import AlertCard from "@/components/contents/AlertCard.vue";

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
  dueDate: ""
});

const editingTask = ref(null);

// Shared draggable options (same for all columns)
const dragOptions = {
  animation: 150,
  group: "tasks",
  ghostClass: "drag-ghost",
  dragClass: "dragging",
  chosenClass: "drag-chosen"
};

// HELPER: safely update lists without breaking draggable
function setTaskLists(populated) {
  pendingTasks.value.splice(0, pendingTasks.value.length, ...(populated.pending || []));
  inProgressTasks.value.splice(0, inProgressTasks.value.length, ...(populated.inProgress || []));
  completedTasks.value.splice(0, completedTasks.value.length, ...(populated.completed || []));
  cancelledTasks.value.splice(0, cancelledTasks.value.length, ...(populated.cancelled || []));
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

// ALERT STATE
const showAlert = ref(false);
const alertMessage = ref("");
const alertSeverity = ref("info");

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
    ...cancelledTasks.value
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
    dueDate: ""
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

// DRAG STATUS UPDATE (only syncs status + backend, lists are already moved by draggable)
async function updateTaskStatus(task, newStatus) {
  try {
    if (task.status === newStatus) return;

    const updatedTask = { ...task, status: newStatus };
    task.status = newStatus; // keep local object in sync
    await editTask(task.id, updatedTask);
  } catch (err) {
    console.error("[updateTaskStatus] ERROR:", err);
    alert("Failed to update task status.");
    await loadTasks(); // fallback to refresh from backend
  }
}

function onDrop(newStatus, event) {
  const task = event?.added?.element || event?.moved?.element;
  if (!task) return;
  updateTaskStatus(task, newStatus);
}

onMounted(loadTasks);
</script>

<template>
  <div class="main">
    <!-- HEADER -->
    <div class="row-1">
      <div class="left">
        <h3>My Tasks</h3>
        <p>Drag and drop the task to update its status.</p>
      </div>
      <div class="right">
        <div class="card flex justify-content-center">
          <Button label="Add Task" icon="pi pi-plus" @click="openAddTask" />
          <Button label="Sort Items" icon="pi pi-sort-alt" @click="sortTasks" />
        </div>
      </div>
    </div>

    <!-- ADD FORM -->
    <InputCard
      v-if="showAddForm"
      mode="add"
      :task="newTask"
      submitLabel="Add Task"
      @submit="handleAddSubmit"
      @cancel="cancelAddTask"
    />

    <!-- EDIT FORM -->
    <InputCard
      v-if="showEditForm && editingTask"
      mode="edit"
      :task="editingTask"
      submitLabel="Save Changes"
      @submit="handleEditSubmit"
      @cancel="cancelEditTask"
    />

    <!-- LOADING / ERROR -->
    <div v-if="isLoading" class="status-msg">Loading tasks...</div>
    <div v-else-if="error" class="status-msg error">{{ error }}</div>

    <!-- TASK COLUMNS -->
    <div v-else class="row-2">
      <div class="panel-body">
        <!-- PENDING -->
        <Panel
          class="panel-inside"
          header="Pending Tasks"
          style="background-color: lightgoldenrodyellow"
        >
          <draggable
            v-model="pendingTasks"
            v-bind="dragOptions"
            item-key="id"
            class="tasks-list"
            @change="event => onDrop('pending', event)"
          >
            <template #item="{ element }">
              <div class="drag-wrapper">
                <TaskCard
                  :title="element.taskName"
                  :content="element.description"
                  :dueDate="element.dueDate"
                  @edit="openEditTask(element)"
                  @delete="handleDelete(element)"
                />
              </div>
            </template>
          </draggable>
        </Panel>

        <!-- IN PROGRESS -->
        <Panel
          class="panel-inside"
          header="In Progress Tasks"
          style="background-color: lightcyan"
        >
          <draggable
            v-model="inProgressTasks"
            v-bind="dragOptions"
            item-key="id"
            class="tasks-list"
            @change="event => onDrop('in progress', event)"
          >
            <template #item="{ element }">
              <div class="drag-wrapper">
                <TaskCard
                  :title="element.taskName"
                  :content="element.description"
                  :dueDate="element.dueDate"
                  @edit="openEditTask(element)"
                  @delete="handleDelete(element)"
                />
              </div>
            </template>
          </draggable>
        </Panel>

        <!-- COMPLETED -->
        <Panel
          class="panel-inside"
          header="Completed Tasks"
          style="background-color: lightgreen"
        >
          <draggable
            v-model="completedTasks"
            v-bind="dragOptions"
            item-key="id"
            class="tasks-list"
            @change="event => onDrop('completed', event)"
          >
            <template #item="{ element }">
              <div class="drag-wrapper">
                <TaskCard
                  :title="element.taskName"
                  :content="element.description"
                  :dueDate="element.dueDate"
                  @edit="openEditTask(element)"
                  @delete="handleDelete(element)"
                />
              </div>
            </template>
          </draggable>
        </Panel>

        <!-- CANCELLED -->
        <Panel
          class="panel-inside"
          header="Cancelled Tasks"
          style="background-color: lightcoral"
        >
          <draggable
            v-model="cancelledTasks"
            v-bind="dragOptions"
            item-key="id"
            class="tasks-list"
            @change="event => onDrop('cancelled', event)"
          >
            <template #item="{ element }">
              <div class="drag-wrapper">
                <TaskCard
                  :title="element.taskName"
                  :content="element.description"
                  :dueDate="element.dueDate"
                  @edit="openEditTask(element)"
                  @delete="handleDelete(element)"
                />
              </div>
            </template>
          </draggable>
        </Panel>
      </div>
    </div>

    <AlertCard
      v-model:visible="showAlert"
      :message="alertMessage"
      :severity="alertSeverity"
      title="Information"
    />
  </div>
</template>

<style lang="scss">
@use "@/assets/View/task-manager.scss";
</style>
