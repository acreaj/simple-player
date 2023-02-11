import { fileURLToPath, URL } from "node:url";
import legacy from "@vitejs/plugin-legacy";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/,
export default defineConfig({
  base: "./",
  plugins: [
    vue(),
    legacy({
      // 设置目标浏览器，browserslist 配置语法
      targets: ["ie >= 11"]
    })
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url))
    }
  }
});
