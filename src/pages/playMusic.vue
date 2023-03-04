<template>
  <searchBtn @song="searchMic" :class="{ active: true }" />
  <div class="audio-pos">
    <p class="song-name">{{ songName }}</p>
    <audio
      preload="auto"
      controls
      ref="audio"
      @timeupdate="activeMoving"
      @ended="endPlay"
      @seeked="loadBuffer"
      @progress="loadProcess"
    >
      <source :src="mp3" type="audio/mp3" />
      您的浏览器不支持 audio 元素。
    </audio>
    <div class="palyer-wrap">
      <ul class="player">
        <li class="btn" @click="playMusic">
          <el-icon color="#409EFC" :size="30" style="vertical-align">
            <VideoPlay v-show="isplay" />
            <VideoPause v-show="!isplay" />
          </el-icon>
        </li>
        <li class="process-text">{{ nowTime }} / {{ totalTime }}</li>
        <li class="process-contain" @click="jumpfn">
          <div class="process-bar" ref="prowrap">
            <div
              ref="proload"
              class="process-loading"
              :style="{ width: loadingW }"
            ></div>
            <div
              ref="procon"
              class="process-content"
              :style="{ width: contentW }"
            ></div>
            <div
              ref="probtn"
              class="probtn"
              @mousedown.prevent="startMove"
              @mouseup.prevent="endMove"
            ></div>
          </div>
        </li>
        <li class="volumn">
          <div
            class="volicon"
            @click="muteVolumn"
            @mouseover="isActive = true"
            @mouseout="isActive = false"
          >
            <el-icon color="#409EFC" :size="20" style="vertical-align: middle">
              <Mic v-show="isMute" />
              <Mute v-show="!isMute" />
            </el-icon>
          </div>
          <div
            class="volumn-wrap"
            @mouseover="isActive = true"
            @mouseout="isActive = false"
            :class="{ 'wrap-active': isActive }"
          ></div>
          <div
            class="volumn-con"
            @mouseover="isActive = true"
            @click="volfn"
            :class="{ 'con-active': isActive }"
          >
            <div ref="volori" class="volumn-ori">
              <div ref="volbar" class="volumn-bar"></div>
              <div
                ref="volbtn"
                class="volumn-btn"
                @mousedown.prevent="startVol"
                @mouseup.prevent="endVol"
              ></div>
            </div>
          </div>
        </li>
      </ul>
    </div>
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
import { VideoPlay, VideoPause, Mic, Mute } from "@element-plus/icons-vue";
import { ref, onMounted, reactive } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useRequest } from "../utils/request";
import searchBtn from "../components/searchBtn.vue";
import footCop from "@/components/footCop.vue";
import { ElMessage, ElNotification } from "element-plus";

// 音乐播放按钮
let isplay = ref(true);
let isMute = ref(true);
let nowTime = ref("0:00");
let totalTime = ref("0:00");
let loadingW = ref("0%"); //音乐加载进度
let contentW = ref("0%"); //音乐播放进度
let prowrap = ref(""); //dom: 进度条
let probtn = ref(""); //dom: jump按钮
let procon = ref(""); //dom: 播放进度
let proload = ref(""); //dom: 加载进度
let startx = ref(0); //计算跳转后位置：starx：跳转开始位置，startleft：跳转距离
let startleft = ref(0);
let volori = ref(""); //dom:音量长度
let volbar = ref(""); //dom:当前音量长度
let volbtn = ref(""); //dom:调整音量按钮
let orix = ref(0); //音量开始所在位置
let oriright = ref(""); //音量百分比
let isActive = ref(false); //调整音量
// seeked：用户跳转音乐加载
const loadBuffer = () => {
  console.log("buffer");
  if (audio.value.buffered.length == 0) return;
  for (let i = 0; i < audio.value.buffered.length; i++) {
    let startx = audio.value.buffered.start(i);
    let endx = audio.value.buffered.end(i);
    let percent = ((endx - startx) / audio.value.duration) * 100;
    loadingW.value = percent + "%";
  }
};
// process：音乐加载
const loadProcess = () => {
  console.log("process");
  if (audio.value.buffered.length == 0) return;
  for (let i = 0; i < audio.value.buffered.length; i++) {
    let startx = audio.value.buffered.start(i);
    let endx = audio.value.buffered.end(i);
    let percent = ((endx - startx) / audio.value.duration) * 100;
    loadingW.value = percent + "%";
  }
};
// 播放音乐
const playMusic = () => {
  if (isplay.value) {
    audio.value.play();
    jump.go = true;
  } else {
    audio.value.pause();
  }
  isplay.value = !isplay.value;
};
// 音乐播放结束
const endPlay = () => {
  isplay.value = true;
};
// 开始拖动音乐
const startMove = e => {
  startx.value = e.clientX;
  startleft.value = probtn.value.style.left;
  document.addEventListener("mousemove", jumpfn);
  document.addEventListener("mouseup", () => {
    document.removeEventListener("mousemove", jumpfn);
  });
};
// 结束拖动音乐
const endMove = () => {
  activeLrc();
  document.removeEventListener("mousemove", jumpfn);
};
const activeMoving = () => {
  // time
  splitTime(nowTime, audio.value?.currentTime);

  // process-bar
  let percent = (audio.value.currentTime / audio.value.duration) * 100;
  controlbar(percent);

  //lyric
  activeLrc();
};
// 音乐进度条改变
const jumpfn = e => {
  let distancl = 0;
  if (typeof startleft.value == "string") {
    let temp = /\d+/.exec(startleft.value) ?? [0];
    distancl = Number(temp[0]);
  }

  if (startx.value == 0) {
    startx.value = Math.round(
      probtn.value.getBoundingClientRect().x + probtn.value.offsetWidth / 2
    );
  }
  //根据跳动进度进入计算百分比
  let total = prowrap.value.offsetWidth;
  let percent =
    Math.round(((e.clientX - startx.value) / total) * 100) + distancl;

  if (percent < 0) {
    percent = 0;
  }
  if (percent > 100) {
    percent = 100;
  }
  //lyric
  if (percent > jump.value) {
    jump.go = true; //向前跳
  }
  if (percent < jump.value) {
    jump.go = false; //向后跳
  }
  jump.value = percent;
  // time
  let temptime = (audio.value.duration * percent) / 100;
  audio.value.currentTime = temptime;
};
const controlbar = percent => {
  let total = prowrap.value.offsetWidth;
  let btnper = Math.round((probtn.value.offsetWidth / total) * 100);
  //button
  probtn.value.style.left =
    percent + btnper > 100 ? 100 - btnper + "%" : percent + "%";

  //load process
  contentW.value =
    percent + btnper / 2 > 100 ? percent + "%" : percent + btnper / 2 + "%";

  if (percent == 0) {
    contentW.value = "0%";
  }
};
// 歌词滚动
const activeLrc = () => {
  //lyric
  // forward
  if (jump.go) {
    let forwardto = 0;
    while (audio.value.currentTime >= micObj.value[lyricIndex.value].time) {
      lyricIndex.value++;
      forwardto += 30;
    }
    lycWrap.value.scrollTop += forwardto;
  }

  //back
  if (!jump.go) {
    let backto = 0;
    while (
      (lyricIndex.value > 0 &&
        audio.value.currentTime <= micObj.value[lyricIndex.value].time) ||
      isNaN(micObj.value[lyricIndex.value].time)
    ) {
      lyricIndex.value--;
      backto += 30;
    }
    lycWrap.value.scrollTop -= backto;
    jump.go = true;
  }
};
// 音量
const startVol = e => {
  orix.value = e.clientX;
  oriright.value = volbtn.value.style.right;
  document.addEventListener("mousemove", volfn);
  document.addEventListener("mouseup", () => {
    document.removeEventListener("mousemove", volfn);
  });
};
const endVol = () => {
  document.removeEventListener("mousemove", volfn);
};
// 音量拖动/跳转
const volfn = e => {
  let total = volori.value.offsetWidth;
  let distancl = 0;
  if (typeof oriright.value == "string") {
    let temp = /\d+/.exec(oriright.value) ?? [0];
    distancl = Number(temp[0]);
  }

  if (orix.value == 0) {
    orix.value = Math.round(
      volbtn.value.getBoundingClientRect().x - volbtn.value.offsetWidth
    );
  }
  let btnper = Math.round((volbtn.value.offsetWidth / total) * 100);
  let percent = Math.round(((orix.value - e.clientX) / total) * 100) + distancl;
  isMute.value = true;
  if (percent < 0) {
    percent = 0;
  }
  if (percent > 100) {
    percent = 100;
    isMute.value = false;
  }
  audio.value.volume = 1 - Math.floor(percent / 100);
  volbtn.value.style.right =
    btnper + percent > 100 ? 100 - btnper + "%" : percent + "%";
  volbar.value.style.width =
    btnper / 2 + percent > 100 ? percent + "%" : btnper / 2 + percent + "%";
  if (percent == 0) {
    volbar.value.style.width = "0%";
  }
};
// 静音
const muteVolumn = () => {
  isMute.value = !isMute.value;
  if (isMute.value) {
    volbtn.value.style.right = "0%";
    volbar.value.style.width = "100%";
  } else {
    volbtn.value.style.right = "97%";
    volbar.value.style.width = "0%";
  }
};

const router = useRouter();
const route = useRoute();
const { execute } = useRequest();
let audio = ref(""); //dom
let lycWrap = ref(""); //dom
let mp3 = ref(""); // mp3:url
let songName = ref("无法加载"); // 歌曲名称
let micObj = ref([]); // arr：歌词
let lyricIndex = ref(0); // active：歌词
let jump = reactive({
  go: true,
  value: 0
}); //歌曲向前（正常）播放
const splitTime = (val, time = 0) => {
  let temptime = parseInt(time);
  let min = parseInt(temptime / 60);
  let sec = temptime % 60;
  sec = sec > 9 ? sec : `0${sec}`;
  val.value = `${min}:${sec}`;
};
onMounted(() => {
  mp3.value = sessionStorage.getItem("url");

  //分析音频
  audio.value.onloadedmetadata = () => {
    splitTime(totalTime, audio.value.duration);
  };
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
  let lrc = micLyc.value.lrc?.lyric ?? "\n";
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
.palyer-wrap {
  width: 300px;
  height: 54px;
  background-color: aliceblue;
  border-radius: 27px;
  .player {
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    height: 100%;
  }
  .btn {
    cursor: pointer;
    margin-top: 5px;
  }
  .process-text {
    user-select: none;
    font-size: 15px;
  }
  .process-contain {
    /*  background-color: #409eff; */
    position: relative;
    z-index: 10;
    cursor: pointer;
    padding: 15px 10px;
    &:hover .process-bar .probtn {
      opacity: 1;
    }
    .process-bar {
      position: relative;
      width: 82px;
      height: 4px;
      background-color: #eaeaea;
      border-radius: 3px;
      cursor: pointer;

      .probtn {
        position: absolute;
        opacity: 0;
        left: 0%;
        top: -75%;
        width: 12px;
        height: 12px;
        background-color: #000;
        border-radius: 6px;
        cursor: pointer;
      }
      .process-loading,
      .process-content {
        position: absolute;
        top: 0;
        left: 0;
        height: 4px;
        width: 30px;
        border-radius: 3px;
        background-color: #333;
      }
      .process-loading {
        width: 50px;
        background-color: #999;
      }
    }
  }
  .volumn {
    position: relative;
    /* cursor: pointer; */
    .volicon {
      cursor: pointer;
      position: relative;
      z-index: 101;
    }

    .volumn-wrap {
      position: absolute;
      top: -20%;
      right: -30%;
      width: 0;
      /*  width: 0; */
      height: 32px;
      border-radius: 20px;
      background-color: #c7d2d4;
      transform-origin: center right;
      transition: width 0.3s ease-out;
    }
    .volumn-con {
      cursor: pointer;
      position: absolute;
      top: 4px;
      right: 18px;
      padding: 6px;
      /* background-color: green; */
      display: flex;
      align-items: center;
      transition: opacity 0.4s ease-out;
      opacity: 0;
      &:hover .volumn-ori .volumn-btn {
        opacity: 1;
      }
      .volumn-ori {
        position: relative;
        width: 70px;
        height: 4px;
        border-radius: 3px;
        background-color: #807373;
        .volumn-bar,
        .volumn-btn {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          margin: auto;
        }
        .volumn-bar {
          border-radius: 3px;
          background-color: #e9f4f6;
        }
        .volumn-btn {
          right: 0;
          width: 12px;
          height: 12px;
          border-radius: 6px;
          background-color: #15231b;
          opacity: 0;
        }
      }
    }
    .wrap-active {
      z-index: 100;
      width: 118px;
    }
    .con-active {
      opacity: 1;
      z-index: 101;
    }
  }
}
.audio-pos {
  width: 800px;
  margin: auto;
  transform: translateY(10px);
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
  margin: -17px auto 0;
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
