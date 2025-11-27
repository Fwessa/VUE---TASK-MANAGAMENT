// default empty task model (for forms)
export const TaskModel = {
  taskName: "",
  description: "",
  status: "pending", 
  dueDate: ""
};

// optional: function to create a new task instance
export function createTaskModel() {
  return {
    taskName: "",
    description: "",
    status: "pending",
    dueDate: ""
  };
}
