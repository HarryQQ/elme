//index.js
const app = getApp();
const db = wx.cloud.database();
import { js_date_time, uniq } from "../../utils/dateFormat.js";

Page({
  data: {
    app,
    userInfo: {}, // 用户信息
    list: [], // 订单
    currentIndex: 0,
    total: 0 // 合计
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
    wx.cloud
      .callFunction({
        name: "order",
        data: { type: 2 }
      })
      .then(resp => {
        let list = resp.result
        list = list.map(item => {
          item.dateStr = js_date_time(item.created + "");
          return item;
        });
        this.setData({ list, currentIndex: 2 });
      })
      .catch(console.error);
  },
  // 获取今天所有订单
  getTodayList() {
    wx.cloud
      .callFunction({
        name: "order",
        data: { type: 0 }
      })
      .then(resp => {
        let list = resp.result
        console.log('list', list);
        list = list.map(item => {
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
        this.setData({ list: groupList, currentIndex: 0 , total});
      })
      .catch(console.error);
  },
  // 获取所有未支付订单
  getUnpaidList() {
    wx.cloud
      .callFunction({
        name: "order",
        data: { type: 1 }
      })
      .then(resp => {
        let list = resp.result
        list = list.map(item => {
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
