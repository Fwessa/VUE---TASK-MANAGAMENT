<script setup>
import { ref } from "vue";
import "primeicons/primeicons.css";

import ConfirmCard from "@/components/contents/ConfirmationCard.vue";

const props = defineProps({
  title: { type: String, required: true },
  content: { type: String, required: true },
  dueDate: { type: String, required: true },
});

const isCollapsed = ref(false);
const emit = defineEmits(["edit", "delete"]);

const toggle = () => {
  isCollapsed.value = !isCollapsed.value;
};

// CONFIRM STATE
const showConfirmDelete = ref(false);

function onDeleteClick() {
  showConfirmDelete.value = true;
}

function confirmDelete() {
  emit("delete");
}

const onEdit = () => emit("edit");
</script>

<template>
  <!-- MAIN -->
  <div class="task-card-wrapper" draggable="true">
    <!-- CARD BODY -->
    <div class="task-card">
      <div class="task-card__header" @click="toggle">
        <div class="task-card__title">{{ title }}</div>
        <i
          class="pi"
          :class="isCollapsed ? 'pi-chevron-down' : 'pi-chevron-up'"
        ></i>
      </div>

      <transition name="fade">
        <div v-if="!isCollapsed" class="task-card__body">
          <p class="task-card__content">{{ content }}</p>

          <div class="task-card__footer">
            <div class="task-card__actions">
              <button class="icon-btn" @click.stop="onEdit">
                <i class="pi pi-pencil"></i>
              </button>
              <button class="icon-btn delete" @click.stop="onDeleteClick">
                <i class="pi pi-trash"></i>
              </button>
            </div>

            <div class="task-card__date">Due Date: {{ dueDate }}</div>
          </div>
        </div>
      </transition>
    </div>

    <!-- CONFIRM DIALOGUE -->
    <ConfirmCard
      v-model:visible="showConfirmDelete"
      severity="danger"
      title="Delete Task?"
      :message="`Are you sure you want to delete '${title}'?`"
      confirmLabel="Delete"
      cancelLabel="Cancel"
      @confirm="confirmDelete"
    />
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/Body/taskcard.scss";
</style>
