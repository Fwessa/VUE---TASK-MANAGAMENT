<script setup>
import Dialog from "primevue/dialog";
import Button from "primevue/button";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  severity: {
    type: String,
    default: "default", // 'default' | 'danger' | 'warn'
  },
  title: {
    type: String,
    default: "Are you sure?",
  },
  message: {
    type: String,
    default: "",
  },
  confirmLabel: {
    type: String,
    default: "Yes",
  },
  cancelLabel: {
    type: String,
    default: "Cancel",
  },
});

const emit = defineEmits(["update:visible", "confirm", "cancel"]);

function close() {
  emit("update:visible", false);
}

function onCancel() {
  emit("cancel");
  close();
}

function onConfirm() {
  emit("confirm");
  close();
}
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    :closable="false"
    :draggable="false"
    :style="{ width: '24rem' }"
    class="confirm-card-dialog"
    @hide="close"
  >
    <div class="confirm-card">
      <div class="confirm-card__icon" :data-severity="severity">
        <i class="pi pi-question-circle"></i>
      </div>

      <div class="confirm-card__content">
        <h4 class="confirm-card__title">{{ title }}</h4>
        <p class="confirm-card__message">{{ message }}</p>
      </div>
    </div>

    <template #footer>
      <Button
        :label="cancelLabel"
        class="p-button-text"
        icon="pi pi-times"
        @click="onCancel"
      />
      <Button
        :label="confirmLabel"
        icon="pi pi-check"
        :class="{
          'p-button-danger': severity === 'danger',
          'p-button-warning': severity === 'warn',
        }"
        @click="onConfirm"
      />
    </template>
  </Dialog>
</template>

<style scoped lang="scss">
@use "@/assets/Body/confirmationcard.scss";
</style>