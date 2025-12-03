import { vi } from "vitest";

// mock PrimeVue Button
vi.mock("primevue/button", () => ({
  default: {
    name: "Button",
    render() { return null; }
  }
}));

// mock PrimeVue Tag
vi.mock("primevue/tag", () => ({
  default: {
    name: "Tag",
    render() { return null; }
  }
}));

// mock ScrollPanel
vi.mock("primevue/scrollpanel", () => ({
  default: {
    name: "ScrollPanel",
    render() { return null; }
  }
}));
