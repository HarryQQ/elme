// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
exports.main = async (event, context) => {
  console.log(event)
  console.log(context)
  const params = event.user || {}
  const openId = event.userInfo.openId
  const isAdmin = openId === 'oDubW5eLr6bjIS7SwXrFY0jZ1L74'
  params['admin'] = isAdmin
  console.log('请求参数', params)

  // 查看user是否存在
  const resp = await db.collection('user')
    .where({_openid: openId}).get()
  const user = resp.data[0]
  let uid = ''
  if (user) { // 存在就更新
    console.log('更新')
    params['_openid'] = openId
    await db.collection('user').doc(user._id).set({
      // data 传入需要局部更新的数据
      data: params
    }).then(resp => {
      console.log('更新', resp)
      uid = resp._id
    }).catch(console.error)
  } else { // 不存在就新建
    params['_openid'] = openId // 本地自动会带上openId，云函数不会
    console.log('新建用户', params)
    await db.collection('user').add({
      data: params,
    }).then(resp => { // 自动带有openid
      console.log('保存resp', resp)
      uid = resp._id
    }).catch(err => {
      console.log('错误信息', err)
    })
  }
  return {userInfo: {...params, _id: uid, _openid: openId}}
}

