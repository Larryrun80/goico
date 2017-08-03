// pages/eos/mcdetail.js
var tools = require('../../utils/tools.js')
var requests = require('../../utils/requests.js')
var settings = require('../../secret/settings.js')
var sc = require('../../utils/selectedCurrency.js')
var app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    market: 'cmc',
    trendPeriod: '(24h)',
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
    app.globalData.tmpParams = 'cmc_top'
    wx.switchTab({
      url: 'marketcap'
    })
  },

  goHome: function () {
    wx.switchTab({
      url: 'marketcap'
    })
  },

  updateCurrency: function(cid, market='cmc') {
    let that = this
    let fiat = wx.getStorageSync('defaultFiatIndex')
    let riseColor = wx.getStorageSync('riseColor')
    let trendIncreaseCss = 'item-trend-green'
    let trendDecreaseCss = 'item-trend-red'
    if (riseColor && riseColor == 'red') {
      trendIncreaseCss = 'item-trend-red'
      trendDecreaseCss = 'item-trend-green'
    }
    let url = settings.requestCurrencyUrl + '?currency_id=' + cid
    let trendPeriod = '(24h)'
    if (market != 'cmc') {
      url = url + '&market=' + market
      trendPeriod = '(今日)'
    }

    requests.request(
      url,
      function (res) {
        if (res.data.code == 0) {
          let priceCNY = res.data.data.market_cap.price_cny > 0.01 ? tools.friendlyNumber(res.data.data.market_cap.price_cny.toFixed(2)) : res.data.data.market_cap.price_cny
          let priceUSD = res.data.data.market_cap.price_usd > 0.01 ? tools.friendlyNumber(res.data.data.market_cap.price_usd.toFixed(2)) : res.data.data.market_cap.price_usd
          let priceShow = '¥' + priceCNY

          if (fiat && fiat == 1 && market=='cmc') {
            priceShow = '$' + priceUSD
          }
          that.setData({
            cid: res.data.data.market_cap.currency_id,
            symbol: res.data.data.market_cap.symbol,
            name: res.data.data.name,
            currency: res.data.data.name && res.data.data.symbol ? that.getPrefix(market) + res.data.data.name + " (" + res.data.data.symbol + ")" : '--',
            priceCNY: priceCNY,
            priceUSD: priceUSD,
            priceShow: priceShow,
            trends: res.data.data.market_cap.percent_change_display ? tools.friendlyNumber(res.data.data.market_cap.percent_change_display) : '0',
            rank: res.data.data.market_cap.rank ? res.data.data.market_cap.rank : '--',
            marketCap: res.data.data.market_cap.market_cap_usd ? tools.friendlyNumber(res.data.data.market_cap.market_cap_usd.toFixed(2)) : '--',
            volume24h: res.data.data.market_cap.volume_usd_24h ? tools.friendlyNumber(res.data.data.market_cap.volume_usd_24h.toFixed(2)) : '--',
            availableSupply: res.data.data.market_cap.available_supply ? tools.friendlyNumber(res.data.data.market_cap.available_supply) : '--',
            links: {
              'website': res.data.data.website ? res.data.data.website : '暂无',
              'explorer': res.data.data.explorer ? res.data.data.explorer : '暂无',
            } ,
            markets: res.data.data.markets ? res.data.data.markets : [],
            trendIncreaseCss: trendIncreaseCss,
            trendDecreaseCss: trendDecreaseCss,
            symbolSelected: that.isSelected(res.data.data.market_cap.currency_id, res.data.data.market_cap.symbol),
            market: market,
            trendPeriod: trendPeriod,
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

  selectSymbol: function () {
    let status = this.data.symbolSelected
    let cid = this.data.cid
    let symbol = this.data.symbol
    let name = this.data.name

    if (status) {
      sc.selectCurrency(cid, name, symbol, false)
    }
    else {
      sc.selectCurrency(cid, name, symbol, true)
    }

    this.setData({
      symbolSelected: !status
    })
  },

  isSelected: function (cid, symbol) {
    return sc.isSelected(cid, symbol)
  },

  getPrefix: function (market='cmc') {
    if (market == 'yunbi') {
      return '云币, '
    }
    return ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log('options: ', options)
    let that = this
    if (!options.symbol) { this.seeAll(); return }
    this.updateCurrency(options.cid, options.market)

    wx.setNavigationBarTitle({
      title: that.getPrefix(options.market) + options.symbol
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
    return {
      title: this.getPrefix(this.data.market) + this.data.name,
      path: '/pages/eos/mcdetail?symbol=' + this.data.symbol + '&cid=' + this.data.cid + '&market=' + this.data.market,
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