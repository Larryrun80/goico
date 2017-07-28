// pages/me/selected.js
var tools = require('../../utils/tools.js')
var requests = require('../../utils/requests.js')
var settings = require('../../secret/settings.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    keyword: '',
    searchPanelShow: false,
  },

  loadData: function (loadType='normal') { // 重新加在本地数据
    let currencies = []
    let selected = wx.getStorageSync('selectedSymbols') ? wx.getStorageSync('selectedSymbols') : []

    for (let i in selected) {
      if (selected[i].currency) {
        currencies.push({
          seq: i,
          currency: selected[i].currency,
          name: selected[i].name,
          symbol: selected[i].symbol,
          symbolSelected: true,
        })
      }
    }

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

    let item = selected.splice(seq, 1)
    selected.unshift(item[0])

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
    let keyword = event.detail.value;
    this.filterData(keyword)
  },

  filterData: function (keyword) { // 搜索加载远程数据
    var currenciesToShow = []

    let that = this
    let url = settings.requestMarketListUrl + '?symbol=' + keyword
    let selected = wx.getStorageSync('selectedSymbols') ? wx.getStorageSync('selectedSymbols') : []

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
              if (selected[j].symbol == res.data.data.list[i].symbol) {
                symbolSelected = true
                break
              }
            }

            currencies.push({
              currency: currency,
              name: res.data.data.list[i].name,
              symbol: res.data.data.list[i].symbol,
              symbolSelected: symbolSelected,
            })
          }

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

  selectSymbol: function (e) {
    let showList = this.data.currenciesToShow

    let selected = wx.getStorageSync('selectedSymbols') ? wx.getStorageSync('selectedSymbols') : []
    for (let i in showList) {
      if (showList[i].symbol == e.currentTarget.dataset.symbol) { // 找到需要操作的item
        if (showList[i].symbolSelected) {
          for (let si in selected) {
            if (selected[si].symbol == showList[i].symbol) {
              selected.splice(si, 1)
              break
            }
          }
          showList[i].symbolSelected = false
        }
        else {
          selected.push({
            currency: showList[i].name + ' (' + showList[i].symbol + ')',
            name: showList[i].name,
            symbol: showList[i].symbol,
          })
          showList[i].symbolSelected = true
        }
        break
      }
    }

    wx.setStorageSync('selectedSymbols', selected)

    if (this.data.searchPanelShow) {
      this.setData({
        currenciesToShow: showList
      })
    }else {
      this.loadData()
    }
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