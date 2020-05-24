import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入字体图标
import './assets/font_90sq9zqq43/iconfont.css'
// 导入全局样式
import './assets/css/global.css'
// 导入table-tree插件
import TreeTable from 'vue-table-with-tree-grid'

import axios from 'axios'
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 按照接口文档中,除了请求login以外的都需要做请求拦截的处理
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
// 挂在到全局作用域中通过$http就可一调用axios
Vue.prototype.$http = axios

// 注册为全局组件
Vue.component('tree-table', TreeTable)

// 创建过滤时间的全局过滤器
Vue.filter('dateFormat', function (originVal) {
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')
  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
