<template>
  <div class="searchMusic">
    <searchBtn @song="searchMic" :class="{ active: list }" />
    <transition name="list">
      <el-card shadow="never" v-show="list">
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
          :pager-count="7"
          :page-count="pageinfo.num"
          layout="total, prev, pager, next"
          :total="pageinfo.total"
          :hide-on-single-page="pageinfo.ishide"
          @current-change="handleCurrentChange"
        />
      </el-card>
    </transition>
    <el-backtop :right="100" :bottom="100" :visibility-height="100" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useRequest } from "../utils/request";
import searchBtn from "../components/searchBtn.vue";
import { ElMessage } from "element-plus";
const router = useRouter();
const route = useRoute();
const { execute } = useRequest();
let list = ref(false); // 是否显示歌曲列表
let pageinfo = reactive({
  current: 1,
  ishide: true,
  total: 0,
  num: 0,
  size: 30
}); // 分页信息
let arrMic = reactive({});
let songs = ref({});
let songSelect = ref({}); // head：搜索的歌曲名称
onMounted(() => {
  if (route.query?.name) {
    list.value = true;
    songSelect.value = route.query.name;
    searchMic();
  }
});
async function searchMic(v) {
  songSelect.value = v?.value ?? songSelect.value;
  arrMic = await execute("http://localhost:3000/search", {
    params: {
      keywords: songSelect.value,
      offset: pageinfo.current - 1
    }
  });
  /*请求失败提醒 */
  if (arrMic.value?.data.code != 200) {
    console.log(arrMic.value?.code);
    ElMessage.error("Oops:搜索歌曲失败.");
    return;
  }
  list.value = true;
  songs.value = arrMic.value.data.result.songs;
  pageinfo.total = arrMic.value.data.result.songCount;
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
  let micMp3 = await execute("http://localhost:3000/song/url/v1", {
    params: {
      id: mid,
      level: "exhigh"
    }
  });
  /*请求失败提醒 */
  if (micMp3.value?.data.code != 200) {
    ElMessage.error("Oops:无法获取歌曲资源.");
    return;
  }

  let mp3 = micMp3.value.data.data[0].url;
  sessionStorage.setItem("url", mp3);
  router.push({ name: "play", query: { id: mid, name: songSelect.value } });
};
// 分页
const handleCurrentChange = val => {
  pageinfo.current = val;
  searchMic();
};
</script>
<style lang="less" scoped>
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
