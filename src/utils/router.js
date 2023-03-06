import { createRouter, createWebHashHistory } from "vue-router";
import searchMusic from "@/pages/searchMusic.vue";
import playMusic from "@/pages/playMusic.vue";
const routes = [
  { path: "/", component: searchMusic },
  { path: "/playing", component: playMusic }
];
const router = createRouter({
  // 4. 内部提供了 history 模式的实现。为了简单起见，我们在这里使用 hash 模式。
  history: createWebHashHistory(),
  routes // `routes: routes` 的缩写
});

export default router;
