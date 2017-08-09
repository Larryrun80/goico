let requests = require("./requests.js")
let settings = require("../secret/settings.js")

function shareComplete(res) {
  console.log("----on Share Success wxg----\n", res)
  wx.getShareInfo({
    shareTicket: res.shareTickets[0],
    complete(res) {
      console.log("---- share info wxg----\n", res)
    }
  })
}

// 一个currency是否被选中
// 返回一个bool值， true代表在自选中
function isSelected(cid, symbol) {
  let useIDs = true
  let selected = wx.getStorageSync('selectedCurrencies')
  if (!selected) {
    selected = wx.getStorageSync('selectedSymbols')
    useIDs = false
  }

  if (useIDs) {
    let selectedIDs = []
    for (let i in selected) {
      selectedIDs.push(selected[i].currenc_id)
    }

    if (selectedIDs && selectedIDs.includes(cid)) {
      return true
    }
  }
  else { // 如果是老版本
    let selectedSymbols = []
    let selectedIDs = []
    
    for (let i in selected) {
      if (selected[i].currency_id) {
        selectedIDs.push(selected[i].currency_id)
      }

      selectedSymbols.push(selected[i].symbol)
    }


    if (selectedIDs && selectedIDs.includes(cid)) {
      return true
    }

    if (selectedSymbols && selectedSymbols.includes(symbol)) {
      return true
    }
  }
  return false
}

// 返回一个array， array[0] 是自选货币列表， array[1]是是否是带id版本
function loadSelectedData () {
  let useIDs = true
  let currencies = []
  let selected = wx.getStorageSync('selectedCurrencies')
  if (!selected) {
    useIDs = false,
    selected = wx.getStorageSync('selectedSymbols')
  }


  for (let i in selected) {
    if (selected[i].currency) {
      currencies.push({
        seq: i,
        currency_id: selected[i].currency_id ? selected[i].currency_id : 0,
        currency: selected[i].currency,
        name: selected[i].name,
        symbol: selected[i].symbol,
        symbolSelected: true,
      })
    }
  }

  console.log('selected_currencies: ', currencies)
  return [currencies, useIDs]
}

// 获取自选currency的远程url
function getRemoteUrl () {
  let [selectedData, useIDs] = loadSelectedData()

  let url = settings.requestMarketListUrl
  if (selectedData.length > 0) {
    // 生成请求查询串
    if (useIDs) {
      let ids = []
      for (let i in selectedData) {
        if (selectedData[i]['currency_id']) {
          ids.push(selectedData[i]['currency_id'])
        }
      }

      if (ids) {
        url = url + '?currency_id=' + ids.join()
      }
    } else {
      let params = []
      for (let i in selectedData) {
        params.push(selectedData[i]['name'] + '--' + selectedData[i]['symbol'])
      }

      if (params.join()) {
        url = url + '?selected=' + params.join()
      }
    }
  }

  url = encodeURI(url)
  return url
}

// addSelect boolean, true 代表添加， false代表取消
function selectCurrency(cid, name, symbol, addSelect, pos=null) {
  console.log(pos)
  let [selected, useIDs] = loadSelectedData()
  // console.log('[selectedCurrency] -selectCurrency- selected: ', selected)
  if (!addSelect) { // 如果是取消
    for (let i in selected) {
      if (cid && selected[i].currency_id && parseInt(cid) === parseInt(selected[i].currency_id)) {
        selected.splice(i, 1)
        break
      }

      if (selected[i].name == name && selected[i].symbol == symbol) {
        selected.splice(i, 1)
        break
      }
    }
  } else { // 如果是添加
    let exists = false
    for (let i in selected) {
      if (cid && selected[i].currency_id && parseInt(cid) === parseInt(selected[i].currency_id)) {
        exists = true
        break
      }
      if (selected[i].name == name && selected[i].symbol == symbol) {
        exists = true
        break
      }
    }

    if (exists) {
      wx.showToast({
        title: '您已经添加过' + name + ' (' + symbol + '), 请刷新重试',
        duration: 1500,
      })
      return
    }
    else {
      if (pos == null) {
        selected.push({
          currency_id: cid,
          currency: name + ' (' + symbol + ')',
          name: name,
          symbol: symbol,
        })
      }
      else {
        selected.splice(pos, 0, {
          currency_id: cid,
          currency: name + ' (' + symbol + ')',
          name: name,
          symbol: symbol,
        })
      }
    }
  }

  if (useIDs) {
    wx.setStorageSync('selectedCurrencies', selected)
  } else {
    wx.setStorageSync('selectedSymbols', selected)
  }

  // console.log('[selectedCurrency] -selectCurrency- selectedCurrencies: ', wx.getStorageSync('selectedCurrencies'))
  // console.log('[selectedCurrency] -selectCurrency- selectedSymbols: ', wx.getStorageSync('selectedSymbols'))
}


module.exports = {
  isSelected: isSelected,
  loadSelectedData: loadSelectedData,
  getRemoteUrl: getRemoteUrl,
  selectCurrency: selectCurrency,
}