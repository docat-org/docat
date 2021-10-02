<template>
   <Layout>
    <form novalidate class="claim-form">
      <h1 class="claim-title">Claim Token</h1>

      <md-field>
        <label>Projectname</label>
        <md-select type="text" id="project" name="project" v-model="form.project" :disabled="sending" >
          <md-option
            v-for="project of projects"
            v-bind:key="project"
            :value="project"
          >
            {{ project }}
          </md-option>
        </md-select>
      </md-field>

      <md-field v-if="form.token">
        <label>Token</label>
        <md-input id="token" name="token" v-model="form.token" readonly />
      </md-field>

      <md-progress-bar md-mode="indeterminate" class="md-accent" v-if="sending" />
      <md-button class="md-button md-raised md-primary" :disabled="sending" @click="claim">Claim</md-button>

      <md-snackbar md-position="left" :md-duration="4000" :md-active.sync="showError" md-persistent>
        <span>{{ error }}</span>
        <md-button class="md-primary" @click="showError = false">Close</md-button>
      </md-snackbar>
    </form>
  </Layout>
</template>

<script>
import { validationMixin } from 'vuelidate'
import { required } from 'vuelidate/lib/validators'

import Layout from '@/components/Layout.vue'
import ProjectRepository from '@/repositories/ProjectRepository'

export default {
  name: 'Claim',
  mixins: [validationMixin],
  components: {
    Layout,
  },
  data() {
    return {
      form: {
        token: '',
        project: ''
      },
      projects: [],
      sending: false,
      error: '',
    }
  },
  async created() {
    document.title = "Claim Token | docat"
    this.projects = (await ProjectRepository.get()).map((project) => project.name)
  },
  validations: {
    form: {
      project: { required }
    }
  },
  methods: {
    async claim() {
      this.sending = true

      try {
        const msg = await ProjectRepository.claim(this.form.project)
        this.form.token = msg.token
      } catch(err) {
        // something went wrong while
        this.showError = true
        this.error = err
      }

      this.sending = false
    }
  }
}
</script>

<style scoped>
.claim-title {
  margin-bottom: 16px;
}

.claim-form {
  margin-top: 48px;
  padding-right: 16px;
  padding-left: 16px;
}
</style>

