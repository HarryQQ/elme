Component({
  data: {},
  properties: {
  },
  ready() {
  },
  methods: {
    goMenu() {
      wx.navigateTo({
        url: '/pages/menu/menu'
      })
    },
    goOrder() {
      wx.navigateTo({
        url: '/pages/order/order'
      })
    }
  },
})
