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
    default: "error", // 'error' | 'info' | 'success' | 'warn'
  },
  title: {
    type: String,
    default: "Alert",
  },
  message: {
    type: String,
    default: "",
  },
  okLabel: {
    type: String,
    default: "OK",
  },
});

const emit = defineEmits(["update:visible", "close"]);

function close() {
  emit("update:visible", false);
  emit("close");
}

const iconClassMap = {
  error: "pi-times-circle",
  warn: "pi-exclamation-triangle",
  info: "pi-info-circle",
  success: "pi-check-circle",
};
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    :closable="false"
    :draggable="false"
    :style="{ width: '22rem' }"
    appendTo="body"
    class="alert-card-dialog"
    @hide="close"
  >
    <div class="alert-card">
      <div class="alert-card__icon" :data-severity="severity">
        <i class="pi" :class="iconClassMap[severity] || iconClassMap.error"></i>
      </div>

      <div class="alert-card__content">
        <h4 class="alert-card__title">{{ title }}</h4>
        <p class="alert-card__message">{{ message }}</p>
      </div>
    </div>

    <template #footer>
      <Button :label="okLabel" icon="pi pi-check" @click="close" />
    </template>
  </Dialog>
</template>

<style scoped lang="scss">
@use "@/assets/Body/alertcard.scss";
</style>
