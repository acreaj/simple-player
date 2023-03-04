<template>
  <div class="searchMusic">
    <search-btn @song="searchMic" :class="{ active: list }" />
    <transition name="list">
      <el-card shadow="never" v-show="list && !loading">
        <ul>
          <li
            v-for="(song, index) in songs"
            :key="index"
            class="songItem"
            @click="goMusic(song.id)"
          >
            <span class="music">{{ song.name }}</span>
            <span class="singer">------{{ song.artists[0].name }}</span>
          </li>
        </ul>
        <el-divider />
        <el-pagination
          :current-page="pageinfo.current"
          :page-size="pageinfo.size"
          :pager-count="5"
          :page-count="pageinfo.num"
          layout="total, prev, pager, next"
          :total="pageinfo.total"
          :hide-on-single-page="pageinfo.ishide"
          @current-change="handleCurrentChange"
        />
      </el-card>
    </transition>
    <div v-loading="loading" class="content-loading"></div>
    <foot-cop :class="{ active: list == loading }" />
    <el-backtop :right="70" :bottom="100" :visibility-height="100" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useRequest } from "../utils/request";
import searchBtn from "../components/searchBtn.vue";
import footCop from "@/components/footCop.vue";
import { ElMessage } from "element-plus";
const router = useRouter();
const route = useRoute();
const { execute } = useRequest();
let pageinfo = reactive({
  current: 1,
  ishide: true,
  total: 0,
  num: 0,
  size: 30
}); // 分页信息
let songs = ref({});
let songSelect = ref({}); // head：搜索的歌曲名称
let list = ref(false); // 是否显示歌曲列表
let loading = ref(false);
onMounted(() => {
  if (route.query?.name) {
    list.value = true;
    songSelect.value = route.query.name;
    searchMic();
  }
});
async function searchMic(v) {
  list.value = true;
  loading.value = true;
  songSelect.value = v?.value ?? songSelect.value;
  const { data: arrMic } = await execute("http://localhost:3000/search", {
    params: {
      keywords: songSelect.value,
      offset: pageinfo.current - 1
    }
  });
  /*请求失败提醒 */
  if (arrMic.value?.code != 200) {
    console.log(arrMic.value?.code);
    ElMessage.error("Oops:搜索歌曲失败.");
    list.value = false;
    loading.value = false;
    return;
  }
  loading.value = false;
  songs.value = arrMic.value.result.songs;
  pageinfo.total = arrMic.value.result.songCount;
  pageinfo.num = Math.floor(pageinfo.total / pageinfo.size);
  pageinfo.ishide = pageinfo.num > 1 ? false : true;

  // to do/optimize
  /* if (document.scrollingElement.scrollTop > 0) {
    window.screenTop({
      left: 0,
      top: 0,
      behavior: "smooth"
    });
  } */
  // 通过触发回到顶部按钮点击事件
  /* let event = new MouseEvent("click", {
    view: window,
    bubbles: true,
    cancelable: true
  });
  top.value.dispatchEvent(event); */
}

const goMusic = async mid => {
  loading.value = true;
  const { data: micMp3 } = await execute("http://localhost:3000/song/url/v1", {
    params: {
      id: mid,
      level: "exhigh"
    }
  });
  /*请求失败提醒 */
  if (micMp3.value?.code != 200) {
    ElMessage.error("Oops:无法获取歌曲资源.");
    loading.value = false;
    return;
  }
  loading.value = false;
  let mp3 = micMp3.value.data[0].url;
  sessionStorage.setItem("url", mp3);
  router.push({ path: "/playing", query: { id: mid, name: songSelect.value } });
};
// 分页
const handleCurrentChange = val => {
  pageinfo.current = val;
  searchMic();
};
</script>
<style lang="less" scoped>
.content-loading {
  margin: 80px auto;
  width: 900px;
}
.el-card {
  margin: 80px auto;
  width: 900px;
  .songItem {
    margin: 5px 30px;
    padding: 5px 10px;
    border-bottom: 1px dotted #efefef;
    cursor: pointer;
    &:hover {
      color: #409eff;
    }
    .music,
    .singer {
      font-size: 16px;
      color: #303133;
    }
    .singer {
      float: right;
    }
  }
  .el-pagination {
    justify-content: center;
  }
}
.list-enter-active {
  transition: all 0.4s ease-out;
}
.list-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
}
</style>
