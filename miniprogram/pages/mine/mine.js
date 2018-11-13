//index.js
const app = getApp()
const db = wx.cloud.database()
import {js_date_time} from "../../utils/dateFormat.js"


Page({
  data: {
    app,
    userInfo: {}, // 用户信息
    list: [], // 订单
    isSlide: false,
    startX: 0,
    startY: 0,
  },

  onLoad() { // 初始化页面
    const userInfo = wx.getStorageSync('userInfo')
    this.setData({userInfo})

  },
  onShow(){
    this.getList()
  },
  // 查询当前用户所有的order
  getList() {
    const {userInfo={}} = this.data
    console.log(userInfo._id)
    // 这里不做分页，查出500条，按订单时间倒序
    db.collection('order').where({
      uid: userInfo._id,
    }).limit(500).orderBy('created', 'desc').get().then(resp => {
      // 按时间戳转字符串
      const list = resp.data.map(item => {
        item.dateStr = js_date_time(item.created + '')
        return item
      })
      console.log('list', list)
      this.setData({list})
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
      confirmColor: '#000000',
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
          db.collection('order').doc(id).remove().then(resp => {
            this.getList()
          }).catch(console.error)
        }
      }
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
        list.forEach(i => {
          i.isSlide = false
        })
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

})
