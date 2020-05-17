import Vue from 'vue'
import { Button, Form, FormItem, Input, Message } from 'element-ui'

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
//Message比较特别挂载到Vue原型对象上,所有组件才能使用
Vue.prototype.$message = Message
