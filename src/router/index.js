import Vue from 'vue'
import Router from 'vue-router'
import tradingview from '@/components/tradingview'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'tradingview',
      component: tradingview
    }
  ]
})
