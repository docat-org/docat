<template>
  <div>
    <Layout>
      <Help class="spacing" />
    </Layout>
    <UploadButton class="upload-button" />
  </div>
</template>

<script>
import Layout from '@/components/Layout.vue'
import Help from '@/components/Help.vue'
import UploadButton from '@/components/UploadButton.vue'

export default {
  name: 'help-page',
  components: {
    Layout,
    Help,
    UploadButton
  }
}
</script>