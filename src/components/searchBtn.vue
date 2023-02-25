<template>
  <div class="searchMic">
    <el-input
      type="success"
      v-model="nameMic"
      placeholder="search..."
      :suffix-icon="Search"
      @change="searchBtn"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";
import { Search } from "@element-plus/icons-vue";

let nameMic = ref("");
let songEmits = defineEmits(["song"]);
function searchBtn() {
  songEmits("song", nameMic);
}
</script>
<style lang="less" scoped>
.searchMic {
  display: flex;
  margin: 50px auto 0px;
  width: 500px;
  transform: translateY(400%) scale(1);
  transition: transform 0.3s ease-out;
  :deep(.el-input__wrapper) {
    border: 1px solid #e9e9eb;
    border-radius: 30px;
    padding: 5px 15px;
  }
}
.active {
  transform: translateY(0) scale(0.9);
}
</style>
