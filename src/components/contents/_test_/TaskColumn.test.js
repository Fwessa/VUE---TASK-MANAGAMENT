import { mount } from "@vue/test-utils";
import TaskColumn from "../TaskColumn.vue";
import Button from "primevue/button";
import Tag from "primevue/tag";
import ScrollPanel from "primevue/scrollpanel";

// Mock PrimeVue components
vi.mock("primevue/button", () => ({ default: { template: "<button><slot/></button>" } }));
vi.mock("primevue/tag", () => ({ default: { template: "<span><slot/></span>" } }));
vi.mock("primevue/scrollpanel", () => ({ default: { template: "<div><slot/></div>" } }));

describe("TaskColumn.vue", () => {
  // Mock task data
  const mockTask = {
    id: "ca36",
    taskName: "Design Homepage Mockup",
    description: "Create wireframes and mockups for the new homepage design",
    status: "pending",
    dueDate: "2025-12-05"
  };

  const mockTasks = [
    mockTask,
    {
      id: "ca37",
      taskName: "Fix Login Bug",
      description: "Resolve authentication issue",
      status: "in-progress",
      dueDate: "2025-12-10"
    },
    {
      id: "ca38",
      taskName: "Write Documentation",
      description: "Document API endpoints",
      status: "completed",
      dueDate: "2025-12-01"
    }
  ];

  // Test 1: Basic rendering
  describe("Basic rendering", () => {
    test("renders column title and task count", () => {
      const wrapper = mount(TaskColumn, {
        props: {
          title: "Pending Tasks",
          status: "pending",
          tasks: mockTasks
        }
      });

      expect(wrapper.find("h3").text()).toBe("Pending Tasks");
      expect(wrapper.find(".task-count").text()).toBe("3");
    });

    test("applies correct CSS classes based on status", () => {
      const wrapper = mount(TaskColumn, {
        props: {
          title: "Test Column",
          status: "pending",
          tasks: []
        }
      });

      expect(wrapper.classes()).toContain("task-column");
      expect(wrapper.classes()).toContain("status-pending");
    });
  });

  // Test 2: Task rendering
  describe("Task rendering", () => {
    test("renders task cards with correct content", () => {
      const wrapper = mount(TaskColumn, {
        props: {
          title: "Test Column",
          status: "pending",
          tasks: [mockTask]
        }
      });

      const taskCard = wrapper.find(".task-card");
      expect(taskCard.exists()).toBe(true);

      // Check task title (with truncation)
      expect(taskCard.find(".task-title").text()).toContain("Design Homepage Mockup");
      
      // Check description
      expect(taskCard.find(".task-description").text()).toContain("Create wireframes");
      
      // Check formatted date
      expect(taskCard.find(".due-date").text()).toContain("Dec 5, 2025");
      
      // Check status tag
      const tag = taskCard.findComponent(Tag);
      expect(tag.props("value")).toBe("pending");
      expect(tag.props("severity")).toBe("warning");
    });

    test("renders task with no due date", () => {
      const taskWithoutDate = {
        ...mockTask,
        dueDate: null
      };

      const wrapper = mount(TaskColumn, {
        props: {
          title: "Test Column",
          status: "pending",
          tasks: [taskWithoutDate]
        }
      });

      expect(wrapper.find(".due-date").text()).toContain("No due date");
    });

    test("truncates long text", () => {
      const longTask = {
        ...mockTask,
        taskName: "A".repeat(150), // Very long name
        description: "B".repeat(300) // Very long description
      };

      const wrapper = mount(TaskColumn, {
        props: {
          title: "Test Column",
          status: "pending",
          tasks: [longTask]
        }
      });

      const title = wrapper.find(".task-title").text();
      const description = wrapper.find(".task-description").text();

      expect(title.length).toBeLessThanOrEqual(103); // 100 + "..."
      expect(description.length).toBeLessThanOrEqual(253); // 250 + "..."
      expect(title).toContain("...");
      expect(description).toContain("...");
    });

    test("shows empty state when no tasks", () => {
      const wrapper = mount(TaskColumn, {
        props: {
          title: "Empty Column",
          status: "pending",
          tasks: []
        }
      });

      expect(wrapper.find(".empty-state").exists()).toBe(true);
      expect(wrapper.find(".empty-state").text()).toContain("No tasks");
      expect(wrapper.findAll(".task-card")).toHaveLength(0);
    });
  });

  // Test 3: Dropdown functionality
  describe("Dropdown functionality", () => {
    test("shows dropdown menu when ellipsis button is clicked", async () => {
      const wrapper = mount(TaskColumn, {
        props: {
          title: "Test Column",
          status: "pending",
          tasks: [mockTask]
        }
      });

      // Initially dropdown should not be visible
      expect(wrapper.find(".dropdown-menu").exists()).toBe(false);

      // Click the ellipsis button
      const button = wrapper.find(".p-button-rounded");
      await button.trigger("click");

      // Dropdown should now be visible
      expect(wrapper.find(".dropdown-menu").exists()).toBe(true);
      expect(wrapper.vm.activeDropdown).toBe("ca36");
    });

    test("dropdown closes when clicking outside", async () => {
      const wrapper = mount(TaskColumn, {
        props: {
          title: "Test Column",
          status: "pending",
          tasks: [mockTask]
        }
      });

      // Open dropdown
      await wrapper.find(".p-button-rounded").trigger("click");
      expect(wrapper.vm.activeDropdown).toBe("ca36");

      // Click outside (simulate by clicking on column)
      await wrapper.trigger("click");
      expect(wrapper.vm.activeDropdown).toBeNull();
      expect(wrapper.find(".dropdown-menu").exists()).toBe(false);
    });

    test("edit button emits correct event", async () => {
      const wrapper = mount(TaskColumn, {
        props: {
          title: "Test Column",
          status: "pending",
          tasks: [mockTask]
        }
      });

      // Open dropdown
      await wrapper.find(".p-button-rounded").trigger("click");

      // Click edit button
      const editButton = wrapper.find('.dropdown-menu button[label="Edit"]');
      await editButton.trigger("click");

      // Check event emission
      expect(wrapper.emitted("edit-task")).toBeTruthy();
      expect(wrapper.emitted("edit-task")[0]).toEqual([mockTask]);
    });

    test("delete button emits correct event", async () => {
      const wrapper = mount(TaskColumn, {
        props: {
          title: "Test Column",
          status: "pending",
          tasks: [mockTask]
        }
      });

      // Open dropdown
      await wrapper.find(".p-button-rounded").trigger("click");

      // Click delete button
      const deleteButton = wrapper.find('.dropdown-menu button[label="Delete"]');
      await deleteButton.trigger("click");

      // Check event emission
      expect(wrapper.emitted("delete-task")).toBeTruthy();
      expect(wrapper.emitted("delete-task")[0]).toEqual([mockTask]);
    });

    test("only one dropdown opens at a time", async () => {
      const wrapper = mount(TaskColumn, {
        props: {
          title: "Test Column",
          status: "pending",
          tasks: mockTasks
        }
      });

      const buttons = wrapper.findAll(".p-button-rounded");
      
      // Click first task's dropdown
      await buttons[0].trigger("click");
      expect(wrapper.vm.activeDropdown).toBe("ca36");

      // Click second task's dropdown
      await buttons[1].trigger("click");
      expect(wrapper.vm.activeDropdown).toBe("ca37");
      
      // First dropdown should be closed
      const dropdowns = wrapper.findAll(".dropdown-menu");
      expect(dropdowns).toHaveLength(1);
    });
  });

  // Test 4: Drag and drop functionality
  describe("Drag and drop functionality", () => {
    let wrapper;
    let dragEvent;

    beforeEach(() => {
      wrapper = mount(TaskColumn, {
        props: {
          title: "Target Column",
          status: "pending",
          tasks: mockTasks
        }
      });

      dragEvent = {
        preventDefault: vi.fn(),
        dataTransfer: {
          setData: vi.fn(),
          getData: vi.fn(() => JSON.stringify({
            id: "drag-123",
            fromStatus: "completed",
            taskName: "Dragged Task"
          })),
          effectAllowed: '',
          dropEffect: ''
        },
        target: {
          classList: {
            add: vi.fn(),
            remove: vi.fn()
          },
          style: {}
        }
      };
    });

    test("handleDragStart sets correct data", () => {
      const task = mockTask;
      wrapper.vm.handleDragStart(dragEvent, task);

      expect(dragEvent.dataTransfer.setData).toHaveBeenCalledWith(
        "application/json",
        JSON.stringify({
          id: "ca36",
          fromStatus: "pending",
          taskName: "Design Homepage Mockup"
        })
      );
      expect(dragEvent.dataTransfer.effectAllowed).toBe("move");
    });

    test("handleDragOver prevents default and sets drag over state", () => {
      wrapper.vm.handleDragOver(dragEvent);

      expect(dragEvent.preventDefault).toHaveBeenCalled();
      expect(wrapper.vm.isDragOver).toBe(true);
    });

    test("handleDragEnter sets drag over state", () => {
      wrapper.vm.handleDragEnter(dragEvent);
      expect(wrapper.vm.isDragOver).toBe(true);
    });

    test("handleDragLeave clears drag over state", () => {
      wrapper.vm.isDragOver = true;
      
      dragEvent.currentTarget = wrapper.element;
      dragEvent.relatedTarget = null;
      
      wrapper.vm.handleDragLeave(dragEvent);
      expect(wrapper.vm.isDragOver).toBe(false);
    });

    test("handleDrop emits task-dropped event with correct data", () => {
      wrapper.vm.handleDrop(dragEvent);

      expect(wrapper.emitted("task-dropped")).toBeTruthy();
      expect(wrapper.emitted("task-dropped")[0]).toEqual([{
        taskId: "drag-123",
        newStatus: "pending"
      }]);
      expect(wrapper.vm.isDragOver).toBe(false);
      expect(wrapper.vm.activeDropdown).toBeNull();
    });

    test("handleDrop does not emit when dropping from same status", () => {
      dragEvent.dataTransfer.getData = vi.fn(() => JSON.stringify({
        id: "drag-123",
        fromStatus: "pending", // Same as current column
        taskName: "Dragged Task"
      }));

      wrapper.vm.handleDrop(dragEvent);
      expect(wrapper.emitted("task-dropped")).toBeFalsy();
    });

    test("handleDragEnd resets styling", () => {
      const mockCard = {
        classList: {
          remove: vi.fn()
        },
        style: { opacity: "1" }
      };

      // Mock DOM elements
      document.querySelectorAll = vi.fn(() => [mockCard]);

      wrapper.vm.handleDragEnd(dragEvent);

      expect(mockCard.classList.remove).toHaveBeenCalledWith("dragging");
      expect(mockCard.style.opacity).toBe("1");
      expect(wrapper.vm.isDragOver).toBe(false);
    });
  });

  // Test 5: Helper methods
  describe("Helper methods", () => {
    let wrapper;

    beforeEach(() => {
      wrapper = mount(TaskColumn, {
        props: {
          title: "Test Column",
          status: "pending",
          tasks: []
        }
      });
    });

    test("formatDate formats date correctly", () => {
      expect(wrapper.vm.formatDate("2025-12-05")).toBe("Dec 5, 2025");
      expect(wrapper.vm.formatDate(null)).toBe("No date");
      expect(wrapper.vm.formatDate("")).toBe("No date");
    });

    test("getStatusSeverity returns correct PrimeVue severity", () => {
      expect(wrapper.vm.getStatusSeverity("pending")).toBe("warning");
      expect(wrapper.vm.getStatusSeverity("in-progress")).toBe("info");
      expect(wrapper.vm.getStatusSeverity("completed")).toBe("success");
      expect(wrapper.vm.getStatusSeverity("cancelled")).toBe("danger");
      expect(wrapper.vm.getStatusSeverity("unknown")).toBe("secondary");
    });

    test("truncateText truncates long text", () => {
      const longText = "A".repeat(200);
      const truncated = wrapper.vm.truncateText(longText, 100);
      
      expect(truncated.length).toBe(103); // 100 + "..."
      expect(truncated).toContain("...");
    });

    test("truncateText returns full text when short", () => {
      const shortText = "Short text";
      expect(wrapper.vm.truncateText(shortText, 100)).toBe(shortText);
    });

    test("truncateText handles empty/null input", () => {
      expect(wrapper.vm.truncateText(null, 100)).toBe("");
      expect(wrapper.vm.truncateText("", 100)).toBe("");
      expect(wrapper.vm.truncateText(undefined, 100)).toBe("");
    });
  });

  // Test 6: Component reactivity
  describe("Component reactivity", () => {
    test("reacts to prop changes", async () => {
      const wrapper = mount(TaskColumn, {
        props: {
          title: "Initial Title",
          status: "pending",
          tasks: []
        }
      });

      // Change props
      await wrapper.setProps({
        title: "Updated Title",
        status: "completed",
        tasks: mockTasks
      });

      expect(wrapper.find("h3").text()).toBe("Updated Title");
      expect(wrapper.classes()).toContain("status-completed");
      expect(wrapper.findAll(".task-card")).toHaveLength(3);
    });
  });

  // Test 7: Edge cases
  describe("Edge cases", () => {
    test("handles tasks with alternative field names (title/details)", () => {
      const alternativeTask = {
        id: "alt1",
        title: "Alternative Task", // Uses 'title' instead of 'taskName'
        details: "Alternative details", // Uses 'details' instead of 'description'
        status: "pending",
        dueDate: "2025-12-05"
      };

      const wrapper = mount(TaskColumn, {
        props: {
          title: "Test Column",
          status: "pending",
          tasks: [alternativeTask]
        }
      });

      // Should still render without errors
      expect(wrapper.text()).toContain("Alternative Task");
      expect(wrapper.text()).toContain("Alternative details");
    });

    test("handles malformed drag data gracefully", () => {
      const wrapper = mount(TaskColumn, {
        props: {
          title: "Test Column",
          status: "pending",
          tasks: []
        }
      });

      const malformedEvent = {
        preventDefault: vi.fn(),
        dataTransfer: {
          getData: vi.fn(() => "not-valid-json")
        }
      };

      // Should not throw error
      expect(() => wrapper.vm.handleDrop(malformedEvent)).not.toThrow();
    });
  });
});