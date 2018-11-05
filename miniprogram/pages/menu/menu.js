//index.js
const app = getApp()
const db = wx.cloud.database()

Page({
  // 数据结构
  data: {
    menu: {
      // name: '',
      // price: '',
      // img: ''
    },
    list: [], // 菜单
    newId: '', // 新增的id
    modalShow: false, // 显示模态框
    isSlide: false,
    startX: 0,
    startY: 0,
    defImg:'../../images/default-menu.png' // 默认菜品图片
  },
  // 进入页面
  onLoad() { // 初始化页面
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: function (res) {
              app.globalData.userInfo = res.userInfo
            }
          })
        } else { // 未授权跳转登录页授权
          wx.navigateTo({
            url: '/pages/login/login'
          })
        }
      }
    })
    this.getList()
  },
  // 新增菜品
  commit() {
    const that = this
    const {name, price, img, _id = ''} = this.data.menu
    if (!name || !price || !img) {
      wx.showToast({
        icon: 'none',
        title: '请填写完整~'
      })
      return
    }
    console.log('fuck', this.data.menu)
    const newPram = {name, price, img}
    if (_id) { // 有id为修改，没有id为新增
      db.collection('menu').doc(_id).update({
        data: newPram,
        success: res => {
          // 在返回结果中会包含新创建的记录的 _id
          console.log('更新的id', res._id)
          wx.showToast({
            title: '提交成功',
          })
          this.getList()
          this.closeMask()
        },
        fail: err => {
          console.log(err)
          wx.showToast({
            icon: 'none',
            title: '修改失败'
          })
        }
      })
    } else {
      db.collection('menu').add({
        data: this.data.menu,
        success: res => {
          // 在返回结果中会包含新创建的记录的 _id
          console.log('新增的id', res._id)
          wx.showToast({
            title: '提交成功',
          })
          this.getList()
          this.closeMask()
        },
        fail: err => {
          wx.showToast({
            icon: 'none',
            title: '新增失败'
          })
        }
      })
    }

  },
  // 获取菜单
  getList() {
    // 查询当前用户所有的 counters
    db.collection('menu').get({
      success: res => {
        this.setData({
          list: res.data
        })
        console.log('[数据库] [查询记录] 成功: ', res)
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
  // 公用-input值改变
  changeInput(e) {
    this.data.menu[e.target.id] = e.detail.value
    this.setData({
      menu: this.data.menu
    })
  },
  // 上传图片
  upload() {
    console.log('上传图片')
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
        const currentStamp = new Date().getTime()
        // 上传图片
        const cloudPath = `menu/${currentStamp}` + filePath.match(/\.[^.]+?$/)[0]
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
  // 关闭弹框
  closeMask() {
    this.setData({
      modalShow: false
    })
  },
  // 显示新增
  handleAdd() {
    this.setData({
      modalShow: true,
      menu: {}
    })
  },
  // 显示修改
  handleUpdate(e) {
    const index = e.currentTarget.id
    const currentItem = this.data.list[index]
    this.setData({
      modalShow: true,
      menu: currentItem
    })
  },
  // 删除
  delItem(e) {
    const index = e.currentTarget.id
    const id = this.data.list[index]._id
    wx.showModal({
      title: '',
      content: '确认要删除吗？',
      success: res => {
        if (res.confirm) {
          db.collection('menu').doc(id).remove().then(resp => {
            this.getList()
          }).catch(console.error)
        }
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

  /**
   * 侧滑删除相关方法
   */

  onTouchStart(e) {
    this.data.startX = e.changedTouches[0].clientX
    this.data.startY = e.changedTouches[0].clientY
  },
  onTouchMove(e) {
    let {list} = this.data
    const index = e.currentTarget.id
    let item = list[index]
    this.data.endX = e.changedTouches[0].clientX
    this.data.endY = e.changedTouches[0].clientY
    let touchDistance = this.data.endX - this.data.startX
    let angle = Math.abs(this.getAngle({
      startX: this.data.startX,
      startY: this.data.startY
    }, {
      endX: this.data.endX,
      endY: this.data.endY
    }))
    if (touchDistance < -50 && angle < 30) { // 打开
      if (!this.data.isSlide) {
        console.log('ss',item)
        item['isSlide'] = true
        list[index] = item
        this.setData({list})
      }
    }
    if (touchDistance > 10 && angle < 30) { // 关闭
      item['isSlide'] = false
      list[index] = item
      this.setData({list})
    }
  },
  getAngle(start, end) {
    let _X = end.endX - start.startX
    let _Y = end.endY - start.startY
    //返回角度 /Math.atan()返回数字的反正切值
    return 360 * Math.atan(_Y / _X) / (2 * Math.PI);
  },
  // 回到首页
  goHome(){
    wx.switchTab({
      url: '/pages/index/index'
    })
  }
})
