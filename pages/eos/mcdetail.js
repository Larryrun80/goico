// pages/eos/mcdetail.js
var tools = require('../../utils/tools.js')
var requests = require('../../utils/requests.js')
var settings = require('../../secret/settings.js')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    price: '--',
    trends: 0,
    rank: '--',
    marketCap: '--',
    volume24h: '--',
    availableSupply: '--',
    links: {'website': '--', 'explorer': '--'},
    markets: [{ 'name': '--', 'website': '--' }, { 'name': '--', 'website': '--' }]
  },

  copyUrl: function (res) {
    let web = res.currentTarget.dataset.web
    let copyValue = res.currentTarget.dataset.url
    wx.showModal({
      title: copyValue,
      content: '小程序内禁止打开网页，请拷贝到剪贴板后前往浏览器打开',
      confirmText: '拷贝',
      confirmColor: '#2196F3',
      cancelColor: '#888',
      success: function (res) {
        if (res.confirm) {
          wx.setClipboardData({
            data: copyValue,
            success: function (res) {
              // wx.showToast({
              //   title: '已复制到您的黏贴板',
              //   duration: 1500
              // })
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  seeAll: function() {
    wx.switchTab({
      url: 'marketcap'
    })
  },

  updateCurrency: function(symbol) {
    let that = this
    requests.request(
      settings.requestCurrencyUrl + '?symbol=' + symbol,
      function (res) {
        if (res.data.code == 0) {
          console.log(res)
          that.setData({
            symbol: symbol,
            name: res.data.data.name && res.data.data.symbol ? res.data.data.name + " (" + res.data.data.symbol + ")" : '--',
            price: res.data.data.market_cap.price_cny > 0.01 ? tools.friendlyNumber(res.data.data.market_cap.price_cny.toFixed(2)) : res.data.data.market_cap.price_cny,
            trends: res.data.data.market_cap.percent_change_24h ? tools.friendlyNumber(res.data.data.market_cap.percent_change_24h) : '0',
            rank: res.data.data.market_cap.rank ? res.data.data.market_cap.rank : '--',
            marketCap: res.data.data.market_cap.market_cap_usd ? tools.friendlyNumber(res.data.data.market_cap.market_cap_usd.toFixed(2)) : '--',
            volume24h: res.data.data.market_cap.volume_usd_24h ? tools.friendlyNumber(res.data.data.market_cap.volume_usd_24h.toFixed(2)) : '--',
            availableSupply: res.data.data.market_cap.available_supply ? tools.friendlyNumber(res.data.data.market_cap.available_supply) : '--',
            links: {
              'website': res.data.data.website ? res.data.data.website : '暂无',
              'explorer': res.data.data.explorer ? res.data.data.explorer : '暂无',
            } ,
            markets: res.data.data.markets ? res.data.data.markets : []
          }) 
        }
      },
      function (res) {
        wx.showToast({
          title: '获取数据失败，请稍候再试...',
          duration: 1500,
          image: '/images/exclamationmark.png'
        })
      }
    )
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    if (!options.symbol) { this.seeAll(); return }
    this.updateCurrency(options.symbol)

    wx.setNavigationBarTitle({
      title: options.symbol
    })

    wx.showShareMenu({
      withShareTicket: true
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.updateCurrency(this.data.symbol)
    wx.hideNavigationBarLoading()
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    if (res.from === 'menu') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    console.log('/pages/eos/mcdetail?symbol=' + this.data.symbol)
    return {
      title: this.data.name,
      path: '/pages/eos/mcdetail?symbol=' + this.data.symbol,
      success: function (res) {
        // 转发成功
        wxg.shareComplete(res)
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
})