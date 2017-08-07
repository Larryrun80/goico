//app.js
App({
  onLaunch: function() {
    //调用API从本地缓存中获取数据
    // var logs = wx.getStorageSync('logs') || []
    // logs.unshift(Date.now())
    // wx.setStorageSync('logs', logs)

    this.initData()
  },

  onHide: function() {
    // console.log(this.globalData)
    // for (let key of Object.keys(this.globalData.closeSettings)) {
    //   console.log(key, this.globalData.closeSettings[key])
    //   wx.setStorageSync(key, this.globalData.closeSettings[key])
    // }
  },

  getUserInfo: function(cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.getUserInfo({
        withCredentials: false,
        success: function(res) {
          that.globalData.userInfo = res.userInfo
          typeof cb == "function" && cb(that.globalData.userInfo)
        }
      })
    }
  },

  globalData: {
    userInfo: null,
    closeSettings: [], // 进程销毁时需保留的设置
  },

  initData: function () {
    wx.getStorageInfo({
      success: function (res) {
        console.log('已使用空间: ', res.currentSize)
        console.log('全部空间: ', res.limitSize)

        let initData = {
          fiatList: ['人民币', '美元'],
          defaultFiatIndex: 0,
          symbolCnt: ['Top 200', 'Top 500'],
          symbolCntIndex: 0,
          currencyListCnt: 200,
          riseColor: 'green',
          selectedSymbols: [],
        }

        for (let item in initData) {
          // if (!(res.keys.includes(item))) {
          if (-1 === res.keys.indexOf(item)) {
            console.log('init ', item)
            wx.setStorage({
              key: item,
              data: initData[item],
            })
          }
        }
      }
    })
  }
})
