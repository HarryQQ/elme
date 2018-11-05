//index.js
const app = getApp()
const db = wx.cloud.database()
Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
  },

  onLoad() {

  },

  // 授权获取用户信息
  onGetUserInfo(e) {
    // 保存到当前页
    this.setData({
      avatarUrl: e.detail.userInfo.avatarUrl,
      userInfo: e.detail.userInfo
    })
    // 更新到数据库
    this.saveUser()
  },

  // 新增或更新用户信息到user表
  saveUser() {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'saveUser',
      data: {user: this.data.userInfo}
    }).then(resp => {
      console.log(resp.result.userInfo)
      // 保存本地缓存
      wx.setStorageSync('userInfo', resp.result.userInfo)
    }).catch(console.error)

  },

  // 获取openId
  onGetOpenid() {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.userInfo.openid = res.result.openid
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })
  },

  // 上传图片
  doUpload: function () {
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {

        wx.showLoading({
          title: '上传中',
        })

        const filePath = res.tempFilePaths[0]

        // 上传图片
        const cloudPath = 'my-image' + filePath.match(/\.[^.]+?$/)[0]
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)

            app.globalData.fileID = res.fileID
            app.globalData.cloudPath = cloudPath
            app.globalData.imagePath = filePath

            wx.navigateTo({
              url: '../storageConsole/storageConsole'
            })
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })

      },
      fail: e => {
        console.error(e)
      }
    })
  },

})
