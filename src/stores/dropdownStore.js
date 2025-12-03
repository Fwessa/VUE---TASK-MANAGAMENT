import { defineStore } from "pinia";

export const useDropdownStore = defineStore("dropdown", {
  state: () => ({
    activeDropdown: null
  }),

  actions: {
    toggle(id) {
      this.activeDropdown = this.activeDropdown === id ? null : id;
    },

    close() {
      this.activeDropdown = null;
    }
  }
});
