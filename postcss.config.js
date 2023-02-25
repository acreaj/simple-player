module.exports = {
  plugins: {
    /* "postcss-pxtorem": {
      rootValue: 37.5, // 页面写的px尺寸 / rootValue = 转换后的rem单位大小 flexible动态修改rootValue
      propList: ["*", "!font*"]
    }, */
    autoprefixer: {
      overrideBrowserslist: [
        "Android 4.1",
        "iOS 7.1",
        "Chrome > 31",
        "ff > 31",
        "ie >= 8"
        //'last 2 versions', // 所有主流浏览器最近2个版本
      ],
      grid: true
    }
  }
};
