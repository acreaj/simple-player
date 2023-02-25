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
  songEmits("song", nameMic.value);
}
</script>
<style lang="less" scoped>
.searchMic {
  display: flex;
  margin: auto;
  width: 500px;
  :deep(.el-input__wrapper) {
    box-shadow: none;
    border: 1px solid #e9e9eb;
    border-radius: 30px;
    padding: 5px 15px;
  }
}
</style>
