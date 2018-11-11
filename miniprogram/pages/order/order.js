//index.js
const app = getApp();
const db = wx.cloud.database();
import { js_date_time, uniq } from "../../utils/dateFormat.js";

Page({
  data: {
    userInfo: {}, // 用户信息
    list: [], // 订单
    currentIndex: 0
  },

  onLoad() {
    // 初始化页面
    const userInfo = wx.getStorageSync("userInfo");
    this.setData({ userInfo });
    this.getTodayList();
  },
  onShow() {},
  // 查询当前用户所有的order
  getList() {
    const { userInfo = {} } = this.data;
    // 这里不做分页，查出500条，按订单时间倒序
    db.collection("order")
      .limit(500)
      .orderBy("created", "desc")
      .get()
      .then(resp => {
        // 按时间戳转字符串
        const list = resp.data.map(item => {
          item.dateStr = js_date_time(item.created + "");
          return item;
        });
        this.setData({ list, currentIndex: 2 });
        console.log(resp);
      })
      .catch(console.error);
  },
  // 获取今天所有订单
  getTodayList() {
    const d = new Date();
    // 今天凌晨的时间戳
    const today = new Date(
      `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
    ).getTime();
    console.log("today", today);
    const _ = db.command;
    db.collection("order")
      .where({
        created: _.gt(today)
      })
      .limit(500)
      .get()
      .then(resp => {
        const list = resp.data.map(item => {
          item.dateStr = js_date_time(item.created + "");
          return item;
        });
        let total = 0;
        list.forEach(i => {
          total += Number(i.price);
        });
        const midList = list.map(item => item.mid);
        const mList = uniq(midList); // id数组去重
        const groupList = mList.map(item => {
          const childList = list.filter(i => i.mid === item);
          const { mid, name, price, img } = childList[0];
          return { mid, name, price, img, childList };
        });
        this.setData({ list: groupList, currentIndex: 0, total });
      })
      .catch(console.error);
  },
  // 获取所有未支付订单
  getUnpaidList() {
    db.collection("order")
      .where({
        paid: false
      })
      .limit(500)
      .get()
      .then(resp => {
        const list = resp.data.map(item => {
          item.dateStr = js_date_time(item.created + "");
          return item;
        });
        this.setData({ list, currentIndex: 1 });
      })
      .catch(console.error);
  },
  // 回到首页
  goHome() {
    wx.switchTab({
      url: "/pages/index/index"
    });
  }
});
