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
    this.getTodayList()
  },
  // 查询当前用户所有的order
  getList() {
    const {userInfo={}} = this.data
    console.log(userInfo._id)
    // todo分页 limit不传默认只有20
    db.collection('order').where({
      uid: userInfo._id,
    }).limit(500).get().then(resp => {
      this.setData({list: resp.data})
      console.log(resp)
    }).catch(console.error)
  },
  // 获取今天所有订单
  getTodayList() {
    const d = new Date()
    // 今天凌晨的时间戳
    const today = new Date(`${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`).getTime()
    console.log('today', today)
    const _ = db.command
    db.collection('order').where({
      created: _.gt(today),
    }).limit(500).get().then(resp => {
      this.setData({list: resp.data})
      console.log(resp)
    }).catch(console.error)
  },
  // 获取所有未支付订单
  getUnpaidList(){
    db.collection('order').where({
      paid: false,
    }).limit(500).get().then(resp => {
      this.setData({list: resp.data})
      console.log(resp)
    }).catch(console.error)
  },

  // 刷新
  flash(){
    this.getList()
  },
  // 支付
  pay(e){
    const id = e.target.id
    wx.showModal({
      title: '',
      content: '确定真的给了钱吗？',
      success: res=>{
        if (res.confirm) {
          db.collection('order').doc(id).update({
            // data 传入需要局部更新的数据
            data: {paid: true}
          }).then(() => {
            this.getList()
          }).catch(console.error)
        }
      }
    })
  }
})
