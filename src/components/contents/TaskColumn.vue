<script setup>
import Panel from "primevue/panel";
import draggable from "vuedraggable";
import TaskCard from "@/components/contents/TaskCard.vue";

const props = defineProps({
  header: { type: String, required: true },
  status: { type: String, required: true }, // 'pending', 'inProgress', etc.
  bgColor: { type: String, default: "#fff" },
  tasks: { type: Array, default: () => [] }, 
});

const emit = defineEmits(["drop", "edit-task", "delete-task"]);

const dragOptions = {
  animation: 200,
  group: "tasks",
  ghostClass: "drag-ghost",
  dragClass: "dragging",
  chosenClass: "drag-chosen",
};

function handleDrop(event) {
  emit("drop", { status: props.status, event });
}

function handleEdit(task) {
  emit("edit-task", task);
}

function handleDelete(task) {
  emit("delete-task", task);
}
</script>

<template>
  <Panel
    class="panel-inside"
    :header="header"
    :style="{ backgroundColor: bgColor }"
  >
    <draggable
      :list="tasks"          
      v-bind="dragOptions"
      item-key="id"
      class="tasks-list"
      @change="handleDrop"
    >
      <template #item="{ element }">
        <div class="drag-wrapper">
          <TaskCard
            :title="element.taskName"
            :content="element.description"
            :dueDate="element.dueDate"
            @edit="handleEdit(element)"
            @delete="handleDelete(element)"
          />
        </div>
      </template>
    </draggable>
  </Panel>
</template>

<style lang="scss"></style>