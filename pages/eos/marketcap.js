// pages/eos/marketcap.js
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
    yunbiColor: "#999",
    riseRed: false,
    focus: false,
  },

  onBindFocus: function (e) {
    this.setData({
      // containerShow: false,
      searchPanelShow: true,
      focus: true,
    })
  },

  onBindInput: function (event) {
    let keyword = event.detail.value
    this.setData({
      keyword: keyword
    })
  },

  search: function (event) {
    this.updateMarketcap('filter', this.data.keyword, this.data.sort)
  },

  onBindBlur: function (event) {
    this.setData({
      searchPanelShow: false,
      focus: false,
    })
  },

  onCancelImgTap: function (event) {
    let keyword = ''
    let scope = this.data.selectedScope ? 'selected' : 'top'
    this.updateMarketcap(scope, keyword, this.data.sort)
  },

  redirectToDetail: function (res) {
    let cid = res.currentTarget.dataset.cid
    let symbol = res.currentTarget.dataset.symbol
    wx.navigateTo({
      url: 'mcdetail?symbol=' + symbol + '&cid=' +cid
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

    // generate request url by scope
    let url = settings.requestMarketListUrl
    if (scope == 'selected') {
      let selected_url = sc.getRemoteUrl()
      if (selected_url != url) {
        url = selected_url
      }
      else {
        wx.showModal({
          title: '尚未添加自选行情',
          content: '您可以在"我的"->"币行情自选"页面搜索添加',
          confirmText: '现在添加',
          confirmColor: '#2196F3',
          cancelColor: '#888',
          success: function (result) {
            if (result.confirm) {
              app.globalData.tmpParams = {settingsAction: 'add selected'}
              console.log(app.globalData)
              wx.switchTab({
                url: '/pages/me/index',
              })
            } else if (result.cancel) {
              console.log('用户点击取消')
            }
          }
        })

        return
      }
    }

    if (scope == 'top') {
      let symbolCnt = wx.getStorageSync('symbolCntIndex')
      let url_param = 'limit=200'
      if (symbolCnt && symbolCnt == 1) {
        url_param = 'limit=500'
      }
      url = url + '?' + url_param
    }

    if (scope == 'filter') {
      url = url + '?symbol=' + keyword.trim()
    }

    // start request
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
              cid: mcListRaw[i].currency_id,
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
  
    if (!scope in ['top', "selected", "filter"]) {
      return null
    }

    // get filtered result
    settings.scope = scope
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
      settings.searchPanelShow = false
      settings.focus = false
    }

    if (scope == 'selected') {  // if selected Symbols
      let symbolsTemp = symbolsToShow
      symbolsToShow = []
      let [selected, ] = sc.loadSelectedData()
      for (let i in selected) {
        for (let j in symbolsTemp) {
          if ((selected[i].currency_id && selected[i].currency_id == symbolsTemp[j].cid) ||
            (selected[i].name == symbolsTemp[j].name && selected[i].symbol == symbolsTemp[j].symbol)) {
            symbolsToShow.push(symbolsTemp[j])
          }
        }
      }

      settings.selectedScope = true
      settings.sort = ''
      settings.rateSortColor = unselectedColor
      settings.rankSortColor = unselectedColor
      settings.selectedScopeColor = selectedColor
      settings.searchPanelShow = false
      settings.focus = false
    }

    settings.symbols = originData
    settings.symbolsToShow = symbolsToShow
    this.setData(
      settings
    )

    wx.setStorage({
      key: 'coinListParams',
      data: {
        scope: scope,
        sort: settings.sort,
      },
    })
  },

  getCurrentScope: function () {
    let scope = 'top'

    if (this.data.selectedScope) {
      scope = 'selected'
    }

    if (this.data.keyword) {
      scope = 'filter'
    }

    // console.log('[carketcap] -getCurrentScope- scope: ', scope)
    return scope
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
    let keyword = ''
    let sort = 'rank'
    let scope = 'top'

    if (options.sort) {
      sort = options.sort
    }

    if (options.keyword) {
      keyword = options.keyword
      scope = 'filter'
    }

    if (!options.keyword && !options.sort) {  // 如果是从分享进入
      let storageData = wx.getStorageSync('coinListParams')
      if (storageData.scope) {
        scope = storageData.scope
      }
      if (storageData.sort) {
        sort = storageData.sort
      }
    }

    // this.updateMarketcap('top', keyword, sort)
    let selectedScope = (scope == 'selected') ? true : false
    let searchPanelShow = (scope == 'filter') ? true : false
    console.log(keyword, sort, selectedScope, searchPanelShow)
    this.setData({
      keyword: keyword,
      sort: sort,
      selectedScope: selectedScope,
      searchPanelShow: searchPanelShow,
      focus: false,
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
    let scope = this.getCurrentScope()
    console.log(scope, this.data.keyword, this.data.sort)
    this.updateMarketcap(scope, this.data.keyword, this.data.sort)
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
    let data = {
      scope: this.data.selectedScope,
      sort: this.data.sort,
    }

    wx.setStorage({
      key: 'coinListParams',
      data: data,
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    let scope = this.getCurrentScope()
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
      path: '/pages/eos/marketcap?keyword=' + this.data.keyword + '&sort=' + this.data.sort,
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