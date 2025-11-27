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
        <TaskColumn
          v-for="column in columns"
          :key="column.id"
          :header="column.header"
          :status="column.id"
          :bgColor="column.bgColor"
          :tasks="getTasksByStatus(column.id)"
          @drop="({ status, event }) => onDrop(status, event)"
          @edit-task="openEditTask"
          @delete-task="handleDelete"
        />
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

<script setup>
import Button from "primevue/button";
import "primeicons/primeicons.css";
import InputCard from "@/components/contents/InputCard.vue";
import AlertCard from "@/components/contents/AlertCard.vue";
import TaskColumn from "@/components/contents/TaskColumn.vue";

import { useTaskManager } from "@/composables/useTaskManager.js";

const {
  // state
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

  // functions
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
} = useTaskManager();
</script>

<style lang="scss">
@use "@/assets/View/task-manager.scss";
</style>
