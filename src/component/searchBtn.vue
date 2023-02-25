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

function searchBtn() {}
</script>
<style lang="less">
.searchMic {
  display: flex;
  margin: auto;
  width: 500px;
}
</style>
