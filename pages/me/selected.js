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

  getSelectedSymbols: function () {
    let currencies = []
    let selected = wx.getStorageSync('selectedSymbols') ? wx.getStorageSync('selectedSymbols') : []
    for (let i in selected) {
      if (selected[i].currency) {
        currencies.push({
          currency: selected[i].currency,
          name: selected[i].name,
          symbol: selected[i].symbol,
          symbolSelected: true,
        })
      }
    }
    this.setData({
      currencies: currencies,
      currenciesToShow: currencies,
    })
  },

  // getAllSymbols: function () {
  //   let that = this
  //   let url = settings.requestMarketListUrl + '?limit=2000'
  //   let selected = wx.getStorageSync('selectedSymbols') ? wx.getStorageSync('selectedSymbols') : []

  //   requests.request(
  //     url,
  //     function (res) {
  //       if (res.data.code == 0) {
  //         // console.log(res)
  //         let currencies = []
  //         for (let i in res.data.data.list) {
  //           let currency = res.data.data.list[i].name + ' (' + res.data.data.list[i].symbol + ')'
  //           let symbol_selected = false
  //           if (selected.includes(res.data.data.list[i].symbol)) {
  //             symbol_selected = true
  //           }
  //           currencies.push({
  //             id: res.data.data.list[i].id,
  //             currency: currency,
  //             symbol: res.data.data.list[i].symbol,
  //             symbol_selected: symbol_selected,
  //           })
  //         }

  //         that.setData({
  //           currencies: currencies,
  //           currenciesToShow: currencies.sort(tools.by("symbol_selected", "desc")),
  //         })
  //       }
  //     },
  //     function (res) {
  //       wx.showToast({
  //         title: '获取数据失败，请稍候再试...',
  //         duration: 1500,
  //         image: '/images/exclamationmark.png'
  //       })
  //     }
  //   )
  // },

  redirectToDetail: function (res) {
    let symbol = res.currentTarget.dataset.symbol
    wx.navigateTo({
      url: '/pages/eos/mcdetail?symbol=' + symbol
    })
  },

  onBindFocus: function (e) {
    this.setData({
      // containerShow: false,
      searchPanelShow: true,
    })
  },

  onBindInput: function (event) {
    let keyword = event.detail.value;
    this.reloadData(keyword)
  },

  reloadData: function (keyword) {
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
            let symbol_selected = false
            if (selected.includes(res.data.data.list[i].symbol)) {
              symbol_selected = true
            }
            currencies.push({
              currency: currency,
              name: res.data.data.list[i].name,
              symbol: res.data.data.list[i].symbol,
              symbol_selected: symbol_selected,
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

    // for (var i in this.data.currencies) {
    //   if (this.data.currencies[i].currency.toUpperCase().indexOf(keyword.toUpperCase()) >= 0) {
    //     currenciesToShow.push(this.data.currencies[i])
    //   }
    // }

    // this.setData({
    //   keyword: keyword,
    //   currenciesToShow: currenciesToShow.sort(tools.by("symbol_selected", "desc")),
    // })
  },

  onCancelImgTap: function () {
    let keyword = ''
    let that = this
    this.setData({
      keyword: keyword,
      currenciesToShow: that.getSelectedSymbols(),
      searchPanelShow: false,
    })
  },

  selectSymbol: function (e) {
    let showList = this.data.currenciesToShow

    let selected = wx.getStorageSync('selectedSymbols') ? wx.getStorageSync('selectedSymbols') : []
    for (let i in showList) {
      if (showList[i].symbol == e.currentTarget.dataset.symbol) {
        if (showList[i].symbolSelected) {
          for (let si in selected) {
            if (selected[si].symbol == showList[i].symbol) {
              selected.splice(si, 1)
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
    this.setData({
      currenciesToShow: showList
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getSelectedSymbols()
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