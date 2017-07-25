// pages/test/test.js
var wxCharts = require('../../utils/wxCharts.js')
var app = getApp()
var lineChart = null
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  touchHandler: function (e) {
    console.log(lineChart.getCurrentDataIndex(e));
    lineChart.showToolTip(e, {
      // background: '#7cb5ec'
    });
  }, 
  createSimulationData: function () {
    var categories = [];
    var data = [];
    for (var i = 0; i < 7; i++) {
      categories.push('2016-' + (i + 1));
      data.push(Math.random() * (20 - 10) + 10);
    }
    // data[4] = null;
    return {
      categories: categories,
      data: data
    }
  },
  updateData: function () {
    var simulationData = this.createSimulationData();
    var series = [{
      name: '成交量1',
      data: simulationData.data,
      format: function (val, name) {
        return val.toFixed(2) + '万';
      }
    }];
    lineChart.updateData({
      categories: simulationData.categories,
      series: series
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var windowWidth = 320;
    try {
      var res = wx.getSystemInfoSync();
      windowWidth = res.windowWidth;
    } catch (e) {
      console.error('getSystemInfoSync failed!');
    }

    var simulationData = this.createSimulationData();
    lineChart = new wxCharts({
      canvasId: 'lineCanvas',
      type: 'line',
      categories: simulationData.categories,
      animation: true,
      background: '#f5f5f5',
      series: [{
        name: '成交量1',
        data: simulationData.data,
        format: function (val, name) {
          return val.toFixed(2) + '万';
        }
      }, {
        name: '成交量2',
        data: [2, 0, 0, 3, 4],
        format: function (val, name) {
          return val.toFixed(2) + '万';
        }
      }],
      xAxis: {
        disableGrid: true
      },
      yAxis: {
        format: function (val) {
          return val.toFixed(0);
        },
        min: 0
      },
      width: windowWidth,
      height: 200,
      dataLabel: false,
      dataPointShape: true,
      extra: {
        lineStyle: 'curve'
      }
    });
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