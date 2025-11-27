<script setup>
import { ref, watch } from "vue";
import Button from "primevue/button";

import AlertCard from "@/components/contents/AlertCard.vue";
import ConfirmCard from "@/components/contents/ConfirmationCard.vue";

const props = defineProps({
  mode: {
    type: String,
    default: "add",
  },
  task: {
    type: Object,
    required: true,
  },
  submitLabel: {
    type: String,
    default: "Save",
  },
});

const emit = defineEmits(["submit", "cancel"]);

const MAX_TITLE = 75;
const MAX_DESC = 250;

// LOCAL FORM
const formTask = ref({ ...props.task });

// COUNTERS
const titleCount = ref(formTask.value.taskName?.length || 0);
const descCount = ref(formTask.value.description?.length || 0);

// ALERT STATE
const showAlert = ref(false);
const alertMessage = ref("");

// CONFIRM STATE (FOR SAVE)
const showConfirmSave = ref(false);

// show alert modal
function triggerAlert(message) {
  alertMessage.value = message;
  showAlert.value = true;
}

// Sync when editing
watch(
  () => props.task,
  (newVal) => {
    formTask.value = { ...newVal };
    titleCount.value = newVal.taskName?.length || 0;
    descCount.value = newVal.description?.length || 0;
  },
  { deep: true }
);

// --- TITLE INPUT ---
function updateTitle(e) {
  let value = e.target.value;

  if (value.length > MAX_TITLE) {
    value = value.substring(0, MAX_TITLE);
  }

  formTask.value.taskName = value;
  titleCount.value = value.length;
}

// --- DESCRIPTION INPUT ---
function updateDescription(e) {
  let value = e.target.value;

  if (value.length > MAX_DESC) {
    value = value.substring(0, MAX_DESC);
  }

  formTask.value.description = value;
  descCount.value = value.length;
}

// --- SAVE CLICKED ---
function handleSaveClicked() {
  // validation first
  if (!formTask.value.taskName) {
    return triggerAlert("Task name is required.");
  }

  if (formTask.value.taskName.length > MAX_TITLE) {
    return triggerAlert(`Task name must not exceed ${MAX_TITLE} characters.`);
  }

  if (formTask.value.description.length > MAX_DESC) {
    return triggerAlert(`Description must not exceed ${MAX_DESC} characters.`);
  }

  if (!formTask.value.dueDate) {
    return triggerAlert("Due date is required.");
  }

  // VALID → now ask confirmation
  showConfirmSave.value = true;
}

// --- CONFIRM SAVE ---
function confirmSave() {
  showConfirmSave.value = false;
  emit("submit", { ...formTask.value });
}

function handleCancel() {
  emit("cancel");
}
</script>

<template>
  <!-- MODAL OVERLAY -->
  <div class="modal-overlay">
    <div class="input-card">
      <h4>{{ mode === "edit" ? "Edit Task" : "Add Task" }}</h4>

      <!-- TITLE -->
      <div class="form-row">
        <label>Task Name</label>

        <input
          :value="formTask.taskName"
          @input="updateTitle"
          type="text"
          maxlength="75"
          :class="{ 'invalid-field': titleCount >= MAX_TITLE }"
        />

        <div
          class="char-counter"
          :class="{ 'over-limit': titleCount >= MAX_TITLE }"
        >
          {{ titleCount }} / {{ MAX_TITLE }}
        </div>
      </div>

      <!-- DESCRIPTION -->
      <div class="form-row">
        <label>Description</label>

        <textarea
          :value="formTask.description"
          @input="updateDescription"
          rows="5"
          maxlength="250"
          :class="{ 'invalid-field': descCount >= MAX_DESC }"
        />

        <div
          class="char-counter"
          :class="{ 'over-limit': descCount >= MAX_DESC }"
        >
          {{ descCount }} / {{ MAX_DESC }}
        </div>
      </div>

      <!-- STATUS -->
      <div class="form-row">
        <label>Status</label>
        <select v-model="formTask.status">
          <option value="pending">Pending</option>
          <option value="in progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <!-- DATE -->
      <div class="form-row">
        <label>Due Date</label>
        <input v-model="formTask.dueDate" type="date" />
      </div>

      <!-- ACTIONS -->
      <div class="form-actions">
        <Button :label="submitLabel" icon="pi pi-check" @click="handleSaveClicked" />
        <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="handleCancel" />
      </div>
    </div>
  </div>

  <!-- ALERT -->
  <AlertCard
    v-model:visible="showAlert"
    severity="error"
    title="Input Error"
    :message="alertMessage"
  />

  <!-- CONFIRM SAVE -->
  <ConfirmCard
    v-model:visible="showConfirmSave"
    severity="info"
    title="Confirm Save"
    message="Do you want to save this task?"
    confirmLabel="Save"
    cancelLabel="Cancel"
    @confirm="confirmSave"
  />
</template>

<style scoped lang="scss">
@use "@/assets/Body/inputcard.scss";
</style>
