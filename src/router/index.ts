import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/login",
      component: () => import("@/views/login/loginPage.vue"),
    },
    {
      path: "/",
      component: () => import("@/views/layout/layoutPage.vue"),
      redirect: "/home",
      children: [
        { path: "/home", component: () => import("@/views/home/homePage.vue") },
        { path: "/user", component: () => import("@/views/user/userPage.vue") },
        { path: "/public", component: () => import("@/views/public/publicPage.vue") },
        { path: "/search", component: () => import("@/views/search/searchPage.vue") },
        { path: "/admin", component: () => import("@/views/admin/adminPage.vue") },
      ],
    },
  ],
});

export default router;
