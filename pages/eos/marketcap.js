// pages/eos/marketcap.js
var tools = require('../../utils/tools.js')
var requests = require('../../utils/requests.js')
var settings = require('../../secret/settings.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    containerShow: true,
    searchPanelShow: false,
    keyword: '',
    coins: [],
    filteredCoins: [],
    sort: "rank",
    rateSortColor: "#999",
    rankSortColor: "#000",
  },

  onBindFocus: function (e) {
    this.setData({
      containerShow: false,
      searchPanelShow: true,
    })
  },

  onBindInput: function (event) {
    let keyword = event.detail.value;
    this.flushData(keyword, this.data.sort)
  },

  onBindBlur: function (event) {
    this.setData({
      searchPanelShow: false,
    })
  },

  onCancelImgTap: function (event) {
    let keyword = ''
    this.flushData(keyword, this.data.sort)
    this.setData({
      containerShow: true,
      searchPanelShow: false,      
    })
  },

  redirectToDetail: function (res) {
    let name = res.currentTarget.dataset.name
    let coin = res.currentTarget.dataset.coin
    wx.navigateTo({
      url: 'mcdetail?symbol=' + coin
    })
  },

  getfilterCoins: function (keyword, coinList) {
    var filteredCoins = []

    for (var i in coinList){
      if (coinList[i].coin.toUpperCase().indexOf(keyword.toUpperCase())>=0 || coinList[i].name.toUpperCase().indexOf(keyword.toUpperCase())>=0) {
        filteredCoins.push(coinList[i])
      }
    }

    return filteredCoins
  },

  updateMarketcap: function (keyword, sort) {
    let that = this
    requests.request(
      settings.requestMarketcapUrl,
      function (res) {
        if (res.data.code == 0) {
          // console.log(res)
          let mcList = []
          let mcListRaw = res.data.data.list
          for (let i in mcListRaw) {
            mcList.push({
              name: mcListRaw[i].name,
              coin: mcListRaw[i].symbol,
              rank: mcListRaw[i].rank,
              priceCNY: mcListRaw[i].price_cny >= 0.01 ? tools.friendlyNumber(mcListRaw[i].price_cny.toFixed(2)) : mcListRaw[i].price_cny,
              priceUSD: mcListRaw[i].price_usd,
              marketcap: tools.friendlyNumber(mcListRaw[i].market_cap_usd),
              percentChange: mcListRaw[i].percent_change_24h ? mcListRaw[i].percent_change_24h : ((Math.random() - 0.5) * 100).toFixed(2)
            })
          }

          that.flushData(keyword, sort, mcList)
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

  // keyword, 搜索关键词
  // sort 排序模式： rank, rate_asc, rate_desc
  // originData, 如果不传入值则取本地coins数据, 这个值也会被setData为coins
  flushData: function (keyword='', sort='rank', originData=this.data.coins) {
    let settings = {}
    const selectedColor = "#000"
    const unselectedColor = "#999"

    if (!sort in ['rank', "rate_asc", "rate_desc"]) {
      return null
    }

    // get filtered result
    settings.keyword = keyword
    let filteredCoins = this.getfilterCoins(keyword, originData)

    // sort
    if (sort === 'rank') {
      settings.rateSortColor = unselectedColor
      settings.rankSortColor = selectedColor
      settings.sort = 'rank'
      filteredCoins = filteredCoins.sort(tools.by("rank"))
    }
    if (sort == "rate_asc") {
      settings.rateSortColor = selectedColor
      settings.rankSortColor = unselectedColor
      settings.sort = 'rate_asc'
      filteredCoins = filteredCoins.sort(tools.by("percentChange", "asc"))
    }
    if (sort == "rate_desc") {
      settings.rateSortColor = selectedColor
      settings.rankSortColor = unselectedColor
      settings.sort = 'rate_desc'
      filteredCoins = filteredCoins.sort(tools.by("percentChange", "desc"))
    }

    settings.coins = originData
    settings.filteredCoins = filteredCoins

    this.setData(
      settings
    )
  },

  loadSettings: function () {
    this.setData({
      requestMarketcapUrl: settings.requestMarketcapUrl
    })
  },

  sortByRate: function () {
    let sort = this.data.sort == "rate_desc" ? "rate_asc" : "rate_desc"
    this.flushData(this.data.keyword, sort)
  },

  sortByRank: function () {
    if (!(this.data.sort == 'rank')) {
      this.flushData(this.data.keyword, "rank")
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let keyword = options.filter ? options.filter : ''
    let sort = options.sort ? options.sort : 'rank'

    this.updateMarketcap(keyword, sort)
  
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
    this.updateMarketcap(this.data.keyword, this.data.sort)
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
      title: '币行情',
      path: '/pages/eos/marketcap?filter=' + this.data.keyword + '&sort=' + this.data.sort,
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