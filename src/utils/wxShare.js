export function wxShare(config = {}, params = {}) {
  let ua = window.navigator.userAgent.toLowerCase();
  if (/micromessenger/i.test(ua)) {
    console.log("this is wx");
    let url = {
      jweixin: "http://res.wx.qq.com/open/js/jweixin-1.6.0.js",
      jsApiList: ["updateTimelineShareData", "updateAppMessageShareData"]
    };
    var script = document.createElement("script");
    script.src = url.jweixin;
    script.type = "text/javascript";
    document.querySelector("head").insertAdjacentElement("beforeend", script);
    script.addEventListener("load", function () {
      wx.config({
        /**
         * 开启调试模式,调用的所有api的返回值会在客户端alert出来，
         * 若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，
         * 仅在pc端时才会打印。
         */
        debug: false,
        appId: config.appId, // 必填，公众号的唯一标识
        timestamp: config.timestamp, // 必填，生成签名的时间戳
        nonceStr: config.nonceStr, // 必填，生成签名的随机串
        signature: config.signature, // 必填，签名，见附录1
        jsApiList: ["updateTimelineShareData", "updateAppMessageShareData"] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
      });
      wx.ready(function () {
        console.log("wechat share is ready!");
        wx.updateTimelineShareData({
          title: params.title,
          // 分享标题
          link: window.location.origin,
          // 分享链接
          imgUrl: params.imgUrl,
          // 分享图标
          success: function success() {
            console.log("分享成功");
            // 用户确认分享后执行的回调函数
          }
        });
      });
      wx.error(function (e) {
        alert(JSON.stringify(e));
      });
    });
  }
}
