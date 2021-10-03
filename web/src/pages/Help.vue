<template>
  <div>
    <Layout>
      <Help class="spacing" />
    </Layout>
    <UploadButton class="upload-button" />
    <DeleteButton class="delete-button" />
  </div>
</template>

<script>
import Layout from '@/components/Layout.vue'
import Help from '@/components/Help.vue'
import UploadButton from '@/components/UploadButton.vue'
import DeleteButton from '@/components/DeleteButton.vue'

export default {
  name: 'help-page',
  components: {
    Layout,
    Help,
    UploadButton,
    DeleteButton
  },
  async created() {
    document.title = "Help | docat"
  }
}
</script>
