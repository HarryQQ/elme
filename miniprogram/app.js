//app.js
App({
  onLaunch () {
    const that = this
    // 初始化云开发配置
    wx.cloud.init({
      traceUser: true,
    })


    // 全局变量
  },
  globalData: {
    defaultImg: '../../images/default-menu.png', // 全局默认图片
  }
})
