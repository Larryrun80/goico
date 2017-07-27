// pages/eos/marketcap.js
var tools = require('../../utils/tools.js')
var requests = require('../../utils/requests.js')
var settings = require('../../secret/settings.js')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // containerShow: true,
    searchPanelShow: false,
    keyword: '',
    symbols: [],
    symbolsToShow: [],
    sort: "rank",
    selectedScope: false, // 当前是否是自选
    rateSortColor: "#999",
    rankSortColor: "#000",
    selectedScopeColor: "#999",
    riseRed: false,
  },

  onBindFocus: function (e) {
    this.setData({
      // containerShow: false,
      searchPanelShow: true,
    })
  },

  onBindInput: function (event) {
    let keyword = event.detail.value;
    let scope = this.data.selectedScope ? 'selected' : 'top'
    this.flushData(scope, keyword, this.data.sort)
  },

  onBindBlur: function (event) {
    this.setData({
      searchPanelShow: false,
    })
  },

  onCancelImgTap: function (event) {
    let keyword = ''
    let scope = this.data.selectedScope ? 'selected' : 'top'
    this.flushData(scope, keyword, this.data.sort)
    this.setData({
      // containerShow: true,
      searchPanelShow: false,      
    })
  },

  redirectToDetail: function (res) {
    let name = res.currentTarget.dataset.name
    let symbol = res.currentTarget.dataset.symbol
    wx.navigateTo({
      url: 'mcdetail?symbol=' + symbol
    })
  },

  getSymbolsToShow: function (keyword, symbolList) {
    var symbolsToShow = []
    for (var i in symbolList){
      if (symbolList[i].symbol.toUpperCase().indexOf(keyword.toUpperCase())>=0 || symbolList[i].name.toUpperCase().indexOf(keyword.toUpperCase())>=0) {
        symbolsToShow.push(symbolList[i])
      }
    }
    return symbolsToShow
  },

  updateMarketcap: function (scope, keyword, sort) {
    let that = this
    let fiat = wx.getStorageSync('defaultFiatIndex')

    // rise color
    let riseColor = wx.getStorageSync('riseColor')
    let trendIncreaseCss = 'item-trend-green'
    let trendDecreaseCss = 'item-trend-red'
    if (riseColor && riseColor == 'red') {
      trendIncreaseCss = 'item-trend-red'
      trendDecreaseCss = 'item-trend-green'
    }

    // top 200 or top 500
    let url = settings.requestMarketListUrl
    let symbolCnt = wx.getStorageSync('symbolCntIndex')
    if (scope == 'selected') {
      let selected = wx.getStorageSync('selectedSymbols')
      let url_param = selected.join()
      if (url_param) {
        url = url + '?symbol=' + url_param
      }
      else {
        wx.showToast({
          title: '当前没有自选货币，请先到币详情或设置页面添加',
          duration: 2000,
        })
        return
      }
    }
    else {
      let url_param = 'limit=200'
      if (symbolCnt && symbolCnt == 1) {
        url_param = 'limit=500'
      }
      url = url + '?' + url_param
    }
    requests.request(
      url,
      function (res) {
        if (res.data.code == 0) {
          // console.log(res)
          let mcList = []
          let mcListRaw = res.data.data.list
          for (let i in mcListRaw) {
            let priceCNY = mcListRaw[i].price_cny >= 0.01 ? tools.friendlyNumber(mcListRaw[i].price_cny.toFixed(2)) : mcListRaw[i].price_cny
            let priceUSD = mcListRaw[i].price_usd >= 0.01 ? tools.friendlyNumber(mcListRaw[i].price_usd.toFixed(2)) : mcListRaw[i].price_usd
            let priceShow = '¥' + priceCNY
            
            if (fiat && fiat == 1) {
              priceShow = '$' + priceUSD
            }
            mcList.push({
              name: mcListRaw[i].name,
              symbol: mcListRaw[i].symbol,
              rank: mcListRaw[i].rank,
              priceShow: priceShow,
              priceCNY: priceCNY,
              priceUSD: mcListRaw[i].price_usd,
              marketcap: tools.friendlyNumber(mcListRaw[i].market_cap_usd),
              percentChange: mcListRaw[i].percent_change_24h ? mcListRaw[i].percent_change_24h : ((Math.random() - 0.5) * 100).toFixed(2),
              trendIncreaseCss: trendIncreaseCss,
              trendDecreaseCss: trendDecreaseCss,
            })
          }
          that.flushData(scope, keyword, sort, mcList)
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
  // originData, 如果不传入值则取本地symbols数据, 这个值也会被setData为symbols
  flushData: function (scope = 'top', keyword='', sort='rank', originData=this.data.symbols) {
    let settings = {}

    const selectedColor = "#000"
    const unselectedColor = "#999"
    if (!sort in ['rank', "rate_asc", "rate_desc"]) {
      return null
    }
  
    if (!scope in ['top', "selected"]) {
      return null
    }

    // get filtered result
    settings.keyword = keyword
    let symbolsToShow = this.getSymbolsToShow(keyword, originData)

    if (scope == 'top') {
      // sort
      if (sort === 'rank') {
        settings.rateSortColor = unselectedColor
        settings.rankSortColor = selectedColor
        settings.selectedScopeColor = unselectedColor
        settings.sort = 'rank'
        symbolsToShow = symbolsToShow.sort(tools.by("rank"))
      }
      if (sort == "rate_asc") {
        settings.rateSortColor = selectedColor
        settings.rankSortColor = unselectedColor
        settings.selectedScopeColor = unselectedColor
        settings.sort = 'rate_asc'
        symbolsToShow = symbolsToShow.sort(tools.by("percentChange", "asc"))
      }
      if (sort == "rate_desc") {
        settings.rateSortColor = selectedColor
        settings.rankSortColor = unselectedColor
        settings.selectedScopeColor = unselectedColor
        settings.sort = 'rate_desc'
        symbolsToShow = symbolsToShow.sort(tools.by("percentChange", "desc"))
      }
      settings.selectedScope = false
    }
    else {  // if selected Symbols
      let symbols = {}
      for (let i in symbolsToShow) {
        symbols[symbolsToShow[i].symbol] = symbolsToShow[i]
      }

      symbolsToShow = []
      let selectedSymbols = wx.getStorageSync('selectedSymbols')
      for (let i in selectedSymbols) {
        if (symbols[selectedSymbols[i]]) {
          symbolsToShow.push(symbols[selectedSymbols[i]])
        }
      }
      settings.selectedScope = true
      settings.sort = ''
      settings.rateSortColor = unselectedColor
      settings.rankSortColor = unselectedColor
      settings.selectedScopeColor = selectedColor
    }

    // scope
    // if (scope == "top") {
    //   settings.topScopeColor = selectedColor
    //   settings.selectedScopeColor = unselectedColor
    //   settings.scope = 'top'
    // }
    // if (scope == "selected") {
    //   settings.topScopeColor = unselectedColor
    //   settings.selectedScopeColor = selectedColor
    //   settings.scope = 'selected'
    // }

    settings.symbols = originData
    settings.symbolsToShow = symbolsToShow
    this.setData(
      settings
    )
  },

  sortByRate: function () {
    let sort = this.data.sort == "rate_desc" ? "rate_asc" : "rate_desc"
    if (this.data.selectedScope) {
      this.updateMarketcap('top', this.data.keyword, sort)
    }
    else {
      this.flushData('top', this.data.keyword, sort)
    }
  },

  sortByRank: function () {
    if (!(this.data.sort == 'rank')) {
      if (this.data.selectedScope) {
        this.updateMarketcap('top', this.data.keyword, 'rank')
      }
      else {
        this.flushData('top', this.data.keyword, "rank")
      }
    }
  },

  // bindTopScope: function () {
  //   if (!(this.data.scope == 'top')) {
  //     this.updateMarketcap('top', this.data.keyword, this.data.sort)
  //   }
  // },

  bindSelectedScope: function () {
    if (!this.data.selectedScope) {
      this.updateMarketcap('selected', this.data.keyword, this.data.sort)
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let keyword = options.filter ? options.filter : ''
    let sort = options.sort ? options.sort : 'rank'

    this.updateMarketcap('top', keyword, sort)
  
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
    let scope = this.data.selectedScope ? 'selected' : 'top'
    this.updateMarketcap(scope, this.data.keyword, this.data.sort)
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