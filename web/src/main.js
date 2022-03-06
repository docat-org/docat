import Vue from 'vue'
import App from '@/App.vue'

// configure vue material (https://vuematerial.io/getting-started/)
import {
  MdCard,
  MdButton,
  MdAvatar,
  MdApp,
  MdToolbar,
  MdContent,
  MdList,
  MdField,
  MdMenu,
  MdProgress,
  MdSnackbar,
  MdIcon,
  MdTooltip
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
Vue.use(MdProgress)
Vue.use(MdSnackbar)
Vue.use(MdButton)
Vue.use(MdIcon)
Vue.use(MdTooltip)

// configure to use vue-markdown (https://github.com/miaolz123/vue-markdown)
import VueMarkdown from 'vue-markdown'

Vue.use(VueMarkdown);

// configure vue router (https://router.vuejs.org/installation.html)
import VueRouter from 'vue-router'

Vue.use(VueRouter)

// configure the app's routing
import Home from '@/pages/Home.vue'
import Docs from '@/pages/Docs.vue'
import Help from '@/pages/Help.vue'
import Upload from '@/pages/Upload.vue'
import Claim from '@/pages/Claim.vue'
import Delete from '@/pages/Delete.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/help', component: Help },
  { path: '/upload', component: Upload },
  { path: '/claim', component: Claim },
  { path: '/delete', component: Delete },
  { path: '/:project/:version?/:location(.*)?', component: Docs }
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
