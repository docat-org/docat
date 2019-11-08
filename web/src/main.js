import Vue from 'vue'
import App from '@/App.vue'

// configure vue material (https://vuematerial.io/getting-started/)
import { MdCard, MdAvatar } from 'vue-material/dist/components'
import 'vue-material/dist/vue-material.min.css'
import 'vue-material/dist/theme/default.css'

Vue.use(MdCard)
Vue.use(MdAvatar)

// configure vue router (https://router.vuejs.org/installation.html)
import VueRouter from 'vue-router'

Vue.use(VueRouter)

// configure the app's routing
import Home from '@/pages/Home.vue'
import Project from '@/pages/Project.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/:project', component: Project }
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
