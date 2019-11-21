<template>
  <vue-markdown>
    {{ help }}
  </vue-markdown>
</template>

<script>
import VueMarkdown from 'vue-markdown'

import help from '@/assets/getting-started.md'

export default {
  name: 'help',
  components: {
    VueMarkdown
  },
  data() {
    return {
      help,
    }
  }
}
</script>
