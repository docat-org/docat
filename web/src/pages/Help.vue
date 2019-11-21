<template>
   <Layout>
    <Help />
  </Layout>
</template>

<script>
import Layout from '@/components/Layout.vue'
import Help from '@/components/Help.vue'

export default {
  name: 'help-page',
  components: {
    Layout,
    Help
  }
}
</script>