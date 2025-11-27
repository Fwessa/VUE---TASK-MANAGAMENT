import { createRouter, createWebHistory } from "vue-router";
import TaskManagerView from "@/views/TaskManagerView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
     {
      path: '/',
      redirect: '/tasks'
    },
    {
      path: '/tasks',
      name: 'tasks',
      component: TaskManagerView
    }
  ],
});

export default router;
