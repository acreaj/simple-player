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
  <el-card shadow="never" v-if="false">
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
  <el-card v-else class="testaaa">
    <button @click="playMusic">播放音乐</button>
    <audio preload="auto" controls ref="audio" @timeupdate="activeLrc">
      <source :src="mp3" type="audio/mp3" />
      您的浏览器不支持 audio 元素。
    </audio>
    <ul class="testwrap" ref="lycWrap">
      <li
        v-for="(words, index) in micObj"
        :key="words.text"
        class="lyrick"
        :class="{ active: lyricIndex - 1 == index }"
      >
        {{ words.text }}
      </li>
    </ul>
  </el-card>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { Search } from "@element-plus/icons-vue";
import { useA } from "../utils/request";
let pageinfo = reactive({
  current: 1,
  ishide: true,
  total: 0,
  num: 0,
  size: 30
});
let nameMic = ref("");
let audio = ref("");
let arrMic = reactive({});
let mp3 = ref(
  "http://m801.music.126.net/20230223214817/f38f65ff4041552a98f0d40fc45efec0/jdymusic/obj/wo3DlMOGwrbDjj7DisKw/14096411915/4c94/337f/368e/ff27e686465e2b590b252a9c33428321.mp3"
);
let micLyc = ref([
  "[00:00.000] 作词 : 李荣浩",
  "[00:01.000] 作曲 : 李荣浩",
  "[00:02.000] 编曲 : 李荣浩",
  "[00:03.000] 制作人 : 李荣浩",
  "[00:14.285]",
  "[00:22.837]山隔壁还是山",
  "[00:25.169]都有一个伴",
  "[00:28.202]相信海枯石烂",
  "[00:30.686]也许我笨蛋",
  "[00:33.686]飞太慢会落单",
  "[00:36.202]太快会受伤",
  "[00:39.237]日子不就都这样",
  "[00:44.185]",
  "[00:45.221]天会晴就会暗",
  "[00:47.654]我早就习惯",
  "[00:50.602]一日为了三餐",
  "[00:53.119]不至于寒酸",
  "[00:56.353]为给你取暖我把翅膀折断",
  "[01:01.722]我遭遇那些苦难",
  "[01:04.537]你却不管",
  "[01:06.935]",
  "[01:07.138]我飞翔在乌云之中",
  "[01:10.388]你看着我无动于衷",
  "[01:13.186]有多少次波涛汹涌",
  "[01:16.203]在我 心中",
  "[01:18.403]",
  "[01:18.619]你飞向了雪山之巅",
  "[01:21.552]我留在你回忆里面",
  "[01:24.403]你成仙我替你留守人间",
  "[01:30.019]麻雀也有明天",
  "[01:36.138]",
  "[01:55.670]天会晴就会暗",
  "[01:58.186]我早就习惯",
  "[02:01.102]一日为了三餐",
  "[02:03.703]不至于寒酸",
  "[02:06.786]为给你取暖我把翅膀折断",
  "[02:12.235]我遭遇那些苦难",
  "[02:15.051]你却不管",
  "[02:17.352]",
  "[02:17.638]我飞翔在乌云之中",
  "[02:21.068]你看着我无动于衷",
  "[02:23.786]有多少次波涛汹涌",
  "[02:26.752]在我 心中",
  "[02:29.052]",
  "[02:29.205]你飞向了雪山之巅",
  "[02:32.286]我留在你回忆里面",
  "[02:35.068]你成仙我替你留守人间",
  "[02:40.685]麻雀也有明天",
  "[02:46.703]",
  "[03:05.882]我飞翔在乌云之中",
  "[03:09.064]你看着我无动于衷",
  "[03:11.730]有多少次波涛汹涌",
  "[03:14.730]在我 心中",
  "[03:16.998]",
  "[03:17.151]你飞向了雪山之巅",
  "[03:20.265]我留在你回忆里面",
  "[03:23.083]你成仙我替你留守人间",
  "[03:28.781]麻雀也有明天",
  "[03:34.635]",
  "[03:37.811] 吉他 : 李荣浩",
  "[03:40.987] 贝斯 : 李荣浩",
  "[03:44.163] 和声编写 : 李荣浩",
  "[03:47.339] 和音 : 李荣浩",
  "[03:50.515] 录音师 : 李荣浩",
  "[03:53.691] 混音师 : 李荣浩",
  "[03:56.867] 音乐制作助理 : 青格乐",
  "[04:00.043] 录音工作室 : 北京一样音乐录音室",
  "[04:03.219] 混音室 : 北京一样音乐录音室",
  "[04:06.395] 母带制作 : 李荣浩",
  "[04:09.571] 母带工程师 : 周天澈",
  "[04:12.747] 母带后期处理录音室 : Studio21A",
  ""
]);
let micObj = ref([]);
let lyricIndex = ref(0);
let lycWrap = ref("");
const playMusic = () => {
  audio.value.play();
  console.log(audio.value.currentTime);
};
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
onMounted(() => {
  micLyc.value.map(item => {
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
});

let songs = ref({});
let { execute } = useA();
async function searchBtn() {
  arrMic = await execute("http://localhost:3000/search", {
    params: {
      keywords: nameMic.value,
      offset: pageinfo.current - 1
    }
  });
  songs.value = arrMic.value.data.result.songs;
  pageinfo.total = arrMic.value.data.result.songCount;
  pageinfo.num = Math.floor(pageinfo.total / pageinfo.size);
  pageinfo.ishide = pageinfo.num > 1 ? false : true;
}
const handleCurrentChange = val => {
  pageinfo.current = val;
  searchBtn();
  console.log(`current page: ${val}`);
};
const goMusic = async mid => {
  let micMp3 = await execute("http://localhost:3000/song/url/v1", {
    params: {
      id: mid,
      level: "exhigh"
    }
  });
  let mp3 = micMp3.value.data.data[0].url;
  console.log(mp3);
  let micLyc = await execute("http://localhost:3000/lyric", {
    params: {
      id: mid
    }
  });
  console.log(micLyc.value);
  console.log("456");
  console.log(mp3);
  console.log(micLyc.value.data.lrc.lyric);
  let lrc = micLyc.value.data.lrc?.lyric ?? "";
  let arrLrc = lrc.split("\n");
  console.log(arrLrc);
};

/* const testMusic = () => {
  let mp3 =
    "http://m801.music.126.net/20230223214817/f38f65ff4041552a98f0d40fc45efec0/jdymusic/obj/wo3DlMOGwrbDjj7DisKw/14096411915/4c94/337f/368e/ff27e686465e2b590b252a9c33428321.mp3";
  let micLyc = [
    "[00:00.000] 作词 : 李荣浩",
    "[00:01.000] 作曲 : 李荣浩",
    "[00:02.000] 编曲 : 李荣浩",
    "[00:03.000] 制作人 : 李荣浩",
    "[00:14.285]",
    "[00:22.837]山隔壁还是山",
    "[00:25.169]都有一个伴",
    "[00:28.202]相信海枯石烂",
    "[00:30.686]也许我笨蛋",
    "[00:33.686]飞太慢会落单",
    "[00:36.202]太快会受伤",
    "[00:39.237]日子不就都这样",
    "[00:44.185]",
    "[00:45.221]天会晴就会暗",
    "[00:47.654]我早就习惯",
    "[00:50.602]一日为了三餐",
    "[00:53.119]不至于寒酸",
    "[00:56.353]为给你取暖我把翅膀折断",
    "[01:01.722]我遭遇那些苦难",
    "[01:04.537]你却不管",
    "[01:06.935]",
    "[01:07.138]我飞翔在乌云之中",
    "[01:10.388]你看着我无动于衷",
    "[01:13.186]有多少次波涛汹涌",
    "[01:16.203]在我 心中",
    "[01:18.403]",
    "[01:18.619]你飞向了雪山之巅",
    "[01:21.552]我留在你回忆里面",
    "[01:24.403]你成仙我替你留守人间",
    "[01:30.019]麻雀也有明天",
    "[01:36.138]",
    "[01:55.670]天会晴就会暗",
    "[01:58.186]我早就习惯",
    "[02:01.102]一日为了三餐",
    "[02:03.703]不至于寒酸",
    "[02:06.786]为给你取暖我把翅膀折断",
    "[02:12.235]我遭遇那些苦难",
    "[02:15.051]你却不管",
    "[02:17.352]",
    "[02:17.638]我飞翔在乌云之中",
    "[02:21.068]你看着我无动于衷",
    "[02:23.786]有多少次波涛汹涌",
    "[02:26.752]在我 心中",
    "[02:29.052]",
    "[02:29.205]你飞向了雪山之巅",
    "[02:32.286]我留在你回忆里面",
    "[02:35.068]你成仙我替你留守人间",
    "[02:40.685]麻雀也有明天",
    "[02:46.703]",
    "[03:05.882]我飞翔在乌云之中",
    "[03:09.064]你看着我无动于衷",
    "[03:11.730]有多少次波涛汹涌",
    "[03:14.730]在我 心中",
    "[03:16.998]",
    "[03:17.151]你飞向了雪山之巅",
    "[03:20.265]我留在你回忆里面",
    "[03:23.083]你成仙我替你留守人间",
    "[03:28.781]麻雀也有明天",
    "[03:34.635]",
    "[03:37.811] 吉他 : 李荣浩",
    "[03:40.987] 贝斯 : 李荣浩",
    "[03:44.163] 和声编写 : 李荣浩",
    "[03:47.339] 和音 : 李荣浩",
    "[03:50.515] 录音师 : 李荣浩",
    "[03:53.691] 混音师 : 李荣浩",
    "[03:56.867] 音乐制作助理 : 青格乐",
    "[04:00.043] 录音工作室 : 北京一样音乐录音室",
    "[04:03.219] 混音室 : 北京一样音乐录音室",
    "[04:06.395] 母带制作 : 李荣浩",
    "[04:09.571] 母带工程师 : 周天澈",
    "[04:12.747] 母带后期处理录音室 : Studio21A",
    ""
  ];
}; */
/* const dealLyric = () => {}; */
</script>
<style lang="less">
.searchMic {
  display: flex;
  margin: auto;
  width: 500px;
}
.el-card {
  /*   margin: auto;
  width: 900px; */
  .songItem {
    margin: 5px 30px;
    padding: 5px 10px;
    border-bottom: 1px dotted #efefef;
    cursor: pointer;
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
.testwrap {
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

  .lyrick {
    height: 30px;
    line-height: 30px;
    text-align: center;
    color: #807373;
  }
  .active {
    color: #303133;
  }
}
.testaaa {
  position: relative;
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
}
/* .wrapper {
  border: 1px solid #dcdfe6;
    border-radius: var(--el-border-radius-base);
} */
/* .el-input__wrapper {
  box-shadow: none;
  border: 1px solid #e9e9eb;
  border-radius: 30px;
  padding: 5px 15px;
} */
</style>
