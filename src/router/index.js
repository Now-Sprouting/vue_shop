import Vue from 'vue'
import VueRouter from 'vue-router'


const Login = () => import(/* webpackChunkName: "Login_Home_Welocome" */ '../views/Login.vue')
const Home = () => import(/* webpackChunkName: "Login_Home_Welocome" */ '../views/Home.vue')
const Welocome = () => import(/* webpackChunkName: "Login_Home_Welocome" */ '../views/Welcome.vue')
// import Login from '../views/Login.vue'
// import Home from '../views/Home.vue'
// import Welocome from '../views/Welcome.vue'



const Users = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../views/user/Users.vue')
const Rights = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../views/power/Rights.vue')
const Roles = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../views/power/Roles.vue')
// import Users from '../views/user/Users.vue'
// import Rights from '../views/power/Rights.vue'
// import Roles from '../views/power/Roles.vue'

const Cate = () => import(/* webpackChunkName: "Cate_Params" */ '../views/goods/Cate.vue')
const Params = () => import(/* webpackChunkName: "Cate_Params" */ '../views/goods/Params.vue')
// import Cate from '../views/goods/Cate.vue'
// import Params from '../views/goods/Params.vue'

const List = () => import(/* webpackChunkName: "List_Add" */ '../views/goods/List.vue')
const Add = () => import(/* webpackChunkName: "List_Add" */ '../views/goods/Add.vue')
// import List from '../views/goods/List.vue'
// import Add from '../views/goods/Add.vue'


const Order = () => import(/* webpackChunkName: "Order_Reports" */ '../views/order/Order.vue')
const Reports = () => import(/* webpackChunkName: "Order_Reports" */ '../views/reports/Reports.vue')
// import Order from '../views/order/Order.vue'
// import Reports from '../views/reports/Reports.vue'


Vue.use(VueRouter)

const routes = [
  { path: '/', component: Login },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welocome },
      { path: '/users', component: Users },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/categories', component: Cate },
      { path: '/params', component: Params },
      { path: '/goods', component: List },
      { path: '/goods/add', component: Add },
      { path: '/orders', component: Order },
      { path: '/reports', component: Reports }
    ]
  }
]

const router = new VueRouter({
  routes
})
// 路由导航首位(路由对象下面的beforEach方法)
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from 代表从哪个路径跳转而来
  // next 是一个函数，表示放行
  //     next()  放行    next('/login')  强制跳转

  if (to.path === '/login') return next() /* 访问登录页直接放行 */
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})
export default router
