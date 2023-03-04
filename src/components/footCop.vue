<template>
  <div class="footer">
    <el-divider>
      <el-icon><star-filled /></el-icon>
    </el-divider>
    <span>you will never be ready.</span>
  </div>
</template>
<script setup>
import { StarFilled } from "@element-plus/icons-vue";
</script>
<style lang="less" scoped>
.footer {
  text-align: center;
  padding-bottom: 15px;
}
.active {
  position: absolute;
  width: 100%;
  bottom: 0;
}
</style>
