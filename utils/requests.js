var secret = require('../secret/settings.js')

function getRequsetParams () {
  let params = secret.getVoucher()
  let reqParams = "timestamp=" + params[0] + "&code=" + params[1]
  return reqParams
}

function generateUrl (url) {
  if (typeof (url) != "string") { return false }

  let encryptDomain = ["iknowapp.com",]
  let needEncrypt = false

  for (var i in encryptDomain) {
    if (url.indexOf(encryptDomain[i]) >= 0) {
      needEncrypt = true
      break
    }
  }

  if (needEncrypt) {
    if (url.indexOf("?") > 0) {
      return url + '&' + getRequsetParams()
    }
    else {
      return url + '?' + getRequsetParams()
    }
  }
  else {
    return url
  }
}

function request (url, success, fail, complete) {
  // wx.showLoading({
  //   title: '拼命加载中...',
  // })
  wx.showNavigationBarLoading()
  wx.getNetworkType({
    success: function (res) {
      // 返回网络类型, 有效值：
      // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
      if (res.networkType == 'none') {
        wx.showToast({
          title: '未检测到网络连接，请检查您的网络设置',
          duration: 1500,
          mask: true,
          image: "/images/icons/exclamationmark.png",
        })
        return false
      }
    }
  })

  console.log(generateUrl(url))
  wx.request({
    url: generateUrl(url),
    header: {
      'content-type': 'application/json'
    },
    success: function (res) {
      if (typeof(success) == "function") {
        // console.log(res)
        success(res)
      }
    },
    fail: function (res) {
      if (typeof (fail) == "function") {
        fail(res)
      }
    },
    complete: function (res) {
      // wx.hideLoading()
      if (typeof (complete) == "function") {
        complete(res)
      }
      wx.hideNavigationBarLoading()
    }
  })
}

module.exports = {
  request: request
}