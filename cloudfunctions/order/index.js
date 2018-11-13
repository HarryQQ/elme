// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init();
cloud.init();
const db = cloud.database();
// 云函数入口函数
exports.main = async (event, context) => {
  const { type = 0 } = event;
  let result = [];
  switch (type) {
    case 0:
      const d = new Date();
      // 今天凌晨的时间戳
      const today = new Date(
        `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
      ).getTime();
      const _ = db.command;
      await db.collection("order")
        .where({
          created: _.gt(today)
        })
        .limit(500)
        .get()
        .then(resp => {
          console.log(resp);
          result = resp.data
        })
        .catch(console.error);
      break;
    case 1:
      await db.collection("order")
        .where({
          paid: false
        })
        .limit(500)
        .orderBy("created", "desc")
        .get()
        .then(resp => {
          result = resp.data
        })
        .catch(console.error);
      break;
    case 2:
      await db
        .collection("order")
        .limit(500)
        .orderBy("created", "desc")
        .get()
        .then(resp => {
          console.log("resp", resp);
          result = resp.data;
        })
        .catch(console.error);
      break;
  }
  return result;
};
