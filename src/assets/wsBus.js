/* 
******原生socket
*/

import Vue from 'vue'
// import store from '@/store/store.js'
import {promiseBreaker} from "./tools";
const WS_URL = 'wss://ws.biheok.com/' // socket URL
let wsBus = window.wsBus = new Vue({
  // store,
  data: {
    ws: null,
    WS_URL: '',
    connectReady: promiseBreaker(), // 将是可外部决议的promise
    from: 0,
    period: ''
  },
  computed: {
    klineSymbol () {
      return "BTC_USDT"; // 绑定值
    }
  },
  watch: {
    klineSymbol (newSymbol, oldSymbol) {
      if (this.ws.readyState == 1) {
        this.ws.send("Kline " + JSON.stringify({
            method: "initKline",
            param: this.period,
            market: newSymbol,
            startTime: this.from * 1000,
            endTime: new Date() * 1
          }));
        this.ws.send("Kline " + JSON.stringify({method: "getKline", param: this.period, market: newSymbol}))
      }else{
        this.init();
      }
    }
  },
  methods: {
    init () {
      let ws = this.ws = new WebSocket(WS_URL);
      ws.onopen = () => {
        this.connectReady.resolve()
      }
      ws.onmessage = (ev) => {
        let msg = JSON.parse(ev.data)
        // 保存获取到的K线分辨率
        localStorage.setItem('klineTime',msg.param)
        if (msg.method && msg.method === "getKline") {
          this.$emit('subscribeBar', msg)
        } else if (msg.method && msg.method === "initKline") {
          this.$emit('klineHistoryData', msg)
        } else {
          console.log(msg)
        }
      }
      ws.onclose = () => {
        this.connectReady = promiseBreaker();
      }
      ws.onerror = err => {
        this.init();
      }
    },
    async reqKlinHistory (symbol, resolution, from, to) { // 请求k线历史数据
      await this.connectReady
      this.from = from;
      if (resolution > 0 && resolution < 60) {
        this.period = "MIN" + resolution
      }
      else if (resolution == 60) {
        this.period = "H1";
      } else if (resolution == "D") {
        this.period = "D1";
      }
      let res = await new Promise((resolve, reject) => {
        this.$once('klineHistoryData', (msg) => {
          resolve(msg)
        });
        this.ws.send("Kline " + JSON.stringify({
            method: "initKline",
            param: this.period,
            market: this.klineSymbol,
            startTime: from * 1000,
            endTime: to * 1000
          }))
        this.ws.send("Kline " + JSON.stringify({method: "getKline", param: this.period, market: this.klineSymbol}))
      });
      return res;
    }
  },
  created () {
    this.init();
  }
})
export default wsBus;
