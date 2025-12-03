<template>
  <div class="task-manager-view">
    <!-- Row 1 -->
    <div class="row-1">
      <div class="row-1-left">
        <h1>My Tasks</h1>
        <p>Drag the task to different columns to change the status.</p>
      </div>
      <div class="row-1-right">
        <Button icon="pi pi-plus" label="Add Task" @click="openTaskModal" class="p-button-primary mr-2 addtask" :loading="loading" />
        <Button icon="pi pi-sort-alt" label="Sort" @click="toggleSort" class="p-button-secondary mr-2 sort" />
        <Button icon="pi pi-refresh" @click="fetchTasks" class="p-button-text" :loading="loading" />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && tasks.length === 0" class="loading-state">
      <ProgressSpinner style="width: 50px; height: 50px" />
      <p>Loading tasks...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <i class="pi pi-exclamation-triangle" style="font-size: 3rem; color: #ef4444"></i>
      <p>{{ error }}</p>
      <Button icon="pi pi-refresh" label="Retry" @click="fetchTasks" class="p-button-outlined" />
    </div>

    <!-- Row 2 - Task Columns -->
    <div v-else class="row-2" @dragover.prevent @drop.prevent>
      <TaskColumn
        v-for="column in columns"
        :key="column.status"
        :title="column.title"
        :status="column.status"
        :tasks="getTasksByStatus(column.status)"
        @task-dropped="handleTaskDrop"
        @edit-task="openEditModal"
        @delete-task="confirmDeleteTask"
      />
    </div>

    <!-- Task Modal -->
    <Dialog v-model:visible="showModal" :header="modalTitle" :modal="true" :style="{ width: '500px' }" :closable="!saving">
      <div class="p-fluid">
        <div class="field">
          <label for="taskName" class="required form-label">Task Title</label>
          <InputText
            id="taskName"
            v-model="taskForm.taskName"
            placeholder="Enter task title"
            :class="{ 'p-invalid': !taskForm.taskName.trim() && formSubmitted }"
            class="form-input"
            @input="limitTaskName"
          />
          <div class="flex-counter">
            <small v-if="!taskForm.taskName.trim() && formSubmitted" class="p-error error-message">Task title is required</small>
            <div class="char-counter header-counter">
              {{ taskForm.taskName.length }}/100
              <span v-if="taskForm.taskName.length >= 100" class="char-limit-warning">Character limit reached</span>
            </div>
          </div>
        </div>

        <div class="field">
          <label for="description" class="required form-label">Description</label>
          <Textarea
            id="description"
            v-model="taskForm.description"
            rows="4"
            placeholder="Enter task description"
            class="form-input"
            @input="limitDescription"
          />
          <div class="flex-counter">
            <small v-if="!taskForm.description.trim() && formSubmitted" class="p-error error-message">Task description is required</small>
            <div class="char-counter description-counter">
            {{ taskForm.description.length }}/250
            <span v-if="taskForm.description.length >= 250" class="char-limit-warning">Character limit reached</span>
            </div>
          </div>
        </div>

        <div class="field">
          <label for="status" class="required form-label">Status</label>
          <Dropdown
            id="status"
            v-model="taskForm.status"
            :options="statusOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Select Status"
            :class="{ 'p-invalid': !taskForm.status && formSubmitted }"
            class="form-input"
          />
          <small v-if="!taskForm.status && formSubmitted" class="p-error">Status is required</small>
        </div>

        <div class="field">
          <label for="dueDate" class="form-label">Due Date</label>
          <div class="calendar-wrapper">
            <Calendar
              id="dueDate"
              v-model="taskForm.dueDate"
              :showIcon="true"
              dateFormat="yy-mm-dd"
              :minDate="new Date()"
              placeholder="Select due date"
              inputClass="form-input calendar-input"
            />
          </div>
        </div>
      </div>

      <template #footer>
        <Button label="Cancel" icon="pi pi-times" @click="closeModal" class="p-button-text" :disabled="saving" />
        <Button
          :label="isEditing ? 'Update' : 'Create'"
          icon="pi pi-check"
          @click="saveTask"
          autofocus
          :loading="saving"
          :disabled="taskForm.taskName.length > 100 || taskForm.description.length > 250"
        />
      </template>
    </Dialog>

    <!-- Toast for notifications -->
    <Toast />
    <ConfirmDialog />
  </div>
</template>

<script>
import TaskColumn from "@/components/contents/TaskColumn.vue";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import Dropdown from "primevue/dropdown";
import Calendar from "primevue/calendar";
import Toast from "primevue/toast";
import ConfirmDialog from "primevue/confirmdialog";
import ProgressSpinner from "primevue/progressspinner";
import { useConfirm } from "primevue/useconfirm";
import { getTasks, createTask, updateTask, deleteTask } from "@/api/tasks.js";
import { TaskModel } from "@/models/TaskModel";
import { toast } from "@/utils/toast";

export default {
  name: "TaskManagerView",
  components: {
    TaskColumn,
    Button,
    Dialog,
    InputText,
    Textarea,
    Dropdown,
    Calendar,
    Toast,
    ConfirmDialog,
    ProgressSpinner,
  },
  data() {
    return {
      showModal: false,
      isEditing: false,
      editingTaskId: null,
      sortAsc: true,
      loading: false,
      saving: false,
      error: null,
      formSubmitted: false,
      taskForm: { ...TaskModel },
      statusOptions: [
        { label: "Pending", value: "pending" },
        { label: "In Progress", value: "in-progress" },
        { label: "Completed", value: "completed" },
        { label: "Cancelled", value: "cancelled" },
      ],
      tasks: [],
      columns: [
        { title: "Pending", status: "pending" },
        { title: "In Progress", status: "in-progress" },
        { title: "Completed", status: "completed" },
        { title: "Cancelled", status: "cancelled" },
      ],
      draggedTaskId: null,
    };
  },
  computed: {
    modalTitle() {
      return this.isEditing ? "Edit Task" : "Add New Task";
    },
    isFormValid() {
      return (
        this.taskForm.taskName.trim() &&
        this.taskForm.description.trim() &&
        this.taskForm.status &&
        this.taskForm.taskName.length <= 100 &&
        this.taskForm.description.length <= 250
      );
    },
  },
  created() {
    this.fetchTasks();
  },
  methods: {
    async fetchTasks() {
      this.loading = true;
      this.error = null;

      try {
        const response = await getTasks();
        this.tasks = response.data;
        toast.success("Success", "Tasks loaded successfully", 2000);
      } catch (err) {
        console.error("Error fetching tasks:", err);
        this.error = "Failed to load tasks. Please try again.";
        toast.error("Error", "Failed to load tasks");
      } finally {
        this.loading = false;
      }
    },

    getTasksByStatus(status) {
      const filtered = this.tasks.filter((task) => task.status === status);
      return filtered.sort((a, b) => {
        const dateA = new Date(a.dueDate || "9999-12-31");
        const dateB = new Date(b.dueDate || "9999-12-31");
        return this.sortAsc ? dateA - dateB : dateB - dateA;
      });
    },

    openTaskModal() {
      this.isEditing = false;
      this.editingTaskId = null;
      this.resetTaskForm();
      this.showModal = true;
      this.formSubmitted = false;
    },

    openEditModal(task) {
      this.isEditing = true;
      this.editingTaskId = task.id;
      this.taskForm = {
        taskName: task.taskName || task.title || "",
        description: task.description || task.details || "",
        status: task.status || "pending",
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
      };
      if (this.taskForm.taskName.length > 100) {
        this.taskForm.taskName = this.taskForm.taskName.substring(0, 100);
      }
      if (this.taskForm.description.length > 250) {
        this.taskForm.description = this.taskForm.description.substring(0, 250);
      }
      this.showModal = true;
      this.formSubmitted = false;
    },

    resetTaskForm() {
      this.taskForm = { ...TaskModel };
    },

    closeModal() {
      this.showModal = false;
      this.resetTaskForm();
      this.formSubmitted = false;
    },

    limitTaskName() {
      if (this.taskForm.taskName.length > 100) {
        this.taskForm.taskName = this.taskForm.taskName.substring(0, 100);
        toast.warn("Character Limit", "Task title limited to 100 characters", 2000);
      }
    },

    limitDescription() {
      if (this.taskForm.description.length > 250) {
        this.taskForm.description = this.taskForm.description.substring(0, 250);
        toast.warn("Character Limit", "Description limited to 250 characters", 2000);
      }
    },

    async saveTask() {
      this.formSubmitted = true;

      if (!this.isFormValid) {
        let errorMessage = "Please fix the following issues:";
        if (!this.taskForm.taskName.trim()) errorMessage += "\n• Task title is required";
        if (!this.taskForm.description.trim()) errorMessage += "\n• Task description is required";
        if (!this.taskForm.status) errorMessage += "\n• Status is required";
        if (this.taskForm.taskName.length > 100) errorMessage += "\n• Task title exceeds 100 characters";
        if (this.taskForm.description.length > 250) errorMessage += "\n• Description exceeds 250 characters";

        toast.warn("Validation Error", errorMessage, 4000);
        return;
      }

      this.saving = true;

      try {
        const taskData = {
          taskName: this.taskForm.taskName.trim(),
          description: this.taskForm.description.trim(),
          status: this.taskForm.status,
          dueDate: this.formatDate(this.taskForm.dueDate),
        };

        if (this.isEditing) {
          await updateTask(this.editingTaskId, taskData);
          await this.fetchTasks();
          toast.success("Success", "Task updated successfully");
        } else {
          await createTask(taskData);
          await this.fetchTasks();
          toast.success("Success", "Task created successfully");
        }

        this.closeModal();
      } catch (err) {
        console.error("Error saving task:", err);
        toast.error("Error", err.response?.data?.message || "Failed to save task");
      } finally {
        this.saving = false;
      }
    },

    confirmDeleteTask(task) {
      this.$confirm.require({
        message: `Are you sure you want to delete "${task.taskName || task.title}"?`,
        header: "Confirm Deletion",
        icon: "pi pi-exclamation-triangle",
        acceptClass: "p-button-danger",
        accept: async () => {
          await this.deleteTask(task.id);
        },
      });
    },

    async deleteTask(taskId) {
      try {
        await deleteTask(taskId);
        await this.fetchTasks();
        toast.error("Deleted", "Task deleted successfully");
      } catch (err) {
        console.error("Error deleting task:", err);
        toast.error("Error", err.response?.data?.message || "Failed to delete task");
      }
    },

    async handleTaskDrop(event) {
      const { taskId, newStatus } = event;
      const task = this.tasks.find((t) => t.id === taskId);

      if (!task || task.status === newStatus) return;

      const oldStatus = task.status;

      try {
        task.status = newStatus;
        await updateTask(taskId, {
          ...task,
          status: newStatus,
        });

        toast.info("Status Updated", `Task "${task.taskName || task.title}" moved to ${newStatus}`, 2000);
      } catch (err) {
        console.error("Error updating task status:", err);
        task.status = oldStatus;
        toast.error("Error", "Failed to update task status");
      }
    },

    toggleSort() {
      this.sortAsc = !this.sortAsc;
      toast.info("Sort Changed", this.sortAsc ? "Sorting ascending by due date" : "Sorting descending by due date", 2000);
    },

    formatDate(date) {
      if (!date) return "";
      const d = new Date(date);
      return d.toISOString().split("T")[0];
    },
  },
  mounted() {
    toast.init();
    this.$confirm = useConfirm();
  },
};
</script>

<style lang="scss">
@use "@/assets/View/task-manager-view.scss";
</style>