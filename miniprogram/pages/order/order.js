//index.js
const app = getApp()
const db = wx.cloud.database()
Page({
  data: {
    userInfo: {}, // 用户信息
    list: [], // 订单
  },

  onLoad() { // 初始化页面
    const userInfo = wx.getStorageSync('userInfo')
    this.setData({userInfo})
  },
  onShow(){
    this.getUnpaidList()
  },
  // 查询全部订单
  getList() {
    db.collection('order').limit(500).get().then(resp => {
      this.setData({list: resp.data})
    }).catch(console.error)
  },
  // 获取所有未支付订单
  getUnpaidList(){
    db.collection('order').where({
      paid: false,
    }).limit(500).get().then(resp => {
      this.setData({list: resp.data})
    }).catch(console.error)
  },
})
