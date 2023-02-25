<template>
  <searchBtn @song="searchMic" :class="{ active: true }" />
  <div class="audio-pos">
    <p class="song-name">{{ songName }}</p>
    <audio preload="auto" controls ref="audio" @timeupdate="activeLrc">
      <source :src="mp3" type="audio/mp3" />
      您的浏览器不支持 audio 元素。
    </audio>
  </div>
  <el-card>
    <ul class="lycwrap" ref="lycWrap">
      <li
        v-for="(words, index) in micObj"
        :key="words.text"
        class="lyric"
        :class="{ active: lyricIndex - 1 == index }"
      >
        {{ words.text }}
      </li>
    </ul>
  </el-card>
  <foot-cop />
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useRequest } from "../utils/request";
import searchBtn from "../components/searchBtn.vue";
import footCop from "@/components/footCop.vue";
import { ElMessage, ElNotification } from "element-plus";

const router = useRouter();
const route = useRoute();
const { execute } = useRequest();
let audio = ref(""); //dom
let lycWrap = ref(""); //dom
let mp3 = ref(""); // mp3:url
let songName = ref("无法加载"); // 歌曲名称
let micObj = ref([]); // arr：歌词
let lyricIndex = ref(0); // active：歌词

onMounted(() => {
  mp3.value = sessionStorage.getItem("url");
  if (route.query?.id) {
    songName.value = route.query.name;
    getLrc();
  } else {
    ElMessage({
      type: "error",
      message: "Oops:未传入歌曲,即将返回.",
      onClose: () => {
        router.push("/");
      },
      duration: 2000
    });
  }
});

const activeLrc = () => {
  console.log(audio.value.currentTime);
  console.log(lyricIndex.value);
  let stopIn = setInterval(() => {
    if (audio.value.currentTime >= micObj.value[lyricIndex.value].time) {
      lyricIndex.value++;
      lycWrap.value.scrollTop += 30;
    }
    if (lyricIndex.value > micObj.value.length) {
      clearInterval(stopIn);
    }
  }, 1000);
};
const getLrc = async () => {
  const { data: micLyc } = await execute("http://localhost:3000/lyric", {
    params: {
      id: route.query.id
    }
  });
  if (micLyc.value?.code != 200) {
    ElNotification({
      title: "Warning",
      message: "没有搜索到歌词",
      type: "warning"
    });
    return;
  }
  let lrc = micLyc.value.lrc?.lyric ?? "";
  lrc.split("\n").map(item => {
    let temobj = {};
    let temarr = item.split("]");
    let temptime = temarr[0]
      .substring(1)
      .split(":")
      .map(item => Number(item));
    temobj.time = temptime[0] * 60 + temptime[1];
    temobj.text = temarr[1] ?? "";
    micObj.value.push(temobj);
  });
};
const searchMic = val => {
  router.push({ path: "/", query: { name: val.value } });
};
</script>
<style lang="less" scoped>
.audio-pos {
  width: 800px;
  margin: auto;
  transform: translateY(50px);
  position: relative;
  z-index: 10;
  .song-name {
    padding: 0px 20px 10px;
    color: #409eff;
    white-space: 3;
    letter-spacing: 3px;
    font-size: 25px;
    font-family: fangsong;
  }
}
.el-card {
  position: relative;
  margin: 20px auto;
  width: 900px;
  &::after {
    position: absolute;
    content: "";
    display: block;
    background-color: rgba(255, 255, 255, 0.5);
    bottom: 0;
    left: 0;
    right: 0;
    height: 50px;
    filter: blur(10px);
  }
  .lycwrap {
    position: relative;
    height: 300px;
    padding: 150px 0;
    box-sizing: border-box;
    overflow-y: scroll;
    scrollbar-width: none; /* firefox */
    -ms-overflow-style: none; /* IE 10+ */
    &::-webkit-scrollbar {
      display: none; /* Chrome Safari */
    }
  }
  .lyric {
    height: 30px;
    line-height: 30px;
    text-align: center;
    color: #807373;
  }
  .active {
    color: #409eff;
  }
}
</style>
