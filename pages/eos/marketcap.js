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
    lastScope: "markets", // for cancel filter
    scope: "markets",
    market: "cmc",
    selectedScope: false, // 当前是否是自选
    rateSortColor: "#999",
    rankSortColor: "#000",
    selectedScopeColor: "#999",
    yunbiColor: "#999",
    riseRed: false,
    focus: false,
    scrollTop: 0,
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
    if (!(this.data.scope == 'filter')) {
      let that = this
      this.setData({
        lastScope: that.data.scope,
        focus: false,
      })
    }

    this.updateMarketcap('filter', this.data.sort)
  },

  onBindBlur: function (event) {
    this.setData({
      searchPanelShow: false,
      focus: false,
    })
  },

  onCancelImgTap: function (event) {
    this.setData({
      keyword: ''
    })

    let scope = this.data.lastScope ? this.data.lastScope : 'markets'
    this.updateMarketcap(scope, this.data.sort)
  },

  redirectToDetail: function (res) {
    let cid = res.currentTarget.dataset.cid
    let symbol = res.currentTarget.dataset.symbol
    wx.navigateTo({
      url: 'mcdetail?symbol=' + symbol + '&cid=' +cid
    })
  },

  redirectToMarketDetail: function (res) {
    let cid = res.currentTarget.dataset.cid
    let symbol = res.currentTarget.dataset.symbol
    let market = 'yunbi'
    wx.navigateTo({
      url: 'mcdetail?symbol=' + symbol + '&cid=' + cid + '&market=' + market
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

  goAddSelected: function () {
    wx.navigateTo({
      url: '/pages/me/selected',
    })
  },

  updateMarketcap: function (scope, sort, market=this.data.market) {
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
        this.flushData(scope, sort, market, [])
        // this.setData({
        //   scope: 'markets',
        //   market: 'cmc',
        // })
        // wx.showModal({
        //   title: '尚未添加自选行情',
        //   content: '您可以在"我的"->"币行情自选"页面搜索添加',
        //   confirmText: '现在添加',
        //   confirmColor: '#2196F3',
        //   cancelColor: '#888',
        //   success: function (result) {
        //     if (result.confirm) {
        //       app.globalData.tmpParams = 'add_selected'
        //       console.log(app.globalData)
        //       wx.switchTab({
        //         url: '/pages/me/index',
        //       })
        //     } else if (result.cancel) {
        //       console.log('用户点击取消')
        //     }
        //   }
        // })

        return
      }
    }

    if (scope == 'markets') {
      if (market == 'cmc') {
        let symbolCnt = wx.getStorageSync('symbolCntIndex')
        let url_param = 'limit=200'
        if (symbolCnt && symbolCnt == 1) {
          url_param = 'limit=500'
        }
        url = url + '?' + url_param
      }
      if (market == 'yunbi') {
        url = settings.requestMarketDataUrl + '?' + 'market=yunbi'
      }
    }

    if (scope == 'filter') {
      url = url + '?symbol=' + this.data.keyword.trim()
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
            let priceCNY = null
            let priceUSD = null
            let priceShow = null
            if (mcListRaw[i].price_cny) {
              priceCNY = mcListRaw[i].price_cny >= 0.01 ? tools.friendlyNumber(mcListRaw[i].price_cny.toFixed(2)) : mcListRaw[i].price_cny
            }
            if (mcListRaw[i].price_usd) {
              priceUSD = mcListRaw[i].price_usd >= 0.01 ? tools.friendlyNumber(mcListRaw[i].price_usd.toFixed(2)) : mcListRaw[i].price_usd
            }
            if (priceCNY !== null && !(fiat && fiat == 1 && priceUSD)) {
              priceShow = '¥' + priceCNY
            }else {
              priceShow = '$' + priceUSD
            }

            let percentChange = 0
            if (mcListRaw[i].percent_change_display) {
              percentChange = parseFloat(mcListRaw[i].percent_change_display)
            }
            else if (mcListRaw[i].percent_change_24h) {
              percentChange = parseFloat(mcListRaw[i].percent_change_24h)
            }
            else{
              percentChange = 0
            }

            mcList.push({
              cid: mcListRaw[i].currency_id,
              name: mcListRaw[i].name,
              symbol: mcListRaw[i].symbol,
              rank: mcListRaw[i].rank ? mcListRaw[i].rank : '--',
              priceShow: priceShow,
              priceCNY: priceCNY,
              priceUSD: priceUSD,
              marketcap: mcListRaw[i].market_cap_usd ? tools.friendlyNumber(mcListRaw[i].market_cap_usd) : '--',
              percentChange: percentChange,
              trendIncreaseCss: trendIncreaseCss,
              trendDecreaseCss: trendDecreaseCss,
            })
          }
          that.flushData(scope, sort, market, mcList)
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

  // sort 排序模式： rank, rate_asc, rate_desc
  // originData, 如果不传入值则取本地symbols数据, 这个值也会被setData为symbols
  flushData: function (scope = 'markets', sort='rank', market='cmc', originData=this.data.symbols) {
    let settings = this.data

    const selectedColor = "#000"
    const unselectedColor = "#999"
    if (!sort in ['rank', "rate_asc", "rate_desc"]) {
      return null
    }
  
    if (!scope in ["markets", "selected", "filter"]) {
      return null
    }

    // get filtered result
    settings.scope = scope
    settings.market = market
    settings.keyword = this.data.keyword
    let symbolsToShow = this.getSymbolsToShow(settings.keyword, originData)

    if (scope == 'markets') {
      if (market == 'cmc') {
        // sort
        if (sort === 'rank') {
          settings.rateSortColor = unselectedColor
          settings.rankSortColor = selectedColor
          settings.selectedScopeColor = unselectedColor
          settings.yunbiColor = unselectedColor
          settings.sort = 'rank'
          symbolsToShow = symbolsToShow.sort(tools.by("rank"))
        }
        if (sort == "rate_asc") {
          settings.rateSortColor = selectedColor
          settings.rankSortColor = unselectedColor
          settings.selectedScopeColor = unselectedColor
          settings.yunbiColor = unselectedColor
          settings.sort = 'rate_asc'
          symbolsToShow = symbolsToShow.sort(tools.by("percentChange", "asc"))
        }
        if (sort == "rate_desc") {
          settings.rateSortColor = selectedColor
          settings.rankSortColor = unselectedColor
          settings.selectedScopeColor = unselectedColor
          settings.yunbiColor = unselectedColor
          settings.sort = 'rate_desc'
          symbolsToShow = symbolsToShow.sort(tools.by("percentChange", "desc"))
        }
      }
      else if (market == 'yunbi') {
        settings.rateSortColor = unselectedColor
        settings.rankSortColor = unselectedColor
        settings.selectedScopeColor = unselectedColor
        settings.yunbiColor = selectedColor
        settings.sort = 'no_sort'
      }
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

      settings.sort = ''
      settings.rateSortColor = unselectedColor
      settings.rankSortColor = unselectedColor
      settings.selectedScopeColor = selectedColor
      settings.yunbiColor = unselectedColor
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
        market: market,
        sort: settings.sort,
      },
    })
    console.log(settings)
  },

  sortByRate: function () {
    let sort = this.data.sort == "rate_desc" ? "rate_asc" : "rate_desc"
    if (!(this.data.scope == 'markets' && this.data.market == 'cmc')) {
      this.updateMarketcap('markets', sort, 'cmc')
    } else {
      this.flushData('markets', sort, 'cmc')
    }
  },

  sortByRank: function () {
    if (!(this.data.scope == 'markets' && this.data.market == 'cmc')) {
      this.updateMarketcap('markets', "rank", 'cmc')
    }
    else if (!(this.data.sort == 'rank')) {
      this.flushData('markets', "rank", 'cmc')
    }
  },

  goYunbi: function () {
    if (!(this.data.scope == 'markets' && this.data.market == 'yunbi')) {
      this.updateMarketcap('markets', 'no_sort', 'yunbi')
    }
  },

  bindSelectedScope: function () {
    if (!(this.data.scope == 'selected')) {
      this.updateMarketcap('selected', this.data.sort)
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let keyword = ''
    let sort = 'rank'
    let scope = 'markets'
    let market = 'cmc'

    if (options.sort) {
      sort = options.sort
    }

    if (options.market) {
      market = options.market
    }

    if (options.keyword) {
      keyword = options.keyword
      scope = 'filter'
    }

    if (!options.keyword && !options.sort && !options.markets) {  // 如果是从分享进入
      let storageData = wx.getStorageSync('coinListParams')
      if (storageData.scope) {
        scope = storageData.scope
      }
      if (storageData.sort) {
        sort = storageData.sort
      }
      if (storageData.market) {
        market = storageData.market
      }
    }

    // this.updateMarketcap('top', keyword, sort)
    // let selectedScope = (scope == 'selected') ? true : false
    let searchPanelShow = (scope == 'filter') ? true : false
    console.log(keyword, sort, scope, searchPanelShow)
    this.setData({
      keyword: keyword,
      sort: sort,
      scope: scope,
      market: market,
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
    console.log('tmpParams: ',app.globalData.tmpParams)
    if (app.globalData.tmpParams && app.globalData.tmpParams == 'cmc_top') {
      app.globalData.tmpParams = ''
      this.updateMarketcap('markets', 'rank', 'cmc')
    }
    else {
      this.updateMarketcap(this.data.scope, this.data.sort)
    }
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
      scope: this.data.scope,
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
    // let scope = this.getCurrentScope()
    this.updateMarketcap(this.data.scope, this.data.sort)
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
      path: '/pages/eos/marketcap?keyword=' + this.data.keyword + '&sort=' + this.data.sort + '&market=' + this.data.market,
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