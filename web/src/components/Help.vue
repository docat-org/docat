<template>
  <vue-markdown>
    {{ help }}
  </vue-markdown>
</template>

<script>
import VueMarkdown from 'vue-markdown'

import README from '@/assets/README.md'

export default {
  name: 'help',
  components: {
    VueMarkdown
  },
  data() {
    return {
      help: README,
    }
  }
}
</script>