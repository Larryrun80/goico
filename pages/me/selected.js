// pages/me/selected.js
var tools = require('../../utils/tools.js')
var requests = require('../../utils/requests.js')
var settings = require('../../secret/settings.js')
var sc = require('../../utils/selectedCurrency.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    keyword: '',
    searchPanelShow: false,
  },

  loadData: function (loadType='normal') { // 重新加在本地数据
    let [currencies, ] = sc.loadSelectedData()
    console.log('[selected] -loadData- currencies: ', currencies)

    let keyword = ''
    if (this.data.keyword && loadType == 'normal') {
      keyword = this.data.keyword
    }
    let searchPanelShow = loadType == 'normal' ? this.data.searchPanelShow : false

    this.setData({
      keyword: keyword,
      searchPanelShow: searchPanelShow,
      currencies: currencies,
      currenciesToShow: currencies
    })
  },

  redirectToDetail: function (res) {
    let symbol = res.currentTarget.dataset.symbol
    wx.navigateTo({
      url: '/pages/eos/mcdetail?symbol=' + symbol
    })
  },

  upSymbol: function (res) {
    let seq = parseInt(res.currentTarget.dataset.seq)
    let selected = wx.getStorageSync('selectedSymbols') ? wx.getStorageSync('selectedSymbols') : []

    selected = tools.swapItems(selected, seq, seq-1)

    wx.setStorageSync('selectedSymbols', selected)
    this.loadData()
  },

  downSymbol: function (res) {
    let seq = parseInt(res.currentTarget.dataset.seq)
    let selected = wx.getStorageSync('selectedSymbols') ? wx.getStorageSync('selectedSymbols') : []

    selected = tools.swapItems(selected, seq, seq + 1)

    wx.setStorageSync('selectedSymbols', selected)
    this.loadData()
  },

  onBindFocus: function (e) {
    this.setData({
      // containerShow: false,
      searchPanelShow: true,
    })
  },

  onBindInput: function (event) {
    this.setData({ keyword: event.detail.value})
  },

  search: function () {
    this.filterData(this.data.keyword)
  },

  filterData: function (keyword) { // 搜索加载远程数据
    var currenciesToShow = []

    let that = this
    let url = settings.requestMarketListUrl + '?symbol=' + keyword.trim()
    let [selected, ] = sc.loadSelectedData()

    requests.request(
      url,
      function (res) {
        if (res.data.code == 0) {
          // console.log(res)
          let currencies = []
          for (let i in res.data.data.list) {
            let currency = res.data.data.list[i].name + ' (' + res.data.data.list[i].symbol + ')'
            let symbolSelected = false
            for (let j in selected) {
              if ((selected[j]['currency_id'] && selected[j]['currency_id'] == res.data.data.list[i].currency_id) ||
                (selected[j]['symbol'] == res.data.data.list[i]['symbol'] && selected[j]['name'] == res.data.data.list[i]['name'])) {
                symbolSelected = true
                break
              }
            }

            currencies.push({
              currency_id: res.data.data.list[i].currency_id,
              currency: currency,
              name: res.data.data.list[i].name,
              symbol: res.data.data.list[i].symbol,
              symbolSelected: symbolSelected,
            })
          }

          console.log('[selected] -filterData- currencies: ',currencies)
          that.setData({
            keyword: keyword,
            currencies: currencies,
            currenciesToShow: currencies,
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

  onCancelImgTap: function () {
    this.loadData('cancel_filter')
  },

  stickDisabled: function (e) {
    let message = '无法置顶：' + e.currentTarget.dataset.symbol + '已经位于关注列表顶部'
    if (parseInt(e.currentTarget.dataset.seq) > 0) {
      message = '无法置顶：您已经取消了对' + e.currentTarget.dataset.symbol + '的关注'
    }

    wx.showToast({
      title: message,
      duration: 1500,
    })
  },

  selectCurrency: function (e) {
    let showList = this.data.currenciesToShow

    // let selected = wx.getStorageSync('selectedSymbols') ? wx.getStorageSync('selectedSymbols') : []
    for (let i in showList) {
      if (showList[i].symbol == e.currentTarget.dataset.symbol && showList[i].name == e.currentTarget.dataset.name) { // 找到需要操作的item
        if (showList[i].symbolSelected) {
          sc.selectCurrency(e.currentTarget.dataset.cid, e.currentTarget.dataset.name, e.currentTarget.dataset.symbol, false)
          showList[i].symbolSelected = false
        }
        else {
          sc.selectCurrency(e.currentTarget.dataset.cid, e.currentTarget.dataset.name, e.currentTarget.dataset.symbol, true, e.currentTarget.dataset.seq ? parseInt(e.currentTarget.dataset.seq) : null)
          showList[i].symbolSelected = true
        }
        break
      }
    }

    this.setData({
      currenciesToShow: showList
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // this.loadData()
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
    // 如果在搜索状态，加载远程数据，否则加载本地
    if (this.data.searchPanelShow) {
      this.filterData(this.data.keyword)
    }else {
      this.loadData()
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
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})