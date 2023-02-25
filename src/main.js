import { createApp } from "vue";
import App from "./App.vue";
//import "lib-flexible";
//import "./assets/main.css";
//import "normalize.css/normalize.css";
import "./assets/style.css";
import "element-plus/dist/index.css";
import router from "./utils/router";

createApp(App).use(router).mount("#app");
