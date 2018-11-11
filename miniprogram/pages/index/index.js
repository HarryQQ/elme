//index.js
const app = getApp()
const db = wx.cloud.database()
Page({
  // 数据结构
  data: {
    userInfo: {}, // 用户信息
    menu: { // 选中的菜单
      name: '',
      price: '',
      img: ''
    },
    list: [], // 菜单
    newId: '', // 新增的id
    current: 0, // 选中的下标
  },
  // 进入页面
  onLoad() {
    // 获取缓存中的userInfo
    const userInfo = wx.getStorageSync('userInfo')
    if(!userInfo._id) { // 未授权跳转登录页授权
      wx.navigateTo({
        url: '/pages/login/login'
      })
    }
    // 用户信息保存在本地
    this.setData({userInfo})
    // 获取菜单列表
    
  },
  onShow(){
    this.getList()
  },
  // 下单
  order() {
    const {current, list, userInfo} = this.data
    const menu = list[current]
    let order = {
      uid: userInfo._id,
      avatarUrl: userInfo.avatarUrl,
      nickName: userInfo.nickName,
      mid: menu._id,
      img: menu.img,
      price: menu.price,
      name: menu.name,
      paid: false, // 支付
      created: new Date().getTime(),
    }
    db.collection('order').add({
      data: order,
    }).then(resp => {
      wx.showToast({
        title: '点餐成功',
        success: () => { // 点餐成功后跳转我的页面
          wx.switchTab({
            url: '/pages/mine/mine'
          })
        }
      })
    }).catch(console.error)
  },
  // 获取菜单
  getList() {
    db.collection('menu').get({
      success: res => {
        this.setData({
          list: res.data
        })
        console.log('[数据库] [查询记录] 成功: ', res)
        this.createdOrder()
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
    })
  },
  // 选择要吃什么
  select(e) {
    this.setData({
      current: Number(e.currentTarget.id)
    })
  },
  // 上传图片
  doUpload() {
    const that = this
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
        const cloudPath = 'menu/xx' + filePath.match(/\.[^.]+?$/)[0]
        console.log('filePath', filePath)
        console.log('cloudPath', cloudPath)
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)
            that.setData({
              'menu.img': res.fileID
            })
            // app.globalData.fileID = res.fileID
            // app.globalData.cloudPath = cloudPath
            // app.globalData.imagePath = filePath
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
  // 放大预览
  preView(e){
    const imgUrl = e.currentTarget.id
    wx.previewImage({
      current: imgUrl,
      urls: [imgUrl]
    })
  },
})
