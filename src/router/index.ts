import { RouteRecordRaw, createRouter, createWebHistory } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    name: "Home",
    path: "/",
    redirect: "/create",
  },
  {
    name: "Create",
    path: "/create",
    component: () => import("@views/ViewCreateAccount.vue"),
  },
  {
    name: "Message",
    path: "/message/:topic",
    component: () => import("@views/ViewMessage.vue"),
  },
  {
    name: "NotFound",
    path: "/:pathMatch(.*)*",
    component: () => import("@views/ViewNotFound.vue"),
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;