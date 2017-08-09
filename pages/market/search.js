// pages/market/search.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchPanelShow: true,
    markets: [
      {
        name: 'cmc',
        alias: '综合',
        showname: '综合',
        color: '#666',
      },
      {
        name: 'yunbi',
        alias: '云币',
        showname: '云币',
        color: "red",
      },
      {
        name: 'huobi',
        alias: '火币',
        showname: '火币',
        color: '#666',
      },
      {
        name: 'okcoin',
        alias: '必行',
        showname: '必行',
        color: '#666',
      },
      {
        name: 'Bittrex',
        alias: 'Bittrex',
        showname: 'Bittrex',
        color: '#666',
      },
      {
        name: 'chbtc',
        alias: '中国比特币',
        showname: '中国比特币',
        color: '#666',
      },
      {
        name: 'btc9',
        alias: '币久',
        showname: '币久',
        color: '#666',
      },
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
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