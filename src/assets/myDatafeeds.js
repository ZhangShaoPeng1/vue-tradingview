/* 
******原生socket
*/

import wsBus from './wsBus'
const supportedResolutions = ['1', '5', '15', '30', '60', 'D'];
export default class {
  constructor (symbol) {
    // this.symbol = symbol
    this.lastBar = null;
  }
  //
  async onReady (callback) {
    let config = await Promise.resolve({
      supports_search: false,
      supports_group_request: false,
      supported_resolutions: supportedResolutions,
      supports_marks: false,
    });
    callback(config);
  }
  unsubscribeBars (subscriberUID) {
    //console.log('unsubscribeBars =====>\n', ...arguments)
  }
  async resolveSymbol (symbolName, onSymbolResolvedCallback, onResolveErrorCallback) {
    let res = await Promise.resolve({
      name: symbolName,
      ticker: symbolName,
      type: 'bitcoin',
      "timezone": 'Asia/Hong_Kong',
      "minmov": 1, // 最小波动
      "pricescale": 1000000, // 价格刻度
      // "minmov2": 0.0001,
      // "pointvalue": 0.00000001,
      "session": "24x7",
      "has_intraday": true,
      // "has_no_volume":false,
      // "description":"Apple Inc.",
      "supported_resolutions": supportedResolutions,
      // "intraday_multipliers": ['5', '15', '30', '60'],
      'has_empty_bars': true
    });
    onSymbolResolvedCallback(res);
  }
  async getBars (symbolInfo, resolution, from, to, onHistoryCallback, onErrorCallback, firstDataRequest) {
    let res = await wsBus.reqKlinHistory(symbolInfo.name, resolution, from, to)
    // if (!res.getKlines) return onHistoryCallback([], {noData: true})
    let bars = [];
    let meta = {
      noData: false,
    }
    if (res.status === 'no_data' || !res.getKlines.length) {
      meta.noData = true;
      meta.nextTime = res.nextTime; // 如果没有数据，应该有nextTime
    } else {
      bars = res.getKlines.map(obj => ({
        time: obj.time * 1000,
        open: obj.open,
        close: obj.close,
        high: obj.high,
        low: obj.low,
        volume: obj.vol
      }));
      console.log(bars)
    }
    onHistoryCallback(bars, meta)
  }
  subscribeBars (symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback) {
    wsBus.$on('subscribeBar', klines => {
      let {time, open, close, low, high, vol} = klines.getKlines[0]
      onRealtimeCallback({
        time: time * 1000,
        open,
        close,
        low,
        high,
        volume: vol
      });
    });
  }
}
