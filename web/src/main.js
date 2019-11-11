import Vue from 'vue'
import App from '@/App.vue'

// configure vue material (https://vuematerial.io/getting-started/)
import {
  MdCard,
  MdAvatar,
  MdApp,
  MdToolbar,
  MdContent,
  MdList,
  MdField,
  MdMenu
} from 'vue-material/dist/components'
import 'vue-material/dist/vue-material.min.css'
import 'vue-material/dist/theme/default.css'

Vue.use(MdApp)
Vue.use(MdContent)
Vue.use(MdField)
Vue.use(MdMenu)
Vue.use(MdList)
Vue.use(MdToolbar)
Vue.use(MdCard)
Vue.use(MdAvatar)

// configure vue router (https://router.vuejs.org/installation.html)
import VueRouter from 'vue-router'

Vue.use(VueRouter)

// configure the app's routing
import Home from '@/pages/Home.vue'
import Project from '@/pages/Project.vue'
import Docs from '@/pages/Docs.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/:project', component: Project },
  { path: '/:project/:version/:location?', component: Docs }
]

const router = new VueRouter({
  routes
})

// configure vue
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app-container')
