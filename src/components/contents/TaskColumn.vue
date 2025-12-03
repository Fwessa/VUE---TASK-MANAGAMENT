<template>
  <div
    class="task-column"
    @dragover="handleDragOver"
    @dragenter="handleDragEnter"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
    :class="[`status-${status}`, { 'drag-over': isDragOver }]"
  >
    <div class="column-header">
      <h3>{{ title }}</h3>
      <span class="task-count">{{ tasks.length }}</span>
    </div>

    <ScrollPanel class="tasks-container" style="height: 400px;">
      <div
        v-for="task in tasks"
        :key="task.id"
        class="task-card"
        draggable="true"
        @dragstart="handleDragStart($event, task)"
        @dragend="handleDragEnd"
      >
        <div class="task-header">
          
          <h4 class="task-title">
            {{ truncateText(task.taskName || task.title, 100) }}
          </h4>
          <Button
            icon="pi pi-ellipsis-v"
            @click.stop="toggleDropdown(task.id)"
            class="p-button-text p-button-rounded"
          />
          <div v-if="activeDropdown === task.id" class="dropdown-menu">
            <Button
              icon="pi pi-pencil"
              label="Edit"
              @click.stop="editTask(task)"
              class="p-button-text p-button-sm"
            />
            <Button
              icon="pi pi-trash"
              label="Delete"
              @click.stop="deleteTask(task)"
              class="p-button-text p-button-sm p-button-danger"
            />
          </div>
        </div>

        <p class="task-description">
          {{ truncateText(task.description || task.details, 250) }}
        </p>

        <div class="task-footer">
          <span v-if="task.dueDate" class="due-date">
            <i class="pi pi-calendar mr-1"></i>
            {{ formatDate(task.dueDate) }}
          </span>
          <span v-else class="due-date">
            <i class="pi pi-calendar mr-1"></i>
            No due date
          </span>
          <Tag
            :value="task.status"
            :severity="getStatusSeverity(task.status)"
          />
        </div>
      </div>

      <div v-if="tasks.length === 0" class="empty-state">
        <i class="pi pi-inbox" style="font-size: 2rem; color: #9ca3af"></i>
        <p>No tasks</p>
      </div>
    </ScrollPanel>
  </div>
</template>

<script>
import Button from "primevue/button";
import Tag from "primevue/tag";
import ScrollPanel from "primevue/scrollpanel";


export default {
  name: "TaskColumn",
  components: {
    Button,
    Tag,
    ScrollPanel,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    tasks: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      activeDropdown: null,
      isDragOver: false,
    };
  },
  methods: {
    
    handleDragStart(event, task) {
      event.dataTransfer.setData(
        "application/json",
        JSON.stringify({
          id: task.id,
          fromStatus: this.status,
          taskName: task.taskName || task.title,
        })
      );
      event.dataTransfer.effectAllowed = "move";

      event.target.classList.add("dragging");

      setTimeout(() => {
        event.target.style.opacity = "0.4";
      }, 0);
    },

    handleDragEnd(event) {

      document.querySelectorAll(".task-card").forEach((card) => {
        card.classList.remove("dragging");
        card.style.opacity = "1";
      });
      this.isDragOver = false;
    },

    handleDragOver(event) {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      this.isDragOver = true;
    },

    handleDragEnter(event) {
      event.preventDefault();
      this.isDragOver = true;
    },

    handleDragLeave(event) {
      if (!event.currentTarget.contains(event.relatedTarget)) {
        this.isDragOver = false;
      }
    },

    handleDrop(event) {
      event.preventDefault();
      this.isDragOver = false;

      try {
        const data = JSON.parse(event.dataTransfer.getData("application/json"));

        if (data && data.id && data.fromStatus !== this.status) {
          this.$emit("task-dropped", {
            taskId: data.id,
            newStatus: this.status,
          });
        }
      } catch (error) {
        console.error("Error parsing drag data:", error);
      }

      this.activeDropdown = null;
    },

    editTask(task) {
      this.$emit("edit-task", task);
      this.closeDropdown();
    },

    deleteTask(task) {
      this.$emit("delete-task", task);
      this.closeDropdown();
    },

    toggleDropdown(taskId) {
      this.activeDropdown = this.activeDropdown === taskId ? null : taskId;
    },

    closeDropdown() {
      this.activeDropdown = null;
    },

    formatDate(dateString) {
      if (!dateString) return "No date";
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    },

    getStatusSeverity(status) {
      switch (status) {
        case "pending":
          return "warning";
        case "in-progress":
          return "info";
        case "completed":
          return "success";
        case "cancelled":
          return "danger";
        default:
          return "secondary";
      }
    },

    truncateText(text, maxLength) {
      if (!text) return "";
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + "...";
    },
  },
};
</script>

<style lang="scss">
@use "@/assets/Body/task-column.scss";
</style>
